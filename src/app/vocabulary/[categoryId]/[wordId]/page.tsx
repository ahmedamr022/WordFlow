import React from "react";
import { notFound } from "next/navigation";

import { getVocabularyOverview } from "@/lib/vocabulary/data";
import { VOCABULARY_CATEGORIES } from "@/data/vocabularyData";
import WordPageClient from "./WordPageClient";

/** صفحة الكلمة الواحدة — مسار حقيقي قابل للمشاركة والرجوع. */
export default async function WordPage({
  params



}: {params: Promise<{categoryId: string;wordId: string;}>;}) {
  const { categoryId, wordId } = await params;

  const category = VOCABULARY_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) notFound();

  const index = category.words.findIndex((item) => item.id === wordId);
  if (index === -1) notFound();

  const overview = await getVocabularyOverview();

  return (
    <WordPageClient
      category={category}
      wordIndex={index}
      overview={overview} />);


}