export interface Token {
  /** The word as it appears in the sentence, including trailing punctuation. */
  text: string;
  /** Optional suffix of the word that gets highlighted inside the word card (e.g. "ed"). */
  suffix?: string;
  /** Part of speech in English, e.g. "Verb". */
  pos?: string;
  /** Part of speech in Arabic, e.g. "فعل". */
  posAr?: string;
  /** Arabic translation(s) of the word. */
  translation?: string;
  /** Short Arabic hint explaining the meaning. */
  hint?: string;
}

export interface Sentence {
  id: number;
  tokens: Token[];
  arabic: string;
}

export interface Story {
  id: string;
  level: string;
  backgroundUrl: string;
  sentences: Sentence[];
}

export interface Voice {
  id: string;
  label: string;
  locale: string;
}