"use client";


import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircleIcon, SearchIcon } from "lucide-react";

import { Select } from "@/components/admin/ui/controls";

/**
 * شريط البحث والفلاتر المشترك لكل جداول اللوحة.
 *
 * الحالة كلها في الـ URL لا في useState: الرابط قابل للمشاركة، زر الرجوع
 * يعمل، والتحديث لا يفقد الفلتر. البحث مؤجَّل 400ms حتى لا نطلق طلب سيرفر
 * لكل حرف.
 */

export interface ToolbarFilter {
  name: string;
  value: string;
  options: {value: string;label: string;}[];
  ariaLabel: string;
}

export function DataToolbar({
  searchValue,
  searchPlaceholder = "ابحث...",
  filters = [],
  children





}: {searchValue: string;searchPlaceholder?: string;filters?: ToolbarFilter[];children?: React.ReactNode;}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchValue);

  useEffect(() => setTerm(searchValue), [searchValue]);

  const push = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") next.delete(key);else
      next.set(key, value);
    });
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  useEffect(() => {
    if (term === searchValue) return;
    const timer = window.setTimeout(() => push({ q: term }), 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-white/[0.05] px-4 py-3.5">
      <div className="relative min-w-[220px] flex-1">
        <SearchIcon
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden />

        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-xl border border-white/[0.07] bg-[#0B111C] py-2.5 pr-9 pl-3 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15" />

      </div>

      {filters.map((filter) =>
      <div key={filter.name} className="w-[150px]">
          <Select
          aria-label={filter.ariaLabel}
          value={filter.value}
          onChange={(event) => push({ [filter.name]: event.target.value })}>

            {filter.options.map((option) =>
          <option key={option.value} value={option.value}>
                {option.label}
              </option>
          )}
          </Select>
        </div>
      )}

      {pending &&
      <LoaderCircleIcon className="h-4 w-4 animate-spin text-cyan-300" aria-label="جارٍ التحديث" />
      }

      <div className="mr-auto flex items-center gap-2">{children}</div>
    </div>);

}

/** ترقيم يقرأ/يكتب `page` في الـ URL. */
export function Pagination({
  page,
  pageSize,
  total,
  unit = "عنصر"




}: {page: number;pageSize: number;total: number;unit?: string;}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const go = (next: number) => {
    const query = new URLSearchParams(params.toString());
    query.set("page", String(next));
    router.push(`${pathname}?${query.toString()}`, { scroll: false });
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] px-4 py-3"
      aria-label="ترقيم الصفحات">

      <p className="text-[12px] text-slate-500">
        عرض <span className="font-en text-slate-300">{from}</span> –{" "}
        <span className="font-en text-slate-300">{to}</span> من{" "}
        <span className="font-en text-slate-300">{total.toLocaleString("en-US")}</span> {unit}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[12px] font-bold text-slate-300 transition-colors hover:text-white disabled:opacity-35">

          السابق
        </button>

        {Array.from({ length: Math.min(5, pages) }, (_, index) => {
          const start = Math.max(1, Math.min(page - 2, pages - 4));
          const number = start + index;
          if (number > pages) return null;
          return (
            <button
              key={number}
              type="button"
              onClick={() => go(number)}
              aria-current={number === page ? "page" : undefined}
              className={`font-en h-8 w-8 rounded-lg text-[12px] font-bold transition-colors ${
              number === page ?
              "border border-cyan-400/35 bg-cyan-500/15 text-cyan-200" :
              "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`
              }>

              {number}
            </button>);

        })}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= pages}
          className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[12px] font-bold text-slate-300 transition-colors hover:text-white disabled:opacity-35">

          التالي
        </button>
      </div>
    </nav>);

}