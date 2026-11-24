"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  ShoppingBag,
  Briefcase,
  Package,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading platform analytics...</span>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Marketplace Metrics & Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-level statistics and monitoring across Skillora users, services, and orders.
        </p>
      </div>

      {/* Pending Verifications Alert */}
      {s.pendingVerifications > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <div className="text-xs">
              <span className="font-bold text-amber-900">
                {s.pendingVerifications} Student Verification Requests Awaiting Review
              </span>
              <p className="text-amber-700">
                Review college ID card submissions to approve verified student status.
              </p>
            </div>
          </div>
          <Link
            href="/admin/verifications"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Review Queue
          </Link>
        </div>
      )}

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase">Users</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{s.totalUsers || 0}</p>
          <span className="text-[11px] text-slate-500">Registered Accounts</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase">Students</span>
          </div>
          <p className="text-3xl font-black text-blue-600">{s.totalStudents || 0}</p>
          <span className="text-[11px] text-slate-500">Service Providers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase">Services</span>
          </div>
          <p className="text-3xl font-black text-indigo-600">{s.totalServices || 0}</p>
          <span className="text-[11px] text-slate-500">Published Listings</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Package className="w-4 h-4 text-teal-600" />
            <span className="text-[10px] font-bold uppercase">Orders</span>
          </div>
          <p className="text-3xl font-black text-teal-600">{s.totalOrders || 0}</p>
          <span className="text-[11px] text-slate-500">
            {s.completedOrders || 0} Completed
          </span>
        </div>
      </div>

      {/* Platform Volume Highlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
            Completed Platform Volume (GMV)
          </span>
          <p className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
            {formatPrice(s.totalVolume || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Total completed order value generated by student providers.
          </p>
        </div>
        <TrendingUp className="w-12 h-12 text-emerald-500/40 hidden sm:block" />
      </div>

      {/* Recent Orders Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Platform Transactions
        </h2>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
            No orders processed yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Buyer</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      #{ord.orderNumber}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {ord.buyer.name}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {ord.student.name}
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900">
                      {formatPrice(ord.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

