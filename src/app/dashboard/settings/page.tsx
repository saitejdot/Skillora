"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Shield, Key, Bell, User } from "lucide-react";
import { ModeToggle } from "@/components/layout/mode-toggle";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account preferences, mode, and security.
        </p>
      </div>

      {/* Account Info */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Name</span>
            <p className="font-bold text-slate-800 text-sm">{session?.user?.name}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Email Address</span>
            <p className="font-bold text-slate-800 text-sm">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Preference */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">
          Active Workspace Mode
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Skillora lets a single registered user act as both a buyer and student seller. Toggle between modes anytime without creating multiple accounts.
        </p>
        <div className="pt-2">
          <ModeToggle />
        </div>
      </div>

      {/* Security Info */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Security & Password
        </h3>
        <p className="text-xs text-slate-500">
          Your password is encrypted using salted bcrypt hashing.
        </p>
      </div>

      {/* Sign Out Card */}
      <div className="p-6 rounded-3xl bg-red-50/50 border border-red-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-red-900">Sign Out of Session</h4>
          <p className="text-[11px] text-red-600">
            Sign out of your active Skillora session on this device.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

