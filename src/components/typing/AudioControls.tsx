"use client";

import React, { useState } from "react";

export interface AudioControlsProps {
  lineId?: string;
}

const VOICES = ["Laura US", "John UK", "Sarah AU"];

export const AudioControls: React.FC<AudioControlsProps> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceIdx, setVoiceIdx] = useState(0);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  const nextVoice = () => {
    setVoiceIdx((prev) => (prev + 1) % VOICES.length);
  };

  return (
    <div className="flex items-center gap-3 ltr mt-1 justify-start w-full max-w-[580px]">
      {/* Voice Selector */}
      <button
        onClick={nextVoice}
        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-white font-['Inter'] text-[14px] font-semibold transition-all hover:bg-white/10"
        style={{
          background: "rgba(13, 22, 45, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <i className="fa-solid fa-microphone text-[#00d2ff] text-[14px]"></i>
        <span>{VOICES[voiceIdx]}</span>
        <i className="fa-solid fa-chevron-down text-[#94a3b8] text-[11px]"></i>
      </button>

      {/* Main Play Button */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-3 px-7 py-3 rounded-2xl text-white text-[15px] font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
        style={{
          background: "linear-gradient(90deg, #a855f7 0%, #3b82f6 50%, #00d2ff 100%)",
          boxShadow: "0 0 25px rgba(168, 85, 247, 0.4)",
        }}
      >
        <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} text-[13px]`}></i>
        <span>{isPlaying ? "إيقاف مؤقت" : "استمع للجملة"}</span>
        <div className="flex items-center gap-2 opacity-80 ml-1">
          <i className="fa-solid fa-bars-staggered text-[13px]"></i>
          <i className="fa-solid fa-sliders text-[13px]"></i>
        </div>
      </button>

      {/* Repeat Button */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-[14px] font-bold transition-all hover:bg-white/10"
        style={{
          background: "rgba(13, 22, 45, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span>إعادة الجملة</span>
        <i className="fa-solid fa-rotate-right text-[#cbd5e1] text-[13px]"></i>
      </button>
    </div>
  );
};