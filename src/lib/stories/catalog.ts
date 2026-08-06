import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import {
  MAIN_STORIES,
  RECOMMENDED_STORIES_DATA,
  SAMPLE_COURSES,
  getStoryById,
  type StoryItem } from
"@/data/stories";
import { storyBackground, storyCover } from "@/lib/assets";
import { normalizeAppearance } from "@/lib/stories/appearance";
import { levelRank } from "@/data/storyGenres";
import type { StoryAppearance } from "@/types/admin";
import type { StoryLine } from "@/types";
import type { StoryPositionSummary } from "@/lib/stories/data";

/**
 * كتالوج القصص — مصدر واحد لكل الشاشات.
 *
 * ── المشكلة التي يحلّها هذا الملف ────────────────────────────────────────────
 * القصة التي يُنشئها الأدمن وينشرها كانت تُكتب فعلاً في جدول `stories` +
 * `story_lines`، لكن **لا شاشة واحدة كانت تقرأ الجدول**:
 *   · `/stories` كانت ترندر `MAIN_STORIES` و`RECOMMENDED_STORIES_DATA` من
 *     `src/data/stories.ts` (ملف ثابت).
 *   · `/story/[storyId]` كانت client component تنادي `getStoryById()` التي
 *     تبحث في نفس الملف الثابت فقط ⇒ أي قصة جديدة = «القصة غير موجودة».
 *   · الداشبورد كانت تختار «قصة اليوم» من `MAIN_STORIES` كذلك.
 * النتيجة: قصة منشورة بلا مكان في المكتبة وبلا صفحة.
 *
 * الحل هنا: طبقة واحدة تدمج **الكتالوج الثابت + القصص المنشورة من الداتابيز**،
 * وكل شاشة تستهلكها. الداتابيز تتقدّم على الثابت عند تشابه المعرّف (slug)،
 * وأي فشل في الاستعلام يرتد للكتالوج الثابت بهدوء فلا تنكسر شاشة أبداً.
 *
 * وأيضاً: «موصى به لك» صار حقيقياً — مبنياً على مستوى المستخدم
 * (`profiles.english_level`) وعلى تقدّمه، ويتغيّر كل يوم، ويحتوي قصصاً لها
 * صفحات فعلية (لا بطاقات ميتة).
 */

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type StorySource = "static" | "db";
export type CatalogLockType = "hidden" | "visible";

export interface CatalogStory extends StoryItem {
  source: StorySource;
  /** هل للقصة جُمل فعلية يمكن قراءتها؟ */
  hasContent: boolean;
  /** تاريخ الإنشاء (للداتابيز) — يغذّي شارة «جديد» والترتيب. */
  createdAt: string | null;
  lockType: CatalogLockType | null;
  lockMessage: string | null;
  descriptionAr: string;
}

export interface CatalogStoryDetail {
  id: string;
  source: StorySource;
  title: string;
  titleAr: string;
  cefrLevel: string;
  descriptionAr: string;
  descriptionEn: string;
  cover: string;
  background: string;
  estimatedMinutes: number;
  lines: StoryLine[];
  totalLines: number;
  appearance: StoryAppearance;
  access: {locked: boolean;lockType: CatalogLockType;lockMessage: string;};
}

interface StoryRow {
  id: string;
  slug: string;
  title_en: string | null;
  title_ar: string | null;
  description_ar: string | null;
  description_en: string | null;
  cefr_level: string | null;
  cover_image: string | null;
  bg_image: string | null;
  estimated_minutes: number | null;
  xp_reward: number | null;
  total_lines: number | null;
  status: string | null;
  is_published: boolean | null;
  access: unknown;
  appearance: unknown;
  created_at: string | null;
}

interface LineRow {
  line_index: number | null;
  text: string | null;
  translation_ar: string | null;
}

const STORY_COLUMNS =
"id, slug, title_en, title_ar, description_ar, description_en, cefr_level, cover_image, bg_image, estimated_minutes, xp_reward, total_lines, status, is_published, access, appearance, created_at";

/** القصص الثابتة التي لها جُمل فعلية. */
const STATIC_PLAYABLE = new Set(
  SAMPLE_COURSES.flatMap((course) => course.stories).
  filter((story) => (story.lines?.length ?? 0) > 0).
  map((story) => story.id)
);

function normalizeLevel(value: unknown, fallback = "A1"): string {
  const raw = String(value ?? "").toUpperCase();
  return CEFR.includes(raw) ? raw : fallback;
}

function parseAccess(input: unknown): CatalogStoryDetail["access"] {
  const raw = (input ?? {}) as Record<string, unknown>;
  const lockType = raw.lockType === "hidden" ? "hidden" : "visible";
  return {
    locked: Boolean(raw.locked),
    lockType,
    lockMessage:
    typeof raw.lockMessage === "string" && raw.lockMessage.trim() !== "" ?
    raw.lockMessage :
    "هذه القصة غير متاحة حالياً"
  };
}

