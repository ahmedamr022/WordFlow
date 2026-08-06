"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { signInAction } from "@/app/actions/auth";
import {
  AuthAlert,
  AuthCard,
  AuthDivider,
  AuthShell,
  OAuthButton,
  PrimaryButton,
  WordFlowWordmark,
  authInputClass } from
"@/components/auth/AuthShell";

/**
 * تسجيل الدخول.
 *
 * كل ما يخصّ الخلفية والكروت الثلاثة والنص الترحيبي انتقل إلى `AuthShell`
 * المشترك، فبقيت هنا **منطق الدخول والحقول فقط** — وهذا ما يجعل صفحات
 * الـ onboarding مطابقة لهذه الصفحة بلا نسخ ولصق.
 */

const CALLBACK_ERRORS: Record<string, string> = {
  missing_code: "رابط الدخول غير مكتمل، حاول مرة أخرى.",
  oauth_failed: "تعذر إكمال تسجيل الدخول عبر المزود، حاول مرة أخرى.",
  invalid_link: "الرابط غير صالح.",
  expired_link: "انتهت صلاحية الرابط، اطلب رابطاً جديداً."
};

function isInternalPath(value: string | null): value is string {
  return Boolean(
    value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // نقرأ من الـ URL أثناء الرِندر — بلا useEffect ولا اختلاف hydration.
  const callbackErrorKey = searchParams.get("error");
  const error =
  formError ?? (callbackErrorKey ? CALLBACK_ERRORS[callbackErrorKey] ?? null : null);
  const nextParam = searchParams.get("next");

  /**
   * الهدف يأتي من **السيرفر** (signInAction) محسوباً من
   * profiles.onboarding_completed_at — نفس العلم الذي يستخدمه ProtectedShell.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    const result = await signInAction({ email: email.trim(), password });

    if (!result.ok) {
      setFormError(result.error);
      setLoading(false);
      return;
    }

    const serverTarget = result.data?.redirectTo ?? "/dashboard";
    const target =
    serverTarget === "/dashboard" && isInternalPath(nextParam) ? nextParam : serverTarget;

    router.refresh();
    router.replace(target);
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setFormError(null);
    const supabase = createClient();

    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (isInternalPath(nextParam)) redirectTo.searchParams.set("next", nextParam);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() }
    });

    if (oauthError) {
      setFormError("تعذر بدء تسجيل الدخول عبر هذا المزود، حاول مرة أخرى.");
    }
  };

  return (
    <AuthShell cardWidthClass="lg:w-[450px]">
      <AuthCard className="h-full justify-between">
        <div>
          <div className="mb-6">
            <WordFlowWordmark />
          </div>

          <div className="mb-6 text-left">
            <h1 className="mb-1.5 flex items-center gap-2 bg-gradient-to-r from-[#38bdf8] via-[#a855f7] to-[#ec4899] bg-clip-text text-3xl font-black text-transparent">
              Welcome Back{" "}
              <span className="text-2xl" aria-hidden>
                👋
              </span>
            </h1>
            <p className="text-left text-sm font-normal text-slate-300" dir="rtl">
              أكمل رحلة تعلم الإنجليزية من حيث توقفت
            </p>
          </div>

          {error && <AuthAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-right text-sm font-semibold text-slate-200"
                dir="rtl">

                البريد الإلكتروني
              </label>
              <div className="relative flex items-center">
                <Mail
                  className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400"
                  aria-hidden />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@email.com"
                  className={`${authInputClass} pl-11 pr-4 text-left`} />

              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-right text-sm font-semibold text-slate-200"
                dir="rtl">

                كلمة المرور
              </label>
              <div className="relative flex items-center">
                <Lock
                  className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400"
                  aria-hidden />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className={`${authInputClass} pl-11 pr-11 text-left tracking-widest`} />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200">

                  {showPassword ?
                  <EyeOff className="h-5 w-5" aria-hidden /> :

                  <Eye className="h-5 w-5" aria-hidden />
                  }
                </button>
              </div>
            </div>

            <div className="flex flex-row-reverse items-center justify-between pt-1 text-sm">
              <span className="text-xs text-slate-400">جلستك تبقى نشطة على هذا الجهاز</span>
              <Link
                href="/forgot-password"
                className="text-[#a855f7] transition-colors hover:text-[#c084fc]">

                نسيت كلمة المرور؟
              </Link>
            </div>

            <PrimaryButton type="submit" loading={loading} className="mt-2">
              تسجيل الدخول
            </PrimaryButton>
          </form>

          <AuthDivider />

          <div className="space-y-2.5">
            <OAuthButton
              provider="google"
              label="متابعة باستخدام Google"
              onClick={() => void handleOAuthLogin("google")} />

            <OAuthButton
              provider="github"
              label="متابعة باستخدام GitHub"
              onClick={() => void handleOAuthLogin("github")} />

          </div>
        </div>

        <div className="pt-6 text-center text-sm text-slate-300" dir="rtl">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-[#a855f7] hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </AuthCard>
    </AuthShell>);

}