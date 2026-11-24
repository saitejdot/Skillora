"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  Clock,
  Loader2,
  Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function MyServicesPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMyServices = async () => {
    try {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/services?studentId=${session.user.id}`);
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
    if (session?.user) {
      fetchMyServices();
    }
  }, [session?.user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service listing?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading your services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Services
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your service listings, pricing, and active status.
          </p>
        </div>

        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Service</span>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            You haven't created any services yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Publish your first gig in minutes and start offering your skills to clients worldwide.
          </p>
          <Link
            href="/dashboard/services/new"
            className="inline-block mt-4 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const thumbnail =
              service.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600";

            return (
              <div
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-slate-100">
                    <img
                      src={thumbnail}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {service.category?.name}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {service.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-800 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {service.averageRating > 0 ? service.averageRating.toFixed(1) : "New"}
                      </span>
                      <span>•</span>
                      <span>{service.totalReviews} reviews</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.deliveryDays}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    {formatPrice(service.price)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/services/${service.slug}`}
                      className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-50"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50"
                      title="Edit Service"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-50"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

