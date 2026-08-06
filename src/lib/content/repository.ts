import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { MAIN_STORIES, getStoryById } from "@/data/stories";
import { VOCABULARY_CATEGORIES } from "@/data/vocabularyData";
import { storyCover, storyBackground } from "@/lib/assets";

/**
 * جواب السؤال ٨: لا — الواجهة حالياً لا تقرأ القصص ولا الكلمات من
 * الداتابيز إطلاقاً. كل شيء يأتي من `src/data/stories.ts` (64KB) و
 * `src/data/vocabularyData.ts` (83KB) وكلاهما يُشحن إلى المتصفح مع أول
 * صفحة. الجداول موجودة فعلاً في الميجريشن 0003 (`stories`,
 * `story_lines`, `words`, `category_words`) مع أعمدة `audio_url`، لكن
 * لا أحد يقرأ منها، والكاتب الوحيد هو `scripts/seed-content.ts`.
 *
 * الخطة هنا (وهي المسار الآمن للتحويل بدون كسر أي شاشة):
 *
 *   المرحلة ١ — استخدم هذا الملف كطبقة وصول واحدة. كل شاشة تستدعي
 *               `listStories()` / `getStory()` / `listVocabulary()` بدل
 *               الاستيراد المباشر من `@/data/*`.
 *   المرحلة ٢ — شغّل `scripts/seed-content.ts` لتعبئة الجداول.
 *   المرحلة ٣ — اضبط `CONTENT_SOURCE=db` في البيئة. لو أي استعلام رجع
 *               فارغاً، الطبقة ترتد تلقائياً إلى الملفات الثابتة، فلا
 *               تُظهر شاشة فارغة للمستخدم أبداً.
 *   المرحلة ٤ — بعد التأكد، احذف `src/data/*.ts` (يوفّر ~150KB من
 *               الباندل) واحذف كتلة الـ fallback من هذا الملف.
 *
 * ملاحظة أداء مهمة: القراءات هنا محتواة في `cache()` (لكل طلب) وجداول
 * المحتوى عامة و`select`-only في RLS، فيمكن لاحقاً تغليفها بـ
 * `unstable_cache` مع revalidate لأن المحتوى لا يتغير لكل مستخدم.
 */

export type ContentSource = "static" | "db";

export function contentSource(): ContentSource {
  return process.env.CONTENT_SOURCE === "db" ? "db" : "static";
}

export interface StorySummary {
  id: string;
  titleEn: string;
  titleAr: string;
  level: string;
  duration: string;
  cover: string;
  background: string;
  xpReward: number;
  isPublished: boolean;
}

export interface StoryLine {
  index: number;
  text: string;
  translationAr: string | null;
  /** من عمود story_lines.audio_url إن وُجد، وإلا المسار الاصطلاحي. */
  audioUrl: string | null;
}

export interface StoryDetail extends StorySummary {
  lines: StoryLine[];
}

export interface VocabularyWordRow {
  id: string;
  word: string;
  translationAr: string;
  ipa: string | null;
  partOfSpeech: string | null;
  cefrLevel: string;
  exampleEn: string | null;
  exampleAr: string | null;
  audioUrl: string | null;
}

// ——— بديل ثابت ———

function staticStories(): StorySummary[] {
  return MAIN_STORIES.map((story) => ({
    id: story.id,
    titleEn: story.titleEn,
    titleAr: story.titleAr,
    level: story.level,
    duration: story.duration,
    cover: storyCover(story.id),
    background: storyBackground(story.id),
    xpReward: Number.parseInt(story.xp, 10) || 0,
    isPublished: true
  }));
}

function staticStory(storyId: string): StoryDetail | null {
  const summary = staticStories().find((story) => story.id === storyId);
  if (!summary) return null;

  const source = getStoryById(storyId);
  const lines = (source?.lines ?? []) as Array<{
    text?: string;
    translationAr?: string;
  }>;

  return {
    ...summary,
    lines: lines.map((line, index) => ({
      index,
      text: String(line.text ?? ""),
      translationAr: line.translationAr ?? null,
      audioUrl: null
    }))
  };
}

