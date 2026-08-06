"use server";

import { isCurrentUserAdmin } from "@/lib/auth/admin";

/**
 * علم واجهة فقط: هل المستخدم الحالي أدمن؟
 *
 * سبب وجوده: `AppSidebar` مكوّن عميل يُستعمل في ثماني صفحات، وكانت كل صفحة
 * مطالَبة بتمرير `isAdmin` يدوياً — وصفحة واحدة فقط كانت تفعل، فاختفت بطاقة
 * «Admin Studio» في كل مكان آخر. هذا الـ action هو شبكة الأمان: لو لم تُمرَّر
 * القيمة كـ prop ولا عبر `AdminProvider`، يجلبها الشريط بنفسه مرة واحدة.
 *
 * لا يرمي أبداً ولا يكشف أي بيانات غير boolean واحد.
 */
export async function getIsAdminAction(): Promise<boolean> {
  try {
    return await isCurrentUserAdmin();
  } catch {
    return false;
  }
}