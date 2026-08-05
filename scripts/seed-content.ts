/**
 * WordFlow · نقل المحتوى من ملفات static إلى قاعدة البيانات
 * ---------------------------------------------------------------------------
 * التشغيل:  npx tsx scripts/seed-content.ts
 * آمن للتكرار: كل الكتابات upsert معتمدة على slug / normalized.
 * الترتيب: courses → stories → story_lines → words → categories → روابط الربط
 * ---------------------------------------------------------------------------
 * تحذير توقيت: لا تحذف src/data/*.ts إلا بعد التأكد أن القراءة من الداتابيز
 * تعمل على بيئة الاختبار. الحذف المبكر = صفحات فاضية بلا طريق رجوع.
 */

import { createClient } from "@supabase/supabase-js";
import { stories as staticStories } from "../src/data/stories";
import { vocabularyData } from "../src/data/vocabularyData";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✖ NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY مطلوبان");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const report: Record<string, number> = {};
const bump = (table: string, n: number) => report[table] = (report[table] ?? 0) + n;

const normalize = (w: string) => w.trim().toLowerCase();
const slugify = (s: string) =>
s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** القاموس المركزي في الذاكرة: مفتاح (normalized|pos) → id */
const wordIds = new Map<string, string>();

async function upsertWords(
input: {word: string;translation_ar: string;ipa?: string;part_of_speech?: string;
  cefr_level?: string;example_en?: string;example_ar?: string;audio_url?: string;}[])
{
  // إزالة التكرار قبل الإرسال — نفس الكلمة تتكرر عبر التصنيفات وداخل القصص
  const unique = new Map<string, (typeof input)[number]>();
  for (const w of input) {
    if (!w.word?.trim() || !w.translation_ar?.trim()) continue;
    const pos = w.part_of_speech ?? "unknown";
    unique.set(`${normalize(w.word)}|${pos}`, { ...w, part_of_speech: pos });
  }

  const rows = [...unique.values()];
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { data, error } = await db.
    from("words").
    upsert(chunk, { onConflict: "normalized,part_of_speech" }).
    select("id, normalized, part_of_speech");
    if (error) throw new Error(`words: ${error.message}`);
    for (const row of data ?? []) {
      wordIds.set(`${row.normalized}|${row.part_of_speech}`, row.id);
    }
    bump("words", chunk.length);
  }
}

async function seedCourses() {
  const levels = [...new Set(staticStories.map((s: any) => s.level ?? "A1"))];
  const rows = levels.map((level, index) => ({
    slug: `level-${String(level).toLowerCase()}`,
    title_en: `Level ${level}`,
    title_ar: `المستوى ${level}`,
    description_ar: `قصص تفاعلية لمستوى ${level}`,
    cefr_level: level,
    sort_order: index,
    is_published: true
  }));
  const { data, error } = await db.from("courses").upsert(rows, { onConflict: "slug" }).select("id, slug");
  if (error) throw new Error(`courses: ${error.message}`);
  bump("courses", rows.length);
  return new Map((data ?? []).map((c) => [c.slug, c.id]));
}

async function seedStories(courseIds: Map<string, string>) {
  const rows = staticStories.map((s: any, index: number) => ({
    slug: s.slug ?? slugify(s.title ?? s.titleEn ?? `story-${index}`),
    course_id: courseIds.get(`level-${String(s.level ?? "A1").toLowerCase()}`) ?? null,
    title_en: s.titleEn ?? s.title ?? "Untitled",
    title_ar: s.titleAr ?? s.title ?? "بدون عنوان",
    description_ar: s.descriptionAr ?? s.description ?? null,
    description_en: s.descriptionEn ?? null,
    cefr_level: s.level ?? "A1",
    cover_image: s.coverImage ?? s.image ?? null,
    bg_image: s.bgImage ?? null,
    estimated_minutes: s.estimatedMinutes ?? 5,
    xp_reward: s.xpReward ?? 50,
    sort_order: index,
    is_published: true,
    is_premium: false
  }));

  const { data, error } = await db.from("stories").upsert(rows, { onConflict: "slug" }).select("id, slug");
  if (error) throw new Error(`stories: ${error.message}`);
  bump("stories", rows.length);
  return new Map((data ?? []).map((s) => [s.slug, s.id]));
}

async function seedStoryLines(storyIds: Map<string, string>) {
  for (const [index, story] of staticStories.entries()) {
    const s: any = story;
    const slug = s.slug ?? slugify(s.title ?? s.titleEn ?? `story-${index}`);
    const storyId = storyIds.get(slug);
    if (!storyId) continue;

    const lines: any[] = s.lines ?? s.sentences ?? [];
    const rows = lines.map((line, lineIndex) => ({
      story_id: storyId,
      line_index: lineIndex,
      text: typeof line === "string" ? line : line.text ?? line.en ?? "",
      translation_ar: typeof line === "string" ? null : line.translation ?? line.ar ?? null,
      audio_url: typeof line === "string" ? null : line.audioUrl ?? null
    })).filter((r) => r.text.trim().length > 0);

    if (!rows.length) continue;
    const { error } = await db.from("story_lines").upsert(rows, { onConflict: "story_id,line_index" });
    if (error) throw new Error(`story_lines[${slug}]: ${error.message}`);
    bump("story_lines", rows.length);
  }
}

