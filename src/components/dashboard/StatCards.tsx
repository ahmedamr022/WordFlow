import React from "react";
import { Flame, Star, BookOpen, Target, BoxIcon, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";
import { DailyActivityPoint, UserStats } from "@/lib/userStats";
/**
 * صار presentational بالكامل.
 *
 * قبل:  + useUserStats() + useDailyActivity() — أي طلبان
 * إضافيان بعد الـ hydration، ونفس useUserStats كان يُنادى مرة ثانية في
 * DashboardHeader بلا أي مشاركة للكاش. النتيجة: البطاقات تظهر فارغة
 * (skeleton) لثانية أو أكثر في كل مرة تُفتح الصفحة.
 * بعد: الأرقام تأتي props من السيرفر وتُرسَم مع أول HTML — بلا skeleton
 * وبلا JS إضافي في الباندل.
 */

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  chart: "bars" | "line";
  data: number[];
  stroke: string;
}
export interface StatCardsProps {
  stats: UserStats;
  activity: DailyActivityPoint[];
}
function padSeries(series: number[], length = 10): number[] {
  if (series.length >= length) return series.slice(-length);
  return [...Array<number>(length - series.length).fill(0), ...series];
}
export function StatCards({
  stats,
  activity
}: StatCardsProps) {
  const xpSeries = padSeries(activity.map((p) => p.xpEarned));
  const linesSeries = padSeries(activity.map((p) => p.linesTyped));
  const storiesSeries = padSeries(activity.map((p) => p.storiesCompleted));
  const wordsSeries = padSeries(activity.map((p) => p.wordsReviewed));
  const cards: StatCard[] = [{
    label: "سلسلة التعلم",
    value: String(stats.streakCount),
    sub: stats.longestStreak > 0 ? `أطول سلسلة ${stats.longestStreak} يوم` : "يوم متتالي",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    chart: "bars",
    data: linesSeries,
    stroke: "#fb923c"
  }, {
    label: "إجمالي النقاط",
    value: stats.xpTotal.toLocaleString("en-US"),
    sub: "نقطة خبرة",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    chart: "line",
    data: xpSeries,
    stroke: "#fbbf24"
  }, {
    label: "القصص المكتملة",
    value: String(stats.storiesCompleted),
    sub: "قصة",
    icon: BookOpen,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    chart: "bars",
    data: storiesSeries,
    stroke: "#22d3ee"
  }, {
    label: "دقة الأداء",
    value: stats.averageAccuracy === null ? "—" : `${stats.averageAccuracy}%`,
    sub: stats.averageAccuracy === null ? "لا توجد محاولات بعد" : "متوسط آخر المحاولات",
    icon: Target,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    chart: "line",
    data: wordsSeries,
    stroke: "#e879f9"
  }];
  return <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((s) => {
      const Icon = s.icon;
      return <div key={s.label} className="group relative p-5 rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1" style={{
        background: `linear-gradient(180deg, ${s.stroke}0A 0%, #0B0F1C 55%)`,
        borderColor: "rgba(255,255,255,0.06)"
      }}>

            <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] opacity-70" style={{
          background: `linear-gradient(90deg, transparent, ${s.stroke}, transparent)`
        }} />

            <span aria-hidden className="pointer-events-none absolute -top-8 -right-6 w-24 h-24 rounded-full blur-2xl opacity-25 transition-opacity duration-300 group-hover:opacity-40" style={{
          background: s.stroke
        }} />

            <div className="relative flex items-center gap-2.5 mb-4">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color} ring-1 ring-inset ring-white/10`}>

                <Icon size={17} aria-hidden />
              </span>
              <span className="text-[13px] font-bold text-slate-300">{s.label}</span>
            </div>

            <div className="relative flex items-end justify-between gap-2">
              <div>
                <span className="text-3xl font-black text-white" dir="ltr">
                  {s.value}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{s.sub}</span>
              </div>
              <Sparkline type={s.chart} data={s.data} color={s.stroke} />
            </div>
          </div>;
    })}
    </section>;
}