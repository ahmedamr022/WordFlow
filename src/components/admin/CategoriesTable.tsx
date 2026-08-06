"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  BookOpenIcon,
  CompassIcon,
  FlaskConicalIcon,
  HeartIcon,
  LandmarkIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SmileIcon,
  SparklesIcon,
  TrashIcon,
  TrendingUpIcon } from
"lucide-react";

import {
  deleteCategoryAction,
  saveCategoryAction } from
"@/app/actions/admin/categories";
import { Button, Field, Select, TextArea, TextInput, Toggle } from "@/components/admin/ui/controls";
import { ConfirmDialog, EmptyState, Modal, Spinner } from "@/components/admin/ui/surfaces";
import type { AdminCategory } from "@/types/admin";

/**
 * جدول التصنيفات.
 *
 * التصنيفات قليلة (عشرات لا آلاف) فالبحث والفرز يحدثان في المتصفح — ذهاب
 * للسيرفر لكل حرف هنا تعقيد بلا مقابل. الكتابة وحدها تمر بالسيرفر.
 */

const ICONS: Record<string, React.ComponentType<{className?: string;}>> = {
  BookOpen: BookOpenIcon,
  Landmark: LandmarkIcon,
  Compass: CompassIcon,
  Heart: HeartIcon,
  FlaskConical: FlaskConicalIcon,
  TrendingUp: TrendingUpIcon,
  Smile: SmileIcon,
  Sparkles: SparklesIcon
};

const ICON_OPTIONS = Object.keys(ICONS);

const COLOR_OPTIONS = [
"#22d3ee",
"#a855f7",
"#f43f5e",
"#34d399",
"#f59e0b",
"#60a5fa",
"#f472b6",
"#facc15"];


interface FormState {
  id: string | null;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

function emptyForm(sortOrder: number): FormState {
  return {
    id: null,
    slug: "",
    nameEn: "",
    nameAr: "",
    descriptionAr: "",
    icon: "BookOpen",
    color: "#22d3ee",
    isActive: true,
    sortOrder
  };
}

function fromCategory(category: AdminCategory): FormState {
  return {
    id: category.id,
    slug: category.slug,
    nameEn: category.nameEn,
    nameAr: category.nameAr,
    descriptionAr: category.descriptionAr,
    icon: category.icon,
    color: category.color,
    isActive: category.isActive,
    sortOrder: category.sortOrder
  };
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(iso));
}

