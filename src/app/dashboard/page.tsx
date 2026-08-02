"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Search,
  Flame,
  Bell,
  BookOpen,
  Zap,
  Star,
  Target,
  Play,
  ArrowLeft,
  RotateCcw,
  Clock,
  ChevronLeft,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────  shared palette  ───────────────────────── */
const C = {
  page: "#020305",
  card: "#0B0F1C",
  card2: "#0D1424",
  chip: "#0F1526",
  border: "rgba(255,255,255,0.06)",
  cyan: "#22E0C8",
  teal: "#00AFC2",
  pink: "#FF4D7A",
  gold: "#FBBF24",
  purple: "#7C6CFF",
  red: "#FF6B6B",
  text2: "#9FB0C6",
  text3: "#64748B",
};

/* CEFR level → badge palette (A2 emerald · B1 cyan · B2 violet) */
const LEVEL_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  A2: { text: "#6EE7B7", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.40)" },
  B1: { text: "#7DD3FC", bg: "rgba(34,211,238,0.15)", border: "rgba(34,211,238,0.40)" },
  B2: { text: "#C4B5FD", bg: "rgba(124,108,255,0.18)", border: "rgba(124,108,255,0.42)" },
};
const levelStyle = (lvl: string) => LEVEL_STYLES[lvl] ?? LEVEL_STYLES.B1;

/* ─────────────────────────────  types  ───────────────────────────── */
interface Stat {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  chart: "bars" | "line";
  data: number[];
  stroke: string;
}

interface MiniStory {
  id: string;
  title: string;
  titleAr: string;
  level: string;
  cover: string;
}

