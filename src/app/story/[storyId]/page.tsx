"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { SAMPLE_COURSES } from "@/data/stories";
import { Story } from "@/types";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { SentenceDisplay } from "@/components/typing/SentenceDisplay";
import { AudioControls } from "@/components/typing/AudioControls";
import { TypingStats } from "@/components/typing/TypingStats";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default function StoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const storyId = resolvedParams.storyId;

  const [story, setStory] = useState<Story | null>(null);

  useEffect(() => {
    let foundStory: Story | null = null;
    for (const course of SAMPLE_COURSES) {
      const match = course.stories.find(
        (s) => s.id === storyId || s.id === "titanic"
      );
      if (match) {
        foundStory = match;
        break;
      }
    }
    if (!foundStory && SAMPLE_COURSES.length > 0) {
      foundStory = SAMPLE_COURSES[0].stories[0];
    }
    setStory(foundStory);
  }, [storyId]);

  const { currentLineIndex, currentLine, handleKeyDown, restart } =
    useTypingEngine({
      lines: story?.lines || [],
    });

  useEffect(() => {
    const windowKeyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };
    window.addEventListener("keydown", windowKeyDownHandler);
    return () => window.removeEventListener("keydown", windowKeyDownHandler);
  }, [handleKeyDown]);

  if (!story || !currentLine) {
    return (
      <div className="min-h-screen bg-[#020512] text-white flex items-center justify-center font-['Cairo']">
        <div className="text-xl font-bold text-[#00d2ff] animate-pulse">
          جاري تحميل القصة...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020512] text-white font-['Cairo'] min-h-screen flex flex-col justify-between overflow-x-hidden relative">
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
      <div className="relative z-[2] w-full max-w-[1400px] mx-auto px-[50px] py-[25px] flex flex-col min-h-screen justify-between">
        {/* Header Navigation */}
        <header className="flex justify-between items-center w-full ltr">
          <Link
            href="/stories"
            className="flex items-center gap-2 text-[#a0aec0] text-[14px] font-semibold rtl transition-all hover:text-white hover:translate-x-1"
          >
            <i className="fa-solid fa-arrow-right"></i>
            العودة إلى القصص
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.03]">
            <div
              className="font-['Fredoka'] text-[34px] font-bold tracking-tighter leading-none bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #00d2ff 0%, #3b82f6 45%, #a855f7 100%)",
                filter: "drop-shadow(0 0 12px rgba(0, 210, 255, 0.6))",
              }}
            >
              W
            </div>
            <div className="font-['Inter'] text-[24px] font-extrabold text-white tracking-tight">
              Word
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #ec4899, #f43f5e)",
                }}
              >
                Flow
              </span>
            </div>
          </div>

          {/* All Stories Button */}
          <Link href="/stories">
            <button
              className="flex items-center gap-2.5 px-[20px] py-[8px] rounded-[12px] text-white text-[14px] font-semibold rtl transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(8, 15, 33, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }}
            >
              <i className="fa-regular fa-bookmark text-[16px]"></i>
              <span>جميع القصص</span>
            </button>
          </Link>
        </header>

        {/* Main Interface */}
        <main className="my-[15px] flex flex-col gap-[20px] items-start">
          <SentenceDisplay
            currentLine={currentLine}
            levelBadge={story.cefrLevel || "B1"}
          />

          <AudioControls lineId={currentLine.id} />

          <TypingStats
            currentLineIndex={currentLineIndex}
            totalLines={story.lines.length}
          />
        </main>

        {/* Footer Shortcuts */}
        <footer className="flex justify-center w-full mb-[10px]">
          <div
            className="flex items-center gap-[18px] px-[24px] py-[10px] rounded-full rtl"
            style={{
              background: "rgba(6, 12, 28, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-white">
              <i className="fa-solid fa-bolt text-[#00d2ff] text-[14px]"></i>
              <span>اختصار سريع: اضغط</span>
              <div
                className="px-2.5 py-0.5 rounded-md font-['Inter'] text-[13px] text-[#94a3b8] font-medium"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                \
              </div>
            </div>

            <div className="w-[1px] h-[18px] bg-white/12"></div>

            <div
              onClick={restart}
              className="flex items-center gap-2 text-[13.5px] font-semibold text-white cursor-pointer group"
            >
              <i className="fa-solid fa-rotate-left text-[#00d2ff] text-[14px] transition-transform duration-300 group-hover:-rotate-90"></i>
              <span>إعادة السطر</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}