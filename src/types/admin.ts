/**
 * أنواع WordFlow Admin Studio.
 *
 * المبدأ: كل ما يمكن للأدمن تعديله يجب أن يكون **بيانات** لا كوداً. لذلك كل
 * قصة تحمل معها appearance (كيف تُعرض صورتها في كل سطح) و access (القفل
 * ورسالته) و status و draft (نسخة العمل غير المنشورة).
 *
 * تحديث هذه الدفعة: `SurfaceAppearance.fit` صار أربعة أوضاع بدل اثنين، وأُضيف
 * `blur`. السبب مشروح بالتفصيل في `src/lib/stories/appearance.ts` — باختصار:
 * `cover` وحده يجعل أحد المحورين بلا أثر (وهذا سبب شكوى «Y مش بيتغير»).
 */

import type { CefrLevel } from "@/types/database";

export const SURFACE_KEYS = ["storyPage", "modal", "storyToday", "card"] as const;
export type SurfaceKey = (typeof SURFACE_KEYS)[number];

export const SURFACE_LABELS: Record<SurfaceKey, string> = {
  storyPage: "صفحة القصة",
  modal: "مودال التفاصيل",
  storyToday: "قصة اليوم",
  card: "كارت القصة"
};

/**
 * طريقة ملاءمة الصورة للإطار:
 *   cover   → تملأ الإطار وتُقص. المحور الذي لا فائض فيه لا يتحرك.
 *   contain → الصورة كاملة، والفراغ يُملأ بخلفية ضبابية.
 *   width   → تملأ العرض؛ الفائض رأسي ⇒ التحكم في Y يعمل دائماً.
 *   height  → تملأ الارتفاع؛ الفائض أفقي ⇒ التحكم في X يعمل دائماً.
 */
export type SurfaceFit = "cover" | "contain" | "width" | "height";

/** إعدادات عرض صورة واحدة على سطح واحد. كل الأرقام قابلة للتحرير من الاستوديو. */
export interface SurfaceAppearance {
  /** مسار الصورة المختارة لهذا السطح. null = استخدم غلاف القصة الافتراضي. */
  imageUrl: string | null;
  /** نقطة التركيز الأفقية 0..100. */
  positionX: number;
  /** نقطة التركيز العمودية 0..100. */
  positionY: number;
  /** تكبير الصورة 1..3. */
  scale: number;
  brightness: number;
  contrast: number;
  saturation: number;
  /** قوة التعتيم فوق الصورة 0..100 (لقراءة النص). */
  overlay: number;
  fit: SurfaceFit;
  /** ملء أي فراغ حول الصورة بنسخة ضبابية منها بدل لون مسطّح. */
  blur: boolean;
}

export type StoryAppearance = Record<SurfaceKey, SurfaceAppearance>;

export type LockType = "hidden" | "visible";

export interface StoryAccess {
  locked: boolean;
  lockType: LockType;
  lockMessage: string;
}

export type StoryStatus = "published" | "draft" | "locked";

export const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  published: "منشورة",
  draft: "مسودة",
  locked: "مقفلة"
};

export interface StorySeo {
  slug: string;
  metaTitle: string;
  metaDescription: string;
}

export interface AdminSentence {
  id: string;
  lineIndex: number;
  text: string;
  translationAr: string;
  level: string;
  vocabulary: string[];
}

export interface AdminStoryMedia {
  id: string;
  storyId: string;
  url: string;
  role: "cover" | "background" | "scene" | "modal";
  width: number | null;
  height: number | null;
  bytes: number | null;
  sortOrder: number;
  createdAt: string;
}

/** القصة كما يراها الأدمن — الشكل الكامل المشار إليه في تصميم الاستوديو. */
export interface AdminStory {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryId: string | null;
  categorySlug: string | null;
  cefrLevel: string;
  difficulty: string;
  estimatedMinutes: number;
  xpReward: number;
  coverImage: string | null;
  bgImage: string | null;
  status: StoryStatus;
  access: StoryAccess;
  appearance: StoryAppearance;
  seo: StorySeo;
  sentences: AdminSentence[];
  media: AdminStoryMedia[];
  totalLines: number;
  totalWords: number;
  views: number;
  hasUnpublishedDraft: boolean;
  /**
   * محتوى المسودة الخام كما هو في jsonb. نوعه `unknown` عن قصد: التحقق منه
   * يحدث بمخطط zod في `lib/admin/draft`.
   */
  rawDraft: unknown;
  updatedAt: string;
  createdAt: string;
}

/** الصفوف الخفيفة المستخدمة في جدول «إدارة القصص» — لا جُمل ولا وسائط. */
export interface AdminStoryRow {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  coverImage: string | null;
  cefrLevel: string;
  categoryLabel: string;
  categorySlug: string | null;
  status: StoryStatus;
  totalLines: number;
  views: number;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  storiesCount: number;
  createdAt?: string;
}

export interface AdminOverviewStats {
  total: number;
  published: number;
  locked: number;
  drafts: number;
  newThisWeek: number;
  activeUsers: number;
  xpToday: number;
  avgReadMinutes: number;
  completionRate: number;
  trend: number[];
}

export interface AdminActivityEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  label: string;
  actorName: string;
  createdAt: string;
}

export interface AdminStoryVersion {
  id: string;
  version: number;
  summary: string;
  actorName: string;
  createdAt: string;
}

export interface AdminStoryAnalytics {
  slug: string;
  titleEn: string;
  readers: number;
  completionRate: number;
  avgMinutes: number;
}

// ── شاشات المستخدمين والتقدم ─────────────────────────────────────────────────

/**
 * حالة المستخدم مشتقّة ولا تُخزَّن كعمود منفصل:
 *   suspended → `profiles.role = 'suspended'` (قرار صريح من الأدمن)
 *   active    → نشِط خلال ١٤ يوماً
 *   inactive  → غير ذلك
 */
export type AdminUserStatus = "active" | "inactive" | "suspended";

export const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "معلّق"
};

export type AdminUserRole = "user" | "admin" | "owner" | "suspended";

export interface AdminUserRow {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  email: string;
  englishLevel: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  storiesCompleted: number;
  xp: number;
  lastActiveAt: string | null;
  joinedAt: string | null;
}

export interface AdminUsersResult {
  rows: AdminUserRow[];
  total: number;
  active: number;
  storiesRead: number;
  xpTotal: number;
}

export interface AdminLevelBucket {
  level: string;
  label: string;
  color: string;
  count: number;
  percent: number;
}

export interface AdminProgressRow {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  englishLevel: string;
  storiesCompleted: number;
  completionRate: number;
  xp: number;
  readingSeconds: number;
  lastActiveAt: string | null;
}

export interface AdminProgressSummary {
  users: number;
  storiesRead: number;
  avgStoriesPerUser: number;
  xpTotal: number;
  avgReadSeconds: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  stalled: number;
  completionRate: number;
}

// ── مكتبة الوسائط ────────────────────────────────────────────────────────────

export interface AdminMediaItem extends AdminStoryMedia {
  mime: string;
  fileName: string;
  storyTitle: string | null;
}

export interface AdminMediaLibrary {
  items: AdminMediaItem[];
  totalBytes: number;
  byRole: {role: string;label: string;count: number;}[];
}

// ── الإعدادات ────────────────────────────────────────────────────────────────

export interface AdminSetting {
  key: string;
  value: unknown;
  description: string;
}