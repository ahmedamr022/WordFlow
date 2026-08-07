import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CopyIcon,
  FileTextIcon,
  LayersIcon,
  LockIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon } from
'lucide-react';
import type { AdminStoryRow, DuplicateGroup, StoryStatus } from '../types';
import {
  DB_STORY_ROWS,
  PLAYABLE_STORY_KEYS,
  STATIC_STORIES } from
'../data/stories';
import { VOCABULARY_CATEGORIES } from '../data/vocabulary';
import { mergeStoryCatalog } from '../utils/storyCatalog';
import { normalizeText } from '../utils/identity';
import { useVocabulary } from '../hooks/useVocabulary';
import { AppShell } from '../components/layout/AppShell';
import { StoriesTable } from '../components/admin/StoriesTable';
import { DuplicatesPanel } from '../components/admin/DuplicatesPanel';
import { Bar, Surface, cx } from '../components/ui/Primitives';
import { ACCENTS, resolveIcon } from '../utils/icons';

type AdminTab = 'overview' | 'stories' | 'duplicates' | 'vocabulary';

const TABS: Array<{key: AdminTab;labelAr: string;}> = [
{ key: 'overview', labelAr: 'نظرة عامة' },
{ key: 'stories', labelAr: 'القصص' },
{ key: 'duplicates', labelAr: 'التكرارات' },
{ key: 'vocabulary', labelAr: 'المفردات' }];


function statusOfStory(row: {
  isLocked?: boolean;
  hasContent: boolean;
}): StoryStatus {
  if (row.isLocked) return 'locked';
  return row.hasContent ? 'published' : 'draft';
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone






}: {icon: typeof BookOpenIcon;label: string;value: string;hint?: string;tone: string;}) {
  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11.5px] text-white/40">{label}</p>
          <p className="mt-1.5 font-en text-2xl font-extrabold leading-none text-white">
            {value}
          </p>
          {hint ?
          <p className="mt-1.5 text-[11px] text-white/35">{hint}</p> :
          null}
        </div>
        <span
          className={cx(
            'inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]',
            tone
          )}>
          
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Surface>);

}

