import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeAppearance } from "@/lib/stories/appearance";
import { asCefrFilter, CEFR_COLORS, CEFR_LABELS, CEFR_LEVELS } from "@/lib/admin/level";
import type {
  AdminActivityEntry,
  AdminCategory,
  AdminLevelBucket,
  AdminMediaItem,
  AdminMediaLibrary,
  AdminOverviewStats,
  AdminProgressRow,
  AdminProgressSummary,
  AdminSentence,
  AdminSetting,
  AdminStory,
  AdminStoryAnalytics,
  AdminStoryMedia,
  AdminStoryRow,
  AdminStoryVersion,
  AdminUserRole,
  AdminUserRow,
  AdminUsersResult,
  AdminUserStatus,
  StoryAccess,
  StorySeo,
  StoryStatus } from
"@/types/admin";

/**
 * طبقة القراءة لكل شاشات Admin Studio.
 *
 * تعيش هنا لا داخل Server Actions لسببين:
 *   1. صفحات السيرفر تستدعيها مباشرة → صفر round-trip زائد ولا JSON مكرر.
 *   2. الأكشنات (الكتابة) تستدعيها بعد التعديل لترجّع الشكل الجديد للواجهة.
 *
 * كل الاستعلامات تمرّ بـ service-role وتُنادى **فقط** بعد `requireAdmin()`.
 * كل استعلام يختار الأعمدة المطلوبة بالاسم — لا `select("*")`.
 */

const STORY_LIST_COLUMNS =
"id, slug, title_en, title_ar, cover_image, cefr_level, status, total_lines, views, updated_at, categories(name_ar, slug)";

const STORY_FULL_COLUMNS =
"id, slug, title_en, title_ar, description_en, description_ar, category_id, cefr_level, difficulty, estimated_minutes, xp_reward, cover_image, bg_image, status, access, appearance, seo, draft, views, total_lines, total_words, created_at, updated_at, categories(slug, name_ar)";

const DEFAULT_ACCESS: StoryAccess = {
  locked: false,
  lockType: "visible",
  lockMessage: "هذه القصة غير متاحة حالياً"
};

/** المدة التي بعدها نعتبر الحساب «غير نشط». يوم واحد قصير جداً و٣٠ متساهل. */
const ACTIVE_WINDOW_DAYS = 14;

export function normalizeAccess(input: unknown): StoryAccess {
  if (!input || typeof input !== "object") return { ...DEFAULT_ACCESS };
  const raw = input as Partial<StoryAccess>;
  return {
    locked: Boolean(raw.locked),
    lockType: raw.lockType === "hidden" ? "hidden" : "visible",
    lockMessage:
    typeof raw.lockMessage === "string" && raw.lockMessage.trim() !== "" ?
    raw.lockMessage :
    DEFAULT_ACCESS.lockMessage
  };
}

function normalizeSeo(input: unknown, slug: string, titleEn: string): StorySeo {
  const raw = (input ?? {}) as Partial<StorySeo>;
  return {
    slug: typeof raw.slug === "string" && raw.slug.trim() !== "" ? raw.slug : slug,
    metaTitle:
    typeof raw.metaTitle === "string" && raw.metaTitle.trim() !== "" ? raw.metaTitle : titleEn,
    metaDescription: typeof raw.metaDescription === "string" ? raw.metaDescription : ""
  };
}

function asStatus(value: unknown): StoryStatus {
  return value === "draft" || value === "locked" ? value : "published";
}

type CategoryJoin = {name_ar?: string | null;slug?: string | null;} | null;

function joinedCategory(value: unknown): {label: string;slug: string | null;} {
  const row = (Array.isArray(value) ? value[0] : value) as CategoryJoin;
  return { label: row?.name_ar ?? "غير مصنّفة", slug: row?.slug ?? null };
}

