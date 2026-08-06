"use client";
import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { MAIN_STORIES, type StoryItem } from "@/data/stories";
import { withFallback } from "@/lib/assets";
import { useStoryModal } from "@/components/stories/StoryModalProvider";

/**
 * ركن القصص في الداشبورد.
 *
 * ما تغيّر في هذه الدفعة
 * ──────────────────────
 * ١) **القصص تأتي props**: كانت مقروءة مباشرة من `MAIN_STORIES` (أول أربع قصص
 *    في ملف ثابت) فلا تظهر أي قصة أنشأها الأدمن، ولا علاقة للاختيار بمستوى
 *    المستخدم. الآن الصفحة تمرّر قصصاً **مرشَّحة لمستواه** من الكتالوج الكامل.
 *
 * ٢) **نسبة البطاقة**: كانت `h-[176px]` ثابتة داخل لوح يتمدّد لارتفاع «التحدي
 *    الأسبوعي» بجواره (`items-stretch`)، فيبقى فراغ ميت أسفل البطاقات ويبدو
 *    الكارت طويلاً بالنسبة لصور القصص. الآن البطاقات `h-full` فتملأ اللوح
 *    وتحافظ على نسبة قريبة من كارت المكتبة.
 */

export interface AllStoriesListProps {
  /** القصص المعروضة (مرشَّحة على السيرفر). تسقط على الكتالوج الثابت لو غابت. */
  stories?: StoryItem[];
  /** إجمالي القصص المتاحة — يُمرَّر من الصفحة لتفادي حسابه مرتين. */
  totalCount?: number;
  /** مستوى المستخدم — يُعرض كشرح لسبب هذا الاختيار. */
  level?: string;
}

const SHOWN = 4;

