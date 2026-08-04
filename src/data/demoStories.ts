export interface DemoWord {
  en: string;
  ar: string;
}

export interface DemoStory {
  id: string;
  lineId: number;
  fullText: string;
  translation: string;
  words: DemoWord[];
}

export const DEMO_STORIES: DemoStory[] = [
  {
    id: "ready-to-learn",
    lineId: 1,
    fullText: "I am ready to learn.",
    translation: "أنا مستعد للتعلم.",
    words: [
      { en: "I", ar: "أنا" },
      { en: "am", ar: "أكون" },
      { en: "ready", ar: "مستعد" },
      { en: "to", ar: "لـ" },
      { en: "learn.", ar: "التعلم" },
    ],
  },
  {
    id: "magic-bookshelf",
    lineId: 1,
    fullText: "Books open doors to new worlds.",
    translation: "الكتب تفتح أبواباً لعوالم جديدة.",
    words: [
      { en: "Books", ar: "الكتب" },
      { en: "open", ar: "تفتح" },
      { en: "doors", ar: "أبواباً" },
      { en: "to", ar: "لـ" },
      { en: "new", ar: "جديدة" },
      { en: "worlds.", ar: "عوالم" },
    ],
  },
  {
    id: "night-in-cairo",
    lineId: 1,
    fullText: "The Nile river sparkled under the stars.",
    translation: "تألقت مياه نهر النيل تحت النجوم.",
    words: [
      { en: "The", ar: "الـ" },
      { en: "Nile", ar: "النيل" },
      { en: "river", ar: "نهر" },
      { en: "sparkled", ar: "تألقت" },
      { en: "under", ar: "تحت" },
      { en: "the", ar: "الـ" },
      { en: "stars.", ar: "النجوم" },
    ],
  },
];