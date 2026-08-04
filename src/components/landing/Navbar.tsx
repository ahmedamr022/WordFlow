"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
import { Sparkles, LogIn } from "lucide-react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 40);
    });
  }, [scrollY]);

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#09090B]/85 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="WordFlow الصفحة الرئيسية">
          <div>
            <span className="font-black text-2xl font-sans tracking-wide text-white group-hover:text-[#2de2c5] transition-colors">
              Word<span className="text-[#ff6b6b]">Flow</span>
            </span>
            <span className="block text-[9px] text-[#2de2c5] font-mono tracking-widest uppercase">
              منصة التعلم الذكية
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
          <a href="#features" className="hover:text-[#2de2c5] transition-colors">
            المميزات
          </a>
          <a href="#demo" className="hover:text-[#2de2c5] transition-colors">
            التجربة التفاعلية
          </a>
          <a href="#journey" className="hover:text-[#2de2c5] transition-colors">
            مسار التعلم
          </a>
          <a href="#about" className="hover:text-[#2de2c5] transition-colors">
            عن المنصة
          </a>
          <a href="#faq" className="hover:text-[#2de2c5] transition-colors">
            الأسئلة الشائعة
          </a>
        </div>

        {/* الأزرار ثابتة دائماً لخيارات تسجيل الدخول والتسجيل الجديد */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white btn-ghost inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4 text-[#2de2c5]" />
            <span>تسجيل الدخول</span>
          </Link>

          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full text-xs font-black text-white btn-neon flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>ابدأ الآن</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}