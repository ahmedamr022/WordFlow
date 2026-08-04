"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Sparkles, ArrowLeft, Volume2, Award, Zap, BrainCircuit } from "lucide-react";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { UserStatsService } from "@/lib/userStats";

interface AdaptiveQuestion {
  id: string;
  category: "grammar" | "listening" | "vocabulary";
  categoryAr: string;
  questionText: string;
  audioPrompt?: string;
  options: string[];
  correctAnswer: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2";
  explanationAr: string;
}

const TEN_ADAPTIVE_QUESTIONS: AdaptiveQuestion[] = [
  {
    id: "q1",
    category: "grammar",
    categoryAr: "تراكيب وقواعد",
    questionText: "She _______ to the market yesterday morning.",
    options: ["go", "goes", "went", "going"],
    correctAnswer: "went",
    cefrLevel: "A1",
    explanationAr: "تستخدم 'went' لأن الجملة في زمن الماضي البسيط (yesterday).",
  },
  {
    id: "q2",
    category: "listening",
    categoryAr: "الاستماع والتمييز الصوتي 🎧",
    questionText: "استمع واضغط للاستماع ثم اختر الكلمة الصحيحة التي سمعتها:",
    audioPrompt: "Practice makes perfect.",
    options: ["Practice", "Predict", "Product", "Protect"],
    correctAnswer: "Practice",
    cefrLevel: "A1",
    explanationAr: "الكلمة المنطوقة هي Practice وتعني التمرين والممارسة.",
  },
  {
    id: "q3",
    category: "vocabulary",
    categoryAr: "سياق المفردات",
    questionText: "What is the closest synonym for 'achieve'?",
    options: ["accomplish", "abandon", "avoid", "accept"],
    correctAnswer: "accomplish",
    cefrLevel: "A2",
    explanationAr: "كلمة achieve تعني 'تحقيق' والمرادف الأقرب لها هو accomplish.",
  },
  {
    id: "q4",
    category: "grammar",
    categoryAr: "تراكيب وتخييل شرطي",
    questionText: "If I _______ enough time, I would travel around the world.",
    options: ["have", "had", "will have", "would have"],
    correctAnswer: "had",
    cefrLevel: "B1",
    explanationAr: "تستخدم 'had' في القاعدة الشرطية الثانية (Unreal Conditional).",
  },
  {
    id: "q5",
    category: "listening",
    categoryAr: "الاستماع والتمييز الصوتي 🎧",
    questionText: "استمع اختر الكلمة المطلوبة:",
    audioPrompt: "The ocean is deep.",
    options: ["ocean", "option", "open", "opinion"],
    correctAnswer: "ocean",
    cefrLevel: "A2",
    explanationAr: "الكلمة هي Ocean وتعني المحيط.",
  },
  {
    id: "q6",
    category: "vocabulary",
    categoryAr: "المفردات والسياق",
    questionText: "He felt _______ after running a long marathon.",
    options: ["exhausted", "excited", "eager", "efficient"],
    correctAnswer: "exhausted",
    cefrLevel: "B1",
    explanationAr: "كلمة exhausted تعني مرهق ومتعب جداً بعد الجري.",
  },
  {
    id: "q7",
    category: "grammar",
    categoryAr: "الأزمنة المتقدمة",
    questionText: "By next year, they _______ building the new bridge.",
    options: ["finish", "will have finished", "finished", "are finishing"],
    correctAnswer: "will have finished",
    cefrLevel: "B2",
    explanationAr: "زمن المستقبل التام (Future Perfect) للتعبير عن حدث سيكتمل بحلول وقت مستقبلي.",
  },
  {
    id: "q8",
    category: "vocabulary",
    categoryAr: "تعبير ومعنى",
    questionText: "The word 'resilient' means being able to:",
    options: ["recover quickly from difficulty", "speak quickly", "sleep deeply", "run fast"],
    correctAnswer: "recover quickly from difficulty",
    cefrLevel: "B2",
    explanationAr: "resilient تعني المرونة والقدرة على التعافي والنهوض بسرعة من الصعاب.",
  },
  {
    id: "q9",
    category: "grammar",
    categoryAr: "تراكيب وأدوات الربط",
    questionText: "_______ the rain was heavy, we enjoyed our trip.",
    options: ["Although", "Because", "Despite", "In spite of"],
    correctAnswer: "Although",
    cefrLevel: "B1",
    explanationAr: "Although تستخدم لربط جمل التناقض ويأتي بعدها فاعل وفعل كامل.",
  },
  {
    id: "q10",
    category: "listening",
    categoryAr: "الاستماع المتقدم 🎧",
    questionText: "اختر الجملة الصحيحة المنطوقة:",
    audioPrompt: "Books open doors to new worlds.",
    options: ["Books open doors to new worlds.", "Look at the doors of the world.", "Walk quietly into the library.", "Knowledge brings great power."],
    correctAnswer: "Books open doors to new worlds.",
    cefrLevel: "B1",
    explanationAr: "الجملة المنطوقة هي Books open doors to new worlds.",
  },
];

