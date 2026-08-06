"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Lock,
} from "lucide-react";
import {
  AuthShell,
  AuthCard,
  WordFlowWordmark,
  OnboardingStepper,
  PrimaryButton,
} from "@/components/auth/AuthShell";

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
    <AuthShell cardWidthClass="lg:w-[440px]" align="center">
      <AuthCard className="items-center bg-[#040711]/85 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="mb-6">
          <WordFlowWordmark />
        </div>

        <OnboardingStepper step={2} />

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
        <PrimaryButton type="button" onClick={handleNext}>
          التالي
        </PrimaryButton>
      </AuthCard>
    </AuthShell>
  );
}