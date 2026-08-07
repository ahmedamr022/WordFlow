/**
 * WordFlow — shared domain types.
 *
 * Drop-in replacement for the ad-hoc types currently spread across
 * `src/data/vocabularyData.ts`, `src/components/vocabulary/WordFlashDeck.tsx`
 * and `src/lib/stories/catalog.ts`.
 */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type PartOfSpeech =
'noun' |
'verb' |
'adjective' |
'adverb' |
'phrase' |
'preposition';

/** Where a word sits in the learning funnel. Derived, never stored twice. */
export type MasteryStatus = 'new' | 'learning' | 'due' | 'mastered';

export interface VocabularyWord {
  id: string;
  word: string;
  translationAr: string;
  ipa: string;
  partOfSpeech: PartOfSpeech;
  cefrLevel: CefrLevel;
  exampleEn: string;
  exampleAr: string;
  /** Optional richer content, rendered in the word detail panel. */
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  note?: string;
}

export type CategoryAccent =
'teal' |
'purple' |
'pink' |
'cyan' |
'gold' |
'coral';

export interface VocabularyCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  /** lucide-react icon name resolved through `utils/icons.ts`. */
  icon: string;
  coverImage: string;
  accent: CategoryAccent;
  words: VocabularyWord[];
}

/* ------------------------------------------------------------------ *
 * Spaced repetition
 * ------------------------------------------------------------------ */

/**
 * Grades exposed to the learner. Arabic labels live in `utils/srs.ts`
 * so the enum stays stable across languages.
 */
export type ReviewGrade = 'known' | 'almost' | 'hard' | 'forgot';

export interface WordProgress {
  wordId: string;
  /** 0 → 100, drives the progress ring on each row. */
  mastery: number;
  repetitions: number;
  /** SM-2 style ease factor. */
  ease: number;
  intervalDays: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  favorite: boolean;
}

export interface ReviewAnswer {
  wordId: string;
  grade: ReviewGrade;
  xp: number;
}

export interface ReviewSummary {
  total: number;
  answers: ReviewAnswer[];
  xp: number;
  durationMs: number;
  counts: Record<ReviewGrade, number>;
}

/* ------------------------------------------------------------------ *
 * Stories (only what the de-duplication layer needs)
 * ------------------------------------------------------------------ */

export type StorySource = 'static' | 'db';

export interface StoryItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  level: string;
  duration: string;
  rating: string;
  xp: string;
  cover: string;
  progress?: number;
  isNew?: boolean;
  isLocked?: boolean;
  descriptionAr?: string;
  createdAt?: string | null;
}

export interface CatalogStory extends StoryItem {
  source: StorySource;
  hasContent: boolean;
  /** Every identity key that collapsed into this entry — useful for admin. */
  mergedFrom: string[];
}

export type StoryStatus = 'published' | 'draft' | 'locked';

export interface AdminStoryRow extends CatalogStory {
  status: StoryStatus;
  /** Number of sentences authored — surfaces "empty" stories in admin. */
  sentences: number;
}

export interface DuplicateGroup {
  key: string;
  reason: 'slug' | 'title' | 'content';
  kept: CatalogStory;
  shadowed: CatalogStory[];
}