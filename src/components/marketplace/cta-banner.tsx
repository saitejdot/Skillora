import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-8 sm:p-12 text-white shadow-xl">
          {/* Subtle circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>For College Students Everywhere</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Turn your college skills into your first freelance income.
            </h2>

            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Join hundreds of student creators earning money doing what they already excel at. Build your professional portfolio before graduation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register?role=STUDENT"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-extrabold text-sm shadow-md hover:bg-emerald-50 transition-colors"
              >
                Become a Provider
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-sm border border-white/20 transition-colors"
              >
                Browse Gigs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

