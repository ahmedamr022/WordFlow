"use client";

import React, { useState, useTransition } from "react";
import { HistoryIcon, RotateCcwIcon } from "lucide-react";

import { restoreStoryVersionAction } from "@/app/actions/admin/stories";
import { Button } from "@/components/admin/ui/controls";
import { EmptyState, Panel, Spinner } from "@/components/admin/ui/surfaces";
import type { StoryDraft } from "@/lib/admin/draft";
import type { AdminStoryVersion } from "@/types/admin";

/**
 * تاريخ الإصدارات.
 *
 * كل نشر يأخذ Snapshot كاملاً للقصة قبل الكتابة، فالخطأ ليس نهائياً: لو حُذفت
 * جُمل أو تلخبط ضبط صورة، الاستعادة تُرجع الحالة القديمة **كمسودة** لا كنشر
 * مباشر — يعاينها الأدمن أولاً ثم ينشرها بنفسه. استعادة تنشر فوراً هي وصفة
 * لخطأ ثانٍ فوق الأول.
 */

export interface HistoryTabProps {
  storyId: string;
  versions: AdminStoryVersion[];
  onRestored: (draft: StoryDraft) => void;
}

export function HistoryTab({ storyId, versions, onRestored }: HistoryTabProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  function restore(version: AdminStoryVersion) {
    setError(null);
    setRestoringId(version.id);
    startTransition(async () => {
      const result = await restoreStoryVersionAction(storyId, version.id);
      setRestoringId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onRestored(result.data);
    });
  }

  return (
    <Panel title="تاريخ الإصدارات" padded={versions.length === 0}>
      {error &&
      <p className="mx-5 mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] font-bold text-rose-300">
          {error}
        </p>
      }

      {versions.length === 0 ?
      <EmptyState
        title="لا توجد إصدارات بعد"
        description="أول عملية نشر ستُنشئ إصداراً محفوظاً، ومنها يمكنك الرجوع لأي حالة سابقة." /> :


      <ol className="flex flex-col">
          {versions.map((version, index) =>
        <li
          key={version.id}
          className="flex flex-wrap items-center gap-3 border-b border-white/[0.04] px-5 py-3.5 last:border-b-0">

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B111C] text-cyan-300">
                <HistoryIcon className="h-4 w-4" aria-hidden />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-en text-[13px] font-black text-white">
                    v{version.version}
                  </span>
                  {index === 0 &&
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      الأحدث
                    </span>
              }
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-slate-400">
                  {version.summary || "تحديث القصة"}
                </span>
              </span>

              <span className="shrink-0 text-left text-[11px] text-slate-500">
                <span className="block">{version.actorName}</span>
                <span className="font-en block">
                  {new Date(version.createdAt).toLocaleString("ar-EG", {
                dateStyle: "short",
                timeStyle: "short"
              })}
                </span>
              </span>

              <Button
            tone="outline"
            className="shrink-0 px-3 py-2"
            disabled={pending}
            onClick={() => restore(version)}>

                {pending && restoringId === version.id ?
            <Spinner /> :

            <>
                    <RotateCcwIcon className="h-3.5 w-3.5" />
                    استعادة
                  </>
            }
              </Button>
            </li>
        )}
        </ol>
      }
    </Panel>);

}

export default HistoryTab;