"use client";

import React from "react";
import Link from "next/link";
import { Clock, Play } from "lucide-react";

export function StoryOfTheDay() {
  const featured = {
    id: "titanic-legend",
    title: "The Legend of Titanic",
    titleAr: "أسطورة السفينة التايتانيك",
    level: "B1",
    duration: "5 دقيقة",
    progress: 65,
    cover: "/images/titanic.png",
  };

  return (
    <div
      className="col-span-12 lg:col-span-8 relative h-[265px] overflow-hidden rounded-[18px] group border"
      style={{
        background: "#07111B",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 18px 45px rgba(0,0,0,.35)",
      }}
    >
      <img
        src={featured.cover || "/placeholder.svg"}
        alt={featured.title}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(2,8,15,.04) 0%,
              rgba(2,8,15,.10) 48%,
              rgba(2,8,15,.38) 100%
            ),
            linear-gradient(
              0deg,
              rgba(2,8,15,.97) 0%,
              rgba(2,8,15,.63) 34%,
              rgba(2,8,15,.10) 72%,
              rgba(2,8,15,.18) 100%
            )
          `,
        }}
      />

      <div className="relative z-10 h-full flex flex-col px-5 py-4">
        <div className="flex items-start justify-between">
          <h3 className="text-[18px] font-black leading-none text-white">
            قصة اليوم
          </h3>

          <div
            className="h-[29px] px-3 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{
              background: "rgba(0,150,175,.11)",
              border: "1px solid rgba(0,160,180,.52)",
              color: "#22E0C8",
            }}
          >
            قصة تفاعلية
          </div>
        </div>

        <div className="flex-1" />

        <div className="w-full flex flex-col items-start" dir="ltr">
          <div className="flex items-center gap-2">
            <span
              className="w-[11px] h-[11px] shrink-0 rounded-full"
              style={{
                background: "#F0445C",
                boxShadow: "0 0 8px rgba(240,68,92,.65)",
              }}
            />
            <h2 className="text-[20px] font-black leading-none text-white">
              {featured.title}
            </h2>
          </div>

          <div
            className="mt-2 ml-[19px] text-[13px] font-medium text-left"
            dir="rtl"
            style={{ color: "#D1DCE7" }}
          >
            {featured.titleAr}
          </div>

          <div className="mt-4 w-full flex items-center gap-4" dir="ltr">
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-white">
                مستوى {featured.level}
              </span>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <Clock
                className="w-[15px] h-[15px]"
                strokeWidth={2}
                style={{ color: "#AFC0D2" }}
              />
              <span
                className="text-[12px] font-medium"
                style={{ color: "#D1DCE7" }}
              >
                {featured.duration}
              </span>
            </div>

            <div className="flex flex-1 min-w-[100px] items-center gap-3">
              <div
                className="relative flex-1 h-[5px] overflow-hidden rounded-full"
                style={{ background: "rgba(13,29,45,.95)" }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${featured.progress}%`,
                    background: "#00AFC2",
                    boxShadow: "0 0 8px rgba(0,175,194,.42)",
                  }}
                />
              </div>

              <span
                className="shrink-0 text-[11px] font-bold"
                style={{ color: "#D5E0EA" }}
              >
                {featured.progress}%
              </span>
            </div>

            <Link
              href="/stories"
              className="h-[39px] min-w-[102px] px-5 shrink-0 rounded-[14px] flex items-center justify-center gap-2 text-[13px] font-black transition-all duration-200 hover:brightness-110 hover:scale-[1.015]"
              style={{
                background:
                  "linear-gradient(135deg,#00C6DC 0%,#008FA5 100%)",
                color: "#FFFFFF",
                border: "1px solid rgba(0,190,210,.38)",
                boxShadow: "0 7px 20px rgba(0,140,165,.25)",
              }}
            >
              <span>متابعة</span>
              <Play
                className="w-[15px] h-[15px]"
                fill="currentColor"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}