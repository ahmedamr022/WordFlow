import React from 'react';
import {
  ActivityIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  SparkleIcon,
  TimerResetIcon,
  ZapIcon } from
'lucide-react';
import { Modal, ModalCloseButton, cx } from '../ui/Primitives';
import type { ReviewConfig } from '../../hooks/useReviewSession';

const ILLUSTRATION = "/4e177b8a-d779-4c9c-b175-5499fa77343b.jpg";


function Stat({
  icon: Icon,
  value,
  label,
  tone





}: {icon: typeof ZapIcon;value: string;label: string;tone: string;}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-800/60 px-3 py-3.5 text-center">
      <Icon className={cx('mx-auto h-5 w-5', tone)} aria-hidden="true" />
      <p className="mt-2 font-en text-xl font-extrabold leading-none text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/40">{label}</p>
    </div>);

}

const OPTIONS: Array<{
  key: keyof ReviewConfig;
  labelAr: string;
  icon: typeof ActivityIcon;
  tone: string;
}> = [
{ key: 'weak', labelAr: 'الكلمات الضعيفة', icon: ActivityIcon, tone: 'text-brand-pink' },
{ key: 'forgotten', labelAr: 'الكلمات التي نسيتها', icon: TimerResetIcon, tone: 'text-brand-cyan' },
{ key: 'fresh', labelAr: 'كلمات جديدة', icon: SparkleIcon, tone: 'text-brand-teal' }];


export function ReviewIntroModal({
  open,
  onClose,
  onStart,
  wordCount,
  minutes,
  xp,
  config,
  onConfigChange,
  streak










}: {open: boolean;onClose: () => void;onStart: () => void;wordCount: number;minutes: number;xp: number;config: ReviewConfig;onConfigChange: (config: ReviewConfig) => void;streak: number;}) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="review-intro-title" maxWidth="max-w-[460px]">
      <ModalCloseButton onClose={onClose} />

      <div className="px-6 pb-6 pt-8 text-center">
        <img
          src={ILLUSTRATION}
          alt=""
          className="mx-auto h-[150px] w-[190px] rounded-2xl object-cover" />
        

        <h2
          id="review-intro-title"
          className="mt-3 flex items-center justify-center gap-2 text-[22px] font-extrabold text-white">
          
          <BookOpenIcon
            className="h-5 w-5 text-brand-purple"
            aria-hidden="true" />
          
          مراجعة اليوم
        </h2>
        <p className="mt-1.5 text-[12.5px] text-white/45">
          استعد لمراجعة كلماتك وتحسين مستواك!
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat
            icon={CalendarCheckIcon}
            value={String(wordCount)}
            label="كلمة"
            tone="text-brand-purple" />
          
          <Stat
            icon={ClockIcon}
            value={String(minutes)}
            label="دقائق"
            tone="text-brand-cyan" />
          
          <Stat
            icon={FlameIcon}
            value={`+${xp}`}
            label="XP"
            tone="text-brand-coral" />
          
        </div>

        <ul className="mt-3 space-y-2" aria-label="محتوى الجلسة">
          {OPTIONS.map(({ key, labelAr, icon: Icon, tone }) => {
            const active = config[key];
            return (
              <li key={key}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() =>
                  onConfigChange({ ...config, [key]: !config[key] })
                  }
                  className={cx(
                    'flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] transition',
                    active ?
                    'border-white/[0.09] bg-ink-800/70 text-white' :
                    'border-white/[0.05] bg-transparent text-white/35'
                  )}>
                  
                  <span
                    className={cx(
                      'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition',
                      active ?
                      'border-brand-teal/50 bg-brand-teal/20 text-brand-teal' :
                      'border-white/10 text-transparent'
                    )}>
                    
                    <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-right">{labelAr}</span>
                  <Icon
                    className={cx('h-4 w-4 shrink-0', active ? tone : 'text-white/20')}
                    aria-hidden="true" />
                  
                </button>
              </li>);

          })}
        </ul>

        <button
          type="button"
          onClick={onStart}
          disabled={wordCount === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink py-3.5 text-[15px] font-extrabold text-white shadow-glow-purple transition hover:brightness-110 disabled:opacity-40">
          
          ابدأ الآن
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        {wordCount === 0 ?
        <p className="mt-2.5 text-[11.5px] text-brand-gold/80">
            لا توجد كلمات مطابقة — فعّل خياراً آخر لبدء الجلسة.
          </p> :

        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-white/40">
            <ZapIcon className="h-3.5 w-3.5 text-brand-gold" aria-hidden="true" />
            ستحصل على +{xp} XP عند الانتهاء • سلسلتك {streak} يوم
          </p>
        }
      </div>
    </Modal>);

}