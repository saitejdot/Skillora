import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favourites = await prisma.favourite.findMany({
      where: { userId: user.id },
      include: {
        service: {
          include: {
            category: true,
            images: { orderBy: { isPrimary: "desc" } },
            student: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isVerifiedStudent: true,
                profile: { select: { college: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const services = favourites.map((f) => ({
      ...f.service,
      isFavorited: true,
    }));

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error("Favourites fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch saved services" },
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

    const { serviceId } = await req.json();
    if (!serviceId) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const existing = await prisma.favourite.findUnique({
      where: {
        userId_serviceId: {
          userId: user.id,
          serviceId,
        },
      },
    });

    if (existing) {
      await prisma.favourite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorited: false, message: "Removed from saved services" });
    } else {
      await prisma.favourite.create({
        data: {
          userId: user.id,
          serviceId,
        },
      });
      return NextResponse.json({ isFavorited: true, message: "Saved to your favorites!" });
    }
  } catch (error: any) {
    console.error("Toggle favourite error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle favourite" },
      { status: 500 }
    );
  }
}

