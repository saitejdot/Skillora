"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Loader2,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      const res = await fetch("/api/admin/verifications");
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (verificationId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(verificationId);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          action,
          adminNote: adminNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setAdminNote("");
        fetchVerifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading verifications queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Campus Verifications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review official student ID cards to grant the verified badge.
        </p>
      </div>

      {verifications.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No verification requests submitted yet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            When students upload their campus ID cards, they will appear in this approval queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((ver) => (
            <div
              key={ver.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  src={ver.user.avatar}
                  fallback={ver.user.name}
                  size="lg"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {ver.user.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ver.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : ver.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ver.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{ver.user.email}</p>
                  <div className="text-xs text-slate-700 flex flex-wrap items-center gap-2 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      {ver.college}
                    </span>
                    <span>•</span>
                    <span>Student ID: {ver.studentIdNumber}</span>
                  </div>

                  {ver.adminNote && (
                    <p className="text-[11px] text-slate-400 italic pt-1">
                      Note: {ver.adminNote}
                    </p>
                  )}
                </div>
              </div>

              {/* ID Proof Image & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-end md:self-auto">
                {ver.idCardUrl && (
                  <a
                    href={ver.idCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <span>View Student ID</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {ver.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === ver.id}
                      onClick={() => handleAction(ver.id, "REJECT")}
                      className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      disabled={processingId === ver.id}
                      onClick={() => handleAction(ver.id, "APPROVE")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                    >
                      {processingId === ver.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

