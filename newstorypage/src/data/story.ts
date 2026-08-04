import type { Story, Voice } from '../types/story';

export const voices: Voice[] = [
{ id: 'laura-us', label: 'Laura US', locale: 'en-US' },
{ id: 'daniel-uk', label: 'Daniel UK', locale: 'en-GB' },
{ id: 'sofia-au', label: 'Sofia AU', locale: 'en-AU' }];


export const story: Story = {
  id: 'titanic-night',
  level: 'B1',
  backgroundUrl: "/ship.png",
  sentences: [
  {
    id: 1,
    tokens: [
    { text: 'A', pos: 'Article', posAr: 'أداة', translation: 'واحد / أحد', hint: 'أداة نكرة' },
    { text: 'cold', pos: 'Adjective', posAr: 'صفة', translation: 'بارد', hint: 'درجة حرارة منخفضة' },
    { text: 'night', pos: 'Noun', posAr: 'اسم', translation: 'ليل / ليلة', hint: 'الوقت بعد الغروب' },
    {
      text: 'covered',
      suffix: 'ed',
      pos: 'Verb',
      posAr: 'فعل',
      translation: 'غطّى / كسا',
      hint: 'انتشر فوق شيء'
    },
    { text: 'the', pos: 'Article', posAr: 'أداة', translation: 'الـ', hint: 'أداة تعريف' },
    { text: 'harbour.', pos: 'Noun', posAr: 'اسم', translation: 'ميناء', hint: 'مكان رسو السفن' }],

    arabic: 'غطّت ليلة باردة الميناء.'
  },
  {
    id: 2,
    tokens: [
    { text: 'Hundreds', pos: 'Noun', posAr: 'اسم', translation: 'مئات', hint: 'عدد كبير' },
    { text: 'of', pos: 'Preposition', posAr: 'حرف جر', translation: 'من', hint: 'يربط بين شيئين' },
    {
      text: 'passengers',
      suffix: 's',
      pos: 'Noun',
      posAr: 'اسم',
      translation: 'مسافرون / رُكّاب',
      hint: 'من يسافر على مركبة'
    },
    {
      text: 'waved',
      suffix: 'ed',
      pos: 'Verb',
      posAr: 'فعل',
      translation: 'لوّح / أشار',
      hint: 'حركة اليد للتحية'
    },
    { text: 'goodbye.', pos: 'Noun', posAr: 'اسم', translation: 'وداعاً', hint: 'تُقال عند الرحيل' }],

    arabic: 'ودّع مئات المسافرين أحبّاءهم.'
  },
  {
    id: 3,
    tokens: [
    { text: 'The', pos: 'Article', posAr: 'أداة', translation: 'الـ', hint: 'أداة تعريف' },
    {
      text: 'engines',
      suffix: 's',
      pos: 'Noun',
      posAr: 'اسم',
      translation: 'محرّكات',
      hint: 'ما يحرّك السفينة'
    },
    { text: 'began', pos: 'Verb', posAr: 'فعل', translation: 'بدأ', hint: 'بداية الحدث' },
    { text: 'to', pos: 'Particle', posAr: 'أداة', translation: 'أن / إلى', hint: 'قبل الفعل المصدري' },
    { text: 'roar.', pos: 'Verb', posAr: 'فعل', translation: 'زمجر / هدر', hint: 'صوت عالٍ وقوي' }],

    arabic: 'بدأت المحرّكات تُزمجر.'
  },
  {
    id: 4,
    tokens: [
    { text: 'The', pos: 'Article', posAr: 'أداة', translation: 'الـ', hint: 'أداة تعريف' },
    {
      text: 'giant',
      pos: 'Adjective',
      posAr: 'صفة',
      translation: 'عملاق / ضخم',
      hint: 'كبير جداً في الحجم'
    },
    { text: 'ship', pos: 'Noun', posAr: 'اسم', translation: 'سفينة', hint: 'مركبة تسير في البحر' },
    {
      text: 'sailed',
      suffix: 'ed',
      pos: 'Verb',
      posAr: 'فعل',
      translation: 'أبحرت / أفيقت',
      hint: 'الحركة في الماء'
    },
    {
      text: 'across',
      pos: 'Preposition',
      posAr: 'حرف جر',
      translation: 'عبر / خلال',
      hint: 'من جهة إلى أخرى'
    },
    { text: 'the', pos: 'Article', posAr: 'أداة', translation: 'الـ', hint: 'أداة تعريف' },
    { text: 'cold', pos: 'Adjective', posAr: 'صفة', translation: 'بارد', hint: 'درجة حرارة منخفضة' },
    { text: 'ocean.', pos: 'Noun', posAr: 'اسم', translation: 'محيط', hint: 'أكبر مسطّح مائي' }],

    arabic: 'أبحرت السفينة العملاقة عبر المحيط البارد.'
  },
  {
    id: 5,
    tokens: [
    { text: 'Ice', pos: 'Noun', posAr: 'اسم', translation: 'جليد', hint: 'ماء متجمّد' },
    {
      text: 'floated',
      suffix: 'ed',
      pos: 'Verb',
      posAr: 'فعل',
      translation: 'طفا',
      hint: 'بقي على سطح الماء'
    },
    {
      text: 'silently',
      suffix: 'ly',
      pos: 'Adverb',
      posAr: 'حال',
      translation: 'بصمت',
      hint: 'بدون أي صوت'
    },
    { text: 'in', pos: 'Preposition', posAr: 'حرف جر', translation: 'في', hint: 'داخل شيء' },
    { text: 'the', pos: 'Article', posAr: 'أداة', translation: 'الـ', hint: 'أداة تعريف' },
    { text: 'dark.', pos: 'Noun', posAr: 'اسم', translation: 'الظلام', hint: 'غياب الضوء' }],

    arabic: 'كان الجليد يطفو بصمت في العتمة.'
  },
  {
    id: 6,
    tokens: [
    { text: 'Nobody', pos: 'Pronoun', posAr: 'ضمير', translation: 'لا أحد', hint: 'ولا شخص واحد' },
    { text: 'knew', pos: 'Verb', posAr: 'فعل', translation: 'عرف', hint: 'ماضي know' },
    { text: 'what', pos: 'Pronoun', posAr: 'اسم استفهام', translation: 'ماذا / ما', hint: 'للسؤال' },
    { text: 'the', pos: 'Article', posAr: 'أداة', translation: 'الـ', hint: 'أداة تعريف' },
    { text: 'night', pos: 'Noun', posAr: 'اسم', translation: 'ليل / ليلة', hint: 'الوقت بعد الغروب' },
    { text: 'would', pos: 'Modal', posAr: 'فعل مساعد', translation: 'سوف / كان سـ', hint: 'للمستقبل في الماضي' },
    { text: 'bring.', pos: 'Verb', posAr: 'فعل', translation: 'يحمل / يجلب', hint: 'يأتي بشيء' }],

    arabic: 'لم يعرف أحد ما ستحمله الليلة.'
  }]

};