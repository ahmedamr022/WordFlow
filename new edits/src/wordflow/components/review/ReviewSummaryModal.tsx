import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  XIcon,
  ZapIcon } from
'lucide-react';
import type { ReviewSummary } from '../../types';
import { GRADE_META, formatDuration } from '../../utils/srs';
import { Bar, Modal, cx } from '../ui/Primitives';

const CONFETTI_COLORS = [
'#7c6cff',
'#00f2fe',
'#2de2c5',
'#ff4d7a',
'#fbbf24',
'#ff6b6b'];


const DAYS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

function Confetti() {
  const pieces = useMemo(
    () =>
    Array.from({ length: 26 }, (_, index) => ({
      id: index,
      left: index * 37 % 100,
      delay: index % 7 * 0.08,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      size: 5 + index % 4 * 2,
      rotate: index * 47 % 360
    })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) =>
      <motion.span
        key={piece.id}
        className="absolute rounded-[2px]"
        style={{
          left: `${piece.left}%`,
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color
        }}
        initial={{ y: -20, opacity: 0, rotate: 0 }}
        animate={{ y: 200, opacity: [0, 1, 1, 0], rotate: piece.rotate }}
        transition={{
          duration: 2.4,
          delay: piece.delay,
          ease: 'easeOut'
        }} />

      )}
    </div>);

}

function Stat({
  icon: Icon,
  value,
  label,
  tone





}: {icon: typeof ZapIcon;value: string;label: string;tone: string;}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-800/60 px-3 py-4 text-center">
      <Icon className={cx('mx-auto h-5 w-5', tone)} aria-hidden="true" />
      <p className="mt-2 font-en text-xl font-extrabold leading-none text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/40">{label}</p>
    </div>);

}

export function ReviewSummaryModal({
  open,
  summary,
  streak,
  dailyXp,
  dailyGoalXp,
  onReviewMore,
  onGoHome,
  onClose









}: {open: boolean;summary: ReviewSummary;streak: number;dailyXp: number;dailyGoalXp: number;onReviewMore: () => void;onGoHome: () => void;onClose: () => void;}) {
  const answered = summary.answers.length;

  return (
    <Modal open={open} onClose={onClose} labelledBy="review-summary-title" maxWidth="max-w-[540px]">
      <div className="relative px-6 pb-6 pt-8 text-center">
        <Confetti />

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="relative mx-auto inline-flex h-[104px] w-[104px] items-center justify-center rounded-full border-[3px] border-brand-teal/70 bg-brand-teal/[0.07]">
          
          <CheckIcon className="h-11 w-11 text-brand-teal" aria-hidden="true" />
        </motion.div>

        <h2
          id="review-summary-title"
          className="relative mt-5 text-[26px] font-extrabold text-white">
          
          أحسنت! 🎉
        </h2>
        <p className="relative mt-1.5 text-[13px] text-white/45">
          لقد أكملت مراجعة اليوم بنجاح
        </p>

        <div className="relative mt-5 grid grid-cols-3 gap-2.5">
          <Stat
            icon={ZapIcon}
            value={`+${summary.xp}`}
            label="XP مكتسبة"
            tone="text-brand-gold" />
          
          <Stat
            icon={BookOpenIcon}
            value={`${answered}/${summary.total}`}
            label="كلمة"
            tone="text-brand-purple" />
          
          <Stat
            icon={ClockIcon}
            value={formatDuration(summary.durationMs)}
            label="دقائق"
            tone="text-brand-cyan" />
          
        </div>

        <div className="relative mt-3 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-ink-800/50 px-4 py-3">
          <span className="text-2xl" aria-hidden="true">
            🔥
          </span>
          <div className="text-right">
            <p className="font-en text-lg font-extrabold leading-none text-white">
              {streak}
            </p>
            <p className="text-[11px] text-white/40">يوم متتالي</p>
          </div>
          <ul className="ms-auto flex gap-1.5">
            {DAYS.map((day, index) => {
              const done = index < 6;
              return (
                <li key={day} className="flex flex-col items-center gap-1">
                  <span
                    className={cx(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full border',
                      done ?
                      'border-brand-teal/45 bg-brand-teal/15 text-brand-teal' :
                      'border-brand-purple/45 bg-brand-purple/15 text-brand-purple'
                    )}>
                    
                    {done ?
                    <CheckIcon className="h-3 w-3" aria-hidden="true" /> :

                    <StarIcon className="h-3 w-3" aria-hidden="true" />
                    }
                  </span>
                  <span className="text-[10px] text-white/30">{day}</span>
                </li>);

            })}
          </ul>
        </div>

        <div className="relative mt-3 rounded-2xl border border-white/[0.07] bg-ink-800/50 p-4 text-right">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-purple/35 bg-brand-purple/15">
              <StarIcon
                className="h-5 w-5 text-brand-purple"
                aria-hidden="true" />
              
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-white">مستواك يتحسن!</p>
              <p className="mt-0.5 text-[11.5px] text-white/40">
                أنت الآن أقرب لتحقيق هدفك الأسبوعي
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Bar
              percent={dailyXp / dailyGoalXp * 100}
              barClassName="bg-gradient-to-l from-brand-cyan to-brand-purple" />
            
            <span className="shrink-0 font-en text-[11px] text-white/50">
              {dailyXp.toLocaleString('en-US')} / {dailyGoalXp.toLocaleString('en-US')} XP ⚡
            </span>
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-4 gap-2">
          {(Object.keys(summary.counts) as Array<keyof typeof summary.counts>).map(
            (grade) =>
            <div
              key={grade}
              className="rounded-xl border border-white/[0.06] bg-ink-800/40 py-2 text-center">
              
                <p className="font-en text-sm font-bold text-white">
                  {summary.counts[grade]}
                </p>
                <p className={cx('text-[10.5px]', GRADE_META[grade].tone)}>
                  {GRADE_META[grade].labelAr}
                </p>
              </div>

          )}
        </div>

        <div className="relative mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={onReviewMore}
            className="flex-1 rounded-2xl border border-white/[0.1] bg-white/[0.03] py-3 text-[13.5px] font-semibold text-white/80 transition hover:bg-white/[0.07] hover:text-white">
            
            مراجعة كلمات أخرى
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="flex-1 rounded-2xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink py-3 text-[13.5px] font-bold text-white shadow-glow-purple transition hover:brightness-110">
            
            العودة إلى الصفحة الرئيسية
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="relative mt-3 inline-flex items-center gap-1.5 text-[12px] text-white/35 transition hover:text-white/70">
          
          <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          إغلاق
        </button>
      </div>
    </Modal>);

}