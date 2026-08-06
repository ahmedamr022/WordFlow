"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  BarChart2Icon,
  BookOpenIcon,
  BookmarkCheckIcon,
  TargetIcon,
  SparklesIcon,
  PlayIcon,
  ArrowLeftIcon,
  LayersIcon } from
"lucide-react";

import { MAIN_STORIES, RECOMMENDED_STORIES_DATA } from "@/data/stories";
import { STORY_GENRES, countStoriesByGenre, type StoryGenreId } from "@/data/storyGenres";
import { storyCover, IMAGES, imageFallbackHandler } from "@/lib/assets";

/**
 * اللوحة الجانبية في /stories.
 *
 * التغيير الأهم: القسم الثالث كان «المستويات» — وهو تكرار حرفي لأزرار المستوى
 * الموجودة أعلى الشبكة مباشرة. صار **التصنيفات** (نوع القصة: مغامرة، غموض،
 * رومانسية…) فأصبح لكل عنصر في الشاشة وظيفة مختلفة:
 *   · الشريط العلوي  → المستوى (A1…C2)
 *   · اللوحة الجانبية → التصنيف
 * والعدّادات محسوبة من `src/data/storyGenres.ts` لا مكتوبة يدوياً.
 */

export interface StoriesPanelStats {
  storiesStarted: number;
  storiesCompleted: number;
  averageAccuracy: number | null;
  wordsLearned: number;
}

export interface ContinueStoryInfo {
  id: string;
  titleEn: string;
  titleAr: string;
  progress: number;
  lineIndex: number;
  totalLines: number;
}

interface StoriesRightPanelProps {
  stats: StoriesPanelStats;
  continueStory: ContinueStoryInfo | null;
  activeGenre: StoryGenreId | null;
  onSelectGenre: (genre: StoryGenreId | null) => void;
  onOpenStory: (storyId: string) => void;
  isAuthenticated: boolean;
}

function StatRow({
  icon,
  label,
  value




}: {icon: React.ReactNode;label: string;value: React.ReactNode;}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-en text-base font-extrabold text-white">{value}</span>
    </div>);

}

