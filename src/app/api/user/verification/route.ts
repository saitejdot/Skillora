import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verificationSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = verificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { college, studentIdNumber, idCardUrl } = result.data;

    // Create verification request and update user status to PENDING
    const verification = await prisma.$transaction(async (tx) => {
      const req = await tx.studentVerification.create({
        data: {
          userId: user.id,
          college,
          studentIdNumber,
          idCardUrl,
          status: "PENDING",
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { verificationStatus: "PENDING" },
      });

      return req;
    });

    return NextResponse.json(
      {
        message: "Verification request submitted for admin review.",
        verification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Verification submit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit verification request" },
      { status: 500 }
    );
  }
}

