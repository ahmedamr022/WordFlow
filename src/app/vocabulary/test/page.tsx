"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { useLearnedWords } from "@/hooks/useLearnedWords";
import {
  ArrowRight,
  RotateCcw,
  Trophy,
  BrainCircuit,
  Sparkles } from
"lucide-react";
import {
  VOCABULARY_CATEGORIES,
  VocabularyWord } from
"@/data/vocabularyData";

function splitSentenceByWord(sentence: string, targetWord: string) {
  if (!sentence || !targetWord) {
    return { before: "", target: targetWord || "", after: "" };
  }

  const escapedWord = targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexBoundary = new RegExp(`\\b${escapedWord}\\b`, "i");
  const matchBoundary = sentence.match(regexBoundary);

  if (matchBoundary && matchBoundary.index !== undefined) {
    const startIdx = matchBoundary.index;
    const endIdx = startIdx + matchBoundary[0].length;
    return {
      before: sentence.slice(0, startIdx),
      target: matchBoundary[0],
      after: sentence.slice(endIdx)
    };
  }

  const lowerSentence = sentence.toLowerCase();
  const lowerWord = targetWord.trim().toLowerCase();
  const index = lowerSentence.indexOf(lowerWord);

  if (index !== -1) {
    return {
      before: sentence.slice(0, index),
      target: sentence.slice(index, index + targetWord.length),
      after: sentence.slice(index + targetWord.length)
    };
  }

  return {
    before: sentence,
    target: targetWord,
    after: ""
  };
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const catId = searchParams?.get("cat") || "possessives";

  const category =
  VOCABULARY_CATEGORIES.find((c) => c.id === catId) ||
  VOCABULARY_CATEGORIES[0];

  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  /**
   * قبل: localStorage["wordflow_learned_words"] — تقدم محلي يضيع بتغيير
   * المتصفح، ولا يمنح أي XP، ويمكن تزويره من الكونسول.
   * بعد: useLearnedWords → markWordLearnedByTextAction → record_word_review
   * (SECURITY DEFINER) فتُمنح النقطة مرة واحدة فقط لكل كلمة على السيرفر.
   */
  const { markLearned, error: saveError } = useLearnedWords();

  const handleQuizInputChange = async (val: string, wordObj: VocabularyWord) => {
    if (isAnswerCorrect) return;
    setUserAnswer(val);

    if (val.trim().toLowerCase() === wordObj.word.trim().toLowerCase()) {
      setIsAnswerCorrect(true);
      setQuizScore((prev) => prev + 1);
      void markLearned(wordObj.word, wordObj.partOfSpeech);

      // Wait for sentence audio to finish playing
      await AudioService.playSentenceText(wordObj.exampleEn, 1.0);

      // Then wait 1 second before moving to next question
      setTimeout(() => {
        setIsAnswerCorrect(false);
        setUserAnswer("");
        if (quizIndex + 1 < category.words.length) {
          setQuizIndex((prev) => prev + 1);
        } else {
          setQuizCompleted(true);
        }
      }, 1000);
    }
  };

  const currentWordObj = category.words[quizIndex];
  const sentenceParts = currentWordObj ?
  splitSentenceByWord(currentWordObj.exampleEn, currentWordObj.word) :
  { before: "", target: "", after: "" };

  const completionPct = category.words.length ?
  Math.round(quizScore / category.words.length * 100) :
  0;

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-arabic dir-rtl flex flex-col justify-between p-4 md:p-10 selection:bg-sky-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div aria-hidden className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div aria-hidden className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* TOP FLOATING QUIZ HEADER */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4 py-4 px-6 rounded-2xl glass-card border border-slate-800/90 shadow-xl z-20">
        <button
          type="button"
          onClick={() => {
            if (quizCompleted) {
              router.push("/vocabulary");
            } else {
              setShowExitConfirmModal(true);
            }
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-sky-400 transition-colors bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 shadow-md active:scale-95">
          
          <ArrowRight className="w-4 h-4" aria-hidden />
          <span>العودة للمفردات</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner">
          <span className="text-lg" aria-hidden>{category.icon}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            اختبار فئة: <span className="text-sky-400 font-extrabold">{category.titleAr}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">
            {quizIndex + 1} / {category.words.length}
          </span>
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-extrabold shadow-sm">
            النقاط: {quizScore}
          </span>
        </div>
      </header>

      {saveError &&
      <div role="alert" className="max-w-5xl mx-auto w-full mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {saveError}
        </div>
      }

      {/* MAIN QUIZ CARD — WIDE & SPACIOUS CONTAINER */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8">
        {!quizCompleted ?
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300" key={quizIndex}>
            {/* CEFR Badge */}
            <div className="text-center">
              <span className="px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-bold border border-sky-500/30 inline-flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" aria-hidden />
                <span>مستوى {currentWordObj.cefrLevel} • {currentWordObj.partOfSpeech}</span>
              </span>
            </div>

            {/* Arabic Sentence — Big with Target Word Highlighted in Emerald */}
            <div className="text-center max-w-4xl mx-auto animate-in zoom-in-95 duration-300 space-y-4">
              {(() => {
              const arSentence = currentWordObj.exampleAr;
              const arWord = currentWordObj.translationAr;
              const arWordParts = arWord.split(/[\s\/،,]+/).filter((p) => p.length > 1);

              const tryHighlight = (): {found: boolean;jsx: React.ReactNode;} => {
                // 1) Exact full match
                let idx = arSentence.indexOf(arWord);
                if (idx !== -1) {
                  return {
                    found: true,
                    jsx:
                    <>
                          <span>{arSentence.slice(0, idx)}</span>
                          <span className="text-emerald-400">{arWord}</span>
                          <span>{arSentence.slice(idx + arWord.length)}</span>
                        </>

                  };
                }

                // 2) Match any individual part of translationAr (e.g. "مركبة / سيارة")
                for (const part of arWordParts) {
                  idx = arSentence.indexOf(part);
                  if (idx !== -1) {
                    return {
                      found: true,
                      jsx:
                      <>
                            <span>{arSentence.slice(0, idx)}</span>
                            <span className="text-emerald-400">{arSentence.slice(idx, idx + part.length)}</span>
                            <span>{arSentence.slice(idx + part.length)}</span>
                          </>

                    };
                  }
                }

                // 3) Check if any word in the sentence CONTAINS a translation part
                const sentenceWords = arSentence.split(/\s+/);
                for (const part of arWordParts) {
                  for (const sw of sentenceWords) {
                    if (sw.includes(part) && part.length >= 2) {
                      const sIdx = arSentence.indexOf(sw);
                      if (sIdx !== -1) {
                        return {
                          found: true,
                          jsx:
                          <>
                                <span>{arSentence.slice(0, sIdx)}</span>
                                <span className="text-emerald-400">{sw}</span>
                                <span>{arSentence.slice(sIdx + sw.length)}</span>
                              </>

                        };
                      }
                    }
                  }
                }

                // 4) Reverse: check if any sentence word is a substring of translation parts
                for (const sw of sentenceWords) {
                  const cleanSw = sw.replace(/[^\u0600-\u06FF]/g, "");
                  if (cleanSw.length < 2) continue;
                  for (const part of arWordParts) {
                    if (part.includes(cleanSw) || cleanSw.includes(part)) {
                      const sIdx = arSentence.indexOf(sw);
                      if (sIdx !== -1) {
                        return {
                          found: true,
                          jsx:
                          <>
                                <span>{arSentence.slice(0, sIdx)}</span>
                                <span className="text-emerald-400">{sw}</span>
                                <span>{arSentence.slice(sIdx + sw.length)}</span>
                              </>

                        };
                      }
                    }
                  }
                }

                return { found: false, jsx: arSentence };
              };

              const result = tryHighlight();

              return (
                <>
                    {/* Show translation badge when no highlight was found */}
                    {!result.found &&
                  <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-lg sm:text-xl font-bold border border-emerald-500/30 font-arabic">
                        {arWord}
                      </span>
                  }
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-arabic text-slate-100 leading-relaxed dir-rtl">
                      {result.jsx}
                    </h1>
                  </>);

            })()}
            </div>

            {/* English Sentence with Inline Fill-in-the-Blank */}
            <div className="w-full py-10 px-6 sm:px-12 rounded-3xl glass-card border border-slate-700/80 shadow-2xl text-center">
              <p
              dir="ltr"
              style={{ direction: "ltr", unicodeBidi: "isolate" }}
              className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-slate-300 leading-[3rem] sm:leading-[3.5rem] md:leading-[4rem] text-center">
              
                {sentenceParts.before && <span>{sentenceParts.before}</span>}

                <input
                type="text"
                aria-label="اكتب الكلمة الناقصة بالإنجليزية"
                placeholder="______"
                value={userAnswer}
                onChange={(e) => handleQuizInputChange(e.target.value, currentWordObj)}
                style={{ verticalAlign: "baseline" }}
                className={`inline mx-1 w-[120px] sm:w-[160px] md:w-[200px] px-3 py-0 font-extrabold text-center focus:outline-none transition-all duration-300 text-xl sm:text-2xl md:text-3xl tracking-wide border-b-[3px] bg-transparent ${
                isAnswerCorrect ?
                "border-emerald-400 text-emerald-300 animate-pulse" :
                "border-sky-400 text-sky-300 focus:border-sky-300"}`
                }
                autoFocus />
              

                {sentenceParts.after && <span>{sentenceParts.after}</span>}
              </p>
            </div>
          </div> : (

        /* QUIZ COMPLETED CELEBRATION VIEW */
        <div className="text-center py-12 px-6 max-w-xl mx-auto space-y-8 glass-card border border-sky-400/40 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500/30 to-emerald-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center mx-auto shadow-2xl shadow-sky-500/20">
              <Trophy className="w-12 h-12 text-sky-400" aria-hidden />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-arabic">
                أحسنت! أتممت الاختبار بنجاح 🎉
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-arabic">
                لقد أجبت على الكلمات بنجاح وتم تحديث رصيد كلماتك المحفوظة على حسابك.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-around">
              <div>
                <span className="block text-3xl font-extrabold font-mono text-sky-400">
                  {quizScore} / {category.words.length}
                </span>
                <span className="text-xs text-slate-400 font-arabic">الإجابات الصحيحة</span>
              </div>
              <div className="h-10 w-[1px] bg-slate-800" aria-hidden />
              <div>
                {/* قبل: "100%" ثابتة مهما كانت النتيجة. */}
                <span className="block text-3xl font-extrabold font-mono text-emerald-400">
                  {completionPct}%
                </span>
                <span className="text-xs text-slate-400 font-arabic">نسبة الإكمال</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
              type="button"
              onClick={() => {
                setQuizIndex(0);
                setQuizScore(0);
                setQuizCompleted(false);
                setUserAnswer("");
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all shadow-md">
              
                <RotateCcw className="w-4 h-4" aria-hidden />
                <span>إعادة الاختبار</span>
              </button>

              <Link
              href="/vocabulary"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-sky-500/20">
              
                <ArrowRight className="w-4 h-4" aria-hidden />
                <span>العودة لجميع الفئات</span>
              </Link>
            </div>
          </div>)
        }
      </main>

      {/* FOOTER HINT */}
      <footer className="max-w-5xl mx-auto w-full text-center py-2 text-xs text-slate-500 font-arabic">
        اكتب الكلمة بالإنجليزية في الفراغ ليتم التحقق والانتقال تلقائياً ⌨️
      </footer>

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirmModal &&
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-quiz-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full text-center space-y-6 shadow-2xl dir-rtl font-arabic animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
              <BrainCircuit className="w-8 h-8" aria-hidden />
            </div>

            <div className="space-y-2">
              <h3 id="exit-quiz-title" className="text-xl font-extrabold text-white">
                هل ترغب في الخروج من الاختبار؟
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                سيتم إلغاء التقدم في الاختبار الحالي والعودة لقائمة الفئات. الكلمات المكتملة مسبقاً محفوظة على حسابك.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
              type="button"
              onClick={() => setShowExitConfirmModal(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all">
              
                مواصلة الاختبار ⚡
              </button>
              <button
              type="button"
              onClick={() => {
                setShowExitConfirmModal(false);
                router.push("/vocabulary");
              }}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all">
              
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}

export default function VocabularyTestPage() {
  return (
    <Suspense
      fallback={
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center font-arabic">
          جاري تحميل الاختبار...
        </div>
      }>
      
      <QuizContent />
    </Suspense>);

}