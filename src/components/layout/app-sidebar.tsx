"use client";

import Link from "next/link";
import {
  Home,
  BookOpen,
  BookMarked,
  Layers,
  BarChart3,
  Trophy,
  Settings,
  Crown,
  Menu,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "الرئيسية", icon: Home, href: "/dashboard" },
  { name: "القصص", icon: BookOpen, href: "/stories" },
  { name: "المفردات", icon: BookMarked, href: "/vocabulary" },
  { name: "الإحصائيات", icon: BarChart3, href: "/stats" },
  { name: "التحديات", icon: Trophy, href: "/challenges" },
  { name: "الإعدادات", icon: Settings, href: "/settings" },
];

interface AppSidebarProps {
  /** Arabic name of the active nav item, e.g. "القصص" */
  active?: string;
}

export function AppSidebar({ active = "الرئيسية" }: AppSidebarProps) {
  return (
    <aside
      className="w-[240px] min-w-[240px] shrink-0 flex flex-col gap-4 py-5 px-3.5 bg-[#070a14] border border-white/[0.07] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] h-[calc(100vh-32px)] sticky top-4 select-none font-cairo"
      dir="rtl"
    >
      {/* HEADER LOGO */}
      <div className="flex items-center justify-between px-1">
        <Link href="/dashboard" className="flex items-center gap-2 text-decoration-none">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="w-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="50%" stopColor="#7000ff" />
                <stop offset="100%" stopColor="#ff007b" />
              </linearGradient>
            </defs>
            <path
              d="M6 10L14 30L20 17L26 30L34 10"
              stroke="url(#w-grad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-en text-[1.3rem] font-extrabold text-white tracking-tight">
            Word<span className="text-[#f43f5e]">F</span>low
          </span>
        </Link>

        <button className="text-[#94a3b8] hover:text-white transition" aria-label="Toggle Menu">
          <Menu size={20} />
        </button>
      </div>

      {/* NAV MENU */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === active;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[0.88rem] font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-900/40 to-slate-900/60 border border-purple-500/40 text-white shadow-[0_4px_20px_rgba(139,92,246,0.15)]"
                  : "text-[#94a3b8] hover:text-slate-100 hover:bg-white/[0.03]"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-[#a855f7]" : "text-[#94a3b8] transition-colors"}
                strokeWidth={2}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* DAILY PROGRESS CARD */}
      <div className="bg-[#0d1221]/70 border border-white/[0.06] rounded-[16px] p-3 text-center flex flex-col items-center">
        <div className="text-[0.78rem] font-semibold text-[#94a3b8] mb-1.5">تقدم اليوم</div>
        <div className="relative w-[75px] h-[75px] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="cyan-pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="60%" stopColor="#9d4edd" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" className="fill-none stroke-[#1e293b] stroke-[7]" />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="fill-none stroke-[7] stroke-round"
              style={{
                stroke: "url(#cyan-pink-gradient)",
                strokeDasharray: "251.2",
                strokeDashoffset: "67.8",
                strokeLinecap: "round",
              }}
            />
          </svg>
          <div className="absolute font-en text-[1.15rem] font-extrabold text-white">73%</div>
        </div>
        <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-[#cbd5e1] mt-1.5 font-en">
          <span>⚡ 120 نقطة / 150</span>
        </div>
      </div>

      {/* PREMIUM CARD */}
      <div className="bg-gradient-to-b from-[#170f26]/80 to-[#0a0c18]/90 border border-purple-500/25 rounded-[16px] p-3 text-center flex flex-col items-center mt-auto">
        <Crown size={20} className="text-[#f59e0b] mb-1" fill="#f59e0b" />
        <div className="font-en text-[0.82rem] font-extrabold text-white my-1">WordFlow Premium</div>
        <p className="text-[0.7rem] text-[#94a3b8] leading-tight mb-2.5" dir="rtl">
          افتح كل المميزات وتجربة تعلم بدون حدود.
        </p>
        <Link
          href="/stories"
          className="w-full bg-gradient-to-r from-[#1d4ed8] via-[#7e22ce] to-[#e11d48] text-white py-2 rounded-[8px] text-[0.8rem] font-bold text-center hover:brightness-110 transition"
        >
          ترقية الآن
        </Link>
      </div>
    </aside>
  );
}

export default AppSidebar;
