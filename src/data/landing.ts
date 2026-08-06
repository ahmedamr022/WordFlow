import {
  BookOpenIcon,
  BookmarkIcon,
  BrainIcon,
  BriefcaseIcon,
  ChartNoAxesColumnIcon,
  EyeIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  HeartIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  ZapIcon,

  GlobeIcon,
  PlayIcon,

  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Brand palette                                                              */
/* -------------------------------------------------------------------------- */

export const COLORS = {
  bg: '#09090B',
  bgDeep: '#06060A',
  card: '#0E0E15',
  cardSoft: '#111119',
  border: '#1E1E2A',
  text: '#FFFFFF',
  muted: '#9A9AAE',
  teal: '#2DE2C5',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  violet: '#8B5CF6',
  purple: '#A855F7',
  pink: '#EC4899',
  magenta: '#F472B6',
  amber: '#F5A623',
  green: '#34D399'
} as const;

/* -------------------------------------------------------------------------- */
/* Images — the 5 assets live in /public/images                               */
/* IMAGE_FALLBACKS is only used if the local file is missing (safe to keep).   */
/* -------------------------------------------------------------------------- */

export const IMAGES = {
  hero: '/images/heropage.png',
  background: '/images/background.png',
  lab: '/images/lab.png',
  message: '/images/message.png',
  rocket: '/images/rocket.png'
} as const;

export const IMAGE_FALLBACKS = {
  hero: "/fcc90666-a4b3-4bce-8234-9c62904e47a8.jpg",
  background: "/7c6640fe-daaf-45cf-8c37-e4cc01ed91a9.jpg",

  lab: "/da7aaebf-5691-4672-9e82-817e8f642f65.jpg",
  message: "/e781e88a-2fc2-4d03-b5dd-f598890fa045.jpg",

  rocket: "/f96262be-a0f9-4db4-a048-313251dbe9a1.jpg"

} as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export type NavItem = {id: string;label: string;};

export const NAV_ITEMS: NavItem[] = [
{ id: 'features', label: 'المميزات' },
{ id: 'demo', label: 'التجربة التفاعلية' },
{ id: 'journey', label: 'مسار التعلم' },
{ id: 'about', label: 'عن المنصة' },
{ id: 'faq', label: 'الأسئلة الشائعة' }];


/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

export type HeroStat = {
  icon: LucideIcon;
  value: string;
  title: string;
  subtitle: string;
  color: string;
};

export const HERO_STATS: HeroStat[] = [
{
  icon: UsersIcon,
  value: '50K+',
  title: 'متعلم حول العالم',
  subtitle: 'ينضمون يوميًا',
  color: COLORS.violet
},
{
  icon: BookOpenIcon,
  value: '100+',
  title: 'قصة تفاعلية',
  subtitle: 'متنوعة وممتعة',
  color: COLORS.blue
},
{
  icon: ZapIcon,
  value: '10K+',
  title: 'تدريب ذكي',
  subtitle: 'لتطوير مهاراتك',
  color: COLORS.teal
},
{
  icon: TrophyIcon,
  value: '98%',
  title: 'معدل رضا المتعلمين',
  subtitle: 'وفقًا لاستطلاعاتنا',
  color: COLORS.amber
}];


export const HERO_CHIPS = [
{ emoji: '👑', label: 'تجربة مجانية 100%', color: COLORS.amber },
{ emoji: '💳', label: 'بدون بطاقة ائتمانية', color: COLORS.pink },
{ emoji: '🧠', label: 'محتوى تفاعلي ذكي', color: COLORS.violet }];


export const HERO_LEVELS = [
{ label: 'مبتدئ', code: 'A1–A2', color: COLORS.green },
{ label: 'متوسط', code: 'B1–B2', color: COLORS.blue },
{ label: 'متقدم', code: 'C1–C2', color: COLORS.purple }];


/* -------------------------------------------------------------------------- */
/* Features                                                                   */
/* -------------------------------------------------------------------------- */

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
};

export const FEATURES: Feature[] = [
{
  icon: MessageSquareIcon,
  title: 'قصص تفاعلية',
  description: 'اقرأ قصصًا مشوقة بمستويات مختلفة تعزز فهمك وتوسّع مفرداتك.',
  color: COLORS.teal
},
{
  icon: BookOpenIcon,
  title: 'مفردات ذكية',
  description: 'تعلم كلمات جديدة في سياقها مع أمثلة وطرق حفظ فعّالة.',
  color: COLORS.violet
},
{
  icon: BrainIcon,
  title: 'ذكاء اصطناعي',
  description: 'تدريب مخصص لك يتكيف مع مستواك ويحدد نقاط قوتك وضعفك.',
  color: COLORS.teal
},
{
  icon: ZapIcon,
  title: 'تدريبات تفاعلية',
  description: 'تمارين متنوعة تشمل الاستماع، الكتابة والتحدث لتطوير جميع المهارات.',
  color: COLORS.pink
},
{
  icon: TrophyIcon,
  title: 'تحديات ومكافآت',
  description: 'شارك في تحديات أسبوعية واربح نقاطًا وشارات تحفّزك على الاستمرارية.',
  color: COLORS.amber
},
{
  icon: ChartNoAxesColumnIcon,
  title: 'تتبع التقدّم',
  description: 'تابع تطورك في التعلم من خلال إحصائيات تفصيلية وتقارير ذكية.',
  color: COLORS.purple
},
{
  icon: HeadphonesIcon,
  title: 'استماع متقدم',
  description: 'استمع إلى محتوى أصلي بجودة عالية لتطوير مهارة الاستماع لديك.',
  color: COLORS.cyan
},
{
  icon: BookmarkIcon,
  title: 'حفظ وتنظيم',
  description: 'احفظ الكلمات والقصص المفضلة لديك ونظّمها للوصول السريع لاحقًا.',
  color: COLORS.magenta
}];


