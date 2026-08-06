"use client";

import React from 'react';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  withMark?: boolean;
  withTagline?: boolean;
  className?: string;
};

const TEXT_SIZE = {
  sm: 'text-[18px]',
  md: 'text-[23px]',
  lg: 'text-[29px]'
} as const;

const MARK_SIZE = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-[52px] w-[52px]'
} as const;

const TAGLINE_SIZE = {
  sm: 'text-[9px]',
  md: 'text-[10.5px]',
  lg: 'text-[11.5px]'
} as const;

/** The WordFlow mark: a gradient tile holding a stylised "W" that flows into a wave. */
function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`group/mark relative grid shrink-0 place-items-center overflow-hidden rounded-[14px] ${className}`}
      style={{
        background:
          "linear-gradient(145deg, #0f172a 0%, #111827 30%, #1e1b4b 100%)",
        boxShadow:
          "0 10px 30px -10px rgba(99,102,241,.45), inset 0 1px 0 rgba(255,255,255,.08)",
      }}
    >
      {/* Glow */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,.12), transparent 45%)",
        }}
      />

      {/* Gloss */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,.12), transparent 45%)",
        }}
      />

      <svg
        width="70%"
        height="70%"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="logo-w-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="50%" stopColor="#7000FF" />
            <stop offset="100%" stopColor="#FF007B" />
          </linearGradient>
        </defs>

        <path
          d="M6 10L14 30L20 17L26 30L34 10"
          stroke="url(#logo-w-gradient)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  size = 'md',
  withMark = true,
  withTagline = true,
  className = ''
}: LogoProps) {
  return (
    <a
      href="#hero"
      dir="ltr"
      aria-label="WordFlow — الصفحة الرئيسية"
      className={`wf-focus group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      
      {withMark && <LogoMark className={MARK_SIZE[size]} />}

      <span className="flex flex-col items-start leading-none">
        <span
          className={`wf-font-en font-extrabold leading-none tracking-[-0.02em] ${TEXT_SIZE[size]}`}>
          
          <span className="text-white">Word</span>
          <span className="wf-gradient-text">Flow</span>
        </span>
        {withTagline &&
        <span
          dir="rtl"
          className={`mt-[6px] font-semibold leading-none tracking-wide ${TAGLINE_SIZE[size]}`}
          style={{ color: '#2DE2C5' }}>
          
            منصة تعلم اللغة الإنجليزية
          </span>
        }
      </span>
    </a>);

}