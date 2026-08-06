"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, SparklesIcon } from "lucide-react";

import AppSidebar from "@/components/layout/app-sidebar";
import AppShellHeader from "@/components/layout/app-shell-header";
import StoriesFilterHeader, {
  type StorySortId } from
"@/components/stories/StoriesFilterHeader";
import StoryCard from "@/components/stories/StoryCard";
import StoriesRightPanel from "@/components/stories/StoriesRightPanel";
import { StoryModalProvider, useStoryModal } from "@/components/stories/StoryModalProvider";
import { type StoryItem } from "@/data/stories";
import { isInGenre, levelRank, STORY_GENRES, type StoryGenreId } from "@/data/storyGenres";
import type { StoriesOverview } from "@/lib/stories/data";

/**
 * الجزء التفاعلي من /stories.
 *
 * ما تغيّر في هذه الدفعة
 * ──────────────────────
 * ١) **الكتالوج يأتي props من السيرفر** (`catalog`) بدل استيراد المصفوفات
 *    الثابتة. أي قصة ينشرها الأدمن تظهر هنا فوراً، ولها كارت ومودال وصفحة.
 * ٢) **«موصى به لك» حقيقي**: قائمة مبنية على مستوى المستخدم وتقدّمه (تُحسب على
 *    السيرفر في `recommendStories`) وتتغيّر كل يوم — بدل مصفوفة ثابتة.
 * ٣) المودال صار من `StoryModalProvider` الموحّد، فنفس البطاقة تعطي نفس
 *    التجربة في المكتبة والداشبورد، وأغلفة قصص الداتابيز تُسجَّل تلقائياً.
 */

interface StoriesPageClientProps {
  overview: StoriesOverview;
  catalog: StoryItem[];
  recommended: StoryItem[];
  userLevel: string;
}

const INITIAL_LIMIT = 10;

const LEVEL_GROUPS: Record<string, string[]> = {
  مبتدئ: ["A1"],
  متوسط: ["A2", "B1"],
  متقدم: ["B2", "C1", "C2"]
};

