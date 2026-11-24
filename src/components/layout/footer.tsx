import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base">
                S
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Skillora<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your skills. Your opportunities. Your marketplace. Connecting talented college students with affordable, high-quality freelance work.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100">
              <GraduationCap className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Campus Verified Freelancers</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/categories/graphic-design" className="hover:text-emerald-600 transition-colors">
                  Graphic Design
                </Link>
              </li>
              <li>
                <Link href="/categories/programming-development" className="hover:text-emerald-600 transition-colors">
                  Programming & Tech
                </Link>
              </li>
              <li>
                <Link href="/categories/video-editing" className="hover:text-emerald-600 transition-colors">
                  Video Editing & Animation
                </Link>
              </li>
              <li>
                <Link href="/categories/photography" className="hover:text-emerald-600 transition-colors">
                  Photography
                </Link>
              </li>
              <li>
                <Link href="/categories/tutoring" className="hover:text-emerald-600 transition-colors">
                  Tutoring & Homework Help
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students & Clients */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-emerald-600 transition-colors">
                  Explore Services
                </Link>
              </li>
              <li>
                <Link href="/register?role=STUDENT" className="hover:text-emerald-600 transition-colors">
                  Become a Student Provider
                </Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className="hover:text-emerald-600 transition-colors">
                  Order Management
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 transition-colors">
                  Sign In to Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust and Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              College Verification
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Students can submit their college ID for manual administrative verification to earn the verified campus badge and build trust.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin-Verified Student Badges</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Skillora Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for college creators & small businesses everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}

