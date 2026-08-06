/**
 * طبقة المظهر المشتركة بين واجهة المستخدم و Admin Studio — الإصدار ٢.
 *
 * لماذا تعيش هنا ولا داخل كل مكوّن؟ لأن نفس القيم تُستخدم في ٣ أماكن:
 *   1. سطح المستخدم الحقيقي (صفحة القصة، المودال، قصة اليوم، الكارت).
 *   2. المعاينة المباشرة داخل الاستوديو (لازم تكون **مطابقة** بالبكسل).
 *   3. الحفظ في قاعدة البيانات.
 *
 * ما تغيّر في هذا الإصدار (إصلاح مشكلتين حقيقيتين كان الأدمن يعاني منهما)
 * ────────────────────────────────────────────────────────────────────────
 * ١) «الموضع العمودي Y مش بيتغير»:
 *    السبب ليس بَجاً في الحفظ — بل فيزياء `object-fit: cover`. لو الصورة
 *    أعرض من الإطار (١٦:٩ داخل إطار ٨:٣ مثلاً) فالقص يحدث **أفقياً فقط**،
 *    ولا يوجد أي فائض رأسي ليتحرك، فـ Y بلا أثر مهما كانت قيمته.
 *    الحل: نموذج ملاءمة صريح (`fit`) فيه `width` و`height`، مع حسابٍ
 *    هندسي دقيق (`computeLayout`) يضع الصورة بالبكسل بدل الاعتماد على
 *    `object-position`. النتيجة: X و Y **يعملان دائماً**، و`axisLock`
 *    يخبر الأدمن صراحةً لو محورٌ ما بلا فائض في وضع `cover`.
 *
 * ٢) «الشكل في الاستوديو ≠ الشكل في الداشبورد»:
 *    نفس الدوال كانت تُستدعى في المكانين، لكن **نسبة الإطار** مختلفة، و
 *    `cover` يقص حسب الإطار. لذلك أصبحت نِسَب الأسطح معرّفة هنا مرة واحدة
 *    (`SURFACE_FRAMES`) ويستخدمها الطرفان ⇒ المعاينة صادقة.
 */

import {
  SURFACE_KEYS,
  type StoryAppearance,
  type SurfaceAppearance,
  type SurfaceFit,
  type SurfaceKey } from
"@/types/admin";

/** الافتراضي الآمن لأي قصة قديمة لا تحمل إعدادات. */
export const DEFAULT_SURFACE: SurfaceAppearance = {
  imageUrl: null,
  positionX: 50,
  positionY: 50,
  scale: 1,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  overlay: 0,
  fit: "cover",
  blur: true
};

/**
 * بذور لكل سطح.
 *
 * `storyToday` و`storyPage` إطارهما عريض جداً، فالافتراضي فيهما `width`:
 * الصورة تُملأ بالعرض كاملاً (بلا «زوم» مبالغ فيه) والفائض الرأسي يمنح
 * الأدمن تحكّماً حقيقياً في Y.
 */
const SURFACE_SEEDS: Record<SurfaceKey, Partial<SurfaceAppearance>> = {
  storyPage: { positionX: 68, positionY: 45, overlay: 30, fit: "cover" },
  modal: { positionX: 50, positionY: 42, overlay: 12, fit: "cover" },
  storyToday: { positionX: 50, positionY: 38, overlay: 26, fit: "width" },
  card: { positionX: 50, positionY: 38, overlay: 18, fit: "cover" }
};

/**
 * نسبة إطار كل سطح كما يظهر فعلاً في الموقع.
 * أي تعديل هنا يجب أن ينعكس في المكوّن الحقيقي **والمعاينة** معاً — لذلك
 * نُصدّر أيضاً كلاس Tailwind جاهزاً يستخدمه الطرفان.
 */
export interface SurfaceFrame {
  /** نسبة العرض/الارتفاع على الديسكتوب (المرجع في المعاينة). */
  ratio: number;
  /** نسبة الموبايل — الإطار يصبح أقرب للمربع. */
  ratioMobile: number;
  /** كلاس Tailwind للمعاينة (ديسكتوب). */
  aspectClass: string;
  /** كلاس Tailwind للمعاينة (موبايل). */
  aspectClassMobile: string;
  /** الكلاس المستخدم في المكوّن الحقيقي (متجاوب). */
  responsiveClass: string;
  label: string;
}

