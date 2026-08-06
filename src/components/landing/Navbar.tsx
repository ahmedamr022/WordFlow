"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { LogInIcon, MenuIcon, WandSparklesIcon, XIcon } from 'lucide-react';
import { NAV_ITEMS } from '../../data/landing';
import { useActiveSection } from '../../hooks/useActiveSection';
import { Logo } from './Logo';

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(6,6,10,0.92)' : 'rgba(6,6,10,0.72)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: scrolled ? '0 18px 50px -34px rgba(0,0,0,0.95)' : 'none'
      }}>
      
      <div
        className="mx-auto flex w-full max-w-[1440px] items-center gap-6 px-5 transition-all duration-500 sm:px-8"
        style={{ height: scrolled ? 76 : 88 }}>
        
        {/* brand (right in RTL) */}
        <div className="flex shrink-0 items-center">
          <Logo size="md" />
        </div>

        {/* desktop nav (centered) */}
        <nav aria-label="التنقل الرئيسي" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className="wf-focus relative block px-[14px] py-2 text-[15px] font-semibold transition-colors duration-300"
                    style={{ color: isActive ? '#F472B6' : 'rgba(255,255,255,0.7)' }}>
                    
                    <span
                      className={
                      isActive ? 'wf-gradient-text' : 'transition-colors hover:text-white'
                      }>
                      
                      {item.label}
                    </span>
                    {isActive &&
                    <motion.span
                      layoutId="wf-nav-underline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-x-[10px] -bottom-[9px] h-[2.5px] rounded-full"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #8B5CF6, #D946EF 50%, #EC4899)',
                        boxShadow: '0 0 14px rgba(217,70,239,0.85)'
                      }} />

                    }
                  </a>
                </li>);

            })}
          </ul>
        </nav>

        {/* actions (left in RTL) */}
        <div className="flex flex-1 items-center justify-end gap-3 lg:flex-none">
          <a
            href="/register"
            className="wf-focus group relative hidden items-center gap-2 overflow-hidden rounded-full px-[22px] py-[11px] text-[14.5px] font-bold text-white transition-all duration-300 hover:scale-[1.04] sm:inline-flex"
            style={{
              backgroundImage: 'linear-gradient(90deg, #6366F1 0%, #A855F7 52%, #EC4899 100%)',
              boxShadow: '0 12px 30px -12px rgba(168,85,247,0.95)'
            }}>
            
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full"
              style={{ mixBlendMode: 'overlay' }} />
            
            <span className="relative">ابدأ الآن</span>
            <WandSparklesIcon size={15} className="relative" aria-hidden />
          </a>

          <a
            href="/login"
            className="wf-focus hidden items-center gap-2 rounded-full border px-[22px] py-[11px] text-[14.5px] font-semibold text-white/85 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.03)'
            }}>
            
            تسجيل الدخول
            <LogInIcon size={15} aria-hidden />
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={menuOpen}
            className="wf-focus grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition-colors hover:border-white/25 lg:hidden">
            
            {menuOpen ? <XIcon size={19} /> : <MenuIcon size={19} />}
          </button>
        </div>
      </div>

      {/* scroll progress */}
      <motion.div
        aria-hidden
        className="h-[2px] origin-right"
        style={{
          scaleX: progress,
          backgroundImage: 'linear-gradient(90deg, #2DE2C5, #8B5CF6 55%, #EC4899)'
        }} />
      

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen &&
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="lg:hidden"
          style={{ backgroundColor: 'rgba(6,6,10,0.98)' }}>
          
            <ul className="flex flex-col gap-1 border-t border-white/5 px-5 py-4">
              {NAV_ITEMS.map((item) =>
            <li key={item.id}>
                  <a
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors"
                style={{
                  color: active === item.id ? '#F472B6' : 'rgba(255,255,255,0.8)',
                  backgroundColor:
                  active === item.id ? 'rgba(236,72,153,0.08)' : 'transparent'
                }}>
                
                    {item.label}
                  </a>
                </li>
            )}
              <li className="mt-3 flex gap-3">
                <a
                href="/register"
                className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] font-bold text-white"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #6366F1 0%, #A855F7 52%, #EC4899 100%)'
                }}>
                
                  ابدأ الآن
                  <WandSparklesIcon size={15} aria-hidden />
                </a>
                <a
                href="/login"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/12 px-4 py-3 text-[14px] font-semibold text-white/85">
                
                  تسجيل الدخول
                  <LogInIcon size={15} aria-hidden />
                </a>
              </li>
            </ul>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}