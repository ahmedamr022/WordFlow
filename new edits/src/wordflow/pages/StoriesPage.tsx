import React, { useMemo, useState } from 'react';
import { CheckCircle2Icon, LayersIcon, LockIcon, PlayIcon, StarIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Bar, Chip, EmptyState, Surface, cx } from '../components/ui/Primitives';
import {
  DB_STORY_ROWS,
  PLAYABLE_STORY_KEYS,
  STATIC_STORIES } from
'../data/stories';
import { mergeStoryCatalog } from '../utils/storyCatalog';
import { normalizeText } from '../utils/identity';

/**
 * The catalog is built with `mergeStoryCatalog`, so a story that exists both
 * in `src/data/stories.ts` and in Supabase renders exactly ONCE.
 */
export function StoriesPage() {
  const [query, setQuery] = useState('');

  const { stories, duplicates, stats } = useMemo(
    () =>
    mergeStoryCatalog({
      staticStories: STATIC_STORIES,
      dbStories: DB_STORY_ROWS,
      playableKeys: PLAYABLE_STORY_KEYS
    }),
    []
  );

  const needle = normalizeText(query);
  const visible = needle ?
  stories.filter(
    (story) =>
    normalizeText(story.titleAr).includes(needle) ||
    normalizeText(story.titleEn).includes(needle)
  ) :
  stories;

  return (
    <AppShell
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="ابحث عن قصة...">
      
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold text-white">القصص</h1>
          <p className="mt-1 text-[12.5px] text-white/45">
            {stories.length} قصة متاحة — مصادر ثابتة وقاعدة البيانات مدمجة في
            قائمة واحدة
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip>ثابتة: {stats.staticCount}</Chip>
          <Chip>قاعدة البيانات: {stats.dbCount}</Chip>
          <Chip className="border-brand-teal/25 bg-brand-teal/10 text-brand-teal">
            بعد الدمج: {stats.mergedCount}
          </Chip>
        </div>
      </header>

      {stats.collapsedCount > 0 ?
      <Surface className="mt-4 flex items-start gap-3 border-brand-teal/20 bg-brand-teal/[0.06] p-4">
          <CheckCircle2Icon
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal"
          aria-hidden="true" />
        
          <div className="text-[12.5px] leading-relaxed text-white/65">
            <p className="font-semibold text-white">
              تم دمج {stats.collapsedCount} نسخة مكررة تلقائياً
            </p>
            <p className="mt-1 text-white/45">
              المطابقة تعتمد على المُعرّف الموحّد ثم على العنوان بعد التطبيع
              العربي، لذلك اختلاف الـ slug لم يعد يُنتج نسختين. القصص المدمجة:{' '}
              {duplicates.
            map((group) => group.kept.titleAr).
            join('، ')}
            </p>
          </div>
        </Surface> :
      null}

      {visible.length === 0 ?
      <div className="mt-5">
          <EmptyState icon={LayersIcon} title="لا توجد قصة مطابقة" />
        </div> :

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((story) =>
        <article
          key={story.id}
          className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-850 shadow-card transition hover:border-white/[0.14]">
          
              <div className="relative h-36 overflow-hidden bg-ink-800">
                {story.cover ?
            <img
              src={story.cover}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> :

            null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/40 to-transparent" />
                <span className="absolute right-3 top-3 rounded-lg border border-white/12 bg-black/45 px-2 py-1 font-en text-[10.5px] font-bold text-white/80 backdrop-blur">
                  {story.level}
                </span>
                {story.isNew ?
            <span className="absolute left-3 top-3 rounded-lg border border-brand-teal/35 bg-brand-teal/20 px-2 py-1 text-[10.5px] font-bold text-brand-teal backdrop-blur">
                    جديدة
                  </span> :
            null}
              </div>

              <div className="p-4">
                <h2 className="truncate text-[15px] font-bold text-white">
                  {story.titleAr}
                </h2>
                <p className="mt-0.5 truncate font-en text-[11px] text-white/35">
                  {story.titleEn}
                </p>

                {story.descriptionAr ?
            <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-white/40">
                    {story.descriptionAr}
                  </p> :
            null}

                <div className="mt-3 flex items-center gap-3 text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1">
                    <StarIcon
                  className="h-3 w-3 text-brand-gold"
                  aria-hidden="true" />
                
                    <span className="font-en">{story.rating}</span>
                  </span>
                  <span>{story.duration}</span>
                  <span className="font-en text-brand-gold">{story.xp}</span>
                </div>

                {typeof story.progress === 'number' ?
            <div className="mt-3">
                    <Bar
                percent={story.progress}
                barClassName="bg-gradient-to-l from-brand-cyan to-brand-purple" />
              
                  </div> :
            null}

                <button
              type="button"
              disabled={!story.hasContent}
              className={cx(
                'mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12.5px] font-bold transition',
                story.hasContent ?
                'bg-brand-purple/15 text-brand-purple hover:bg-brand-purple/25' :
                'cursor-not-allowed border border-white/[0.07] text-white/30'
              )}>
              
                  {story.hasContent ?
              <>
                      <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      ابدأ القراءة
                    </> :

              <>
                      <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      قريباً
                    </>
              }
                </button>
              </div>
            </article>
        )}
        </div>
      }
    </AppShell>);

}