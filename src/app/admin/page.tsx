import React from "react";
import Link from "next/link";
import {
  ActivityIcon,
  BookOpenIcon,
  ClockIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  LockIcon,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon } from
"lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import {
  getOverviewStats,
  listActivity,
  listCategories,
  listStories } from
"@/lib/admin/queries";
import { Panel, StatCard, StatusPill, EmptyState } from "@/components/admin/ui/surfaces";
import { NewStoryLink } from "@/components/admin/NewStoryButton";
/**
 * مركز التحكم — أول ما يراه صاحب الموقع.
 *
 * ليس مجرد أرقام: الأرقام + آخر ما تغيّر + الإجراء التالي في شاشة واحدة، حتى
 * يستطيع الدخول والعمل مباشرة بدل التنقّل للبحث عن نقطة البداية.
 * كل الأرقام حقيقية من `admin_overview_stats()` (استدعاء واحد للداتابيز).
 */

const STATUS_LABEL = {
  published: "منشورة",
  draft: "مسودة",
  locked: "مقفلة"
} as const;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.round(hours / 24);
  return `منذ ${days} يوم`;
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  "story.created": <BookOpenIcon className="h-3.5 w-3.5" />,
  "story.published": <ShieldCheckIcon className="h-3.5 w-3.5" />,
  "story.locked": <LockIcon className="h-3.5 w-3.5" />,
  "story.unlocked": <LockIcon className="h-3.5 w-3.5" />,
  "story.deleted": <FileTextIcon className="h-3.5 w-3.5" />,
  "media.uploaded": <ImageIcon className="h-3.5 w-3.5" />
};

const ACTIVITY_LABEL: Record<string, string> = {
  "story.created": "تم إنشاء قصة",
  "story.published": "تم تحديث قصة",
  "story.locked": "تم قفل قصة",
  "story.unlocked": "تم فتح قصة",
  "story.duplicated": "تم تكرار قصة",
  "story.deleted": "تم حذف قصة",
  "story.version_restored": "استعادة إصدار",
  "media.uploaded": "تم رفع صورة",
  "media.deleted": "تم حذف صورة",
  "category.created": "تصنيف جديد",
  "category.updated": "تحديث تصنيف",
  "category.deleted": "حذف تصنيف"
};

