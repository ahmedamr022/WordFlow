"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon } from "lucide-react";

import { AudioService } from "@/lib/audio/audioService";
import { TooltipAnchor, WordTooltip } from "@/components/story/WordTooltip";
import type { TypedCell } from "@/hooks/useTypingEngine";

/**
 * عرض الجملة حرفاً بحرف مع مؤشر الكتابة.
 *
 * ── ما أُصلح في هذه الدفعة ───────────────────────────────────────────────────
 * ١) **لا «أنيميشن» يمرّ على الكلمات عند فتح القصة.** كان لون كل كلمة يتحوّل
 *    من الرمادي إلى فاتح ثم يعود، كلمة كلمة، لأن تظليل الصوت كان يبدأ تلقائياً
 *    بعد ثانية من ظهور كل جملة. الآن: (أ) الصوت لا يبدأ تلقائياً، (ب) وحتى عند
 *    تشغيله يدوياً **لا يتغيّر لون الحروف إطلاقاً** — تظهر علامة سفلية هادئة
 *    تحت الكلمة المنطوقة فقط. الحرف الرمادي يظل رمادياً حتى تكتبه.
 *
 * ٢) **المسافة الخطأ صارت حمراء فعلاً.** كانت «حمراء باهتة شبه مختفية» بقرار
 *    قديم، فبدت كأنها لا تتلوّن. الآن مكان المسافة الخطأ يعرض **الحرف الذي
 *    كتبته بالأحمر** فوق خلفية حمراء واضحة — بنفس وضوح أي حرف خطأ.
 *
 * ٣) **مصدر واحد للحقيقة**: الألوان تُقرأ من `cells` القادمة من
 *    `useTypingEngine` بدل إعادة حساب المقارنة هنا (كان مصدر تعارض بين اللون
 *    والعدّاد، وبين حساسية حالة الحرف والاقتباس الذكي).
 */

function TypingCaret({ caretKey }: {caretKey: string;}) {
  return (
    <motion.span
      layoutId={`caret-${caretKey}`}
      transition={{ type: "spring", stiffness: 620, damping: 42, mass: 0.6 }}
      className="pointer-events-none absolute -bottom-[0.14em] left-0 right-0 h-[0.055em] min-h-[3px] rounded-full bg-cyan-300"
      style={{ boxShadow: "0 0 12px 1px rgba(103,232,249,0.65)" }}
      aria-hidden="true">

      <motion.span
        className="absolute inset-0 rounded-full bg-white"
        animate={{ opacity: [0.15, 0.85, 0.15] }}
        transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }} />

    </motion.span>);

}

type SpaceState = "idle" | "active" | "wrong";

function SpaceSlot({
  state,
  typedChar,
  showCaret,
  caretKey





}: {state: SpaceState;typedChar: string | null;showCaret: boolean;caretKey: string;}) {
  const visibleChar =
  state === "wrong" ? (typedChar ?? "").trim() === "" ? "␣" : typedChar : null;

  return (
    <span
      className="relative inline-block align-baseline"
      style={{ width: state === "wrong" && visibleChar ? "0.62em" : "0.42em" }}
      aria-hidden="true">

      {state !== "idle" &&
      <span
        className="pointer-events-none absolute inset-x-0 bottom-[0.04em] top-[0.24em] rounded-[3px]"
        style={
        state === "wrong" ?
        {
          // خطأ واضح: نفس درجة الأحمر المستخدمة للحروف الخطأ.
          backgroundColor: "rgba(244,63,94,0.24)",
          boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.75)"
        } :
        {
          // رمادي هادئ: «دورك دلوقتي مسافة».
          backgroundColor: "rgba(148,163,184,0.14)",
          boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.16)"
        }
        } />

      }

      {visibleChar &&
      <span className="relative z-10 flex items-center justify-center text-rose-400">
          {visibleChar}
        </span>
      }

      {showCaret && <TypingCaret caretKey={caretKey} />}
    </span>);

}

export interface SentenceDisplayProps {
  line: {
    id?: number | string;
    words?: unknown[];
    arabic?: string;
    translationAr?: string;
  } | null;
  target: string;
  typed: string;
  /** حالة كل حرف من `useTypingEngine` — المصدر الوحيد للألوان. */
  cells: TypedCell[];
  levelBadge?: string;
  /** الكلمة المنطوقة حالياً — علامة سفلية فقط، بلا أي تغيير في ألوان الحروف. */
  activeWordIndex?: number;
}

