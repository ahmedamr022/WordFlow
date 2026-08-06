import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function ProfileLoading() {
  return <RouteSkeleton blocks={2} label="جارٍ تحميل ملفك…" />;
}