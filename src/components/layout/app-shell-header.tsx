"use client";

import { Flame, Bell, Search } from "lucide-react";

interface AppShellHeaderProps {
  streak?: number;
  username?: string;
  level?: string;
  notificationCount?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function AppShellHeader({
  streak = 12,
  username = "warm_dusk1679",
  level = "B1",
  notificationCount = 3,
  searchPlaceholder = "ابحث في القصص، المفردات...",
  searchValue,
  onSearchChange,
}: AppShellHeaderProps) {
  return (
    <header
      className="h-[76px] px-8 border-b border-white/[0.05] flex items-center justify-between sticky top-0 z-40"
      style={{ background: "rgba(7,10,18,0.85)", backdropFilter: "blur(12px)" }}
      dir="ltr"
    >
      <div className="relative w-[520px] max-w-[45vw]">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-400 font-mono">
          <span className="text-sm leading-none">⌘</span>K
        </kbd>
        <input
          type="text"
          dir="rtl"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
          className="w-full pl-11 pr-14 py-3 rounded-2xl bg-[#0D1220] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition"
        />
      </div>

      <div className="flex items-center gap-5">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1424] border border-white/[0.06] text-slate-200 text-[13px] font-bold"
          dir="rtl"
        >
          <Flame size={16} className="text-orange-400" fill="currentColor" />
          <span>{streak} يوم متتالي</span>
        </div>

        <button className="relative text-slate-300 hover:text-white transition" aria-label="الإشعارات">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[13px] font-bold text-white leading-none">{username}</p>
            <p className="text-[11px] text-slate-400 mt-1" dir="rtl">
              مستوى <span dir="ltr">{level}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm text-[#05070e]">
            {username[0]?.toUpperCase() ?? "W"}
          </div>
        </div>
      </div>
    </header>
  );
}
