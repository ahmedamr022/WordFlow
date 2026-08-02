"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { UserStatsService } from "@/lib/userStats";
import { Settings, User, Globe, Award, LogOut } from "lucide-react";

export default function SettingsPage() {
  const [nickname, setNickname] = useState("warm_dusk1679");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("B1");

  useEffect(() => {
    setNickname(localStorage.getItem("wordflow_nickname") ?? "warm_dusk1679");
    setEmail(localStorage.getItem("wordflow_user_email") ?? "");
    setLevel(UserStatsService.getStats().level);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("wordflow_user_logged");
    window.location.href = "/login";
  };

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
              className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] hover:border-white/15 transition"
            >
              <span className="flex items-center gap-3">
                <User size={18} className="text-cyan-400" />
                <span className="font-bold">الملف الشخصي</span>
              </span>
              <span className="text-xs text-slate-400">{nickname}</span>
            </Link>

            <Link
              href="/onboarding/language"
              className="flex items-center gap-3 p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] hover:border-white/15 transition"
            >
              <Globe size={18} className="text-purple-400" />
              <span className="font-bold">لغة الواجهة</span>
            </Link>

            <Link
              href="/onboarding/level"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] hover:border-white/15 transition"
            >
              <span className="flex items-center gap-3">
                <Award size={18} className="text-amber-400" />
                <span className="font-bold">مستوى CEFR</span>
              </span>
              <span className="text-xs font-mono text-cyan-400" dir="ltr">{level}</span>
            </Link>

            {email && (
              <div className="p-4 rounded-2xl bg-[#0B0F1C] border border-white/[0.06] text-sm text-slate-400">
                البريد: <span dir="ltr" className="text-white">{email}</span>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
