"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Clock, Play, Shuffle } from "lucide-react";

import { storyCover } from "@/lib/assets";
import { StoryImage } from "@/components/common/StoryImage";
import {
  SURFACE_FRAMES,
  normalizeSurface,
  overlayStyle,
  surfaceImage } from
"@/lib/stories/appearance";
import { useStoryModal } from "@/components/stories/StoryModalProvider";
import type { StoryHighlight } from "@/lib/stories/highlights";

/**
 * قصة اليوم.
 *
 * ما أُصلح هنا
 * ────────────
 * ١) **الشكل الآن مطابق للمعاينة.** الإطار كان `h-[240px]/265/292` ثابتاً
 *    داخل ٨ أعمدة، أي نسبة عريضة جداً تختلف عن إطار المعاينة في الاستوديو،
 *    و`object-fit: cover` يقصّ حسب النسبة ⇒ الصورة تبدو «zoom in كبير».
 *    الآن النسبة تأتي من `SURFACE_FRAMES.storyToday` — نفس المصدر الذي
 *    تستخدمه المعاينة بالحرف.
 *
 * ٢) **العرض عبر `StoryImage`** (نفس مكوّن الاستوديو) الذي يقيس الصورة
 *    والإطار ويحسب الموضع بالبكسل ⇒ `positionY` يعمل فعلاً، ولا تظهر أشرطة
 *    سوداء (الفراغ يُملأ بخلفية ضبابية).
 *
 * ٣) **`appearance` يُمرَّر فعلاً** من `dashboard/page.tsx`. كان مفقوداً تماماً.
 *
 * ٤) **زووم الـ hover انتقل إلى الحاوية** بدل الصورة: كان `group-hover:scale`
 *    كلاساً على نفس العنصر الذي يحمل `transform` مباشرة في الـ style، فيلغيه.
 */

export interface StoryOfTheDayProps {
  story: StoryHighlight | null;
  /** `stories.appearance` كما هو من الداتابيز (jsonb) — أو سطح واحد. */
  appearance?: unknown;
  /** غلاف منشور من الداتابيز يتقدّم على الغلاف الثابت في الكتالوج. */
  coverOverride?: string | null;
}

const SHELL = `col-span-12 lg:col-span-8 group relative overflow-hidden rounded-[18px] border ${SURFACE_FRAMES.storyToday.responsiveClass}`;

const SHELL_STYLE = {
  background: "#07111B",
  borderColor: "rgba(255,255,255,0.06)",
  boxShadow: "0 18px 45px rgba(0,0,0,.35)"
} as const;

