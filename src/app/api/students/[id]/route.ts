import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        isVerifiedStudent: true,
        verificationStatus: true,
        createdAt: true,
        profile: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
        portfolios: {
          orderBy: { createdAt: "desc" },
        },
        services: {
          where: { status: "ACTIVE" },
          include: {
            category: true,
            images: { orderBy: { isPrimary: "desc" } },
          },
          orderBy: { totalReviews: "desc" },
        },
        reviewsReceived: {
          include: {
            buyer: {
              select: { id: true, name: true, avatar: true },
            },
            service: {
              select: { title: true, slug: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Calculate aggregated rating
    const totalReviews = student.reviewsReceived.length;
    const avgRating =
      totalReviews > 0
        ? student.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 5.0;

    return NextResponse.json({
      student: {
        ...student,
        calculatedRating: Math.round(avgRating * 10) / 10,
        totalReviewsCount: totalReviews,
      },
    });
  } catch (error: any) {
    console.error("Student profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}

