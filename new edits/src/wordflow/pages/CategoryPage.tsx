import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRightIcon, PlayIcon, SearchIcon, SparklesIcon, TrendingUpIcon } from 'lucide-react';
import { getCategory } from '../data/vocabulary';
import { useVocabulary } from '../hooks/useVocabulary';
import { useReviewSession } from '../hooks/useReviewSession';
import { useSpeech } from '../hooks/useSpeech';
import { statusOf } from '../utils/srs';
import { normalizeText } from '../utils/identity';
import { ACCENTS, resolveIcon } from '../utils/icons';
import { AppShell } from '../components/layout/AppShell';
import { CategoryRail } from '../components/vocabulary/CategoryRail';
import { WordRow, WordTile } from '../components/vocabulary/WordRow';
import { WordDetailPanel } from '../components/vocabulary/WordDetailPanel';
import { WordDetailSheet } from '../components/vocabulary/WordDetailSheet';
import { Pagination } from '../components/vocabulary/Pagination';
import {
  LEVELS,
  TABS,
  WordsToolbar,
  type SortKey,
  type ViewMode,
  type WordTab } from
'../components/vocabulary/WordsToolbar';
import { ReviewFlow } from '../components/review/ReviewFlow';
import { Chip, EmptyState, cx } from '../components/ui/Primitives';

const PAGE_SIZE = 8;

