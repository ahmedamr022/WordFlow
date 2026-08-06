import React, { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول — WordFlow",
  description: "سجّل دخولك لمتابعة رحلتك في تعلم الإنجليزية."
};

/**
 * Server shell.
 *
 * LoginForm reads ?next= and ?error= with useSearchParams(), which forces the
 * subtree to be client-rendered. Without this Suspense boundary `next build`
 * fails prerendering with:
 *   "useSearchParams() should be wrapped in a suspense boundary at page /login"
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
      <div
        className="flex h-screen w-full items-center justify-center bg-[#030611] text-slate-400"
        aria-busy="true">
        
          جارٍ التحميل…
        </div>
      }>
      
      <LoginForm />
    </Suspense>);

}