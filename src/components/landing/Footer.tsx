"use client";

import React, { useState } from 'react';
import { CheckIcon, SendIcon } from 'lucide-react';
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '../../data/landing';
import { Logo } from './Logo';

export function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <footer
      className="relative border-t"
      style={{
        borderColor: 'rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(5,5,9,0.95)'
      }}>
      
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_repeat(3,0.7fr)_1.2fr]">
          {/* brand */}
          <div>
            <Logo size="lg" withMark={false} withTagline={false} />
            <p className="mt-5 max-w-[290px] text-[13px] leading-[2.1] text-[#8B8B9F]">
              منصة متكاملة لتعلم اللغة الإنجليزية بذكاء. تعلم، تدرب، وتقدم بثقة وإتقان.
            </p>
            <ul className="mt-7 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) =>
              <li key={social.label}>
                  <a
                  href={social.href}
                  aria-label={social.label}
                  className="wf-focus grid h-11 w-11 place-items-center rounded-full border transition-all duration-300 hover:-translate-y-1"
                  style={{
                    borderColor: `${social.color}40`,
                    backgroundColor: `${social.color}14`,
                    color: social.color
                  }}>
                  
                    <social.icon size={17} aria-hidden />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* link columns */}
          {FOOTER_COLUMNS.map((column) =>
          <nav key={column.title} aria-label={column.title}>
              <h3 className="text-[15px] font-bold text-white">{column.title}</h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {column.links.map((link) =>
              <li key={link.label}>
                    <a
                  href={link.href}
                  className="wf-focus text-[13px] text-[#8B8B9F] transition-colors duration-200 hover:text-white">
                  
                      {link.label}
                    </a>
                  </li>
              )}
              </ul>
            </nav>
          )}

          {/* newsletter */}
          <div className="lg:border-r lg:pr-9" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h3 className="text-[15px] font-bold text-white">اشترك في نشرتنا البريدية</h3>
            <p className="mt-3 text-[13px] leading-[2] text-[#8B8B9F]">
              احصل على نصائح تعليمية وأحدث التحديثات.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!email) return;
                setSent(true);
                setEmail('');
              }}
              className="mt-5 flex items-center gap-2 rounded-full border p-[6px] transition-colors duration-300 focus-within:border-white/25"
              style={{
                borderColor: 'rgba(255,255,255,0.09)',
                backgroundColor: 'rgba(255,255,255,0.03)'
              }}>
              
              <label htmlFor="wf-newsletter" className="sr-only">
                بريدك الإلكتروني
              </label>
              <input
                id="wf-newsletter"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSent(false);
                }}
                placeholder="بريدك الإلكتروني"
                className="flex-1 bg-transparent px-4 text-[13px] text-white outline-none placeholder:text-[#6F6F82]" />
              
              <button
                type="submit"
                aria-label="اشترك"
                className="wf-focus grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 hover:scale-110"
                style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                
                {sent ? <CheckIcon size={16} /> : <SendIcon size={15} />}
              </button>
            </form>
            {sent &&
            <p className="mt-3 text-[12px]" style={{ color: '#2DE2C5' }} role="status">
                تم الاشتراك بنجاح، شكرًا لك! 🎉
              </p>
            }
          </div>
        </div>

        <div aria-hidden className="wf-hairline mt-14 h-[1px] w-full" />

        <p className="mt-7 text-center text-[12.5px] text-[#6F6F82]">
          © 2025 WordFlow. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>);

}