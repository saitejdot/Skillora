import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const sort = searchParams.get("sort") || "popular";
    const studentId = searchParams.get("studentId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      status: "ACTIVE",
    };

    if (studentId) {
      where.studentId = studentId;
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase().trim() } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minRating !== undefined) {
      where.averageRating = {
        gte: minRating,
      };
    }

    let orderBy: any = [{ totalReviews: "desc" }, { averageRating: "desc" }];
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "rating") {
      orderBy = { averageRating: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerifiedStudent: true,
              profile: {
                select: { college: true },
              },
            },
          },
          images: {
            orderBy: { isPrimary: "desc" },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Services query error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch services" },
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
    const result = serviceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      categoryId,
      price,
      deliveryDays,
      tags,
      imageUrls,
    } = result.data;

    // Generate unique slug
    const baseSlug = slugify(title);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;

    const service = await prisma.$transaction(async (tx) => {
      // Ensure user is marked as having role STUDENT or switch activeMode
      await tx.user.update({
        where: { id: user.id },
        data: { role: "STUDENT", activeMode: "STUDENT" },
      });

      const newService = await tx.service.create({
        data: {
          title,
          slug,
          description,
          price,
          deliveryDays,
          tags: tags.map((t) => t.toLowerCase().trim()),
          categoryId,
          studentId: user.id,
          status: "ACTIVE",
        },
      });

      // Insert images
      if (imageUrls && imageUrls.length > 0) {
        await tx.serviceImage.createMany({
          data: imageUrls.map((url, index) => ({
            serviceId: newService.id,
            url,
            isPrimary: index === 0,
          })),
        });
      }

      return newService;
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error("Service creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create service" },
      { status: 500 }
    );
  }
}

