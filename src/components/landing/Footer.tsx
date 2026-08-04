import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 py-12 px-6 max-w-7xl mx-auto text-center space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="WordFlow الصفحة الرئيسية">
          <span className="font-black text-xl font-sans text-white">
            Word<span className="text-[#ff6b6b]">Flow</span>
          </span>
        </Link>

        <p className="text-xs text-slate-500 font-arabic">
          © {new Date().getFullYear()} WordFlow. جميع الحقوق محفوظة. منصة تعلم الإنجليزية التفاعلية.
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-white transition-colors">
            الخصوصية
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            الشروط
          </Link>
          <Link href="/dashboard" className="hover:text-[#2de2c5] transition-colors">
            التطبيق
          </Link>
        </div>
      </div>
    </footer>
  );
}