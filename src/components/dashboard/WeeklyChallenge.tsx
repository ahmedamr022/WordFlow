import React from "react";
import { Star } from "lucide-react";
import { IMAGES } from "@/lib/assets";
import type { DashboardWeekly } from "@/lib/dashboard/data";

/**
 * قبل: «3 / 5» وشريط 60% و«+250 XP» كلها ثوابت في الكود، فالتحدي كان
 * يعرض نفس الرقم لكل مستخدم للأبد.
 * بعد: عدد القصص المكتملة خلال آخر ٧ أيام من user_daily_activity،
 * والشريط يُحسب من نفس الرقم.
 */

export interface WeeklyChallengeProps {
  weekly: DashboardWeekly;
}

export function WeeklyChallenge({ weekly }: WeeklyChallengeProps) {
  const percent =
  weekly.target > 0 ?
  Math.max(0, Math.min(100, Math.round(weekly.completed / weekly.target * 100))) :
  0;

  const done = weekly.completed >= weekly.target;

  return (
    <div
      className="col-span-12 lg:col-span-4 relative overflow-hidden rounded-[26px] border p-7"
      style={{
        background:
        "radial-gradient(circle at top right,#16273F 0%,#0D1626 45%,#070D16 100%)",
        borderColor: "rgba(255,255,255,.06)",
        boxShadow:
        "inset 0 1px 0 rgba(255,255,255,.05),inset 0 -1px 0 rgba(0,0,0,.4),0 24px 55px rgba(0,0,0,.45)"
      }}>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full"
        style={{
          background: "radial-gradient(circle,rgba(0,215,255,.07),transparent 70%)"
        }} />


      <div className="grid h-full grid-cols-[1fr_280px] items-center">
        <div className="flex flex-col justify-center pr-6" style={{ direction: "rtl" }}>
          <h3 className="text-[33px] font-black leading-[1.1] tracking-[-1px] text-white">
            التحدي الأسبوعي
          </h3>

          <p className="mt-2.5 text-[18px] font-medium" style={{ color: "#909CAF" }}>
            {done ?
            "أنجزت التحدي — المكافأة في طريقها" :
            `أكمل ${weekly.target} قصص هذا الأسبوع`}
          </p>

          <div
            className="mt-[34px] flex items-end justify-end"
            style={{ direction: "ltr", fontFamily: "Inter" }}>

            <span className="text-[74px] font-black leading-none tracking-[-5px] text-white">
              {weekly.completed}
            </span>
            <span
              className="mb-2.5 ml-2 text-[30px] font-bold"
              style={{ color: "#5F6B7A" }}>

              /{weekly.target}
            </span>
          </div>

          <div
            className="mt-[18px] ml-auto h-2.5 w-[250px] overflow-hidden rounded-full"
            style={{ background: "#182433" }}
            role="progressbar"
            aria-valuenow={weekly.completed}
            aria-valuemin={0}
            aria-valuemax={weekly.target}
            aria-label="تقدم التحدي الأسبوعي">

            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percent}%`,
                background: "linear-gradient(90deg,#10C9F6,#1CE5C5)",
                boxShadow: "0 0 16px rgba(0,220,220,.35)"
              }} />

          </div>

          <div
            className="mt-6 ml-auto inline-flex items-center gap-2 rounded-full px-[18px] py-[11px]"
            style={{
              background: "#0D1825",
              border: "1px solid rgba(255,255,255,.05)"
            }}>

            <Star
              className="h-4 w-4"
              strokeWidth={2}
              style={{ fill: "#F8C84B", color: "#F8C84B" }}
              aria-hidden />

            <span className="text-[20px] font-black" style={{ color: "#00C8EF" }}>
              +{weekly.xpReward} XP
            </span>
          </div>
        </div>

        <div className="flex h-full items-center justify-center">
          <img
            src={IMAGES.trophy}
            alt=""
            aria-hidden
            loading="lazy"
            className="max-w-none transition-all duration-500 hover:scale-105"
            style={{
              width: 270,
              height: 270,
              objectFit: "contain",
              opacity: done ? 1 : 0.92,
              filter:
              "drop-shadow(0 22px 34px rgba(0,0,0,.65)) drop-shadow(0 0 30px rgba(255,186,0,.22)) drop-shadow(0 0 40px rgba(0,200,255,.10))"
            }} />

        </div>
      </div>
    </div>);

}