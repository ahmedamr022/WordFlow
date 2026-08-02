"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Story } from "@/types";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { SentenceDisplay } from "./SentenceDisplay";
import { AudioControls } from "./AudioControls";
import { TypingStats } from "./TypingStats";
import { GrammarExplainer } from "../ai/GrammarExplainer";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { UserStatsService } from "@/lib/userStats";
import { CheckCircle2, ArrowRight, RotateCcw, Home, Keyboard } from "lucide-react";
import Link from "next/link";

interface TypingEngineProps {
  story: Story;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({ story }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [storyCompleted, setStoryCompleted] = useState(false);

  const currentLine = story.lines[lineIndex];

  const handleNextLine = () => {
    if (lineIndex + 1 < story.lines.length) {
      setLineIndex((prev) => prev + 1);
    } else {
      setStoryCompleted(true);
      UserStatsService.recordStoryCompletion(story.id, story.totalWords, 50);
    }
  };

  const {
    inputRef,
    typedChars,
    errors,
    currentIndex,
    handleInputChange,
    focusInput,
    metrics,
  } = useTypingEngine({
    currentLine,
    onLineComplete: handleNextLine,
  });

  // Set story ID on AudioService for pre-generated audio files
  useEffect(() => {
    AudioService.setStory(story.id);
  }, [story.id]);

  // Global Keyboard Shortcut \ to replay sentence audio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "\\") {
        e.preventDefault();
        AudioService.playSentence(currentLine.id, 1.0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLine]);

  // Play audio automatically on line load with 2-second delay buffer
  useEffect(() => {
    if (!storyCompleted) {
      const timer = setTimeout(() => {
        AudioService.playSentence(currentLine.id, 1.0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentLine, storyCompleted]);

  // Story Completion View matching WordFlow Brand Identity
  if (storyCompleted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 font-arabic dir-rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl glass-card rounded-3xl p-8 sm:p-12 border border-[#2de2c5]/40 shadow-2xl text-center space-y-8 relative overflow-hidden bg-gradient-to-b from-[#2de2c5]/10 via-transparent to-[#ff6b6b]/10"
        >
          {/* Animated Glowing Conic Ring Icon */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2de2c5] to-[#ff6b6b] blur-lg opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-[#09090B] border-2 border-[#2de2c5] p-2 flex items-center justify-center shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-[#2de2c5]" />
            </div>
          </div>

          {/* Heading & Story Details */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              إنجاز رائع! أتممت القصة بنجاح
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              لقد أنهيت قصة <span className="text-[#2de2c5] font-bold">"{story.titleAr}"</span> بنجاح، وأضفت <span className="text-[#ff6b6b] font-bold font-mono">+{story.totalWords}</span> كلمة جديدة إلى حصيلتك اللغوية.
            </p>
          </div>

          {/* 4 Metrics Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="block text-2xl sm:text-3xl font-black font-mono text-[#2de2c5]">
                {metrics.wpm}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                سرعة الكتابة WPM
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="block text-2xl sm:text-3xl font-black font-mono text-[#ff6b6b]">
                {metrics.accuracy}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                الدقة ACC
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="block text-2xl sm:text-3xl font-black font-mono text-amber-400">
                +50
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                نقاط الخبرة XP
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="block text-2xl sm:text-3xl font-black font-mono text-[#2de2c5]">
                +{story.totalWords}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                كلمات مكتسبة
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setLineIndex(0);
                setStoryCompleted(false);
              }}
              className="px-6 py-3.5 rounded-full text-xs font-bold text-slate-200 btn-ghost flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 text-[#2de2c5]" />
              <span>إعادة القصة مرة أخرى</span>
            </button>

            <Link
              href="/paths"
              className="px-8 py-3.5 rounded-full text-xs font-black text-white btn-neon flex items-center justify-center gap-2 w-full sm:w-auto shadow-2xl"
            >
              <Home className="w-4 h-4 text-white" />
              <span>العودة لمسارات التعلم</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      onClick={focusInput}
      className="flex flex-col items-center justify-between min-h-[75vh] py-6 px-4 max-w-4xl mx-auto cursor-text relative"
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-50 pointer-events-none w-0 h-0"
        onChange={handleInputChange}
        autoFocus
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* SINGLE CLEAN TOP BAR - NO DUPLICATE BACK BUTTON */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-4 dir-rtl font-arabic">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-slate-800 text-xs font-bold text-sky-400 border border-sky-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمسارات</span>
        </Link>

        <div className="text-left dir-ltr">
          <h1 className="text-xl font-bold text-white font-sans">{story.title}</h1>
          <span className="text-xs text-sky-400 font-mono">مستوى {story.cefrLevel}</span>
        </div>
      </div>

      {/* Sentence & Audio Display */}
      <div className="w-full my-auto">
        <SentenceDisplay
          currentLine={currentLine}
          typedChars={typedChars}
          errors={errors}
          currentIndex={currentIndex}
        />
        <AudioControls lineId={currentLine.id} />
        <GrammarExplainer sentenceText={currentLine.text} />
      </div>

      {/* Bottom Live Typing Stats & Floating Keyboard Shortcut Banner */}
      <div className="w-full mt-auto space-y-3">
        <TypingStats
          metrics={metrics}
          currentLineIndex={lineIndex}
          totalLines={story.totalLines}
        />

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-arabic bg-slate-900/60 py-2 px-4 rounded-full border border-slate-800/80 w-fit mx-auto">
          <Keyboard className="w-3.5 h-3.5 text-sky-400" />
          <span>اختصار سريع: اضغط</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-[11px] text-sky-400 dir-ltr font-bold">
            \
          </kbd>
          <span>في أي وقت لإعادة الصوت تلقائياً</span>
        </div>
      </div>
    </div>
  );
};
