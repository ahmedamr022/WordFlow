"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Globe,
  ChevronDown,
  ChevronRight,
  User,
  Brain,
  Headphones,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function OnboardingNicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("onboarding_nickname");
      if (stored) {
        setNickname(stored);
      } else {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user?.user_metadata?.full_name) {
            setNickname(data.user.user_metadata.full_name);
          }
        });
      }
    }
  }, []);

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nickname.trim()) {
      setError("يرجى كتابة الاسم أو اللقب للمتابعة");
      return;
    }
    setError(null);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboarding_nickname", nickname.trim());
    }
    router.push("/onboarding/language");
  };

  return (
    <div
      className="relative w-screen h-screen min-h-[850px] overflow-hidden bg-[#030611] text-white flex flex-col justify-between p-6 lg:p-8 font-sans select-none"
      dir="ltr"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/login.png"
          alt="Background"
          className="w-full h-full object-cover object-center brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header - Language Switcher */}
      <header className="relative z-20 flex justify-end">
        <button
          type="button"
          className="flex items-center gap-2 bg-[#0d1322]/70 hover:bg-[#151c2e] border border-white/10 backdrop-blur-md rounded-full px-4.5 py-2.5 text-sm text-slate-200 transition-colors shadow-sm cursor-pointer"
          dir="rtl"
        >
          <Globe className="w-4 h-4 text-slate-300" />
          <span className="font-medium">العربية</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[1550px] mx-auto flex-1 flex flex-col justify-between py-2">
        {/* Top Section: ONBOARDING CARD ONLY */}
        <div className="flex flex-row items-center justify-start w-full flex-1 min-h-[580px]">
          {/* ==================== ONBOARDING NICKNAME CARD ==================== */}
          <div className="w-[440px] shrink-0 h-auto flex flex-col my-auto">
            <div className="bg-[#040711]/85 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
              
              <div className="flex flex-col items-center w-full">
                
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-9 h-9 shrink-0" viewBox="0 0 100 100" fill="none">
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
                  <span className="font-bold text-3xl tracking-tight text-white">
                    Word<span className="text-[#f43f5e]">Flow</span>
                  </span>
                </div>

                {/* Progress Stepper with 4 Dots */}
                <div className="relative flex items-center justify-between w-48 mb-8">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0" />
                  {/* Dot 1 (active) */}
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" />   
                  {/* Dot 2 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 3  */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 4  */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                </div>

                {/* Title & Subtitle */}
                <div className="text-center space-y-2 mb-8" dir="rtl">
                  <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                    <span>ما اسمك؟</span>
                    <span className="text-3xl">👋</span>
                  </h1>
                  <p className="text-sm text-slate-400 font-normal">
                    اختر اسماً يناديك به <span className="text-purple-400 font-medium">WordFlow</span>
                  </p>
                </div>

                {/* Form Input */}
                <form onSubmit={handleNext} className="w-full space-y-6" dir="rtl">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      الاسم المستعار
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => {
                          setNickname(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="مثال: أحمد"
                        className={`w-full bg-[#080d1e]/90 border ${
                          error ? "border-red-500" : "border-slate-800 focus:border-purple-500"
                        } rounded-xl pr-4 pl-11 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner`}
                        autoFocus
                      />
                      <User className="w-5 h-5 text-purple-400 absolute left-3 pointer-events-none" />
                    </div>

                    {/* Hint Text */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>سيظهر هذا الاسم في تجربتك داخل التطبيق</span>
                    </div>

                    {/* Error Message if empty */}
                    {error && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="relative w-full py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#00d2ff] via-[#7c3aed] to-[#f43f5e] hover:opacity-95 transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 absolute right-4" />
                    <span>التالي</span>
                  </button>
                </form>

              </div>

            </div>
          </div>
        </div>

        {/* ==================== BOTTOM 3 CARDS ==================== */}
        <div className="w-full max-w-[850px] ml-auto mr-[10%] mt-auto pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" dir="ltr">
            {/* Card 1: AI Feedback */}
            <div className="h-[130px] bg-[#070c1a]/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center transition-all hover:border-cyan-500/30">
              <Brain className="w-7 h-7 text-[#38bdf8] mb-1.5 shrink-0" />
              <h3 className="font-bold text-sm text-white mb-1">AI Feedback</h3>
              <p className="text-[11px] text-slate-300 leading-snug" dir="rtl">
                تغذية راجعة ذكية لتحسين كتابتك ونطقك
              </p>
            </div>

            {/* Card 2: Native Audio */}
            <div className="h-[130px] bg-[#070c1a]/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center transition-all hover:border-purple-500/30">
              <Headphones className="w-7 h-7 text-[#a855f7] mb-1.5 shrink-0" />
              <h3 className="font-bold text-sm text-white mb-1">Native Audio</h3>
              <p className="text-[11px] text-slate-300 leading-snug" dir="rtl">
                استمع للنطق الصحيح بجودة عالية
              </p>
            </div>

            {/* Card 3: +500 Stories */}
            <div className="h-[130px] bg-[#070c1a]/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center transition-all hover:border-pink-500/30">
              <BookOpen className="w-7 h-7 text-[#f43f5e] mb-1.5 shrink-0" />
              <h3 className="font-bold text-sm text-white mb-1">+500 Stories</h3>
              <p className="text-[11px] text-slate-300 leading-snug" dir="rtl">
                مئات القصص في مختلف المستويات
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Security Badge - Footer */}
      <footer className="relative z-10 flex justify-center pt-2 pb-1" dir="rtl">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>بياناتك آمنة معنا</span>
        </div>
      </footer>
    </div>
  );
}