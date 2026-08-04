import {
  Cpu,
  Bot,
  Headphones,
  Layers,
  Brain,
  BarChart3,
  Target,
  Award,
  BookOpen,
} from "lucide-react";

export interface FeatureItem {
  icon: typeof Cpu;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

export interface JourneyStep {
  step: string;
  title: string;
  desc: string;
  icon: typeof Target;
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    icon: Cpu,
    title: "محرك الكتابة التفاعلي",
    desc: "اكتب القصص حرفاً بحرف مع تغذية راجعة فورية لتصحيح الأخطاء وتثبيت الكلمات في الذاكرة.",
    color: "text-[#2de2c5]",
    bg: "bg-[#2de2c5]/10",
  },
  {
    icon: Bot,
    title: "المعلم الذكي Gemini",
    desc: "شرح مبسط للقواعد وتراكيب الجمل بلمسة واحدة أثناء القراءة والكتابة.",
    color: "text-[#ff6b6b]",
    bg: "bg-[#ff6b6b]/10",
  },
  {
    icon: Headphones,
    title: "نطق أمريكي أصلي HD",
    desc: "استمع لكل كلمة وكل جملة بنطق بشري عالي الجودة مقسم بسرعة تناسب مستواك.",
    color: "text-[#2de2c5]",
    bg: "bg-[#2de2c5]/10",
  },
  {
    icon: Layers,
    title: "قاموس المفردات المصور",
    desc: "مكتبة مفردات شاملة مصنفة حسب مستويات CEFR العالمية من A1 إلى C2.",
    color: "text-[#ff6b6b]",
    bg: "bg-[#ff6b6b]/10",
  },
  {
    icon: Brain,
    title: "التكرار المتباعد FSRS",
    desc: "خوارزمية علمية ذكية تذكرك بالمفردات في الوقت المثالي قبل أن تنساها.",
    color: "text-[#2de2c5]",
    bg: "bg-[#2de2c5]/10",
  },
  {
    icon: BarChart3,
    title: "تتبع التقدم والإحصائيات",
    desc: "تقارير دقيقة عن سرعة الكتابة WPM، دقة الإجابات، والكلمات المكتسبة يومياً.",
    color: "text-[#ff6b6b]",
    bg: "bg-[#ff6b6b]/10",
  },
  {
    icon: Target,
    title: "اختبار تحديد المستوى",
    desc: "حدد مستواك الحقيقي في دقائق وابدأ بالمسار المناسب بدون إضاعة الوقت.",
    color: "text-[#2de2c5]",
    bg: "bg-[#2de2c5]/10",
  },
  {
    icon: Award,
    title: "نظام الشغف والتحدي",
    desc: "حافظ على السلسلة اليومية (Streak) واجمع نقاط الخبرة XP لفتح قصص جديدة.",
    color: "text-[#ff6b6b]",
    bg: "bg-[#ff6b6b]/10",
  },
];

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: "01",
    title: "تحديد المستوى المبدئي",
    desc: "اختبار سريع يحدد مستواك بدقة في الإنجليزية ويعين المسار المناسب لك.",
    icon: Target,
  },
  {
    step: "02",
    title: "اختر القصة المتدرجة",
    desc: "مكتبة غنية بالقصص في مجالات متعددة: تكنولوجيا، تاريخ، مغامرة، وثقافة.",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "اقرأ واكتب سطرًا بسطر",
    desc: "محرك تفاعلي يطلب منك كتابة كل سطر بنفسك مع إرشاد صوتي وإعراب للقواعد.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "مراجعة المفردات المكتسبة",
    desc: "إضافة الكلمات الجديدة تلقائياً لنظام التكرار المتباعد لمنع نسيانها.",
    icon: Brain,
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    name: "أحمد العتيبي",
    role: "مهندس برمجيات",
    quote: "طريقة كتابة القصص سطرًا بسطر غيرت تماماً من قدرتي على تذكر المفردات ونطقها بدون ما أنسى.",
    rating: 5,
  },
  {
    name: "سارة محمود",
    role: "طالبة جامعية",
    quote: "شرح القواعد التفاعلي بالذكاء الاصطناعي أسهل بكتير من الكورسات التقليدية. التجربة ممتعة جداً!",
    rating: 5,
  },
  {
    name: "محمود حسن",
    role: "رائد أعمال",
    quote: "النطق الأمريكي ممتاز والقصص متنوعة جداً. المنصة ساعدتني أحسن لغتي في شغلي اليومي.",
    rating: 5,
  },
];