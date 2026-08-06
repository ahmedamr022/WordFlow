"use client";


import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useProfileSummary } from "@/hooks/useProfileSummary";

export interface AppShellHeaderProps {
  streak?: number;
  username?: string;
  level?: string;
  avatarUrl?: string;
  notificationCount?: number;

  /**
   * البحث ظاهر افتراضياً. الداشبورد تمرّر `false`: الحقل هناك لم يكن يفلتر
   * أي شيء على الصفحة — مجرد صندوق يأخذ مساحة ويوحي بوظيفة غير موجودة.
   * الشاشات التي يفلتر فيها البحث فعلاً (/vocabulary) تُبقيه.
   */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

/**
 * · `useProfileSummary()` يُفعَّل فقط إن لم يمرّر الأب الاسم والمستوى، فالصفحات
 *   المهاجَرة لا تدفع أي طلب إضافي.
 * · مربع البحث يعمل بحالة داخلية عند غياب معالج خارجي (كان مقروءاً فقط).
 * · مستمع ⌘/Ctrl + K صار مشروطاً بوجود البحث فعلاً — كان يُسجَّل دائماً
 *   ويلتقط الاختصار حتى في شاشات بلا حقل بحث.
 */
export function AppShellHeader(props: AppShellHeaderProps) {
  const needsFetch = !props.username || !props.level;
  const { profile } = useProfileSummary({ enabled: needsFetch });

  const showSearch = props.showSearch ?? true;

  const [localSearch, setLocalSearch] = React.useState("");
  const isControlled = typeof props.onSearchChange === "function";
  const searchValue = isControlled ? props.searchValue ?? "" : localSearch;

  const username = props.username || profile?.nickname || "مستخدم";
  const level = props.level || profile?.level || "A1";
  const avatarUrl = props.avatarUrl || profile?.avatarUrl || undefined;
  const streak = props.streak ?? 0;
  const notificationCount = props.notificationCount ?? 0;
  const searchPlaceholder = props.searchPlaceholder || "ابحث...";

  const avatarChar = username[0]?.toUpperCase() ?? "U";
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!showSearch) return;
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSearch]);

  return (
    <header
      className={`z-20 flex w-full items-center gap-4 border-b border-white/[0.08] bg-[#070a14]/90 px-6 py-3 font-cairo backdrop-blur-md ${
      showSearch ? "justify-between" : "justify-start"}`
      }
      dir="rtl">
      
      {/* 1. بيانات المستخدم + الستريك + الإشعارات */}
      <div className="flex items-center gap-3.5">
        <a
          href="/profile"
          className="flex items-center gap-3 rounded-[10px] border border-white/[0.08] bg-[#0f172a]/60 px-3.5 py-1.5 transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
          
          {avatarUrl ?
          <img
            src={avatarUrl}
            alt=""
            aria-hidden
            className="h-[30px] w-[30px] rounded-full border border-white/20 object-cover" /> :


          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/20 bg-white/[0.03] font-en text-[0.85rem] font-extrabold text-white">
              {avatarChar}
            </div>
          }

          <div aria-hidden className="h-5 w-px bg-white/10" />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-en text-[0.85rem] font-bold text-white">{username}</span>
            <span className="text-[0.7rem] text-[#94a3b8]">مستوى {level}</span>
          </div>
          <ChevronDown size={12} className="text-[#94a3b8]" aria-hidden />
        </a>

        <div
          className="flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-[#0f172a]/60 px-3.5 py-1.5 text-[0.85rem] font-bold text-white"
          title={streak > 0 ? `${streak} يوم متتالي` : "ابدأ سلسلتك اليوم"}>
          
          <span aria-hidden>🔥</span>
          <span>{streak} يوم متتالي</span>
        </div>

        <button
          type="button"
          className="relative flex items-center rounded-lg p-1.5 text-[#94a3b8] transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          aria-label={
          notificationCount > 0 ? `الإشعارات (${notificationCount} جديدة)` : "الإشعارات"
          }>
          
          <Bell size={18} aria-hidden />
          {notificationCount > 0 &&
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#070a14] bg-[#f43f5e] text-[0.65rem] font-extrabold text-white">
              {notificationCount}
            </span>
          }
        </button>
      </div>

      {/* 2. مربع البحث — فقط حيث يفلتر شيئاً فعلاً */}
      {showSearch &&
      <div className="flex w-[340px] items-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-[#0f172a]/60 px-3.5 py-2 focus-within:border-white/20">
          <Search size={16} className="text-[#94a3b8]" aria-hidden />
          <input
          ref={searchRef}
          type="search"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => {
            const next = event.target.value;
            if (isControlled) props.onSearchChange?.(next);else
            setLocalSearch(next);
          }}
          className="w-full border-none bg-transparent text-[0.85rem] text-white outline-none placeholder:text-[#64748b]" />
        
          <span
          aria-hidden
          className="whitespace-nowrap rounded-[6px] border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-en text-[0.7rem] text-[#64748b]">
          
            Ctrl K
          </span>
        </div>
      }
    </header>);

}

export default AppShellHeader;