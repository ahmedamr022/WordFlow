export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Word {
  id: string;
  word: string;
  translationAr: string;
  ipa?: string;
  partOfSpeech?: string;
  cefrLevel?: CEFRLevel;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export type StoryWord = Word;

export interface StoryLine {
  id: number;
  text: string;
  translationAr: string;
  words: Word[];
}

export interface Story {
  id: string;
  title: string;
  titleAr: string;
  courseId: string;
  cefrLevel: CEFRLevel;
  lines: StoryLine[];
  totalLines: number;
  totalWords: number;
  estimatedMinutes: number;
  descriptionAr?: string;
  descriptionEn?: string;
  coverImage?: string;
}

export interface Course {
  id: string;
  title: string;
  titleAr: string;
  descriptionAr: string;
  cefrLevel: CEFRLevel;
  stories: Story[];
  storyCount: number;
  coverImage: string;
}

export interface TypingMetrics {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars?: number;
  totalCharsTyped?: number;
  timeSpentSeconds?: number;
}