export function SentenceDisplay({
  line,
  target,
  typed,
  cells,
  levelBadge = "B1",
  activeWordIndex = -1
}: SentenceDisplayProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  /**
   * المواقع تُحسب بالتتابع. (`target.indexOf(text)` كان يرجّع أول ظهور للكلمة،
   * فأي جملة فيها كلمة مكرّرة "the ... the" تحسب المواقع غلط ويقفز المؤشر.)
   */
  const tokens = useMemo(() => {
    const parts = target.split(" ");
    const result: {
      text: string;
      start: number;
      end: number;
      spaceIndex: number | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      word: any;
    }[] = [];

    let cursor = 0;
    parts.forEach((text, index) => {
      const start = cursor;
      const end = start + text.length;
      const hasSpace = index < parts.length - 1;
      result.push({
        text,
        start,
        end,
        spaceIndex: hasSpace ? end : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        word: (line?.words as any[] | undefined)?.[index]
      });
      cursor = end + (hasSpace ? 1 : 0);
    });
    return result;
  }, [target, line]);

  const caretIndex = typed.length;
  const caretKey = String(line?.id ?? "line");

  return (
    <div className="max-w-2xl text-left">
      <div className="inline-flex items-center gap-2.5 rounded-xl border border-sky-400/35 bg-sky-500/10 px-3.5 py-1.5 shadow-[0_0_25px_-10px_rgba(56,189,248,0.8)]">
        <SparklesIcon className="h-4 w-4 text-sky-300" />
        <span className="font-en text-sm font-bold tracking-wide text-sky-100">{levelBadge}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={caretKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}>

          <h1
            dir="ltr"
            className="font-en mt-5 flex max-w-xl flex-wrap justify-start gap-x-0 gap-y-3 text-left text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-[3.3rem]">

            {tokens.map((token, index) => {
              const wordTyped = caretIndex >= token.end;
              const isSpeaking = activeWordIndex === index;

              const spaceIndex = token.spaceIndex;
              const spaceCell = spaceIndex === null ? undefined : cells[spaceIndex];
              const spaceIsCaret = spaceIndex !== null && caretIndex === spaceIndex;
              const spaceState: SpaceState =
              spaceCell?.state === "wrong" ?
              "wrong" :
              spaceIsCaret ?
              "active" :
              "idle";

              return (
                <span
                  key={`${caretKey}-${index}`}
                  className="relative inline-flex items-baseline"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}>

                  <span className="relative">
                    <button
                      type="button"
                      onClick={() => AudioService.playWord(token.text)}
                      className="cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60">

                      {token.text.split("").map((letter, letterIndex) => {
                        const globalIndex = token.start + letterIndex;
                        const cell = cells[globalIndex];
                        const isCaret = globalIndex === caretIndex;

                        return (
                          <span key={letterIndex} className="relative inline-block">
                            <span
                              className={[
                              "transition-colors duration-150",
                              cell?.state === "wrong" ?
                              "text-rose-400" :
                              cell?.state === "correct" ?
                              "text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]" :
                              hovered === index ?
                              "text-slate-300" :
                              "text-slate-500/70"].
                              join(" ")}>

                              {letter}
                            </span>

                            {isCaret && <TypingCaret caretKey={caretKey} />}
                          </span>);

                      })}
                    </button>

                    {wordTyped &&
                    <span className="pointer-events-none absolute -bottom-[0.14em] left-0 h-[2px] w-full rounded-full bg-white/[0.12]" />
                    }

                    {/* علامة الاستماع: تحت الكلمة فقط — لا لمس لألوان الحروف */}
                    {isSpeaking &&
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-[0.22em] left-0 h-[3px] w-full rounded-full bg-sky-400/70"
                      style={{ boxShadow: "0 0 10px rgba(56,189,248,0.55)" }} />
                    }
                  </span>

                  {spaceIndex !== null &&
                  <SpaceSlot
                    state={spaceState}
                    typedChar={spaceCell?.typed ?? null}
                    showCaret={spaceIsCaret}
                    caretKey={caretKey} />
                  }

                  <AnimatePresence>
                    {hovered === index &&
                    <TooltipAnchor>
                        <WordTooltip text={token.text} word={token.word} />
                      </TooltipAnchor>
                    }
                  </AnimatePresence>
                </span>);

            })}
          </h1>

          <p
            dir="rtl"
            className="mt-8 text-left text-xl font-bold text-sky-300/90 sm:text-[1.45rem]">

            {line?.arabic || line?.translationAr || ""}
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className="mt-4 h-[3px] w-14 rounded-full"
        style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#a855f7)" }} />

    </div>);

}

export default SentenceDisplay;