export function CategoryPage() {
  const { categoryId = '' } = useParams();
  const category = getCategory(categoryId);

  const [headerQuery, setHeaderQuery] = useState('');
  const [tab, setTab] = useState<WordTab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [levels, setLevels] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [view, setView] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const { progress, statsFor } = useVocabulary();
  const session = useReviewSession();
  const { speak, speakingId } = useSpeech();

  useEffect(() => {
    setPage(1);
  }, [tab, query, sort, levels, favoritesOnly, categoryId]);

  if (!category) {
    return (
      <AppShell query={headerQuery} onQueryChange={setHeaderQuery}>
        <EmptyState
          icon={SearchIcon}
          title="هذه الفئة غير موجودة"
          description="ربما تم حذفها أو تغيّر رابطها."
          action={
          <Link
            to="/words"
            className="mt-1 rounded-xl border border-white/[0.1] px-4 py-2 text-[12.5px] text-white/75 transition hover:text-white">
            
              العودة إلى جميع الفئات
            </Link>
          } />
        
      </AppShell>);

  }

  const stats = statsFor(category);
  const accent = ACCENTS[category.accent];
  const Icon = resolveIcon(category.icon);

  const counts = useMemo(() => {
    const result: Record<WordTab, number> = {
      all: category.words.length,
      new: 0,
      learning: 0,
      due: 0,
      mastered: 0
    };
    for (const word of category.words) result[statusOf(progress[word.id])] += 1;
    return result;
  }, [category.words, progress]);

  const filtered = useMemo(() => {
    const needle = normalizeText(query);
    let list = category.words.filter((word) => {
      if (tab !== 'all' && statusOf(progress[word.id]) !== tab) return false;
      if (levels.length > 0 && !levels.includes(word.cefrLevel)) return false;
      if (favoritesOnly && !progress[word.id]?.favorite) return false;
      if (
      needle &&
      !normalizeText(word.word).includes(needle) &&
      !normalizeText(word.translationAr).includes(needle) &&
      !normalizeText(word.exampleEn).includes(needle))

      return false;
      return true;
    });

    if (sort === 'alpha')
    list = [...list].sort((a, b) => a.word.localeCompare(b.word));else
    if (sort === 'mastery-asc')
    list = [...list].sort(
      (a, b) => (progress[a.id]?.mastery ?? 0) - (progress[b.id]?.mastery ?? 0)
    );else
    if (sort === 'mastery-desc')
    list = [...list].sort(
      (a, b) => (progress[b.id]?.mastery ?? 0) - (progress[a.id]?.mastery ?? 0)
    );else
    if (sort === 'level')
    list = [...list].sort(
      (a, b) =>
      LEVELS.indexOf(a.cefrLevel as (typeof LEVELS)[number]) -
      LEVELS.indexOf(b.cefrLevel as (typeof LEVELS)[number])
    );

    return list;
  }, [category.words, tab, levels, favoritesOnly, query, sort, progress]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const selectedIndex = filtered.findIndex((word) => word.id === selectedWordId);
  const selectedWord = selectedIndex >= 0 ? filtered[selectedIndex] : undefined;

  /** Walking with ↑ / ↓ also follows the list across page boundaries. */
  const goTo = (nextIndex: number) => {
    const word = filtered[nextIndex];
    if (!word) return;
    setSelectedWordId(word.id);
    setPage(Math.floor(nextIndex / PAGE_SIZE) + 1);
  };

  const detailPanel = selectedWord ?
  <WordDetailPanel
    word={selectedWord}
    accent={category.accent}
    categoryTitle={category.titleAr}
    onClose={() => setSelectedWordId(null)}
    onPrev={selectedIndex > 0 ? () => goTo(selectedIndex - 1) : undefined}
    onNext={
    selectedIndex < filtered.length - 1 ?
    () => goTo(selectedIndex + 1) :
    undefined
    }
    onReview={(word) => session.startImmediately([word], 'مراجعة سريعة')} /> :

  null;

  return (
    <AppShell
      query={headerQuery}
      onQueryChange={setHeaderQuery}
      rail={
      detailPanel ??
      <CategoryRail
        category={category}
        stats={stats}
        onStartSession={() =>
        session.openIntro(category.words, category.titleAr)
        } />


      }>
      
      <Link
        to="/words"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-white/45 transition hover:text-white">
        
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        العودة إلى جميع الفئات
      </Link>

      <section
        className="relative mt-3 overflow-hidden rounded-[22px] border border-white/[0.07] bg-ink-850"
        aria-label={`فئة ${category.titleAr}`}>
        
        <img
          src={category.coverImage}
          alt=""
          className="pointer-events-none absolute inset-y-0 left-0 h-full w-3/5 object-cover opacity-70" />
        
        <div className="absolute inset-0 bg-gradient-to-l from-ink-850/30 via-ink-850/85 to-ink-850" />

        <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                  accent.bg,
                  accent.border,
                  accent.text
                )}>
                
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-[26px] font-extrabold leading-tight text-white">
                  {category.titleAr}
                </h1>
                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-white/45">
                  {category.descAr}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>{stats.total} كلمة</Chip>
              <Chip className={cx(accent.text, accent.border, accent.bg)}>
                {stats.percent}% متقن
              </Chip>
              <Chip icon={TrendingUpIcon}>+{stats.addedThisWeek} هذا الأسبوع</Chip>
              {stats.due > 0 ?
              <Chip className="border-brand-gold/25 bg-brand-gold/10 text-brand-gold">
                  {stats.due} تحتاج مراجعة
                </Chip> :
              null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => session.openIntro(category.words, category.titleAr)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink px-5 py-3 text-[13.5px] font-bold text-white shadow-glow-purple transition hover:brightness-110">
            
            <PlayIcon className="h-4 w-4" aria-hidden="true" />
            ابدأ مراجعة المجموعة
          </button>
        </div>
      </section>

      <div className="mt-5">
        <WordsToolbar
          tab={tab}
          onTabChange={setTab}
          counts={counts}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          levels={levels}
          onLevelsChange={setLevels}
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={setFavoritesOnly}
          view={view}
          onViewChange={setView} />
        
      </div>

      <p className="mt-3 text-[11.5px] text-white/35">
        {filtered.length} كلمة
        {filtered.length !== category.words.length ?
        ` من أصل ${category.words.length}` :
        ''}
      </p>

      {visible.length === 0 ?
      <div className="mt-3">
          <EmptyState
          icon={SparklesIcon}
          title="لا توجد كلمات في هذا التصنيف"
          description={
          TABS.find((item) => item.key === tab)?.labelAr ?
          `لا توجد كلمات ضمن "${TABS.find((item) => item.key === tab)?.labelAr}" حالياً. جرّب تبويباً آخر أو أزل عوامل التصفية.` :
          undefined
          } />
        
        </div> :
      view === 'list' ?
      <ul className="mt-3 space-y-2">
          {visible.map((word, index) =>
        <WordRow
          key={word.id}
          word={word}
          accent={category.accent}
          index={index}
          selected={selectedWordId === word.id}
          onSelect={() =>
          setSelectedWordId((current) =>
          current === word.id ? null : word.id
          )
          }
          onPlay={() => speak(word.word, word.id)}
          speaking={speakingId === word.id} />

        )}
        </ul> :

      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((word, index) =>
        <WordTile
          key={word.id}
          word={word}
          accent={category.accent}
          index={index}
          selected={selectedWordId === word.id}
          onSelect={() =>
          setSelectedWordId((current) =>
          current === word.id ? null : word.id
          )
          }
          onPlay={() => speak(word.word, word.id)}
          speaking={speakingId === word.id} />

        )}
        </ul>
      }

      <div className="pb-4">
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {selectedWord ?
      <WordDetailSheet
        open
        word={selectedWord}
        accent={category.accent}
        categoryTitle={category.titleAr}
        onClose={() => setSelectedWordId(null)}
        onPrev={selectedIndex > 0 ? () => goTo(selectedIndex - 1) : undefined}
        onNext={
        selectedIndex < filtered.length - 1 ?
        () => goTo(selectedIndex + 1) :
        undefined
        }
        onReview={(word) => session.startImmediately([word], 'مراجعة سريعة')} /> :

      null}

      <ReviewFlow session={session} reviewMorePool={category.words} />
    </AppShell>);

}