"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { signUpAction } from "@/app/actions/auth";
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
 * إنشاء حساب جديد.
 *
 * نفس القوقعة المشتركة تماماً كصفحة تسجيل الدخول (`AuthShell`) — الاختلاف
 * الوحيد هو محتوى الكارت. التحقق على العميل يطابق `zod` على السيرفر حرفياً
 * (nicknameSchema / passwordSchema) حتى لا يرى المستخدم خطأ سيرفر لشيء كان
 * يمكن تنبيهه إليه فوراً.
 */

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      return "يرجى إكمال جميع الحقول.";
    }
    if (fullName.trim().length < 2) return "الاسم قصير جداً.";
    if (password.length < 8) return "كلمة المرور 8 أحرف على الأقل.";
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return "كلمة المرور يجب أن تحتوي على حرف ورقم.";
    }
    if (password !== confirmPassword) return "كلمتا المرور غير متطابقتين.";
    if (!agreeToTerms) return "يجب الموافقة على الشروط وسياسة الخصوصية.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await signUpAction({
        email: email.trim(),
        password,
        nickname: fullName.trim()
      });

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      try {
        sessionStorage.setItem("onboarding_nickname", fullName.trim());
      } catch {

        // التخزين قد يكون معطّلاً — غير قاتل، خطوة اللقب ستطلب الاسم مجدداً.
      }
      router.push("/onboarding/nickname");
      router.refresh();
    } catch {
      setError("تعذر إنشاء الحساب الآن، حاول مرة أخرى.");
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "google" | "github") => {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (oauthError) {
      setError("تعذر بدء التسجيل عبر هذا المزود، حاول مرة أخرى.");
    }
  };

  return (
    <AuthShell cardWidthClass="lg:w-[500px]">
      <AuthCard className="max-h-full justify-between overflow-y-auto rounded-[32px]">
        <div>
          <div className="mb-6 flex justify-center lg:justify-start">
            <WordFlowWordmark />
          </div>

          <div className="mb-6 text-center" dir="rtl">
            <h1 className="mb-1.5 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#38bdf8] via-[#a855f7] to-[#ec4899] bg-clip-text text-3xl font-black text-transparent">
              <span>إنشاء حساب جديد</span>
              <UserPlus className="h-7 w-7 text-[#a855f7]" aria-hidden />
            </h1>
            <p className="text-sm font-normal text-slate-300">
              ابدأ رحلتك وتعلم الإنجليزية بذكاء
            </p>
          </div>

          {error && <AuthAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="register-name"
                className="block text-right text-sm font-semibold text-slate-200"
                dir="rtl">

                الإسم الكامل
              </label>
              <div className="relative flex items-center">
                <User
                  className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400"
                  aria-hidden />

                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  dir="rtl"
                  className={`${authInputClass} pl-11 pr-4 text-right`} />

              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-right text-sm font-semibold text-slate-200"
                dir="rtl">

                البريد الإلكتروني
              </label>
              <div className="relative flex items-center">
                <Mail
                  className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400"
                  aria-hidden />

                <input
                  id="register-email"
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
                htmlFor="register-password"
                className="block text-right text-sm font-semibold text-slate-200"
                dir="rtl">

                كلمة المرور
              </label>
              <div className="relative flex items-center">
                <Lock
                  className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400"
                  aria-hidden />

                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••"
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
              <p className="text-right text-[11px] text-slate-400" dir="rtl">
                8 أحرف على الأقل، وتحتوي على حرف ورقم.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm"
                className="block text-right text-sm font-semibold text-slate-200"
                dir="rtl">

                تأكيد كلمة المرور
              </label>
              <div className="relative flex items-center">
                <Lock
                  className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400"
                  aria-hidden />

                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••••"
                  className={`${authInputClass} pl-11 pr-11 text-left tracking-widest`} />

                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200">

                  {showConfirm ?
                  <EyeOff className="h-5 w-5" aria-hidden /> :

                  <Eye className="h-5 w-5" aria-hidden />
                  }
                </button>
              </div>
            </div>

            <label
              className="flex cursor-pointer items-start gap-2.5 pt-1 text-right text-xs text-slate-300"
              dir="rtl">

              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) => setAgreeToTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#7c3aed]" />

              <span>
                أوافق على{" "}
                <Link href="/terms" className="font-bold text-[#a855f7] hover:underline">
                  الشروط والأحكام
                </Link>{" "}
                و
                <Link href="/privacy" className="font-bold text-[#a855f7] hover:underline">
                  سياسة الخصوصية
                </Link>
              </span>
            </label>

            <PrimaryButton type="submit" loading={loading} className="mt-1">
              إنشاء حساب
            </PrimaryButton>
          </form>

          <AuthDivider />

          <div className="space-y-2.5">
            <OAuthButton
              provider="google"
              label="التسجيل باستخدام Google"
              onClick={() => void handleOAuthSignUp("google")} />

            <OAuthButton
              provider="github"
              label="التسجيل باستخدام GitHub"
              onClick={() => void handleOAuthSignUp("github")} />

          </div>
        </div>

        <div className="pt-6 text-center text-sm text-slate-300" dir="rtl">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-[#a855f7] hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </AuthCard>
    </AuthShell>);

}