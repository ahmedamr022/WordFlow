"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  ChevronDown,
  ChevronRight,
  Brain,
  Headphones,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Check,
} from "lucide-react";

// مكونات SVG مصممة بحرفية للأعلام لضمان الدقة وتوافق التصميم
const Flags: Record<string, React.FC> = {
  EG: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#f7fc" d="M0 0h640v480H0z" />
      <path fill="#c8102e" d="M0 0h640v160H0z" />
      <path fill="#000" d="M0 320h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <circle cx="320" cy="240" r="28" fill="#c69c3a" />
    </svg>
  ),
  SA: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#007a3d" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M150 220h340v15H150zm60 40h220v10H210z" />
    </svg>
  ),
  AE: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#00732f" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#000" d="M0 320h640v160H0z" />
      <path fill="#ff0000" d="M0 0h160v480H0z" />
    </svg>
  ),
  KW: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#007a3d" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#ce1126" d="M0 320h640v160H0z" />
      <path fill="#000" d="M0 0l160 240L0 480z" />
    </svg>
  ),
  QA: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#8a1538" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M0 0h160l60 24-60 24 60 24-60 24 60 24-60 24 60 24-60 24 60 24-60 24 60 24-60 24 60 24-60 24 60 24-60 24 60 24-60 24H0z" />
    </svg>
  ),
  MA: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#c8102e" d="M0 0h640v480H0z" />
      <path stroke="#006233" strokeWidth="12" fill="none" d="M320 180l25 75h79l-64 46 25 75-65-47-65 47 25-75-64-46h79z" />
    </svg>
  ),
  DZ: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#006633" d="M0 0h320v480H0z" />
      <path fill="#fff" d="M320 0h320v480H320z" />
      <circle cx="320" cy="240" r="80" fill="#d21034" />
      <circle cx="340" cy="240" r="64" fill="#fff" />
    </svg>
  ),
  IQ: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#ce1126" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#000" d="M0 320h640v160H0z" />
      <path fill="#007a3d" d="M260 215h120v30H260z" />
    </svg>
  ),
  JO: () => (
    <svg className="w-7 h-5 rounded-sm shadow-sm shrink-0 overflow-hidden" viewBox="0 0 640 480">
      <path fill="#000" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#007a3d" d="M0 320h640v160H0z" />
      <path fill="#ce1126" d="M0 0l240 240L0 480z" />
    </svg>
  ),
  OTHER: () => (
    <div className="w-7 h-5 rounded-sm bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shrink-0">
      <Globe className="w-3.5 h-3.5 text-purple-300" />
    </div>
  ),
};

interface CountryOption {
  code: string;
  nameAr: string;
  nameEn: string;
}

const COUNTRIES: CountryOption[] = [
  { code: "EG", nameAr: "مصر", nameEn: "Egypt" },
  { code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia" },
  { code: "AE", nameAr: "الإمارات", nameEn: "UAE" },
  { code: "KW", nameAr: "الكويت", nameEn: "Kuwait" },
  { code: "QA", nameAr: "قطر", nameEn: "Qatar" },
  { code: "MA", nameAr: "المغرب", nameEn: "Morocco" },
  { code: "DZ", nameAr: "الجزائر", nameEn: "Algeria" },
  { code: "IQ", nameAr: "العراق", nameEn: "Iraq" },
  { code: "JO", nameAr: "الأردن", nameEn: "Jordan" },
  { code: "OTHER", nameAr: "دولة أخرى", nameEn: "Other" },
];

export default function OnboardingCountryPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState("EG");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("onboarding_country");
      if (stored) setSelectedCountry(stored);
    }
  }, []);

  // إغلاق القائمة المنسدلة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboarding_country", selectedCountry);
    }
    router.push("/onboarding/level");
  };

  const selectedObj = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];
  const SelectedFlag = Flags[selectedObj.code] || Flags.OTHER;

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
          {/* ==================== ONBOARDING COUNTRY CARD ==================== */}
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
                  {/* Dot 1 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 2 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 3 (Active) */}
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" />   
                  {/* Dot 4  */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                </div>

                {/* Title & Subtitle */}
                <div className="text-center space-y-2 mb-8" dir="rtl">
                  <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2.5">
                    <span>من أي بلد أنت؟</span>
                    <Globe className="w-7 h-7 text-purple-400" />
                  </h1>
                  <p className="text-sm text-slate-400 font-normal">
                    اختر بلدك لنقدم لك تجربة تعلم مخصصة تناسبك
                  </p>
                </div>

                {/* Form / Dropdown Container */}
                <div className="w-full space-y-6" dir="rtl">
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <label className="text-xs font-semibold text-slate-300 block">
                      البلد
                    </label>

                    {/* Dropdown Button */}
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className={`w-full bg-[#080d1e]/90 border ${
                        isOpen ? "border-cyan-500 shadow-[0_0_15px_rgba(0,210,255,0.15)]" : "border-slate-800 hover:border-slate-700"
                      } rounded-xl px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <SelectedFlag />
                        <span className="text-sm font-semibold text-white">{selectedObj.nameAr}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-cyan-400" : ""
                        }`}
                      />
                    </button>

                    {/* Custom Options List (Floating Dropdown Menu) */}
                    {isOpen && (
                      <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-[#070c1b] border border-slate-700/80 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                        {COUNTRIES.map((c) => {
                          const FlagComp = Flags[c.code] || Flags.OTHER;
                          const isSelected = c.code === selectedCountry;

                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c.code);
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-purple-900/30 text-white font-bold"
                                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <FlagComp />
                                <span>{c.nameAr}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Hint Text */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>سيظهر هذا البلد في إعدادات حسابك</span>
                    </div>
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