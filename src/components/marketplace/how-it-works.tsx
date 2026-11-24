import React from "react";
import { Search, Send, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Discover Campus Talent",
      description:
        "Browse verified college students across design, coding, tutoring, video, and more with student-friendly pricing.",
      icon: Search,
    },
    {
      step: "02",
      title: "Request & Collaborate",
      description:
        "Submit project requirements directly to the student. They accept, start working, and keep you updated on progress.",
      icon: Send,
    },
    {
      step: "03",
      title: "Review & Deliver",
      description:
        "Receive the completed work, confirm completion when 100% satisfied, and leave an authentic review.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Simple & Transparent
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            How Skillora Works
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Hiring talented college students or earning from your own skills has never been simpler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start"
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-200">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Start exploring services now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

