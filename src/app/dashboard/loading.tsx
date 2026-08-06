import React from "react";

/**
 * كان لا يوجد `loading.tsx` في أي مسار — فكل تنقل يتجمّد على الصفحة القديمة
 * حتى تنتهي المصادقة + استعلام البروفايل، وهذا بالضبط الإحساس بأن الموقع
 * «تقيل» وأن المتصفح يظل يحمّل. هذا الملف يجعل Next يبثّ هيكلاً فوراً.
 */
export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-screen bg-background font-sans"
      dir="rtl"
      aria-busy="true"
      aria-live="polite">

      <span className="sr-only">جارٍ تحميل لوحتك…</span>

      <div className="hidden w-[248px] shrink-0 border-l border-white/[0.06] bg-[#070a14] lg:block" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-[58px] w-full border-b border-white/[0.08] bg-[#070a14]/90" />

        <div className="flex-1 space-y-6 p-8">
          <div className="h-[240px] w-full animate-pulse rounded-[28px] border border-white/[0.06] bg-[#0B0F1C]" />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) =>
            <div
              key={i}
              className="h-[132px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0B0F1C]" />
            )}
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 h-[265px] animate-pulse rounded-[18px] border border-white/[0.06] bg-[#0B0F1C] lg:col-span-8" />
            <div className="col-span-12 h-[265px] animate-pulse rounded-[18px] border border-white/[0.06] bg-[#0B0F1C] lg:col-span-4" />
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 h-[240px] animate-pulse rounded-[26px] border border-white/[0.06] bg-[#0B0F1C] lg:col-span-4" />
            <div className="col-span-12 h-[240px] animate-pulse rounded-[22px] border border-white/[0.06] bg-[#0B0F1C] lg:col-span-8" />
          </div>
        </div>
      </div>
    </div>);

}