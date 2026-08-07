import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  EyeIcon,
  LightbulbIcon,
  SkipForwardIcon,
  StarIcon,
  Volume2Icon } from
'lucide-react';
import type { ReviewGrade, VocabularyWord } from '../../types';
import { GRADES, GRADE_META } from '../../utils/srs';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useSpeech } from '../../hooks/useSpeech';
import { Modal, cx } from '../ui/Primitives';

function ExampleSentence({ word }: {word: VocabularyWord;}) {
  const stem = word.word.replace(/(ed|ing|s)$/i, '');
  const pattern = new RegExp(`(${stem}\\w*)`, 'i');
  const parts = word.exampleEn.split(pattern);

  return (
    <>
      <p className="font-en text-[15px] leading-relaxed text-white/85">
        {parts.map((part, index) =>
        pattern.test(part) && index % 2 === 1 ?
        <mark key={index} className="bg-transparent font-bold text-brand-purple">
              {part}
            </mark> :

        <React.Fragment key={index}>{part}</React.Fragment>

        )}
      </p>
      <p className="mt-1.5 text-[13px] text-white/45">{word.exampleAr}</p>
    </>);

}

export function ReviewSessionModal({
  open,
  word,
  index,
  total,
  onGrade,
  onSkip,
  onFinish








}: {open: boolean;word: VocabularyWord | undefined;index: number;total: number;onGrade: (grade: ReviewGrade) => void;onSkip: () => void;onFinish: () => void;}) {
  const { getProgress, toggleFavorite } = useVocabulary();
  const { speak, speakingId } = useSpeech();
  const [revealed, setRevealed] = useState(false);

  // Every new card starts hidden: recall first, then self-assess.
  useEffect(() => {
    setRevealed(false);
  }, [word?.id]);

  useEffect(() => {
    if (!open || !word) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        setRevealed(true);
        return;
      }
      if (!revealed) return;
      const match = GRADES.find((grade) => GRADE_META[grade].hotkey === event.key);
      if (match) {
        event.preventDefault();
        onGrade(match);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onSkip();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, word, revealed, onGrade, onSkip]);

  if (!word) return null;
  const favorite = getProgress(word.id).favorite;

  return (
    <Modal
      open={open}
      onClose={onFinish}
      labelledBy="review-session-word"
      maxWidth="max-w-[560px]"
      dismissible={false}>
      
      <div className="px-6 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-1.5 text-[13px] text-white/55 transition hover:text-white">
            
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            إنهاء الجلسة
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 text-[12px] text-white/35 transition hover:text-white/70">
            
            <SkipForwardIcon className="h-3.5 w-3.5" aria-hidden="true" />
            لاحقاً
          </button>
        </div>

        <div
          className="mt-4 flex gap-1.5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-label="تقدم الجلسة">
          
          {Array.from({ length: Math.min(total, 12) }).map((_, slot) => {
            const scale = total / Math.min(total, 12);
            const done = slot < Math.round((index + 1) / scale);
            return (
              <span
                key={slot}
                className={cx(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  done ? 'bg-brand-purple' : 'bg-white/[0.08]'
                )} />);


          })}
        </div>

        <p className="mt-2.5 text-center font-en text-[13px] text-white/50">
          {index + 1} / {total}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={word.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}>
            
            <div className="relative mt-4 text-center">
              <button
                type="button"
                aria-pressed={favorite}
                aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                onClick={() => toggleFavorite(word.id)}
                className={cx(
                  'absolute left-0 top-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border transition',
                  favorite ?
                  'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' :
                  'border-white/[0.09] bg-white/[0.03] text-white/45 hover:text-white'
                )}>
                
                <StarIcon
                  className="h-4 w-4"
                  fill={favorite ? 'currentColor' : 'none'}
                  aria-hidden="true" />
                
              </button>

              <h2
                id="review-session-word"
                className="font-en text-[42px] font-extrabold leading-tight text-white">
                
                {word.word}
              </h2>

              <span className="mt-2 inline-flex rounded-lg border border-brand-purple/35 bg-brand-purple/15 px-3 py-1 font-en text-[12px] font-semibold text-brand-purple">
                {word.partOfSpeech}
              </span>

              <p
                className={cx(
                  'mt-3 text-[19px] font-semibold text-white/90 transition',
                  revealed ? '' : 'select-none blur-md'
                )}>
                
                {word.translationAr}
              </p>

              <button
                type="button"
                onClick={() => speak(word.word, word.id)}
                aria-label={`سماع ${word.word}`}
                className={cx(
                  'mx-auto mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full border transition',
                  speakingId === word.id ?
                  'border-brand-cyan/50 bg-brand-cyan/20 text-brand-cyan' :
                  'border-brand-purple/35 bg-brand-purple/12 text-brand-purple hover:bg-brand-purple/20'
                )}>
                
                <Volume2Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative mt-5">
              <div
                className={cx(
                  'rounded-2xl border border-white/[0.07] bg-ink-800/60 px-5 py-4 text-center transition',
                  revealed ? '' : 'select-none blur-md'
                )}>
                
                <ExampleSentence word={word} />
              </div>

              {!revealed ?
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-ink-850/40 text-[13px] font-semibold text-white backdrop-blur-[2px] transition hover:bg-ink-850/20">
                
                  <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  اظهر المعنى
                  <span className="text-[10.5px] font-normal text-white/45">
                    اضغط مسافة
                  </span>
                </button> :
              null}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-purple/40 to-transparent" />
          <span className="text-[13px] font-semibold text-white/70">
            هل تتذكر هذه الكلمة؟
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {GRADES.map((grade) => {
            const meta = GRADE_META[grade];
            return (
              <button
                key={grade}
                type="button"
                disabled={!revealed}
                onClick={() => onGrade(grade)}
                className={cx(
                  'group flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-ink-800/60 px-2 pb-2.5 pt-3.5 transition',
                  revealed ?
                  'hover:-translate-y-0.5 hover:border-white/20 hover:bg-ink-800' :
                  'cursor-not-allowed opacity-40'
                )}>
                
                <span className="text-2xl leading-none" aria-hidden="true">
                  {meta.emoji}
                </span>
                <span className="text-[12.5px] font-semibold text-white/85">
                  {meta.labelAr}
                </span>
                <span
                  className={cx('h-[3px] w-8 rounded-full', meta.bar)}
                  aria-hidden="true" />
                
                <span className="font-en text-[10px] text-white/25">
                  {meta.hotkey}
                </span>
              </button>);

          })}
        </div>

        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-white/35">
          <LightbulbIcon className="h-3.5 w-3.5" aria-hidden="true" />
          اختر إجابتك الصادقة لنساعدك على التعلم بشكل أفضل
        </p>
      </div>
    </Modal>);

}