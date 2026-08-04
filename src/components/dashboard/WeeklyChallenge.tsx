"use client";

import React from "react";
import { Star } from "lucide-react";

export function WeeklyChallenge() {
  return (
    <div
      className="col-span-12 lg:col-span-4 relative overflow-hidden rounded-[26px] border p-7"
      style={{
        background:
          "radial-gradient(circle at top right,#16273F 0%,#0D1626 45%,#070D16 100%)",
        borderColor: "rgba(255,255,255,.06)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,.05),
          inset 0 -1px 0 rgba(0,0,0,.4),
          0 24px 55px rgba(0,0,0,.45)
        `,
      }}
    >
      <div
        className="absolute -right-24 -top-24 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle,rgba(0,215,255,.07),transparent 70%)",
        }}
      />

      <div className="grid grid-cols-[1fr_280px] items-center h-full">
        <div
          className="pr-6 flex flex-col justify-center"
          style={{ direction: "rtl" }}
        >
          <h3
            style={{
              fontSize: 33,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            التحدي الأسبوعي
          </h3>

          <p
            style={{
              marginTop: 10,
              fontSize: 18,
              color: "#909CAF",
              fontWeight: 500,
            }}
          >
            أكمل 5 قصص هذا الأسبوع
          </p>

          <div
            style={{
              marginTop: 34,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              direction: "ltr",
              fontFamily: "Inter",
            }}
          >
            <span
              style={{
                fontSize: 74,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
                letterSpacing: "-5px",
              }}
            >
              3
            </span>

            <span
              style={{
                marginLeft: 8,
                marginBottom: 10,
                fontSize: 30,
                fontWeight: 700,
                color: "#5F6B7A",
              }}
            >
              /5
            </span>
          </div>

          <div
            style={{
              marginTop: 18,
              marginLeft: "auto",
              width: 250,
              height: 10,
              background: "#182433",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg,#10C9F6,#1CE5C5)",
                boxShadow: "0 0 16px rgba(0,220,220,.35)",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 24,
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 18px",
              borderRadius: 999,
              background: "#0D1825",
              border: "1px solid rgba(255,255,255,.05)",
            }}
          >
            <Star
              className="w-4 h-4"
              strokeWidth={2}
              style={{
                fill: "#F8C84B",
                color: "#F8C84B",
              }}
            />

            <span
              style={{
                color: "#00C8EF",
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              +250 XP
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center h-full">
          <img
            src="/images/trophy.png"
            alt="Weekly Trophy"
            className="transition-all duration-500 hover:scale-105 max-w-none"
            style={{
              width: 270,
              height: 270,
              objectFit: "contain",
              filter: `
                drop-shadow(0 22px 34px rgba(0,0,0,.65))
                drop-shadow(0 0 30px rgba(255,186,0,.22))
                drop-shadow(0 0 40px rgba(0,200,255,.10))
              `,
            }}
          />
        </div>
      </div>
    </div>
  );
}