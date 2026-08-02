"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowLeft } from "lucide-react";

export default function LanguageOnboardingPage() {
  const router = useRouter();

  const handleSelectLanguage = (lang: string) => {
    localStorage.setItem("wordflow_native_lang", lang);
    router.push("/onboarding/level");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-white font-arabic dir-rtl">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/50 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-primary-coral/10 text-primary-coral flex items-center justify-center mx-auto mb-6">
          <Globe className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold mb-2">ما هي لغتك الأساسية؟</h1>
        <p className="text-sm text-muted-text mb-8">
          اختر لغتك الأم ليتم عرض التراجم والشروحات بها.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleSelectLanguage("ar")}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card-elevated hover:bg-primary-coral/20 border border-primary-coral/30 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇵🇸</span>
              <span className="font-bold text-lg text-white">العربية</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-primary-coral group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="p-4 rounded-2xl bg-card/40 border border-border/30 opacity-60 text-right cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇸</span>
                <span className="font-bold text-gray-400">Español</span>
              </div>
              <span className="text-xs bg-card-elevated px-2.5 py-1 rounded-full text-muted-text">
                قريباً
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
