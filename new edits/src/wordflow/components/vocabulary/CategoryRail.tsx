import React from 'react';
import { FlameIcon, ZapIcon, CheckIcon, XIcon } from 'lucide-react';
import type { VocabularyCategory } from '../../types';
import { useVocabulary, type CategoryStats } from '../../hooks/useVocabulary';
import { ACCENTS } from '../../utils/icons';
import { Bar, PanelCard, ProgressRing, cx } from '../ui/Primitives';
import { Donut, DonutLegend, type DonutSegment } from '../ui/Donut';

const LEVEL_COLORS: Record<string, string> = {
  A1: '#38bdf8',
  A2: '#00f2fe',
  B1: '#2de2c5',
  B2: '#7c6cff',
  C1: '#ff4d7a',
  C2: '#fbbf24'
};

const LEVEL_NAMES: Record<string, string> = {
  A1: 'مبتدئ',
  A2: 'مبتدئ متقدم',
  B1: 'متوسط',
  B2: 'فوق المتوسط',
  C1: 'متقدم',
  C2: 'متمكن'
};

const DAYS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

export function CategoryRail({
  category,
  stats,
  onStartSession




}: {category: VocabularyCategory;stats: CategoryStats;onStartSession: () => void;}) {
  const { levelDistribution, streak } = useVocabulary();
  const accent = ACCENTS[category.accent];

  const segments: DonutSegment[] = levelDistribution.map((item) => ({
    label: item.level,
    value: item.count,
    color: LEVEL_COLORS[item.level] ?? '#7c6cff',
    hint: LEVEL_NAMES[item.level]
  }));

  return (
    <div className="space-y-3">
      <PanelCard title="تقدم الفئة">
        <div className="flex flex-col items-center">
          <ProgressRing
            percent={stats.percent}
            size={128}
            stroke={10}
            color={accent.ring}>
            
            <span className="font-en text-2xl font-extrabold text-white">
              {stats.percent}%
            </span>
            <span className="mt-0.5 text-[10px] text-white/40">متقن</span>
          </ProgressRing>

          <div className="mt-4 w-full space-y-2.5 text-[11.5px]">
            <div className="flex items-center justify-between">
              <span className="text-white/40">متقن</span>
              <span className="font-en text-white/80">
                {stats.mastered} / {stats.total}
              </span>
            </div>
            <Bar percent={stats.percent} barClassName={accent.bar} />

            <div className="flex items-center justify-between pt-1">
              <span className="text-white/40">مستواك الحالي</span>
              <span className="rounded-md border border-brand-teal/25 bg-brand-teal/10 px-1.5 py-0.5 font-en text-[11px] font-bold text-brand-teal">
                B1
              </span>
            </div>
            <p className={cx('pt-0.5 text-center text-[11px]', accent.text)}>
              +{stats.addedThisWeek} كلمة هذا الأسبوع
            </p>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="توزيع المستويات">
        <div className="flex items-center gap-3">
          <Donut
            segments={segments}
            centerValue={String(
              levelDistribution.reduce((sum, item) => sum + item.count, 0)
            )}
            centerLabel="كلمة" />
          
          <DonutLegend segments={segments} />
        </div>
      </PanelCard>

      <PanelCard title="جلسة التعلم">
        <div className="flex items-center gap-2.5">
          <FlameIcon
            className="h-6 w-6 text-brand-coral"
            aria-hidden="true" />
          
          <div>
            <p className="font-en text-2xl font-extrabold leading-none text-white">
              {streak}
            </p>
            <p className="text-[11px] text-white/40">يوم متتالي</p>
          </div>
        </div>

        <ul className="mt-3 flex justify-between gap-1">
          {DAYS.map((day, index) => {
            const done = index < 4;
            return (
              <li key={day} className="flex flex-col items-center gap-1">
                <span
                  className={cx(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full border',
                    done ?
                    'border-brand-teal/40 bg-brand-teal/15 text-brand-teal' :
                    'border-white/[0.08] text-white/25'
                  )}>
                  
                  {done ?
                  <CheckIcon className="h-3 w-3" aria-hidden="true" /> :

                  <XIcon className="h-3 w-3" aria-hidden="true" />
                  }
                </span>
                <span className="text-[10px] text-white/30">{day}</span>
              </li>);

          })}
        </ul>
      </PanelCard>

      <button
        type="button"
        onClick={onStartSession}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink py-3.5 text-sm font-bold text-white shadow-glow-purple transition hover:brightness-110">
        
        <ZapIcon className="h-4 w-4" aria-hidden="true" />
        ابدأ جلسة تعلم
      </button>
      <p className="text-center text-[11px] leading-relaxed text-white/35">
        جلسة مخصصة لهذه الفئة
        <br />
        {Math.min(10, Math.max(stats.due + stats.fresh, 1))} كلمات • حوالي{' '}
        {Math.max(3, Math.min(20, stats.due + stats.fresh))} دقيقة
      </p>
    </div>);

}