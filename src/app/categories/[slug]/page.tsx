import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ServiceCard } from "@/components/marketplace/service-card";
import { ArrowLeft, Sparkles, GraduationCap } from "lucide-react";

export const revalidate = 60;

async function getCategoryData(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        services: {
          where: { status: "ACTIVE" },
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
          orderBy: [{ totalReviews: "desc" }, { averageRating: "desc" }],
        },
      },
    });

    return category;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryData(params.slug);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Category Not Found</h1>
        <p className="text-xs text-slate-500 mt-2">The category you requested does not exist.</p>
        <Link
          href="/explore"
          className="inline-block mt-4 text-xs font-semibold text-emerald-600 hover:underline"
        >
          &larr; Back to all services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore All Categories</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Category</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {category.description ||
              `Hire college students specializing in ${category.name}. Affordable, verified, and tailored to your project.`}
          </p>
        </div>
      </div>

      {/* Service Listings */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            {category.services.length} {category.services.length === 1 ? "Service" : "Services"} in {category.name}
          </h2>
          <Link
            href="/dashboard/services/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            + Offer a service in this category
          </Link>
        </div>

        {category.services.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No services published in this category yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Are you a student with skills in {category.name}? Be the first campus creator to offer services here!
            </p>
            <Link
              href="/dashboard/services/new"
              className="inline-block mt-4 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Post a Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {category.services.map((service: any) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                slug={service.slug}
                price={service.price}
                deliveryDays={service.deliveryDays}
                averageRating={service.averageRating}
                totalReviews={service.totalReviews}
                category={service.category}
                student={service.student}
                images={service.images}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

