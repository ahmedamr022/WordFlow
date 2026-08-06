"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { CheckIcon, FlameIcon, LayoutGridIcon, XIcon, ZapIcon } from "lucide-react";

import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/vocabulary/ui";

/**
 * اللوحة الجانبية لشاشات المفردات.
 *
 * ثلاث بطاقات فقط، كل واحدة تجيب سؤالاً مختلفاً — بلا تكرار لما هو موجود
 * في الشبكة نفسها:
 *   · أين أنا الآن؟   (حلقة التقدّم + المستوى)
 *   · مما تتكوّن مكتبتي؟ (توزيع المستويات)
 *   · هل أنا منتظم؟   (سلسلة الأيام)
 * ثم دعوة فعل واحدة واضحة أسفلها.
 */

export interface LevelSlice {
  level: string;
  count: number;
  pct: number;
  color: string;
}

/* ───────────────────────────── عناصر مشتركة ───────────────────────────── */

function Card({
  title,
  children,
  action




}: {title: string;children: React.ReactNode;action?: React.ReactNode;}) {
  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-white/[0.07] bg-[#070C15] p-4">

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13.5px] font-black text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>);

}

function Ring({
  percent,
  label,
  sub,
  color = "#22D3EE",
  size = 132






}: {percent: number;label: string;sub?: string;color?: string;size?: number;}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}>

      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.07)"
          strokeWidth="8"
          strokeDasharray="2 6"
          strokeLinecap="round" />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)",
            filter: `drop-shadow(0 0 6px ${color}80)`
          }} />

      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="font-en text-[26px] font-black leading-none text-white">{label}</span>
        {sub && <span className="mt-1 text-[11px] font-bold text-slate-400">{sub}</span>}
      </div>
    </div>);

}

function Donut({ slices, total }: {slices: LevelSlice[];total: number;}) {
  const arcs = useMemo(() => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return slices.map((slice) => {
      const length = circumference * (slice.pct / 100);
      const arc = {
        ...slice,
        dash: `${length} ${circumference - length}`,
        offset: -offset
      };
      offset += length;
      return arc;
    });
  }, [slices]);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[112px] w-[112px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="11" />
          {arcs.map((arc) =>
          <circle
            key={arc.level}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={arc.color}
            strokeWidth="11"
            strokeDasharray={arc.dash}
            strokeDashoffset={arc.offset} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-en text-[17px] font-black text-white">
            {total.toLocaleString("en-US")}
          </span>
          <span className="text-[10.5px] font-bold text-slate-500">كلمة</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {slices.map((slice) =>
        <li key={slice.level} className="flex items-center justify-between gap-2 text-[12px]">
            <span className="flex items-center gap-2">
              <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }} />

              <span className="font-en font-bold text-white">{slice.level}</span>
              <span className="text-slate-500">{LEVEL_LABELS[slice.level] ?? ""}</span>
            </span>
            <span className="font-en font-bold text-slate-400">{slice.pct}%</span>
          </li>
        )}
      </ul>
    </div>);

}

