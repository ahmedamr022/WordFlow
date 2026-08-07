import React, { useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  GaugeIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  TimerIcon,
  ZapIcon } from
'lucide-react';
import type { VocabularyCategory, VocabularyWord } from '../types';
import {
  ALL_WORDS,
  VOCABULARY_CATEGORIES,
  getCategoryOfWord } from
'../data/vocabulary';
import { useVocabulary } from '../hooks/useVocabulary';
import { useReviewSession } from '../hooks/useReviewSession';
import { useSpeech } from '../hooks/useSpeech';
import { AppShell } from '../components/layout/AppShell';
import { CategoryCard } from '../components/vocabulary/CategoryCard';
import { CategoryRail } from '../components/vocabulary/CategoryRail';
import { WordRow } from '../components/vocabulary/WordRow';
import { WordDetailPanel } from '../components/vocabulary/WordDetailPanel';
import { WordDetailSheet } from '../components/vocabulary/WordDetailSheet';
import { ReviewFlow } from '../components/review/ReviewFlow';
import { EmptyState, ProgressRing, Surface, cx } from '../components/ui/Primitives';
import { normalizeText } from '../utils/identity';

const HERO_IMAGE = "/735c4fc4-4106-42af-bf42-24381d60590f.jpg";


/** Synthetic "all vocabulary" category so the rail can be reused as-is. */
const ALL_CATEGORY: VocabularyCategory = {
  id: 'all',
  titleAr: 'كل المفردات',
  titleEn: 'All Vocabulary',
  descAr: '',
  icon: 'book',
  accent: 'purple',
  coverImage: HERO_IMAGE,
  words: ALL_WORDS
};

const QUICK_ACTIONS = [
{
  key: 'due',
  titleAr: 'مراجعة الكلمات',
  icon: CalendarCheckIcon,
  tone: 'text-brand-purple',
  border: 'border-brand-purple/25'
},
{
  key: 'quiz',
  titleAr: 'اختبار سريع',
  icon: TimerIcon,
  tone: 'text-brand-cyan',
  border: 'border-brand-cyan/25'
},
{
  key: 'weak',
  titleAr: 'كلمات ضعيفة',
  icon: GaugeIcon,
  tone: 'text-brand-pink',
  border: 'border-brand-pink/25'
},
{
  key: 'favorites',
  titleAr: 'المفضلة',
  icon: StarIcon,
  tone: 'text-brand-gold',
  border: 'border-brand-gold/25'
},
{
  key: 'fresh',
  titleAr: 'كلمات جديدة',
  icon: SparklesIcon,
  tone: 'text-brand-teal',
  border: 'border-brand-teal/25'
}] as
const;

