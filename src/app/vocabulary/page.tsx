"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { CategoryCard } from "@/components/vocabulary/category-card";
import { VocabRightPanel } from "@/components/vocabulary/vocab-right-panel";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { UserStatsService } from "@/lib/userStats";
import {
  Volume2,
  ArrowRight,
  Filter,
  CheckCircle2,
  BookmarkCheck,
  Keyboard,
  BookOpen,
  ChevronDown,
  BrainCircuit,
} from "lucide-react";
import {
  VOCABULARY_CATEGORIES,
  VocabularyCategory,
  VocabularyWord,
} from "@/data/vocabularyData";

const C = {
  page: "#05070E",
  border: "rgba(255,255,255,0.06)",
};

const LEVEL_SLICE_COLORS: Record<string, string> = {
  A1: "#64748B",
  A2: "#6EE7B7",
  B1: "#22E0C8",
  B2: "#7C6CFF",
  C1: "#FF6B6B",
  C2: "#F472B6",
};

const INITIAL_VISIBLE = 8;

function getAllWords(): VocabularyWord[] {
  return VOCABULARY_CATEGORIES.flatMap((c) => c.words);
}

function getCategoryProgress(cat: VocabularyCategory, learnedIds: string[]): number {
  if (cat.words.length === 0) return 0;
  const learned = cat.words.filter((w) => learnedIds.includes(w.id)).length;
  return Math.round((learned / cat.words.length) * 100);
}

