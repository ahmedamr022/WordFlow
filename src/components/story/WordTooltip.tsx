"use client";


import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2Icon } from "lucide-react";

import { AudioService } from "@/lib/audio/audioService";

/**
 * كارت الكلمة (المعنى + النطق).
 *
 * ── إصلاح: الكارت كان يخرج من الشاشة ────────────────────────────────────────
 * قبل كذا كان التمركز بـ CSS ثابت: `left-1/2 -translate-x-1/2`. لأن الكارت
 * بعرض 15rem، أي كلمة قريبة من حرف الشاشة كان نصف الكارت يُقطع خارجها (والنص
 * هنا يبدأ من اليسار فالمشكلة تظهر دائماً في أول كل سطر).
 *
 * الحل: `TooltipAnchor` يقيس الكارت بعد الرندر ويزيحه أفقياً بالقدر المطلوب
 * فقط ليبقى داخل الشاشة بهامش 14px، ويقلبه تحت الكلمة لو لم تكن هناك مساحة
 * فوقها. القياس يحدث مرة واحدة لكل ظهور (useLayoutEffect قبل الرسم) فلا يوجد
 * أي «قفزة» مرئية.
 */

const MARGIN = 14;

export function TooltipAnchor({ children }: {children: React.ReactNode;}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shiftX, setShiftX] = useState(0);
  const [below, setBelow] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // نقيس من الوضع المحيّد حتى لا تتراكم الإزاحات عند كل قياس.
    el.style.transform = "translateX(-50%)";
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    let dx = 0;
    if (rect.left < MARGIN) dx = MARGIN - rect.left;else
    if (rect.right > viewportWidth - MARGIN) dx = viewportWidth - MARGIN - rect.right;

    setShiftX(dx);
    setBelow(rect.top < MARGIN);
    el.style.transform = "";
  }, [children]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute left-1/2 z-40 ${
      below ? "top-[calc(100%+0.9rem)]" : "bottom-[calc(100%+1rem)]"}`
      }
      style={{ transform: `translateX(calc(-50% + ${shiftX}px))` }}>

      {children}
    </div>);

}

export interface TooltipWord {
  ipa?: string;
  partOfSpeech?: string;
  translationAr?: string;
}

export function WordTooltip({ text, word }: {text: string;word?: TooltipWord;}) {
  const clean = text.replace(/[.,!?;:]$/, "");
  const suffixes = ["ing", "ed", "ly", "es", "s"];
  const suffix = suffixes.find((s) => clean.length > s.length + 2 && clean.endsWith(s)) || "";
  const stem = suffix ? clean.slice(0, clean.length - suffix.length) : clean;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      role="tooltip"
      className="pointer-events-auto w-[min(15rem,calc(100vw-2rem))] rounded-2xl border border-sky-400/25 bg-[#0a1020]/95 p-4 text-left shadow-[0_20px_60px_-18px_rgba(2,8,23,0.95)] backdrop-blur-xl">

      <div className="flex items-start justify-between gap-3">
        <div dir="ltr" className="text-left">
          <p className="font-en text-lg font-bold text-white">
            {stem}
            {suffix && <span className="text-emerald-300">{suffix}</span>}
          </p>
          {word?.ipa && <p className="font-en mt-0.5 text-[11px] text-white/40">{word.ipa}</p>}
        </div>

        <button
          type="button"
          aria-label={`استمع لكلمة ${clean}`}
          onClick={(event) => {
            event.stopPropagation();
            AudioService.playWord(clean);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-sky-300 ring-1 ring-sky-400/30 hover:bg-indigo-500/40">

          <Volume2Icon className="h-4 w-4" />
        </button>
      </div>

      {word?.partOfSpeech &&
      <div className="mt-3 flex justify-start">
          <span className="rounded-full bg-violet-500/25 px-3 py-1 text-[11px] font-bold text-violet-100 ring-1 ring-violet-400/30">
            <span className="font-en capitalize">{word.partOfSpeech}</span>
          </span>
        </div>
      }

      <div className="mt-3 h-px w-full bg-white/10" />

      <p dir="rtl" className="mt-3 text-left text-[15px] font-bold text-sky-300">
        {word?.translationAr || "—"}
      </p>
    </motion.div>);

}

export default WordTooltip;