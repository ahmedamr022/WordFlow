"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SAMPLE_COURSES } from "@/data/stories";
import { VOCABULARY_CATEGORIES } from "@/data/vocabularyData";
import {
  Play,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Headphones,
  Mic,
} from "lucide-react";

export function Hero() {
  const totalStories = SAMPLE_COURSES.reduce((acc, c) => acc + c.stories.length, 0);
  const totalVocab = VOCABULARY_CATEGORIES.reduce((acc, cat) => acc + cat.words.length, 0);

  return (
    <>
      {/* HERO SECTION */}
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
                href="/register"
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
                <Image
                  src="/images/student-learning.jpg"
                  alt="WordFlow Student"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 640px) 320px, 420px"
                  className="object-cover scale-105 hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-40 pointer-events-none" />
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

      {/* LIVE STATS SHOWCASE */}
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
              {totalStories}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-arabic">
              قصة تفاعلية متاحة
            </span>
          </div>

          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black font-mono text-[#ff6b6b]">
              {totalVocab}
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
    </>
  );
}