"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShieldAlert,
  Users,
  Briefcase,
  Layers,
  ShieldCheck,
  LayoutDashboard,
  Loader2,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-500">
          This portal requires Skillora administrative privileges. Please log in with an administrator account (e.g. admin@skillora.edu).
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const adminNav = [
    { label: "Platform Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Student Verifications", href: "/admin/verifications", icon: ShieldCheck },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Service Listings", href: "/admin/services", icon: Briefcase },
    { label: "Category Taxonomy", href: "/admin/categories", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
        <span className="font-bold text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Skillora Admin Console
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded text-white hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 p-5 shrink-0 min-h-[calc(100vh-4rem)] space-y-6`}
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white tracking-tight">
              Admin Portal
            </h2>
            <p className="text-[10px] text-emerald-400 font-medium">
              Platform Moderation
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Admin Main Body */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

