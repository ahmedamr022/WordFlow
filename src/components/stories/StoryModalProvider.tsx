"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import StoryDetailsModal, { type StoryModalData } from "@/components/stories/StoryDetailsModal";
import { MAIN_STORIES, RECOMMENDED_STORIES_DATA, type StoryItem } from "@/data/stories";
import { registerStoryImages } from "@/lib/assets";
import type { StoryPositionSummary } from "@/lib/stories/data";

/**
 * يجعل مودال تفاصيل القصة متاحاً لأي كارت قصة في الصفحة.
 *
 * ما تغيّر في هذه الدفعة
 * ──────────────────────
 * المزوّد كان يبني الكتالوج من الملف الثابت فقط، فأي قصة أنشأها الأدمن كانت
 * تفتح مودالاً بلا عنوان ولا مستوى ولا صورة (اسمها فقط). الآن يقبل
 * `catalog` القادم من السيرفر (الثابت + الداتابيز) ويسجّل أغلفتها في
 * `registerStoryImages` مرّة واحدة، فيعمل سلايدشو المودال لكل القصص.
 */

interface StoryModalContextValue {
  openStory: (storyId: string) => void;
  closeStory: () => void;
}

const StoryModalContext = createContext<StoryModalContextValue | null>(null);

export function useStoryModal(): StoryModalContextValue {
  const context = useContext(StoryModalContext);
  if (!context) {
    throw new Error("useStoryModal لا بد أن يُستخدم داخل <StoryModalProvider>");
  }
  return context;
}

interface StoryModalProviderProps {
  /** slug → التقدم الحقيقي. من `getStoriesOverview()` على السيرفر. */
  positions?: Record<string, StoryPositionSummary>;
  /** الكتالوج الكامل من `listCatalogStories()` — يشمل قصص الداتابيز. */
  catalog?: StoryItem[];
  children: React.ReactNode;
}

export function StoryModalProvider({
  positions = {},
  catalog,
  children
}: StoryModalProviderProps) {
  const [selected, setSelected] = useState<StoryModalData | null>(null);

  const items = useMemo(() => {
    const merged = new Map<string, StoryItem>();
    for (const item of [...MAIN_STORIES, ...RECOMMENDED_STORIES_DATA]) {
      merged.set(item.id, item);
    }
    for (const item of catalog ?? []) {
      merged.set(item.id, { ...merged.get(item.id), ...item });
    }

    // القصص غير الموجودة في الملف الثابت تحتاج تسجيل صورها ليعمل السلايدشو.
    for (const item of merged.values()) {
      registerStoryImages(item.id, {
        cover: item.cover,
        background: item.bgImage ?? item.cover,
        gallery: [item.cover, item.bgImage]
      });
    }

    return [...merged.values()];
  }, [catalog]);

  const openStory = useCallback(
    (storyId: string) => {
      const meta = items.find((item) => item.id === storyId);
      const position = positions[storyId];

      setSelected({
        id: storyId,
        titleEn: meta?.titleEn,
        titleAr: meta?.titleAr,
        level: meta?.level,
        duration: parseInt(meta?.duration || "0", 10) || undefined,
        rating: meta?.rating ? Number(meta.rating) : undefined,
        progress: position?.percent ?? 0,
        linesCompleted: position?.linesCompleted ?? 0,
        totalLines: position?.totalLines ?? 0,
        bestAccuracy: position?.bestAccuracy ?? null,
        bestWpm: position?.bestWpm ?? null,
        completed: position?.completed ?? false
      });
    },
    [items, positions]
  );

  const closeStory = useCallback(() => setSelected(null), []);

  const value = useMemo(() => ({ openStory, closeStory }), [openStory, closeStory]);

  return (
    <StoryModalContext.Provider value={value}>
      {children}
      <StoryDetailsModal story={selected} onClose={closeStory} />
    </StoryModalContext.Provider>);

}

export default StoryModalProvider;