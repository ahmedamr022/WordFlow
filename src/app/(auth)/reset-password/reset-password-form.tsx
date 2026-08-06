"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updatePasswordAction } from "@/app/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updatePasswordAction({ password, confirm });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      router.replace("/dashboard");
    });
  }

  return (
    <main
      dir="rtl"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6">
      
      <h1 className="text-2xl font-bold text-foreground">كلمة مرور جديدة</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        8 أحرف على الأقل، وتحتوي على حرف ورقم.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            كلمة المرور الجديدة
          </label>
          <input
            id="password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-left text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-foreground">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirm"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            dir="ltr"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-left text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          
        </div>

        {error &&
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
          
          {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </form>
    </main>);

}