function daysSince(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

// ── القصص ────────────────────────────────────────────────────────────────────

export interface ListStoriesFilters {
  search?: string;
  status?: StoryStatus | "all";
  categorySlug?: string | "all";
  level?: string | "all";
  page?: number;
  pageSize?: number;
}

export interface ListStoriesResult {
  rows: AdminStoryRow[];
  total: number;
}

export async function listStories(
filters: ListStoriesFilters = {})
: Promise<ListStoriesResult> {
  const admin = createAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, filters.pageSize ?? 10));
  const from = (page - 1) * pageSize;

  let query = admin.
  from("stories").
  select(STORY_LIST_COLUMNS, { count: "exact" }).
  is("deleted_at", null).
  order("updated_at", { ascending: false }).
  range(from, from + pageSize - 1);

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);

  // `cefr_level` عمود enum: تمرير نص حر يرفضه TypeScript ويرمي 22P02 وقت
  // التشغيل. asCefrFilter يرجّع null لأي قيمة غير معروفة → لا فلتر.
  const level = asCefrFilter(filters.level);
  if (level) query = query.eq("cefr_level", level);

  if (filters.search && filters.search.trim() !== "") {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title_en.ilike.${term},title_ar.ilike.${term},slug.ilike.${term}`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[admin:listStories]", error.code ?? "", error.message);
    return { rows: [], total: 0 };
  }

  const rows: AdminStoryRow[] = (data ?? []).
  map((row) => {
    const category = joinedCategory((row as Record<string, unknown>).categories);
    return {
      id: String(row.id),
      slug: String(row.slug),
      titleEn: String(row.title_en ?? ""),
      titleAr: String(row.title_ar ?? ""),
      coverImage: row.cover_image as string | null ?? null,
      cefrLevel: String(row.cefr_level ?? "B1"),
      categoryLabel: category.label,
      categorySlug: category.slug,
      status: asStatus(row.status),
      totalLines: Number(row.total_lines ?? 0),
      views: Number(row.views ?? 0),
      updatedAt: String(row.updated_at ?? new Date().toISOString())
    } satisfies AdminStoryRow;
  }).
  filter(
    (row) =>
    !filters.categorySlug ||
    filters.categorySlug === "all" ||
    row.categorySlug === filters.categorySlug
  );

  return { rows, total: count ?? rows.length };
}

export async function getStoryForAdmin(slugOrId: string): Promise<AdminStory | null> {
  const admin = createAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(slugOrId);

  const { data, error } = await admin.
  from("stories").
  select(STORY_FULL_COLUMNS).
  eq(isUuid ? "id" : "slug", slugOrId).
  is("deleted_at", null).
  maybeSingle();

  if (error) {
    console.error("[admin:getStory]", error.code ?? "", error.message);
    return null;
  }
  if (!data) return null;

  const [sentences, media] = await Promise.all([
  listSentences(String(data.id)),
  listStoryMedia(String(data.id))]
  );

  const category = joinedCategory((data as Record<string, unknown>).categories);
  const titleEn = String(data.title_en ?? "");
  const slug = String(data.slug);

  return {
    id: String(data.id),
    slug,
    titleEn,
    titleAr: String(data.title_ar ?? ""),
    descriptionEn: String(data.description_en ?? ""),
    descriptionAr: String(data.description_ar ?? ""),
    categoryId: data.category_id as string | null ?? null,
    categorySlug: category.slug,
    cefrLevel: String(data.cefr_level ?? "B1"),
    difficulty: String(data.difficulty ?? "intermediate"),
    estimatedMinutes: Number(data.estimated_minutes ?? 10),
    xpReward: Number(data.xp_reward ?? 50),
    coverImage: data.cover_image as string | null ?? null,
    bgImage: data.bg_image as string | null ?? null,
    status: asStatus(data.status),
    access: normalizeAccess(data.access),
    appearance: normalizeAppearance(data.appearance),
    seo: normalizeSeo(data.seo, slug, titleEn),
    sentences,
    media,
    totalLines: Number(data.total_lines ?? sentences.length),
    totalWords: Number(data.total_words ?? 0),
    views: Number(data.views ?? 0),
    hasUnpublishedDraft: Boolean(data.draft),
    rawDraft: data.draft ?? null,
    createdAt: String(data.created_at ?? new Date().toISOString()),
    updatedAt: String(data.updated_at ?? new Date().toISOString())
  };
}

export async function listSentences(storyId: string): Promise<AdminSentence[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.
  from("story_lines").
  select("id, line_index, text, translation_ar, level, vocabulary").
  eq("story_id", storyId).
  order("line_index", { ascending: true });

  if (error) {
    console.error("[admin:listSentences]", error.code ?? "", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    lineIndex: Number(row.line_index ?? 0),
    text: String(row.text ?? ""),
    translationAr: String(row.translation_ar ?? ""),
    level: String(row.level ?? ""),
    vocabulary: Array.isArray(row.vocabulary) ? row.vocabulary as string[] : []
  }));
}

export async function listStoryMedia(storyId: string | null): Promise<AdminStoryMedia[]> {
  const admin = createAdminClient();
  let query = admin.
  from("story_media").
  select("id, story_id, url, role, width, height, bytes, sort_order, created_at").
  order("sort_order", { ascending: true });

  query = storyId ? query.eq("story_id", storyId) : query.limit(120);

  const { data, error } = await query;
  if (error) {
    console.error("[admin:listMedia]", error.code ?? "", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    storyId: String(row.story_id ?? ""),
    url: String(row.url),
    role: row.role as AdminStoryMedia["role"] ?? "scene",
    width: row.width === null ? null : Number(row.width),
    height: row.height === null ? null : Number(row.height),
    bytes: row.bytes === null ? null : Number(row.bytes),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString())
  }));
}

// ── مكتبة الوسائط (الصفحة الكاملة) ───────────────────────────────────────────

const MEDIA_ROLE_LABELS: Record<string, string> = {
  cover: "أغلفة",
  background: "خلفيات",
  scene: "مشاهد",
  modal: "مودال"
};

/**
 * المكتبة كاملة مع اسم القصة المستخدِمة لكل ملف. الربط باسم القصة ليس تجميلاً:
 * بدونه لا يجرؤ أحد على حذف صورة لأنه لا يعرف أين تُستعمل.
 */
export async function listMediaLibrary(options: {
  role?: string;
  storyId?: string;
  search?: string;
  limit?: number;
} = {}): Promise<AdminMediaLibrary> {
  const admin = createAdminClient();
  let query = admin.
  from("story_media").
  select("id, story_id, url, role, width, height, bytes, mime, sort_order, created_at, stories(title_en)").
  order("created_at", { ascending: false }).
  limit(Math.min(200, options.limit ?? 120));

  if (options.role && options.role !== "all") query = query.eq("role", options.role);
  if (options.storyId && options.storyId !== "all") query = query.eq("story_id", options.storyId);
  if (options.search && options.search.trim() !== "") {
    query = query.ilike("url", `%${options.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin:mediaLibrary]", error.code ?? "", error.message);
    return { items: [], totalBytes: 0, byRole: [] };
  }

  const items: AdminMediaItem[] = (data ?? []).map((row) => {
    const story = (Array.isArray(row.stories) ? row.stories[0] : row.stories) as
    {title_en?: string | null;} |
    null;
    const url = String(row.url);
    return {
      id: String(row.id),
      storyId: String(row.story_id ?? ""),
      url,
      role: row.role as AdminStoryMedia["role"] ?? "scene",
      width: row.width === null ? null : Number(row.width),
      height: row.height === null ? null : Number(row.height),
      bytes: row.bytes === null ? null : Number(row.bytes),
      sortOrder: Number(row.sort_order ?? 0),
      createdAt: String(row.created_at ?? new Date().toISOString()),
      mime: String(row.mime ?? "image/jpeg"),
      fileName: decodeURIComponent(url.split("/").pop() ?? "file"),
      storyTitle: story?.title_en ?? null
    };
  });

  const tally = new Map<string, number>();
  items.forEach((item) => tally.set(item.role, (tally.get(item.role) ?? 0) + 1));

  return {
    items,
    totalBytes: items.reduce((sum, item) => sum + (item.bytes ?? 0), 0),
    byRole: Object.keys(MEDIA_ROLE_LABELS).map((role) => ({
      role,
      label: MEDIA_ROLE_LABELS[role],
      count: tally.get(role) ?? 0
    }))
  };
}

