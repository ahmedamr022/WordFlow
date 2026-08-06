import React from "react";
import { BarChart3Icon, BookOpenIcon, ClockIcon, StarIcon, UsersIcon, ZapIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import {
  getLevelDistribution,
  getProgressSummary,
  listProgress,
  listStoryAnalytics } from
"@/lib/admin/queries";
import { Panel, StatCard, EmptyState } from "@/components/admin/ui/surfaces";
import { BarList, Donut } from "@/components/admin/ui/charts";
import { levelColor, levelLabel } from "@/lib/admin/level";

/**
 * التقدم.
 *
 * الفرق بينها وبين «المستخدمون»: تلك تدير الحسابات، وهذه تجيب عن سؤال
 * التعلّم — من يتقدم، ومن توقّف، وأين تتعثّر القصص. لذلك المقاييس هنا نسب
 * إكمال ووقت قراءة لا حالات حساب.
 */

export const dynamic = "force-dynamic";

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round(seconds % 3600 / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "اليوم";
  if (days === 1) return "أمس";
  if (days < 30) return `منذ ${days} يوم`;
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(iso));
}

export default async function AdminProgressPage() {
  await requireAdmin();
  const [summary, rows, distribution, topStories] = await Promise.all([
  getProgressSummary(),
  listProgress(25),
  getLevelDistribution(),
  listStoryAnalytics(6)]
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
            <BarChart3Icon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">التقدم</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              متابعة تقدّم التعلّم والتفاعل عبر المنصة
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="إجمالي المستخدمين"
          value={summary.users}
          caption={`${summary.notStarted} لم يبدأوا بعد`}
          icon={<UsersIcon className="h-5 w-5" />}
          tone="cyan" />

        <StatCard
          label="القصص المقروءة"
          value={summary.storiesRead.toLocaleString("en-US")}
          caption="إجمالي مرات البدء"
          icon={<BookOpenIcon className="h-5 w-5" />}
          tone="purple" />

        <StatCard
          label="متوسط القصص لكل قارئ"
          value={summary.avgStoriesPerUser}
          caption="قصة لكل مستخدم بدأ"
          icon={<StarIcon className="h-5 w-5" />}
          tone="gold" />

        <StatCard
          label="نقاط الخبرة"
          value={summary.xpTotal.toLocaleString("en-US")}
          caption="من الأسطر المكتملة"
          icon={<ZapIcon className="h-5 w-5" />}
          tone="pink" />

        <StatCard
          label="متوسط وقت القراءة"
          value={formatDuration(summary.avgReadSeconds)}
          caption="لكل قصة"
          icon={<ClockIcon className="h-5 w-5" />}
          tone="cyan" />

      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <Panel
          title="تقدّم المستخدمين"
          padded={false}
          action={
          <span className="text-[11.5px] text-slate-500">مرتّب حسب نقاط الخبرة</span>
          }>

          {rows.length === 0 ?
          <EmptyState
            title="لا يوجد تقدّم مسجّل"
            description="بمجرد أن يبدأ المستخدمون القراءة ستظهر نِسَب الإكمال هنا." /> :


          <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-right">
                <thead>
                  <tr className="border-b border-white/[0.05] text-[11.5px] font-bold text-slate-500">
                    <th scope="col" className="px-5 py-3">#</th>
                    <th scope="col" className="px-5 py-3">المستخدم</th>
                    <th scope="col" className="px-5 py-3">المستوى</th>
                    <th scope="col" className="px-5 py-3">القصص المكتملة</th>
                    <th scope="col" className="px-5 py-3">نسبة الإكمال</th>
                    <th scope="col" className="px-5 py-3">وقت القراءة</th>
                    <th scope="col" className="px-5 py-3">نقاط الخبرة</th>
                    <th scope="col" className="px-5 py-3">آخر نشاط</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.04]">
                  {rows.map((row, index) =>
                <tr key={row.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="font-en px-5 py-3.5 text-[12px] font-bold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-[#0B111C]">
                            {row.avatarUrl &&
                        <img
                          src={row.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          aria-hidden />

                        }
                          </span>
                          <span className="truncate text-[13px] font-bold text-white">
                            {row.nickname}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                      className="font-en rounded-md border px-2 py-0.5 text-[11px] font-bold"
                      style={{
                        borderColor: `${levelColor(row.englishLevel)}55`,
                        background: `${levelColor(row.englishLevel)}18`,
                        color: levelColor(row.englishLevel)
                      }}>

                          {row.englishLevel}
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-slate-500">
                          {levelLabel(row.englishLevel)}
                        </span>
                      </td>

                      <td className="font-en px-5 py-3.5 text-[13px] font-bold text-slate-200">
                        {row.storiesCompleted}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="flex w-[130px] flex-col gap-1.5">
                          <span className="font-en text-[11.5px] font-bold text-cyan-300">
                            {row.completionRate}%
                          </span>
                          <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <span
                          className="block h-full rounded-full bg-gradient-to-l from-cyan-400 to-violet-500"
                          style={{ width: `${Math.max(2, row.completionRate)}%` }} />

                          </span>
                        </span>
                      </td>

                      <td className="font-en px-5 py-3.5 text-[12.5px] text-slate-400">
                        {formatDuration(row.readingSeconds)}
                      </td>

                      <td className="font-en px-5 py-3.5 text-[13px] font-bold text-amber-300">
                        ⚡ {row.xp.toLocaleString("en-US")}
                      </td>

                      <td className="px-5 py-3.5 text-[12px] text-slate-500">
                        {relativeTime(row.lastActiveAt)}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          }
        </Panel>

        <aside className="flex flex-col gap-4">
          <Panel title="نظرة عامة على التقدم">
            <Donut
              centerLabel="حالات القراءة"
              slices={[
              { label: "مكتملة", value: summary.completed, color: "#34d399" },
              { label: "قيد التقدم", value: summary.inProgress, color: "#f59e0b" },
              { label: "متوقفة", value: summary.stalled, color: "#f43f5e" },
              { label: "لم تبدأ", value: summary.notStarted, color: "#64748b" }]
              } />

            <p className="mt-4 rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-slate-400">
              «متوقفة» = بدأ القارئ ولم يعد خلال ١٤ يوماً. هذه هي الفئة التي
              تستحق تذكيراً، لا التي لم تبدأ أصلاً.
            </p>
          </Panel>

          <Panel title="توزيع المستويات">
            <Donut
              centerLabel="إجمالي"
              slices={distribution.map((bucket) => ({
                label: `${bucket.level} ${bucket.label}`,
                value: bucket.count,
                color: bucket.color,
                caption: `${bucket.percent}%`
              }))} />

          </Panel>

          <Panel title="أكثر القصص إكمالاً">
            <BarList
              items={topStories.map((story) => ({
                label: story.titleEn,
                sublabel: `${story.readers} قارئ`,
                value: story.completionRate,
                display: `${story.completionRate}%`
              }))}
              max={100} />

          </Panel>
        </aside>
      </div>
    </div>);

}