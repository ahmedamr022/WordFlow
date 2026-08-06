"use client";

import React from "react";
import { CheckIcon, ChevronDownIcon, RotateCcwIcon } from "lucide-react";

/**
 * عناصر التحكم في Admin Studio.
 *
 * تحسينات هذه الدفعة كلها موجّهة لشكوى «صعوبة الضبط»:
 *   · `Slider` صار له **مربع رقم قابل للكتابة** (اكتب 43 بدل مطاردة المنزلق)،
 *     وأسهم ↑/↓ من الكيبورد، وزر «إرجاع» يظهر فقط عند اختلاف القيمة عن
 *     الافتراضي، وشرح اختياري تحت المنزلق.
 *   · `CollapsibleSection` يطوي المجموعات (كما في التصميم المرجعي) فلا تُغرق
 *     الأدمنَ ٨ منزلقات × ٤ أسطح في شاشة واحدة.
 *   · `PadPicker` (في لوح المظهر) يعتمد على نفس هوية الألوان هنا.
 */

const FIELD =
"w-full rounded-xl border border-white/[0.07] bg-[#0B111C] px-3.5 py-2.5 text-[13.5px] text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15";

export function Field({
  label,
  hint,
  children,
  htmlFor
}: {label: string;hint?: string;children: React.ReactNode;htmlFor?: string;}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[12px] font-bold tracking-wide text-slate-400">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-slate-500">{hint}</p>}
    </div>);

}

export function TextInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD} ${className}`} />;
}

export function TextArea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${FIELD} min-h-[92px] resize-y ${className}`} />;
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${FIELD} appearance-none pl-9 ${className}`}>
        {children}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden />

    </div>);

}

export type ButtonTone = "primary" | "ghost" | "outline" | "danger";

const TONES: Record<ButtonTone, string> = {
  primary:
  "text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.8)] hover:brightness-110 disabled:opacity-50",
  ghost: "text-slate-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-40",
  outline:
  "border border-white/[0.09] bg-[#0B111C] text-slate-200 hover:border-white/20 hover:text-white disabled:opacity-40",
  danger:
  "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-40"
};

export function Button({
  tone = "outline",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {tone?: ButtonTone;}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all disabled:cursor-not-allowed ${TONES[tone]} ${className}`}
      style={
      tone === "primary" ?
      { backgroundImage: "linear-gradient(120deg,#0891b2,#7c3aed 55%,#db2777)" } :
      undefined
      }>

      {children}
    </button>);

}

/**
 * منزلق + مربع رقم.
 *
 * القيمة تظهر دائماً بالأرقام **وتُكتَب** — بدون ذلك لا يستطيع الأدمن تكرار
 * نفس الضبط على قصة أخرى ولا الوصول لقيمة دقيقة بالمنزلق وحده.
 */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  defaultValue,
  hint,
  disabled = false,
  disabledNote













}: {label: string;value: number;onChange: (value: number) => void;min: number;max: number;step?: number;format?: (value: number) => string; /** لو مُرِّر، يظهر زر «إرجاع» عند اختلاف القيمة عنه. */defaultValue?: number;hint?: string;disabled?: boolean;disabledNote?: string;}) {
  const id = React.useId();
  const [text, setText] = React.useState<string | null>(null);
  const decimals = step < 1 ? String(step).split(".")[1]?.length ?? 2 : 0;

  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const commit = (raw: string) => {
    const parsed = Number(raw.replace(",", "."));
    if (Number.isFinite(parsed)) onChange(clamp(parsed));
    setText(null);
  };

  const dirty = defaultValue !== undefined && Math.abs(value - defaultValue) > 1e-6;

  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-55" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[12px] font-bold text-slate-400">
          {label}
        </label>

        <div className="flex items-center gap-1.5">
          {dirty && !disabled &&
          <button
            type="button"
            onClick={() => onChange(defaultValue as number)}
            aria-label={`إرجاع ${label} للافتراضي`}
            title="إرجاع للافتراضي"
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200">

              <RotateCcwIcon className="h-3 w-3" aria-hidden />
            </button>
          }
          <input
            type="text"
            inputMode="decimal"
            aria-label={`${label} — قيمة رقمية`}
            disabled={disabled}
            value={text ?? (format ? format(value) : value.toFixed(decimals))}
            onFocus={() => setText(value.toFixed(decimals))}
            onChange={(event) => setText(event.target.value)}
            onBlur={(event) => commit(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit((event.target as HTMLInputElement).value);
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                onChange(clamp(value + step));
                setText(null);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                onChange(clamp(value - step));
                setText(null);
              }
            }}
            className="font-en w-[68px] rounded-lg border border-white/[0.07] bg-[#0B111C] px-2 py-1 text-center text-[11.5px] font-bold text-cyan-300 outline-none transition-colors focus:border-cyan-400/50" />

        </div>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.7)]" />


      {disabled && disabledNote &&
      <p className="text-[10.5px] leading-relaxed text-amber-400/90">{disabledNote}</p>
      }
      {!disabled && hint && <p className="text-[10.5px] leading-relaxed text-slate-500">{hint}</p>}
    </div>);

}

