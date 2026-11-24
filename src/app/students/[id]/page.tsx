import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/marketplace/service-card";
import {
  ShieldCheck,
  Star,
  GraduationCap,
  Calendar,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Package,
  Award,
} from "lucide-react";

export const revalidate = 30;

async function getStudentProfile(id: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        userSkills: {
          include: { skill: true },
        },
        portfolios: {
          orderBy: { createdAt: "desc" },
        },
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
        reviewsReceived: {
          include: {
            buyer: {
              select: { id: true, name: true, avatar: true },
            },
            service: {
              select: { title: true, slug: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return student;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function StudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const student = await getStudentProfile(params.id);

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Student Not Found</h1>
        <p className="text-xs text-slate-500 mt-2">
          The student profile you requested does not exist.
        </p>
        <Link
          href="/explore"
          className="inline-block mt-4 text-xs font-semibold text-emerald-600 hover:underline"
        >
          &larr; Explore all services
        </Link>
      </div>
    );
  }

  const totalReviews = student.reviewsReceived.length;
  const avgRating =
    totalReviews > 0
      ? student.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 5.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Student Hero */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar
            src={student.avatar}
            fallback={student.name}
            size="xl"
            className="ring-4 ring-emerald-500/10 shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {student.name}
              </h1>

              {student.isVerifiedStudent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Student
                </span>
              )}
            </div>

            {/* University & Degree */}
            {student.profile?.college && (
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{student.profile.college}</span>
                {student.profile.degree && (
                  <span className="text-slate-400 font-normal">
                    • {student.profile.degree}
                  </span>
                )}
                {student.profile.academicYear && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium">
                    {student.profile.academicYear}
                  </span>
                )}
              </p>
            )}

            {/* Metrics row */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">
                  {totalReviews > 0 ? avgRating.toFixed(1) : "New"}
                </span>
                <span className="text-slate-400">({totalReviews} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-slate-400" />
                <span>{student.services.length} Active Services</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since{" "}
                  {new Date(student.createdAt).toLocaleDateString([], {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {student.profile?.githubUrl && (
                <a
                  href={student.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {student.profile?.linkedinUrl && (
                <a
                  href={student.profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {student.profile?.websiteUrl && (
                <a
                  href={student.profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Portfolio Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.profile?.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
            {student.profile.bio}
          </div>
        )}

        {/* Skills Pills */}
        {student.userSkills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {student.userSkills.map((us: any) => (
              <span
                key={us.id}
                className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                {us.skill.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Sections: Services & Portfolio */}
      <div className="space-y-12">
        {/* Published Services */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Services Offered ({student.services.length})
            </h2>
          </div>

          {student.services.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
              This student has not published any active services yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {student.services.map((service: any) => (
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
        </section>

        {/* Portfolio Showcase */}
        {student.portfolios?.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">
              Portfolio & Project Showcase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {student.portfolios.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {item.imageUrl && (
                    <div className="aspect-video w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline pt-1"
                      >
                        <span>View Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Client Reviews */}
        <section className="pt-8 border-t border-slate-200">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">
            Reviews from Clients ({totalReviews})
          </h2>

          {student.reviewsReceived.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
              No client reviews yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.reviewsReceived.map((rev: any) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={rev.buyer.avatar}
                        fallback={rev.buyer.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {rev.buyer.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          On {rev.service.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

