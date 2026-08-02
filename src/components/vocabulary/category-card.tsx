"use client";

import { VocabularyCategory } from "@/data/vocabularyData";

const PROGRESS_COLORS = [
  "#22E0C8",
  "#3B82F6",
  "#FBBF24",
  "#FF6B6B",
  "#7C6CFF",
  "#10B981",
  "#F472B6",
  "#06B6D4",
  "#A78BFA",
  "#FB923C",
];

interface CategoryCardProps {
  category: VocabularyCategory;
  progress: number;
  index: number;
  onClick: () => void;
}

export function CategoryCard({ category, progress, index, onClick }: CategoryCardProps) {
  const barColor = PROGRESS_COLORS[index % PROGRESS_COLORS.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-right rounded-[18px] overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
      style={{
        background: "#0B0F1C",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Cover image */}
      <div className="relative h-[130px] overflow-hidden">
        <img
          src={category.coverImage}
          alt={category.titleEn}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,7,14,0.05) 0%, rgba(5,7,14,0.35) 55%, rgba(5,7,14,0.92) 100%)",
          }}
        />
        <span className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-[#0B0F1C]/90 border border-white/10 flex items-center justify-center text-lg shadow-lg">
          {category.icon}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <h3 className="text-[15px] font-black text-white text-left dir-ltr leading-tight group-hover:text-cyan-300 transition-colors">
          {category.titleEn}
        </h3>
        <p className="text-[12px] font-bold text-slate-400" dir="rtl">
          {category.words.length} كلمة
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex-1 h-[5px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: barColor,
                boxShadow: `0 0 8px ${barColor}66`,
              }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-300 shrink-0 w-8 text-left dir-ltr">
            {progress}%
          </span>
        </div>
      </div>
    </button>
  );
}
