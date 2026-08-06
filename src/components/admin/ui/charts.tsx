"use client";

import React from "react";

/**
 * رسوم اللوحة — SVG خالص بلا مكتبة رسوم.
 *
 * الأشكال المطلوبة ثلاثة فقط (حلقة، قائمة أشرطة، منحنى)، وإضافة مكتبة كاملة
 * لأجلها تعني وزناً على كل صفحة أدمن مقابل صفر فائدة. كل شكل هنا يقرأ أرقاماً
 * حقيقية ويتعامل مع الحالة الفارغة بنفسه.
 */

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  caption?: string;
}

export function Donut({
  slices,
  total,
  centerLabel,
  size = 168




}: {slices: DonutSlice[];total?: number;centerLabel: string;size?: number;}) {
  const sum = total ?? slices.reduce((acc, slice) => acc + slice.value, 0);
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12" />

          {sum > 0 &&
          slices.map((slice) => {
            const fraction = slice.value / sum;
            const dash = fraction * circumference;
            const element =
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="12"
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} />;


            offset += dash;
            return element;
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-en text-[1.7rem] font-black leading-none text-white">
            {sum.toLocaleString("en-US")}
          </span>
          <span className="mt-1 text-[11px] font-bold text-slate-500">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {slices.map((slice) =>
        <li key={slice.label} className="flex items-center gap-2.5 text-[12px]">
            <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: slice.color }}
            aria-hidden />

            <span className="flex-1 font-bold text-slate-300">{slice.label}</span>
            <span className="font-en text-slate-500">
              {slice.caption ?? `${sum > 0 ? Math.round(slice.value / sum * 100) : 0}%`}
            </span>
            <span className="font-en w-12 text-left font-bold text-slate-200">
              {slice.value.toLocaleString("en-US")}
            </span>
          </li>
        )}
      </ul>
    </div>);

}

export interface BarItem {
  label: string;
  sublabel?: string;
  value: number;
  display?: string;
  color?: string;
  thumbnail?: string | null;
}

export function BarList({ items, max }: {items: BarItem[];max?: number;}) {
  const ceiling = max ?? Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-[12.5px] text-slate-500">لا توجد بيانات بعد.</p>);

  }

  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) =>
      <li key={item.label} className="flex items-center gap-3">
          {item.thumbnail !== undefined &&
        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0B111C]">
              {item.thumbnail &&
          <img src={item.thumbnail} alt="" className="h-full w-full object-cover" aria-hidden />
          }
            </span>
        }

          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-en truncate text-[12.5px] font-bold text-slate-200">
                {item.label}
              </span>
              <span className="font-en shrink-0 text-[12px] font-bold text-cyan-300">
                {item.display ?? item.value.toLocaleString("en-US")}
              </span>
            </span>

            {item.sublabel &&
          <span className="block truncate text-[11px] text-slate-500">{item.sublabel}</span>
          }

            <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <span
              className="block h-full rounded-full"
              style={{
                width: `${Math.max(2, Math.round(item.value / ceiling * 100))}%`,
                background: item.color ?? "linear-gradient(90deg,#06b6d4,#7c3aed)"
              }} />

            </span>
          </span>
        </li>
      )}
    </ul>);

}

/** منحنى مساحي بسيط لسلسلة زمنية قصيرة (٧–٣٠ نقطة). */
export function AreaChart({
  points,
  labels,
  color = "#22d3ee",
  height = 160,
  suffix = ""





}: {points: number[];labels?: string[];color?: string;height?: number;suffix?: string;}) {
  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-[12.5px] text-slate-500">
        لا توجد بيانات كافية لرسم المنحنى.
      </p>);

  }

  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(1, max - min);
  const width = 100;

  const coords = points.map((value, index) => ({
    x: index / (points.length - 1) * width,
    y: 100 - (value - min) / range * 88 - 6
  }));

  const line = coords.
  map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).
  join(" ");
  const area = `${line} L${width},100 L0,100 Z`;

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height }}
        className="w-full"
        role="img"
        aria-label={`منحنى بأعلى قيمة ${max}${suffix}`}>

        <defs>
          <linearGradient id={`area-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[25, 50, 75].map((y) =>
        <line
          key={y}
          x1="0"
          x2="100"
          y1={y}
          y2={y}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.4" />

        )}

        <path d={area} fill={`url(#area-${color.replace("#", "")})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke" />

      </svg>

      {labels &&
      <figcaption className="font-en flex justify-between text-[10px] text-slate-600">
          {labels.map((label) =>
        <span key={label}>{label}</span>
        )}
        </figcaption>
      }
    </figure>);

}