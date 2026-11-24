import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        profile: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
        portfolios: {
          orderBy: { createdAt: "desc" },
        },
        verificationRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude password
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const {
      name,
      bio,
      college,
      degree,
      academicYear,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      skills,
    } = result.data;

    await prisma.$transaction(async (tx) => {
      // Update name
      await tx.user.update({
        where: { id: sessionUser.id },
        data: { name },
      });

      // Upsert profile
      await tx.profile.upsert({
        where: { userId: sessionUser.id },
        create: {
          userId: sessionUser.id,
          bio,
          college,
          degree,
          academicYear,
          githubUrl,
          linkedinUrl,
          websiteUrl,
        },
        update: {
          bio,
          college,
          degree,
          academicYear,
          githubUrl,
          linkedinUrl,
          websiteUrl,
        },
      });

      // Update skills if provided
      if (skills && Array.isArray(skills)) {
        // Delete existing user skills
        await tx.userSkill.deleteMany({
          where: { userId: sessionUser.id },
        });

        // Insert skills
        for (const skillName of skills) {
          const trimmed = skillName.trim();
          if (!trimmed) continue;
          const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");

          const skill = await tx.skill.upsert({
            where: { slug },
            create: { name: trimmed, slug },
            update: {},
          });

          await tx.userSkill.create({
            data: {
              userId: sessionUser.id,
              skillId: skill.id,
            },
          });
        }
      }
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
