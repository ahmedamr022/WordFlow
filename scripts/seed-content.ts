/**
 * WordFlow · نقل المحتوى من ملفات static إلى قاعدة البيانات
 * ---------------------------------------------------------------------------
 * التشغيل من Root المشروع:
 *   pnpm exec tsx scripts/seed-content.ts
 *
 * آمن للتكرار:
 * - courses           → upsert على slug
 * - stories           → upsert على slug
 * - story_lines       → upsert على story_id + line_index
 * - words             → upsert على normalized + part_of_speech
 * - vocabulary_categories → upsert على slug
 * - category_words    → upsert على category_id + word_id
 * - story_line_words  → upsert على line_id + word_index
 *
 * مهم:
 * لا تحذف src/data/*.ts إلا بعد التأكد أن القراءة من الداتابيز تعمل.
 * ---------------------------------------------------------------------------
 */

import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { SAMPLE_COURSES } from "../src/data/stories";
import { VOCABULARY_CATEGORIES } from "../src/data/vocabularyData";

const staticStories = SAMPLE_COURSES.flatMap((course) => course.stories);
const vocabularyData = VOCABULARY_CATEGORIES;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "✖ NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY مطلوبان"
  );
  process.exit(1);
}

const db = createClient(url, key, {
  auth: {
    persistSession: false,
  },
});

const report: Record<string, number> = {};

const bump = (table: string, n: number) => {
  report[table] = (report[table] ?? 0) + n;
};

const normalize = (value: string) => value.trim().toLowerCase();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * القاموس المركزي:
 *
 * normalized|part_of_speech → UUID
 *
 * مثال:
 * mother|noun → uuid
 */
const wordIds = new Map<string, string>();

/* -------------------------------------------------------------------------- */
/* WORDS                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertWords(
  input: {
    word: string;
    translation_ar: string;
    ipa?: string | null;
    part_of_speech?: string | null;
    cefr_level?: string | null;
    example_en?: string | null;
    example_ar?: string | null;
    audio_url?: string | null;
  }[]
) {
  /**
   * إزالة التكرار من البيانات قبل إرسالها.
   *
   * نفس الكلمة ممكن تظهر في أكثر من category.
   * المفتاح:
   *
   * normalized + part_of_speech
   */
  const unique = new Map<string, (typeof input)[number]>();

  for (const word of input) {
    if (!word.word?.trim()) continue;
    if (!word.translation_ar?.trim()) continue;

    const pos = word.part_of_speech?.trim() || "unknown";

    const key = `${normalize(word.word)}|${pos}`;

    unique.set(key, {
      ...word,
      part_of_speech: pos,
    });
  }

  const rows = [...unique.values()];

  console.log(`→ تجهيز ${rows.length} كلمة...`);

  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);

    const { data, error } = await db
      .from("words")
      .upsert(chunk, {
        onConflict: "normalized,part_of_speech",
      })
      .select("id, normalized, part_of_speech");

    if (error) {
      throw new Error(`words: ${error.message}`);
    }

    for (const row of data ?? []) {
      wordIds.set(
        `${row.normalized}|${row.part_of_speech}`,
        row.id
      );
    }

    bump("words", chunk.length);
  }
}

/* -------------------------------------------------------------------------- */
/* COURSES                                                                    */
/* -------------------------------------------------------------------------- */

async function seedCourses() {
  const levels = [
    ...new Set(
      staticStories.map((story: any) => story.level ?? "A1")
    ),
  ];

  const rows = levels.map((level, index) => ({
    slug: `level-${String(level).toLowerCase()}`,
    title_en: `Level ${level}`,
    title_ar: `المستوى ${level}`,
    description_ar: `قصص تفاعلية لمستوى ${level}`,
    cefr_level: level,
    sort_order: index,
    is_published: true,
  }));

  const { data, error } = await db
    .from("courses")
    .upsert(rows, {
      onConflict: "slug",
    })
    .select("id, slug");

  if (error) {
    throw new Error(`courses: ${error.message}`);
  }

  bump("courses", rows.length);

  return new Map(
    (data ?? []).map((course) => [
      course.slug,
      course.id,
    ])
  );
}

/* -------------------------------------------------------------------------- */
/* STORIES                                                                    */
/* -------------------------------------------------------------------------- */