export const SURFACE_FRAMES: Record<SurfaceKey, SurfaceFrame> = {
  storyPage: {
    ratio: 16 / 9,
    ratioMobile: 4 / 5,
    aspectClass: "aspect-[16/9]",
    aspectClassMobile: "aspect-[4/5]",
    responsiveClass: "aspect-[4/5] lg:aspect-[16/9]",
    label: "خلفية عريضة خلف نص القراءة"
  },
  modal: {
    ratio: 16 / 10,
    ratioMobile: 16 / 10,
    aspectClass: "aspect-[16/10]",
    aspectClassMobile: "aspect-[16/10]",
    responsiveClass: "aspect-[16/10]",
    label: "إطار الصورة أعلى مودال التفاصيل"
  },
  storyToday: {
    ratio: 8 / 3,
    ratioMobile: 4 / 3,
    aspectClass: "aspect-[8/3]",
    aspectClassMobile: "aspect-[4/3]",
    responsiveClass: "aspect-[4/3] lg:aspect-[8/3]",
    label: "الكارت العريض في لوحة المستخدم"
  },
  card: {
    ratio: 3 / 4,
    ratioMobile: 3 / 4,
    aspectClass: "aspect-[3/4]",
    aspectClassMobile: "aspect-[3/4]",
    responsiveClass: "aspect-[3/4]",
    label: "الكارت الطولي في المكتبة"
  }
};

export const FIT_LABELS: Record<SurfaceFit, string> = {
  cover: "تغطية الإطار (قص)",
  contain: "الصورة كاملة",
  width: "ملء العرض",
  height: "ملء الارتفاع"
};

export const FIT_HINTS: Record<SurfaceFit, string> = {
  cover: "تملأ الإطار بالكامل مع قص الزائد. المحور الذي لا فائض فيه يكون معطّلاً.",
  contain: "تُظهر الصورة كاملة بلا قص؛ الفراغ يُملأ بخلفية ضبابية.",
  width: "تملأ العرض كاملاً — الأنسب للأطر العريضة، ويمنحك تحكماً كاملاً في Y.",
  height: "تملأ الارتفاع كاملاً — الأنسب للأطر الطولية، ويمنحك تحكماً كاملاً في X."
};

const FITS: SurfaceFit[] = ["cover", "contain", "width", "height"];