function durationMinutes(duration: string): number {
  const parsed = parseInt(duration ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 999;
}

export default function StoriesPageClient(props: StoriesPageClientProps) {
  return (
    <StoryModalProvider positions={props.overview.positions} catalog={props.catalog}>
      <StoriesPageContent {...props} />
    </StoryModalProvider>);

}

function StoriesPageContent({
  overview,
  catalog,
  recommended,
  userLevel
}: StoriesPageClientProps) {
  const router = useRouter();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const { openStory } = useStoryModal();

  const [selectedLevel, setSelectedLevel] = useState("الكل");
  const [selectedGenre, setSelectedGenre] = useState<StoryGenreId | null>(null);
  const [selectedSort, setSelectedSort] = useState<StorySortId>("level-asc");
  const [expanded, setExpanded] = useState(false);

  /** يستبدل `progress` الثابت في بيانات المحتوى بالتقدم الحقيقي للمستخدم. */
  const withRealProgress = useCallback(
    (story: StoryItem): StoryItem => ({
      ...story,
      progress: overview.positions[story.id]?.percent ?? 0
    }),
    [overview.positions]
  );

  const allStories = useMemo(() => catalog.map(withRealProgress), [catalog, withRealProgress]);
  const recommendedStories = useMemo(
    () => recommended.map(withRealProgress),
    [recommended, withRealProgress]
  );

  const filteredMainStories = useMemo(() => {
    const levels = LEVEL_GROUPS[selectedLevel];

    const matches = allStories.filter((story) => {
      if (levels && !levels.includes(story.level)) return false;
      if (!isInGenre(story.id, selectedGenre)) return false;
      return true;
    });

    const sorted = [...matches];
    switch (selectedSort) {
      case "level-desc":
        sorted.sort((a, b) => levelRank(b.level) - levelRank(a.level));
        break;
      case "rating":
        sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case "duration":
        sorted.sort((a, b) => durationMinutes(a.duration) - durationMinutes(b.duration));
        break;
      case "level-asc":
      default:
        // الأسهل أولاً، والجديد يتقدّم عند تساوي المستوى.
        sorted.sort(
          (a, b) =>
          levelRank(a.level) - levelRank(b.level) ||
          Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) ||
          Number(b.rating) - Number(a.rating)
        );
        break;
    }
    return sorted;
  }, [allStories, selectedLevel, selectedGenre, selectedSort]);

  const displayedStories = useMemo(
    () => expanded ? filteredMainStories : filteredMainStories.slice(0, INITIAL_LIMIT),
    [filteredMainStories, expanded]
  );

  const remainingCount = filteredMainStories.length - displayedStories.length;

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setExpanded(false);
  };

  const handleGenreChange = (genre: StoryGenreId | null) => {
    setSelectedGenre(genre);
    setExpanded(false);
  };

  const collapseGrid = () => {
    setExpanded(false);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const continueStory = useMemo(() => {
    if (!overview.continueSlug) return null;
    const slug = overview.continueSlug;
    const meta = allStories.find((story) => story.id === slug);
    if (!meta) return null;
    const position = overview.positions[slug];
    return {
      id: slug,
      titleEn: meta.titleEn,
      titleAr: meta.titleAr,
      progress: position?.percent ?? 0,
      lineIndex: position?.lineIndex ?? 0,
      totalLines: position?.totalLines ?? 0
    };
  }, [overview.continueSlug, overview.positions, allStories]);

  const activeGenreLabel = selectedGenre ?
  STORY_GENRES.find((genre) => genre.id === selectedGenre)?.label ?? null :
  null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#03050b] font-cairo text-white" dir="rtl">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <AppShellHeader searchPlaceholder="ابحث في القصص..." />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col items-start gap-6 lg:flex-row">
            <aside className="w-full shrink-0 lg:w-[270px]">
              <StoriesRightPanel
                stats={{
                  storiesStarted: overview.storiesStarted,
                  storiesCompleted: overview.storiesCompleted,
                  averageAccuracy: overview.averageAccuracy,
                  wordsLearned: overview.wordsLearned
                }}
                continueStory={continueStory}
                activeGenre={selectedGenre}
                onSelectGenre={handleGenreChange}
                onOpenStory={(storyId) => router.push(`/story/${storyId}`)}
                isAuthenticated={overview.isAuthenticated} />

            </aside>

            <main className="w-full min-w-0 flex-1">
              <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
                  القصص 📖
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredMainStories.length} قصة متاحة · اكتشف قصصاً جديدة وتعلم بطريقة ممتعة
                </p>
              </div>

              {/* ═══ موصى به لك — أول ما يراه المستخدم، ومبني على مستواه ═══ */}
              {recommendedStories.length > 0 &&
              <section className="mb-10" aria-labelledby="recommended-stories">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2
                      id="recommended-stories"
                      className="flex items-center gap-2 text-xl font-bold text-white">

                        موصى به لك
                        <SparklesIcon className="h-4 w-4 text-amber-400" aria-hidden />
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-400">
                        مختارة لمستوى{" "}
                        <span className="font-en font-bold text-cyan-300">{userLevel}</span>{" "}
                        وتتحدّث كل يوم
                      </p>
                    </div>
                  </div>

                  <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
                  dir="ltr">

                    {recommendedStories.slice(0, 5).map((story) =>
                  <StoryCard
                    key={`recommended-${story.id}`}
                    story={story}
                    onClick={() => openStory(story.id)} />

                  )}
                  </div>
                </section>
              }

              <StoriesFilterHeader
                selectedCategory={selectedLevel}
                setSelectedCategory={handleLevelChange}
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
                resultCount={filteredMainStories.length} />


              {activeGenreLabel &&
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span>التصنيف:</span>
                  <button
                  type="button"
                  onClick={() => handleGenreChange(null)}
                  className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-purple-200 transition hover:bg-purple-500/20">

                    {activeGenreLabel} ✕
                  </button>
                </div>
              }

              {/* شبكة القصص — كل المكتبة، ثابتة كانت أو من الداتابيز */}
              <div
                ref={gridRef}
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
                dir="ltr">

                {displayedStories.map((story) =>
                <StoryCard key={story.id} story={story} onClick={() => openStory(story.id)} />
                )}

                {remainingCount > 0 &&
                <StoryCard
                  key="more-stories-card"
                  hasPlusOverlay
                  countPlus={remainingCount}
                  onPlusClick={() => setExpanded(true)} />

                }
              </div>

              {expanded && filteredMainStories.length > INITIAL_LIMIT &&
              <button
                type="button"
                onClick={collapseGrid}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b101d]/70 py-3 text-sm font-bold text-slate-300 transition hover:border-purple-500/50 hover:text-white">

                  <ChevronUp className="h-4 w-4" aria-hidden />
                  عرض أقل
                </button>
              }

              {filteredMainStories.length === 0 &&
              <div className="mt-6 rounded-2xl border border-white/5 bg-[#080c17]/50 py-12 text-center">
                  <p className="text-base font-bold text-slate-400">
                    لا توجد قصص مطابقة لهذه الفلترة.
                  </p>
                  <button
                  type="button"
                  onClick={() => {
                    handleLevelChange("الكل");
                    handleGenreChange(null);
                  }}
                  className="mt-3 rounded-xl border border-purple-500/30 px-4 py-2 text-sm font-bold text-purple-300 transition hover:bg-purple-500/15 hover:text-white">

                    إعادة ضبط الفلاتر
                  </button>
                </div>
              }
            </main>
          </div>
        </div>
      </div>

      <AppSidebar
        active="القصص"
        dailyXp={overview.dailyXp}
        dailyGoalXp={overview.dailyGoalXp}
        streak={overview.streak} />

    </div>);

}