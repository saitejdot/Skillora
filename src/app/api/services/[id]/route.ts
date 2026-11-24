import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { isPrimary: "desc" },
        },
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerifiedStudent: true,
            verificationStatus: true,
            createdAt: true,
            profile: true,
            _count: {
              select: {
                services: true,
                reviewsReceived: true,
              },
            },
          },
        },
        reviews: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error("Service fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (existing.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not your service" }, { status: 403 });
    }

    const body = await req.json();
    const result = serviceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { title, description, categoryId, price, deliveryDays, tags, imageUrls } = result.data;

    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.service.update({
        where: { id },
        data: {
          title,
          description,
          categoryId,
          price,
          deliveryDays,
          tags: tags.map((t) => t.toLowerCase().trim()),
        },
      });

      if (imageUrls && imageUrls.length > 0) {
        await tx.serviceImage.deleteMany({
          where: { serviceId: id },
        });

        await tx.serviceImage.createMany({
          data: imageUrls.map((url, index) => ({
            serviceId: id,
            url,
            isPrimary: index === 0,
          })),
        });
      }

      return s;
    });

    return NextResponse.json({ service: updated });
  } catch (error: any) {
    console.error("Service update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (existing.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not your service" }, { status: 403 });
    }

    // Set to PAUSED or delete if no orders
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("Service deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}

