"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Share2,
  Heart,
  ArrowRight,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { OrderRequestModal } from "@/components/forms/order-request-modal";
import { ServiceCard } from "@/components/marketplace/service-card";
import { useSession } from "next-auth/react";

interface ServiceDetailsViewProps {
  service: any;
  relatedServices: any[];
}

export function ServiceDetailsView({
  service,
  relatedServices,
}: ServiceDetailsViewProps) {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(
    service.images[0]?.url ||
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isOwner = session?.user?.id === service.studentId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-emerald-600">Explore</Link>
        <span>/</span>
        <Link
          href={`/categories/${service.category.slug}`}
          className="hover:text-emerald-600 font-medium"
        >
          {service.category.name}
        </Link>
      </nav>

      {/* Main Grid: Left Details & Right Sticky Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {service.title}
          </h1>

          {/* Student Profile Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link
              href={`/students/${service.student.id}`}
              className="flex items-center gap-3 group"
            >
              <Avatar
                src={service.student.avatar}
                fallback={service.student.name}
                size="md"
                className="ring-2 ring-emerald-500/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {service.student.name}
                  </span>
                  {service.student.isVerifiedStudent && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>
                {service.student.profile?.college && (
                  <p className="text-xs text-slate-500">
                    {service.student.profile.college}
                    {service.student.profile.degree && ` • ${service.student.profile.degree}`}
                  </p>
                )}
              </div>
            </Link>

            {/* Rating summary */}
            <div className="flex items-center gap-1 text-xs text-slate-700">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900 text-sm">
                {service.averageRating > 0 ? service.averageRating.toFixed(1) : "New"}
              </span>
              <span className="text-slate-400">
                ({service.totalReviews} {service.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <img
                src={selectedImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>

            {service.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {service.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img.url
                        ? "border-emerald-600 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900">
              About This Service
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              {service.description}
            </div>
          </div>

          {/* Tags */}
          {service.tags?.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Relevant Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Student Bio & Skills Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Meet the Student Creator
            </h3>
            <div className="flex items-start gap-4">
              <Avatar
                src={service.student.avatar}
                fallback={service.student.name}
                size="lg"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {service.student.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {service.student.profile?.college || "University Student"}
                    </p>
                  </div>
                  <Link
                    href={`/students/${service.student.id}`}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    View Full Profile &rarr;
                  </Link>
                </div>
                {service.student.profile?.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.student.profile.bio}
                  </p>
                )}
              </div>
            </div>

            {service.student.userSkills?.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                {service.student.userSkills.map((us: any) => (
                  <span
                    key={us.id}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium"
                  >
                    {us.skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Customer Reviews
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(service.averageRating)
                            ? "fill-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {service.averageRating > 0 ? service.averageRating.toFixed(1) : "No reviews yet"}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({service.totalReviews} total)
                  </span>
                </div>
              </div>
            </div>

            {service.reviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                No reviews left yet for this service. Be the first customer!
              </div>
            ) : (
              <div className="space-y-4">
                {service.reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={rev.buyer.avatar}
                          fallback={rev.buyer.name}
                          size="sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {rev.buyer.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Card (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fixed Price
              </span>
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(service.price)}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{service.deliveryDays} Days Estimated Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct student-to-client updates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Work delivered before order completion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified campus student provider</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {isOwner ? (
                <Link
                  href={`/dashboard/services/${service.id}/edit`}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md text-center block"
                >
                  Edit This Service
                </Link>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>Request Service ({formatPrice(service.price)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? "Link Copied to Clipboard!" : "Share Listing"}</span>
              </button>
            </div>

            {/* Satisfaction Promise */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-800 block">
                Campus Trust & Transparency
              </span>
              <p className="text-[11px] text-emerald-700">
                You review and approve the submitted work before confirming the project as complete.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Services */}
      {relatedServices?.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
            More Services in {service.category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedServices.map((rel: any) => (
              <ServiceCard
                key={rel.id}
                id={rel.id}
                title={rel.title}
                slug={rel.slug}
                price={rel.price}
                deliveryDays={rel.deliveryDays}
                averageRating={rel.averageRating}
                totalReviews={rel.totalReviews}
                category={rel.category}
                student={rel.student}
                images={rel.images}
              />
            ))}
          </div>
        </div>
      )}

      {/* Order Request Modal */}
      <OrderRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={{
          id: service.id,
          title: service.title,
          price: service.price,
          deliveryDays: service.deliveryDays,
          student: service.student,
        }}
      />
    </div>
  );
}

