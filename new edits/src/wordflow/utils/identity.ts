/**
 * WordFlow — canonical identity helpers.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────
 * The duplicate-stories bug is an *identity* bug, not a rendering bug.
 * Today the repo has TWO different slug generators:
 *   • `scripts/seed-content.ts`  → slugify() variant A
 *   • `src/lib/admin/draft.ts`   → slugify() variant B (+ random suffix)
 * and static stories in `src/data/stories.ts` carry hand-written ids.
 *
 * `listCatalogStories()` de-duplicates with `Map<string, CatalogStory>`
 * keyed on `id`, where the DB id is `row.slug`. The moment a DB slug is
 * one character off from the hand-written static id, the Map keeps BOTH
 * → the same story is rendered twice.
 *
 * The fix is to make identity *derivable* and *normalised*:
 *   1. ONE slugify used by the seed script, the admin studio and the
 *      static data (this file).
 *   2. Arabic-aware normalisation so "الأسطورة" and "الاسطوره" collapse.
 *   3. A fingerprint fallback so a story still matches when its slug was
 *      regenerated (title match, then content match).
 * ───────────────────────────────────────────────────────────────────
 */

const ARABIC_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;

/**
 * Normalise text for *comparison only* (never for display).
 * Handles the Arabic letter variants that make two identical titles look
 * different to a string equality check.
 */
export function normalizeText(input: string): string {
  return (input ?? '').
  toString().
  trim().
  toLowerCase().
  normalize('NFKD').
  replace(ARABIC_DIACRITICS, '').
  replace(/[\u0622\u0623\u0625\u0627]/g, 'ا') // آ أ إ ا  → ا
  .replace(/[\u0649\u064A]/g, 'ي') // ى ي → ي
  .replace(/\u0629/g, 'ه') // ة → ه
  .replace(/\u0624/g, 'و') // ؤ → و
  .replace(/[\u0621]/g, '') // ء
  .replace(/[\u200c-\u200f\u202a-\u202e]/g, '') // bidi marks
  .replace(/[^\p{L}\p{N}]+/gu, ' ').
  replace(/\s+/g, ' ').
  trim();
}

/**
 * THE single slug generator. Import this everywhere a slug is produced:
 * the seed script, `src/lib/admin/draft.ts`, and any manual content entry.
 * Deterministic — the same title always yields the same slug, so re-seeding
 * can never create a second row for an existing story.
 */
export function toSlug(input: string, fallback = 'story'): string {
  const slug = normalizeText(input).
  replace(/[^\p{L}\p{N}]+/gu, '-').
  replace(/^-+|-+$/g, '').
  slice(0, 80);

  return slug.length > 0 ? slug : fallback;
}

/**
 * Stable identity key for a story-ish record.
 * Priority: explicit slug → slug(titleEn) → slug(titleAr) → id.
 */
export function storyIdentityKey(story: {
  slug?: string | null;
  id?: string | null;
  titleEn?: string | null;
  titleAr?: string | null;
}): string {
  if (story.slug) return toSlug(story.slug);
  if (story.titleEn) return toSlug(story.titleEn);
  if (story.titleAr) return toSlug(story.titleAr);
  return toSlug(story.id ?? '', 'story');
}

/**
 * Secondary fingerprints used only when the primary key misses.
 * Two stories with the same English *or* Arabic title are the same story,
 * whatever their slugs say.
 */
export function storyFingerprints(story: {
  titleEn?: string | null;
  titleAr?: string | null;
}): string[] {
  const prints: string[] = [];
  if (story.titleEn) prints.push(`en:${normalizeText(story.titleEn)}`);
  if (story.titleAr) prints.push(`ar:${normalizeText(story.titleAr)}`);
  return prints;
}