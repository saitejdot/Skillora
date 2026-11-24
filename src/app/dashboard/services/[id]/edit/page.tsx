"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ServiceForm } from "@/components/forms/service-form";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditServicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadService() {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.ok) {
          const data = await res.json();
          setService(data.service);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadService();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading service data...</span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        Service listing not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Services</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Service Listing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Update details, change pricing, or adjust showcase images.
        </p>
      </div>

      <ServiceForm initialData={service} isEdit={true} />
    </div>
  );
}

