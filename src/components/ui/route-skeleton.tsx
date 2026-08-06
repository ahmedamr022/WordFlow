import React from "react";

/**
 * هيكل تحميل مشترك لكل المسارات. لم يكن في المشروع أي `loading.tsx`،
 * فكل تنقّل كان يبدو معلَّقاً: الصفحة القديمة تبقى ثابتة والمتصفح يظهر
 * مؤشر التحميل حتى تنتهي المصادقة واستعلام البروفايل على السيرفر.
 * وجود loading.tsx يجعل Next يبثّ هذا الهيكل فوراً.
 */

export interface RouteSkeletonProps {
  /** هل المسار داخل الـ app shell (سايدبار + هيدر)؟ */
  withShell?: boolean;
  /** عدد البطاقات الكبيرة في الهيكل. */
  blocks?: number;
  label?: string;
}

export function RouteSkeleton({
  withShell = true,
  blocks = 3,
  label = "جارٍ التحميل…"
}: RouteSkeletonProps) {
  return (
    <div
      className="flex min-h-screen bg-background font-sans"
      dir="rtl"
      aria-busy="true"
      aria-live="polite">

      <span className="sr-only">{label}</span>

      {withShell &&
      <div className="hidden w-[248px] shrink-0 border-l border-white/[0.06] bg-[#070a14] lg:block" />
      }

      <div className="flex min-w-0 flex-1 flex-col">
        {withShell &&
        <div className="h-[58px] w-full border-b border-white/[0.08] bg-[#070a14]/90" />
        }

        <div className="flex-1 space-y-5 p-8">
          {Array.from({ length: blocks }).map((_, index) =>
          <div
            key={index}
            className="animate-pulse rounded-[22px] border border-white/[0.06] bg-[#0B0F1C]"
            style={{ height: index === 0 ? 200 : 148 }} />
          )}
        </div>
      </div>
    </div>);

}

/** هيكل شاشات الدخول والتسجيل و onboarding (بلا سايدبار). */
export function AuthSkeleton({ label = "جارٍ التحميل…" }: {label?: string;}) {
  return (
    <div
      className="grid min-h-screen w-full grid-cols-1 bg-background lg:grid-cols-2"
      dir="rtl"
      aria-busy="true"
      aria-live="polite">

      <span className="sr-only">{label}</span>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[380px] space-y-4">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.05]" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.05]" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.08]" />
        </div>
      </div>

      <div className="hidden bg-[#070a14] lg:block" />
    </div>);

}