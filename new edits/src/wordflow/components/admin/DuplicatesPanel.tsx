import React from 'react';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  GitMergeIcon,
  ShieldCheckIcon } from
'lucide-react';
import type { DuplicateGroup } from '../../types';
import { EmptyState, Surface, cx } from '../ui/Primitives';

/**
 * Admin view of the de-duplication result. The merge is automatic at read time,
 * but the admin still needs to CLEAN THE DATABASE — otherwise the duplicate
 * rows keep coming back on every deploy.
 */
export function DuplicatesPanel({
  groups,
  onResolve,
  resolved




}: {groups: DuplicateGroup[];onResolve: (group: DuplicateGroup) => void;resolved: string[];}) {
  const REASONS: Record<DuplicateGroup['reason'], string> = {
    slug: 'نفس المُعرّف (slug)',
    title: 'نفس العنوان بعد التطبيع',
    content: 'نفس المحتوى'
  };

  return (
    <div className="space-y-3">
      <Surface className="border-brand-gold/20 bg-brand-gold/[0.05] p-4">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold"
            aria-hidden="true" />
          
          <div className="text-[12.5px] leading-relaxed text-white/65">
            <p className="font-semibold text-white">سبب التكرار</p>
            <p className="mt-1">
              القصص الثابتة تحمل مُعرّفات مكتوبة يدوياً، وسكربت الـ seed ولوحة
              التحكم يولّدان الـ slug بطريقتين مختلفتين. الدمج القديم كان يعتمد
              على تطابق حرفي للمُعرّف فقط، فأي اختلاف بحرف واحد كان يُنتج نسخة
              ثانية من نفس القصة.
            </p>
            <ol className="mt-2.5 list-inside list-decimal space-y-1 text-white/50">
              <li>
                استخدم مولّد <span className="font-en">toSlug()</span> الموحّد في
                سكربت الـ seed وفي لوحة التحكم وفي البيانات الثابتة.
              </li>
              <li>
                القراءة تمرّ عبر{' '}
                <span className="font-en">mergeStoryCatalog()</span> الذي يطابق
                بالمُعرّف ثم بالعنوان بعد التطبيع العربي.
              </li>
              <li>
                نظّف الصفوف المكررة من قاعدة البيانات من هنا، ثم أضف قيد
                التفرّد حتى لا تعود.
              </li>
            </ol>
            <pre className="mt-2.5 overflow-x-auto rounded-xl border border-white/[0.07] bg-ink-950/80 p-3 font-en text-[11px] leading-relaxed text-brand-teal/90">
{`-- 1) دمج التقدم على الصف الأقدم ثم حذف الصفوف الزائدة
-- 2) منع التكرار مستقبلاً
create unique index if not exists stories_slug_unique
  on public.stories (slug) where deleted_at is null;`}
            </pre>
          </div>
        </div>
      </Surface>

      {groups.length === 0 ?
      <EmptyState
        icon={ShieldCheckIcon}
        title="لا توجد قصص مكررة"
        description="كل القصص لها مُعرّف موحّد وعنوان فريد." /> :


      <ul className="space-y-2.5">
          {groups.map((group) => {
          const done = resolved.includes(group.key);
          return (
            <li key={group.key}>
                <Surface
                className={cx(
                  'p-4 transition',
                  done ? 'border-brand-teal/25 bg-brand-teal/[0.05]' : ''
                )}>
                
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                    className={cx(
                      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                      done ?
                      'border-brand-teal/35 bg-brand-teal/15 text-brand-teal' :
                      'border-brand-coral/30 bg-brand-coral/12 text-brand-coral'
                    )}>
                    
                      {done ?
                    <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> :

                    <GitMergeIcon className="h-4 w-4" aria-hidden="true" />
                    }
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-white">
                        {group.kept.titleAr}
                      </p>
                      <p className="mt-0.5 font-en text-[11px] text-white/35">
                        {group.kept.titleEn}
                      </p>
                      <p className="mt-1.5 text-[11.5px] text-white/45">
                        سبب المطابقة: {REASONS[group.reason]}
                      </p>

                      <ul className="mt-2.5 space-y-1.5">
                        <li className="flex flex-wrap items-center gap-2 text-[11.5px]">
                          <span className="rounded-md border border-brand-teal/25 bg-brand-teal/10 px-1.5 py-0.5 text-brand-teal">
                            المُحتفظ به
                          </span>
                          <code className="font-en text-white/70">
                            {group.kept.slug}
                          </code>
                          <span className="text-white/30">
                            ({group.kept.source === 'db' ? 'قاعدة البيانات' : 'ثابتة'})
                          </span>
                        </li>
                        {group.shadowed.map((story) =>
                      <li
                        key={story.slug}
                        className="flex flex-wrap items-center gap-2 text-[11.5px]">
                        
                            <span className="rounded-md border border-brand-coral/25 bg-brand-coral/10 px-1.5 py-0.5 text-brand-coral">
                              نسخة زائدة
                            </span>
                            <code className="font-en text-white/50 line-through">
                              {story.slug}
                            </code>
                            <span className="text-white/30">
                              ({story.source === 'db' ? 'قاعدة البيانات' : 'ثابتة'})
                            </span>
                          </li>
                      )}
                      </ul>
                    </div>

                    <button
                    type="button"
                    disabled={done}
                    onClick={() => onResolve(group)}
                    className={cx(
                      'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition',
                      done ?
                      'cursor-default border border-brand-teal/25 text-brand-teal' :
                      'border border-brand-purple/35 bg-brand-purple/12 text-brand-purple hover:bg-brand-purple/22'
                    )}>
                    
                      <DatabaseIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {done ? 'تم التنظيف' : 'دمج ونقل التقدم'}
                    </button>
                  </div>
                </Surface>
              </li>);

        })}
        </ul>
      }
    </div>);

}