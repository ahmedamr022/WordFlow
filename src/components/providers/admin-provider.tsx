"use client";


import React, { createContext, useContext } from "react";

/**
 * ناقل قيمة `isAdmin` من السيرفر إلى أي مكوّن عميل في الشجرة، بلا prop drilling
 * وبلا أي طلب إضافي.
 *
 * الاستخدام الموصى به — مرة واحدة في `src/app/layout.tsx` (Server Component):
 *
 * ```tsx
 * import { isCurrentUserAdmin } from "@/lib/auth/admin";
 * import { AdminProvider } from "@/components/providers/admin-provider";
 *
 * const isAdmin = await isCurrentUserAdmin();
 * return <AdminProvider value={isAdmin}>{children}</AdminProvider>;
 * ```
 *
 * القيمة `null` تعني «غير معروفة بعد» — عندها يتولّى `AppSidebar` جلبها
 * عبر `getIsAdminAction()`. فالنظام يعمل حتى لو لم تُركِّب الـ Provider أبداً.
 */
const AdminContext = createContext<boolean | null>(null);

export function AdminProvider({
  value,
  children



}: {value: boolean;children: React.ReactNode;}) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/** `true` / `false` إن كانت معروفة، و`null` إن لم يُركَّب الـ Provider. */
export function useIsAdmin(): boolean | null {
  return useContext(AdminContext);
}