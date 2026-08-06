import React from "react";

import { getVocabularyOverview } from "@/lib/vocabulary/data";
import VocabularyPageClient from "./VocabularyPageClient";

/**
 * Server Component: قراءة واحدة من الداتابيز ثم props.
 * كل الحالة التفاعلية في `VocabularyPageClient`.
 */
export default async function VocabularyPage() {
  const overview = await getVocabularyOverview();
  return <VocabularyPageClient overview={overview} />;
}