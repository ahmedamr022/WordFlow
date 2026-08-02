"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Sparkles, ArrowLeft } from "lucide-react";

export default function NicknameOnboardingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("warm_dusk1679");

  const generateRandomNickname = () => {
    const prefixes = ["steady", "swift", "clever", "bright", "calm", "warm"];
    const suffixes = ["learner", "word", "mind", "dusk", "flow", "reader"];
    const num = Math.floor(1000 + Math.random() * 9000);
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    setNickname(`${p}_${s}${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    localStorage.setItem("wordflow_nickname", nickname.trim());
    router.push("/onboarding/country");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-white font-arabic dir-rtl">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/50 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-primary-coral/10 text-primary-coral flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold mb-2">اختر لقبك</h1>
        <p className="text-sm text-muted-text mb-8">
          هذا الاسم سيظهر لزملائك داخل المنصة.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-4 rounded-2xl bg-card-elevated border border-primary-coral/40 text-center font-mono text-lg text-white focus:outline-none focus:border-primary-coral transition-all"
              required
            />
            <button
              type="button"
              onClick={generateRandomNickname}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-xs text-secondary-teal hover:text-white flex items-center gap-1 bg-card/60 rounded-xl"
              title="لقب آخر"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>لقب آخر</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 p-4 rounded-full bg-primary-coral hover:bg-primary-peach font-bold text-white transition-all shadow-lg active:scale-95"
          >
            <span>متابعة</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
