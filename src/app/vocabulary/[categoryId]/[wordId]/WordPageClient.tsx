"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyboardIcon,
  LightbulbIcon,
  Loader2Icon,
  RotateCcwIcon,
  SparklesIcon,
  Volume2Icon,
  XCircleIcon,
  XIcon } from
"lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { useLearnedWords } from "@/hooks/useLearnedWords";
import { AudioService } from "@/lib/audio/kokoroTTS";
import type { VocabularyCategory, VocabularyWord } from "@/data/vocabularyData";
import type { VocabularyOverview } from "@/lib/vocabulary/data";
import {
  VOCAB_COLORS,
  LEVEL_LABELS,
  levelChipStyle,
  paletteFor,
  splitSentenceByWord } from
"@/lib/vocabulary/ui";

/**
 * صفحة الكلمة.
 *
 * ثلاثة أوضاع فقط، لأن أي زيادة هنا تشتّت بدل أن تساعد:
 *   · تعلّم  → المعنى + النطق + المثال في سياقه.
 *   · تدرّب  → اختيار المعنى الصحيح، ثم كتابة الجملة حرفاً بحرف.
 *   · تقدّمي → حالة الكلمة في حسابك وما يلزم لإتقانها.
 *
 * كل نتيجة تدريب تُرسَل للسيرفر فعلاً (`record_word_review_by_text`)، صحيحة
 * كانت أم خاطئة — لا حفظ في الذاكرة المحلية ولا ادّعاء تقدّم غير محفوظ.
 */

type TabId = "learn" | "practice" | "progress";

const TABS: {id: TabId;label: string;}[] = [
{ id: "learn", label: "تعلم" },
{ id: "practice", label: "تدرّب" },
{ id: "progress", label: "تقدّمي" }];


function shuffle<T>(items: T[], seed: number): T[] {
  const list = [...items];
  let current = seed;
  for (let index = list.length - 1; index > 0; index -= 1) {
    current = (current * 9301 + 49297) % 233280;
    const swap = Math.floor(current / 233280 * (index + 1));
    [list[index], list[swap]] = [list[swap], list[index]];
  }
  return list;
}

