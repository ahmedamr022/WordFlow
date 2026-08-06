import React from "react";

/**
 * صفحة القارئ ثقيلة (نص + صوت + محرك كتابة)، فالانتظار عليها كان أطول
 * شيء في التجربة. هيكل مطابق للتخطيط يمنع القفزة البصرية.
 */
export default function StoryLoading() {
  return (
    <div
      className="min-h-screen w-full bg-background p-8"
      dir="rtl"
      aria-busy="true"
      aria-live="polite">

      <span className="sr-only">جارٍ تحميل القصة…</span>

      <div className="mx-auto max-w-[1100px] space-y-5">
        <div className="h-[52px] w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0B0F1C]" />
        <div className="h-[320px] w-full animate-pulse rounded-[24px] border border-white/[0.06] bg-[#0B0F1C]" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="h-[220px] animate-pulse rounded-[20px] border border-white/[0.06] bg-[#0B0F1C]" />
          <div className="h-[220px] animate-pulse rounded-[20px] border border-white/[0.06] bg-[#0B0F1C]" />
        </div>
      </div>
    </div>);

}