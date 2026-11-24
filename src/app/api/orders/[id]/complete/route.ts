import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        buyer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the customer who placed the order can confirm completion." },
        { status: 403 }
      );
    }

    if (order.status !== "DELIVERED" && order.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: `Cannot complete order currently in ${order.status} state.` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });

      await tx.notification.create({
        data: {
          userId: order.studentId,
          title: "Order Completed!",
          message: `${order.buyer.name} confirmed completion of order #${order.orderNumber} for "${order.service.title}".`,
          type: "ORDER_COMPLETED",
          link: `/dashboard/orders`,
        },
      });

      return ord;
    });

    return NextResponse.json({
      message: "Order successfully marked as completed!",
      order: updated,
    });
  } catch (error: any) {
    console.error("Order completion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete order" },
      { status: 500 }
    );
  }
}

