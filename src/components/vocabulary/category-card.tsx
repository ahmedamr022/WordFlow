"use client";
import React from "react";
import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import type { VocabularyCategory } from "@/data/vocabularyData";
import { paletteFor } from "@/lib/vocabulary/ui";

/**
 * بطاقة الفئة.
 *
 * · صارت رابطاً حقيقياً (`/vocabulary/<id>`) بدل زر يغيّر حالة محلية — فيعمل
 *   زر الرجوع في المتصفح، ويمكن مشاركة رابط الفئة، وتُحفظ الحالة عند التحديث.
 * · اللون والأيقونة مشتقّان من `category.id` فلا يتبدّلان مع الفلترة.
 * · العنوان العربي أساسي والإنجليزي سطر ثانوي (الشاشة عربية).
 */

export interface CategoryCardProps {
  category: VocabularyCategory;
  progress: number;
  learnedCount: number;
  href?: string;
  compact?: boolean;
}

export function CategoryCard({
  category,
  progress,
  learnedCount,
  href,
  compact = false
}: CategoryCardProps) {
  const { color, icon: Icon } = paletteFor(category.id);
  const percent = Math.max(0, Math.min(100, Math.round(progress)));
  const isDone = percent >= 100;

  return (
    <Link
      href={href ?? `/vocabulary/${category.id}`}
      dir="rtl"
      aria-label={`${category.titleAr} — ${category.words.length} كلمة، أتقنت ${learnedCount}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B101B] text-right transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

      {/* الغلاف */}
      <div className={`relative w-full overflow-hidden ${compact ? "h-[104px]" : "h-[128px]"}`}>
        <img
          src={category.coverImage}
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />


        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
            "linear-gradient(180deg, rgba(11,16,27,0) 0%, rgba(11,16,27,.35) 45%, rgba(11,16,27,.96) 100%)"
          }} />


        <span
          aria-hidden
          className="absolute -bottom-10 right-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
          style={{ backgroundColor: color }} />


        {/* لمعة عند المرور */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />


        {isDone &&
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-sm">
            <CheckCircle2Icon size={12} aria-hidden />
            مكتملة
          </span>
        }
      </div>

      {/* المحتوى */}
      <div className="relative -mt-7 flex flex-1 flex-col gap-3 px-4 pb-4">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md"
          style={{
            backgroundColor: `${color}22`,
            borderColor: `${color}45`
          }}>

          <Icon size={19} style={{ color }} />
        </span>

        <div>
          <h3 className="text-[15px] font-black leading-tight text-white">{category.titleAr}</h3>
          <p className="font-en mt-0.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
            {category.titleEn}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between text-[11.5px] font-bold">
          <span className="text-slate-400">
            <span className="font-en text-white">{category.words.length}</span> كلمة
          </span>
          <span className="text-slate-500">
            أتقنت <span className="font-en" style={{ color }}>{learnedCount}</span>
          </span>
        </div>

        <div
          className="h-[5px] w-full overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`تقدم ${category.titleAr}`}>

          <span
            className="block h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${percent}%`,
              backgroundImage: `linear-gradient(90deg, ${color}, ${color}99)`
            }} />

        </div>

        <div className="font-en text-left text-[11px] font-bold text-slate-500">{percent}%</div>
      </div>
    </Link>);

}

export default CategoryCard;