"use client";

import type { DisplayStory } from "@/lib/storyCatalog";
import { levelStyle } from "@/lib/storyCatalog";

interface StoryPosterCardProps {
  story: DisplayStory;
  onPreview: () => void;
  /** md = grid · lg = recommended grid · carousel = fixed-width row item */
  size?: "md" | "lg" | "carousel";
}

const SIZE_CLASS: Record<NonNullable<StoryPosterCardProps["size"]>, string> = {
  md: "aspect-[2/3] min-h-[220px] w-full",
  lg: "aspect-[2/3] min-h-[300px] w-full",
  carousel: "aspect-[2/3] w-[168px] sm:w-[180px] shrink-0 snap-start",
};

export function StoryPosterCard({ story, onPreview, size = "md" }: StoryPosterCardProps) {
  const isLarge = size === "lg";

  return (
    <button
      type="button"
      data-carousel-item={size === "carousel" ? true : undefined}
      onClick={onPreview}
      dir="ltr"
      className={`group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0B101D] text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/40 hover:shadow-[0_18px_40px_-12px_rgba(6,182,212,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${SIZE_CLASS[size]}`}
    >
      <img
        src={story.cover || "/placeholder.svg"}
        alt={story.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/55 to-transparent" />

      {!story.playableId && (
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-slate-300 border border-white/10">
          قريباً
        </span>
      )}

      <div className={`absolute inset-0 flex flex-col justify-end ${isLarge ? "p-4" : "p-3.5"}`}>
        <h3
          className={`font-sans font-extrabold text-white line-clamp-2 leading-snug ${
            isLarge ? "text-[17px]" : "text-[15px]"
          }`}
        >
          {story.title}
        </h3>
        <p
          className={`text-slate-300 line-clamp-1 ${isLarge ? "text-[12px] mt-1" : "text-[12px] mt-0.5"}`}
          dir="rtl"
        >
          {story.titleAr}
        </p>

        <div className={`flex items-center justify-between ${isLarge ? "mt-3 text-[12px]" : "mt-3 text-[11px]"}`}>
          <span
            className="px-2 py-0.5 rounded-md font-bold backdrop-blur-sm"
            style={{
              color: levelStyle(story.level).text,
              background: levelStyle(story.level).bg,
              border: `1px solid ${levelStyle(story.level).border}`,
            }}
          >
            {story.level}
          </span>
          <span className="text-slate-300 font-medium" dir="rtl">
            {story.progress != null ? `${story.progress}%` : story.duration}
          </span>
        </div>

        {story.progress != null && (
          <div className={`w-full bg-white/10 rounded-full overflow-hidden ${isLarge ? "mt-2.5 h-1.5" : "mt-2 h-1.5"}`}>
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              style={{ width: `${story.progress}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
