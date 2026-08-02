"use client";

import { Flame } from "lucide-react";

export default function DashboardStreak() {
  return (
    <button
      className="
      group
      flex
      h-[54px]
      items-center
      gap-3
      rounded-2xl
      border
      border-orange-500/10
      bg-[#101623]
      px-5
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:border-orange-400/30
      hover:shadow-[0_0_35px_rgba(251,146,60,.15)]
      "
    >
      <div
        className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        bg-orange-500/10
        transition
        group-hover:scale-110
        "
      >
        <Flame
          size={20}
          className="text-orange-400"
          fill="currentColor"
        />
      </div>

      <div className="text-right leading-tight">
        <p className="text-sm font-semibold text-white">
          12 يوم
        </p>

        <p className="text-xs text-slate-400">
          متتالية
        </p>
      </div>
    </button>
  );
}