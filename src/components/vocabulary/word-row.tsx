;

import React from "react";
import Link from "next/link";
import { CheckCircle2Icon, Loader2Icon, Volume2Icon } from "lucide-react";

import type { VocabularyWord } from "@/data/vocabularyData";
import { levelChipStyle, splitSentenceByWord } from "@/lib/vocabulary/ui";

/**
 * صف كلمة داخل قائمة الفئة.
 *
 * صف واحد = كل ما يحتاجه المستخدم ليقرر: الكلمة، نوعها، ترجمتها، مثال في
 * سياق، استماع، وحالة الإتقان. الضغط على الصف يفتح صفحة الكلمة الكاملة.
 */

export interface WordRowProps {
  word: VocabularyWord;
  href: string;
  isLearned: boolean;
  isPending: boolean;
  onPlay: (text: string) => void;
  onLearn: (word: VocabularyWord) => void;
  accent: string;
  showExample?: boolean;
}

export function WordRow({
  word,
  href,
  isLearned,
  isPending,
  onPlay,
  onLearn,
  accent,
  showExample = true
}: WordRowProps) {
  const parts = splitSentenceByWord(word.exampleEn, word.word);

  return (
    <div
      dir="rtl"
      className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0B101B] px-4 py-3.5 transition-colors hover:border-white/15 hover:bg-[#0D1320]">

      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[15px] font-black"
          style={{
            color: accent,
            backgroundColor: `${accent}18`,
            borderColor: `${accent}38`
          }}>

          <span className="font-en">{word.word.charAt(0).toUpperCase()}</span>
        </span>

        <span className="flex min-w-[150px] shrink-0 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span className="font-en text-[16px] font-extrabold text-white">{word.word}</span>
            <span className="text-[11px] font-semibold text-slate-500">{word.partOfSpeech}</span>
          </span>
          <span className="text-[12.5px] font-bold text-slate-400">{word.translationAr}</span>
        </span>

        {showExample &&
        <span className="hidden min-w-0 flex-1 flex-col gap-1 lg:flex" dir="ltr">
            <span className="font-en truncate text-[13px] text-slate-300">
              {parts.match ?
            <>
                  {parts.before}
                  <span className="font-bold" style={{ color: accent }}>
                    {parts.match}
                  </span>
                  {parts.after}
                </> :

            word.exampleEn
            }
            </span>
            <span dir="rtl" className="truncate text-[12px] text-slate-500">
              {word.exampleAr}
            </span>
          </span>
        }
      </Link>

      <span
        className="hidden shrink-0 rounded-lg border px-2 py-0.5 font-en text-[11px] font-black sm:block"
        style={levelChipStyle(word.cefrLevel)}>

        {word.cefrLevel}
      </span>

      <button
        type="button"
        onClick={() => onPlay(word.word)}
        aria-label={`استمع إلى ${word.word}`}
        className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

        <Volume2Icon size={17} aria-hidden />
      </button>

      {isLearned ?
      <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[12px] font-bold text-emerald-300">
          <CheckCircle2Icon size={14} aria-hidden />
          متقنة
        </span> :

      <button
        type="button"
        onClick={() => onLearn(word)}
        disabled={isPending}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3.5 py-2 text-[12px] font-bold text-violet-200 transition-colors hover:border-violet-400/60 hover:bg-violet-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60">

          {isPending && <Loader2Icon size={13} className="animate-spin" aria-hidden />}
          تعلّمت
        </button>
      }
    </div>);

}

export default WordRow;