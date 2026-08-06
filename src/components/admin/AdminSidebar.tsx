"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BarChart3Icon,
  BookOpenIcon,
  FlameIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PieChartIcon,
  ScrollTextIcon,
  SettingsIcon,
  UsersIcon } from
"lucide-react";

/**
 * شريط Admin Studio — النسخة المعاد تصميمها.
 *
 * المشاكل اللي اتصلّحت هنا
 * ────────────────────────
 *  ١) **الاتجاه**: الشريط كان على اليمين (`dir="rtl"` على الـ aside).
 *     بقى على **الشمال** بنظام `ltr` كما هو المطلوب — الأيقونة قبل النص.
 *     النص العربي نفسه بيفضل يتشكّل صح (`dir="auto"` على الليبل).
 *
 *  ٢) **الاسكرول المزدوج**: كان `sticky top-4` + `h-[calc(100vh-32px)]` +
 *     `overflow-y-auto` جوّا صفحة بتسكرول كذلك ⇒ اسكرول بارّين. دلوقتي
 *     الشريط عمود بارتفاع الشاشة جوّا شل `h-screen overflow-hidden`،
 *     وسكرول بارّه الداخلي مخفي بصرياً — فالمستخدم بيشوف بار واحد فقط.
 *
 *  ٣) **الأزرار المتأكّلة**: الفوتر كان جوّا نفس الفلكس اللي بيتقلّص فآخر
 *     زر بيتقص. دلوقتي الفوتر `shrink-0` والقائمة هي الوحيدة اللي بتسكرول
 *     (`min-h-0 flex-1`) — القاعدة الذهبية لأي عمود مرن.
 *
 *  ٤) **الوضوح**: العنصر النشط له شريط تحديد صريح على الحافة + خلفية أهدى،
 *     بدل تدرّج عريض كان بيخلي كل حاجة تبان نشطة. وكل عنصر له `title`
 *     يوضّح وظيفته — الأدمن مش لازم يخمّن.
 *
 *  ٥) **الطي**: زر طي حقيقي (٧٦px) محفوظ في localStorage.
 *
 *  ٦) شيلنا كارت «WordFlow Premium» من شريط الأدمن — مالوش أي معنى في
 *     لوحة تحكم، وكان بياخد ثلث المساحة ويزقّ الأزرار المهمة لبرّه.
 */

interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof HomeIcon;
  hint: string;
}

const NAV_GROUPS: {title: string | null;items: AdminNavItem[];}[] = [
{
  title: null,
  items: [
  { label: "لوحة التحكم", href: "/admin", icon: HomeIcon, hint: "نظرة عامة على المنصة" }]

},
{
  title: "المحتوى",
  items: [
  { label: "القصص", href: "/admin/stories", icon: BookOpenIcon, hint: "إنشاء وتحرير القصص" },
  { label: "التصنيفات", href: "/admin/categories", icon: FolderIcon, hint: "تصنيفات القصص" },
  { label: "مكتبة الوسائط", href: "/admin/media", icon: ImageIcon, hint: "رفع الصور وربطها بالقصص" }]

},
{
  title: "المستخدمون",
  items: [
  { label: "المستخدمون", href: "/admin/users", icon: UsersIcon, hint: "الحسابات والأدوار" },
  { label: "التقدم والتقارير", href: "/admin/progress", icon: BarChart3Icon, hint: "تقدم القراءة والمفردات" },
  { label: "النشاط", href: "/admin/activity", icon: ActivityIcon, hint: "آخر ما حدث على المنصة" }]

},
{
  title: "التحليلات",
  items: [
  { label: "تحليلات المنصة", href: "/admin/analytics", icon: PieChartIcon, hint: "أرقام الاستخدام" },
  { label: "القصص الشائعة", href: "/admin/analytics?view=popular", icon: FlameIcon, hint: "الأكثر قراءة" }]

},
{
  title: "النظام",
  items: [
  { label: "الإعدادات", href: "/admin/settings", icon: SettingsIcon, hint: "إعدادات المنصة" },
  { label: "سجل الأحداث", href: "/admin/activity?view=audit", icon: ScrollTextIcon, hint: "سجل تدقيق كامل" }]

}];


const STORAGE_KEY = "wf:admin:sidebar-collapsed";

