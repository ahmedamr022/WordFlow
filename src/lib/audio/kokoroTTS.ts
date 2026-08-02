// Pure Pre-Generated ElevenLabs Audio Engine for Words & Sentences
// NO synthetic/robotic fallback — only plays real ElevenLabs MP3 files
class AudioServiceClass {
  private currentAudio: HTMLAudioElement | null = null;
  private currentStoryId: string = "ready-to-learn";
  private currentSpeed: number = 1.0;
  private activeVoiceFolder: string = "voice_sarah";

  public setStory(storyId: string) {
    this.currentStoryId = storyId;
  }

  public setSpeed(speed: number) {
    this.currentSpeed = speed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = speed;
    }
  }

  public setVoiceFolder(folder: string) {
    this.activeVoiceFolder = folder;
  }

  // Play Word Audio from Pre-generated ElevenLabs MP3 File ONLY
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

      // Silently ignore if file doesn't exist — NO robotic fallback
      audio.onerror = () => {
        console.warn(`[AudioService] Missing word file: ${cleanWord}.mp3`);
      };

      audio.play().catch(() => {});
    } catch {
      // Silently ignore
    }
  }

  // Play Pre-Generated ElevenLabs Sentence Audio
  public playSentenceText(sentenceText: string, speedOverride?: number): Promise<void> {
    if (!sentenceText || sentenceText.trim() === "") return Promise.resolve();
    const speedToUse = speedOverride !== undefined ? speedOverride : this.currentSpeed;
    const safeSentence = sentenceText.trim().replace(/[^a-z0-9]/gi, "_").toLowerCase();

    const localUrl = `/audio/${this.activeVoiceFolder}/sentences/vocab/${safeSentence}.mp3`;

    this.stop();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(localUrl);
        audio.playbackRate = Math.max(0.5, Math.min(speedToUse, 1.5));
        this.currentAudio = audio;

        audio.onended = () => resolve();

        audio.onerror = () => {
          console.warn(`[AudioService] Missing sentence file: ${safeSentence}.mp3`);
          resolve();
        };

        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  // Play pre-generated sentence line audio (line_X.mp3)
  public playSentence(lineId: number, speedOverride?: number) {
    const speedToUse = speedOverride !== undefined ? speedOverride : this.currentSpeed;
    const audioUrl = `/audio/${this.activeVoiceFolder}/sentences/${this.currentStoryId}/line_${lineId}.mp3`;

    this.stop();

    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = Math.max(0.5, Math.min(speedToUse, 1.5));
      this.currentAudio = audio;

      audio.onerror = () => {
        console.warn(`[AudioService] Missing sentence line: ${this.currentStoryId}/line_${lineId}.mp3`);
      };

      audio.play().catch(() => {});
    } catch {
      // Silently ignore
    }
  }

  public playText(text: string, speedOverride?: number) {
    this.playSentenceText(text, speedOverride);
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