function isRecent(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created < 14 * 24 * 60 * 60 * 1000;
}

function staticToCatalog(item: StoryItem): CatalogStory {
  const detail = getStoryById(item.id) as
  {descriptionAr?: string;lines?: unknown[];} |
  undefined;

  return {
    ...item,
    cover: item.cover || storyCover(item.id),
    source: "static",
    hasContent: STATIC_PLAYABLE.has(item.id) || (detail?.lines?.length ?? 0) > 0,
    createdAt: null,
    lockType: item.isLocked ? "visible" : null,
    lockMessage: null,
    descriptionAr: detail?.descriptionAr ?? ""
  };
}

function rowToCatalog(row: StoryRow): CatalogStory {
  const access = parseAccess(row.access);
  const appearance = normalizeAppearance(row.appearance);
  const cover =
  appearance.card.imageUrl ?? row.cover_image ?? storyCover(row.slug);
  const minutes = Math.max(1, Number(row.estimated_minutes ?? 5));

  return {
    id: row.slug,
    titleEn: String(row.title_en ?? row.slug),
    titleAr: String(row.title_ar ?? ""),
    level: normalizeLevel(row.cefr_level),
    duration: `${minutes} دقيقة`,
    rating: "4.8",
    xp: String(Math.max(0, Number(row.xp_reward ?? 0))),
    cover,
    bgImage: row.bg_image ?? undefined,
    isNew: isRecent(row.created_at),
    isLocked: access.locked,
    source: "db",
    hasContent: Number(row.total_lines ?? 0) > 0,
    createdAt: row.created_at ?? null,
    lockType: access.locked ? access.lockType : null,
    lockMessage: access.locked ? access.lockMessage : null,
    descriptionAr: String(row.description_ar ?? "")
  };
}

async function fetchPublishedRows(): Promise<StoryRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.
    from("stories").
    select(STORY_COLUMNS).
    is("deleted_at", null).
    in("status", ["published", "locked"]).
    order("created_at", { ascending: false }).
    limit(400);

    if (error || !data) return [];
    return data as unknown as StoryRow[];
  } catch {
    return [];
  }
}

/**
 * كل ما يجب أن يراه المستخدم: الكتالوج الثابت + كل قصة منشورة في الداتابيز.
 * القصص المقفولة نوع «مخفية تماماً» تُستبعد من القائمة نهائياً.
 */
export const listCatalogStories = cache(async (): Promise<CatalogStory[]> => {
  const rows = await fetchPublishedRows();

  const merged = new Map<string, CatalogStory>();

  for (const item of [...MAIN_STORIES, ...RECOMMENDED_STORIES_DATA]) {
    if (merged.has(item.id)) continue;
    merged.set(item.id, staticToCatalog(item));
  }

  for (const row of rows) {
    const mapped = rowToCatalog(row);
    if (mapped.isLocked && mapped.lockType === "hidden") {
      merged.delete(mapped.id);
      continue;
    }

    const previous = merged.get(mapped.id);
    merged.set(mapped.id, {
      ...mapped,
      // الغلاف الثابت يظل بديلاً لو لم يرفع الأدمن صورة بعد.
      cover: mapped.cover || previous?.cover || storyCover(mapped.id),
      hasContent: mapped.hasContent || Boolean(previous?.hasContent),
      descriptionAr: mapped.descriptionAr || previous?.descriptionAr || ""
    });
  }

  return [...merged.values()];
});

/** نسخة خفيفة للمكوّنات العميلة (بلا حقول سيرفر). */
export function toStoryItems(stories: CatalogStory[]): StoryItem[] {
  return stories.map((story) => ({
    id: story.id,
    titleEn: story.titleEn,
    titleAr: story.titleAr,
    level: story.level,
    duration: story.duration,
    rating: story.rating,
    xp: story.xp,
    progress: story.progress,
    cover: story.cover,
    bgImage: story.bgImage,
    isNew: story.isNew,
    isLocked: story.isLocked
  }));
}

/**
 * تفاصيل قصة واحدة للقراءة. الترتيب:
 *   ١) صف الداتابيز بالـ slug (هو المصدر لأي قصة أنشأها الأدمن).
 *   ٢) الكتالوج الثابت (تايتنك وأخواتها).
 * ولو الاثنان موجودان: بيانات الداتابيز تتقدّم، والجُمل تأتي من `story_lines`
 * إن وُجدت وإلا من الملف الثابت — فلا تفقد قصة قديمة محتواها عند نقلها.
 */
