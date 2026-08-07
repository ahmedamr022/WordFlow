import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  HourglassIcon,
  StarIcon,
  Volume2Icon } from
'lucide-react';
import type { VocabularyWord } from '../../types';
import { useVocabulary } from '../../hooks/useVocabulary';
import { STATUS_META, statusOf } from '../../utils/srs';
import { ACCENTS, type AccentToken } from '../../utils/icons';
import { Badge, ProgressRing, cx } from '../ui/Primitives';

interface WordRowProps {
  word: VocabularyWord;
  accent: AccentToken;
  selected: boolean;
  onSelect: () => void;
  onPlay: () => void;
  speaking: boolean;
  index?: number;
}

/**
 * Selecting a word NEVER navigates — it opens the right-side detail panel.
 * That keeps the list, its filters and its scroll position intact, which is
 * what made the old per-word page feel slow.
 */
export function WordRow({
  word,
  accent,
  selected,
  onSelect,
  onPlay,
  speaking,
  index = 0
}: WordRowProps) {
  const { getProgress, toggleFavorite, markLearning } = useVocabulary();
  const progress = getProgress(word.id);
  const status = statusOf(progress);
  const meta = STATUS_META[status];
  const tone = ACCENTS[accent];

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 10) * 0.03 }}>
      
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cx(
          'flex cursor-pointer items-center gap-3 rounded-2xl border bg-ink-850/70 p-3 transition',
          selected ?
          'border-brand-purple/45 bg-brand-purple/[0.08] shadow-glow-purple' :
          'border-white/[0.06] hover:border-white/[0.14] hover:bg-ink-800/60'
        )}>
        
        <span className="relative shrink-0">
          <ProgressRing
            percent={progress.mastery}
            size={44}
            stroke={4}
            color={tone.ring}>
            
            <span className="font-en text-[10px] font-bold text-white/70">
              {progress.mastery}
            </span>
          </ProgressRing>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-en text-[17px] font-bold leading-none text-white">
              {word.word}
            </span>
            <Badge className="border-white/10 bg-white/[0.05] font-en text-white/45">
              {word.partOfSpeech}
            </Badge>
            <Badge className="border-brand-teal/25 bg-brand-teal/10 font-en text-brand-teal">
              {word.cefrLevel}
            </Badge>
          </div>
          <p className="mt-1 truncate text-[13px] text-white/55">
            {word.translationAr}
          </p>
        </div>

        <p className="hidden min-w-0 flex-[1.4] text-[12px] leading-relaxed text-white/40 md:block">
          <span className="block truncate font-en text-white/60">
            {word.exampleEn}
          </span>
          <span className="block truncate">{word.exampleAr}</span>
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label={`سماع ${word.word}`}
            onClick={(event) => {
              event.stopPropagation();
              onPlay();
            }}
            className={cx(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition',
              speaking ?
              'border-brand-cyan/40 bg-brand-cyan/15 text-brand-cyan' :
              'border-white/[0.07] bg-white/[0.03] text-white/50 hover:text-white'
            )}>
            
            <Volume2Icon className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={progress.favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-pressed={progress.favorite}
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(word.id);
            }}
            className={cx(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition',
              progress.favorite ?
              'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' :
              'border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white'
            )}>
            
            <StarIcon
              className="h-4 w-4"
              fill={progress.favorite ? 'currentColor' : 'none'}
              aria-hidden="true" />
            
          </button>

          {status === 'mastered' ?
          <Badge className={cx('gap-1 px-2.5 py-1.5', meta.className)}>
              <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              متقنة
            </Badge> :
          status === 'due' ?
          <Badge className={cx('gap-1 px-2.5 py-1.5', meta.className)}>
              <HourglassIcon className="h-3.5 w-3.5" aria-hidden="true" />
              مراجعة
            </Badge> :

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              markLearning(word.id);
            }}
            className="rounded-lg border border-brand-purple/30 bg-brand-purple/12 px-3 py-1.5 text-[11px] font-semibold text-brand-purple transition hover:bg-brand-purple/22">
            
              تعلم
            </button>
          }
        </div>
      </div>
    </motion.li>);

}

/* ------------------------------------------------------------------ */

export function WordTile({
  word,
  accent,
  selected,
  onSelect,
  onPlay,
  speaking,
  index = 0
}: WordRowProps) {
  const { getProgress, toggleFavorite } = useVocabulary();
  const progress = getProgress(word.id);
  const status = statusOf(progress);
  const meta = STATUS_META[status];
  const tone = ACCENTS[accent];

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 10) * 0.03 }}>
      
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cx(
          'flex h-full cursor-pointer flex-col rounded-2xl border bg-ink-850/70 p-4 transition',
          selected ?
          'border-brand-purple/45 bg-brand-purple/[0.08] shadow-glow-purple' :
          'border-white/[0.06] hover:border-white/[0.14] hover:bg-ink-800/60'
        )}>
        
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-en text-lg font-bold leading-tight text-white">
              {word.word}
            </p>
            <p className="mt-1 text-[13px] text-white/55">
              {word.translationAr}
            </p>
          </div>
          <button
            type="button"
            aria-label={progress.favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(word.id);
            }}
            className={cx(
              'shrink-0 transition',
              progress.favorite ?
              'text-brand-gold' :
              'text-white/25 hover:text-white/60'
            )}>
            
            <StarIcon
              className="h-4 w-4"
              fill={progress.favorite ? 'currentColor' : 'none'}
              aria-hidden="true" />
            
          </button>
        </div>

        <p className="mt-3 line-clamp-2 font-en text-[11.5px] leading-relaxed text-white/40">
          {word.exampleEn}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <Badge className={meta.className}>{meta.labelAr}</Badge>
          <div className="flex items-center gap-1.5">
            <span
              className={cx('font-en text-[11px] font-bold', tone.text)}
              aria-label={`نسبة الإتقان ${progress.mastery} بالمئة`}>
              
              {progress.mastery}%
            </span>
            <button
              type="button"
              aria-label={`سماع ${word.word}`}
              onClick={(event) => {
                event.stopPropagation();
                onPlay();
              }}
              className={cx(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition',
                speaking ?
                'border-brand-cyan/40 bg-brand-cyan/15 text-brand-cyan' :
                'border-white/[0.07] bg-white/[0.03] text-white/50 hover:text-white'
              )}>
              
              <Volume2Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.li>);

}