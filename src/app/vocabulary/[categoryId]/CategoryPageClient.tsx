"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  XIcon } from
"lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { FilterMenu } from "@/components/vocabulary/filter-menu";
import { WordRow } from "@/components/vocabulary/word-row";
import { CategoryRightPanel } from "@/components/vocabulary/vocab-right-panel";
import { useLearnedWords } from "@/hooks/useLearnedWords";
import { AudioService } from "@/lib/audio/kokoroTTS";
import type { VocabularyCategory, VocabularyWord } from "@/data/vocabularyData";
import type { VocabularyOverview } from "@/lib/vocabulary/data";
import {
  VOCAB_COLORS,
  categoryStats,
  levelChipStyle,
  levelDistribution,
  paletteFor,
  splitSentenceByWord } from
"@/lib/vocabulary/ui";

/**
 * شاشة الفئة.
 *
 * القرار التصميمي: قائمة واحدة كثيفة ومقروءة بدل شبكة بطاقات مزدحمة —
 * لأن المستخدم هنا يمسح بعينه بحثاً عن كلمة، لا يتصفّح للاستكشاف. لذلك:
 * صف واحد لكل كلمة يحمل كل ما يلزم لاتخاذ قرار (الكلمة، النوع، الترجمة،
 * مثال في سياق، استماع، حالة الإتقان)، مع ترقيم صفحات يمنع القوائم اللانهائية.
 */

const PAGE_SIZE = 8;

type StatusTab = "all" | "mastered" | "new";

const STATUS_TABS: {id: StatusTab;label: string;}[] = [
{ id: "all", label: "كل الكلمات" },
{ id: "mastered", label: "متقنة" },
{ id: "new", label: "جديدة" }];


const SORT_OPTIONS = [
{ id: "default", label: "الترتيب: الافتراضي" },
{ id: "alpha", label: "أبجدياً (A → Z)" },
{ id: "level-asc", label: "المستوى تصاعدياً" },
{ id: "level-desc", label: "المستوى تنازلياً" }];


const LEVEL_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

