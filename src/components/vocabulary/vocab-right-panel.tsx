"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { VocabularyWord } from "@/data/vocabularyData";

const LEVEL_STYLES: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
  }
> = {
  A1: {
    text: "#94A3B8",
    bg: "rgba(148,163,184,.12)",
    border: "rgba(148,163,184,.35)",
  },
  A2: {
    text: "#6EE7B7",
    bg: "rgba(16,185,129,.15)",
    border: "rgba(16,185,129,.40)",
  },
  B1: {
    text: "#7DD3FC",
    bg: "rgba(34,211,238,.15)",
    border: "rgba(34,211,238,.40)",
  },
  B2: {
    text: "#C4B5FD",
    bg: "rgba(124,108,255,.18)",
    border: "rgba(124,108,255,.42)",
  },
  C1: {
    text: "#F9A8D4",
    bg: "rgba(244,114,182,.15)",
    border: "rgba(244,114,182,.40)",
  },
  C2: {
    text: "#FCA5A5",
    bg: "rgba(248,113,113,.15)",
    border: "rgba(248,113,113,.40)",
  },
};

interface LevelSlice {
  level: string;
  count: number;
  pct: number;
  color: string;
}

interface VocabRightPanelProps {
  reviewCount: number;
  totalWords: number;
  levelSlices: LevelSlice[];
  recentWords: VocabularyWord[];
}

interface DonutChartProps {
  slices: LevelSlice[];
  total: number;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number
) {
  const rad = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(
    cx,
    cy,
    r,
    endAngle
  );

  const end = polarToCartesian(
    cx,
    cy,
    r,
    startAngle
  );

  const largeArcFlag =
    endAngle - startAngle <= 180 ? 0 : 1;

  return `
    M ${start.x} ${start.y}
    A ${r} ${r}
    0
    ${largeArcFlag}
    0
    ${end.x}
    ${end.y}
  `;
}

