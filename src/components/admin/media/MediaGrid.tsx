"use client";
import React from "react";
import {
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  TrashIcon,
  UploadCloudIcon } from
"lucide-react";

import { deleteStoryMediaAction } from "@/app/actions/admin/media";
import { useMediaUpload, type UploadRole } from "@/components/admin/media/useMediaUpload";
import type { AdminStoryMedia } from "@/types/admin";

/**
 * مكتبة صور القصة.
 *
 * تحسينات هذه الدفعة (كلها لأن اختيار الصورة كان أصعب مما يجب):
 *   · **سحب وإفلات** على كل المساحة + لصق من الحافظة (Ctrl+V) — أسرع طريق
 *     من سكرين‌شوت إلى غلاف.
 *   · **شريط تقدّم حقيقي** لكل ملف بدل «مؤشر دوران» غامض.
 *   · **الضغط على الصورة نفسها = استخدامها**. قبلها كان لازم إيجاد زر
 *     «استخدام» صغير؛ الآن الصورة كلها هدف قابل للضغط والمختارة تحمل علامة.
 *   · **أبعاد + حجم كل صورة** ظاهرة، وتحذير أحمر لو الصورة أصغر من 1200px
 *     على الخلفيات العريضة (تظهر مكسّرة).
 */

export interface MediaGridProps {
  storyId?: string | null;
  items: AdminStoryMedia[];
  onChange: (items: AdminStoryMedia[]) => void;
  selectedUrl?: string | null;
  defaultRole?: UploadRole;
  onSelect?: (item: AdminStoryMedia) => void;
  /** أقل عرض منصوح به — تحذير فقط، لا يمنع الاستخدام. */
  minRecommendedWidth?: number;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({
  storyId = null,
  items,
  onChange,
  selectedUrl = null,
  defaultRole = "scene",
  onSelect,
  minRecommendedWidth = 1200
}: MediaGridProps) {
  const { upload, uploading, progress, error, setError } = useMediaUpload(storyId);
  const [dragging, setDragging] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const zoneRef = React.useRef<HTMLDivElement | null>(null);

  const handleFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const uploaded = await upload(files, defaultRole);
      if (uploaded.length > 0) {
        onChange([...uploaded, ...items]);
        // أول صورة مرفوعة تُستخدم فوراً — هذا ما يتوقعه الأدمن دائماً.
        onSelect?.(uploaded[0]);
      }
    },
    [upload, defaultRole, items, onChange, onSelect]
  );

  // لصق من الحافظة داخل المنطقة.
  React.useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length === 0) return;
      event.preventDefault();
      void handleFiles(files);
    }
    const node = zoneRef.current;
    node?.addEventListener("paste", onPaste as EventListener);
    return () => node?.removeEventListener("paste", onPaste as EventListener);
  }, [handleFiles]);

  async function remove(item: AdminStoryMedia) {
    setDeletingId(item.id);
    const result = await deleteStoryMediaAction(item.id);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(items.filter((entry) => entry.id !== item.id));
  }

  return (
    <div
      ref={zoneRef}
      tabIndex={-1}
      className="flex flex-col gap-3 outline-none"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
      }}>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
        dragging ?
        "border-cyan-400/70 bg-cyan-500/[0.07]" :
        "border-white/10 bg-[#0B111C] hover:border-cyan-400/40"}`
        }>

        {uploading ?
        <Loader2Icon className="h-6 w-6 animate-spin text-cyan-300" aria-hidden /> :

        <UploadCloudIcon className="h-6 w-6 text-cyan-300" aria-hidden />
        }
        <span className="text-[13px] font-bold text-slate-200">
          اسحب الصور هنا، أو اضغط للاختيار، أو الصق (Ctrl+V)
        </span>
        <span className="text-[11px] text-slate-500">
          JPG · PNG · WebP · AVIF — تُضغط تلقائياً قبل الرفع
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void handleFiles(event.target.files);
          event.target.value = "";
        }} />


      {progress &&
      <div className="rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="truncate text-[11.5px] font-bold text-slate-300">
              {progress.fileName}
            </span>
            <span className="font-en text-[11.5px] font-bold text-cyan-300">
              {progress.percent}%
            </span>
          </div>
          <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
            <span
            className="block h-full rounded-full bg-cyan-400 transition-all"
            style={{ width: `${progress.percent}%` }} />

          </span>
        </div>
      }

      {error &&
      <p
        role="alert"
        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12px] font-bold text-rose-300">

          {error}
        </p>
      }

      {items.length === 0 ?
      <p className="rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-4 text-center text-[12px] text-slate-500">
          لا توجد صور لهذه القصة بعد.
        </p> :

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => {
          const active = selectedUrl === item.url;
          const tooSmall = (item.width ?? 0) > 0 && (item.width ?? 0) < minRecommendedWidth;

          return (
            <li key={item.id} className="group relative">
                <button
                type="button"
                onClick={() => onSelect?.(item)}
                aria-pressed={active}
                title="استخدام هذه الصورة"
                className={`block w-full overflow-hidden rounded-xl border text-right transition-all ${
                active ?
                "border-cyan-400/70 ring-2 ring-cyan-400/25" :
                "border-white/[0.07] hover:border-white/25"}`
                }>

                  <span className="relative block aspect-[16/10] bg-[#0B111C]">
                    <img
                    src={item.url}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="h-full w-full object-cover" />

                    {active &&
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[#04121a] shadow-lg">
                        <CheckIcon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                  }
                  </span>

                  <span className="flex items-center justify-between gap-2 px-2.5 py-2">
                    <span className="font-en text-[10.5px] font-bold text-slate-400">
                      {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                    </span>
                    <span className="font-en text-[10.5px] text-slate-500">
                      {formatBytes(item.bytes)}
                    </span>
                  </span>

                  {tooSmall &&
                <span className="block px-2.5 pb-2 text-[10px] font-bold leading-snug text-amber-400">
                      صغيرة للخلفيات العريضة
                    </span>
                }
                </button>

                <button
                type="button"
                onClick={() => void remove(item)}
                disabled={deletingId === item.id}
                aria-label="حذف الصورة"
                className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#04070f]/85 text-slate-300 opacity-70 transition-all hover:border-rose-500/50 hover:text-rose-300 focus-visible:opacity-100 group-hover:opacity-100">

                  {deletingId === item.id ?
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> :

                <TrashIcon className="h-3.5 w-3.5" aria-hidden />
                }
                </button>
              </li>);

        })}
        </ul>
      }

      <p className="flex items-center gap-2 text-[11px] text-slate-500">
        <ImageIcon className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden />
        اضغط على أي صورة لاستخدامها في الفتحة المحدّدة بالأعلى.
      </p>
    </div>);

}

export default MediaGrid;