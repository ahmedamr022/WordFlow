import React, { useEffect, useRef } from 'react';
import { BellIcon, FlameIcon, SearchIcon } from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';

export function Header({
  query,
  onQueryChange,
  placeholder = 'ابحث عن كلمة...'




}: {query: string;onQueryChange: (value: string) => void;placeholder?: string;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { streak } = useVocabulary();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="flex items-center gap-4 border-b border-white/[0.05] bg-ink-950/70 px-5 py-4 backdrop-blur">
      <div className="relative max-w-lg flex-1">
        <SearchIcon
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
          aria-hidden="true" />
        
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          type="search"
          aria-label="بحث"
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-white/[0.07] bg-ink-850 pl-16 pr-10 text-sm text-white placeholder:text-white/30 focus:border-brand-purple/50" />
        
        <kbd className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-en text-[10px] text-white/40">
          ⌘ K
        </kbd>
      </div>

      <span className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-ink-850 px-3.5 py-2.5 text-xs font-semibold text-white/75 sm:inline-flex">
        <FlameIcon className="h-4 w-4 text-brand-coral" aria-hidden="true" />
        {streak} يوم متتالي
      </span>

      <button
        type="button"
        aria-label="الإشعارات — 3 جديدة"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-ink-850 text-white/60 transition hover:text-white">
        
        <BellIcon className="h-4 w-4" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-pink px-1 font-en text-[10px] font-bold text-white">
          3
        </span>
      </button>

      <div className="flex items-center gap-3">
        <div className="hidden text-left sm:block">
          <p className="font-en text-sm font-semibold leading-tight text-white">
            warm_dusk1679
          </p>
          <p className="text-[11px] text-white/45">متوسط • B1</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-purple/30 bg-brand-purple/15 font-en text-sm font-bold text-white">
          W
        </span>
      </div>
    </header>);

}