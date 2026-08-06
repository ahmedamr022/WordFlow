/**
 * سرعة التشغيل الفعلية للصوت.
 *
 * المشكلة: `AudioService` يشغّل الصوت عبر عناصر `new Audio()` يخلقها داخلياً،
 * فهي **ليست** في الـ DOM ولا يمكن الوصول إليها من الواجهة. لذلك كان اختيار
 * السرعة يؤثر على توقيت التظليل فقط، والصوت يبقى 1x دائماً.
 *
 * الحل: تعديل واحد موضعي على `HTMLMediaElement.prototype.play` يضبط
 * `playbackRate` قبل كل تشغيل. صغير، يحدث مرة واحدة، ويشمل أي عنصر صوت في
 * التطبيق (جُمل القصة، الكلمات، TTS) دون تغيير واجهة AudioService.
 */

/** السرعات المسموحة في الواجهة. */
export const PLAYBACK_SPEEDS = [1, 0.75, 0.5] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

let currentRate = 1;
let patched = false;

function ensurePatched(): void {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const proto = window.HTMLMediaElement?.prototype;
  if (!proto) return;

  const originalPlay = proto.play;
  proto.play = function patchedPlay(this: HTMLMediaElement) {
    try {
      if (this.playbackRate !== currentRate) this.playbackRate = currentRate;
      // منع تغيّر النغمة عند 0.5x — أهم من السرعة نفسها لمتعلّم اللغة.
      this.preservesPitch = true;
    } catch {

      // بعض المتصفحات تمنع الضبط قبل تحميل الميتاداتا — نتجاهل بهدوء.
    }return originalPlay.call(this);
  };
}

/** اضبط السرعة العامة، وطبّقها فوراً على أي صوت يعمل الآن. */
export function setGlobalPlaybackRate(rate: number): void {
  currentRate = Math.min(1, Math.max(0.5, Number(rate) || 1));
  ensurePatched();

  if (typeof document === "undefined") return;
  document.querySelectorAll("audio, video").forEach((el) => {
    try {
      (el as HTMLMediaElement).playbackRate = currentRate;
    } catch {

      /* noop */}
  });
}

export function getGlobalPlaybackRate(): number {
  return currentRate;
}