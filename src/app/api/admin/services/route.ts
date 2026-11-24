import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { student: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        student: {
          select: { id: true, name: true, email: true, isVerifiedStudent: true },
        },
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error("Admin services error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { serviceId, status } = await req.json(); // "ACTIVE" | "PAUSED"

    if (!serviceId || !status) {
      return NextResponse.json({ error: "Service ID and status required" }, { status: 400 });
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: { status },
    });

    return NextResponse.json({
      message: `Service status updated to ${status}`,
      service: updated,
    });
  } catch (error: any) {
    console.error("Admin service update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