async function seedStories(
  courseIds: Map<string, string>
) {
  const rows = staticStories.map((story: any, index: number) => ({
    slug:
      story.slug ??
      slugify(
        story.title ??
          story.titleEn ??
          `story-${index}`
      ),

    course_id:
      courseIds.get(
        `level-${String(
          story.level ?? "A1"
        ).toLowerCase()}`
      ) ?? null,

    title_en:
      story.titleEn ??
      story.title ??
      "Untitled",

    title_ar:
      story.titleAr ??
      story.title ??
      "بدون عنوان",

    description_ar:
      story.descriptionAr ??
      story.description ??
      null,

    description_en:
      story.descriptionEn ??
      null,

    cefr_level:
      story.level ??
      "A1",

    cover_image:
      story.coverImage ??
      story.image ??
      null,

    bg_image:
      story.bgImage ??
      null,

    estimated_minutes:
      story.estimatedMinutes ??
      5,

    xp_reward:
      story.xpReward ??
      50,

    sort_order: index,

    is_published: true,

    is_premium: false,
  }));

  const { data, error } = await db
    .from("stories")
    .upsert(rows, {
      onConflict: "slug",
    })
    .select("id, slug");

  if (error) {
    throw new Error(`stories: ${error.message}`);
  }

  bump("stories", rows.length);

  return new Map(
    (data ?? []).map((story) => [
      story.slug,
      story.id,
    ])
  );
}

/* -------------------------------------------------------------------------- */
/* STORY LINES                                                                */
/* -------------------------------------------------------------------------- */

async function seedStoryLines(
  storyIds: Map<string, string>
) {
  for (const [index, story] of staticStories.entries()) {
    const s: any = story;

    const slug =
      s.slug ??
      slugify(
        s.title ??
          s.titleEn ??
          `story-${index}`
      );

    const storyId = storyIds.get(slug);

    if (!storyId) continue;

    const lines: any[] =
      s.lines ??
      s.sentences ??
      [];

    const rows = lines
      .map((line, lineIndex) => ({
        story_id: storyId,

        line_index: lineIndex,

        text:
          typeof line === "string"
            ? line
            : line.text ??
              line.en ??
              "",

        translation_ar:
          typeof line === "string"
            ? null
            : line.translation ??
              line.ar ??
              null,

        audio_url:
          typeof line === "string"
            ? null
            : line.audioUrl ??
              null,
      }))
      .filter(
        (row) =>
          row.text.trim().length > 0
      );

    if (!rows.length) continue;

    const { error } = await db
      .from("story_lines")
      .upsert(rows, {
        onConflict:
          "story_id,line_index",
      });

    if (error) {
      throw new Error(
        `story_lines[${slug}]: ${error.message}`
      );
    }

    bump("story_lines", rows.length);
  }
}

/* -------------------------------------------------------------------------- */
/* VOCABULARY                                                                 */
/* -------------------------------------------------------------------------- */

