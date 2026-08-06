import React from "react";
import Link from "next/link";
import { DatabaseIcon, SettingsIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { listSettings } from "@/lib/admin/queries";
import { Panel } from "@/components/admin/ui/surfaces";
import { SettingsForm } from "@/components/admin/SettingsForm";

/**
 * إعدادات المنصة.
 *
 * كل قيمة هنا صف في `app_settings` تقرأه دوال SQL والواجهة معاً — تغيير XP
 * أو غلق التسجيل لا يحتاج ديبلوي.
 */

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const identity = await requireAdmin();
  const settings = await listSettings();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-500/25 bg-slate-500/10 text-slate-300">
            <SettingsIcon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">الإعدادات</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              التحكم في سلوك المنصة دون الحاجة لنشر نسخة جديدة
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <SettingsForm settings={settings} />

        <aside className="flex flex-col gap-4">
          <Panel title="حسابك">
            <ul className="flex flex-col gap-3 text-[12.5px]">
              <li className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-bold text-slate-400">
                  <UserIcon className="h-4 w-4" aria-hidden />
                  الاسم
                </span>
                <span className="font-bold text-slate-100">{identity.nickname}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0B111C] px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-bold text-slate-400">
                  <ShieldCheckIcon className="h-4 w-4" aria-hidden />
                  الدور
                </span>
                <span className="font-en font-bold text-cyan-300">{identity.role}</span>
              </li>
            </ul>

            <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-amber-200/90">
              تغيير أدوار المستخدمين متاح للمالك فقط من صفحة المستخدمين — أدمن
              يرقّي نفسه يعني تصعيد صلاحيات.
            </p>
          </Panel>

          <Panel title="مصدر الإعدادات">
            <p className="flex gap-2.5 text-[12px] leading-relaxed text-slate-400">
              <DatabaseIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
              كل إعداد صف في جدول <span className="font-en">app_settings</span>. لإضافة
              مفتاح جديد أضِفه في SQL وسيظهر هنا تلقائياً بالشكل المناسب لنوعه.
            </p>

            <Link
              href="/admin/activity?action=settings"
              className="mt-4 flex items-center justify-center rounded-xl border border-white/[0.07] bg-[#0B111C] py-2.5 text-[12.5px] font-bold text-slate-300 transition-colors hover:text-white">

              سجل تغييرات الإعدادات
            </Link>
          </Panel>
        </aside>
      </div>
    </div>);

}