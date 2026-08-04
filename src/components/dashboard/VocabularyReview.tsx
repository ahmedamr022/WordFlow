"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, Zap } from "lucide-react";

export function VocabularyReview() {
  return (
    <div
      className="col-span-12 lg:col-span-4 relative h-[265px] w-full overflow-hidden rounded-[18px] border"
      style={{
        background: "#090F18",
        borderColor: "rgba(255,255,255,.075)",
        boxShadow: `
          0 18px 45px rgba(0,0,0,.36),
          0 6px 16px rgba(0,0,0,.20),
          inset 0 1px 0 rgba(255,255,255,.035),
          inset 0 -1px 0 rgba(0,0,0,.45)
        `,
      }}
    >
      <div
        className="pointer-events-none absolute top-0 left-[18px] right-[18px] h-px"
        style={{ background: "rgba(255,255,255,.045)" }}
      />

      <div className="relative z-10 h-full px-5 py-4" dir="ltr">
        <div className="flex items-center justify-between h-[29px]">
          <div className="flex items-center gap-2" dir="ltr">
            <h3
              className="text-[16px] font-black leading-none tracking-[-.2px] text-white"
              dir="rtl"
            >
              مراجعة الكلمات
            </h3>
            <RotateCcw
              className="w-[16px] h-[16px] shrink-0"
              strokeWidth={2}
              style={{ color: "#7C6CFF" }}
            />
          </div>

          <div
            className="h-[29px] min-w-[51px] px-3.5 rounded-full flex items-center justify-center text-[10px] font-bold leading-none"
            dir="rtl"
            style={{
              background: "rgba(91,42,153,.20)",
              border: "1px solid rgba(157,92,255,.30)",
              color: "#FFFFFF",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
            }}
          >
            اليوم
          </div>
        </div>

        <div
          className="absolute left-5 right-5 top-[60px] bottom-[14px] flex items-center"
          dir="ltr"
        >
          <div className="w-[145px] shrink-0 h-full flex flex-col items-center justify-center">
            <div className="relative w-[126px] h-[126px] shrink-0">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#172230"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#00AFC2"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * 0.05}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[27px] font-black leading-none tracking-[-.5px] text-white">
                  95%
                </span>
                <span
                  className="mt-[5px] text-[10px] font-medium leading-none"
                  style={{
                    color: "#9AAABD",
                    letterSpacing: "1.7px",
                  }}
                >
                  FSRS
                </span>
              </div>
            </div>

            <Link
              href="/vocabulary"
              className="mt-[13px] h-[36px] w-[145px] rounded-full flex items-center justify-center gap-1.5 text-[11px] font-black leading-none transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0"
              dir="rtl"
              style={{
                background:
                  "linear-gradient(135deg,#482078 0%,#622C91 100%)",
                border: "1px solid rgba(177,101,255,.38)",
                color: "#FFFFFF",
                boxShadow: "0 7px 18px rgba(91,38,146,.22)",
              }}
            >
              <span>ابدأ المراجعة</span>
              <Zap size={13} strokeWidth={2.5} fill="currentColor" />
            </Link>
          </div>

          <div
            className="flex-1 min-w-0 h-full flex flex-col justify-center ml-[12px]"
            dir="rtl"
          >
            <div className="h-[43px] flex items-center justify-between">
              <span
                className="text-[11px] font-medium leading-none whitespace-nowrap"
                style={{ color: "#AAB7C7" }}
              >
                كلمة جديدة
              </span>
              <span
                className="text-[21px] font-black leading-none tracking-[-.4px] text-white"
                dir="ltr"
              >
                24
              </span>
            </div>

            <div
              className="h-px w-[76%] self-end"
              style={{ background: "rgba(255,255,255,.055)" }}
            />

            <div className="h-[43px] flex items-center justify-between">
              <span
                className="text-[11px] font-medium leading-none whitespace-nowrap"
                style={{ color: "#AAB7C7" }}
              >
                للمراجعة
              </span>
              <span
                className="text-[21px] font-black leading-none tracking-[-.4px] text-white"
                dir="ltr"
              >
                18
              </span>
            </div>

            <div
              className="h-px w-[76%] self-end"
              style={{ background: "rgba(255,255,255,.055)" }}
            />

            <div className="h-[43px] flex items-center justify-between">
              <span
                className="text-[11px] font-medium leading-none whitespace-nowrap"
                style={{ color: "#AAB7C7" }}
              >
                إجمالي الكلمات
              </span>
              <span
                className="text-[21px] font-black leading-none tracking-[-.4px] text-white"
                dir="ltr"
              >
                1,432
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}