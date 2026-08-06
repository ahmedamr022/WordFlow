"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles, User } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthShell,
  OnboardingStepper,
  PrimaryButton,
  WordFlowWordmark,
  authInputClass } from
"@/components/auth/AuthShell";

/**
 * الخطوة ١ من الـ onboarding — اللقب.
 *
 * الخلفية والكروت الثلاثة والنص الترحيبي أصبحت من `AuthShell` نفسه المستخدم
 * في صفحتي تسجيل الدخول وإنشاء الحساب (كان كل ملف ينسخها بفروق صغيرة). الكارت
 * الرئيسي — أي المحتوى الذي يُدخل فيه المستخدم بياناته — باقٍ كما هو.
 */
export default function OnboardingNicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("onboarding_nickname");
    if (stored) {
      setNickname(stored);
      return;
    }
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      const fullName = data?.user?.user_metadata?.full_name;
      if (typeof fullName === "string" && fullName.trim()) setNickname(fullName);
    });
  }, []);

  const handleNext = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!nickname.trim()) {
      setError("يرجى كتابة الاسم أو اللقب للمتابعة");
      return;
    }
    setError(null);
    sessionStorage.setItem("onboarding_nickname", nickname.trim());
    router.push("/onboarding/language");
  };

  return (
    <AuthShell cardWidthClass="lg:w-[440px]" align="center">
      <AuthCard className="items-center bg-[#040711]/85 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="mb-6">
          <WordFlowWordmark />
        </div>

        <OnboardingStepper step={1} />

        <div className="mb-8 space-y-2 text-center" dir="rtl">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-extrabold text-white">
            <span>ما اسمك؟</span>
            <span className="text-3xl" aria-hidden>
              👋
            </span>
          </h1>
          <p className="text-sm font-normal text-slate-400">
            اختر اسماً يناديك به <span className="font-medium text-purple-400">WordFlow</span>
          </p>
        </div>

        <form onSubmit={handleNext} className="w-full space-y-6" dir="rtl">
          <div className="space-y-2">
            <label htmlFor="onboarding-nickname" className="block text-xs font-semibold text-slate-300">
              الاسم المستعار
            </label>
            <div className="relative flex items-center">
              <input
                id="onboarding-nickname"
                type="text"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="مثال: أحمد"
                autoFocus
                aria-invalid={Boolean(error)}
                className={`${authInputClass} pl-11 pr-4 text-right ${
                error ? "border-red-500" : ""}`
                } />

              <User className="pointer-events-none absolute left-3 h-5 w-5 text-purple-400" aria-hidden />
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-400" aria-hidden />
              <span>سيظهر هذا الاسم في تجربتك داخل التطبيق</span>
            </div>

            {error &&
            <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{error}</span>
              </p>
            }
          </div>

          <PrimaryButton type="submit">التالي</PrimaryButton>
        </form>
      </AuthCard>
    </AuthShell>);

}