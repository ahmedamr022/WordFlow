import React from "react";
import { BookOpenIcon, FileTextIcon, LockIcon, ShieldCheckIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getOverviewStats, listCategories, listStories } from "@/lib/admin/queries";
import { StatCard } from "@/components/admin/ui/surfaces";
import { StoriesTable } from "@/components/admin/StoriesTable";
import { NewStoryButton } from "@/components/admin/NewStoryButton";
import type { StoryStatus } from "@/types/admin";

/**
 * إدارة القصص.
 *
 * الفلاتر والصفحة تُقرأ من الـ URL وتُنفّذ على السيرفر: الترقيم صحيح دائماً،
 * والرابط قابل للمشاركة («ابعتلي رابط القصص المقفولة»)، وزر الرجوع يعمل.
 */

const PAGE_SIZE = 10;

function asStatus(value?: string): StoryStatus | "all" {
  return value === "published" || value === "draft" || value === "locked" ? value : "all";
}

export default async function AdminStoriesPage({
  searchParams



}: {searchParams: Promise<Record<string, string | string[] | undefined>>;}) {
  await requireAdmin();
  const params = await searchParams;

  const single = (key: string): string =>
  Array.isArray(params[key]) ? String(params[key]?.[0] ?? "") : String(params[key] ?? "");

  const filters = {
    search: single("q"),
    status: asStatus(single("status")),
    categorySlug: single("category") || "all",
    level: single("level") || "all"
  };
  const page = Math.max(1, Number(single("page") || 1));

  const [stats, categories, result] = await Promise.all([
  getOverviewStats(),
  listCategories(),
  listStories({
    search: filters.search,
    status: filters.status,
    categorySlug: filters.categorySlug,
    level: filters.level,
    page,
    pageSize: PAGE_SIZE
  })]
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300">
            <BookOpenIcon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">إدارة القصص</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              إنشاء وتعديل وإدارة جميع القصص في منصة WordFlow
            </p>
          </div>
        </div>
        <NewStoryButton categories={categories} />
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

      <StoriesTable
        rows={result.rows}
        total={result.total}
        page={page}
        pageSize={PAGE_SIZE}
        categories={categories}
        counts={{
          all: stats.total,
          published: stats.published,
          draft: stats.drafts,
          locked: stats.locked
        }}
        filters={filters} />

    </div>);

}