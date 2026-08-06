"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { useUserStats } from "@/hooks/useUserStats";
import { Trophy, Star, Flame, Target } from "lucide-react";

const CHALLENGES = [
{
  title: "التحدي الأسبوعي",
  desc: "أكمل 5 قصص هذا الأسبوع",
  total: 5,
  reward: "+250 XP",
  icon: Trophy,
  progressKey: "stories" as const
},
{
  title: "سلسلة النار",
  desc: "حافظ على 7 أيام متتالية",
  total: 7,
  reward: "+100 XP",
  icon: Flame,
  progressKey: "streak" as const
},
{
  title: "دقة مثالية",
  desc: "أنهِ قصة بدقة 100%",
  total: 1,
  reward: "+75 XP",
  icon: Target,
  progressKey: "accuracy" as const
}];


export default function ChallengesPage() {
  // قبل: UserStatsService.getStats() من localStorage. بعد: user_stats عبر RLS.
  const { stats, isLoading } = useUserStats();

  const getProgress = (key: (typeof CHALLENGES)[number]["progressKey"]) => {
    if (key === "stories") return Math.min(stats.storiesCompleted, 5);
    if (key === "streak") return Math.min(stats.streakCount, 7);
    // الدقة المثالية: تُحتسب من متوسط دقة المحاولات الحقيقية بدل صفر ثابت.
    return stats.averageAccuracy !== null && stats.averageAccuracy >= 100 ? 1 : 0;
  };

  return (
    <div className="min-h-screen bg-[#05070E] text-white flex font-arabic" dir="ltr">
      <AppSidebar active="التحديات" />
      <div className="flex-1 flex flex-col min-w-0">
        <AppShellHeader streak={stats.streakCount} level={stats.level} />
        <main className="flex-1 p-8 overflow-y-auto" dir="rtl">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-amber-400" size={28} />
            <h1 className="text-3xl font-black">التحديات</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" aria-busy={isLoading}>
            {CHALLENGES.map((c) => {
              const Icon = c.icon;
              const progress = getProgress(c.progressKey);
              const pct = Math.round(progress / c.total * 100);
              return (
                <div key={c.title} className="p-6 rounded-2xl bg-[#0B0F1C] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Icon size={20} className="text-amber-400" />
                    </span>
                    <div>
                      <h2 className="font-bold">{c.title}</h2>
                      <p className="text-xs text-slate-400">{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2" dir="ltr">
                    <span className="text-2xl font-black">{isLoading ? "—" : progress}</span>
                    <span className="text-slate-500">/ {c.total}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full transition-[width] duration-500"
                      style={{ width: `${isLoading ? 0 : pct}%` }} />
                    
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                    <Star size={14} fill="currentColor" />
                    {c.reward}
                  </div>
                </div>);

            })}
          </div>

          <Link
            href="/stories"
            className="inline-block mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-600 font-bold hover:brightness-110 transition">
            
            ابدأ تحديًا جديدًا
          </Link>
        </main>
      </div>
    </div>);

}