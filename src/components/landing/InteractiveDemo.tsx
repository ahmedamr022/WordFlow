"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { DEMO_STORIES } from "@/data/demoStories";
import { Volume2, ArrowLeft } from "lucide-react";

export function InteractiveDemo() {
  const [activeDemoTab, setActiveDemoTab] = useState(0);
  const currentDemo = DEMO_STORIES[activeDemoTab];
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayFullSentence = () => {
    setIsPlayingAudio(true);
    AudioService.setStory(currentDemo.id);
    AudioService.playSentence(currentDemo.lineId);
    setTimeout(() => setIsPlayingAudio(false), 3200);
  };

  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    AudioService.playWord(cleanWord);
  };

  return (
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
          {DEMO_STORIES.map((s, idx) => (
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
              aria-label="استمع للسطر الكامل"
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
  );
}