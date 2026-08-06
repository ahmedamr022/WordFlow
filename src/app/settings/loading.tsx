import React from "react";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function SettingsLoading() {
  return <RouteSkeleton blocks={2} label="جارٍ تحميل الإعدادات…" />;
}