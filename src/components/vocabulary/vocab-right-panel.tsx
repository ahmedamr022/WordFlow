"use client";

import Link from "next/link";
import { VocabularyWord } from "@/data/vocabularyData";

const LEVEL_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  A1: { text: "#94A3B8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)" },
  A2: { text: "#6EE7B7", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.40)" },
  B1: { text: "#7DD3FC", bg: "rgba(34,211,238,0.15)", border: "rgba(34,211,238,0.40)" },
  B2: { text: "#C4B5FD", bg: "rgba(124,108,255,0.18)", border: "rgba(124,108,255,0.42)" },
  C1: { text: "#F9A8D4", bg: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.40)" },
  C2: { text: "#FCA5A5", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.40)" },
};

interface LevelSlice {
  level: string;
  count: number;
  pct: number;
  color: string;
}

interface VocabRightPanelProps {
  reviewCount: number;
  totalWords: number;
  levelSlices: LevelSlice[];
  recentWords: VocabularyWord[];
}

function DonutChart({ slices, total }: { slices: LevelSlice[]; total: number }) {
  const size = 140;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {slices.map((slice) => {
          const dash = (slice.pct / 100) * circumference;
          const circle = (
            <circle
              key={slice.level}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[22px] font-black text-white leading-none" dir="ltr">
          {total.toLocaleString()}
        </span>
        <span className="text-[11px] text-slate-400 mt-1 font-bold">كلمة</span>
      </div>
    </div>
  );
}

export function VocabRightPanel({
  reviewCount,
  totalWords,
  levelSlices,
  recentWords,
}: VocabRightPanelProps) {
  const reviewMinutes = Math.max(3, Math.ceil(reviewCount * 0.33));

  return (
    <aside className="w-full xl:w-[300px] shrink-0 space-y-5 overflow-y-auto pb-8" dir="rtl">
      {/* Smart Review */}
      <div
        className="relative overflow-hidden rounded-[22px] border p-5"
        style={{
          background: "linear-gradient(160deg, #12102A 0%, #0D1424 55%, #0B0F1C 100%)",
          borderColor: "rgba(124,108,255,0.25)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
        }}
      >
        <p className="text-[13px] font-bold text-violet-300 mb-1">مراجعة ذكية</p>
        <p className="text-[12px] text-slate-400 mb-3">جاهز للمراجعة اليوم</p>
        <p className="text-[32px] font-black text-white leading-none mb-4">
          {reviewCount}{" "}
          <span className="text-[16px] font-bold text-slate-400">كلمة</span>
        </p>

        {/* Stacked cards illustration */}
        <div className="relative h-[72px] mb-5 mx-auto w-[120px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-xl border"
              style={{
                width: 88 - i * 8,
                height: 52 - i * 4,
                bottom: i * 6,
                right: i * 10,
                background: `linear-gradient(135deg, rgba(124,108,255,${0.35 - i * 0.08}) 0%, rgba(34,224,200,${0.2 - i * 0.05}) 100%)`,
                borderColor: "rgba(255,255,255,0.12)",
                transform: `rotate(${-4 + i * 4}deg)`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>

        <Link
          href="/vocabulary/test"
          className="block w-full py-3.5 rounded-2xl text-center text-[14px] font-black text-white transition hover:brightness-110"
          style={{
            background: "linear-gradient(to left, #ff6b6b, #845ef7)",
            boxShadow: "0 8px 24px rgba(132,94,247,0.35)",
          }}
        >
          ابدأ المراجعة
        </Link>
        <p className="text-center text-[11px] text-slate-500 mt-3">
          سيستغرق ~ {reviewMinutes} دقائق
        </p>
      </div>

      {/* Level Distribution */}
      <div
        className="rounded-[22px] border p-5"
        style={{ background: "#0B0F1C", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h3 className="text-[15px] font-black text-white mb-4">توزيع المستويات</h3>
        <DonutChart slices={levelSlices} total={totalWords} />
        <div className="mt-4 space-y-2">
          {levelSlices.map((slice) => (
            <div key={slice.level} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: slice.color }}
                />
                <span className="text-slate-400 font-bold" dir="ltr">
                  {slice.level}
                </span>
              </div>
              <span className="font-black text-white" dir="ltr">
                {slice.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Learned */}
      <div
        className="rounded-[22px] border p-5"
        style={{ background: "#0B0F1C", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h3 className="text-[15px] font-black text-white mb-4">أحدث ما تعلمته</h3>
        <div className="space-y-3">
          {recentWords.length > 0 ? (
            recentWords.map((word) => {
              const style = LEVEL_STYLES[word.cefrLevel] ?? LEVEL_STYLES.B1;
              return (
                <div
                  key={word.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-black text-white truncate dir-ltr text-left">
                      {word.word}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{word.translationAr}</p>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md border"
                    style={{
                      color: style.text,
                      background: style.bg,
                      borderColor: style.border,
                    }}
                    dir="ltr"
                  >
                    {word.cefrLevel}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-[12px] text-slate-500 text-center py-4">
              ابدأ بتعلم كلمات جديدة من الفئات
            </p>
          )}
        </div>
        {recentWords.length > 0 && (
          <Link
            href="/vocabulary/test"
            className="mt-4 block w-full py-2.5 rounded-xl text-center text-[12px] font-bold text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition"
          >
            عرض الكل
          </Link>
        )}
      </div>
    </aside>
  );
}
