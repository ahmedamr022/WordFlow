import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function ChallengesLoading() {
  return <RouteSkeleton blocks={2} label="جارٍ تحميل التحديات…" />;
}