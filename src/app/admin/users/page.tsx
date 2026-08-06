import React from "react";
import { ActivityIcon, BookOpenIcon, UsersIcon, ZapIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getLevelDistribution, listUsers } from "@/lib/admin/queries";
import { Panel, StatCard } from "@/components/admin/ui/surfaces";
import { Donut } from "@/components/admin/ui/charts";
import { UsersTable } from "@/components/admin/UsersTable";
import type { AdminUserStatus } from "@/types/admin";

/**
 * المستخدمون.
 *
 * الفلاتر في الـ URL والصفحة تُبنى على السيرفر، فرابط «كل المستخدمين
 * المعلّقين» قابل للمشاركة والترقيم صحيح مهما كبرت القاعدة.
 */

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function asStatus(value: string): AdminUserStatus | "all" {
  return value === "active" || value === "inactive" || value === "suspended" ? value : "all";
}

export default async function AdminUsersPage({
  searchParams



}: {searchParams: Promise<Record<string, string | string[] | undefined>>;}) {
  const identity = await requireAdmin();
  const params = await searchParams;

  const single = (key: string): string =>
  Array.isArray(params[key]) ? String(params[key]?.[0] ?? "") : String(params[key] ?? "");

  const filters = {
    search: single("q"),
    level: single("level") || "all",
    status: asStatus(single("status"))
  };
  const page = Math.max(1, Number(single("page") || 1));

  const [result, distribution] = await Promise.all([
  listUsers({
    search: filters.search,
    level: filters.level,
    status: filters.status,
    page,
    pageSize: PAGE_SIZE
  }),
  getLevelDistribution()]
  );

  const recent = result.rows.
  filter((row) => row.joinedAt).
  slice().
  sort((a, b) => String(b.joinedAt).localeCompare(String(a.joinedAt))).
  slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
            <UsersIcon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">المستخدمون</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              إدارة ومتابعة جميع المستخدمين على المنصة
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="إجمالي المستخدمين"
              value={result.total}
              caption="كل الحسابات المسجّلة"
              icon={<UsersIcon className="h-5 w-5" />}
              tone="cyan" />

            <StatCard
              label="النشطون في هذه الصفحة"
              value={result.active}
              caption={`من ${result.rows.length} معروض`}
              icon={<ActivityIcon className="h-5 w-5" />}
              tone="purple" />

            <StatCard
              label="القصص المكتملة"
              value={result.storiesRead.toLocaleString("en-US")}
              caption="لمستخدمي هذه الصفحة"
              icon={<BookOpenIcon className="h-5 w-5" />}
              tone="gold" />

            <StatCard
              label="نقاط الخبرة"
              value={result.xpTotal.toLocaleString("en-US")}
              caption="مجموع XP المعروض"
              icon={<ZapIcon className="h-5 w-5" />}
              tone="pink" />

          </div>

          <UsersTable
            rows={result.rows}
            total={result.total}
            page={page}
            pageSize={PAGE_SIZE}
            filters={{ search: filters.search, level: filters.level, status: filters.status }}
            canManageRoles={identity.role === "owner"} />

        </div>

        <aside className="flex flex-col gap-4">
          <Panel title="توزيع المستخدمين حسب المستوى">
            <Donut
              centerLabel="إجمالي"
              slices={distribution.map((bucket) => ({
                label: `${bucket.level} ${bucket.label}`,
                value: bucket.count,
                color: bucket.color,
                caption: `${bucket.percent}%`
              }))} />

          </Panel>

          <Panel title="آخر التسجيلات">
            {recent.length === 0 ?
            <p className="text-[12.5px] text-slate-500">لا توجد تسجيلات حديثة في هذه الصفحة.</p> :

            <ul className="flex flex-col gap-3">
                {recent.map((user) =>
              <li key={user.id} className="flex items-center gap-3">
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-[#0B111C]">
                      {user.avatarUrl &&
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    aria-hidden />

                  }
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-bold text-slate-200">
                        {user.nickname}
                      </span>
                      <span className="font-en block truncate text-[11px] text-slate-500">
                        {user.email || "—"}
                      </span>
                    </span>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </aside>
      </div>
    </div>);

}