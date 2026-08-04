"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  ChevronDown,
  ChevronRight,
  Brain,
  Headphones,
  BookOpen,
  ShieldCheck,
  Lock,
} from "lucide-react";

// مكونات SVG للأعلام
const Flags = {
  Egypt: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#f7fc" d="M0 0h640v480H0z" />
      <path fill="#c8102e" d="M0 0h640v160H0z" />
      <path fill="#000" d="M0 320h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <circle cx="320" cy="240" r="28" fill="#c69c3a" />
    </svg>
  ),
  UK: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M640 0 0 480" />
      <path stroke="#c8102e" strokeWidth="40" d="m0 0 640 480M640 0 0 480" />
      <path stroke="#fff" strokeWidth="100" d="M320 0v480M0 240h640" />
      <path stroke="#c8102e" strokeWidth="60" d="M320 0v480M0 240h640" />
    </svg>
  ),
  Spain: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#c8102e" d="M0 0h640v480H0z" />
      <path fill="#ffc400" d="M0 120h640v240H0z" />
    </svg>
  ),
  France: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#051440" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ec1920" d="M426.7 0H640v480H426.7z" />
    </svg>
  ),
};

interface LanguageOption {
  code: string;
  name: string;
  subName: string;
  FlagComponent: React.ComponentType;
  enabled: boolean;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "ar",
    name: "العربية",
    subName: "Arabic",
    FlagComponent: Flags.Egypt,
    enabled: true,
  },
  {
    code: "en",
    name: "English",
    subName: "English",
    FlagComponent: Flags.UK,
    enabled: false,
  },
  {
    code: "es",
    name: "Español",
    subName: "Spanish",
    FlagComponent: Flags.Spain,
    enabled: false,
  },
  {
    code: "fr",
    name: "Français",
    subName: "French",
    FlagComponent: Flags.France,
    enabled: false,
  },
];

export default function OnboardingLanguagePage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("ar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("onboarding_native_language");
      if (stored) setSelectedLang(stored);
    }
  }, []);

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboarding_native_language", selectedLang);
    }
    router.push("/onboarding/country");
  };

  return (
    <div
      className="relative w-screen h-screen min-h-[900px] overflow-hidden bg-[#030611] text-white flex flex-col justify-between p-6 lg:p-8 font-sans select-none"
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
        <div className="flex flex-row items-center justify-start w-full flex-1 min-h-[620px]">
          {/* ==================== ONBOARDING LANGUAGE CARD ==================== */}
          <div className="w-[440px] shrink-0 h-[640px] flex flex-col">
            <div className="h-full bg-[#040711]/85 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col justify-between">
              
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

                {/* Progress Stepper with 4 Dots (Dot #2 Active) */}
                <div className="relative flex items-center justify-between w-44 mb-6">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0" />
                  {/* Dot 1 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 2 (Active) */}
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" />
                  {/* Dot 3 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 4 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                </div>

                {/* Title & Subtitle */}
                <div className="text-center space-y-2 mb-6" dir="rtl">
                  <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                    <span>اختر لغتك</span>
                    <Globe className="w-7 h-7 text-[#a855f7]" />
                  </h1>
                  <p className="text-xs text-slate-400 font-normal">
                    اختر لغة التطبيق لتجربة تعلم مخصصة تناسبك
                  </p>
                </div>

                {/* Languages Selection List */}
                <div className="w-full space-y-3 mb-6">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    const isDisabled = !lang.enabled;
                    const FlagComponent = lang.FlagComponent;

                    return (
                      <div
                        key={lang.code}
                        onClick={() => {
                          if (lang.enabled) setSelectedLang(lang.code);
                        }}
                        className={`relative w-full rounded-2xl border transition-all ${
                          isDisabled
                            ? "bg-[#050813]/60 border-slate-800/80 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-[#080d1e] border-transparent p-[1px] bg-gradient-to-r from-[#00d2ff]/60 via-[#7c3aed]/60 to-[#f43f5e]/60 shadow-[0_0_20px_rgba(124,58,237,0.25)] cursor-pointer"
                            : "bg-[#070c18]/80 border-slate-800 hover:border-slate-700 cursor-pointer"
                        }`}
                      >
                        <div
                          className="w-full h-full bg-[#070c18] rounded-[14px] p-3.5 flex items-center justify-between"
                          dir="ltr"
                        >
                          {/* LEFT SIDE: Radio Circle + Text Label */}
                          <div className="flex items-center gap-3.5">
                            {/* Radio Dot */}
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                                isSelected
                                  ? "border-[#a855f7] bg-[#a855f7]/20 shadow-[0_0_10px_#a855f7]"
                                  : "border-slate-700 bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                              )}
                            </div>

                            {/* Language Name & Subtitle */}
                            <div className="text-right" dir="rtl">
                              <div className="text-sm font-bold text-white leading-tight">
                                {lang.name}
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                                {lang.subName}
                              </span>
                            </div>
                          </div>

                          {/* RIGHT SIDE: Flag + Badge */}
                          <div className="flex items-center gap-2.5">
                            {isDisabled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>قريباً</span>
                              </span>
                            )}
                            <FlagComponent />
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="relative w-full py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#00d2ff] via-[#7c3aed] to-[#f43f5e] hover:opacity-95 transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 absolute right-4" />
                  <span>التالي</span>
                </button>

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