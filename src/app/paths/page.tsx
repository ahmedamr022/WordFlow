"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SAMPLE_COURSES, type ExtendedStory } from "@/data/stories";
import { Compass, Play } from "lucide-react";

export default function PathsPage() {
  const allStories: ExtendedStory[] = SAMPLE_COURSES.flatMap((c) => c.stories as ExtendedStory[]);

  const beginnerStories = allStories.filter((s) => s.cefrLevel === "A1");
  const intermediateStories = allStories.filter((s) => s.cefrLevel === "A2");
  const advancedStories = allStories.filter((s) => s.cefrLevel === "B1" || s.cefrLevel === "B2");

  const renderStoryGrid = (stories: typeof allStories) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/story/${story.id}`}
          className="relative rounded-3xl overflow-hidden glass-card glass-card-hover border border-slate-800 flex flex-col justify-between group shadow-xl transition-all"
        >
          {/* Top Cover Image Area */}
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/30 to-transparent" />

            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-sky-400 text-xs font-mono font-bold border border-sky-400/30">
              مستوى {story.cefrLevel}
            </span>
          </div>

          {/* Bottom Info & Description Area */}
          <div className="p-6 flex flex-col justify-between bg-[#080b11] border-t border-slate-800/80 space-y-3 min-h-[140px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-extrabold text-white font-sans group-hover:text-sky-400 transition-colors">
                  {story.title}
                </h3>

                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-400 group-hover:text-slate-950 transition-all shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current rotate-180" />
                </div>
              </div>

              <p className="text-xs text-sky-400 font-arabic font-bold mb-2">{story.titleAr}</p>
              <p className="text-xs text-slate-300 leading-relaxed font-arabic">
                {story.descriptionAr}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex font-arabic dir-rtl selection:bg-[#ff6b6b]">
      {/* App Sidebar */}
      <AppSidebar active="المسارات" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 px-8 border-b border-slate-800/80 flex items-center justify-between bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2 text-base font-extrabold text-white">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>مسارات التعلم والاستكشاف</span>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto w-full space-y-14">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">مسارات التعلم التفاعلية</h1>
            <p className="text-sm text-slate-400">
              قصص مقسمة حسب مستوى الصعوبة بحصيلة مفردات حقيقية وسطور تفاعلية.
            </p>
          </div>

          {/* Section 1: Beginner Level A1 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                <h2 className="text-2xl font-extrabold text-white font-sans">
                  مستوى مبتدئ • A1
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {beginnerStories.length} قصص
              </span>
            </div>
            {renderStoryGrid(beginnerStories)}
          </section>

          {/* Section 2: Intermediate Level A2 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50" />
                <h2 className="text-2xl font-extrabold text-white font-sans">
                  مستوى متوسط •• A2
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {intermediateStories.length} قصص
              </span>
            </div>
            {renderStoryGrid(intermediateStories)}
          </section>

          {/* Section 3: Advanced Level B1/B2 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#ff6b6b] shadow-lg shadow-[#ff6b6b]/50" />
                <h2 className="text-2xl font-extrabold text-white font-sans">
                  مستوى متقدم ••• B1 / B2
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {advancedStories.length} قصص
              </span>
            </div>
            {renderStoryGrid(advancedStories)}
          </section>
        </main>
      </div>
    </div>
  );
}
