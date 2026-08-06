"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, HeadsetIcon, HelpCircleIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { FAQ_ITEMS, IMAGES, IMAGE_FALLBACKS } from '../../data/landing';
import { AssetImage } from './AssetImage';
import { SectionHeading } from './SectionHeading';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-12 h-[400px] w-[720px] -translate-x-1/2 rounded-full blur-[160px]"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.16), transparent 70%)' }} />
      

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <SectionHeading
          badge="كل ما تريد معرفته"
          badgeIcon={HelpCircleIcon}
          badgeColor="#8B5CF6"
          title={
          <>
              <span style={{ color: '#A78BFA' }}>الأسئلة</span>{' '}
              <span className="wf-gradient-text">الشائعة</span>
            </>
          }
          subtitle="إجابات واضحة على أكثر الأسئلة شيوعًا لمساعدتك على فهم المنصة والاستفادة منها بأفضل طريقة." />
        

        <div className="mt-16 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_368px]">
          {/* accordion (right in RTL) */}
          <ul className="flex flex-col gap-3.5">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.li
                  key={item.question}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="overflow-hidden rounded-[18px] border transition-colors duration-500"
                  style={{
                    borderColor: isOpen ? 'rgba(45,226,197,0.30)' : 'rgba(255,255,255,0.07)',
                    backgroundColor: isOpen ? 'rgba(10,18,18,0.9)' : 'rgba(12,12,19,0.9)',
                    boxShadow: isOpen ? '0 30px 70px -60px rgba(45,226,197,0.95)' : 'none'
                  }}>
                  
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-4 px-7 py-[19px] text-right">
                    
                    <span
                      className="text-[16px] font-bold transition-colors duration-300 group-hover:text-[#2DE2C5]"
                      style={{ color: isOpen ? '#2DE2C5' : '#FFFFFF' }}>
                      
                      {item.question}
                    </span>
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 group-hover:scale-110"
                      style={{
                        borderColor: isOpen ? 'rgba(45,226,197,0.5)' : 'rgba(139,92,246,0.45)',
                        color: isOpen ? '#2DE2C5' : '#A78BFA',
                        backgroundColor: isOpen ? 'rgba(45,226,197,0.10)' : 'rgba(139,92,246,0.10)'
                      }}>
                      
                      {isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen &&
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                      
                        <p className="px-7 pb-6 text-[13.5px] leading-[2.15] text-[#8B8B9F]">
                          {item.answer}
                        </p>
                      </motion.div>
                    }
                  </AnimatePresence>
                </motion.li>);

            })}
          </ul>

          {/* support card (left in RTL) */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col items-center rounded-[24px] border px-8 py-10 text-center"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(12,12,19,0.9)',
              boxShadow: '0 40px 100px -75px rgba(139,92,246,0.95)'
            }}>
            
            <AssetImage
              src={IMAGES.message}
              fallback={IMAGE_FALLBACKS.message}
              alt="فقاعات محادثة تحتوي على علامة استفهام"
              className="wf-float h-[200px] w-[200px] object-contain" />
            
            <h3 className="mt-7 text-[20px] font-bold text-white">لم تجد إجابة لسؤالك؟</h3>
            <p className="mt-3 text-[13.5px] leading-[2] text-[#8B8B9F]">
              فريق الدعم لدينا جاهز لمساعدتك في أي وقت.
            </p>
            <a
              href="#"
              className="wf-focus mt-8 inline-flex items-center gap-3 rounded-full border px-8 py-[13px] text-[14px] font-bold transition-all duration-300 hover:scale-[1.03]"
              style={{
                borderColor: 'rgba(45,226,197,0.45)',
                backgroundColor: 'rgba(45,226,197,0.08)',
                color: '#2DE2C5',
                boxShadow: '0 14px 36px -22px rgba(45,226,197,0.9)'
              }}>
              
              تواصل مع الدعم
              <HeadsetIcon size={17} aria-hidden />
            </a>
          </motion.div>
        </div>

        {/* final CTA — the only "ابدأ الآن" outside the top bar */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-8 flex flex-col items-center justify-between gap-8 rounded-[26px] border px-8 py-9 sm:px-11 lg:flex-row"
          style={{
            borderColor: 'rgba(255,255,255,0.09)',
            backgroundColor: 'rgba(12,12,19,0.92)',
            boxShadow: '0 50px 120px -75px rgba(168,85,247,0.95)'
          }}>
          
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-right">
            <AssetImage
              src={IMAGES.rocket}
              fallback={IMAGE_FALLBACKS.rocket}
              alt="صاروخ ينطلق نحو الأعلى"
              className="wf-float h-[96px] w-[96px] shrink-0 object-contain" />
            
            <div>
              <h3 className="text-[24px] font-extrabold text-white sm:text-[27px]">
                جاهز للبدء في رحلتك؟
              </h3>
              <p className="mt-2.5 text-[14px] text-[#9A9AAE]">
                انضم الآن إلى آلاف المتعلمين وابدأ التعلم بخطة مخصصة تناسبك.
              </p>
            </div>
          </div>

          <a
            href="/register"
            className="wf-focus group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full px-11 py-5 text-[17px] font-bold text-white transition-all duration-300 hover:scale-[1.03] lg:w-auto"
            style={{
              backgroundImage: 'linear-gradient(90deg, #6366F1 0%, #A855F7 52%, #EC4899 100%)',
              boxShadow: '0 22px 55px -18px rgba(168,85,247,0.95)'
            }}>
            
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full"
              style={{ mixBlendMode: 'overlay' }} />
            
            <span className="relative">إبدأ الآن</span>
            <ArrowLeftIcon
              size={19}
              className="relative transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden />
            
          </a>
        </motion.div>
      </div>
    </section>);

}