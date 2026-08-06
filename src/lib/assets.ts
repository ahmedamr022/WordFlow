/**
 * مصدر واحد لكل مسارات الصور في المشروع.
 *
 * القاعدة: لا تكتب مسار صورة نصياً داخل مكوّن. استورد من هنا.
 *
 * ما تغيّر في هذه الحزمة
 * ──────────────────────
 * أُضيف **سجل وقت التشغيل** (`registerStoryImages`). السبب: الخرائط أدناه
 * تُبنى مرّة واحدة من `src/data/stories.ts` الثابت، فأي قصة ينشئها الأدمن
 * (موجودة في جدول `stories` فقط) كانت ترجّع `placeholder` في كل مكان يستخدم
 * `storyCover` / `storyImageCandidates` — وأوضحها سلايدشو مودال التفاصيل.
 *
 * الآن الشاشات التي تعرف أغلفة الداتابيز (تمرّرها من السيرفر) تسجّلها مرّة
 * واحدة، وكل الدوال أدناه تقرأ السجل أولاً. الحساب يبقى deterministic
 * (لا `Math.random`) والتواقيع المصدَّرة كلها كما هي.
 */

import { MAIN_STORIES, RECOMMENDED_STORIES_DATA } from "@/data/stories";
import { STORY_IMAGE_MANIFEST } from "@/data/storyImages.generated";

