"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export default function DashboardSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="group relative w-[560px]">

      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-cyan-400"
        size={20}
      />

      <input
        ref={inputRef}
        type="text"
        placeholder="ابحث عن قصة..."
        className="
        h-[54px]
        w-full
        rounded-2xl
        border
        border-white/5
        bg-[#101623]
        pr-5
        pl-14
        text-sm
        text-white
        placeholder:text-slate-500
        outline-none
        transition-all
        duration-300
        focus:border-cyan-400/40
        focus:bg-[#131b2c]
        focus:shadow-[0_0_40px_rgba(34,211,238,.08)]
        "
      />

      <div
        className="
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        rounded-lg
        border
        border-white/5
        bg-white/5
        px-2.5
        py-1
        text-[11px]
        font-semibold
        tracking-wide
        text-slate-400
        "
      >
        Ctrl K
      </div>

    </div>
  );
}