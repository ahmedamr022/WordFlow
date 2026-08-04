import { SAMPLE_COURSES, getStoryById, type ExtendedStory } from "@/data/stories";
import type { CEFRLevel } from "@/types";

export interface DisplayStory {
  id: string;
  /** Route id for `/story/[storyId]` — null when content is not yet available */
  playableId: string | null;
  title: string;
  titleAr: string;
  level: CEFRLevel;
  duration: string;
  cover: string;
  progress?: number;
  featured?: boolean;
  category?: "beginner" | "intermediate" | "advanced";
}

export const LEVEL_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  A1: { text: "#6EE7B7", bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.38)" },
  A2: { text: "#6EE7B7", bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.38)" },
  B1: { text: "#5EEAD4", bg: "rgba(20,184,166,0.14)", border: "rgba(20,184,166,0.38)" },
  B2: { text: "#5EEAD4", bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.38)" },
};

export const levelStyle = (lvl: string) => LEVEL_STYLES[lvl] ?? LEVEL_STYLES.B1;

export function formatDuration(minutes: number): string {
  return `${minutes} دقيقة`;
}

function cefrToCategory(cefr: CEFRLevel): DisplayStory["category"] {
  if (cefr === "A1") return "beginner";
  if (cefr === "A2") return "intermediate";
  return "advanced";
}

function storyToDisplay(story: ExtendedStory, extras?: Partial<DisplayStory>): DisplayStory {
  return {
    id: story.id,
    playableId: story.id,
    title: story.title,
    titleAr: story.titleAr,
    level: story.cefrLevel,
    duration: formatDuration(story.estimatedMinutes),
    cover: story.coverImage,
    category: cefrToCategory(story.cefrLevel),
    ...extras,
  };
}

/** All stories with playable content from `stories.ts` */
export function getAllPlayableStories(): DisplayStory[] {
  return SAMPLE_COURSES.flatMap((course) =>
    course.stories.map((story) => storyToDisplay(story as ExtendedStory))
  );
}

const FEATURED_IDS = [
  "titanic-legend",
  "sherlock-holmes",
  "great-gatsby",
  "pride-prejudice",
  "romeo-juliet",
] as const;

/** Primary carousel stories shown on /stories and /dashboard */
export const FEATURED_STORIES: DisplayStory[] = FEATURED_IDS.map((id) => {
  const story = getStoryById(id);
  if (!story) {
    throw new Error(`Missing featured story: ${id}`);
  }
  return storyToDisplay(story, {
    featured: id === "titanic-legend",
    progress: id === "titanic-legend" ? 65 : undefined,
  });
});

/** Upcoming classics — shown as “coming soon” in the UI */
const COMING_SOON_STORIES: DisplayStory[] = [
  {
    id: "time-machine",
    playableId: null,
    title: "The Time Machine",
    titleAr: "آلة الزمن",
    level: "B1",
    duration: "7 دقيقة",
    cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop",
    category: "intermediate",
  },
  {
    id: "jekyll-hyde",
    playableId: null,
    title: "Dr. Jekyll & Mr. Hyde",
    titleAr: "د. جيكل والسيد هايد",
    level: "B2",
    duration: "11 دقيقة",
    cover: "https://images.unsplash.com/photo-1509245858460-803769f7045d?q=80&w=800&auto=format&fit=crop",
    category: "advanced",
  },
  {
    id: "wizard-oz",
    playableId: null,
    title: "The Wonderful Wizard of Oz",
    titleAr: "ساحر أوز الرائع",
    level: "A2",
    duration: "9 دقيقة",
    cover: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800&auto=format&fit=crop",
    category: "beginner",
  },
  {
    id: "frankenstein",
    playableId: null,
    title: "Frankenstein",
    titleAr: "فرانكنشتاين",
    level: "B2",
    duration: "13 دقيقة",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    category: "advanced",
  },
];

/** Playable stories outside the featured carousel, plus upcoming titles */
export const RECOMMENDED_STORIES: DisplayStory[] = [
  ...getAllPlayableStories().filter((story) => !FEATURED_IDS.includes(story.id as (typeof FEATURED_IDS)[number])),
  ...COMING_SOON_STORIES,
];

const FILTER_MAP: Record<string, DisplayStory["category"] | "all"> = {
  الكل: "all",
  مبتدئ: "beginner",
  متوسط: "intermediate",
  متقدم: "advanced",
};

export function filterStoriesByLevel(stories: DisplayStory[], filterLabel: string): DisplayStory[] {
  const level = FILTER_MAP[filterLabel] ?? "all";
  if (level === "all") return stories;
  return stories.filter((s) => s.category === level);
}

export function getStoryHref(story: DisplayStory): string | null {
  return story.playableId ? `/story/${story.playableId}` : null;
}

export function getContinueReadingStory(): DisplayStory {
  return FEATURED_STORIES[0];
}

export function getTotalPlayableStoryCount(): number {
  return getAllPlayableStories().length;
}

export function getMoreStoriesCount(shownCount: number): number {
  return Math.max(0, getTotalPlayableStoryCount() - shownCount);
}

export function toReaderStory(story: DisplayStory) {
  const playable = story.playableId ? getStoryById(story.playableId) : undefined;
  return {
    id: story.id,
    playableId: story.playableId,
    title: story.title,
    titleAr: story.titleAr,
    level: story.level,
    duration: story.duration,
    cover: story.cover,
    progress: story.progress,
    words: playable?.totalWords,
    descriptionEn: playable?.descriptionEn,
  };
}