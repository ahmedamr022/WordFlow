"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

/**
 * قائمة الفلترة.
 *
 * ── لماذا كانت «تتداخل مع الشريط الجانبي»؟ ─────────────────────────────────
 * القائمة كانت `absolute` داخل `<main className="overflow-y-auto">` الموضوع
 * بدوره داخل `<div className="flex flex-1 overflow-hidden">`. أي عنصر مطلق
 * داخل حاوية بـ `overflow` يُقصّ عندها ويتمرّر معها — فتظهر القائمة مقصوصة أو
 * تحت الشريط الجانبي حسب موضع التمرير، مهما رفعنا الـ `z-index`.
 *
 * الحل الصحيح ليس `z-50` أكبر، بل الخروج من شجرة الـ overflow: القائمة تُرسم
 * في `document.body` عبر Portal وتُوضع بإحداثيات الزر، وتُغلق عند التمرير أو
 * تغيير حجم النافذة. لا قصّ، ولا تداخل، ولا اعتماد على ترتيب الطبقات.
 */

export interface FilterOption {
  id: string;
  label: string;
  hint?: string;
}

interface FilterMenuProps {
  value: string;
  options: FilterOption[];
  onChange: (id: string) => void;
  prefix?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function FilterMenu({
  value,
  options,
  onChange,
  prefix,
  icon,
  ariaLabel,
  className = ""
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{top: number;right: number;width: number;} | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const current = options.find((option) => option.id === value) ?? options[0];

  useEffect(() => setMounted(true), []);

  const measure = useCallback(() => {
    const node = buttonRef.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    setRect({
      top: box.bottom + 8,
      right: window.innerWidth - box.right,
      width: Math.max(box.width, 220)
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onViewportChange() {
      setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex h-[44px] items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#0D1320] px-4 transition-colors hover:border-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 ${className}`}>

        {icon}
        {prefix && <span className="text-[12.5px] font-medium text-slate-400">{prefix}</span>}
        <span className="whitespace-nowrap text-[12.5px] font-bold text-white">
          {current?.label}
        </span>
        <ChevronDownIcon
          size={15}
          className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden />

      </button>

      {mounted && open && rect ?
      createPortal(
        <ul
          ref={menuRef}
          role="listbox"
          dir="rtl"
          style={{
            position: "fixed",
            top: rect.top,
            right: rect.right,
            minWidth: rect.width,
            zIndex: 9999
          }}
          className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0D1320] py-1 shadow-[0_24px_60px_rgba(0,0,0,.65)]">

            {options.map((option) => {
            const isActive = option.id === value;
            return (
              <li key={option.id}>
                  <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-6 px-4 py-2.5 text-right text-[12.5px] transition-colors ${
                  isActive ? "bg-cyan-500/10 text-cyan-300" : "text-slate-300 hover:bg-white/[0.05]"}`
                  }>

                    <span className="flex flex-col items-start">
                      <span className="font-bold">{option.label}</span>
                      {option.hint &&
                    <span className="text-[11px] font-medium text-slate-500">{option.hint}</span>
                    }
                    </span>
                    {isActive && <CheckIcon size={14} aria-hidden />}
                  </button>
                </li>);

          })}
          </ul>,
        document.body
      ) :
      null}
    </>);

}

export default FilterMenu;