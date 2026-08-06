"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapIcon } from 'lucide-react';
import { JOURNEY_STEPS, JOURNEY_SUPPORT } from '../../data/landing';
import { SectionHeading } from './SectionHeading';

export function Journey() {
  return (
    <section id="journey" className="relative py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-20 h-[420px] w-[420px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(45,226,197,0.14), transparent 70%)' }} />
      
      <div
        aria-hidden
        className="pointer-events-none absolute left-[6%] bottom-24 h-[420px] w-[420px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.16), transparent 70%)' }} />
      

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <SectionHeading
          badge="رحلتك خطوة بخطوة"
          badgeIcon={MapIcon}
          badgeColor="#2DE2C5"
          title={
          <>
              مسار تعلم مصمم <span className="wf-gradient-text">لنجاحك</span>
            </>
          }
          subtitle="من المبتدئ إلى المتقدم، نقدم لك تجربة تعلم متكاملة تساعدك على اكتساب اللغة الإنجليزية بثقة وإتقان." />
        

        {/* steps */}
        <ol className="mt-24 grid grid-cols-1 gap-y-20 sm:grid-cols-2 sm:gap-x-7 lg:grid-cols-3 xl:grid-cols-6 xl:gap-x-10">
          {JOURNEY_STEPS.map((step, index) =>
          <motion.li
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.07 }}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col items-center rounded-[22px] border px-5 pb-9 pt-14 text-center transition-colors duration-500"
            style={{
              borderColor: `${step.color}33`,
              backgroundColor: 'rgba(10,10,16,0.72)'
            }}>
            
              <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(120% 90% at 50% 0%, ${step.color}18, transparent 70%)`,
                boxShadow: `0 34px 80px -54px ${step.color}`
              }} />
            

              {/* number badge */}
              <span
              className="wf-font-en absolute -top-[23px] left-1/2 grid h-[46px] w-[46px] -translate-x-1/2 place-items-center rounded-full border text-[15px] font-extrabold transition-transform duration-500 group-hover:scale-110"
              style={{
                borderColor: `${step.color}8C`,
                backgroundColor: '#09090B',
                color: step.color,
                boxShadow: `0 0 26px -6px ${step.color}A6`
              }}>
              
                {step.number}
              </span>

              {/* dashed connector to the next step */}
              {index < JOURNEY_STEPS.length - 1 &&
            <span
              aria-hidden
              className="absolute hidden h-[2px] w-7 xl:block"
              style={{
                top: 118,
                left: -28,
                backgroundImage:
                'repeating-linear-gradient(90deg, rgba(168,85,247,0.8) 0 6px, transparent 6px 11px)'
              }} />

            }

              <span className="relative grid h-[72px] w-[72px] place-items-center rounded-full">
                <span
                aria-hidden
                className="absolute inset-0 rounded-full border transition-transform duration-500 group-hover:scale-110"
                style={{
                  borderColor: `${step.color}66`,
                  backgroundColor: `${step.color}0F`,
                  boxShadow: `0 0 34px -8px ${step.color}99`
                }} />
              
                <step.icon size={27} style={{ color: step.color }} aria-hidden />
              </span>

              <h3 className="relative mt-6 text-[17.5px] font-bold" style={{ color: step.color }}>
                {step.title}
              </h3>
              <p className="relative mt-3 text-[13px] leading-[2] text-[#8B8B9F]">
                {step.description}
              </p>

              <span
              className="wf-font-en relative mt-7 rounded-[11px] border px-[15px] py-[8px] text-[13px] font-bold transition-transform duration-300 group-hover:scale-105"
              style={{
                color: step.color,
                borderColor: `${step.color}59`,
                backgroundColor: `${step.color}14`
              }}>
              
                {step.level}
              </span>
            </motion.li>
          )}
        </ol>

        {/* support strip */}
        <motion.ul
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="mt-20 grid grid-cols-1 gap-9 rounded-[26px] border p-8 sm:grid-cols-2 sm:p-10 lg:grid-cols-4 lg:gap-0"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(12,12,19,0.88)',
            boxShadow: '0 40px 100px -70px rgba(139,92,246,0.9)'
          }}>
          
          {JOURNEY_SUPPORT.map((item) =>
          <li
            key={item.title}
            dir="ltr"
            className="group flex items-start gap-5 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pr-0 lg:last:pl-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            
              <span
              className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full border transition-transform duration-500 group-hover:scale-110"
              style={{
                borderColor: `${item.color}45`,
                backgroundColor: `${item.color}12`,
                boxShadow: `0 0 30px -12px ${item.color}`
              }}>
              
                <item.icon size={23} style={{ color: item.color }} aria-hidden />
              </span>
              <span dir="rtl" className="text-right">
                <h3 className="text-[15.5px] font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.95] text-[#8B8B9F]">{item.description}</p>
              </span>
            </li>
          )}
        </motion.ul>
      </div>
    </section>);

}