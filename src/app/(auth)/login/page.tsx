"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("wordflow_user_email", email);
    localStorage.setItem("wordflow_user_logged", "true");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#07090e] text-white font-arabic dir-rtl selection:bg-[#ff6b6b]">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size="lg" />
          <h1 className="text-3xl font-extrabold text-white mt-3 font-sans">تسجيل الدخول</h1>
          <p className="text-xs text-slate-400 mt-1">مرحباً بعودتك إلى WordFlow! واصل رحلة التعلم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-4 pl-12 rounded-2xl bg-slate-900 border border-slate-800 text-white font-sans focus:outline-none focus:border-sky-400 transition-all text-left dir-ltr"
              />
              <Mail className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 pl-12 rounded-2xl bg-slate-900 border border-slate-800 text-white font-sans focus:outline-none focus:border-sky-400 transition-all text-left dir-ltr"
              />
              <Lock className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 p-4 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] hover:from-[#ff8585] hover:to-[#ffb394] font-bold text-white transition-all shadow-lg shadow-[#ff6b6b]/20 active:scale-95 mt-6"
          >
            <span>الدخول للحساب</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          ليس لديك حساب بعد؟{" "}
          <Link href="/register" className="text-sky-400 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
