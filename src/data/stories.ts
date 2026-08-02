import { Course, Story } from "@/types";

export interface ExtendedStory extends Story {
  descriptionAr: string;
  descriptionEn: string;
  coverImage: string;
}

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
              { id: "w16", word: "carefully", translationAr: "بعناية", ipa: "/ˈkeə.fəl.i/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          },
          {
            id: 5,
            text: "Your progress starts right now.",
            translationAr: "تقدمك يبدأ في هذه اللحظة بالذات.",
            words: [
              { id: "w17", word: "progress", translationAr: "تقدم", ipa: "/ˈprəʊ.ɡres/", partOfSpeech: "noun", cefrLevel: "B1" },
              { id: "w18", word: "starts", translationAr: "يبدأ", ipa: "/stɑːts/", partOfSpeech: "verb", cefrLevel: "A1" }
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
              { id: "w22", word: "bring", translationAr: "تجلب", ipa: "/brɪŋ/", partOfSpeech: "verb", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "Never stop trying your best.",
            translationAr: "لا تتوقف أبداً عن تقديم أفضل ما لديك.",
            words: [
              { id: "w25", word: "Never", translationAr: "أبداً", ipa: "/ˈnev.ər/", partOfSpeech: "adverb", cefrLevel: "A1" },
              { id: "w26", word: "stop", translationAr: "تتوقف", ipa: "/stɒp/", partOfSpeech: "verb", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "You can achieve your goals.",
            translationAr: "يمكنك تحقيق أهدافك.",
            words: [
              { id: "w28", word: "achieve", translationAr: "تحقيق", ipa: "/əˈtʃiːv/", partOfSpeech: "verb", cefrLevel: "B1" }
            ]
          },
          {
            id: 4,
            text: "Trust yourself and move forward.",
            translationAr: "ثق بنفسك وتقدم إلى الأمام.",
            words: [
              { id: "w29", word: "Trust", translationAr: "ثق", ipa: "/trʌst/", partOfSpeech: "verb", cefrLevel: "B1" }
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
              { id: "w51", word: "doors", translationAr: "أبواب", ipa: "/dɔːrz/", partOfSpeech: "noun", cefrLevel: "A1" }
            ]
          },
          {
            id: 2,
            text: "Read quietly every single evening.",
            translationAr: "اقرأ بهدوء كل مساء.",
            words: [
              { id: "w52", word: "quietly", translationAr: "بهدوء", ipa: "/ˈkwaɪ.ət.li/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          },
          {
            id: 3,
            text: "Knowledge is true inner power.",
            translationAr: "المعرفة هي القوة الداخلية الحقيقية.",
            words: [
              { id: "w53", word: "Knowledge", translationAr: "معرفة", ipa: "/ˈnɒl.ɪdʒ/", partOfSpeech: "noun", cefrLevel: "B1" }
            ]
          },
          {
            id: 4,
            text: "Every page holds a new secret.",
            translationAr: "كل صفحة تحمل سرّاً جديداً.",
            words: [
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
              { id: "w40", word: "glanced", translationAr: "ألقت نظرة", ipa: "/ɡlɑːnst/", partOfSpeech: "verb", cefrLevel: "B1" }
            ]
          },
          {
            id: 2,
            text: "It had arrived early that morning.",
            translationAr: "وصلت في وقت مبكر من ذلك الصباح.",
            words: [
              { id: "w43", word: "arrived", translationAr: "وصلت", ipa: "/əˈraɪvd/", partOfSpeech: "verb", cefrLevel: "A1" }
            ]
          },
          {
            id: 3,
            text: "Her hands trembled with quiet excitement.",
            translationAr: "ارتجفت يداها بإثارة هادئة.",
            words: [
              { id: "w45", word: "trembled", translationAr: "ارتجفت", ipa: "/ˈtrem.bəld/", partOfSpeech: "verb", cefrLevel: "B2" }
            ]
          },
          {
            id: 4,
            text: "The ink carried words of hope.",
            translationAr: "حمل الحبر كلمات مليئة بالأمل.",
            words: [
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
              { id: "w60", word: "sparkled", translationAr: "تألقت", ipa: "/ˈspɑː.kəld/", partOfSpeech: "verb", cefrLevel: "B1" }
            ]
          },
          {
            id: 2,
            text: "Warm breeze filled the ancient city streets.",
            translationAr: "ملأ النسيم الدافئ شوارع المدينة القديمة.",
            words: [
              { id: "w61", word: "breeze", translationAr: "نسيم", ipa: "/briːz/", partOfSpeech: "noun", cefrLevel: "B1" }
            ]
          },
          {
            id: 3,
            text: "Every corner whispered stories of long past.",
            translationAr: "همس كل ركن بقصص من الماضي البعيد.",
            words: [
              { id: "w62", word: "whispered", translationAr: "همس", ipa: "/ˈwɪs.pəd/", partOfSpeech: "verb", cefrLevel: "B2" }
            ]
          },
          {
            id: 4,
            text: "Lights danced beautifully upon the water.",
            translationAr: "رقصت الأضواء بجمال فوق المياه.",
            words: [
              { id: "w63", word: "danced", translationAr: "رقصت", ipa: "/dɑːnst/", partOfSpeech: "verb", cefrLevel: "A2" }
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
    storyCount: 1,
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
              { id: "wt1", word: "giant", translationAr: "عملاق", ipa: "/ˈdʒaɪ.ənt/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt2", word: "sailed", translationAr: "أبحرت", ipa: "/seɪld/", partOfSpeech: "verb", cefrLevel: "A2" },
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
              { id: "wt7", word: "elegant", translationAr: "أنيق / راقٍ", ipa: "/ˈel.ɪ.ɡənt/", partOfSpeech: "adjective", cefrLevel: "B2" }
            ]
          },
          {
            id: 3,
            text: "Music echoed softly through the dining halls.",
            translationAr: "ترددت ألحان الموسيقى بهدوء عبر قاعات الطعام.",
            words: [
              { id: "wt8", word: "echoed", translationAr: "ترددت", ipa: "/ˈek.əʊd/", partOfSpeech: "verb", cefrLevel: "B2" },
              { id: "wt9", word: "softly", translationAr: "بنعومة / بهدوء", ipa: "/ˈsɒft.li/", partOfSpeech: "adverb", cefrLevel: "A2" }
            ]
          },
          {
            id: 4,
            text: "A sudden iceberg emerged in dark waters.",
            translationAr: "ظهر جبل جليدي مفاجئ في المياه المظلمة.",
            words: [
              { id: "wt10", word: "iceberg", translationAr: "جبل جليدي", ipa: "/ˈaɪs.bɜːɡ/", partOfSpeech: "noun", cefrLevel: "B2" },
              { id: "wt11", word: "emerged", translationAr: "ظهر / برز", ipa: "/ɪˈmɜːdʒd/", partOfSpeech: "verb", cefrLevel: "B2" }
            ]
          },
          {
            id: 5,
            text: "Brave souls stood together until the end.",
            translationAr: "وقفت الأرواح الشجاعة معاً حتى النهاية.",
            words: [
              { id: "wt12", word: "Brave", translationAr: "شجاعة", ipa: "/breɪv/", partOfSpeech: "adjective", cefrLevel: "B1" },
              { id: "wt13", word: "souls", translationAr: "أرواح", ipa: "/səʊlz/", partOfSpeech: "noun", cefrLevel: "B2" }
            ]
          },
          {
            id: 6,
            text: "Its memory lives forever in human history.",
            translationAr: "تبقى ذكراها خالدة في التاريخ الإنساني.",
            words: [
              { id: "wt14", word: "memory", translationAr: "ذكرى", ipa: "/ˈmem.ər.i/", partOfSpeech: "noun", cefrLevel: "A2" },
              { id: "wt15", word: "forever", translationAr: "للأبد / خالدة", ipa: "/fəˈrev.ər/", partOfSpeech: "adverb", cefrLevel: "A2" },
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
              { id: "sh1", word: "fog", translationAr: "ضباب", ipa: "/fɒɡ/", partOfSpeech: "noun", cefrLevel: "B1" }
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
              { id: "gg1", word: "Golden", translationAr: "ذهبي", ipa: "/ˈɡəʊl.dən/", partOfSpeech: "adjective", cefrLevel: "A2" }
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
              { id: "pp1", word: "walks", translationAr: "نزهات", ipa: "/wɔːks/", partOfSpeech: "noun", cefrLevel: "A1" }
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
              { id: "rj1", word: "Moonlight", translationAr: "ضوء القمر", ipa: "/ˈmuːn.laɪt/", partOfSpeech: "noun", cefrLevel: "B1" }
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
