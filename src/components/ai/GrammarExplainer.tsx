"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

interface GrammarExplainerProps {
  sentenceText: string;
}

export const GrammarExplainer: React.FC<GrammarExplainerProps> = ({ sentenceText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setIsOpen(true);

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentenceText }),
      });
      const data = await res.json();
      setExplanation(data.explanation || "تعذر الحصول على الشرح حالياً.");
    } catch {
      setExplanation("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={fetchExplanation}
        className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:border-sky-400/50 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95 mx-auto my-3 dir-rtl font-arabic"
      >
        <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
        <span>اشرحلي القاعدة النحوية للجملة</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl glass-card border border-sky-400/30 shadow-2xl text-right dir-rtl font-arabic">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 border-b border-slate-700/50 pb-3">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-lg text-white">الشرح النحوي بـ Gemini AI</h3>
            </div>

            <p className="text-sm font-sans dir-ltr bg-slate-900/90 p-3 rounded-xl text-sky-300 mb-4 border border-sky-500/20">
              "{sentenceText}"
            </p>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-sm text-slate-400">جاري تحليل تفاصيل القاعدة النحوية للجملة...</p>
              </div>
            ) : (
              <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line max-h-80 overflow-y-auto pl-2 font-arabic">
                {explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
