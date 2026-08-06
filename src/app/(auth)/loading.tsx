import React from "react";
import { AuthSkeleton } from "@/components/ui/route-skeleton";

/**
 * هذا الملف تحديداً هو حل الشكوى ٦.١: الانتقال إلى /login أو /register كان
 * يبدو متجمداً لأن Next ينتظر رندر السيرفر بالكامل بلا أي بديل مؤقت.
 */
export default function AuthLoading() {
  return <AuthSkeleton label="جارٍ تحميل صفحة الدخول…" />;
}