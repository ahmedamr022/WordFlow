import type { CSSProperties } from "react";
import {
  Sun,
  Plane,
  GraduationCap,
  HeartPulse,
  Briefcase,
  MessagesSquare,
  Trees,
  UtensilsCrossed,
  Drama,
  BookOpen,
  CircleDollarSign,
  Circle,
  Cpu,
  Users,
  Tag,
  type LucideIcon } from
"lucide-react";

import type { VocabularyCategory, VocabularyWord } from "@/data/vocabularyData";

/**
 * طبقة العرض المشتركة لكل شاشات المفردات (النظرة العامة، الفئة، الكلمة).
 *
 * الهدف: مصدر واحد للألوان والأيقونات وحسابات التقدّم، حتى لا تختلف الفئة
 * بين شاشة وأخرى ولا تتبدّل ألوانها مع الفلترة.
 *
 * ملاحظة: `Dribbble` غير موجود في نسخة lucide-react المثبّتة، و`BoxIcon` قيمة
 * لا نوع — لذلك النوع الصحيح هنا هو `LucideIcon`.
 */

export const VOCAB_COLORS = {
  page: "#05070E",
  panel: "#070C15",
  card: "#0B101B",
  cardAlt: "#0D1320",
  border: "rgba(255,255,255,.07)",
  cyan: "#20E3D6",
  violet: "#8B5CF6"
} as const;

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_COLORS: Record<string, string> = {
  A1: "#64748B",
  A2: "#34D399",
  B1: "#22D3EE",
  B2: "#8B5CF6",
  C1: "#FB7185",
  C2: "#F472B6"
};

export const LEVEL_LABELS: Record<string, string> = {
  A1: "مبتدئ جداً",
  A2: "مبتدئ",
  B1: "متوسط",
  B2: "فوق المتوسط",
  C1: "متقدم",
  C2: "إتقان"
};

const PALETTE: {color: string;icon: LucideIcon;}[] = [
{ color: "#F59E0B", icon: Sun },
{ color: "#3B82F6", icon: Plane },
{ color: "#F97316", icon: GraduationCap },
{ color: "#EC4899", icon: HeartPulse },
{ color: "#10B981", icon: Briefcase },
{ color: "#8B5CF6", icon: MessagesSquare },
{ color: "#22D3EE", icon: Trees },
{ color: "#FBBF24", icon: UtensilsCrossed },
{ color: "#A855F7", icon: Drama },
{ color: "#2DD4BF", icon: BookOpen },
{ color: "#4ADE80", icon: CircleDollarSign },
{ color: "#FB7185", icon: Circle },
{ color: "#60A5FA", icon: Cpu },
{ color: "#F472B6", icon: Users },
{ color: "#94A3B8", icon: Tag }];


/**
 * اللون والأيقونة مشتقّان من معرّف الفئة لا من ترتيبها في المصفوفة —
 * وإلا تبدّل شكل الفئة مع كل فلترة أو بحث.
 */
export function paletteFor(id: string): {color: string;icon: LucideIcon;} {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 100000;
  }
  return PALETTE[hash % PALETTE.length];
}

export interface CategoryStats {
  total: number;
  learned: number;
  remaining: number;
  percent: number;
}

export function categoryStats(
category: VocabularyCategory,
isLearned: (word: string) => boolean)
: CategoryStats {
  const total = category.words.length;
  if (total === 0) return { total: 0, learned: 0, remaining: 0, percent: 0 };
  const learned = category.words.filter((word) => isLearned(word.word)).length;
  return {
    total,
    learned,
    remaining: total - learned,
    percent: Math.round(learned / total * 100)
  };
}

export type WordStatus = "learned" | "learning" | "new";

export function wordStatus(
word: VocabularyWord,
isLearned: (value: string) => boolean)
: WordStatus {
  return isLearned(word.word) ? "learned" : "new";
}

export function levelChipStyle(level: string): CSSProperties {
  const color = LEVEL_COLORS[level] ?? LEVEL_COLORS.B1;
  return {
    color,
    backgroundColor: `${color}1A`,
    borderColor: `${color}40`
  };
}

/** أعداد الكلمات لكل مستوى — لمخطط التوزيع. */
export function levelDistribution(words: VocabularyWord[]) {
  const counts: Record<string, number> = {};
  for (const word of words) {
    counts[word.cefrLevel] = (counts[word.cefrLevel] ?? 0) + 1;
  }
  const total = Math.max(1, words.length);
  return LEVELS.
  filter((level) => (counts[level] ?? 0) > 0).
  map((level) => ({
    level,
    count: counts[level] ?? 0,
    pct: Math.round((counts[level] ?? 0) / total * 100),
    color: LEVEL_COLORS[level]
  }));
}

/** يقسم الجملة حول الكلمة الهدف لإبرازها داخل المثال. */
export function splitSentenceByWord(sentence: string, word: string) {
  const index = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (index === -1) return { before: sentence, match: "", after: "" };
  return {
    before: sentence.slice(0, index),
    match: sentence.slice(index, index + word.length),
    after: sentence.slice(index + word.length)
  };
}