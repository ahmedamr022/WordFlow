import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { Sections } from "@/components/landing/Sections";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white font-arabic dir-rtl overflow-x-hidden selection:bg-[#2de2c5] selection:text-slate-950 relative">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-[#2de2c5]/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-1/3 left-10 w-[500px] h-[500px] bg-[#ff6b6b]/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />

      {/* Organic Background Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <svg
          className="absolute -top-10 -right-20 w-[65vw] max-w-[900px] h-auto opacity-40 text-slate-800/50"
          viewBox="0 0 1000 1000"
          fill="none"
        >
          <path
            d="M 1000 0 Q 600 300 400 150 T 0 500 L 1000 1000 Z"
            fill="url(#darkWaveGradRight)"
          />
          <defs>
            <linearGradient id="darkWaveGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="absolute top-20 -left-40 w-[55vw] max-w-[800px] h-auto opacity-30 text-slate-800/40"
          viewBox="0 0 1000 1000"
          fill="none"
        >
          <path
            d="M 0 0 Q 400 200 200 500 T 800 1000 L 0 1000 Z"
            fill="url(#darkWaveGradLeft)"
          />
          <defs>
            <linearGradient id="darkWaveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <Navbar />
      <Hero />
      <Features />
      <InteractiveDemo />
      <Sections />
      <Footer />
    </div>
  );
}