export function defaultAppearance(): StoryAppearance {
  return SURFACE_KEYS.reduce((acc, key) => {
    acc[key] = { ...DEFAULT_SURFACE, ...SURFACE_SEEDS[key] };
    return acc;
  }, {} as StoryAppearance);
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

/** يقبل أي jsonb قادم من الداتابيز (أو undefined) ويرجّع شكلاً كاملاً آمناً. */
export function normalizeSurface(input: unknown, key: SurfaceKey): SurfaceAppearance {
  const base = { ...DEFAULT_SURFACE, ...SURFACE_SEEDS[key] };
  if (!input || typeof input !== "object") return base;
  const raw = input as Partial<SurfaceAppearance>;

  return {
    imageUrl:
    typeof raw.imageUrl === "string" && raw.imageUrl.trim() !== "" ? raw.imageUrl : null,
    positionX: clamp(raw.positionX, 0, 100, base.positionX),
    positionY: clamp(raw.positionY, 0, 100, base.positionY),
    scale: clamp(raw.scale, 1, 3, base.scale),
    brightness: clamp(raw.brightness, 0.4, 1.6, base.brightness),
    contrast: clamp(raw.contrast, 0.4, 1.6, base.contrast),
    saturation: clamp(raw.saturation, 0, 2, base.saturation),
    overlay: clamp(raw.overlay, 0, 100, base.overlay),
    fit: FITS.includes(raw.fit as SurfaceFit) ? raw.fit as SurfaceFit : base.fit,
    blur: raw.blur === undefined ? base.blur : Boolean(raw.blur)
  };
}

export function normalizeAppearance(input: unknown): StoryAppearance {
  const raw = (input ?? {}) as Record<string, unknown>;
  return SURFACE_KEYS.reduce((acc, key) => {
    acc[key] = normalizeSurface(raw[key], key);
    return acc;
  }, {} as StoryAppearance);
}

// ── الهندسة الحقيقية ─────────────────────────────────────────────────────────

export interface Box {
  width: number;
  height: number;
}

export interface ImageLayout {
  width: number;
  height: number;
  left: number;
  top: number;
  /** هل تحريك X مؤثر؟ (يوجد فائض أفقي) */
  canPanX: boolean;
  /** هل تحريك Y مؤثر؟ (يوجد فائض رأسي) */
  canPanY: boolean;
  /** هل يظهر فراغ حول الصورة ⇒ نحتاج خلفية ضبابية؟ */
  hasGap: boolean;
}

/**
 * الحساب الوحيد الذي يحدّد مكان الصورة وحجمها داخل الإطار.
 *
 * نحسب بالبكسل بدل `object-position` لأن الأخير لا يتيح تحريك محور بلا فائض،
 * وهذا بالضبط سبب شكوى «Y مش بيتغير».
 */
export function computeLayout(
surface: SurfaceAppearance,
container: Box,
natural: Box)
: ImageLayout {
  const safeContainer = {
    width: Math.max(1, container.width),
    height: Math.max(1, container.height)
  };
  const naturalRatio =
  natural.width > 0 && natural.height > 0 ?
  natural.width / natural.height :
  safeContainer.width / safeContainer.height;
  const containerRatio = safeContainer.width / safeContainer.height;

  let width: number;
  let height: number;

  switch (surface.fit) {
    case "contain":
      if (naturalRatio > containerRatio) {
        width = safeContainer.width;
        height = width / naturalRatio;
      } else {
        height = safeContainer.height;
        width = height * naturalRatio;
      }
      break;
    case "width":
      width = safeContainer.width;
      height = width / naturalRatio;
      break;
    case "height":
      height = safeContainer.height;
      width = height * naturalRatio;
      break;
    default:
      if (naturalRatio > containerRatio) {
        height = safeContainer.height;
        width = height * naturalRatio;
      } else {
        width = safeContainer.width;
        height = width / naturalRatio;
      }
  }

  width *= surface.scale;
  height *= surface.scale;

  const slackX = safeContainer.width - width;
  const slackY = safeContainer.height - height;

  return {
    width,
    height,
    left: slackX * (surface.positionX / 100),
    top: slackY * (surface.positionY / 100),
    canPanX: Math.abs(slackX) > 1,
    canPanY: Math.abs(slackY) > 1,
    hasGap: slackX > 1 || slackY > 1
  };
}

/** فلاتر اللون — مشتركة بين كل أوضاع الملاءمة. */
export function filterStyle(surface: SurfaceAppearance): string | undefined {
  if (surface.brightness === 1 && surface.contrast === 1 && surface.saturation === 1) {
    return undefined;
  }
  return `brightness(${surface.brightness}) contrast(${surface.contrast}) saturate(${surface.saturation})`;
}

/**
 * ستايل CSS تقريبي يُستخدم **قبل** قياس الصورة (أول رِندر / SSR) حتى لا تحدث
 * وميض. بعد القياس يتولّى `computeLayout` الأمر بدقة.
 */
export function imageStyle(surface: SurfaceAppearance): React.CSSProperties {
  const origin = `${surface.positionX}% ${surface.positionY}%`;
  const objectFit: React.CSSProperties["objectFit"] =
  surface.fit === "contain" ? "contain" : "cover";

  return {
    objectFit,
    objectPosition: origin,
    transform: surface.scale === 1 ? undefined : `scale(${surface.scale})`,
    transformOrigin: origin,
    filter: filterStyle(surface)
  };
}

/** طبقة التعتيم — اتجاه التدرّج يختلف حسب مكان النص في كل سطح. */
export function overlayStyle(
surface: SurfaceAppearance,
direction: "left" | "bottom" = "bottom")
: React.CSSProperties {
  const alpha = surface.overlay / 100;
  if (alpha <= 0) return { display: "none" };

  const background =
  direction === "left" ?
  `linear-gradient(90deg, rgba(3,5,12,${Math.min(0.96, alpha + 0.55)}) 0%, rgba(3,5,12,${(
  alpha + 0.2).
  toFixed(3)}) 38%, rgba(3,5,12,0) 78%)` :
  `linear-gradient(0deg, rgba(3,5,12,${Math.min(0.97, alpha + 0.6)}) 0%, rgba(3,5,12,${(
  alpha * 0.55).
  toFixed(3)}) 55%, rgba(3,5,12,0) 100%)`;

  return { background };
}

/** الصورة الفعلية لسطح معيّن: اختيار الأدمن، وإلا الافتراضي القادم من القصة. */
export function surfaceImage(
surface: SurfaceAppearance,
fallback: string | null | undefined)
: string {
  return surface.imageUrl ?? fallback ?? "/placeholder.svg";
}

/** نص إرشادي يظهر للأدمن حين يكون محورٌ بلا أثر. */
export function axisLockHint(layout: ImageLayout, fit: SurfaceFit): string | null {
  if (fit === "contain") {
    return "وضع «الصورة كاملة»: التحريك يعمل داخل الفراغ فقط.";
  }
  if (!layout.canPanX && !layout.canPanY) {
    return "الصورة مطابقة تماماً لنسبة الإطار — لا يوجد فائض للتحريك. زد التكبير قليلاً.";
  }
  if (!layout.canPanY) {
    return "لا فائض رأسي في هذا الإطار ⇒ Y بلا أثر. اختر «ملء العرض» أو زد التكبير.";
  }
  if (!layout.canPanX) {
    return "لا فائض أفقي في هذا الإطار ⇒ X بلا أثر. اختر «ملء الارتفاع» أو زد التكبير.";
  }
  return null;
}