async function seedVocabulary() {
  const categories: any[] = Array.isArray(vocabularyData) ?
  vocabularyData :
  Object.values(vocabularyData as Record<string, any>);

  // 1) كل الكلمات دفعة واحدة في القاموس المركزي
  const allWords = categories.flatMap((c: any) =>
  (c.words ?? []).map((w: any) => ({
    word: w.word ?? w.en,
    translation_ar: w.translation ?? w.ar ?? "",
    ipa: w.ipa ?? null,
    part_of_speech: w.partOfSpeech ?? w.pos ?? "unknown",
    cefr_level: w.level ?? c.level ?? "A1",
    example_en: w.example ?? w.exampleEn ?? null,
    example_ar: w.exampleAr ?? null,
    audio_url: w.audioUrl ?? null
  }))
  );
  await upsertWords(allWords);

  // 2) التصنيفات
  const catRows = categories.map((c: any, index: number) => ({
    slug: c.slug ?? slugify(c.titleEn ?? c.title ?? `category-${index}`),
    title_ar: c.titleAr ?? c.title ?? "تصنيف",
    title_en: c.titleEn ?? c.title ?? "Category",
    description_ar: c.descriptionAr ?? null,
    icon: c.icon ?? null,
    cover_image: c.coverImage ?? c.image ?? null,
    sort_order: index,
    is_published: true
  }));
  const { data: catData, error: catError } = await db.
  from("vocabulary_categories").
  upsert(catRows, { onConflict: "slug" }).
  select("id, slug");
  if (catError) throw new Error(`vocabulary_categories: ${catError.message}`);
  bump("vocabulary_categories", catRows.length);

  const catIds = new Map((catData ?? []).map((c) => [c.slug, c.id]));

  // 3) روابط الربط — نربط بدل ما ننسخ، فعدّاد الكلمات المتعلَّمة يبقى صحيحاً
  for (const [index, c] of categories.entries()) {
    const slug = (c as any).slug ?? slugify((c as any).titleEn ?? (c as any).title ?? `category-${index}`);
    const categoryId = catIds.get(slug);
    if (!categoryId) continue;

    const links = ((c as any).words ?? []).
    map((w: any, order: number) => {
      const id = wordIds.get(`${normalize(w.word ?? w.en ?? "")}|${w.partOfSpeech ?? w.pos ?? "unknown"}`);
      return id ? { category_id: categoryId, word_id: id, sort_order: order } : null;
    }).
    filter(Boolean);

    if (!links.length) continue;
    const { error } = await db.from("category_words").upsert(links as any[], {
      onConflict: "category_id,word_id"
    });
    if (error) throw new Error(`category_words[${slug}]: ${error.message}`);
    bump("category_words", links.length);
  }
}

/** يربط كلمات أسطر القصص بالقاموس المركزي (اختياري لكنه أساس تتبع الكلمات داخل القصص). */
async function linkStoryLineWords() {
  const { data: lines, error } = await db.from("story_lines").select("id, text").limit(20000);
  if (error) throw new Error(`story_lines fetch: ${error.message}`);

  const links: {line_id: string;word_index: number;word_id: string;}[] = [];
  for (const line of lines ?? []) {
    const tokens = line.text.split(/\s+/);
    tokens.forEach((token, i) => {
      const clean = normalize(token.replace(/[^A-Za-z'-]/g, ""));
      if (!clean) return;
      const id = wordIds.get(`${clean}|unknown`) ?? [...wordIds.entries()].find(
        ([k]) => k.startsWith(`${clean}|`)
      )?.[1];
      if (id) links.push({ line_id: line.id, word_index: i, word_id: id });
    });
  }

  for (let i = 0; i < links.length; i += 1000) {
    const chunk = links.slice(i, i + 1000);
    const { error: linkError } = await db.
    from("story_line_words").
    upsert(chunk, { onConflict: "line_id,word_index" });
    if (linkError) throw new Error(`story_line_words: ${linkError.message}`);
    bump("story_line_words", chunk.length);
  }
}

async function main() {
  console.log("→ بدء نقل المحتوى...\n");
  const courseIds = await seedCourses();
  const storyIds = await seedStories(courseIds);
  await seedStoryLines(storyIds);
  await seedVocabulary();
  await linkStoryLineWords();

  console.log("\n✔ اكتمل النقل:");
  for (const [table, count] of Object.entries(report)) {
    console.log(`   ${table.padEnd(24)} ${count}`);
  }
}

main().catch((err) => {
  console.error("\n✖ فشل النقل:", err.message);
  process.exit(1);
});