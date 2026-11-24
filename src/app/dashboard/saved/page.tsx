"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ServiceCard } from "@/components/marketplace/service-card";
import { Heart, Loader2 } from "lucide-react";

export default function SavedServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/services/favourite");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading saved services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Services
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep track of student creators and gigs you want to hire in the future.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            You haven't saved any services yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the heart icon on any service card while browsing to save it here.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-4 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.title}
              slug={service.slug}
              price={service.price}
              deliveryDays={service.deliveryDays}
              averageRating={service.averageRating}
              totalReviews={service.totalReviews}
              category={service.category}
              student={service.student}
              images={service.images}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

