"use client";

import React from "react";
import { Flame, Star, BookOpen, Target, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";

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

const STATS_DATA: Stat[] = [
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

export function StatCards() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS_DATA.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="group relative p-5 rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{
              background: `linear-gradient(180deg, ${s.stroke}0A 0%, #0B0F1C 55%)`,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] opacity-70"
              style={{
                background: `linear-gradient(90deg, transparent, ${s.stroke}, transparent)`,
              }}
            />
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
              <span className="text-[13px] font-bold text-slate-300">
                {s.label}
              </span>
            </div>
            <div className="relative flex items-end justify-between gap-2">
              <div>
                <span className="text-3xl font-black text-white" dir="ltr">
                  {s.value}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  {s.sub}
                </span>
              </div>
              <Sparkline type={s.chart} data={s.data} color={s.stroke} />
            </div>
          </div>
        );
      })}
    </section>
  );
}