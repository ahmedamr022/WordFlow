import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3Icon,
  BookOpenIcon,
  CrownIcon,
  HeartIcon,
  HomeIcon,
  LayersIcon,
  MoonIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ChevronLeftIcon } from
'lucide-react';
import { cx } from '../ui/Primitives';

const NAV = [
{ label: 'الرئيسية', to: '/', icon: HomeIcon },
{ label: 'المفردات', to: '/words', icon: BookOpenIcon },
{ label: 'القصص', to: '/stories', icon: LayersIcon },
{ label: 'المسارات', to: '/paths', icon: LayersIcon },
{ label: 'الإحصائيات', to: '/stats', icon: BarChart3Icon },
{ label: 'التحديات', to: '/challenges', icon: TrophyIcon },
{ label: 'المفضلة', to: '/favorites', icon: HeartIcon },
{ label: 'الإعدادات', to: '/settings', icon: SettingsIcon }];


export function Sidebar() {
  return (
    <aside
      className="hidden w-[210px] shrink-0 flex-col border-r border-white/[0.05] bg-ink-900 lg:flex"
      aria-label="التنقل الرئيسي">
      
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan text-lg font-black text-white">
          W
        </span>
        <span className="font-en text-lg font-bold tracking-tight text-white">
          WordFlow
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map(({ label, to, icon: Icon }) =>
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
          cx(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
            isActive ?
            'bg-brand-purple/18 font-semibold text-white shadow-[inset_0_0_0_1px_rgba(124,108,255,0.3)]' :
            'text-white/55 hover:bg-white/[0.04] hover:text-white/90'
          )
          }>
          
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        )}

        <NavLink
          to="/admin"
          className={({ isActive }) =>
          cx(
            'mt-2 flex items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 text-sm transition',
            isActive ?
            'border-brand-teal/40 bg-brand-teal/12 font-semibold text-brand-teal' :
            'border-white/[0.08] text-white/45 hover:border-white/20 hover:text-white/80'
          )
          }>
          
          <ShieldCheckIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          <span>لوحة التحكم</span>
        </NavLink>
      </nav>

      <div className="px-3 pb-3">
        <div className="rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/12 to-transparent p-4 text-center">
          <CrownIcon
            className="mx-auto mb-2 h-5 w-5 text-brand-gold"
            aria-hidden="true" />
          
          <p className="text-sm font-bold text-white">WordFlow Premium</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/45">
            فتح كل الميزات وتجربة تعلم بدون حدود
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-gradient-to-l from-brand-cyan via-brand-purple to-brand-pink py-2 text-xs font-bold text-white shadow-glow-purple transition hover:brightness-110">
            
            ترقية الآن
          </button>
        </div>
      </div>

      <div className="px-3 pb-5">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-xs text-white/60 transition hover:text-white">
          
          <span className="inline-flex items-center gap-2">
            <MoonIcon className="h-4 w-4" aria-hidden="true" />
            الوضع الليلي
          </span>
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>);

}