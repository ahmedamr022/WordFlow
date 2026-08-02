"use client";

import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
  padding = "md",
  ...props
}: GlassCardProps) {
  const paddingClass = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }[padding];

  return (
    <div
      {...props}
      className={[
        "relative overflow-hidden rounded-[28px]",
        "border border-white/10",
        "bg-white/[0.035]",
        "backdrop-blur-2xl",
        "shadow-[0_20px_80px_rgba(0,0,0,.35)]",
        "transition-all duration-500",
        paddingClass,
        hover &&
          "hover:-translate-y-1 hover:scale-[1.015] hover:border-cyan-400/30 hover:bg-white/[0.045]",
        className,
      ].join(" ")}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-fuchsia-500/5 to-transparent" />
      )}

      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}