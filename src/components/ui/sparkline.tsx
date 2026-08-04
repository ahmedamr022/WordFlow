"use client";

import React from "react";

interface SparklineProps {
  type: "bars" | "line";
  data: number[];
  color: string;
}

export function Sparkline({ type, data, color }: SparklineProps) {
  const w = 96;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  if (type === "bars") {
    const gap = 3;
    const bw = (w - gap * (data.length - 1)) / data.length;
    return (
      <svg width={w} height={h} className="overflow-visible">
        {data.map((d, i) => {
          const bh = 6 + (d / max) * (h - 6);
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={h - bh}
              width={bw}
              height={bh}
              rx={2}
              fill={color}
              opacity={i === data.length - 1 ? 1 : 0.55}
            />
          );
        })}
      </svg>
    );
  }

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}