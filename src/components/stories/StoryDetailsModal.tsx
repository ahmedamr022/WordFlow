"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_COURSES, MAIN_STORIES } from '@/data/stories';
import {
  ChevronLeft,
  Play,
  Pause,
  Calendar,
  BarChart2,
  BookOpen,
  Clock,
  Star,
  GraduationCap,
  Type,
  FileText,
  Headphones,
  Mic,
  Pencil,
  Lock,
  Sparkles,
  Trophy,
  ShieldCheck,
  Award,
  Rocket
} from 'lucide-react';

interface StoryDetailsModalProps {
  onClose: () => void;
  storyData?: {
    id?: string;
    titleEn?: string;
    titleAr?: string;
    description?: string;
    level?: string;
    wordsCount?: number;
    duration?: number;
    rating?: number;
    progress?: number;
    images?: string[];
  };
}

export default function StoryDetailsModal({ onClose, storyData }: StoryDetailsModalProps) {
  const router = useRouter();

  // 1. تحديد الـ targetId بناءً على البيانات الممررة فقط دون إجبار على "titanic"
  const targetId = storyData?.id || "";
  
  // 2. البحث عن القصة في قائمة الكورسات
  let fullStoryFromCourse = null;
  if (targetId) {
    for (const course of SAMPLE_COURSES) {
      const found = course.stories.find(
        (s) =>
          s.id === targetId ||
          targetId.toLowerCase().includes(s.id.toLowerCase()) ||
          s.id.toLowerCase().includes(targetId.toLowerCase())
      );
      if (found) {
        fullStoryFromCourse = found;
        break;
      }
    }
  }

  // 3. البحث في القائمة العامة للقصص كبديل
  const mainStoryMeta = targetId 
    ? MAIN_STORIES.find((s) => s.id === targetId || targetId.toLowerCase().includes(s.id.toLowerCase()))
    : null;

  // حساب عدد الكلمات الفعلية والعبارات
  const computedWordsCount = storyData?.wordsCount 
    ? storyData.wordsCount 
    : fullStoryFromCourse
    ? fullStoryFromCourse.lines.reduce((acc, line) => acc + line.words.length, 0)
    : 245;

  const computedPhrasesCount = fullStoryFromCourse
    ? fullStoryFromCourse.totalLines
    : 12;

  // تجهيز بيانات القصة الديناميكية
  const story = {
    id: targetId || storyData?.id || "default",
    titleEn: storyData?.titleEn || fullStoryFromCourse?.title || mainStoryMeta?.titleEn || "Story Details",
    titleAr: storyData?.titleAr || fullStoryFromCourse?.titleAr || mainStoryMeta?.titleAr || "تفاصيل القصة",
    description: storyData?.description || fullStoryFromCourse?.descriptionAr || "قصة مشوقة لتعلم اللغة الإنجليزية وتطوير المفردات بشكل ممتع وسلس.",
    level: storyData?.level || fullStoryFromCourse?.cefrLevel || mainStoryMeta?.level || "B1",
    wordsCount: computedWordsCount,
    phrasesCount: computedPhrasesCount,
    duration: storyData?.duration || fullStoryFromCourse?.estimatedMinutes || parseInt(mainStoryMeta?.duration || "10") || 10,
    rating: storyData?.rating || parseFloat(mainStoryMeta?.rating || "4.9") || 4.9,
    progress: storyData?.progress ?? mainStoryMeta?.progress ?? 0,
    images: storyData?.images && storyData.images.length > 0 
      ? storyData.images 
      : [
          fullStoryFromCourse?.coverImage || mainStoryMeta?.cover || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        ]
  };

  // حالة عرض الصور والسلايد شو
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % story.images.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, story.images.length]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  const handleImageClick = () => {
    setIsPlaying(false);
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % story.images.length);
  };

  const handleStartStory = () => {
    if (story.id) {
      router.push(`/story/${story.id}`);
    }
  };

  const achievements = [
    {
      id: "finish",
      title: "إنهاء القصة",
      description: "أكمل القصة بنجاح",
      icon: <Trophy className="w-7 h-7 text-amber-500" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "mastery",
      title: "إتقان 100%",
      description: "أجب على جميع الأسئلة",
      icon: <ShieldCheck className="w-7 h-7 text-emerald-400" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "no-errors",
      title: "بدون أخطاء",
      description: "أكمل بدون أخطاء",
      icon: <Award className="w-7 h-7 text-amber-400" />,
      iconBg: "bg-red-500/10 border-red-500/20",
    },
    {
      id: "speed",
      title: "سرعة خيالية",
      description: "أكمل في وقت قياسي",
      icon: <Rocket className="w-7 h-7 text-indigo-400" />,
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-[#03050a]/75 backdrop-blur-xl">
      <div className="w-full max-w-[960px] bg-[#080B11] rounded-[28px] border border-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] [direction:ltr]">
        
        {/* Header Bar */}
        <div className="relative flex items-center justify-start mb-5">
          <button 
            onClick={onClose}
            className="z-10 flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/5 bg-[#0F131D] text-[#A0AEC0] transition-all hover:bg-[#181E2E] hover:text-white"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="pointer-events-none absolute left-0 w-full text-center text-[20px] font-bold text-[#F1F5F9] [direction:rtl]">
            تفاصيل القصة
          </div>
        </div>

        {/* Top Hero Section */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-5 rounded-[20px] border border-white/5 bg-[#0B0E17] p-4 [direction:ltr]">
          
          {/* Interactive Image Container */}
          <div 
            onClick={handleImageClick}
            className="relative h-[250px] overflow-hidden rounded-2xl cursor-pointer group select-none"
          >
            <img 
              src={story.images[currentImageIndex]} 
              alt={story.titleEn}
              className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

            {/* Play / Pause Toggle Button */}
            <button
              onClick={togglePlay}
              className="absolute bottom-4 left-4 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white shadow-[0_4px_20px_rgba(124,58,237,0.5)] transition-all hover:scale-110 active:scale-95 z-10"
              title={isPlaying ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"}
            >
              {isPlaying ? (
                <Pause size={20} className="fill-white" />
              ) : (
                <Play size={20} className="fill-white translate-x-0.5" />
              )}
            </button>

            {/* Dynamic Indicators */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
              {story.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(false);
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-[6px] rounded-full transition-all duration-300 ${
                    idx === currentImageIndex 
                      ? "w-[22px] bg-white" 
                      : "w-[6px] bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Story Info */}
          <div className="flex flex-col items-start [direction:ltr]">
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-xl border border-[#22D3EE]/20 bg-[#06B6D4]/10 px-3 py-1 text-[13px] font-semibold text-[#22D3EE] [direction:rtl]">
              <Calendar size={14} />
              <span>تفاعلية</span>
            </div>

            <h1 className="mb-0.5 text-[26px] font-extrabold tracking-tight text-white">
              {story.titleEn}
            </h1>
            
            <div className="mb-2.5 text-[17px] font-bold bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent [direction:rtl]">
              {story.titleAr}
            </div>

            <p className="mb-3.5 w-full text-right text-[13px] leading-relaxed text-[#94A3B8] [direction:rtl]">
              {story.description}
            </p>

            {/* Stats Row */}
            <div className="mt-auto grid w-full grid-cols-4 gap-2 [direction:ltr]">
              <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] py-2.5 px-1">
                <span className="text-[16px] font-bold text-[#38BDF8]">{story.level}</span>
                <BarChart2 size={14} className="text-[#38BDF8]" />
                <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">المستوى</span>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] py-2.5 px-1">
                <span className="text-[16px] font-bold text-white">{story.wordsCount}</span>
                <BookOpen size={14} className="text-[#94A3B8]" />
                <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">كلمة</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-white/5 bg-[#101420] py-2.5 px-1">
                <span className="text-[16px] font-bold text-white">{story.duration}</span>
                <Clock size={14} className="text-[#94A3B8]" />
                <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">دقيقة</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-0.5 rounded-[14px] border border-[#101420] bg-[#101420] py-2.5 px-1">
                <span className="text-[16px] font-bold text-white">{story.rating}</span>
                <Star size={14} className="fill-[#F59E0B] stroke-none" />
                <span className="text-[11px] font-medium text-[#64748B] [direction:rtl]">تقييم</span>
              </div>
            </div>

          </div>
        </div>

        {/* Middle Learning Features Box */}
        <div className="mb-4 rounded-[20px] border border-white/5 bg-[#0B0E17] p-4 [direction:ltr]">
          <div className="mb-3.5 flex items-center justify-center gap-2 text-[15px] font-bold text-[#E2E8F0] [direction:rtl]">
            <GraduationCap size={20} />
            <span>ستتعلم في هذه القصة</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-[repeat(5,1fr)_2.2fr] gap-2.5 [direction:ltr]">
            <div className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-white/[0.04] bg-[#0E121E] py-3 px-1.5 text-center">
              <div className="mb-0.5 flex h-[38px] w-[38px] items-center justify-center text-[#00D2FF]">
                <Type size={24} />
              </div>
              <div className="text-[14px] font-extrabold text-white [direction:rtl]">{story.wordsCount}</div>
              <div className="text-[11px] font-semibold text-[#64748B] [direction:rtl]">كلمة جديدة</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-white/[0.04] bg-[#0E121E] py-3 px-1.5 text-center">
              <div className="mb-0.5 flex h-[38px] w-[38px] items-center justify-center text-[#A855F7]">
                <FileText size={24} />
              </div>
              <div className="text-[14px] font-extrabold text-white [direction:rtl]">{story.phrasesCount}</div>
              <div className="text-[11px] font-semibold text-[#64748B] [direction:rtl]">عبارة شائعة</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-white/[0.04] bg-[#0E121E] py-3 px-1.5 text-center">
              <div className="mb-0.5 flex h-[38px] w-[38px] items-center justify-center text-[#C084FC]">
                <Headphones size={24} />
              </div>
              <div className="text-[14px] font-extrabold text-white [direction:rtl]">استماع</div>
              <div className="text-[11px] font-semibold text-[#64748B] [direction:rtl]">وتدريب</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-white/[0.04] bg-[#0E121E] py-3 px-1.5 text-center">
              <div className="mb-0.5 flex h-[38px] w-[38px] items-center justify-center text-[#D946EF]">
                <Mic size={24} />
              </div>
              <div className="text-[14px] font-extrabold text-white [direction:rtl]">نطق</div>
              <div className="text-[11px] font-semibold text-[#64748B] [direction:rtl]">أفضل</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-white/[0.04] bg-[#0E121E] py-3 px-1.5 text-center">
              <div className="mb-0.5 flex h-[38px] w-[38px] items-center justify-center text-[#A855F7]">
                <Pencil size={24} />
              </div>
              <div className="text-[14px] font-extrabold text-white [direction:rtl]">كتابة</div>
              <div className="text-[11px] font-semibold text-[#64748B] [direction:rtl]">وتلخيص</div>
            </div>

            {/* Progress Card Right Side */}
            <div className="col-span-3 sm:col-span-1 flex flex-col items-center justify-center rounded-[14px] border border-white/[0.04] bg-[#0E121E] py-3 px-4 text-center [direction:rtl]">
              <div className="text-[14px] font-bold text-[#CBD5E1]">التقدم</div>
              <div className="my-0.5 text-[32px] font-extrabold leading-tight bg-gradient-to-r from-[#00D2FF] to-[#A855F7] bg-clip-text text-transparent [direction:ltr]">
                {story.progress}%
              </div>
              <div className="mb-2 text-[11px] text-[#64748B]">
                {story.progress > 0 ? "واصل التعلم للوصول للهذف" : "ابدأ القصة الآن"}
              </div>
              <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#182032] [direction:ltr]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#00D2FF] to-[#A855F7] transition-all duration-500" 
                  style={{ width: `${story.progress}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Achievements Section Header */}
        <div className="mb-3 flex items-center justify-center gap-2 text-[14px] font-semibold text-slate-300 [direction:rtl]">
          <Lock className="w-4 h-4 text-slate-400" />
          <span>إنجازات يمكنك الحصول عليها</span>
        </div>

        {/* Achievements Grid */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 [direction:ltr]">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#090E17] border border-white/5 hover:border-white/10 transition-all shadow-md [direction:rtl]"
            >
              <div className="space-y-0.5 text-right">
                <h3 className="font-bold text-white text-[13px] leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-[11px] font-normal">
                  {item.description}
                </p>
              </div>

              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.iconBg} shrink-0`}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Action Button */}
        <button
          onClick={handleStartStory}
          className="w-full h-14 rounded-2xl font-bold text-[18px] text-white flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer [direction:rtl]"
          style={{
            background: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #7C3AED 100%)",
            boxShadow: "0 10px 30px rgba(124, 58, 237, 0.35)",
          }}
        >
          <Sparkles className="w-5 h-5 text-white fill-white" />
          <span>{story.progress > 0 ? "متابعة القصة" : "ابدأ القصة"}</span>
        </button>

      </div>
    </div>
  );
}