export default function AutoPlacementTestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; isCorrect: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = TEN_ADAPTIVE_QUESTIONS[currentIndex];

  const handlePlayAudio = () => {
    if (currentQ.audioPrompt) {
      AudioService.playText(currentQ.audioPrompt, 1.0);
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    const updatedAnswers = [...userAnswers, { questionId: currentQ.id, isCorrect }];
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 < TEN_ADAPTIVE_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsCompleted(true);
    }
  };

  const getCalculatedLevel = () => {
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    if (correctCount >= 9) return "B2";
    if (correctCount >= 7) return "B1";
    if (correctCount >= 4) return "A2";
    return "A1";
  };

  const finishTest = () => {
    const finalLevel = getCalculatedLevel();
    localStorage.setItem("wordflow_level", finalLevel);
    UserStatsService.setLevel(finalLevel);
    router.push("/dashboard");
  };

  if (isCompleted) {
    const finalLevel = getCalculatedLevel();
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / TEN_ADAPTIVE_QUESTIONS.length) * 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#07090e] text-white font-arabic dir-rtl selection:bg-sky-400">
        <div className="w-full max-w-lg p-8 rounded-3xl glass-card border border-sky-400/40 text-center animate-in zoom-in-95 duration-300 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold mb-2">تم تحليل مستواك بنجاح! 🎉</h2>
            <p className="text-sm text-slate-400">
              بناءً على نتائجك في الـ 10 أسئلة التكيفية لـ WordFlow:
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-sky-400/30 space-y-3">
            <span className="text-xs text-sky-400 font-bold block uppercase tracking-widest font-mono">
              النتيجة النهائية للمستوى
            </span>
            <span className="block text-5xl font-extrabold font-mono text-sky-400">
              مستوى {finalLevel}
            </span>
            <div className="flex items-center justify-center gap-4 pt-2 text-xs font-mono text-slate-300">
              <span>نسبة الإجابة الصحيحة: {accuracy}%</span>
              <span>•</span>
              <span>الأسئلة الصحيحة: {correctCount}/{TEN_ADAPTIVE_QUESTIONS.length}</span>
            </div>
          </div>

          <button
            onClick={finishTest}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold transition-all shadow-xl shadow-sky-500/30 active:scale-95 text-base"
          >
            <span>الانتقال لمسارك المخصص</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#07090e] text-white font-arabic dir-rtl selection:bg-sky-400">
      <div className="w-full max-w-xl p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl animate-in fade-in duration-300 space-y-6">
        {/* Adaptive Radar & Progress Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <span className="font-extrabold text-base text-white">اختبار WordFlow التكيفي (10 أسئلة)</span>
              <span className="block text-[11px] text-sky-400 font-mono">
                مستوى السؤال: {currentQ.cefrLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <BrainCircuit className="w-4 h-4 text-sky-400" />
            <span>سؤال {currentIndex + 1} من {TEN_ADAPTIVE_QUESTIONS.length}</span>
          </div>
        </div>

        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>{currentQ.categoryAr}</span>
        </div>

        {/* Audio Button Prompt if Listening Question */}
        {currentQ.category === "listening" && (
          <button
            onClick={handlePlayAudio}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-sky-500/30 transition-all active:scale-95 my-2"
          >
            <Volume2 className="w-5 h-5" />
            <span>اضغط للاستماع للجملة الصوتية</span>
          </button>
        )}

        {/* Question Text Box */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-lg font-bold font-sans dir-ltr text-left text-white leading-relaxed">
          {currentQ.questionText}
        </div>

        {/* Options Grid */}
        <div className="space-y-3 dir-ltr">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelectedOption(opt)}
              className={`w-full p-4 rounded-2xl text-left font-sans font-medium transition-all ${
                selectedOption === opt
                  ? "bg-sky-500/20 border-2 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                  : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
              }`}
            >
              <span className="font-bold mr-3 text-slate-500">
                {String.fromCharCode(65 + i)})
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`w-full p-4 rounded-full font-bold font-arabic transition-all flex items-center justify-center gap-2 text-base ${
            selectedOption
              ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-extrabold shadow-xl shadow-sky-500/30 active:scale-95"
              : "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800"
          }`}
        >
          <span>تأكيد الإجابة والانتقال</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
