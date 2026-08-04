import { Course, Story } from "@/types";
import {
  Heart,
  Compass,
  Rocket,
  Eye,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export interface ExtendedStory extends Story {
  descriptionAr: string;
  descriptionEn: string;
  coverImage: string;
}

export interface StoryItem {
  id: string;
  titleEn: string;
  titleAr: string;
  level: string;
  duration: string;
  rating: string;
  xp: string;
  progress?: number;
  cover: string;
  isNew?: boolean;
  isLocked?: boolean;
}

// 🌟 الآن يحتوي MAIN_STORIES على جميع القصص (12 قصة) ليفعل كارت "+X المزيد" تلقائياً
export const MAIN_STORIES: StoryItem[] = [
  {
    id: "titanic",
    titleEn: "The Legend of Titanic",
    titleAr: "أسطورة السفينة التايتانيك",
    level: "B1",
    duration: "10 دقيقة",
    rating: "4.9",
    xp: "250 XP",
    progress: 65,
    cover: "/images/titanic.jpg",
    isNew: true,
  },
  {
    id: "sherlock",
    titleEn: "Sherlock Holmes",
    titleAr: "مغامرات هولمز",
    level: "B2",
    duration: "12 دقيقة",
    rating: "4.8",
    xp: "220 XP",
    progress: 40,
    cover: "/images/sherlock.jpg",
  },
  {
    id: "gatsby",
    titleEn: "The Great Gatsby",
    titleAr: "غاتسبي العظيم",
    level: "B1",
    duration: "8 دقيقة",
    rating: "4.7",
    xp: "200 XP",
    progress: 30,
    cover: "/images/gatsby.jpg",
  },
  {
    id: "pride",
    titleEn: "Pride & Prejudice",
    titleAr: "كبرياء وتحامل",
    level: "B1",
    duration: "15 دقيقة",
    rating: "4.6",
    xp: "180 XP",
    progress: 55,
    cover: "/images/pride.jpg",
  },
  {
    id: "romeo-juliet",
    titleEn: "Romeo & Juliet",
    titleAr: "روميو وجولييت",
    level: "A2",
    duration: "9 دقيقة",
    rating: "4.8",
    xp: "190 XP",
    cover: "/images/romeo.jpg",
  },
  {
    id: "ready-to-learn",
    titleEn: "Ready to Learn",
    titleAr: "مستعد للتعلم",
    level: "A1",
    duration: "5 دقيقة",
    rating: "4.5",
    xp: "120 XP",
    cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800",
  },
  {
    id: "keep-going",
    titleEn: "Keep Going",
    titleAr: "استمر في التقدم",
    level: "A1",
    duration: "6 دقيقة",
    rating: "4.7",
    xp: "130 XP",
    cover: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800",
  },
  {
    id: "magic-bookshelf",
    titleEn: "The Magic Bookshelf",
    titleAr: "الرف السحري للكتب",
    level: "A1",
    duration: "7 دقيقة",
    rating: "4.6",
    xp: "140 XP",
    cover: "/images/bookshelf.jpg",
  },
  {
    id: "the-letter",
    titleEn: "The Letter",
    titleAr: "الرسالة الغامضة",
    level: "A2",
    duration: "8 دقيقة",
    rating: "4.4",
    xp: "150 XP",
    cover: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800",
  },
  {
    id: "night-in-cairo",
    titleEn: "A Night in Cairo",
    titleAr: "ليلة في القاهرة",
    level: "A2",
    duration: "10 دقيقة",
    rating: "4.9",
    xp: "180 XP",
    cover: "/images/cairo.jpg",
  },
  {
    id: "moby-dick",
    titleEn: "Moby Dick",
    titleAr: "موبي ديك",
    level: "B2",
    duration: "14 دقيقة",
    rating: "4.5",
    xp: "210 XP",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800",
  },
  {
    id: "alice-wonderland",
    titleEn: "Alice in Wonderland",
    titleAr: "أليس في بلاد العجائب",
    level: "A2",
    duration: "11 دقيقة",
    rating: "4.8",
    xp: "160 XP",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800",
  },
];

export const RECOMMENDED_STORIES_DATA: StoryItem[] = [
  {
    id: "time-machine",
    titleEn: "The Time Machine",
    titleAr: "آلة الزمن",
    level: "B1",
    duration: "7 دقيقة",
    rating: "4.5",
    xp: "150 XP",
    cover: "/images/time-machine.png",
    isLocked: true,
  },
  {
    id: "jekyll",
    titleEn: "Dr. Jekyll & Mr. Hyde",
    titleAr: "د. جيكل والسيد هايد",
    level: "B2",
    duration: "11 دقيقة",
    rating: "4.5",
    xp: "170 XP",
    cover: "/images/jekyll.png",
    isLocked: true,
  },
  {
    id: "oz",
    titleEn: "The Wonderful Wizard of Oz",
    titleAr: "ساحر أوز الرائع",
    level: "A2",
    duration: "9 دقيقة",
    rating: "4.4",
    xp: "160 XP",
    cover: "/images/oz.png",
    isLocked: true,
  },
  {
    id: "frankenstein",
    titleEn: "Frankenstein",
    titleAr: "فرانكشتاين",
    level: "B2",
    duration: "13 دقيقة",
    rating: "4.4",
    xp: "190 XP",
    cover: "/images/frankenstein.png",
    isLocked: true,
  },
  {
    id: "tom-sawyer",
    titleEn: "The Adventures of Tom Sawyer",
    titleAr: "مغامرات توم سوير",
    level: "A2",
    duration: "10 دقيقة",
    rating: "4.3",
    xp: "150 XP",
    cover: "/images/student.jpg",
    isLocked: true,
  },
];

export const STORY_CATEGORIES = [
  { name: "رومانسية", count: "8 قصة", icon: Heart, color: "text-pink-400" },
  { name: "مغامرة", count: "12 قصة", icon: Compass, color: "text-pink-400" },
  { name: "خيال علمي", count: "7 قصة", icon: Rocket, color: "text-cyan-400" },
  { name: "غموض", count: "15 قصة", icon: Eye, color: "text-purple-400" },
  { name: "تعليمية", count: "5 قصة", icon: GraduationCap, color: "text-emerald-400" },
  { name: "كلاسيكيات", count: "20 قصة", icon: BookOpen, color: "text-cyan-400" },
];

export const SAMPLE_COURSES: Course[] = [
  {
    id: "start-simple",
    title: "Start Simple",
    titleAr: "البداية البسيطة",
    descriptionAr: "قصص ملهمة لتبدأ بها خطوتك الأولى في اللغة الإنجليزية بكل ثقة.",
    cefrLevel: "A1",
    storyCount: 3,
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    stories: [
      {
        id: "ready-to-learn",
        title: "Ready to Learn",
        titleAr: "مستعد للتعلم",
        courseId: "start-simple",
        cefrLevel: "A1",
        totalLines: 5,
        totalWords: 28,
        estimatedMinutes: 3,
        descriptionAr: "خطوتك الأولى لبناء عادة يومية متينة وممتعة في قراءة وكتابة اللغة الإنجليزية بثقة.",
        descriptionEn: "Your first step to build a strong daily habit of writing and reading English.",
        coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
        lines: [
          {
            id: 1,
            text: "I am ready to learn.",
            translationAr: "أنا مستعد للتعلم.",
            words: [
              { id: "w1", word: "I", translationAr: "أنا", ipa: "/aɪ/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "w2", word: "am", translationAr: "أكون", ipa: "/æm/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w3", word: "ready", translationAr: "مستعد", ipa: "/ˈred.i/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w4", word: "to", translationAr: "لـ", ipa: "/tuː/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w5", word: "learn", translationAr: "التعلم", ipa: "/lɜːn/", partOfSpeech: "verb", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "English is easy and fun.",
            translationAr: "الإنجليزي سهل وممتع.",
            words: [
              { id: "w6", word: "English", translationAr: "الإنجليزية", ipa: "/ˈɪŋ.ɡlɪʃ/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w7", word: "is", translationAr: "يكون", ipa: "/ɪz/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w8", word: "easy", translationAr: "سهل", ipa: "/ˈiː.zi/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w9", word: "and", translationAr: "و", ipa: "/ænd/", partOfSpeech: "conjunction", cefrLevel: "A1" },
              { id: "w10", word: "fun", translationAr: "ممتع", ipa: "/fʌn/", partOfSpeech: "adjective", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "Practice every single day.",
            translationAr: "تدرب كل يوم بدون استثناء.",
            words: [
              { id: "w11", word: "Practice", translationAr: "تدرب", ipa: "/ˈpræk.tɪs/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w12", word: "every", translationAr: "كل", ipa: "/ˈev.ri/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w13", word: "single", translationAr: "واحد / مفرد", ipa: "/ˈsɪŋ.ɡəl/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "w14", word: "day", translationAr: "يوم", ipa: "/deɪ/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 4,
            text: "Listen carefully to each word.",
            translationAr: "استمع بعناية لكل كلمة.",
            words: [
              { id: "w15", word: "Listen", translationAr: "استمع", ipa: "/ˈlɪs.ən/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w16", word: "carefully", translationAr: "بعناية", ipa: "/ˈkeə.fəl.i/", partOfSpeech: "adverb", cefrLevel: "A2" },
              { id: "w16_2", word: "to", translationAr: "إلى", ipa: "/tuː/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w16_3", word: "each", translationAr: "كل", ipa: "/iːtʃ/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w16_4", word: "word", translationAr: "كلمة", ipa: "/wɜːd/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 5,
            text: "Your progress starts right now.",
            translationAr: "تقدمك يبدأ في هذه اللحظة بالذات.",
            words: [
              { id: "w16_5", word: "Your", translationAr: "الخاص بك", ipa: "/jɔːr/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w17", word: "progress", translationAr: "تقدم", ipa: "/ˈprəʊ.ɡres/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "w18", word: "starts", translationAr: "يبدأ", ipa: "/stɑːts/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w19_1", word: "right", translationAr: "مباشرة / بالذات", ipa: "/raɪt/", partOfSpeech: "adverb", cefrLevel: "A2" },
              { id: "w19_2", word: "now", translationAr: "الآن", ipa: "/naʊ/", partOfSpeech: "adverb", cefrLevel: "A1" }
            ]
          }
        ]
      },
      {
        id: "keep-going",
        title: "Keep Going",
        titleAr: "استمر في التقدم",
        courseId: "start-simple",
        cefrLevel: "A1",
        totalLines: 4,
        totalWords: 24,
        estimatedMinutes: 3,
        descriptionAr: "الاستمرارية هي سر التطور. اقرأ عن أهمية الخطوات الصغيرة في تحقيق الأهداف العظيمة.",
        descriptionEn: "Consistency is the key to progress. Read about small steps towards big goals.",
        coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
        lines: [
          {
            id: 1,
            text: "Small steps bring big results.",
            translationAr: "الخطوات الصغيرة تجلب نتائج كبيرة.",
            words: [
              { id: "w20", word: "Small", translationAr: "صغيرة", ipa: "/smɔːl/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w21", word: "steps", translationAr: "خطوات", ipa: "/steps/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w22", word: "bring", translationAr: "تجلب", ipa: "/brɪŋ/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w23", word: "big", translationAr: "كبيرة", ipa: "/bɪɡ/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w24", word: "results", translationAr: "نتائج", ipa: "/rɪˈzʌlts/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 2,
            text: "Never stop trying your best.",
            translationAr: "لا تتوقف أبداً عن تقديم أفضل ما لديك.",
            words: [
              { id: "w25", word: "Never", translationAr: "أبداً", ipa: "/ˈnev.ər/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "w26", word: "stop", translationAr: "تتوقف", ipa: "/stɒp/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w26_1", word: "trying", translationAr: "محاولة", ipa: "/ˈtraɪ.ɪŋ/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w26_2", word: "your", translationAr: "الخاص بك", ipa: "/jɔːr/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w27", word: "best", translationAr: "الأفضل", ipa: "/best/", partOfSpeech: "adjective", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "You can achieve your goals.",
            translationAr: "يمكنك تحقيق أهدافك.",
            words: [
              { id: "w27_1", word: "You", translationAr: "أنت", ipa: "/juː/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "w27_2", word: "can", translationAr: "تستطيع", ipa: "/kæn/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w28", word: "achieve", translationAr: "تحقيق", ipa: "/əˈtʃiːv/", partOfSpeech: "verb", cefrLevel: "B1" },
              { id: "w28_1", word: "your", translationAr: "أهدافك", ipa: "/jɔːr/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w28_2", word: "goals", translationAr: "أهداف", ipa: "/ɡəʊlz/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "Trust yourself and move forward.",
            translationAr: "ثق بنفسك وتقدم إلى الأمام.",
            words: [
              { id: "w29", word: "Trust", translationAr: "ثق", ipa: "/trʌst/", partOfSpeech: "verb", cefrLevel: "B1" },
              { id: "w29_1", word: "yourself", translationAr: "نفسك", ipa: "/jɔːˈself/", partOfSpeech: "pronoun", cefrLevel: "A2" },
              { id: "w29_2", word: "and", translationAr: "و", ipa: "/ænd/", partOfSpeech: "conjunction", cefrLevel: "A1" },
              { id: "w29_3", word: "move", translationAr: "تحرك / تقدم", ipa: "/muːv/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w29_4", word: "forward", translationAr: "إلى الأمام", ipa: "/ˈfɔː.wəd/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          }
        ]
      },
      {
        id: "magic-bookshelf",
        title: "The Magic Bookshelf",
        titleAr: "الرف السحري للكتب",
        courseId: "start-simple",
        cefrLevel: "A1",
        totalLines: 4,
        totalWords: 26,
        estimatedMinutes: 3,
        descriptionAr: "عن شغف القراءة واكتشاف عوالم ومعارف جديدة في أوقات المساء الهادئة.",
        descriptionEn: "Discovering new worlds and quiet evening knowledge through reading.",
        coverImage: "/images/bookshelf.jpg",
        lines: [
          {
            id: 1,
            text: "Books open doors to new worlds.",
            translationAr: "الكتب تفتح أبواباً لعوالم جديدة.",
            words: [
              { id: "w50", word: "Books", translationAr: "كتب", ipa: "/bʊks/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w50_1", word: "open", translationAr: "تفتح", ipa: "/ˈəʊ.pən/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w51", word: "doors", translationAr: "أبواب", ipa: "/dɔːrz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w51_1", word: "to", translationAr: "إلى", ipa: "/tuː/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w51_2", word: "new", translationAr: "جديدة", ipa: "/njuː/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w51_3", word: "worlds", translationAr: "عوالم", ipa: "/wɜːldz/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 2,
            text: "Read quietly every single evening.",
            translationAr: "اقرأ بهدوء كل مساء.",
            words: [
              { id: "w51_4", word: "Read", translationAr: "اقرأ", ipa: "/riːd/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w52", word: "quietly", translationAr: "بهدوء", ipa: "/ˈkwaɪ.ət.li/", partOfSpeech: "adverb", cefrLevel: "A2" },
              { id: "w52_1", word: "every", translationAr: "كل", ipa: "/ˈev.ri/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w52_2", word: "single", translationAr: "واحد", ipa: "/ˈsɪŋ.ɡəl/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "w52_3", word: "evening", translationAr: "مساء", ipa: "/ˈiːv.nɪŋ/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "Knowledge is true inner power.",
            translationAr: "المعرفة هي القوة الداخلية الحقيقية.",
            words: [
              { id: "w53", word: "Knowledge", translationAr: "معرفة", ipa: "/ˈnɒl.ɪdʒ/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "w53_1", word: "is", translationAr: "تكون", ipa: "/ɪz/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w53_2", word: "true", translationAr: "حقيقية", ipa: "/truː/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "w53_3", word: "inner", translationAr: "داخلية", ipa: "/ˈɪn.ər/", partOfSpeech: "adjective", cefrLevel: "B2" },
              { id: "w53_4", word: "power", translationAr: "قوة", ipa: "/paʊər/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "Every page holds a new secret.",
            translationAr: "كل صفحة تحمل سرّاً جديداً.",
            words: [
              { id: "w53_5", word: "Every", translationAr: "كل", ipa: "/ˈev.ri/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w53_6", word: "page", translationAr: "صفحة", ipa: "/peɪdʒ/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w53_7", word: "holds", translationAr: "تحمل", ipa: "/həʊldz/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "w53_8", word: "a", translationAr: "أداة تنكير", ipa: "/ə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w53_9", word: "new", translationAr: "جديد", ipa: "/njuː/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w54", word: "secret", translationAr: "سر", ipa: "/ˈsiː.krət/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "daily-life",
    title: "Daily Life Stories",
    titleAr: "قصص من الحياة اليومية",
    descriptionAr: "مواقف واقعية ترفع حصيلتك من الكلمات والمفردات المستعملة يومياً.",
    cefrLevel: "A2",
    storyCount: 2,
    coverImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
    stories: [
      {
        id: "the-letter",
        title: "The Letter",
        titleAr: "الرسالة الغامضة",
        courseId: "daily-life",
        cefrLevel: "A2",
        totalLines: 4,
        totalWords: 30,
        estimatedMinutes: 4,
        descriptionAr: "رسالة هادئة وصلت في الصباح الباكر، لتسرد قصة مليئة بالمشاعر والترقب.",
        descriptionEn: "A quiet morning letter arriving to unlock a story full of subtle excitement.",
        coverImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
        lines: [
          {
            id: 1,
            text: "She glanced at the letter on the table.",
            translationAr: "نظرت بإمعان إلى الرسالة على الطاولة.",
            words: [
              { id: "w39_1", word: "She", translationAr: "هي", ipa: "/ʃiː/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "w40", word: "glanced", translationAr: "ألقت نظرة", ipa: "/ɡlɑːnst/", partOfSpeech: "verb", cefrLevel: "B1" },
              { id: "w40_1", word: "at", translationAr: "إلى", ipa: "/æt/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w40_2", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w41", word: "letter", translationAr: "الرسالة", ipa: "/ˈlet.ər/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w41_1", word: "on", translationAr: "على", ipa: "/ɒn/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w42", word: "table", translationAr: "الطاولة", ipa: "/ˈteɪ.bəl/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "It had arrived early that morning.",
            translationAr: "وصلت في وقت مبكر من ذلك الصباح.",
            words: [
              { id: "w42_1", word: "It", translationAr: "هي (غير عاقل)", ipa: "/ɪt/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "w42_2", word: "had", translationAr: "كانت", ipa: "/hæd/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w43", word: "arrived", translationAr: "وصلت", ipa: "/əˈraɪvd/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "w43_1", word: "early", translationAr: "مبكراً", ipa: "/ˈɜː.li/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "w43_2", word: "that", translationAr: "ذلك", ipa: "/ðæt/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w44", word: "morning", translationAr: "الصباح", ipa: "/ˈmɔː.nɪŋ/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "Her hands trembled with quiet excitement.",
            translationAr: "ارتجفت يداها بإثارة هادئة.",
            words: [
              { id: "w44_1", word: "Her", translationAr: "خاصتها", ipa: "/hɜːr/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w44_2", word: "hands", translationAr: "يدان", ipa: "/hændz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w45", word: "trembled", translationAr: "ارتجفت", ipa: "/ˈtrem.bəld/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "w45_1", word: "with", translationAr: "بـ", ipa: "/wɪð/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w45_2", word: "quiet", translationAr: "هادئة", ipa: "/ˈkwaɪ.ət/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "w45_3", word: "excitement", translationAr: "إثارة", ipa: "/ɪkˈsaɪt.mənt/", partOfSpeech: "noun", cefrLevel: "B1" }
            ]
          },
          {
            id: 4,
            text: "The ink carried words of hope.",
            translationAr: "حمل الحبر كلمات مليئة بالأمل.",
            words: [
              { id: "w45_4", word: "The", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w45_5", word: "ink", translationAr: "الحبر", ipa: "/ɪŋk/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "w45_6", word: "carried", translationAr: "حمل", ipa: "/ˈkær.id/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "w45_7", word: "words", translationAr: "كلمات", ipa: "/wɜːdz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w45_8", word: "of", translationAr: "من", ipa: "/ɒv/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w46", word: "hope", translationAr: "أمل", ipa: "/həʊp/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          }
        ]
      },
      {
        id: "night-in-cairo",
        title: "A Night in Cairo",
        titleAr: "ليلة في القاهرة",
        courseId: "daily-life",
        cefrLevel: "A2",
        totalLines: 4,
        totalWords: 32,
        estimatedMinutes: 4,
        descriptionAr: "سحر النيل والنجوم المتلألئة في شوارع القاهرة القديمة وأجوائها الدافئة.",
        descriptionEn: "The magical sparkling Nile and warm breezes of ancient Cairo night streets.",
        coverImage: "/images/cairo.jpg",
        lines: [
          {
            id: 1,
            text: "The Nile river sparkled under the stars.",
            translationAr: "تألأت مياه نهر النيل تحت النجوم.",
            words: [
              { id: "w59_1", word: "The", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w59_2", word: "Nile", translationAr: "النيل", ipa: "/naɪl/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w59_3", word: "river", translationAr: "نهر", ipa: "/ˈrɪv.ər/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w60", word: "sparkled", translationAr: "تألقت", ipa: "/ˈspɑː.kəld/", partOfSpeech: "verb", cefrLevel: "B1" },
              { id: "w60_1", word: "under", translationAr: "تحت", ipa: "/ˈʌn.dər/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w60_2", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w60_3", word: "stars", translationAr: "النجوم", ipa: "/stɑːz/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "Warm breeze filled the ancient city streets.",
            translationAr: "ملأ النسيم الدافئ شوارع المدينة القديمة.",
            words: [
              { id: "w60_4", word: "Warm", translationAr: "دافئ", ipa: "/wɔːm/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w61", word: "breeze", translationAr: "نسيم", ipa: "/briːz/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "w61_1", word: "filled", translationAr: "ملأ", ipa: "/fɪld/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "w61_2", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w61_3", word: "ancient", translationAr: "القديمة", ipa: "/ˈeɪn.ʃənt/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "w61_4", word: "city", translationAr: "المدينة", ipa: "/ˈsɪt.i/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w61_5", word: "streets", translationAr: "شوارع", ipa: "/striːts/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "Every corner whispered stories of long past.",
            translationAr: "همس كل ركن بقصص من الماضي البعيد.",
            words: [
              { id: "w61_6", word: "Every", translationAr: "كل", ipa: "/ˈev.ri/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "w61_7", word: "corner", translationAr: "ركن", ipa: "/ˈkɔː.nər/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "w62", word: "whispered", translationAr: "همس", ipa: "/ˈwɪs.pəd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "w62_1", word: "stories", translationAr: "قصص", ipa: "/ˈstɔː.riːz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w62_2", word: "of", translationAr: "من", ipa: "/ɒv/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "w62_3", word: "long", translationAr: "بعيد / طويل", ipa: "/lɒŋ/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "w62_4", word: "past", translationAr: "الماضي", ipa: "/pɑːst/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "Lights danced beautifully upon the water.",
            translationAr: "رقصت الأضواء بجمال فوق المياه.",
            words: [
              { id: "w62_5", word: "Lights", translationAr: "أضواء", ipa: "/laɪts/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "w63", word: "danced", translationAr: "رقصت", ipa: "/dɑːnst/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "w63_1", word: "beautifully", translationAr: "بجمال", ipa: "/ˈbjuː.tɪ.fəl.i/", partOfSpeech: "adverb", cefrLevel: "A2" },
              { id: "w63_2", word: "upon", translationAr: "فوق / على", ipa: "/əˈpɒn/", partOfSpeech: "preposition", cefrLevel: "B1" },
              { id: "w63_3", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "w63_4", word: "water", translationAr: "الماء", ipa: "/ˈwɔː.tər/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "historical-legends",
    title: "Historical Legends",
    titleAr: "أساطير من التاريخ",
    descriptionAr: "قصص تاريخية عالمية ملهمة ومصممة بحصيلة لغوية راقية.",
    cefrLevel: "B1",
    storyCount: 5,
    coverImage: "/images/titanic.jpg",
    stories: [
      {
        id: "titanic-legend",
        title: "The Legend of Titanic",
        titleAr: "أسطورة السفينة التايتانيك",
        courseId: "historical-legends",
        cefrLevel: "B1",
        totalLines: 6,
        totalWords: 52,
        estimatedMinutes: 5,
        descriptionAr: "قصة السفينة العملاقة التي أبحرت عبر المحيط لتبقى أسطورتها خالدة في تاريخ البشرية.",
        descriptionEn: "The legendary story of the grand ship sailing the ocean, forever in human history.",
        coverImage: "/images/titanic.jpg",
        lines: [
          {
            id: 1,
            text: "The giant ship sailed across the cold ocean.",
            translationAr: "أبحرت السفينة العملاقة عبر المحيط البارد.",
            words: [
              { id: "wt0", word: "The", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "wt1", word: "giant", translationAr: "عملاق", ipa: "/ˈdʒaɪ.ənt/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt1_1", word: "ship", translationAr: "سفينة", ipa: "/ʃɪp/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "wt2", word: "sailed", translationAr: "أبحرت", ipa: "/seɪld/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "wt2_1", word: "across", translationAr: "عبر", ipa: "/əˈkrɒs/", partOfSpeech: "preposition", cefrLevel: "A2" },
              { id: "wt2_2", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "wt3", word: "cold", translationAr: "بارد", ipa: "/kəʊld/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "wt4", word: "ocean", translationAr: "محيط", ipa: "/ˈəʊ.ʃən/", partOfSpeech: "noun", cefrLevel: "B1" }
            ]
          },
          {
            id: 2,
            text: "Passengers admired the elegant grand design.",
            translationAr: "أعجب الركاب بالتصميم الفاخر الأنيق.",
            words: [
              { id: "wt5", word: "Passengers", translationAr: "الركاب", ipa: "/ˈpæs.ən.dʒərz/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "wt6", word: "admired", translationAr: "أعجبوا بـ", ipa: "/ədˈmaɪəd/", partOfSpeech: "verb", cefrLevel: "B1" },
              { id: "wt6_1", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "wt7", word: "elegant", translationAr: "أنيق / راقٍ", ipa: "/ˈel.ɪ.ɡənt/", partOfSpeech: "adjective", cefrLevel: "B2" },
              { id: "wt7_1", word: "grand", translationAr: "فاخر / عظيم", ipa: "/ɡrænd/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt7_2", word: "design", translationAr: "تصميم", ipa: "/dɪˈzaɪn/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 3,
            text: "Music echoed softly through the dining halls.",
            translationAr: "ترددت ألحان الموسيقى بهدوء عبر قاعات الطعام.",
            words: [
              { id: "wt7_3", word: "Music", translationAr: "موسيقى", ipa: "/ˈmjuː.zɪk/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "wt8", word: "echoed", translationAr: "ترددت", ipa: "/ˈek.əʊd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "wt9", word: "softly", translationAr: "بنعومة / بهدوء", ipa: "/ˈsɒft.li/", partOfSpeech: "adverb", cefrLevel: "A2" },
              { id: "wt9_1", word: "through", translationAr: "عبر", ipa: "/θruː/", partOfSpeech: "preposition", cefrLevel: "A2" },
              { id: "wt9_2", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "wt9_3", word: "dining", translationAr: "طعام", ipa: "/ˈdaɪ.nɪŋ/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "wt9_4", word: "halls", translationAr: "قاعات", ipa: "/hɔːlz/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "A sudden iceberg emerged in dark waters.",
            translationAr: "ظهر جبل جليدي مفاجئ في المياه المظلمة.",
            words: [
              { id: "wt9_5", word: "A", translationAr: "أداة تنكير", ipa: "/ə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "wt9_6", word: "sudden", translationAr: "مفاجئ", ipa: "/ˈsʌd.ən/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt10", word: "iceberg", translationAr: "جبل جليدي", ipa: "/ˈaɪs.bɜːɡ/", partOfSpeech: "noun", cefrLevel: "B2" },
              { id: "wt11", word: "emerged", translationAr: "ظهر / برز", ipa: "/ɪˈmɜːdʒd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "wt11_1", word: "in", translationAr: "في", ipa: "/ɪn/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "wt11_2", word: "dark", translationAr: "مظلمة", ipa: "/dɑːk/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "wt11_3", word: "waters", translationAr: "مياه", ipa: "/ˈwɔː.təz/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 5,
            text: "Brave souls stood together until the end.",
            translationAr: "وقفت الأرواح الشجاعة معاً حتى النهاية.",
            words: [
              { id: "wt12", word: "Brave", translationAr: "شجاعة", ipa: "/breɪv/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt13", word: "souls", translationAr: "أرواح", ipa: "/səʊlz/", partOfSpeech: "noun", cefrLevel: "B2" },
              { id: "wt13_1", word: "stood", translationAr: "وقفت", ipa: "/stʊd/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "wt13_2", word: "together", translationAr: "معاً", ipa: "/təˈɡeð.ər/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "wt13_3", word: "until", translationAr: "حتى", ipa: "/ənˈtɪl/", partOfSpeech: "preposition", cefrLevel: "A2" },
              { id: "wt13_4", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "wt13_5", word: "end", translationAr: "النهاية", ipa: "/end/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 6,
            text: "Its memory lives forever in human history.",
            translationAr: "تبقى ذكراها خالدة في التاريخ الإنساني.",
            words: [
              { id: "wt13_6", word: "Its", translationAr: "خاصتها", ipa: "/ɪts/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "wt14", word: "memory", translationAr: "ذكرى", ipa: "/ˈmem.ər.i/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "wt14_1", word: "lives", translationAr: "تعيش / تبقى", ipa: "/lɪvz/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "wt15", word: "forever", translationAr: "للأبد / خالدة", ipa: "/fəˈrev.ər/", partOfSpeech: "adverb", cefrLevel: "A2" },
              { id: "wt15_1", word: "in", translationAr: "في", ipa: "/ɪn/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "wt15_2", word: "human", translationAr: "إنساني / بشري", ipa: "/ˈhjuː.mən/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt16", word: "history", translationAr: "التاريخ", ipa: "/ˈhɪs.tər.i/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          }
        ]
      },
      {
        id: "sherlock-holmes",
        title: "Sherlock Holmes",
        titleAr: "مغامرات هولمز",
        courseId: "historical-legends",
        cefrLevel: "B2",
        totalLines: 5,
        totalWords: 45,
        estimatedMinutes: 5,
        descriptionAr: "تحقيقات الشيرلوك هولمز الذكية في شوارع لندن الضبابية.",
        descriptionEn: "Brilliant mystery investigations in misty London streets.",
        coverImage: "/images/sherlock.jpg",
        lines: [
          {
            id: 1,
            text: "The fog covered the quiet streets of London.",
            translationAr: "غطى الضباب شوارع لندن الهادئة.",
            words: [
              { id: "sh0", word: "The", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "sh1", word: "fog", translationAr: "ضباب", ipa: "/fɒɡ/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "sh2", word: "covered", translationAr: "غطى", ipa: "/ˈkʌv.əd/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "sh3", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "sh4", word: "quiet", translationAr: "هادئة", ipa: "/ˈkwaɪ.ət/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "sh5", word: "streets", translationAr: "شوارع", ipa: "/striːts/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "sh6", word: "of", translationAr: "من", ipa: "/ɒv/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "sh7", word: "London", translationAr: "لندن", ipa: "/ˈlʌn.dən/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "Holmes examined the small mystery clue carefully.",
            translationAr: "فحص هولمز دليل اللغز الصغير بعناية.",
            words: [
              { id: "sh8", word: "Holmes", translationAr: "هولمز", ipa: "/həʊmz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "sh9", word: "examined", translationAr: "فحص", ipa: "/ɪɡˈzæm.ɪnd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "sh10", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "sh11", word: "small", translationAr: "صغير", ipa: "/smɔːl/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "sh12", word: "mystery", translationAr: "لغز", ipa: "/ˈmɪs.tər.i/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "sh13", word: "clue", translationAr: "دليل", ipa: "/kluː/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "sh14", word: "carefully", translationAr: "بعناية", ipa: "/ˈkeə.fəl.i/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          },
          {
            id: 3,
            text: "Watson observed his sharp analytical mind.",
            translationAr: "لاحظ واطسون عقله التحليلي الحاد.",
            words: [
              { id: "sh15", word: "Watson", translationAr: "واطسون", ipa: "/ˈwɒt.sən/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "sh16", word: "observed", translationAr: "لاحظ", ipa: "/əbˈzɜːvd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "sh17", word: "his", translationAr: "خاصته", ipa: "/hɪz/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "sh18", word: "sharp", translationAr: "حاد", ipa: "/ʃɑːp/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "sh19", word: "analytical", translationAr: "تحليلي", ipa: "/ˌæn.əlˈɪt.ɪ.kəl/", partOfSpeech: "adjective", cefrLevel: "C1" },
              { id: "sh20", word: "mind", translationAr: "عقل", ipa: "/maɪnd/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "Every detail revealed a hidden secret.",
            translationAr: "كشفت كل تفصيلة عن سر مخفي.",
            words: [
              { id: "sh21", word: "Every", translationAr: "كل", ipa: "/ˈev.ri/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "sh22", word: "detail", translationAr: "تفصيلة", ipa: "/ˈdiː.teɪl/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "sh23", word: "revealed", translationAr: "كشفت", ipa: "/rɪˈviːld/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "sh24", word: "a", translationAr: "أداة تنكير", ipa: "/ə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "sh25", word: "hidden", translationAr: "مخفي", ipa: "/ˈhɪd.ən/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "sh26", word: "secret", translationAr: "سر", ipa: "/ˈsiː.krət/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 5,
            text: "Truth always wins in the end.",
            translationAr: "الحقيقة تنتصر دائماً في النهاية.",
            words: [
              { id: "sh27", word: "Truth", translationAr: "الحقيقة", ipa: "/truːθ/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "sh28", word: "always", translationAr: "دائماً", ipa: "/ˈɔːl.weɪz/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "sh29", word: "wins", translationAr: "تنتصر", ipa: "/wɪnz/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "sh30", word: "in", translationAr: "في", ipa: "/ɪn/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "sh31", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "sh32", word: "end", translationAr: "النهاية", ipa: "/end/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          }
        ]
      },
      {
        id: "great-gatsby",
        title: "The Great Gatsby",
        titleAr: "غاتسبي العظيم",
        courseId: "historical-legends",
        cefrLevel: "B1",
        totalLines: 5,
        totalWords: 40,
        estimatedMinutes: 4,
        descriptionAr: "أجواء العشرينيات الساحرة وقصة الطموح والأمل.",
        descriptionEn: "The roaring twenties ambient story of ambition and hope.",
        coverImage: "/images/gatsby.jpg",
        lines: [
          {
            id: 1,
            text: "Golden lights sparkled over the quiet bay.",
            translationAr: "تألقت الأضواء الذهبية فوق الخليج الهادئ.",
            words: [
              { id: "gg1", word: "Golden", translationAr: "ذهبي", ipa: "/ˈɡəʊl.dən/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "gg2", word: "lights", translationAr: "أضواء", ipa: "/laɪts/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "gg3", word: "sparkled", translationAr: "تألقت", ipa: "/ˈspɑː.kəld/", partOfSpeech: "verb", cefrLevel: "B1" },
              { id: "gg4", word: "over", translationAr: "فوق", ipa: "/ˈəʊ.vər/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "gg5", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "gg6", word: "quiet", translationAr: "هادئ", ipa: "/ˈkwaɪ.ət/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "gg7", word: "bay", translationAr: "خليج", ipa: "/beɪ/", partOfSpeech: "noun", cefrLevel: "B1" }
            ]
          },
          {
            id: 2,
            text: "Gatsby looked at the green light across.",
            translationAr: "نظر غاتسبي إلى الضوء الأخضر في الجانب الآخر.",
            words: [
              { id: "gg8", word: "Gatsby", translationAr: "غاتسبي", ipa: "/ˈɡæts.bi/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "gg9", word: "looked", translationAr: "نظر", ipa: "/lʊkt/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "gg10", word: "at", translationAr: "إلى", ipa: "/æt/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "gg11", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "gg12", word: "green", translationAr: "أخضر", ipa: "/ɡriːn/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "gg13", word: "light", translationAr: "ضوء", ipa: "/laɪt/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "gg14", word: "across", translationAr: "في الجانب الآخر", ipa: "/əˈkrɒs/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          },
          {
            id: 3,
            text: "Grand music played during the summer parties.",
            translationAr: "عزفت الموسيقى الرائعة خلال حفلات الصيف.",
            words: [
              { id: "gg15", word: "Grand", translationAr: "عظيمة / رائعة", ipa: "/ɡrænd/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "gg16", word: "music", translationAr: "موسيقى", ipa: "/ˈmjuː.zɪk/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "gg17", word: "played", translationAr: "عزفت", ipa: "/pleɪd/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "gg18", word: "during", translationAr: "خلال", ipa: "/ˈdʒʊə.rɪŋ/", partOfSpeech: "preposition", cefrLevel: "A2" },
              { id: "gg19", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "gg20", word: "summer", translationAr: "الصيف", ipa: "/ˈsʌm.ər/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "gg21", word: "parties", translationAr: "حفلات", ipa: "/ˈpɑː.tiːz/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 4,
            text: "He held onto his dream with passion.",
            translationAr: "تمسك بحلمه بشغف كبير.",
            words: [
              { id: "gg22", word: "He", translationAr: "هو", ipa: "/hiː/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "gg23", word: "held", translationAr: "تمسك", ipa: "/held/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "gg24", word: "onto", translationAr: "بـ", ipa: "/ˈɒn.tuː/", partOfSpeech: "preposition", cefrLevel: "B1" },
              { id: "gg25", word: "his", translationAr: "خاصته", ipa: "/hɪz/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "gg26", word: "dream", translationAr: "حلم", ipa: "/driːm/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "gg27", word: "with", translationAr: "بـ", ipa: "/wɪð/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "gg28", word: "passion", translationAr: "شغف", ipa: "/ˈpæʃ.ən/", partOfSpeech: "noun", cefrLevel: "B2" }
            ]
          },
          {
            id: 5,
            text: "Past memories never really fade away.",
            translationAr: "ذكريات الماضي لا تتلاشى حقاً أبداً.",
            words: [
              { id: "gg29", word: "Past", translationAr: "الماضي", ipa: "/pɑːst/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "gg30", word: "memories", translationAr: "ذكريات", ipa: "/ˈmem.ər.iz/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "gg31", word: "never", translationAr: "أبداً", ipa: "/ˈnev.ər/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "gg32", word: "really", translationAr: "حقاً", ipa: "/ˈrɪə.li/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "gg33", word: "fade", translationAr: "تتلاشى", ipa: "/feɪd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "gg34", word: "away", translationAr: "بعيداً", ipa: "/əˈweɪ/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          }
        ]
      },
      {
        id: "pride-prejudice",
        title: "Pride & Prejudice",
        titleAr: "كبرياء وتحامل",
        courseId: "historical-legends",
        cefrLevel: "B1",
        totalLines: 5,
        totalWords: 42,
        estimatedMinutes: 4,
        descriptionAr: "روائع الأدب الكلاسيكي وقصص المشاعر العميقة.",
        descriptionEn: "Classic romance and deep emotional journeys.",
        coverImage: "/images/pride.jpg",
        lines: [
          {
            id: 1,
            text: "Quiet walks through green country gardens.",
            translationAr: "نزهات هادئة عبر حدائق الريف الخضراء.",
            words: [
              { id: "pp0", word: "Quiet", translationAr: "هادئة", ipa: "/ˈkwaɪ.ət/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "pp1", word: "walks", translationAr: "نزهات", ipa: "/wɔːks/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "pp2", word: "through", translationAr: "عبر", ipa: "/θruː/", partOfSpeech: "preposition", cefrLevel: "A2" },
              { id: "pp3", word: "green", translationAr: "خضراء", ipa: "/ɡriːn/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "pp4", word: "country", translationAr: "ريفية", ipa: "/ˈkʌn.tri/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "pp5", word: "gardens", translationAr: "حدائق", ipa: "/ˈɡɑː.dənz/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "Elizabeth valued honesty above everything else.",
            translationAr: "قدرت إليزابيث الصدق فوق كل شيء آخر.",
            words: [
              { id: "pp6", word: "Elizabeth", translationAr: "إليزابيث", ipa: "/ɪˈlɪz.ə.bəθ/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "pp7", word: "valued", translationAr: "قَدَّرت", ipa: "/ˈvæl.juːd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "pp8", word: "honesty", translationAr: "الصدق", ipa: "/ˈɒn.ə.sti/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "pp9", word: "above", translationAr: "فوق", ipa: "/əˈbʌv/", partOfSpeech: "preposition", cefrLevel: "A2" },
              { id: "pp10", word: "everything", translationAr: "كل شيء", ipa: "/ˈev.ri.θɪŋ/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "pp11", word: "else", translationAr: "آخر", ipa: "/els/", partOfSpeech: "adverb", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "Darcy learned to overcome proud thoughts.",
            translationAr: "تعلم دارسي التغلب على الأفكار المغرورة.",
            words: [
              { id: "pp12", word: "Darcy", translationAr: "دارسي", ipa: "/ˈdɑː.si/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "pp13", word: "learned", translationAr: "تعلم", ipa: "/lɜːnd/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "pp14", word: "to", translationAr: "أن", ipa: "/tuː/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "pp15", word: "overcome", translationAr: "يتغلب على", ipa: "/ˌəʊ.vəˈkʌm/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "pp16", word: "proud", translationAr: "مغرورة / متكبرة", ipa: "/praʊd/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "pp17", word: "thoughts", translationAr: "أفكار", ipa: "/θɔːts/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "First impressions can often be wrong.",
            translationAr: "الإنطباعات الأولى قد تكون خاطئة في كثير من الأحيان.",
            words: [
              { id: "pp18", word: "First", translationAr: "الأولى", ipa: "/fɜːst/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "pp19", word: "impressions", translationAr: "انطباعات", ipa: "/ɪmˈpreʃ.ənz/", partOfSpeech: "noun", cefrLevel: "B2" },
              { id: "pp20", word: "can", translationAr: "يمكن", ipa: "/kæn/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "pp21", word: "often", translationAr: "غالباً", ipa: "/ˈɒf.ən/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "pp22", word: "be", translationAr: "تكون", ipa: "/biː/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "pp23", word: "wrong", translationAr: "خاطئة", ipa: "/rɒŋ/", partOfSpeech: "adjective", cefrLevel: "A1" }
            ]
          },
          {
            id: 5,
            text: "True love overcomes all pride.",
            translationAr: "الحب الحقيقي يتغلب على كل كبرياء.",
            words: [
              { id: "pp24", word: "True", translationAr: "حقيقي", ipa: "/truː/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "pp25", word: "love", translationAr: "حب", ipa: "/lʌv/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "pp26", word: "overcomes", translationAr: "يتغلب على", ipa: "/ˌəʊ.vəˈkʌmz/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "pp27", word: "all", translationAr: "كل", ipa: "/ɔːl/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "pp28", word: "pride", translationAr: "كبرياء", ipa: "/praɪd/", partOfSpeech: "noun", cefrLevel: "B2" }
            ]
          }
        ]
      },
      {
        id: "romeo-juliet",
        title: "Romeo & Juliet",
        titleAr: "روميو وجولييت",
        courseId: "historical-legends",
        cefrLevel: "A2",
        totalLines: 5,
        totalWords: 38,
        estimatedMinutes: 4,
        descriptionAr: "الأسطورة الكلاسيكية الخالدة في تاريخ الحب والأدب.",
        descriptionEn: "The timeless classical love story of Verona.",
        coverImage: "/images/romeo.jpg",
        lines: [
          {
            id: 1,
            text: "Moonlight shined upon the old balcony.",
            translationAr: "سطع ضوء القمر فوق الشرفة القديمة.",
            words: [
              { id: "rj0", word: "Moonlight", translationAr: "ضوء القمر", ipa: "/ˈmuːn.laɪt/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "rj1", word: "shined", translationAr: "سطع", ipa: "/ʃaɪnd/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "rj2", word: "upon", translationAr: "فوق", ipa: "/əˈpɒn/", partOfSpeech: "preposition", cefrLevel: "B1" },
              { id: "rj3", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "rj4", word: "old", translationAr: "القديمة", ipa: "/əʊld/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "rj5", word: "balcony", translationAr: "شرفة", ipa: "/ˈbæl.kə.ni/", partOfSpeech: "noun", cefrLevel: "B1" }
            ]
          },
          {
            id: 2,
            text: "Two young lovers met in secret.",
            translationAr: "التقى عاشقان شابان في الخفاء.",
            words: [
              { id: "rj6", word: "Two", translationAr: "اثنان", ipa: "/tuː/", partOfSpeech: "number", cefrLevel: "A1" },
              { id: "rj7", word: "young", translationAr: "شابان", ipa: "/jʌŋ/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "rj8", word: "lovers", translationAr: "عاشقان", ipa: "/ˈlʌv.əz/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "rj9", word: "met", translationAr: "التقيا", ipa: "/met/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "rj10", word: "in", translationAr: "في", ipa: "/ɪn/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "rj11", word: "secret", translationAr: "خفاء / سر", ipa: "/ˈsiː.krət/", partOfSpeech: "noun", cefrLevel: "A2" }
            ]
          },
          {
            id: 3,
            text: "Their families held a long conflict.",
            translationAr: "كان بين عائلتيهما صراع طويل.",
            words: [
              { id: "rj12", word: "Their", translationAr: "خاصتهم", ipa: "/ðeər/", partOfSpeech: "determiner", cefrLevel: "A1" },
              { id: "rj13", word: "families", translationAr: "عائلات", ipa: "/ˈfæm.əl.iz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "rj14", word: "held", translationAr: "كان بينهما / خاضا", ipa: "/held/", partOfSpeech: "verb", cefrLevel: "A2" },
              { id: "rj15", word: "a", translationAr: "أداة تنكير", ipa: "/ə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "rj16", word: "long", translationAr: "طويل", ipa: "/lɒŋ/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "rj17", word: "conflict", translationAr: "صراع", ipa: "/ˈkɒn.flɪkt/", partOfSpeech: "noun", cefrLevel: "B2" }
            ]
          },
          {
            id: 4,
            text: "They spoke gentle words of devotion.",
            translationAr: "تحدثا بكلمات رقيقة مليئة بالإخلاص.",
            words: [
              { id: "rj18", word: "They", translationAr: "هما", ipa: "/ðeɪ/", partOfSpeech: "pronoun", cefrLevel: "A1" },
              { id: "rj19", word: "spoke", translationAr: "تحدثا", ipa: "/spəʊk/", partOfSpeech: "verb", cefrLevel: "A1" },
              { id: "rj20", word: "gentle", translationAr: "رقيقة", ipa: "/ˈdʒen.təl/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "rj21", word: "words", translationAr: "كلمات", ipa: "/wɜːdz/", partOfSpeech: "noun", cefrLevel: "A1" },
              { id: "rj22", word: "of", translationAr: "من", ipa: "/ɒv/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "rj23", word: "devotion", translationAr: "إخلاص / تفانٍ", ipa: "/dɪˈvəʊ.ʃən/", partOfSpeech: "noun", cefrLevel: "C1" }
            ]
          },
          {
            id: 5,
            text: "A famous tale known around the world.",
            translationAr: "قصة شهيرة معروفة في جميع أنحاء العالم.",
            words: [
              { id: "rj24", word: "A", translationAr: "أداة تنكير", ipa: "/ə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "rj25", word: "famous", translationAr: "شهيرة", ipa: "/ˈfeɪ.məs/", partOfSpeech: "adjective", cefrLevel: "A1" },
              { id: "rj26", word: "tale", translationAr: "قصة / حكاية", ipa: "/teɪl/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "rj27", word: "known", translationAr: "معروفة", ipa: "/nəʊn/", partOfSpeech: "adjective", cefrLevel: "A2" },
              { id: "rj28", word: "around", translationAr: "حول", ipa: "/əˈraʊnd/", partOfSpeech: "preposition", cefrLevel: "A1" },
              { id: "rj29", word: "the", translationAr: "الـ", ipa: "/ðə/", partOfSpeech: "article", cefrLevel: "A1" },
              { id: "rj30", word: "world", translationAr: "العالم", ipa: "/wɜːld/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          }
        ]
      }
    ]
  }
];

export function getStoryById(storyId: string): ExtendedStory | undefined {
  for (const course of SAMPLE_COURSES) {
    const found = course.stories.find((s) => s.id === storyId);
    if (found) return found as ExtendedStory;
  }
  return undefined;
}