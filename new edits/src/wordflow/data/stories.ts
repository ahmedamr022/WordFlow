/**
 * WordFlow — story fixtures used to DEMONSTRATE the duplication bug and its fix.
 *
 * `STATIC_STORIES` mirrors `src/data/stories.ts` (hand-written ids).
 * `DB_STORY_ROWS` mirrors what Supabase returns after the seed script ran with
 * a *different* slugify implementation — notice:
 *   • "titanic-legend"  vs  "the-titanic-legend"   → slug drift
 *   • "ready-to-learn"  vs  "ready-to-learn-copy-2" → admin duplicate action
 *   • "keep-going"      → identical slug (the only case the old Map caught)
 *
 * Feed both arrays into `mergeStoryCatalog()` and every pair collapses.
 */

import type { StoryItem } from '../types';

export const STATIC_STORIES: StoryItem[] = [
{
  id: 'titanic-legend',
  slug: 'titanic-legend',
  titleEn: 'The Titanic Legend',
  titleAr: 'أسطورة التايتانيك',
  level: 'B1',
  duration: '8 دقائق',
  rating: '4.8',
  xp: '+40 XP',
  progress: 45,
  cover: "/0ac2123e-b83a-4685-ac82-835b0e4fc1bf.jpg",

  descriptionAr: 'قصة السفينة الأشهر في التاريخ بمفردات مستوى B1.',
  createdAt: null
},
{
  id: 'ready-to-learn',
  slug: 'ready-to-learn',
  titleEn: 'Ready To Learn',
  titleAr: 'جاهز للتعلم',
  level: 'A2',
  duration: '5 دقائق',
  rating: '4.6',
  xp: '+25 XP',
  progress: 100,
  cover: "/e8169354-033f-4f22-b1d1-db2b1733a68d.jpg",

  descriptionAr: 'قصة تمهيدية قصيرة لبناء عادة القراءة اليومية.',
  createdAt: null
},
{
  id: 'keep-going',
  slug: 'keep-going',
  titleEn: 'Keep Going',
  titleAr: 'واصل التقدم',
  level: 'A2',
  duration: '6 دقائق',
  rating: '4.5',
  xp: '+30 XP',
  progress: 20,
  cover: "/271c701b-16f1-4209-9bf1-e5282bf390ed.jpg",

  descriptionAr: 'عن الإصرار وبناء سلسلة تعلم لا تنقطع.',
  createdAt: null
},
{
  id: 'first-flight',
  slug: 'first-flight',
  titleEn: 'First Flight',
  titleAr: 'الرحلة الأولى',
  level: 'B1',
  duration: '7 دقائق',
  rating: '4.7',
  xp: '+35 XP',
  cover: "/3f6e6c83-a595-43e4-9a91-f85c3116b399.jpg",

  descriptionAr: 'تجربة أول سفر بالطائرة ومفردات المطار.',
  createdAt: null,
  isNew: true
}];


export const DB_STORY_ROWS: StoryItem[] = [
{
  id: 'the-titanic-legend',
  slug: 'the-titanic-legend', // ← slug drift, same story
  titleEn: 'The Titanic Legend',
  titleAr: 'أسطورة التايتانيك',
  level: 'B1',
  duration: '8 دقائق',
  rating: '4.8',
  xp: '+40 XP',
  cover: '',
  descriptionAr: '',
  createdAt: '2026-07-02T10:00:00.000Z'
},
{
  id: 'ready-to-learn-copy-2',
  slug: 'ready-to-learn-copy-2', // ← admin "duplicate" action
  titleEn: 'Ready To Learn',
  titleAr: 'جاهز للتعلم',
  level: 'A2',
  duration: '5 دقائق',
  rating: '4.6',
  xp: '+25 XP',
  cover: '',
  descriptionAr: 'قصة تمهيدية قصيرة.',
  createdAt: '2026-07-18T09:30:00.000Z'
},
{
  id: 'keep-going',
  slug: 'keep-going', // ← identical slug (old code handled only this)
  titleEn: 'Keep Going',
  titleAr: 'واصل التقدم',
  level: 'A2',
  duration: '6 دقائق',
  rating: '4.5',
  xp: '+30 XP',
  cover: '',
  createdAt: '2026-06-21T12:00:00.000Z'
},
{
  id: 'city-of-lights',
  slug: 'city-of-lights',
  titleEn: 'City Of Lights',
  titleAr: 'مدينة الأنوار',
  level: 'B2',
  duration: '9 دقائق',
  rating: '4.9',
  xp: '+45 XP',
  cover: "/9d5a6cb4-5d4c-4180-877b-8667d0fc1dd2.jpg",

  descriptionAr: 'قصة من قلب باريس بمفردات متقدمة.',
  createdAt: '2026-08-01T08:00:00.000Z',
  isNew: true
}];


export const PLAYABLE_STORY_KEYS = [
'ready-to-learn',
'keep-going',
'titanic-legend',
'city-of-lights'];