export default function CategoryPageClient({
  category,
  overview




}: {category: VocabularyCategory;overview: VocabularyOverview;}) {
  const router = useRouter();
  const { isLearned, review, pending, error, clearError, lastResult } = useLearnedWords(
    overview.learnedWords
  );

  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [levelFilter, setLevelFilter] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const { color, icon: Icon } = paletteFor(category.id);
  const stats = categoryStats(category, isLearned);
  const slices = useMemo(() => levelDistribution(category.words), [category.words]);

  const levelOptions = useMemo(() => {
    const present = Array.from(new Set(category.words.map((word) => word.cefrLevel))).sort(
      (a, b) => (LEVEL_ORDER[a] ?? 0) - (LEVEL_ORDER[b] ?? 0)
    );
    return [
    { id: "all", label: "كل المستويات" },
    ...present.map((level) => ({ id: level, label: level }))];

  }, [category.words]);

  const playWord = useCallback((text: string) => {
    if (text) AudioService.playWord(text, 1);
  }, []);

  const learnWord = useCallback(
    async (word: VocabularyWord) => {
      const result = await review(word.word, {
        partOfSpeech: word.partOfSpeech,
        correct: true,
        seed: {
          translationAr: word.translationAr,
          ipa: word.ipa,
          cefrLevel: word.cefrLevel,
          exampleEn: word.exampleEn,
          exampleAr: word.exampleAr
        }
      });
      if (result) router.refresh();
    },
    [review, router]
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    const list = category.words.filter((word) => {
      if (levelFilter !== "all" && word.cefrLevel !== levelFilter) return false;
      if (statusTab === "mastered" && !isLearned(word.word)) return false;
      if (statusTab === "new" && isLearned(word.word)) return false;
      if (!search) return true;
      return (
        word.word.toLowerCase().includes(search) ||
        word.translationAr.includes(search) ||
        word.exampleEn.toLowerCase().includes(search));

    });

    if (sort === "alpha") {
      return [...list].sort((a, b) => a.word.localeCompare(b.word));
    }
    if (sort === "level-asc") {
      return [...list].sort(
        (a, b) => (LEVEL_ORDER[a.cefrLevel] ?? 0) - (LEVEL_ORDER[b.cefrLevel] ?? 0)
      );
    }
    if (sort === "level-desc") {
      return [...list].sort(
        (a, b) => (LEVEL_ORDER[b.cefrLevel] ?? 0) - (LEVEL_ORDER[a.cefrLevel] ?? 0)
      );
    }
    return list;
  }, [category.words, query, levelFilter, statusTab, sort, isLearned]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageWords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div
      className="flex min-h-screen text-white"
      style={{ background: VOCAB_COLORS.page }}
      dir="ltr">

      <AppSidebar
        active="المفردات"
        dailyXp={overview.dailyXp}
        dailyGoalXp={overview.dailyGoalXp}
        streak={overview.streak} />


      <div className="flex min-w-0 flex-1 flex-col">
        <AppShellHeader
          username={overview.nickname}
          level={overview.level}
          avatarUrl={overview.avatarUrl ?? undefined}
          streak={overview.streak}
          searchPlaceholder="ابحث في المفردات..."
          searchValue={query}
          onSearchChange={resetPage(setQuery)} />


        <div className="flex flex-1 gap-5 overflow-y-auto px-6 py-6 xl:px-7" dir="rtl">
          <main className="flex min-w-0 flex-1 flex-col gap-5">
            {error &&
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-[13px] font-bold text-rose-200">

                <span>{error}</span>
                <button
                type="button"
                onClick={clearError}
                aria-label="إغلاق التنبيه"
                className="rounded-lg p-1 transition hover:bg-white/10">

                  <XIcon size={14} aria-hidden />
                </button>
              </div>
            }

            {lastResult && lastResult.xpAwarded > 0 &&
            <div
              role="status"
              className="flex items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-bold text-emerald-200">

                <SparklesIcon size={15} aria-hidden />
                أُضيفت للكلمات المتقنة — <span className="font-en">+{lastResult.xpAwarded} XP</span>
              </div>
            }

            {/* ═══ رأس الفئة ═══ */}
            <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0B101B]">
              <img
                src={category.coverImage}
                alt=""
                aria-hidden
                className="absolute inset-y-0 left-0 h-full w-2/3 object-cover" />


              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                  "linear-gradient(270deg, rgba(11,16,27,0) 0%, rgba(11,16,27,.55) 32%, rgba(11,16,27,.97) 68%, #0B101B 100%)"
                }} />


              <div className="relative flex flex-col gap-4 p-6">
                <Link
                  href="/vocabulary"
                  className="flex w-fit items-center gap-1.5 text-[12.5px] font-bold text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

                  <ChevronRightIcon size={15} aria-hidden />
                  العودة إلى جميع الفئات
                </Link>

                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                    style={{
                      color,
                      backgroundColor: `${color}1F`,
                      borderColor: `${color}45`
                    }}>

                    <Icon size={26} />
                  </span>

                  <div>
                    <h1 className="text-[30px] font-black leading-none text-white">
                      {category.titleAr}
                    </h1>
                    <p className="mt-2 max-w-lg text-[13px] font-medium text-slate-400">
                      {category.descAr}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Chip label={`${category.words.length} كلمة`} tone="#94A3B8" />
                  <Chip label={`${stats.percent}% متقن`} tone={color} />
                  <Chip
                    label={`${stats.remaining} كلمة متبقية`}
                    tone="#A78BFA"
                    icon={<TrendingUpIcon size={13} aria-hidden />} />

                </div>
              </div>
            </header>

            {/* ═══ التبويبات ═══ */}
            <div className="flex items-center gap-6 border-b border-white/[0.07]">
              {STATUS_TABS.map((item) => {
                const isActive = item.id === statusTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setStatusTab(item.id);
                      setPage(1);
                    }}
                    className={`relative pb-3 text-[13px] font-bold transition-colors focus-visible:outline-none ${
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}`
                    }>

                    {item.label}
                    {isActive &&
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full"
                      style={{ backgroundColor: color }} />

                    }
                  </button>);

              })}
            </div>

            {/* ═══ أدوات القائمة ═══ */}
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex h-[44px] min-w-[240px] flex-1 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#0D1320] px-4">
                <SearchIcon size={15} className="text-slate-500" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ابحث في هذه الفئة..."
                  aria-label="ابحث في هذه الفئة"
                  className="w-full border-none bg-transparent text-[12.5px] text-white outline-none placeholder:text-slate-600" />

              </label>

              <FilterMenu
                value={sort}
                options={SORT_OPTIONS}
                onChange={resetPage(setSort)}
                ariaLabel="ترتيب الكلمات" />


              <FilterMenu
                icon={<FilterIcon size={14} className="text-slate-400" aria-hidden />}
                value={levelFilter}
                options={levelOptions}
                onChange={resetPage(setLevelFilter)}
                ariaLabel="فلترة حسب المستوى" />


              <div
                className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0D1320] p-1"
                role="group"
                aria-label="طريقة العرض">

                <ViewButton
                  active={view === "grid"}
                  onClick={() => setView("grid")}
                  label="عرض شبكي"
                  icon={<LayoutGridIcon size={15} aria-hidden />}
                  color={color} />

                <ViewButton
                  active={view === "list"}
                  onClick={() => setView("list")}
                  label="عرض قائمة"
                  icon={<ListIcon size={15} aria-hidden />}
                  color={color} />

              </div>
            </div>

            {/* ═══ الكلمات ═══ */}
            {pageWords.length === 0 ?
            <div className="rounded-2xl border border-white/[0.06] bg-[#0B101B] py-14 text-center">
                <p className="text-[13px] font-bold text-slate-400">
                  لا توجد كلمات مطابقة لهذه الفلترة.
                </p>
                <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setLevelFilter("all");
                  setStatusTab("all");
                  setPage(1);
                }}
                className="mt-3 rounded-xl border border-cyan-400/30 px-4 py-2 text-[12.5px] font-bold text-cyan-300 transition hover:bg-cyan-500/10">

                  إعادة ضبط الفلاتر
                </button>
              </div> :
            view === "list" ?
            <div className="flex flex-col gap-2.5">
                {pageWords.map((word) =>
              <WordRow
                key={word.id}
                word={word}
                href={`/vocabulary/${category.id}/${word.id}`}
                isLearned={isLearned(word.word)}
                isPending={pending === word.word.trim().toLowerCase()}
                onPlay={playWord}
                onLearn={learnWord}
                accent={color} />

              )}
              </div> :

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 2xl:grid-cols-3">
                {pageWords.map((word) => {
                const parts = splitSentenceByWord(word.exampleEn, word.word);
                return (
                  <Link
                    key={word.id}
                    href={`/vocabulary/${category.id}/${word.id}`}
                    className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.06] bg-[#0B101B] p-4 transition hover:-translate-y-0.5 hover:border-white/20">

                      <div className="flex items-start justify-between gap-2">
                        <span className="font-en text-[17px] font-extrabold text-white">
                          {word.word}
                        </span>
                        <span
                        className="font-en rounded-lg border px-2 py-0.5 text-[11px] font-black"
                        style={levelChipStyle(word.cefrLevel)}>

                          {word.cefrLevel}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-300">
                        {word.translationAr}
                      </span>
                      <span className="font-en line-clamp-2 text-[12px] text-slate-500" dir="ltr">
                        {parts.before}
                        <span style={{ color }}>{parts.match}</span>
                        {parts.after}
                      </span>
                      {isLearned(word.word) &&
                    <span className="mt-auto w-fit rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                          متقنة ✓
                        </span>
                    }
                    </Link>);

              })}
              </div>
            }

            {/* ═══ الترقيم ═══ */}
            {totalPages > 1 &&
            <nav
              className="mt-2 flex items-center justify-center gap-1.5"
              aria-label="تنقل بين صفحات الكلمات">

                <PagerButton
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                label="الصفحة السابقة">

                  <ChevronRightIcon size={15} aria-hidden />
                </PagerButton>

                {Array.from({ length: totalPages }, (_, index) => index + 1).
              filter(
                (number) =>
                number === 1 ||
                number === totalPages ||
                Math.abs(number - safePage) <= 1
              ).
              map((number, index, list) =>
              <React.Fragment key={number}>
                      {index > 0 && number - list[index - 1] > 1 &&
                <span className="px-1 text-slate-600">…</span>
                }
                      <button
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === safePage ? "page" : undefined}
                  className={`font-en h-9 min-w-9 rounded-lg px-2.5 text-[12.5px] font-bold transition ${
                  number === safePage ?
                  "bg-violet-600 text-white" :
                  "border border-white/[0.07] bg-[#0D1320] text-slate-300 hover:border-white/20"}`
                  }>

                        {number}
                      </button>
                    </React.Fragment>
              )}

                <PagerButton
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                label="الصفحة التالية">

                  <ChevronLeftIcon size={15} aria-hidden />
                </PagerButton>
              </nav>
            }
          </main>

          <aside className="hidden w-[318px] shrink-0 xl:block">
            <div className="sticky top-0">
              <CategoryRightPanel
                categoryTitle={category.titleAr}
                accent={color}
                learnedCount={stats.learned}
                totalWords={stats.total}
                levelSlices={slices}
                streak={overview.streak}
                level={overview.level}
                weeklyGain={0}
                testHref={`/vocabulary/test?cat=${category.id}`} />

            </div>
          </aside>
        </div>
      </div>
    </div>);

}

/* ──────────────────────────── عناصر مساعدة ──────────────────────────── */

function Chip({
  label,
  tone,
  icon




}: {label: string;tone: string;icon?: React.ReactNode;}) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-bold"
      style={{ color: tone, backgroundColor: `${tone}14`, borderColor: `${tone}33` }}>

      {icon}
      {label}
    </span>);

}

function ViewButton({
  active,
  onClick,
  label,
  icon,
  color






}: {active: boolean;onClick: () => void;label: string;icon: React.ReactNode;color: string;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex h-[34px] w-[38px] items-center justify-center rounded-lg transition-colors"
      style={
      active ?
      { backgroundColor: `${color}20`, color } :
      { color: "#64748B" }
      }>

      {icon}
    </button>);

}

function PagerButton({
  onClick,
  disabled,
  label,
  children





}: {onClick: () => void;disabled: boolean;label: string;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0D1320] text-slate-300 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40">

      {children}
    </button>);

}