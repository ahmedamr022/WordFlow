"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Globe,
  ChevronDown,
  ChevronRight,
  Brain,
  Headphones,
  BookOpen,
  ShieldCheck,
  Loader2,
  BarChart3,
  Sprout,
  Trees,
  Mountain,
} from "lucide-react";

interface LevelOption {
  id: string;
  titleAr: string;
  titleEn: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  activeBorder: string;
  radioGlow: string;
}

const LEVELS: LevelOption[] = [
  {
    id: "A1",
    titleAr: "مبتدئ",
    titleEn: "Beginner",
    desc: "للمبتدئين تماماً أو من لديهم معرفة بسيطة بالإنجليزي",
    icon: Sprout,
    iconBg: "bg-emerald-950/30 border-emerald-500/20",
    iconColor: "text-emerald-400",
    activeBorder: "border-[#a855f7]/80 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    radioGlow: "border-[#00d2ff] bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]",
  },
  {
    id: "B1",
    titleAr: "متوسط",
    titleEn: "Intermediate",
    desc: "لمن لديهم أساس جيد ويرغبون في تطوير مهاراتهم",
    icon: Trees,
    iconBg: "bg-cyan-950/30 border-cyan-500/20",
    iconColor: "text-cyan-400",
    activeBorder: "border-[#00d2ff]/80 shadow-[0_0_20px_rgba(0,210,255,0.2)]",
    radioGlow: "border-[#00d2ff] bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]",
  },
  {
    id: "C1",
    titleAr: "متقدم",
    titleEn: "Advanced",
    desc: "لمن لديهم مستوى عالٍ ويرغبون في إتقان اللغة",
    icon: Mountain,
    iconBg: "bg-purple-950/30 border-purple-500/20",
    iconColor: "text-purple-400",
    activeBorder: "border-[#f43f5e]/80 shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    radioGlow: "border-[#00d2ff] bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]",
  },
];

export default function OnboardingLevelPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // التأكد من تسجيل دخول المستخدم أولاً
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("جلسة التسجيل انتهت، يرجى تسجيل الدخول مجدداً");
        setLoading(false);
        return;
      }

      // قراءة جميع البيانات المجمعة من الخطوات السابقة من sessionStorage
      const nickname = sessionStorage.getItem("onboarding_nickname") || user.user_metadata?.full_name || "";
      const nativeLanguage = sessionStorage.getItem("onboarding_native_language") || "ar";
      const country = sessionStorage.getItem("onboarding_country") || "EG";

      // حفظ جميع البيانات دفعة واحدة في جدول profiles
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          nickname: nickname,
          native_language: nativeLanguage,
          country: country,
          english_level: selectedLevel,
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Supabase profile update failed details:", dbError.message, dbError.details, dbError.hint);
        setError("حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى");
        setLoading(false);
        return;
      }

      // تنظيف sessionStorage
      sessionStorage.removeItem("onboarding_nickname");
      sessionStorage.removeItem("onboarding_native_language");
      sessionStorage.removeItem("onboarding_country");

      // التوجيه إلى الداشبورد عند النجاح
      router.push("/dashboard");
      router.refresh();

    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("حدث خطأ غير متوقع.");
      setLoading(false);
    }
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
          {/* ==================== ONBOARDING LEVEL CARD ==================== */}
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
                  {/* Dot 3 */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-slate-700/80" />
                  {/* Dot 4 (Active) */}
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" />
                </div>

                {/* Title & Subtitle */}
                <div className="text-center space-y-2 mb-6" dir="rtl">
                  <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2.5">
                    <span>اختر مستواك</span>
                    <BarChart3 className="w-7 h-7 text-purple-400" />
                  </h1>
                  <p className="text-xs text-slate-400 font-normal">
                    اختر المستوى المناسب لك لبدء رحلتك في تعلم الإنجليزية
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="w-full p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium" dir="rtl">
                    {error}
                  </div>
                )}

                {/* Level Options Container - FORCED LTR Layout */}
                <div className="w-full space-y-3 mb-6" dir="ltr">
                  {LEVELS.map((lvl) => {
                    const isSelected = selectedLevel === lvl.id;
                    const IconComponent = lvl.icon;

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSelectedLevel(lvl.id)}
                        className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? `bg-[#080d1e]/90 ${lvl.activeBorder}`
                            : "bg-[#060a17]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#080e21]/80"
                        }`}
                      >
                        {/* Left Content (Radio + Text) */}
                        <div className="flex items-start gap-3.5 text-left z-10">
                          {/* Radio Button */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? lvl.radioGlow
                                : "border-slate-600 bg-transparent"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                            )}
                          </div>

                          {/* Text Container */}
                          <div className="flex flex-col text-right" dir="rtl">
                            <span className="text-sm font-bold text-white leading-snug">
                              {lvl.titleAr}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium mb-1" dir="ltr">
                              {lvl.titleEn}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-tight">
                              {lvl.desc}
                            </span>
                          </div>
                        </div>

                        {/* Right Content Icon Box */}
                        <div
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ml-3 backdrop-blur-sm ${lvl.iconBg}`}
                        >
                          <IconComponent className={`w-5 h-5 stroke-[1.75] ${lvl.iconColor}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinish}
                  className="relative w-full py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#00d2ff] via-[#7c3aed] to-[#f43f5e] hover:opacity-95 transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center cursor-pointer disabled:opacity-60"
                  dir="rtl"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <span>التالي</span>
                      <ChevronRight className="w-5 h-5 absolute right-4" />
                    </>
                  )}
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