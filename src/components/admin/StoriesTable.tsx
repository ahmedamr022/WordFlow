"use client";

import React, { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CopyIcon,
  EyeIcon,
  FileTextIcon,
  LockIcon,
  MoreVerticalIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  UnlockIcon } from
"lucide-react";

import {
  deleteStoryAction,
  duplicateStoryAction,
  setStoryStatusAction,
  updateStoryAccessAction } from
"@/app/actions/admin/stories";
import { Button, Segmented, Select, TextInput } from "@/components/admin/ui/controls";
import {
  ConfirmDialog,
  EmptyState,
  Panel,
  Spinner,
  StatusPill } from
"@/components/admin/ui/surfaces";
import type { AdminCategory, AdminStoryRow, StoryStatus } from "@/types/admin";

/**
 * جدول إدارة القصص.
 *
 * قرار مهم: **جدول لا كروت**. كروت المستخدم مصمّمة للاستكشاف والإغراء؛ صاحب
 * الموقع يحتاج المقارنة والمسح السريع لعشرات الصفوف (الحالة، المستوى، آخر
 * تحديث، عدد الجُمل) — وهذا لا يعمل مع الكروت.
 *
 * الفلاتر تُدار عبر الـ URL: كل حالة قابلة للمشاركة والرجوع بزر Back، والصفحة
 * تُعاد على السيرفر فلا يوجد فلترة على العميل تكذب مع الترقيم.
 */