export default function VocabularyPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | null>(null);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [wordSpeed, setWordSpeed] = useState<number>(1.0);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLevelFilter, setShowLevelFilter] = useState(false);
  const [categoryLevelFilter, setCategoryLevelFilter] = useState<string>("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [sentencePracticeMode, setSentencePracticeMode] = useState(false);
  const [typedSentenceInput, setTypedSentenceInput] = useState("");
  const [sentenceCompleted, setSentenceCompleted] = useState(false);
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState("B1");
  const [nickname, setNickname] = useState("warm_dusk1679");
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wordflow_learned_words");
      if (saved) setLearnedWordIds(JSON.parse(saved));
      const stats = UserStatsService.getStats();
      setUserLevel(stats.level);
      setStreak(stats.streakCount);
      setNickname(localStorage.getItem("wordflow_nickname") ?? "warm_dusk1679");
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveLearnedWord = (wordId: string) => {
    setLearnedWordIds((prev) => {
      if (prev.includes(wordId)) return prev;
      const updated = [...prev, wordId];
      localStorage.setItem("wordflow_learned_words", JSON.stringify(updated));
      return updated;
    });
  };

  const handlePlayWord = (wordText: string, speedOverride?: number) => {
    if (wordText) AudioService.playWord(wordText, speedOverride ?? wordSpeed);
  };

  const handlePlaySentence = (sentenceText: string) => {
    if (sentenceText) AudioService.playSentenceText(sentenceText, 1.0);
  };

  const handleSelectWord = (word: VocabularyWord) => {
    setSelectedWord(word);
    handlePlayWord(word.word);
    setSentencePracticeMode(false);
    setTypedSentenceInput("");
    setSentenceCompleted(false);
  };

  const openCategory = (cat: VocabularyCategory) => {
    setSelectedCategory(cat);
    setLevelFilter("all");
    setSelectedWord(cat.words[0] || null);
  };

  const startSentencePractice = (word: VocabularyWord) => {
    setSelectedWord(word);
    setSentencePracticeMode(true);
    setTypedSentenceInput("");
    setSentenceCompleted(false);
    handlePlaySentence(word.exampleEn);
  };

  const handleSentenceInputChange = (val: string) => {
    if (!selectedWord) return;
    setTypedSentenceInput(val);
    if (val.trim().toLowerCase() === selectedWord.exampleEn.trim().toLowerCase()) {
      setSentenceCompleted(true);
      saveLearnedWord(selectedWord.id);
    }
  };

  const startQuiz = (cat: VocabularyCategory) => {
    router.push(`/vocabulary/test?cat=${cat.id}`);
  };

  const allWords = useMemo(() => getAllWords(), []);
  const totalWords = allWords.length;

  const filteredCategories = useMemo(() => {
    return VOCABULARY_CATEGORIES.filter((cat) => {
      if (categoryLevelFilter !== "all") {
        const hasLevel = cat.words.some((w) => w.cefrLevel === categoryLevelFilter);
        if (!hasLevel) return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        cat.titleAr.includes(q) ||
        cat.titleEn.toLowerCase().includes(q) ||
        cat.words.some((w) => w.word.toLowerCase().includes(q) || w.translationAr.includes(q))
      );
    });
  }, [searchQuery, categoryLevelFilter]);

  const visibleCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, INITIAL_VISIBLE);

  const reviewCount = Math.min(24, Math.max(0, totalWords - learnedWordIds.length));

  const levelSlices = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of allWords) {
      counts[w.cefrLevel] = (counts[w.cefrLevel] ?? 0) + 1;
    }
    const levels = ["A2", "B1", "B2", "C1"] as const;
    return levels
      .filter((l) => (counts[l] ?? 0) > 0)
      .map((level) => ({
        level,
        count: counts[level] ?? 0,
        pct: Math.round(((counts[level] ?? 0) / totalWords) * 100),
        color: LEVEL_SLICE_COLORS[level],
      }));
  }, [allWords, totalWords]);

  const recentWords = useMemo(() => {
    const wordMap = new Map(allWords.map((w) => [w.id, w]));
    return learnedWordIds
      .slice(-4)
      .reverse()
      .map((id) => wordMap.get(id))
      .filter((w): w is VocabularyWord => !!w);
  }, [learnedWordIds, allWords]);

  const getFilteredWords = () => {
    if (!selectedCategory) return [];
    return selectedCategory.words.filter((w) => {
      const matchesSearch =
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translationAr.includes(searchQuery);
      if (levelFilter === "beginner") return matchesSearch && (w.cefrLevel === "A1" || w.cefrLevel === "A2");
      if (levelFilter === "intermediate") return matchesSearch && (w.cefrLevel === "B1" || w.cefrLevel === "B2");
      if (levelFilter === "advanced") return matchesSearch && (w.cefrLevel === "C1" || w.cefrLevel === "C2");
      return matchesSearch;
    });
  };

  return (
    <div className="min-h-screen text-white flex select-none font-sans" style={{ background: C.page }} dir="ltr">
      <AppSidebar active="المفردات" />

      <div className="flex-1 flex flex-col min-w-0">
        <AppShellHeader
          streak={streak}
          username={nickname}
          level={userLevel}
          searchPlaceholder="ابحث في المفردات..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main browse view */}
        {!selectedCategory && (
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto p-8 space-y-6" dir="rtl">
              {/* Page title */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={26} className="text-cyan-400" />
                    <h1 className="text-[28px] font-black text-white leading-none">المفردات</h1>
                  </div>
                  <p className="text-[13px] text-slate-400 max-w-md">
                    تعلم كلمات جديدة وراجع ما تعلمته بذكاء
                  </p>
                </div>

                <div className="relative flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold text-slate-300"
                    style={{ background: "#0D1220", borderColor: C.border }}
                  >
                    <span>مستواك:</span>
                    <span dir="ltr" className="text-cyan-400">
                      {userLevel}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLevelFilter((v) => !v)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold transition ${
                        categoryLevelFilter !== "all"
                          ? "text-cyan-400 border-cyan-500/40"
                          : "text-slate-300 hover:text-white"
                      }`}
                      style={{ background: "#0D1220", borderColor: C.border }}
                    >
                      <Filter size={15} />
                      <span>تصفية{categoryLevelFilter !== "all" ? ` · ${categoryLevelFilter}` : ""}</span>
                    </button>
                    {showLevelFilter && (
                      <div
                        className="absolute left-0 top-full mt-2 z-30 min-w-[160px] rounded-xl border py-1 shadow-xl"
                        style={{ background: "#0D1220", borderColor: C.border }}
                      >
                        {[
                          { id: "all", label: "كل المستويات" },
                          { id: "A2", label: "A2" },
                          { id: "B1", label: "B1" },
                          { id: "B2", label: "B2" },
                          { id: "C1", label: "C1" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setCategoryLevelFilter(opt.id);
                              setShowLevelFilter(false);
                            }}
                            className={`block w-full text-right px-4 py-2.5 text-[13px] font-bold transition hover:bg-white/[0.04] ${
                              categoryLevelFilter === opt.id ? "text-cyan-400" : "text-slate-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category grid — 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleCategories.map((cat, i) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    index={i}
                    progress={getCategoryProgress(cat, learnedWordIds)}
                    onClick={() => openCategory(cat)}
                  />
                ))}
              </div>

              {filteredCategories.length > INITIAL_VISIBLE && !showAllCategories && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories(true)}
                  className="flex items-center justify-center gap-1.5 w-full py-3 text-[13px] font-bold text-slate-400 hover:text-cyan-400 transition"
                >
                  <span>عرض المزيد من الفئات</span>
                  <ChevronDown size={16} />
                </button>
              )}

              {/* Right panel — mobile / tablet */}
              <div className="xl:hidden pt-2">
                <VocabRightPanel
                  reviewCount={reviewCount}
                  totalWords={totalWords}
                  levelSlices={levelSlices}
                  recentWords={recentWords}
                />
              </div>
            </main>

            <div className="hidden xl:block border-l pr-6 pl-2 pt-8" style={{ borderColor: C.border }}>
              <VocabRightPanel
                reviewCount={reviewCount}
                totalWords={totalWords}
                levelSlices={levelSlices}
                recentWords={recentWords}
              />
            </div>
          </div>
        )}

        {/* Category detail view */}
        {selectedCategory && (
          <main className="flex-1 overflow-y-auto p-8 space-y-8" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: C.border }}>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لجميع الفئات</span>
              </button>

              <div className="flex items-center gap-2 bg-[#0D1220] p-1.5 rounded-full border text-xs font-bold" style={{ borderColor: C.border }}>
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
                {[
                  { id: "all", label: "الكل" },
                  { id: "beginner", label: "🟢 مبتدئ (A1-A2)" },
                  { id: "intermediate", label: "🔵 متوسط (B1-B2)" },
                  { id: "advanced", label: "🔴 متقدم (C1)" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setLevelFilter(lvl.id)}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      levelFilter === lvl.id
                        ? "bg-cyan-500 text-[#05070E] font-extrabold shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => startQuiz(selectedCategory)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#05070E] font-extrabold text-xs shadow-lg hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(to left, #22E0C8, #3B82F6)" }}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>اختبار حفظ الفئة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {selectedWord && (
                <div
                  className="lg:col-span-7 p-8 rounded-3xl border shadow-2xl relative space-y-6 sticky top-4"
                  style={{ background: "#0B0F1C", borderColor: "rgba(34,224,200,0.25)" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="px-3.5 py-1 rounded-full text-cyan-400 text-xs font-mono font-bold border border-cyan-500/30 bg-cyan-500/10">
                      مستوى {selectedWord.cefrLevel} • {selectedWord.partOfSpeech}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayWord(selectedWord.word)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#05070E] font-extrabold text-xs shadow-lg transition-all active:scale-95"
                        style={{ background: "linear-gradient(to left, #22E0C8, #3B82F6)" }}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>استمع لنطق الكلمة</span>
                      </button>
                      <div className="flex items-center gap-1 p-1 rounded-full bg-[#0D1220] border border-white/[0.06] text-[11px] font-mono font-bold">
                        {[
                          { label: "1x", rate: 1.0 },
                          { label: "0.7x", rate: 0.7 },
                          { label: "0.5x", rate: 0.5 },
                        ].map((s) => (
                          <button
                            key={s.rate}
                            type="button"
                            onClick={() => {
                              setWordSpeed(s.rate);
                              handlePlayWord(selectedWord.word, s.rate);
                            }}
                            className={`px-2 py-1 rounded-full transition-all ${
                              wordSpeed === s.rate
                                ? "bg-cyan-500 text-[#05070E] font-extrabold"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-4xl sm:text-5xl font-extrabold font-sans text-white tracking-wide dir-ltr text-left">
                      {selectedWord.word}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-slate-400 dir-ltr">{selectedWord.ipa}</span>
                      <span className="text-2xl font-bold text-cyan-400">{selectedWord.translationAr}</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0D1220] border border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        جملة مثال في السياق:
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlaySentence(selectedWord.exampleEn)}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-[#05070E] text-cyan-400 font-bold text-xs border border-cyan-500/30 transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>استمع للجملة</span>
                      </button>
                    </div>
                    <p className="text-lg font-bold font-sans text-white dir-ltr text-left leading-relaxed">
                      &ldquo;{selectedWord.exampleEn}&rdquo;
                    </p>
                    <p className="text-sm font-bold text-slate-300 dir-rtl text-right">
                      {selectedWord.exampleAr}
                    </p>

                    {!sentencePracticeMode ? (
                      <button
                        type="button"
                        onClick={() => startSentencePractice(selectedWord)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs border border-cyan-500/30 transition-all mt-2"
                      >
                        <Keyboard className="w-4 h-4" />
                        <span>تدرّب على كتابة هذه الجملة بنفسك</span>
                      </button>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                        <span className="text-xs text-cyan-400 font-bold block">
                          اكتب الجملة بالإنجليزية كما هي:
                        </span>
                        <input
                          type="text"
                          placeholder="اكتب الجملة الإنجليزية هنا..."
                          value={typedSentenceInput}
                          onChange={(e) => handleSentenceInputChange(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-[#05070E] border border-cyan-500/50 text-white font-sans text-base dir-ltr text-left focus:outline-none focus:border-cyan-400"
                          autoFocus
                        />
                        {sentenceCompleted && (
                          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>أحسنت! كتبت الجملة كاملة بنجاح وحفظت الكلمة</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs text-slate-400 font-bold block mb-2 px-1">
                  اختر أي كلمة للتفاعل والنطق ({getFilteredWords().length} كلمة):
                </span>
                {getFilteredWords().length > 0 ? (
                  getFilteredWords().map((w) => {
                    const isSelected = selectedWord?.id === w.id;
                    const isLearned = learnedWordIds.includes(w.id);
                    let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                    if (w.cefrLevel === "B1" || w.cefrLevel === "B2") {
                      badgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
                    } else if (w.cefrLevel === "C1" || w.cefrLevel === "C2") {
                      badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                    }
                    return (
                      <div
                        key={w.id}
                        onClick={() => handleSelectWord(w)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 shadow-lg text-white"
                            : "bg-[#0D1220] hover:bg-[#12182A] border-white/[0.06] text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayWord(w.word);
                            }}
                            className="p-2 rounded-full bg-[#0B0F1C] hover:bg-cyan-500 hover:text-[#05070E] text-slate-300 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-sans dir-ltr text-left">{w.word}</span>
                              {isLearned && <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <span className="text-xs text-slate-400">{w.translationAr}</span>
                          </div>
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${badgeColor}`}>
                          {w.cefrLevel}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-white/[0.06] text-xs text-slate-400" style={{ background: "#0B0F1C" }}>
                    لا توجد كلمات ضمن هذا المستوى حالياً.
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
