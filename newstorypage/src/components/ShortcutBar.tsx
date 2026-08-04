import React from 'react';
import { RotateCcwIcon, ZapIcon } from 'lucide-react';

interface ShortcutBarProps {
  autoReplay: boolean;
  onToggleAutoReplay: () => void;
}

export function ShortcutBar({ autoReplay, onToggleAutoReplay }: ShortcutBarProps) {
  return (
    <div className="glass-panel mx-auto flex w-fit items-center rounded-full border border-white/10 px-2 py-1.5">
      <button
        type="button"
        onClick={onToggleAutoReplay}
        aria-pressed={autoReplay}
        className={`flex flex-row-reverse items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 ${
        autoReplay ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`
        }>
        
        <RotateCcwIcon className={`h-3.5 w-3.5 ${autoReplay ? 'text-accent-cyan' : 'text-white/50'}`} />
        <span>إعادة الصوت تلقائياً</span>
      </button>

      <span className="mx-1 h-5 w-px bg-white/12" aria-hidden="true" />

      <div className="flex flex-row-reverse items-center gap-2.5 px-4 py-2 text-[13px] text-white/65">
        <kbd className="font-latin rounded-md border border-white/15 bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/85">
          \
        </kbd>
        <span>اختصار سريع: اضغط</span>
        <ZapIcon className="h-3.5 w-3.5 text-accent-cyan" />
      </div>
    </div>);

}