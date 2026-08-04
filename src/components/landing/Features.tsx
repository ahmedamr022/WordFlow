import React from "react";
import { FEATURES_DATA, JOURNEY_STEPS } from "@/data/landing";

export function Features() {
  return (
    <>
      {/* FEATURES GRID */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[#2de2c5]/10 text-[#2de2c5] text-xs font-mono font-bold border border-[#2de2c5]/30">
            قدرات المنصة الذكية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            كل ما تحتاجه للوصول للطلاقة الإنجليزية
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            تم تصميم WordFlow خصيصاً للمتحدثين بالعربية ليجمع بين الكتابة، الاستماع، والقواعد في تجربة سلسة بدون تشتيت.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_DATA.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="glass-card glass-card-hover p-8 rounded-3xl space-y-4 border border-slate-800 relative group overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center border border-slate-700/60`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#2de2c5] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* LEARNING JOURNEY TIMELINE */}
      <section id="journey" className="py-28 px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="px-3.5 py-1 rounded-full bg-[#2de2c5]/10 text-[#2de2c5] text-xs font-mono font-bold border border-[#2de2c5]/30">
            خريطة الطريق
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-arabic text-white">
            كيف تبدأ وتتقدم في WordFlow؟
          </h2>
        </div>

        <div className="space-y-8 relative before:absolute before:right-1/2 before:translate-x-1/2 before:top-0 before:bottom-0 before:w-1 before:bg-slate-800/80">
          {JOURNEY_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#09090B] border-2 border-[#2de2c5] flex items-center justify-center text-[#2de2c5] font-black text-xl font-mono shadow-xl shrink-0 mx-auto">
                  {item.step}
                </div>
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#2de2c5]" />
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}