export function AllStoriesList({ stories, totalCount, level }: AllStoriesListProps) {
  const { openStory } = useStoryModal();

  const source = stories && stories.length > 0 ? stories : MAIN_STORIES;
  const visible = source.slice(0, SHOWN);
  const total = totalCount ?? source.length;
  const remaining = Math.max(0, total - visible.length);

  return (
    <div
      className="col-span-12 lg:col-span-8 flex flex-col rounded-[22px] border p-5"
      style={{
        background: "linear-gradient(180deg,#0C1422 0%,#09111D 100%)",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow:
        "0 18px 45px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.025)"
      }}>

      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2" dir="rtl">
        <div className="flex items-center gap-2">
          <BookOpen
            className="h-[20px] w-[20px] shrink-0 text-cyan-400"
            strokeWidth={1.8}
            aria-hidden />

          <h3 className="text-[19px] font-black leading-none tracking-[-.3px] text-white">
            ركن القصص
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {level &&
          <span
            className="rounded-full border border-cyan-400/30 bg-cyan-500/[0.08] px-2.5 py-1 text-[10.5px] font-bold text-cyan-200">

              مختارة لمستوى <span className="font-en">{level}</span>
            </span>
          }
          <Link
            href="/stories"
            className="text-[11.5px] font-bold text-slate-400 transition-colors hover:text-cyan-300">

            كل القصص
          </Link>
        </div>
      </div>

      <ul
        className="flex w-full flex-1 items-stretch gap-3 list-none p-0 m-0"
        style={{ direction: "ltr", perspective: "1000px" }}>

        {visible.map((story) =>
        <li key={story.id} className="min-w-0 flex-1">
            <button
            type="button"
            onClick={() => openStory(String(story.id))}
            aria-label={`تفاصيل قصة ${story.titleAr || story.titleEn}`}
            className="group relative block h-full min-h-[188px] w-full cursor-pointer overflow-hidden rounded-[15px] text-left transition-all duration-300 ease-out hover:-translate-y-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
              border: "1px solid rgba(0,242,210,.34)",
              boxShadow:
              "0 5px 0 rgba(0,0,0,.28),0 12px 22px rgba(0,0,0,.42),0 22px 38px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.35)"
            }}>

              <img
              src={withFallback(story.cover)}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[center_28%] transition-all duration-500 ease-out group-hover:scale-[1.075]"
              style={{ transformOrigin: "center center" }} />

              <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-70"
              style={{
                background:
                "linear-gradient(135deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.025) 20%,transparent 45%)"
              }} />

              <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                "linear-gradient(180deg,rgba(0,0,0,.02) 0%,rgba(0,0,0,.04) 30%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.94) 100%)"
              }} />

              <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[15px]"
              style={{
                boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,.035),inset 0 -35px 45px rgba(0,0,0,.20)"
              }} />

              <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                boxShadow:
                "inset 0 0 0 1px rgba(0,242,210,.38),0 0 18px rgba(0,242,210,.10)"
              }} />


              <div
              className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-2.5"
              style={{ direction: "ltr", textAlign: "left" }}>

                <h4
                className="truncate text-[12px] font-black leading-tight"
                style={{ color: "#F3C85B", textShadow: "0 2px 7px rgba(0,0,0,.9)" }}>

                  {story.titleEn}
                </h4>
                <p
                className="mt-[3px] truncate text-[10px] font-semibold text-white"
                style={{
                  direction: "rtl",
                  textAlign: "left",
                  textShadow: "0 2px 7px rgba(0,0,0,.9)"
                }}>

                  {story.titleAr}
                </p>

                <div className="mt-[6px] flex items-center gap-2" style={{ direction: "ltr" }}>
                  <span
                  className="inline-flex h-[18px] min-w-[26px] items-center justify-center rounded-[5px] px-1.5 text-[9px] font-black"
                  style={{
                    color: "#22E0C8",
                    background: "rgba(0,242,210,.10)",
                    border: "1px solid rgba(0,242,210,.55)",
                    boxShadow: "0 0 8px rgba(0,242,210,.12)"
                  }}>

                    {story.level}
                  </span>

                  {typeof story.progress === "number" && story.progress > 0 &&
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
                        <span
                      className="absolute inset-y-0 left-0 rounded-full bg-[#22E0C8]"
                      style={{ width: `${Math.min(100, story.progress)}%` }} />

                      </span>
                      <span className="font-en text-[9px] font-bold text-[#9FE9DF]">
                        {Math.round(story.progress)}%
                      </span>
                    </span>
                }
                </div>
              </div>
            </button>
          </li>
        )}

        {remaining > 0 &&
        <li className="shrink-0">
            <Link
            href="/stories"
            className="group relative flex h-full min-h-[188px] w-[84px] flex-col items-center justify-center overflow-hidden rounded-[15px] transition-all duration-300 ease-out hover:-translate-y-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            aria-label={`عرض ${remaining} قصة أخرى`}
            style={{
              background:
              "linear-gradient(145deg,#182638 0%,#111C2B 48%,#0C1522 100%)",
              border: "1px solid rgba(255,255,255,.10)",
              boxShadow:
              "0 5px 0 rgba(0,0,0,.30),0 12px 24px rgba(0,0,0,.44),0 22px 38px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(0,0,0,.35)",
              transformStyle: "preserve-3d",
              willChange: "transform"
            }}>

              <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-0 h-[45%] opacity-50"
              style={{
                background: "linear-gradient(180deg,rgba(255,255,255,.08),transparent)"
              }} />

              <div
              aria-hidden
              className="pointer-events-none absolute inset-[1px] rounded-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ boxShadow: "inset 0 0 22px rgba(0,242,210,.08)" }} />

              <span
              className="relative z-10 text-[22px] font-black leading-none text-white transition-all duration-300 group-hover:text-[#00F2D2] group-hover:scale-[1.05]"
              style={{ textShadow: "0 3px 12px rgba(0,0,0,.55)" }}
              dir="ltr">

                +{remaining}
              </span>
              <span
              className="relative z-10 mt-2 text-[10px] font-semibold text-[#64748B] transition-colors duration-300"
              dir="rtl">

                المزيد
              </span>
              <div
              aria-hidden
              className="absolute bottom-[10px] left-1/2 h-[2px] w-[22px] -translate-x-1/2 rounded-full opacity-40 transition-all duration-300 group-hover:w-[32px] group-hover:opacity-100"
              style={{ background: "#22E0C8", boxShadow: "0 0 8px rgba(0,242,210,.45)" }} />

            </Link>
          </li>
        }
      </ul>
    </div>);

}

export default AllStoriesList;