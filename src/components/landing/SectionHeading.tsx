"use client";

import React from "react";
import { motion } from "framer-motion";
import { BoxIcon } from "lucide-react";
;
type SectionHeadingProps = {
  badge: string;
  badgeIcon?:typeof BoxIcon;
  badgeEmoji?: string;
  badgeColor?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  id?: string;
};
export function SectionHeading({
  badge,
  badgeIcon: BadgeIcon,
  badgeEmoji,
  badgeColor = '#2DE2C5',
  title,
  subtitle,
  id
}: SectionHeadingProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 24
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    amount: 0.4
  }} transition={{
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1]
  }} className="mx-auto flex max-w-[760px] flex-col items-center text-center">
      <span className="inline-flex rounded-full p-[1.2px] transition-transform duration-300 hover:scale-[1.03]" style={{
      backgroundImage: `linear-gradient(90deg, ${badgeColor}, #8B5CF6 55%, #EC4899)`,
      boxShadow: `0 0 26px -10px ${badgeColor}CC`
    }}>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0A0A11] px-[18px] py-[8px] text-[13px] font-semibold text-white/90">
          {badge}
          {badgeEmoji ? <span aria-hidden className="text-[13px]">
              {badgeEmoji}
            </span> : BadgeIcon ? <BadgeIcon size={14} style={{
          color: badgeColor
        }} aria-hidden /> : null}
        </span>
      </span>

      <h2 id={id} className="mt-7 text-[30px] font-extrabold leading-[1.3] tracking-[-0.01em] text-white sm:text-[38px] md:text-[45px]">
        {title}
      </h2>

      {subtitle && <p className="mt-5 max-w-[640px] text-[14.5px] leading-[2] text-[#9A9AAE] sm:text-[15.5px]">
          {subtitle}
        </p>}
    </motion.div>;
}