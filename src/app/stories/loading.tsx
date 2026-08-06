import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function StoriesLoading() {
  return <RouteSkeleton blocks={3} label="جارٍ تحميل القصص…" />;
}