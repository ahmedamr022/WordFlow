import React from 'react';
import {
  EyeIcon,
  FileTextIcon,
  LockIcon,
  PencilIcon,
  Trash2Icon } from
'lucide-react';
import type { AdminStoryRow, StoryStatus } from '../../types';
import { Badge, EmptyState, cx } from '../ui/Primitives';

const STATUS_META: Record<
  StoryStatus,
  {labelAr: string;className: string;}> =
{
  published: {
    labelAr: 'منشورة',
    className: 'border-brand-teal/25 bg-brand-teal/10 text-brand-teal'
  },
  draft: {
    labelAr: 'مسودة',
    className: 'border-white/12 bg-white/[0.05] text-white/55'
  },
  locked: {
    labelAr: 'مقفلة',
    className: 'border-brand-gold/25 bg-brand-gold/10 text-brand-gold'
  }
};

export function StoriesTable({
  rows,
  selected,
  onToggleRow,
  onToggleAll,
  onStatusChange,
  onDelete







}: {rows: AdminStoryRow[];selected: string[];onToggleRow: (id: string) => void;onToggleAll: (checked: boolean) => void;onStatusChange: (id: string, status: StoryStatus) => void;onDelete: (id: string) => void;}) {
  if (rows.length === 0)
  return (
    <EmptyState
      icon={FileTextIcon}
      title="لا توجد قصص مطابقة"
      description="عدّل عوامل التصفية أو أنشئ قصة جديدة." />);



  const allSelected = rows.every((row) => selected.includes(row.id));

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-ink-850/70">
      <table className="w-full min-w-[720px] border-collapse text-right">
        <caption className="sr-only">قائمة القصص في لوحة التحكم</caption>
        <thead>
          <tr className="border-b border-white/[0.06] text-[11.5px] text-white/40">
            <th scope="col" className="px-3 py-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent accent-brand-purple" />
                
                <span className="sr-only">تحديد الكل</span>
              </label>
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              القصة
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              المُعرّف
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              المستوى
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              الجمل
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              الحالة
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = selected.includes(row.id);
            return (
              <tr
                key={row.id}
                className={cx(
                  'border-b border-white/[0.04] text-[12.5px] transition last:border-0',
                  isSelected ? 'bg-brand-purple/[0.07]' : 'hover:bg-white/[0.02]'
                )}>
                
                <td className="px-3 py-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(row.id)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent accent-brand-purple" />
                    
                    <span className="sr-only">تحديد {row.titleAr}</span>
                  </label>
                </td>
                <td className="max-w-[220px] px-3 py-3">
                  <p className="truncate font-semibold text-white">
                    {row.titleAr}
                  </p>
                  <p className="truncate font-en text-[11px] text-white/35">
                    {row.titleEn}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <code className="font-en text-[11px] text-white/50">
                    {row.slug}
                  </code>
                  {row.mergedFrom.length > 1 ?
                  <Badge className="ms-2 border-brand-teal/25 bg-brand-teal/10 text-brand-teal">
                      مدمجة
                    </Badge> :
                  null}
                </td>
                <td className="px-3 py-3 font-en text-white/60">{row.level}</td>
                <td className="px-3 py-3">
                  {row.sentences === 0 ?
                  <span className="text-brand-coral">فارغة</span> :

                  <span className="font-en text-white/60">
                      {row.sentences}
                    </span>
                  }
                </td>
                <td className="px-3 py-3">
                  <label>
                    <span className="sr-only">حالة {row.titleAr}</span>
                    <select
                      value={row.status}
                      onChange={(event) =>
                      onStatusChange(row.id, event.target.value as StoryStatus)
                      }
                      className={cx(
                        'rounded-lg border px-2 py-1 text-[11.5px] font-semibold',
                        STATUS_META[row.status].className
                      )}>
                      
                      {(Object.keys(STATUS_META) as StoryStatus[]).map(
                        (status) =>
                        <option key={status} value={status}>
                            {STATUS_META[status].labelAr}
                          </option>

                      )}
                    </select>
                  </label>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`تعديل ${row.titleAr}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-white/45 transition hover:text-white">
                      
                      <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`معاينة ${row.titleAr}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-white/45 transition hover:text-white">
                      
                      <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`قفل ${row.titleAr}`}
                      onClick={() =>
                      onStatusChange(
                        row.id,
                        row.status === 'locked' ? 'published' : 'locked'
                      )
                      }
                      className={cx(
                        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition',
                        row.status === 'locked' ?
                        'border-brand-gold/35 bg-brand-gold/12 text-brand-gold' :
                        'border-white/[0.07] text-white/45 hover:text-white'
                      )}>
                      
                      <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف ${row.titleAr}`}
                      onClick={() => onDelete(row.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-white/45 transition hover:border-brand-coral/40 hover:text-brand-coral">
                      
                      <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}