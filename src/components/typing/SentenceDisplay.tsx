"use client";

import React, { useRef, useState } from "react";
import { WordTooltip } from "./WordTooltip";

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

export interface LineData {
  id?: string;
  text?: string;
  translation?: string;
  words?: WordData[];
}

interface SentenceDisplayProps {
  currentLine?: LineData;
  levelBadge?: string;
}

export const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  currentLine,
  levelBadge = "B1",
}) => {
  const sentenceSectionRef = useRef<HTMLDivElement>(null);
  const hideCardTimeout = useRef<NodeJS.Timeout | null>(null);

  const words = currentLine?.words || [];
  const arabicTranslation = currentLine?.translation || "";

  const [activeCard, setActiveCard] = useState({
    visible: false,
    word: "",
    pos: "",
    meaning: "",
    hint: "",
    left: 0,
    top: 0,
  });

  const showPopCard = (wordObj: WordData, targetEl: HTMLElement) => {
    if (hideCardTimeout.current) clearTimeout(hideCardTimeout.current);

    if (sentenceSectionRef.current) {
      const wordRect = targetEl.getBoundingClientRect();
      const sectionRect = sentenceSectionRef.current.getBoundingClientRect();

      const leftPos = wordRect.left - sectionRect.left;
      const topPos = wordRect.top - sectionRect.top - 130;

      setActiveCard({
        visible: true,
        word: wordObj.word || wordObj.text || "",
        pos: wordObj.pos || "Word",
        meaning: wordObj.meaning || "",
        hint: wordObj.hint || "",
        left: Math.max(0, leftPos),
        top: topPos,
      });
    }
  };

  const hidePopCard = () => {
    hideCardTimeout.current = setTimeout(() => {
      setActiveCard((prev) => ({ ...prev, visible: false }));
    }, 200);
  };

  return (
    <div
      className="relative w-full max-w-[580px] flex flex-col items-start text-left ltr"
      ref={sentenceSectionRef}
    >
      {/* Level Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-['Inter'] text-[12px] font-bold text-[#a5b4fc] mb-3 ltr"
        style={{
          background: "rgba(20, 30, 60, 0.6)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        <i className="fa-solid fa-paper-plane text-[10px]"></i>
        {levelBadge}
      </div>

      {/* English Sentence */}
      <h1
        className="font-['Inter'] text-[46px] font-extrabold leading-[1.2] text-white tracking-tight mb-4 ltr text-left flex flex-wrap gap-x-3"
        style={{
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
        }}
      >
        {words.length > 0 ? (
          words.map((w, idx) => {
            const wordText = w.text || w.word || "";
            const isCyan = w.isCyan;
            const isPurple = w.isPurple;

            return (
              <span
                key={idx}
                className={`relative cursor-pointer transition-all duration-200 inline-block ${
                  isCyan
                    ? "text-[#00d2ff] border-b-4 border-[#00d2ff] pb-0.5"
                    : isPurple
                    ? "text-[#a855f7] border-b-4 border-[#a855f7] pb-0.5"
                    : "hover:bg-white/10 rounded-md"
                }`}
                onMouseEnter={(e) => showPopCard(w, e.currentTarget)}
                onMouseLeave={hidePopCard}
                onClick={(e) => {
                  e.stopPropagation();
                  showPopCard(w, e.currentTarget);
                }}
              >
                {w.hasCaret ? (
                  <>
                    <span className="relative inline-block after:content-[''] after:absolute after:-bottom-[2px] after:left-0 after:w-full after:h-[3px] after:bg-[#00d2ff] after:rounded-full after:animate-pulse">
                      {wordText.charAt(0)}
                    </span>
                    {wordText.slice(1)}
                  </>
                ) : (
                  wordText
                )}
              </span>
            );
          })
        ) : (
          <span>{currentLine?.text}</span>
        )}
      </h1>

      {/* Pop Card Tooltip */}
      <WordTooltip
        word={activeCard.word}
        pos={activeCard.pos}
        meaning={activeCard.meaning}
        hint={activeCard.hint}
        active={activeCard.visible}
        left={activeCard.left}
        top={activeCard.top}
        onMouseEnter={() => {
          if (hideCardTimeout.current) clearTimeout(hideCardTimeout.current);
        }}
        onMouseLeave={hidePopCard}
      />

      {/* Arabic Translation */}
      {arabicTranslation && (
        <div className="flex flex-col items-start gap-2 text-[24px] font-bold text-[#00d2ff] rtl text-right">
          <span style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.9)" }}>
            {arabicTranslation}
          </span>
          <div
            className="w-[60px] h-[3px] rounded-full"
            style={{
              background: "linear-gradient(90deg, #00d2ff, #a855f7)",
              boxShadow: "0 0 10px #00d2ff",
            }}
          />
        </div>
      )}
    </div>
  );
};