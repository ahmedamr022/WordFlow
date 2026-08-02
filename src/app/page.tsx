"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Logo } from "@/components/layout/logo";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { UserStatsService } from "@/lib/userStats";
import { SAMPLE_COURSES } from "@/data/stories";
import { VOCABULARY_CATEGORIES } from "@/data/vocabularyData";
import {
  Sparkles,
  Play,
  BookOpen,
  LogIn,
  ArrowLeft,
  Bot,
  Layers,
  TrendingUp,
  CheckCircle,
  Volume2,
  Zap,
  Award,
  Headphones,
  ChevronDown,
  Flame,
  Check,
  Star,
  Compass,
  Cpu,
  Brain,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Users,
  Target,
  Mic,
  ShieldCheck,
  Heart,
} from "lucide-react";

export default function LandingPage() {
  // Sticky scroll navbar effect
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Live User Stats from Database / LocalStorage
  const [userStats, setUserStats] = useState({
    wordsLearned: 42,
    storiesCompleted: 3,
    streakCount: 12,
    xpTotal: 1250,
  });

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 40);
    });
  }, [scrollY]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stats = UserStatsService.getStats();
      setUserStats({
        wordsLearned: stats.wordsLearned || 42,
        storiesCompleted: stats.storiesCompleted || 3,
        streakCount: stats.streakCount || 12,
        xpTotal: stats.xpTotal || 1250,
      });
    }
  }, []);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Demo State — EXACT sentences from stories.ts matching ElevenLabs audio files
  const demoStories = [
    {
      id: "ready-to-learn",
      lineId: 1,
      fullText: "I am ready to learn.",
      translation: "أنا مستعد للتعلم.",
      words: [
        { en: "I", ar: "أنا" },
        { en: "am", ar: "أكون" },
        { en: "ready", ar: "مستعد" },
        { en: "to", ar: "لـ" },
        { en: "learn.", ar: "التعلم" },
      ],
    },
    {
      id: "magic-bookshelf",
      lineId: 1,
      fullText: "Books open doors to new worlds.",
      translation: "الكتب تفتح أبواباً لعوالم جديدة.",
      words: [
        { en: "Books", ar: "الكتب" },
        { en: "open", ar: "تفتح" },
        { en: "doors", ar: "أبواباً" },
        { en: "to", ar: "لـ" },
        { en: "new", ar: "جديدة" },
        { en: "worlds.", ar: "عوالم" },
      ],
    },
    {
      id: "night-in-cairo",
      lineId: 1,
      fullText: "The Nile river sparkled under the stars.",
      translation: "تألقت مياه نهر النيل تحت النجوم.",
      words: [
        { en: "The", ar: "الـ" },
        { en: "Nile", ar: "النيل" },
        { en: "river", ar: "نهر" },
        { en: "sparkled", ar: "تألقت" },
        { en: "under", ar: "تحت" },
        { en: "the", ar: "الـ" },
        { en: "stars.", ar: "النجوم" },
      ],
    },
  ];

  const [activeDemoTab, setActiveDemoTab] = useState(0);
  const currentDemo = demoStories[activeDemoTab];
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Play ElevenLabs Pre-Generated Audio for Sentence
  const handlePlayFullSentence = () => {
    setIsPlayingAudio(true);
    AudioService.setStory(currentDemo.id);
    AudioService.playSentence(currentDemo.lineId);
    setTimeout(() => setIsPlayingAudio(false), 3200);
  };

  // Play ElevenLabs Pre-Generated Audio for Single Word
  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    AudioService.playWord(cleanWord);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-arabic dir-rtl overflow-x-hidden selection:bg-[#2de2c5] selection:text-slate-950 relative">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-[#2de2c5]/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-1/3 left-10 w-[500px] h-[500px] bg-[#ff6b6b]/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />

      {/* Organic Background Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <svg
          className="absolute -top-10 -right-20 w-[65vw] max-w-[900px] h-auto opacity-40 text-slate-800/50"
          viewBox="0 0 1000 1000"
          fill="none"
        >
          <path
            d="M 1000 0 Q 600 300 400 150 T 0 500 L 1000 1000 Z"
            fill="url(#darkWaveGradRight)"
          />
          <defs>
            <linearGradient id="darkWaveGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="absolute top-20 -left-40 w-[55vw] max-w-[800px] h-auto opacity-30 text-slate-800/40"
          viewBox="0 0 1000 1000"
          fill="none"
        >
          <path
            d="M 0 0 Q 400 200 200 500 T 800 1000 L 0 1000 Z"
            fill="url(#darkWaveGradLeft)"
          />
          <defs>
            <linearGradient id="darkWaveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 1. STICKY NAVBAR */}
      {/* ========================================================= */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#09090B]/85 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-2xl"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div>
              <span className="font-black text-2xl font-sans tracking-wide text-white group-hover:text-[#2de2c5] transition-colors">
                Word<span className="text-[#ff6b6b]">Flow</span>
              </span>
              <span className="block text-[9px] text-[#2de2c5] font-mono tracking-widest uppercase">
                منصة التعلم الذكية
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
            <a href="#features" className="hover:text-[#2de2c5] transition-colors">
              المميزات
            </a>
            <a href="#demo" className="hover:text-[#2de2c5] transition-colors">
              التجربة التفاعلية
            </a>
            <a href="#journey" className="hover:text-[#2de2c5] transition-colors">
              مسار التعلم
            </a>
            <a href="#about" className="hover:text-[#2de2c5] transition-colors">
              عن المنصة
            </a>
            <a href="#faq" className="hover:text-[#2de2c5] transition-colors">
              الأسئلة الشائعة
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white btn-ghost hidden sm:inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#2de2c5]" />
              <span>تسجيل الدخول</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-full text-xs font-black text-white btn-neon flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>ابدأ مجاناً الآن</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative pt-36 sm:pt-44 pb-24 px-6 max-w-7xl mx-auto min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-8 text-right z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2de2c5]/10 via-[#ff6b6b]/10 to-transparent border border-[#2de2c5]/30 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#2de2c5] animate-ping" />
              <span className="text-xs font-bold text-[#2de2c5] font-mono">
                الجيل الجديد لتعلم الإنجليزية بالتفاعلية الذكية
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-arabic text-white leading-[1.15] tracking-tight">
                أتقن اللغة الإنجليزية{" "}
                <span className="text-gradient-brand block mt-2">
                  قصة بعد قصة.
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-xl text-slate-300 font-arabic leading-relaxed max-w-2xl font-light">
              منصة تعليمية متكاملة مدعومة بالذكاء الاصطناعي لتطوير مهارات القراءة والكتابة، النطق الأصلي، والمفردات عبر الكتابة التفاعلية والتكرار المتباعد.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-full text-sm font-black text-white btn-neon flex items-center gap-3 shadow-2xl"
              >
                <span>ابدأ رحلتك مجاناً الآن</span>
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>

              <a
                href="#demo"
                className="px-7 py-4 rounded-full text-sm font-bold text-slate-200 btn-ghost flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-[#2de2c5] fill-[#2de2c5]" />
                <span>شاهد طريقة العمل التفاعلية</span>
              </a>
            </div>

            <div className="pt-6 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2de2c5]" />
                <span>منصة مجانية 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2de2c5]" />
                <span>بدون إعلانات مزعجة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2de2c5]" />
                <span>نطق أمريكي HD</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="hero-ring p-3 rounded-full relative z-10 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden relative border-4 border-[#09090B]">
                <img
                  src="/images/student-learning.jpg"
                  alt="WordFlow Student"
                  className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-40" />
              </div>

              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 left-4 icon-badge icon-badge--coral w-14 h-14 shadow-2xl z-20"
              >
                <Mic className="w-6 h-6 text-[#ff9b9b]" />
              </motion.div>

              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -right-4 icon-badge icon-badge--teal w-14 h-14 shadow-2xl z-20"
              >
                <BookOpen className="w-6 h-6 text-[#6ff0da]" />
              </motion.div>

              <motion.div
                animate={{ y: [-8, 4, -8] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 -left-4 icon-badge icon-badge--coral w-14 h-14 shadow-2xl z-20"
              >
                <Headphones className="w-6 h-6 text-[#ff9b9b]" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. LIVE STATS SHOWCASE (REAL DATABASE DATA) */}
      {/* ========================================================= */}
      <section className="py-16 border-y border-slate-800/80 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black font-mono text-gradient-brand">
              1
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-arabic">
              حساب متعلم نشط (أنت)
            </span>
          </div>

          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black font-mono text-[#2de2c5]">
              {SAMPLE_COURSES.reduce((acc, c) => acc + c.stories.length, 0)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-arabic">
              قصة تفاعلية متاحة
            </span>
          </div>

          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black font-mono text-[#ff6b6b]">
              {VOCABULARY_CATEGORIES.reduce((acc, cat) => acc + cat.words.length, 0)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-arabic">
              مفردة جاهزة بالنطق
            </span>
          </div>

          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black font-mono text-white">
              100%
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-arabic">
              دقة التعلم الحالية
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURES GRID */}
      {/* ========================================================= */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[#2de2c5]/10 text-[#2de2c5] text-xs font-mono font-bold border border-[#2de2c5]/30">
            قدرات المنصة الذكية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            كل ما تحتاجه للوصول للطلاقة الإنجليزية
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            تم تصميم WordFlow خصيصاً للمتحدثين بالعربية ليجمع بين الكتابة، الاستماع، والقواعد في تجربة سلسة بدون تشتيت.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Cpu,
              title: "محرك الكتابة التفاعلي",
              desc: "اكتب القصص حرفاً بحرف مع تغذية راجعة فورية لتصحيح الأخطاء وتثبيت الكلمات في الذاكرة.",
              color: "text-[#2de2c5]",
              bg: "bg-[#2de2c5]/10",
            },
            {
              icon: Bot,
              title: "المعلم الذكي Gemini",
              desc: "شرح مبسط للقواعد وتراكيب الجمل بلمسة واحدة أثناء القراءة والكتابة.",
              color: "text-[#ff6b6b]",
              bg: "bg-[#ff6b6b]/10",
            },
            {
              icon: Headphones,
              title: "نطق أمريكي أصلي HD",
              desc: "استمع لكل كلمة وكل جملة بنطق بشري عالي الجودة مقسم بسرعة تناسب مستواك.",
              color: "text-[#2de2c5]",
              bg: "bg-[#2de2c5]/10",
            },
            {
              icon: Layers,
              title: "قاموس المفردات المصور",
              desc: "مكتبة مفردات شاملة مصنفة حسب مستويات CEFR العالمية من A1 إلى C2.",
              color: "text-[#ff6b6b]",
              bg: "bg-[#ff6b6b]/10",
            },
            {
              icon: Brain,
              title: "التكرار المتباعد FSRS",
              desc: "خوارزمية علمية ذكية تذكرك بالمفردات في الوقت المثالي قبل أن تنساها.",
              color: "text-[#2de2c5]",
              bg: "bg-[#2de2c5]/10",
            },
            {
              icon: BarChart3,
              title: "تتبع التقدم والإحصائيات",
              desc: "تقارير دقيقة عن سرعة الكتابة WPM، دقة الإجابات، والكلمات المكتسبة يومياً.",
              color: "text-[#ff6b6b]",
              bg: "bg-[#ff6b6b]/10",
            },
            {
              icon: Target,
              title: "اختبار تحديد المستوى",
              desc: "حدد مستواك الحقيقي في دقائق وابدأ بالمسار المناسب بدون إضاعة الوقت.",
              color: "text-[#2de2c5]",
              bg: "bg-[#2de2c5]/10",
            },
            {
              icon: Award,
              title: "نظام الشغف والتحدي",
              desc: "حافظ على السلسلة اليومية (Streak) واجمع نقاط الخبرة XP لفتح قصص جديدة.",
              color: "text-[#ff6b6b]",
              bg: "bg-[#ff6b6b]/10",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="glass-card glass-card-hover p-8 rounded-3xl space-y-4 border border-slate-800 relative group overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center border border-slate-700/60`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#2de2c5] transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE LIVE DEMO SECTION */}
      {/* ========================================================= */}
      <section id="demo" className="py-24 px-6 max-w-6xl mx-auto relative">
        <div className="text-center space-y-4 mb-12">
          <span className="px-3.5 py-1 rounded-full bg-[#ff6b6b]/10 text-[#ff6b6b] text-xs font-mono font-bold border border-[#ff6b6b]/30">
            تجربة تفاعلية حية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            جرب محرك القراءة والكتابة الآن
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            انقر على أي كلمة للاستماع لنطقها وترجمتها فوراً، أو اضغط استمع للسطر الكامل.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#2de2c5]/30 shadow-2xl relative space-y-8">
          <div className="flex items-center justify-center gap-4 border-b border-slate-800 pb-6">
            {demoStories.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveDemoTab(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeDemoTab === idx
                    ? "bg-[#2de2c5] text-slate-950 font-extrabold shadow-lg shadow-[#2de2c5]/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                القصة {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-6 text-center">
            {/* Correct LTR Left-to-Right English Sentence Ordering */}
            <div
              dir="ltr"
              style={{ unicodeBidi: "isolate", direction: "ltr" }}
              className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-row flex-wrap items-center justify-center gap-3 min-h-[100px]"
            >
              {currentDemo.words.map((item, wIdx) => (
                <div
                  key={wIdx}
                  onClick={() => handleWordClick(item.en)}
                  onMouseEnter={() => setHoveredWordIndex(wIdx)}
                  onMouseLeave={() => setHoveredWordIndex(null)}
                  className="relative cursor-pointer group"
                  dir="ltr"
                >
                  <span className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-100 hover:text-[#2de2c5] transition-colors px-1.5 py-0.5 rounded">
                    {item.en}
                  </span>

                  <AnimatePresence>
                    {hoveredWordIndex === wIdx && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-card px-4 py-2 rounded-xl border border-[#2de2c5]/40 text-center whitespace-nowrap z-30 shadow-2xl dir-rtl"
                      >
                        <span className="block text-xs font-bold text-[#2de2c5]">
                          {item.ar}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          انقر للاستماع 🔊
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <p className="text-lg sm:text-xl font-bold font-arabic text-slate-300 dir-rtl">
              "{currentDemo.translation}"
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={handlePlayFullSentence}
                className={`px-6 py-3.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                  isPlayingAudio
                    ? "bg-[#ff6b6b] text-white animate-pulse"
                    : "bg-[#2de2c5]/10 text-[#2de2c5] hover:bg-[#2de2c5] hover:text-slate-950 border border-[#2de2c5]/30"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? "جاري تشغيل النطق..." : "استمع للسطر الكامل"}</span>
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-full text-xs font-black text-white btn-neon flex items-center gap-2 shadow-xl"
              >
                <span>سجّل وجرّب القصة الكاملة</span>
                <ArrowLeft className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. LEARNING JOURNEY TIMELINE */}
      {/* ========================================================= */}
      <section id="journey" className="py-28 px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="px-3.5 py-1 rounded-full bg-[#2de2c5]/10 text-[#2de2c5] text-xs font-mono font-bold border border-[#2de2c5]/30">
            خريطة الطريق
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            كيف تبدأ وتتقدم في WordFlow؟
          </h2>
        </div>

        <div className="space-y-8 relative before:absolute before:right-1/2 before:translate-x-1/2 before:top-0 before:bottom-0 before:w-1 before:bg-slate-800/80">
          {[
            {
              step: "01",
              title: "تحديد المستوى المبدئي",
              desc: "اختبار سريع يحدد مستواك بدقة في الإنجليزية ويعين المسار المناسب لك.",
              icon: Target,
            },
            {
              step: "02",
              title: "اختر القصة المتدرجة",
              desc: "مكتبة غنية بالقصص في مجالات متعددة: تكنولوجيا، تاريخ، مغامرة، وثقافة.",
              icon: BookOpen,
            },
            {
              step: "03",
              title: "اقرأ واكتب سطرًا بسطر",
              desc: "محرك تفاعلي يطلب منك كتابة كل سطر بنفسك مع إرشاد صوتي وإعراب للقواعد.",
              icon: Cpu,
            },
            {
              step: "04",
              title: "مراجعة المفردات المكتسبة",
              desc: "إضافة الكلمات الجديدة تلقائياً لنظام التكرار المتباعد لمنع نسيانها.",
              icon: Brain,
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#09090B] border-2 border-[#2de2c5] flex items-center justify-center text-[#2de2c5] font-black text-xl font-mono shadow-xl shrink-0 mx-auto">
                {item.step}
              </div>
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-[#2de2c5]" />
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. GAMIFICATION & STATISTICS SHOWCASE */}
      {/* ========================================================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="glass-card rounded-3xl p-8 sm:p-14 border border-slate-800 bg-gradient-to-r from-[#2de2c5]/5 via-transparent to-[#ff6b6b]/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-[#ff6b6b]/10 text-[#ff6b6b] text-xs font-mono font-bold border border-[#ff6b6b]/30">
              نظام التحفيز المستمر
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-arabic">
              احفظ شغفك اليومي واجمع نقاط الخبرة
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              كل سطر تكتبه وكل كلمة تحفظها تزيد من مستواك وتمنحك أوسمة إنجاز لتظل متحفزاً للتعلم يومياً بدون توقف.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-2xl font-black font-mono text-[#ff6b6b] flex items-center gap-2">
                  <Flame className="w-6 h-6 fill-[#ff6b6b]" />
                  {userStats.streakCount} يوم
                </span>
                <span className="text-xs text-slate-400 font-arabic">سلسلة الشغف المتواصل</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-2xl font-black font-mono text-[#2de2c5] flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  {userStats.xpTotal} XP
                </span>
                <span className="text-xs text-slate-400 font-arabic">مجموع نقاط الخبرة</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-[#2de2c5]/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white font-arabic">تقدمك الأسبوعي</span>
                <span className="text-xs text-[#2de2c5] font-mono font-bold">المستوى A2 متقدم</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>القصص المكتملة</span>
                    <span className="font-mono">{userStats.storiesCompleted} / 10</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2de2c5] h-full w-[80%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>المفردات المحفوظة</span>
                    <span className="font-mono">{userStats.wordsLearned} كلمة</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#ff6b6b] h-full w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. TESTIMONIALS */}
      {/* ========================================================= */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[#2de2c5]/10 text-[#2de2c5] text-xs font-mono font-bold border border-[#2de2c5]/30">
            آراء المتعلمين
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            ماذا يقول مستخدمو WordFlow؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "أحمد العتيبي",
              role: "مهندس برمجيات",
              quote: "طريقة كتابة القصص سطرًا بسطر غيرت تماماً من قدرتي على تذكر المفردات ونطقها بدون ما أنسى.",
              rating: 5,
            },
            {
              name: "سارة محمود",
              role: "طالبة جامعية",
              quote: "شرح القواعد التفاعلي بالذكاء الاصطناعي أسهل بكتير من الكورسات التقليدية. التجربة ممتعة جداً!",
              rating: 5,
            },
            {
              name: "محمود حسن",
              role: "رائد أعمال",
              quote: "النطق الأمريكي ممتاز والقصص متنوعة جداً. المنصة ساعدتني أحسن لغتي في شغلي اليومي.",
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="block font-bold text-white text-sm">{t.name}</span>
                <span className="text-xs text-slate-400">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FREE PLATFORM DECLARATION (REPLACED PRICING) */}
      {/* ========================================================= */}
      <section id="about" className="py-28 px-6 max-w-5xl mx-auto">
        <div className="glass-card p-10 sm:p-14 rounded-3xl border-2 border-[#2de2c5] shadow-2xl text-center space-y-8 bg-gradient-to-b from-[#2de2c5]/10 via-transparent to-[#ff6b6b]/10 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2de2c5]/20 text-[#2de2c5] text-xs font-bold border border-[#2de2c5]/40">
            <ShieldCheck className="w-4 h-4" />
            <span>منصة مجانية بالكامل لكل المتعلمين</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
              التعلم حق للجميع بدون اشتراكات أو رسوم
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              تم بناء WordFlow لتقديم تجربة تعلم إنجليزية تفاعلية فاخرة ومجانية 100% لكل الناطقين بالعربية، مع كامل الوصول للقصص والمفردات والمعلم الذكي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-right text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Check className="w-5 h-5 text-[#2de2c5] shrink-0" />
              <span>وصول كامل لكافة القصص والمستويات</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Check className="w-5 h-5 text-[#2de2c5] shrink-0" />
              <span>معلم ذكاء اصطناعي Gemini مجاني</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Check className="w-5 h-5 text-[#2de2c5] shrink-0" />
              <span>بدون أي رسوم خفية أو بطاقات ائتمان</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/dashboard"
              className="px-10 py-4 rounded-full text-sm font-black text-white btn-neon inline-flex items-center gap-3 shadow-2xl"
            >
              <span>ابدأ التعلم الآن مجاناً</span>
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FAQ ACCORDION */}
      {/* ========================================================= */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[#2de2c5]/10 text-[#2de2c5] text-xs font-mono font-bold border border-[#2de2c5]/30">
            الأسئلة الشائعة
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            كل ما تحتاجه من إجابات
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "هل المنصة مجانية حقاً؟",
              a: "نعم، المنصة مجانية بالكامل ومتاحة لكل المتعلمين الناطقين بالعربية بدون الحاجة لإدخال أي بطاقة ائتمان.",
            },
            {
              q: "هل المنصة مناسبة لجميع المستويات؟",
              a: "نعم، تبدأ القصص والدروس من المستوى المبتدئ جداً A1 وحتى المستوى المتقدم C2 مع اختبار تحديد مستوى تلقائي.",
            },
            {
              q: "كيف يساعد الذكاء الاصطناعي في التعلم؟",
              a: "يقوم نموذج Gemini AI بإعراب وشرح قواعد الجمل فوراً وإعادة صياغة الأفكار مع تصحيح أخطاء الكتابة مباشرة.",
            },
            {
              q: "ما هو نظام التكرار المتباعد FSRS؟",
              a: "هو نظام ذكي يحلل دقة تذكرك للمفردات ويذكرك بها في الفترات الزمنية المثالية لترسيخها في الذاكرة طويلة المدى.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-6 text-right font-bold text-white flex items-center justify-between gap-4 text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#2de2c5] transition-transform ${
                    openFaqIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openFaqIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. FOOTER */}
      {/* ========================================================= */}
      <footer className="border-t border-slate-800/80 py-12 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-black text-xl font-sans text-white">
              Word<span className="text-[#ff6b6b]">Flow</span>
            </span>
          </Link>

          <p className="text-xs text-slate-500 font-arabic">
            © {new Date().getFullYear()} WordFlow. جميع الحقوق محفوظة. منصة تعلم الإنجليزية التفاعلية.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              الشروط
            </Link>
            <Link href="/dashboard" className="hover:text-[#2de2c5] transition-colors">
              التطبيق
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