export function WordsPage() {
  const [query, setQuery] = useState('');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const { statsFor, overallStats, dueWords, favoriteWords } = useVocabulary();
  const session = useReviewSession();
  const { speak, speakingId } = useSpeech();

  const normalizedQuery = normalizeText(query);

  const categories = useMemo(() => {
    if (!normalizedQuery) return VOCABULARY_CATEGORIES;
    return VOCABULARY_CATEGORIES.filter(
      (category) =>
      normalizeText(category.titleAr).includes(normalizedQuery) ||
      normalizeText(category.titleEn).includes(normalizedQuery) ||
      normalizeText(category.descAr).includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const matchedWords = useMemo(() => {
    if (normalizedQuery.length < 2) return [];
    return ALL_WORDS.filter(
      (word) =>
      normalizeText(word.word).includes(normalizedQuery) ||
      normalizeText(word.translationAr).includes(normalizedQuery)
    ).slice(0, 10);
  }, [normalizedQuery]);

  const selectedWord = selectedWordId ?
  ALL_WORDS.find((word) => word.id === selectedWordId) :
  undefined;
  const selectedCategory = selectedWordId ?
  getCategoryOfWord(selectedWordId) :
  undefined;

  const startQuickAction = (key: (typeof QUICK_ACTIONS)[number]['key']) => {
    if (key === 'favorites') {
      const favorites = favoriteWords();
      session.openIntro(favorites.length ? favorites : ALL_WORDS, 'المفضلة');
      return;
    }
    if (key === 'weak') {
      session.openIntro(
        [...ALL_WORDS].sort(
          (a, b) => a.word.length % 5 - b.word.length % 5
        ),
        'الكلمات الضعيفة'
      );
      return;
    }
    session.openIntro(ALL_WORDS, 'مراجعة اليوم');
  };

  const railContent =
  selectedWord && selectedCategory ?
  <WordDetailPanel
    word={selectedWord}
    accent={selectedCategory.accent}
    categoryTitle={selectedCategory.titleAr}
    onClose={() => setSelectedWordId(null)}
    onReview={(word) => session.startImmediately([word], 'مراجعة سريعة')} /> :


  <CategoryRail
    category={ALL_CATEGORY}
    stats={overallStats}
    onStartSession={() => session.openIntro(ALL_WORDS, 'مراجعة اليوم')} />;



  return (
    <AppShell
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="ابحث عن كلمة أو فئة..."
      rail={railContent}>
      
      <section
        aria-label="ملخص التقدم"
        className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-ink-850">
        
        <img
          src={HERO_IMAGE}
          alt=""
          className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/2 object-cover opacity-60" />
        
        <div className="absolute inset-0 bg-gradient-to-l from-ink-850/40 via-ink-850/85 to-ink-850" />

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[13px] text-white/60">
              <BookOpenIcon
                className="h-4 w-4 text-brand-purple"
                aria-hidden="true" />
              
              مرحبا بك في رحلة التعلم 👋
            </p>
            <h1 className="mt-2 flex items-baseline gap-2">
              <span className="font-en text-[34px] font-extrabold leading-none text-white">
                {ALL_WORDS.length.toLocaleString('en-US')}
              </span>
              <span className="text-sm text-white/50">كلمة في مكتبتك</span>
            </h1>
            <p className="mt-1.5 text-[12.5px] text-white/45">
              اليوم لديك{' '}
              <span className="font-en font-bold text-brand-cyan">
                {dueWords().length}
              </span>{' '}
              كلمة جاهزة للمراجعة
            </p>

            <button
              type="button"
              onClick={() => session.openIntro(ALL_WORDS, 'مراجعة اليوم')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink px-5 py-2.5 text-[13.5px] font-bold text-white shadow-glow-purple transition hover:brightness-110">
              
              ابدأ المراجعة
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <ProgressRing
              percent={overallStats.percent}
              size={116}
              stroke={9}
              color="#00f2fe">
              
              <span className="font-en text-xl font-extrabold text-white">
                {overallStats.percent}%
              </span>
              <span className="mt-0.5 text-[10px] text-white/40">
                تقدمك العام
              </span>
            </ProgressRing>

            <ul className="grid grid-cols-2 gap-2 text-[11px]">
              {[
              { label: 'متقنة', value: overallStats.mastered, tone: 'text-brand-teal' },
              { label: 'قيد التعلم', value: overallStats.learning, tone: 'text-brand-purple' },
              { label: 'للمراجعة', value: overallStats.due, tone: 'text-brand-gold' },
              { label: 'جديدة', value: overallStats.fresh, tone: 'text-brand-cyan' }].
              map((item) =>
              <li
                key={item.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                
                  <p className={cx('font-en text-base font-bold', item.tone)}>
                    {item.value}
                  </p>
                  <p className="text-white/40">{item.label}</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <h2 className="mt-6 mb-2.5 text-[13px] font-semibold text-white/70">
        إجراءات سريعة
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {QUICK_ACTIONS.map(({ key, titleAr, icon: Icon, tone, border }) =>
        <button
          key={key}
          type="button"
          onClick={() => startQuickAction(key)}
          className={cx(
            'flex items-center gap-2.5 rounded-2xl border bg-ink-850/70 px-3.5 py-3 text-right transition hover:bg-ink-800',
            border
          )}>
          
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
              <Icon className={cx('h-4 w-4', tone)} aria-hidden="true" />
            </span>
            <span className="min-w-0 text-[12.5px] font-semibold text-white/85">
              {titleAr}
            </span>
          </button>
        )}
      </div>

      {matchedWords.length > 0 ?
      <section className="mt-6" aria-label="نتائج البحث في الكلمات">
          <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-white/70">
            <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
            كلمات مطابقة
            <span className="font-en text-white/35">{matchedWords.length}</span>
          </h2>
          <ul className="space-y-2">
            {matchedWords.map((word: VocabularyWord, index) => {
            const category = getCategoryOfWord(word.id);
            return (
              <WordRow
                key={word.id}
                word={word}
                accent={category?.accent ?? 'purple'}
                index={index}
                selected={selectedWordId === word.id}
                onSelect={() =>
                setSelectedWordId((current) =>
                current === word.id ? null : word.id
                )
                }
                onPlay={() => speak(word.word, word.id)}
                speaking={speakingId === word.id} />);


          })}
          </ul>
        </section> :
      null}

      <div className="mt-6 mb-2.5 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-white/70">
          مجموعات المفردات
          <span className="ms-2 font-en text-white/35">
            {categories.length}
          </span>
        </h2>
        <p className="text-[11px] text-white/35">
          كل مجموعة تحتوي على كلماتها وتقدمها الخاص
        </p>
      </div>

      {categories.length === 0 ?
      <EmptyState
        icon={SearchIcon}
        title="لا توجد فئة مطابقة"
        description="جرّب كلمة بحث أخرى أو تصفح كل المجموعات." /> :


      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) =>
        <CategoryCard
          key={category.id}
          category={category}
          stats={statsFor(category)}
          index={index} />

        )}
        </div>
      }

      <Surface className="mt-6 flex flex-wrap items-center gap-3 p-4">
        <ZapIcon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
        <p className="flex-1 text-[12px] text-white/50">
          نصيحة: افتح أي كلمة لتظهر تفاصيلها في اللوحة الجانبية دون مغادرة
          القائمة — استخدم ↑ ↓ للتنقل بينها.
        </p>
      </Surface>

      {selectedWord && selectedCategory ?
      <WordDetailSheet
        open
        word={selectedWord}
        accent={selectedCategory.accent}
        categoryTitle={selectedCategory.titleAr}
        onClose={() => setSelectedWordId(null)}
        onReview={(word) => session.startImmediately([word], 'مراجعة سريعة')} /> :

      null}

      <ReviewFlow session={session} reviewMorePool={ALL_WORDS} />
    </AppShell>);

}