"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Play,
  BookText,
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  Rocket,
  type LucideIcon,
} from "lucide-react";

const C = {
  card: "#0B0F1C",
  chip: "#0F1526",
  border: "rgba(255,255,255,0.07)",
  cyan: "#22E0C8",
  gold: "#FBBF24",
};

const LEVEL_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  A1: { text: "#6EE7B7", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.40)" },
  A2: { text: "#6EE7B7", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.40)" },
  B1: { text: "#7DD3FC", bg: "rgba(34,211,238,0.15)", border: "rgba(34,211,238,0.40)" },
  B2: { text: "#C4B5FD", bg: "rgba(124,108,255,0.18)", border: "rgba(124,108,255,0.42)" },
};
const levelStyle = (lvl: string) => LEVEL_STYLES[lvl] ?? LEVEL_STYLES.B1;

export interface ReaderStory {
  id: string;
  playableId?: string | null;
  title: string;
  titleAr: string;
  level: string;
  duration: string;
  cover: string;
  progress?: number;
  words?: number;
  rating?: number;
  descriptionEn?: string;
}

const LEARN: { label: string; value: string; icon: LucideIcon; color: string; bg: string }[] = [
  { label: "كلمة جديدة", value: "90", icon: BookText, color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
  { label: "قواعد نحوية", value: "12", icon: BookOpen, color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  { label: "استماع وتدريب", value: "", icon: Headphones, color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  { label: "نطق وإلقاء", value: "", icon: Mic, color: "#FF4D7A", bg: "rgba(255,77,122,0.12)" },
  { label: "كتابة وتحسين", value: "", icon: PenLine, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
];

const ACHIEVEMENTS: { label: string; icon: LucideIcon; color: string; bg: string; border: string }[] = [
  { label: "إكمال القصة", icon: Trophy, color: "#FBBF24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)" },
  { label: "دقة 100%", icon: ShieldCheck, color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.30)" },
  { label: "بدون أخطاء", icon: ShieldAlert, color: "#FF6B6B", bg: "rgba(255,107,107,0.10)", border: "rgba(255,107,107,0.30)" },
  { label: "سرعة عالية", icon: Rocket, color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.30)" },
];

export function StoryReader({ story, onClose }: { story: ReaderStory; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const progress = story.progress ?? 0;
  const words = story.words ?? 245;
  const rating = story.rating ?? 4.9;
  const lvl = levelStyle(story.level);
  const description =
    story.descriptionEn ??
    "An interactive story designed to build your vocabulary and typing fluency line by line.";
  const isLong = description.length > 160;
  const shownDescription = expanded || !isLong ? description : `${description.slice(0, 160).trim()}…`;

  const stats = [
    { value: story.level, label: "المستوى", accent: lvl.text },
    { value: String(words), label: "كلمة", accent: "#fff" },
    { value: story.duration, label: "المدة", accent: "#fff" },
    { value: rating.toFixed(1), label: "", accent: "#fff", stars: true },
  ];

  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      style={{ perspective: "1400px" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      dir="rtl"
    >
        {/* blurred overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(2,4,10,0.72)",
            backdropFilter: "blur(16px) saturate(1.2)",
            WebkitBackdropFilter: "blur(16px) saturate(1.2)",
          }}
        />

        {/* 3D card */}
        <motion.div
          key="card"
          role="dialog"
          aria-modal="true"
          aria-label={story.title}
          initial={{ opacity: 0, scale: 0.82, rotateX: 12, y: 48 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, rotateX: -6, y: 24 }}
          transition={{ type: "spring", damping: 28, stiffness: 340, mass: 0.85 }}
          className="relative w-full max-w-[420px] max-h-[92vh] flex flex-col rounded-[28px] overflow-hidden border"
          style={{
            background: C.card,
            borderColor: "rgba(255,255,255,0.10)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px -12px rgba(0,0,0,0.85), 0 0 60px -10px rgba(124,58,237,0.25)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* header bar */}
          <div
            className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b"
            style={{ borderColor: C.border, background: "rgba(9,13,22,0.95)" }}
            dir="ltr"
          >
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}` }}
              aria-label="إغلاق"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[15px] font-black text-white" dir="rtl">
              تفاصيل القصة
            </span>
            <span className="w-9" aria-hidden />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
            {/* cover */}
            <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden border border-white/[0.08]">
              <img
                src={story.cover || "/placeholder.svg"}
                alt={story.title}
                className="w-full h-[200px] object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(0deg,rgba(11,15,28,0.5) 0%,transparent 50%)" }}
              />
            </div>

            <div className="px-5 sm:px-6 pb-5 pt-4">
              <h2 className="text-center text-[22px] font-black text-white tracking-tight leading-tight" dir="ltr">
                {story.title}
              </h2>
              <p className="text-center text-[14px] font-bold text-slate-400 mt-1">{story.titleAr}</p>

              {/* stats */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl"
                    style={{ background: C.chip, border: `1px solid ${C.border}` }}
                  >
                    {s.stars ? (
                      <>
                        <span className="text-[16px] font-black text-white leading-none">{s.value}</span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, k) => (
                            <Star key={k} size={8} className="fill-current" style={{ color: C.gold }} strokeWidth={0} />
                          ))}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[15px] font-black leading-none" style={{ color: s.accent }} dir="ltr">
                          {s.value}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{s.label}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* description */}
              <p className="mt-4 text-[13px] leading-[1.85] font-medium text-slate-300" dir="ltr">
                {shownDescription}
                {isLong && !expanded && (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="mr-1 text-cyan-400 font-bold hover:text-cyan-300 transition"
                  >
                    المزيد...
                  </button>
                )}
              </p>

              <div className="my-5 h-px w-full" style={{ background: C.border }} />

              {/* learn */}
              <h3 className="text-center text-[14px] font-black text-white mb-3">ستتعلم في هذه القصة</h3>
              <div className="grid grid-cols-5 gap-2">
                {LEARN.map((l) => {
                  const Icon = l.icon;
                  return (
                    <div
                      key={l.label}
                      className="flex flex-col items-center gap-1.5 py-2.5 px-0.5 rounded-xl"
                      style={{ background: C.chip, border: `1px solid ${C.border}` }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: l.bg, color: l.color }}
                      >
                        <Icon size={16} />
                      </span>
                      {l.value && <span className="text-[13px] font-black text-white leading-none">{l.value}</span>}
                      <span className="text-[9px] font-bold text-slate-400 text-center leading-tight">{l.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-black text-white">التقدم</span>
                  <span className="text-[11px] font-bold text-slate-500">
                    <span dir="ltr">{progress}%</span> مكتمل
                  </span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden bg-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-y-0 right-0 rounded-full"
                    style={{ background: "linear-gradient(270deg,#22E0C8,#3b82f6,#a855f7)" }}
                  />
                </div>
              </div>

              {/* achievements */}
              <h3 className="mt-5 text-center text-[14px] font-black text-white mb-3">
                إنجازات يمكنك الحصول عليها
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {ACHIEVEMENTS.map((a) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={a.label}
                      className="flex flex-col items-center gap-1.5 py-3 px-0.5 rounded-xl"
                      style={{ background: a.bg, border: `1px solid ${a.border}` }}
                    >
                      <Icon size={20} style={{ color: a.color }} />
                      <span className="text-[10px] font-bold text-slate-200 text-center leading-tight">{a.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            className="shrink-0 px-5 py-4 border-t"
            style={{ borderColor: C.border, background: "rgba(9,13,22,0.92)" }}
          >
            {story.playableId ? (
              <Link
                href={`/story/${story.playableId}`}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[16px] font-black text-white transition hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(90deg,#c026d3,#7c3aed,#2563eb)",
                  boxShadow: "0 14px 36px -10px rgba(124,58,237,0.55)",
                }}
              >
                <Play size={17} className="fill-current" />
                {progress > 0 ? "متابعة القصة" : "ابدأ القصة"}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[16px] font-black text-slate-500 cursor-not-allowed"
                style={{ background: C.chip, border: `1px solid ${C.border}` }}
              >
                قريباً — المحتوى قيد الإعداد
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
}
