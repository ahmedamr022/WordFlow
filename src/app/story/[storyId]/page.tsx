"use client";

import React, { use, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  Volume2Icon,
  SparklesIcon,
  MicIcon,
  ChevronDownIcon,
  CheckIcon,
  SlidersHorizontalIcon,
  AlignJustifyIcon,
  PauseIcon,
  PlayIcon,
  GaugeIcon as SpeedIcon,
  ChartNoAxesColumnIcon,
  GaugeIcon,
  TargetIcon,
  PartyPopperIcon,
  RotateCcwIcon,
  ZapIcon,
} from "lucide-react";

import { getStoryById } from "@/data/stories";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { AudioService } from "@/lib/audio/audioService";

// ==========================================
// 1. VOICES & SPEEDS CONFIGURATION
// ==========================================
export interface StoryVoice {
  id: string;
  label: string;
  locale: string;
  folder: string;
}

const STORY_VOICES: StoryVoice[] = [
  { id: "voice_alice", label: "Alice (US)", locale: "en-US", folder: "voice_alice" },
  { id: "voice_sarah", label: "Sarah (UK)", locale: "en-GB", folder: "voice_sarah" },
];

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25];

// ==========================================
// 2. HELPER HOOK FOR WORD-BY-WORD HIGHLIGHT
// ==========================================
function useSentencePlayback({
  wordCount,
  autoReplay,
  playbackSpeed,
  onStart,
  onStop,
}: {
  wordCount: number;
  autoReplay: boolean;
  playbackSpeed: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const replayRef = useRef<NodeJS.Timeout | null>(null);
  const autoReplayRef = useRef(autoReplay);

  useEffect(() => {
    autoReplayRef.current = autoReplay;
  }, [autoReplay]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (replayRef.current) clearTimeout(replayRef.current);
    timerRef.current = null;
    replayRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    setActiveWordIndex(-1);
    onStop();
  }, [clearTimers, onStop]);

  const play = useCallback(() => {
    if (wordCount <= 0) return;
    clearTimers();
    onStart();
    setIsPlaying(true);
    setActiveWordIndex(0);

    let index = 0;
    const intervalTime = Math.round(380 / playbackSpeed);

    timerRef.current = setInterval(() => {
      index += 1;
      if (index >= wordCount) {
        clearTimers();
        setActiveWordIndex(-1);
        setIsPlaying(false);
        if (autoReplayRef.current) {
          replayRef.current = setTimeout(() => {
            play();
          }, 600);
        }
        return;
      }
      setActiveWordIndex(index);
    }, intervalTime);
  }, [clearTimers, onStart, wordCount, playbackSpeed]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { isPlaying, activeWordIndex, play, stop, toggle };
}

// ==========================================
// 3. UI COMPONENTS
// ==========================================

function WordFlowLogo() {
  return (
    <div dir="ltr" className="flex items-center gap-3">
      {/* 1. Text Component */}
      <span className="font-en text-[1.7rem] font-extrabold leading-none tracking-tight">
        <span className="text-white">Word</span>
        <span
          style={{
            backgroundImage: "linear-gradient(90deg,#f472b6,#fb7185)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Flow
        </span>
      </span>

      {/* 2. Logo SVG Placed Explicitly on the Left Side of Text */}
      <svg
        viewBox="0 0 48 44"
        className="h-9 w-9 shrink-0 drop-shadow-[0_0_18px_rgba(99,102,241,0.55)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wf-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="45%" stopColor="#4f7cf7" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          d="M4 4h8.6l5.4 21.5L23.4 4h5.4l5.4 21.5L39.6 4H48l-9.4 36h-8.2L26 21.4 21.6 40h-8.2L4 4z"
          fill="url(#wf-logo)"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function WordTooltip({ text, word }: { text: string; word?: any }) {
  const clean = text.replace(/[.,!?;:]$/, "");
  const suffixes = ["ing", "ed", "ly", "es", "s"];
  const suffix = suffixes.find((s) => clean.length > s.length + 2 && clean.endsWith(s)) || "";
  const stem = suffix ? clean.slice(0, clean.length - suffix.length) : clean;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      role="tooltip"
      className="pointer-events-auto w-[15rem] rounded-2xl border border-sky-400/25 bg-[#0a1020]/95 p-4 shadow-[0_20px_60px_-18px_rgba(2,8,23,0.95)] backdrop-blur-xl text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div dir="ltr" className="text-left">
          <p className="font-en text-lg font-bold text-white">
            {stem}
            {suffix && <span className="text-emerald-300">{suffix}</span>}
          </p>
          {word?.ipa && <p className="font-en mt-0.5 text-[11px] text-white/40">{word.ipa}</p>}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            AudioService.playWord(clean);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-sky-300 ring-1 ring-sky-400/30 hover:bg-indigo-500/40"
        >
          <Volume2Icon className="h-4 w-4" />
        </button>
      </div>

      {word?.partOfSpeech && (
        <div className="mt-3 flex justify-start">
          <span className="rounded-full bg-violet-500/25 px-3 py-1 text-[11px] font-bold text-violet-100 ring-1 ring-violet-400/30">
            <span className="font-en capitalize">{word.partOfSpeech}</span>
          </span>
        </div>
      )}

      <div className="mt-3 h-px w-full bg-white/10" />

      <p dir="rtl" className="mt-3 text-left text-[15px] font-bold text-sky-300">
        {word?.translationAr || "—"}
      </p>
    </motion.div>
  );
}

function SentenceDisplay({
  line,
  target,
  typed,
  levelBadge = "B1",
  activeWordIndex = -1,
}: {
  line: any;
  target: string;
  typed: string;
  levelBadge?: string;
  activeWordIndex?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const tokens = target.split(" ").map((text, index) => {
    const start = target.indexOf(text);
    return { text, start, word: line?.words?.[index] };
  });

  const cursorIndex = typed.length;
  const caretIndex = target[cursorIndex] === " " ? cursorIndex + 1 : cursorIndex;

  return (
    <div className="max-w-2xl text-left">
      <div className="inline-flex items-center gap-2.5 rounded-xl border border-sky-400/35 bg-sky-500/10 px-3.5 py-1.5 shadow-[0_0_25px_-10px_rgba(56,189,248,0.8)]">
        <SparklesIcon className="h-4 w-4 text-sky-300" />
        <span className="font-en text-sm font-bold tracking-wide text-sky-100">{levelBadge}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={line?.id || "sentence"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          <h1
            dir="ltr"
            className="font-en mt-5 flex max-w-xl flex-wrap justify-start gap-x-3.5 gap-y-3 text-left text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-[3.3rem]"
          >
            {tokens.map((token, index) => {
              const wordTyped = cursorIndex >= token.start + token.text.length;
              const isSpeaking = activeWordIndex === index;

              return (
                <span
                  key={`${line?.id || 0}-${index}`}
                  className="relative"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    type="button"
                    onClick={() => AudioService.playWord(token.text)}
                    className="cursor-pointer rounded-md focus:outline-none"
                  >
                    {token.text.split("").map((letter, letterIndex) => {
                      const globalIndex = token.start + letterIndex;
                      const isTyped = globalIndex < cursorIndex;
                      const isWrong =
                        isTyped &&
                        typed[globalIndex]?.toLowerCase() !== target[globalIndex]?.toLowerCase();
                      const isCaret = globalIndex === caretIndex;

                      return (
                        <span key={letterIndex} className="relative inline-block">
                          <span
                            className={[
                              "transition-colors duration-150",
                              isWrong
                                ? "text-rose-400"
                                : isTyped
                                ? "text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                                : isSpeaking || hovered === index
                                ? "text-slate-300"
                                : "text-slate-500/70",
                            ].join(" ")}
                          >
                            {letter}
                          </span>

                          {isCaret && (
                            <motion.span
                              layoutId={`caret-${line?.id || 0}`}
                              className="absolute -bottom-1.5 left-0 h-[4px] w-full overflow-hidden rounded-full bg-[#22d3ee]/25"
                            >
                              <motion.span
                                className="block h-full w-1/2 rounded-full bg-[#22d3ee] shadow-[0_0_14px_2px_rgba(34,211,238,0.85)]"
                                animate={{ x: ["-15%", "115%"] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                              />
                            </motion.span>
                          )}
                        </span>
                      );
                    })}
                  </button>

                  {wordTyped && (
                    <span className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-white/15" />
                  )}

                  <div className="pointer-events-none absolute bottom-[calc(100%+1rem)] left-1/2 z-30 -translate-x-1/2">
                    <AnimatePresence>
                      {hovered === index && <WordTooltip text={token.text} word={token.word} />}
                    </AnimatePresence>
                  </div>
                </span>
              );
            })}
          </h1>

          <p dir="rtl" className="mt-8 text-left text-xl font-bold text-sky-300/90 sm:text-[1.45rem]">
            {line?.arabic || line?.translationAr || ""}
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className="mt-4 h-[3px] w-14 rounded-full"
        style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#a855f7)" }}
      />
    </div>
  );
}

function AudioControls({
  voice,
  onVoiceChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
}: {
  voice: StoryVoice;
  onVoiceChange: (voice: StoryVoice) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}) {
  const [openVoice, setOpenVoice] = useState(false);
  const [openSpeed, setOpenSpeed] = useState(false);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);
  const speedDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target as Node)) {
        setOpenVoice(false);
      }
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(event.target as Node)) {
        setOpenSpeed(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-start gap-3.5">
      <button
        type="button"
        onClick={onTogglePlay}
        className="flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.75)] transition-transform hover:scale-[1.02] active:scale-[0.99]"
        style={{ backgroundImage: "linear-gradient(90deg,#4f46e5,#c026d3)" }}
      >
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        <span>{isPlaying ? "إيقاف الاستماع" : "استمع للجملة"}</span>
        <AlignJustifyIcon className={`h-4 w-4 opacity-80 ${isPlaying ? "animate-pulse" : ""}`} />
        <SlidersHorizontalIcon className="h-4 w-4 opacity-80" />
      </button>

      {/* Speed Selector */}
      <div className="relative" ref={speedDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setOpenSpeed(!openSpeed);
            setOpenVoice(false);
          }}
          className="flex items-center gap-2.5 rounded-full border border-white/12 bg-black/45 px-5 py-3 text-sm font-bold text-white/90 transition-colors hover:border-white/25 hover:bg-black/60"
        >
          <SpeedIcon className="h-4 w-4 text-[#22d3ee]" />
          <span>السرعة: {playbackSpeed}x</span>
          <ChevronDownIcon className={`h-3.5 w-3.5 text-white/50 transition-transform ${openSpeed ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {openSpeed && (
            <motion.ul
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 z-40 mb-3.5 w-36 overflow-hidden rounded-2xl border border-white/15 bg-[#090e1b]/90 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              {PLAYBACK_SPEEDS.map((speed) => (
                <li key={speed}>
                  <button
                    type="button"
                    onClick={() => {
                      onSpeedChange(speed);
                      setOpenSpeed(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                      playbackSpeed === speed
                        ? "bg-white/15 text-[#22d3ee]"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <span>{speed}x</span>
                    {playbackSpeed === speed && <CheckIcon className="h-3.5 w-3.5 text-[#22d3ee]" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Dropdown */}
      <div className="relative" ref={voiceDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setOpenVoice(!openVoice);
            setOpenSpeed(false);
          }}
          className="flex items-center gap-3 rounded-full border border-white/12 bg-black/45 py-2.5 pl-3 pr-4 text-sm text-white transition-colors hover:border-white/25 hover:bg-black/60"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
            <MicIcon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-en font-semibold">{voice.label}</span>
          <ChevronDownIcon className={`h-4 w-4 text-white/50 transition-transform ${openVoice ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {openVoice && (
            <motion.ul
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 z-40 mb-3.5 w-48 overflow-hidden rounded-2xl border border-white/15 bg-[#090e1b]/90 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              {STORY_VOICES.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onVoiceChange(option);
                      setOpenVoice(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                      option.id === voice.id
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-en flex items-center gap-2 font-semibold">
                      {option.id === voice.id && <CheckIcon className="h-3.5 w-3.5 text-[#22d3ee]" />}
                      {option.label}
                    </span>
                    <span className="font-en text-[10px] opacity-50">{option.locale}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TypingStats({
  currentLineIndex,
  totalLines,
  metrics,
}: {
  currentLineIndex: number;
  totalLines: number;
  metrics: any;
}) {
  const current = Math.min(currentLineIndex + 1, totalLines);
  const percent = totalLines > 0 ? Math.round((current / totalLines) * 100) : 0;

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-white/10 bg-[#090e1b]/55 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-8">
      <div className="flex-1 text-left">
        <div className="flex items-center justify-start gap-2 text-[13px] font-bold text-white/80">
          <ChartNoAxesColumnIcon className="h-4 w-4 text-[#22d3ee]" />
          <span>تقدمك في هذه القصة</span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="font-en text-2xl font-bold text-white">{percent}%</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#a855f7)" }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <span className="whitespace-nowrap text-xs text-white/50">
            السطر {current} من {totalLines}
          </span>
        </div>

        {metrics && (
          <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-white/45">
            <span className="flex items-center gap-1.5">
              <GaugeIcon className="h-3.5 w-3.5 text-white/35" />
              <span className="font-en">{metrics.wpm || 0}</span> كلمة/د
            </span>
            <span className="flex items-center gap-1.5">
              <TargetIcon className="h-3.5 w-3.5 text-white/35" />
              دقة <span className="font-en">{metrics.accuracy || 0}%</span>
            </span>
          </div>
        )}
      </div>

      <span className="hidden h-16 w-px bg-white/10 sm:block" />

      <div className="flex items-center gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-300/20">
          <SparklesIcon className="h-4 w-4 text-amber-300" />
        </span>
        <div className="text-left">
          <p className="text-sm font-bold text-white">استمر! أنت تقوم بعمل رائع</p>
          <p className="mt-1 text-xs text-white/50">كل يوم تقرأ، عقلك يتطور أكثر.</p>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================

export default function StoryPage({ params }: { params: Promise<{ id?: string; storyId?: string }> }) {
  const resolvedParams = use(params);
  const storyId = resolvedParams?.storyId || resolvedParams?.id || "";
  const router = useRouter();

  const story = getStoryById(storyId);

  const [voice, setVoice] = useState<StoryVoice>(STORY_VOICES[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoReplay, setAutoReplay] = useState(false);

  const {
    currentLineIndex,
    currentLine,
    targetText,
    typedChars,
    metrics,
    inputRef,
    handleInputChange,
    handleKeyDown,
    focusInput,
    resetLine,
    restart,
    goNext,
    goPrev,
    isCompleted,
  } = useTypingEngine({
    lines: story?.lines || [],
  });

  useEffect(() => {
    if (story) {
      AudioService.setStory(story.id);
      AudioService.setVoiceFolder(voice.folder);
    }
  }, [story, voice]);

  const lineId = currentLineIndex + 1;
  const wordCount = targetText ? targetText.split(" ").filter(Boolean).length : 0;

  const startAudio = useCallback(() => {
    AudioService.playSentence(lineId);
  }, [lineId]);

  const stopAudio = useCallback(() => {
    AudioService.stop();
  }, []);

  const { isPlaying, activeWordIndex, play, toggle, stop } = useSentencePlayback({
    wordCount,
    autoReplay,
    playbackSpeed,
    onStart: startAudio,
    onStop: stopAudio,
  });

  // 1. تشغيل الصوت أوتوماتيكياً بعد ثانية واحدة (1000ms) من بداية القصة أو الانتقال لكل سطر
  useEffect(() => {
    const timer = setTimeout(() => {
      play();
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [currentLineIndex, play, stop]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "\\") {
        event.preventDefault();
        toggle();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrev();
        return;
      }
      handleKeyDown(event);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, handleKeyDown, toggle]);

  if (!story) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#04070f] text-white">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">القصة غير موجودة</h1>
          <button
            onClick={() => router.push("/stories")}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 font-medium hover:bg-cyan-500"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            العودة لصفحة القصص
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#04070f] text-white" dir="ltr">
      {/* Background Artwork */}
      <img
        src={story.bgImage || "/images/backgrounds/ship.png"}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right sm:object-center"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(3,5,12,0.92) 0%, rgba(3,5,12,0.75) 35%, rgba(3,5,12,0.2) 65%, rgba(3,5,12,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,5,12,0.4) 0%, rgba(3,5,12,0) 25%, rgba(3,5,12,0.5) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header Bar */}
        <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
          <button
            type="button"
            onClick={() => router.push("/stories")}
            className="flex items-center gap-3 rounded-2xl border border-white/25 bg-[#060b16]/70 px-5 py-3 text-[15px] font-bold text-white hover:border-sky-300/50 hover:bg-[#0a1424]/80"
          >
            <BookOpenIcon className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
            <span>جميع القصص</span>
          </button>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <WordFlowLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push("/stories")}
            className="group flex items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-white/70 hover:text-white"
          >
            <span>العودة إلى القصص</span>
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        </header>

        {/* Main Interface */}
        <main
          className="flex flex-1 flex-col px-6 pb-8 sm:px-10 lg:pl-16"
          onClick={focusInput}
        >
          <input
            ref={inputRef}
            type="text"
            value={typedChars}
            onChange={handleInputChange}
            className="sr-only"
            autoFocus
          />

          <div className="flex flex-col items-start gap-9 pt-10 lg:pt-[9vh]">
            <SentenceDisplay
              line={currentLine}
              target={targetText}
              typed={typedChars}
              levelBadge={story.cefrLevel || "B1"}
              activeWordIndex={activeWordIndex}
            />

            <AudioControls
              voice={voice}
              onVoiceChange={setVoice}
              isPlaying={isPlaying}
              onTogglePlay={toggle}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />

            <TypingStats
              currentLineIndex={currentLineIndex}
              totalLines={story.lines?.length || 0}
              metrics={metrics}
            />
          </div>

          <div className="mt-auto pt-14">
            <div className="mx-auto flex w-fit flex-wrap items-center justify-center rounded-full border border-white/10 bg-[#090e1b]/55 px-2 py-1.5 backdrop-blur-xl">
              {isCompleted ? (
                <button
                  type="button"
                  onClick={restart}
                  className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/15"
                >
                  <PartyPopperIcon className="h-3.5 w-3.5 text-amber-300" />
                  <span>أنهيت القصة! ابدأ من جديد</span>
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65">
                    <ZapIcon className="h-3.5 w-3.5 text-[#22d3ee]" />
                    <span>اختصار سريع: اضغط</span>
                    <kbd className="font-en rounded-md border border-white/15 bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/85">
                      \
                    </kbd>
                  </div>

                  <span className="mx-1 h-5 w-px bg-white/12" />

                  <button
                    type="button"
                    onClick={resetLine}
                    className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white/70 hover:text-white"
                  >
                    <RotateCcwIcon className="h-3.5 w-3.5 text-white/50" />
                    <span>إعادة السطر</span>
                  </button>

                  <span className="mx-1 h-5 w-px bg-white/12" />

                  <button
                    type="button"
                    onClick={() => setAutoReplay((value) => !value)}
                    className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold ${
                      autoReplay ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    <RotateCcwIcon className={`h-3.5 w-3.5 ${autoReplay ? "text-[#22d3ee]" : "text-white/50"}`} />
                    <span>إعادة الصوت تلقائياً</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}