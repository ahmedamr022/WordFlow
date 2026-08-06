import React from "react";
import { notFound } from "next/navigation";

import { getVocabularyOverview } from "@/lib/vocabulary/data";
import { VOCABULARY_CATEGORIES } from "@/data/vocabularyData";
import CategoryPageClient from "./CategoryPageClient";

/**
 * صفحة فئة واحدة — صارت مساراً حقيقياً بدل حالة محلية داخل شاشة المفردات.
 * فائدتها العملية: زر الرجوع يعمل، الرابط قابل للمشاركة، والحالة لا تضيع
 * عند تحديث الصفحة.
 */

export default async function CategoryPage({
  params



}: {params: Promise<{categoryId: string;}>;}) {
  const { categoryId } = await params;
  const category = VOCABULARY_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) notFound();

  const overview = await getVocabularyOverview();

  return <CategoryPageClient category={category} overview={overview} />;
}