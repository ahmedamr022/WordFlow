import {
  MAIN_STORIES,
  RECOMMENDED_STORIES_DATA,
  SAMPLE_COURSES,
  type StoryItem } from
"@/data/stories";
import { storyCover } from "@/lib/assets";
import type { StoryPositionSummary } from "@/lib/stories/data";

/**
 * اختيار «قصة اليوم» + بناء كارت «متابعة القراءة».
 *
 * ── ما تغيّر في هذه الدفعة ───────────────────────────────────────────────────
 * الدالتان كانتا تبحثان في `MAIN_STORIES` / `RECOMMENDED_STORIES_DATA` فقط،
 * فالقصة التي ينشرها الأدمن لا تُرشَّح كقصة اليوم أبداً، وإذا قرأها المستخدم
 * لم يظهر لها كارت «متابعة القراءة» (لأن الـ slug غير موجود في الملف الثابت).
 *
 * الآن كلتاهما تقبل قائمة قصص جاهزة (`items`) — تمرّرها الداشبورد من
 * `listCatalogStories()` التي تدمج الثابت + الداتابيز. وبدون تمريرها تعمل
 * كالسابق بالحرف، فلا يوجد call site مكسور.
 */

export interface StoryHighlight {
  id: string;
  href: string;
  titleEn: string;
  titleAr: string;
  level: string;
  duration: string;
  cover: string;
  /** نسبة التقدم الحقيقية 0-100 */
  progress: number;
}

/** أي قصة تحمل الحد الأدنى الذي يحتاجه الكارت. */
export interface HighlightSource extends StoryItem {
  /** هل لها جُمل فعلية؟ الافتراضي يُحسب من الكتالوج الثابت. */
  hasContent?: boolean;
}

const STATIC_ITEMS: StoryItem[] = [...MAIN_STORIES, ...RECOMMENDED_STORIES_DATA];

/** القصص الثابتة التي لها محتوى فعلي (جُمل). */
const STATIC_PLAYABLE = new Set(
  SAMPLE_COURSES.flatMap((course) => course.stories).
  filter((story) => (story.lines?.length ?? 0) > 0).
  map((story) => story.id)
);

function isPlayable(item: HighlightSource): boolean {
  if (typeof item.hasContent === "boolean") return item.hasContent;
  return STATIC_PLAYABLE.has(item.id);
}

function toHighlight(item: HighlightSource, progress: number): StoryHighlight {
  return {
    id: item.id,
    href: `/story/${item.id}`,
    titleEn: item.titleEn,
    titleAr: item.titleAr,
    level: item.level,
    duration: item.duration,
    cover: item.cover || storyCover(item.id),
    progress: Math.max(0, Math.min(100, Math.round(progress)))
  };
}

/** hash بسيط ومستقر (لا Math.random حتى لا يختلف السيرفر عن العميل). */
function seedFrom(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * قصة اليوم: تتغيّر كل يوم بلا نمط، لكنها ثابتة خلال اليوم نفسه.
 * تُفضّل القصص القابلة للقراءة وغير المقفولة.
 */
export function pickStoryOfTheDay(
positions: Record<string, StoryPositionSummary> = {},
dateKey: string = todayKey(),
items: HighlightSource[] = STATIC_ITEMS)
: StoryHighlight | null {
  const open = items.filter((item) => !item.isLocked);
  const playable = open.filter(isPlayable);
  const pool = playable.length > 0 ? playable : open.length > 0 ? open : items;
  if (pool.length === 0) return null;

  // الترتيب مثبّت بالمعرّف حتى لا يتأثر الاختيار بترتيب وصول الصفوف.
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const pick = sorted[seedFrom(dateKey) % sorted.length];
  return toHighlight(pick, positions[pick.id]?.percent ?? 0);
}

/** آخر قصة لمسها المستخدم فعلاً — لكارت «متابعة القراءة» في الداشبورد. */
export function buildContinueHighlight(
continueSlug: string | null,
positions: Record<string, StoryPositionSummary> = {},
items: HighlightSource[] = STATIC_ITEMS)
: StoryHighlight | null {
  if (!continueSlug) return null;
  const item = items.find((entry) => entry.id === continueSlug);
  if (!item) return null;
  return toHighlight(item, positions[continueSlug]?.percent ?? 0);
}