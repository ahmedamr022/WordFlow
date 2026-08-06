import React from 'react';
import './landing.css';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { Journey } from '@/components/landing/Journey';
import { About } from '@/components/landing/About';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div dir="rtl" lang="ar" className="wf-page wf-font-ar min-h-screen w-full bg-[#09090B]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <InteractiveDemo />
        <Journey />
        <About />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

