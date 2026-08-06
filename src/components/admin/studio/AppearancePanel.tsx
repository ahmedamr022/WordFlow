"use client";

import React from "react";
import {
  CreditCardIcon,
  CrosshairIcon,
  ImageIcon,
  LayoutPanelTopIcon,
  MonitorIcon,
  RotateCcwIcon,
  ShuffleIcon,
  TriangleAlertIcon } from
"lucide-react";

import { Button, CollapsibleSection, Segmented, Slider, Toggle } from "@/components/admin/ui/controls";
import { StoryImage } from "@/components/common/StoryImage";
import {
  DEFAULT_SURFACE,
  FIT_HINTS,
  FIT_LABELS,
  SURFACE_FRAMES,
  axisLockHint,
  defaultAppearance,
  surfaceImage,
  type Box,
  type ImageLayout } from
"@/lib/stories/appearance";
import { SURFACE_KEYS, SURFACE_LABELS } from "@/types/admin";
import type { StoryDraft } from "@/lib/admin/draft";
import type {
  AdminStoryMedia,
  SurfaceAppearance,
  SurfaceFit,
  SurfaceKey } from
"@/types/admin";

/**
 * لوح ضبط المظهر.
 *
 * ما تغيّر (كل بند هنا ردّ على شكوى محدّدة)
 * ─────────────────────────────────────────
 * ١) **مجموعة لكل سطح، مطويّة** بدل قائمة واحدة طويلة: صورة الغلاف أولاً، ثم
 *    «إعدادات صفحة القصة / المودال / قصة اليوم / الكارت» — نفس ترتيب التصميم
 *    المرجعي. المجموعة المفتوحة هي التي تُعرض في المعاينة تلقائياً.
 * ٢) **لوح تركيز بالسحب** (لا ضغطة واحدة فقط): اسحب لتحرّك الصورة مباشرة،
 *    والإطار المعروض له **نفس نسبة السطح الحقيقي**، فما تراه هو النتيجة.
 * ٣) **تنبيه صريح عند تعطّل محور**: لو الإطار عريض والصورة `cover` فالمحور
 *    الرأسي بلا فائض ⇒ Y لا يفعل شيئاً. اللوح يوضّح ذلك ويقترح «ملء العرض».
 *    هذا هو سبب شكوى «جزء تغيير الـ Y مش بيتغير».
 * ٤) **إرجاع لكل قيمة** (زر صغير يظهر عند الاختلاف) + إرجاع السطح كله +
 *    نسخ إلى بقية الأسطح.
 */

export interface AppearancePanelProps {
  draft: StoryDraft;
  surfaceKey: SurfaceKey;
  onSurfaceKeyChange: (key: SurfaceKey) => void;
  onPatchSurface: (key: SurfaceKey, changes: Partial<SurfaceAppearance>) => void;
  media: AdminStoryMedia[];
  onPickCover: () => void;
}

const SURFACE_ICONS: Record<SurfaceKey, React.ReactNode> = {
  storyPage: <MonitorIcon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />,
  modal: <LayoutPanelTopIcon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />,
  storyToday: <ShuffleIcon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />,
  card: <CreditCardIcon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
};

const FIT_OPTIONS: {value: SurfaceFit;label: string;}[] = [
{ value: "cover", label: FIT_LABELS.cover },
{ value: "width", label: FIT_LABELS.width },
{ value: "height", label: FIT_LABELS.height },
{ value: "contain", label: FIT_LABELS.contain }];


/** لوح التركيز: اسحب النقطة أو اضغط في أي مكان. */
function FocalPad({
  src,
  surface,
  frameKey,
  onChange,
  onLayout






}: {src: string;surface: SurfaceAppearance;frameKey: SurfaceKey;onChange: (x: number, y: number) => void;onLayout: (layout: ImageLayout, natural: Box) => void;}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const apply = React.useCallback(
    (clientX: number, clientY: number) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = Math.round((clientX - rect.left) / rect.width * 100);
      const y = Math.round((clientY - rect.top) / rect.height * 100);
      onChange(Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y)));
    },
    [onChange]
  );

  return (
    <div
      ref={ref}
      role="application"
      aria-label="اسحب لتحديد نقطة التركيز"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        apply(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (dragging) apply(event.clientX, event.clientY);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      className={`relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl border bg-[#0B111C] ${
      SURFACE_FRAMES[frameKey].aspectClass} ${
      dragging ? "border-cyan-400/70" : "border-white/[0.08]"}`}>


      <StoryImage
        src={src}
        surface={surface}
        className="absolute inset-0 h-full w-full"
        loading="eager"
        onLayout={onLayout} />


      {/* شبكة أثلاث تساعد على التوسيط بصرياً */}
      <span className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="absolute left-1/3 top-0 h-full w-px bg-white/10" />
        <span className="absolute left-2/3 top-0 h-full w-px bg-white/10" />
        <span className="absolute left-0 top-1/3 h-px w-full bg-white/10" />
        <span className="absolute left-0 top-2/3 h-px w-full bg-white/10" />
      </span>

      <span
        className="pointer-events-none absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cyan-300 bg-cyan-400/20 shadow-[0_0_14px_rgba(34,211,238,0.65)]"
        style={{ left: `${surface.positionX}%`, top: `${surface.positionY}%` }}
        aria-hidden>

        <CrosshairIcon className="h-3.5 w-3.5 text-cyan-100" />
      </span>

      <span className="font-en pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-[#04070f]/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
        {surface.positionX}% · {surface.positionY}%
      </span>
    </div>);

}

