import React from "react";
import Link from "next/link";
import {
  Palette,
  Code,
  Video,
  Camera,
  GraduationCap,
  Sparkles,
  PenTool,
  Calendar,
  Share2,
  LucideIcon,
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
  icon?: string | null;
}

const iconMap: Record<string, LucideIcon> = {
  "graphic-design": Palette,
  "programming-development": Code,
  "video-editing": Video,
  "photography": Camera,
  "tutoring": GraduationCap,
  "content-creation": Sparkles,
  "writing-translation": PenTool,
  "event-support": Calendar,
  "marketing-social-media": Share2,
};

export function CategoryCard({
  name,
  slug,
  description,
  count = 0,
}: CategoryCardProps) {
  const Icon = iconMap[slug] || Sparkles;

  return (
    <Link
      href={`/categories/${slug}`}
      className="group relative flex flex-col items-start p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-lg transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
        {name}
      </h3>

      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
        {description || `Discover top student providers in ${name}.`}
      </p>

      <span className="mt-3 text-[11px] font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
        {count} {count === 1 ? "service" : "services"} &rarr;
      </span>
    </Link>
  );
}

