import React from "react";
import Link from "next/link";
import { HardDriveIcon, ImageIcon, LayersIcon, LightbulbIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { listMediaLibrary } from "@/lib/admin/queries";
import { Panel, StatCard } from "@/components/admin/ui/surfaces";
import { Donut } from "@/components/admin/ui/charts";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

/**
 * مكتبة الوسائط.
 *
 * «نظرة على التخزين» ليست رقماً للزينة: bucket التخزين له سقف، ومعرفة أين
 * يذهب الحجم (أغلفة ضخمة عادةً) هو ما يمنع امتلاءه فجأة.
 */

export const dynamic = "force-dynamic";

const ROLE_COLORS: Record<string, string> = {
  cover: "#a855f7",
  background: "#22d3ee",
  scene: "#34d399",
  modal: "#f59e0b"
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default async function AdminMediaPage({
  searchParams



}: {searchParams: Promise<Record<string, string | string[] | undefined>>;}) {
  await requireAdmin();
  const params = await searchParams;
  const single = (key: string): string =>
  Array.isArray(params[key]) ? String(params[key]?.[0] ?? "") : String(params[key] ?? "");

  const filters = { search: single("q"), role: single("role") || "all" };
  const library = await listMediaLibrary({ search: filters.search, role: filters.role });

  const linked = library.items.filter((item) => item.storyTitle).length;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-[#090F18]/70 px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
            <ImageIcon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-[24px] font-black text-white">مكتبة الوسائط</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              إدارة وتنظيم كل الملفات المستخدمة في القصص
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="إجمالي الملفات"
              value={library.items.length}
              caption={`${linked} مرتبطة بقصص`}
              icon={<ImageIcon className="h-5 w-5" />}
              tone="cyan" />

            <StatCard
              label="المساحة المستخدمة"
              value={formatBytes(library.totalBytes)}
              caption="لكل الملفات المعروضة"
              icon={<HardDriveIcon className="h-5 w-5" />}
              tone="purple" />

            <StatCard
              label="ملفات غير مرتبطة"
              value={library.items.length - linked}
              caption="مرشّحة للتنظيف"
              icon={<LayersIcon className="h-5 w-5" />}
              tone="gold" />

          </div>

          <MediaLibrary items={library.items} filters={filters} />
        </div>

        <aside className="flex flex-col gap-4">
          <Panel title="أنواع الملفات">
            <Donut
              centerLabel="ملف"
              slices={library.byRole.map((entry) => ({
                label: entry.label,
                value: entry.count,
                color: ROLE_COLORS[entry.role] ?? "#64748b"
              }))} />

          </Panel>

          <Panel title="آخر ما رُفع">
            {library.items.length === 0 ?
            <p className="text-[12.5px] text-slate-500">لا توجد ملفات بعد.</p> :

            <ul className="flex flex-col gap-3">
                {library.items.slice(0, 5).map((item) =>
              <li key={item.id} className="flex items-center gap-3">
                    <span className="h-9 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0B111C]">
                      <img
                    src={item.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                    aria-hidden />

                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-en block truncate text-[12px] font-bold text-slate-200">
                        {item.fileName}
                      </span>
                      <span className="block truncate text-[10.5px] text-slate-500">
                        {item.storyTitle ?? "غير مرتبطة"}
                      </span>
                    </span>
                  </li>
              )}
              </ul>
            }
          </Panel>

          <Panel title="نصائح سريعة">
            <p className="flex gap-2.5 text-[12px] leading-relaxed text-slate-400">
              <LightbulbIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
              ارفع الأغلفة بنسبة 16:9 على الأقل بعرض 1600px. الصور الأصغر
              تُمدّد في صفحة القصة وتبدو ضبابية، والاستوديو لن يستطيع إصلاحها.
            </p>

            <Link
              href="/admin/stories"
              className="mt-4 flex items-center justify-center rounded-xl border border-white/[0.07] bg-[#0B111C] py-2.5 text-[12.5px] font-bold text-slate-300 transition-colors hover:text-white">

              اربط الصور من داخل الاستوديو
            </Link>
          </Panel>
        </aside>
      </div>
    </div>);

}