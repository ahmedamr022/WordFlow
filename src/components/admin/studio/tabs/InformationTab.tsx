"use client";

import React from "react";

import { Field, RadioRow, Select, TextArea, TextInput } from "@/components/admin/ui/controls";
import { Panel } from "@/components/admin/ui/surfaces";
import { slugify } from "@/lib/admin/draft";
import type { StoryDraft } from "@/lib/admin/draft";
import type { AdminCategory, StoryStatus } from "@/types/admin";

/** معلومات القصة الأساسية + الحالة + معرّف الرابط. */

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DIFFICULTIES = [
{ value: "beginner", label: "مبتدئ" },
{ value: "intermediate", label: "متوسط" },
{ value: "advanced", label: "متقدّم" }];


export interface TabProps {
  draft: StoryDraft;
  patch: (changes: Partial<StoryDraft>) => void;
  categories: AdminCategory[];
}

export function InformationTab({ draft, patch, categories }: TabProps) {
  return (
    <div className="flex flex-col gap-4">
      <Panel title="معلومات القصة">
        <div className="flex flex-col gap-3.5">
          <Field label="العنوان (إنجليزي)">
            <TextInput
              dir="ltr"
              value={draft.titleEn}
              onChange={(event) => patch({ titleEn: event.target.value })}
              placeholder="The Legend of Titanic" />

          </Field>

          <Field label="العنوان (عربي)">
            <TextInput
              value={draft.titleAr}
              onChange={(event) => patch({ titleAr: event.target.value })}
              placeholder="أسطورة السفينة تايتانيك" />

          </Field>

          <Field label="الوصف (إنجليزي)">
            <TextArea
              dir="ltr"
              value={draft.descriptionEn}
              onChange={(event) => patch({ descriptionEn: event.target.value })}
              placeholder="Learn about the legendary Titanic..." />

          </Field>

          <Field label="الوصف (عربي)">
            <TextArea
              value={draft.descriptionAr}
              onChange={(event) => patch({ descriptionAr: event.target.value })}
              placeholder="تعرف على قصة السفينة الأسطورية..." />

          </Field>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="التصنيف">
              <Select
                value={draft.categoryId ?? ""}
                onChange={(event) => patch({ categoryId: event.target.value || null })}>

                <option value="">بدون تصنيف</option>
                {categories.map((category) =>
                <option key={category.id} value={category.id}>
                    {category.nameAr}
                  </option>
                )}
              </Select>
            </Field>

            <Field label="المستوى">
              <Select
                value={draft.cefrLevel}
                onChange={(event) => patch({ cefrLevel: event.target.value })}>

                {LEVELS.map((level) =>
                <option key={level} value={level}>
                    {level}
                  </option>
                )}
              </Select>
            </Field>

            <Field label="المدة (دقائق)">
              <TextInput
                type="number"
                min={1}
                max={240}
                value={draft.estimatedMinutes}
                onChange={(event) =>
                patch({ estimatedMinutes: Math.max(1, Number(event.target.value) || 1) })
                } />

            </Field>

            <Field label="الصعوبة">
              <Select
                value={draft.difficulty}
                onChange={(event) => patch({ difficulty: event.target.value })}>

                {DIFFICULTIES.map((option) =>
                <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </Select>
            </Field>

            <Field label="نقاط الخبرة (XP)">
              <TextInput
                type="number"
                min={0}
                max={2000}
                value={draft.xpReward}
                onChange={(event) => patch({ xpReward: Math.max(0, Number(event.target.value) || 0) })} />

            </Field>

            <Field
              label="معرّف الرابط (Slug)"
              hint={`/story/${draft.seo.slug || slugify(draft.titleEn)}`}>

              <TextInput
                dir="ltr"
                value={draft.seo.slug}
                onChange={(event) =>
                patch({ seo: { ...draft.seo, slug: slugify(event.target.value) } })
                } />

            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="حالة النشر">
        <RadioRow
          name="story-status"
          value={draft.status}
          onChange={(status: StoryStatus) =>
          patch({
            status,
            access: { ...draft.access, locked: status === "locked" }
          })
          }
          options={[
          { value: "published", label: "منشورة — متاحة لكل المستخدمين" },
          { value: "draft", label: "مسودة — مخفية تماماً حتى تكتمل" },
          { value: "locked", label: "مقفلة — تظهر لكن لا يمكن قراءتها" }]
          } />


        <p className="mt-3 rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-slate-500">
          الحالة تُطبَّق عند النشر فقط. أي تعديل تكتبه الآن يُحفَظ كمسودة ولا يراه
          المستخدمون قبل أن تضغط «نشر التغييرات».
        </p>
      </Panel>

      <Panel title="تحسين محركات البحث (SEO)">
        <div className="flex flex-col gap-3.5">
          <Field label="عنوان الصفحة" hint="يظهر في تاب المتصفح ونتائج البحث">
            <TextInput
              dir="ltr"
              value={draft.seo.metaTitle}
              onChange={(event) => patch({ seo: { ...draft.seo, metaTitle: event.target.value } })}
              placeholder={draft.titleEn} />

          </Field>

          <Field label="وصف الصفحة" hint="من 120 إلى 160 حرفاً هو الأفضل">
            <TextArea
              value={draft.seo.metaDescription}
              onChange={(event) =>
              patch({ seo: { ...draft.seo, metaDescription: event.target.value } })
              }
              placeholder={draft.descriptionAr} />

          </Field>
          <p className="text-[11px] text-slate-500">
            الطول الحالي:{" "}
            <span className="font-en font-bold text-slate-300">
              {draft.seo.metaDescription.length}
            </span>{" "}
            حرف
          </p>
        </div>
      </Panel>
    </div>);

}

export default InformationTab;