function StreakCard({ streak }: {streak: number;}) {
  const days = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
  const activeDays = Math.max(0, Math.min(7, streak));

  return (
    <Card title="سلسلة التعلم">
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10">

          <FlameIcon size={20} className="text-amber-400" />
        </span>
        <div>
          <div className="font-en text-[22px] font-black leading-none text-white">{streak}</div>
          <div className="mt-1 text-[11.5px] font-bold text-slate-400">يوم متتالي</div>
        </div>
      </div>

      <ul className="flex items-center justify-between gap-1.5">
        {days.map((day, index) => {
          const done = index < activeDays;
          return (
            <li key={day} className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                done ?
                "border-emerald-400/40 bg-emerald-500/15 text-emerald-300" :
                "border-white/[0.08] bg-white/[0.02] text-slate-600"}`
                }>

                {done ? <CheckIcon size={13} /> : <XIcon size={12} />}
              </span>
              <span className="text-[10px] font-bold text-slate-500">{day}</span>
            </li>);

        })}
      </ul>
    </Card>);

}

/* ─────────────────────── لوحة شاشة المفردات العامة ─────────────────────── */

export interface VocabRightPanelProps {
  level: string;
  xpTotal: number;
  xpGoal: number;
  streak: number;
  learnedCount: number;
  totalWords: number;
  levelSlices: LevelSlice[];
  dueCount: number;
}

export function VocabRightPanel({
  level,
  xpTotal,
  xpGoal,
  streak,
  learnedCount,
  totalWords,
  levelSlices,
  dueCount
}: VocabRightPanelProps) {
  const percent = totalWords > 0 ? Math.round(learnedCount / totalWords * 100) : 0;
  const xpPercent = Math.min(100, Math.round(xpTotal / Math.max(1, xpGoal) * 100));
  const levelColor = LEVEL_COLORS[level] ?? LEVEL_COLORS.B1;

  return (
    <div className="flex flex-col gap-4">
      <Card title="تقدم المفردات">
        <Ring
          percent={percent}
          label={level}
          sub={LEVEL_LABELS[level] ?? "متوسط"}
          color={levelColor} />


        <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-bold text-slate-300">
          <ZapIcon size={13} className="text-amber-400" aria-hidden />
          <span className="font-en">
            {xpTotal.toLocaleString("en-US")} / {xpGoal.toLocaleString("en-US")} XP
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <span
            className="block h-full rounded-full bg-gradient-to-l from-cyan-400 to-violet-500 transition-[width] duration-700"
            style={{ width: `${xpPercent}%` }} />

        </div>

        <p className="mt-2.5 text-[11.5px] font-bold text-slate-500">
          أتقنت <span className="font-en text-white">{learnedCount}</span> من{" "}
          <span className="font-en">{totalWords.toLocaleString("en-US")}</span> كلمة
        </p>
      </Card>

      <Card title="توزيع المستويات">
        <Donut slices={levelSlices} total={totalWords} />
      </Card>

      <StreakCard streak={streak} />

      <Link
        href={dueCount > 0 ? "/vocabulary/test?mode=review" : "/vocabulary/test"}
        className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-cyan-500 via-violet-500 to-fuchsia-500 py-3.5 text-[14px] font-black text-white shadow-[0_18px_40px_-18px_rgba(139,92,246,0.9)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

        <LayoutGridIcon size={17} aria-hidden />
        {dueCount > 0 ? `ابدأ مراجعة (${dueCount})` : "اختبار شامل"}
      </Link>

      <p className="text-center text-[11.5px] font-medium leading-relaxed text-slate-500" dir="rtl">
        {dueCount > 0 ?
        "كلمات حان وقت مراجعتها اليوم — لا تفوّتها." :
        "اختبر كل ما تعلمته من 50 كلمة متنوعة."}
      </p>
    </div>);

}

/* ────────────────────────── لوحة شاشة فئة واحدة ────────────────────────── */

export interface CategoryRightPanelProps {
  categoryTitle: string;
  accent: string;
  learnedCount: number;
  totalWords: number;
  levelSlices: LevelSlice[];
  streak: number;
  level: string;
  weeklyGain: number;
  testHref: string;
}

export function CategoryRightPanel({
  categoryTitle,
  accent,
  learnedCount,
  totalWords,
  levelSlices,
  streak,
  level,
  weeklyGain,
  testHref
}: CategoryRightPanelProps) {
  const percent = totalWords > 0 ? Math.round(learnedCount / totalWords * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <Card title="تقدم الفئة">
        <Ring percent={percent} label={`${percent}%`} sub="متقن" color={accent} />

        <p className="mt-4 text-center text-[12px] font-bold text-slate-300">
          متقن <span className="font-en text-white">{learnedCount}</span> /{" "}
          <span className="font-en">{totalWords}</span>
        </p>

        <div className="mt-4 flex items-center justify-between text-[11.5px] font-bold text-slate-400">
          <span>مستواك الحالي</span>
          <span
            className="font-en rounded-lg border px-2 py-0.5 font-black"
            style={{
              color: LEVEL_COLORS[level] ?? accent,
              backgroundColor: `${LEVEL_COLORS[level] ?? accent}18`,
              borderColor: `${LEVEL_COLORS[level] ?? accent}40`
            }}>

            {level}
          </span>
        </div>

        {weeklyGain > 0 &&
        <p className="mt-3 text-[11.5px] font-bold" style={{ color: accent }}>
            +<span className="font-en">{weeklyGain}</span> كلمة هذا الأسبوع
          </p>
        }
      </Card>

      <Card title="توزيع المستويات">
        <Donut slices={levelSlices} total={totalWords} />
      </Card>

      <StreakCard streak={streak} />

      <Link
        href={testHref}
        className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-cyan-500 via-violet-500 to-fuchsia-500 py-3.5 text-[14px] font-black text-white shadow-[0_18px_40px_-18px_rgba(139,92,246,0.9)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

        <ZapIcon size={17} aria-hidden />
        ابدأ جلسة تعلم
      </Link>

      <p className="text-center text-[11.5px] font-medium leading-relaxed text-slate-500" dir="rtl">
        جلسة مخصصة لفئة {categoryTitle} · 10 كلمات
      </p>
    </div>);

}

export default VocabRightPanel;