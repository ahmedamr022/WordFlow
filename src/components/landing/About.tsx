"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import { ABOUT_PILLARS, ABOUT_STATS, IMAGES, IMAGE_FALLBACKS } from '../../data/landing';
import { AssetImage } from './AssetImage';
import { SectionHeading } from './SectionHeading';

export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[4%] top-28 h-[440px] w-[440px] rounded-full blur-[160px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20), transparent 70%)' }} />
      
      <div
        aria-hidden
        className="pointer-events-none absolute right-[4%] bottom-16 h-[380px] w-[380px] rounded-full blur-[160px]"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)' }} />
      

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <SectionHeading
          badge="تعرف علينا أكثر"
          badgeIcon={InfoIcon}
          badgeColor="#2DE2C5"
          title={
          <>
              عن <span className="wf-gradient-text wf-font-en">WordFlow</span>
            </>
          }
          subtitle={
          <>
              <span className="wf-font-en">WordFlow</span> هي منصة متكاملة لتعلم اللغة الإنجليزية
              بطريقة ذكية وتفاعلية.
              <br />
              نؤمن أن التعلم يجب أن يكون ممتعًا، فعالًا، ومصممًا خصيصًا لك.
            </>
          } />
        

        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_1.06fr]">
          {/* pillars (right in RTL) */}
          <motion.ul
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center gap-7 rounded-[26px] border p-8 sm:p-10"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(12,12,19,0.9)',
              boxShadow: '0 40px 100px -75px rgba(139,92,246,0.95)'
            }}>
            
            {ABOUT_PILLARS.map((pillar, index) =>
            <li key={pillar.title} className="group">
                {index > 0 && <span aria-hidden className="wf-hairline mb-7 block h-[1px]" />}
                <div className="flex items-start gap-5">
                  <span
                  className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-full border transition-transform duration-500 group-hover:scale-110"
                  style={{
                    borderColor: `${pillar.color}4D`,
                    backgroundColor: `${pillar.color}14`,
                    boxShadow: `0 0 32px -10px ${pillar.color}A6`
                  }}>
                  
                    <pillar.icon size={25} style={{ color: pillar.color }} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[17.5px] font-bold text-white">{pillar.title}</h3>
                    <p className="mt-2.5 text-[13.5px] leading-[2.05] text-[#8B8B9F]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </li>
            )}
          </motion.ul>

          {/* visual (left in RTL) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-[26px] border"
            style={{
              borderColor: 'rgba(255,255,255,0.09)',
              boxShadow: '0 50px 110px -60px rgba(0,0,0,0.95)'
            }}>
            
            <AssetImage
              src={IMAGES.lab}
              fallback={IMAGE_FALLBACKS.lab}
              alt="مكتب دراسة مسائي مع كتب مفتوحة وحاسوب يعرض شعار WordFlow"
              className="h-full min-h-[340px] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
            
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                'linear-gradient(180deg, rgba(9,9,11,0.10) 0%, rgba(9,9,11,0.20) 55%, rgba(9,9,11,0.55) 100%)'
              }} />
            
            <span
              aria-hidden
              className="absolute inset-0 rounded-[26px]"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }} />
            
          </motion.div>
        </div>

        {/* stats */}
        <motion.ul
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="mt-6 grid grid-cols-1 gap-9 rounded-[26px] border p-8 sm:grid-cols-2 sm:p-10 lg:grid-cols-4 lg:gap-0"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(12,12,19,0.9)'
          }}>
          
          {ABOUT_STATS.map((stat) =>
          <li
            key={stat.label}
            dir="ltr"
            className="group flex items-center gap-5 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pr-0 lg:last:pl-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            
              <span
              className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full border transition-transform duration-500 group-hover:scale-110"
              style={{
                borderColor: `${stat.color}45`,
                backgroundColor: `${stat.color}14`,
                boxShadow: `0 0 30px -12px ${stat.color}`
              }}>
              
                <stat.icon size={23} style={{ color: stat.color }} aria-hidden />
              </span>
              <span dir="rtl" className="flex flex-col text-right">
                <span
                className="wf-font-en text-[25px] font-extrabold leading-none"
                style={{ color: stat.color }}>
                
                  {stat.value}
                </span>
                <span className="mt-2 text-[13px] text-white/70">{stat.label}</span>
              </span>
            </li>
          )}
        </motion.ul>
      </div>
    </section>);

}