"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export const DEFAULT_CATEGORIES = [
  { name: "Graphic Design", slug: "graphic-design", icon: Palette },
  { name: "Programming & Tech", slug: "programming-development", icon: Code },
  { name: "Video Editing", slug: "video-editing", icon: Video },
  { name: "Photography", slug: "photography", icon: Camera },
  { name: "Tutoring & Academic", slug: "tutoring", icon: GraduationCap },
  { name: "Content Creation", slug: "content-creation", icon: Sparkles },
  { name: "Writing & Translation", slug: "writing-translation", icon: PenTool },
  { name: "Event Support", slug: "event-support", icon: Calendar },
  { name: "Marketing & Social Media", slug: "marketing-social-media", icon: Share2 },
];

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-6 overflow-x-auto py-2.5 scrollbar-none items-center text-sm font-medium text-slate-600">
          <Link
            href="/explore"
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 py-1 border-b-2 ${
              pathname === "/explore"
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent"
            }`}
          >
            All Services
          </Link>
          {DEFAULT_CATEGORIES.map((cat) => {
            const isActive = pathname === `/categories/${cat.slug}`;
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-emerald-600 py-1 border-b-2 ${
                  isActive
                    ? "border-emerald-600 text-emerald-600 font-semibold"
                    : "border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-70" />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

