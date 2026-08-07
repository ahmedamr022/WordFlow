/**
 * WordFlow — icon registry.
 *
 * Category data stores an icon *name* (string) so it can live in the database.
 * This registry is the only place that maps a name to a lucide component.
 */

import {
  BriefcaseIcon,
  BookOpenIcon,
  DumbbellIcon,
  HeartIcon,
  LeafIcon,
  MessagesSquareIcon,
  PlaneIcon,
  UtensilsIcon,
  GraduationCapIcon,
  SparklesIcon,
  type LucideIcon } from
'lucide-react';

const REGISTRY: Record<string, LucideIcon> = {
  plane: PlaneIcon,
  'graduation-cap': GraduationCapIcon,
  book: BookOpenIcon,
  dumbbell: DumbbellIcon,
  heart: HeartIcon,
  leaf: LeafIcon,
  messages: MessagesSquareIcon,
  briefcase: BriefcaseIcon,
  utensils: UtensilsIcon
};

export function resolveIcon(name: string): LucideIcon {
  return REGISTRY[name] ?? SparklesIcon;
}

export const ACCENTS = {
  teal: {
    text: 'text-brand-teal',
    bg: 'bg-brand-teal/12',
    border: 'border-brand-teal/25',
    ring: '#2de2c5',
    bar: 'bg-brand-teal'
  },
  purple: {
    text: 'text-brand-purple',
    bg: 'bg-brand-purple/14',
    border: 'border-brand-purple/25',
    ring: '#7c6cff',
    bar: 'bg-brand-purple'
  },
  pink: {
    text: 'text-brand-pink',
    bg: 'bg-brand-pink/12',
    border: 'border-brand-pink/25',
    ring: '#ff4d7a',
    bar: 'bg-brand-pink'
  },
  cyan: {
    text: 'text-brand-cyan',
    bg: 'bg-brand-cyan/12',
    border: 'border-brand-cyan/25',
    ring: '#00f2fe',
    bar: 'bg-brand-cyan'
  },
  gold: {
    text: 'text-brand-gold',
    bg: 'bg-brand-gold/12',
    border: 'border-brand-gold/25',
    ring: '#fbbf24',
    bar: 'bg-brand-gold'
  },
  coral: {
    text: 'text-brand-coral',
    bg: 'bg-brand-coral/12',
    border: 'border-brand-coral/25',
    ring: '#ff6b6b',
    bar: 'bg-brand-coral'
  }
} as const;

export type AccentToken = keyof typeof ACCENTS;