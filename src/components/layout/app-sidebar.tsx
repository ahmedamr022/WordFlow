"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Home,
  BookOpen,
  BookMarked,
  BarChart3,
  Trophy,
  Settings,
  Crown,
  Flame,
  PanelRightClose,
  PanelRightOpen,
  BoxIcon,
  ShieldCheckIcon } from
"lucide-react";

import { getDailyGoalAction, DailyGoal } from "@/app/actions/stats";
import { getIsAdminAction } from "@/app/actions/admin/flag";
import { useIsAdmin } from "@/components/providers/admin-provider";

/**
 * الشريط الجانبي.
 *
 * ── إصلاح ظهور «Admin Studio» ─────────────────────────────────────────────
 * كانت البطاقة تعتمد على prop واحد `isAdmin` بقيمة افتراضية `false`، ولم تكن
 * تُمرَّر إلا من `/dashboard`. أما `/stories` و`/vocabulary` و`/stats` و
 * `/challenges` و`/settings` و`/paths` و`/profile` فكلها ترسم الشريط بدونها
 * ⇒ الأدمن لا يرى البطاقة في أي مكان تقريباً.
 *
 * الآن مصدر القيمة ثلاثي بالترتيب:
 *   1. prop صريح (أرخص شيء — الداشبورد تقرأها أصلاً على السيرفر)
 *   2. `AdminProvider` لو ركّبته في الـ layout الجذري (صفر طلبات)
 *   3. `getIsAdminAction()` كشبكة أمان (طلب واحد صغير عند التحميل)
 * فأي صفحة تعرض الشريط تُظهر البطاقة للأدمن تلقائياً بلا تعديل الصفحة.
 *
 * وأُصلح كذلك سطر تالف في الواجهة كان يعرّف خاصية وهمية `reak?: number`.
 */

interface NavItem {
  name: string;
  icon: typeof BoxIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
{ name: "الرئيسية", icon: Home, href: "/dashboard" },
{ name: "القصص", icon: BookOpen, href: "/stories" },
{ name: "المفردات", icon: BookMarked, href: "/vocabulary" },
{ name: "الإحصائيات", icon: BarChart3, href: "/stats" },
{ name: "التحديات", icon: Trophy, href: "/challenges" },
{ name: "الإعدادات", icon: Settings, href: "/settings" }];


export interface AppSidebarProps {
  /** الاسم العربي للعنصر النشط، مثل "القصص". */
  active?: string;

  /**
   * هل المستخدم Admin؟ اختيارية عمداً — لو لم تُمرَّر يحلّها الشريط بنفسه.
   * مرّرها من Server Component متى ما كانت متاحة لتوفير الطلب.
   */
  isAdmin?: boolean;

  /** نقاط اليوم الحقيقية — مرّرها إن كانت الشاشة قرأتها على السيرفر. */
  dailyXp?: number;
  dailyGoalXp?: number;
  streak?: number;
}

