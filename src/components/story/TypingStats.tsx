"use client";


import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartNoAxesColumnIcon,
  CheckIcon,
  GaugeIcon,
  SparklesIcon,
  TargetIcon,
  TriangleAlertIcon } from
"lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

function SaveBadge({ state }: {state: SaveState;}) {
  if (state === "idle") return null;

  const tone = state === "error" ? "text-amber-300/90" : "text-emerald-300/85";

  return (
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-1 text-[11px] font-semibold ${tone}`}>

      {state === "error" ?
      <TriangleAlertIcon className="h-3.5 w-3.5" /> :

      <CheckIcon className="h-3.5 w-3.5" />
      }
      {state === "saving" ?
      "جاري الحفظ" :
      state === "saved" ?
      "تم الحفظ" :
      "لم يُحفَظ — سنعيد المحاولة"}
    </motion.span>);

}

export interface TypingStatsProps {
  currentLineIndex: number;
  totalLines: number;
  percent: number;
  metrics: {wpm?: number;accuracy?: number;} | null;
  saveState: SaveState;
}

export function TypingStats({
  currentLineIndex,
  totalLines,
  percent,
  metrics,
  saveState
}: TypingStatsProps) {
  const current = totalLines > 0 ? Math.min(currentLineIndex + 1, totalLines) : 0;

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-white/10 bg-[#090e1b]/55 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-8">
      <div className="flex-1 text-left">
        <div className="flex items-center justify-start gap-2 text-[13px] font-bold text-white/80">
          <ChartNoAxesColumnIcon className="h-4 w-4 text-[#22d3ee]" />
          <span>تقدمك في هذه القصة</span>
          <AnimatePresence>
            <SaveBadge key={saveState} state={saveState} />
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="font-en text-2xl font-bold text-white">{percent}%</span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}>

            <motion.div
              className="h-full rounded-full"
              style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#a855f7)" }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }} />

          </div>
          <span className="whitespace-nowrap text-xs text-white/50">
            الجملة {current} من {totalLines}
          </span>
        </div>

        {/**
          * الشريط يتحرك **عند إكمال جملة فقط**: المعروض = المحفوظ في الداتابيز
          * = الجُمل المكتملة ÷ الإجمالي. لا نسبة تتحرك مع كل حرف.
          */}
        {metrics &&
        <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-white/45">
            <span className="flex items-center gap-1.5">
              <GaugeIcon className="h-3.5 w-3.5 text-white/35" />
              <span className="font-en">{metrics.wpm ?? 0}</span> كلمة/د
            </span>
            <span className="flex items-center gap-1.5">
              <TargetIcon className="h-3.5 w-3.5 text-white/35" />
              دقة <span className="font-en">{metrics.accuracy ?? 100}%</span>
            </span>
          </div>
        }
      </div>

      <span className="hidden h-16 w-px bg-white/10 sm:block" />

      <div className="flex items-center gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-300/20">
          <SparklesIcon className="h-4 w-4 text-amber-300" />
        </span>
        <div className="text-left">
          <p className="text-sm font-bold text-white">استمر! أنت تقوم بعمل رائع</p>
          <p className="mt-1 text-xs text-white/50">كل يوم تقرأ، عقلك يتطور أكثر.</p>
        </div>
      </div>
    </section>);

}

export default TypingStats;