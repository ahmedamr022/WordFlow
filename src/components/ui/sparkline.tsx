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

  // حماية من البيانات الفارغة
  if (!data.length) {
    return <svg width={w} height={h} />;
  }

  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);

  if (type === "bars") {
    const gap = 3;
    const bw = (w - gap * (data.length - 1)) / data.length;

    return (
      <svg width={w} height={h} className="overflow-visible">
        {data.map((d, i) => {
          const ratio = max === 0 ? 0 : d / max;
          const bh = 6 + ratio * (h - 6);

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
      const x =
        data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;

      const y =
        h - ((d - min) / range) * (h - 6) - 3;

      return `${x},${Number.isFinite(y) ? y : h / 2}`;
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