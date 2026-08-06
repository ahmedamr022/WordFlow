"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  BrainCircuitIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
  Loader2Icon,
  SparklesIcon,
  TargetIcon,
  Volume2Icon,
  XIcon,
  ZapIcon } from
"lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { CategoryCard } from "@/components/vocabulary/category-card";
import { FilterMenu } from "@/components/vocabulary/filter-menu";
import { VocabRightPanel } from "@/components/vocabulary/vocab-right-panel";
import { useLearnedWords } from "@/hooks/useLearnedWords";
import { AudioService } from "@/lib/audio/kokoroTTS";
import {
  VOCABULARY_CATEGORIES,
  type VocabularyWord } from
"@/data/vocabularyData";
import type { VocabularyOverview } from "@/lib/vocabulary/data";
import {
  VOCAB_COLORS,
  LEVELS,
  LEVEL_LABELS,
  categoryStats,
  levelChipStyle,
  levelDistribution,
  paletteFor,
  splitSentenceByWord } from
"@/lib/vocabulary/ui";

/**
 * شاشة المفردات — النظرة العامة.
 *
 * كل قسم يجيب سؤالاً مختلفاً، فلا يتشتّت المستخدم بين عناصر تكرّر بعضها:
 *   1. أرقامي اليوم        → شريط الإحصائيات.
 *   2. ما الذي يجب مراجعته؟ → «مراجعة ذكية».
 *   3. أين أتصفّح؟          → شبكة الفئات.
 *   4. ما الجديد لأتعلّمه؟   → «كلمات جديدة».
 *
 * ── ما أُصلح في هذه الدفعة ───────────────────────────────────────────────────
 * ١) **اللوحة الجانبية صارت على اليمين فعلاً.** الصف `dir="rtl"` وكان `<main>`
 *    أول عنصر فيه ⇒ في RTL أول عنصر يقع على **اليمين**، فالمحتوى كان يميناً
 *    و«اللوحة اليمنى» تنزل يساراً بجوار الشريط الجانبي. الآن `<aside>` هو أول
 *    عنصر في الصف ⇒ يقع على حرف الشاشة الأيمن كما في التصميم.
 *
 * ٢) **لا فراغ طويل أسفل اللوحة.** كانت `sticky top-0` بلا ارتفاع ولا تمرير
 *    خاص، فتنتهي بطاقاتها الأربع القصيرة ويبقى باقي عمود التمرير فارغاً. الآن
 *    عمود مستقل بارتفاع الشاشة وتمرير داخلي خاص به.
 *
 * ٣) **الفلترة تبدأ من مستوى المستخدم** لا من «كل المستويات» — أول ما يراه
 *    يناسبه فعلاً.
 */

const INITIAL_CATEGORIES = 8;

const LEVEL_OPTIONS = [
{ id: "all", label: "كل المستويات" },
...LEVELS.map((level) => ({ id: level, label: `${level} — ${LEVEL_LABELS[level]}` }))];


type StatusFilterId = "all" | "not-started" | "in-progress" | "completed";

const STATUS_OPTIONS: {id: StatusFilterId;label: string;hint?: string;}[] = [
{ id: "all", label: "كل الفئات" },
{ id: "not-started", label: "لم أبدأها" },
{ id: "in-progress", label: "قيد التعلم" },
{ id: "completed", label: "أتممتها" }];


type TabId = "all" | "review" | "new" | "mastered";

const TABS: {id: TabId;label: string;}[] = [
{ id: "all", label: "جميع الكلمات" },
{ id: "review", label: "مراجعة ذكية" },
{ id: "new", label: "تعلم جديد" },
{ id: "mastered", label: "أتقنتها" }];


interface IndexedWord extends VocabularyWord {
  categoryId: string;
  categoryTitle: string;
}

