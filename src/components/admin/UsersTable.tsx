"use client";

import React, { useState, useTransition } from "react";
import {
  BanIcon,
  GraduationCapIcon,
  MoreVerticalIcon,
  ShieldCheckIcon,
  UndoIcon } from
"lucide-react";

import {
  setUserLevelAction,
  setUserRoleAction,
  setUserSuspendedAction } from
"@/app/actions/admin/users";
import { CEFR_LEVELS, levelColor, levelLabel } from "@/lib/admin/level";
import { DataToolbar, Pagination } from "@/components/admin/ui/DataToolbar";
import { EmptyState } from "@/components/admin/ui/surfaces";
import { USER_STATUS_LABELS, type AdminUserRow } from "@/types/admin";

/**
 * جدول المستخدمين.
 *
 * الفلاتر والترقيم على السيرفر (قوائم المستخدمين تكبر بلا سقف)، والإجراءات
 * محافظة عن قصد: تعليق قابل للتراجع وتعديل مستوى — لا حذف حسابات من الواجهة.
 */

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  inactive: "border-slate-500/35 bg-slate-500/10 text-slate-400",
  suspended: "border-rose-500/35 bg-rose-500/10 text-rose-300"
};

function relativeTime(iso: string | null): string {
  if (!iso) return "لم يدخل بعد";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.round(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(iso));
}

