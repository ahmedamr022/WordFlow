"use client";

import React from "react";
import { TypingMetrics } from "@/types";

interface TypingStatsProps {
  metrics: TypingMetrics;
  currentLineIndex: number;
  totalLines: number;
}

export const TypingStats: React.FC<TypingStatsProps> = ({
  metrics,
  currentLineIndex,
  totalLines,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 w-full max-w-xl mx-auto px-6 py-3 rounded-2xl glass-card text-sm">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <span className="block text-2xl font-bold font-mono text-primary-coral">
            {metrics.wpm}
          </span>
          <span className="text-xs text-muted-text uppercase tracking-wider font-semibold">
            WPM
          </span>
        </div>

        <div className="h-8 w-[1px] bg-border/60" />

        <div className="text-center">
          <span className="block text-2xl font-bold font-mono text-secondary-teal">
            {metrics.accuracy}%
          </span>
          <span className="text-xs text-muted-text uppercase tracking-wider font-semibold">
            ACC
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xs text-muted-text block mb-1 font-arabic">
          السطر {currentLineIndex + 1} من {totalLines}
        </span>
        <div className="w-28 h-2 bg-card-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-coral to-secondary-teal transition-all duration-300"
            style={{ width: `${((currentLineIndex + 1) / totalLines) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