export default function StoriesRightPanel({
  stats,
  continueStory,
  activeGenre,
  onSelectGenre,
  onOpenStory,
  isAuthenticated
}: StoriesRightPanelProps) {
  const allStories = useMemo(() => [...MAIN_STORIES, ...RECOMMENDED_STORIES_DATA], []);
  const counts = useMemo(() => countStoriesByGenre(allStories), [allStories]);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* ══════════ 1. إحصائيات القراءة ══════════ */}
      <section
        className="rounded-[20px] border border-white/[0.07] bg-[#080c17] p-4 shadow-2xl"
        aria-labelledby="reading-stats-title">
        
        <div className="mb-4 flex items-center justify-between">
          <h2 id="reading-stats-title" className="text-base font-extrabold text-white">
            إحصائيات القراءة
          </h2>
          <BarChart2Icon className="h-5 w-5 text-purple-400" aria-hidden />
        </div>

        <div className="mb-4 flex flex-col gap-3.5">
          <StatRow
            icon={<BookOpenIcon className="h-4 w-4 text-sky-400" aria-hidden />}
            label="إجمالي القصص"
            value={allStories.length} />
          
          <StatRow
            icon={<BookmarkCheckIcon className="h-4 w-4 text-sky-400" aria-hidden />}
            label="أكملتها"
            value={isAuthenticated ? stats.storiesCompleted : "—"} />
          
          <StatRow
            icon={<PlayIcon className="h-4 w-4 text-sky-400" aria-hidden />}
            label="بدأتها"
            value={isAuthenticated ? stats.storiesStarted : "—"} />
          
          <StatRow
            icon={<TargetIcon className="h-4 w-4 text-sky-400" aria-hidden />}
            label="متوسط الدقة"
            value={
            isAuthenticated && stats.averageAccuracy !== null ?
            `${stats.averageAccuracy}%` :
            "—"
            } />
          
          <StatRow
            icon={<SparklesIcon className="h-4 w-4 text-sky-400" aria-hidden />}
            label="كلمات تعلمتها"
            value={isAuthenticated ? stats.wordsLearned.toLocaleString("en-US") : "—"} />
          
        </div>

        <Link
          href="/stats"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-slate-900/60 py-2.5 text-sm font-bold text-purple-300 transition-all duration-200 hover:border-purple-500 hover:bg-purple-500/15 hover:text-white">
          
          عرض التفاصيل
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </section>

      {/* ══════════ 2. متابعة القراءة ══════════ */}
      <section
        className="rounded-[20px] border border-white/[0.07] bg-[#080c17] p-4 shadow-2xl"
        aria-labelledby="continue-title">
        
        <h2 id="continue-title" className="mb-3 text-base font-extrabold text-white">
          متابعة القراءة
        </h2>

        {continueStory ?
        <>
            <div className="relative mb-3 flex min-h-[128px] flex-col justify-end overflow-hidden rounded-xl border border-white/[0.08] p-4">
              <img
              src={storyCover(continueStory.id)}
              onError={imageFallbackHandler(IMAGES.placeholder)}
              alt={`غلاف قصة ${continueStory.titleAr}`}
              className="absolute inset-0 h-full w-full object-cover" />
            
              <div
              className="absolute inset-0"
              style={{
                background:
                "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(8,12,23,0.94) 100%)"
              }}
              aria-hidden="true" />
            

              <div className="relative">
                <div className="font-en mb-0.5 text-left text-sm font-extrabold text-white" dir="ltr">
                  {continueStory.titleEn}
                </div>
                <div className="mb-1 text-right text-xs text-slate-300">
                  {continueStory.titleAr}
                </div>
                <div className="mb-2.5 text-right text-[11px] text-slate-400">
                  الجملة {Math.min(continueStory.lineIndex + 1, continueStory.totalLines || 1)} من{" "}
                  {continueStory.totalLines || "—"}
                </div>

                <div className="flex items-center gap-3">
                  <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-valuenow={continueStory.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}>
                  
                    <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-[width] duration-500"
                    style={{ width: `${continueStory.progress}%` }} />
                  
                  </div>
                  <span className="font-en text-xs font-extrabold text-white">
                    {continueStory.progress}%
                  </span>
                </div>
              </div>
            </div>

            <button
            type="button"
            onClick={() => onOpenStory(continueStory.id)}
            className="w-full rounded-xl border border-rose-500/30 bg-gradient-to-r from-purple-900 to-rose-900 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-rose-950/40 transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-800 hover:to-rose-800">
            
              {continueStory.progress >= 100 ? "إعادة القصة" : "متابعة القصة"}
            </button>
          </> :

        <div className="rounded-xl border border-dashed border-white/10 bg-[#0b1020] p-5 text-center">
            <BookOpenIcon className="mx-auto mb-2 h-7 w-7 text-slate-500" aria-hidden />
            <p className="text-sm font-bold text-slate-200">
              {isAuthenticated ? "لم تبدأ أي قصة بعد" : "سجّل الدخول لتتابع تقدمك"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              اختر قصة من القائمة وابدأ أول جملة — سنحفظ موقعك تلقائياً.
            </p>
          </div>
        }
      </section>

      {/* ══════════ 3. التصنيفات ══════════ */}
      <section
        className="rounded-[20px] border border-white/[0.07] bg-[#080c17] p-4 shadow-2xl"
        aria-labelledby="genres-title">
        
        <div className="mb-3.5 flex items-center justify-between">
          <h2 id="genres-title" className="text-base font-extrabold text-white">
            التصنيفات
          </h2>
          <LayersIcon className="h-4 w-4 text-purple-400" aria-hidden />
        </div>

        <div className="mb-3.5 grid grid-cols-2 gap-2.5">
          {STORY_GENRES.map((genre) => {
            const Icon = genre.icon;
            const isActive = activeGenre === genre.id;
            const count = counts[genre.id];

            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => onSelectGenre(isActive ? null : genre.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-right transition-all ${
                isActive ?
                "bg-white/[0.06]" :
                "border-white/[0.05] bg-slate-900/50 hover:border-white/15 hover:bg-slate-800/60"}`
                }
                style={isActive ? { borderColor: genre.accent } : undefined}>
                
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `${genre.color}1A`,
                    border: `1px solid ${genre.color}33`
                  }}>
                  
                  <Icon className="h-3.5 w-3.5" style={{ color: genre.color }} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-bold text-white">{genre.label}</span>
                  <span className="font-en text-[10px] text-slate-500">{count} قصة</span>
                </span>
              </button>);

          })}
        </div>

        <button
          type="button"
          onClick={() => onSelectGenre(null)}
          disabled={activeGenre === null}
          className="w-full rounded-xl border border-purple-500/30 bg-slate-900/60 py-2.5 text-sm font-bold text-purple-300 transition-all duration-200 hover:border-purple-500 hover:bg-purple-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-purple-500/30 disabled:hover:bg-slate-900/60 disabled:hover:text-purple-300">
          
          عرض كل التصنيفات
        </button>
      </section>
    </div>);

}