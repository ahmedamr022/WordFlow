import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  hint?: string;
}

/**
 * Lightweight SVG donut — no chart library needed for a 4-segment breakdown.
 */
export function Donut({
  segments,
  size = 116,
  stroke = 16,
  centerValue,
  centerLabel






}: {segments: DonutSegment[];size?: number;stroke?: number;centerValue: string;centerLabel: string;}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke} />
        
        {segments.map((segment) => {
          const length = segment.value / total * circumference;
          const dash = `${length} ${circumference - length}`;
          const element =
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={stroke}
            strokeDasharray={dash}
            strokeDashoffset={-offset} />;


          offset += length;
          return element;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-en text-lg font-bold leading-none text-white">
          {centerValue}
        </span>
        <span className="mt-0.5 text-[10px] text-white/40">{centerLabel}</span>
      </div>
    </div>);

}

export function DonutLegend({ segments }: {segments: DonutSegment[];}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <ul className="flex-1 space-y-1.5">
      {segments.map((segment) =>
      <li
        key={segment.label}
        className="flex items-center gap-2 text-[11.5px]">
        
          <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: segment.color }} />
        
          <span className="font-en text-white/70">{segment.label}</span>
          {segment.hint ?
        <span className="text-white/35">{segment.hint}</span> :
        null}
          <span className="ms-auto font-en text-white/45">
            {Math.round(segment.value / total * 100)}%
          </span>
        </li>
      )}
    </ul>);

}