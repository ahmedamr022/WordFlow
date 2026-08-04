"use client";

import React from "react";
import { 
  BarChart2, 
  BookOpen, 
  Bookmark, 
  Clock, 
  Heart, 
  Compass, 
  Sparkles, 
  MapPin, 
  GraduationCap 
} from "lucide-react";

interface StoriesRightPanelProps {
  currentStory?: {
    id: string;
    titleEn: string;
    titleAr: string;
    cover: string;
    progress: number;
  };
  onContinueStory?: (storyId: string) => void;
}

export default function StoriesRightPanel({
  currentStory = {
    id: "titanic",
    titleEn: "The Legend of Titanic",
    titleAr: "أسطورة السفينة التايتانيك",
    cover: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400",
    progress: 65,
  },
  onContinueStory,
}: StoriesRightPanelProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* 1. كارت إحصائيات القراءة */}
      <div className="bg-[#080c17] border border-white/[0.07] rounded-[20px] p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="font-extrabold text-white text-base">إحصائيات القراءة</span>
          <BarChart2 className="w-5 h-5 text-purple-400" />
        </div>

        <div className="flex flex-col gap-3.5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-400 text-sm font-semibold">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>إجمالي القصص</span>
            </div>
            <span className="font-extrabold text-white text-base">24</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-400 text-sm font-semibold">
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>تمت قراءته</span>
            </div>
            <span className="font-extrabold text-white text-base">18</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-400 text-sm font-semibold">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              <span>متوسط الدقة</span>
            </div>
            <span className="font-extrabold text-white text-base">96%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-400 text-sm font-semibold">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>كلمات جديدة</span>
            </div>
            <span className="font-extrabold text-white text-base">1,432</span>
          </div>
        </div>

        <button className="w-full bg-slate-900/60 border border-purple-500/30 text-purple-300 hover:bg-purple-500/15 hover:border-purple-500 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-200">
          عرض التفاصيل
        </button>
      </div>

      {/* 2. كارت متابعة القراءة الديناميكي */}
      <div className="bg-[#080c17] border border-white/[0.07] rounded-[20px] p-4 shadow-2xl">
        <div className="font-extrabold text-white text-base mb-3">
          متابعة القراءة
        </div>

        <div 
          className="relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-900/20 to-[#080c17]/95 border border-white/[0.08] p-4 min-h-[110px] flex flex-col justify-end mb-3 bg-cover bg-center" 
          style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(8,12,23,0.95) 100%), url('${currentStory.cover}')` }}
        >
          <div className="text-sm font-extrabold text-white font-en text-left dir-ltr mb-0.5">
            {currentStory.titleEn}
          </div>
          <div className="text-xs text-slate-300 mb-3 text-right">
            {currentStory.titleAr}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" 
                style={{ width: `${currentStory.progress}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-white">{currentStory.progress}%</span>
          </div>
        </div>

        <button 
          onClick={() => onContinueStory && onContinueStory(currentStory.id)}
          className="w-full bg-gradient-to-r from-purple-900 to-rose-900 hover:from-purple-800 hover:to-rose-800 border border-rose-500/30 text-white py-2.5 rounded-xl font-extrabold text-sm shadow-lg shadow-rose-950/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          متابعة القصة
        </button>
      </div>

      {/* 3. كارت التصنيفات */}
      <div className="bg-[#080c17] border border-white/[0.07] rounded-[20px] p-4 shadow-2xl">
        <div className="font-extrabold text-white text-base mb-3.5">
          التصنيفات
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="bg-slate-900/50 border border-white/[0.05] hover:bg-slate-800/60 hover:border-purple-500/40 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all">
            <Heart className="w-4 h-4 text-pink-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">رومانسية</span>
              <span className="text-[10px] text-slate-500">8 قصة</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/[0.05] hover:bg-slate-800/60 hover:border-purple-500/40 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all">
            <Compass className="w-4 h-4 text-pink-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">مغامرة</span>
              <span className="text-[10px] text-slate-500">12 قصة</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/[0.05] hover:bg-slate-800/60 hover:border-purple-500/40 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">خيال علمي</span>
              <span className="text-[10px] text-slate-500">7 قصة</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/[0.05] hover:bg-slate-800/60 hover:border-purple-500/40 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">غموض</span>
              <span className="text-[10px] text-slate-500">15 قصة</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/[0.05] hover:bg-slate-800/60 hover:border-purple-500/40 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all">
            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">تعليمية</span>
              <span className="text-[10px] text-slate-500">5 قصة</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/[0.05] hover:bg-slate-800/60 hover:border-purple-500/40 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">كلاسيكيات</span>
              <span className="text-[10px] text-slate-500">20 قصة</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-slate-900/60 border border-purple-500/30 text-purple-300 hover:bg-purple-500/15 hover:border-purple-500 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-200">
          عرض كل التصنيفات
        </button>
      </div>

    </div>
  );
}