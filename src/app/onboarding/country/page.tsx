"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";

export default function CountryOnboardingPage() {
  const router = useRouter();
  const [country, setCountry] = useState("EG");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("wordflow_country", country);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-white font-arabic dir-rtl">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/50 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-primary-coral/10 text-primary-coral flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold mb-2">من أي دولة تستخدم التطبيق؟</h1>
        <p className="text-sm text-muted-text mb-8">
          اختياري. يساعدنا على تخصيص تجربتك والمحتوى الإقليمي المناسب.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full p-4 rounded-2xl bg-card-elevated border border-border/50 text-white font-arabic focus:outline-none focus:border-primary-coral transition-all text-center"
          >
            <option value="EG">🇪🇬 مصر</option>
            <option value="SA">🇸🇦 السعودية</option>
            <option value="AE">🇦🇪 الإمارات</option>
            <option value="KW">🇰🇼 الكويت</option>
            <option value="QA">🇶🇦 قطر</option>
            <option value="JO">🇯🇴 الأردن</option>
            <option value="MA">🇲🇦 المغرب</option>
            <option value="OTHER">🌍 دولة أخرى</option>
          </select>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 p-4 rounded-full bg-primary-coral hover:bg-primary-peach font-bold text-white transition-all shadow-lg active:scale-95"
          >
            <span>الانتقال إلى لوحة التعلم</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
