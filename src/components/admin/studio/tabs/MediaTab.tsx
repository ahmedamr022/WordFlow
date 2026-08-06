"use client";

import React, { useState } from "react";
import { CheckIcon, ImageIcon, LayersIcon, XIcon } from "lucide-react";

import { Button } from "@/components/admin/ui/controls";
import { Panel } from "@/components/admin/ui/surfaces";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { SURFACE_FRAMES } from "@/lib/stories/appearance";
import type { StoryDraft } from "@/lib/admin/draft";
import type { AdminStoryMedia } from "@/types/admin";

/**
 * وسائط القصة: الغلاف والخلفية.
 *
 * المشكلة قبل هذه النسخة: «الفتحة النشطة» كانت مجرد إطار ملوّن، والزر يقول
 * «جاهز للاختيار» — لم يكن واضحاً أن الخطوة التالية هي الضغط على صورة بالأسفل.
 * الآن:
 *   · الفتحة النشطة تحمل شارة «١» و«٢» وشرح الخطوة الحالية أعلى المكتبة.
 *   · كل فتحة تعرض الصورة بنفس **نسبة الإطار الحقيقي** لهذا السطح.
 *   · زر «إزالة» لكل فتحة (كان لا سبيل لإفراغ خلفية بعد اختيارها).
 *   · أول صورة تُرفَع تُستخدم تلقائياً في الفتحة النشطة.
 */

export interface MediaTabProps {
  storyId: string;
  draft: StoryDraft;
  patch: (changes: Partial<StoryDraft>) => void;
  media: AdminStoryMedia[];
  onMediaChange: (items: AdminStoryMedia[]) => void;
}

type SlotKey = "cover" | "background";

export function MediaTab({ storyId, draft, patch, media, onMediaChange }: MediaTabProps) {
  const [target, setTarget] = useState<SlotKey>("cover");

  const slots: {
    key: SlotKey;
    label: string;
    value: string | null;
    hint: string;
    aspect: string;
  }[] = [
  {
    key: "cover",
    label: "صورة الغلاف",
    value: draft.coverImage,
    hint: "تُستخدم في الكارت والمودال وقصة اليوم",
    aspect: SURFACE_FRAMES.card.aspectClass
  },
  {
    key: "background",
    label: "خلفية صفحة القراءة",
    value: draft.bgImage,
    hint: "الصورة العريضة خلف النص",
    aspect: SURFACE_FRAMES.storyPage.aspectClass
  }];


  const activeSlot = slots.find((slot) => slot.key === target) ?? slots[0];

  return (
    <div className="flex flex-col gap-4">
      <Panel title="الغلاف والخلفية">
        <div className="grid gap-3.5 sm:grid-cols-2">
          {slots.map((slot, index) => {
            const active = target === slot.key;
            return (
              <div
                key={slot.key}
                className={`flex flex-col gap-2.5 rounded-xl border p-3 transition-colors ${
                active ? "border-cyan-400/50 bg-cyan-500/[0.05]" : "border-white/[0.07]"}`
                }>

                <div
                  className={`relative overflow-hidden rounded-lg border border-white/[0.07] bg-[#0B111C] ${slot.aspect}`}>

                  {slot.value ?
                  <img
                    src={slot.value}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover" /> :


                  <span className="absolute inset-0 flex items-center justify-center text-slate-600">
                      <ImageIcon className="h-5 w-5" aria-hidden />
                    </span>
                  }

                  {slot.value &&
                  <button
                    type="button"
                    aria-label={`إزالة ${slot.label}`}
                    onClick={() =>
                    patch(slot.key === "cover" ? { coverImage: null } : { bgImage: null })
                    }
                    className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#04070f]/85 text-slate-300 transition-colors hover:border-rose-500/50 hover:text-rose-300">

                      <XIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  }
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold text-slate-200">
                      {slot.label}
                    </span>
                    <span className="block text-[10.5px] text-slate-500">{slot.hint}</span>
                  </span>

                  <Button
                    tone={active ? "primary" : "outline"}
                    className="shrink-0 px-3 py-2"
                    onClick={() => setTarget(slot.key)}>

                    {active ?
                    <>
                        <CheckIcon className="h-3.5 w-3.5" aria-hidden />
                        الفتحة النشطة
                      </> :

                    `اختر ${index + 1}`
                    }
                  </Button>
                </div>
              </div>);

          })}
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.06] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-cyan-200/90">
          <LayersIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          الخطوة الحالية: اختر صورة من المكتبة بالأسفل لتصبح «{activeSlot.label}».
          ضبط الموضع والإضاءة لكل سطح من لوح المظهر على اليسار.
        </p>
      </Panel>

      <Panel title="مكتبة صور هذه القصة">
        <MediaGrid
          storyId={storyId}
          items={media}
          onChange={onMediaChange}
          selectedUrl={target === "cover" ? draft.coverImage : draft.bgImage}
          defaultRole={target === "cover" ? "cover" : "background"}
          minRecommendedWidth={target === "cover" ? 900 : 1600}
          onSelect={(item) =>
          patch(target === "cover" ? { coverImage: item.url } : { bgImage: item.url })
          } />

      </Panel>
    </div>);

}

export default MediaTab;