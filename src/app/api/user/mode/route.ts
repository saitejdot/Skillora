import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mode } = await req.json();
    if (mode !== "STUDENT" && mode !== "CUSTOMER") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { activeMode: mode },
      select: { id: true, activeMode: true },
    });

    return NextResponse.json({
      message: `Switched to ${mode === "STUDENT" ? "Student (Provider)" : "Customer (Buyer)"} mode`,
      activeMode: updatedUser.activeMode,
    });
  } catch (error: any) {
    console.error("Mode switch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to switch mode" },
      { status: 500 }
    );
  }
}

