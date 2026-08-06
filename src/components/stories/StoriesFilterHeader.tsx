"use client";

import React from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";

/**
 * فلترة المستوى + الترتيب.
 *
 * تغييران:
 *  1. الترتيب الافتراضي صار **حسب المستوى تصاعدياً** (الأسهل أولاً) بدل
 *     «الأحدث أولاً» التي لم تكن ترتّب شيئاً أصلاً (كانت ترجّع القائمة كما هي).
 *  2. القيم صارت معرّفات ثابتة لا نصوصاً عربية، فلا ينكسر الفرز عند تغيير الكلمة.
 */

export type StorySortId = "level-asc" | "level-desc" | "rating" | "duration";

export const STORY_SORTS: {id: StorySortId;label: string;}[] = [
{ id: "level-asc", label: "المستوى: الأسهل أولاً" },
{ id: "level-desc", label: "المستوى: الأصعب أولاً" },
{ id: "rating", label: "الأعلى تقييماً" },
{ id: "duration", label: "الأقصر مدة" }];


export const STORY_LEVEL_TABS = [
{ id: "الكل", label: "الكل" },
{ id: "مبتدئ", label: "مبتدئ" },
{ id: "متوسط", label: "متوسط" },
{ id: "متقدم", label: "متقدم" }];


interface StoriesFilterHeaderProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSort: StorySortId;
  setSelectedSort: (sort: StorySortId) => void;
  /** عدد القصص الظاهرة بعد الفلترة — تغذية راجعة بأن الأزرار تعمل فعلاً. */
  resultCount: number;
}

export default function StoriesFilterHeader({
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  resultCount
}: StoriesFilterHeaderProps) {
  return (
    <div
      className="mt-4 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center"
      dir="rtl">
      
      {/* الترتيب */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <ArrowUpDown
            size={13}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden />
          
          <select
            value={selectedSort}
            onChange={(event) => setSelectedSort(event.target.value as StorySortId)}
            aria-label="ترتيب القصص"
            className="cursor-pointer appearance-none rounded-xl border border-white/[0.1] bg-[#0b101d]/80 py-2.5 pl-9 pr-9 text-xs font-bold text-slate-200 outline-none transition hover:border-white/20 focus-visible:border-cyan-400/50">
            
            {STORY_SORTS.map((sort) =>
            <option key={sort.id} value={sort.id}>
                {sort.label}
              </option>
            )}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden />
          
        </div>

        <span className="font-en text-[11px] font-bold text-slate-500">
          {resultCount} <span className="font-cairo font-semibold">قصة</span>
        </span>
      </div>

      {/* المستويات */}
      <div
        className="scrollbar-none flex items-center gap-2 self-end overflow-x-auto pb-1 md:self-auto md:pb-0"
        dir="ltr"
        role="tablist"
        aria-label="تصفية حسب المستوى">
        
        {STORY_LEVEL_TABS.map((level) => {
          const isActive = selectedCategory === level.id;
          return (
            <button
              key={level.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(level.id)}
              className={`rounded-xl border px-5 py-2 text-sm font-bold transition-all duration-300 ${
              isActive ?
              "border-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20" :
              "border-white/[0.08] bg-[#0b101d]/60 text-slate-400 hover:bg-[#121829] hover:text-white"}`
              }>
              
              {level.label}
            </button>);

        })}
      </div>
    </div>);

}