function DonutChart({
  slices,
  total,
}: DonutChartProps) {
  const SIZE = 210;
  const CENTER = SIZE / 2;
  const RADIUS = 72;
  const STROKE = 28;
  const GAP = 2.8;

  let currentAngle = 0;

  return (
    <div
      className="relative mx-auto"
      style={{
        width: SIZE,
        height: SIZE,
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
{/* BACKGROUND RING */}

<circle
  cx={CENTER}
  cy={CENTER}
  r={RADIUS}
  fill="none"
  stroke="rgba(255,255,255,.05)"
  strokeWidth={STROKE}
/>

{/* INNER RING */}

<circle
  cx={CENTER}
  cy={CENTER}
  r={RADIUS - STROKE / 2}
  fill="none"
  stroke="rgba(255,255,255,.025)"
  strokeWidth="2"
/>

        {/* SEGMENTS */}

        {slices.map((slice) => {
          const sweep = (slice.pct / 100) * 360;

          const start = currentAngle + GAP;

          const end = currentAngle + sweep - GAP;

          currentAngle += sweep;

          if (end <= start) return null;

          return (
            <g key={slice.level}>
              {/* Glow */}

              <path
                d={describeArc(
                  CENTER,
                  CENTER,
                  RADIUS,
                  start,
                  end
                )}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE + 8}
                strokeOpacity=".18"
                strokeLinecap="round"
                filter="url(#segmentGlow)"
              />

              {/* Main */}

              <path
                d={describeArc(
                  CENTER,
                  CENTER,
                  RADIUS,
                  start,
                  end
                )}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
              />

              {/* Highlight */}

              <path
                d={describeArc(
                  CENTER,
                  CENTER,
                  RADIUS - 2,
                  start,
                  end
                )}
                fill="none"
                stroke="rgba(255,255,255,.18)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          );
        })}
                {/* SVG DEFS */}

        <defs>
          <filter
            id="segmentGlow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur
              stdDeviation="8"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

      </svg>

{/* CENTER */}

<div
  className="
    absolute
    inset-0
    flex
    items-center
    justify-center
    pointer-events-none
  "
>
  <div
    className="
      absolute
      h-[108px]
      w-[108px]
      rounded-full
    "
    style={{
      background: "#101828",
    }}
  />

  <div
    className="
      relative
      z-10
      flex
      flex-col
      items-center
    "
  >
    <span
      dir="ltr"
      className="
        text-[34px]
        font-black
        leading-none
        tracking-[-0.05em]
        text-white
      "
    >
      {total}
    </span>

    <span
      className="
        mt-1
        text-[13px]
        font-bold
        text-slate-400
      "
    >
      كلمة
    </span>
  </div>
</div>

    </div>
  );
}

export function VocabRightPanel({
  reviewCount,
  totalWords,
  levelSlices,
  recentWords,
}: VocabRightPanelProps) {

  const reviewMinutes = Math.max(
    3,
    Math.ceil(reviewCount * 0.33)
  );

  return (
    <aside
      dir="rtl"
      className="
        w-full
        xl:w-[320px]
        shrink-0
        space-y-5
        overflow-y-auto
        pb-8
      "
    >
{/* ================= SMART REVIEW ================= */}

<section
  dir="ltr"
  className="
    group
    relative
    overflow-hidden
    rounded-[28px]
    border
    px-6
    pt-6
    pb-5
  "
  style={{
    background:
      "linear-gradient(180deg,#050A14 0%,#09111D 55%,#060B14 100%)",
    borderColor: "rgba(255,255,255,.045)",
    boxShadow:
      "0 28px 70px rgba(0,0,0,.60), inset 0 1px rgba(255,255,255,.025)",
  }}
>
  {/* Background Glow */}

  <div
    className="
      absolute
      left-1/2
      top-[110px]
      h-[220px]
      w-[220px]
      -translate-x-1/2
      rounded-full
      blur-[95px]
      opacity-30
      pointer-events-none
    "
    style={{
      background:
        "radial-gradient(circle,#6B46FF 0%,transparent 70%)",
    }}
  />

  {/* Top Shine */}

  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        "linear-gradient(180deg,rgba(255,255,255,.03),transparent 22%)",
    }}
  />

  {/* Header */}

  <div
    dir="rtl"
    className="relative flex items-start justify-between"
  >
    <div>
      <h3
        className="
          text-[17px]
          font-extrabold
          tracking-tight
          text-white
        "
      >
        مراجعة ذكية
      </h3>

      <p
        className="
          mt-2
          text-[13px]
          font-medium
          text-slate-400
        "
      >
        جاهز للمراجعة اليوم
      </p>
    </div>

    <div
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        border
      "
      style={{
        background: "rgba(108,86,255,.08)",
        borderColor: "rgba(108,86,255,.22)",
        boxShadow: "inset 0 1px rgba(255,255,255,.05)",
      }}
    >
      <Sparkles
        size={15}
        className="text-violet-300"
      />
    </div>
  </div>

  {/* ================= CONTENT ================= */}

  <div
    className="
      relative
      mt-6
      flex
      items-center
      justify-between
      gap-4
    "
  >
    {/* Number */}

    <div
      dir="ltr"
      className="
        flex
        flex-col
        items-start
        justify-center
        shrink-0
        z-20
      "
    >
      <span
        className="
          text-[72px]
          font-black
          leading-[0.88]
          tracking-[-0.06em]
          text-white
        "
      >
        {reviewCount}
      </span>

      <span
        className="
          mt-2
          text-[20px]
          font-bold
          text-slate-300
        "
      >
        كلمة
      </span>
    </div>

    {/* Illustration */}

    <div
      className="
        relative
        flex
        h-[185px]
        w-[210px]
        shrink-0
        items-center
        justify-end
      "
    >
      {/* Purple Glow */}

      <div
        className="
          absolute
          left-1/2
          bottom-5
          h-[95px]
          w-[150px]
          -translate-x-1/2
          rounded-full
          blur-[70px]
        "
        style={{
          background:
            "radial-gradient(circle,rgba(115,77,255,.42),transparent 72%)",
        }}
      />

      {/* PNG */}

      <Image
        src="/images/review-cards.png"
        alt="Review Cards"
        width={220}
        height={175}
        priority
        draggable={false}
        className="
          relative
          z-10
          h-auto
          w-[220px]
          object-contain
          select-none
          pointer-events-none
          transition-all
          duration-500
          ease-out
          drop-shadow-[0_30px_40px_rgba(0,0,0,.55)]
          group-hover:scale-[1.04]
          group-hover:-translate-y-1
        "
        style={{
          filter:
            "drop-shadow(0 0 14px rgba(109,76,255,.28)) drop-shadow(0 0 22px rgba(255,70,160,.20))",
        }}
      />
    </div>

  </div>
        {/* ================= CTA ================= */}

      <Link
        href="/vocabulary/test"
        className="
          group/button
          relative
          mt-2
          flex
          h-[56px]
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-[18px]
          text-[15px]
          font-black
          text-white
          transition-all
          duration-300
          hover:scale-[1.015]
          active:scale-[.985]
        "
        style={{
          background:
            "linear-gradient(90deg,#5B38FF 0%,#7653FF 45%,#FF5E84 100%)",
          boxShadow:
            "0 16px 38px rgba(104,73,255,.32)",
        }}
      >
        <span className="relative z-20 tracking-wide">
          ابدأ المراجعة
        </span>

        {/* Shine */}

        <div
          className="
            absolute
            inset-0
            -translate-x-full
            bg-gradient-to-r
            from-transparent
            via-white/25
            to-transparent
            duration-700
            group-hover/button:translate-x-full
          "
        />

        {/* Bottom Glow */}

        <div
          className="
            absolute
            inset-x-8
            bottom-0
            h-5
            rounded-full
            blur-xl
            opacity-60
          "
          style={{
            background: "#8C6CFF",
          }}
        />
      </Link>

      {/* Review Time */}

      <p
        dir="rtl"
        className="
          mt-4
          text-center
          text-[12px]
          font-medium
          tracking-wide
          text-slate-500
        "
      >
        سيستغرق حوالي {reviewMinutes} دقائق
      </p>

      {/* Bottom Ambient Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          left-1/2
          h-[220px]
          w-[260px]
          -translate-x-1/2
          rounded-full
          blur-[110px]
          opacity-20
        "
        style={{
          background:
            "radial-gradient(circle,#6C49FF 0%,#FF5D84 55%,transparent 100%)",
        }}
      />

      {/* Right Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          top-16
          h-44
          w-44
          rounded-full
          blur-[100px]
          opacity-10
        "
        style={{
          background: "#6B46FF",
        }}
      />

      {/* Inner Border */}

      <div
        className="
          pointer-events-none
          absolute
          inset-[1px]
          rounded-[27px]
          border
        "
        style={{
          borderColor: "rgba(255,255,255,.025)",
        }}
      />
    </section>
 {/* ================= LEVEL DISTRIBUTION ================= */}

<section
  className="
    relative
    overflow-hidden
    rounded-[26px]
    border
    px-6
    py-6
  "
  style={{
    background:
      "linear-gradient(180deg,#050A14 0%,#09111D 55%,#060B14 100%)",
    borderColor: "rgba(255,255,255,.045)",
    boxShadow:
      "0 28px 70px rgba(0,0,0,.60), inset 0 1px rgba(255,255,255,.025)",
  }}
>

  {/* Glow */}

  <div
    className="
      pointer-events-none
      absolute
      -top-20
      left-1/2
      h-[260px]
      w-[260px]
      -translate-x-1/2
      rounded-full
      blur-[120px]
      opacity-25
    "
    style={{
      background:
        "radial-gradient(circle,#6B46FF 0%,transparent 70%)",
    }}
  />

  {/* Title */}

  <h3
    className="
      relative
      mb-5
      text-left
      text-[24px]
      font-extrabold
      tracking-tight
      text-white
    "
  >
    توزيع المستويات
  </h3>
{/* Chart */}

<div
  className="
    flex
    justify-center
    mb-7
  "
>
  <DonutChart
    slices={levelSlices}
    total={totalWords}
  />
</div>

  {/* Stats */}

  <div className="space-y-4">

    {levelSlices.map((slice) => (

      <div
        key={slice.level}
        className="
          flex
          items-center
          justify-between
        "
      >

        {/* Left Percentage */}

        <span
          dir="ltr"
          className="
            text-[16px]
            font-extrabold
            text-white
          "
        >
          {slice.pct}%
        </span>

        {/* Right */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <span
            dir="ltr"
            className="
              text-[17px]
              font-black
              text-white
            "
          >
            {slice.level}
          </span>

          <span
            className="
              text-[15px]
              font-semibold
              text-slate-400
            "
          >
            {slice.level === "A2"
              ? "مبتدئ"
              : slice.level === "B1"
              ? "متوسط"
              : slice.level === "B2"
              ? "فوق المتوسط"
              : "متقدم"}
          </span>

          <span
            className="
              h-[10px]
              w-[10px]
              rounded-full
            "
            style={{
              background: slice.color,
              boxShadow: `
                0 0 14px ${slice.color},
                0 0 28px ${slice.color}
              `,
            }}
          />

        </div>

      </div>

    ))}

  </div>

  {/* Bottom Glow */}

  <div
    className="
      pointer-events-none
      absolute
      -bottom-20
      left-1/2
      h-[220px]
      w-[240px]
      -translate-x-1/2
      rounded-full
      blur-[110px]
      opacity-15
    "
    style={{
      background:
        "radial-gradient(circle,#6B46FF,#FF5B82,transparent)",
    }}
  />

  {/* Inner Border */}

  <div
    className="
      pointer-events-none
      absolute
      inset-[1px]
      rounded-[25px]
      border
    "
    style={{
      borderColor:
        "rgba(255,255,255,.025)",
    }}
  />

</section>
{/* ================= RECENT WORDS ================= */}
<div
  dir="ltr"
  className="
    relative
    overflow-hidden
    rounded-[24px]
    border
    border-[#1E2638]
    bg-[#070C18]
    p-6
    shadow-2xl
  "
>
  {/* HEADER */}
  <div className="mb-6 text-left">
    <h3 className="text-[22px] font-bold text-white">
      أحدث ما تعلمته
    </h3>
  </div>

  {/* LIST */}
  {recentWords.length > 0 ? (
    <div className="space-y-5">
      {recentWords.map((word) => {
        const style = LEVEL_STYLES[word.cefrLevel] ?? LEVEL_STYLES.B1;

        return (
          <div
            key={word.id}
            className="flex items-center justify-between gap-4"
          >
            {/* LEFT SIDE: ICON & WORD INFO */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* ICON / BADGE BOX */}
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#3B1578]
                  bg-[#160B2E]
                  text-[#A855F7]
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>

              {/* WORD & TRANSLATION */}
              <div className="text-left min-w-0">
                <p className="truncate text-[17px] font-bold text-white leading-tight">
                  {word.word}
                </p>
                <p className="mt-1 text-[13px] font-medium text-slate-400 leading-tight">
                  {word.translationAr}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: CEFR LEVEL BADGE */}
            <div
              className="
                shrink-0
                rounded-lg
                border
                border-[#3B1578]
                bg-[#120924]
                px-3
                py-1.5
                text-[13px]
                font-bold
                text-[#A855F7]
              "
              style={{
                color: style?.text || "#A855F7",
                borderColor: style?.border || "#3B1578",
              }}
            >
              {word.cefrLevel}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="py-6 text-center text-sm text-slate-400">
      لا توجد كلمات سابقة حتى الآن.
    </div>
  )}

  {/* BUTTON */}
  {recentWords.length > 0 && (
    <div className="mt-6">
      <Link
        href="/vocabulary/test"
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          rounded-xl
          border
          border-[#3B1578]
          bg-transparent
          text-[15px]
          font-bold
          text-[#A855F7]
          transition-all
          duration-200
          hover:bg-[#160B2E]
        "
      >
        عرض الكل
      </Link>
    </div>
  )}
</div>
    </aside>
  );
}