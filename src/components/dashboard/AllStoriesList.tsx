"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface MiniStory {
  id: string;
  title: string;
  titleAr: string;
  level: string;
  cover: string;
}

const STORIES_DATA: MiniStory[] = [
  { id: "sherlock", title: "Sherlock Holmes", titleAr: "مغامرات هولمز", level: "B2", cover: "/images/sherlock.png" },
  { id: "gatsby", title: "The Great Gatsby", titleAr: "غاتسبي العظيم", level: "B1", cover: "/images/gatsby.png" },
  { id: "pride", title: "Pride & Prejudice", titleAr: "كبرياء وتحامل", level: "B1", cover: "/images/pride.png" },
  { id: "romeo", title: "Romeo & Juliet", titleAr: "روميو وجولييت", level: "A2", cover: "/images/romeo.png" },
];

export function AllStoriesList() {
  return (
    <div
      className="col-span-12 lg:col-span-8 rounded-[22px] border p-6 flex flex-col"
      style={{
        background: "linear-gradient(180deg,#0C1422 0%,#09111D 100%)",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow:
          "0 18px 45px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.025)",
      }}
    >
      <div
        className="flex items-center justify-start gap-2 mb-4"
        style={{ direction: "ltr" }}
      >
        <h3
          className="text-[20px] font-black leading-none text-white tracking-[-.3px]"
          style={{ direction: "rtl", textAlign: "left" }}
        >
          كافة القصص
        </h3>
        <BookOpen
          className="w-[21px] h-[21px] shrink-0 text-cyan-400"
          strokeWidth={1.8}
        />
      </div>

      <div
        className="flex items-stretch gap-3 w-full flex-1"
        style={{ direction: "ltr", perspective: "1000px" }}
      >
        {STORIES_DATA.map((s) => (
          <Link
            key={s.id}
            href="/stories"
            className="group relative flex-1 min-w-0 h-[176px] overflow-hidden rounded-[15px] transition-all duration-300 ease-out hover:-translate-y-[5px]"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
              border: "1px solid rgba(0,242,210,.34)",
              boxShadow:
                "0 5px 0 rgba(0,0,0,.28), 0 12px 22px rgba(0,0,0,.42), 0 22px 38px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.35)",
            }}
          >
            <img
              src={s.cover || "/placeholder.svg"}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover object-[center_22%] transition-all duration-500 ease-out group-hover:scale-[1.075]"
              style={{ transformOrigin: "center center" }}
            />
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.025) 20%,transparent 45%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg,rgba(0,0,0,.02) 0%,rgba(0,0,0,.04) 30%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.94) 100%)",
              }}
            />
            <div
              className="absolute left-[1px] right-[1px] top-[1px] h-[38%] rounded-t-[14px] pointer-events-none opacity-60"
              style={{
                background:
                  "linear-gradient(180deg,rgba(255,255,255,.10),transparent)",
              }}
            />
            <div
              className="absolute inset-0 rounded-[15px] pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,.035), inset 0 -35px 45px rgba(0,0,0,.20)",
              }}
            />
            <div
              className="absolute inset-0 rounded-[15px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(0,242,210,.38), 0 0 18px rgba(0,242,210,.10)",
              }}
            />
            <div
              className="absolute left-0 right-0 bottom-0 z-10 px-3 pb-2.5"
              style={{ direction: "ltr", textAlign: "left" }}
            >
              <h4
                className="text-[12px] font-black leading-tight truncate"
                style={{
                  color: "#F3C85B",
                  textShadow: "0 2px 7px rgba(0,0,0,.9)",
                }}
              >
                {s.title}
              </h4>
              <p
                className="mt-[3px] text-[10px] font-semibold text-white truncate"
                style={{
                  direction: "rtl",
                  textAlign: "left",
                  textShadow: "0 2px 7px rgba(0,0,0,.9)",
                }}
              >
                {s.titleAr}
              </p>
              <span
                className="inline-flex items-center justify-center mt-[6px] h-[18px] min-w-[26px] px-1.5 rounded-[5px] text-[9px] font-black"
                style={{
                  color: "#22E0C8",
                  background: "rgba(0,242,210,.10)",
                  border: "1px solid rgba(0,242,210,.55)",
                  boxShadow: "0 0 8px rgba(0,242,210,.12)",
                }}
              >
                {s.level}
              </span>
            </div>
          </Link>
        ))}

        <Link
          href="/stories"
          className="group relative w-[84px] shrink-0 h-[176px] flex flex-col items-center justify-center rounded-[15px] overflow-hidden transition-all duration-300 ease-out hover:-translate-y-[5px]"
          style={{
            background:
              "linear-gradient(145deg,#182638 0%,#111C2B 48%,#0C1522 100%)",
            border: "1px solid rgba(255,255,255,.10)",
            boxShadow:
              "0 5px 0 rgba(0,0,0,.30), 0 12px 24px rgba(0,0,0,.44), 0 22px 38px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.09), inset 0 -1px 0 rgba(0,0,0,.35)",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none opacity-50"
            style={{
              background:
                "linear-gradient(180deg,rgba(255,255,255,.08),transparent)",
            }}
          />
          <div
            className="absolute inset-[1px] rounded-[14px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: "inset 0 0 22px rgba(0,242,210,.08)" }}
          />
          <span
            className="relative z-10 text-[22px] font-black leading-none text-white transition-all duration-300 group-hover:text-[#00F2D2] group-hover:scale-[1.05]"
            style={{ textShadow: "0 3px 12px rgba(0,0,0,.55)" }}
          >
            +12
          </span>
          <span
            className="relative z-10 mt-2 text-[10px] font-semibold transition-colors duration-300 text-[#64748B]"
            dir="rtl"
          >
            المزيد
          </span>
          <div
            className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[22px] h-[2px] rounded-full opacity-40 transition-all duration-300 group-hover:w-[32px] group-hover:opacity-100"
            style={{
              background: "#22E0C8",
              boxShadow: "0 0 8px rgba(0,242,210,.45)",
            }}
          />
        </Link>
      </div>
    </div>
  );
}