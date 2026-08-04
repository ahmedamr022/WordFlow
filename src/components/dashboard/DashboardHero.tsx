"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";

export function DashboardHero() {
  return (
    <section
      className="relative w-full h-[240px] overflow-hidden rounded-[28px] border box-border"
      style={{
        background: "#06090F",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 18px 45px rgba(0,0,0,.35)",
      }}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[45%] hidden lg:block">
        <img
          src="/images/reading-desk.png"
          alt="مكتب القراءة"
          className="absolute inset-0 w-full h-full object-cover object-right-bottom"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                90deg,
                #06090F 0%,
                #06090F 10%,
                rgba(6,9,15,.8) 30%,
                rgba(6,9,15,.35) 55%,
                transparent 85%
              )
            `,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[15%]"
          style={{
            background: "linear-gradient(0deg, #06090F, transparent)",
          }}
        />
      </div>

      <div
        className="absolute left-[10%] top-1/2 -translate-y-1/2 z-30 w-[300px]"
        dir="rtl"
      >
        <p className="m-0 text-[13px] font-bold leading-none text-slate-300">
          مرحباً بك مجدداً! 👋
        </p>

        <h1 className="mt-[17px] m-0 whitespace-nowrap text-[36px] font-black leading-[1.05] tracking-[-1px] text-white">
          أكمل <span className="text-[#F34F70]">رحلة</span> اليوم
        </h1>

        <p className="mt-[13px] m-0 flex items-center gap-[7px] whitespace-nowrap text-[14px] font-medium leading-none text-slate-400">
          <span className="text-[16px] leading-none">✨</span>
          <span>كل يوم تقربك من هدفك</span>
        </p>

        <Link
          href="/stories"
          className="relative mt-[18px] w-[240px] h-[46px] rounded-[13px] flex items-center justify-center overflow-hidden font-bold text-[13px] text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0"
          dir="rtl"
          style={{
            background: `
              linear-gradient(
                90deg,
                #09C8D2 0%,
                #238EDB 34%,
                #6651E8 66%,
                #F04469 100%
              )
            `,
            border: "1px solid rgba(255,255,255,.12)",
            boxShadow: `
              0 9px 24px rgba(38,113,219,.22),
              0 4px 12px rgba(240,68,105,.14),
              inset 0 1px 0 rgba(255,255,255,.18)
            `,
          }}
        >
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
            style={{ background: "rgba(255,255,255,.28)" }}
          />
          <span className="flex items-center justify-center gap-3">
            <span>متابعة القصة</span>
            <ArrowLeft size={18} strokeWidth={2} />
          </span>
        </Link>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <ProgressRing
          value={73}
          size={150}
          gradientId="heroRing"
          from="#8B5CF6"
          mid="#EC4899"
          to="#22D3EE"
        >
          <span className="text-[12px] font-medium leading-none text-slate-400">
            تقدم اليوم
          </span>
          <span className="text-[34px] font-black leading-none text-white">
            73%
          </span>
          <span
            className="mt-[3px] flex items-center gap-1 text-[11px] font-medium leading-none text-slate-400"
            dir="rtl"
          >
            <Zap size={12} className="text-amber-400" fill="currentColor" />
            120 نقطة خبرة
          </span>
        </ProgressRing>
      </div>
    </section>
  );
}