// ── التصنيفات ────────────────────────────────────────────────────────────────

export async function listCategories(): Promise<AdminCategory[]> {
  const admin = createAdminClient();
  const [categories, counts] = await Promise.all([
  admin.
  from("categories").
  select(
    "id, slug, name_en, name_ar, description_ar, icon, color, is_active, sort_order, created_at"
  ).
  order("sort_order", { ascending: true }),
  admin.from("stories").select("category_id").is("deleted_at", null)]
  );

  if (categories.error) {
    console.error("[admin:listCategories]", categories.error.message);
    return [];
  }

  const tally = new Map<string, number>();
  (counts.data ?? []).forEach((row) => {
    const key = String(row.category_id ?? "");
    if (!key) return;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  });

  return (categories.data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    nameEn: String(row.name_en),
    nameAr: String(row.name_ar),
    descriptionAr: String(row.description_ar ?? ""),
    icon: String(row.icon ?? "BookOpen"),
    color: String(row.color ?? "#22d3ee"),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    storiesCount: tally.get(String(row.id)) ?? 0,
    createdAt: row.created_at ? String(row.created_at) : undefined
  }));
}

// ── لوحة التحكم ──────────────────────────────────────────────────────────────

export async function getOverviewStats(): Promise<AdminOverviewStats> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_overview_stats");

  const empty: AdminOverviewStats = {
    total: 0,
    published: 0,
    locked: 0,
    drafts: 0,
    newThisWeek: 0,
    activeUsers: 0,
    xpToday: 0,
    avgReadMinutes: 0,
    completionRate: 0,
    trend: [4, 6, 5, 8, 7, 9, 8, 11, 10, 12]
  };

  if (error || !data) {
    if (error) console.error("[admin:overview]", error.code ?? "", error.message);
    return empty;
  }

  const raw = data as Record<string, number>;
  const positions = Number(raw.positions ?? 0);
  const completed = Number(raw.completed ?? 0);

  return {
    ...empty,
    total: Number(raw.total ?? 0),
    published: Number(raw.published ?? 0),
    locked: Number(raw.locked ?? 0),
    drafts: Number(raw.drafts ?? 0),
    newThisWeek: Number(raw.newThisWeek ?? 0),
    activeUsers: Number(raw.activeUsers ?? 0),
    avgReadMinutes: Math.round(Number(raw.avgSeconds ?? 0) / 60),
    completionRate: positions > 0 ? Math.round(completed / positions * 100) : 0
  };
}

