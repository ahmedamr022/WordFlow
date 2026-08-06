"use client";
import React from "react";
import { LockIcon, UnlockIcon } from "lucide-react";

import { Button, Field, RadioRow, TextInput, Toggle } from "@/components/admin/ui/controls";
import { Panel } from "@/components/admin/ui/surfaces";
import { LockedStoryOverlay } from "@/components/stories/LockedStoryOverlay";
import type { StoryDraft } from "@/lib/admin/draft";
import type { LockType } from "@/types/admin";

/**
 * صلاحية الوصول (Lock / Unlock).
 *
 * القفل ليس مجرد checkbox في فورم: هو أهم قرار يمسّ ما يراه المستخدم، لذلك
 * يعرض هنا **حالة واضحة + نتيجة مرئية**. الأدمن يرى فوراً شكل الكارت المقفول
 * كما سيراه المستخدم مع رسالته الفعلية، فلا يفاجئه شيء بعد النشر.
 */

export interface AccessTabProps {
  draft: StoryDraft;
  patch: (changes: Partial<StoryDraft>) => void;
}

export function AccessTab({ draft, patch }: AccessTabProps) {
  const { access } = draft;

  return (
    <div className="flex flex-col gap-4">
      <Panel title="صلاحية الوصول">
        <div
          className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-4 py-3.5 ${
          access.locked ?
          "border-rose-500/30 bg-rose-500/[0.07]" :
          "border-emerald-500/30 bg-emerald-500/[0.07]"}`
          }>

          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              access.locked ?
              "bg-rose-500/15 text-rose-300" :
              "bg-emerald-500/15 text-emerald-300"}`
              }>

              {access.locked ?
              <LockIcon className="h-5 w-5" aria-hidden /> :

              <UnlockIcon className="h-5 w-5" aria-hidden />
              }
            </span>
            <div>
              <p className="text-[14px] font-black text-white">
                {access.locked ? "القصة مقفلة حالياً" : "القصة متاحة للجميع"}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {access.locked ?
                "لا يستطيع المستخدم العادي قراءتها، ولو فتح الرابط مباشرة." :
                "أي مستخدم مسجّل يمكنه فتحها والقراءة منها."}
              </p>
            </div>
          </div>

          <Button
            tone={access.locked ? "primary" : "danger"}
            onClick={() =>
            patch({
              access: { ...access, locked: !access.locked },
              status: !access.locked ? "locked" : "published"
            })
            }>

            {access.locked ? "فتح القصة" : "قفل القصة"}
          </Button>
        </div>

        {access.locked &&
        <div className="mt-4 flex flex-col gap-3.5">
            <div>
              <p className="mb-2 text-[12px] font-bold text-slate-400">نوع القفل</p>
              <RadioRow
              name="lock-type"
              value={access.lockType}
              onChange={(lockType: LockType) => patch({ access: { ...access, lockType } })}
              options={[
              { value: "visible", label: "ظاهرة لكن مقفلة — تبني الترقّب" },
              { value: "hidden", label: "مخفية تماماً — لا تظهر في المكتبة" }]
              } />

            </div>

            <Field label="رسالة القفل" hint="تظهر داخل الكارت وفي صفحة القصة">
              <TextInput
              value={access.lockMessage}
              onChange={(event) => patch({ access: { ...access, lockMessage: event.target.value } })}
              placeholder="هذه القصة غير متاحة حالياً" />

            </Field>
          </div>
        }
      </Panel>

      <Panel title="معاينة رسالة القفل">
        {access.locked ?
        <div className="mx-auto w-[240px]">
            <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e1a]">
              {draft.coverImage &&
            <img
              src={draft.coverImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover" />

            }
              <LockedStoryOverlay message={access.lockMessage} />
            </div>
            <p className="mt-3 text-center text-[11.5px] leading-relaxed text-slate-500">
              {access.lockType === "hidden" ?
            "بنوع «مخفية تماماً» لن يرى المستخدم هذا الكارت من الأصل." :
            "هذا ما يراه المستخدم العادي في المكتبة."}
            </p>
          </div> :

        <p className="py-6 text-center text-[12.5px] text-slate-500">
            القصة غير مقفلة — لا توجد رسالة قفل لعرضها.
          </p>
        }
      </Panel>

      <Panel title="ملاحظة مهمة">
        <p className="text-[12.5px] leading-relaxed text-slate-400">
          القفل لا يحذف تقدّم أي مستخدم. من قرأ جزءاً من القصة قبل قفلها يبقى
          تقدّمه محفوظاً، ويكمل من نفس الجملة لحظة فتحها مرة أخرى.
        </p>
      </Panel>
    </div>);

}

export default AccessTab;