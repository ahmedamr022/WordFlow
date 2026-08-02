"use client";

import { Sparkles, BookOpen, TrendingUp } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/5 bg-gradient-to-br from-[#121B2C] via-[#0E1524] to-[#080B11] p-10">

      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />

      <div className="relative z-10 flex items-center justify-between">

        <div className="max-w-2xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">

            <Sparkles size={16} />

            <span>WordFlow Stories</span>

          </div>

          <h1 className="text-6xl font-black leading-tight text-white">

            تعلم الإنجليزية
            <br />
            من خلال القصص.

          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">

            اقرأ، استمع، اكتب، وتعلم المفردات الجديدة داخل تجربة
            احترافية مصممة لزيادة مستواك خطوة بخطوة.

          </p>

          <div className="mt-10 flex gap-4">

            <button className="rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-black transition hover:scale-105">
              ابدأ الآن
            </button>

            <button className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white transition hover:border-cyan-400/30">
              استكشف القصص
            </button>

          </div>

        </div>

        <div className="hidden xl:flex flex-col gap-5">

          <div className="w-72 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">

            <BookOpen className="mb-4 text-cyan-400" />

            <p className="text-4xl font-black text-white">
              +250
            </p>

            <p className="mt-2 text-slate-400">
              قصة احترافية
            </p>

          </div>

          <div className="w-72 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">

            <TrendingUp className="mb-4 text-green-400" />

            <p className="text-4xl font-black text-white">
              +12K
            </p>

            <p className="mt-2 text-slate-400">
              كلمة ومفردة
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}