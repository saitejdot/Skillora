"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShieldCheck, Heart, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { useSession } from "next-auth/react";

export interface ServiceCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  deliveryDays?: number;
  averageRating: number;
  totalReviews: number;
  category?: {
    name: string;
    slug: string;
  };
  student: {
    id: string;
    name: string;
    avatar?: string | null;
    isVerifiedStudent: boolean;
    profile?: {
      college?: string | null;
    } | null;
  };
  images: {
    url: string;
    isPrimary?: boolean;
  }[];
  isFavorited?: boolean;
}

export function ServiceCard({
  id,
  title,
  slug,
  price,
  deliveryDays,
  averageRating,
  totalReviews,
  category,
  student,
  images,
  isFavorited: initialFavorited = false,
}: ServiceCardProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const primaryImage =
    images.find((img) => img.isPrimary)?.url ||
    images[0]?.url ||
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80";

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      window.location.href = "/login";
      return;
    }

    setFavLoading(true);
    try {
      const res = await fetch("/api/services/favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Thumbnail */}
      <Link href={`/services/${slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Favorite heart button */}
        <button
          onClick={handleFavorite}
          disabled={favLoading}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 hover:scale-110 transition-all shadow-sm"
          title={isFavorited ? "Remove from saved" : "Save service"}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>

        {category && (
          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white">
            {category.name}
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Student author row */}
        <Link
          href={`/students/${student.id}`}
          className="flex items-center gap-2 mb-2 group/author hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={student.avatar}
            fallback={student.name}
            size="sm"
            className="ring-1 ring-slate-200"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {student.name}
              </span>
              {student.isVerifiedStudent && (
                <span title="Verified College Student" className="inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
              )}
            </div>
            {student.profile?.college && (
              <span className="text-[11px] text-slate-500 truncate">
                {student.profile.college}
              </span>
            )}
          </div>
        </Link>

        {/* Title */}
        <Link
          href={`/services/${slug}`}
          className="text-sm font-medium text-slate-800 line-clamp-2 hover:text-emerald-600 transition-colors flex-1"
        >
          {title}
        </Link>

        {/* Rating and Reviews */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
          <span className="font-bold text-slate-900">
            {averageRating > 0 ? averageRating.toFixed(1) : "New"}
          </span>
          <span className="text-slate-400">
            ({totalReviews})
          </span>
          {deliveryDays && (
            <span className="ml-auto text-[11px] text-slate-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {deliveryDays}d
            </span>
          )}
        </div>

        {/* Price Divider & Starting Price */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
            Starting at
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}
