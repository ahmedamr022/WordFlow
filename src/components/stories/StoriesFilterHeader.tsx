"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface StoriesFilterHeaderProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
}

export default function StoriesFilterHeader({
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
}: StoriesFilterHeaderProps) {
  const levels = [
    { id: "الكل", label: "الكل" },
    { id: "مبتدئ", label: "مبتدئ" },
    { id: "متوسط", label: "متوسط" },
    { id: "متقدم", label: "متقدم" },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 w-full" dir="rtl">
      
      {/* 1. قائمة الترتيب (على اليمين) */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="appearance-none bg-[#0b101d]/80 border border-white/[0.1] hover:border-white/20 text-slate-200 text-xs font-bold px-4 py-2.5 pl-9 rounded-xl outline-none cursor-pointer transition"
          >
            <option value="الأحدث أولاً">الأحدث أولاً</option>
            <option value="الأقدم أولاً">الأقدم أولاً</option>
            <option value="الأعلى تقييماً">الأعلى تقييماً</option>
          </select>
          <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* 2. أزرار المستويات (على الشمال) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none self-end md:self-auto" dir="ltr">
        {levels.map((lvl) => {
          const isActive = selectedCategory === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => setSelectedCategory(lvl.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white border-transparent shadow-lg shadow-purple-500/20"
                  : "bg-[#0b101d]/60 hover:bg-[#121829] text-slate-400 hover:text-white border-white/[0.08]"
              }`}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}