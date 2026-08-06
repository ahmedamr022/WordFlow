import React from "react";
import { AuthSkeleton } from "@/components/ui/route-skeleton";

/**
 * خطوات الـ onboarding كانت الأسوأ إحساساً: كل خطوة تنتظر
 * getSessionContext() (مصادقة + استعلام profiles) قبل أن يظهر أي شيء،
 * وبعض المسارات فيها إعادة توجيه على قفزتين. الهيكل هنا يُبثّ فوراً.
 */
export default function OnboardingLoading() {
  return <AuthSkeleton label="جارٍ تحميل الخطوة التالية…" />;
}