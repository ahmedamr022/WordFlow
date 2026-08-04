import React from 'react';
import { ArrowRightIcon, BookOpenIcon } from 'lucide-react';
import { WordFlowLogo } from './WordFlowLogo';

export function TopBar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
      <button
        type="button"
        className="group flex flex-row-reverse items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60">
        
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        <span>العودة إلى القصص</span>
      </button>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <WordFlowLogo />
      </div>

      <button
        type="button"
        className="flex flex-row-reverse items-center gap-3 rounded-2xl border border-white/25 bg-[#060b16]/70 px-5 py-3 text-[15px] font-bold text-white transition-colors hover:border-sky-300/50 hover:bg-[#0a1424]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60">
        
        <BookOpenIcon className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
        <span>جميع القصص</span>
      </button>
    </header>);

}