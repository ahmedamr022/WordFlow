import React from "react";
import Link from "next/link";
import {
  ActivityIcon,
  BookOpenIcon,
  FolderIcon,
  ImageIcon,
  LockIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon } from
"lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { listActivity } from "@/lib/admin/queries";
import { Panel, EmptyState } from "@/components/admin/ui/surfaces";

/**
 * سجل الأحداث.
 *
 * `?view=audit` يعرض نفس البيانات بشكل جدول تدقيق (من فعل ماذا ومتى) بدل
 * الخط الزمني — نفس المصدر، قراءتان مختلفتان: واحدة للمتابعة اليومية وواحدة
 * للمراجعة.
 */

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "story.created": "تم إنشاء قصة",
  "story.published": "تم نشر/تحديث قصة",
  "story.draft": "تحويل قصة لمسودة",
  "story.locked": "تم قفل قصة",
  "story.unlocked": "تم فتح قصة",
  "story.duplicated": "تم تكرار قصة",
  "story.deleted": "تم حذف قصة",
  "story.version_restored": "استعادة إصدار سابق",
  "media.uploaded": "تم رفع ملف",
  "media.deleted": "تم حذف ملف",
  "category.created": "تصنيف جديد",
  "category.updated": "تحديث تصنيف",
  "category.deleted": "حذف تصنيف",
  "user.role_changed": "تغيير دور مستخدم",
  "user.suspended": "تعليق حساب",
  "user.restored": "استعادة حساب",
  "user.level_changed": "تعديل مستوى مستخدم",
  "settings.updated": "تحديث الإعدادات"
};

const ACTION_ICON: Record<string, React.ReactNode> = {
  story: <BookOpenIcon className="h-3.5 w-3.5" />,
  media: <ImageIcon className="h-3.5 w-3.5" />,
  category: <FolderIcon className="h-3.5 w-3.5" />,
  user: <UserIcon className="h-3.5 w-3.5" />,
  settings: <SettingsIcon className="h-3.5 w-3.5" />
};

const FILTERS = [
{ value: "all", label: "كل الأحداث" },
{ value: "story", label: "القصص" },
{ value: "media", label: "الوسائط" },
{ value: "category", label: "التصنيفات" },
{ value: "user", label: "المستخدمون" },
{ value: "settings", label: "الإعدادات" }];


function iconFor(action: string): React.ReactNode {
  if (action.startsWith("story.locked") || action.startsWith("story.unlocked")) {
    return <LockIcon className="h-3.5 w-3.5" />;
  }
  if (action.endsWith(".deleted")) return <TrashIcon className="h-3.5 w-3.5" />;
  if (action === "story.published") return <ShieldCheckIcon className="h-3.5 w-3.5" />;
  return ACTION_ICON[action.split(".")[0]] ?? <ActivityIcon className="h-3.5 w-3.5" />;
}

function formatFull(iso: string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.round(hours / 24)} يوم`;
}

export default async function AdminActivityPage({
  searchParams



}: {searchParams: Promise<Record<string, string | string[] | undefined>>;}) {
  await requireAdmin();
  const params = await searchParams;
  const single = (key: string): string =>
  Array.isArray(params[key]) ? String(params[key]?.[0] ?? "") : String(params[key] ?? "");

  const filter = single("action") || "all";
  const audit = single("view") === "audit";
  const entries = await listActivity(audit ? 120 : 60, filter);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
            {audit ?
            <ScrollTextIcon className="h-6 w-6" aria-hidden /> :

            <ActivityIcon className="h-6 w-6" aria-hidden />
            }
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">
              {audit ? "سجل التدقيق" : "النشاط"}
            </h1>
            <p className="mt-1 text-[13px] text-slate-400">
              {audit ?
              "كل عملية إدارية: من نفّذها، على ماذا، ومتى" :
              "آخر ما تغيّر في المنصة"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B111C] p-1">
          <Link
            href={`/admin/activity${filter === "all" ? "" : `?action=${filter}`}`}
            aria-current={!audit ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
            !audit ?
            "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/35" :
            "text-slate-400 hover:text-white"}`
            }>

            الخط الزمني
          </Link>
          <Link
            href={`/admin/activity?view=audit${filter === "all" ? "" : `&action=${filter}`}`}
            aria-current={audit ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
            audit ?
            "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/35" :
            "text-slate-400 hover:text-white"}`
            }>

            جدول التدقيق
          </Link>
        </div>
      </section>

      <nav
        className="flex flex-wrap items-center gap-2"
        aria-label="تصفية حسب نوع الحدث">

        {FILTERS.map((item) =>
        <Link
          key={item.value}
          href={`/admin/activity?${new URLSearchParams({
            ...(audit ? { view: "audit" } : {}),
            ...(item.value === "all" ? {} : { action: item.value })
          }).toString()}`}
          aria-current={filter === item.value ? "page" : undefined}
          className={`rounded-xl border px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
          filter === item.value ?
          "border-cyan-400/35 bg-cyan-500/12 text-cyan-200" :
          "border-white/[0.07] bg-[#0B111C] text-slate-400 hover:text-white"}`
          }>

            {item.label}
          </Link>
        )}
      </nav>

      <Panel title={audit ? `${entries.length} حدث` : "الخط الزمني"} padded={!audit}>
        {entries.length === 0 ?
        <EmptyState
          title="لا يوجد نشاط بعد"
          description="كل تعديل على القصص أو الوسائط أو المستخدمين سيُسجَّل هنا تلقائياً." /> :

        audit ?
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right">
              <thead>
                <tr className="border-b border-white/[0.05] text-[11.5px] font-bold text-slate-500">
                  <th scope="col" className="px-5 py-3">الحدث</th>
                  <th scope="col" className="px-5 py-3">العنصر</th>
                  <th scope="col" className="px-5 py-3">المنفّذ</th>
                  <th scope="col" className="px-5 py-3">الوقت</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {entries.map((entry) =>
              <tr key={entry.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5 text-[12.5px] font-bold text-slate-200">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0B111C] text-cyan-300">
                          {iconFor(entry.action)}
                        </span>
                        {ACTION_LABEL[entry.action] ?? entry.action}
                      </span>
                    </td>
                    <td className="font-en max-w-[240px] truncate px-5 py-3 text-[12px] text-slate-400">
                      {entry.label || entry.entityId || "—"}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-slate-300">{entry.actorName}</td>
                    <td className="font-en px-5 py-3 text-[11.5px] text-slate-500">
                      {formatFull(entry.createdAt)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div> :

        <ol className="relative flex flex-col gap-1 pr-4">
            <span
            className="absolute bottom-2 right-[15px] top-2 w-px bg-white/[0.07]"
            aria-hidden />

            {entries.map((entry) =>
          <li key={entry.id} className="relative flex items-start gap-3.5 py-2.5">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B111C] text-cyan-300">
                  {iconFor(entry.action)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-slate-200">
                    {ACTION_LABEL[entry.action] ?? entry.action}
                  </span>
                  <span className="font-en block truncate text-[11.5px] text-slate-500">
                    {entry.label || entry.entityId || "—"}
                  </span>
                </span>

                <span className="shrink-0 text-left text-[11px] text-slate-600">
                  <span className="block">{entry.actorName}</span>
                  <span className="block">{relativeTime(entry.createdAt)}</span>
                </span>
              </li>
          )}
          </ol>
        }
      </Panel>
    </div>);

}