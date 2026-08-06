"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfileSummary } from "@/hooks/useProfileSummary";
import { Settings, User, Globe, Award } from "lucide-react";

export default function SettingsPage() {
  /**
   * قبل: الاسم والبريد من localStorage والمستوى من UserStatsService،
   * و handleSignOut كان يمسح مفتاحاً محلياً فقط — كوكي الجلسة يظل صالحاً
   * والمستخدم لم يخرج فعلياً (ثغرة حقيقية على جهاز مشترك).
   * بعد: profiles + الجلسة نفسها، والخروج عبر signOutAction (scope: global).
   */
  const { profile } = useProfileSummary();
  const { stats } = useUserStats();

  const nickname = profile?.nickname ?? "…";
  const email = profile?.email ?? "";
  const level = stats.level;

  return (
    <div className="min-h-screen bg-[#05070E] text-white flex font-arabic" dir="ltr">
      <AppSidebar active="الإعدادات" />
      <div className="flex-1 flex flex-col min-w-0">
        <AppShellHeader level={level} username={nickname} />
        <main className="flex-1 p-8 overflow-y-auto max-w-2xl" dir="rtl">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="text-slate-300" size={28} />
            <h1 className="text-3xl font-black">الإعدادات</h1>
          </div>

          <div className="space-y-3">
            <Link
              href="/profile"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] hover:border-white/15 transition">
              
              <span className="flex items-center gap-3">
                <User size={18} className="text-cyan-400" />
                <span className="font-bold">الملف الشخصي</span>
              </span>
              <span className="text-xs text-slate-400">{nickname}</span>
            </Link>

            <Link
              href="/onboarding/language"
              className="flex items-center gap-3 p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] hover:border-white/15 transition">
              
              <Globe size={18} className="text-purple-400" />
              <span className="font-bold">لغة الواجهة</span>
            </Link>

            <Link
              href="/onboarding/level"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] hover:border-white/15 transition">
              
              <span className="flex items-center gap-3">
                <Award size={18} className="text-amber-400" />
                <span className="font-bold">مستوى CEFR</span>
              </span>
              <span className="text-xs font-mono text-cyan-400" dir="ltr">{level}</span>
            </Link>

            {email &&
            <div className="p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] text-sm text-slate-400">
                البريد: <span dir="ltr" className="text-white">{email}</span>
              </div>
            }

            <SignOutButton />
          </div>
        </main>
      </div>
    </div>);

}