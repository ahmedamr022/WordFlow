"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from 'lucide-react';
import { FEATURES } from '../../data/landing';
import { SectionHeading } from './SectionHeading';

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 h-[440px] w-[760px] -translate-x-1/2 rounded-full blur-[160px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)' }} />
      

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <SectionHeading
          badge="كل ما تحتاجه لتعلم الإنجليزية"
          badgeEmoji="⭐"
          badgeColor="#2DE2C5"
          title={
          <>
              مميزات <span style={{ color: '#EC4899' }}>تجعل</span>{' '}
              <span className="wf-gradient-text-teal">تجربتك</span> فريدة
            </>
          }
          subtitle="نقدم لك أدوات ذكية ومحتوى تفاعلي مصمم بعناية لمساعدتك على تعلم الإنجليزية بطريقة ممتعة وفعّالة." />
        

        <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) =>
          <motion.li
            key={feature.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index % 4 * 0.08 }}
            whileHover={{ y: -8 }}
            className="group relative flex flex-col items-center overflow-hidden rounded-[22px] border px-7 pb-10 pt-11 text-center transition-colors duration-500"
            style={{
              borderColor: 'rgba(255,255,255,0.07)',
              backgroundColor: 'rgba(12,12,19,0.92)'
            }}>
            
              {/* soft coloured wash that reveals on hover */}
              <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[220px] opacity-40 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(120% 100% at 50% 0%, ${feature.color}1F, transparent 70%)`
              }} />
            
              <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[22px] border opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                borderColor: `${feature.color}4D`,
                boxShadow: `0 30px 70px -46px ${feature.color}`
              }} />
            

              <span className="relative grid h-[78px] w-[78px] place-items-center rounded-full">
                <span
                aria-hidden
                className="absolute inset-0 rounded-full border transition-transform duration-500 group-hover:scale-110"
                style={{
                  borderColor: `${feature.color}66`,
                  backgroundColor: `${feature.color}0F`,
                  boxShadow: `0 0 38px -10px ${feature.color}99`
                }} />
              
                <feature.icon size={29} style={{ color: feature.color }} aria-hidden />
              </span>

              <h3 className="relative mt-7 text-[19px] font-bold text-white">{feature.title}</h3>
              <p className="relative mt-3.5 text-[13.5px] leading-[2] text-[#8B8B9F]">
                {feature.description}
              </p>

              <span
              aria-hidden
              className="relative mt-8 h-[3px] w-12 rounded-full transition-all duration-500 group-hover:w-24"
              style={{
                backgroundColor: feature.color,
                boxShadow: `0 0 16px ${feature.color}B3`
              }} />
            
            </motion.li>
          )}
        </ul>

        {/* social proof */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 flex max-w-[720px] flex-col items-center justify-center gap-5 rounded-full border px-8 py-5 sm:flex-row"
          style={{
            borderColor: 'rgba(255,255,255,0.07)',
            backgroundColor: 'rgba(12,12,19,0.92)',
            boxShadow: '0 30px 80px -60px rgba(236,72,153,0.8)'
          }}>
          
          <span className="flex shrink-0 items-center" aria-hidden>
            {['👩🏻‍🎓', '🧑🏽‍💻', '👨🏼‍🏫'].map((emoji, i) =>
            <span
              key={emoji}
              className="grid h-11 w-11 place-items-center rounded-full border-2 text-[18px] transition-transform duration-300 hover:-translate-y-1"
              style={{
                borderColor: '#0C0C13',
                backgroundColor: ['#2A1B3D', '#1B2A3D', '#3D1B2A'][i],
                marginInlineStart: i === 0 ? 0 : -12
              }}>
              
                {emoji}
              </span>
            )}
          </span>

          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <p className="text-[14px] font-semibold text-white/90">
              انضم إلى أكثر من{' '}
              <span className="wf-font-en font-extrabold text-white">50,000</span> متعلم حول العالم
            </p>
            <p className="flex items-center gap-2 text-[13px] text-[#8B8B9F]">
              <span className="flex items-center gap-[2px]" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) =>
                <StarIcon key={i} size={13} className="fill-current" style={{ color: '#F5A623' }} />
                )}
              </span>
              <span className="wf-font-en font-bold text-white">4.9</span>
              <span>(2,340 تقييم)</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>);

}