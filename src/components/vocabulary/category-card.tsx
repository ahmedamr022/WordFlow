"use client";

import { VocabularyCategory } from "@/data/vocabularyData";
import {
  Briefcase,
  Plane,
  Heart,
  GraduationCap,
  Laptop,
  Trees,
  UtensilsCrossed,
  MessageCircle,
} from "lucide-react";

const CARD_COLORS = [
  "#EC4899",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#8B5CF6",
  "#06B6D4",
  "#22C55E",
];

const ICONS = [
  Briefcase,
  Plane,
  GraduationCap,
  Heart,
  Laptop,
  MessageCircle,
  Trees,
  UtensilsCrossed,
];

interface CategoryCardProps {
  category: VocabularyCategory;
  progress: number;
  index: number;
  onClick: () => void;
}

export function CategoryCard({
  category,
  progress,
  index,
  onClick,
}: CategoryCardProps) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const Icon = ICONS[index % ICONS.length];

  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        text-left
        transition-all
        duration-300
        ease-out
        hover:-translate-y-[4px]
        hover:shadow-[0_18px_45px_rgba(0,0,0,.42)]
        active:scale-[.985]
      "
                style={{
          background: `
          linear-gradient(
          180deg,
          ${color}08 0%,
          #182132 18%,
          #141D2C 55%,
          #111827 100%
          )
          `,

        borderColor: "rgba(255,255,255,.045)",

        boxShadow:
          "0 8px 28px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.03)",
      }}
    >
      {/* ================= IMAGE ================= */}

      <div className="relative h-[180px] overflow-hidden">

        <img
          src={category.coverImage}
          alt={category.titleEn}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            brightness-[.90]
            contrast-[1.08]
            saturate-[1.05]
            duration-700
            group-hover:scale-[1.06]
          "
        />

        {/* Dark Cinematic Overlay */}

        <div
          className="absolute inset-0"
          style={{
            background: `
            linear-gradient(
              180deg,

              rgba(5,8,15,.03) 0%,

              rgba(5,8,15,.10) 20%,

              rgba(5,8,15,.22) 40%,

              rgba(5,8,15,.55) 65%,

              rgba(17,24,39,.92) 88%,

              #111827 100%
            )
          `,
          }}
        />

        {/* Soft Top Light */}

        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% -10%, rgba(255,255,255,.18), transparent 55%)",
          }}
        />

        {/* Color Glow */}

        <div
          className="
            absolute
            -bottom-16
            left-1/2
            h-36
            w-36
            -translate-x-1/2
            rounded-full
            blur-[70px]
            opacity-25
          "
          style={{
            background: color,
          }}
        />

        {/* Premium Icon */}

        <div
          className="
            absolute
            bottom-5
            right-5
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            backdrop-blur-2xl
            duration-300
            group-hover:scale-110
          "
          style={{
            background: "rgba(20,28,40,.72)",

            borderColor: `${color}55`,

            boxShadow:
              "0 8px 22px rgba(0,0,0,.40), inset 0 1px rgba(255,255,255,.05)",
          }}
        >
          <Icon
            size={20}
            strokeWidth={2.2}
            style={{
              color,
            }}
          />
        </div>

        {/* Inner Highlight */}

        <div
          className="
            absolute
            inset-0
            rounded-t-[22px]
            border-b
            border-white/[0.03]
          "
        />
      </div>

      {/* ================= CONTENT ================= */}

      <div className="px-4 pt-3 pb-4">
        <h3
          className="
            min-h-[48px]
            text-[15px]
            font-bold
            leading-6
            tracking-[-0.02em]
            text-slate-50
            transition-colors
            duration-300
            group-hover:text-white
          "
        >
          {category.titleEn}
        </h3>

        <div className="mt-2 flex items-center justify-between">

          <span
            className="
              text-[12px]
              font-medium
              text-slate-500
            "
          >
            {category.words.length} كلمة
          </span>

          <span
            className="text-[13px] font-bold tracking-wide"
            style={{
              color,
            }}
          >
            {progress}%
          </span>

        </div>

        {/* Progress */}

        <div className="mt-4">

          <div
            className="
              relative
              h-[4px]
              overflow-hidden
              rounded-full
              bg-[#2B3445]
            "
          >

            <div
              className="
                absolute
                inset-y-0
                left-0
                rounded-full
                transition-all
                duration-700
              "
              style={{
                width: `${progress}%`,
                background: color,
                boxShadow: `
                  0 0 10px ${color}99,
                  0 0 22px ${color}55
                `,
              }}
            />

          </div>

        </div>
      </div>

      {/* Soft Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-52
          w-52
          rounded-full
          opacity-0
          blur-[100px]
          transition-all
          duration-500
          group-hover:opacity-10
        "
        style={{
          background: color,
        }}
      />

      {/* Glass Reflection */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      >

        <div
          className="
            absolute
            -left-40
            top-0
            h-full
            w-24
            rotate-[22deg]
            bg-gradient-to-r
            from-transparent
            via-white/15
            to-transparent
            transition-all
            duration-[1400ms]
            group-hover:left-[130%]
          "
        />

      </div>

      {/* Inner Border */}

      <div
        className="
          pointer-events-none
          absolute
          inset-[1px]
          rounded-[21px]
          border
        "
        style={{
          borderColor: "rgba(255,255,255,.025)",
        }}
      />

      {/* Noise Texture */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
          mix-blend-overlay
        "
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
            radial-gradient(circle at 75% 60%, white 1px, transparent 1px),
            radial-gradient(circle at 45% 85%, white 1px, transparent 1px)
          `,
          backgroundSize: "18px 18px",
        }}
      />

    </button>
  );
}