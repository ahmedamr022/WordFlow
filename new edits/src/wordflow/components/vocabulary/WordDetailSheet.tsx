import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  WordDetailPanel,
  type WordDetailPanelProps } from
'./WordDetailPanel';

/**
 * Below `xl` the right rail is not visible, so the same panel becomes a
 * side sheet. One component, two placements — the detail UI itself is
 * never duplicated.
 */
export function WordDetailSheet({
  open,
  ...panelProps
}: WordDetailPanelProps & {open: boolean;}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-40 xl:hidden" dir="rtl">
          <motion.div
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={panelProps.onClose} />
        
          <motion.div
          className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col border-r border-white/[0.07] bg-ink-900 p-4 shadow-panel"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
          
            <WordDetailPanel {...panelProps} />
          </motion.div>
        </div> :
      null}
    </AnimatePresence>,
    document.body
  );
}