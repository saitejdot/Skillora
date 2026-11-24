"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function StudentReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        if (!session?.user?.id) return;
        const res = await fetch(`/api/students/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.student?.reviewsReceived || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchReviews();
    }
  }, [session?.user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading reviews...</span>
      </div>
    );
  }

  const totalReviews = reviews.length;
  const avg =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 5.0;

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Client Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Reviews from customers who completed orders with you.
        </p>
      </div>

      {/* Rating Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-black text-slate-900">{avg.toFixed(1)}</p>
          <div className="flex items-center justify-center text-amber-400 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(avg) ? "fill-amber-400" : "fill-slate-200 text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalReviews} total reviews
          </span>
        </div>

        <div className="h-16 w-px bg-slate-200 hidden sm:block" />

        <div className="text-xs text-slate-600 hidden sm:block space-y-1">
          <p className="font-bold text-slate-800">100% Verified Purchases</p>
          <p className="text-slate-500 max-w-md">
            Reviews on Skillora can only be submitted by verified customers who have completed an order with you.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No client reviews received yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you complete and deliver client orders, their ratings and feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={rev.buyer.avatar}
                    fallback={rev.buyer.name}
                    size="sm"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {rev.buyer.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Service: {rev.service?.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">{rev.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <span className="text-[10px] text-slate-400 block pt-1">
                {new Date(rev.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

