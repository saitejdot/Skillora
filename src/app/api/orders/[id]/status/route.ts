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
    const { action, reason } = await req.json(); // "ACCEPT" | "REJECT" | "CANCEL"

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        buyer: true,
        student: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      if (order.studentId !== user.id) {
        return NextResponse.json({ error: "Only the assigned student can accept requests." }, { status: 403 });
      }
      if (order.status !== "PENDING") {
        return NextResponse.json({ error: "Only pending orders can be accepted." }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: { status: "IN_PROGRESS" },
        });

        await tx.notification.create({
          data: {
            userId: order.buyerId,
            title: "Request Accepted!",
            message: `${order.student.name} accepted your request for "${order.service.title}". Work is now in progress.`,
            type: "ORDER_ACCEPTED",
            link: `/dashboard/orders`,
          },
        });

        return ord;
      });

      return NextResponse.json({ message: "Order accepted and marked In Progress.", order: updated });
    }

    if (action === "REJECT") {
      if (order.studentId !== user.id) {
        return NextResponse.json({ error: "Only the assigned student can reject requests." }, { status: 403 });
      }
      if (order.status !== "PENDING") {
        return NextResponse.json({ error: "Only pending orders can be rejected." }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            status: "REJECTED",
            cancellationReason: reason || "Declined by student provider",
          },
        });

        await tx.notification.create({
          data: {
            userId: order.buyerId,
            title: "Request Declined",
            message: `${order.student.name} was unable to accept your request for "${order.service.title}".`,
            type: "ORDER_REJECTED",
            link: `/dashboard/orders`,
          },
        });

        return ord;
      });

      return NextResponse.json({ message: "Order declined.", order: updated });
    }

    if (action === "CANCEL") {
      // Either buyer (if still pending) or admin
      if (order.buyerId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json({ error: "You cannot cancel this order." }, { status: 403 });
      }
      if (order.status !== "PENDING" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Cannot cancel an order already in progress." }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            status: "CANCELLED",
            cancellationReason: reason || "Cancelled by buyer",
          },
        });

        await tx.notification.create({
          data: {
            userId: order.studentId,
            title: "Order Request Cancelled",
            message: `${order.buyer.name} cancelled their request for "${order.service.title}".`,
            type: "STATUS_CHANGED",
            link: `/dashboard/orders`,
          },
        });

        return ord;
      });

      return NextResponse.json({ message: "Order cancelled.", order: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

