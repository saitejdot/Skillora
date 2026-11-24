import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { orderRequestSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role"); // "student" | "buyer"
    const statusParam = searchParams.get("status");

    // Determine query perspective based on roleParam or user.activeMode
    const asStudent = roleParam === "student" || (!roleParam && user.activeMode === "STUDENT");

    const where: any = asStudent
      ? { studentId: user.id }
      : { buyerId: user.id };

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: { take: 1, orderBy: { isPrimary: "desc" } },
            category: { select: { name: true } },
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
            profile: { select: { college: true } },
          },
        },
        requirements: true,
        deliveries: { orderBy: { createdAt: "desc" } },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = orderRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { serviceId, requirements, attachmentUrls, deadline } = result.data;

    // Fetch service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { student: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.studentId === user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own service." },
        { status: 400 }
      );
    }

    // Generate readable orderNumber
    const orderNumber = `SKL-${Date.now().toString().slice(-6)}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Create Order, Requirements, and Notification in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          serviceId: service.id,
          buyerId: user.id,
          studentId: service.studentId,
          price: service.price,
          status: "PENDING",
        },
      });

      await tx.orderRequirement.create({
        data: {
          orderId: newOrder.id,
          description: requirements,
          attachmentUrls: attachmentUrls || [],
          deadline: deadline ? new Date(deadline) : null,
        },
      });

      // Notify the student
      await tx.notification.create({
        data: {
          userId: service.studentId,
          title: "New Service Request",
          message: `${user.name} submitted a new request for "${service.title}".`,
          type: "ORDER_REQUEST",
          link: `/dashboard/orders`,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      { message: "Service request submitted successfully", order },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order request" },
      { status: 500 }
    );
  }
}