/* ───────────────────────  circular progress ring  ─────────────────── */
function ProgressRing({
  value,
  size = 200,
  stroke = 14,
  gradientId,
  from,
  mid,
  to,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  gradientId: string;
  from: string;
  mid?: string;
  to: string;
  children: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            {mid && <stop offset="50%" stopColor={mid} />}
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────  tiny sparkline (bars / line)  ─────────────── */
function Sparkline({
  type,
  data,
  color,
}: {
  type: "bars" | "line";
  data: number[];
  color: string;
}) {
  const w = 96;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  if (type === "bars") {
    const gap = 3;
    const bw = (w - gap * (data.length - 1)) / data.length;
    return (
      <svg width={w} height={h} className="overflow-visible">
        {data.map((d, i) => {
          const bh = 6 + (d / max) * (h - 6);
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={h - bh}
              width={bw}
              height={bh}
              rx={2}
              fill={color}
              opacity={i === data.length - 1 ? 1 : 0.55}
            />
          );
        })}
      </svg>
    );
  }

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ──────────────────────────────  page  ───────────────────────────── */
export default function DashboardPage() {
  const stats: Stat[] = [
    {
      label: "سلسلة التعلم",
      value: "12",
      sub: "يوم متتالي",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      chart: "bars",
      data: [4, 6, 5, 8, 6, 9, 7, 10, 8, 12],
      stroke: "#fb923c",
    },
    {
      label: "إجمالي النقاط",
      value: "3,420",
      sub: "نقطة",
      icon: Star,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      chart: "line",
      data: [3, 5, 4, 7, 5, 8, 6, 9, 7, 10],
      stroke: "#fbbf24",
    },
    {
      label: "القصص المكتملة",
      value: "18",
      sub: "قصة",
      icon: BookOpen,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      chart: "bars",
      data: [5, 4, 7, 6, 8, 7, 9, 8, 10, 9],
      stroke: "#22d3ee",
    },
    {
      label: "دقة الأداء",
      value: "96%",
      sub: "متوسط الدقة",
      icon: Target,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      chart: "line",
      data: [6, 5, 7, 6, 8, 7, 6, 8, 7, 9],
      stroke: "#e879f9",
    },
  ];

  const featured = {
    id: "titanic-legend",
    title: "The Legend of Titanic",
    titleAr: "أسطورة السفينة التايتانيك",
    level: "B1",
    duration: "5 دقيقة",
    progress: 65,
    cover: "/images/titanic.png",
  };

  const stories: MiniStory[] = [
    { id: "sherlock", title: "Sherlock Holmes", titleAr: "مغامرات هولمز", level: "B2", cover: "/images/sherlock.png" },
    { id: "gatsby", title: "The Great Gatsby", titleAr: "غاتسبي العظيم", level: "B1", cover: "/images/gatsby.png" },
    { id: "pride", title: "Pride & Prejudice", titleAr: "كبرياء وتحامل", level: "B1", cover: "/images/pride.png" },
    { id: "romeo", title: "Romeo & Juliet", titleAr: "روميو وجولييت", level: "A2", cover: "/images/romeo.png" },
  ];

  return (
    // Root shell flows LEFT → RIGHT: [ sidebar ] [ content ].
    <div className="min-h-screen text-white flex select-none font-sans" style={{ background: C.page }} dir="ltr">
      <AppSidebar active="الرئيسية" />

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER — search left, user cluster right */}
        <header
          className="h-[76px] px-8 border-b flex items-center justify-between sticky top-0 z-40"
          style={{ background: "rgba(7,10,18,0.85)", borderColor: C.border, backdropFilter: "blur(12px)" }}
          dir="ltr"
        >
          <div className="relative w-[520px] max-w-[45vw]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-400 font-mono">
              <span className="text-sm leading-none">⌘</span>K
            </kbd>
            <input
              type="text"
              dir="rtl"
              placeholder="ابحث في القصص، المفردات..."
              className="w-full pl-11 pr-14 py-3 rounded-2xl bg-[#0D1220] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1424] border border-white/[0.06] text-slate-200 text-[13px] font-bold" dir="rtl">
              <Flame size={16} className="text-orange-400" fill="currentColor" />
              <span>12 يوم متتالي</span>
            </div>

            <button className="relative text-slate-300 hover:text-white transition" aria-label="الإشعارات">
              <Bell size={20} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-bold text-white leading-none">warm_dusk1679</p>
                <p className="text-[11px] text-slate-400 mt-1" dir="rtl">
                  مستوى <span dir="ltr">B1</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm text-[#05070e]">
                W
              </div>
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 p-8 overflow-y-auto space-y-6" dir="rtl">
          {/* ═══ HERO ═══ */}
  <section
  className="relative overflow-hidden rounded-[28px] border"
  style={{
    background: "#06090F",
    borderColor: C.border,
    minHeight: "240px",
    boxShadow: "0 18px 45px rgba(0,0,0,.35)",
  }}
>
  {/* Right Image */}
  <div className="pointer-events-none absolute inset-y-0 right-0 w-[31%] hidden lg:block">
    <img
      src="/images/reading-desk.png"
      alt="مكتب القراءة"
      className="w-full h-full object-cover"
    />

    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg,#06090F 0%,#06090F 42%,rgba(6,9,15,.72) 68%,transparent 100%)",
      }}
    />
  </div>

  <div
    className="relative flex items-center h-[240px] px-10"
    dir="ltr"
  >
    {/* Left Text */}

    <div
      dir="rtl"
      className="w-[340px] shrink-0 space-y-4 z-10"
    >
      <p className="text-[13px] font-bold text-slate-300">
        مرحباً بك مجدداً 👋
      </p>

      <h1 className="text-[36px] font-black leading-[1.12] text-white">
        أكمل{" "}
        <span className="bg-gradient-to-l from-cyan-400 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          رحلة
        </span>{" "}
        اليوم
      </h1>

      <p className="text-[14px] text-slate-400">
        كل يوم تقربك من هدفك ✨
      </p>

      <Link
        href="/stories"
        className="inline-flex items-center gap-2.5 px-6 h-[46px] rounded-xl font-bold text-[13px] text-white transition hover:brightness-110"
        style={{
          background:
            "linear-gradient(90deg,#2563EB,#7C3AED,#D946EF)",
          boxShadow:
            "0 12px 28px rgba(124,58,237,.30)",
        }}
      >
        <span>متابعة القصة</span>
        <ArrowLeft size={16} />
      </Link>
    </div>

    {/* Push Ring To Center */}

    <div className="flex-1" />

    {/* Progress */}

    <div className="mx-10 shrink-0 z-10">
      <ProgressRing
        value={73}
        size={150}
        gradientId="heroRing"
        from="#8B5CF6"
        mid="#EC4899"
        to="#22D3EE"
      >
        <span className="text-[12px] text-slate-400">
          تقدم اليوم
        </span>

        <span className="text-[34px] font-black text-white">
          73%
        </span>

        <span
          className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"
          dir="rtl"
        >
          <Zap
            size={12}
            className="text-amber-400"
            fill="currentColor"
          />
          120 نقطة خبرة
        </span>
      </ProgressRing>
    </div>

    {/* Space Before Image */}

    <div className="flex-1" />
  </div>
</section>

          {/* ═══ STAT CARDS ═══ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="group relative p-5 rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(180deg, ${s.stroke}0A 0%, ${C.card} 55%)`,
                    borderColor: C.border,
                  }}
                >
                  {/* top accent line */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] opacity-70"
                    style={{ background: `linear-gradient(90deg, transparent, ${s.stroke}, transparent)` }}
                  />
                  {/* soft corner glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-8 -right-6 w-24 h-24 rounded-full blur-2xl opacity-25 transition-opacity duration-300 group-hover:opacity-40"
                    style={{ background: s.stroke }}
                  />
                  <div className="relative flex items-center gap-2.5 mb-4">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color} ring-1 ring-inset ring-white/10`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="text-[13px] font-bold text-slate-300">{s.label}</span>
                  </div>
                  <div className="relative flex items-end justify-between gap-2">
                    <div>
                      <span className="text-3xl font-black text-white" dir="ltr">{s.value}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{s.sub}</span>
                    </div>
                    <Sparkline type={s.chart} data={s.data} color={s.stroke} />
                  </div>
                </div>
              );
            })}
          </section>

          {/* ═══ STORY OF THE DAY + WORD REVIEW ═══ */}
          <section className="grid grid-cols-12 gap-5" dir="ltr">
            {/* STORY OF TODAY */}
            <div
              className="col-span-12 lg:col-span-7 relative h-[265px] overflow-hidden rounded-[18px] group border"
              style={{ background: "#07111B", borderColor: C.border, boxShadow: "0 18px 45px rgba(0,0,0,.35)" }}
            >
              <img
                src={featured.cover || "/placeholder.svg"}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(2,8,15,.04) 0%, rgba(2,8,15,.10) 48%, rgba(2,8,15,.38) 100%), linear-gradient(0deg, rgba(2,8,15,.97) 0%, rgba(2,8,15,.63) 34%, rgba(2,8,15,.10) 72%, rgba(2,8,15,.18) 100%)",
                }}
              />
              <div className="relative z-10 h-full flex flex-col px-5 py-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-[18px] font-black leading-none text-white">قصة اليوم</h3>
                  <div
                    className="h-[29px] px-3 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "rgba(0,150,175,.11)", border: "1px solid rgba(0,160,180,.52)", color: "#22E0C8" }}
                  >
                    قصة تفاعلية
                  </div>
                </div>
                <div className="flex-1" />
                <div className="w-full flex flex-col items-start" dir="ltr">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-[11px] h-[11px] shrink-0 rounded-full"
                      style={{ background: "#F0445C", boxShadow: "0 0 8px rgba(240,68,92,.65)" }}
                    />
                    <h2 className="text-[20px] font-black leading-none text-white">{featured.title}</h2>
                  </div>
                  <div className="mt-2 ml-[19px] text-[13px] font-medium text-left" dir="rtl" style={{ color: "#D1DCE7" }}>
                    {featured.titleAr}
                  </div>
                  <div className="mt-4 w-full flex items-center gap-4" dir="ltr">
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-white">مستوى {featured.level}</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <Clock className="w-[15px] h-[15px]" strokeWidth={2} style={{ color: "#AFC0D2" }} />
                      <span className="text-[12px] font-medium" style={{ color: "#D1DCE7" }}>
                        {featured.duration}
                      </span>
                    </div>
                    <div className="flex flex-1 min-w-[80px] items-center gap-3">
                      <div className="relative flex-1 h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(13,29,45,.95)" }}>
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                          style={{ width: `${featured.progress}%`, background: C.teal, boxShadow: "0 0 8px rgba(0,175,194,.42)" }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] font-bold" style={{ color: "#D5E0EA" }}>
                        {featured.progress}%
                      </span>
                    </div>
                    <Link
                      href="/stories"
                      className="h-[39px] min-w-[102px] px-5 shrink-0 rounded-[14px] flex items-center justify-center gap-2 text-[13px] font-black transition-all duration-200 hover:brightness-110 hover:scale-[1.015]"
                      style={{
                        background: "linear-gradient(135deg,#00C6DC 0%,#008FA5 100%)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(0,190,210,.38)",
                        boxShadow: "0 7px 20px rgba(0,140,165,.25)",
                      }}
                    >
                      <span>متابعة</span>
                      <Play className="w-[15px] h-[15px]" fill="currentColor" strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* VOCABULARY REVIEW */}
            <div
              className="col-span-12 lg:col-span-5 relative h-[265px] overflow-hidden rounded-[18px] border"
              style={{ background: C.card2, borderColor: C.border, boxShadow: "0 18px 45px rgba(0,0,0,.32)" }}
            >
              <div className="relative z-10 h-full px-5 py-4" dir="ltr">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" dir="ltr">
                    <h3 className="text-[17px] font-black leading-none text-white" dir="rtl">
                      مراجعة الكلمات
                    </h3>
                    <RotateCcw className="w-[17px] h-[17px]" strokeWidth={2} style={{ color: C.purple }} />
                  </div>
                  <div
                    className="h-[29px] px-4 rounded-full flex items-center justify-center text-[11px] font-bold"
                    dir="rtl"
                    style={{ background: `${C.purple}1F`, border: `1px solid ${C.purple}45`, color: "#FFFFFF" }}
                  >
                    اليوم
                  </div>
                </div>

                <div className="absolute left-5 right-5 top-[67px] bottom-[15px] flex items-center gap-4" dir="ltr">
                  {/* CIRCLE + BUTTON */}
                  <div className="w-[145px] shrink-0 h-full flex flex-col items-center justify-center">
                    <div className="relative w-[126px] h-[126px] shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#172230" strokeWidth="7" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={C.teal}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * 0.05}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[27px] font-black leading-none text-white">95%</span>
                        <span className="mt-[5px] text-[10px] font-bold" style={{ color: "#9AAABD", letterSpacing: "2px" }}>
                          FSRS
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/vocabulary"
                      className="mt-[13px] h-[37px] w-[145px] rounded-full flex items-center justify-center gap-1.5 text-[11px] font-black transition-all duration-200 hover:brightness-110"
                      dir="rtl"
                      style={{
                        background: "linear-gradient(135deg,#7C6CFF 0%,#6C5CFF 100%)",
                        color: "#FFFFFF",
                        boxShadow: "0 7px 20px rgba(108,92,255,.28)",
                      }}
                    >
                      <Zap size={13} fill="currentColor" />
                      <span>ابدأ المراجعة</span>
                    </Link>
                  </div>

                  {/* STATS LIST */}
                  <div className="flex-1 h-full flex flex-col justify-center gap-3.5" dir="rtl">
                    {[
                      { label: "كلمة جديدة", value: "24", color: C.cyan },
                      { label: "للمراجعة", value: "18", color: C.gold },
                      { label: "إجمالي الكلمات", value: "1,432", color: C.purple },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[12px]" style={{ color: C.text2 }}>{row.label}</span>
                        <span className="text-[19px] font-black text-white" dir="ltr">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ WEEKLY CHALLENGE (right) + ALL STORIES (left) ═══ */}
          <section className="grid grid-cols-12 gap-5 items-stretch" dir="rtl">
            {/* WEEKLY CHALLENGE — renders on the RIGHT in RTL */}
            <div
              className="col-span-12 lg:col-span-4 relative overflow-hidden rounded-[22px] border min-h-[194px] px-5 py-4"
              style={{ background: "#090F18", borderColor: C.border, boxShadow: "0 18px 45px rgba(0,0,0,.32)" }}
            >
              <div className="relative w-full h-full" style={{ direction: "ltr" }}>
                {/* TEXT / STATS — left column */}
                <div className="absolute top-1/2 left-[6px] -translate-y-1/2 z-20 w-[160px] flex flex-col items-center">
                  <h3
                    className="w-full text-[19px] font-extrabold leading-[1.15] text-white whitespace-nowrap text-center"
                    style={{ direction: "rtl", fontWeight: 800, letterSpacing: "-.4px", textShadow: "0 1px 12px rgba(0,0,0,.3)" }}
                  >
                    التحدي الأسبوعي
                  </h3>

                  <p
                    className="w-full mt-[7px] text-[10.5px] font-medium whitespace-nowrap text-center"
                    style={{ direction: "rtl", color: "#8B97A8", lineHeight: "1.5", letterSpacing: ".1px" }}
                  >
                    أكمل 5 قصص هذا الأسبوع
                  </p>

                  {/* 3 / 5 */}
                  <div className="mt-[12px] flex items-baseline justify-center gap-[5px] w-full" style={{ direction: "ltr" }}>
                    <span className="text-[30px] font-black leading-none tracking-[-1.2px] text-white">3</span>
                    <span className="text-[13px] font-bold leading-none" style={{ color: "#5F6B7A", letterSpacing: "-.2px" }}>/ 5</span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div
                    className="relative mt-[10px] w-[118px] h-[5px] rounded-full overflow-hidden"
                    style={{ background: "#141F2C", boxShadow: "inset 0 1px 2px rgba(0,0,0,.5)" }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ width: "60%", background: "linear-gradient(90deg,#00AFC2,#00D8C7)", boxShadow: "0 0 8px rgba(0,210,205,.35)" }}
                    />
                  </div>

                  {/* XP */}
                  <div
                    className="mt-[13px] flex items-center justify-center gap-[5px] rounded-full px-[10px] py-[4px]"
                    style={{ direction: "ltr", background: "rgba(245,180,50,.1)", border: "1px solid rgba(245,180,50,.16)" }}
                  >
                    <Star className="w-[13px] h-[13px] shrink-0" strokeWidth={2} style={{ color: C.gold, fill: C.gold }} />
                    <span className="text-[12px] font-extrabold leading-none whitespace-nowrap tracking-[.2px]" style={{ color: C.gold }}>
                      +250 XP
                    </span>
                  </div>
                </div>

                {/* TROPHY */}
                <div className="absolute inset-y-0 right-0 w-[58%] flex items-center justify-center pointer-events-none z-10">
                  <img
                    src="/images/trophy.png"
                    alt="كأس التحدي الأسبوعي"
                    className="w-[180px] h-[180px] object-contain transition-transform duration-500 hover:scale-105"
                    style={{
                      filter:
                        "drop-shadow(0 8px 18px rgba(0,0,0,.65)) drop-shadow(0 0 30px rgba(255,180,60,.18))",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ALL STORIES — renders on the LEFT in RTL */}
            <div
              className="col-span-12 lg:col-span-8 rounded-[22px] border p-6 flex flex-col"
              style={{
                background: "linear-gradient(180deg,#0C1422 0%,#09111D 100%)",
                borderColor: C.border,
                boxShadow: "0 18px 45px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.025)",
              }}
            >
              {/* HEADER */}
              <div className="flex items-center justify-start gap-2 mb-4" style={{ direction: "ltr" }}>
                <h3 className="text-[20px] font-black leading-none text-white tracking-[-.3px]" style={{ direction: "rtl", textAlign: "left" }}>
                  كافة القصص
                </h3>
                <BookOpen className="w-[21px] h-[21px] shrink-0 text-cyan-400" strokeWidth={1.8} />
              </div>

              {/* STORIES ROW */}
              <div className="flex items-stretch gap-3 w-full flex-1" style={{ direction: "ltr", perspective: "1000px" }}>
                {stories.map((s) => (
                  <Link
                    key={s.id}
                    href="/stories"
                    className="group relative flex-1 min-w-0 h-[176px] overflow-hidden rounded-[15px] transition-all duration-300 ease-out hover:-translate-y-[5px]"
                    style={{
                      transformStyle: "preserve-3d",
                      willChange: "transform",
                      border: "1px solid rgba(0,242,210,.34)",
                      boxShadow:
                        "0 5px 0 rgba(0,0,0,.28), 0 12px 22px rgba(0,0,0,.42), 0 22px 38px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.35)",
                    }}
                  >
                    {/* COVER */}
                    <img
                      src={s.cover || "/placeholder.svg"}
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover object-[center_22%] transition-all duration-500 ease-out group-hover:scale-[1.075]"
                      style={{ transformOrigin: "center center" }}
                    />
                    {/* REFLECTION */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-70"
                      style={{ background: "linear-gradient(135deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.025) 20%,transparent 45%)" }}
                    />
                    {/* DARK GRADIENT */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(180deg,rgba(0,0,0,.02) 0%,rgba(0,0,0,.04) 30%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.94) 100%)" }}
                    />
                    {/* TOP GLASS HIGHLIGHT */}
                    <div
                      className="absolute left-[1px] right-[1px] top-[1px] h-[38%] rounded-t-[14px] pointer-events-none opacity-60"
                      style={{ background: "linear-gradient(180deg,rgba(255,255,255,.10),transparent)" }}
                    />
                    {/* INNER EDGE */}
                    <div
                      className="absolute inset-0 rounded-[15px] pointer-events-none"
                      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.035), inset 0 -35px 45px rgba(0,0,0,.20)" }}
                    />
                    {/* HOVER EDGE */}
                    <div
                      className="absolute inset-0 rounded-[15px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "inset 0 0 0 1px rgba(0,242,210,.38), 0 0 18px rgba(0,242,210,.10)" }}
                    />
                    {/* TEXT */}
                    <div className="absolute left-0 right-0 bottom-0 z-10 px-3 pb-2.5" style={{ direction: "ltr", textAlign: "left" }}>
                      <h4 className="text-[12px] font-black leading-tight truncate" style={{ color: "#F3C85B", textShadow: "0 2px 7px rgba(0,0,0,.9)" }}>
                        {s.title}
                      </h4>
                      <p className="mt-[3px] text-[10px] font-semibold text-white truncate" style={{ direction: "rtl", textAlign: "left", textShadow: "0 2px 7px rgba(0,0,0,.9)" }}>
                        {s.titleAr}
                      </p>
                      <span
                        className="inline-flex items-center justify-center mt-[6px] h-[18px] min-w-[26px] px-1.5 rounded-[5px] text-[9px] font-black"
                        style={{ color: C.cyan, background: "rgba(0,242,210,.10)", border: "1px solid rgba(0,242,210,.55)", boxShadow: "0 0 8px rgba(0,242,210,.12)" }}
                      >
                        {s.level}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* MORE — 3D CARD */}
                <Link
                  href="/stories"
                  className="group relative w-[84px] shrink-0 h-[176px] flex flex-col items-center justify-center rounded-[15px] overflow-hidden transition-all duration-300 ease-out hover:-translate-y-[5px]"
                  style={{
                    background: "linear-gradient(145deg,#182638 0%,#111C2B 48%,#0C1522 100%)",
                    border: "1px solid rgba(255,255,255,.10)",
                    boxShadow:
                      "0 5px 0 rgba(0,0,0,.30), 0 12px 24px rgba(0,0,0,.44), 0 22px 38px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.09), inset 0 -1px 0 rgba(0,0,0,.35)",
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                  }}
                >
                  {/* TOP REFLECTION */}
                  <div className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none opacity-50" style={{ background: "linear-gradient(180deg,rgba(255,255,255,.08),transparent)" }} />
                  {/* CYAN AMBIENT GLOW */}
                  <div className="absolute inset-[1px] rounded-[14px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "inset 0 0 22px rgba(0,242,210,.08)" }} />
                  {/* +12 */}
                  <span className="relative z-10 text-[22px] font-black leading-none text-white transition-all duration-300 group-hover:text-[#00F2D2] group-hover:scale-[1.05]" style={{ textShadow: "0 3px 12px rgba(0,0,0,.55)" }}>
                    +12
                  </span>
                  {/* MORE */}
                  <span className="relative z-10 mt-2 text-[10px] font-semibold transition-colors duration-300" style={{ color: C.text3 }} dir="rtl">
                    المزيد
                  </span>
                  {/* BOTTOM ACCENT */}
                  <div
                    className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[22px] h-[2px] rounded-full opacity-40 transition-all duration-300 group-hover:w-[32px] group-hover:opacity-100"
                    style={{ background: C.cyan, boxShadow: "0 0 8px rgba(0,242,210,.45)" }}
                  />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
