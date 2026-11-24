"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Loader2, Sparkles, ShoppingBag } from "lucide-react";

export function ModeToggle() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!session?.user) return null;

  const currentMode = session.user.activeMode || "CUSTOMER";
  const isStudentMode = currentMode === "STUDENT";
  const targetMode = isStudentMode ? "CUSTOMER" : "STUDENT";

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: targetMode }),
      });

      if (res.ok) {
        // Update client session
        await update({ activeMode: targetMode });
        
        // Redirect to corresponding dashboard or view
        if (targetMode === "STUDENT") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard/requests");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch mode:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm ${
        isStudentMode
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
      }`}
      title={isStudentMode ? "Switch to Customer Mode" : "Switch to Student Provider Mode"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isStudentMode ? (
        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
      )}
      <span>{isStudentMode ? "Switch to Buying" : "Switch to Selling"}</span>
      <ArrowLeftRight className="w-3 h-3 opacity-60 ml-0.5" />
    </button>
  );
}

