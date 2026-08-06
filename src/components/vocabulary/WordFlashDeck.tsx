"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckIcon,
  RotateCcwIcon,
  SparklesIcon,
  Volume2Icon,
  XIcon,
  ZapIcon } from
"lucide-react";

import type { VocabularyWord } from "@/data/vocabularyData";

/**
 * ديك المراجعة السريعة — «الطريقة المبتكرة لتعلّم الكلمات».
 *
 * الفكرة: بدل قائمة كلمات المستخدم بيقرأها ويقفل الصفحة (تعلّم سلبي)،
 * بيدخل جلسة قصيرة على شكل كروت. يشوف الكلمة والجملة بفراغ مكانها،
 * يحاول يفتكر، يقلب الكارت، ثم يحكم على نفسه:
 *
 *   ١ صعبة  → ترجع لآخر الجلسة (تكرار متقارب داخل نفس الجلسة)
 *   ٢ تمام   → تخرج من الجلسة
 *   ٣ سهلة   → تخرج + XP أعلى
 *
 * ليه ده أحسن من اللي كان
 * ───────────────────────
 *  · **الاسترجاع النشط** (active recall) أقوى إثباتاً من القراءة، وهو نفس
 *    مبدأ الـ spaced repetition اللي الداتابيز مجهّزة له أصلاً
 *    (`record_word_review_by_text`).
 *  · **مستقل تماماً**: بياخد كلماته كـ prop ومعاه callback واحد. يشتغل
 *    جوّا مودال، أو تحت «مراجعة ذكية» في صفحة المفردات، أو في صفحة الكلمة.
 *  · **كيبورد كامل**: مسافة = اقلب، ١/٢/٣ = الحكم، → = تخطّي. الأدمن
 *    والمستخدم مش محتاجين ماوس.
 *  · **نطق حقيقي** عبر `speechSynthesis` — بلا ملفات صوت ولا API خارجي.
 *  · **نتيجة نهائية** تحفّز على جلسة تانية بدل ما الشاشة تفضي فجأة.
 *
 * الربط بالداتا (سطر واحد):
 *   <WordFlashDeck
 *     words={reviewWords}
 *     onGrade={(id, grade) => recordWordReview(id, grade)}
 *   />
 */

export type FlashGrade = "again" | "good" | "easy";

/** نقبل شكل `VocabularyWord` الحالي، وكذلك أي شكل مبسّط قادم من الداتابيز. */
export interface FlashWord {
  id: string;
  word: string;
  translationAr: string;
  partOfSpeech?: string | null;
  ipa?: string | null;
  exampleEn?: string | null;
  exampleAr?: string | null;
  cefrLevel?: string | null;
}

export interface WordFlashDeckProps {
  words: (FlashWord | VocabularyWord)[];
  /** يُنادى بعد كل حكم — اربطه بالـ server action الخاص بالمراجعة. */
  onGrade?: (wordId: string, grade: FlashGrade) => void;
  /** يُنادى مرة واحدة عند انتهاء الجلسة. */
  onFinish?: (summary: {easy: number;good: number;again: number;xp: number;}) => void;
  /** زر إغلاق (لو الديك جوّا مودال). */
  onClose?: () => void;
}

const XP_BY_GRADE: Record<FlashGrade, number> = { again: 2, good: 6, easy: 10 };