export function UsersTable({
  rows,
  total,
  page,
  pageSize,
  filters,
  canManageRoles







}: {rows: AdminUserRow[];total: number;page: number;pageSize: number;filters: {search: string;level: string;status: string;};canManageRoles: boolean;}) {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [message, setMessage] = useState<{tone: "ok" | "error";text: string;} | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (task: () => Promise<{ok: boolean;error?: string;}>, okText: string) => {
    setMenuFor(null);
    startTransition(async () => {
      const result = await task();
      setMessage(
        result.ok ?
        { tone: "ok", text: okText } :
        { tone: "error", text: result.error ?? "تعذر تنفيذ العملية" }
      );
    });
  };

  return (
    <section className="rounded-[18px] border border-white/[0.06] bg-[#090F18]/85">
      <DataToolbar
        searchValue={filters.search}
        searchPlaceholder="ابحث بالاسم..."
        filters={[
        {
          name: "level",
          value: filters.level || "all",
          ariaLabel: "تصفية حسب المستوى",
          options: [
          { value: "all", label: "جميع المستويات" },
          ...CEFR_LEVELS.map((level) => ({
            value: level,
            label: `${level} — ${levelLabel(level)}`
          }))]

        },
        {
          name: "status",
          value: filters.status || "all",
          ariaLabel: "تصفية حسب الحالة",
          options: [
          { value: "all", label: "جميع الحالات" },
          { value: "active", label: "نشط" },
          { value: "inactive", label: "غير نشط" },
          { value: "suspended", label: "معلّق" }]

        }]
        } />


      {message &&
      <p
        role="status"
        className={`mx-4 mt-3 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-bold ${
        message.tone === "ok" ?
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
        "border-rose-500/30 bg-rose-500/10 text-rose-200"}`
        }>

          {message.text}
        </p>
      }

      {rows.length === 0 ?
      <EmptyState
        title="لا يوجد مستخدمون مطابقون"
        description="جرّب تغيير الفلاتر أو كلمة البحث." /> :


      <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-right">
            <thead>
              <tr className="border-b border-white/[0.05] text-[11.5px] font-bold text-slate-500">
                <th scope="col" className="px-5 py-3">المستخدم</th>
                <th scope="col" className="px-5 py-3">المستوى</th>
                <th scope="col" className="px-5 py-3">القصص المكتملة</th>
                <th scope="col" className="px-5 py-3">نقاط الخبرة</th>
                <th scope="col" className="px-5 py-3">آخر نشاط</th>
                <th scope="col" className="px-5 py-3">الحالة</th>
                <th scope="col" className="px-5 py-3 text-left">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((user) =>
            <tr key={user.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-[#0B111C]">
                        {user.avatarUrl &&
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      aria-hidden />

                    }
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[13.5px] font-bold text-white">
                          {user.nickname}
                        </span>
                        <span className="font-en truncate text-[11.5px] text-slate-500">
                          {user.email || user.id.slice(0, 8)}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="flex flex-col items-start gap-0.5">
                      <span
                    className="font-en rounded-md border px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      borderColor: `${levelColor(user.englishLevel)}55`,
                      background: `${levelColor(user.englishLevel)}18`,
                      color: levelColor(user.englishLevel)
                    }}>

                        {user.englishLevel}
                      </span>
                      <span className="text-[10.5px] text-slate-500">
                        {levelLabel(user.englishLevel)}
                      </span>
                    </span>
                  </td>

                  <td className="font-en px-5 py-3.5 text-[13px] font-bold text-slate-200">
                    {user.storiesCompleted}
                  </td>

                  <td className="font-en px-5 py-3.5 text-[13px] font-bold text-amber-300">
                    {user.xp.toLocaleString("en-US")}
                  </td>

                  <td className="px-5 py-3.5 text-[12px] text-slate-400">
                    {relativeTime(user.lastActiveAt)}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11.5px] font-bold ${
                  STATUS_STYLES[user.status]}`
                  }>

                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                      {USER_STATUS_LABELS[user.status]}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-left">
                    <div className="relative inline-block">
                      <button
                    type="button"
                    disabled={pending}
                    aria-label={`إجراءات ${user.nickname}`}
                    aria-expanded={menuFor === user.id}
                    onClick={() => setMenuFor(menuFor === user.id ? null : user.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition-colors hover:text-white disabled:opacity-40">

                        <MoreVerticalIcon className="h-4 w-4" />
                      </button>

                      {menuFor === user.id &&
                  <div className="absolute left-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B111C] py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                          <p className="px-3.5 pb-1 pt-1 text-[10.5px] font-black uppercase tracking-wider text-slate-600">
                            تعديل المستوى
                          </p>
                          <div className="flex flex-wrap gap-1 px-3 pb-2">
                            {CEFR_LEVELS.map((level) =>
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                        run(
                          () => setUserLevelAction(user.id, level),
                          `تم ضبط مستوى ${user.nickname} على ${level}`
                        )
                        }
                        className={`font-en rounded-md border px-2 py-1 text-[11px] font-bold transition-colors ${
                        user.englishLevel === level ?
                        "border-cyan-400/40 bg-cyan-500/15 text-cyan-200" :
                        "border-white/[0.07] text-slate-400 hover:text-white"}`
                        }>

                                {level}
                              </button>
                      )}
                          </div>

                          <button
                      type="button"
                      onClick={() =>
                      run(
                        () =>
                        setUserSuspendedAction(user.id, user.status !== "suspended"),
                        user.status === "suspended" ?
                        "تم استعادة الحساب" :
                        "تم تعليق الحساب"
                      )
                      }
                      className="flex w-full items-center gap-2.5 border-t border-white/[0.05] px-3.5 py-2 text-right text-[12.5px] font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white">

                            {user.status === "suspended" ?
                      <>
                                <UndoIcon className="h-3.5 w-3.5" aria-hidden />
                                استعادة الحساب
                              </> :

                      <>
                                <BanIcon className="h-3.5 w-3.5 text-rose-300" aria-hidden />
                                تعليق الحساب
                              </>
                      }
                          </button>

                          {canManageRoles &&
                    <button
                      type="button"
                      onClick={() =>
                      run(
                        () =>
                        setUserRoleAction(
                          user.id,
                          user.role === "admin" ? "user" : "admin"
                        ),
                        user.role === "admin" ?
                        "تم إلغاء صلاحية الأدمن" :
                        "تمت الترقية إلى أدمن"
                      )
                      }
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-right text-[12.5px] font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white">

                              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden />
                              {user.role === "admin" ? "إلغاء صلاحية الأدمن" : "ترقية إلى أدمن"}
                            </button>
                    }

                          {!canManageRoles &&
                    <p className="flex items-center gap-2 px-3.5 py-2 text-[11px] text-slate-600">
                              <GraduationCapIcon className="h-3.5 w-3.5" aria-hidden />
                              تغيير الأدوار للمالك فقط
                            </p>
                    }
                        </div>
                  }
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      <Pagination page={page} pageSize={pageSize} total={total} unit="مستخدم" />
    </section>);

}