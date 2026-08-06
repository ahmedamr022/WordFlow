import {
  Compass,
  Heart,
  SearchIcon,
  Rocket,
  BookMarked,
  GraduationCap,
  type LucideIcon } from
"lucide-react";

import { MAIN_STORIES, RECOMMENDED_STORIES_DATA, type StoryItem } from "@/data/stories";

/**
 * تصنيفات القصص (نوع القصة) — منفصلة تماماً عن المستوى (A1…C2).
 *
 * لماذا هذا الملف؟ كان في `src/data/stories.ts` ثابت `STORY_CATEGORIES` بأرقام
 * مكتوبة يدوياً («12 قصة») **وغير مستخدم في أي مكان** (grep = صفر نتائج خارج
 * تعريفه)، بينما اللوحة الجانبية في /stories كانت تعرض «المستويات» مكرِّرةً
 * نفس أزرار الفلترة الموجودة أعلى الشبكة.
 *
 * الآن: تصنيف حقيقي لكل قصة، والعدّادات تُحسب من البيانات لا تُكتب.
 * احذف `STORY_CATEGORIES` القديم بعد تطبيق هذه الحزمة.
 */

export type StoryGenreId =
"adventure" |
"romance" |
"mystery" |
"scifi" |
"classics" |
"educational";

export interface StoryGenre {
  id: StoryGenreId;
  label: string;
  icon: LucideIcon;
  /** لون النص/الأيقونة */
  color: string;
  /** لون الحد عند التفعيل */
  accent: string;
}

export const STORY_GENRES: StoryGenre[] = [
{
  id: "adventure",
  label: "مغامرة",
  icon: Compass,
  color: "#38BDF8",
  accent: "rgba(56,189,248,.55)"
},
{
  id: "romance",
  label: "رومانسية",
  icon: Heart,
  color: "#FB7185",
  accent: "rgba(251,113,133,.55)"
},
{
  id: "mystery",
  label: "غموض",
  icon: SearchIcon,
  color: "#C4B5FD",
  accent: "rgba(196,181,253,.55)"
},
{
  id: "scifi",
  label: "خيال علمي",
  icon: Rocket,
  color: "#2DD4BF",
  accent: "rgba(45,212,191,.55)"
},
{
  id: "classics",
  label: "كلاسيكيات",
  icon: BookMarked,
  color: "#FBBF24",
  accent: "rgba(251,191,36,.55)"
},
{
  id: "educational",
  label: "تعليمية",
  icon: GraduationCap,
  color: "#A3E635",
  accent: "rgba(163,230,53,.55)"
}];


/** slug القصة → تصنيفها. كل قصة في المشروع مغطّاة. */
export const STORY_GENRE_MAP: Record<string, StoryGenreId> = {
  "titanic-legend": "classics",
  "sherlock-holmes": "mystery",
  "great-gatsby": "classics",
  "pride-prejudice": "romance",
  "romeo-juliet": "romance",
  "ready-to-learn": "educational",
  "keep-going": "educational",
  "magic-bookshelf": "adventure",
  "the-letter": "mystery",
  "night-in-cairo": "adventure",
  "moby-dick": "adventure",
  "alice-wonderland": "adventure",
  "time-machine": "scifi",
  jekyll: "mystery",
  oz: "adventure",
  frankenstein: "scifi",
  "tom-sawyer": "adventure"
};

/** التصنيف الافتراضي لأي قصة جديدة لم تُضَف للخريطة بعد. */
const FALLBACK_GENRE: StoryGenreId = "adventure";

export function genreOf(storyId: string): StoryGenreId {
  return STORY_GENRE_MAP[storyId] ?? FALLBACK_GENRE;
}

export function isInGenre(storyId: string, genre: StoryGenreId | null): boolean {
  if (!genre) return true;
  return genreOf(storyId) === genre;
}

/** عدّاد حقيقي لكل تصنيف عبر كامل المكتبة. */
export function countStoriesByGenre(
stories: StoryItem[] = [...MAIN_STORIES, ...RECOMMENDED_STORIES_DATA])
: Record<StoryGenreId, number> {
  const counts = {
    adventure: 0,
    romance: 0,
    mystery: 0,
    scifi: 0,
    classics: 0,
    educational: 0
  } as Record<StoryGenreId, number>;

  for (const story of stories) {
    counts[genreOf(story.id)] += 1;
  }
  return counts;
}

/** ترتيب مستويات CEFR — يُستخدم للفرز «الأسهل أولاً». */
export const CEFR_ORDER: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

export function levelRank(level: string): number {
  return CEFR_ORDER[level?.toUpperCase?.() ?? ""] ?? 99;
}