"use client";
import React from "react";
import { LockIcon, SparklesIcon } from "lucide-react";

/**
 * القصة المقفولة كما يراها المستخدم العادي.
 *
 * قرار تصميمي: القفل لا يحذف القصة من المكتبة. الكارت يبقى في مكانه بنفس
 * حجمه، لكن الصورة تُغشى بـ blur وتظهر رسالة الأدمن. هذا يخلق ترقّباً
 * («فيه محتوى جاي») بدل أن يبدو الموقع فارغاً — ولو اختار الأدمن
 * `lockType: "hidden"` فالقصة لا تُعرض من الأصل ولا يظهر هذا المكوّن.
 */

export interface LockedStoryOverlayProps {
  message?: string;
  /** rounded يطابق زوايا الكارت المحيط. */
  radiusClass?: string;
  compact?: boolean;
}

export function LockedStoryOverlay({
  message = "هذه القصة غير متاحة حالياً",
  radiusClass = "rounded-2xl",
  compact = false
}: LockedStoryOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 ${radiusClass} bg-[#03060d]/55 px-4 text-center`}
      style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      dir="rtl"
      role="note"
      aria-label="قصة مقفلة">

      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-300">
        <LockIcon className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden />
      </span>

      <p className="flex items-center gap-1.5 text-[15px] font-black text-white">
        <SparklesIcon className="h-4 w-4 text-amber-300" aria-hidden />
        قريباً
      </p>

      {!compact &&
      <p className="max-w-[240px] text-[12.5px] leading-relaxed text-slate-300/85">{message}</p>
      }
    </div>);

}

/** شاشة كاملة لصفحة القراءة لو حاول مستخدم فتح رابط قصة مقفولة مباشرة. */
export function LockedStoryScreen({
  titleEn,
  titleAr,
  message,
  onBack




}: {titleEn: string;titleAr: string;message: string;onBack: () => void;}) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[#04070f] px-6 text-white"
      dir="rtl">

      <div className="w-full max-w-md rounded-[26px] border border-white/[0.07] bg-[#080d18]/90 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-300">
          <LockIcon className="h-7 w-7" aria-hidden />
        </span>

        <h1 className="font-en mt-5 text-2xl font-extrabold">{titleEn}</h1>
        <p className="mt-1 text-[15px] font-bold text-cyan-300">{titleAr}</p>

        <p className="mt-4 text-[13.5px] leading-relaxed text-slate-400">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full rounded-[14px] py-3 text-[14px] font-black text-white transition hover:brightness-110"
          style={{ backgroundImage: "linear-gradient(135deg,#00C6DC 0%,#0086a0 100%)" }}>

          تصفّح القصص المتاحة
        </button>
      </div>
    </div>);

}

export default LockedStoryOverlay;