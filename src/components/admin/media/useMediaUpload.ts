"use client";

import { useCallback, useState } from "react";

import type { AdminStoryMedia } from "@/types/admin";

/**
 * رفع الصور من المتصفح.
 *
 * ثلاثة تغييرات تحلّ مشكلة «الأدمن مش بيحفظ الصور»:
 *
 * ١) **لا Server Action.** الرفع يذهب إلى `/api/admin/media/upload`
 *    (Route Handler). Server Actions محدودة بـ 1MB للجسم، وهذا حرفياً هو
 *    الخطأ الذي كان يظهر: «Body exceeded 1 MB limit».
 *
 * ٢) **ضغط وتصغير على العميل.** أي صورة أكبر من ~1.6MB أو أعرض من 2400px
 *    تُعاد رسمها على canvas إلى WebP بجودة 0.86. النتيجة: صورة ٥ ميجا من
 *    كاميرا الهاتف تصبح ~٤٠٠ كيلو بلا فرق مرئي، فالرفع أسرع والداشبورد أخف.
 *
 * ٣) **تقدّم حقيقي + أخطاء واضحة.** كل ملف له نسبة تقدّم (XHR) ورسالة خطأ
 *    مفهومة بدل فشل صامت.
 */

export type UploadRole = "cover" | "background" | "scene" | "modal";

const COMPRESS_ABOVE_BYTES = 1.6 * 1024 * 1024;
const MAX_EDGE = 2400;
const QUALITY = 0.86;

export interface UploadProgress {
  fileName: string;
  percent: number;
}

async function measure(file: File | Blob): Promise<{width: number;height: number;}> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

/** يصغّر ويضغط الصورة داخل المتصفح. يرجّع الملف الأصلي لو لم يلزم شيء. */
async function compress(file: File): Promise<File> {
  const needsShrink = file.size > COMPRESS_ABOVE_BYTES;
  if (!needsShrink || file.type === "image/avif") return file;

  const { width, height } = await measure(file);
  if (!width || !height) return file;

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("decode-failed"));
      element.src = bitmapUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", QUALITY);
    });
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp"
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

function post(
formData: FormData,
onProgress: (percent: number) => void)
: Promise<{ok: true;data: AdminStoryMedia;} | {ok: false;error: string;}> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media/upload");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round(event.loaded / event.total * 100));
      }
    };
    request.onload = () => {
      try {
        const body = JSON.parse(request.responseText);
        if (body?.ok) resolve({ ok: true, data: body.data as AdminStoryMedia });else
        resolve({ ok: false, error: String(body?.error ?? "تعذر رفع الصورة") });
      } catch {
        resolve({ ok: false, error: "رد غير مفهوم من السيرفر" });
      }
    };
    request.onerror = () => resolve({ ok: false, error: "انقطع الاتصال أثناء الرفع" });
    request.send(formData);
  });
}

export function useMediaUpload(storyId: string | null) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (files: FileList | File[], role: UploadRole = "scene"): Promise<AdminStoryMedia[]> => {
      setError(null);
      setUploading(true);
      const uploaded: AdminStoryMedia[] = [];

      try {
        for (const original of Array.from(files)) {
          if (!original.type.startsWith("image/")) {
            setError(`"${original.name}" ليس صورة`);
            break;
          }

          setProgress({ fileName: original.name, percent: 0 });
          const file = await compress(original);
          const { width, height } = await measure(file);

          const formData = new FormData();
          formData.set("file", file);
          formData.set("role", role);
          if (storyId) formData.set("storyId", storyId);
          if (width) formData.set("width", String(width));
          if (height) formData.set("height", String(height));

          const result = await post(formData, (percent) =>
          setProgress({ fileName: original.name, percent })
          );

          if (!result.ok) {
            setError(result.error);
            break;
          }
          uploaded.push(result.data);
        }
      } finally {
        setUploading(false);
        setProgress(null);
      }

      return uploaded;
    },
    [storyId]
  );

  return { upload, uploading, progress, error, setError };
}