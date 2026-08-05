;

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/app/actions/auth";

/** يُوصل إليها من /auth/confirm بعد verifyOtp بنوع recovery. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updatePasswordAction({ password, confirm });
      if (result.ok) {
        router.replace("/dashboard");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <main dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-slate-900">كلمة مرور جديدة</h1>
      <p className="mt-2 text-sm text-slate-600">
        8 أحرف على الأقل، وتحتوي على حرف ورقم.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            كلمة المرور الجديدة
          </label>
          <input
            id="password"
            type="password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-left outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
          
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-800">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirm"
            type="password"
            required
            dir="ltr"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-left outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
          
        </div>

        {error &&
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
          
          {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </form>
    </main>);

}