export function Toggle({
  label,
  description,
  checked,
  onChange
}: {label: string;description?: string;checked: boolean;onChange: (next: boolean) => void;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#0B111C] px-3.5 py-3 text-right transition-colors hover:border-white/15">

      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-bold text-slate-100">{label}</span>
        {description && <span className="text-[11px] text-slate-500">{description}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-cyan-500/80" : "bg-white/12"}`
        }>

        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          checked ? "right-0.5" : "right-[1.375rem]"}`
          } />

      </span>
    </button>);

}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className = ""






}: {options: SegmentedOption<T>[];value: T;onChange: (value: T) => void;size?: "sm" | "md";className?: string;}) {
  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B111C] p-1 ${className}`}>

      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            title={option.title}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-1.5 rounded-lg font-bold transition-all ${
            size === "sm" ? "px-2.5 py-1.5 text-[11.5px]" : "px-3.5 py-2 text-[12.5px]"} ${

            active ?
            "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/35" :
            "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`
            }>

            {option.icon}
            <span>{option.label}</span>
            {active && <CheckIcon className="h-3 w-3 opacity-70" aria-hidden />}
          </button>);

      })}
    </div>);

}

export function RadioRow<T extends string>({
  name,
  value,
  onChange,
  options





}: {name: string;value: T;onChange: (value: T) => void;options: {value: T;label: string;description?: string;}[];}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) =>
      <label
        key={option.value}
        className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
        value === option.value ?
        "border-cyan-400/40 bg-cyan-500/10 text-cyan-100" :
        "border-white/[0.07] bg-[#0B111C] text-slate-300 hover:border-white/15"}`
        }>

          <input
          type="radio"
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-400" />

          <span className="flex flex-col gap-0.5">
            <span>{option.label}</span>
            {option.description &&
          <span className="text-[11px] font-normal text-slate-500">{option.description}</span>
          }
          </span>
        </label>
      )}
    </div>);

}

/**
 * مجموعة قابلة للطي — العمود الأيمن في التصميم المرجعي مبني عليها.
 * الحالة محليّة عن قصد: طيّ مجموعة ليس قراراً يستحق الحفظ في الداتابيز.
 */
export function CollapsibleSection({
  title,
  icon,
  badge,
  defaultOpen = false,
  children






}: {title: string;icon?: React.ReactNode;badge?: React.ReactNode;defaultOpen?: boolean;children: React.ReactNode;}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#090F18]/85">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-right transition-colors hover:bg-white/[0.03]">

        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate text-[12.5px] font-black text-slate-200">{title}</span>
          {badge}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
          open ? "rotate-180" : ""}`
          }
          aria-hidden />

      </button>

      {open && <div className="border-t border-white/[0.05] px-3.5 py-3.5">{children}</div>}
    </section>);

}