export default function WordPageClient({
  category,
  wordIndex,
  overview





}: {category: VocabularyCategory;wordIndex: number;overview: VocabularyOverview;}) {
  const router = useRouter();
  const word = category.words[wordIndex];

  const { isLearned, review, pending, error, clearError, lastResult } = useLearnedWords(
    overview.learnedWords
  );

  const [tab, setTab] = useState<TabId>("learn");
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const typingInputRef = useRef<HTMLInputElement>(null);

  const { color, icon: Icon } = paletteFor(category.id);
  const learned = isLearned(word.word);
  const isPending = pending === word.word.trim().toLowerCase();

  const previous = wordIndex > 0 ? category.words[wordIndex - 1] : null;
  const next = wordIndex < category.words.length - 1 ? category.words[wordIndex + 1] : null;

  // إعادة الضبط عند تغيير الكلمة (تنقّل بين الكلمات بلا إعادة تحميل).
  useEffect(() => {
    setChoice(null);
    setChecked(false);
    setTyped("");
    setTypingDone(false);
  }, [word.id]);

  /* ── الاختيارات: مشتّتات حقيقية من نفس الفئة ── */
  const options = useMemo(() => {
    const distractors = category.words.
    filter((item) => item.id !== word.id && item.translationAr !== word.translationAr).
    slice(0, 12).
    map((item) => item.translationAr);

    const seed = word.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const picked = shuffle(distractors, seed).slice(0, 3);
    return shuffle([word.translationAr, ...picked], seed + 7);
  }, [category.words, word]);

  const play = useCallback((text: string, speed = 1) => {
    if (text) AudioService.playWord(text, speed);
  }, []);

  const playSentence = useCallback((text: string) => {
    if (text) AudioService.playSentenceText(text, 1);
  }, []);

  const save = useCallback(
    async (correct: boolean) => {
      const result = await review(word.word, {
        partOfSpeech: word.partOfSpeech,
        correct,
        seed: {
          translationAr: word.translationAr,
          ipa: word.ipa,
          cefrLevel: word.cefrLevel,
          exampleEn: word.exampleEn,
          exampleAr: word.exampleAr
        }
      });
      if (result) router.refresh();
    },
    [review, router, word]
  );

  const checkAnswer = useCallback(() => {
    if (!choice || checked) return;
    setChecked(true);
    void save(choice === word.translationAr);
  }, [choice, checked, save, word.translationAr]);

  const onTypedChange = useCallback(
    (value: string) => {
      if (value.length > word.exampleEn.length) return;
      setTyped(value);
      if (
      value.trim().toLowerCase() === word.exampleEn.trim().toLowerCase() &&
      !typingDone)
      {
        setTypingDone(true);
        void save(true);
      }
    },
    [word.exampleEn, typingDone, save]
  );

  const parts = splitSentenceByWord(word.exampleEn, word.word);

  return (
    <div
      className="flex min-h-screen text-white"
      style={{ background: VOCAB_COLORS.page }}
      dir="ltr">

      <AppSidebar
        active="المفردات"
        dailyXp={overview.dailyXp}
        dailyGoalXp={overview.dailyGoalXp}
        streak={overview.streak} />


      <div className="flex min-w-0 flex-1 flex-col">
        <AppShellHeader
          username={overview.nickname}
          level={overview.level}
          avatarUrl={overview.avatarUrl ?? undefined}
          streak={overview.streak}
          showSearch={false} />


        <div className="flex-1 overflow-y-auto px-6 py-6 xl:px-8" dir="rtl">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
            {error &&
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-[13px] font-bold text-rose-200">

                <span>{error}</span>
                <button
                type="button"
                onClick={clearError}
                aria-label="إغلاق التنبيه"
                className="rounded-lg p-1 transition hover:bg-white/10">

                  <XIcon size={14} aria-hidden />
                </button>
              </div>
            }

            {/* ═══ شريط التنقل ═══ */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/vocabulary/${category.id}`}
                className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-400 transition hover:text-white">

                <ChevronRightIcon size={15} aria-hidden />
                العودة إلى قائمة {category.titleAr}
              </Link>

              <div className="flex items-center gap-2">
                <NavWordButton word={previous} categoryId={category.id} direction="prev" />
                <NavWordButton word={next} categoryId={category.id} direction="next" />
              </div>
            </div>

            {/* ═══ رأس الكلمة ═══ */}
            <header className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
              <div className="flex items-center gap-5 rounded-3xl border border-white/[0.07] bg-[#0B101B] p-6">
                <span
                  aria-hidden
                  className="flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-3xl border"
                  style={{
                    color,
                    backgroundColor: `${color}1C`,
                    borderColor: `${color}42`
                  }}>

                  <Icon size={38} />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-en text-[40px] font-black leading-none text-white">
                      {word.word}
                    </h1>
                    <button
                      type="button"
                      onClick={() => play(word.word)}
                      aria-label={`استمع إلى ${word.word}`}
                      className="rounded-xl border border-white/[0.08] p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300">

                      <Volume2Icon size={17} aria-hidden />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <span className="font-en text-[13.5px] font-semibold text-slate-400">
                      {word.ipa}
                    </span>
                    <span
                      className="font-en rounded-lg border px-2 py-0.5 text-[11.5px] font-black"
                      style={levelChipStyle(word.cefrLevel)}>

                      {word.cefrLevel}
                    </span>
                    <span className="rounded-lg border border-white/[0.08] px-2 py-0.5 text-[11.5px] font-bold text-slate-400">
                      {word.partOfSpeech}
                    </span>
                  </div>

                  <p className="mt-3 text-[20px] font-black text-white">{word.translationAr}</p>
                </div>
              </div>

              {/* بطاقة الحالة */}
              <div className="flex flex-col justify-between rounded-3xl border border-white/[0.07] bg-[#070C15] p-5">
                <div>
                  <h2 className="text-[13px] font-black text-white">حالة هذه الكلمة</h2>
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      learned ?
                      "border-emerald-400/35 bg-emerald-500/12 text-emerald-300" :
                      "border-white/[0.08] bg-white/[0.03] text-slate-500"}`
                      }>

                      {learned ? <CheckCircle2Icon size={22} /> : <BookOpenIcon size={20} />}
                    </span>
                    <div>
                      <div className="text-[15px] font-black text-white">
                        {learned ? "متقنة" : "لم تُتقن بعد"}
                      </div>
                      <div className="mt-0.5 text-[11.5px] font-medium text-slate-500">
                        {learned ?
                        "محفوظة في حسابك ✓" :
                        "أجب إجابة صحيحة لتُحفظ في حسابك"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={learned || isPending}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/12 py-2.5 text-[13px] font-bold text-violet-200 transition hover:border-violet-400/60 hover:bg-violet-500/22 disabled:cursor-not-allowed disabled:opacity-50">

                  {isPending && <Loader2Icon size={14} className="animate-spin" aria-hidden />}
                  {learned ? "متقنة ✓" : "تعلّمت هذه الكلمة"}
                </button>
              </div>
            </header>

            {lastResult && lastResult.word === word.word.trim().toLowerCase() &&
            <div
              role="status"
              className="flex items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-bold text-emerald-200">

                <SparklesIcon size={15} aria-hidden />
                تم الحفظ في حسابك
                {lastResult.xpAwarded > 0 &&
              <span className="font-en">· +{lastResult.xpAwarded} XP</span>
              }
              </div>
            }

            {/* ═══ التبويبات ═══ */}
            <div className="flex items-center gap-7 border-b border-white/[0.07]" role="tablist">
              {TABS.map((item) => {
                const isActive = item.id === tab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(item.id)}
                    className={`relative pb-3 text-[13.5px] font-bold transition-colors ${
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}`
                    }>

                    {item.label}
                    {isActive &&
                    <motion.span
                      layoutId="word-tab"
                      className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full"
                      style={{ backgroundColor: color }} />

                    }
                  </button>);

              })}
            </div>

            {/* ═══ المحتوى ═══ */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}>

                {tab === "learn" &&
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
                    <div className="flex flex-col gap-4">
                      <Panel title="المعنى">
                        <p className="text-[14px] font-bold leading-relaxed text-slate-200">
                          {word.translationAr}
                        </p>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
                          {category.descAr}
                        </p>
                      </Panel>

                      <Panel title="النطق">
                        <p className="font-en mb-3 text-[15px] font-bold text-slate-300">
                          {word.ipa}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                        { label: "عادي", speed: 1 },
                        { label: "أبطأ", speed: 0.7 },
                        { label: "بطيء جداً", speed: 0.5 }].
                        map((item) =>
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => play(word.word, item.speed)}
                          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-[12px] font-bold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200">

                              <Volume2Icon size={13} aria-hidden />
                              {item.label}
                            </button>
                        )}
                        </div>
                      </Panel>

                      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4">
                        <div className="mb-2 flex items-center gap-2 text-[12.5px] font-black text-amber-300">
                          <LightbulbIcon size={14} aria-hidden />
                          نصيحة
                        </div>
                        <p className="text-[12.5px] leading-relaxed text-amber-100/80">
                          اربط «{word.word}» بالجملة أدناه بدل حفظها منفردة — الكلمة في سياق
                          تُستدعى أسرع بكثير وقت الحاجة.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0B101B] p-6">
                        <img
                        src={category.coverImage}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover opacity-25" />

                        <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background:
                          "linear-gradient(180deg, rgba(11,16,27,.92) 0%, rgba(11,16,27,.78) 60%, rgba(11,16,27,.95) 100%)"
                        }} />


                        <div className="relative">
                          <h2 className="mb-5 text-[13px] font-black text-white">مثال في جملة</h2>

                          <p
                          dir="ltr"
                          className="font-en text-left text-[24px] font-extrabold leading-snug text-white sm:text-[28px]">

                            {parts.before}
                            <span style={{ color }}>{parts.match || word.word}</span>
                            {parts.after}
                          </p>

                          <p className="mt-4 text-[15px] font-bold text-slate-300">
                            {word.exampleAr}
                          </p>

                          <button
                          type="button"
                          onClick={() => playSentence(word.exampleEn)}
                          className="mt-5 flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-[12.5px] font-bold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/20">

                            <Volume2Icon size={15} aria-hidden />
                            استمع للنطق
                          </button>
                        </div>
                      </div>

                      <Panel title="أين تُستخدم؟">
                        <p className="text-[13px] leading-relaxed text-slate-400">
                          هذه الكلمة من فئة{" "}
                          <Link
                          href={`/vocabulary/${category.id}`}
                          className="font-bold"
                          style={{ color }}>

                            {category.titleAr}
                          </Link>{" "}
                          ومستواها {word.cefrLevel} ({LEVEL_LABELS[word.cefrLevel] ?? ""}) — أي
                          أنها مناسبة لك إن كان مستواك {overview.level} أو أعلى.
                        </p>
                      </Panel>
                    </div>
                  </div>
                }

                {tab === "practice" &&
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* اختيار المعنى */}
                    <Panel title="اختر المعنى الصحيح">
                      <p className="mb-4 text-[12.5px] font-medium text-slate-500">
                        ما معنى <span className="font-en font-bold text-white">{word.word}</span>؟
                      </p>

                      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {options.map((option, index) => {
                        const isPicked = choice === option;
                        const isCorrect = option === word.translationAr;
                        const showState = checked && (isPicked || isCorrect);

                        return (
                          <li key={`${option}-${index}`}>
                              <button
                              type="button"
                              onClick={() => !checked && setChoice(option)}
                              disabled={checked}
                              aria-pressed={isPicked}
                              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3 text-right text-[13px] font-bold transition-colors ${
                              showState && isCorrect ?
                              "border-emerald-400/50 bg-emerald-500/12 text-emerald-200" :
                              showState && isPicked ?
                              "border-rose-400/50 bg-rose-500/12 text-rose-200" :
                              isPicked ?
                              "border-cyan-400/50 bg-cyan-500/10 text-cyan-100" :
                              "border-white/[0.08] bg-[#0D1320] text-slate-300 hover:border-white/25"}`
                              }>

                                <span>{option}</span>
                                {showState && isCorrect &&
                              <CheckCircle2Icon size={16} aria-hidden />
                              }
                                {showState && isPicked && !isCorrect &&
                              <XCircleIcon size={16} aria-hidden />
                              }
                              </button>
                            </li>);

                      })}
                      </ul>

                      {!checked ?
                    <button
                      type="button"
                      onClick={checkAnswer}
                      disabled={!choice}
                      className="mt-5 w-full rounded-xl bg-gradient-to-l from-cyan-500 via-violet-500 to-fuchsia-500 py-3 text-[13.5px] font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">

                          تحقق من الإجابة
                        </button> :

                    <div className="mt-5 flex items-center justify-between gap-3">
                          <span
                        className={`text-[13px] font-bold ${
                        choice === word.translationAr ? "text-emerald-300" : "text-rose-300"}`
                        }>

                            {choice === word.translationAr ?
                        "إجابة صحيحة — حُفظت في حسابك ✓" :
                        `الإجابة الصحيحة: ${word.translationAr}`}
                          </span>
                          <button
                        type="button"
                        onClick={() => {
                          setChecked(false);
                          setChoice(null);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-[12px] font-bold text-slate-300 transition hover:border-white/25">

                            <RotateCcwIcon size={13} aria-hidden />
                            أعد المحاولة
                          </button>
                        </div>
                    }
                    </Panel>

                    {/* كتابة الجملة */}
                    <Panel
                    title="اكتب الجملة"
                    action={
                    <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500">
                          <KeyboardIcon size={13} aria-hidden />
                          حرفاً بحرف
                        </span>
                    }>

                      <button
                      type="button"
                      onClick={() => typingInputRef.current?.focus()}
                      className="w-full rounded-2xl border border-white/[0.07] bg-[#080D17] p-5 text-left transition hover:border-white/15"
                      dir="ltr"
                      aria-label="ابدأ الكتابة">

                        <TypedSentence target={word.exampleEn} typed={typed} accent={color} />
                      </button>

                      <input
                      ref={typingInputRef}
                      type="text"
                      value={typed}
                      onChange={(event) => onTypedChange(event.target.value)}
                      className="sr-only"
                      aria-label="اكتب الجملة الإنجليزية"
                      autoComplete="off"
                      spellCheck={false} />


                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold text-slate-500">
                          <span className="font-en">{typed.length}</span> /{" "}
                          <span className="font-en">{word.exampleEn.length}</span> حرف
                        </span>

                        <button
                        type="button"
                        onClick={() => {
                          setTyped("");
                          setTypingDone(false);
                          typingInputRef.current?.focus();
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-[12px] font-bold text-slate-300 transition hover:border-white/25">

                          <RotateCcwIcon size={13} aria-hidden />
                          إعادة
                        </button>
                      </div>

                      {typingDone &&
                    <p className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-bold text-emerald-200">
                          أحسنت! الجملة صحيحة وتم حفظ تقدّمك.
                        </p>
                    }
                    </Panel>
                  </div>
                }

                {tab === "progress" &&
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Panel title="هذه الكلمة">
                      <dl className="flex flex-col gap-3 text-[13px]">
                        <Row label="الحالة" value={learned ? "متقنة" : "لم تُتقن بعد"} />
                        <Row label="المستوى" value={`${word.cefrLevel} — ${LEVEL_LABELS[word.cefrLevel] ?? ""}`} />
                        <Row label="النوع" value={word.partOfSpeech} />
                        <Row label="الفئة" value={category.titleAr} />
                      </dl>
                    </Panel>

                    <Panel title="تقدّمك العام">
                      <dl className="flex flex-col gap-3 text-[13px]">
                        <Row
                        label="كلمات متقنة"
                        value={String(Math.max(overview.learnedCount, 0))} />

                        <Row label="جاهز للمراجعة اليوم" value={String(overview.dueCount)} />
                        <Row label="إجمالي النقاط" value={`${overview.xpTotal} XP`} />
                        <Row label="سلسلة الأيام" value={`${overview.streak} يوم`} />
                      </dl>

                      <Link
                      href="/vocabulary/test?mode=review"
                      className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 py-2.5 text-[13px] font-bold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/20">

                        <SparklesIcon size={15} aria-hidden />
                        ابدأ مراجعة ذكية
                      </Link>
                    </Panel>
                  </div>
                }
              </motion.div>
            </AnimatePresence>

            {/* ═══ التنقل السفلي ═══ */}
            <div className="mt-2 flex items-center justify-between gap-3 pb-4">
              <NavWordButton
                word={previous}
                categoryId={category.id}
                direction="prev"
                wide />

              <NavWordButton word={next} categoryId={category.id} direction="next" wide />
            </div>
          </div>
        </div>
      </div>
    </div>);

}

/* ──────────────────────────── عناصر مساعدة ──────────────────────────── */

function Panel({
  title,
  children,
  action




}: {title: string;children: React.ReactNode;action?: React.ReactNode;}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0B101B] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-black text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>);

}

function Row({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-2.5 last:border-0">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="font-bold text-white">{value}</dd>
    </div>);

}

function NavWordButton({
  word,
  categoryId,
  direction,
  wide = false





}: {word: VocabularyWord | null;categoryId: string;direction: "prev" | "next";wide?: boolean;}) {
  const label = direction === "prev" ? "السابق" : "التالي";
  const IconArrow = direction === "prev" ? ChevronRightIcon : ChevronLeftIcon;

  if (!word) {
    return (
      <span
        className={`flex items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2.5 text-[12.5px] font-bold text-slate-700 ${
        wide ? "min-w-[130px] justify-center" : ""}`
        }
        aria-hidden>

        <IconArrow size={15} />
        {label}
      </span>);

  }

  return (
    <Link
      href={`/vocabulary/${categoryId}/${word.id}`}
      className={`flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0D1320] px-4 py-2.5 text-[12.5px] font-bold text-slate-200 transition hover:border-cyan-400/40 hover:text-white ${
      wide ? "min-w-[130px] justify-center" : ""}`
      }>

      {direction === "prev" && <IconArrow size={15} aria-hidden />}
      <span>{label}</span>
      <span className="font-en hidden text-slate-500 sm:inline">{word.word}</span>
      {direction === "next" && <IconArrow size={15} aria-hidden />}
    </Link>);

}

/**
 * عرض الجملة أثناء الكتابة — بنفس منطق قارئ القصص:
 * المسافة تظهر رمادية باهتة عندما يحين دورها، وحمراء باهتة إن كُتب مكانها حرف
 * خاطئ، وتختفي تماماً فيما عدا ذلك.
 */
function TypedSentence({
  target,
  typed,
  accent




}: {target: string;typed: string;accent: string;}) {
  const caret = typed.length;

  return (
    <p className="font-en flex flex-wrap items-baseline text-[19px] font-bold leading-relaxed">
      {target.split("").map((char, index) => {
        const isTyped = index < caret;
        const isWrong = isTyped && typed[index]?.toLowerCase() !== char.toLowerCase();
        const isCaret = index === caret;

        if (char === " ") {
          const state = isWrong ? "wrong" : isCaret ? "active" : "idle";
          return (
            <span
              key={index}
              className="relative inline-block"
              style={{ width: "0.42em" }}
              aria-hidden>

              {state !== "idle" &&
              <span
                className="absolute inset-x-0 bottom-[0.05em] top-[0.2em] rounded-[3px]"
                style={
                state === "wrong" ?
                {
                  backgroundColor: "rgba(244,63,94,0.16)",
                  boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.28)"
                } :
                {
                  backgroundColor: "rgba(148,163,184,0.14)",
                  boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.16)"
                }
                } />

              }
              {isCaret &&
              <span
                className="absolute -bottom-[3px] left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: accent }} />

              }
            </span>);

        }

        return (
          <span key={index} className="relative inline-block">
            <span
              className={
              isWrong ?
              "text-rose-400" :
              isTyped ?
              "text-white" :
              "text-slate-600"
              }>

              {char}
            </span>
            {isCaret &&
            <span
              className="absolute -bottom-[3px] left-0 right-0 h-[2px] rounded-full"
              style={{ backgroundColor: accent }} />

            }
          </span>);

      })}
    </p>);

}