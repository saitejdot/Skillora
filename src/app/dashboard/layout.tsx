"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Briefcase,
  Star,
  User,
  Settings,
  Heart,
  FileText,
  ShieldCheck,
  Menu,
  X,
  Loader2,
  FolderGit2,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Avatar } from "@/components/ui/avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session?.user) {
    if (typeof window !== "undefined") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    return null;
  }

  const isStudentMode = session.user.activeMode === "STUDENT";

  const studentNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Manage Orders", href: "/dashboard/orders", icon: Package },
    { label: "My Services", href: "/dashboard/services", icon: Briefcase },
    { label: "Create Service", href: "/dashboard/services/new", icon: PlusCircle },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: FolderGit2 },
    { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Profile & Verification", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const customerNavItems = [
    { label: "Overview & Requests", href: "/dashboard/requests", icon: FileText },
    { label: "My Orders", href: "/dashboard/orders", icon: Package },
    { label: "Saved Services", href: "/dashboard/saved", icon: Heart },
    { label: "Profile Settings", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const currentNavItems = isStudentMode ? studentNavItems : customerNavItems;

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            src={session.user.avatar}
            fallback={session.user.name}
            size="sm"
          />
          <div className="text-xs">
            <p className="font-bold text-slate-900">{session.user.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">
              {isStudentMode ? "Student Mode" : "Buyer Mode"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileSidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 space-y-6`}
      >
        {/* User Card & Mode Switcher */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={session.user.avatar}
              fallback={session.user.name}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {session.user.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isStudentMode
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {isStudentMode ? "Student" : "Buyer"}
                </span>
                {session.user.isVerifiedStudent && (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <ModeToggle />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

