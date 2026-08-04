"use client";

import React from "react";

interface TypingStatsProps {
  currentLineIndex: number;
  totalLines: number;
}

export const TypingStats: React.FC<TypingStatsProps> = ({
  currentLineIndex,
  totalLines,
}) => {
  const percentage = 60;

  return (
    <div
      className="w-full max-w-[580px] mt-2 grid grid-cols-[1.25fr_1fr] gap-4 items-center p-[16px_22px] rounded-[16px] rtl text-right transition-colors duration-300 hover:border-[#00d2ff]/30"
      style={{
        background: "rgba(6, 12, 28, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Right side: Progress Bar & Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#00d2ff]">
          <i className="fa-solid fa-chart-line text-[12px]"></i>
          <span>تقدمك في هذه القصة</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-grow h-[6px] bg-white/10 rounded-full overflow-hidden ltr">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: "linear-gradient(90deg, #00d2ff, #a855f7)",
                boxShadow: "0 0 10px rgba(0, 210, 255, 0.8)",
              }}
            />
          </div>
          <span className="text-[#8e9bb0] text-[11px] font-semibold whitespace-nowrap">
            السطر {currentLineIndex + 1} من {totalLines}
          </span>
          <span className="font-['Inter'] text-[20px] font-extrabold text-white">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Left side: Encouragement notice */}
      <div className="border-r border-dashed border-white/15 pr-4 flex items-center gap-3 justify-end">
        <div className="flex flex-col text-right">
          <h4 className="text-[13px] font-extrabold text-white mb-0.5">
            استمر! أنت تقوم بعمل رائع
          </h4>
          <p className="text-[11px] text-[#8e9bb0] font-medium">
            كل يوم تقرأ، عقلك يتطور أكثر.
          </p>
        </div>
        <div
          className="w-[36px] h-[36px] rounded-xl flex items-center justify-center text-[#fbbf24] text-[14px] shrink-0"
          style={{
            background: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
      </div>
    </div>
  );
};