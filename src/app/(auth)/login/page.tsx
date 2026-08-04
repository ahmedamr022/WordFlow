"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Globe,
  Brain,
  Headphones,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // استقبال رسائل الخطأ من صفحة الـ OAuth Callback
  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !data.user) {
      setError("بيانات الدخول غير صحيحة. يرجى التأكد وإعادة المحاولة.");
      setLoading(false);
      return;
    }

    // التحقق من حالة الـ Profile للتحويل الذكي
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, country, native_language, english_level")
      .eq("id", data.user.id)
      .single();

    if (
      profile &&
      profile.nickname &&
      profile.country &&
      profile.native_language &&
      profile.english_level
    ) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding/nickname");
    }
    
    router.refresh();
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen min-h-[850px] overflow-hidden bg-[#030611] text-white flex flex-col justify-between p-6 lg:p-8 font-sans select-none"
      dir="ltr"
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/login.png"
          alt="Background"
          className="w-full h-full object-cover object-center brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <header className="relative z-20 flex justify-end">
        <button 
          type="button"
          className="flex items-center gap-2 bg-[#0d1322]/70 hover:bg-[#151c2e] border border-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm text-slate-200 transition-colors shadow-sm"
          dir="rtl"
        >
          <Globe className="w-4 h-4 text-slate-300" />
          <span>العربية</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </header>

      <main className="relative z-10 w-full max-w-[1500px] mx-auto flex-1 flex flex-col justify-between py-2">
        <div className="flex flex-row items-stretch justify-start gap-4 w-full flex-1 min-h-[680px]">
          
          <div className="w-[450px] shrink-0 h-full flex flex-col">
            <div className="h-full bg-[#050914]/55 backdrop-blur-2xl border border-white/10 hover:border-cyan-500/30 rounded-[28px] p-8 shadow-[0_0_35px_rgba(56,189,248,0.12)] transition-all duration-300 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none">
                    <defs>
                      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00d2ff" />
                        <stop offset="50%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M15 25 L35 75 L50 45 L65 75 L85 25"
                      stroke="url(#logoGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-extrabold text-3xl tracking-tight text-white">
                    Word<span className="text-[#f43f5e]">Flow</span>
                  </span>
                </div>

                <div className="mb-6 text-left">
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#a855f7] to-[#ec4899] flex items-center gap-2 mb-1.5">
                    Welcome Back <span className="text-2xl">👋</span>
                  </h1>
                  <p className="text-sm text-slate-300 font-normal text-left" dir="rtl">
                    أكمل رحلة تعلم الإنجليزية من حيث توقفت
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-end gap-2" dir="rtl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-200 block text-right" dir="rtl">
                      البريد الإلكتروني
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full bg-[#030712]/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-[#030712]/80 transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-200 block text-right" dir="rtl">
                      كلمة المرور
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#030712]/60 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-[#030712]/80 transition-all text-left tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1 flex-row-reverse">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 flex-row-reverse">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-[#7c3aed] text-white focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-[#7c3aed]"
                      />
                      <span>تذكرني</span>
                    </label>
                    <Link href="/forgot-password" className="text-[#a855f7] hover:text-[#c084fc] transition-colors">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-[#f43f5e] hover:opacity-95 transition-all shadow-lg shadow-indigo-500/25 relative flex items-center justify-center mt-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>تسجيل الدخول</span>}
                    <ChevronRight className="w-5 h-5 absolute right-4" />
                  </button>
                </form>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <span className="relative px-3 text-xs bg-[#070c18] text-slate-400 rounded-full">
                    أو
                  </span>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    className="w-full bg-[#030712]/50 hover:bg-[#0c1222] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 flex items-center justify-center relative transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                    </svg>
                    <span>متابعة باستخدام Google</span>
                    <ChevronRight className="w-5 h-5 text-slate-500 absolute right-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("github")}
                    className="w-full bg-[#030712]/50 hover:bg-[#0c1222] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 flex items-center justify-center relative transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current absolute left-4" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>متابعة باستخدام GitHub</span>
                    <ChevronRight className="w-5 h-5 text-slate-500 absolute right-4" />
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-slate-300 pt-3" dir="rtl">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-[#a855f7] font-bold hover:underline">
                  إنشاء حساب جديد
                </Link>
              </div>

            </div>
          </div>

          <div className="text-right space-y-4 pt-4 font-sans" dir="rtl">
            <p className="text-lg text-slate-100 font-medium flex items-center justify-start gap-2">
              <span>مرحباً بك مجدداً</span>
              <span className="text-2xl inline-block transform -rotate-12">👋</span>
            </p>

            <h2 className="text-5xl lg:text-6xl font-black leading-[1.2] text-white tracking-tight">
              اقرأ أكثر...
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#a855f7] to-[#e2e8f0]">
                وتحدث بثقة.
              </span>
            </h2>

            <p className="text-base text-slate-300 font-normal opacity-90 pt-1">
              قصص ملهمة، تعلم ذكي، تقدم مستمر
            </p>

            <div className="w-48 h-[3px] bg-gradient-to-r from-[#00d2ff] via-[#a855f7] to-[#ec4899] rounded-full mt-4 shadow-[0_0_12px_rgba(0,210,255,0.4)]" />
          </div>

        </div>

        <div className="w-full max-w-[780px] ml-auto mr-[10%] mt-auto pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" dir="ltr">
            <div className="h-[130px] bg-[#070c1a]/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center transition-all hover:border-cyan-500/30">
              <Brain className="w-7 h-7 text-[#38bdf8] mb-1.5 shrink-0" />
              <h3 className="font-bold text-base text-white mb-0.5">AI Feedback</h3>
              <p className="text-xs text-slate-300 leading-snug" dir="rtl">
                تغذية راجعة ذكية لتحسين كتابتك ونطقك
              </p>
            </div>

            <div className="h-[130px] bg-[#070c1a]/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center transition-all hover:border-purple-500/30">
              <Headphones className="w-7 h-7 text-[#a855f7] mb-1.5 shrink-0" />
              <h3 className="font-bold text-base text-white mb-0.5">Native Audio</h3>
              <p className="text-xs text-slate-300 leading-snug" dir="rtl">
                استمع للنطق الصحيح بجودة عالية
              </p>
            </div>

            <div className="h-[130px] bg-[#070c1a]/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center transition-all hover:border-pink-500/30">
              <BookOpen className="w-7 h-7 text-[#f43f5e] mb-1.5 shrink-0" />
              <h3 className="font-bold text-base text-white mb-0.5">+500 Stories</h3>
              <p className="text-xs text-slate-300 leading-snug" dir="rtl">
                مئات القصص في مختلف المستويات
              </p>
            </div>
          </div>
        </div>

      </main>

      <footer className="relative z-10 flex justify-center pt-2 pb-1" dir="rtl">
        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
          <span>بياناتك آمنة معنا</span>
        </div>
      </footer>
    </div>
  );
}