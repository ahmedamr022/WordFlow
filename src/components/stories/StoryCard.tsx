"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bookmark, Lock, Clock, Star, Zap, Sparkles, ArrowLeft, Layers } from "lucide-react";

import { imageStyle, normalizeSurface, overlayStyle } from "@/lib/stories/appearance";
import type { SurfaceAppearance } from "@/types/admin";

/**
 * كارت القصة.
 *
 * تغيير في هذه الحزمة
 * ────────────────────
 * الكارت كان بيعرض `story.cover` بصورة ثابتة، ومن غير أي علاقة بإعدادات
 * «المظهر» في Admin Studio. النتيجة إن الأدمن يضبط سطح `card` في الاستوديو
 * وما يتغيّرش حاجة على الشاشة، وصورة الكارت تفضل هي نفس صورة خلفية صفحة
 * القراءة.
 *
 * دلوقتي الكارت بيقبل `cardAppearance` (سطح `card` القادم من
 * `stories.appearance`) ويطبّق نفس الدوال المستخدمة في المعاينة داخل
 * الاستوديو — يعني اللي الأدمن بيشوفه في المعاينة هو بالظبط اللي بيتعرض.
 *
 * كل شيء اختياري: لو ما مررتش `cardAppearance` الكارت بيشتغل زي الأول
 * بالظبط، فما فيش أي call site محتاج تعديل.
 */

export interface StoryItem {
  id: string | number;
  titleEn: string;
  titleAr: string;
  cover: string;
  level: string;
  duration: string;
  rating: number | string;
  xp: number | string;
  progress?: number;
  isNew?: boolean;
  isLocked?: boolean;
  /** سطح `card` من stories.appearance — يتجاوز `cover` ويضيف التموضع والفلاتر. */
  cardAppearance?: Partial<SurfaceAppearance> | null;
}

interface StoryCardProps {
  story?: StoryItem;
  /** بديل لتمرير المظهر من الأب (مثلاً قائمة جايّة من الداتابيز). */
  cardAppearance?: Partial<SurfaceAppearance> | null;
  hasPlusOverlay?: boolean;
  countPlus?: number;
  onPlusClick?: () => void;
  onClick?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  cardAppearance,
  hasPlusOverlay = false,
  countPlus = 12,
  onPlusClick,
  onClick
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  // 🌟 1. كارت "+X المزيد"
  if (hasPlusOverlay) {
    return (
      <div
        onClick={onPlusClick}
        className="relative group rounded-2xl overflow-hidden bg-gradient-to-b from-[#13192b]/90 via-[#0d1322]/95 to-[#080d1a] border-2 border-dashed border-purple-500/40 hover:border-purple-400/80 transition-all duration-300 flex flex-col items-center justify-between p-5 min-h-[340px] h-full cursor-pointer shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1.5 backdrop-blur-xl">

        <div className="absolute inset-0 bg-radial-purple opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />

        <div className="w-full flex justify-between items-center z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
            محتوى إضافي
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="my-auto text-center z-10 flex flex-col items-center gap-2">
          <div className="relative">
            <span className="text-5xl font-black font-en text-transparent bg-clip-text bg-gradient-to-br from-purple-300 via-pink-400 to-indigo-400 drop-shadow-[0_4px_12px_rgba(168,85,247,0.4)]">
              +{countPlus}
            </span>
          </div>
          <h4 className="text-white font-bold text-sm tracking-wide">عرض جميع القصص</h4>
          <p className="text-slate-400 text-xs max-w-[160px] leading-relaxed">
            قصص إضافية رائعة ومصممة خصيصاً لمستواك
          </p>
        </div>

        <div className="w-full z-10">
          <button className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 border border-purple-500/40 group-hover:border-purple-400 text-purple-200 group-hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md">
            <span>استكشف المكتبة</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>);

  }

  // 🎴 2. كارت القصة الأساسي
  if (!story) return null;

  // مصدر واحد للمظهر: prop الأب ثم حقل القصة ثم الافتراضي.
  const surface = normalizeSurface(cardAppearance ?? story.cardAppearance ?? null, "card");
  const imageSrc = surface.imageUrl ?? story.cover;
  const hasOverlay = surface.overlay > 0;

  return (
    <div
      onClick={onClick}
      className="relative group rounded-2xl overflow-hidden bg-[#0a0e1a] border border-white/[0.08] hover:border-cyan-500/40 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-end min-h-[340px] h-full cursor-pointer select-none">

      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt={story.titleEn}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
          style={imageStyle(surface)}
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />

        {hasOverlay &&
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={overlayStyle(surface, "bottom")} />

        }
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a14] via-[#070a14]/60 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-[1]" />
      </div>

      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          aria-label={isBookmarked ? "إزالة من المحفوظات" : "حفظ القصة"}
          aria-pressed={isBookmarked}
          onClick={handleBookmarkClick}
          className={`pointer-events-auto w-8 h-8 rounded-xl border backdrop-blur-md flex items-center justify-center transition-all duration-200 ${
          isBookmarked ?
          "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]" :
          "bg-[#0b101d]/60 border-white/10 text-slate-300 hover:text-white hover:bg-[#0b101d]/90"}`
          }>

          <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          {story.isNew &&
          <span className="bg-emerald-500/90 backdrop-blur-md border border-emerald-400/40 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-sm">
              جديد
            </span>
          }

          {story.isLocked &&
          <div className="bg-[#0b101d]/75 backdrop-blur-md border border-white/15 text-slate-300 w-8 h-8 rounded-xl flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
          }
        </div>
      </div>

      <div className="relative z-10 p-4 flex flex-col gap-1.5 text-right">
        <h3 className="font-en text-white font-extrabold text-base leading-snug tracking-wide group-hover:text-cyan-300 transition-colors">
          {story.titleEn}
        </h3>

        <p className="text-slate-400 text-xs font-semibold truncate">{story.titleAr}</p>

        <div className="mt-1">
          <span className="inline-block bg-[#0e1726]/80 border border-emerald-500/40 text-emerald-400 font-en text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
            {story.level}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 font-en mt-2 pt-1 border-t border-white/[0.05]">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <Zap className="w-3.5 h-3.5 fill-cyan-400/20" /> {story.xp}
          </span>

          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" /> {story.rating}
          </span>

          <span className="flex items-center gap-1 text-slate-400 dir-rtl font-sans text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {story.duration}
          </span>
        </div>

        {story.progress !== undefined &&
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              style={{ width: `${story.progress}%` }} />

            </div>
            <span className="text-[10px] text-cyan-300 font-en font-bold">{story.progress}%</span>
          </div>
        }
      </div>
    </div>);

};

export default StoryCard;