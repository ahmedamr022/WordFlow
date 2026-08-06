import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

import { ProgressRing } from "@/components/ui/progress-ring";
import { IMAGES } from "@/lib/assets";
import type { DashboardContinueStory, DashboardToday } from "@/lib/dashboard/data";

/**
 * كارت البطل في الداشبورد — مطابق للمرجع البصري:
 *   نص على اليسار · حلقة تقدم في المنتصف · صورة المكتب/المصباح على اليمين
 *   تذوب في خلفية الكارت بتدرّج أفقي.
 *
 * التقدّم = نقاط اليوم ÷ الهدف اليومي من `user_preferences`، والزر يفتح القصة
 * التي توقّف عندها المستخدم فعلاً (لا /stories دائماً).
 *
 * تحسينات هذه النسخة:
 *  · الصورة الصحيحة (`/images/dashboardhero.jpg`) بدل `reading-desk.png`.
 *  · حلقة بمسار منقّط + توهج، وحجم أكبر، وتايبوغرافي أوضح.
 *  · هالة لونية خفيفة خلف الحلقة تربطها بالصورة.
 *  · شريط سفلي رفيع يعكس نفس النسبة — إشارة تقدم إضافية على الشاشات الضيقة.
 */

export interface DashboardHeroProps {
  nickname: string;
  today: DashboardToday;
  continueStory: DashboardContinueStory | null;
}

export function DashboardHero({ nickname, today, continueStory }: DashboardHeroProps) {
  const href = continueStory?.href ?? "/stories";
  const cta = continueStory ? "متابعة القصة" : "ابدأ أول قصة";
  const remaining = Math.max(0, today.goalXp - today.xpEarned);
  const done = today.percent >= 100;

  return (
    <section
      className="relative box-border h-[248px] w-full overflow-hidden rounded-[28px] border"
      style={{
        background: "#06090F",
        borderColor: "rgba(255,255,255,0.07)",
        boxShadow: "0 18px 45px rgba(0,0,0,.45)"
      }}
      aria-label="ملخص تقدم اليوم">
      
      {/* ══════════ صورة الخلفية (يمين) ══════════ */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block">
        <img
          src={IMAGES.dashboardHero}
          alt=""
          aria-hidden
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center" />
        
        <div
          className="absolute inset-0"
          style={{
            background:
            "linear-gradient(90deg,#06090F 0%,#06090F 12%,rgba(6,9,15,.86) 34%,rgba(6,9,15,.42) 62%,rgba(6,9,15,.10) 100%)"
          }} />
        
        <div
          className="absolute inset-x-0 bottom-0 h-[22%]"
          style={{ background: "linear-gradient(0deg,#06090F,transparent)" }} />
        
        <div
          className="absolute inset-x-0 top-0 h-[18%]"
          style={{ background: "linear-gradient(180deg,rgba(6,9,15,.85),transparent)" }} />
        
      </div>

      {/* ══════════ هالة خلف الحلقة ══════════ */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{
          background:
          "radial-gradient(circle, rgba(124,92,255,.28) 0%, rgba(34,211,238,.12) 45%, transparent 72%)"
        }} />
      

      {/* ══════════ النص + الزر ══════════ */}
      <div className="absolute right-auto left-[6%] top-1/2 z-30 w-[320px] -translate-y-1/2" dir="rtl">
        <p className="m-0 flex items-center gap-2 text-[13px] font-bold leading-none text-slate-300">
          <span>مرحباً {nickname}!</span>
          <span aria-hidden>👋</span>
        </p>

        <h1 className="m-0 mt-[16px] whitespace-nowrap text-[38px] font-black leading-[1.05] tracking-[-1px] text-white">
          أكمل <span className="text-[#F34F70]">رحلة</span> اليوم
        </h1>

        <p className="m-0 mt-[12px] flex items-center gap-[7px] whitespace-nowrap text-[13.5px] font-medium leading-none text-slate-400">
          <span className="text-[15px] leading-none" aria-hidden>
            ✨
          </span>
          <span>{done ? "أنجزت هدف اليوم — استمر!" : `باقي ${remaining} نقطة لهدف اليوم`}</span>
        </p>

        <Link
          href={href}
          dir="rtl"
          className="group relative mt-[20px] flex h-[48px] w-[248px] items-center justify-center overflow-hidden rounded-[14px] text-[13.5px] font-extrabold text-white transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090F]"
          style={{
            background: "linear-gradient(90deg,#09C8D2 0%,#238EDB 34%,#6651E8 66%,#F04469 100%)",
            border: "1px solid rgba(255,255,255,.14)",
            boxShadow:
            "0 10px 26px rgba(38,113,219,.26),0 4px 14px rgba(240,68,105,.18),inset 0 1px 0 rgba(255,255,255,.22)"
          }}>
          
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "rgba(255,255,255,.32)" }} />
          
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
          
          <span className="relative flex items-center justify-center gap-3">
            <span>{cta}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <ArrowLeft size={14} strokeWidth={2.6} aria-hidden />
            </span>
          </span>
        </Link>
      </div>

      {/* ══════════ حلقة التقدم ══════════ */}
      <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
        <ProgressRing
          value={today.percent}
          size={172}
          stroke={11}
          gradientId="heroRing"
          from="#22D3EE"
          mid="#7C5CFF"
          to="#F04469"
          dashedTrack
          glow
          trackColor="rgba(255,255,255,0.16)"
          ariaLabel="نسبة إنجاز هدف اليوم">
          
          <span className="text-[11.5px] font-semibold leading-none text-slate-400">
            تقدم اليوم
          </span>
          <span
            className="mt-[6px] text-[38px] font-black leading-none tracking-[-0.03em] text-white"
            dir="ltr">
            
            {today.percent}%
          </span>
          <span
            className="mt-[7px] flex items-center gap-1.5 text-[11px] font-semibold leading-none text-slate-400"
            dir="rtl">
            
            <Zap size={11} className="text-amber-400" fill="currentColor" aria-hidden />
            <span dir="ltr" className="font-en">
              {today.xpEarned} / {today.goalXp}
            </span>
            <span>نقطة خبرة</span>
          </span>
        </ProgressRing>
      </div>

      {/* ══════════ شريط تقدم سفلي رفيع ══════════ */}
      <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/[0.06]" aria-hidden>
        <div
          className="h-full transition-[width] duration-700"
          style={{
            width: `${Math.min(100, Math.max(0, today.percent))}%`,
            background: "linear-gradient(90deg,#22D3EE,#7C5CFF,#F04469)"
          }} />
        
      </div>
    </section>);

}

export default DashboardHero;