/* -------------------------------------------------------------------------- */
/* Interactive demo                                                           */
/* -------------------------------------------------------------------------- */

export type DemoWord = {word: string;meaning: string;};
export type DemoStory = {
  id: string;
  label: string;
  words: DemoWord[];
  translation: string;
};

export const DEMO_STORIES: DemoStory[] = [
{
  id: 'story-1',
  label: 'القصة 1',
  translation: 'أنا مستعد للتعلم.',
  words: [
  { word: 'I', meaning: 'أنا' },
  { word: 'am', meaning: 'أكون / فعل الكينونة' },
  { word: 'ready', meaning: 'مستعد' },
  { word: 'to', meaning: 'إلى / لكي' },
  { word: 'learn.', meaning: 'أتعلم' }]

},
{
  id: 'story-2',
  label: 'القصة 2',
  translation: 'كل يوم أصبح أفضل.',
  words: [
  { word: 'Every', meaning: 'كل' },
  { word: 'day', meaning: 'يوم' },
  { word: 'I', meaning: 'أنا' },
  { word: 'get', meaning: 'أصبح' },
  { word: 'better.', meaning: 'أفضل' }]

},
{
  id: 'story-3',
  label: 'القصة 3',
  translation: 'الكلمات تفتح عوالم جديدة.',
  words: [
  { word: 'Words', meaning: 'الكلمات' },
  { word: 'open', meaning: 'تفتح' },
  { word: 'new', meaning: 'جديدة' },
  { word: 'worlds.', meaning: 'عوالم' }]

}];


/* -------------------------------------------------------------------------- */
/* Journey                                                                    */
/* -------------------------------------------------------------------------- */

export type JourneyStep = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  level: string;
  color: string;
};

export const JOURNEY_STEPS: JourneyStep[] = [
{
  number: '01',
  icon: BookOpenIcon,
  title: 'مبتدئ',
  description: 'تعلم الأساسيات وبناء مفرداتك الأولى وفهم الجمل البسيطة.',
  level: 'A1 - A2',
  color: COLORS.teal
},
{
  number: '02',
  icon: MessageSquareIcon,
  title: 'متوسط',
  description: 'تطوير مهاراتك في التحدث والاستماع وفهم النصوص اليومية.',
  level: 'B1 - B2',
  color: COLORS.blue
},
{
  number: '03',
  icon: GraduationCapIcon,
  title: 'فوق المتوسط',
  description: 'التعبير بطلاقة أكبر وكتابة نصوص متنوعة وفهم المواضيع المعقدة.',
  level: 'B2 - C1',
  color: COLORS.purple
},
{
  number: '04',
  icon: TargetIcon,
  title: 'متقدم',
  description: 'إتقان اللغة واستخدامها في مواقف أكاديمية ومهنية باحترافية.',
  level: 'C1 - C2',
  color: COLORS.teal
},
{
  number: '05',
  icon: BriefcaseIcon,
  title: 'احترافي',
  description: 'تطوير مهارات متقدمة في اللغة للأعمال والدراسة في الخارج.',
  level: 'C1+',
  color: COLORS.blue
},
{
  number: '06',
  icon: ShieldCheckIcon,
  title: 'إتقان',
  description: 'الوصول إلى مستوى شبه الأصلي والتعبير بثقة في أي موضوع.',
  level: 'C2',
  color: COLORS.pink
}];


export type SupportItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
};

export const JOURNEY_SUPPORT: SupportItem[] = [
{
  icon: UserIcon,
  title: 'يدعمك في كل خطوة',
  description: 'توصيات ذكية ومتابعة شخصية لمساعدتك على النجاح.',
  color: COLORS.pink
},
{
  icon: ZapIcon,
  title: 'تعلم تفاعلي',
  description: 'دروس وأنشطة تفاعلية تجعل التعلم ممتعًا وفعالًا.',
  color: COLORS.blue
},
{
  icon: ChartNoAxesColumnIcon,
  title: 'تقييم مستمر',
  description: 'اختبارات دورية لمتابعة تقدمك بدقة.',
  color: COLORS.purple
},
{
  icon: TrophyIcon,
  title: 'شهادات معتمدة',
  description: 'احصل على شهادات توثق مستواك في كل مرحلة.',
  color: COLORS.teal
}];


/* -------------------------------------------------------------------------- */
/* About                                                                      */
/* -------------------------------------------------------------------------- */

