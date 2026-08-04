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
  card: "#0B101B",
  border: "rgba(255,255,255,.06)",
  cyan: "#20E3D6",
  purple: "#7C5CFF",
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

function getCategoryProgress(
  cat: VocabularyCategory,
  learnedIds: string[]
): number {
  if (!cat.words.length) return 0;

  const learned = cat.words.filter((w) =>
    learnedIds.includes(w.id)
  ).length;

  return Math.round((learned / cat.words.length) * 100);
}

export default function VocabularyPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] =
    useState<VocabularyCategory | null>(null);

  const [selectedWord, setSelectedWord] =
    useState<VocabularyWord | null>(null);

  const [wordSpeed, setWordSpeed] = useState(1);

  const [levelFilter, setLevelFilter] =
    useState("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showLevelFilter, setShowLevelFilter] =
    useState(false);

  const [categoryLevelFilter, setCategoryLevelFilter] =
    useState("all");

  const [showAllCategories, setShowAllCategories] =
    useState(false);

  const [sentencePracticeMode, setSentencePracticeMode] =
    useState(false);

  const [typedSentenceInput, setTypedSentenceInput] =
    useState("");

  const [sentenceCompleted, setSentenceCompleted] =
    useState(false);

  const [learnedWordIds, setLearnedWordIds] =
    useState<string[]>([]);

  const [userLevel, setUserLevel] =
    useState("B1");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "wordflow_learned_words"
      );

      if (saved) {
        setLearnedWordIds(JSON.parse(saved));
      }

      const stats = UserStatsService.getStats();
      setUserLevel(stats.level);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const saveLearnedWord = (wordId: string) => {
    setLearnedWordIds((prev) => {
      if (prev.includes(wordId)) return prev;

      const updated = [...prev, wordId];

      localStorage.setItem(
        "wordflow_learned_words",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const handlePlayWord = (
    text: string,
    speedOverride?: number
  ) => {
    if (!text) return;

    AudioService.playWord(
      text,
      speedOverride ?? wordSpeed
    );
  };

  const handlePlaySentence = (text: string) => {
    if (!text) return;

    AudioService.playSentenceText(text, 1);
  };

  const handleSelectWord = (
    word: VocabularyWord
  ) => {
    setSelectedWord(word);

    handlePlayWord(word.word);

    setSentencePracticeMode(false);

    setTypedSentenceInput("");

    setSentenceCompleted(false);
  };

  const openCategory = (
    category: VocabularyCategory
  ) => {
    setSelectedCategory(category);

    setLevelFilter("all");

    setSelectedWord(category.words[0] ?? null);
  };

  const startSentencePractice = (
    word: VocabularyWord
  ) => {
    setSelectedWord(word);

    setSentencePracticeMode(true);

    setTypedSentenceInput("");

    setSentenceCompleted(false);

    handlePlaySentence(word.exampleEn);
  };

  const handleSentenceInputChange = (
    value: string
  ) => {
    if (!selectedWord) return;

    setTypedSentenceInput(value);

    if (
      value.trim().toLowerCase() ===
      selectedWord.exampleEn
        .trim()
        .toLowerCase()
    ) {
      setSentenceCompleted(true);

      saveLearnedWord(selectedWord.id);
    }
  };

  const startQuiz = (
    category: VocabularyCategory
  ) => {
    router.push(`/vocabulary/test?cat=${category.id}`);
  };

  const allWords = useMemo(
    () => getAllWords(),
    []
  );

  const totalWords = allWords.length;
  const filteredCategories = useMemo(() => {
    return VOCABULARY_CATEGORIES.filter((cat) => {
      if (categoryLevelFilter !== "all") {
        const hasLevel = cat.words.some(
          (w) => w.cefrLevel === categoryLevelFilter
        );

        if (!hasLevel) return false;
      }

      if (!searchQuery) return true;

      const q = searchQuery.toLowerCase();

      return (
        cat.titleAr.includes(q) ||
        cat.titleEn.toLowerCase().includes(q) ||
        cat.words.some(
          (w) =>
            w.word.toLowerCase().includes(q) ||
            w.translationAr.includes(q)
        )
      );
    });
  }, [searchQuery, categoryLevelFilter]);

  const visibleCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, INITIAL_VISIBLE);

  const reviewCount = Math.min(
    24,
    Math.max(
      0,
      totalWords - learnedWordIds.length
    )
  );

  const levelSlices = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const word of allWords) {
      counts[word.cefrLevel] =
        (counts[word.cefrLevel] ?? 0) + 1;
    }

    const levels = [
      "A2",
      "B1",
      "B2",
      "C1",
    ] as const;

    return levels
      .filter((l) => (counts[l] ?? 0) > 0)
      .map((level) => ({
        level,
        count: counts[level] ?? 0,
        pct: Math.round(
          ((counts[level] ?? 0) / totalWords) * 100
        ),
        color: LEVEL_SLICE_COLORS[level],
      }));
  }, [allWords, totalWords]);

  const recentWords = useMemo(() => {
    const map = new Map(
      allWords.map((w) => [w.id, w])
    );

    return learnedWordIds
      .slice(-4)
      .reverse()
      .map((id) => map.get(id))
      .filter(
        (w): w is VocabularyWord => !!w
      );
  }, [learnedWordIds, allWords]);

  const getFilteredWords = () => {
    if (!selectedCategory) return [];

    return selectedCategory.words.filter((w) => {
      const matchesSearch =
        w.word
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        w.translationAr.includes(searchQuery);

      if (levelFilter === "beginner") {
        return (
          matchesSearch &&
          (w.cefrLevel === "A1" ||
            w.cefrLevel === "A2")
        );
      }

      if (levelFilter === "intermediate") {
        return (
          matchesSearch &&
          (w.cefrLevel === "B1" ||
            w.cefrLevel === "B2")
        );
      }

      if (levelFilter === "advanced") {
        return (
          matchesSearch &&
          (w.cefrLevel === "C1" ||
            w.cefrLevel === "C2")
        );
      }

      return matchesSearch;
    });
  };

  return (
    <div
      className="min-h-screen flex text-white"
      style={{ background: C.page }}
      dir="ltr"
    >
      <AppSidebar active="المفردات" />

      <div className="flex-1 flex flex-col min-w-0">

        {/* الـ Header الآن يجلب بيانات المستخدم الحقيقية بنفسه تلقائياً من Supabase */}
        <AppShellHeader
          searchPlaceholder="ابحث في المفردات..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {!selectedCategory && (
          <div className="flex-1 flex overflow-hidden">

            {/* =========================
                    MAIN CONTENT
            ========================== */}

            <main
              className="flex-1 overflow-y-auto px-8 py-7"
              dir="rtl"
            >

              {/* ═════════════════ PAGE HEADER ═════════════════ */}

              <div className="mb-8">

                <div className="flex items-start justify-between">

                  {/* Title */}

                  <div>

                    <div className="flex items-center gap-3 mb-2">

                      <div
                        className="
                          w-11
                          h-11
                          rounded-2xl
                          flex
                          items-center
                          justify-center
                        "
                        style={{
                          background:
                            "linear-gradient(135deg,rgba(32,227,214,.12),rgba(32,227,214,.03))",
                          border: "1px solid rgba(32,227,214,.18)",
                        }}
                      >
                        <BookOpen
                          className="w-6 h-6"
                          style={{ color: C.cyan }}
                        />
                      </div>

                      <div>

                        <h1
                          className="
                            text-[34px]
                            font-black
                            leading-none
                            tracking-tight
                            text-white
                          "
                        >
                          المفردات
                        </h1>

                        <p
                          className="
                            mt-2
                            text-[13px]
                            font-medium
                            text-slate-400
                          "
                        >
                          تعلم كلمات جديدة وراجع ما تعلمته بذكاء
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* ═════════════════ FILTER HEADER ═════════════════ */}

              <div className="mb-7">

                <div className="flex items-center justify-between">

                  <h2
                    className="
                      text-[28px]
                      font-black
                      tracking-tight
                      text-white
                    "
                  >
                    استكشف المفردات حسب الفئة
                  </h2>

                  <div className="flex items-center gap-3">

                    {/* LEVEL */}

                    <button
                      className="
                        h-[48px]
                        px-6
                        rounded-xl
                        flex
                        items-center
                        gap-2
                        transition-all
                        hover:border-cyan-400/30
                      "
                      style={{
                        background: "#0D1320",
                        border: "1px solid rgba(255,255,255,.07)",
                        boxShadow: "0 8px 24px rgba(0,0,0,.18)",
                      }}
                    >

                      <span
                        className="
                          text-[13px]
                          font-medium
                          text-slate-400
                        "
                      >
                        المستوى:
                      </span>

                      <span
                        className="
                          text-[18px]
                          font-black
                        "
                        style={{
                          color: C.cyan,
                        }}
                      >
                        {userLevel}
                      </span>

                      <ChevronDown
                        size={15}
                        className="text-slate-500"
                      />

                    </button>

                    {/* FILTER */}

                    <div className="relative">

                      <button
                        onClick={() =>
                          setShowLevelFilter(!showLevelFilter)
                        }
                        className="
                          h-[48px]
                          px-6
                          rounded-xl
                          flex
                          items-center
                          gap-3
                          transition-all
                          hover:border-cyan-400/30
                        "
                        style={{
                          background: "#0D1320",
                          border: "1px solid rgba(255,255,255,.07)",
                          boxShadow: "0 8px 24px rgba(0,0,0,.18)",
                        }}
                      >

                        <Filter
                          size={15}
                          className="text-slate-400"
                        />

                        <span
                          className="
                            text-[13px]
                            font-bold
                            text-white
                          "
                        >
                          تصفية
                        </span>

                      </button>

                      {showLevelFilter && (

                        <div
                          className="
                            absolute
                            top-full
                            left-0
                            mt-3
                            w-[185px]
                            rounded-2xl
                            overflow-hidden
                            z-50
                          "
                          style={{
                            background: "#0D1320",
                            border: "1px solid rgba(255,255,255,.08)",
                            boxShadow:
                              "0 20px 50px rgba(0,0,0,.45)",
                          }}
                        >

                          {[
                            {
                              id: "all",
                              title: "كل المستويات",
                            },
                            {
                              id: "A2",
                              title: "A2",
                            },
                            {
                              id: "B1",
                              title: "B1",
                            },
                            {
                              id: "B2",
                              title: "B2",
                            },
                            {
                              id: "C1",
                              title: "C1",
                            },
                          ].map((lvl) => (

                            <button
                              key={lvl.id}
                              onClick={() => {
                                setCategoryLevelFilter(lvl.id);
                                setShowLevelFilter(false);
                              }}
                              className={`
                                w-full
                                px-5
                                py-3.5
                                text-right
                                transition-all
                                ${
                                  categoryLevelFilter === lvl.id
                                    ? "text-cyan-400 bg-cyan-500/10"
                                    : "text-slate-300 hover:bg-white/5"
                                }
                              `}
                            >
                              {lvl.title}
                            </button>

                          ))}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>
              {/* ========= CATEGORY GRID ========= */}

              <div
                className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-4
                gap-5
              "
              >

                {visibleCategories.map((category, index) => (

                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                    progress={getCategoryProgress(
                      category,
                      learnedWordIds
                    )}
                    onClick={() => openCategory(category)}
                  />

                ))}

              </div>

              {filteredCategories.length >
                INITIAL_VISIBLE &&
                !showAllCategories && (

                  <button
                    onClick={() =>
                      setShowAllCategories(true)
                    }
                    className="
                    mt-7
                    w-full
                    h-[48px]
                    rounded-xl
                    font-bold
                    text-sm
                    border
                    transition
                    hover:border-cyan-400
                    hover:text-cyan-400
                  "
                    style={{
                      borderColor: C.border,
                      background: "#0C1321",
                    }}
                  >

                    عرض المزيد

                  </button>

                )}

              {/* ===========================
                    RIGHT PANEL
              ============================ */}

              <div className="xl:hidden mt-8">

                <VocabRightPanel
                  reviewCount={reviewCount}
                  totalWords={totalWords}
                  levelSlices={levelSlices}
                  recentWords={recentWords}
                />

              </div>

            </main>

            {/* ===========================
                  DESKTOP RIGHT PANEL
            ============================ */}

            <aside
              className="
              hidden
              xl:block
              w-[370px]
              shrink-0
              border-l
              px-6
              py-7
            "
              style={{
                borderColor: C.border,
                background: "#070C15",
              }}
            >

              <VocabRightPanel
                reviewCount={reviewCount}
                totalWords={totalWords}
                levelSlices={levelSlices}
                recentWords={recentWords}
              />

            </aside>

          </div>
        )}

        {selectedCategory && (
          <main
            className="flex-1 overflow-y-auto px-8 py-7"
            dir="rtl"
          >

            {/* =========================
                    TOP BAR
            ========================== */}

            <div
              className="flex flex-wrap items-center justify-between gap-4 mb-7"
            >

              <button
                onClick={() => setSelectedCategory(null)}
                className="
                  flex
                  items-center
                  gap-2
                  text-cyan-400
                  font-bold
                  hover:text-cyan-300
                  transition
                "
              >
                <ArrowRight size={18} />
                العودة لجميع الفئات
              </button>

              <div
                className="flex items-center gap-2"
              >

                {[
                  {
                    id: "all",
                    label: "الكل",
                  },
                  {
                    id: "beginner",
                    label: "A1-A2",
                  },
                  {
                    id: "intermediate",
                    label: "B1-B2",
                  },
                  {
                    id: "advanced",
                    label: "C1-C2",
                  },
                ].map((item) => (

                  <button
                    key={item.id}
                    onClick={() =>
                      setLevelFilter(item.id)
                    }
                    className={`
                      px-4
                      h-[42px]
                      rounded-full
                      text-[13px]
                      font-bold
                      transition
                      ${
                        levelFilter === item.id
                          ? "bg-cyan-400 text-black"
                          : "bg-[#0C1321] text-slate-300"
                      }
                    `}
                  >
                    {item.label}
                  </button>

                ))}

              </div>

              <button
                onClick={() =>
                  startQuiz(selectedCategory)
                }
                className="
                  h-[44px]
                  px-6
                  rounded-full
                  font-bold
                  flex
                  items-center
                  gap-2
                  text-black
                "
                style={{
                  background:
                    "linear-gradient(90deg,#20E3D6,#3B82F6)",
                }}
              >
                <BrainCircuit size={17} />
                اختبار الفئة
              </button>

            </div>

            {/* =========================
                    CONTENT
            ========================== */}

            <div
              className="
                grid
                lg:grid-cols-12
                gap-8
              "
            >

              {/* =====================================
                        WORD DETAILS
              ====================================== */}

              <div className="lg:col-span-7">

                <div
                  className="
                    sticky
                    top-5
                    rounded-3xl
                    border
                    p-8
                    space-y-7
                  "
                  style={{
                    background: "#0B101B",
                    borderColor: "rgba(34,224,200,.18)",
                  }}
                >
                  {selectedWord && (
                    <>

                      {/* ========= TOP ========= */}

                      <div className="flex items-center justify-between">

                        <span
                          className="
                            px-4
                            h-[34px]
                            rounded-full
                            flex
                            items-center
                            text-[12px]
                            font-bold
                          "
                          style={{
                            background: "rgba(32,227,214,.10)",
                            color: "#20E3D6",
                            border: "1px solid rgba(32,227,214,.25)",
                          }}
                        >
                          {selectedWord.cefrLevel} • {selectedWord.partOfSpeech}
                        </span>

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              handlePlayWord(selectedWord.word)
                            }
                            className="
                              w-11
                              h-11
                              rounded-xl
                              flex
                              items-center
                              justify-center
                            "
                            style={{
                              background:
                                "linear-gradient(135deg,#20E3D6,#3B82F6)",
                            }}
                          >
                            <Volume2 size={18} color="#000" />
                          </button>

                          {[1, 0.7, 0.5].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => {
                                setWordSpeed(speed);
                                handlePlayWord(
                                  selectedWord.word,
                                  speed
                                );
                              }}
                              className={`
                                w-12
                                h-9
                                rounded-lg
                                text-xs
                                font-bold
                                transition
                                ${
                                  wordSpeed === speed
                                    ? "bg-cyan-400 text-black"
                                    : "bg-[#151C28] text-slate-400"
                                }
                              `}
                            >
                              {speed}x
                            </button>
                          ))}

                        </div>

                      </div>

                      {/* ========= WORD ========= */}

                      <div className="space-y-3">

                        <h2
                          className="
                            text-[52px]
                            font-black
                            leading-none
                            tracking-wide
                            text-left
                          "
                          dir="ltr"
                        >
                          {selectedWord.word}
                        </h2>

                        <div className="flex items-center gap-4">

                          <span
                            className="text-slate-400"
                            dir="ltr"
                          >
                            {selectedWord.ipa}
                          </span>

                          <span
                            className="
                              text-[28px]
                              font-black
                              text-cyan-400
                            "
                          >
                            {selectedWord.translationAr}
                          </span>

                        </div>

                      </div>

                      {/* ========= EXAMPLE ========= */}

                      <div
                        className="
                          rounded-2xl
                          border
                          p-6
                          space-y-5
                        "
                        style={{
                          background: "#101826",
                          borderColor: C.border,
                        }}
                      >

                        <div className="flex items-center justify-between">

                          <span
                            className="
                              text-xs
                              font-bold
                              uppercase
                              tracking-wider
                              text-slate-400
                            "
                          >
                            جملة في السياق
                          </span>

                          <button
                            onClick={() =>
                              handlePlaySentence(
                                selectedWord.exampleEn
                              )
                            }
                            className="
                              flex
                              items-center
                              gap-2
                              px-4
                              h-10
                              rounded-xl
                              transition
                            "
                            style={{
                              background: "rgba(32,227,214,.08)",
                              color: "#20E3D6",
                              border:
                                "1px solid rgba(32,227,214,.22)",
                            }}
                          >
                            <Volume2 size={15} />
                            استمع
                          </button>

                        </div>

                        <p
                          className="
                            text-[24px]
                            leading-10
                            font-bold
                            text-white
                            text-left
                          "
                          dir="ltr"
                        >
                          "{selectedWord.exampleEn}"
                        </p>

                        <p
                          className="
                            text-[16px]
                            leading-8
                            text-slate-300
                          "
                        >
                          {selectedWord.exampleAr}
                        </p>

                        {!sentencePracticeMode ? (

                          <button
                            onClick={() =>
                              startSentencePractice(
                                selectedWord
                              )
                            }
                            className="
                              w-full
                              h-12
                              rounded-xl
                              font-bold
                              transition
                            "
                            style={{
                              background:
                                "rgba(32,227,214,.10)",
                              color: "#20E3D6",
                              border:
                                "1px solid rgba(32,227,214,.20)",
                            }}
                          >
                            تدرب على كتابة الجملة
                          </button>

                        ) : (

                          <div className="space-y-4">

                            <input
                              value={typedSentenceInput}
                              onChange={(e) =>
                                handleSentenceInputChange(
                                  e.target.value
                                )
                              }
                              placeholder="اكتب الجملة الإنجليزية..."
                              className="
                                w-full
                                h-14
                                rounded-xl
                                px-5
                                bg-[#05070E]
                                border
                                border-cyan-500/30
                                text-white
                                outline-none
                                text-left
                              "
                              dir="ltr"
                            />

                            {sentenceCompleted && (

                              <div
                                className="
                                  h-12
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  gap-2
                                  text-sm
                                  font-bold
                                "
                                style={{
                                  background:
                                    "rgba(34,197,94,.12)",
                                  color: "#4ADE80",
                                  border:
                                    "1px solid rgba(74,222,128,.25)",
                                }}
                              >
                                <CheckCircle2 size={18} />
                                أحسنت! تم حفظ الكلمة.
                              </div>

                            )}

                          </div>

                        )}

                      </div>

                    </>
                  )}
                </div>

              </div>

              <div className="lg:col-span-5">

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="text-[18px] font-black text-white">
                    كلمات الفئة
                  </h3>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      text-[12px]
                      font-bold
                    "
                    style={{
                      background: "rgba(32,227,214,.08)",
                      color: C.cyan,
                      border: "1px solid rgba(32,227,214,.18)",
                    }}
                  >
                    {getFilteredWords().length} كلمة
                  </span>

                </div>

                <div className="space-y-3">

                  {getFilteredWords().length > 0 ? (

                    getFilteredWords().map((word) => {

                      const isSelected =
                        selectedWord?.id === word.id;

                      const isLearned =
                        learnedWordIds.includes(word.id);

                      let badgeStyle = {
                        background: "rgba(34,197,94,.12)",
                        color: "#4ADE80",
                        border:
                          "1px solid rgba(74,222,128,.22)",
                      };

                      if (
                        word.cefrLevel === "B1" ||
                        word.cefrLevel === "B2"
                      ) {
                        badgeStyle = {
                          background:
                            "rgba(32,227,214,.10)",
                          color: "#20E3D6",
                          border:
                            "1px solid rgba(32,227,214,.20)",
                        };
                      }

                      if (
                        word.cefrLevel === "C1" ||
                        word.cefrLevel === "C2"
                      ) {
                        badgeStyle = {
                          background:
                            "rgba(244,114,182,.10)",
                          color: "#F472B6",
                          border:
                            "1px solid rgba(244,114,182,.20)",
                        };
                      }

                      return (

                        <div
                          key={word.id}
                          onClick={() =>
                            handleSelectWord(word)
                          }
                          className={`
                            cursor-pointer
                            rounded-2xl
                            border
                            p-4
                            transition-all
                            duration-300
                            ${
                              isSelected
                                ? "scale-[1.02]"
                                : "hover:border-cyan-500/30 hover:translate-x-[-2px]"
                            }
                          `}
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg,#102B35,#101826)"
                              : "#0B101B",
                            borderColor: isSelected
                              ? "rgba(32,227,214,.28)"
                              : C.border,
                          }}
                        >

                          <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayWord(word.word);
                                }}
                                className="
                                  w-10
                                  h-10
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  transition
                                  hover:scale-105
                                "
                                style={{
                                  background:
                                    "rgba(255,255,255,.05)",
                                }}
                              >
                                <Volume2
                                  size={16}
                                  color="#20E3D6"
                                />
                              </button>

                              <div>

                                <div className="flex items-center gap-2">

                                  <span
                                    className="
                                      font-bold
                                      text-[17px]
                                    "
                                    dir="ltr"
                                  >
                                    {word.word}
                                  </span>

                                  {isLearned && (
                                    <BookmarkCheck
                                      size={16}
                                      color="#4ADE80"
                                    />
                                  )}

                                </div>

                                <span
                                  className="
                                    text-[13px]
                                    text-slate-400
                                  "
                                >
                                  {word.translationAr}
                                </span>

                              </div>

                            </div>

                            <span
                              className="
                                px-3
                                py-1
                                rounded-full
                                text-[11px]
                                font-black
                              "
                              style={badgeStyle}
                            >
                              {word.cefrLevel}
                            </span>

                          </div>

                        </div>

                      );

                    })

                  ) : (

                    <div
                      className="
                        rounded-2xl
                        p-10
                        text-center
                        text-slate-400
                      "
                      style={{
                        background: "#0B101B",
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      لا توجد كلمات لهذا الفلتر.
                    </div>

                  )}

                </div>

              </div>

            </div>

          </main>

        )}

      </div>

    </div>

  );

}