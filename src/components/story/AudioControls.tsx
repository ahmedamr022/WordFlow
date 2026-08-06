"use client";


import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlignJustifyIcon,
  CheckIcon,
  ChevronDownIcon,
  GaugeIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  SlidersHorizontalIcon } from
"lucide-react";

import { PLAYBACK_SPEEDS } from "@/lib/audio/playbackRate";

/**
 * أزرار الصوت: تشغيل/إيقاف، السرعة، الصوت.
 *
 * السرعات الآن `1 / 0.75 / 0.5` (كانت 0.75 / 1 / 1.25). الأسرع من الطبيعي لا
 * معنى له لمتعلّم يكتب مع الصوت — المطلوب دائماً هو الإبطاء.
 * السرعة تُطبَّق فعلياً على الصوت عبر `setGlobalPlaybackRate` في الصفحة.
 */

export interface StoryVoice {
  id: string;
  label: string;
  locale: string;
  folder: string;
}

export const STORY_VOICES: StoryVoice[] = [
{ id: "voice_alice", label: "Alice (US)", locale: "en-US", folder: "voice_alice" },
{ id: "voice_sarah", label: "Sarah (UK)", locale: "en-GB", folder: "voice_sarah" }];


export interface AudioControlsProps {
  voice: StoryVoice;
  onVoiceChange: (voice: StoryVoice) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function AudioControls({
  voice,
  onVoiceChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange
}: AudioControlsProps) {
  const [openVoice, setOpenVoice] = useState(false);
  const [openSpeed, setOpenSpeed] = useState(false);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);
  const speedDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target as Node)) {
        setOpenVoice(false);
      }
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(event.target as Node)) {
        setOpenSpeed(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-start gap-3.5">
      <button
        type="button"
        onClick={onTogglePlay}
        className="flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.75)] transition-transform hover:scale-[1.02] active:scale-[0.99]"
        style={{ backgroundImage: "linear-gradient(90deg,#4f46e5,#c026d3)" }}>

        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        <span>{isPlaying ? "إيقاف الاستماع" : "استمع للجملة"}</span>
        <AlignJustifyIcon className={`h-4 w-4 opacity-80 ${isPlaying ? "animate-pulse" : ""}`} />
        <SlidersHorizontalIcon className="h-4 w-4 opacity-80" />
      </button>

      {/* Speed Selector */}
      <div className="relative" ref={speedDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setOpenSpeed(!openSpeed);
            setOpenVoice(false);
          }}
          aria-expanded={openSpeed}
          className="flex items-center gap-2.5 rounded-full border border-white/12 bg-black/45 px-5 py-3 text-sm font-bold text-white/90 transition-colors hover:border-white/25 hover:bg-black/60">

          <GaugeIcon className="h-4 w-4 text-[#22d3ee]" />
          <span>
            السرعة: <span className="font-en">{playbackSpeed}x</span>
          </span>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-white/50 transition-transform ${
            openSpeed ? "rotate-180" : ""}`
            } />

        </button>

        <AnimatePresence>
          {openSpeed &&
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-40 mb-3.5 w-36 overflow-hidden rounded-2xl border border-white/15 bg-[#090e1b]/90 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

              {PLAYBACK_SPEEDS.map((speed) =>
            <li key={speed}>
                  <button
                type="button"
                onClick={() => {
                  onSpeedChange(speed);
                  setOpenSpeed(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                playbackSpeed === speed ?
                "bg-white/15 text-[#22d3ee]" :
                "text-white/80 hover:bg-white/10"}`
                }>

                    <span className="font-en">{speed}x</span>
                    {playbackSpeed === speed &&
                <CheckIcon className="h-3.5 w-3.5 text-[#22d3ee]" />
                }
                  </button>
                </li>
            )}
            </motion.ul>
          }
        </AnimatePresence>
      </div>

      {/* Voice Dropdown */}
      <div className="relative" ref={voiceDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setOpenVoice(!openVoice);
            setOpenSpeed(false);
          }}
          aria-expanded={openVoice}
          className="flex items-center gap-3 rounded-full border border-white/12 bg-black/45 py-2.5 pl-3 pr-4 text-sm text-white transition-colors hover:border-white/25 hover:bg-black/60">

          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
            <MicIcon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-en font-semibold">{voice.label}</span>
          <ChevronDownIcon
            className={`h-4 w-4 text-white/50 transition-transform ${
            openVoice ? "rotate-180" : ""}`
            } />

        </button>

        <AnimatePresence>
          {openVoice &&
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-40 mb-3.5 w-48 overflow-hidden rounded-2xl border border-white/15 bg-[#090e1b]/90 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

              {STORY_VOICES.map((option) =>
            <li key={option.id}>
                  <button
                type="button"
                onClick={() => {
                  onVoiceChange(option);
                  setOpenVoice(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                option.id === voice.id ?
                "bg-white/15 text-white" :
                "text-white/80 hover:bg-white/10"}`
                }>

                    <span className="font-en flex items-center gap-2 font-semibold">
                      {option.id === voice.id &&
                  <CheckIcon className="h-3.5 w-3.5 text-[#22d3ee]" />
                  }
                      {option.label}
                    </span>
                    <span className="font-en text-[10px] opacity-50">{option.locale}</span>
                  </button>
                </li>
            )}
            </motion.ul>
          }
        </AnimatePresence>
      </div>
    </div>);

}

export default AudioControls;