"use client";

import React from "react";
import {
  BookOpenIcon,
  ClockIcon,
  CreditCardIcon,
  LayoutPanelTopIcon,
  MonitorIcon,
  ShuffleIcon,
  SmartphoneIcon,
  StarIcon,
  ZapIcon } from
"lucide-react";

import { Segmented } from "@/components/admin/ui/controls";
import { StoryImage } from "@/components/common/StoryImage";
import { LockedStoryOverlay } from "@/components/stories/LockedStoryOverlay";
import { SURFACE_FRAMES, overlayStyle, surfaceImage } from "@/lib/stories/appearance";
import type { StoryDraft } from "@/lib/admin/draft";
import type { SurfaceKey } from "@/types/admin";

/**
 * المعاينة المباشرة — أهم ميزة في الاستوديو.
 *
 * الإصلاح الأساسي هنا: المعاينة كانت **تكذب**.
 * كانت تستدعي نفس دوال المظهر، لكن داخل إطار بنسبة مختلفة عن الإطار الحقيقي
 * (مثال: «قصة اليوم» كانت 228px داخل عمود ضيّق، بينما في الداشبورد كارت عريض
 * يمتد على ٨ أعمدة). و`object-fit: cover` يقصّ حسب نسبة الإطار ⇒ نفس القيم
 * تُنتج شكلين مختلفين، وهذا سبب شكوى «الشكل في الاستوديو ≠ الشكل في الداشبورد
 * وكأنه zoom in كبير».
 *
 * الآن نسبة كل سطح معرّفة مرة واحدة في `SURFACE_FRAMES` ويستخدمها هذا الملف
 * **والمكوّن الحقيقي** معاً، والعرض يمرّ عبر `StoryImage` نفسه. أضفنا كذلك
 * مبدّل ديسكتوب/موبايل لأن نسبة الإطار تختلف بين المقاسين فعلاً.
 */

export const PREVIEW_OPTIONS: {value: SurfaceKey;label: string;icon: React.ReactNode;}[] = [
{ value: "storyPage", label: "صفحة القصة", icon: <MonitorIcon className="h-3.5 w-3.5" /> },
{ value: "modal", label: "المودال", icon: <LayoutPanelTopIcon className="h-3.5 w-3.5" /> },
{ value: "storyToday", label: "قصة اليوم", icon: <ShuffleIcon className="h-3.5 w-3.5" /> },
{ value: "card", label: "الكارت", icon: <CreditCardIcon className="h-3.5 w-3.5" /> }];


type Device = "desktop" | "mobile";

export interface LivePreviewProps {
  draft: StoryDraft;
  surfaceKey: SurfaceKey;
  onSurfaceChange: (key: SurfaceKey) => void;
  /** معاينة القفل كما يراه المستخدم العادي. */
  previewLocked: boolean;
  onPreviewLockedChange: (next: boolean) => void;
  progressPercent?: number;
}

