import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        service: {
          include: {
            category: true,
            images: true,
          },
        },
        buyer: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerifiedStudent: true,
            profile: { select: { college: true, bio: true } },
          },
        },
        requirements: true,
        deliveries: {
          orderBy: { createdAt: "desc" },
        },
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Strict access check
    if (order.buyerId !== user.id && order.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this order." },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