export async function listActivity(limit = 12, action = "all"): Promise<AdminActivityEntry[]> {
  const admin = createAdminClient();
  let query = admin.
  from("admin_activity").
  select("id, action, entity, entity_id, label, created_at, profiles!admin_activity_actor_id_profiles_fkey(nickname)").order("created_at", { ascending: false }).
  limit(Math.min(200, limit));

  if (action && action !== "all") query = query.like("action", `${action}%`);

  const { data, error } = await query;
  if (error) {
    console.error("[admin:activity]", error.code ?? "", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const actor = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
    {nickname?: string | null;} |
    null;
    return {
      id: String(row.id),
      action: String(row.action),
      entity: String(row.entity),
      entityId: row.entity_id as string | null ?? null,
      label: String(row.label ?? ""),
      actorName: actor?.nickname ?? "Admin",
      createdAt: String(row.created_at)
    };
  });
}

// ── المستخدمون ───────────────────────────────────────────────────────────────

interface PositionAggregate {
  completed: number;
  lines: number;
  totalLines: number;
  seconds: number;
  stories: number;
  lastUpdate: string | null;
}

function emptyAggregate(): PositionAggregate {
  return { completed: 0, lines: 0, totalLines: 0, seconds: 0, stories: 0, lastUpdate: null };
}