async function seedVocabulary() {
  const categories = Array.isArray(vocabularyData)
    ? vocabularyData
    : Object.values(
        vocabularyData as Record<string, any>
      );

  /* ---------------------------------------------------------------------- */
  /* 1. WORDS                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * ملاحظة مهمة:
   *
   * vocabularyData.ts يستخدم:
   *
   * translationAr
   * partOfSpeech
   * cefrLevel
   * exampleEn
   * exampleAr
   *
   * وليس:
   *
   * translation
   * level
   * example
   */

  const allWords = categories.flatMap(
    (category: any) =>
      (category.words ?? []).map(
        (word: any) => ({
          word:
            word.word ??
            word.en ??
            "",

          translation_ar:
            word.translationAr ??
            word.translation ??
            word.ar ??
            "",

          ipa:
            word.ipa ??
            null,

          part_of_speech:
            word.partOfSpeech ??
            word.pos ??
            "unknown",

          cefr_level:
            word.cefrLevel ??
            word.level ??
            "A1",

          example_en:
            word.exampleEn ??
            word.example ??
            null,

          example_ar:
            word.exampleAr ??
            null,

          audio_url:
            word.audioUrl ??
            null,
        })
      )
  );

  await upsertWords(allWords);

  /* ---------------------------------------------------------------------- */
  /* 2. VOCABULARY CATEGORIES                                               */
  /* ---------------------------------------------------------------------- */

  const categoryRows =
    categories.map(
      (category: any, index: number) => ({
        slug:
          category.id ??
          category.slug ??
          slugify(
            category.titleEn ??
              category.title ??
              `category-${index}`
          ),

        title_ar:
          category.titleAr ??
          category.title ??
          "تصنيف",

        title_en:
          category.titleEn ??
          category.title ??
          "Category",

        description_ar:
          category.descAr ??
          category.descriptionAr ??
          null,

        icon:
          category.icon ??
          null,

        cover_image:
          category.coverImage ??
          category.image ??
          null,

        sort_order: index,

        is_published: true,
      })
    );

  const {
    data: categoryData,
    error: categoryError,
  } = await db
    .from("vocabulary_categories")
    .upsert(categoryRows, {
      onConflict: "slug",
    })
    .select("id, slug");

  if (categoryError) {
    throw new Error(
      `vocabulary_categories: ${categoryError.message}`
    );
  }

  bump(
    "vocabulary_categories",
    categoryRows.length
  );

  const categoryIds = new Map(
    (categoryData ?? []).map(
      (category) => [
        category.slug,
        category.id,
      ]
    )
  );

  /* ---------------------------------------------------------------------- */
  /* 3. CATEGORY ↔ WORDS                                                    */
  /* ---------------------------------------------------------------------- */

  for (
    const [index, category] of categories.entries()
  ) {
    const c: any = category;

    const slug =
      c.id ??
      c.slug ??
      slugify(
        c.titleEn ??
          c.title ??
          `category-${index}`
      );

    const categoryId =
      categoryIds.get(slug);

    if (!categoryId) continue;

    const links = (c.words ?? [])
      .map(
        (word: any, order: number) => {
          const normalizedWord =
            normalize(
              word.word ??
                word.en ??
                ""
            );

          const partOfSpeech =
            word.partOfSpeech ??
            word.pos ??
            "unknown";

          const wordId =
            wordIds.get(
              `${normalizedWord}|${partOfSpeech}`
            );

          if (!wordId) {
            return null;
          }

          return {
            category_id: categoryId,
            word_id: wordId,
            sort_order: order,
          };
        }
      )
      .filter(Boolean);

    if (!links.length) continue;

    const { error } = await db
      .from("category_words")
      .upsert(links as any[], {
        onConflict:
          "category_id,word_id",
      });

    if (error) {
      throw new Error(
        `category_words[${slug}]: ${error.message}`
      );
    }

    bump(
      "category_words",
      links.length
    );
  }
}

/* -------------------------------------------------------------------------- */
/* STORY LINE ↔ WORDS                                                         */
/* -------------------------------------------------------------------------- */

async function linkStoryLineWords() {
  const {
    data: lines,
    error,
  } = await db
    .from("story_lines")
    .select("id, text")
    .limit(20000);

  if (error) {
    throw new Error(
      `story_lines fetch: ${error.message}`
    );
  }

  const links: {
    line_id: string;
    word_index: number;
    word_id: string;
  }[] = [];

  for (const line of lines ?? []) {
    const tokens =
      line.text.split(/\s+/);

    tokens.forEach(
      (token: string, index: number) => {
        const clean = normalize(
          token.replace(
            /[^A-Za-z'-]/g,
            ""
          )
        );

        if (!clean) return;

        /**
         * نحاول أولاً unknown.
         * لو مش موجود، ندور على أي part_of_speech
         * لنفس الكلمة.
         */
        const exactId =
          wordIds.get(
            `${clean}|unknown`
          );

        const fallbackId =
          [...wordIds.entries()].find(
            ([key]) =>
              key.startsWith(
                `${clean}|`
              )
          )?.[1];

        const wordId =
          exactId ??
          fallbackId;

        if (!wordId) return;

        links.push({
          line_id: line.id,
          word_index: index,
          word_id: wordId,
        });
      }
    );
  }

  for (
    let i = 0;
    i < links.length;
    i += 1000
  ) {
    const chunk =
      links.slice(i, i + 1000);

    const {
      error: linkError,
    } = await db
      .from("story_line_words")
      .upsert(chunk, {
        onConflict:
          "line_id,word_index",
      });

    if (linkError) {
      throw new Error(
        `story_line_words: ${linkError.message}`
      );
    }

    bump(
      "story_line_words",
      chunk.length
    );
  }
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log(
    "→ بدء نقل المحتوى...\n"
  );

  const courseIds =
    await seedCourses();

  const storyIds =
    await seedStories(courseIds);

  await seedStoryLines(
    storyIds
  );

  await seedVocabulary();

  await linkStoryLineWords();

  console.log(
    "\n✔ اكتمل النقل:\n"
  );

  for (
    const [table, count] of Object.entries(
      report
    )
  ) {
    console.log(
      `   ${table.padEnd(24)} ${count}`
    );
  }
}

main().catch((error) => {
  console.error(
    "\n✖ فشل النقل:",
    error instanceof Error
      ? error.message
      : error
  );

  process.exit(1);
});