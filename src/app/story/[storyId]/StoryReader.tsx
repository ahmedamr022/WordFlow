"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CornerUpLeftIcon,
  PartyPopperIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  ZapIcon } from
"lucide-react";

import { useTypingEngine, type LineCompleteInfo } from "@/hooks/useTypingEngine";
import { AudioService } from "@/lib/audio/audioService";
import { positionPercent } from "@/lib/stories/percent";
import { setGlobalPlaybackRate } from "@/lib/audio/playbackRate";
import { imageStyle, surfaceImage } from "@/lib/stories/appearance";
import {
  getStoryPositionAction,
  saveStoryPositionAction,
  type StoryPosition } from
"@/app/actions/storyPosition";
import {
  submitLineAttemptBySlugAction,
  completeStoryBySlugAction } from
"@/app/actions/storyProgress";

import { WordFlowLogo } from "@/components/story/WordFlowLogo";
import { SentenceDisplay } from "@/components/story/SentenceDisplay";
import {
  AudioControls,
  STORY_VOICES,
  type StoryVoice } from
"@/components/story/AudioControls";
import { TypingStats, type SaveState } from "@/components/story/TypingStats";
import { LockedStoryScreen } from "@/components/stories/LockedStoryOverlay";
import type { SurfaceAppearance } from "@/types/admin";
import type { StoryLine } from "@/types";

/**
 * قارئ القصة.
 *
 * ── ما تغيّر ─────────────────────────────────────────────────────────────────
 * ١) **القصة تأتي props من السيرفر** (`page.tsx`) بدل `getStoryById()` من الملف
 *    الثابت. لذلك أي قصة ينشرها الأدمن لها صفحة قراءة كاملة تماماً كتايتنك.
 *
 * ٢) **لا تشغيل صوت تلقائي.** كان هناك `setTimeout(play, 1000)` يعمل مع كل
 *    جملة، وتظليل الصوت كان يمرّ على الكلمات كلمة كلمة ⇒ «أنيميشن» يشتّت
 *    القارئ قبل أن يكتب حرفاً. الآن الاستماع بضغطة زر (أو `\`) فقط.
 *
 * ٣) **تنبيه تصحيح واضح**: لو مُلئت الجملة وفيها أحرف خطأ، القارئ يشرح للمستخدم
 *    أن السطر لن ينتقل حتى يصحّح — بدل الانتقال بجملة ناقصة كما كان يحدث.
 */

export interface ReaderStory {
  id: string;
  title: string;
  titleAr: string;
  cefrLevel: string;
  background: string;
  lines: StoryLine[];
  appearance: SurfaceAppearance;
  access: {locked: boolean;lockType: "hidden" | "visible";lockMessage: string;};
}

// ==========================================
// تظليل الكلمة المنطوقة (يدوي فقط)
// ==========================================
function useSentencePlayback({
  wordCount,
  playbackSpeed,
  onStart,
  onStop





}: {wordCount: number;playbackSpeed: number;onStart: () => void;onStop: () => void;}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
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
        return;
      }
      setActiveWordIndex(index);
    }, intervalTime);
  }, [clearTimers, onStart, wordCount, playbackSpeed]);

  const toggle = useCallback(() => {
    if (isPlaying) stop();else
    play();
  }, [isPlaying, play, stop]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { isPlaying, activeWordIndex, play, stop, toggle };
}

