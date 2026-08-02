"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft, Award } from "lucide-react";

export default function LevelOnboardingPage() {
  const router = useRouter();

  const handleSelectLevel = (level: string) => {
    localStorage.setItem("wordflow_level", level);
    router.push("/onboarding/nickname");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-white font-arabic dir-rtl">
      <div className="w-full max-w-lg p-8 rounded-3xl glass-card border border-border/50 text-center animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-3xl font-bold mb-2">مستواك في الإنجليزية؟</h1>
        <p className="text-sm text-muted-text mb-8">
          لنبدأ بالمحتوى الأكثر ملاءمة لك لتضمن أفضل رحلة تعلم.
        </p>

        {/* Auto Placement Test Banner */}
        <button
          onClick={() => router.push("/onboarding/auto-test")}
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-coral/20 via-secondary-teal/20 to-primary-peach/20 border border-secondary-teal/50 hover:border-secondary-teal transition-all hover:scale-[1.02] active:scale-95 text-right flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary-teal/20 text-secondary-teal">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="block font-bold text-white text-base">
                🔮 تحديد المستوى تلقائياً (اختبار ذكي)
              </span>
              <span className="text-xs text-muted-text">
                اختبار تكيفي سريع في دقائق يحدد مستواك بدقة في الإنجليزي
              </span>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-secondary-teal group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/40" />
          </div>
          <span className="relative px-4 bg-[#0a0a0f] text-xs text-muted-text">
            أو اختر مستواك يدويًا
          </span>
        </div>

        {/* Manual Options */}
        <div className="space-y-3">
          <button
            onClick={() => handleSelectLevel("A1")}
            className="w-full p-4 rounded-2xl bg-card-elevated hover:bg-card-elevated/80 border border-emerald-500/30 transition-all hover:scale-[1.01] text-right flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-white">مبتدئ</span>
              </div>
              <span className="text-xs text-muted-text mr-4">أبدأ من الصفر</span>
            </div>
            <Award className="w-5 h-5 text-emerald-400" />
          </button>

          <button
            onClick={() => handleSelectLevel("A2")}
            className="w-full p-4 rounded-2xl bg-card-elevated hover:bg-card-elevated/80 border border-blue-500/30 transition-all hover:scale-[1.01] text-right flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="font-bold text-white">متوسط</span>
              </div>
              <span className="text-xs text-muted-text mr-4">أعرف الأساسيات وأريد التطور</span>
            </div>
            <Award className="w-5 h-5 text-blue-400" />
          </button>

          <button
            onClick={() => handleSelectLevel("B1")}
            className="w-full p-4 rounded-2xl bg-card-elevated hover:bg-card-elevated/80 border border-purple-500/30 transition-all hover:scale-[1.01] text-right flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="font-bold text-white">متقدم</span>
              </div>
              <span className="text-xs text-muted-text mr-4">أقرأ الإنجليزية جيداً وأبحث عن الطلاقة</span>
            </div>
            <Award className="w-5 h-5 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