async function aggregatePositions(userIds: string[]): Promise<Map<string, PositionAggregate>> {
  const map = new Map<string, PositionAggregate>();
  if (userIds.length === 0) return map;

  const admin = createAdminClient();
  const { data, error } = await admin.
  from("user_story_positions").
  select("user_id, lines_completed, total_lines, time_spent_seconds, completed_at, updated_at").
  in("user_id", userIds);

  if (error) {
    console.error("[admin:positions]", error.code ?? "", error.message);
    return map;
  }

  (data ?? []).forEach((row) => {
    const key = String(row.user_id);
    const entry = map.get(key) ?? emptyAggregate();
    entry.stories += 1;
    entry.lines += Number(row.lines_completed ?? 0);
    entry.totalLines += Number(row.total_lines ?? 0);
    entry.seconds += Number(row.time_spent_seconds ?? 0);
    if (row.completed_at) entry.completed += 1;
    const updated = row.updated_at ? String(row.updated_at) : null;
    if (updated && (!entry.lastUpdate || updated > entry.lastUpdate)) entry.lastUpdate = updated;
    map.set(key, entry);
  });

  return map;
}

/**
 * البريد ليس في `profiles` بل في `auth.users`. نجلبه بنداء واحد ونربطه
 * بالمعرّف — أرخص من join عبر schema أخرى، ولو فشل (صلاحيات) نُكمل بدونه بدل
 * أن تسقط الصفحة كلها.
 */
async function fetchEmails(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    (data?.users ?? []).forEach((user) => {
      if (user.email) map.set(user.id, user.email);
    });
  } catch (err) {
    console.error("[admin:emails]", err);
  }
  return map;
}

function userStatus(role: string, lastActiveAt: string | null): AdminUserStatus {
  if (role === "suspended") return "suspended";
  return daysSince(lastActiveAt) <= ACTIVE_WINDOW_DAYS ? "active" : "inactive";
}

export interface ListUsersFilters {
  search?: string;
  level?: string | "all";
  status?: AdminUserStatus | "all";
  page?: number;
  pageSize?: number;
}

export async function listUsers(filters: ListUsersFilters = {}): Promise<AdminUsersResult> {
  const admin = createAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, filters.pageSize ?? 10));
  const from = (page - 1) * pageSize;

  let query = admin.
  from("profiles").
  select("id, nickname, avatar_url, english_level, role, last_active_at, created_at", {
    count: "exact"
  }).
  order("last_active_at", { ascending: false, nullsFirst: false }).
  range(from, from + pageSize - 1);

  const level = asCefrFilter(filters.level);
  if (level) query = query.eq("english_level", level);
  if (filters.search && filters.search.trim() !== "") {
    query = query.ilike("nickname", `%${filters.search.trim()}%`);
  }

  const [{ data, error, count }, emails] = await Promise.all([query, fetchEmails()]);

  if (error) {
    console.error("[admin:listUsers]", error.code ?? "", error.message);
    return { rows: [], total: 0, active: 0, storiesRead: 0, xpTotal: 0 };
  }

  const ids = (data ?? []).map((row) => String(row.id));
  const [positions, stats] = await Promise.all([
  aggregatePositions(ids),
  admin.from("user_stats").select("user_id, xp_total, stories_completed_count").in("user_id", ids)]
  );

  const xpById = new Map<string, {xp: number;completed: number;}>();
  (stats.data ?? []).forEach((row) => {
    xpById.set(String(row.user_id), {
      xp: Number(row.xp_total ?? 0),
      completed: Number(row.stories_completed_count ?? 0)
    });
  });

  let rows: AdminUserRow[] = (data ?? []).map((row) => {
    const id = String(row.id);
    const aggregate = positions.get(id) ?? emptyAggregate();
    const stat = xpById.get(id);
    const role = String(row.role ?? "user") as AdminUserRole;
    const lastActiveAt = row.last_active_at as string | null ?? null;

    return {
      id,
      nickname: String(row.nickname ?? "مستخدم"),
      avatarUrl: row.avatar_url as string | null ?? null,
      email: emails.get(id) ?? "",
      englishLevel: String(row.english_level ?? "—"),
      role,
      status: userStatus(role, lastActiveAt),
      storiesCompleted: stat?.completed ?? aggregate.completed,
      xp: stat?.xp ?? aggregate.lines * 10,
      lastActiveAt,
      joinedAt: row.created_at ? String(row.created_at) : null
    };
  });

  if (filters.status && filters.status !== "all") {
    rows = rows.filter((row) => row.status === filters.status);
  }

  return {
    rows,
    total: count ?? rows.length,
    active: rows.filter((row) => row.status === "active").length,
    storiesRead: rows.reduce((sum, row) => sum + row.storiesCompleted, 0),
    xpTotal: rows.reduce((sum, row) => sum + row.xp, 0)
  };
}