export function CategoriesTable({ categories }: {categories: AdminCategory[];}) {
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "hidden">("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return categories.filter((category) => {
      if (status === "active" && !category.isActive) return false;
      if (status === "hidden" && category.isActive) return false;
      if (!needle) return true;
      return (
        category.nameAr.toLowerCase().includes(needle) ||
        category.nameEn.toLowerCase().includes(needle) ||
        category.slug.includes(needle));

    });
  }, [categories, term, status]);

  const submit = () => {
    if (!form) return;
    setError("");
    startTransition(async () => {
      const result = await saveCategoryAction(form.id, {
        slug: form.slug,
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        descriptionAr: form.descriptionAr,
        icon: form.icon,
        color: form.color,
        isActive: form.isActive,
        sortOrder: form.sortOrder
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(null);
    });
  };

  const remove = () => {
    if (!toDelete) return;
    setError("");
    startTransition(async () => {
      const result = await deleteCategoryAction(toDelete.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setToDelete(null);
    });
  };

  return (
    <section className="rounded-[18px] border border-white/[0.06] bg-[#090F18]/85">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-4">
        <div>
          <h2 className="text-[15px] font-black text-slate-100">جميع الفئات</h2>
          <p className="font-en mt-0.5 text-[11.5px] text-slate-500">{categories.length} فئة</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-[130px]">
            <Select
              aria-label="حالة الفئة"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}>

              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="hidden">مخفية</option>
            </Select>
          </div>

          <div className="relative w-[210px]">
            <SearchIcon
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden />

            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="بحث في الفئات..."
              aria-label="بحث في الفئات"
              className="w-full rounded-xl border border-white/[0.07] bg-[#0B111C] py-2.5 pr-9 pl-3 text-[13px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15" />

          </div>

          <Button
            tone="primary"
            onClick={() => setForm(emptyForm(categories.length))}>

            <PlusIcon className="h-4 w-4" aria-hidden />
            إضافة فئة جديدة
          </Button>
        </div>
      </header>

      {error && !form &&
      <p
        role="alert"
        className="mx-5 mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-200">

          {error}
        </p>
      }

      {rows.length === 0 ?
      <EmptyState
        title="لا توجد فئات مطابقة"
        description="غيّر كلمة البحث أو أضف فئة جديدة لتنظيم القصص."
        action={
        <Button tone="outline" onClick={() => setForm(emptyForm(categories.length))}>
              إضافة فئة جديدة
            </Button>
        } /> :


      <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right">
            <thead>
              <tr className="border-b border-white/[0.05] text-[11.5px] font-bold text-slate-500">
                <th scope="col" className="px-5 py-3">الفئة</th>
                <th scope="col" className="px-5 py-3">الوصف</th>
                <th scope="col" className="px-5 py-3">القصص</th>
                <th scope="col" className="px-5 py-3">الحالة</th>
                <th scope="col" className="px-5 py-3">تاريخ الإنشاء</th>
                <th scope="col" className="px-5 py-3 text-left">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((category) => {
              const Icon = ICONS[category.icon] ?? BookOpenIcon;
              return (
                <tr key={category.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: `${category.color}44`,
                          background: `${category.color}18`,
                          color: category.color
                        }}>

                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-en text-[13.5px] font-bold text-white">
                            {category.nameEn}
                          </span>
                          <span className="text-[11.5px] text-slate-500">{category.nameAr}</span>
                        </span>
                      </div>
                    </td>

                    <td className="max-w-[260px] px-5 py-3.5 text-[12px] leading-relaxed text-slate-400">
                      {category.descriptionAr || "—"}
                    </td>

                    <td className="font-en px-5 py-3.5 text-[13px] font-bold text-slate-200">
                      {category.storiesCount}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${
                      category.isActive ? "text-emerald-300" : "text-amber-300"}`
                      }>

                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                        {category.isActive ? "نشطة" : "مخفية"}
                      </span>
                    </td>

                    <td className="font-en px-5 py-3.5 text-[12px] text-slate-500">
                      {formatDate(category.createdAt)}
                    </td>

                    <td className="px-5 py-3.5 text-left">
                      <div className="relative inline-block">
                        <button
                        type="button"
                        aria-label={`إجراءات ${category.nameAr}`}
                        aria-expanded={menuFor === category.id}
                        onClick={() =>
                        setMenuFor(menuFor === category.id ? null : category.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition-colors hover:text-white">

                          <MoreVerticalIcon className="h-4 w-4" />
                        </button>

                        {menuFor === category.id &&
                      <div className="absolute left-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B111C] py-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                            <button
                          type="button"
                          onClick={() => {
                            setForm(fromCategory(category));
                            setMenuFor(null);
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-right text-[12.5px] font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white">

                              <PencilIcon className="h-3.5 w-3.5" aria-hidden />
                              تعديل الفئة
                            </button>
                            <button
                          type="button"
                          onClick={() => {
                            setToDelete(category);
                            setMenuFor(null);
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-right text-[12.5px] font-bold text-rose-300 hover:bg-rose-500/10">

                              <TrashIcon className="h-3.5 w-3.5" aria-hidden />
                              حذف الفئة
                            </button>
                          </div>
                      }
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? "تعديل الفئة" : "إضافة فئة جديدة"}
        width="max-w-xl">

        {form &&
        <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="الاسم بالعربية">
                <TextInput
                value={form.nameAr}
                onChange={(event) => setForm({ ...form, nameAr: event.target.value })}
                placeholder="التاريخ" />

              </Field>

              <Field label="الاسم بالإنجليزية">
                <TextInput
                value={form.nameEn}
                onChange={(event) =>
                setForm({
                  ...form,
                  nameEn: event.target.value,
                  slug:
                  form.id === null && form.slug === "" ?
                  event.target.value.
                  toLowerCase().
                  trim().
                  replace(/[^a-z0-9]+/g, "-").
                  replace(/^-|-$/g, "") :
                  form.slug
                })
                }
                placeholder="History" />

              </Field>
            </div>

            <Field label="المعرّف (slug)" hint="حروف إنجليزية صغيرة وأرقام وشرطات فقط.">
              <TextInput
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="history"
              dir="ltr" />

            </Field>

            <Field label="الوصف">
              <TextArea
              value={form.descriptionAr}
              onChange={(event) => setForm({ ...form, descriptionAr: event.target.value })}
              placeholder="قصص تاريخية واقعية من مختلف العصور والحضارات" />

            </Field>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="الأيقونة">
                <Select
                value={form.icon}
                onChange={(event) => setForm({ ...form, icon: event.target.value })}>

                  {ICON_OPTIONS.map((icon) =>
                <option key={icon} value={icon}>
                      {icon}
                    </option>
                )}
                </Select>
              </Field>

              <Field label="الترتيب">
                <TextInput
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) =>
                setForm({ ...form, sortOrder: Number(event.target.value || 0) })
                } />

              </Field>
            </div>

            <Field label="اللون">
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) =>
              <button
                key={color}
                type="button"
                aria-label={`اللون ${color}`}
                aria-pressed={form.color === color}
                onClick={() => setForm({ ...form, color })}
                className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-105 ${
                form.color === color ? "border-white" : "border-transparent"}`
                }
                style={{ background: color }} />

              )}
              </div>
            </Field>

            <Toggle
            label="فئة نشطة"
            description="الفئات المخفية لا تظهر للمستخدمين لكن قصصها تبقى كما هي."
            checked={form.isActive}
            onChange={(isActive) => setForm({ ...form, isActive })} />


            {error &&
          <p role="alert" className="text-[12.5px] font-bold text-rose-300">
                {error}
              </p>
          }

            <div className="mt-1 flex items-center justify-end gap-2.5">
              <Button tone="ghost" onClick={() => setForm(null)} disabled={pending}>
                إلغاء
              </Button>
              <Button tone="primary" onClick={submit} disabled={pending}>
                {pending ? <Spinner label="جارٍ الحفظ" /> : "حفظ الفئة"}
              </Button>
            </div>
          </div>
        }
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        pending={pending}
        confirmLabel="حذف الفئة"
        title={`حذف «${toDelete?.nameAr ?? ""}»؟`}
        consequences={[
        "الفئة من قائمة التصنيفات",
        "ارتباط أي قصة بها (لن تُحذف القصص)",
        "ظهورها في فلاتر صفحة القصص"]
        } />

    </section>);

}