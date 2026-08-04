import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ChartNoAxesColumnIcon } from 'lucide-react';

interface ProgressPanelProps {
  current: number;
  total: number;
}

export function ProgressPanel({ current, total }: ProgressPanelProps) {
  const percent = Math.round(current / total * 100);

  return (
    <section
      aria-label="تقدمك في هذه القصة"
      className="glass-panel flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-white/10 px-6 py-5 sm:flex-row-reverse sm:items-center sm:gap-8">
      
      <div className="flex-1">
        <div className="flex items-center justify-end gap-2 text-[13px] font-bold text-white/80">
          <span>تقدمك في هذه القصة</span>
          <ChartNoAxesColumnIcon className="h-4 w-4 text-accent-cyan" />
        </div>

        <div className="mt-4 flex flex-row-reverse items-center gap-4">
          <span className="font-latin text-2xl font-bold text-white">{percent}%</span>
          <span className="whitespace-nowrap text-xs text-white/50">
            السطر {current} من {total}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundImage: 'linear-gradient(90deg,#22d3ee,#a855f7)' }}
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            
          </div>
        </div>
      </div>

      <span className="hidden h-16 w-px bg-white/10 sm:block" aria-hidden="true" />

      <div className="flex flex-row-reverse items-center gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-300/20">
          <SparklesIcon className="h-4 w-4 text-amber-300" />
        </span>
        <div className="text-right">
          <p className="text-sm font-bold text-white">استمر! أنت تقوم بعمل رائع</p>
          <p className="mt-1 text-xs text-white/50">كل يوم تقرأ، عقلك يتطور أكثر.</p>
        </div>
      </div>
    </section>);

}