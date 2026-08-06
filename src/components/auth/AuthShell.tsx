"use client";

import React from "react";
import Image from "next/image";
import {
  AlertCircle,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  Globe,
  Headphones,
  Loader2,
  Lock,
  ShieldCheck } from
"lucide-react";

/**
 * قوقعة صفحات الحساب (تسجيل الدخول / إنشاء الحساب / الـ onboarding).
 *
 * لماذا مكوّن مشترك؟ لأن الخلفية والكروت الثلاثة والشعار والفوتر كانت
 * **منسوخة حرفياً في ٦ ملفات** (login, register, ونداء أربع خطوات onboarding)،
 * فاختلفت بينها تفاصيل صغيرة: شفافية الخلفية (30% مقابل 40%)، عرض شريط
 * الكروت (780 مقابل 850)، أحجام النص، ووجود قسم العنوان الترحيبي في صفحتي
 * الحساب فقط. النتيجة: نفس التصميم بثلاث نسخ مختلفة.
 *
 * الآن مصدر واحد: كل الصفحات تحصل على نفس الخلفية ونفس الكروت الثلاثة ونفس
 * النص الترحيبي، والفرق الوحيد هو **الكارت الرئيسي** الذي يُمرَّر كـ children.
 */

export const AUTH_BACKGROUND = "/images/login.png";

const FEATURES = [
{
  title: "AI Feedback",
  body: "تغذية راجعة ذكية لتحسين كتابتك ونطقك",
  icon: Brain,
  color: "text-[#38bdf8]",
  hover: "hover:border-cyan-500/30"
},
{
  title: "Native Audio",
  body: "استمع للنطق الصحيح بجودة عالية",
  icon: Headphones,
  color: "text-[#a855f7]",
  hover: "hover:border-purple-500/30"
},
{
  title: "+500 Stories",
  body: "مئات القصص في مختلف المستويات",
  icon: BookOpen,
  color: "text-[#f43f5e]",
  hover: "hover:border-pink-500/30"
}];


/** مبدّل اللغة — العربية فقط متاحة حالياً، والبقية تُعلَن كـ«قريباً». */
function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1322]/70 px-4 py-2.5 text-sm text-slate-200 shadow-sm backdrop-blur-md transition-colors hover:bg-[#151c2e]">

        <Globe className="h-4 w-4 text-slate-300" aria-hidden />
        <span className="font-medium">العربية</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden />

      </button>

      {open &&
      <ul
        role="listbox"
        className="absolute left-0 top-[calc(100%+8px)] z-30 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#070c1b]/95 p-1.5 shadow-2xl backdrop-blur-xl">

          <li>
            <span
            role="option"
            aria-selected
            className="flex items-center justify-between rounded-xl bg-cyan-500/10 px-3 py-2 text-sm font-bold text-cyan-200">

              العربية
            </span>
          </li>
          <li>
            <span
            role="option"
            aria-selected={false}
            aria-disabled
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-500">

              English
              <span className="flex items-center gap-1 rounded-md border border-purple-500/40 bg-purple-950/70 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                <Lock className="h-2.5 w-2.5" aria-hidden />
                قريباً
              </span>
            </span>
          </li>
        </ul>
      }
    </div>);

}

/** الشعار — نسخة موحّدة لكل الصفحات. */
export function WordFlowWordmark({ size = "md" }: {size?: "md" | "lg";}) {
  return (
    <div className="flex items-center gap-3.5">
      <svg
        className={size === "lg" ? "h-10 w-10 shrink-0" : "h-9 w-9 shrink-0"}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden>

        <defs>
          <linearGradient id="wf-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <path
          d="M15 25 L35 75 L50 45 L65 75 L85 25"
          stroke="url(#wf-logo-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round" />

      </svg>
      <span className="text-3xl font-extrabold tracking-tight text-white">
        Word<span className="text-[#f43f5e]">Flow</span>
      </span>
    </div>);

}

/** مؤشّر خطوات الـ onboarding (٤ نقاط). */
export function OnboardingStepper({ step }: {step: 1 | 2 | 3 | 4;}) {
  return (
    <div
      className="relative mb-7 flex w-48 items-center justify-between"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuenow={step}
      aria-label={`الخطوة ${step} من 4`}>

      <span className="absolute left-0 right-0 top-1/2 z-0 h-[2px] -translate-y-1/2 bg-slate-800" aria-hidden />
      {[1, 2, 3, 4].map((dot) =>
      <span
        key={dot}
        aria-hidden
        className={
        dot === step ?
        "relative z-10 h-3.5 w-3.5 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" :
        "relative z-10 h-3 w-3 rounded-full bg-slate-700/80"
        } />

      )}
    </div>);

}

/** تنبيه خطأ موحّد. */
export function AuthAlert({ message }: {message: string;}) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-end gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
      dir="rtl">

      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>);

}

export const authInputClass =
"w-full rounded-xl border border-white/10 bg-[#030712]/60 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500/60 focus:bg-[#030712]/80 focus:outline-none";

