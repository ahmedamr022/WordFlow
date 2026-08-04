"use client";

import React from "react";

interface WordTooltipProps {
  word: string;
  pos: string;
  meaning: string;
  hint: string;
  active: boolean;
  left: number;
  top: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const WordTooltip: React.FC<WordTooltipProps> = ({
  word,
  pos,
  meaning,
  hint,
  active,
  left,
  top,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute z-[100] w-[240px] rounded-[18px] p-[14px_18px] ltr text-left transition-all duration-200 ease-out ${
        active
          ? "opacity-100 visible translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 invisible translate-y-2 scale-95 pointer-events-none"
      }`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        background: "rgba(8, 15, 32, 0.65)",
        border: "1px solid rgba(0, 210, 255, 0.3)",
        backdropFilter: "blur(25px) saturate(180%)",
        WebkitBackdropFilter: "blur(25px) saturate(180%)",
        boxShadow:
          "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 210, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Pop Card Arrow */}
      <div
        className="absolute -bottom-[6px] left-[22px] w-[10px] h-[10px] rotate-45"
        style={{
          background: "rgba(8, 15, 32, 0.65)",
          borderBottom: "1px solid rgba(0, 210, 255, 0.3)",
          borderRight: "1px solid rgba(0, 210, 255, 0.3)",
        }}
      />

      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-['Inter'] text-[19px] font-extrabold tracking-tight bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #ffffff 30%, #00d2ff 100%)",
          }}
        >
          {word}
        </span>
        <button
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[#00d2ff] text-[11px] transition-transform hover:scale-110 active:scale-90"
          style={{
            background: "rgba(0, 210, 255, 0.12)",
            border: "1px solid rgba(0, 210, 255, 0.3)",
            boxShadow: "0 0 10px rgba(0, 210, 255, 0.15)",
          }}
        >
          <i className="fa-solid fa-volume-high"></i>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[11px] font-bold px-2.2 py-0.5 rounded-full text-[#d8b4fe]"
          style={{
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
          }}
        >
          {pos}
        </span>
      </div>

      <div
        className="h-[1px] my-2"
        style={{
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0.15), transparent)",
        }}
      />

      <div className="flex flex-col gap-0.5 rtl text-right">
        <span
          className="text-[15px] font-bold text-[#38bdf8]"
          style={{ textShadow: "0 0 12px rgba(56, 189, 248, 0.3)" }}
        >
          {meaning}
        </span>
        {hint && (
          <span className="text-[11px] text-white/55 font-medium">{hint}</span>
        )}
      </div>
    </div>
  );
};