/**
 * كان هذا الملف نسخة ثانية شبه متطابقة من `audioService.ts` تصدّر
 * `AudioService` أيضاً — بمجلد صوت افتراضي مختلف. أي أن نصف المشروع كان
 * يشغّل صوتاً من كائن، والنصف الآخر من كائن مختلف، بحالة سرعة/قصة
 * منفصلة تماماً (setStory في أحدهما لا يؤثر على الآخر).
 *
 * الآن هو مجرد re-export للخدمة الموحّدة، فكل الاستيرادات القديمة تظل
 * تعمل بلا تعديل، والحالة واحدة.
 *
 * يمكنك حذف هذا الملف بعد تحويل الاستيرادات إلى:
 *   import { AudioService } from "@/lib/audio/audioService";
 */

export {
  AudioService,
  normalizeWordKey,
  normalizeSentenceKey,
  wordAudioUrl,
  storyLineAudioUrl,
  vocabSentenceAudioUrl } from
"@/lib/audio/audioService";

export type { PlaybackResult, PlaybackStatus } from "@/lib/audio/audioService";