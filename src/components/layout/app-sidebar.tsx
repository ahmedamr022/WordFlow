"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import {
  Home,
  BookOpen,
  BookMarked,
  Layers,
  BarChart3,
  Trophy,
  Settings,
  Crown,
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
  { name: "المسارات", icon: Layers, href: "/paths" },
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
      className="w-[256px] shrink-0 flex flex-col py-6 px-4 bg-[var(--wf-sidebar)] border-r border-[var(--wf-line)] sticky top-0 h-screen overflow-y-auto"
      dir="rtl"
    >
      {/* LOGO */}
      <Link href="/dashboard" className="flex items-center px-2 mb-8">
        <Logo size={28} />
      </Link>

      {/* NAV */}
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === active;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all ${
                isActive
                  ? "text-[color:var(--wf-cyan)]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.035]"
              }`}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(90deg, rgba(34,224,200,0.16) 0%, rgba(34,224,200,0.05) 60%, rgba(34,224,200,0) 100%)",
                      border: "1px solid rgba(34,224,200,0.22)",
                      boxShadow: "0 0 26px -8px rgba(34,224,200,0.45)",
                    }
                  : { border: "1px solid transparent" }
              }
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full"
                  style={{ background: "var(--wf-cyan)", boxShadow: "0 0 10px 1px rgba(34,224,200,0.7)" }}
                />
              )}
              <Icon
                size={19}
                className={
                  isActive
                    ? "text-[color:var(--wf-cyan)]"
                    : "text-slate-500 group-hover:text-slate-300 transition-colors"
                }
              />
              <span className="text-[14px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FREE ACCESS CARD */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-b from-cyan-900/20 to-purple-900/10 border border-cyan-500/20 text-center">
        <span className="grid place-items-center w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-400/10">
          <Crown size={20} className="text-cyan-400" fill="currentColor" />
        </span>
        <h4 className="text-[14px] font-bold text-white">WordFlow مجاني</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          كل القصص والمفردات والمعلم الذكي متاح بدون اشتراك.
        </p>
        <Link
          href="/stories"
          className="mt-3 block w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 text-[13px] font-bold text-white shadow-lg shadow-fuchsia-600/25 hover:brightness-110 transition"
        >
          استكشف القصص
        </Link>
      </div>
    </aside>
  );
}

export default AppSidebar;
