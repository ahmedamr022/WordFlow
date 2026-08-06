"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, Volume2Icon, ZapIcon } from 'lucide-react';
import { DEMO_STORIES, IMAGES, IMAGE_FALLBACKS } from '../../data/landing';
import { AssetImage } from './AssetImage';
import { SectionHeading } from './SectionHeading';

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function InteractiveDemo() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [activeWord, setActiveWord] = useState(2);
  const [speaking, setSpeaking] = useState(false);

  const story = DEMO_STORIES[storyIndex];
  const sentence = story.words.map((w) => w.word).join(' ');

  const readLine = () => {
    speak(sentence);
    setSpeaking(true);
    window.setTimeout(() => setSpeaking(false), 1600);
  };

  return (
    <section id="demo" className="relative overflow-hidden py-24 sm:py-28">
      {/* patterned background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-50">
          <AssetImage
            src={IMAGES.background}
            fallback={IMAGE_FALLBACKS.background}
            alt=""
            className="h-full w-full object-cover" />
          
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
            'linear-gradient(180deg, #09090B 0%, rgba(9,9,11,0.80) 22%, rgba(9,9,11,0.86) 72%, #09090B 100%)'
          }} />
        
        <div
          className="absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[170px]"
          style={{ background: 'radial-gradient(circle, rgba(45,226,197,0.12), transparent 70%)' }} />
        
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <SectionHeading
          badge="تجربة تفاعلية حية"
          badgeIcon={ZapIcon}
          badgeColor="#2DE2C5"
          title={
          <>
              <span style={{ color: '#EC4899' }}>جرب</span> محرك{' '}
              <span className="wf-gradient-text-teal">القراءة</span> والكتابة الآن
            </>
          }
          subtitle="اقرأ أي كلمة للاستماع لنطقها وتحديدها فورًا، أو اضغط استمع للسطر الكامل." />
        

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 rounded-[30px] border px-5 py-9 sm:px-11 sm:py-11"
          style={{
            borderColor: 'rgba(255,255,255,0.09)',
            backgroundColor: 'rgba(10,10,16,0.72)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 50px 120px -70px rgba(45,226,197,0.55)'
          }}>
          
          {/* story tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {DEMO_STORIES.map((item, index) => {
              const isActive = index === storyIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStoryIndex(index);
                    setActiveWord(0);
                  }}
                  aria-pressed={isActive}
                  className="wf-focus rounded-full px-[26px] py-[11px] text-[14px] font-bold transition-all duration-300 hover:scale-[1.04]"
                  style={
                  isActive ?
                  {
                    backgroundColor: '#2DE2C5',
                    color: '#04231E',
                    boxShadow: '0 12px 30px -12px rgba(45,226,197,0.95)'
                  } :
                  {
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.72)',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                  }
                  }>
                  
                  {item.label}
                </button>);

            })}
          </div>

          <div aria-hidden className="wf-hairline mt-9 h-[1px] w-full" />

          {/* sentence */}
          <div
            className="mt-9 flex flex-col items-center gap-7 rounded-[22px] border px-5 py-9 sm:flex-row sm:px-9"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(5,5,9,0.8)'
            }}>
            
            <p
              dir="ltr"
              className="wf-font-en flex flex-1 flex-wrap items-end justify-center gap-x-7 gap-y-6">
              
              {story.words.map((item, index) => {
                const isActive = index === activeWord;
                return (
                  <button
                    key={`${item.word}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveWord(index);
                      speak(item.word);
                    }}
                    className="wf-focus group relative pb-2 text-[34px] font-extrabold leading-none transition-transform duration-300 hover:-translate-y-1 sm:text-[46px]"
                    aria-label={`${item.word} — ${item.meaning}`}>
                    
                    <span className={isActive ? 'wf-gradient-text' : 'text-white'}>
                      {item.word}
                    </span>

                    {/* meaning tooltip */}
                    <span
                      dir="rtl"
                      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        borderColor: 'rgba(45,226,197,0.35)',
                        backgroundColor: 'rgba(6,6,10,0.95)',
                        color: '#2DE2C5'
                      }}>
                      
                      {item.meaning}
                    </span>

                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[3px] rounded-full transition-all duration-300"
                      style={
                      isActive ?
                      {
                        backgroundImage:
                        'linear-gradient(90deg, #8B5CF6, #D946EF 50%, #EC4899)',
                        boxShadow: '0 0 14px rgba(217,70,239,0.8)'
                      } :
                      {
                        backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(255,255,255,0.26) 0 7px, transparent 7px 13px)'
                      }
                      } />
                    
                  </button>);

              })}
            </p>

            <button
              type="button"
              onClick={readLine}
              aria-label="استمع للسطر الكامل"
              className="wf-focus relative grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full border transition-transform duration-300 hover:scale-110"
              style={{
                borderColor: 'rgba(45,226,197,0.45)',
                backgroundColor: 'rgba(45,226,197,0.08)',
                color: '#2DE2C5'
              }}>
              
              {speaking &&
              <span
                aria-hidden
                className="wf-pulse-ring absolute inset-0 rounded-full border"
                style={{ borderColor: 'rgba(45,226,197,0.65)' }} />

              }
              <Volume2Icon size={22} aria-hidden />
            </button>
          </div>

          {/* translation */}
          <div className="mt-9 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={story.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-[19px] font-bold text-white sm:text-[20px]">
                
                <span style={{ color: '#2DE2C5' }}>”</span> {story.translation}{' '}
                <span style={{ color: '#2DE2C5' }}>“</span>
              </motion.p>
            </AnimatePresence>
            <p className="mt-3 text-[14px] text-[#8B8B9F]">
              انقر على أي كلمة للاستماع لنطقها ومعرفة معناها.
            </p>
          </div>

          {/* actions */}
          <div
            dir="ltr"
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            
            <button
              dir="rtl"
              type="button"
              onClick={readLine}
              className="wf-focus inline-flex items-center gap-3 rounded-full border px-9 py-[16px] text-[15px] font-bold transition-all duration-300 hover:scale-[1.03]"
              style={{
                borderColor: 'rgba(45,226,197,0.45)',
                backgroundColor: 'rgba(45,226,197,0.08)',
                color: '#2DE2C5',
                boxShadow: '0 14px 36px -22px rgba(45,226,197,0.9)'
              }}>
              
              استمع للسطر الكامل
              <Volume2Icon size={18} aria-hidden />
            </button>

            <span className="flex items-center gap-3 text-[13px] text-white/40">
              <span aria-hidden className="h-[1px] w-8 bg-white/15" />
              أو
              <span aria-hidden className="h-[1px] w-8 bg-white/15" />
            </span>

            <a
              dir="rtl"
              href="/register"
              className="wf-focus group inline-flex items-center gap-3 rounded-full border px-9 py-[16px] text-[15px] font-bold text-white transition-all duration-300 hover:border-white/30 hover:bg-white/[0.07]"
              style={{
                borderColor: 'rgba(255,255,255,0.13)',
                backgroundColor: 'rgba(255,255,255,0.035)'
              }}>
              
              سجل وجرب القصة الكاملة
              <ArrowLeftIcon
                size={18}
                className="transition-transform duration-300 group-hover:-translate-x-1"
                aria-hidden />
              
            </a>
          </div>
        </motion.div>
      </div>
    </section>);

}