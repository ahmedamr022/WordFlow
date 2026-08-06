import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function StatsLoading() {
  return <RouteSkeleton blocks={3} label="جارٍ تحميل إحصائياتك…" />;
}