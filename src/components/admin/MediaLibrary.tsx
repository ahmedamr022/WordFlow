"use client";

import React, { useRef, useState, useTransition } from "react";
import {
  CopyIcon,
  FileImageIcon,
  LayoutGridIcon,
  ListIcon,
  TrashIcon,
  UploadIcon } from
"lucide-react";

import {
  deleteStoryMediaAction,
  uploadStoryMediaAction } from
"@/app/actions/admin/media";
import { Button } from "@/components/admin/ui/controls";
import { ConfirmDialog, EmptyState, Spinner } from "@/components/admin/ui/surfaces";
import { DataToolbar } from "@/components/admin/ui/DataToolbar";
import type { AdminMediaItem } from "@/types/admin";

/**
 * مكتبة الوسائط.
 *
 * الأبعاد تُقاس في المتصفح قبل الرفع وتُرسل مع الملف: السيرفر لا يملك محلل
 * صور، وبدون العرض/الارتفاع لا يستطيع الاستوديو أن يعرف هل الصورة أفقية أم
 * رأسية — وهي المعلومة التي تمنع «الصور البايظة» في المودال.
 */

const ROLE_LABELS: Record<string, string> = {
  cover: "غلاف",
  background: "خلفية",
  scene: "مشهد",
  modal: "مودال"
};

const ROLE_STYLES: Record<string, string> = {
  cover: "border-violet-500/35 bg-violet-500/15 text-violet-200",
  background: "border-cyan-500/35 bg-cyan-500/15 text-cyan-200",
  scene: "border-emerald-500/35 bg-emerald-500/15 text-emerald-200",
  modal: "border-amber-500/35 bg-amber-500/15 text-amber-200"
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(iso));
}

async function measure(file: File): Promise<{width: number | null;height: number | null;}> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: null, height: null });
    };
    image.src = url;
  });
}

