"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserStatsService, UserStats } from "@/lib/userStats";
import { User, Flame, Star, BookOpen, CheckCircle2, ArrowRight, LogOut, Award, Shield, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const [nickname, setNickname] = useState("User");
  const [email, setEmail] = useState("user@wordflow.app");
  const [stats, setStats] = useState<UserStats>(UserStatsService.getStats());

  useEffect(() => {
    const savedName = localStorage.getItem("wordflow_nickname");
    const savedEmail = localStorage.getItem("wordflow_user_email");

    if (savedName) setNickname(savedName);
    if (savedEmail) setEmail(savedEmail);

    setStats(UserStatsService.getStats());
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex font-sans selection:bg-[#ff6b6b]">
      {/* Sidebar Navigation */}
      <AppSidebar />

      {/* Main Profile Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 px-8 border-b border-slate-800/80 flex items-center justify-between bg-[#07090e]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-[#ff6b6b]" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <h1 className="font-extrabold text-xl text-white">User Profile</h1>
        </header>

        <main className="p-8 max-w-4xl mx-auto w-full space-y-8">
          {/* Main Neon User Hero Card */}
          <div className="relative rounded-3xl p-8 glass-card border border-[#ff6b6b]/30 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="flex items-center gap-6 z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff6b6b] via-[#ffa07a] to-[#4ecdc4] text-slate-950 font-extrabold text-3xl flex items-center justify-center shadow-xl shadow-[#ff6b6b]/20 shrink-0">
                {nickname[0]?.toUpperCase() || "U"}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4ecdc4]/10 hover:bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/30 text-xs font-bold transition-all z-10"
            >
              <Sparkles className="w-4 h-4" />
              <span>Retake Level Test</span>
            </Link>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl glass-card border border-slate-800 text-center space-y-2">
              <Flame className="w-8 h-8 text-amber-400 mx-auto" />
              <span className="block text-3xl font-extrabold font-mono text-white">
                {stats.streakCount}
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Day Streak</span>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-slate-800 text-center space-y-2">
              <Star className="w-8 h-8 text-[#4ecdc4] mx-auto" />
              <span className="block text-3xl font-extrabold font-mono text-white">
                {stats.xpTotal}
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Total XP</span>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-slate-800 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-emerald-400 mx-auto" />
              <span className="block text-3xl font-extrabold font-mono text-white">
                {stats.wordsLearned}
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Words Learned</span>
            </div>
          </div>

          {/* Account Settings Actions */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Account Settings
            </h3>

            <div className="space-y-3">
              <Link
                href="/onboarding/level"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 transition-all text-sm font-medium"
              >
                <span>Change Target CEFR Level</span>
                <span className="text-xs font-mono text-[#ff6b6b] font-bold">{stats.level}</span>
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all mt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
