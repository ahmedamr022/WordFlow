import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VocabularyCategory } from '../../types';
import type { CategoryStats } from '../../hooks/useVocabulary';
import { ACCENTS, resolveIcon } from '../../utils/icons';
import { Bar, cx } from '../ui/Primitives';

export function CategoryCard({
  category,
  stats,
  index = 0




}: {category: VocabularyCategory;stats: CategoryStats;index?: number;}) {
  const Icon = resolveIcon(category.icon);
  const accent = ACCENTS[category.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.045 }}>
      
      <Link
        to={`/words/${category.id}`}
        className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-850 shadow-card transition hover:border-white/[0.14]"
        aria-label={`${category.titleAr} — ${stats.total} كلمة`}>
        
        <div className="relative h-32 overflow-hidden">
          <img
            src={category.coverImage}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
            loading="lazy" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/45 to-transparent" />
          <span
            className={cx(
              'absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur',
              accent.bg,
              accent.border,
              accent.text
            )}>
            
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {stats.due > 0 ?
          <span className="absolute left-3 top-3 rounded-lg border border-brand-gold/30 bg-brand-gold/15 px-2 py-1 text-[10px] font-bold text-brand-gold backdrop-blur">
              {stats.due} للمراجعة
            </span> :
          null}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-white">
                {category.titleAr}
              </h3>
              <p className="mt-0.5 font-en text-[11px] uppercase tracking-wide text-white/35">
                {category.titleEn}
              </p>
            </div>
            <ArrowLeftIcon
              className="mt-1 h-4 w-4 shrink-0 text-white/25 transition group-hover:-translate-x-1 group-hover:text-white/70"
              aria-hidden="true" />
            
          </div>

          <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-white/40">
            {category.descAr}
          </p>

          <div className="mt-3.5 flex items-center justify-between text-[11px] text-white/45">
            <span>{stats.total} كلمة</span>
            <span className={cx('font-en font-bold', accent.text)}>
              {stats.percent}%
            </span>
          </div>
          <Bar
            percent={stats.percent}
            className="mt-1.5"
            barClassName={accent.bar} />
          

          <div className="mt-3 flex flex-wrap gap-1.5 text-[10.5px]">
            <span className="rounded-md border border-brand-teal/20 bg-brand-teal/10 px-1.5 py-0.5 text-brand-teal">
              {stats.mastered} متقنة
            </span>
            <span className="rounded-md border border-violet-400/20 bg-violet-400/10 px-1.5 py-0.5 text-violet-300">
              {stats.learning} قيد التعلم
            </span>
            <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-1.5 py-0.5 text-sky-300">
              {stats.fresh} جديدة
            </span>
          </div>
        </div>
      </Link>
    </motion.div>);

}