;

import React from "react";

import {
  computeLayout,
  filterStyle,
  imageStyle,
  type Box,
  type ImageLayout } from
"@/lib/stories/appearance";
import type { SurfaceAppearance } from "@/types/admin";

/**
 * العارض الوحيد لصور القصص.
 *
 * لماذا مكوّن واحد بدل `<img style={imageStyle(...)}>` في كل مكان؟
 * لأن الضبط الصحيح يحتاج معرفة **أبعاد الصورة الحقيقية وأبعاد الإطار**:
 *   · بدونهما لا يمكن معرفة أي محور فيه فائض ⇒ ينتهي الأمر بمنزلق Y لا يفعل
 *     شيئاً (الشكوى الأصلية).
 *   · وبدونهما لا يمكن ملء الفراغ بخلفية ضبابية بدل شريط أسود.
 *
 * القياس يحدث عبر ResizeObserver + naturalWidth، ثم `computeLayout` يحسب
 * left/top/width/height بالبكسل. قبل القياس نستخدم `imageStyle` كتقريب فلا
 * يحدث وميض، وهذا يعني أيضاً أن رِندر السيرفر لا يظهر فارغاً.
 *
 * نفس المكوّن يُستخدم في الاستوديو وفي الداشبورد ⇒ المعاينة = النتيجة.
 */

export interface StoryImageProps {
  src: string;
  surface: SurfaceAppearance;
  alt?: string;
  /** كلاسات إضافية للإطار الخارجي (النِسَب تأتي من SURFACE_FRAMES). */
  className?: string;
  /** يُستدعى بعد كل قياس — الاستوديو يستخدمه لإظهار تنبيه «هذا المحور معطّل». */
  onLayout?: (layout: ImageLayout, natural: Box) => void;
  loading?: "eager" | "lazy";
}

export function StoryImage({
  src,
  surface,
  alt = "",
  className = "",
  onLayout,
  loading = "lazy"
}: StoryImageProps) {
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [container, setContainer] = React.useState<Box | null>(null);
  const [natural, setNatural] = React.useState<Box | null>(null);

  // ── قياس الإطار ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const read = () => {
      const rect = node.getBoundingClientRect();
      setContainer((current) =>
      current && Math.abs(current.width - rect.width) < 0.5 && Math.abs(current.height - rect.height) < 0.5 ?
      current :
      { width: rect.width, height: rect.height }
      );
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ── قياس الصورة (يشمل الصور المخزّنة في الكاش التي لا تُطلق onLoad) ───────
  const readNatural = React.useCallback(() => {
    const image = imgRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    setNatural({ width: image.naturalWidth, height: image.naturalHeight });
  }, []);

  React.useEffect(() => {
    setNatural(null);
    const image = imgRef.current;
    if (image?.complete) readNatural();
  }, [src, readNatural]);

  const layout = React.useMemo<ImageLayout | null>(() => {
    if (!container || !natural) return null;
    return computeLayout(surface, container, natural);
  }, [container, natural, surface]);

  React.useEffect(() => {
    if (layout && natural) onLayout?.(layout, natural);
  }, [layout, natural, onLayout]);

  const measuredStyle: React.CSSProperties | null = layout ?
  {
    position: "absolute",
    left: `${layout.left}px`,
    top: `${layout.top}px`,
    width: `${layout.width}px`,
    height: `${layout.height}px`,
    maxWidth: "none",
    objectFit: "fill",
    filter: filterStyle(surface)
  } :
  null;

  const showBackdrop = surface.blur && (layout ? layout.hasGap : surface.fit !== "cover");

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      {showBackdrop &&
      <img
        src={src}
        alt=""
        aria-hidden
        loading={loading}
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-55 blur-2xl"
        style={{ filter: `blur(28px) ${filterStyle(surface) ?? ""}`.trim() }} />
      }

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        aria-hidden={alt === "" ? true : undefined}
        loading={loading}
        onLoad={readNatural}
        className={measuredStyle ? "" : "absolute inset-0 h-full w-full"}
        style={measuredStyle ?? imageStyle(surface)} />

    </div>);

}

export default StoryImage;