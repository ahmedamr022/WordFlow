import React from 'react';
import { motion } from 'framer-motion';
import { Volume2Icon } from 'lucide-react';
import type { Token } from '../types/story';

interface WordCardProps {
  token: Token;
}

export function WordCard({ token }: WordCardProps) {
  const clean = token.text.replace(/[.,!?]$/, '');
  const stem = token.suffix && clean.endsWith(token.suffix) ?
  clean.slice(0, clean.length - token.suffix.length) :
  clean;
  const suffix = token.suffix && clean.endsWith(token.suffix) ? token.suffix : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      role="tooltip"
      className="pointer-events-auto w-[15rem] rounded-2xl border border-sky-400/25 bg-[#0a1020]/95 p-4 shadow-[0_20px_60px_-18px_rgba(2,8,23,0.95)] backdrop-blur-xl">
      
      <div className="flex flex-row-reverse items-start justify-between gap-3">
        <button
          type="button"
          aria-label={`استمع إلى ${clean}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-sky-300 ring-1 ring-sky-400/30 transition-colors hover:bg-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan">
          
          <Volume2Icon className="h-4 w-4" />
        </button>

        <p dir="ltr" className="font-latin text-lg font-bold text-white">
          {stem}
          {suffix && <span className="text-emerald-300">{suffix}</span>}
        </p>
      </div>

      {token.pos &&
      <div className="mt-3 flex justify-end">
          <span className="rounded-full bg-violet-500/25 px-3 py-1 text-[11px] font-bold text-violet-100 ring-1 ring-violet-400/30">
            {token.posAr} / <span className="font-latin">{token.pos}</span>
          </span>
        </div>
      }

      <div className="mt-3 h-px w-full bg-white/10" />

      <p dir="rtl" className="mt-3 text-right text-[15px] font-bold text-sky-300">
        {token.translation}
      </p>
      {token.hint &&
      <p dir="rtl" className="mt-1 text-right text-xs text-white/50">
          {token.hint}
        </p>
      }
    </motion.div>);

}