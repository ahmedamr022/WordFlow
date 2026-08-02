"use client";

import React, { useState } from "react";
import { StoryLine, StoryWord } from "@/types";
import { WordTooltip } from "./WordTooltip";
import { AudioService } from "@/lib/audio/kokoroTTS";

interface SentenceDisplayProps {
  currentLine: StoryLine;
  typedChars: string;
  errors: boolean[];
  currentIndex: number;
}

export const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  currentLine,
  typedChars,
  errors,
  currentIndex,
}) => {
  const [hoveredWord, setHoveredWord] = useState<StoryWord | null>(null);

  const handleWordClick = (word: StoryWord) => {
    AudioService.playWord(word.word, 1.0);
  };

  const fullText = currentLine.text || "";
  const tokens = fullText.split(/(\s+)/);

  let globalCharIndex = 0;

  return (
    <div className="relative w-full my-6 text-center select-none flex flex-col items-center">
      {/* Tooltip Box Container */}
      <div className="h-16 flex items-center justify-center mb-2 w-full">
        {hoveredWord ? (
          <div className="animate-in fade-in zoom-in-95 duration-150">
            <WordTooltip word={hoveredWord} />
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-arabic">قف على أي كلمة لعرض الترجمة والنطق</div>
        )}
      </div>

      {/* English Sentence Display STRICT LTR */}
      <div
        dir="ltr"
        className="text-3xl md:text-5xl font-extrabold tracking-wide leading-relaxed font-sans text-slate-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-left"
        style={{ direction: "ltr", unicodeBidi: "isolate" }}
      >
        {tokens.map((token, tokenIdx) => {
          if (!token) return null;

          // If token is whitespace
          if (/^\s+$/.test(token)) {
            const spaceChars = token.split("");
            return (
              <span key={`space-${tokenIdx}`} className="inline-flex">
                {spaceChars.map((char) => {
                  const charIdx = globalCharIndex++;
                  const isTyped = charIdx < typedChars.length;
                  const isCurrent = charIdx === currentIndex;
                  const isError = errors[charIdx];

                  let charClass = "char-pending";
                  if (isTyped) {
                    charClass = isError ? "char-incorrect" : "char-correct";
                  }

                  return (
                    <span
                      key={`char-${charIdx}`}
                      className={`inline-block whitespace-pre transition-colors duration-150 ${charClass} ${
                        isCurrent ? "char-cursor" : ""
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          }

          // Word token: check if it matches a vocabulary word in currentLine.words or fallback to auto-word
          const rawWord = token.replace(/[^a-zA-Z0-9]/g, "");
          const cleanWord = rawWord.toLowerCase();
          const matchedWordObj: StoryWord | null =
            currentLine.words?.find((w) => w.word.toLowerCase() === cleanWord) ||
            (rawWord
              ? {
                  id: `auto-${cleanWord}-${tokenIdx}`,
                  word: rawWord,
                  translationAr: "استمع للنطق الصوتي 🔊",
                  ipa: "",
                  partOfSpeech: "",
                  cefrLevel: "A1",
                }
              : null);

          const chars = token.split("");

          return (
            <span
              key={`token-${tokenIdx}`}
              className="inline-flex whitespace-nowrap px-1 py-0.5 rounded-lg transition-colors hover:bg-slate-800/80 cursor-pointer text-slate-200"
              onMouseEnter={() => matchedWordObj && setHoveredWord(matchedWordObj)}
              onMouseLeave={() => setHoveredWord(null)}
              onClick={() => matchedWordObj && AudioService.playWord(matchedWordObj.word, 1.0)}
            >
              {chars.map((char) => {
                const charIdx = globalCharIndex++;
                const isTyped = charIdx < typedChars.length;
                const isCurrent = charIdx === currentIndex;
                const isError = errors[charIdx];

                let charClass = "char-pending";
                if (isTyped) {
                  charClass = isError ? "char-incorrect" : "char-correct";
                }

                return (
                  <span
                    key={`char-${charIdx}`}
                    className={`inline-block transition-colors duration-150 ${charClass} ${
                      isCurrent ? "char-cursor" : ""
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>

      {/* Arabic Translation Subtitle RTL */}
      <div className="mt-6 text-xl md:text-2xl font-arabic font-bold text-sky-400 tracking-wide dir-rtl">
        {currentLine.translationAr}
      </div>
    </div>
  );
};