function staticVocabulary(categoryId?: string): VocabularyWordRow[] {
  const categories = categoryId ?
  VOCABULARY_CATEGORIES.filter((category) => category.id === categoryId) :
  VOCABULARY_CATEGORIES;

  return categories.flatMap((category) =>
  category.words.map((word) => ({
    id: String(word.id),
    word: word.word,
    translationAr: word.translationAr,
    ipa: word.ipa ?? null,
    partOfSpeech: word.partOfSpeech ?? null,
    cefrLevel: String(word.cefrLevel ?? "A1"),
    exampleEn: word.exampleEn ?? null,
    exampleAr: word.exampleAr ?? null,
    audioUrl: null
  }))
  );
}

// ——— القراءة الفعلية ———

export const listStories = cache(async (): Promise<StorySummary[]> => {
  if (contentSource() === "static") return staticStories();

  const supabase = await createClient();
  const { data, error } = await supabase.
  from("stories").
  select(
    "id, title_en, title_ar, cefr_level, estimated_minutes, cover_image, bg_image, xp_reward, is_published"
  ).
  eq("is_published", true).
  order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return staticStories();

  return data.map((row) => ({
    id: String(row.id),
    titleEn: String(row.title_en ?? ""),
    titleAr: String(row.title_ar ?? ""),
    level: String(row.cefr_level ?? "A1"),
    duration: `${Number(row.estimated_minutes ?? 0)} دقيقة`,
    cover: row.cover_image as string | null ?? storyCover(String(row.id)),
    background: row.bg_image as string | null ?? storyBackground(String(row.id)),
    xpReward: Number(row.xp_reward ?? 0),
    isPublished: Boolean(row.is_published)
  }));
});

export const getStory = cache(async (storyId: string): Promise<StoryDetail | null> => {
  if (contentSource() === "static") return staticStory(storyId);

  const supabase = await createClient();

  const [storyRes, linesRes] = await Promise.all([
  supabase.
  from("stories").
  select(
    "id, title_en, title_ar, cefr_level, estimated_minutes, cover_image, bg_image, xp_reward, is_published"
  ).
  eq("id", storyId).
  maybeSingle(),
  supabase.
  from("story_lines").
  select("line_index, text, translation_ar, audio_url").
  eq("story_id", storyId).
  order("line_index", { ascending: true })]
  );

  const row = storyRes.data;
  if (!row) return staticStory(storyId);

  return {
    id: String(row.id),
    titleEn: String(row.title_en ?? ""),
    titleAr: String(row.title_ar ?? ""),
    level: String(row.cefr_level ?? "A1"),
    duration: `${Number(row.estimated_minutes ?? 0)} دقيقة`,
    cover: row.cover_image as string | null ?? storyCover(String(row.id)),
    background: row.bg_image as string | null ?? storyBackground(String(row.id)),
    xpReward: Number(row.xp_reward ?? 0),
    isPublished: Boolean(row.is_published),
    lines: (linesRes.data ?? []).map((line) => ({
      index: Number(line.line_index ?? 0),
      text: String(line.text ?? ""),
      translationAr: line.translation_ar as string | null ?? null,
      audioUrl: line.audio_url as string | null ?? null
    }))
  };
});

export const listVocabulary = cache(
  async (categoryId?: string): Promise<VocabularyWordRow[]> => {
    if (contentSource() === "static") return staticVocabulary(categoryId);

    const supabase = await createClient();

    let query = supabase.
    from("words").
    select(
      "id, word, translation_ar, ipa, part_of_speech, cefr_level, example_en, example_ar, audio_url"
    ).
    limit(2000);

    if (categoryId) {
      const { data: links } = await supabase.
      from("category_words").
      select("word_id").
      eq("category_id", categoryId);

      const ids = (links ?? []).map((link) => String(link.word_id));
      if (ids.length === 0) return staticVocabulary(categoryId);
      query = query.in("id", ids);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return staticVocabulary(categoryId);

    return data.map((row) => ({
      id: String(row.id),
      word: String(row.word ?? ""),
      translationAr: String(row.translation_ar ?? ""),
      ipa: row.ipa as string | null ?? null,
      partOfSpeech: row.part_of_speech as string | null ?? null,
      cefrLevel: String(row.cefr_level ?? "A1"),
      exampleEn: row.example_en as string | null ?? null,
      exampleAr: row.example_ar as string | null ?? null,
      audioUrl: row.audio_url as string | null ?? null
    }));
  }
);