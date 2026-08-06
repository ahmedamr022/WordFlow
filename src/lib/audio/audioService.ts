/**
 * خدمة الصوت الموحّدة — المصدر الوحيد لتشغيل الكلمات والجُمَل.
 *
 * ما كان مكسوراً:
 *   1. نسختان متطابقتان تقريباً: `audioService.ts` و `kokoroTTS.ts`، كل
 *      واحدة تصدّر `AudioService` بمجلد صوت افتراضي مختلف
 *      (`voice_alice` مقابل `voice_sarah`). أي مكوّن يستورد من الملف
 *      الخطأ يشغّل صوتاً من مجلد آخر أو لا يشغّل شيئاً.
 *   2. لا تخزين مؤقت: كل نقرة تُنشئ `new Audio()` وتنزّل الملف من جديد،
 *      فأول تشغيل لكل كلمة فيه تأخير محسوس.
 *   3. الأخطاء تُبتلع بـ console.warn فقط — لا الواجهة تعرف أن الملف
 *      ناقص ولا يوجد أي بديل.
 *   4. `playWord` كانت void فلا يمكن للواجهة إظهار حالة «جارٍ التشغيل».
 *
 * ما صار الآن:
 *   · ملف واحد؛ و`kokoroTTS.ts` مجرد re-export للتوافق الخلفي.
 *   · كاش للعناصر الصوتية + preload، فالتشغيل الثاني فوري.
 *   · كل الدوال ترجّع Promise<PlaybackResult> فتستطيع الواجهة إظهار
 *     مؤشر تشغيل وحالة «الصوت غير متاح».
 *   · بديل تلقائي إلى `/api/tts` عندما لا يوجد ملف mp3 مُسبق (اختياري
 *     عبر `enableTtsFallback`)، فالكلمة الجديدة تُنطَق بدل الصمت.
 *   · المسارات كلها من دوال بناء واحدة — لا تكتب مسار صوت في مكوّن.
 */

export type PlaybackStatus = "played" | "missing" | "aborted" | "error";

export interface PlaybackResult {
  status: PlaybackStatus;
  url?: string;
}

const DEFAULT_VOICE = "voice_sarah";
const VOICE_STORAGE_KEY = "selected_voice";
const MAX_CACHE = 60;

