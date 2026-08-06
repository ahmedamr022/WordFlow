"use client";

import React from "react";
import { BellIcon, SearchIcon } from "lucide-react";

/**
 * الشريط العلوي للأدمن.
 *
 * ما تغيّر:
 *  · بقى `sticky top-0` جوّا عمود المحتوى اللي بيسكرول — فالبحث والهوية
 *    باينين دايماً بدل ما يروحوا فوق مع أول اسكرول.
 *  · `backdrop-blur` + خلفية شبه معتمة علشان المحتوى اللي تحته ما يقراش
 *    فوقه وقت السكرول.
 *  · التخطيط `ltr` مطابقاً للشريط الجانبي الجديد (البحث شمال، الهوية يمين)،
 *    والنص العربي جواه `dir="rtl"` فيفضل صحيح.
 *  · نفس الـ props بالضبط — مفيش call site محتاج تعديل.
 */

export interface AdminTopbarProps {
  nickname: string;
  role: string;
  avatarUrl?: string | null;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  notifications?: number;
}

export function AdminTopbar({
  nickname,
  role,
  avatarUrl,
  onSearch,
  searchPlaceholder = "ابحث عن قصة، مستخدم، أو إعداد...",
  notifications = 0
}: AdminTopbarProps) {
  const [term, setTerm] = React.useState("");

  return (
    <header
      dir="ltr"
      className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#04080F]/85 px-5 backdrop-blur-xl">
      
      <form
        className="relative min-w-[200px] max-w-[440px] flex-1"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch?.(term);
        }}
        role="search">
        
        <SearchIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden />
        
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="بحث"
          dir="rtl"
          className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#0B111C] pl-10 pr-3.5 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/40" />
        
      </form>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] text-slate-300 outline-none transition-colors hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          aria-label={`الإشعارات${notifications > 0 ? ` (${notifications})` : ""}`}>
          
          <BellIcon className="h-[17px] w-[17px]" aria-hidden />
          {notifications > 0 &&
          <span className="font-en absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
              {notifications}
            </span>
          }
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0B111C] py-1.5 pl-1.5 pr-3">
          {avatarUrl ?
          <img src={avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" aria-hidden /> :

          <span className="font-en flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 text-[13px] font-black text-white">
              {nickname.slice(0, 1).toUpperCase()}
            </span>
          }
          <span className="leading-tight" dir="rtl">
            <span className="font-en block text-[13px] font-bold text-white">{nickname}</span>
            <span className="block text-[10.5px] text-slate-500">
              {role === "owner" ? "صاحب المنصة" : "مدير المنصة"}
            </span>
          </span>
        </div>
      </div>
    </header>);

}

export default AdminTopbar;