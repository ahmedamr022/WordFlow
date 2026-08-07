import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarClockIcon,
  RepeatIcon,
  RotateCcwIcon,
  SparklesIcon,
  StarIcon,
  Volume2Icon,
  XIcon } from
'lucide-react';
import type { VocabularyWord } from '../../types';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useSpeech } from '../../hooks/useSpeech';
import { STATUS_META, statusOf } from '../../utils/srs';
import { ACCENTS, type AccentToken } from '../../utils/icons';
import { Badge, Bar, ProgressRing, cx } from '../ui/Primitives';

/** Highlights the target word inside its example sentence. */
function Highlighted({ sentence, word }: {sentence: string;word: string;}) {
  const stem = word.replace(/(ed|ing|s)$/i, '');
  const pattern = new RegExp(`(${stem}\\w*)`, 'i');
  const parts = sentence.split(pattern);

  return (
    <span className="font-en text-[13.5px] leading-relaxed text-white/80">
      {parts.map((part, index) =>
      pattern.test(part) && index % 2 === 1 ?
      <mark
        key={index}
        className="bg-transparent font-bold text-brand-cyan">
        
            {part}
          </mark> :

      <React.Fragment key={index}>{part}</React.Fragment>

      )}
    </span>);

}

function ChipList({
  label,
  items,
  className




}: {label: string;items?: string[];className: string;}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11px] text-white/35">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) =>
        <span
          key={item}
          className={cx(
            'rounded-lg border px-2 py-1 font-en text-[11.5px]',
            className
          )}>
          
            {item}
          </span>
        )}
      </div>
    </div>);

}

export interface WordDetailPanelProps {
  word: VocabularyWord;
  accent: AccentToken;
  categoryTitle: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onReview: (word: VocabularyWord) => void;
}

/**
 * The former `/vocabulary/[categoryId]/[wordId]` page, rebuilt as a panel.
 * No route change, no re-fetch, no lost scroll position — and ↑ / ↓ walk the
 * filtered list so a learner can flick through 20 words in a few seconds.
 */