export const ABOUT_PILLARS: SupportItem[] = [
{
  icon: TargetIcon,
  title: 'مهمتنا',
  description: 'تمكين كل متعلم من إتقان اللغة الإنجليزية من خلال تجربة تعليمية شخصية ومبتكرة.',
  color: COLORS.violet
},
{
  icon: EyeIcon,
  title: 'رؤيتنا',
  description:
  'أن نكون المنصة الأولى عربيًا في تعليم الإنجليزية باستخدام الذكاء الاصطناعي والتقنيات الحديثة.',
  color: COLORS.teal
},
{
  icon: HeartIcon,
  title: 'قيمنا',
  description: 'جودة المحتوى، التفاعل، التطوير المستمر، والتركيز على نجاح متعلمينا.',
  color: COLORS.pink
}];


export type AboutStat = {icon: LucideIcon;value: string;label: string;color: string;};

export const ABOUT_STATS: AboutStat[] = [
{ icon: UsersIcon, value: '50,000+', label: 'متعلم حول العالم', color: COLORS.violet },
{ icon: BookOpenIcon, value: '1,000+', label: 'قصة ومقال تعليمي', color: COLORS.teal },
{ icon: HeadphonesIcon, value: '10,000+', label: 'ساعة استماع تفاعلية', color: COLORS.pink },
{ icon: StarIcon, value: '4.9/5', label: 'تقييم المستخدمين', color: COLORS.amber }];


/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export type FaqItem = {question: string;answer: string;};

export const FAQ_ITEMS: FaqItem[] = [
{
  question: 'ما هو WordFlow؟',
  answer:
  'WordFlow هي منصة متكاملة لتعلم اللغة الإنجليزية بطريقة ذكية وتفاعلية تساعدك على تطوير مهاراتك في القراءة، الكتابة، الاستماع، والمحادثة من خلال محتوى ممتع وتجربة تعليمية فعالة.'
},
{
  question: 'هل يمكنني استخدام المنصة مجانًا؟',
  answer:
  'نعم، يمكنك البدء مجانًا بالكامل بدون بطاقة ائتمانية والوصول إلى مجموعة من القصص والتدريبات التفاعلية، مع إمكانية الترقية لاحقًا لمحتوى أوسع.'
},
{
  question: 'ما هي المستويات التي تدعمها المنصة؟',
  answer:
  'ندعم جميع المستويات من A1 للمبتدئين وحتى C2 للإتقان، ويتم تحديد مستواك تلقائيًا في البداية ثم يتطور المحتوى معك خطوة بخطوة.'
},
{
  question: 'كيف تساعدني المنصة على تحسين مستواي؟',
  answer:
  'نعتمد على التعلم في سياق حقيقي: تقرأ قصصًا مناسبة لمستواك، تستمع للنطق الصحيح، تتدرب على المفردات بتكرار ذكي، وتتابع تقدمك بتقارير واضحة.'
},
{
  question: 'هل يمكنني التعلم على الهاتف المحمول؟',
  answer:
  'بالتأكيد. المنصة مصممة لتعمل بسلاسة على الهاتف والتابلت والكمبيوتر، ويتم مزامنة تقدمك بين جميع أجهزتك تلقائيًا.'
},
{
  question: 'هل يحصل المستخدم على شهادة بعد إكمال المستويات؟',
  answer:
  'نعم، تحصل على شهادة توثق إنجازك عند إكمال كل مرحلة، ويمكنك مشاركتها بسهولة في ملفك المهني أو على منصات التواصل.'
}];


/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export type FooterColumn = {title: string;links: {label: string;href: string;}[];};

export const FOOTER_COLUMNS: FooterColumn[] = [
{
  title: 'روابط سريعة',
  links: [
  { label: 'المميزات', href: '#features' },
  { label: 'مسار التعلم', href: '#journey' },
  { label: 'التجربة التفاعلية', href: '#demo' },
  { label: 'الأسئلة الشائعة', href: '#faq' }]

},
{
  title: 'الموارد',
  links: [
  { label: 'المدونة', href: '#' },
  { label: 'دليل المستخدم', href: '#' },
  { label: 'سياسة الخصوصية', href: '#' },
  { label: 'الشروط والأحكام', href: '#' }]

},
{
  title: 'الدعم',
  links: [
  { label: 'تواصل معنا', href: '#' },
  { label: 'مركز المساعدة', href: '#' },
  { label: 'الإبلاغ عن مشكلة', href: '#' }]

}];


export type SocialLink = {label: string;icon: LucideIcon;href: string;color: string;};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Twitter",
    icon: GlobeIcon,
    href: "#",
    color: COLORS.blue,
  },
  {
    label: "Instagram",
    icon: GlobeIcon,
    href: "#",
    color: COLORS.pink,
  },
  {
    label: "YouTube",
    icon: PlayIcon,
    href: "#",
    color: "#EF4444",
  },
  {
    label: "Discord",
    icon: MessageCircleIcon,
    href: "#",
    color: COLORS.violet,
  },
];


export const SPARKLE_ICON = SparklesIcon;