/** توزيع المستخدمين على مستويات CEFR — يُقرأ بعدّ واحد لكل مستوى (head). */
export async function getLevelDistribution(): Promise<AdminLevelBucket[]> {
  const admin = createAdminClient();
  const results = await Promise.all(
    CEFR_LEVELS.map(async (level) => {
      const { count } = await admin.
      from("profiles").
      select("id", { count: "exact", head: true }).
      eq("english_level", level);
      return { level, count: count ?? 0 };
    })
  );

  const total = results.reduce((sum, item) => sum + item.count, 0);
  return results.map((item) => ({
    level: item.level,
    label: CEFR_LABELS[item.level],
    color: CEFR_COLORS[item.level],
    count: item.count,
    percent: total > 0 ? Math.round(item.count / total * 100) : 0
  }));
}

// ── التقدم ───────────────────────────────────────────────────────────────────

export async function listProgress(limit = 25): Promise<AdminProgressRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.
  from("profiles").
  select("id, nickname, avatar_url, english_level, last_active_at").
  order("last_active_at", { ascending: false, nullsFirst: false }).
  limit(Math.min(100, limit));

  if (error) {
    console.error("[admin:progress]", error.code ?? "", error.message);
    return [];
  }

  const ids = (data ?? []).map((row) => String(row.id));
  const [positions, stats] = await Promise.all([
  aggregatePositions(ids),
  admin.from("user_stats").select("user_id, xp_total").in("user_id", ids)]
  );

  const xpById = new Map<string, number>();
  (stats.data ?? []).forEach((row) => xpById.set(String(row.user_id), Number(row.xp_total ?? 0)));

  return (data ?? []).
  map((row) => {
    const id = String(row.id);
    const aggregate = positions.get(id) ?? emptyAggregate();
    return {
      id,
      nickname: String(row.nickname ?? "مستخدم"),
      avatarUrl: row.avatar_url as string | null ?? null,
      englishLevel: String(row.english_level ?? "—"),
      storiesCompleted: aggregate.completed,
      completionRate:
      aggregate.totalLines > 0 ?
      Math.min(100, Math.round(aggregate.lines / aggregate.totalLines * 100)) :
      0,
      xp: xpById.get(id) ?? aggregate.lines * 10,
      readingSeconds: aggregate.seconds,
      lastActiveAt: row.last_active_at as string | null ?? null
    };
  }).
  sort((a, b) => b.xp - a.xp);
}

