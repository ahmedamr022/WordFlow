"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserStatsService } from "@/lib/userStats";
import { TESTIMONIALS_DATA } from "@/data/landing";
import { FAQ_DATA } from "@/data/faq";
import {
  Flame,
  Award,
  Star,
  ShieldCheck,
  Check,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

export function Sections() {
  const [userStats, setUserStats] = useState({
    wordsLearned: 42,
    storiesCompleted: 3,
    streakCount: 12,
    xpTotal: 1250,
  });

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

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <>
      {/* GAMIFICATION & STATISTICS SHOWCASE */}
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

      {/* TESTIMONIALS */}
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
          {TESTIMONIALS_DATA.map((t, idx) => (
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

      {/* FREE PLATFORM DECLARATION */}
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

      {/* FAQ ACCORDION */}
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
          {FAQ_DATA.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                aria-expanded={openFaqIndex === idx}
                aria-controls={`faq-answer-${idx}`}
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
                    id={`faq-answer-${idx}`}
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
    </>
  );
}