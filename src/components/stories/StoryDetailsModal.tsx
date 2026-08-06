"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SAMPLE_COURSES, MAIN_STORIES, RECOMMENDED_STORIES_DATA } from "@/data/stories";
import { storyDescriptionAr } from "@/data/storyDescriptions";
import { storyImageCandidates, IMAGES, imageFallbackHandler } from "@/lib/assets";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  BookmarkIcon,
  ChartNoAxesColumnIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  GraduationCapIcon,
  TypeIcon,
  FileTextIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
  LockIcon,
  SparklesIcon,
  TrophyIcon,
  ShieldCheckIcon,
  AwardIcon,
  RocketIcon,
  RotateCcwIcon } from
"lucide-react";

/**
 * مودال تفاصيل القصة.
 *
 * ما تغيّر في هذه الدفعة:
 *  · الوصف صار **عربياً دائماً** ومنظّماً (جملة تعريف + ما ستكسبه لغوياً) من
 *    `src/data/storyDescriptions.ts`. قبل كذا كان نصف القصص تعرض النص العام
 *    «قصة ممتعة لتطوير مهاراتك…» أو الوصف الإنجليزي.
 *  · الشريط العلوي صار زر رجوع (سهم) + عنوان في المنتصف — مطابق للتصميم.
 *  · التصنيف في الشريحة العلوية صار اسم المسار الحقيقي للقصة
 *    (مثلاً «أساطير من التاريخ») لا كلمة ثابتة.
 *  · كارت التقدم يوضح الجملة التي وصلت إليها والوقت المتبقي التقديري.
 *
 * وباقي ما بُني سابقاً كما هو: حركة spring، خلفية معتّمة بـ blur خفيف (5px)
 * لا يمحو التصميم، صور القصة الحقيقية من `public/images/stories/storyN/`
 * والنقاط بعدد الصور الموجودة فعلاً (نتحقق بالتحميل)، تقليب كل ثانيتين،
 * إغلاق بـ Esc أو بالضغط خارج المودال، وقفل تمرير الصفحة.
 */

export interface StoryModalData {
  id: string;
  titleEn?: string;
  titleAr?: string;
  description?: string;
  level?: string;
  duration?: number;
  rating?: number;
  /** نسبة التقدم الحقيقية (0-100) من user_story_positions. */
  progress?: number;
  linesCompleted?: number;
  totalLines?: number;
  bestAccuracy?: number | null;
  bestWpm?: number | null;
  completed?: boolean;
}

interface StoryDetailsModalProps {
  story: StoryModalData | null;
  onClose: () => void;
}

const SLIDE_INTERVAL_MS = 2000;

/**
 * يتحقق من الصور فعلياً بتحميلها ويرجّع الموجود فقط.
 * السبب: امتدادات الملفات غير موحّدة في public/ (2.png هنا و 2.jpg هناك)
 * ولا يوجد فهرس للمجلد على العميل، فلا يمكن معرفة عدد الصور إلا بالتحقق.
 */
