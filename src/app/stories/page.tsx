"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { StoryReader } from "@/components/stories/story-reader";
import { StoryPosterCard } from "@/components/stories/story-poster-card";
import { StoryCarousel } from "@/components/stories/story-carousel";
import {
  BookOpen,
  BookMarked,
  BarChart3,
  Star,
  Heart,
  Compass,
  Eye,
  Rocket,
  GraduationCap,
  Clock,
  BookText,
  type LucideIcon,
} from "lucide-react";
import {
  FEATURED_STORIES,
  RECOMMENDED_STORIES,
  filterStoriesByLevel,
  getContinueReadingStory,
  getTotalPlayableStoryCount,
  toReaderStory,
} from "@/lib/storyCatalog";
import { UserStatsService } from "@/lib/userStats";
import type { ReaderStory } from "@/components/stories/story-reader";

export default function StoriesListPage() {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [selectedStory, setSelectedStory] = useState<ReaderStory | null>(null);
  const [stats, setStats] = useState({ storiesCompleted: 0, wordsLearned: 0, streakCount: 1, level: "A1" });

  useEffect(() => {
    const saved = UserStatsService.getStats();
    setStats({
      storiesCompleted: saved.storiesCompleted,
      wordsLearned: saved.wordsLearned,
      streakCount: saved.streakCount,
      level: saved.level,
    });
  }, []);

  const continueStory = getContinueReadingStory();
  const filteredStories = filterStoriesByLevel(FEATURED_STORIES, activeFilter);
  const totalStories = getTotalPlayableStoryCount();

  const readingStats: { label: string; value: string; icon: LucideIcon; color: string }[] = [
    { label: "إجمالي القصص", value: String(totalStories), icon: BookOpen, color: "text-cyan-400" },
    { label: "تمت قراءته", value: String(stats.storiesCompleted), icon: BookMarked, color: "text-emerald-400" },
    { label: "متوسط الدقة", value: "96%", icon: BarChart3, color: "text-fuchsia-400" },
    { label: "كلمات جديدة", value: stats.wordsLearned.toLocaleString(), icon: Clock, color: "text-amber-400" },
  ];

  const categories: { name: string; count: string; icon: LucideIcon; color: string; bg: string }[] = [
    { name: "مغامرة", count: "12 قصة", icon: Compass, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { name: "رومانسية", count: "8 قصص", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
    { name: "غموض", count: "15 قصة", icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "خيال علمي", count: "7 قصص", icon: Rocket, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "كلاسيكيات", count: "20 قصة", icon: BookText, color: "text-teal-400", bg: "bg-teal-500/10" },
    { name: "تعليمية", count: "5 قصص", icon: GraduationCap, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#05070E] text-white flex select-none font-arabic" dir="ltr">
      <AppSidebar active="القصص" />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedStory ? "scale-[0.98] blur-[2px] pointer-events-none" : ""}`}>
        <AppShellHeader streak={stats.streakCount} level={stats.level} />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-12 gap-6" dir="ltr">
            <div className="col-span-12 xl:col-span-9" dir="rtl">
              <div className="rounded-3xl bg-[#0B0F1C] border border-white/[0.06] p-6">
                <div className="flex items-center gap-3 mb-1.5" dir="ltr">
                  <BookOpen size={26} className="text-cyan-400" />
                  <h1 className="text-[30px] font-extrabold text-white leading-none">القصص</h1>
                </div>
                <p className="text-[13px] text-slate-400 mb-5 text-left" dir="rtl">
                  اكتشف قصصًا جديدة وتعلم بطريقة ممتعة
                </p>

                <div className="flex items-center gap-2.5 mb-6 flex-wrap">
                  {["الكل", "مبتدئ", "متوسط", "متقدم"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFilter(f)}
                      className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${
                        activeFilter === f
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/25"
                          : "bg-[#0F1424] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/15"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <StoryCarousel>
                  {filteredStories.map((story) => (
                    <StoryPosterCard
                      key={story.id}
                      story={story}
                      size="carousel"
                      onPreview={() => setSelectedStory(toReaderStory(story))}
                    />
                  ))}
                </StoryCarousel>

                {filteredStories.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-12">لا توجد قصص في هذا المستوى حالياً.</p>
                )}

                <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="mt-10">
                  <div className="flex items-center gap-2.5 mb-1.5" dir="ltr">
                    <Star
                      size={20}
                      strokeWidth={1.75}
                      fill="none"
                      style={{ color: "#FBBF24", filter: "drop-shadow(0 0 6px rgba(251,191,36,0.35))" }}
                    />
                    <h2 className="text-[22px] font-extrabold text-white">موصى به لك</h2>
                  </div>
                  <p className="text-[13px] text-slate-400 mb-4 text-left" dir="rtl">
                    قصص تناسب مستواك واهتماماتك
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full" dir="ltr">
                    {RECOMMENDED_STORIES.map((story) => (
                      <StoryPosterCard
                        key={story.id}
                        story={story}
                        size="lg"
                        onPreview={() => setSelectedStory(toReaderStory(story))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-3 space-y-5" dir="rtl">
              <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-white">إحصائيات القراءة</h3>
                  <BarChart3 size={17} className="text-fuchsia-400" />
                </div>

                <div className="space-y-4 text-[13px]">
                  {readingStats.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-2.5">
                          <Icon size={16} className={s.color} /> {s.label}
                        </span>
                        <span className="font-bold text-white" dir="ltr">
                          {s.value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/stats"
                  className="mt-5 block w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/[0.06] text-center text-[13px] font-bold text-slate-200 hover:bg-purple-500/10 transition"
                >
                  عرض التفاصيل
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-white/[0.06]">
                <h3 className="text-[15px] font-bold text-white mb-4">متابعة القراءة</h3>
                <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                  <img src={continueStory.cover} alt={continueStory.title} className="w-full h-[120px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/40 to-transparent" />
                  <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <p className="text-[13px] font-extrabold text-white" dir="ltr">
                      {continueStory.title}
                    </p>
                    <p className="text-[11px] text-slate-300">{continueStory.titleAr}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">التقدم</span>
                  <span className="font-bold text-white">{continueStory.progress ?? 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${continueStory.progress ?? 0}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStory(toReaderStory(continueStory))}
                  className="mt-4 block w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 text-center text-[13px] font-bold text-white shadow-lg shadow-purple-600/25 hover:brightness-110 transition"
                >
                  متابعة القصة
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-white/[0.06]">
                <h3 className="text-[15px] font-bold text-white mb-4">التصنيفات</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.name}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1424] border border-white/[0.05] opacity-80"
                        dir="rtl"
                        title="قريباً — تصفية حسب التصنيف"
                      >
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1 text-right">
                          <span className="block text-[12px] font-bold text-white whitespace-nowrap">{cat.name}</span>
                          <span className="block text-[10px] text-slate-400">{cat.count}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedStory && (
          <StoryReader key={selectedStory.id} story={selectedStory} onClose={() => setSelectedStory(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
