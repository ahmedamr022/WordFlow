"use client";

import { Bell, ChevronDown, Crown } from "lucide-react";
import Image from "next/image";

export default function DashboardUser() {
  return (
    <div className="flex items-center gap-4">
      <button className="relative flex h-[54px] w-[54px] items-center justify-center rounded-2xl border border-white/5 bg-[#101623] transition-all duration-300 hover:border-cyan-400/20 hover:bg-[#151d2e]">
        <Bell
          size={20}
          className="text-slate-300"
        />

        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-black">
          3
        </span>
      </button>

      <button className="group flex h-[54px] items-center gap-4 rounded-2xl border border-white/5 bg-[#101623] px-3 transition-all duration-300 hover:border-cyan-400/20 hover:bg-[#151d2e]">

        <Image
          src="https://i.pravatar.cc/150?img=15"
          alt="avatar"
          width={44}
          height={44}
          className="rounded-xl"
        />

        <div className="text-right">

          <div className="flex items-center justify-end gap-2">

            <span className="font-bold text-white">
              Ahmed
            </span>

            <Crown
              size={14}
              className="text-yellow-400"
            />

          </div>

          <p className="text-xs text-slate-400">
            B1 Learner
          </p>

        </div>

        <ChevronDown
          size={18}
          className="text-slate-500 transition group-hover:rotate-180"
        />

      </button>
    </div>
  );
}