export default function VocabularyPageClient({
  overview
}: {overview: VocabularyOverview;}) {
  const router = useRouter();

  const { isLearned, review, pending, error, clearError, learnedCount, lastResult } =
  useLearnedWords(overview.learnedWords);

  const [tab, setTab] = useState<TabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>(overview.level || "all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>("all");
  const [showAllCategories, setShowAllCategories] = useState(false);

  /* ── فهرس الكلمات مع فئتها ── */
  const allWords = useMemo<IndexedWord[]>(
    () =>
    VOCABULARY_CATEGORIES.flatMap((category) =>
    category.words.map((word) => ({
      ...word,
      categoryId: category.id,
      categoryTitle: category.titleAr
    }))
    ),
    []
  );
  const totalWords = allWords.length;

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
      // يحدّث «المستحقّ للمراجعة» و«أحدث ما تعلمته» القادمين من السيرفر.
      if (result) router.refresh();
    },
    [review, router]
  );

  /* ── الفئات ── */
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return VOCABULARY_CATEGORIES.filter((category) => {
      if (levelFilter !== "all") {
        if (!category.words.some((word) => word.cefrLevel === levelFilter)) return false;
      }

      if (statusFilter !== "all") {
        const { percent } = categoryStats(category, isLearned);
        if (statusFilter === "not-started" && percent !== 0) return false;
        if (statusFilter === "in-progress" && (percent === 0 || percent >= 100)) return false;
        if (statusFilter === "completed" && percent < 100) return false;
      }

      if (!query) return true;
      return (
        category.titleAr.includes(query) ||
        category.titleEn.toLowerCase().includes(query) ||
        category.words.some(
          (word) =>
          word.word.toLowerCase().includes(query) || word.translationAr.includes(query)
        ));

    });
  }, [searchQuery, levelFilter, statusFilter, isLearned]);

  const visibleCategories = showAllCategories ?
  filteredCategories :
  filteredCategories.slice(0, INITIAL_CATEGORIES);

  /* ── مجموعات الكلمات ── */
  const matchesFilters = useCallback(
    (word: IndexedWord) => {
      if (levelFilter !== "all" && word.cefrLevel !== levelFilter) return false;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        word.word.toLowerCase().includes(query) ||
        word.translationAr.includes(query) ||
        word.categoryTitle.includes(query));

    },
    [levelFilter, searchQuery]
  );

  const masteredWords = useMemo(
    () => allWords.filter((word) => matchesFilters(word) && isLearned(word.word)),
    [allWords, matchesFilters, isLearned]
  );

  const newWords = useMemo(
    () => allWords.filter((word) => matchesFilters(word) && !isLearned(word.word)),
    [allWords, matchesFilters, isLearned]
  );

  /**
   * «مراجعة ذكية»: الكلمات الأقرب لمستوى المستخدم ولم تُتقن بعد — أول ما يجب
   * أن يراه. الرقم المعروض في اللوحة الجانبية يبقى `dueCount` الحقيقي من
   * الداتابيز؛ هذه القائمة اقتراح تعلّم لا ادعاء استحقاق.
   */
  const reviewWords = useMemo(() => {
    const preferred = newWords.filter((word) => word.cefrLevel === overview.level);
    const rest = newWords.filter((word) => word.cefrLevel !== overview.level);
    return [...preferred, ...rest];
  }, [newWords, overview.level]);

  const levelSlices = useMemo(() => levelDistribution(allWords), [allWords]);

  const masteredTotal = Math.max(overview.learnedCount, learnedCount);
  const masteryPercent =
  totalWords > 0 ? Math.round(masteredTotal / totalWords * 100) : 0;

  const showCategories = tab === "all";
  const showReview = tab === "all" || tab === "review";
  const showNew = tab === "all" || tab === "new";
  const showMastered = tab === "mastered";

  const stats = [
  {
    icon: BookOpenIcon,
    color: "#22D3EE",
    value: totalWords.toLocaleString("en-US"),
    label: "إجمالي الكلمات",
    foot: `${VOCABULARY_CATEGORIES.length} فئة`
  },
  {
    icon: TargetIcon,
    color: "#34D399",
    value: `${masteryPercent}%`,
    label: "نسبة الإتقان",
    foot: `${masteredTotal} كلمة متقنة`
  },
  {
    icon: CalendarCheckIcon,
    color: "#A78BFA",
    value: String(overview.dueCount),
    label: "جاهز للمراجعة اليوم",
    foot: overview.dueCount > 0 ? "لا تفوّت يومك!" : "أنجزت مراجعات اليوم 🎉"
  },
  {
    icon: ZapIcon,
    color: "#FBBF24",
    value: overview.xpTotal.toLocaleString("en-US"),
    label: "إجمالي النقاط",
    foot: `+${overview.dailyXp} XP اليوم`
  }];


  return (
    <div
      className="flex h-screen overflow-hidden text-white"
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
          searchPlaceholder="ابحث في الكلمات..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery} />


        {/* حاوية تمرير واحدة — لا حاويات overflow متداخلة تقصّ القوائم */}
        <div className="flex flex-1 gap-5 overflow-y-auto px-6 py-5 xl:px-7" dir="rtl">
          {/*
             اللوحة أول عنصر في صف RTL ⇒ تقع على حرف الشاشة الأيمن.
             وارتفاعها محدود بتمرير خاص بها، فلا يبقى فراغ ميت أسفلها.
            */}
          <aside className="hidden w-[312px] shrink-0 xl:block">
            <div className="sticky top-0 max-h-[calc(100vh-136px)] overflow-y-auto pb-1 pl-1 [scrollbar-width:thin]">
              <VocabRightPanel
                level={overview.level}
                xpTotal={overview.xpTotal}
                xpGoal={Math.max(overview.xpTotal + 250, 2000)}
                streak={overview.streak}
                learnedCount={masteredTotal}
                totalWords={totalWords}
                levelSlices={levelSlices}
                dueCount={overview.dueCount} />

            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col gap-6">
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
                تم الحفظ في حسابك — <span className="font-en">+{lastResult.xpAwarded} XP</span>
              </div>
            }

            {/* ═══ الرأس ═══ */}
            <header className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">

                <BookOpenIcon className="h-6 w-6" style={{ color: VOCAB_COLORS.cyan }} />
              </span>
              <div>
                <h1 className="text-[28px] font-black leading-none tracking-tight text-white">
                  المفردات
                </h1>
                <p className="mt-2 text-[13px] font-medium text-slate-400">
                  تعلم كلمات جديدة وراجع ما تعلمته بذكاء
                </p>
              </div>
            </header>

            {/* ═══ التبويبات + الفلاتر ═══ */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="عرض المفردات"
                className="flex flex-wrap items-center gap-2">

                {TABS.map((item) => {
                  const isActive = item.id === tab;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setTab(item.id)}
                      className={`h-[40px] rounded-xl px-4 text-[12.5px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 ${
                      isActive ?
                      "bg-violet-600 text-white shadow-[0_10px_26px_-12px_rgba(139,92,246,0.9)]" :
                      "border border-white/[0.07] bg-[#0D1320] text-slate-300 hover:border-white/20 hover:text-white"}`
                      }>

                      {item.label}
                    </button>);

                })}
              </div>

              <div className="flex items-center gap-2.5">
                <FilterMenu
                  prefix="المستوى:"
                  value={levelFilter}
                  options={LEVEL_OPTIONS}
                  onChange={setLevelFilter}
                  ariaLabel="فلترة حسب المستوى" />

                <FilterMenu
                  icon={<FilterIcon size={14} className="text-slate-400" aria-hidden />}
                  value={statusFilter}
                  options={STATUS_OPTIONS}
                  onChange={(id) => setStatusFilter(id as StatusFilterId)}
                  ariaLabel="فلترة حسب الحالة" />

              </div>
            </div>

            {/* ═══ شريط الإحصائيات ═══ */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-[#0B101B] px-4 py-3.5">

                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        color: stat.color,
                        backgroundColor: `${stat.color}16`,
                        borderColor: `${stat.color}33`
                      }}>

                      <Icon size={19} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-en text-[20px] font-black leading-none text-white">
                        {stat.value}
                      </div>
                      <div className="mt-1.5 truncate text-[12px] font-bold text-slate-400">
                        {stat.label}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] font-medium text-slate-600">
                        {stat.foot}
                      </div>
                    </div>
                  </div>);

              })}
            </div>

            {/* ═══ مراجعة ذكية ═══ */}
            {showReview &&
            <section aria-labelledby="smart-review">
                <SectionHeader
                id="smart-review"
                title="مراجعة ذكية"
                subtitle={`كلمات تحتاج مراجعتك بناءً على مستواك (${overview.level})`}
                actionLabel={tab === "all" ? "عرض الكل" : undefined}
                onAction={tab === "all" ? () => setTab("review") : undefined} />


                {reviewWords.length === 0 ?
              <EmptyState
                text="لا توجد كلمات للمراجعة الآن. أحسنت! 🎉"
                onReset={() => {
                  setLevelFilter("all");
                  setSearchQuery("");
                }} /> :


              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {(tab === "all" ? reviewWords.slice(0, 4) : reviewWords.slice(0, 24)).map(
                  (word) =>
                  <ReviewWordCard
                    key={`${word.categoryId}-${word.id}`}
                    word={word}
                    onPlay={playWord}
                    onLearn={learnWord}
                    isPending={pending === word.word.trim().toLowerCase()} />


                )}
                  </div>
              }
              </section>
            }

            {/* ═══ الفئات ═══ */}
            {showCategories &&
            <section aria-labelledby="categories">
                <SectionHeader
                id="categories"
                title="الفئات"
                subtitle={`${filteredCategories.length} فئة · استكشف الكلمات حسب المواضيع`} />


                {visibleCategories.length > 0 ?
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {visibleCategories.map((category) => {
                  const cStats = categoryStats(category, isLearned);
                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      progress={cStats.percent}
                      learnedCount={cStats.learned} />);


                })}
                  </div> :

              <EmptyState
                text="لا توجد فئات مطابقة لهذه الفلترة."
                onReset={() => {
                  setLevelFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }} />

              }

                {filteredCategories.length > INITIAL_CATEGORIES &&
              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="mt-5 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-[#0C1321] text-[13px] font-bold text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300">

                    {showAllCategories ?
                <>
                        <ChevronUpIcon size={16} aria-hidden />
                        عرض أقل
                      </> :

                <>
                        <ChevronDownIcon size={16} aria-hidden />
                        عرض المزيد ({filteredCategories.length - INITIAL_CATEGORIES})
                      </>
                }
                  </button>
              }
              </section>
            }

            {/* ═══ كلمات جديدة ═══ */}
            {showNew &&
            <section aria-labelledby="new-words">
                <SectionHeader
                id="new-words"
                title="كلمات جديدة"
                subtitle="اكتشف كلمات جديدة لتوسيع مفرداتك"
                actionLabel={tab === "all" ? "عرض الكل" : undefined}
                onAction={tab === "all" ? () => setTab("new") : undefined} />


                <div className="flex flex-col gap-3">
                  {(tab === "all" ? newWords.slice(0, 5) : newWords.slice(0, 40)).map((word) =>
                <NewWordRow
                  key={`${word.categoryId}-${word.id}`}
                  word={word}
                  onPlay={playWord}
                  onLearn={learnWord}
                  isPending={pending === word.word.trim().toLowerCase()} />

                )}
                  {newWords.length === 0 &&
                <EmptyState text="أتقنت كل الكلمات المطابقة لهذه الفلترة 🎉" />
                }
                </div>
              </section>
            }

            {/* ═══ أتقنتها ═══ */}
            {showMastered &&
            <section aria-labelledby="mastered">
                <SectionHeader
                id="mastered"
                title="أتقنتها"
                subtitle={`${masteredWords.length} كلمة محفوظة في حسابك`} />


                {masteredWords.length === 0 ?
              <EmptyState text="لم تتقن أي كلمة بعد — ابدأ من «تعلم جديد»." /> :

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {masteredWords.slice(0, 60).map((word) =>
                <Link
                  key={`${word.categoryId}-${word.id}`}
                  href={`/vocabulary/${word.categoryId}/${word.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0B101B] px-4 py-3 transition hover:border-emerald-400/30">

                        <CheckCircle2Icon
                    size={17}
                    className="shrink-0 text-emerald-400"
                    aria-hidden />

                        <span className="min-w-0 flex-1">
                          <span className="font-en block truncate text-[14px] font-bold text-white">
                            {word.word}
                          </span>
                          <span className="block truncate text-[12px] text-slate-400">
                            {word.translationAr}
                          </span>
                        </span>
                        <span
                    className="font-en shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-black"
                    style={levelChipStyle(word.cefrLevel)}>

                          {word.cefrLevel}
                        </span>
                      </Link>
                )}
                  </div>
              }
              </section>
            }
          </main>
        </div>
      </div>
    </div>);

}

/* ──────────────────────────── عناصر الصفحة ──────────────────────────── */

function SectionHeader({
  id,
  title,
  subtitle,
  actionLabel,
  onAction






}: {id: string;title: string;subtitle: string;actionLabel?: string;onAction?: () => void;}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-[19px] font-black tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1.5 text-[12.5px] font-medium text-slate-500">{subtitle}</p>
      </div>

      {actionLabel && onAction &&
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-[12.5px] font-bold text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50">

          {actionLabel}
        </button>
      }
    </div>);

}

function EmptyState({ text, onReset }: {text: string;onReset?: () => void;}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0B101B] py-12 text-center">
      <p className="text-[13px] font-bold text-slate-400">{text}</p>
      {onReset &&
      <button
        type="button"
        onClick={onReset}
        className="mt-3 rounded-xl border border-cyan-400/30 px-4 py-2 text-[12.5px] font-bold text-cyan-300 transition hover:bg-cyan-500/10">

          إعادة ضبط الفلاتر
        </button>
      }
    </div>);

}

function ReviewWordCard({
  word,
  onPlay,
  onLearn,
  isPending





}: {word: IndexedWord;onPlay: (text: string) => void;onLearn: (word: VocabularyWord) => void;isPending: boolean;}) {
  const { color } = paletteFor(word.categoryId);

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0B101B] p-4 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/vocabulary/${word.categoryId}/${word.id}`}
          className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

          <span className="font-en block truncate text-[17px] font-extrabold text-white">
            {word.word}
          </span>
          <span className="mt-0.5 block text-[11.5px] font-semibold text-slate-500">
            {word.partOfSpeech}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => onPlay(word.word)}
          aria-label={`استمع إلى ${word.word}`}
          className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-cyan-300">

          <Volume2Icon size={16} aria-hidden />
        </button>
      </div>

      <p className="text-[13.5px] font-bold text-slate-300">{word.translationAr}</p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span
          className="font-en rounded-lg border px-2 py-0.5 text-[11px] font-black"
          style={levelChipStyle(word.cefrLevel)}>

          {word.cefrLevel}
        </span>

        <button
          type="button"
          onClick={() => onLearn(word)}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11.5px] font-bold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:opacity-60"
          style={{ backgroundColor: `${color}12` }}>

          {isPending ?
          <Loader2Icon size={12} className="animate-spin" aria-hidden /> :

          <BrainCircuitIcon size={12} aria-hidden />
          }
          تذكّرت
        </button>
      </div>
    </div>);

}

