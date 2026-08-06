"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { createStoryAction } from "@/app/actions/admin/stories";
import { Button, Field, Select, TextInput } from "@/components/admin/ui/controls";
import { Modal, Spinner } from "@/components/admin/ui/surfaces";
import { slugify } from "@/lib/admin/draft";
import type { AdminCategory } from "@/types/admin";

/**
 * إنشاء قصة جديدة.
 *
 * نطلب الحد الأدنى فقط (عنوان + تصنيف + مستوى) ثم نفتح الاستوديو مباشرة.
 * القصة تُنشأ كـ **مسودة** فلا خطر من إنشاء ناقص.
 *
 * ── لماذا أُضيف `NewStoryLink` ───────────────────────────────────────────────
 * كان هذا المكوّن مرندَراً **ثلاث مرّات** (رأس لوحة التحكم + «إجراءات سريعة» +
 * رأس صفحة القصص)، أي ثلاثة مودالات وثلاث حالات مستقلة لنفس المهمة — وهو ما
 * جعل الأدمن يقول «بلاقي إنشاء قصة في أكتر من مكان وده بيشتتني».
 *
 * القاعدة الآن: **مدخل إنشاء واحد** يعيش في صفحة القصص (`/admin/stories`).
 * أي مكان آخر يستخدم `NewStoryLink` — زر يوجّه إلى ذلك المكان الواحد بدل أن
 * يفتح نموذجاً ثانياً.
 */

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function NewStoryButton({
  categories,
  label = "قصة جديدة"
}: {categories: AdminCategory[];label?: string;}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createStoryAction({
        titleEn: titleEn.trim(),
        titleAr: titleAr.trim(),
        categoryId: categoryId || null,
        cefrLevel
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.push(`/admin/stories/${result.data.slug}`);
    });
  }

  return (
    <>
      <Button tone="primary" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="إنشاء قصة جديدة">
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <Field label="العنوان (إنجليزي)" hint={titleEn ? `المعرّف: ${slugify(titleEn)}` : undefined}>
            <TextInput
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              placeholder="The Legend of Titanic"
              dir="ltr"
              required
              minLength={2} />

          </Field>

          <Field label="العنوان (عربي)">
            <TextInput
              value={titleAr}
              onChange={(event) => setTitleAr(event.target.value)}
              placeholder="أسطورة السفينة تايتانيك" />

          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="التصنيف">
              <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">بدون تصنيف</option>
                {categories.map((category) =>
                <option key={category.id} value={category.id}>
                    {category.nameAr}
                  </option>
                )}
              </Select>
            </Field>

            <Field label="المستوى">
              <Select value={cefrLevel} onChange={(event) => setCefrLevel(event.target.value)}>
                {LEVELS.map((level) =>
                <option key={level} value={level}>
                    {level}
                  </option>
                )}
              </Select>
            </Field>
          </div>

          {error &&
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] font-bold text-rose-300">
              {error}
            </p>
          }

          <p className="text-[11.5px] leading-relaxed text-slate-500">
            ستُنشأ كمسودة غير منشورة، وتنتقل مباشرة إلى الاستوديو لإضافة الجُمل
            والصور وضبط المظهر. لن تظهر للمستخدمين حتى تضغط «نشر التغييرات».
          </p>

          <div className="mt-1 flex items-center justify-end gap-2.5">
            <Button tone="ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>
              إلغاء
            </Button>
            <Button tone="primary" type="submit" disabled={pending || titleEn.trim().length < 2}>
              {pending ? <Spinner /> : "إنشاء وفتح الاستوديو"}
            </Button>
          </div>
        </form>
      </Modal>
    </>);

}

/**
 * زر يوجّه إلى مدخل الإنشاء الواحد بدل فتح نموذج ثانٍ.
 * استخدمه في أي شاشة غير `/admin/stories`.
 */
export function NewStoryLink({ label = "قصة جديدة" }: {label?: string;}) {
  return (
    <Link
      href="/admin/stories"
      className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#0B111C] px-3.5 py-2.5 text-[12.5px] font-bold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white">

      <PlusIcon className="h-4 w-4" aria-hidden />
      {label}
    </Link>);

}

export default NewStoryButton;