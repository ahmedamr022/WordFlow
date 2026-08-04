import React, { useEffect, useRef, useState } from 'react';
import {
  AlignJustifyIcon,
  ChevronDownIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  SlidersHorizontalIcon,
  CheckIcon } from
'lucide-react';
import type { Voice } from '../types/story';

interface PlaybackControlsProps {
  voices: Voice[];
  voice: Voice;
  onVoiceChange: (voice: Voice) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
}

export function PlaybackControls({
  voices,
  voice,
  onVoiceChange,
  isPlaying,
  onTogglePlay,
  onReplay
}: PlaybackControlsProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex flex-row-reverse items-center gap-3 rounded-full border border-white/12 bg-black/45 py-2.5 pl-4 pr-3 text-sm text-white transition-colors hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60">
          
          <ChevronDownIcon
            className={`h-4 w-4 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
          
          <span className="font-latin font-semibold">{voice.label}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
            <MicIcon className="h-3.5 w-3.5 text-white" />
          </span>
        </button>

        {open &&
        <ul
          role="listbox"
          className="glass-panel absolute bottom-full z-30 mb-2 w-full min-w-[12rem] overflow-hidden rounded-2xl border border-white/12 p-1.5">
          
            {voices.map((option) =>
          <li key={option.id}>
                <button
              type="button"
              role="option"
              aria-selected={option.id === voice.id}
              onClick={() => {
                onVoiceChange(option);
                setOpen(false);
              }}
              className="flex w-full flex-row-reverse items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10">
              
                  <span className="flex flex-row-reverse items-center gap-2 font-latin font-medium">
                    {option.label}
                    {option.id === voice.id && <CheckIcon className="h-4 w-4 text-accent-cyan" />}
                  </span>
                  <span className="font-latin text-xs text-white/40">{option.locale}</span>
                </button>
              </li>
          )}
          </ul>
        }
      </div>

      <button
        type="button"
        onClick={onTogglePlay}
        className="glow-button flex flex-row-reverse items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{ backgroundImage: 'linear-gradient(90deg,#4f46e5,#c026d3)' }}>
        
        <SlidersHorizontalIcon className="h-4 w-4 opacity-80" />
        <AlignJustifyIcon className={`h-4 w-4 opacity-80 ${isPlaying ? 'animate-pulse' : ''}`} />
        <span>{isPlaying ? 'إيقاف الاستماع' : 'استمع للجملة'}</span>
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </button>

      <button
        type="button"
        onClick={onReplay}
        className="flex flex-row-reverse items-center gap-2.5 rounded-full border border-white/12 bg-black/45 px-5 py-3 text-sm font-bold text-white/90 transition-colors hover:border-white/25 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60">
        
        <RotateCwIcon className="h-4 w-4 text-white/80" />
        <span>إعادة الجملة</span>
      </button>
    </div>);

}