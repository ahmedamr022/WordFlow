import React from 'react';
import {
  ArrowDownUpIcon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import type { MasteryStatus } from '../../types';
import { cx } from '../ui/Primitives';

export type WordTab = 'all' | MasteryStatus;
export type SortKey = 'default' | 'alpha' | 'mastery-asc' | 'mastery-desc' | 'level';
export type ViewMode = 'list' | 'grid';

export const TABS: Array<{key: WordTab;labelAr: string;}> = [
{ key: 'all', labelAr: 'كل الكلمات' },
{ key: 'mastered', labelAr: 'متقنة' },
{ key: 'new', labelAr: 'جديدة' },
{ key: 'learning', labelAr: 'قيد التعلم' },
{ key: 'due', labelAr: 'للمراجعة' }];


const SORTS: Array<{key: SortKey;labelAr: string;}> = [
{ key: 'default', labelAr: 'الافتراضي' },
{ key: 'alpha', labelAr: 'أبجدي' },
{ key: 'mastery-asc', labelAr: 'الأقل إتقاناً' },
{ key: 'mastery-desc', labelAr: 'الأكثر إتقاناً' },
{ key: 'level', labelAr: 'المستوى' }];


export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function WordsToolbar({
  tab,
  onTabChange,
  counts,
  query,
  onQueryChange,
  sort,
  onSortChange,
  levels,
  onLevelsChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  view,
  onViewChange














}: {tab: WordTab;onTabChange: (tab: WordTab) => void;counts: Record<WordTab, number>;query: string;onQueryChange: (value: string) => void;sort: SortKey;onSortChange: (sort: SortKey) => void;levels: string[];onLevelsChange: (levels: string[]) => void;favoritesOnly: boolean;onFavoritesOnlyChange: (value: boolean) => void;view: ViewMode;onViewChange: (view: ViewMode) => void;}) {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const activeFilters = levels.length + (favoritesOnly ? 1 : 0);

  const toggleLevel = (level: string) => {
    onLevelsChange(
      levels.includes(level) ?
      levels.filter((item) => item !== level) :
      [...levels, level]
    );
  };

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="تصفية بحسب حالة التعلم"
        className="flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-0">
        
        {TABS.map(({ key, labelAr }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onTabChange(key)}
              className={cx(
                'relative shrink-0 px-4 py-2.5 text-[13px] transition',
                active ?
                'font-semibold text-white' :
                'text-white/45 hover:text-white/80'
              )}>
              
              {labelAr}
              <span
                className={cx(
                  'ms-1.5 font-en text-[11px]',
                  active ? 'text-brand-purple' : 'text-white/25'
                )}>
                
                {counts[key] ?? 0}
              </span>
              {active ?
              <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-brand-purple" /> :
              null}
            </button>);

        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            aria-hidden="true" />
          
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            type="search"
            aria-label="ابحث في هذه الفئة"
            placeholder="ابحث في هذه الفئة..."
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-ink-850 pr-9 ps-3 text-[13px] text-white placeholder:text-white/30 focus:border-brand-purple/50" />
          
        </div>

        <label className="relative inline-flex items-center">
          <ArrowDownUpIcon
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35"
            aria-hidden="true" />
          
          <span className="sr-only">الترتيب</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="h-10 appearance-none rounded-xl border border-white/[0.07] bg-ink-850 pe-3 pr-9 text-[13px] text-white/75 focus:border-brand-purple/50">
            
            {SORTS.map((item) =>
            <option key={item.key} value={item.key}>
                الترتيب: {item.labelAr}
              </option>
            )}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className={cx(
            'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-[13px] transition',
            activeFilters > 0 || filtersOpen ?
            'border-brand-purple/40 bg-brand-purple/12 text-brand-purple' :
            'border-white/[0.07] bg-ink-850 text-white/65 hover:text-white'
          )}>
          
          <SlidersHorizontalIcon className="h-3.5 w-3.5" aria-hidden="true" />
          تصفية
          {activeFilters > 0 ?
          <span className="rounded-md bg-brand-purple/25 px-1.5 font-en text-[10px] font-bold">
              {activeFilters}
            </span> :
          null}
        </button>

        <div
          className="ms-auto inline-flex overflow-hidden rounded-xl border border-white/[0.07] bg-ink-850"
          role="group"
          aria-label="طريقة العرض">
          
          <button
            type="button"
            aria-label="عرض شبكي"
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
            className={cx(
              'inline-flex h-10 w-10 items-center justify-center transition',
              view === 'grid' ?
              'bg-brand-purple/20 text-brand-purple' :
              'text-white/40 hover:text-white'
            )}>
            
            <LayoutGridIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="عرض قائمة"
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
            className={cx(
              'inline-flex h-10 w-10 items-center justify-center transition',
              view === 'list' ?
              'bg-brand-purple/20 text-brand-purple' :
              'text-white/40 hover:text-white'
            )}>
            
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {filtersOpen ?
      <div className="animate-fade-up rounded-2xl border border-white/[0.07] bg-ink-850/80 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-white/40">المستوى:</span>
            {LEVELS.map((level) => {
            const active = levels.includes(level);
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLevel(level)}
                className={cx(
                  'rounded-lg border px-2.5 py-1 font-en text-[11px] font-semibold transition',
                  active ?
                  'border-brand-teal/40 bg-brand-teal/15 text-brand-teal' :
                  'border-white/[0.08] text-white/45 hover:text-white'
                )}>
                
                  {level}
                </button>);

          })}

            <span className="mx-2 h-4 w-px bg-white/10" />

            <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
            className={cx(
              'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition',
              favoritesOnly ?
              'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' :
              'border-white/[0.08] text-white/45 hover:text-white'
            )}>
            
              المفضلة فقط
            </button>

            {activeFilters > 0 ?
          <button
            type="button"
            onClick={() => {
              onLevelsChange([]);
              onFavoritesOnlyChange(false);
            }}
            className="ms-auto text-[11px] text-white/40 underline-offset-4 hover:text-white hover:underline">
            
                إعادة تعيين
              </button> :
          null}
          </div>
        </div> :
      null}
    </div>);

}