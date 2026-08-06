"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderCircleIcon, XIcon } from "lucide-react";

import { Button } from "@/components/admin/ui/controls";

/** الأسطح: الكروت، الشرائح، الرسوم الصغيرة، الحوارات، الحالات الفارغة. */

export function Panel({
  title,
  action,
  children,
  className = "",
  padded = true






}: {title?: string;action?: React.ReactNode;children: React.ReactNode;className?: string;padded?: boolean;}) {
  return (
    <section
      className={`rounded-[18px] border border-white/[0.06] bg-[#090F18]/85 shadow-[0_18px_45px_rgba(0,0,0,0.35)] ${className}`}>

      {title &&
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-3.5">
          <h2 className="text-[15px] font-black text-slate-100">{title}</h2>
          {action}
        </header>
      }
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>);

}

const STAT_TONES = {
  purple: { ring: "border-violet-500/25", glow: "#8b5cf6", text: "text-violet-300" },
  cyan: { ring: "border-cyan-500/25", glow: "#00c6d7", text: "text-cyan-300" },
  gold: { ring: "border-amber-500/25", glow: "#f5b82e", text: "text-amber-300" },
  pink: { ring: "border-rose-500/25", glow: "#ff4f70", text: "text-rose-300" }
} as const;

export type StatTone = keyof typeof STAT_TONES;

/** رسم شعاعي صغير — بيانات حقيقية، لا صورة ثابتة. */
export function Sparkline({ points, color }: {points: number[];color: string;}) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(1, max - min);

  const path = points.
  map((value, index) => {
    const x = index / (points.length - 1) * 100;
    const y = 30 - (value - min) / range * 26;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).
  join(" ");

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>);

}

export function StatCard({
  label,
  value,
  caption,
  icon,
  tone,
  trend








}: {label: string;value: string | number;caption?: string;icon: React.ReactNode;tone: StatTone;trend?: number[];}) {
  const theme = STAT_TONES[tone];
  return (
    <div
      className={`relative flex flex-col gap-4 overflow-hidden rounded-[18px] border bg-[#090F18]/90 p-5 ${theme.ring}`}>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-bold text-slate-400">{label}</p>
          <p className="font-en mt-2 text-[2rem] font-black leading-none text-white">{value}</p>
          {caption &&
          <p className={`mt-1.5 text-[11.5px] font-bold ${theme.text}`}>{caption}</p>
          }
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.ring}`}
          style={{ background: `${theme.glow}14`, color: theme.glow }}>

          {icon}
        </span>
      </div>
      {trend && <Sparkline points={trend} color={theme.glow} />}
    </div>);

}

const STATUS_STYLES = {
  published: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  draft: "border-amber-500/35 bg-amber-500/10 text-amber-300",
  locked: "border-rose-500/35 bg-rose-500/10 text-rose-300"
} as const;

export function StatusPill({
  status,
  children



}: {status: keyof typeof STATUS_STYLES;children: React.ReactNode;}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11.5px] font-bold ${STATUS_STYLES[status]}`}>

      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>);

}

export function EmptyState({
  title,
  description,
  action




}: {title: string;description: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <h3 className="text-[15px] font-black text-slate-200">{title}</h3>
      <p className="max-w-[340px] text-[12.5px] leading-relaxed text-slate-500">{description}</p>
      {action}
    </div>);

}

export function Spinner({ label }: {label?: string;}) {
  return (
    <span className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
      <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" aria-hidden />
      {label}
    </span>);

}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg"






}: {open: boolean;onClose: () => void;title: string;children: React.ReactNode;width?: string;}) {
  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>

          <div
          className="absolute inset-0 bg-[#02060c]/70"
          style={{ backdropFilter: "blur(6px)" }}
          onClick={onClose}
          aria-hidden />

          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className={`relative z-10 w-full ${width} rounded-[22px] border border-white/[0.07] bg-[#080D16] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.8)]`}
          dir="rtl">

            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-[16px] font-black text-white">{title}</h2>
              <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">

                <XIcon className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}

/**
 * حوار تأكيد الحذف. يسرد **ما سيُفقد بالتحديد** — هذه ليست تفاصيل زائدة، بل
 * الفرق بين حذف واعٍ وحذف بالغلط لقصة يقرأها مئات المستخدمين.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  consequences,
  confirmLabel = "تأكيد",
  pending = false









}: {open: boolean;onClose: () => void;onConfirm: () => void;title: string;consequences: string[];confirmLabel?: string;pending?: boolean;}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[13px] font-bold text-slate-300">سيؤدي هذا إلى إزالة:</p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {consequences.map((item) =>
        <li key={item} className="flex items-center gap-2 text-[12.5px] text-slate-400">
            <span className="h-1 w-1 rounded-full bg-rose-400" aria-hidden />
            {item}
          </li>
        )}
      </ul>

      <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-200/90">
        الحذف هنا «ناعم»: القصة تُخفى ويبقى تقدّم المستخدمين محفوظاً، ويمكن
        استرجاعها من قاعدة البيانات.
      </p>

      <div className="mt-5 flex items-center justify-end gap-2.5">
        <Button tone="ghost" onClick={onClose} disabled={pending}>
          إلغاء
        </Button>
        <Button tone="danger" onClick={onConfirm} disabled={pending}>
          {pending ? <Spinner /> : confirmLabel}
        </Button>
      </div>
    </Modal>);

}