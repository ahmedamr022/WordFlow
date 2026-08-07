import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, BoxIcon } from "lucide-react";
/**
 * WordFlow — the small shared primitives the vocabulary screens reuse.
 * Deliberately unopinionated: no external UI dependency, just tokens + Tailwind.
 */

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ */

export function Surface({
  className,
  children,
  as: Tag = 'div'




}: {className?: string;children: React.ReactNode;as?: 'div' | 'section' | 'article' | 'aside';}) {
  return <Tag className={cx('rounded-2xl border border-white/[0.06] bg-ink-850/80 shadow-card', className)}>
      {children}
    </Tag>;
}
export function PanelCard({
  title,
  action,
  children,
  className





}: {title: string;action?: React.ReactNode;children: React.ReactNode;className?: string;}) {
  return <Surface className={cx('p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-white/80">{title}</h3>
        {action}
      </div>
      {children}
    </Surface>;
}

/* ------------------------------------------------------------------ */

export function ProgressRing({
  percent,
  size = 112,
  stroke = 9,
  color = '#00f2fe',
  trail = 'rgba(255,255,255,0.08)',
  children







}: {percent: number;size?: number;stroke?: number;color?: string;trail?: string;children?: React.ReactNode;}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - clamped / 100 * circumference;
  return <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trail} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} initial={{
        strokeDashoffset: circumference
      }} animate={{
        strokeDashoffset: offset
      }} transition={{
        duration: 0.7,
        ease: 'easeOut'
      }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>;
}
export function Bar({
  percent,
  className,
  barClassName




}: {percent: number;className?: string;barClassName?: string;}) {
  return <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]', className)} role="presentation">
      <motion.div className={cx('h-full rounded-full bg-brand-purple', barClassName)} initial={{
      width: 0
    }} animate={{
      width: `${Math.max(0, Math.min(100, percent))}%`
    }} transition={{
      duration: 0.6,
      ease: 'easeOut'
    }} />
    </div>;
}

/* ------------------------------------------------------------------ */

export function Chip({
  icon: Icon,
  children,
  className




}: {icon?: BoxIcon;children: React.ReactNode;className?: string;}) {
  return <span className={cx('inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs text-white/70', className)}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>;
}
export function Badge({
  children,
  className



}: {children: React.ReactNode;className?: string;}) {
  return <span className={cx('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium', className)}>
      {children}
    </span>;
}

/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'subtle';
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink text-white shadow-glow-purple hover:brightness-110',
  ghost: 'text-white/70 hover:bg-white/[0.06] hover:text-white',
  outline: 'border border-white/[0.1] bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.07] hover:text-white',
  subtle: 'border border-brand-purple/30 bg-brand-purple/12 text-brand-purple hover:bg-brand-purple/20'
};
export function Button({
  variant = 'outline',
  className,
  icon: Icon,
  children,
  ...rest



}: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: ButtonVariant;icon?: BoxIcon;}) {
  return <button type="button" {...rest} className={cx('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', BUTTON_STYLES[variant], className)}>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>;
}
export function IconButton({
  label,
  icon: Icon,
  className,
  active,
  ...rest




}: React.ButtonHTMLAttributes<HTMLButtonElement> & {label: string;icon: BoxIcon;active?: boolean;}) {
  return <button type="button" aria-label={label} title={label} {...rest} className={cx('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition', active ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' : 'border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white', className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>;
}

/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  maxWidth = 'max-w-lg',
  dismissible = true







}: {open: boolean;onClose: () => void;labelledBy: string;children: React.ReactNode;maxWidth?: string;dismissible?: boolean;}) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    boxRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, dismissible]);
  if (typeof document === 'undefined') return null;
  return createPortal(<AnimatePresence>
      {open ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={dismissible ? onClose : undefined} />
          <motion.div ref={boxRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={cx('relative w-full overflow-hidden rounded-[26px] border border-white/[0.09] bg-ink-850 shadow-2xl outline-none', maxWidth)} initial={{
        opacity: 0,
        y: 20,
        scale: 0.97
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 12,
        scale: 0.98
      }} transition={{
        type: 'spring',
        stiffness: 320,
        damping: 30
      }}>
            {children}
          </motion.div>
        </div> : null}
    </AnimatePresence>, document.body);
}
export function ModalCloseButton({
  onClose


}: {onClose: () => void;}) {
  return <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink-800/80 text-white/60 transition hover:text-white">
      <XIcon className="h-4 w-4" aria-hidden="true" />
    </button>;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action





}: {icon: BoxIcon;title: string;description?: string;action?: React.ReactNode;}) {
  return <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-12 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/45">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-white/80">{title}</p>
      {description ? <p className="max-w-sm text-xs leading-relaxed text-white/45">
          {description}
        </p> : null}
      {action}
    </div>;
}