export function WordFlashDeck({ words, onGrade, onFinish, onClose }: WordFlashDeckProps) {
  const deck = React.useMemo<FlashWord[]>(() => words.map(toFlashWord), [words]);

  const [queue, setQueue] = React.useState<FlashWord[]>(deck);
  const [flipped, setFlipped] = React.useState(false);
  const [done, setDone] = React.useState(0);
  const [tally, setTally] = React.useState({ easy: 0, good: 0, again: 0, xp: 0 });
  const finishedRef = React.useRef(false);

  React.useEffect(() => {
    setQueue(deck);
    setFlipped(false);
    setDone(0);
    setTally({ easy: 0, good: 0, again: 0, xp: 0 });
    finishedRef.current = false;
  }, [deck]);

  const current = queue[0] ?? null;
  const total = deck.length;
  const progress = total === 0 ? 0 : Math.round(done / total * 100);

  const speak = React.useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const grade = React.useCallback(
    (value: FlashGrade) => {
      if (!current) return;

      onGrade?.(current.id, value);

      setTally((prev) => ({
        ...prev,
        [value]: prev[value] + 1,
        xp: prev.xp + XP_BY_GRADE[value]
      }));

      setQueue((prev) => {
        const [head, ...rest] = prev;
        return value === "again" ? [...rest, head] : rest;
      });

      if (value !== "again") setDone((prev) => prev + 1);
      setFlipped(false);
    },
    [current, onGrade]
  );

  const skip = React.useCallback(() => {
    setQueue((prev) => prev.length < 2 ? prev : [...prev.slice(1), prev[0]]);
    setFlipped(false);
  }, []);

  React.useEffect(() => {
    if (queue.length === 0 && total > 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.(tally);
    }
  }, [queue.length, total, tally, onFinish]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!current) return;
      if (event.key === " ") {
        event.preventDefault();
        setFlipped((prev) => !prev);
        return;
      }
      if (!flipped) return;
      if (event.key === "1") grade("again");
      if (event.key === "2") grade("good");
      if (event.key === "3") grade("easy");
      if (event.key === "ArrowRight") skip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, flipped, grade, skip]);

  if (total === 0) {
    return (
      <div
        dir="rtl"
        className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-[18px] border border-white/[0.07] bg-[#0B111C] px-6 text-center">
        
        <SparklesIcon className="h-8 w-8 text-cyan-300" aria-hidden />
        <h3 className="text-[17px] font-black text-white">مفيش كلمات للمراجعة حالياً</h3>
        <p className="max-w-[300px] text-[13px] text-slate-400">
          خلّصت كل مراجعات اليوم. تعلّم كلمات جديدة وارجع بكرة.
        </p>
      </div>);

  }

  if (!current) {
    return (
      <motion.div
        dir="rtl"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-[420px] flex-col items-center justify-center gap-4 rounded-[18px] border border-cyan-400/20 bg-[#0B111C] px-6 text-center">
        
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
          <ZapIcon className="h-7 w-7" aria-hidden />
        </span>
        <h3 className="text-[20px] font-black text-white">خلّصت الجلسة</h3>

        <div className="flex items-center gap-3">
          <ResultChip label="سهلة" value={tally.easy} color="#22E0C8" />
          <ResultChip label="تمام" value={tally.good} color="#7C6CFF" />
          <ResultChip label="صعبة" value={tally.again} color="#FF6B6B" />
        </div>

        <p className="font-en text-[26px] font-black text-white">+{tally.xp} XP</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setQueue(deck);
              setDone(0);
              setTally({ easy: 0, good: 0, again: 0, xp: 0 });
              finishedRef.current = false;
            }}
            className="flex h-10 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-4 text-[13px] font-bold text-slate-200 transition hover:border-white/25">
            
            <RotateCcwIcon size={14} aria-hidden />
            كرّر الجلسة
          </button>
          {onClose &&
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[12px] bg-gradient-to-l from-[#0891b2] to-[#7c3aed] px-5 text-[13px] font-black text-white transition hover:brightness-110">
            
              تم
            </button>
          }
        </div>
      </motion.div>);

  }

  const cloze = buildCloze(current.exampleEn, current.word);

  return (
    <div dir="rtl" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-white/[0.08]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="تقدّم الجلسة">
          
          <motion.div
            className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-[#22E0C8] to-[#7C6CFF]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} />
          
        </div>
        <span className="font-en shrink-0 text-[12px] font-black text-slate-300">
          {done}/{total}
        </span>
      </div>

      <div className="relative h-[340px]" style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait">
          <motion.button
            key={`${current.id}-${flipped ? "back" : "front"}`}
            type="button"
            onClick={() => setFlipped((prev) => !prev)}
            initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: flipped ? 90 : -90 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            aria-label={flipped ? "اقلب لإخفاء المعنى" : "اقلب لإظهار المعنى"}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[18px] border border-white/[0.08] bg-[#0B111C] px-6 text-center outline-none transition-colors hover:border-white/20 focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            style={{ transformStyle: "preserve-3d" }}>
            
            <div className="flex items-center gap-2">
              {current.cefrLevel &&
              <span className="font-en rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10.5px] font-black text-cyan-200">
                  {current.cefrLevel}
                </span>
              }
              {current.partOfSpeech &&
              <span className="font-en text-[11.5px] font-bold text-violet-300">
                  {current.partOfSpeech}
                </span>
              }
            </div>

            <div className="flex items-center gap-2.5">
              <h3 className="font-en text-[34px] font-black leading-none text-white">
                {current.word}
              </h3>
              <span
                role="button"
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation();
                  speak(current.word);
                }}
                aria-label={`استمع إلى ${current.word}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300">
                
                <Volume2Icon size={15} aria-hidden />
              </span>
            </div>

            {current.ipa &&
            <span className="font-en text-[13px] text-slate-500">/{current.ipa}/</span>
            }

            {flipped ?
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="flex flex-col items-center gap-3">
              
                <p className="text-[22px] font-black text-[#22E0C8]">{current.translationAr}</p>
                {current.exampleEn &&
              <p
                className="font-en max-w-[420px] text-[14px] leading-relaxed text-slate-300"
                dir="ltr">
                
                    {current.exampleEn}
                  </p>
              }
                {current.exampleAr &&
              <p className="max-w-[420px] text-[13px] leading-relaxed text-slate-500">
                    {current.exampleAr}
                  </p>
              }
              </motion.div> :

            <div className="flex flex-col items-center gap-3">
                {cloze &&
              <p
                className="font-en max-w-[420px] text-[14px] leading-relaxed text-slate-400"
                dir="ltr">
                
                    {cloze}
                  </p>
              }
                <span className="text-[12px] font-bold text-slate-600">
                  اضغط الكارت أو المسافة لإظهار المعنى
                </span>
              </div>
            }
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <GradeButton
          label="صعبة"
          shortcut="1"
          color="#FF6B6B"
          icon={<XIcon size={15} aria-hidden />}
          disabled={!flipped}
          onClick={() => grade("again")} />
        
        <GradeButton
          label="تمام"
          shortcut="2"
          color="#7C6CFF"
          icon={<CheckIcon size={15} aria-hidden />}
          disabled={!flipped}
          onClick={() => grade("good")} />
        
        <GradeButton
          label="سهلة"
          shortcut="3"
          color="#22E0C8"
          icon={<ZapIcon size={15} aria-hidden />}
          disabled={!flipped}
          onClick={() => grade("easy")} />
        
      </div>

      <p className="text-center text-[11.5px] text-slate-600">
        المسافة = اقلب · ١ صعبة · ٢ تمام · ٣ سهلة · ← تخطّي
      </p>
    </div>);

}

function GradeButton({
  label,
  shortcut,
  color,
  icon,
  disabled,
  onClick







}: {label: string;shortcut: string;color: string;icon: React.ReactNode;disabled: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[46px] items-center justify-center gap-2 rounded-[12px] border text-[13px] font-black transition-all disabled:cursor-not-allowed disabled:opacity-35"
      style={{ borderColor: `${color}4D`, background: `${color}14`, color }}>
      
      {icon}
      <span>{label}</span>
      <span className="font-en text-[10.5px] opacity-60">{shortcut}</span>
    </button>);

}

function ResultChip({ label, value, color }: {label: string;value: number;color: string;}) {
  return (
    <span
      className="flex flex-col items-center gap-0.5 rounded-[12px] border px-4 py-2"
      style={{ borderColor: `${color}40`, background: `${color}12` }}>
      
      <span className="font-en text-[18px] font-black" style={{ color }}>
        {value}
      </span>
      <span className="text-[11px] font-bold text-slate-400">{label}</span>
    </span>);

}

/** يوحّد `VocabularyWord` وأي شكل مبسّط في نفس الشكل الداخلي. */
function toFlashWord(word: FlashWord | VocabularyWord): FlashWord {
  return {
    id: word.id,
    word: word.word,
    translationAr: word.translationAr,
    partOfSpeech: word.partOfSpeech ?? null,
    ipa: word.ipa ?? null,
    exampleEn: word.exampleEn ?? null,
    exampleAr: word.exampleAr ?? null,
    cefrLevel: word.cefrLevel ?? null
  };
}

/** يحوّل الجملة لجملة ناقصة: الكلمة المستهدفة تتحوّل لفراغ. */
function buildCloze(sentence: string | null | undefined, word: string): string | null {
  if (!sentence || !word) return sentence ?? null;
  const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\w*\\b`, "gi");
  const replaced = sentence.replace(pattern, "______");
  return replaced === sentence ? sentence : replaced;
}

export default WordFlashDeck;