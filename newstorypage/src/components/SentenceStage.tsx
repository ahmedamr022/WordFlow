import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { WordCard } from './WordCard';
import type { Sentence } from '../types/story';

interface SentenceStageProps {
  sentence: Sentence;
  level: string;
  activeToken: number;
  typed: string;
}

export function SentenceStage({ sentence, level, activeToken, typed }: SentenceStageProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const target = sentence.tokens.map((token) => token.text).join(' ');
  const cursor = typed.length;
  /** When the next expected character is the space between words, park the caret on the next letter. */
  const caretIndex = target[cursor] === ' ' ? cursor + 1 : cursor;

  let offset = 0;

  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2.5 rounded-xl border border-sky-400/35 bg-sky-500/10 px-3.5 py-1.5 shadow-[0_0_25px_-10px_rgba(56,189,248,0.8)]">
        <span className="font-latin text-sm font-bold tracking-wide text-sky-100">{level}</span>
        <SparklesIcon className="h-4 w-4 text-sky-300" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sentence.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          
          <h1
            dir="ltr"
            className="font-latin mt-5 flex max-w-xl flex-wrap gap-x-3.5 gap-y-3 text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-[3.3rem]">
            
            {sentence.tokens.map((token, index) => {
              const start = offset;
              offset += token.text.length + 1;
              const wordTyped = cursor >= start + token.text.length;
              const isPlayingWord = activeToken === index;

              return (
                <span
                  key={`${sentence.id}-${index}`}
                  className="relative"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}>
                  
                  <button
                    type="button"
                    onFocus={() => setHovered(index)}
                    onBlur={() => setHovered(null)}
                    aria-label={`معنى ${token.text}`}
                    className="cursor-pointer rounded-md focus:outline-none">
                    
                    {token.text.split('').map((letter, letterIndex) => {
                      const globalIndex = start + letterIndex;
                      const isTyped = globalIndex < cursor;
                      const isWrong = isTyped && typed[globalIndex] !== target[globalIndex];
                      const isCaret = globalIndex === caretIndex;

                      return (
                        <span key={letterIndex} className="relative inline-block">
                          <span
                            className={[
                            'transition-colors duration-150',
                            isWrong ?
                            'text-rose-400' :
                            isTyped ?
                            'text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]' :
                            isPlayingWord || hovered === index ?
                            'text-slate-300' :
                            'text-slate-500/70'].
                            join(' ')}>
                            
                            {letter}
                          </span>

                          {isCaret &&
                          <motion.span
                            layoutId={`caret-${sentence.id}`}
                            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                            className="absolute -bottom-1.5 left-0 h-[4px] w-full overflow-hidden rounded-full bg-accent-cyan/25"
                            aria-hidden="true">
                            
                              <motion.span
                              className="block h-full w-1/2 rounded-full bg-accent-cyan shadow-[0_0_14px_2px_rgba(34,211,238,0.85)]"
                              animate={{ x: ['-15%', '115%'] }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
                            
                            </motion.span>
                          }
                        </span>);

                    })}
                  </button>

                  {wordTyped &&
                  <span
                    className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-white/15"
                    aria-hidden="true" />

                  }

                  <div className="pointer-events-none absolute bottom-[calc(100%+1rem)] left-1/2 z-30 -translate-x-1/2">
                    <AnimatePresence>
                      {hovered === index && <WordCard key="card" token={token} />}
                    </AnimatePresence>
                  </div>
                </span>);

            })}
          </h1>

          <p dir="rtl" className="mt-8 w-fit text-xl font-bold text-sky-300/90 sm:text-[1.45rem]">
            {sentence.arabic}
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className="ml-16 mt-4 h-[3px] w-14 rounded-full"
        style={{ backgroundImage: 'linear-gradient(90deg,#22d3ee,#a855f7)' }}
        aria-hidden="true" />
      
    </div>);

}