"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export default function StudentDashboardOverview() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalRequests: 0,
    pendingRequests: 0,
    activeOrders: 0,
    completedOrders: 0,
    averageRating: 5.0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ordersRes, servicesRes] = await Promise.all([
          fetch("/api/orders?role=student"),
          fetch("/api/services?studentId=" + session?.user?.id),
        ]);

        if (ordersRes.ok && servicesRes.ok) {
          const ordersData = await ordersRes.json();
          const servicesData = await servicesRes.json();

          const orders = ordersData.orders || [];
          const services = servicesData.services || [];

          const pending = orders.filter((o: any) => o.status === "PENDING").length;
          const active = orders.filter((o: any) =>
            ["ACCEPTED", "IN_PROGRESS", "DELIVERED"].includes(o.status)
          ).length;
          const completed = orders.filter((o: any) => o.status === "COMPLETED").length;

          // Calculate student rating across reviews
          let totalStars = 0;
          let count = 0;
          orders.forEach((o: any) => {
            if (o.review) {
              totalStars += o.review.rating;
              count++;
            }
          });
          const avg = count > 0 ? totalStars / count : 5.0;

          setStats({
            totalServices: services.length,
            totalRequests: orders.length,
            pendingRequests: pending,
            activeOrders: active,
            completedOrders: completed,
            averageRating: Math.round(avg * 10) / 10,
          });

          setRecentOrders(orders.slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session?.user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading student dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {session?.user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's what is happening across your campus freelance services today.
          </p>
        </div>

        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Service</span>
        </Link>
      </div>

      {/* Verification status reminder if unverified */}
      {!session?.user?.isVerifiedStudent && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-900">Get Campus Verified</p>
              <p className="text-amber-700">
                Submit your college ID card for admin review to get the verified student badge and increase buyer trust.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* 6 Core Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase">Services</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalServices}</p>
          <span className="text-[11px] text-slate-500">Published</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-bold uppercase">Pending</span>
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.pendingRequests}</p>
          <span className="text-[11px] text-slate-500">Needs Response</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase">Active</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{stats.activeOrders}</p>
          <span className="text-[11px] text-slate-500">In Progress</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span className="text-[10px] font-bold uppercase">Done</span>
          </div>
          <p className="text-2xl font-black text-teal-600">{stats.completedOrders}</p>
          <span className="text-[11px] text-slate-500">Completed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase">Total</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalRequests}</p>
          <span className="text-[11px] text-slate-500">All Orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold uppercase">Rating</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.averageRating.toFixed(1)}</p>
          <span className="text-[11px] text-slate-500">Average Stars</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Recent Orders & Requests
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
          >
            View all orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
            No incoming orders yet. Share your services to start receiving client requests!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={order.buyer.avatar}
                    fallback={order.buyer.name}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {order.buyer.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-medium">
                      {order.service.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="text-sm font-extrabold text-slate-900">
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
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