const RING_RADIUS = 40;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function AppSidebar({
  active = "الرئيسية",
  isAdmin,
  dailyXp,
  dailyGoalXp,
  streak
}: AppSidebarProps) {
  const hasServerData = typeof dailyXp === "number" && typeof dailyGoalXp === "number";

  const [goal, setGoal] = useState<DailyGoal | null>(
    hasServerData ?
    {
      xpToday: dailyXp as number,
      goalXp: dailyGoalXp as number,
      percent: Math.min(
        100,
        Math.round((dailyXp as number) / Math.max(1, dailyGoalXp as number) * 100)
      ),
      streak: streak ?? 0
    } :
    null
  );
  const [loading, setLoading] = useState(!hasServerData);
  const [collapsed, setCollapsed] = useState(false);

  // ── مصدر isAdmin الثلاثي ────────────────────────────────────────────────
  const contextIsAdmin = useIsAdmin();
  const knownIsAdmin = typeof isAdmin === "boolean" ? isAdmin : contextIsAdmin;
  const [fetchedIsAdmin, setFetchedIsAdmin] = useState<boolean | null>(null);
  const showAdminCard = knownIsAdmin ?? fetchedIsAdmin ?? false;

  useEffect(() => {
    if (knownIsAdmin !== null && knownIsAdmin !== undefined) return;
    let cancelled = false;
    void (async () => {
      const value = await getIsAdminAction();
      if (!cancelled) setFetchedIsAdmin(value);
    })();
    return () => {
      cancelled = true;
    };
  }, [knownIsAdmin]);

  useEffect(() => {
    if (hasServerData) return;
    let cancelled = false;
    void (async () => {
      const data = await getDailyGoalAction();
      if (cancelled) return;
      setGoal(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hasServerData]);

  const percent = goal?.percent ?? 0;
  const dashOffset = useMemo(
    () => RING_CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, percent)) / 100),
    [percent]
  );

  return (
    <aside
      className={`sticky top-4 flex h-[calc(100vh-32px)] shrink-0 select-none flex-col gap-4 rounded-[20px] border border-white/[0.07] bg-[#070a14] px-3.5 py-5 font-cairo shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-[width,min-width] duration-300 ${
      collapsed ? "w-[78px] min-w-[78px]" : "w-[240px] min-w-[240px]"}`
      }
      dir="rtl">
      
      {/* ══════════ LOGO ══════════ */}
      <div className="flex items-center justify-between px-1">
        {!collapsed &&
        <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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
              strokeLinejoin="round" />
            
            </svg>
            <span className="font-en text-[1.3rem] font-extrabold tracking-tight text-white">
              Word<span className="text-[#f43f5e]">F</span>low
            </span>
          </Link>
        }

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="mx-auto rounded-lg p-1 text-[#94a3b8] transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          aria-label={collapsed ? "توسيع القائمة" : "طيّ القائمة"}
          aria-expanded={!collapsed}>
          
          {collapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
        </button>
      </div>

      {/* ══════════ NAV ══════════ */}
      <nav className="flex flex-1 flex-col gap-1.5" aria-label="التنقل الرئيسي">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === active;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[0.88rem] font-semibold transition-all ${
              collapsed ? "justify-center px-0" : ""} ${

              isActive ?
              "border border-purple-500/40 bg-gradient-to-l from-purple-900/45 to-slate-900/60 text-white shadow-[0_4px_20px_rgba(139,92,246,0.15)]" :
              "text-[#94a3b8] hover:bg-white/[0.03] hover:text-slate-100"}`
              }>
              
              {isActive && !collapsed &&
              <span
                aria-hidden
                className="absolute inset-y-2 right-0 w-[3px] rounded-full bg-gradient-to-b from-cyan-300 to-fuchsia-500" />

              }
              <Icon
                size={18}
                className={isActive ? "text-[#a855f7]" : "text-[#94a3b8] transition-colors"}
                strokeWidth={2} />
              
              {!collapsed && <span>{item.name}</span>}
            </Link>);

        })}
      </nav>

      {/* ══════════ ADMIN STUDIO ══════════ */}
      {showAdminCard &&
      <Link
        href="/admin"
        className={`flex items-center gap-3 rounded-[12px] border border-cyan-400/25 bg-cyan-500/[0.08] px-3 py-2.5 text-[0.85rem] font-bold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 ${
        collapsed ? "justify-center px-0" : ""}`
        }
        title={collapsed ? "Admin Studio" : undefined}>
        
          <ShieldCheckIcon size={17} aria-hidden />
          {!collapsed && <span className="font-en">Admin Studio</span>}
        </Link>
      }

      {/* ══════════ DAILY PROGRESS ══════════ */}
      <div className="flex flex-col items-center rounded-[16px] border border-white/[0.06] bg-[#0d1221]/70 p-3 text-center">
        {!collapsed &&
        <div className="mb-1.5 text-[0.78rem] font-semibold text-[#94a3b8]">تقدم اليوم</div>
        }

        <div
          className={`relative flex items-center justify-center ${
          collapsed ? "h-[46px] w-[46px]" : "h-[75px] w-[75px]"}`
          }
          role="progressbar"
          aria-label="تقدم هدف اليوم"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}>
          
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="cyan-pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="60%" stopColor="#9d4edd" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r={RING_RADIUS} className="fill-none stroke-[#1e293b] stroke-[7]" />
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              className="fill-none stroke-[7]"
              style={{
                stroke: "url(#cyan-pink-gradient)",
                strokeDasharray: RING_CIRCUMFERENCE,
                strokeDashoffset: loading ? RING_CIRCUMFERENCE : dashOffset,
                strokeLinecap: "round",
                transition: "stroke-dashoffset 700ms ease-out"
              }} />
            
          </svg>
          <div
            className={`font-en absolute font-extrabold text-white ${
            collapsed ? "text-[0.7rem]" : "text-[1.15rem]"}`
            }>
            
            {loading ?
            <span className="inline-block h-3 w-8 animate-pulse rounded bg-white/20" /> :

            `${percent}%`
            }
          </div>
        </div>

        {!collapsed &&
        <div className="font-en mt-1.5 flex items-center gap-1.5 text-[0.75rem] font-bold text-[#cbd5e1]">
            {loading ?
          <span className="inline-block h-3 w-24 animate-pulse rounded bg-white/10" /> :

          <span>
                ⚡ {goal?.xpToday ?? 0} نقطة / {goal?.goalXp ?? 50}
              </span>
          }
          </div>
        }

        {!collapsed && !loading && (goal?.streak ?? 0) > 0 &&
        <div className="mt-1.5 flex items-center gap-1 text-[0.72rem] font-bold text-amber-300">
            <Flame size={13} className="fill-amber-400 text-amber-400" />
            <span className="font-en">{goal?.streak}</span>
            <span>يوم متتابع</span>
          </div>
        }
      </div>

      {/* ══════════ PREMIUM ══════════ */}
      {!collapsed &&
      <div className="mt-auto flex flex-col items-center rounded-[16px] border border-purple-500/25 bg-gradient-to-b from-[#170f26]/80 to-[#0a0c18]/90 p-3 text-center">
          <Crown size={20} className="mb-1 text-[#f59e0b]" fill="#f59e0b" />
          <div className="font-en my-1 text-[0.82rem] font-extrabold text-white">
            WordFlow Premium
          </div>
          <p className="mb-2.5 text-[0.7rem] leading-tight text-[#94a3b8]" dir="rtl">
            افتح كل المميزات وتجربة تعلم بدون حدود.
          </p>
          <Link
          href="/settings"
          className="w-full rounded-[8px] bg-gradient-to-r from-[#1d4ed8] via-[#7e22ce] to-[#e11d48] py-2 text-center text-[0.8rem] font-bold text-white transition hover:brightness-110">
          
            ترقية الآن
          </Link>
        </div>
      }
    </aside>);

}

export default AppSidebar;