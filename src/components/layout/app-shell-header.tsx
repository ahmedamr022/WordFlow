"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface AppShellHeaderProps {
  streak?: number;
  username?: string;
  level?: string;
  avatarUrl?: string;
  notificationCount?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function AppShellHeader(props: AppShellHeaderProps) {
  const [profile, setProfile] = useState<{
    nickname?: string;
    full_name?: string;
    english_level?: string;
    avatar_url?: string;
  } | null>(null);

  useEffect(() => {
    // جلب بيانات المستخدم إذا لم تكن المكونات مرسلة كـ Props من الخارج
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("nickname, full_name, english_level, avatar_url")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
        } else {
          setProfile({
            nickname: user.user_metadata?.full_name || user.email?.split("@")[0] || "مستخدم",
            english_level: "B1",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          });
        }
      }
    };

    if (!props.username) {
      fetchUserProfile();
    }
  }, [props.username]);

  // استخدام الـ Props إذا وجدت، وإلا استخدام البيانات المحملة من Supabase
  const username = props.username || profile?.nickname || profile?.full_name || "مستخدم";
  const level = props.level || profile?.english_level || "B1";
  const avatarUrl = props.avatarUrl || profile?.avatar_url;
  const streak = props.streak ?? 12;
  const notificationCount = props.notificationCount ?? 3;
  const searchPlaceholder = props.searchPlaceholder || "ابحث في القصص...";

  const avatarChar = username[0]?.toUpperCase() ?? "U";

  return (
    <header className="w-full bg-[#070a14]/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-3 flex items-center justify-between gap-4 font-cairo z-20" dir="rtl">
      
      {/* 1. الجزء الأيمن: بيانات المستخدم + الستريك + الإشعارات */}
      <div className="flex items-center gap-3.5">
        {/* كارت بروفايل المستخدم */}
        <div className="bg-[#0f172a]/60 border border-white/[0.08] rounded-[10px] px-3.5 py-1.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-[30px] h-[30px] rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full border border-white/20 flex items-center justify-center font-extrabold text-[0.85rem] bg-white/[0.03] text-white font-en">
              {avatarChar}
            </div>
          )}
          
          <div className="w-px h-5 bg-white/10" />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-en text-white text-[0.85rem] font-bold">{username}</span>
            <span className="text-[#94a3b8] text-[0.7rem]">مستوى {level}</span>
          </div>
          <ChevronDown size={12} className="text-[#94a3b8]" />
        </div>

        {/* الستريك */}
        <div className="bg-[#0f172a]/60 border border-white/[0.08] rounded-[10px] px-3.5 py-1.5 flex items-center gap-2 text-white text-[0.85rem] font-bold">
          <span>🔥</span>
          <span>{streak} يوم متتالي</span>
        </div>

        {/* الإشعارات */}
        <button className="relative text-[#94a3b8] hover:text-white transition flex items-center p-1.5 rounded-lg hover:bg-white/[0.05]" aria-label="الإشعارات">
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 bg-[#f43f5e] text-[#ffffff] text-[0.65rem] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#070a14]">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. الجزء الأيسر: مربع البحث */}
      <div className="bg-[#0f172a]/60 border border-white/[0.08] rounded-[10px] px-3.5 py-2 flex items-center gap-2.5 w-[340px]">
        <Search size={16} className="text-[#94a3b8]" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={props.searchValue}
          onChange={props.onSearchChange ? (e) => props.onSearchChange!(e.target.value) : undefined}
          className="bg-transparent border-none outline-none text-white text-[0.85rem] w-full placeholder:text-[#64748b]"
        />
        <span className="bg-white/[0.04] border border-white/10 text-[#64748b] text-[0.7rem] px-1.5 py-0.5 rounded-[6px] font-en whitespace-nowrap">
          Ctrl K
        </span>
      </div>

    </header>
  );
}

export default AppShellHeader;