/** الصور الثابتة المستخدمة في الواجهة — كلها متحقَّق من وجودها في public/. */
export const IMAGES = {
  authSide: "/images/login.png",
  dashboardHero: "/images/dashboardhero.jpg",
  readingDesk: "/images/reading-desk.png",
  trophy: "/images/trophy.png",
  reviewCards: "/images/review-cards.png",
  landingHero: "/images/student-learning.jpg",
  ship: "/ship.png",
  placeholder: "/placeholder.svg"
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   بناء الخرائط — مرّة واحدة عند تحميل الموديول
   ══════════════════════════════════════════════════════════════════════════ */

interface StoryImageSource {
  id: string;
  cover?: string | null;
  bgImage?: string | null;
}

const ALL_STORY_ITEMS: StoryImageSource[] = [
...(MAIN_STORIES as unknown as StoryImageSource[]),
...(RECOMMENDED_STORIES_DATA as unknown as StoryImageSource[])];


/** "/images/stories/story3/1.jpg" → "story3" (وكذلك مسارات Supabase Storage). */
function extractFolder(path: string | null | undefined): string | null {
  if (!path) return null;
  const match =
  path.match(/\/images\/stories\/([^/]+)\//) ?? path.match(/story-media\/([^/]+)\//);
  return match ? match[1] : null;
}

function isUsable(path: string | null | undefined): path is string {
  if (!path) return false;
  const trimmed = path.trim();
  if (trimmed === "") return false;
  return trimmed !== IMAGES.placeholder;
}

function uniqueList(paths: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const path of paths) {
    if (!isUsable(path)) continue;
    if (!out.includes(path)) out.push(path);
  }
  return out;
}

const COVERS = new Map<string, string>();
const BACKGROUNDS = new Map<string, string>();
const GALLERIES = new Map<string, string[]>();
const FOLDERS = new Map<string, string>();

/** صور القصص القادمة من الداتابيز — تُسجَّل في وقت التشغيل. */
const RUNTIME_COVERS = new Map<string, string>();
const RUNTIME_BACKGROUNDS = new Map<string, string>();
const RUNTIME_GALLERIES = new Map<string, string[]>();

/**
 * الأغلفة المستهلكة عبر كل القصص. لو قصتين اتقابلوا على نفس الملف، التانية
 * تاخد الصورة اللي بعدها في مجلدها — فبيختفي التكرار البصري من غير أي
 * تعديل في الداتا.
 */
const usedCovers = new Set<string>();

for (const story of ALL_STORY_ITEMS) {
  if (!story?.id || COVERS.has(story.id)) continue; // نفس القصة في القائمتين

  const folder = extractFolder(story.cover) ?? extractFolder(story.bgImage);
  if (folder) FOLDERS.set(story.id, folder);

  const manifest = folder ? STORY_IMAGE_MANIFEST[folder] ?? [] : [];
  const gallery = uniqueList([story.cover, story.bgImage, ...manifest]);
  GALLERIES.set(story.id, gallery);

  // الغلاف: أول صورة غير مستهلكة، وإلا أول صورة متاحة.
  const cover =
  gallery.find((url) => !usedCovers.has(url)) ?? gallery[0] ?? IMAGES.placeholder;
  if (isUsable(cover)) usedCovers.add(cover);
  COVERS.set(story.id, cover);

  // الخلفية: `bgImage` الصريح أولاً، وإلا أول صورة **مختلفة** عن الغلاف.
  const background =
  (isUsable(story.bgImage) ? story.bgImage : null) ??
  gallery.find((url) => url !== cover) ?? (
  isUsable(cover) ? cover : IMAGES.ship);
  BACKGROUNDS.set(story.id, background);
}

/* ══════════════════════════════════════════════════════════════════════════
   سجل وقت التشغيل (قصص الداتابيز)
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * تسجيل صور قصة لا توجد في الكتالوج الثابت.
 * آمنة للنداء المتكرّر وبنفس القيم (idempotent) — تُستدعى من مكوّنات تستقبل
 * الكتالوج من السيرفر، فالنتيجة متطابقة بين السيرفر والعميل.
 */
export function registerStoryImages(
storyId: string | null | undefined,
images: {cover?: string | null;background?: string | null;gallery?: (string | null | undefined)[];})
: void {
  if (!storyId) return;

  const gallery = uniqueList([
  images.cover,
  images.background,
  ...(images.gallery ?? [])]
  );

  if (gallery.length === 0) return;

  RUNTIME_GALLERIES.set(storyId, gallery);
  if (isUsable(images.cover)) RUNTIME_COVERS.set(storyId, images.cover);else
  RUNTIME_COVERS.set(storyId, gallery[0]);

  const background =
  (isUsable(images.background) ? images.background : null) ??
  gallery.find((url) => url !== RUNTIME_COVERS.get(storyId)) ??
  gallery[0];
  RUNTIME_BACKGROUNDS.set(storyId, background);
}

/* ══════════════════════════════════════════════════════════════════════════
   الواجهة العامة
   ══════════════════════════════════════════════════════════════════════════ */

/** غلاف القصة (الكارت) — مميّز لكل قصة قدر ما تسمح صورها المتاحة. */
export function storyCover(storyId: string | null | undefined): string {
  if (!storyId) return IMAGES.placeholder;
  return COVERS.get(storyId) ?? RUNTIME_COVERS.get(storyId) ?? IMAGES.placeholder;
}

/**
 * خلفية صفحة القراءة — دايماً صورة مختلفة عن الغلاف لو أمكن.
 * لو عايز خلفية مخصّصة لقصة، اضبطها من Admin Studio ← المظهر.
 */
export function storyBackground(storyId: string | null | undefined): string {
  if (!storyId) return IMAGES.ship;
  return (
    BACKGROUNDS.get(storyId) ??
    RUNTIME_BACKGROUNDS.get(storyId) ??
    storyCover(storyId) ??
    IMAGES.ship);

}

/** مجلد صور القصة ("story3") أو null لو مش معروف. */
export function storyFolder(storyId: string | null | undefined): string | null {
  if (!storyId) return null;
  return FOLDERS.get(storyId) ?? null;
}

/**
 * صور القصة الحقيقية للسلايدشو — من الفهرس المُولَّد أو سجل وقت التشغيل،
 * بلا أي تخمين وبلا أي طلب لملف غير موجود.
 */
export function storyImageCandidates(storyId: string | null | undefined): string[] {
  if (!storyId) return [];
  const gallery = GALLERIES.get(storyId) ?? RUNTIME_GALLERIES.get(storyId) ?? [];
  const cover = COVERS.get(storyId) ?? RUNTIME_COVERS.get(storyId) ?? null;
  const background = BACKGROUNDS.get(storyId) ?? RUNTIME_BACKGROUNDS.get(storyId) ?? null;
  return uniqueList([cover, background, ...gallery]);
}

/**
 * صورة رقم `index` من معرض القصة، بلفّ دوري.
 * مفيدة لأي سطح بيعرض أكثر من مشهد لنفس القصة بدل ما يعيد الغلاف.
 */
export function storyImageAt(storyId: string | null | undefined, index: number): string {
  const gallery = storyImageCandidates(storyId);
  if (gallery.length === 0) return IMAGES.placeholder;
  const safe = (index % gallery.length + gallery.length) % gallery.length;
  return gallery[safe];
}

/** استخدمها في `src` مباشرة: `src={withFallback(maybeUrl)}`. */
export function withFallback(
url: string | null | undefined,
fallback: string = IMAGES.placeholder)
: string {
  if (!isUsable(url)) return fallback;
  return url;
}

/**
 * معالج onError موحّد للصور: يبدّل لمصدر البديل مرة واحدة فقط
 * (بدون هذا الحرس تدخل الصورة في حلقة onError لا نهائية).
 */
export function imageFallbackHandler(fallback: string = IMAGES.placeholder) {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = fallback;
  };
}