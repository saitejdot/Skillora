"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export default function OrdersManagementPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Delivery Modal State
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryFileUrl, setDeliveryFileUrl] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Review Modal State
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Action status message
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isStudentMode = session?.user?.activeMode === "STUDENT";

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?role=${isStudentMode ? "student" : "buyer"}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session?.user, isStudentMode]);

  // Handle Accept / Reject / Cancel
  const handleStatusAction = async (orderId: string, action: "ACCEPT" | "REJECT" | "CANCEL", reason?: string) => {
    try {
      setActionMessage(null);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setActionMessage({ type: "success", text: data.message });
      fetchOrders();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  // Handle Delivery Submission (Student)
  const handleDeliverWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrderId) return;
    setDeliveryLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/orders/${deliveryOrderId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: deliveryMessage.trim(),
          fileUrls: deliveryFileUrl.trim() ? [deliveryFileUrl.trim()] : ["https://example.com/delivery-asset"],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delivery submission failed");

      setActionMessage({ type: "success", text: "Work delivered successfully! Waiting for buyer confirmation." });
      setDeliveryOrderId(null);
      setDeliveryMessage("");
      setDeliveryFileUrl("");
      fetchOrders();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Handle Confirm Completion (Buyer)
  const handleConfirmCompletion = async (orderId: string) => {
    try {
      setActionMessage(null);
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Confirmation failed");

      setActionMessage({ type: "success", text: "Order marked as completed! You can now leave a review." });
      setReviewOrderId(orderId);
      fetchOrders();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  // Handle Review Submission (Buyer)
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId) return;
    setReviewLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewOrderId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review submission failed");

      setActionMessage({ type: "success", text: "Thank you! Your review has been published." });
      setReviewOrderId(null);
      setReviewComment("");
      setReviewRating(5);
      fetchOrders();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading orders lifecycle...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isStudentMode ? "Manage Incoming Orders" : "My Service Orders"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStudentMode
              ? "Accept requests, track project requirements, and upload completed work."
              : "Review work delivered by students, confirm completion, and submit reviews."}
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const otherUser = isStudentMode ? order.buyer : order.student;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Main Summary Header */}
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <Avatar
                      src={otherUser.avatar}
                      fallback={otherUser.name}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {otherUser.name}
                        </span>
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
                      <span className="text-[10px] text-slate-400">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
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

                    <button
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-6 animate-in fade-in duration-150">
                    {/* Requirements */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Project Requirements
                      </h4>
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {order.requirements?.description || "No specific instructions provided."}
                      </div>

                      {order.requirements?.attachmentUrls?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {order.requirements.attachmentUrls.map((url: string, idx: number) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-emerald-600 hover:underline"
                            >
                              <span>Attached Link {idx + 1}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Deliveries list if any */}
                    {order.deliveries?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                          Work Submissions ({order.deliveries.length})
                        </h4>
                        <div className="space-y-3">
                          {order.deliveries.map((del: any) => (
                            <div
                              key={del.id}
                              className="p-4 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-2"
                            >
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span className="font-bold text-emerald-800">
                                  Delivery Note from Student:
                                </span>
                                <span>
                                  {new Date(del.createdAt).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {del.message}
                              </p>
                              {del.fileUrls?.length > 0 && (
                                <div className="pt-2 flex flex-wrap gap-2">
                                  {del.fileUrls.map((fUrl: string, idx: number) => (
                                    <a
                                      key={idx}
                                      href={fUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
                                    >
                                      <span>Download / View Deliverable</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review display if completed and reviewed */}
                    {order.review && (
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            Client Review
                          </span>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-900">
                              {order.review.rating} / 5
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 italic">
                          "{order.review.comment}"
                        </p>
                      </div>
                    )}

                    {/* Action Bar based on Mode & Status */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200">
                      {/* STUDENT ACTIONS */}
                      {isStudentMode && (
                        <>
                          {order.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleStatusAction(order.id, "REJECT")}
                                className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                              >
                                Decline Request
                              </button>
                              <button
                                onClick={() => handleStatusAction(order.id, "ACCEPT")}
                                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                Accept & Start Working
                              </button>
                            </>
                          )}

                          {(order.status === "IN_PROGRESS" || order.status === "DELIVERED") && (
                            <button
                              onClick={() => setDeliveryOrderId(order.id)}
                              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{order.status === "DELIVERED" ? "Upload Revision" : "Deliver Completed Work"}</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* BUYER ACTIONS */}
                      {!isStudentMode && (
                        <>
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusAction(order.id, "CANCEL")}
                              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                            >
                              Cancel Request
                            </button>
                          )}

                          {order.status === "DELIVERED" && (
                            <button
                              onClick={() => handleConfirmCompletion(order.id)}
                              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm Completion</span>
                            </button>
                          )}

                          {order.status === "COMPLETED" && !order.review && (
                            <button
                              onClick={() => setReviewOrderId(order.id)}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                              <span>Leave a Review</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Student Delivery Submission Modal */}
      {deliveryOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Deliver Completed Work</h3>
              <button
                onClick={() => setDeliveryOrderId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliverWork} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delivery Note to Client *
                </label>
                <textarea
                  required
                  rows={4}
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  placeholder="Describe what you completed, summary of files, instructions for viewing, etc..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Download Link / Google Drive / Figma / GitHub URL *
                </label>
                <input
                  type="url"
                  required
                  value={deliveryFileUrl}
                  onChange={(e) => setDeliveryFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or project link"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryOrderId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deliveryLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                >
                  {deliveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Review Modal */}
      {reviewOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Review Student's Work</h3>
              <button
                onClick={() => setReviewOrderId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Written Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience: communication, quality, timeliness, etc."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewOrderId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                >
                  {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  <span>Publish Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