function SurfaceControls({
  surfaceKey,
  surface,
  src,
  media,
  fallback,
  onPatchSurface







}: {surfaceKey: SurfaceKey;surface: SurfaceAppearance;src: string;media: AdminStoryMedia[];fallback: string | null;onPatchSurface: (key: SurfaceKey, changes: Partial<SurfaceAppearance>) => void;}) {
  const [layout, setLayout] = React.useState<ImageLayout | null>(null);
  const [natural, setNatural] = React.useState<Box | null>(null);
  const seed = React.useMemo(() => defaultAppearance()[surfaceKey], [surfaceKey]);

  const handleLayout = React.useCallback((next: ImageLayout, size: Box) => {
    setLayout(next);
    setNatural(size);
  }, []);

  const patch = (changes: Partial<SurfaceAppearance>) => onPatchSurface(surfaceKey, changes);
  const lockHint = layout ? axisLockHint(layout, surface.fit) : null;

  const options = React.useMemo(
    () => [
    { url: null as string | null, label: "الغلاف الافتراضي" },
    ...media.map((item) => ({ url: item.url, label: item.role }))],
    [media]
  );

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-[11px] leading-relaxed text-slate-500">
        {SURFACE_FRAMES[surfaceKey].label} — نسبة الإطار الحقيقية مطبّقة هنا وفي المعاينة.
      </p>

      <FocalPad
        src={src}
        surface={surface}
        frameKey={surfaceKey}
        onChange={(positionX, positionY) => patch({ positionX, positionY })}
        onLayout={handleLayout} />


      {natural &&
      <p className="font-en text-[10.5px] text-slate-500">
          {natural.width}×{natural.height}px
          {layout ? ` · ${Math.round(layout.width)}×${Math.round(layout.height)} داخل الإطار` : ""}
        </p>
      }

      {lockHint &&
      <p className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-300">
          <TriangleAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {lockHint}
        </p>
      }

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-bold text-slate-400">طريقة الملاءمة</span>
        <Segmented
          size="sm"
          value={surface.fit}
          onChange={(fit) => patch({ fit })}
          options={FIT_OPTIONS} />

        <p className="text-[10.5px] leading-relaxed text-slate-500">{FIT_HINTS[surface.fit]}</p>
      </div>

      <Slider
        label="الموضع الأفقي X"
        value={surface.positionX}
        min={0}
        max={100}
        defaultValue={seed.positionX}
        onChange={(positionX) => patch({ positionX })}
        format={(value) => `${Math.round(value)}%`}
        disabled={layout ? !layout.canPanX : false}
        disabledNote="لا فائض أفقي — غيّر «طريقة الملاءمة» أو زد التكبير ليعمل هذا المحور." />


      <Slider
        label="الموضع العمودي Y"
        value={surface.positionY}
        min={0}
        max={100}
        defaultValue={seed.positionY}
        onChange={(positionY) => patch({ positionY })}
        format={(value) => `${Math.round(value)}%`}
        disabled={layout ? !layout.canPanY : false}
        disabledNote="لا فائض رأسي — اختر «ملء العرض» أو زد التكبير ليعمل هذا المحور." />


      <Slider
        label="التكبير"
        value={surface.scale}
        min={1}
        max={3}
        step={0.01}
        defaultValue={seed.scale}
        onChange={(scale) => patch({ scale })}
        format={(value) => `${value.toFixed(2)}x`} />


      <Slider
        label="التعتيم فوق الصورة"
        value={surface.overlay}
        min={0}
        max={100}
        defaultValue={seed.overlay}
        onChange={(overlay) => patch({ overlay })}
        format={(value) => `${Math.round(value)}%`}
        hint="يضمن قراءة النص فوق الصورة." />


      <Slider
        label="الإضاءة"
        value={surface.brightness}
        min={0.4}
        max={1.6}
        step={0.01}
        defaultValue={seed.brightness}
        onChange={(brightness) => patch({ brightness })}
        format={(value) => value.toFixed(2)} />


      <Slider
        label="التباين"
        value={surface.contrast}
        min={0.4}
        max={1.6}
        step={0.01}
        defaultValue={seed.contrast}
        onChange={(contrast) => patch({ contrast })}
        format={(value) => value.toFixed(2)} />


      <Slider
        label="تشبّع الألوان"
        value={surface.saturation}
        min={0}
        max={2}
        step={0.01}
        defaultValue={seed.saturation}
        onChange={(saturation) => patch({ saturation })}
        format={(value) => value.toFixed(2)} />


      <Toggle
        label="ملء الفراغ بخلفية ضبابية"
        description="بدل شريط أسود حين لا تغطي الصورة الإطار بالكامل."
        checked={surface.blur}
        onChange={(blur) => patch({ blur })} />


      <div>
        <p className="mb-2 text-[12px] font-bold text-slate-400">صورة هذا السطح</p>
        <div className="grid grid-cols-4 gap-2">
          {options.slice(0, 12).map((option, index) => {
            const active = (surface.imageUrl ?? null) === option.url;
            const preview = option.url ?? fallback;
            return (
              <button
                key={`${option.url ?? "default"}-${index}`}
                type="button"
                onClick={() => patch({ imageUrl: option.url })}
                title={option.label}
                className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                active ?
                "border-cyan-400/70 ring-2 ring-cyan-400/25" :
                "border-white/[0.07] hover:border-white/25"}`
                }>

                {preview ?
                <img src={preview} alt="" aria-hidden className="h-full w-full object-cover" /> :

                <span className="flex h-full w-full items-center justify-center text-slate-600">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                }
              </button>);

          })}
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
          ارفع صوراً جديدة من تبويب «الوسائط»، وستظهر هنا لكل سطح.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/[0.05] pt-3">
        <Button
          tone="ghost"
          className="px-3 py-2 text-[11.5px]"
          onClick={() => patch({ ...DEFAULT_SURFACE, ...seed, imageUrl: surface.imageUrl })}>

          <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
          إرجاع هذا السطح
        </Button>

        <Button
          tone="outline"
          className="px-3 py-2 text-[11.5px]"
          onClick={() => {
            SURFACE_KEYS.filter((key) => key !== surfaceKey).forEach((key) => {
              onPatchSurface(key, {
                positionX: surface.positionX,
                positionY: surface.positionY,
                scale: surface.scale,
                brightness: surface.brightness,
                contrast: surface.contrast,
                saturation: surface.saturation,
                blur: surface.blur
              });
            });
          }}>

          نسخ إلى بقية الأسطح
        </Button>
      </div>
    </div>);

}

export function AppearancePanel({
  draft,
  surfaceKey,
  onSurfaceKeyChange,
  onPatchSurface,
  media,
  onPickCover
}: AppearancePanelProps) {
  const fallback = draft.coverImage ?? draft.bgImage;

  return (
    <aside className="flex flex-col gap-3">
      <section className="rounded-[16px] border border-white/[0.06] bg-[#090F18]/85 p-3.5">
        <p className="font-en mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
          Appearance Controls
        </p>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0B111C] p-2.5">
          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/[0.07]">
            {fallback ?
            <img src={fallback} alt="" aria-hidden className="h-full w-full object-cover" /> :

            <span className="flex h-full w-full items-center justify-center text-slate-600">
                <ImageIcon className="h-4 w-4" aria-hidden />
              </span>
            }
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-bold text-slate-200">صورة الغلاف</span>
            <span className="block text-[10.5px] text-slate-500">تُستخدم كافتراضي لكل الأسطح</span>
          </span>
          <Button tone="outline" onClick={onPickCover} className="shrink-0 px-3 py-2">
            تغيير
          </Button>
        </div>
      </section>

      {SURFACE_KEYS.map((key) => {
        const surface = draft.appearance[key];
        return (
          <div key={key} onFocusCapture={() => onSurfaceKeyChange(key)}>
            <CollapsibleSection
              title={`إعدادات ${SURFACE_LABELS[key]}`}
              icon={SURFACE_ICONS[key]}
              defaultOpen={key === surfaceKey}
              badge={
              surfaceKey === key ?
              <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-1.5 py-0.5 text-[9.5px] font-bold text-cyan-300">
                    في المعاينة
                  </span> :
              undefined
              }>

              <button
                type="button"
                onClick={() => onSurfaceKeyChange(key)}
                className="mb-3 w-full rounded-lg border border-white/[0.07] bg-[#0B111C] px-3 py-2 text-[11.5px] font-bold text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white">

                اعرض هذا السطح في المعاينة الكبيرة
              </button>

              <SurfaceControls
                surfaceKey={key}
                surface={surface}
                src={surfaceImage(surface, fallback)}
                media={media}
                fallback={fallback}
                onPatchSurface={onPatchSurface} />

            </CollapsibleSection>
          </div>);

      })}
    </aside>);

}

export default AppearancePanel;