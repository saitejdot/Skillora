"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  Clock,
  CheckCircle2,
  Heart,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export default function CustomerDashboardRequests() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "DELIVERED" | "COMPLETED">("ALL");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders?role=buyer");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchOrders();
    }
  }, [session?.user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading your requests...</span>
      </div>
    );
  }

  const filteredOrders =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inProgressCount = orders.filter((o) =>
    ["ACCEPTED", "IN_PROGRESS"].includes(o.status)
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Service Requests & Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student progress, download delivered work, and confirm completed projects.
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Hire New Student</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Requests</span>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-600">Pending Review</span>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-indigo-600">In Progress</span>
          <p className="text-2xl font-black text-indigo-600">{inProgressCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Delivered / Done</span>
          <p className="text-2xl font-black text-emerald-600">{deliveredCount + completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { key: "ALL", label: `All (${orders.length})` },
          { key: "PENDING", label: `Pending (${pendingCount})` },
          { key: "IN_PROGRESS", label: `In Progress (${inProgressCount})` },
          { key: "DELIVERED", label: `Delivered (${deliveredCount})` },
          { key: "COMPLETED", label: `Completed (${completedCount})` },
        ].map((tab: any) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
          No orders found in this status.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  src={order.student.avatar}
                  fallback={order.student.name}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {order.student.name}
                    </span>
                    {order.student.profile?.college && (
                      <span className="text-[10px] text-slate-500">
                        ({order.student.profile.college})
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{order.orderNumber}
                    </span>
                  </div>

                  <Link
                    href={`/services/${order.service.slug}`}
                    className="text-xs font-semibold text-slate-800 hover:text-emerald-600 line-clamp-1 mt-0.5"
                  >
                    {order.service.title}
                  </Link>

                  {order.requirements?.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 italic">
                      Note: "{order.requirements.description}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-sm font-black text-slate-900">
                  {formatPrice(order.price)}
                </span>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    order.status === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : order.status === "IN_PROGRESS"
                      ? "bg-indigo-100 text-indigo-800"
                      : order.status === "DELIVERED"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>

                <Link
                  href={`/dashboard/orders`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

