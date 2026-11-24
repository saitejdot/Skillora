import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { orderId, rating, comment } = result.data;

    // Check order validity
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        review: true,
        service: true,
        buyer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the buyer of this order can leave a review." },
        { status: 403 }
      );
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Reviews can only be submitted after the order is completed." },
        { status: 400 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { error: "You have already submitted a review for this order." },
        { status: 400 }
      );
    }

    // Execute in transaction
    const newReview = await prisma.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          orderId: order.id,
          buyerId: user.id,
          studentId: order.studentId,
          serviceId: order.serviceId,
          rating,
          comment,
        },
      });

      // Recalculate average rating and count for this service
      const allServiceReviews = await tx.review.findMany({
        where: { serviceId: order.serviceId },
        select: { rating: true },
      });

      const totalReviews = allServiceReviews.length;
      const avg =
        allServiceReviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviews || 1);

      await tx.service.update({
        where: { id: order.serviceId },
        data: {
          averageRating: Math.round(avg * 10) / 10,
          totalReviews,
        },
      });

      // Send notification to student
      await tx.notification.create({
        data: {
          userId: order.studentId,
          title: `New ${rating}-Star Review!`,
          message: `${order.buyer.name} left a review on "${order.service.title}": "${comment.slice(0, 80)}..."`,
          type: "NEW_REVIEW",
          link: `/dashboard/reviews`,
        },
      });

      return rev;
    });

    return NextResponse.json(
      { message: "Review submitted successfully!", review: newReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}

