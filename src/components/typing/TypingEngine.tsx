"use client";

import React from "react";
import { StoryLine } from "@/types";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { SentenceDisplay } from "./SentenceDisplay";
import { AudioControls } from "./AudioControls";
import { TypingStats } from "./TypingStats";

interface TypingEngineProps {
  lines: StoryLine[];
  onComplete?: () => void;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({ lines, onComplete }) => {
  const {
    currentLineIndex,
    currentLine,
    typedChars,
    errors,
    currentIndex,
    metrics,
    handleKeyDown,
  } = useTypingEngine({ lines, onComplete });

  React.useEffect(() => {
    const windowKeyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };
    window.addEventListener("keydown", windowKeyDownHandler);
    return () => {
      window.removeEventListener("keydown", windowKeyDownHandler);
    };
  }, [handleKeyDown]);

  if (!currentLine) return null;

  return (
    <div className="w-full flex flex-col gap-5 items-start text-left ml-0 mr-auto ltr">
      <div className="sentence-section w-full max-w-[680px] flex flex-col items-start relative text-left">
        <SentenceDisplay
          currentLine={currentLine}
          typedChars={typedChars}
          errors={errors}
          currentIndex={currentIndex}
        />
      </div>

      <AudioControls lineId={currentLine.id} />

      <TypingStats
        metrics={metrics}
        currentLineIndex={currentLineIndex}
        totalLines={lines.length}
      />
    </div>
  );
};