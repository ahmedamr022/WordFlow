import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function PathsLoading() {
  return <RouteSkeleton blocks={3} label="جارٍ تحميل المسارات…" />;
}