import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { deliverySchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const result = deliverySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { message, fileUrls } = result.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        student: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.studentId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the assigned student can deliver work." },
        { status: 403 }
      );
    }

    if (order.status !== "IN_PROGRESS" && order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: `Cannot deliver work when order is ${order.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Create delivery record
      const del = await tx.delivery.create({
        data: {
          orderId: order.id,
          message,
          fileUrls,
        },
      });

      // Update order status
      const ord = await tx.order.update({
        where: { id: order.id },
        data: { status: "DELIVERED" },
      });

      // Notify customer
      await tx.notification.create({
        data: {
          userId: order.buyerId,
          title: "Work Delivered!",
          message: `${order.student.name} delivered the completed work for "${order.service.title}". Please review and confirm completion.`,
          type: "WORK_DELIVERED",
          link: `/dashboard/orders`,
        },
      });

      return { delivery: del, order: ord };
    });

    return NextResponse.json({
      message: "Work delivered successfully!",
      delivery: updated.delivery,
      order: updated.order,
    });
  } catch (error: any) {
    console.error("Delivery submit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit delivery" },
      { status: 500 }
    );
  }
}

