import React from 'react';
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon } from
'lucide-react';
import { cx } from '../ui/Primitives';

/** Builds a compact page window: 1 … 4 5 6 … 16 */
function pageWindow(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);
  if (current <= 3) pages.add(2).add(3);
  if (current >= total - 2) pages.add(total - 1).add(total - 2);

  const sorted = Array.from(pages).
  filter((page) => page >= 1 && page <= total).
  sort((a, b) => a - b);

  const output: Array<number | 'gap'> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) output.push('gap');
    output.push(page);
  });
  return output;
}

export function Pagination({
  page,
  totalPages,
  onChange




}: {page: number;totalPages: number;onChange: (page: number) => void;}) {
  if (totalPages <= 1) return null;
  const go = (next: number) => onChange(Math.min(totalPages, Math.max(1, next)));

  const arrow =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-ink-850 text-white/50 transition hover:text-white disabled:opacity-30';

  return (
    <nav
      className="flex items-center justify-center gap-1.5 pt-2"
      aria-label="التنقل بين الصفحات">
      
      <button type="button" className={arrow} onClick={() => go(1)} disabled={page === 1} aria-label="الصفحة الأولى">
        <ChevronsRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className={arrow} onClick={() => go(page - 1)} disabled={page === 1} aria-label="السابق">
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {pageWindow(page, totalPages).map((item, index) =>
      item === 'gap' ?
      <span key={`gap-${index}`} className="px-1 text-white/30">
            …
          </span> :

      <button
        key={item}
        type="button"
        onClick={() => go(item)}
        aria-current={item === page ? 'page' : undefined}
        className={cx(
          'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 font-en text-[13px] transition',
          item === page ?
          'border-brand-purple/50 bg-brand-purple/20 font-bold text-white' :
          'border-white/[0.07] bg-ink-850 text-white/55 hover:text-white'
        )}>
        
            {item}
          </button>

      )}

      <button type="button" className={arrow} onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="التالي">
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className={arrow} onClick={() => go(totalPages)} disabled={page === totalPages} aria-label="الصفحة الأخيرة">
        <ChevronsLeftIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>);

}