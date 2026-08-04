"use client";

import React, { useState, useMemo } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import AppShellHeader from "@/components/layout/app-shell-header";
import StoriesFilterHeader from "@/components/stories/StoriesFilterHeader";
import StoryCard from "@/components/stories/StoryCard";
import StoriesRightPanel from "@/components/stories/StoriesRightPanel";
import StoryDetailsModal from "@/components/stories/StoryDetailsModal";
import { MAIN_STORIES, RECOMMENDED_STORIES_DATA } from "@/data/stories";
import { useRouter } from "next/navigation";

export default function StoriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedSort, setSelectedSort] = useState("الأحدث أولاً");

  // State للتحكم بفتح وإغلاق المودال والقصة المحددة
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const INITIAL_LIMIT = 4;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_LIMIT);

  const filteredMainStories = useMemo(() => {
    return MAIN_STORIES.filter((story) => {
      let matchCategory = true;
      if (selectedCategory === "مبتدئ") {
        matchCategory = story.level === "A1";
      } else if (selectedCategory === "متوسط") {
        matchCategory = story.level === "A2" || story.level === "B1";
      } else if (selectedCategory === "متقدم") {
        matchCategory = story.level === "B2" || story.level === "C1";
      }

      return matchCategory;
    }).sort((a, b) => {
      if (selectedSort === "الأعلى تقييماً") {
        return Number(b.rating) - Number(a.rating);
      }
      if (selectedSort === "الأقدم أولاً") {
        return Number(a.id) - Number(b.id);
      }
      return Number(b.id) - Number(a.id);
    });
  }, [selectedCategory, selectedSort]);

  const displayedStories = useMemo(() => {
    return filteredMainStories.slice(0, visibleCount);
  }, [filteredMainStories, visibleCount]);

  const remainingCount = filteredMainStories.length - displayedStories.length;

  const handleLoadMore = () => {
    setVisibleCount(filteredMainStories.length);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(INITIAL_LIMIT);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };

  return (
    <div className="flex h-screen bg-[#03050b] text-white overflow-hidden font-cairo" dir="rtl">
      
      {/* المنطقة الرئيسية */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <AppShellHeader />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* الشريط الجانبي مع ربط زر متابعة القراءة */}
            <aside className="w-full lg:w-[270px] shrink-0">
              <StoriesRightPanel 
                onContinueStory={(storyId) => router.push(`/story/${storyId}`)}
              />
            </aside>

            <main className="flex-1 min-w-0 w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  القصص 📖
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  اكتشف قصصاً جديدة وتعلم بطريقة ممتعة
                </p>
              </div>

              <StoriesFilterHeader
                selectedCategory={selectedCategory}
                setSelectedCategory={handleCategoryChange}
                selectedSort={selectedSort}
                setSelectedSort={handleSortChange}
              />

              {/* شبكة القصص الرئيسية */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mt-6"
                dir="ltr"
              >
                {displayedStories.map((story) => (
                  <StoryCard 
                    key={story.id} 
                    story={story} 
                    onClick={() => setSelectedStory(story)}
                  />
                ))}

                {remainingCount > 0 && (
                  <StoryCard 
                    key="more-stories-card"
                    hasPlusOverlay={true}
                    countPlus={remainingCount}
                    onPlusClick={handleLoadMore}
                  />
                )}
              </div>

              {filteredMainStories.length === 0 && (
                <div className="text-center py-12 bg-[#080c17]/50 border border-white/5 rounded-2xl mt-6">
                  <p className="text-slate-400 text-base font-bold">لا توجد قصص مطابقة للمستوى المحدد حالياً.</p>
                </div>
              )}

              {/* موصى به لك */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      موصى به لك <span className="text-amber-400">⭐</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                      قصص تناسب مستواك واهتماماتك
                    </p>
                  </div>
                </div>

                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4"
                  dir="ltr"
                >
                  {RECOMMENDED_STORIES_DATA.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      onClick={() => setSelectedStory(story)}
                    />
                  ))}
                </div>
              </div>

            </main>

          </div>
        </div>
      </div>

      <AppSidebar active="القصص" />

      {/* عرض المودال مع تمرير storyData بدقة وإرسال كل صور وتفاصيل القصة */}
      {selectedStory && (
        <StoryDetailsModal
          storyData={{
            id: String(selectedStory.id),
            titleEn: selectedStory.titleEn,
            titleAr: selectedStory.titleAr,
            description: selectedStory.description,
            level: selectedStory.level,
            duration: parseInt(selectedStory.duration || "10"),
            rating: Number(selectedStory.rating),
            progress: selectedStory.progress || 0,
            images: selectedStory.cover ? [selectedStory.cover] : undefined
          }}
          onClose={() => setSelectedStory(null)}
        />
      )}

    </div>
  );
}