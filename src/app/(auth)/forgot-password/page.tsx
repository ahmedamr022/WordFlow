"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";

/**
 * The response is identical whether or not the address exists — no account
 * enumeration.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await requestPasswordResetAction({ email });
      setSent(true);
    });
  }

  return (
    <main
      dir="rtl"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6">
      
      <h1 className="text-2xl font-bold text-foreground">استعادة كلمة المرور</h1>

      {sent ?
      <div
        role="status"
        aria-live="polite"
        className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        
          لو كان هذا البريد مسجّلاً عندنا، هتلاقي رسالة فيها رابط إعادة تعيين كلمة المرور خلال
          دقائق. راجع مجلد الرسائل غير المرغوب فيها لو ما وصلتش.
        </div> :

      <>
          <p className="mt-2 text-sm text-muted-foreground">
            اكتب بريدك الإلكتروني وهنبعتلك رابطاً لتعيين كلمة مرور جديدة.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                البريد الإلكتروني
              </label>
              <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-left text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            
            </div>

            <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
            
              {pending ? "جارٍ الإرسال..." : "إرسال الرابط"}
            </button>
          </form>
        </>
      }

      <Link
        href="/login"
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        
        الرجوع لتسجيل الدخول
      </Link>
    </main>);

}