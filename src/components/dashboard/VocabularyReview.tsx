import React from "react";
import Link from "next/link";
import { RotateCcw, Zap } from "lucide-react";
import type { DashboardVocabulary } from "@/lib/dashboard/data";

/**
 * مراجعة الكلمات — الكارت المجاور لقصة اليوم.
 *
 * ما أُصلح في هذه الدفعة
 * ──────────────────────
 * كان الجذر يحمل **`h-[265px]` ثابتاً**، بينما ارتفاع «قصة اليوم» مشتقّ من نسبة
 * الإطار (`SURFACE_FRAMES.storyToday`) ويكبر مع عرض الشاشة. فبمجرد أن كبر كارت
 * قصة اليوم، بقي هذا الكارت 265px ⇒ يبدو صغيراً ومكسوراً بجواره.
 *
 * الآن `h-full` مع حدّ أدنى فقط: الصف في `dashboard/page.tsx` صار
 * `items-stretch`، فقصة اليوم تحدّد ارتفاع الصف وهذا الكارت يملؤه دائماً —
 * مهما تغيّر عرض الشاشة أو نسبة الإطار.
 */

export interface VocabularyReviewProps {
  vocabulary: DashboardVocabulary;
}

const R = 40;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function VocabularyReview({ vocabulary }: VocabularyReviewProps) {
  const retention = vocabulary.retention;
  const ratio = retention === null ? 0 : Math.max(0, Math.min(100, retention)) / 100;
  const offset = CIRCUMFERENCE * (1 - ratio);

  const rows: Array<{label: string;value: string;}> = [
  { label: "كلمة جديدة", value: vocabulary.fresh.toLocaleString("en-US") },
  { label: "للمراجعة", value: vocabulary.due.toLocaleString("en-US") },
  { label: "إجمالي الكلمات", value: vocabulary.total.toLocaleString("en-US") }];


  return (
    <div
      className="col-span-12 lg:col-span-4 relative h-full min-h-[265px] w-full overflow-hidden rounded-[18px] border"
      style={{
        background: "#090F18",
        borderColor: "rgba(255,255,255,.075)",
        boxShadow:
        "0 18px 45px rgba(0,0,0,.36),0 6px 16px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.035),inset 0 -1px 0 rgba(0,0,0,.45)"
      }}>

      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-[18px] right-[18px] h-px"
        style={{ background: "rgba(255,255,255,.045)" }} />


      <div className="relative z-10 h-full px-5 py-4" dir="ltr">
        <div className="flex h-[29px] items-center justify-between">
          <div className="flex items-center gap-2" dir="ltr">
            <h3
              className="text-[16px] font-black leading-none tracking-[-.2px] text-white"
              dir="rtl">

              مراجعة الكلمات
            </h3>
            <RotateCcw
              className="h-[16px] w-[16px] shrink-0"
              strokeWidth={2}
              style={{ color: "#7C6CFF" }}
              aria-hidden />

          </div>

          <div
            className="flex h-[29px] min-w-[51px] items-center justify-center rounded-full px-3.5 text-[10px] font-bold leading-none"
            dir="rtl"
            style={{
              background: "rgba(91,42,153,.20)",
              border: "1px solid rgba(157,92,255,.30)",
              color: "#FFFFFF",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)"
            }}>

            اليوم
          </div>
        </div>

        <div className="absolute left-5 right-5 top-[60px] bottom-[14px] flex items-center" dir="ltr">
          <div className="flex h-full w-[145px] shrink-0 flex-col items-center justify-center">
            <div className="relative h-[126px] w-[126px] shrink-0">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                role="img"
                aria-label={
                retention === null ?
                "لا توجد بيانات تثبيت بعد" :
                `نسبة تثبيت الكلمات ${retention}%`
                }>

                <circle cx="50" cy="50" r={R} fill="none" stroke="#172230" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke="#00AFC2"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 700ms ease" }} />

              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[27px] font-black leading-none tracking-[-.5px] text-white"
                  dir="ltr">

                  {retention === null ? "—" : `${retention}%`}
                </span>
                <span
                  className="mt-[5px] text-[10px] font-medium leading-none"
                  style={{ color: "#9AAABD", letterSpacing: "1.7px" }}>

                  FSRS
                </span>
              </div>
            </div>

            <Link
              href="/vocabulary"
              className="mt-[13px] flex h-[36px] w-[145px] items-center justify-center gap-1.5 rounded-full text-[11px] font-black leading-none transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
              dir="rtl"
              style={{
                background: "linear-gradient(135deg,#482078 0%,#622C91 100%)",
                border: "1px solid rgba(177,101,255,.38)",
                color: "#FFFFFF",
                boxShadow: "0 7px 18px rgba(91,38,146,.22)"
              }}>

              <span>{vocabulary.due > 0 ? `راجع ${vocabulary.due} كلمة` : "ابدأ المراجعة"}</span>
              <Zap size={13} strokeWidth={2.5} fill="currentColor" aria-hidden />
            </Link>
          </div>

          <div
            className="ml-[12px] flex h-full min-w-0 flex-1 flex-col justify-center"
            dir="rtl">

            {rows.map((row, index) =>
            <React.Fragment key={row.label}>
                <div className="flex min-h-[43px] flex-1 items-center justify-between">
                  <span
                  className="whitespace-nowrap text-[11px] font-medium leading-none"
                  style={{ color: "#AAB7C7" }}>

                    {row.label}
                  </span>
                  <span
                  className="text-[21px] font-black leading-none tracking-[-.4px] text-white"
                  dir="ltr">

                    {row.value}
                  </span>
                </div>
                {index < rows.length - 1 &&
              <div
                aria-hidden
                className="h-px w-[76%] self-end"
                style={{ background: "rgba(255,255,255,.055)" }} />

              }
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>);

}

export default VocabularyReview;