function useVerifiedImages(candidates: string[]): {images: string[];checking: boolean;} {
  const key = candidates.join("|");
  const [images, setImages] = useState<string[]>(() => candidates.slice(0, 1));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (candidates.length === 0) {
      setImages([]);
      setChecking(false);
      return;
    }

    setChecking(true);
    setImages(candidates.slice(0, 1));

    const found: (string | null)[] = new Array(candidates.length).fill(null);
    let pending = candidates.length;

    const settle = () => {
      pending -= 1;
      if (pending > 0 || cancelled) return;
      const list = found.filter((src): src is string => Boolean(src));
      setImages(list.length > 0 ? list : candidates.slice(0, 1));
      setChecking(false);
    };

    candidates.forEach((src, index) => {
      const probe = new window.Image();
      probe.onload = () => {
        found[index] = src;
        settle();
      };
      probe.onerror = settle;
      probe.src = src;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { images, checking };
}

/** يجمع أرقام القصة الحقيقية من مصدر المحتوى (لا أرقام افتراضية مخترعة). */
function useStoryFacts(story: StoryModalData | null) {
  return useMemo(() => {
    if (!story) return null;
    const targetId = story.id;

    let courseStory = null as (typeof SAMPLE_COURSES)[number]["stories"][number] | null;
    let courseTitleAr: string | null = null;
    for (const course of SAMPLE_COURSES) {
      const found = course.stories.find((item) => item.id === targetId);
      if (found) {
        courseStory = found;
        courseTitleAr = course.titleAr ?? null;
        break;
      }
    }

    const meta =
    MAIN_STORIES.find((item) => item.id === targetId) ??
    RECOMMENDED_STORIES_DATA.find((item) => item.id === targetId) ??
    null;

    const wordsCount = courseStory ?
    courseStory.lines.reduce((sum, line) => sum + line.words.length, 0) :
    null;

    return {
      titleEn: story.titleEn || courseStory?.title || meta?.titleEn || "Story",
      titleAr: story.titleAr || courseStory?.titleAr || meta?.titleAr || "قصة",
      /** ترتيب المصادر: الوصف المكتوب بعناية ← وصف المحتوى ← نص عام. */
      description:
      storyDescriptionAr(targetId) ||
      courseStory?.descriptionAr ||
      story.description ||
      "قصة تفاعلية تتعلم فيها الإنجليزية بالكتابة والاستماع، كلمة كلمة وجملة جملة.",
      badge: courseTitleAr || "قصة تفاعلية",
      level: story.level || courseStory?.cefrLevel || meta?.level || "A1",
      wordsCount,
      linesCount: courseStory?.totalLines ?? courseStory?.lines.length ?? story.totalLines ?? null,
      duration:
      story.duration ||
      courseStory?.estimatedMinutes ||
      parseInt(meta?.duration || "0", 10) ||
      null,
      rating: story.rating ?? (meta?.rating ? Number(meta.rating) : null)
    };
  }, [story]);
}

export default function StoryDetailsModal({ story, onClose }: StoryDetailsModalProps) {
  const router = useRouter();
  const open = Boolean(story);

  // نحفظ آخر قصة حتى تكتمل حركة الخروج بعد أن تصبح story = null.
  const [cached, setCached] = useState<StoryModalData | null>(story);
  useEffect(() => {
    if (story) setCached(story);
  }, [story]);

  const facts = useStoryFacts(cached);
  const candidates = useMemo(() => storyImageCandidates(cached?.id), [cached?.id]);
  const { images, checking } = useVerifiedImages(candidates);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const progress = Math.min(100, Math.max(0, Math.round(cached?.progress ?? 0)));
  const isDone = Boolean(cached?.completed) || progress >= 100;

  const goToImage = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrentImageIndex((index + total) % total);
    },
    [total]
  );

  // تقليب الصور كل ثانيتين أثناء التشغيل.
  useEffect(() => {
    if (!isPlaying || total <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % total);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isPlaying, total]);

  // إعادة الضبط عند فتح قصة جديدة.
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsPlaying(false);
  }, [cached?.id]);

  // قفل التمرير + Esc + أسهم التنقل بين الصور.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        setIsPlaying(false);
        goToImage(currentImageIndex + 1);
      }
      if (event.key === "ArrowLeft") {
        setIsPlaying(false);
        goToImage(currentImageIndex - 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, goToImage, currentImageIndex]);

  const handleImageClick = () => {
    setIsPlaying(false);
    goToImage(currentImageIndex + 1);
  };

  const handleOpenStory = () => {
    if (!cached?.id) return;
    onClose();
    router.push(`/story/${cached.id}`);
  };

  const actionLabel = isDone ? "إعادة القصة" : progress > 0 ? "متابعة القصة" : "ابدأ القصة";

  /** الوقت المتبقي التقديري من نسبة التقدم ومدة القصة. */
  const remainingMinutes = useMemo(() => {
    if (!facts?.duration) return null;
    const left = Math.ceil(facts.duration * (1 - progress / 100));
    return left > 0 ? left : null;
  }, [facts?.duration, progress]);

  const achievements = useMemo(() => {
    const bestAccuracy = cached?.bestAccuracy ?? null;
    const bestWpm = cached?.bestWpm ?? null;
    return [
    {
      id: "finish",
      title: "إنهاء القصة",
      description: "أكمل القصة بنجاح",
      earned: isDone,
      icon: <TrophyIcon className="h-5 w-5" />,
      tone: "text-amber-400 bg-amber-500/10 border-amber-500/25"
    },
    {
      id: "mastery",
      title: "إتقان ٩٥٪+",
      description: "أنهِ القصة بدقة عالية",
      earned: (bestAccuracy ?? 0) >= 95,
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
    },
    {
      id: "no-errors",
      title: "بدون أخطاء",
      description: "دقة ١٠٠٪ كاملة",
      earned: (bestAccuracy ?? 0) >= 100,
      icon: <AwardIcon className="h-5 w-5" />,
      tone: "text-rose-400 bg-rose-500/10 border-rose-500/25"
    },
    {
      id: "speed",
      title: "سرعة خيالية",
      description: "٤٠ كلمة في الدقيقة",
      earned: (bestWpm ?? 0) >= 40,
      icon: <RocketIcon className="h-5 w-5" />,
      tone: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25"
    }];

  }, [cached?.bestAccuracy, cached?.bestWpm, isDone]);

  return (
    <AnimatePresence>
      {open && cached && facts &&
      <motion.div
        key="story-modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}>

          {/* الخلفية: تعتيم + blur خفيف لا يمحو التصميم */}
          <div
          className="absolute inset-0 bg-[#03050a]/65"
          style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
          onClick={onClose}
          aria-hidden="true" />


          <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`تفاصيل قصة ${facts.titleAr}`}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12, transition: { duration: 0.16 } }}
          transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
          className="relative z-10 max-h-[92vh] w-full max-w-[980px] overflow-y-auto rounded-[28px] border border-white/[0.07] bg-[#070A10] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.85)] outline-none sm:p-6 [direction:ltr]">

            {/* Header: زر رجوع يسار + عنوان في المنتصف */}
            <div className="relative mb-5 flex items-center justify-start">
              <button
              type="button"
              onClick={onClose}
              aria-label="رجوع"
              className="z-10 flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#0F131D] text-[#A0AEC0] transition-all hover:bg-[#181E2E] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60">

                <ChevronLeftIcon size={22} />
              </button>
              <div className="pointer-events-none absolute left-0 w-full text-center text-[20px] font-bold text-[#F1F5F9] [direction:rtl]">
                تفاصيل القصة
              </div>
            </div>

            {/* Hero */}
            <div className="mb-4 grid grid-cols-1 gap-5 rounded-[20px] border border-white/5 bg-[#0B0E17] p-4 md:grid-cols-[1.05fr_1fr] [direction:ltr]">
              {/* Slideshow */}
              <div className="group relative h-[250px] select-none overflow-hidden rounded-2xl border border-white/[0.05] md:h-[280px]">
                <button
                type="button"
                onClick={handleImageClick}
                aria-label="الصورة التالية"
                className="absolute inset-0 z-[1] h-full w-full cursor-pointer">

                  <span className="sr-only">الصورة التالية</span>
                </button>

                <AnimatePresence mode="popLayout">
                  <motion.img
                  key={images[currentImageIndex] ?? "empty"}
                  src={images[currentImageIndex] ?? IMAGES.placeholder}
                  onError={imageFallbackHandler(IMAGES.placeholder)}
                  alt={`مشهد ${currentImageIndex + 1} من قصة ${facts.titleAr}`}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover" />

                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Play / Pause */}
                <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsPlaying((prev) => !prev);
                }}
                disabled={total <= 1}
                aria-label={isPlaying ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"}
                className="absolute bottom-4 left-4 z-10 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F6BF6] text-white shadow-[0_4px_20px_rgba(124,58,237,0.5)] transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">

                  {isPlaying ?
                <PauseIcon size={20} className="fill-white" /> :

                <PlayIcon size={20} className="translate-x-0.5 fill-white" />
                }
                </button>

                {/* Prev / Next */}
                {total > 1 &&
              <>
                    <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPlaying(false);
                    goToImage(currentImageIndex - 1);
                  }}
                  aria-label="السابق"
                  className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100">

                      <ChevronLeftIcon size={18} />
                    </button>
                    <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPlaying(false);
                    goToImage(currentImageIndex + 1);
                  }}
                  aria-label="التالي"
                  className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100">

                      <ChevronRightIcon size={18} />
                    </button>
                  </>
              }

                {/* النقاط بعدد الصور الموجودة فعلاً */}
                <div className="absolute bottom-[26px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                  {checking && total <= 1 ?
                <span className="h-[6px] w-[22px] animate-pulse rounded-full bg-white/40" /> :

                images.map((src, index) =>
                <button
                  key={src}
                  type="button"
                  aria-label={`الصورة ${index + 1}`}
                  aria-current={index === currentImageIndex}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPlaying(false);
                    setCurrentImageIndex(index);
                  }}
                  className={`h-[6px] rounded-full transition-all duration-300 ${
                  index === currentImageIndex ?
                  "w-[22px] bg-white" :
                  "w-[6px] bg-white/40 hover:bg-white/70"}`
                  } />

                )
                }
                </div>
              </div>

              {/* Story info */}
              <div className="flex flex-col items-start [direction:ltr]">
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-xl border border-[#22D3EE]/20 bg-[#06B6D4]/10 px-3 py-1 text-[13px] font-semibold text-[#22D3EE] [direction:rtl]">
                  <BookmarkIcon size={14} />
                  <span>{facts.badge}</span>
                </div>

                <h2 className="mb-1 text-[27px] font-extrabold leading-tight tracking-tight text-white">
                  {facts.titleEn}
                </h2>

                <div className="mb-3 text-[17px] font-bold text-[#22D3EE] [direction:rtl]">
                  {facts.titleAr}
                </div>

                <p className="mb-4 w-full text-right text-[13.5px] leading-[1.9] text-[#94A3B8] [direction:rtl]">
                  {facts.description}
                </p>

                <div className="mt-auto grid w-full grid-cols-4 gap-2 [direction:ltr]">
                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] px-1 py-2.5">
                    <span className="text-[16px] font-bold text-[#38BDF8]">{facts.level}</span>
                    <ChartNoAxesColumnIcon size={14} className="text-[#38BDF8]" />
                    <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">المستوى</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] px-1 py-2.5">
                    <span className="text-[16px] font-bold text-white">
                      {facts.wordsCount ?? "—"}
                    </span>
                    <BookOpenIcon size={14} className="text-[#94A3B8]" />
                    <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">كلمة</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] px-1 py-2.5">
                    <span className="text-[16px] font-bold text-white">{facts.duration ?? "—"}</span>
                    <ClockIcon size={14} className="text-[#94A3B8]" />
                    <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">دقيقة</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] px-1 py-2.5">
                    <span className="text-[16px] font-bold text-white">{facts.rating ?? "—"}</span>
                    <StarIcon size={14} className="fill-[#F59E0B] stroke-none" />
                    <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">تقييم</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ما ستتعلمه + التقدم */}
            <div className="mb-4 rounded-[20px] border border-white/5 bg-[#0B0E17] p-4 [direction:ltr]">
              <div className="mb-3.5 flex items-center justify-center gap-2 text-[15px] font-bold text-[#E2E8F0] [direction:rtl]">
                <GraduationCapIcon size={20} />
                <span>ستتعلم في هذه القصة</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-[repeat(5,1fr)_2.2fr] [direction:ltr]">
                {[
              {
                icon: <TypeIcon size={24} />,
                color: "text-[#00D2FF]",
                value: facts.wordsCount ?? "—",
                label: "كلمة جديدة"
              },
              {
                icon: <FileTextIcon size={24} />,
                color: "text-[#A855F7]",
                value: facts.linesCount ?? "—",
                label: "جملة كاملة"
              },
              {
                icon: <HeadphonesIcon size={24} />,
                color: "text-[#C084FC]",
                value: "استماع",
                label: "وتدريب"
              },
              {
                icon: <MicIcon size={24} />,
                color: "text-[#D946EF]",
                value: "نطق",
                label: "أفضل"
              },
              {
                icon: <PencilIcon size={24} />,
                color: "text-[#A855F7]",
                value: "كتابة",
                label: "وتلخيص"
              }].
              map((item) =>
              <div
                key={item.label}
                className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-white/[0.04] bg-[#0E121E] px-1.5 py-3 text-center">

                    <div className={`mb-0.5 flex h-[38px] w-[38px] items-center justify-center ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="text-[14px] font-extrabold text-white [direction:rtl]">
                      {item.value}
                    </div>
                    <div className="text-[11px] font-semibold text-[#64748B] [direction:rtl]">
                      {item.label}
                    </div>
                  </div>
              )}

                {/* التقدم الحقيقي */}
                <div className="col-span-3 flex flex-col items-center justify-center rounded-[14px] border border-white/[0.04] bg-[#0E121E] px-4 py-3 text-center sm:col-span-1 [direction:rtl]">
                  <div className="text-[14px] font-bold text-[#CBD5E1]">التقدم</div>
                  <div className="my-0.5 bg-gradient-to-r from-[#00D2FF] to-[#A855F7] bg-clip-text text-[32px] font-extrabold leading-tight text-transparent [direction:ltr]">
                    {progress}%
                  </div>
                  <div className="mb-2 text-[11px] leading-relaxed text-[#64748B]">
                    {isDone ?
                  "أنهيتها بالكامل — يمكنك إعادتها" :
                  progress > 0 ?
                  `وصلت للجملة ${(cached.linesCompleted ?? 0) + 1}${
                  remainingMinutes ? ` · بقي ~${remainingMinutes} دقيقة` : ""}` :

                  "لم تبدأ بعد — أول جملة تنتظرك"}
                  </div>
                  <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#182032] [direction:ltr]">
                    <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#00D2FF] to-[#A855F7]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }} />

                  </div>
                </div>
              </div>
            </div>

            {/* الإنجازات — الحالة حقيقية من أفضل نتائجك */}
            <div className="mb-3 flex items-center justify-center gap-2 text-[14px] font-semibold text-slate-300 [direction:rtl]">
              <LockIcon className="h-4 w-4 text-slate-400" />
              <span>إنجازات يمكنك الحصول عليها</span>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 [direction:ltr]">
              {achievements.map((item) =>
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all [direction:rtl] ${
              item.earned ?
              "border-white/10 bg-[#0b1220]" :
              "border-white/5 bg-[#090E17] opacity-60"}`
              }>

                  <div className="space-y-0.5 text-right">
                    <h3 className="text-[13px] font-bold leading-tight text-white">{item.title}</h3>
                    <p className="text-[11px] font-normal text-slate-400">
                      {item.earned ? "تم تحقيقه ✓" : item.description}
                    </p>
                  </div>

                  <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                item.earned ? item.tone : "border-white/5 bg-white/[0.03] text-slate-500"}`
                }>

                    {item.earned ? item.icon : <LockIcon className="h-5 w-5" />}
                  </div>
                </div>
            )}
            </div>

            {/* زر الإجراء */}
            <button
            type="button"
            onClick={handleOpenStory}
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl text-[18px] font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.01] hover:opacity-95 active:scale-[0.99] [direction:rtl]"
            style={{
              background: "linear-gradient(90deg, #A855F7 0%, #7C3AED 45%, #3B82F6 100%)",
              boxShadow: "0 10px 30px rgba(124, 58, 237, 0.35)"
            }}>

              {isDone ?
            <RotateCcwIcon className="h-5 w-5" /> :

            <SparklesIcon className="h-5 w-5 fill-white text-white" />
            }
              <span>{actionLabel}</span>
            </button>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}