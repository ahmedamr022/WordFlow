/**
 * WordFlow · رفع صور القصص إلى Supabase Storage وبناء فهرس الصور
 *
 *   pnpm tsx scripts/sync-story-images.ts            # رفع + تحديث الداتابيز
 *   pnpm tsx scripts/sync-story-images.ts --dry-run  # عرض الخطة بدون تنفيذ
 *   pnpm tsx scripts/sync-story-images.ts --local    # بناء الفهرس فقط بدون رفع
 *
 * ليه السكربت ده موجود؟
 *   1. الصور كانت في public/images/stories/** ومربوطة بمسارات نصّية في
 *      src/data/stories.ts. أي قصة يضيفها الأدمن من الاستوديو ما كانش ليها
 *      مكان تتخزّن فيه صورها ⇒ لازم تروح على Storage.
 *   2. `storyImageCandidates` القديمة كانت بتخمّن 18 مسار لكل قصة
 *      (1..6 × jpg/png/webp) والمتصفح بيطلبهم كلهم ⇒ طوفان 404 في اللوج.
 *      السكربت بيمسح المجلدات فعلياً ويكتب فهرس دقيق في
 *      src/data/storyImages.generated.ts، فيختفي التخمين نهائياً.
 *   3. بيسجّل كل صورة في جدول story_media بدورها الصحيح
 *      (cover / background / scene) عشان تظهر في مكتبة الوسائط.
 *
 * ترتيب الأدوار داخل مجلد القصة:
 *   cover.*      → غلاف الكارت
 *   background.* → خلفية صفحة القراءة
 *   1.* 2.* …    → مشاهد السلايدشو
 *   وإن لم يوجد cover/background صريح: أول صورة = غلاف، والتانية = خلفية.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const LOCAL_ONLY = process.argv.includes("--local");

const BUCKET = "story-media";
const STORIES_DIR = resolve(process.cwd(), "public/images/stories");
const MANIFEST_FILE = resolve(process.cwd(), "src/data/storyImages.generated.ts");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif"
};

type MediaRole = "cover" | "background" | "scene";

interface LocalImage {
  folder: string;
  fileName: string;
  absolutePath: string;
  publicPath: string;
  role: MediaRole;
  sortOrder: number;
}

// ── أدوات ─────────────────────────────────────────────────────────────────

function log(message: string): void {
  console.log(message);
}

function isImage(fileName: string): boolean {
  return extname(fileName).toLowerCase() in MIME_BY_EXT;
}

function baseName(fileName: string): string {
  return fileName.slice(0, fileName.length - extname(fileName).length).toLowerCase();
}

/** ترتيب طبيعي: 1, 2, 10 وليس 1, 10, 2 */
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

function createAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY مفقود في .env.local");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ── 1. مسح المجلدات المحلية ───────────────────────────────────────────────

