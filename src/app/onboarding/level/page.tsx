"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { completeOnboardingAction } from "@/app/actions/auth";
import { purgeLegacyStorage } from "@/lib/storage/legacyKeys";
import type { CefrLevel } from "@/types/database";
import {
  Loader2,
  BarChart3,
  Sprout,
  Trees,
  Mountain,
} from "lucide-react";
import {
  AuthShell,
  AuthCard,
  WordFlowWordmark,
  OnboardingStepper,
  PrimaryButton,
} from "@/components/auth/AuthShell";

interface LevelOption {
  id: CefrLevel;
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

type DraftAnswers = {
  nickname: string;
  nativeLanguage: string;
  country: string;
};

function readDraft(): DraftAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const nickname = sessionStorage.getItem("onboarding_nickname")?.trim() ?? "";
    const nativeLanguage =
      sessionStorage.getItem("onboarding_native_language")?.trim() ?? "";
    const country = sessionStorage.getItem("onboarding_country")?.trim() ?? "";
    if (!nickname || !nativeLanguage || !country) return null;
    return { nickname, nativeLanguage, country };
  } catch {
    return null;
  }
}

export default function OnboardingLevelPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>("A1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Before: missing answers were silently replaced with "ar" / "EG", so a user
   * who deep-linked here got a profile filled with invented data and stamped
   * as complete. Now the funnel restarts at the first missing step.
   */
  useEffect(() => {
    if (!readDraft()) router.replace("/onboarding");
  }, [router]);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    const draft = readDraft();
    if (!draft) {
      router.replace("/onboarding");
      return;
    }

    const result = await completeOnboardingAction({
      nickname: draft.nickname,
      native_language: draft.nativeLanguage,
      country: draft.country,
      english_level: selectedLevel,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    try {
      sessionStorage.removeItem("onboarding_nickname");
      sessionStorage.removeItem("onboarding_native_language");
      sessionStorage.removeItem("onboarding_country");
    } catch {
      // storage may be disabled — not fatal
    }
    purgeLegacyStorage();

    // refresh() first so /dashboard renders against the freshly written flag,
    // otherwise ProtectedShell can read a cached "not onboarded" tree and
    // bounce straight back into onboarding.
    router.refresh();
    router.replace("/dashboard");
  };

  return (
    <AuthShell cardWidthClass="lg:w-[440px]" align="center">
      <AuthCard className="items-center bg-[#040711]/85 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="mb-6">
          <WordFlowWordmark />
        </div>

        <OnboardingStepper step={4} />

        <div className="mb-6 space-y-2 text-center" dir="rtl">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-extrabold text-white">
            <span>اختر مستواك</span>
            <BarChart3 className="h-7 w-7 text-purple-400" aria-hidden />
          </h1>
          <p className="text-xs font-normal text-slate-400">
            اختر المستوى المناسب لك لبدء رحلتك في تعلم الإنجليزية
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400"
            dir="rtl"
          >
            {error}
          </div>
        )}

        <div
          className="mb-6 w-full space-y-3"
          dir="ltr"
          role="radiogroup"
          aria-label="اختر مستواك"
        >
          {LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            const IconComponent = lvl.icon;

            return (
              <button
                key={lvl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                  isSelected
                    ? `bg-[#080d1e]/90 ${lvl.activeBorder}`
                    : "border-slate-800/80 bg-[#060a17]/60 hover:border-slate-700 hover:bg-[#080e21]/80"
                }`}
              >
                <div className="z-10 flex items-start gap-3.5 text-left">
                  <div
                    aria-hidden
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected ? lvl.radioGlow : "border-slate-600 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>

                  <div className="flex flex-col text-right" dir="rtl">
                    <span className="text-sm font-bold leading-snug text-white">
                      {lvl.titleAr}
                    </span>
                    <span
                      className="mb-1 text-[11px] font-medium text-slate-400"
                      dir="ltr"
                    >
                      {lvl.titleEn}
                    </span>
                    <span className="text-[10px] leading-tight text-slate-400">
                      {lvl.desc}
                    </span>
                  </div>
                </div>

                <div
                  className={`ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm ${lvl.iconBg}`}
                >
                  <IconComponent className={`h-5 w-5 stroke-[1.75] ${lvl.iconColor}`} />
                </div>
              </button>
            );
          })}
        </div>

        <PrimaryButton
          type="button"
          disabled={loading}
          onClick={() => void handleFinish()}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden />
          ) : (
            "التالي"
          )}
        </PrimaryButton>
      </AuthCard>
    </AuthShell>
  );
}