export default async function AdminOverviewPage() {
  const identity = await requireAdmin();
  const [stats, recent, activity, categories] = await Promise.all([
  getOverviewStats(),
  listStories({ pageSize: 5 }),
  listActivity(6),
  listCategories()]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الخير";

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-end justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div>
          <h1 className="text-[24px] font-black text-white">
            {greeting}، {identity.nickname} 👋
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-400">
            إليك نظرة عامة على منصة WordFlow اليوم.
          </p>
        </div>
        <NewStoryLink label="إنشاء قصة جديدة" />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي القصص"
          value={stats.total}
          caption={`+${stats.newThisWeek} هذا الأسبوع`}
          icon={<BookOpenIcon className="h-5 w-5" />}
          tone="purple"
          trend={stats.trend} />

        <StatCard
          label="القصص المنشورة"
          value={stats.published}
          caption={
          stats.total > 0 ?
          `${Math.round(stats.published / stats.total * 100)}% من الإجمالي` :
          "—"
          }
          icon={<ShieldCheckIcon className="h-5 w-5" />}
          tone="cyan"
          trend={stats.trend} />

        <StatCard
          label="القصص المقفلة"
          value={stats.locked}
          caption={
          stats.total > 0 ?
          `${Math.round(stats.locked / stats.total * 100)}% من الإجمالي` :
          "—"
          }
          icon={<LockIcon className="h-5 w-5" />}
          tone="gold"
          trend={stats.trend} />

        <StatCard
          label="المسودات"
          value={stats.drafts}
          caption="بانتظار النشر"
          icon={<FileTextIcon className="h-5 w-5" />}
          tone="pink"
          trend={stats.trend} />

      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr_0.9fr]">
        <Panel
          title="آخر القصص"
          padded={false}
          action={
          <Link
            href="/admin/stories"
            className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11.5px] font-bold text-slate-300 transition-colors hover:text-white">

              عرض الكل
            </Link>
          }>

          {recent.rows.length === 0 ?
          <EmptyState
            title="لا توجد قصص بعد"
            description="ابدأ بإضافة قصتك الأولى، وستظهر هنا مع حالتها وآخر تحديث." /> :


          <ul className="divide-y divide-white/[0.04]">
              {recent.rows.map((row) =>
            <li key={row.id}>
                  <Link
                href={`/admin/stories/${row.slug}`}
                className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-white/[0.025]">

                    <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0B111C]">
                      {row.coverImage &&
                  <img
                    src={row.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                    aria-hidden />

                  }
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="font-en block truncate text-[13.5px] font-bold text-white">
                        {row.titleEn}
                      </span>
                      <span className="block truncate text-[11.5px] text-slate-500">
                        {row.titleAr}
                      </span>
                    </span>

                    <span className="font-en hidden rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-300 sm:block">
                      {row.cefrLevel}
                    </span>

                    <StatusPill status={row.status}>{STATUS_LABEL[row.status]}</StatusPill>

                    <span className="hidden w-[86px] shrink-0 text-left text-[11px] text-slate-500 lg:block">
                      {relativeTime(row.updatedAt)}
                    </span>
                  </Link>
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title="النشاط الأخير" padded={false}>
          {activity.length === 0 ?
          <EmptyState
            title="لا يوجد نشاط"
            description="كل تعديل تقوم به على القصص أو الوسائط سيُسجَّل هنا تلقائياً." /> :


          <ul className="flex flex-col gap-1 p-3">
              {activity.map((entry) =>
            <li key={entry.id} className="flex items-start gap-3 rounded-xl px-2 py-2">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0B111C] text-cyan-300">
                    {ACTIVITY_ICONS[entry.action] ?? <ActivityIcon className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-bold text-slate-200">
                      {ACTIVITY_LABEL[entry.action] ?? entry.action}
                    </span>
                    <span className="font-en block truncate text-[11.5px] text-slate-500">
                      {entry.label || entry.entityId}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10.5px] text-slate-600">
                    {relativeTime(entry.createdAt)}
                  </span>
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title="إجراءات سريعة">
          <div className="flex flex-col gap-2.5">
<NewStoryLink label="إنشاء قصة جديدة" />
            {[
            { href: "/admin/media", label: "رفع وسائط جديدة", icon: ImageIcon },
            { href: "/admin/categories", label: "إدارة التصنيفات", icon: FolderIcon },
            {
              href: "/admin/stories?status=locked",
              label: "القصص المقفلة",
              icon: LockIcon
            },
            { href: "/admin/users", label: "المستخدمون", icon: UsersIcon }].
            map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#0B111C] px-3.5 py-2.5 text-[12.5px] font-bold text-slate-300 transition-colors hover:border-white/20 hover:text-white">

                  <span>{action.label}</span>
                  <Icon className="h-4 w-4 text-slate-500" aria-hidden />
                </Link>);

            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="معدل إكمال القصص"
          value={`${stats.completionRate}%`}
          caption="من كل من بدأ قصة"
          icon={<ZapIcon className="h-5 w-5" />}
          tone="cyan" />

        <StatCard
          label="المستخدمون النشطون"
          value={stats.activeUsers}
          caption="خلال ٧ أيام"
          icon={<UsersIcon className="h-5 w-5" />}
          tone="purple" />

        <StatCard
          label="متوسط وقت القراءة"
          value={`${stats.avgReadMinutes} د`}
          caption="لكل قصة"
          icon={<ClockIcon className="h-5 w-5" />}
          tone="gold" />

        <StatCard
          label="التصنيفات"
          value={categories.length}
          caption={`${categories.filter((category) => category.isActive).length} مفعّلة`}
          icon={<FolderIcon className="h-5 w-5" />}
          tone="pink" />

      </div>
    </div>);

}