export function LivePreview({
  draft,
  surfaceKey,
  onSurfaceChange,
  previewLocked,
  onPreviewLockedChange,
  progressPercent = 65
}: LivePreviewProps) {
  const [device, setDevice] = React.useState<Device>("desktop");

  const surface = draft.appearance[surfaceKey];
  const src = surfaceImage(surface, draft.coverImage ?? draft.bgImage);
  const locked = previewLocked && draft.access.locked;
  const frame = SURFACE_FRAMES[surfaceKey];
  const aspect = device === "desktop" ? frame.aspectClass : frame.aspectClassMobile;

  return (
    <section className="flex flex-col gap-3 rounded-[18px] border border-white/[0.06] bg-[#090F18]/85 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-en text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
          Live Preview
        </p>

        <div className="flex items-center gap-3">
          <Segmented
            size="sm"
            value={device}
            onChange={setDevice}
            options={[
            { value: "desktop" as const, label: "ديسكتوب", icon: <MonitorIcon className="h-3.5 w-3.5" /> },
            { value: "mobile" as const, label: "موبايل", icon: <SmartphoneIcon className="h-3.5 w-3.5" /> }]
            } />


          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] font-bold text-slate-400">
            <input
              type="checkbox"
              checked={previewLocked}
              onChange={(event) => onPreviewLockedChange(event.target.checked)}
              className="h-3.5 w-3.5 accent-cyan-400"
              disabled={!draft.access.locked} />

            عرض حالة القفل
          </label>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500">اعرض كـ:</span>
        <Segmented options={PREVIEW_OPTIONS} value={surfaceKey} onChange={onSurfaceChange} size="sm" />
      </div>

      {/* ── صفحة القصة ─────────────────────────────────────────────────────── */}
      {surfaceKey === "storyPage" &&
      <div
        className={`relative w-full overflow-hidden rounded-[14px] border border-white/[0.07] bg-[#04070f] ${aspect}`}>

          <StoryImage src={src} surface={surface} className="absolute inset-0 h-full w-full" loading="eager" />
          <div className="pointer-events-none absolute inset-0" style={overlayStyle(surface, "left")} />

          <div className="absolute inset-0 flex flex-col justify-end p-5 [direction:ltr]" dir="ltr">
            <h3 className="font-en text-[22px] font-black leading-tight text-white">
              {draft.titleEn || "Story title"}
            </h3>
            <p dir="rtl" className="mt-1 text-[14px] font-bold text-cyan-300">
              {draft.titleAr}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="font-en rounded-md border border-cyan-500/35 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                {draft.cefrLevel}
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-slate-200">
                {draft.difficulty}
              </span>
              <span className="font-en flex items-center gap-1 text-[11px] text-slate-300">
                <ClockIcon className="h-3 w-3" aria-hidden />
                {draft.estimatedMinutes} min
              </span>
            </div>

            <p dir="rtl" className="mt-3 max-w-[80%] text-[11.5px] leading-relaxed text-slate-300/85">
              {draft.descriptionAr || draft.descriptionEn}
            </p>

            <div className="mt-3 flex items-center gap-2.5">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/12">
                <span
                className="block h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundImage: "linear-gradient(90deg,#22d3ee,#a855f7)"
                }} />

              </span>
              <span className="font-en text-[11px] font-bold text-white/80">{progressPercent}%</span>
            </div>
          </div>

          {locked && <LockedStoryOverlay message={draft.access.lockMessage} radiusClass="rounded-[14px]" />}
        </div>
      }

      {/* ── المودال ────────────────────────────────────────────────────────── */}
      {surfaceKey === "modal" &&
      <div className="rounded-[16px] border border-white/[0.06] bg-[#070A10] p-3.5">
          <div className="grid gap-3.5 md:grid-cols-[1.05fr_1fr]">
            <div
            className={`relative overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#0B0E17] ${aspect}`}>

              <StoryImage src={src} surface={surface} className="absolute inset-0 h-full w-full" loading="eager" />
              <div className="pointer-events-none absolute inset-0" style={overlayStyle(surface)} />
              {locked && <LockedStoryOverlay message={draft.access.lockMessage} radiusClass="rounded-[12px]" compact />}
            </div>

            <div className="flex flex-col [direction:ltr]">
              <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 [direction:rtl]">
                <BookOpenIcon className="h-3 w-3" aria-hidden />
                تفاصيل القصة
              </span>
              <h3 className="font-en text-[19px] font-black leading-tight text-white">
                {draft.titleEn || "Story title"}
              </h3>
              <p className="mt-1 text-[13px] font-bold text-cyan-300 [direction:rtl]">{draft.titleAr}</p>
              <p className="mt-2.5 text-right text-[11.5px] leading-[1.9] text-slate-400 [direction:rtl]">
                {draft.descriptionAr || draft.descriptionEn || "لا يوجد وصف بعد."}
              </p>
              <div className="mt-auto grid grid-cols-3 gap-2 pt-3">
                {[
              { label: "المستوى", value: draft.cefrLevel },
              { label: "الجُمل", value: String(draft.sentences.length) },
              { label: "الدقائق", value: String(draft.estimatedMinutes) }].
              map((fact) =>
              <span
                key={fact.label}
                className="rounded-lg border border-white/[0.06] bg-[#0B111C] px-2 py-1.5 text-center">

                    <span className="font-en block text-[13px] font-black text-white">{fact.value}</span>
                    <span className="block text-[9.5px] text-slate-500">{fact.label}</span>
                  </span>
              )}
              </div>
            </div>
          </div>
        </div>
      }

      {/* ── قصة اليوم ──────────────────────────────────────────────────────── */}
      {surfaceKey === "storyToday" &&
      <div
        className={`relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[#07111B] ${aspect}`}>

          <StoryImage src={src} surface={surface} className="absolute inset-0 h-full w-full" loading="eager" />
          <div className="pointer-events-none absolute inset-0" style={overlayStyle(surface)} />
          <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
            "linear-gradient(90deg,rgba(2,8,15,.02) 0%,rgba(2,8,15,.10) 55%,rgba(2,8,15,.34) 100%)"
          }} />


          <div className="relative z-10 flex h-full flex-col px-5 py-4">
            <div className="flex items-start justify-between" dir="rtl">
              <h3 className="flex items-center gap-2 text-[18px] font-black leading-none text-white">
                <ShuffleIcon className="h-[15px] w-[15px] text-cyan-300" aria-hidden />
                قصة اليوم
              </h3>
              <span className="flex h-[29px] items-center rounded-full border border-cyan-400/45 bg-cyan-500/10 px-3 text-[11px] font-bold text-[#22E0C8]">
                ترشيح جديد كل يوم
              </span>
            </div>

            <div className="flex-1" />

            <div dir="ltr" className="flex flex-col items-start">
              <p className="font-en text-[20px] font-black leading-none text-white">
                {draft.titleEn || "Story title"}
              </p>
              <p dir="rtl" className="mt-2 text-[13px] font-medium text-[#D1DCE7]">
                {draft.titleAr}
              </p>
              <span className="mt-3 flex w-full items-center gap-3">
                <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-[rgba(13,29,45,.95)]">
                  <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    background: "#00AFC2",
                    boxShadow: "0 0 8px rgba(0,175,194,.42)"
                  }} />

                </span>
                <span className="font-en text-[11px] font-bold text-[#D5E0EA]">{progressPercent}%</span>
              </span>
            </div>
          </div>

          {locked && <LockedStoryOverlay message={draft.access.lockMessage} radiusClass="rounded-[18px]" />}
        </div>
      }

      {/* ── الكارت ─────────────────────────────────────────────────────────── */}
      {surfaceKey === "card" &&
      <div className="mx-auto w-[230px]">
          <div
          className={`relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e1a] ${aspect}`}>

            <StoryImage src={src} surface={surface} className="absolute inset-0 h-full w-full" loading="eager" />
            <div className="pointer-events-none absolute inset-0" style={overlayStyle(surface)} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070a14] via-[#070a14]/55 to-transparent" />

            <div className="relative z-10 flex flex-col gap-1.5 p-3.5 text-right">
              <p className="font-en truncate text-[14px] font-extrabold text-white">
                {draft.titleEn || "Story title"}
              </p>
              <p className="truncate text-[11px] font-semibold text-slate-400">{draft.titleAr}</p>
              <span className="font-en w-fit rounded-md border border-emerald-500/40 bg-[#0e1726]/80 px-2 py-0.5 text-[10.5px] font-bold text-emerald-400">
                {draft.cefrLevel}
              </span>
              <div className="font-en mt-1.5 flex items-center justify-between border-t border-white/[0.05] pt-1.5 text-[10.5px]">
                <span className="flex items-center gap-1 font-bold text-cyan-400">
                  <ZapIcon className="h-3 w-3" aria-hidden />
                  {draft.xpReward}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <StarIcon className="h-3 w-3 fill-amber-400" aria-hidden />
                  4.8
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <ClockIcon className="h-3 w-3" aria-hidden />
                  {draft.estimatedMinutes}د
                </span>
              </div>
            </div>

            {locked && <LockedStoryOverlay message={draft.access.lockMessage} compact />}
          </div>
        </div>
      }

      <p className="text-[11px] leading-relaxed text-slate-500">
        الإطار هنا بنفس نسبة الإطار الحقيقي في الموقع، والعرض يمرّ بنفس المكوّن
        (<span className="font-en">StoryImage</span>) ⇒ ما تراه هو ما سيظهر بعد النشر.
      </p>
    </section>);

}

export default LivePreview;