import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function VocabularyLoading() {
  return <RouteSkeleton blocks={2} label="جارٍ تحميل الكلمات…" />;
}