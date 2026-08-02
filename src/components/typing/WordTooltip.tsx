"use client";

import React from "react";
import { StoryWord } from "@/types";
import { Volume2, X } from "lucide-react";
import { AudioService } from "@/lib/audio/kokoroTTS";

interface WordTooltipProps {
  word: StoryWord;
  onClose?: () => void;
}

export const WordTooltip: React.FC<WordTooltipProps> = ({ word, onClose }) => {
  const playWordAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    AudioService.playText(word.word, 0.9);
  };

  return (
    <div className="w-full max-w-lg mb-6 mx-auto p-4 rounded-2xl glass-card border border-sky-400/40 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 text-right dir-rtl relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center justify-between gap-3 border-b border-slate-700/50 pb-2 mb-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-2xl text-sky-400 font-sans tracking-wide dir-ltr">
            {word.word}
          </span>
          {word.ipa && (
            <span className="font-mono text-xs text-slate-400 font-normal">
              {word.ipa}
            </span>
          )}
        </div>

        <button
          onClick={playWordAudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-400 hover:bg-sky-500/40 transition-all active:scale-95 text-xs font-bold font-sans dir-ltr"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-bold text-white font-arabic">
          {word.translationAr}
        </span>
        {word.partOfSpeech && (
          <span className="bg-sky-400/10 text-sky-300 px-2 py-0.5 rounded text-[11px] font-mono border border-sky-400/20">
            {word.partOfSpeech}
          </span>
        )}
      </div>

      {word.exampleSentence && (
        <div className="mt-2 text-xs border-t border-slate-700/40 pt-2 text-slate-300">
          <p className="font-sans dir-ltr text-sky-200 mb-0.5">
            "{word.exampleSentence}"
          </p>
          {word.exampleTranslation && (
            <p className="font-arabic text-slate-400">{word.exampleTranslation}</p>
          )}
        </div>
      )}
    </div>
  );
};
