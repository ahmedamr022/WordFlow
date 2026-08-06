;

import React, { useCallback, useState } from "react";

import { DEFAULT_SURFACE, imageStyle } from "@/lib/stories/appearance";
import type { SurfaceAppearance } from "@/types/admin";

/**
 * صورة داخل إطار بأبعاد ثابتة — الحل الجذري لمشكلة «صور Sherlock و Gatsby
 * بتبقى بايظة جوّه الكارت».
 *
 * السبب الحقيقي: كل الصور كانت `object-cover` بإطار عريض (16:9 تقريباً). أي
 * صورة **طولية** (portrait) أو مربّعة يُقتطع منها 40–60% فيظهر جزء عشوائي —
 * وجه مقطوع، أو سماء فاضية. `object-contain` وحده يحلّها لكن يترك أشرطة سوداء
 * قبيحة.
 *
 * الحل هنا (نفس أسلوب يوتيوب/نتفليكس):
 *   1. نقيس الأبعاد الطبيعية للصورة عند تحميلها (بلا أي طلب إضافي).
 *   2. نقارن نسبتها بنسبة الإطار. لو الفرق كبير (> 35%) نبدّل تلقائياً إلى
 *      `contain` **مع نسخة مكبّرة ضبابية من نفس الصورة كخلفية** فتمتلئ
 *      المساحة بلون الصورة نفسها بدل الأسود، وتظهر الصورة كاملة بلا قطع.
 *   3. الأدمن يستطيع دائماً تجاوز القرار من الاستوديو (fit / position / scale).
 */

const MISMATCH_THRESHOLD = 0.35;

export interface FramedImageProps {
  src: string;
  alt: string;
  /** إعدادات المظهر القادمة من الاستوديو. الافتراضي = cover في المنتصف. */
  surface?: SurfaceAppearance;
  className?: string;
  fallbackSrc?: string;
  /** يعطّل الاكتشاف التلقائي إن أراد الأدمن قطعاً صريحاً. */
  autoFit?: boolean;
  loading?: "lazy" | "eager";
}

export function FramedImage({
  src,
  alt,
  surface = DEFAULT_SURFACE,
  className = "",
  fallbackSrc = "/placeholder.svg",
  autoFit = true,
  loading = "lazy"
}: FramedImageProps) {
  const [source, setSource] = useState(src);
  const [needsContain, setNeedsContain] = useState(false);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (!autoFit || surface.fit === "contain") return;
      const img = event.currentTarget;
      const frame = img.parentElement;
      if (!frame || !img.naturalWidth || !img.naturalHeight) return;

      const frameRatio = frame.clientWidth / Math.max(1, frame.clientHeight);
      const imageRatio = img.naturalWidth / img.naturalHeight;
      const mismatch = Math.abs(imageRatio - frameRatio) / frameRatio;

      setNeedsContain(mismatch > MISMATCH_THRESHOLD);
    },
    [autoFit, surface.fit]
  );

  const handleError = useCallback(() => {
    if (source !== fallbackSrc) setSource(fallbackSrc);
  }, [fallbackSrc, source]);

  const effective: SurfaceAppearance =
  needsContain && surface.fit === "cover" ? { ...surface, fit: "contain" } : surface;

  return (
    <>
      {effective.fit === "contain" &&
      <img
        src={source}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        style={{ opacity: 0.55 }} />

      }

      <img
        src={source}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`absolute inset-0 h-full w-full ${className}`}
        style={imageStyle(effective)} />

    </>);

}

export default FramedImage;