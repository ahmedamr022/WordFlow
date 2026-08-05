;

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";

/**
 * الصفحة كانت مفقودة رغم وجود لينك لها في شاشة الدخول.
 * الرسالة موحّدة دائماً بغض النظر عن وجود الإيميل — منع تعداد الحسابات.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await requestPasswordResetAction({ email });
      setSent(true);
    });
  }

  return (
    <main dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-slate-900">استعادة كلمة المرور</h1>

      {sent ?
      <div
        role="status"
        className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        
          لو كان هذا البريد مسجّلاً عندنا، هتلاقي رسالة فيها رابط إعادة تعيين كلمة المرور خلال دقائق.
          راجع مجلد الرسائل غير المرغوب فيها لو ما وصلتش.
        </div> :

      <>
          <p className="mt-2 text-sm text-slate-600">
            اكتب بريدك الإلكتروني وهنبعتلك رابطاً لتعيين كلمة مرور جديدة.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-800">
                البريد الإلكتروني
              </label>
              <input
              id="email"
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-left outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
            
            </div>
            <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
            
              {pending ? "جارٍ الإرسال..." : "إرسال الرابط"}
            </button>
          </form>
        </>
      }

      <Link href="/login" className="mt-6 text-sm text-slate-600 underline underline-offset-4">
        الرجوع لتسجيل الدخول
      </Link>
    </main>);

}