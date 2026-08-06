import React from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  FileTextIcon,
  FolderIcon,
  LayoutGridIcon,
  SettingsIcon,
  StarIcon } from
"lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getOverviewStats, listCategories } from "@/lib/admin/queries";
import { Panel, StatCard } from "@/components/admin/ui/surfaces";
import { Donut } from "@/components/admin/ui/charts";
import { CategoriesTable } from "@/components/admin/CategoriesTable";

/**
 * التصنيفات.
 *
 * العمود الأيمن ليس زينة: «نظرة عامة» تجيب عن السؤال الوحيد الذي يسبق أي
 * تعديل على التصنيفات — أين تتكدّس القصص وأين الفراغ.
 */

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const [categories, stats] = await Promise.all([listCategories(), getOverviewStats()]);

  const active = categories.filter((category) => category.isActive).length;
  const totalStories = categories.reduce((sum, category) => sum + category.storiesCount, 0);
  const avgPerCategory =
  categories.length > 0 ? Math.round(totalStories / categories.length * 10) / 10 : 0;

  const popular = categories.
  slice().
  sort((a, b) => b.storiesCount - a.storiesCount).
  slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300">
            <FolderIcon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">التصنيفات</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              إدارة تصنيفات القصص وتنظيمها داخل المنصة
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="إجمالي الفئات"
              value={categories.length}
              caption={`${active} مفعّلة`}
              icon={<LayoutGridIcon className="h-5 w-5" />}
              tone="purple"
              trend={stats.trend} />

            <StatCard
              label="فئات نشطة"
              value={active}
              caption={
              categories.length > 0 ?
              `${Math.round(active / categories.length * 100)}% من الإجمالي` :
              "—"
              }
              icon={<BookOpenIcon className="h-5 w-5" />}
              tone="cyan"
              trend={stats.trend} />

            <StatCard
              label="إجمالي القصص"
              value={stats.total}
              caption={`+${stats.newThisWeek} هذا الأسبوع`}
              icon={<FileTextIcon className="h-5 w-5" />}
              tone="gold"
              trend={stats.trend} />

            <StatCard
              label="متوسط القصص لكل فئة"
              value={avgPerCategory}
              caption="قصة"
              icon={<StarIcon className="h-5 w-5" />}
              tone="pink"
              trend={stats.trend} />

          </div>

          <CategoriesTable categories={categories} />
        </div>

        <aside className="flex flex-col gap-4">
          <Panel title="نظرة عامة">
            <Donut
              centerLabel="إجمالي القصص"
              slices={[
              {
                label: "منشورة",
                value: stats.published,
                color: "#34d399",
                caption: `${
                stats.total > 0 ? Math.round(stats.published / stats.total * 100) : 0}%`

              },
              {
                label: "مسودة",
                value: stats.drafts,
                color: "#f59e0b",
                caption: `${
                stats.total > 0 ? Math.round(stats.drafts / stats.total * 100) : 0}%`

              },
              {
                label: "مقفلة",
                value: stats.locked,
                color: "#f43f5e",
                caption: `${
                stats.total > 0 ? Math.round(stats.locked / stats.total * 100) : 0}%`

              }]
              } />

          </Panel>

          <Panel title="إجراءات سريعة">
            <div className="flex flex-col gap-2.5">
              {[
              { href: "/admin/stories", label: "إدارة القصص", icon: BookOpenIcon },
              { href: "/admin/media", label: "مكتبة الوسائط", icon: FileTextIcon },
              { href: "/admin/settings", label: "إعدادات المنصة", icon: SettingsIcon }].
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

          <Panel title="أكثر الفئات شعبية">
            {popular.length === 0 ?
            <p className="text-[12.5px] text-slate-500">أضف فئات لتظهر هنا.</p> :

            <ol className="flex flex-col gap-3">
                {popular.map((category, index) =>
              <li key={category.id} className="flex items-center gap-3">
                    <span className="font-en flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] text-[11px] font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <span className="font-en flex-1 truncate text-[13px] font-bold text-slate-200">
                      {category.nameEn}
                    </span>
                    <span className="text-[12px] font-bold text-cyan-300">
                      {category.storiesCount} قصة
                    </span>
                  </li>
              )}
              </ol>
            }

            <Link
              href="/admin/analytics"
              className="mt-4 flex items-center justify-center rounded-xl border border-white/[0.07] bg-[#0B111C] py-2.5 text-[12.5px] font-bold text-slate-300 transition-colors hover:text-white">

              عرض جميع الإحصائيات
            </Link>
          </Panel>
        </aside>
      </div>
    </div>);

}