export function AdminSidebar() {
  const pathname = usePathname();
  const view = useSearchParams().get("view");
  const [collapsed, setCollapsed] = React.useState(false);

  // تُقرأ بعد التركيب فقط — علشان مايحصلش hydration mismatch.
  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {

      /* localStorage مقفول — نكمّل بالافتراضي */}
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {

        /* تجاهل */}
      return next;
    });
  };

  return (
    <aside
      dir="ltr"
      aria-label="تنقل لوحة الأدمن"
      className={`relative flex h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#070A12] font-cairo transition-[width] duration-300 ease-out ${
      collapsed ? "w-[76px]" : "w-[252px]"}`
      }>
      
      {/* ── الهوية ─────────────────────────────────────────────────────── */}
      <div className="flex h-[68px] shrink-0 items-center gap-2.5 border-b border-white/[0.05] px-4">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60">
          
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden className="shrink-0">
            <defs>
              <linearGradient id="wf-admin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="50%" stopColor="#7000ff" />
                <stop offset="100%" stopColor="#ff007b" />
              </linearGradient>
            </defs>
            <path
              d="M6 10L14 30L20 17L26 30L34 10"
              stroke="url(#wf-admin-grad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round" />
            
          </svg>

          {!collapsed &&
          <span className="flex min-w-0 flex-col leading-none">
              <span className="font-en truncate text-[1.05rem] font-extrabold tracking-tight text-white">
                Word<span className="text-[#f43f5e]">F</span>low
              </span>
              <span className="font-en mt-1 truncate text-[0.58rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                Admin Studio
              </span>
            </span>
          }
        </Link>

        {!collapsed &&
        <button
          type="button"
          onClick={toggle}
          aria-label="طي الشريط الجانبي"
          title="طي الشريط الجانبي"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-slate-500 transition-colors hover:border-white/20 hover:text-white">
          
            <PanelLeftCloseIcon size={15} aria-hidden />
          </button>
        }
      </div>

      {collapsed &&
      <button
        type="button"
        onClick={toggle}
        aria-label="توسيع الشريط الجانبي"
        title="توسيع الشريط الجانبي"
        className="mx-auto mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-slate-500 transition-colors hover:border-white/20 hover:text-white">
        
          <PanelLeftOpenIcon size={15} aria-hidden />
        </button>
      }

      {/* ── القائمة: الوحيدة اللي بتسكرول، وسكرول بارها مخفي ───────────── */}
      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_GROUPS.map((group, groupIndex) =>
        <div key={group.title ?? `group-${groupIndex}`} className="flex flex-col gap-1">
            {group.title && !collapsed &&
          <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                {group.title}
              </p>
          }
            {group.title && collapsed &&
          <span className="mx-auto mb-1 h-px w-6 bg-white/[0.07]" aria-hidden />
          }

            {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, view, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? `${item.label} — ${item.hint}` : item.hint}
                className={`group relative flex items-center gap-3 rounded-[11px] py-2.5 text-[0.84rem] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
                collapsed ? "justify-center px-0" : "px-3"} ${

                active ?
                "bg-cyan-400/[0.09] text-white" :
                "text-[#8fa0b4] hover:bg-white/[0.04] hover:text-slate-100"}`
                }>
                
                  {/* شريط التحديد على الحافة — مؤشّر واحد لا يلتبس */}
                  <span
                  aria-hidden
                  className={`absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-300 transition-opacity ${
                  active ? "opacity-100" : "opacity-0"}`
                  } />
                
                  <Icon
                  size={17}
                  strokeWidth={2}
                  aria-hidden
                  className={`shrink-0 ${active ? "text-cyan-300" : "text-current"}`} />
                
                  {!collapsed &&
                <span dir="auto" className="truncate text-left">
                      {item.label}
                    </span>
                }
                </Link>);

          })}
          </div>
        )}
      </nav>

      {/* ── الفوتر: shrink-0 فما بيتأكلش أبداً ─────────────────────────── */}
      <div className="shrink-0 border-t border-white/[0.05] p-3">
        <Link
          href="/dashboard"
          title="العودة لتطبيق المستخدم"
          className={`flex items-center gap-2 rounded-[11px] border border-white/[0.07] py-2.5 text-[0.76rem] font-bold text-slate-400 outline-none transition-colors hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
          collapsed ? "justify-center px-0" : "px-3"}`
          }>
          
          <ArrowLeftIcon size={14} aria-hidden className="shrink-0" />
          {!collapsed &&
          <span dir="auto" className="truncate">
              العودة لتطبيق المستخدم
            </span>
          }
        </Link>
      </div>
    </aside>);

}

/**
 * الروابط التي تحمل `?view=` تعتمد على نفس المسار، فالمقارنة بالمسار وحده
 * تضيء عنصرين. هنا نقارن المسار أولاً ثم قيمة view لو كانت جزءاً من الرابط.
 */
function isActive(pathname: string, view: string | null, href: string): boolean {
  const [base, query] = href.split("?");
  const samePath =
  base === "/admin" ?
  pathname === "/admin" :
  pathname === base || pathname.startsWith(`${base}/`);

  if (!samePath) return false;

  const wanted = query ? new URLSearchParams(query).get("view") : null;
  return (view ?? null) === wanted;
}

export default AdminSidebar;