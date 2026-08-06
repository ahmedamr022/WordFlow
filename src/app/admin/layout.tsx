import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlertIcon, ArrowLeftIcon, RefreshCwIcon } from "lucide-react";

import { HttpError } from "@/lib/auth/guards";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

/**
 * بوابة + شل Admin Studio.
 *
 * ما تغيّر في هذه الحزمة
 * ──────────────────────
 *  · **الشريط على الشمال بنظام ltr**: الشل الخارجي بقى `dir="ltr"` فالشريط
 *    أول عنصر ⇒ يظهر على الشمال. محتوى الشاشات نفسه محفوظ في حاوية
 *    `dir="rtl"` فكل صفحات الأدمن الحالية ما تتغيّرش.
 *
 *  · **اسكرول واحد**: الشل `h-screen overflow-hidden` وعمود المحتوى هو
 *    وحده `overflow-y-auto`. كان قبلها بارّين (الشريط + النافذة).
 *
 *  · **الشريط العلوي ثابت**: `sticky top-0` جوّا عمود المحتوى.
 *
 *  · بوابة الصلاحيات (401 / 403 / خطأ) زي ما هي — ما لمستهاش.
 */

export const metadata = {
  title: "WordFlow Admin Studio",
  robots: { index: false, follow: false }
};

function AdminGateScreen({
  title,
  message,
  hint




}: {title: string;message: string;hint?: string;}) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[#02070D] px-6 font-cairo text-slate-200"
      dir="rtl">
      
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#070C15] p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <span
          aria-hidden
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10">
          
          <ShieldAlertIcon className="h-7 w-7 text-amber-300" />
        </span>

        <h1 className="text-2xl font-black text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{message}</p>

        {hint &&
        <p className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-right text-[12.5px] leading-relaxed text-slate-500">
            {hint}
          </p>
        }

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.08]">
            
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            العودة للرئيسية
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-bold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/20">
            
            <RefreshCwIcon className="h-4 w-4" aria-hidden />
            إعادة المحاولة
          </Link>
        </div>
      </div>
    </div>);

}

export default async function AdminLayout({ children }: {children: React.ReactNode;}) {
  let identity;

  try {
    identity = await requireAdmin();
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;

    if (status === 401) redirect("/login");

    if (status === 403) {
      return (
        <AdminGateScreen
          title="لا تملك صلاحية الدخول"
          message="هذه اللوحة مخصصة لمديري المنصة. إن كنت تظن أن هذا خطأ فتحقق من دورك في قاعدة البيانات."
          hint={`للتفعيل: update public.profiles set role = 'admin' where id = '<user-uuid>';`} />);


    }

    console.error("[admin:layout]", err instanceof Error ? err.message : err);
    return (
      <AdminGateScreen
        title="تعذر التحقق من الصلاحيات"
        message="حدث عطل أثناء قراءة صلاحياتك. جرّب إعادة تحميل الصفحة، ولو تكرّر الأمر راجع سجل الخادم."
        hint="السبب الأشيع: SUPABASE_SERVICE_ROLE_KEY غير معرّف أو غير صالح في متغيرات البيئة." />);


  }

  return (
    // ltr ⇒ الشريط الجانبي أول عنصر ⇒ يظهر على الشمال.
    // h-screen + overflow-hidden ⇒ النافذة نفسها ما بتسكرولش ⇒ اسكرول واحد.
    <div
      dir="ltr"
      className="flex h-screen w-full overflow-hidden bg-[#02070D] font-cairo text-slate-200">
      
      <AdminSidebar />

      {/* عمود المحتوى: هو **الوحيد** اللي بيسكرول في الصفحة */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <AdminTopbar
          nickname={identity.nickname}
          role={identity.role}
          avatarUrl={identity.avatarUrl}
          notifications={0} />
        

        {/* محتوى الشاشات يفضل rtl زي ما هو مصمّم */}
        <main dir="rtl" className="min-w-0 flex-1 px-5 pb-10 pt-5">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>);

}