async function scanLocalImages(): Promise<LocalImage[]> {
  if (!existsSync(STORIES_DIR)) {
    log(`⚠ المجلد ${STORIES_DIR} غير موجود — تخطّي المسح المحلي.`);
    return [];
  }

  const entries = await readdir(STORIES_DIR, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const images: LocalImage[] = [];

  for (const folder of folders.sort(naturalCompare)) {
    const folderPath = join(STORIES_DIR, folder);
    const files = (await readdir(folderPath)).filter(isImage).sort(naturalCompare);
    if (files.length === 0) continue;

    const explicitCover = files.find((file) => baseName(file) === "cover");
    const explicitBg = files.find((file) =>
    ["background", "bg"].includes(baseName(file))
    );

    const scenes = files.filter((file) => file !== explicitCover && file !== explicitBg);
    const cover = explicitCover ?? scenes[0];
    const background = explicitBg ?? scenes[1] ?? cover;

    let sortOrder = 0;
    for (const file of files) {
      const role: MediaRole =
      file === cover ? "cover" : file === background ? "background" : "scene";

      images.push({
        folder,
        fileName: file,
        absolutePath: join(folderPath, file),
        publicPath: `/images/stories/${folder}/${file}`,
        role,
        sortOrder: sortOrder++
      });
    }
  }

  return images;
}

// ── 2. الرفع إلى Storage ──────────────────────────────────────────────────

async function uploadImage(
admin: SupabaseClient,
image: LocalImage)
: Promise<string | null> {
  const bytes = await readFile(image.absolutePath);
  const hash = createHash("sha1").update(bytes).digest("hex").slice(0, 10);
  const ext = extname(image.fileName).toLowerCase();
  const storagePath = `${image.folder}/${baseName(image.fileName)}-${hash}${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: MIME_BY_EXT[ext],
    cacheControl: "31536000",
    upsert: true
  });

  if (error) {
    console.error(`  ✗ ${image.publicPath} — ${error.message}`);
    return null;
  }

  return admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

// ── 3. ربط المجلد بالقصة ──────────────────────────────────────────────────

/**
 * مجلدات الصور اسمها story1..storyN بينما القصص في الداتابيز عندها slug.
 * الربط بيتم عن طريق المسار الموجود أصلاً في cover_image/bg_image،
 * وده أدق من تخمين الأسماء.
 */
async function mapFoldersToStories(
admin: SupabaseClient)
: Promise<Map<string, {id: string;slug: string;}>> {
  const { data, error } = await admin.
  from("stories").
  select("id, slug, cover_image, bg_image");

  if (error) {
    console.error(`✗ تعذر قراءة جدول stories — ${error.message}`);
    return new Map();
  }

  const map = new Map<string, {id: string;slug: string;}>();
  const folderOf = (value: string | null): string | null => {
    if (!value) return null;
    const match = value.match(/\/images\/stories\/([^/]+)\//);
    return match ? match[1] : null;
  };

  for (const row of data ?? []) {
    const folder = folderOf(row.cover_image as string | null) ?? folderOf(row.bg_image as string | null);
    if (folder && !map.has(folder)) {
      map.set(folder, { id: String(row.id), slug: String(row.slug) });
    }
  }

  return map;
}

// ── 4. كتابة الفهرس ───────────────────────────────────────────────────────

async function writeManifest(byFolder: Map<string, string[]>): Promise<void> {
  const sorted = [...byFolder.entries()].sort(([a], [b]) => naturalCompare(a, b));
  const body = sorted.
  map(([folder, urls]) => {
    const list = urls.map((url) => `    ${JSON.stringify(url)}`).join(",\n");
    return `  ${JSON.stringify(folder)}: [\n${list}\n  ]`;
  }).
  join(",\n");

  const contents = `/**
 * ملف مُولَّد — لا تعدّله يدوياً.
 * أعِد توليده بـ: pnpm tsx scripts/sync-story-images.ts
 *
 * فهرس دقيق لصور كل قصة. وجوده يلغي التخمين القديم في
 * \`storyImageCandidates\` (كان يطلب 18 مسار لكل قصة ويولّد 404 لكل مسار ناقص).
 */

export const STORY_IMAGE_MANIFEST: Record<string, readonly string[]> = {
${body}
};

export type StoryImageFolder = keyof typeof STORY_IMAGE_MANIFEST;
`;

  await writeFile(MANIFEST_FILE, contents, "utf8");
  log(`✓ الفهرس اتكتب في src/data/storyImages.generated.ts (${sorted.length} مجلد)`);
}

// ── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const images = await scanLocalImages();
  log(`وجدت ${images.length} صورة في ${new Set(images.map((i) => i.folder)).size} مجلد.`);

  if (images.length === 0) {
    await writeManifest(new Map());
    return;
  }

  if (DRY_RUN) {
    for (const image of images) {
      const size = (await stat(image.absolutePath)).size;
      log(`  [${image.role.padEnd(10)}] ${image.publicPath}  (${Math.round(size / 1024)}KB)`);
    }
    log("\n--dry-run: لم يتم رفع أو تعديل أي شيء.");
    return;
  }

  const byFolder = new Map<string, string[]>();

  if (LOCAL_ONLY) {
    for (const image of images) {
      const list = byFolder.get(image.folder) ?? [];
      list.push(image.publicPath);
      byFolder.set(image.folder, list);
    }
    await writeManifest(byFolder);
    log("--local: الفهرس اتبنى من المسارات المحلية بدون رفع.");
    return;
  }

  const admin = createAdmin();
  const storyByFolder = await mapFoldersToStories(admin);
  log(`ربطت ${storyByFolder.size} مجلد بقصص في الداتابيز.`);

  const uploaded: Array<LocalImage & {url: string;}> = [];

  for (const image of images) {
    const url = await uploadImage(admin, image);
    if (!url) continue;

    uploaded.push({ ...image, url });
    const list = byFolder.get(image.folder) ?? [];
    list.push(url);
    byFolder.set(image.folder, list);
    log(`  ↑ ${image.publicPath} → ${image.role}`);
  }

  // تحديث القصص + مكتبة الوسائط
  for (const [folder, story] of storyByFolder) {
    const folderImages = uploaded.filter((image) => image.folder === folder);
    if (folderImages.length === 0) continue;

    const cover = folderImages.find((image) => image.role === "cover");
    const background = folderImages.find((image) => image.role === "background") ?? cover;

    const { data: current } = await admin.
    from("stories").
    select("appearance").
    eq("id", story.id).
    maybeSingle();

    const appearance = (current?.appearance ?? {}) as Record<string, Record<string, unknown>>;
    const merge = (key: string, url: string | undefined) => {
      if (!url) return;
      appearance[key] = { ...(appearance[key] ?? {}), imageUrl: url };
    };

    merge("card", cover?.url);
    merge("storyPage", background?.url);
    merge("modal", background?.url);
    merge("storyToday", background?.url);

    const { error: updateError } = await admin.
    from("stories").
    update({
      cover_image: cover?.url ?? null,
      bg_image: background?.url ?? null,
      appearance
    }).
    eq("id", story.id);

    if (updateError) {
      console.error(`  ✗ تحديث القصة ${story.slug} — ${updateError.message}`);
      continue;
    }

    for (const image of folderImages) {
      await admin.from("story_media").upsert(
        {
          story_id: story.id,
          url: image.url,
          role: image.role,
          mime: MIME_BY_EXT[extname(image.fileName).toLowerCase()],
          sort_order: image.sortOrder
        },
        { onConflict: "story_id,url" }
      );
    }

    log(`  ✓ ${story.slug}: غلاف + خلفية + ${folderImages.length} صورة في المكتبة`);
  }

  await writeManifest(byFolder);
  log("\nتم. شغّل التطبيق وشوف /admin/media.");
}

void main();