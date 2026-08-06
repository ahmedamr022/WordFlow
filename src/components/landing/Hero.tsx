"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, BookOpenIcon, ChevronsLeftIcon, StarIcon, TrendingUpIcon } from 'lucide-react';
import { HERO_CHIPS, HERO_LEVELS, HERO_STATS, IMAGES, IMAGE_FALLBACKS } from '../../data/landing';
import { AssetImage } from './AssetImage';

export function Hero() {
  return (
    <section id="hero" className="relative isolate overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* Hero artwork blended into the page background                    */}
      {/* ---------------------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-y-0 right-0 w-full lg:w-[66%]"
          style={{
            maskImage:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.25) 14%, rgba(0,0,0,0.8) 34%, #000 55%)',
            WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.25) 14%, rgba(0,0,0,0.8) 34%, #000 55%)'
          }}>
          
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full opacity-40 lg:opacity-100">
            
            <AssetImage
              src={IMAGES.hero}
              fallback={IMAGE_FALLBACKS.hero}
              alt=""
              loading="eager"
              className="h-full w-full object-cover object-[70%_center]" />
            
          </motion.div>
        </div>

        {/* horizontal fade into the page background */}
        <div
          className="absolute inset-0"
          style={{
            background:
            'linear-gradient(90deg, #09090B 0%, rgba(9,9,11,0.97) 20%, rgba(9,9,11,0.72) 38%, rgba(9,9,11,0.28) 62%, rgba(9,9,11,0.30) 88%, rgba(9,9,11,0.55) 100%)'
          }} />
        
        {/* vertical fade so the artwork melts into the top bar and the stats */}
        <div
          className="absolute inset-0"
          style={{
            background:
            'linear-gradient(180deg, #09090B 0%, rgba(9,9,11,0.55) 12%, rgba(9,9,11,0.10) 42%, rgba(9,9,11,0.72) 82%, #09090B 100%)'
          }} />
        
        {/* ambient brand glows */}
        <div
          className="absolute -top-32 right-[6%] h-[520px] w-[520px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.30), transparent 70%)' }} />
        
        <div
          className="absolute top-52 left-[-14%] h-[520px] w-[520px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(45,226,197,0.16), transparent 70%)' }} />
        
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-16 pt-[130px] sm:px-8 sm:pt-[152px]">
        {/* ------------------------------- copy ------------------------- */}
        <div dir="ltr" className="flex min-h-[440px] items-center lg:min-h-[560px]">
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[640px] text-center lg:text-left">
            
            <div className="flex justify-center lg:justify-end">
              <span
                className="inline-flex rounded-full p-[1.2px]"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                  boxShadow: '0 0 30px -12px rgba(236,72,153,0.9)'
                }}>
                
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0A0A11] px-[18px] py-[8px] text-[13px] font-semibold text-white/90">
                  الحيل الجديد لتعلم الإنجليزية
                  <StarIcon size={13} className="fill-current" style={{ color: '#F5A623' }} />
                </span>
              </span>
            </div>

            <h1 className="mt-8 text-[40px] font-black leading-[1.16] tracking-[-0.02em] text-white sm:text-[54px] lg:text-[62px]">
              أتقن الإنجليزية
              <br />
              <span className="wf-gradient-text-teal">قصة</span>{' '}
              <span className="wf-gradient-text">بعد قصة.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-[560px] text-[15px] leading-[2.05] text-[#9A9AAE] sm:text-[16px] lg:mx-0">
              تعلم اللغة الإنجليزية بطريقة ممتعة وتفاعلية من خلال القصص المشوقة والمفردات الذكية،
              والتحديات الأسبوعية المصممة خصيصًا لتطور مستواك.
            </p>

            <div
              dir="ltr"
              className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              
              <a
                dir="rtl"
                href="/register"
                className="wf-focus group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-9 py-[17px] text-[16px] font-bold text-white transition-all duration-300 hover:scale-[1.03]"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #6366F1 0%, #A855F7 54%, #EC4899 100%)',
                  boxShadow: '0 18px 44px -16px rgba(168,85,247,0.95)'
                }}>
                
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full"
                  style={{ mixBlendMode: 'overlay' }} />
                
                <span className="relative">ابدأ رحلتك مجانًا الآن</span>
                <ArrowLeftIcon
                  size={18}
                  className="relative transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden />
                
              </a>

              <a
                dir="rtl"
                href="#demo"
                className="wf-focus group inline-flex items-center gap-3 rounded-full border px-9 py-[17px] text-[16px] font-bold text-white transition-all duration-300 hover:border-white/30 hover:bg-white/[0.07]"
                style={{
                  borderColor: 'rgba(255,255,255,0.13)',
                  backgroundColor: 'rgba(255,255,255,0.035)',
                  backdropFilter: 'blur(6px)'
                }}>
                
                استكشف القصص
                <BookOpenIcon
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110"
                  aria-hidden />
                
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-end">
              {HERO_CHIPS.map((chip) =>
              <li
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border px-[16px] py-[9px] text-[13px] font-semibold text-white/80 transition-colors duration-300 hover:border-white/20 hover:text-white"
                style={{
                  borderColor: 'rgba(255,255,255,0.09)',
                  backgroundColor: 'rgba(10,10,17,0.6)',
                  backdropFilter: 'blur(6px)'
                }}>
                
                  {chip.label}
                  <span aria-hidden>{chip.emoji}</span>
                </li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* ------------------------------- stats ------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 rounded-[26px] border p-7 sm:p-9"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(11,11,18,0.82)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 40px 90px -60px rgba(139,92,246,0.9)'
          }}>
          
          <ul className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {HERO_STATS.map((stat) =>
            <li
              key={stat.title}
              dir="ltr"
              className="group flex items-center gap-5 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pr-0 lg:last:pl-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              
                <span className="relative grid h-[70px] w-[70px] shrink-0 place-items-center rounded-full">
                  <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border transition-transform duration-500 group-hover:scale-110"
                  style={{
                    borderColor: `${stat.color}55`,
                    backgroundColor: `${stat.color}14`,
                    boxShadow: `0 0 34px -8px ${stat.color}80`
                  }} />
                
                  <stat.icon size={27} style={{ color: stat.color }} aria-hidden />
                </span>
                <span dir="rtl" className="flex flex-col text-right">
                  <span className="wf-font-en text-[29px] font-extrabold leading-none text-white">
                    {stat.value}
                  </span>
                  <span className="mt-[7px] text-[14px] font-semibold text-white/85">
                    {stat.title}
                  </span>
                  <span className="mt-[3px] text-[12.5px] text-[#7E7E92]">{stat.subtitle}</span>
                </span>
              </li>
            )}
          </ul>
        </motion.div>

        {/* ------------------------------- levels ----------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-6 flex flex-col items-center justify-between gap-6 rounded-[26px] border px-7 py-[26px] sm:px-9 md:flex-row"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(11,11,18,0.78)',
            backdropFilter: 'blur(14px)'
          }}>
          
          <p className="flex items-center gap-3 text-[15px] font-bold text-white sm:text-[17px]">
            ابدأ من مستواك الحالي وارتق إلى الاحتراف
            <TrendingUpIcon size={19} style={{ color: '#2DE2C5' }} aria-hidden />
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-4">
            {HERO_LEVELS.map((level, index) =>
            <React.Fragment key={level.code}>
                <li dir="ltr" className="flex items-center gap-2">
                  <span className="text-[14px] font-bold" style={{ color: level.color }}>
                    {level.label}
                  </span>
                  <span
                  className="wf-font-en rounded-[11px] border px-[13px] py-[7px] text-[13px] font-bold transition-transform duration-300 hover:scale-105"
                  style={{
                    color: level.color,
                    borderColor: `${level.color}55`,
                    backgroundColor: `${level.color}16`,
                    boxShadow: `0 0 22px -12px ${level.color}`
                  }}>
                  
                    {level.code}
                  </span>
                </li>
                {index < HERO_LEVELS.length - 1 &&
              <ChevronsLeftIcon
                size={17}
                aria-hidden
                style={{ color: 'rgba(255,255,255,0.26)' }} />

              }
              </React.Fragment>
            )}
          </ul>
        </motion.div>
      </div>
    </section>);

}