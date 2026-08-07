/**
 * WordFlow — vocabulary categories.
 *
 * Same shape as `src/data/vocabularyData.ts`, so it can be swapped for a
 * Supabase read without touching a single component: every screen consumes
 * `VOCABULARY_CATEGORIES` through the selectors at the bottom of this file.
 */

import type { VocabularyCategory, VocabularyWord } from '../types';

const w = (
id: string,
word: string,
translationAr: string,
ipa: string,
partOfSpeech: VocabularyWord['partOfSpeech'],
cefrLevel: VocabularyWord['cefrLevel'],
exampleEn: string,
exampleAr: string,
extra: Partial<VocabularyWord> = {})
: VocabularyWord => ({
  id,
  word,
  translationAr,
  ipa,
  partOfSpeech,
  cefrLevel,
  exampleEn,
  exampleAr,
  ...extra
});

export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
{
  id: 'travel-transport',
  titleAr: 'السفر والمواصلات',
  titleEn: 'Travel & Transport',
  descAr:
  'تعلم المفردات الأساسية المتعلقة بالسفر والمطارات والرحلات والمواصلات العامة والسفر الدولي.',
  icon: 'plane',
  accent: 'cyan',
  coverImage: "/3f6e6c83-a595-43e4-9a91-f85c3116b399.jpg",

  words: [
  w('tr-1', 'Airport', 'مطار', '/ˈeəpɔːt/', 'noun', 'A2', 'We arrived at the airport early in the morning.', 'وصلنا إلى المطار في وقت مبكر من الصباح.', { collocations: ['airport terminal', 'leave for the airport'] }),
  w('tr-2', 'Board', 'يصعد / يستقل', '/bɔːd/', 'verb', 'B1', 'Please board the plane through gate 12.', 'يرجى الصعود إلى الطائرة من البوابة 12.', { synonyms: ['embark', 'get on'] }),
  w('tr-3', 'Luggage', 'أمتعة', '/ˈlʌɡɪdʒ/', 'noun', 'A2', "Don't forget to check your luggage.", 'لا تنسَ فحص أمتعتك.', { synonyms: ['baggage'] }),
  w('tr-4', 'Ticket', 'تذكرة', '/ˈtɪkɪt/', 'noun', 'A1', 'I booked a train ticket to Paris.', 'حجزت تذكرة قطار إلى باريس.'),
  w('tr-5', 'Destination', 'وجهة', '/ˌdestɪˈneɪʃn/', 'noun', 'B1', 'Paris is our final destination.', 'باريس هي وجهتنا النهائية.', { collocations: ['final destination', 'popular destination'] }),
  w('tr-6', 'Journey', 'رحلة', '/ˈdʒɜːni/', 'noun', 'A2', 'It was a long but exciting journey.', 'كانت رحلة طويلة لكنها مثيرة.', { synonyms: ['trip', 'voyage'] }),
  w('tr-7', 'Passport', 'جواز سفر', '/ˈpɑːspɔːt/', 'noun', 'A2', 'My passport expires next year.', 'ينتهي جواز سفري العام المقبل.'),
  w('tr-8', 'Departure', 'مغادرة', '/dɪˈpɑːtʃə/', 'noun', 'B1', 'The departure was delayed by an hour.', 'تأخرت المغادرة ساعة واحدة.', { antonyms: ['arrival'] }),
  w('tr-9', 'Arrival', 'وصول', '/əˈraɪvl/', 'noun', 'A2', 'Check the arrival time on the screen.', 'تحقق من وقت الوصول على الشاشة.', { antonyms: ['departure'] }),
  w('tr-10', 'Customs', 'الجمارك', '/ˈkʌstəmz/', 'noun', 'B1', 'We went through customs quickly.', 'مررنا عبر الجمارك بسرعة.'),
  w('tr-11', 'Delay', 'تأخير', '/dɪˈleɪ/', 'noun', 'B1', 'There is a short delay on this route.', 'هناك تأخير قصير على هذا الخط.'),
  w('tr-12', 'Itinerary', 'خط سير', '/aɪˈtɪnərəri/', 'noun', 'B2', 'She printed the full itinerary.', 'طبعت خط السير كاملاً.', { note: 'كلمة شائعة في سياق حجز الرحلات المنظمة.' })]

},
{
  id: 'education-study',
  titleAr: 'التعليم والدراسة',
  titleEn: 'Education & Study',
  descAr:
  'مفردات الفصل الدراسي والامتحانات والبحث الأكاديمي وأساليب الدراسة الفعّالة.',
  icon: 'graduation-cap',
  accent: 'purple',
  coverImage: "/e8169354-033f-4f22-b1d1-db2b1733a68d.jpg",

  words: [
  w('ed-1', 'Essential', 'أساسي', '/ɪˈsenʃl/', 'adjective', 'B1', 'This is an essential skill.', 'هذه مهارة أساسية.', { synonyms: ['crucial', 'vital'] }),
  w('ed-2', 'Determine', 'يحدد', '/dɪˈtɜːmɪn/', 'verb', 'B2', 'The test will determine your level.', 'سيحدد الاختبار مستواك.'),
  w('ed-3', 'Remarkable', 'ملحوظ / مميز', '/rɪˈmɑːkəbl/', 'adjective', 'B2', 'She made remarkable progress this term.', 'أحرزت تقدماً ملحوظاً هذا الفصل.'),
  w('ed-4', 'Assignment', 'واجب / مهمة', '/əˈsaɪnmənt/', 'noun', 'B1', 'The assignment is due on Friday.', 'موعد تسليم الواجب يوم الجمعة.'),
  w('ed-5', 'Curriculum', 'منهج دراسي', '/kəˈrɪkjələm/', 'noun', 'B2', 'The curriculum covers four modules.', 'يغطي المنهج أربع وحدات.'),
  w('ed-6', 'Revise', 'يراجع', '/rɪˈvaɪz/', 'verb', 'B1', 'I revise ten words every evening.', 'أراجع عشر كلمات كل مساء.'),
  w('ed-7', 'Insight', 'رؤية / فهم عميق', '/ˈɪnsaɪt/', 'noun', 'B2', 'The lecture gave me a new insight.', 'منحتني المحاضرة فهماً جديداً.'),
  w('ed-8', 'Deadline', 'موعد نهائي', '/ˈdedlaɪn/', 'noun', 'B1', 'We met the deadline without stress.', 'التزمنا بالموعد النهائي دون توتر.'),
  w('ed-9', 'Summarize', 'يلخّص', '/ˈsʌməraɪz/', 'verb', 'B1', 'Summarize the chapter in five lines.', 'لخّص الفصل في خمسة أسطر.'),
  w('ed-10', 'Fluent', 'طليق', '/ˈfluːənt/', 'adjective', 'B1', 'He became fluent in two years.', 'أصبح طليقاً في عامين.'),
  w('ed-11', 'Comprehend', 'يستوعب', '/ˌkɒmprɪˈhend/', 'verb', 'C1', 'I comprehend the idea clearly now.', 'أستوعب الفكرة بوضوح الآن.'),
  w('ed-12', 'Scholarship', 'منحة دراسية', '/ˈskɒləʃɪp/', 'noun', 'B2', 'She won a full scholarship.', 'حصلت على منحة دراسية كاملة.')]

},
{
  id: 'health-body',
  titleAr: 'الصحة والجسم',
  titleEn: 'Health & Body',
  descAr: 'مفردات الصحة واللياقة والتغذية وزيارة الطبيب والعادات اليومية.',
  icon: 'dumbbell',
  accent: 'pink',
  coverImage: "/667a529c-1633-400e-afa2-b475c80d4b8f.jpg",

  words: [
  w('he-1', 'Nutrition', 'تغذية', '/njuːˈtrɪʃn/', 'noun', 'B1', 'Good nutrition improves focus.', 'التغذية الجيدة تحسّن التركيز.'),
  w('he-2', 'Recover', 'يتعافى', '/rɪˈkʌvə/', 'verb', 'B1', 'Muscles recover during sleep.', 'تتعافى العضلات أثناء النوم.'),
  w('he-3', 'Symptom', 'عَرَض', '/ˈsɪmptəm/', 'noun', 'B2', 'Fever is a common symptom.', 'الحمى عَرَض شائع.'),
  w('he-4', 'Endurance', 'قدرة على التحمل', '/ɪnˈdjʊərəns/', 'noun', 'B2', 'Running builds endurance.', 'الجري يبني القدرة على التحمل.'),
  w('he-5', 'Breathe', 'يتنفّس', '/briːð/', 'verb', 'A2', 'Breathe slowly and relax.', 'تنفّس بهدوء واسترخِ.'),
  w('he-6', 'Injury', 'إصابة', '/ˈɪndʒəri/', 'noun', 'B1', 'He returned after a knee injury.', 'عاد بعد إصابة في الركبة.'),
  w('he-7', 'Balanced', 'متوازن', '/ˈbælənst/', 'adjective', 'B1', 'Eat a balanced meal.', 'تناول وجبة متوازنة.'),
  w('he-8', 'Immune', 'مناعي', '/ɪˈmjuːn/', 'adjective', 'B2', 'Sleep supports the immune system.', 'النوم يدعم الجهاز المناعي.'),
  w('he-9', 'Posture', 'وضعية الجسم', '/ˈpɒstʃə/', 'noun', 'B2', 'Keep a straight posture while studying.', 'حافظ على وضعية مستقيمة أثناء الدراسة.'),
  w('he-10', 'Hydrate', 'يشرب الماء', '/ˈhaɪdreɪt/', 'verb', 'B2', 'Hydrate before every session.', 'اشرب الماء قبل كل جلسة.')]

},
{
  id: 'nature-environment',
  titleAr: 'الطبيعة والبيئة',
  titleEn: 'Nature & Environment',
  descAr: 'مفردات الطقس والمناظر الطبيعية والحياة البرية وقضايا البيئة.',
  icon: 'leaf',
  accent: 'teal',
  coverImage: "/0ac2123e-b83a-4685-ac82-835b0e4fc1bf.jpg",

  words: [
  w('na-1', 'Magnificent', 'رائع', '/mæɡˈnɪfɪsnt/', 'adjective', 'B1', 'The view from the mountain was magnificent.', 'كان المنظر من قمة الجبل رائعاً.'),
  w('na-2', 'Sustainable', 'مستدام', '/səˈsteɪnəbl/', 'adjective', 'B2', 'We need sustainable energy.', 'نحتاج إلى طاقة مستدامة.'),
  w('na-3', 'Shore', 'ساحل', '/ʃɔː/', 'noun', 'A2', 'We walked along the shore.', 'تمشينا على الساحل.'),
  w('na-4', 'Climate', 'مناخ', '/ˈklaɪmət/', 'noun', 'B1', 'The climate is changing fast.', 'المناخ يتغير بسرعة.'),
  w('na-5', 'Wildlife', 'حياة برية', '/ˈwaɪldlaɪf/', 'noun', 'B1', 'The park protects local wildlife.', 'تحمي الحديقة الحياة البرية المحلية.'),
  w('na-6', 'Peak', 'قمة', '/piːk/', 'noun', 'B1', 'Snow covers the peak all year.', 'يغطي الثلج القمة طوال العام.'),
  w('na-7', 'Preserve', 'يحافظ على', '/prɪˈzɜːv/', 'verb', 'B2', 'We must preserve the forest.', 'يجب أن نحافظ على الغابة.'),
  w('na-8', 'Breeze', 'نسيم', '/briːz/', 'noun', 'B1', 'A cool breeze came from the lake.', 'جاء نسيم بارد من البحيرة.'),
  w('na-9', 'Drought', 'جفاف', '/draʊt/', 'noun', 'B2', 'The drought lasted three months.', 'استمر الجفاف ثلاثة أشهر.'),
  w('na-10', 'Vast', 'شاسع', '/vɑːst/', 'adjective', 'B2', 'A vast valley opened before us.', 'انفتح واد شاسع أمامنا.')]

},
{
  id: 'relations-communication',
  titleAr: 'العلاقات والتواصل',
  titleEn: 'Relations & Communication',
  descAr: 'مفردات الحوار والصداقة والتعبير عن المشاعر وحل الخلافات.',
  icon: 'messages',
  accent: 'gold',
  coverImage: "/271c701b-16f1-4209-9bf1-e5282bf390ed.jpg",

  words: [
  w('re-1', 'Inspire', 'يُلهم', '/ɪnˈspaɪə/', 'verb', 'B1', 'She wants to inspire others with her story.', 'هي تريد أن تُلهم الآخرين بقصتها.'),
  w('re-2', 'Curiosity', 'فضول', '/ˌkjʊəriˈɒsəti/', 'noun', 'A2', 'Curiosity is the key to learning new things.', 'الفضول هو مفتاح تعلم أشياء جديدة.'),
  w('re-3', 'Sincere', 'صادق', '/sɪnˈsɪə/', 'adjective', 'B2', 'His apology sounded sincere.', 'بدا اعتذاره صادقاً.'),
  w('re-4', 'Argue', 'يجادل', '/ˈɑːɡjuː/', 'verb', 'A2', "They rarely argue about small things.", 'نادراً ما يتجادلان في الأمور الصغيرة.'),
  w('re-5', 'Empathy', 'تعاطف', '/ˈempəθi/', 'noun', 'B2', 'Empathy makes teamwork easier.', 'التعاطف يجعل العمل الجماعي أسهل.'),
  w('re-6', 'Compromise', 'تسوية', '/ˈkɒmprəmaɪz/', 'noun', 'B2', 'We reached a fair compromise.', 'توصلنا إلى تسوية عادلة.'),
  w('re-7', 'Gratitude', 'امتنان', '/ˈɡrætɪtjuːd/', 'noun', 'B2', 'He expressed his gratitude warmly.', 'عبّر عن امتنانه بحرارة.'),
  w('re-8', 'Reliable', 'موثوق', '/rɪˈlaɪəbl/', 'adjective', 'B1', 'She is a reliable friend.', 'هي صديقة موثوقة.'),
  w('re-9', 'Persuade', 'يُقنع', '/pəˈsweɪd/', 'verb', 'B2', 'He persuaded me to join the class.', 'أقنعني بالانضمام إلى الصف.'),
  w('re-10', 'Prosper', 'يزدهر', '/ˈprɒspə/', 'verb', 'B2', 'They hope their business will prosper.', 'يتمنون أن يزدهر عملهم.')]

},
{
  id: 'work-business',
  titleAr: 'العمل والأعمال',
  titleEn: 'Work & Business',
  descAr: 'مفردات المقابلات والاجتماعات والمشاريع ومصطلحات بيئة العمل.',
  icon: 'briefcase',
  accent: 'purple',
  coverImage: "/9d5a6cb4-5d4c-4180-877b-8667d0fc1dd2.jpg",

  words: [
  w('wo-1', 'Consider', 'يفكر في', '/kənˈsɪdə/', 'verb', 'B1', 'Please consider our offer.', 'يرجى التفكير في عرضنا.'),
  w('wo-2', 'Achieve', 'يحقق', '/əˈtʃiːv/', 'verb', 'B1', 'We achieved the quarterly goal.', 'حققنا هدف الربع السنوي.'),
  w('wo-3', 'Negotiate', 'يتفاوض', '/nɪˈɡəʊʃieɪt/', 'verb', 'B2', 'They negotiated a better price.', 'تفاوضوا على سعر أفضل.'),
  w('wo-4', 'Deadline', 'موعد التسليم', '/ˈdedlaɪn/', 'noun', 'B1', 'The deadline moved to Monday.', 'انتقل موعد التسليم إلى الاثنين.'),
  w('wo-5', 'Revenue', 'إيرادات', '/ˈrevənjuː/', 'noun', 'B2', 'Revenue grew by 12 percent.', 'نمت الإيرادات بنسبة 12 بالمئة.'),
  w('wo-6', 'Delegate', 'يفوّض', '/ˈdelɪɡeɪt/', 'verb', 'B2', 'A good manager knows how to delegate.', 'المدير الجيد يعرف كيف يفوّض.'),
  w('wo-7', 'Stakeholder', 'صاحب مصلحة', '/ˈsteɪkhəʊldə/', 'noun', 'C1', 'Every stakeholder reviewed the plan.', 'راجع كل صاحب مصلحة الخطة.'),
  w('wo-8', 'Efficient', 'فعّال', '/ɪˈfɪʃnt/', 'adjective', 'B1', 'The new process is more efficient.', 'العملية الجديدة أكثر فعالية.'),
  w('wo-9', 'Feedback', 'ملاحظات', '/ˈfiːdbæk/', 'noun', 'B1', 'Her feedback was very useful.', 'كانت ملاحظاتها مفيدة جداً.'),
  w('wo-10', 'Launch', 'يُطلق', '/lɔːntʃ/', 'verb', 'B1', 'We launch the product in May.', 'نطلق المنتج في مايو.')]

},
{
  id: 'food-cooking',
  titleAr: 'الطعام والطهي',
  titleEn: 'Food & Cooking',
  descAr: 'مفردات المطبخ والمكوّنات والمطاعم ووصف المذاق.',
  icon: 'utensils',
  accent: 'coral',
  coverImage: "/d521e410-6daf-4545-93a9-ac80244ffe3b.jpg",

  words: [
  w('fo-1', 'Ingredient', 'مكوّن', '/ɪnˈɡriːdiənt/', 'noun', 'A2', 'Add the last ingredient slowly.', 'أضف المكوّن الأخير ببطء.'),
  w('fo-2', 'Simmer', 'يغلي على نار هادئة', '/ˈsɪmə/', 'verb', 'B2', 'Let the soup simmer for ten minutes.', 'اتركي الحساء يغلي على نار هادئة عشر دقائق.'),
  w('fo-3', 'Savory', 'مالح / لذيذ', '/ˈseɪvəri/', 'adjective', 'B2', 'I prefer savory breakfasts.', 'أفضّل الفطور المالح.'),
  w('fo-4', 'Recipe', 'وصفة', '/ˈresəpi/', 'noun', 'A2', 'This recipe takes twenty minutes.', 'تستغرق هذه الوصفة عشرين دقيقة.'),
  w('fo-5', 'Season', 'يتبّل', '/ˈsiːzn/', 'verb', 'B1', 'Season the fish with lemon.', 'تبّل السمك بالليمون.'),
  w('fo-6', 'Tender', 'طري', '/ˈtendə/', 'adjective', 'B1', 'The meat was soft and tender.', 'كان اللحم ناعماً وطرياً.'),
  w('fo-7', 'Leftovers', 'بواقي الطعام', '/ˈleftəʊvəz/', 'noun', 'B1', 'We ate the leftovers for lunch.', 'أكلنا بواقي الطعام على الغداء.'),
  w('fo-8', 'Portion', 'حصة', '/ˈpɔːʃn/', 'noun', 'B1', 'Keep the portion small.', 'اجعل الحصة صغيرة.'),
  w('fo-9', 'Blend', 'يخلط', '/blend/', 'verb', 'B1', 'Blend the fruit with ice.', 'اخلط الفاكهة مع الثلج.'),
  w('fo-10', 'Aroma', 'رائحة عطرية', '/əˈrəʊmə/', 'noun', 'B2', 'The aroma filled the kitchen.', 'عبقت الرائحة في المطبخ.')]

}];


/* ------------------------------------------------------------------ *
 * Selectors — the only API components should use.
 * ------------------------------------------------------------------ */

export const ALL_WORDS: VocabularyWord[] = VOCABULARY_CATEGORIES.flatMap(
  (category) => category.words
);

export function getCategory(id: string): VocabularyCategory | undefined {
  return VOCABULARY_CATEGORIES.find((category) => category.id === id);
}

export function getCategoryOfWord(
wordId: string)
: VocabularyCategory | undefined {
  return VOCABULARY_CATEGORIES.find((category) =>
  category.words.some((word) => word.id === wordId)
  );
}

export function getWord(wordId: string): VocabularyWord | undefined {
  return ALL_WORDS.find((word) => word.id === wordId);
}

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;