export function AdminPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<AdminTab>('overview');
  const [statusFilter, setStatusFilter] = useState<'all' | StoryStatus>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [resolvedGroups, setResolvedGroups] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);

  const { overallStats } = useVocabulary();

  const merged = useMemo(
    () =>
    mergeStoryCatalog({
      staticStories: STATIC_STORIES,
      dbStories: DB_STORY_ROWS,
      playableKeys: PLAYABLE_STORY_KEYS
    }),
    []
  );

  const [rows, setRows] = useState<AdminStoryRow[]>(() =>
  merged.stories.map((story, index) => ({
    ...story,
    status: statusOfStory(story),
    sentences: story.hasContent ? 8 + index % 5 * 3 : 0
  }))
  );

  const notify = useCallback((message: string, undo?: () => void) => {
    setToast({ message, undo });
    window.setTimeout(() => setToast(null), 5000);
  }, []);

  const visibleRows = useMemo(() => {
    const needle = normalizeText(query);
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        normalizeText(row.titleAr).includes(needle) ||
        normalizeText(row.titleEn).includes(needle) ||
        row.slug.includes(needle));

    });
  }, [rows, query, statusFilter]);

  const setStatus = (id: string, status: StoryStatus) => {
    const previous = rows.find((row) => row.id === id)?.status;
    setRows((current) =>
    current.map((row) => row.id === id ? { ...row, status } : row)
    );
    notify('تم تحديث حالة القصة', () =>
    setRows((current) =>
    current.map((row) =>
    row.id === id && previous ? { ...row, status: previous } : row
    )
    )
    );
  };

  const remove = (id: string) => {
    const snapshot = rows;
    setRows((current) => current.filter((row) => row.id !== id));
    setSelected((current) => current.filter((item) => item !== id));
    notify('تم حذف القصة', () => setRows(snapshot));
  };

  const bulkStatus = (status: StoryStatus) => {
    const snapshot = rows;
    setRows((current) =>
    current.map((row) =>
    selected.includes(row.id) ? { ...row, status } : row
    )
    );
    notify(`تم تحديث ${selected.length} قصة`, () => setRows(snapshot));
    setSelected([]);
  };

  const bulkDelete = () => {
    const snapshot = rows;
    setRows((current) => current.filter((row) => !selected.includes(row.id)));
    notify(`تم حذف ${selected.length} قصة`, () => setRows(snapshot));
    setSelected([]);
  };

  const resolveDuplicate = (group: DuplicateGroup) => {
    setResolvedGroups((current) => [...current, group.key]);
    notify(`تم دمج "${group.kept.titleAr}" ونقل تقدم القراءة إلى النسخة الأصلية`);
  };

  const published = rows.filter((row) => row.status === 'published').length;
  const drafts = rows.filter((row) => row.status === 'draft').length;
  const locked = rows.filter((row) => row.status === 'locked').length;
  const pendingDuplicates = merged.duplicates.filter(
    (group) => !resolvedGroups.includes(group.key)
  ).length;

  return (
    <AppShell
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="ابحث في المحتوى...">
      
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-lg border border-brand-teal/25 bg-brand-teal/10 px-2 py-1 text-[11px] font-semibold text-brand-teal">
            <ShieldCheckIcon className="h-3 w-3" aria-hidden="true" />
            صلاحية مشرف
          </p>
          <h1 className="mt-2 text-[24px] font-extrabold text-white">
            لوحة التحكم
          </h1>
          <p className="mt-1 text-[12.5px] text-white/45">
            إدارة القصص والمفردات ومعالجة تكرار المحتوى
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink px-4 py-2.5 text-[13px] font-bold text-white shadow-glow-purple transition hover:brightness-110">
          
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          قصة جديدة
        </button>
      </header>

      {pendingDuplicates > 0 ?
      <button
        type="button"
        onClick={() => setTab('duplicates')}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-brand-coral/25 bg-brand-coral/[0.07] p-3.5 text-right transition hover:bg-brand-coral/[0.12]">
        
          <CopyIcon
          className="h-4 w-4 shrink-0 text-brand-coral"
          aria-hidden="true" />
        
          <span className="flex-1 text-[12.5px] text-white/70">
            <span className="font-semibold text-white">
              {pendingDuplicates} قصة مكررة
            </span>{' '}
            تم دمجها في العرض لكنها لا تزال موجودة في قاعدة البيانات — افتح
            تبويب التكرارات لتنظيفها.
          </span>
          <span className="shrink-0 text-[12px] font-semibold text-brand-coral">
            معالجة
          </span>
        </button> :
      null}

      <div
        role="tablist"
        aria-label="أقسام لوحة التحكم"
        className="mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.06]">
        
        {TABS.map(({ key, labelAr }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cx(
                'relative shrink-0 px-4 py-2.5 text-[13px] transition',
                active ?
                'font-semibold text-white' :
                'text-white/45 hover:text-white/80'
              )}>
              
              {labelAr}
              {key === 'duplicates' && pendingDuplicates > 0 ?
              <span className="ms-1.5 rounded-md bg-brand-coral/20 px-1.5 font-en text-[10px] font-bold text-brand-coral">
                  {pendingDuplicates}
                </span> :
              null}
              {active ?
              <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-brand-purple" /> :
              null}
            </button>);

        })}
      </div>

      <div className="mt-4">
        {tab === 'overview' ?
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
              icon={FileTextIcon}
              label="إجمالي القصص"
              value={String(rows.length)}
              hint={`${merged.stats.collapsedCount} نسخة مدمجة`}
              tone="text-brand-purple" />
            
              <StatCard
              icon={CheckCircle2Icon}
              label="منشورة"
              value={String(published)}
              tone="text-brand-teal" />
            
              <StatCard
              icon={LockIcon}
              label="مقفلة"
              value={String(locked)}
              tone="text-brand-gold" />
            
              <StatCard
              icon={FileTextIcon}
              label="مسودات"
              value={String(drafts)}
              tone="text-white/50" />
            
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <Surface className="p-4 lg:col-span-2">
                <h2 className="mb-3 text-[13px] font-semibold text-white/80">
                  صحة المحتوى
                </h2>
                <ul className="space-y-3 text-[12px]">
                  {[
                {
                  label: 'قصص لها محتوى قابل للقراءة',
                  value: Math.round(
                    rows.filter((row) => row.sentences > 0).length /
                    Math.max(1, rows.length) *
                    100
                  ),
                  bar: 'bg-brand-teal'
                },
                {
                  label: 'قصص لها صورة غلاف',
                  value: Math.round(
                    rows.filter((row) => Boolean(row.cover)).length /
                    Math.max(1, rows.length) *
                    100
                  ),
                  bar: 'bg-brand-purple'
                },
                {
                  label: 'مُعرّفات موحّدة بدون تكرار',
                  value: Math.round(
                    (rows.length - pendingDuplicates) /
                    Math.max(1, rows.length) *
                    100
                  ),
                  bar: 'bg-brand-cyan'
                }].
                map((item) =>
                <li key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-white/60">{item.label}</span>
                        <span className="font-en text-white/45">
                          {item.value}%
                        </span>
                      </div>
                      <Bar percent={item.value} barClassName={item.bar} />
                    </li>
                )}
                </ul>
              </Surface>

              <div className="grid gap-3">
                <StatCard
                icon={BookOpenIcon}
                label="كلمات في المكتبة"
                value={String(overallStats.total)}
                hint={`${VOCABULARY_CATEGORIES.length} فئة`}
                tone="text-brand-cyan" />
              
                <StatCard
                icon={UsersIcon}
                label="متعلمون نشطون"
                value="1,204"
                hint="آخر 7 أيام"
                tone="text-brand-pink" />
              
                <StatCard
                icon={TrendingUpIcon}
                label="متوسط الإكمال"
                value="68%"
                tone="text-brand-gold" />
              
              </div>
            </div>
          </div> :
        null}

        {tab === 'stories' ?
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <span className="sr-only">تصفية بالحالة</span>
                <select
                value={statusFilter}
                onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | StoryStatus)
                }
                className="h-10 rounded-xl border border-white/[0.07] bg-ink-850 px-3 text-[12.5px] text-white/75">
                
                  <option value="all">كل الحالات</option>
                  <option value="published">منشورة</option>
                  <option value="draft">مسودة</option>
                  <option value="locked">مقفلة</option>
                </select>
              </label>

              <p className="inline-flex items-center gap-1.5 text-[11.5px] text-white/35">
                <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
                استخدم شريط البحث بالأعلى للبحث بالعنوان أو المُعرّف
              </p>

              <span className="ms-auto text-[11.5px] text-white/40">
                {visibleRows.length} من {rows.length}
              </span>
            </div>

            <AnimatePresence>
              {selected.length > 0 ?
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand-purple/25 bg-brand-purple/[0.08] p-3">
              
                  <span className="text-[12.5px] font-semibold text-white">
                    {selected.length} محددة
                  </span>
                  <button
                type="button"
                onClick={() => bulkStatus('published')}
                className="rounded-lg border border-brand-teal/30 bg-brand-teal/12 px-3 py-1.5 text-[11.5px] font-semibold text-brand-teal transition hover:bg-brand-teal/20">
                
                    نشر
                  </button>
                  <button
                type="button"
                onClick={() => bulkStatus('locked')}
                className="rounded-lg border border-brand-gold/30 bg-brand-gold/12 px-3 py-1.5 text-[11.5px] font-semibold text-brand-gold transition hover:bg-brand-gold/20">
                
                    قفل
                  </button>
                  <button
                type="button"
                onClick={bulkDelete}
                className="rounded-lg border border-brand-coral/30 bg-brand-coral/12 px-3 py-1.5 text-[11.5px] font-semibold text-brand-coral transition hover:bg-brand-coral/20">
                
                    حذف
                  </button>
                  <button
                type="button"
                onClick={() => setSelected([])}
                className="ms-auto text-[11.5px] text-white/45 transition hover:text-white">
                
                    إلغاء التحديد
                  </button>
                </motion.div> :
            null}
            </AnimatePresence>

            <StoriesTable
            rows={visibleRows}
            selected={selected}
            onToggleRow={(id) =>
            setSelected((current) =>
            current.includes(id) ?
            current.filter((item) => item !== id) :
            [...current, id]
            )
            }
            onToggleAll={(checked) =>
            setSelected(checked ? visibleRows.map((row) => row.id) : [])
            }
            onStatusChange={setStatus}
            onDelete={remove} />
          
          </div> :
        null}

        {tab === 'duplicates' ?
        <DuplicatesPanel
          groups={merged.duplicates}
          resolved={resolvedGroups}
          onResolve={resolveDuplicate} /> :

        null}

        {tab === 'vocabulary' ?
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VOCABULARY_CATEGORIES.map((category) => {
            const Icon = resolveIcon(category.icon);
            const accent = ACCENTS[category.accent];
            const levels = new Set(
              category.words.map((word) => word.cefrLevel)
            );
            return (
              <Surface key={category.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <span
                    className={cx(
                      'inline-flex h-10 w-10 items-center justify-center rounded-xl border',
                      accent.bg,
                      accent.border,
                      accent.text
                    )}>
                    
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-white">
                        {category.titleAr}
                      </p>
                      <p className="font-en text-[11px] text-white/35">
                        {category.id}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-3.5 grid grid-cols-2 gap-2 text-[11.5px]">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <dt className="text-white/35">كلمات</dt>
                      <dd className="font-en text-base font-bold text-white">
                        {category.words.length}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <dt className="text-white/35">مستويات</dt>
                      <dd className="font-en text-base font-bold text-white">
                        {levels.size}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex gap-2">
                    <button
                    type="button"
                    className="flex-1 rounded-xl border border-white/[0.08] py-2 text-[11.5px] font-semibold text-white/70 transition hover:text-white">
                    
                      إدارة الكلمات
                    </button>
                    <button
                    type="button"
                    aria-label={`تدقيق تكرار كلمات ${category.titleAr}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/45 transition hover:text-white">
                    
                      <LayersIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </Surface>);

          })}
          </div> :
        null}
      </div>

      <AnimatePresence>
        {toast ?
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          role="status"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/[0.09] bg-ink-800 px-4 py-3 shadow-2xl">
          
            <CheckCircle2Icon
            className="h-4 w-4 text-brand-teal"
            aria-hidden="true" />
          
            <span className="text-[12.5px] text-white/80">{toast.message}</span>
            {toast.undo ?
          <button
            type="button"
            onClick={() => {
              toast.undo?.();
              setToast(null);
            }}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-purple transition hover:brightness-125">
            
                <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                تراجع
              </button> :
          null}
          </motion.div> :
        null}
      </AnimatePresence>
    </AppShell>);

}