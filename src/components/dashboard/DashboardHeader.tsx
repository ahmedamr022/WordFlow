import React from "react";
import { AppShellHeader } from "@/components/layout/app-shell-header";

/**
 * غلاف رفيع فوق `AppShellHeader`.
 *
 * الداشبورد تقرأ الاسم والمستوى والستريك على السيرفر مرة واحدة، فتمرَّر هنا
 * كـ props ولا ينفّذ الهيدر أي طلب إضافي (كان يستدعي useProfileSummary مرة
 * ثانية لنفس البيانات).
 *
 * `showSearch={false}`: صندوق البحث في شريط الداشبورد لم يكن مربوطاً بأي
 * فلترة على الصفحة — أُزيل بدل الإيحاء بوظيفة غير موجودة.
 */
export interface DashboardHeaderProps {
  nickname: string;
  level: string;
  avatarUrl?: string | null;
  streak: number;
  notificationCount?: number;
}

export function DashboardHeader({
  nickname,
  level,
  avatarUrl,
  streak,
  notificationCount
}: DashboardHeaderProps) {
  return (
    <AppShellHeader
      username={nickname}
      level={level}
      avatarUrl={avatarUrl ?? undefined}
      streak={streak}
      notificationCount={notificationCount}
      showSearch={false} />);


}

export default DashboardHeader;