// ==========================================
// القارئ
// ==========================================
export function StoryReader({ story }: {story: ReaderStory;}) {
  const router = useRouter();
  const storyId = story.id;

  const lines = useMemo(() => story.lines ?? [], [story.lines]);
  const totalLines = lines.length;

  const [voice, setVoice] = useState<StoryVoice>(STORY_VOICES[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    setGlobalPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  // ── استئناف القراءة ────────────────────────────────────────────────────────
  const [hydrated, setHydrated] = useState(false);
  const [savedLinesCompleted, setSavedLinesCompleted] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [xpFlash, setXpFlash] = useState<{amount: number;label: string;} | null>(null);
  const savedPositionRef = useRef<StoryPosition | null>(null);
  const badgeTimer = useRef<number | null>(null);
  const xpTimer = useRef<number | null>(null);
  const lastPersistedIndex = useRef<number | null>(null);

  const flashXp = useCallback((amount: number, label: string) => {
    if (amount <= 0) return;
    setXpFlash({ amount, label });
    if (xpTimer.current) window.clearTimeout(xpTimer.current);
    xpTimer.current = window.setTimeout(() => setXpFlash(null), 2600);
  }, []);

  const persistPosition = useCallback(
    async (input: {
      lineIndex: number;
      linesCompleted: number;
      accuracy?: number | null;
      wpm?: number | null;
      seconds?: number;
      completed?: boolean;
      indexSource?: "auto" | "manual" | "reset";
    }) => {
      if (!storyId || totalLines === 0) return;
      setSaveState("saving");
      const result = await saveStoryPositionAction({
        storySlug: storyId,
        lineIndex: input.lineIndex,
        linesCompleted: input.linesCompleted,
        totalLines,
        accuracy: input.accuracy ?? null,
        wpm: input.wpm ?? null,
        secondsSpent: input.seconds ?? 0,
        completed: input.completed ?? false,
        indexSource: input.indexSource ?? "auto"
      });

      setSaveState(result.ok ? "saved" : "error");
      if (badgeTimer.current) window.clearTimeout(badgeTimer.current);
      badgeTimer.current = window.setTimeout(
        () => setSaveState("idle"),
        result.ok ? 1600 : 3200
      );
    },
    [storyId, totalLines]
  );

  useEffect(
    () => () => {
      if (badgeTimer.current) window.clearTimeout(badgeTimer.current);
      if (xpTimer.current) window.clearTimeout(xpTimer.current);
    },
    []
  );

  const cefrLevel = story.cefrLevel.toUpperCase();

  /** التقدّم الحقيقي: محاولة السطر ثم إنهاء القصة عند آخر جملة. */
  const persistProgress = useCallback(
    async (info: LineCompleteInfo) => {
      if (!storyId) return;

      const level = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(cefrLevel) ?
      cefrLevel :
      undefined;

      const attempt = await submitLineAttemptBySlugAction({
        storySlug: storyId,
        storyTitleEn: story.title,
        storyTitleAr: story.titleAr || undefined,
        cefrLevel: level,
        lineIndex: info.lineIndex,
        lineText: info.lineText,
        translationAr: lines[info.lineIndex]?.translationAr || undefined,
        wpm: info.lineWpm,
        accuracy: info.lineAccuracy,
        correctChars: info.lineCorrectChars,
        incorrectChars: info.lineIncorrectChars,
        seconds: Math.max(info.lineSeconds, 0.5)
      });

      if (attempt.ok) {
        const xpAwarded = attempt.data?.xp_awarded ?? 0;
        if (xpAwarded > 0) flashXp(xpAwarded, "جملة صحيحة");
      } else {
        setSaveState("error");
      }

      if (info.isLast) {
        const done = await completeStoryBySlugAction({
          storySlug: storyId,
          storyTitleEn: story.title,
          storyTitleAr: story.titleAr || undefined,
          cefrLevel: level
        });

        if (done.ok) {
          const xpAwarded = done.data?.xp_awarded ?? 0;
          if (xpAwarded > 0) flashXp(xpAwarded, "أنهيت القصة!");
        }

        router.refresh();
      }
    },
    [storyId, story.title, story.titleAr, cefrLevel, lines, flashXp, router]
  );

  const handleLineComplete = useCallback(
    (info: LineCompleteInfo) => {
      const linesCompleted = Math.max(savedLinesCompleted, info.lineIndex + 1);
      setSavedLinesCompleted(linesCompleted);

      lastPersistedIndex.current = info.nextLineIndex;

      void persistPosition({
        lineIndex: info.nextLineIndex,
        linesCompleted,
        accuracy: info.accuracy,
        wpm: info.wpm,
        seconds: info.lineSeconds,
        completed: info.isLast
      });

      void persistProgress(info);
    },
    [persistPosition, persistProgress, savedLinesCompleted]
  );

  const {
    currentLineIndex,
    currentLine,
    targetText,
    typedChars,
    cells,
    metrics,
    inputRef,
    handleInputChange,
    handleKeyDown,
    focusInput,
    resetLine,
    restart,
    goToLine,
    goNext,
    goPrev,
    isCompleted,
    isLineFilled,
    lineErrorCount
  } = useTypingEngine({ lines, onLineComplete: handleLineComplete });

  // قراءة الموقع المحفوظ مرة واحدة ثم القفز إليه.
  useEffect(() => {
    if (!storyId || totalLines === 0) return;
    let cancelled = false;

    (async () => {
      const position = await getStoryPositionAction(storyId);
      if (cancelled) return;
      savedPositionRef.current = position;

      let target = 0;
      if (position) {
        setSavedLinesCompleted(Math.min(position.linesCompleted, totalLines));
        target = position.completed ?
        0 :
        Math.min(Math.max(position.lineIndex, 0), totalLines - 1);
      }

      lastPersistedIndex.current = target;
      if (target > 0) goToLine(target);
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [storyId, totalLines, goToLine]);

  // حفظ الموقع عند التنقل اليدوي بين الجُمل (بعد الاستئناف فقط).
  useEffect(() => {
    if (!hydrated || totalLines === 0) return;
    const previous = lastPersistedIndex.current;
    if (previous === currentLineIndex) return;

    const indexSource: "auto" | "manual" =
    previous !== null && currentLineIndex < previous ? "manual" : "auto";
    lastPersistedIndex.current = currentLineIndex;

    const timer = window.setTimeout(() => {
      void persistPosition({
        lineIndex: currentLineIndex,
        linesCompleted: Math.max(savedLinesCompleted, currentLineIndex),
        indexSource
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [hydrated, currentLineIndex, totalLines, savedLinesCompleted, persistPosition]);

  useEffect(() => {
    AudioService.setStory(storyId);
    AudioService.setVoiceFolder(voice.folder);
  }, [storyId, voice]);

  const lineId = currentLineIndex + 1;
  const wordCount = targetText ? targetText.split(" ").filter(Boolean).length : 0;

  const startAudio = useCallback(() => {
    AudioService.playSentence(lineId);
  }, [lineId]);

  const stopAudio = useCallback(() => {
    AudioService.stop();
  }, []);

  const { isPlaying, activeWordIndex, toggle, stop } = useSentencePlayback({
    wordCount,
    playbackSpeed,
    onStart: startAudio,
    onStop: stopAudio
  });

  // لا تشغيل تلقائي — نوقف الصوت فقط عند تغيير الجملة.
  useEffect(() => {
    return () => stop();
  }, [currentLineIndex, stop]);

  const handleRestart = useCallback(() => {
    restart();
    lastPersistedIndex.current = 0;
    setSavedLinesCompleted(0);
    void persistPosition({ lineIndex: 0, linesCompleted: 0, indexSource: "reset" });
  }, [persistPosition, restart]);

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

  const linesCompleted = Math.max(savedLinesCompleted, currentLineIndex);
  const percent = isCompleted ? 100 : positionPercent(linesCompleted, totalLines);
  const needsFixing = isLineFilled && lineErrorCount > 0;

  // قصة مقفولة: لا نسمح بالقراءة حتى لو فتح الرابط مباشرة.
  if (story.access.locked) {
    return (
      <LockedStoryScreen
        titleEn={story.title}
        titleAr={story.titleAr}
        message={story.access.lockMessage || "هذه القصة غير متاحة حالياً"}
        onBack={() => router.push("/stories")} />);

  }

  if (totalLines === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#04070f] px-6 text-white">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center" dir="rtl">
          <h1 className="text-2xl font-bold">هذه القصة بلا جُمل بعد</h1>
          <p className="text-sm text-slate-400">
            أُنشئت القصة لكن لم تُضَف جُملها. أضِفها من لوحة التحكم ← الاستوديو ←
            تبويب «الجُمل» ثم انشر.
          </p>
          <button
            onClick={() => router.push("/stories")}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 font-medium hover:bg-cyan-500">

            <ArrowLeftIcon className="h-5 w-5" />
            العودة لصفحة القصص
          </button>
        </div>
      </div>);

  }

  const pageSurface = story.appearance;
  const backgroundSrc = surfaceImage(pageSurface, story.background);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#04070f] text-white" dir="ltr">
      {/* خلفية القصة — كل قيمها (الموضع، التكبير، الإضاءة، التعتيم) من الاستوديو */}
      <img
        src={backgroundSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={imageStyle(pageSurface)} />


      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(90deg, rgba(3,5,12,${(
          0.62 + pageSurface.overlay / 100 * 0.34).
          toFixed(3)}) 0%, rgba(3,5,12,${(0.45 + pageSurface.overlay / 100 * 0.3).toFixed(
            3
          )}) 35%, rgba(3,5,12,0.2) 65%, rgba(3,5,12,0) 100%)`
        }} />


      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
          "linear-gradient(180deg, rgba(3,5,12,0.4) 0%, rgba(3,5,12,0) 25%, rgba(3,5,12,0.5) 100%)"
        }} />


      {/* شارة الـ XP — دليل مرئي فوري أن التقدّم وصل للسيرفر */}
      <AnimatePresence>
        {xpFlash &&
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2"
          role="status"
          dir="rtl">

            <div className="flex items-center gap-2.5 rounded-full border border-cyan-300/40 bg-[#07131c]/90 px-4 py-2 text-sm font-bold text-cyan-100 shadow-[0_10px_40px_-12px_rgba(34,211,238,0.7)] backdrop-blur-xl">
              <ZapIcon className="h-4 w-4 text-cyan-300" />
              <span className="font-en">+{xpFlash.amount} XP</span>
              <span className="text-white/60">·</span>
              <span>{xpFlash.label}</span>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentLineIndex === 0}
            className="flex items-center gap-3 rounded-2xl border border-white/25 bg-[#060b16]/70 px-5 py-3 text-[15px] font-bold text-white transition-colors hover:border-sky-300/50 hover:bg-[#0a1424]/80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/25 disabled:hover:bg-[#060b16]/70">

            <CornerUpLeftIcon className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
            <span>الجملة السابقة</span>
          </button>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <WordFlowLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push("/stories")}
            className="group flex items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-white/70 hover:text-white">

            <span>العودة إلى القصص</span>
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        </header>

        <main className="flex flex-1 flex-col px-6 pb-8 sm:px-10 lg:pl-16" onClick={focusInput}>
          <input
            ref={inputRef}
            type="text"
            value={typedChars}
            onChange={handleInputChange}
            className="sr-only"
            aria-label="اكتب الجملة"
            autoFocus />


          <div className="flex flex-col items-start gap-9 pt-10 lg:pt-[9vh]">
            <SentenceDisplay
              line={currentLine ?? null}
              target={targetText}
              typed={typedChars}
              cells={cells}
              levelBadge={cefrLevel || "B1"}
              activeWordIndex={activeWordIndex} />


            {needsFixing &&
            <div
              role="status"
              dir="rtl"
              className="flex items-center gap-2.5 rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-2.5 text-[13px] font-bold text-rose-200">

                <TriangleAlertIcon className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {lineErrorCount === 1 ? "حرف واحد غير صحيح" : `${lineErrorCount} أحرف غير صحيحة`} —
                  اضغط Backspace لتصحيحها ثم تنتقل الجملة تلقائياً.
                </span>
              </div>
            }

            <AudioControls
              voice={voice}
              onVoiceChange={setVoice}
              isPlaying={isPlaying}
              onTogglePlay={toggle}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed} />


            <TypingStats
              currentLineIndex={currentLineIndex}
              totalLines={totalLines}
              percent={percent}
              metrics={metrics}
              saveState={saveState} />

          </div>

          <div className="mt-auto pt-14">
            <div className="mx-auto flex w-fit flex-wrap items-center justify-center rounded-full border border-white/10 bg-[#090e1b]/55 px-2 py-1.5 backdrop-blur-xl">
              {isCompleted ?
              <motion.button
                type="button"
                onClick={handleRestart}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/15">

                  <PartyPopperIcon className="h-3.5 w-3.5 text-amber-300" />
                  <span>أنهيت القصة! ابدأ من جديد</span>
                </motion.button> :

              <>
                  <div className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65">
                    <ZapIcon className="h-3.5 w-3.5 text-[#22d3ee]" />
                    <span>اختصار سريع: اضغط</span>
                    <kbd className="font-en rounded-md border border-white/15 bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/85">
                      \
                    </kbd>
                    <span>للاستماع</span>
                  </div>

                  <span className="mx-1 h-5 w-px bg-white/12" />

                  <button
                  type="button"
                  onClick={resetLine}
                  className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white/70 hover:text-white">

                    <RotateCcwIcon className="h-3.5 w-3.5 text-white/50" />
                    <span>إعادة الجملة</span>
                  </button>

                  <span className="mx-1 h-5 w-px bg-white/12" />

                  <button
                  type="button"
                  onClick={goNext}
                  disabled={currentLineIndex >= totalLines - 1}
                  className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">

                    <span>تخطَّ الجملة</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 text-white/50" />
                  </button>
                </>
              }
            </div>
          </div>
        </main>
      </div>
    </div>);

}

export default StoryReader;