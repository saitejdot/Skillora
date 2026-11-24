import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/marketplace/service-card";
import { ServiceDetailsView } from "./service-details-view";

export const revalidate = 30;

async function getService(slugOrId: string) {
  try {
    const service = await prisma.service.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
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
            userSkills: {
              include: { skill: true },
            },
            portfolios: {
              take: 3,
            },
          },
        },
        reviews: {
          include: {
            buyer: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) return null;

    // Fetch related services
    const relatedServices = await prisma.service.findMany({
      where: {
        categoryId: service.categoryId,
        id: { not: service.id },
        status: "ACTIVE",
      },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerifiedStudent: true,
            profile: { select: { college: true } },
          },
        },
        images: { orderBy: { isPrimary: "desc" } },
      },
    });

    return { service, relatedServices };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function ServicePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getService(params.slug);

  if (!data || !data.service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Service Not Found</h1>
        <p className="text-xs text-slate-500 mt-2">
          The service listing you are looking for does not exist or has been paused.
        </p>
        <Link
          href="/explore"
          className="inline-block mt-4 text-xs font-semibold text-emerald-600 hover:underline"
        >
          &larr; Browse other student services
        </Link>
      </div>
    );
  }

  return (
    <ServiceDetailsView
      service={data.service}
      relatedServices={data.relatedServices}
    />
  );
}

