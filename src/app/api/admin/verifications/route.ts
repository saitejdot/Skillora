import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const verifications = await prisma.studentVerification.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ verifications });
  } catch (error: any) {
    console.error("Admin verifications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch verifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { verificationId, action, adminNote } = await req.json(); // action: "APPROVE" | "REJECT"

    const verification = await prisma.studentVerification.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification request not found" }, { status: 404 });
    }

    const isApproved = action === "APPROVE";

    const result = await prisma.$transaction(async (tx) => {
      const ver = await tx.studentVerification.update({
        where: { id: verificationId },
        data: {
          status: isApproved ? "APPROVED" : "REJECTED",
          adminNote: adminNote || (isApproved ? "Approved by Admin" : "Rejected by Admin"),
        },
      });

      await tx.user.update({
        where: { id: verification.userId },
        data: {
          isVerifiedStudent: isApproved,
          verificationStatus: isApproved ? "APPROVED" : "REJECTED",
        },
      });

      await tx.notification.create({
        data: {
          userId: verification.userId,
          title: isApproved ? "Student Verification Approved!" : "Verification Update",
          message: isApproved
            ? "Congratulations! Your college student credentials have been verified. Your profile and services now proudly display the Verified Student badge."
            : `Your verification request was reviewed. Reason: ${adminNote || "Please provide clearer student documentation."}`,
          type: "SYSTEM",
          link: `/dashboard/profile`,
        },
      });

      return ver;
    });

    return NextResponse.json({
      message: `Verification ${isApproved ? "approved" : "rejected"} successfully`,
      verification: result,
    });
  } catch (error: any) {
    console.error("Admin verification action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process verification" },
      { status: 500 }
    );
  }
}

