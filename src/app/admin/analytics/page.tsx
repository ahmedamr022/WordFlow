import React from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  ClockIcon,
  EyeIcon,
  FlameIcon,
  PieChartIcon,
  TrendingUpIcon,
  UsersIcon } from
"lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import {
  getLevelDistribution,
  getOverviewStats,
  getProgressSummary,
  listCategories,
  listStoryAnalytics } from
"@/lib/admin/queries";
import { Panel, StatCard, EmptyState } from "@/components/admin/ui/surfaces";
import { AreaChart, BarList, Donut } from "@/components/admin/ui/charts";

/**
 * تحليلات المنصة.
 *
 * `?view=popular` يركّز على القصص الشائعة (نفس الرابط في الشريط الجانبي) —
 * صفحة واحدة بعرضين أفضل من صفحتين تكرران نفس الاستعلامات.
 */

export const dynamic = "force-dynamic";

const WEEK_LABELS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default async function AdminAnalyticsPage({
  searchParams



}: {searchParams: Promise<Record<string, string | string[] | undefined>>;}) {
  await requireAdmin();
  const params = await searchParams;
  const view = Array.isArray(params.view) ? params.view[0] : params.view;
  const popularOnly = view === "popular";

  const [stats, analytics, distribution, summary, categories] = await Promise.all([
  getOverviewStats(),
  listStoryAnalytics(popularOnly ? 12 : 8),
  getLevelDistribution(),
  getProgressSummary(),
  listCategories()]
  );

  const totalViews = analytics.reduce((sum, story) => sum + story.readers, 0);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
            {popularOnly ?
            <FlameIcon className="h-6 w-6" aria-hidden /> :

            <PieChartIcon className="h-6 w-6" aria-hidden />
            }
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">
              {popularOnly ? "القصص الشائعة" : "تحليلات المنصة"}
            </h1>
            <p className="mt-1 text-[13px] text-slate-400">
              {popularOnly ?
              "ترتيب القصص حسب عدد القرّاء ونسبة الإكمال" :
              "قراءة شاملة لأداء المحتوى والمستخدمين"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B111C] p-1">
          <Link
            href="/admin/analytics"
            aria-current={!popularOnly ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
            !popularOnly ?
            "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/35" :
            "text-slate-400 hover:text-white"}`
            }>

            نظرة عامة
          </Link>
          <Link
            href="/admin/analytics?view=popular"
            aria-current={popularOnly ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
            popularOnly ?
            "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/35" :
            "text-slate-400 hover:text-white"}`
            }>

            القصص الشائعة
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي القصص"
          value={stats.total}
          caption={`${stats.published} منشورة`}
          icon={<BookOpenIcon className="h-5 w-5" />}
          tone="purple"
          trend={stats.trend} />

        <StatCard
          label="القرّاء"
          value={totalViews.toLocaleString("en-US")}
          caption="مرات بدء القراءة"
          icon={<EyeIcon className="h-5 w-5" />}
          tone="cyan"
          trend={stats.trend} />

        <StatCard
          label="معدل الإكمال"
          value={`${summary.completionRate}%`}
          caption="من كل من بدأ قصة"
          icon={<TrendingUpIcon className="h-5 w-5" />}
          tone="gold"
          trend={stats.trend} />

        <StatCard
          label="المستخدمون النشطون"
          value={stats.activeUsers}
          caption="خلال ٧ أيام"
          icon={<UsersIcon className="h-5 w-5" />}
          tone="pink"
          trend={stats.trend} />

      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {!popularOnly &&
          <Panel title="نشاط القراءة عبر الأسبوع">
              <AreaChart points={stats.trend.slice(-7)} labels={WEEK_LABELS} suffix=" قراءة" />
            </Panel>
          }

          <Panel
            title={popularOnly ? "ترتيب القصص" : "أكثر القصص قراءة"}
            padded={false}>

            {analytics.length === 0 ?
            <EmptyState
              title="لا توجد بيانات قراءة"
              description="ستظهر الأرقام هنا بعد أن يبدأ المستخدمون قراءة القصص." /> :


            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-right">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-[11.5px] font-bold text-slate-500">
                      <th scope="col" className="px-5 py-3">#</th>
                      <th scope="col" className="px-5 py-3">القصة</th>
                      <th scope="col" className="px-5 py-3">القرّاء</th>
                      <th scope="col" className="px-5 py-3">نسبة الإكمال</th>
                      <th scope="col" className="px-5 py-3">متوسط الوقت</th>
                      <th scope="col" className="px-5 py-3 text-left">تحرير</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.04]">
                    {analytics.map((story, index) =>
                  <tr key={story.slug} className="transition-colors hover:bg-white/[0.02]">
                        <td className="font-en px-5 py-3.5 text-[12px] font-bold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="font-en px-5 py-3.5 text-[13px] font-bold text-white">
                          {story.titleEn}
                        </td>
                        <td className="font-en px-5 py-3.5 text-[13px] text-slate-200">
                          {story.readers.toLocaleString("en-US")}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex w-[130px] flex-col gap-1.5">
                            <span className="font-en text-[11.5px] font-bold text-cyan-300">
                              {story.completionRate}%
                            </span>
                            <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                              <span
                            className="block h-full rounded-full bg-gradient-to-l from-cyan-400 to-violet-500"
                            style={{ width: `${Math.max(2, story.completionRate)}%` }} />

                            </span>
                          </span>
                        </td>
                        <td className="font-en px-5 py-3.5 text-[12.5px] text-slate-400">
                          {story.avgMinutes}m
                        </td>
                        <td className="px-5 py-3.5 text-left">
                          <Link
                        href={`/admin/stories/${story.slug}`}
                        className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11.5px] font-bold text-slate-300 transition-colors hover:text-white">

                            فتح
                          </Link>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </Panel>
        </div>

        <aside className="flex flex-col gap-4">
          <Panel title="توزيع المستويات">
            <Donut
              centerLabel="مستخدم"
              slices={distribution.map((bucket) => ({
                label: `${bucket.level} ${bucket.label}`,
                value: bucket.count,
                color: bucket.color,
                caption: `${bucket.percent}%`
              }))} />

          </Panel>

          <Panel title="القصص حسب الفئة">
            <BarList
              items={categories.
              slice().
              sort((a, b) => b.storiesCount - a.storiesCount).
              slice(0, 6).
              map((category) => ({
                label: category.nameEn,
                sublabel: category.nameAr,
                value: category.storiesCount,
                color: category.color
              }))} />

          </Panel>

          <Panel title="مؤشرات سريعة">
            <ul className="flex flex-col gap-3 text-[12.5px]">
              {[
              { label: "متوسط وقت القراءة", value: `${stats.avgReadMinutes} دقيقة` },
              { label: "قصص مقفلة", value: String(stats.locked) },
              { label: "مسودات بانتظار النشر", value: String(stats.drafts) },
              { label: "قرّاء توقفوا", value: String(summary.stalled) }].
              map((item) =>
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-2.5">

                  <span className="font-bold text-slate-400">{item.label}</span>
                  <span className="font-en font-bold text-slate-100">{item.value}</span>
                </li>
              )}
            </ul>

            <Link
              href="/admin/progress"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-[#0B111C] py-2.5 text-[12.5px] font-bold text-slate-300 transition-colors hover:text-white">

              <ClockIcon className="h-4 w-4" aria-hidden />
              تفاصيل التقدم
            </Link>
          </Panel>
        </aside>
      </div>
    </div>);

}