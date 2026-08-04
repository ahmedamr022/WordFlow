"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SentenceDisplay } from "./SentenceDisplay";
import { AudioControls } from "./AudioControls";
import { TypingStats } from "./TypingStats";

export interface WordData {
  text?: string;
  word?: string;
  pos?: string;
  meaning?: string;
  hint?: string;
  isCyan?: boolean;
  isPurple?: boolean;
  hasCaret?: boolean;
}

export const StoryReader: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoRepeat, setIsAutoRepeat] = useState<boolean>(false);

  const wordsData: WordData[] = [
    { text: "The", word: "The", pos: "Article / أداة", meaning: "الـ (أداة تعريف)", hint: "تستخدم للتعريف", hasCaret: true },
    { text: "giant", word: "giant", pos: "Adjective / صفة", meaning: "عملاق / ضخم جداً", hint: "تصف الحجم الكبير", isCyan: true },
    { text: "ship", word: "ship", pos: "Noun / اسم", meaning: "سفينة", hint: "وسيلة نقل بحرية" },
    { text: "sailed", word: "sailed", pos: "Verb / فعل", meaning: "أبحرت / أفيقت", hint: "الحركة في الماء" },
    { text: "across", word: "across", pos: "Preposition / حرف جر", meaning: "عبر / خلال", hint: "الاتجاه من طرف لآخر" },
    { text: "the", word: "the", pos: "Article / أداة", meaning: "الـ (أداة تعريف)", hint: "تستخدم للتعريف" },
    { text: "cold", word: "cold", pos: "Adjective / صفة", meaning: "بارد / القارس", hint: "تصف درجة الحرارة", isPurple: true },
    { text: "ocean.", word: "ocean.", pos: "Noun / اسم", meaning: "المحيط", hint: "مسطح مائي واسع" },
  ];

  const currentLine = {
    id: "1",
    text: "The giant ship sailed across the cold ocean.",
    translation: "أبحرت السفينة العملاقة عبر المحيط البارد.",
    words: wordsData,
  };

  return (
    <div className="bg-[#020512] text-white font-['Cairo'] min-h-screen flex flex-col justify-between overflow-x-hidden relative ltr select-none">
      {/* External CSS Links */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Fredoka:wght@600;700&family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <img
          src="/images/backgrounds/ship.png"
          alt="Story Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_right] filter brightness-[0.95] contrast-[1.05]"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 45%, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 80%),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.6) 100%)
            `,
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-[2] w-full max-w-[1400px] mx-auto px-[40px] py-[25px] flex flex-col min-h-screen justify-between items-start">
        
        {/* Header */}
        <header className="flex justify-between items-center w-full ltr">
          {/* Back Button (Left) */}
          <Link
            href="/stories"
            className="flex items-center gap-2.5 text-[#cbd5e1] text-[14px] font-semibold transition-all hover:text-white"
          >
            <i className="fa-solid fa-arrow-left text-[14px]"></i>
            <span>العودة إلى القصص</span>
          </Link>

          {/* Logo (Center) */}
          <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group">
            <span
              className="font-['Fredoka'] text-[36px] font-bold leading-none tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(180deg, #00d2ff 0%, #3b82f6 50%, #a855f7 100%)",
                filter: "drop-shadow(0 0 10px rgba(0, 210, 255, 0.5))",
              }}
            >
              W
            </span>
            <div className="font-['Inter'] text-[24px] font-extrabold text-white tracking-tight flex items-center">
              Word
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
                }}
              >
                Flow
              </span>
            </div>
          </Link>

          {/* All Stories Button (Right) */}
          <Link href="/stories">
            <button
              className="flex items-center gap-2.5 px-5 py-2 rounded-[14px] text-white text-[14px] font-semibold transition-all hover:border-white/30 active:scale-95"
              style={{
                background: "rgba(10, 18, 38, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
              }}
            >
              <i className="fa-regular fa-book-open text-[16px] text-[#e2e8f0]"></i>
              <span>جميع القصص</span>
            </button>
          </Link>
        </header>

        {/* Main Section */}
        <main className="my-[auto] flex flex-col items-start text-left w-full max-w-[620px] gap-5 ltr">
          {/* Sentence Display */}
          <SentenceDisplay currentLine={currentLine} levelBadge="B1" />

          {/* Audio Controls */}
          <AudioControls lineId={currentLine.id} />

          {/* Progress Card */}
          <TypingStats currentLineIndex={3} totalLines={6} />
        </main>

        {/* Footer */}
        <footer className="flex justify-center w-full mb-[10px] ltr">
          <div
            className="flex items-center gap-[18px] px-[24px] py-[10px] rounded-full"
            style={{
              background: "rgba(6, 12, 28, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              onClick={() => setIsAutoRepeat(!isAutoRepeat)}
              className={`flex items-center gap-2 text-[13.5px] font-semibold cursor-pointer transition-colors ${
                isAutoRepeat ? "text-[#00d2ff]" : "text-white"
              }`}
            >
              <i className="fa-solid fa-rotate-left text-[#00d2ff] text-[14px]"></i>
              <span>إعادة الصوت تلقائياً</span>
            </div>

            <div className="w-[1px] h-[18px] bg-white/12"></div>

            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-white">
              <div
                className="px-2.5 py-0.5 rounded-md font-['Inter'] text-[13px] text-[#94a3b8] font-medium"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                \
              </div>
              <span>اضغط</span>
              <i className="fa-solid fa-bolt text-[#00d2ff] text-[14px]"></i>
              <span>اختصار سريع:</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StoryReader;