export const getCatalogStory = cache(
  async (slug: string): Promise<CatalogStoryDetail | null> => {
    if (!slug) return null;

    const staticStory = getStoryById(slug) as
    {
      id: string;
      title?: string;
      titleAr?: string;
      cefrLevel?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      estimatedMinutes?: number;
      lines?: StoryLine[];
    } |
    undefined;

    let row: StoryRow | null = null;
    let dbLines: StoryLine[] = [];

    try {
      const supabase = await createClient();
      const storyRes = await supabase.
      from("stories").
      select(STORY_COLUMNS).
      eq("slug", slug).
      is("deleted_at", null).
      maybeSingle();

      row = storyRes.data as unknown as StoryRow | null ?? null;

      if (row) {
        const linesRes = await supabase.
        from("story_lines").
        select("line_index, text, translation_ar").
        eq("story_id", row.id).
        order("line_index", { ascending: true });

        dbLines = (linesRes.data as unknown as LineRow[] | null ?? []).
        filter((line) => String(line.text ?? "").trim() !== "").
        map((line, index) => ({
          id: index + 1,
          text: String(line.text ?? "").trim(),
          translationAr: String(line.translation_ar ?? ""),
          words: []
        }));
      }
    } catch {
      row = null;
    }

    if (!row && !staticStory) return null;

    const lines =
    dbLines.length > 0 ?
    dbLines :
    (staticStory?.lines ?? []).map((line, index) => ({
      id: line.id ?? index + 1,
      text: line.text,
      translationAr: line.translationAr ?? "",
      words: line.words ?? []
    }));

    const appearance = normalizeAppearance(row?.appearance);
    const access = parseAccess(row?.access);
    const cover =
    row?.cover_image ??
    appearance.card.imageUrl ??
    storyCover(slug);
    const background =
    appearance.storyPage.imageUrl ??
    row?.bg_image ??
    storyBackground(slug);

    return {
      id: slug,
      source: row ? "db" : "static",
      title: String(row?.title_en ?? staticStory?.title ?? slug),
      titleAr: String(row?.title_ar ?? staticStory?.titleAr ?? ""),
      cefrLevel: normalizeLevel(row?.cefr_level ?? staticStory?.cefrLevel, "B1"),
      descriptionAr: String(row?.description_ar ?? staticStory?.descriptionAr ?? ""),
      descriptionEn: String(row?.description_en ?? staticStory?.descriptionEn ?? ""),
      cover,
      background,
      estimatedMinutes: Math.max(
        1,
        Number(row?.estimated_minutes ?? staticStory?.estimatedMinutes ?? 5)
      ),
      lines,
      totalLines: lines.length,
      appearance,
      access:
      row ?
      access :
      { locked: false, lockType: "visible", lockMessage: access.lockMessage }
    };
  }
);

/* ══════════════════════════════════════════════════════════════════════════
   التوصيات
   ══════════════════════════════════════════════════════════════════════════ */

/** hash ثابت (لا Math.random) حتى لا يختلف رندر السيرفر عن العميل. */
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

export interface RecommendOptions {
  stories: CatalogStory[];
  /** مستوى المستخدم من `profiles.english_level`. */
  level: string;
  positions?: Record<string, StoryPositionSummary>;
  dateKey?: string;
  limit?: number;
}

/**
 * ترشيح حقيقي:
 *   · القصص القابلة للقراءة فقط (لها جُمل) وغير المقفولة.
 *   · الأقرب لمستوى المستخدم أولاً (نفس المستوى ← ±1 ← الأبعد).
 *   · «بدأتها ولم تُكملها» تسبق «لم تبدأها»، والمكتملة في الآخر.
 *   · وداخل كل مجموعة ترتيب مُبدَّل بمفتاح اليوم ⇒ القائمة تتجدّد يومياً
 *     بلا عشوائية تكسر الـ hydration.
 */
export function recommendStories({
  stories,
  level,
  positions = {},
  dateKey = todayKey(),
  limit = 10
}: RecommendOptions): CatalogStory[] {
  const userRank = levelRank(normalizeLevel(level));

  const scored = stories.
  filter((story) => story.hasContent && !story.isLocked).
  map((story) => {
    const position = positions[story.id];
    const percent = position?.percent ?? 0;
    const completed = Boolean(position?.completed) || percent >= 100;

    const distance = Math.abs(levelRank(story.level) - userRank);
    // مرحلة التقدّم: ١ = قيد القراءة، ٢ = لم تبدأ، ٣ = مكتملة.
    const stage = completed ? 3 : percent > 0 ? 1 : 2;
    // القصص الأصعب بمستوى واحد أفضل من الأسهل بمستوى واحد.
    const direction = levelRank(story.level) < userRank ? 0.5 : 0;
    const jitter = seedFrom(`${dateKey}:${story.id}`) % 1000 / 1000;

    return {
      story: { ...story, progress: percent },
      rank: stage * 100 + distance * 10 + direction + jitter
    };
  });

  scored.sort((a, b) => a.rank - b.rank);
  return scored.slice(0, limit).map((entry) => entry.story);
}