function NewWordRow({
  word,
  onPlay,
  onLearn,
  isPending





}: {word: IndexedWord;onPlay: (text: string) => void;onLearn: (word: VocabularyWord) => void;isPending: boolean;}) {
  const { color, icon: Icon } = paletteFor(word.categoryId);
  const parts = splitSentenceByWord(word.exampleEn, word.word);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0B101B] px-4 py-3.5 transition-colors hover:border-white/15">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
        style={{
          color,
          backgroundColor: `${color}18`,
          borderColor: `${color}38`
        }}>

        <Icon size={18} />
      </span>

      <Link
        href={`/vocabulary/${word.categoryId}/${word.id}`}
        className="min-w-[140px] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">

        <span className="font-en block text-[15px] font-extrabold text-white">{word.word}</span>
        <span className="block text-[11.5px] font-semibold" style={{ color }}>
          {word.partOfSpeech}
        </span>
        <span className="block text-[12px] font-bold text-slate-400">{word.translationAr}</span>
      </Link>

      <div className="hidden min-w-0 flex-1 flex-col gap-1 md:flex" dir="ltr">
        <span className="font-en truncate text-[13.5px] text-slate-200">
          {parts.match ?
          <>
              {parts.before}
              <span className="font-bold text-white">{parts.match}</span>
              {parts.after}
            </> :

          word.exampleEn
          }
        </span>
        <span dir="rtl" className="truncate text-[12px] text-slate-500">
          {word.exampleAr}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onPlay(word.word)}
        aria-label={`استمع إلى ${word.word}`}
        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-cyan-300">

        <Volume2Icon size={17} aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => onLearn(word)}
        disabled={isPending}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-[12px] font-bold text-violet-200 transition hover:border-violet-400/60 hover:bg-violet-500/20 disabled:opacity-60">

        {isPending && <Loader2Icon size={13} className="animate-spin" aria-hidden />}
        تعلّم
      </button>
    </div>);

}