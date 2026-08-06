"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfileSummary } from "@/hooks/useProfileSummary";
import { User, Flame, Star, BookOpen, ArrowRight, Award, Sparkles } from "lucide-react";

export default function ProfilePage() {
  /**
   * قبل: الاسم والبريد من localStorage["wordflow_nickname"/"wordflow_user_email"]
   * والإحصائيات من UserStatsService — كل شيء محلي وقابل للتعديل من الكونسول.
   * بعد: profiles + user_stats عبر RLS، والبريد من الجلسة نفسها.
   * كذلك زر "Sign Out" كان مجرد <Link href="/login"> لا يُنهي الجلسة إطلاقاً.
   */
  const { profile, isLoading: profileLoading } = useProfileSummary();
  const { stats, isLoading: statsLoading, error } = useUserStats();

  const nickname = profile?.nickname ?? "…";
  const email = profile?.email ?? "";
  const isLoading = profileLoading || statsLoading;

  const metrics = [
  { label: "Day Streak", value: stats.streakCount, icon: Flame, color: "text-amber-400" },
  { label: "Total XP", value: stats.xpTotal, icon: Star, color: "text-[#4ecdc4]" },
  { label: "Words Learned", value: stats.wordsLearned, icon: BookOpen, color: "text-emerald-400" }];


  return (
    <div className="min-h-screen bg-[#07090e] text-white flex font-sans selection:bg-[#ff6b6b]">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 px-8 border-b border-slate-800/80 flex items-center justify-between bg-[#07090e]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
              
              <ArrowRight className="w-4 h-4 text-[#ff6b6b]" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <h1 className="font-extrabold text-xl text-white">User Profile</h1>
        </header>

        <main className="p-8 max-w-4xl mx-auto w-full space-y-8">
          {error &&
          <div role="alert" className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
              {error}
            </div>
          }

          {/* Main Neon User Hero Card */}
          <div className="relative rounded-3xl p-8 glass-card border border-[#ff6b6b]/30 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="flex items-center gap-6 z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff6b6b] via-[#ffa07a] to-[#4ecdc4] text-slate-950 font-extrabold text-3xl flex items-center justify-center shadow-xl shadow-[#ff6b6b]/20 shrink-0">
                {profile?.avatarUrl ?
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover" /> :


                nickname[0]?.toUpperCase() || <User className="w-9 h-9" aria-hidden />
                }
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-white">{nickname}</h2>
                <p className="text-xs text-slate-400 font-mono">{email}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ecdc4]/10 text-[#4ecdc4] border border-[#4ecdc4]/30 text-xs font-mono font-bold mt-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>CEFR Level: {stats.level}</span>
                </div>
              </div>
            </div>

            <Link
              href="/onboarding/auto-test"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4ecdc4]/10 hover:bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/30 text-xs font-bold transition-all z-10">
              
              <Sparkles className="w-4 h-4" />
              <span>Retake Level Test</span>
            </Link>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="p-6 rounded-3xl glass-card border border-slate-800 text-center space-y-2">
                  <Icon className={`w-8 h-8 mx-auto ${m.color}`} />
                  <span className="block text-3xl font-extrabold font-mono text-white">
                    {isLoading ? "—" : m.value.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                    {m.label}
                  </span>
                </div>);

            })}
          </div>

          {/* Account Settings Actions */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Account Settings
            </h3>

            <div className="space-y-3">
              <Link
                href="/onboarding/level"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 transition-all text-sm font-medium">
                
                <span>Change Target CEFR Level</span>
                <span className="text-xs font-mono text-[#ff6b6b] font-bold">{stats.level}</span>
              </Link>

              <SignOutButton />
            </div>
          </div>
        </main>
      </div>
    </div>);

}