export async function getProgressSummary(): Promise<AdminProgressSummary> {
  const admin = createAdminClient();
  const [profiles, positions] = await Promise.all([
  admin.from("profiles").select("id", { count: "exact", head: true }),
  admin.
  from("user_story_positions").
  select("user_id, lines_completed, total_lines, time_spent_seconds, completed_at, updated_at")]
  );

  const rows = positions.data ?? [];
  const users = profiles.count ?? 0;
  const readers = new Set(rows.map((row) => String(row.user_id))).size;

  let completed = 0;
  let inProgress = 0;
  let stalled = 0;
  let seconds = 0;

  rows.forEach((row) => {
    seconds += Number(row.time_spent_seconds ?? 0);
    if (row.completed_at) {
      completed += 1;
      return;
    }
    if (daysSince(row.updated_at ? String(row.updated_at) : null) > ACTIVE_WINDOW_DAYS) {
      stalled += 1;
    } else {
      inProgress += 1;
    }
  });

  return {
    users,
    storiesRead: rows.length,
    avgStoriesPerUser: readers > 0 ? Math.round(rows.length / readers * 100) / 100 : 0,
    xpTotal: rows.reduce((sum, row) => sum + Number(row.lines_completed ?? 0) * 10, 0),
    avgReadSeconds: rows.length > 0 ? Math.round(seconds / rows.length) : 0,
    completed,
    inProgress,
    notStarted: Math.max(0, users - readers),
    stalled,
    completionRate: rows.length > 0 ? Math.round(completed / rows.length * 100) : 0
  };
}

// ── التحليلات ────────────────────────────────────────────────────────────────

export async function listStoryAnalytics(limit = 8): Promise<AdminStoryAnalytics[]> {
  const admin = createAdminClient();
  const [stories, positions] = await Promise.all([
  admin.
  from("stories").
  select("slug, title_en, views").
  is("deleted_at", null).
  order("views", { ascending: false }).
  limit(limit),
  admin.
  from("user_story_positions").
  select("story_slug, completed_at, time_spent_seconds")]
  );

  if (stories.error) {
    console.error("[admin:analytics]", stories.error.message);
    return [];
  }

  const tally = new Map<string, {readers: number;completed: number;seconds: number;}>();
  (positions.data ?? []).forEach((row) => {
    const key = String(row.story_slug);
    const entry = tally.get(key) ?? { readers: 0, completed: 0, seconds: 0 };
    entry.readers += 1;
    if (row.completed_at) entry.completed += 1;
    entry.seconds += Number(row.time_spent_seconds ?? 0);
    tally.set(key, entry);
  });

  return (stories.data ?? []).map((row) => {
    const entry = tally.get(String(row.slug)) ?? { readers: 0, completed: 0, seconds: 0 };
    return {
      slug: String(row.slug),
      titleEn: String(row.title_en ?? ""),
      readers: entry.readers,
      completionRate: entry.readers > 0 ? Math.round(entry.completed / entry.readers * 100) : 0,
      avgMinutes: entry.readers > 0 ? Math.round(entry.seconds / entry.readers / 60) : 0
    };
  });
}

export async function listStoryVersions(storyId: string): Promise<AdminStoryVersion[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.
  from("story_versions").
  select("id, version, summary, created_at, profiles!story_versions_created_by_profiles_fkey(nickname)").
  eq("story_id", storyId).
  order("version", { ascending: false }).
  limit(20);

  if (error) {
    console.error("[admin:versions]", error.code ?? "", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const actor = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
    {nickname?: string | null;} |
    null;
    return {
      id: String(row.id),
      version: Number(row.version),
      summary: String(row.summary ?? ""),
      actorName: actor?.nickname ?? "Admin",
      createdAt: String(row.created_at)
    };
  });
}

// ── الإعدادات ────────────────────────────────────────────────────────────────

export async function listSettings(): Promise<AdminSetting[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.
  from("app_settings").
  select("key, value, description").
  order("key", { ascending: true });

  if (error) {
    console.error("[admin:settings]", error.code ?? "", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    key: String(row.key),
    value: row.value,
    description: String(row.description ?? "")
  }));
}