export function MediaLibrary({
  items,
  filters




}: {items: AdminMediaItem[];filters: {search: string;role: string;};}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [uploadRole, setUploadRole] = useState<"cover" | "background" | "scene" | "modal">("scene");
  const [toDelete, setToDelete] = useState<AdminMediaItem | null>(null);
  const [message, setMessage] = useState<{tone: "ok" | "error";text: string;} | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();

  const upload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setMessage(null);

    startTransition(async () => {
      for (const file of Array.from(files).slice(0, 8)) {
        const size = await measure(file);
        const payload = new FormData();
        payload.set("file", file);
        payload.set("role", uploadRole);
        if (size.width) payload.set("width", String(size.width));
        if (size.height) payload.set("height", String(size.height));

        const result = await uploadStoryMediaAction(payload);
        if (!result.ok) {
          setMessage({ tone: "error", text: `${file.name}: ${result.error}` });
          return;
        }
      }
      setMessage({ tone: "ok", text: "تم رفع الملفات بنجاح" });
    });
  };

  const remove = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const result = await deleteStoryMediaAction(toDelete.id);
      setMessage(
        result.ok ?
        { tone: "ok", text: "تم حذف الملف" } :
        { tone: "error", text: result.error }
      );
      setToDelete(null);
    });
  };

  return (
    <section className="rounded-[18px] border border-white/[0.06] bg-[#090F18]/85">
      <div className="flex flex-wrap items-center gap-2.5 px-4 pt-4">
        <Button tone="primary" onClick={() => inputRef.current?.click()} disabled={pending}>
          {pending ? <Spinner label="جارٍ الرفع" /> :
          <>
              <UploadIcon className="h-4 w-4" aria-hidden />
              رفع وسائط
            </>
          }
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          aria-label="اختيار ملفات للرفع"
          onChange={(event) => {
            upload(event.target.files);
            event.target.value = "";
          }} />


        <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B111C] p-1">
          {(["cover", "background", "scene", "modal"] as const).map((role) =>
          <button
            key={role}
            type="button"
            aria-pressed={uploadRole === role}
            onClick={() => setUploadRole(role)}
            className={`rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
            uploadRole === role ?
            "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/35" :
            "text-slate-400 hover:text-white"}`
            }>

              {ROLE_LABELS[role]}
            </button>
          )}
        </div>

        <div className="mr-auto inline-flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B111C] p-1">
          <button
            type="button"
            aria-label="عرض شبكي"
            aria-pressed={layout === "grid"}
            onClick={() => setLayout("grid")}
            className={`rounded-lg p-2 transition-colors ${
            layout === "grid" ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"}`
            }>

            <LayoutGridIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="عرض قائمة"
            aria-pressed={layout === "list"}
            onClick={() => setLayout("list")}
            className={`rounded-lg p-2 transition-colors ${
            layout === "list" ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"}`
            }>

            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DataToolbar
        searchValue={filters.search}
        searchPlaceholder="ابحث في أسماء الملفات..."
        filters={[
        {
          name: "role",
          value: filters.role || "all",
          ariaLabel: "تصفية حسب الاستخدام",
          options: [
          { value: "all", label: "كل الاستخدامات" },
          { value: "cover", label: "أغلفة" },
          { value: "background", label: "خلفيات" },
          { value: "scene", label: "مشاهد" },
          { value: "modal", label: "مودال" }]

        }]
        } />


      {message &&
      <p
        role="status"
        className={`mx-4 mt-3 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-bold ${
        message.tone === "ok" ?
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
        "border-rose-500/30 bg-rose-500/10 text-rose-200"}`
        }>

          {message.text}
        </p>
      }

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          upload(event.dataTransfer.files);
        }}
        className={`m-4 rounded-[16px] border-2 border-dashed p-1 transition-colors ${
        dragging ? "border-cyan-400/60 bg-cyan-500/[0.06]" : "border-transparent"}`
        }>

        {items.length === 0 ?
        <EmptyState
          title="المكتبة فارغة"
          description="اسحب الصور هنا أو اضغط «رفع وسائط». الصيغ المدعومة: JPG و PNG و WebP و AVIF حتى 6 ميجابايت." /> :

        layout === "grid" ?
        <ul className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) =>
          <li
            key={item.id}
            className="group overflow-hidden rounded-[16px] border border-white/[0.07] bg-[#0B111C]">

                <div className="relative aspect-[16/10] overflow-hidden bg-[#060A12]">
                  <img
                src={item.url}
                alt={item.fileName}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />


                  <span
                className={`absolute right-2.5 top-2.5 rounded-lg border px-2 py-0.5 text-[10.5px] font-bold ${
                ROLE_STYLES[item.role]}`
                }>

                    {ROLE_LABELS[item.role]}
                  </span>

                  <div className="absolute left-2.5 top-2.5 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                  type="button"
                  aria-label={`نسخ رابط ${item.fileName}`}
                  onClick={() => navigator.clipboard?.writeText(item.url)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-[#060A12]/85 text-slate-200 hover:text-white">

                      <CopyIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                  type="button"
                  aria-label={`حذف ${item.fileName}`}
                  onClick={() => setToDelete(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-400/30 bg-[#060A12]/85 text-rose-300 hover:text-rose-200">

                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-3.5">
                  <p className="font-en truncate text-[12.5px] font-bold text-white">
                    {item.fileName}
                  </p>
                  <p className="font-en text-[11px] text-slate-500">
                    {item.width && item.height ? `${item.width} × ${item.height}` : "—"} ·{" "}
                    {formatBytes(item.bytes)}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {item.storyTitle ? `تُستخدم في: ${item.storyTitle}` : "غير مرتبطة بقصة"}
                  </p>
                  <p className="font-en text-[10.5px] text-slate-600">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </li>
          )}
          </ul> :

        <ul className="divide-y divide-white/[0.04]">
            {items.map((item) =>
          <li key={item.id} className="flex items-center gap-3.5 px-3 py-2.5">
                <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#060A12]">
                  <img
                src={item.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                aria-hidden />

                </span>

                <span className="min-w-0 flex-1">
                  <span className="font-en block truncate text-[12.5px] font-bold text-white">
                    {item.fileName}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {item.storyTitle ?? "غير مرتبطة بقصة"}
                  </span>
                </span>

                <span
              className={`hidden rounded-lg border px-2 py-0.5 text-[10.5px] font-bold sm:block ${
              ROLE_STYLES[item.role]}`
              }>

                  {ROLE_LABELS[item.role]}
                </span>

                <span className="font-en hidden w-20 text-left text-[11px] text-slate-500 md:block">
                  {formatBytes(item.bytes)}
                </span>

                <button
              type="button"
              aria-label={`حذف ${item.fileName}`}
              onClick={() => setToDelete(item)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-rose-300 transition-colors hover:bg-rose-500/10">

                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </li>
          )}
          </ul>
        }
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        pending={pending}
        confirmLabel="حذف الملف"
        title={`حذف «${toDelete?.fileName ?? ""}»؟`}
        consequences={[
        "الملف من التخزين",
        "ظهوره في مكتبة الوسائط",
        toDelete?.storyTitle ?
        `الصورة داخل قصة «${toDelete.storyTitle}» (ستعود للغلاف الافتراضي)` :
        "أي ارتباط بقصة"]
        } />


      <p className="flex items-center gap-2 px-5 pb-4 text-[11.5px] text-slate-600">
        <FileImageIcon className="h-3.5 w-3.5" aria-hidden />
        استخدم أسماء ملفات وصفية — هي ما ستراه في الاستوديو لاحقاً.
      </p>
    </section>);

}