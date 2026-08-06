"use client";

import React, { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { purgeLegacyStorage } from "@/lib/storage/legacyKeys";

/**
 * تسجيل خروج حقيقي.
 *
 * قبل: localStorage.removeItem("wordflow_user_logged") ثم إعادة توجيه —
 * كوكي الجلسة يظل صالحاً والمستخدم لم يخرج فعلياً.
 * بعد: signOutAction() على السيرفر (scope: global) + مسح أي بقايا محلية.
 */
export function SignOutButton({ className }: {className?: string;}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = () => {
    setError(null);
    purgeLegacyStorage();
    startTransition(async () => {
      try {
        await signOutAction();
      } catch {
        setError("تعذر تسجيل الخروج، حاول مرة أخرى");
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className={
        className ??
        "flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition disabled:opacity-60"
        }>
        
        <LogOut size={18} aria-hidden />
        {isPending ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
      </button>
      {error &&
      <p role="alert" className="text-xs text-red-400 text-center">
          {error}
        </p>
      }
    </div>);

}