/** زر الإجراء الرئيسي بتدرّج الهوية. */
export function PrimaryButton({
  children,
  loading = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {loading?: boolean;}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`relative flex w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#00d2ff] via-[#7c3aed] to-[#f43f5e] py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>

      {loading ?
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> :

      <>
          <span>{children}</span>
          <ChevronRight className="absolute right-4 h-5 w-5" aria-hidden />
        </>
      }
    </button>);

}

export function GoogleMark() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.86c2.26-2.08 3.58-5.15 3.58-8.81z" />

      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.86-3.01c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.28v3.11A12 12 0 0 0 12 24z" />

      <path
        fill="#FBBC05"
        d="M5.26 14.26a7.2 7.2 0 0 1 0-4.52V6.63H1.28a12 12 0 0 0 0 10.74l3.98-3.11z" />

      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l3.98 3.11C6.21 6.86 8.87 4.75 12 4.75z" />

    </svg>);

}

export function GithubMark() {
  return (
    <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.38-3.88-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.09 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.28.74-1.57-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>);

}

/** زر مزوّد خارجي (Google / GitHub). */
export function OAuthButton({
  provider,
  label,
  onClick
}: {provider: "google" | "github";label: string;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-[#030712]/50 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:bg-[#0c1222]">

      {provider === "google" ? <GoogleMark /> : <GithubMark />}
      <span>{label}</span>
      <ChevronRight className="absolute right-4 h-5 w-5 text-slate-500" aria-hidden />
    </button>);

}

/** فاصل «أو». */
export function AuthDivider() {
  return (
    <div className="relative my-4 text-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <span className="relative rounded-full bg-[#070c18] px-3 text-xs text-slate-400">أو</span>
    </div>);

}

export interface AuthShellProps {
  children: React.ReactNode;
  /**
   * عرض الكارت الرئيسي على الشاشات الكبيرة — يجب أن يكون كلاساً كاملاً
   * مسبوقاً بـ `lg:` (مثل `lg:w-[440px]`) حتى يبقى الكارت بعرض كامل على
   * الموبايل. لا نبني الكلاس ديناميكياً لأن Tailwind لا يرى النصوص المركّبة.
   */
  cardWidthClass?: string;
  /** توسيط الكارت رأسياً (الـ onboarding) أو تمديده (login/register). */
  align?: "stretch" | "center";
}

export function AuthShell({
  children,
  cardWidthClass = "lg:w-[450px]",
  align = "stretch"
}: AuthShellProps) {
  return (
    <div
      className="relative flex min-h-screen w-full select-none flex-col justify-between overflow-hidden bg-[#030611] p-6 font-sans text-white lg:min-h-[850px] lg:p-8"
      dir="ltr">

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={AUTH_BACKGROUND}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-90 contrast-105" />

        <div className="absolute inset-0 bg-black/30" />
      </div>

      <header className="relative z-20 flex justify-end">
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-between py-2">
        <div
          className={`flex w-full flex-1 flex-col gap-8 lg:flex-row lg:gap-4 ${
          align === "center" ? "lg:items-center" : "lg:items-stretch"} lg:min-h-[680px] justify-start`
          }>

          <div className={`flex w-full max-w-full shrink-0 flex-col ${cardWidthClass}`}>
            {children}
          </div>

          {/* النص الترحيبي — نفسه في تسجيل الدخول وإنشاء الحساب والـ onboarding */}
          <div className="space-y-4 pt-4 text-right font-sans" dir="rtl">
            <p className="flex items-center justify-start gap-2 text-lg font-medium text-slate-100">
              <span>مرحباً بك مجدداً</span>
              <span className="inline-block -rotate-12 text-2xl" aria-hidden>
                👋
              </span>
            </p>
            <h2 className="text-5xl font-black leading-[1.2] tracking-tight text-white lg:text-6xl">
              اقرأ أكثر...
              <br />
              <span className="bg-gradient-to-r from-[#00d2ff] via-[#a855f7] to-[#e2e8f0] bg-clip-text text-transparent">
                وتحدث بثقة.
              </span>
            </h2>
            <p className="pt-1 text-base font-normal text-slate-300 opacity-90">
              قصص ملهمة، تعلم ذكي، تقدم مستمر
            </p>
            <div className="mt-4 h-[3px] w-48 rounded-full bg-gradient-to-r from-[#00d2ff] via-[#a855f7] to-[#ec4899] shadow-[0_0_12px_rgba(0,210,255,0.4)]" />
          </div>
        </div>

        <div className="mt-auto w-full max-w-[780px] pt-6 lg:ml-auto lg:mr-[10%]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" dir="ltr">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`flex h-[130px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#070c1a]/50 p-4 text-center backdrop-blur-md transition-all ${feature.hover}`}>

                  <Icon className={`mb-1.5 h-7 w-7 shrink-0 ${feature.color}`} aria-hidden />
                  <h2 className="mb-0.5 text-base font-bold text-white">{feature.title}</h2>
                  <p className="text-xs leading-snug text-slate-300" dir="rtl">
                    {feature.body}
                  </p>
                </div>);

            })}
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex justify-center pb-1 pt-2" dir="rtl">
        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>بياناتك آمنة معنا</span>
        </div>
      </footer>
    </div>);

}

/** الكارت الزجاجي الذي تعيش داخله المحتويات. */
export function AuthCard({
  children,
  className = ""
}: {children: React.ReactNode;className?: string;}) {
  return (
    <div
      className={`flex flex-col rounded-[28px] border border-white/10 bg-[#050914]/60 p-8 shadow-[0_0_35px_rgba(56,189,248,0.12)] backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/30 ${className}`}>

      {children}
    </div>);

}

export default AuthShell;