export function WordDetailPanel({
  word,
  accent,
  categoryTitle,
  onClose,
  onPrev,
  onNext,
  onReview
}: WordDetailPanelProps) {
  const { getProgress, toggleFavorite, resetWord } = useVocabulary();
  const { speak, speakingId } = useSpeech();
  const progress = getProgress(word.id);
  const status = statusOf(progress);
  const meta = STATUS_META[status];
  const tone = ACCENTS[accent];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown' && onNext) {
        event.preventDefault();
        onNext();
      }
      if (event.key === 'ArrowUp' && onPrev) {
        event.preventDefault();
        onPrev();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  const nextReview = progress.nextReviewAt ?
  new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long'
  }).format(new Date(progress.nextReviewAt)) :
  'لم تبدأ بعد';

  return (
    <section
      aria-label={`تفاصيل الكلمة ${word.word}`}
      className="flex h-full flex-col">
      
      <div className="flex items-center justify-between gap-2 pb-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[12px] text-white/50 transition hover:text-white">
          
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {categoryTitle}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            aria-label="الكلمة السابقة"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-white/45 transition hover:text-white disabled:opacity-25">
            
            <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            aria-label="الكلمة التالية"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-white/45 transition hover:text-white disabled:opacity-25">
            
            <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق اللوحة"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-white/45 transition hover:text-white">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <motion.div
        key={word.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="wf-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
        
        <div
          className={cx(
            'rounded-2xl border p-4 text-center',
            tone.border,
            tone.bg
          )}>
          
          <div className="flex items-start justify-between">
            <Badge className={meta.className}>{meta.labelAr}</Badge>
            <button
              type="button"
              aria-pressed={progress.favorite}
              aria-label={progress.favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              onClick={() => toggleFavorite(word.id)}
              className={cx(
                'transition',
                progress.favorite ?
                'text-brand-gold' :
                'text-white/30 hover:text-white/70'
              )}>
              
              <StarIcon
                className="h-4 w-4"
                fill={progress.favorite ? 'currentColor' : 'none'}
                aria-hidden="true" />
              
            </button>
          </div>

          <h2 className="mt-1 font-en text-[30px] font-extrabold leading-tight text-white">
            {word.word}
          </h2>
          <p className="mt-1 font-en text-[12px] text-white/40">{word.ipa}</p>
          <p className="mt-2 text-[15px] font-semibold text-white/85">
            {word.translationAr}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge className="border-white/10 bg-white/[0.06] font-en text-white/55">
              {word.partOfSpeech}
            </Badge>
            <Badge className="border-brand-teal/25 bg-brand-teal/10 font-en text-brand-teal">
              {word.cefrLevel}
            </Badge>
            <button
              type="button"
              onClick={() => speak(word.word, word.id)}
              aria-label={`سماع ${word.word}`}
              className={cx(
                'inline-flex h-8 w-8 items-center justify-center rounded-full border transition',
                speakingId === word.id ?
                'border-brand-cyan/50 bg-brand-cyan/20 text-brand-cyan' :
                'border-white/12 bg-white/[0.05] text-white/60 hover:text-white'
              )}>
              
              <Volume2Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-ink-850/70 p-4">
          <p className="mb-2 text-[11px] text-white/35">في سياق</p>
          <Highlighted sentence={word.exampleEn} word={word.word} />
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">
            {word.exampleAr}
          </p>
          <button
            type="button"
            onClick={() => speak(word.exampleEn, `${word.id}-example`)}
            className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-brand-cyan transition hover:brightness-125">
            
            <Volume2Icon className="h-3.5 w-3.5" aria-hidden="true" />
            اسمع الجملة
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-ink-850/70 p-3.5">
            <ProgressRing
              percent={progress.mastery}
              size={78}
              stroke={7}
              color={tone.ring}>
              
              <span className="font-en text-base font-bold text-white">
                {progress.mastery}%
              </span>
            </ProgressRing>
            <p className="mt-2 text-[11px] text-white/40">نسبة الإتقان</p>
          </div>

          <div className="flex flex-col justify-center gap-2.5 rounded-2xl border border-white/[0.06] bg-ink-850/70 p-3.5">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-white/35">
                <RepeatIcon className="h-3 w-3" aria-hidden="true" />
                عدد المراجعات
              </p>
              <p className="font-en text-lg font-bold text-white">
                {progress.repetitions}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-white/35">
                <CalendarClockIcon className="h-3 w-3" aria-hidden="true" />
                المراجعة القادمة
              </p>
              <p className="text-[12.5px] font-semibold text-white/80">
                {nextReview}
              </p>
            </div>
          </div>
        </div>

        {(word.synonyms || word.antonyms || word.collocations) &&
        <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-ink-850/70 p-4">
            <ChipList
            label="مرادفات"
            items={word.synonyms}
            className="border-brand-teal/20 bg-brand-teal/8 text-brand-teal" />
          
            <ChipList
            label="أضداد"
            items={word.antonyms}
            className="border-brand-coral/20 bg-brand-coral/8 text-brand-coral" />
          
            <ChipList
            label="تراكيب شائعة"
            items={word.collocations}
            className="border-white/10 bg-white/[0.04] text-white/60" />
          
          </div>
        }

        {word.note ?
        <p className="flex items-start gap-2 rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.07] p-3.5 text-[12px] leading-relaxed text-brand-gold/90">
            <SparklesIcon
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            aria-hidden="true" />
          
            {word.note}
          </p> :
        null}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/35">
            <span>قوة التذكر</span>
            <span className="font-en">
              كل {Math.max(1, progress.intervalDays)} يوم
            </span>
          </div>
          <Bar percent={progress.mastery} barClassName={tone.bar} />
        </div>
      </motion.div>

      <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={() => onReview(word)}
          className="flex-1 rounded-xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink py-2.5 text-[13px] font-bold text-white shadow-glow-purple transition hover:brightness-110">
          
          راجع هذه الكلمة
        </button>
        <button
          type="button"
          onClick={() => resetWord(word.id)}
          aria-label="إعادة تعيين تقدم الكلمة"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-white/45 transition hover:text-white">
          
          <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="pt-2 text-center text-[10.5px] text-white/25">
        استخدم ↑ ↓ للتنقل بين الكلمات و Esc للإغلاق
      </p>
    </section>);

}