export function StoryOfTheDay({ story, appearance, coverOverride }: StoryOfTheDayProps) {
  const { openStory } = useStoryModal();

  // نقبل الشكلين: الكائن الكامل `{ storyToday: {...} }` أو السطح مباشرة.
  const surface = React.useMemo(() => {
    const raw =
    appearance && typeof appearance === "object" && "storyToday" in (appearance as object) ?
    (appearance as Record<string, unknown>).storyToday :
    appearance;
    return normalizeSurface(raw, "storyToday");
  }, [appearance]);

  if (!story) {
    return (
      <div className={SHELL} style={SHELL_STYLE}>
        <div
          className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
          dir="rtl">

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
            <BookOpen size={22} aria-hidden />
          </span>
          <h3 className="text-[18px] font-black text-white">لا توجد قصة متاحة الآن</h3>
          <p className="max-w-[320px] text-[13px] text-slate-400">
            تصفّح المكتبة واختر قصة تناسب مستواك — تقدّمك سيظهر هنا.
          </p>
          <Link
            href="/stories"
            className="mt-1 flex h-[39px] items-center gap-2 rounded-[14px] px-5 text-[13px] font-black text-white transition-all duration-200 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg,#00C6DC 0%,#008FA5 100%)",
              border: "1px solid rgba(0,190,210,.38)"
            }}>

            <span>تصفّح القصص</span>
            <Play className="h-[15px] w-[15px]" fill="currentColor" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>);

  }

  const imageSrc = surfaceImage(surface, coverOverride ?? story.cover ?? storyCover(story.id));

  return (
    <div className={SHELL} style={SHELL_STYLE}>
      <button
        type="button"
        onClick={() => openStory(story.id)}
        aria-label={`تفاصيل قصة اليوم: ${story.titleAr}`}
        className="absolute inset-0 z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/70">

        <span className="sr-only">افتح تفاصيل قصة اليوم</span>
      </button>

      {/* حاوية القصّ: زووم الـ hover هنا حتى لا يصطدم بالـ transform الداخلي */}
      <div className="absolute inset-0 overflow-hidden transition-transform duration-700 will-change-transform group-hover:scale-[1.03]">
        <StoryImage src={imageSrc} surface={surface} className="h-full w-full" />
      </div>

      {/* تعتيم رأسي مضبوط من الاستوديو */}
      <div className="pointer-events-none absolute inset-0" style={overlayStyle(surface, "bottom")} />
      {/* لمسة أفقية خفيفة ثابتة تفصل الشارة العلوية عن الصورة */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
          "linear-gradient(90deg,rgba(2,8,15,.02) 0%,rgba(2,8,15,.10) 55%,rgba(2,8,15,.34) 100%)"
        }} />


      <div className="pointer-events-none relative z-10 flex h-full flex-col px-5 py-4">
        <div className="flex items-start justify-between" dir="rtl">
          <h3 className="flex items-center gap-2 text-[18px] font-black leading-none text-white">
            <Shuffle className="h-[15px] w-[15px] text-cyan-300" strokeWidth={2.4} aria-hidden />
            قصة اليوم
          </h3>

          <div
            className="flex h-[29px] items-center justify-center rounded-full px-3 text-[11px] font-bold"
            style={{
              background: "rgba(0,150,175,.11)",
              border: "1px solid rgba(0,160,180,.52)",
              color: "#22E0C8"
            }}>

            ترشيح جديد كل يوم
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex w-full flex-col items-start" dir="ltr">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-[11px] w-[11px] shrink-0 rounded-full"
              style={{ background: "#F0445C", boxShadow: "0 0 8px rgba(240,68,92,.65)" }} />

            <h2 className="font-en text-[20px] font-black leading-none text-white sm:text-[22px]">
              {story.titleEn}
            </h2>
          </div>

          <div
            className="mt-2 ml-[19px] text-left text-[13px] font-medium"
            dir="rtl"
            style={{ color: "#D1DCE7" }}>

            {story.titleAr}
          </div>

          <div className="mt-4 flex w-full flex-wrap items-center gap-x-4 gap-y-3" dir="ltr">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[12px] font-bold text-white">مستوى {story.level}</span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Clock
                className="h-[15px] w-[15px]"
                strokeWidth={2}
                style={{ color: "#AFC0D2" }}
                aria-hidden />

              <span className="text-[12px] font-medium" style={{ color: "#D1DCE7" }}>
                {story.duration}
              </span>
            </div>

            <div className="flex min-w-[120px] flex-1 items-center gap-3">
              <div
                className="relative h-[5px] flex-1 overflow-hidden rounded-full"
                style={{ background: "rgba(13,29,45,.95)" }}
                role="progressbar"
                aria-valuenow={story.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="تقدمك في القصة">

                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${story.progress}%`,
                    background: "#00AFC2",
                    boxShadow: "0 0 8px rgba(0,175,194,.42)"
                  }} />

              </div>

              <span className="shrink-0 text-[11px] font-bold" style={{ color: "#D5E0EA" }}>
                {story.progress}%
              </span>
            </div>

            <span
              className="flex h-[39px] min-w-[102px] shrink-0 items-center justify-center gap-2 rounded-[14px] px-5 text-[13px] font-black transition-all duration-200 group-hover:brightness-110"
              style={{
                background: "linear-gradient(135deg,#00C6DC 0%,#008FA5 100%)",
                color: "#FFFFFF",
                border: "1px solid rgba(0,190,210,.38)",
                boxShadow: "0 7px 20px rgba(0,140,165,.25)"
              }}>

              <span>{story.progress > 0 ? "متابعة" : "التفاصيل"}</span>
              <Play className="h-[15px] w-[15px]" fill="currentColor" strokeWidth={2.5} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </div>);

}

export default StoryOfTheDay;