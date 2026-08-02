"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

export default function PremiumCard() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 via-[#101623] to-violet-500/10 p-7">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-[90px]" />

      <div className="relative">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
          <Crown size={26} className="text-cyan-300" />
        </div>

        <h3 className="text-2xl font-black text-white">WordFlow مجاني</h3>

        <p className="mt-4 leading-7 text-slate-400">
          كل القصص والمفردات والمعلم الذكي متاح بدون اشتراك — ابدأ التعلم الآن.
        </p>

        <Link
          href="/stories"
          className="mt-8 block w-full rounded-2xl bg-cyan-400 py-4 text-center font-bold text-black transition hover:scale-[1.02]"
        >
          استكشف القصص
        </Link>
      </div>
    </div>
  );
}
