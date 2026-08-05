// Audio Service with Dynamic Voice Selection
class AudioServiceClass {
  private currentAudio: HTMLAudioElement | null = null;
  private currentStoryId: string = "ready-to-learn";
  private currentSpeed: number = 1.0;
  private activeVoiceFolder: string = "voice_alice"; // الصوت الافتراضي

  constructor() {
    // استرجاع الصوت المفضل للمستخدم إن وجد
    if (typeof window !== "undefined") {
      const savedVoice = localStorage.getItem("selected_voice");
      if (savedVoice) {
        this.activeVoiceFolder = savedVoice;
      }
    }
  }

  public setStory(storyId: string) {
    this.currentStoryId = storyId;
  }

  public setSpeed(speed: number) {
    this.currentSpeed = speed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = speed;
    }
  }

  // دالة تغيير الصوت ديناميكيًا
  public setVoiceFolder(folder: string) {
    this.activeVoiceFolder = folder;
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_voice", folder);
    }
  }

  public getVoiceFolder(): string {
    return this.activeVoiceFolder;
  }

  // تشغيل صوت الكلمات
  public playWord(word: string, speedOverride?: number) {
    if (!word || word.trim() === "") return;
    const speedToUse = speedOverride !== undefined ? speedOverride : this.currentSpeed;
    const cleanWord = word.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    if (!cleanWord) return;

    const localUrl = `/audio/${this.activeVoiceFolder}/words/${cleanWord}.mp3`;

    this.stop();

    try {
      const audio = new Audio(localUrl);
      audio.playbackRate = Math.max(0.5, Math.min(speedToUse, 1.5));
      this.currentAudio = audio;

      audio.onerror = () => {
        console.warn(`[AudioService] Missing word file: ${localUrl}`);
      };

      audio.play().catch(() => {});
    } catch {
      // Ignore
    }
  }

  // تشغيل صوت أسطر القصص
  public playSentence(lineId: number, speedOverride?: number) {
    const speedToUse = speedOverride !== undefined ? speedOverride : this.currentSpeed;
    const audioUrl = `/audio/${this.activeVoiceFolder}/sentences/${this.currentStoryId}/line_${lineId}.mp3`;

    this.stop();

    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = Math.max(0.5, Math.min(speedToUse, 1.5));
      this.currentAudio = audio;

      audio.onerror = () => {
        console.warn(`[AudioService] Missing sentence file: ${audioUrl}`);
      };

      audio.play().catch(() => {});
    } catch {
      // Ignore
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export const AudioService = new AudioServiceClass();