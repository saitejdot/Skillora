"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/admin/services?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleStatus = async (serviceId: string, currentStatus: string) => {
    setUpdatingId(serviceId);
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, status: newStatus }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading marketplace listings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Service Moderation ({services.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review published gigs across categories and pause inappropriate or spam services.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by title or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchServices()}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Listing Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Orders</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 max-w-xs font-semibold text-slate-900 truncate">
                  {s.title}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {s.category?.name}
                </td>
                <td className="px-5 py-4 font-medium text-slate-800">
                  {s.student?.name}
                </td>
                <td className="px-5 py-4 font-bold text-slate-900">
                  {formatPrice(s.price)}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {s._count?.orders || 0}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      s.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/services/${s.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                      title="View Service"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(s.id, s.status)}
                      disabled={updatingId === s.id}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        s.status === "ACTIVE"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {s.status === "ACTIVE" ? "Pause" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