/** حروف/أرقام فقط — نفس القاعدة المستخدمة عند توليد ملفات الكلمات. */
export function normalizeWordKey(word: string): string {
  return word.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

/** الجُمَل المولَّدة تُسمّى بنفس النص مع تحويل غير الأبجدي إلى "_". */
export function normalizeSentenceKey(sentence: string): string {
  return sentence.trim().replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export function wordAudioUrl(voiceFolder: string, word: string): string | null {
  const key = normalizeWordKey(word);
  if (!key) return null;
  return `/audio/${voiceFolder}/words/${key}.mp3`;
}

export function storyLineAudioUrl(
voiceFolder: string,
storyId: string,
lineId: number)
: string {
  return `/audio/${voiceFolder}/sentences/${storyId}/line_${lineId}.mp3`;
}

export function vocabSentenceAudioUrl(voiceFolder: string, sentence: string): string | null {
  const key = normalizeSentenceKey(sentence);
  if (!key) return null;
  return `/audio/${voiceFolder}/sentences/vocab/${key}.mp3`;
}

class AudioServiceClass {
  private currentAudio: HTMLAudioElement | null = null;
  private currentStoryId = "ready-to-learn";
  private currentSpeed = 1.0;
  private activeVoiceFolder = DEFAULT_VOICE;
  private ttsFallbackEnabled = false;

  /** url -> element جاهز. يمنع إعادة التنزيل لكل نقرة. */
  private cache = new Map<string, HTMLAudioElement>();
  /** url -> false عندما يثبت أن الملف غير موجود (نتفادى محاولة ثانية). */
  private availability = new Map<string, boolean>();
  /** url -> objectURL ناتج عن /api/tts */
  private ttsCache = new Map<string, string>();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(VOICE_STORAGE_KEY);
      if (saved) this.activeVoiceFolder = saved;
    }
  }

  // ——— إعدادات ———

  setStory(storyId: string) {
    if (storyId) this.currentStoryId = storyId;
  }

  getStory(): string {
    return this.currentStoryId;
  }

  setSpeed(speed: number) {
    this.currentSpeed = this.clampSpeed(speed);
    if (this.currentAudio) this.currentAudio.playbackRate = this.currentSpeed;
  }

  getSpeed(): number {
    return this.currentSpeed;
  }

  setVoiceFolder(folder: string) {
    if (!folder || folder === this.activeVoiceFolder) return;
    this.activeVoiceFolder = folder;
    // الكاش مرتبط بالصوت — تغيير الصوت يبطله.
    this.cache.clear();
    this.availability.clear();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOICE_STORAGE_KEY, folder);
    }
  }

  getVoiceFolder(): string {
    return this.activeVoiceFolder;
  }

  /** فعّلها لو أردت نطقاً حياً للكلمات التي لا يوجد لها mp3 مُسبق. */
  enableTtsFallback(enabled: boolean) {
    this.ttsFallbackEnabled = enabled;
  }

  // ——— تشغيل ———

  playWord(word: string, speedOverride?: number): Promise<PlaybackResult> {
    const url = wordAudioUrl(this.activeVoiceFolder, word);
    if (!url) return Promise.resolve({ status: "aborted" });
    return this.play(url, speedOverride, word);
  }

  playSentence(lineId: number, speedOverride?: number): Promise<PlaybackResult> {
    const url = storyLineAudioUrl(this.activeVoiceFolder, this.currentStoryId, lineId);
    return this.play(url, speedOverride);
  }

  playSentenceText(sentenceText: string, speedOverride?: number): Promise<PlaybackResult> {
    const url = vocabSentenceAudioUrl(this.activeVoiceFolder, sentenceText);
    if (!url) return Promise.resolve({ status: "aborted" });
    return this.play(url, speedOverride, sentenceText);
  }

  /** اسم قديم مُحتفظ به للتوافق. */
  playText(text: string, speedOverride?: number): Promise<PlaybackResult> {
    return this.playSentenceText(text, speedOverride);
  }

  /**
   * تحميل مسبق بلا تشغيل — استخدمها للسطر التالي في القارئ أو للكلمات
   * الظاهرة على الشاشة. هذا ما يجعل التشغيل يبدو فورياً.
   */
  preloadWords(words: string[]) {
    words.
    map((word) => wordAudioUrl(this.activeVoiceFolder, word)).
    forEach((url) => {
      if (url) this.warm(url);
    });
  }

  preloadStoryLines(lineIds: number[]) {
    lineIds.
    map((id) => storyLineAudioUrl(this.activeVoiceFolder, this.currentStoryId, id)).
    forEach((url) => this.warm(url));
  }

  stop() {
    if (!this.currentAudio) return;
    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
  }

  isPlaying(): boolean {
    return Boolean(this.currentAudio && !this.currentAudio.paused);
  }

  // ——— الداخل ———

  private clampSpeed(speed: number): number {
    if (!Number.isFinite(speed)) return 1;
    return Math.max(0.5, Math.min(speed, 1.5));
  }

  private warm(url: string) {
    if (typeof window === "undefined") return;
    if (this.availability.get(url) === false) return;
    if (this.cache.has(url)) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    audio.addEventListener("error", () => {
      this.availability.set(url, false);
      this.cache.delete(url);
    });
    this.remember(url, audio);
  }

  private remember(url: string, audio: HTMLAudioElement) {
    if (this.cache.size >= MAX_CACHE) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(url, audio);
  }

  private async play(
  url: string,
  speedOverride: number | undefined,
  ttsText?: string)
  : Promise<PlaybackResult> {
    if (typeof window === "undefined") return { status: "aborted" };

    this.stop();

    if (this.availability.get(url) === false) {
      return this.ttsFallback(url, ttsText, speedOverride);
    }

    const speed = this.clampSpeed(speedOverride ?? this.currentSpeed);
    const audio = this.cache.get(url) ?? new Audio(url);
    if (!this.cache.has(url)) this.remember(url, audio);

    audio.currentTime = 0;
    audio.playbackRate = speed;
    this.currentAudio = audio;

    const result = await new Promise<PlaybackResult>((resolve) => {
      const cleanup = () => {
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
      };
      const onEnded = () => {
        cleanup();
        resolve({ status: "played", url });
      };
      const onError = () => {
        cleanup();
        this.availability.set(url, false);
        this.cache.delete(url);
        resolve({ status: "missing", url });
      };

      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      audio.play().catch(() => {
        cleanup();
        resolve({ status: "error", url });
      });
    });

    if (result.status === "missing") {
      return this.ttsFallback(url, ttsText, speedOverride);
    }
    return result;
  }

  /** يُستخدم فقط عند تفعيل enableTtsFallback ووجود نص. */
  private async ttsFallback(
  originalUrl: string,
  text: string | undefined,
  speedOverride: number | undefined)
  : Promise<PlaybackResult> {
    if (!this.ttsFallbackEnabled || !text) {
      return { status: "missing", url: originalUrl };
    }

    try {
      let objectUrl = this.ttsCache.get(text);

      if (!objectUrl) {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (!response.ok) return { status: "missing", url: originalUrl };
        objectUrl = URL.createObjectURL(await response.blob());
        this.ttsCache.set(text, objectUrl);
      }

      const audio = new Audio(objectUrl);
      audio.playbackRate = this.clampSpeed(speedOverride ?? this.currentSpeed);
      this.currentAudio = audio;

      await new Promise<void>((resolve) => {
        audio.addEventListener("ended", () => resolve(), { once: true });
        audio.addEventListener("error", () => resolve(), { once: true });
        audio.play().catch(() => resolve());
      });

      return { status: "played", url: objectUrl };
    } catch {
      return { status: "error", url: originalUrl };
    }
  }
}

export const AudioService = new AudioServiceClass();
export type { AudioServiceClass };