;

import React from "react";

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  gradientId: string;
  from: string;
  mid?: string;
  to: string;
  /** مسار خلفي منقّط بدل الحلقة الصلبة — يعطي إحساس «العدّاد». */
  dashedTrack?: boolean;
  /** توهج ناعم حول القوس المكتمل. */
  glow?: boolean;
  trackColor?: string;
  /** نص مقروء لقارئ الشاشة (الحلقة نفسها زخرفية). */
  ariaLabel?: string;
  children: React.ReactNode;
}

export function ProgressRing({
  value,
  size = 200,
  stroke = 14,
  gradientId,
  from,
  mid,
  to,
  dashedTrack = false,
  glow = false,
  trackColor = "rgba(255,255,255,0.07)",
  ariaLabel,
  children
}: ProgressRingProps) {
  const safeValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - safeValue / 100 * circumference;
  const glowId = `${gradientId}-glow`;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(safeValue)}
      aria-valuemin={0}
      aria-valuemax={100}>
      
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            {mid && <stop offset="50%" stopColor={mid} />}
            <stop offset="100%" stopColor={to} />
          </linearGradient>

          {glow &&
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blurred" />
              <feMerge>
                <feMergeNode in="blurred" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          }
        </defs>

        {/* المسار */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={dashedTrack ? Math.max(2, stroke - 8) : stroke}
          strokeLinecap="round"
          strokeDasharray={dashedTrack ? "1.5 9" : undefined} />
        

        {/* القوس المكتمل */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={glow ? `url(#${glowId})` : undefined}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }} />
        
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>);

}

export default ProgressRing;