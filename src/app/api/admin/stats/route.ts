import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [
      totalUsers,
      totalStudents,
      totalCustomers,
      totalServices,
      totalOrders,
      completedOrders,
      pendingVerifications,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.service.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.studentVerification.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { name: true, email: true } },
          student: { select: { name: true, email: true } },
          service: { select: { title: true } },
        },
      }),
    ]);

    // Calculate total order value
    const completedOrdersSum = await prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { price: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalCustomers,
        totalServices,
        totalOrders,
        completedOrders,
        pendingVerifications,
        totalVolume: completedOrdersSum._sum.price || 0,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