const STATUS_LABEL: Record<StoryStatus, string> = {
  published: "منشورة",
  draft: "مسودة",
  locked: "مقفلة"
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface StoriesTableProps {
  rows: AdminStoryRow[];
  total: number;
  page: number;
  pageSize: number;
  categories: AdminCategory[];
  counts: {all: number;published: number;draft: number;locked: number;};
  filters: {
    search: string;
    status: StoryStatus | "all";
    categorySlug: string;
    level: string;
  };
}

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.round(hours / 24)} يوم`;
}

export function StoriesTable({
  rows,
  total,
  page,
  pageSize,
  categories,
  counts,
  filters
}: StoriesTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<AdminStoryRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pages = Math.max(1, Math.ceil(total / pageSize));

  const pushFilters = useCallback(
    (next: Partial<StoriesTableProps["filters"]> & {page?: number;}) => {
      const params = new URLSearchParams();
      const merged = { ...filters, page, ...next };
      if (merged.search) params.set("q", merged.search);
      if (merged.status !== "all") params.set("status", merged.status);
      if (merged.categorySlug !== "all") params.set("category", merged.categorySlug);
      if (merged.level !== "all") params.set("level", merged.level);
      if (merged.page && merged.page > 1) params.set("page", String(merged.page));
      router.push(`/admin/stories${params.toString() ? `?${params}` : ""}`);
    },
    [filters, page, router]
  );

  const runAction = useCallback(
    (fn: () => Promise<{ok: boolean;error?: string;}>) => {
      setError(null);
      setOpenMenu(null);
      startTransition(async () => {
        const result = await fn();
        if (!result.ok) {
          setError(result.error ?? "تعذر تنفيذ العملية");
          return;
        }
        router.refresh();
      });
    },
    [router]
  );

  const statusOptions = useMemo(
    () =>
    [
    { value: "all" as const, label: `الكل (${counts.all})` },
    { value: "published" as const, label: `منشورة (${counts.published})` },
    { value: "locked" as const, label: `مقفلة (${counts.locked})` },
    { value: "draft" as const, label: `مسودات (${counts.draft})` }],

    [counts]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={statusOptions}
          value={filters.status}
          onChange={(status) => pushFilters({ status, page: 1 })} />


        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-[150px]">
            <Select
              aria-label="تصفية حسب التصنيف"
              value={filters.categorySlug}
              onChange={(event) => pushFilters({ categorySlug: event.target.value, page: 1 })}>

              <option value="all">جميع التصنيفات</option>
              {categories.map((category) =>
              <option key={category.id} value={category.slug}>
                  {category.nameAr}
                </option>
              )}
            </Select>
          </div>

          <div className="w-[130px]">
            <Select
              aria-label="تصفية حسب المستوى"
              value={filters.level}
              onChange={(event) => pushFilters({ level: event.target.value, page: 1 })}>

              <option value="all">جميع المستويات</option>
              {LEVELS.map((level) =>
              <option key={level} value={level}>
                  {level}
                </option>
              )}
            </Select>
          </div>

          <form
            className="relative w-[220px]"
            onSubmit={(event) => {
              event.preventDefault();
              pushFilters({ search, page: 1 });
            }}>

            <SearchIcon
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden />

            <TextInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث في القصص..."
              aria-label="ابحث في القصص"
              className="pr-9" />

          </form>
        </div>
      </div>

      {error &&
      <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] font-bold text-rose-300">
          {error}
        </p>
      }

      <Panel padded={false}>
        {rows.length === 0 ?
        <EmptyState
          title="لا توجد قصص مطابقة"
          description="جرّب تغيير الفلاتر أو البحث بكلمة أخرى، أو أنشئ قصة جديدة." /> :


        <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-right">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11.5px] font-bold text-slate-500">
                  <th className="px-4 py-3 font-bold">القصة</th>
                  <th className="px-3 py-3 font-bold">التصنيف</th>
                  <th className="px-3 py-3 font-bold">المستوى</th>
                  <th className="px-3 py-3 font-bold">الحالة</th>
                  <th className="px-3 py-3 font-bold">عدد الجُمل</th>
                  <th className="px-3 py-3 font-bold">آخر تحديث</th>
                  <th className="px-3 py-3 font-bold">المشاهدات</th>
                  <th className="px-3 py-3 font-bold">إجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((row) =>
              <tr key={row.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link
                    href={`/admin/stories/${row.slug}`}
                    className="flex items-center gap-3">

                        <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0B111C]">
                          {row.coverImage &&
                      <img
                        src={row.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                        aria-hidden />

                      }
                        </span>
                        <span className="min-w-0">
                          <span className="font-en block truncate text-[13px] font-bold text-white">
                            {row.titleEn}
                          </span>
                          <span className="block truncate text-[11.5px] text-slate-500">
                            {row.titleAr}
                          </span>
                        </span>
                      </Link>
                    </td>

                    <td className="px-3 py-3">
                      <span className="rounded-lg border border-white/[0.07] bg-[#0B111C] px-2.5 py-1 text-[11.5px] font-bold text-slate-300">
                        {row.categoryLabel}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-en rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11.5px] font-bold text-cyan-300">
                        {row.cefrLevel}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <StatusPill status={row.status}>{STATUS_LABEL[row.status]}</StatusPill>
                    </td>

                    <td className="font-en px-3 py-3 text-[12.5px] text-slate-300">
                      {row.totalLines}
                    </td>

                    <td className="px-3 py-3 text-[11.5px] text-slate-500">
                      {relativeTime(row.updatedAt)}
                    </td>

                    <td className="font-en px-3 py-3 text-[12.5px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <EyeIcon className="h-3.5 w-3.5 text-slate-600" aria-hidden />
                        {row.views}
                      </span>
                    </td>

                    <td className="relative px-3 py-3">
                      <button
                    type="button"
                    aria-label={`إجراءات ${row.titleEn}`}
                    aria-expanded={openMenu === row.id}
                    onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    openMenu === row.id ?
                    "border-cyan-400/40 bg-cyan-500/10 text-cyan-300" :
                    "border-white/[0.07] text-slate-400 hover:text-white"}`
                    }>

                        <MoreVerticalIcon className="h-4 w-4" />
                      </button>

                      {openMenu === row.id &&
                  <div
                    className="absolute left-0 top-full z-30 mt-1 w-[190px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0F1A] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                    onMouseLeave={() => setOpenMenu(null)}>

                          <Link
                      href={`/admin/stories/${row.slug}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold text-slate-200 transition-colors hover:bg-white/[0.06]">

                            تعديل القصة
                            <PencilIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          </Link>

                          <Link
                      href={`/story/${row.slug}`}
                      target="_blank"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold text-slate-200 transition-colors hover:bg-white/[0.06]">

                            معاينة
                            <EyeIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          </Link>

                          <button
                      type="button"
                      disabled={pending}
                      onClick={() => runAction(() => duplicateStoryAction(row.id))}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold text-slate-200 transition-colors hover:bg-white/[0.06]">

                            تكرار
                            <CopyIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          </button>

                          <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                      runAction(() =>
                      updateStoryAccessAction(row.id, {
                        locked: row.status !== "locked",
                        lockType: "visible",
                        lockMessage: "هذه القصة غير متاحة حالياً"
                      })
                      )
                      }
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold text-slate-200 transition-colors hover:bg-white/[0.06]">

                            {row.status === "locked" ? "فتح القصة" : "قفل القصة"}
                            {row.status === "locked" ?
                      <UnlockIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden /> :

                      <LockIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                      }
                          </button>

                          <button
                      type="button"
                      disabled={pending || row.status === "draft"}
                      onClick={() => runAction(() => setStoryStatusAction(row.id, "draft"))}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold text-slate-200 transition-colors hover:bg-white/[0.06] disabled:opacity-40">

                            نقل إلى مسودة
                            <FileTextIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          </button>

                          <div className="my-1 h-px bg-white/[0.06]" />

                          <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setOpenMenu(null);
                        setConfirming(row);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold text-rose-300 transition-colors hover:bg-rose-500/10">

                            حذف
                            <Trash2Icon className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                  }
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] px-4 py-3">
          <p className="text-[12px] text-slate-500">
            عرض {rows.length} من {total} قصة
            {pending && <span className="mr-3 inline-flex"><Spinner /></span>}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              tone="outline"
              disabled={page <= 1}
              onClick={() => pushFilters({ page: page - 1 })}
              className="px-3 py-2">

              السابق
            </Button>
            {Array.from({ length: Math.min(5, pages) }, (_, index) => index + 1).map((number) =>
            <button
              key={number}
              type="button"
              aria-current={number === page ? "page" : undefined}
              onClick={() => pushFilters({ page: number })}
              className={`font-en h-9 w-9 rounded-lg border text-[12.5px] font-bold transition-colors ${
              number === page ?
              "border-cyan-400/45 bg-cyan-500/10 text-cyan-200" :
              "border-white/[0.07] text-slate-400 hover:text-white"}`
              }>

                {number}
              </button>
            )}
            <Button
              tone="outline"
              disabled={page >= pages}
              onClick={() => pushFilters({ page: page + 1 })}
              className="px-3 py-2">

              التالي
            </Button>
          </div>
        </footer>
      </Panel>

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          const target = confirming;
          setConfirming(null);
          if (target) runAction(() => deleteStoryAction(target.id));
        }}
        title={`حذف "${confirming?.titleEn ?? ""}"؟`}
        confirmLabel="حذف القصة"
        pending={pending}
        consequences={[
        "ظهور القصة في المكتبة وصفحة القراءة",
        "ارتباط الصور والوسائط بها",
        "ترشيحها في «قصة اليوم» والتحديات"]
        } />

    </div>);

}

export default StoriesTable;