import React from "react";
import Link from "next/link";
import { ServiceForm } from "@/components/forms/service-form";
import { ArrowLeft } from "lucide-react";

export default function NewServicePage() {
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
          Create a New Service
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Set up a gig offering your student skills with straightforward fixed pricing.
        </p>
      </div>

      <ServiceForm />
    </div>
  );
}

