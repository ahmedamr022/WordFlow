"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { useUserStats } from "@/hooks/useUserStats";
import { getTotalPlayableStoryCount } from "@/lib/storyCatalog";
import { BarChart3, BookOpen, Target, Star, Flame } from "lucide-react";

export default function StatsPage() {
  // قبل: UserStatsService.getStats() من localStorage — أرقام محلية يسهل تزويرها
  // ولا تتبع المستخدم عبر الأجهزة. بعد: user_stats عبر RLS.
  const { stats, isLoading, error } = useUserStats();

  const totalStories = getTotalPlayableStoryCount();

  const cards = [
  { label: "سلسلة التعلم", value: `${stats.streakCount} يوم`, icon: Flame, color: "text-orange-400" },
  { label: "إجمالي النقاط", value: stats.xpTotal.toLocaleString("en-US"), icon: Star, color: "text-amber-400" },
  { label: "القصص المكتملة", value: `${stats.storiesCompleted} / ${totalStories}`, icon: BookOpen, color: "text-cyan-400" },
  { label: "المفردات المحفوظة", value: stats.wordsLearned.toLocaleString("en-US"), icon: Target, color: "text-fuchsia-400" }];


  return (
    <div className="min-h-screen bg-[#05070E] text-white flex font-arabic" dir="ltr">
      <AppSidebar active="الإحصائيات" />
      <div className="flex-1 flex flex-col min-w-0">
        <AppShellHeader streak={stats.streakCount} level={stats.level} />
        <main className="flex-1 p-8 overflow-y-auto" dir="rtl">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-fuchsia-400" size={28} />
            <h1 className="text-3xl font-black">إحصائيات التعلم</h1>
          </div>

          {error &&
          <div role="alert" className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
              {error}
            </div>
          }

          {isLoading ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-busy="true">
              {[0, 1, 2, 3].map((i) =>
            <div key={i} className="h-[140px] rounded-2xl bg-[#0B0F1C] border border-white/[0.06] animate-pulse" />
            )}
            </div> :

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="p-6 rounded-2xl bg-[#0B0F1C] border border-white/[0.06]">
                    <Icon size={22} className={`${c.color} mb-3`} />
                    <p className="text-3xl font-black" dir="ltr">{c.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{c.label}</p>
                  </div>);

            })}
            </div>
          }

          <div className="rounded-2xl bg-[#0B0F1C] border border-white/[0.06] p-6">
            <h2 className="text-lg font-bold mb-4">مستواك الحالي</h2>
            <p className="text-slate-300">
              مستوى CEFR: <span className="font-mono font-bold text-cyan-400" dir="ltr">{stats.level}</span>
            </p>
            <Link
              href="/onboarding/auto-test"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-sm font-bold hover:bg-purple-600/30 transition">
              
              إعادة اختبار المستوى
            </Link>
          </div>
        </main>
      </div>
    </div>);

}