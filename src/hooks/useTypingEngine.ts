"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { StoryLine, TypingMetrics } from "../types";
import { SoundEffects } from "../lib/audio/soundEffects";

/**
 * محرّك الكتابة — إعادة كتابة لمنطق المطابقة.
 *
 * ── ما كان غير منطقي ────────────────────────────────────────────────────────
 * ١) **مصدرا حقيقة للمقارنة**: الهوك كان يبني مصفوفة `errors` لا يستخدمها أحد،
 *    و`SentenceDisplay` يعيد حساب الصح والغلط بنفسه. أي اختلاف بينهما = لون لا
 *    يطابق العدّاد. الآن الهوك يُصدِّر `cells` (حالة كل حرف) وهي **المصدر
 *    الوحيد** الذي ترسمه الواجهة.
 *
 * ٢) **إكمال السطر بنص ناقص**: الشرط كان «تجاهل كل ما ليس حرفاً أو رقماً ثم
 *    قارن»، فتُقبل الجملة وفيها فاصلة ناقصة أو حرف ناقص بينما الشاشة تعرضه
 *    أحمر. الآن السطر يكتمل **فقط** عندما يُملأ بالكامل وكل حرف صحيح، ويُصدِّر
 *    الهوك `isLineFilled` و`lineErrorCount` لتقول الواجهة للمستخدم بوضوح:
 *    «صحّح الأحرف الحمراء».
 *
 * ٣) **علامات الترقيم كانت عقاباً**: الاقتباس الذكي (’ “ ”) والشرطة الطويلة
 *    (– —) غير موجودة على كيبورد المستخدم. الآن `charEquals` تعتبرها مكافئة
 *    لنظيرها العادي، وأي علامة ترقيم داخلية **تُدرج تلقائياً** بمجرد كتابة
 *    الحرف الذي يليها (كما في مدرّبات الكتابة الاحترافية).
 *
 * ٤) **أرقام الداتابيز**: كانت الأخطاء التراكمية تُرسل لـ `record_line_attempt`
 *    فيرفضها السيرفر بـ `char_count_mismatch` (لأن مجموعها لا يساوي طول
 *    السطر) فلا يُمنح XP. الآن نرسل «عدد المواضع التي أخطأت فيها مرة على
 *    الأقل» ⇒ صحيح + خطأ = طول السطر بالضبط، دائماً.
 */

export type CellState = "pending" | "correct" | "wrong";

export interface TypedCell {
  /** الحرف المطلوب في هذا الموضع. */
  char: string;
  /** ما كتبه المستخدم فعلاً (أو null إن لم يصل بعد). */
  typed: string | null;
  state: CellState;
  isSpace: boolean;
}

export interface LineCompleteInfo {
  lineIndex: number;
  nextLineIndex: number;
  totalLines: number;
  /** الدقة التراكمية المعروضة (للواجهة). */
  accuracy: number;
  /** كلمة/د التراكمية المعروضة (للواجهة). */
  wpm: number;
  lineSeconds: number;
  isLast: boolean;
  /** دقة هذا السطر وحده — هي ما يُرسل للداتابيز. */
  lineAccuracy: number;
  /** كلمة/د محسوبة على هذا السطر وحده. */
  lineWpm: number;
  lineCorrectChars: number;
  lineIncorrectChars: number;
  lineText: string;
}

interface UseTypingEngineProps {
  lines: StoryLine[];
  /** الجملة التي نبدأ منها (تأتي من الداتابيز عند الاستئناف). */
  initialLineIndex?: number;
  onComplete?: () => void;
  onLineComplete?: (info: LineCompleteInfo) => void;
}

const INITIAL_METRICS: TypingMetrics = {
  wpm: 0,
  accuracy: 100,
  correctChars: 0,
  incorrectChars: 0,
  totalCharsTyped: 0,
  timeSpentSeconds: 0
};

/** علامات ترقيم داخلية تُدرج تلقائياً حتى لا تتحوّل الجملة إلى ألغاز. */
const AUTO_PUNCTUATION = new Set([
",", ".", ";", ":", "!", "?", "'", "\u2019", "\"", "\u201C", "\u201D", "-", "\u2013", "\u2014"]
);

/** توحيد الأحرف المكافئة: الاقتباس الذكي والشرطات والمسافات الغريبة. */
function canonical(char: string | undefined): string {
  if (!char) return "";
  const lower = char.toLowerCase();
  switch (lower) {
    case "\u2019":
    case "\u2018":
    case "\u201B":
    case "\u00B4":
    case "`":
      return "'";
    case "\u201C":
    case "\u201D":
    case "\u201E":
    case "\u00AB":
    case "\u00BB":
      return "\"";
    case "\u2013":
    case "\u2014":
    case "\u2212":
      return "-";
    case "\u00A0":
    case "\u202F":
    case "\u2009":
      return " ";
    case "\u2026":
      return ".";
    default:
      return lower;
  }
}

/** مقارنة حرفين مقارنةً «بشرية»: بلا حساسية لحالة الحرف ولا لشكل الاقتباس. */
export function charEquals(a: string | undefined, b: string | undefined): boolean {
  if (a === undefined || b === undefined) return false;
  return canonical(a) === canonical(b);
}

/** نص الجملة كما سنطالب المستخدم بكتابته: بلا مسافات مزدوجة ولا ترقيم نهائي. */
export function normalizeTarget(raw: string): string {
  return raw.
  replace(/[\u00A0\u202F\u2009]/g, " ").
  replace(/\s+/g, " ").
  trim().
  replace(/[.,!?;:'"\u201C\u201D\u2019\-\u2013\u2014]+$/g, "").
  trim();
}

/**
 * يوسّع ضغطة مفتاح واحدة إلى النص المتوقّع: لو الحرف المكتوب يطابق الحرف الذي
 * **يلي** علامة ترقيم، نُدرج العلامة نيابةً عن المستخدم.
 */
function expandKeystroke(previous: string, next: string, target: string): string {
  if (next.length !== previous.length + 1) return next;

  const typedChar = next[next.length - 1];
  let index = previous.length;
  let inserted = "";
  let guard = 0;

  while (index < target.length && guard < 4) {
    const targetChar = target[index];

    if (charEquals(typedChar, targetChar)) {
      // نخزّن حرف الهدف نفسه حتى يظهر الاقتباس الذكي كما كُتب في القصة.
      return previous + inserted + targetChar;
    }

    if (AUTO_PUNCTUATION.has(targetChar) && !charEquals(typedChar, " ")) {
      inserted += targetChar;
      index += 1;
      guard += 1;
      continue;
    }

    break;
  }

  return next;
}

export function useTypingEngine({
  lines,
  initialLineIndex = 0,
  onComplete,
  onLineComplete
}: UseTypingEngineProps) {
  const totalLines = lines?.length ?? 0;

  const [currentLineIndex, setCurrentLineIndex] = useState(() =>
  Math.max(0, Math.min(initialLineIndex, Math.max(totalLines - 1, 0)))
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [typedChars, setTypedChars] = useState("");
  const [metrics, setMetrics] = useState<TypingMetrics>(INITIAL_METRICS);

  const inputRef = useRef<HTMLInputElement>(null);
  const completedWordsCount = useRef(0);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typedRef = useRef("");

  // ── عدّادات الجلسة (لا تُصفَّر بين الجُمل، فقط عند restart) ────────────────
  const sessionStartRef = useRef<number | null>(null);
  const keystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);
  const errorKeystrokesRef = useRef(0);
  /** أدنى دقة وصلنا إليها — المعروض لا يرتفع فوقها مطلقاً. */
  const displayedAccuracyRef = useRef(100);
  const lineStartRef = useRef<number | null>(null);

  /** مواضع أخطأ فيها المستخدم مرة على الأقل في هذا السطر. */
  const lineMistakesRef = useRef<Set<number>>(new Set());
  /** يمنع إرسال نفس السطر مرتين عند إعادة رندر أو تكرار المطابقة. */
  const reportedLineRef = useRef<number | null>(null);

  const currentLine = totalLines > 0 ? lines[currentLineIndex] : undefined;
  const rawTargetText = currentLine?.text || "";
  const targetText = useMemo(() => normalizeTarget(rawTargetText), [rawTargetText]);

  const onLineCompleteRef = useRef(onLineComplete);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onLineCompleteRef.current = onLineComplete;
    onCompleteRef.current = onComplete;
  }, [onLineComplete, onComplete]);

  /** حالة السطر الحالي فقط (النص المكتوب)، بدون لمس عدّادات الجلسة. */
  const resetLineState = useCallback(() => {
    typedRef.current = "";
    setTypedChars("");
    completedWordsCount.current = 0;
    lineStartRef.current = null;
    lineMistakesRef.current = new Set();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const resetLine = useCallback(() => {
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    // إعادة يدوية للجملة = محاولة جديدة يحق تسجيلها.
    reportedLineRef.current = null;
    resetLineState();
  }, [resetLineState]);

  const resetSession = useCallback(() => {
    sessionStartRef.current = null;
    keystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    errorKeystrokesRef.current = 0;
    displayedAccuracyRef.current = 100;
    reportedLineRef.current = null;
    setMetrics(INITIAL_METRICS);
  }, []);

  const restart = useCallback(() => {
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    setCurrentLineIndex(0);
    setIsCompleted(false);
    resetLineState();
    resetSession();
  }, [resetLineState, resetSession]);

  const goToLine = useCallback(
    (index: number) => {
      if (!lines || lines.length === 0) return;
      const next = Math.max(0, Math.min(index, lines.length - 1));
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      setIsCompleted(false);
      setCurrentLineIndex(next);
    },
    [lines]
  );

  const goNext = useCallback(() => {
    goToLine(currentLineIndex + 1);
  }, [currentLineIndex, goToLine]);

  const goPrev = useCallback(() => {
    goToLine(currentLineIndex - 1);
  }, [currentLineIndex, goToLine]);

  useEffect(() => {
    resetLineState();
  }, [currentLineIndex, resetLineState]);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

  /** يحدّث المقاييس المعروضة من عدّادات الجلسة. */
  const publishMetrics = useCallback(() => {
    const total = keystrokesRef.current;
    const correct = correctKeystrokesRef.current;
    const errorCount = errorKeystrokesRef.current;

    const rawAccuracy = total > 0 ? Math.round(correct / total * 100) : 100;
    // لا ترتفع الدقة بعد أن تنزل.
    displayedAccuracyRef.current = Math.min(displayedAccuracyRef.current, rawAccuracy);

    const startedAt = sessionStartRef.current;
    const elapsedSeconds = startedAt ? (Date.now() - startedAt) / 1000 : 0;
    // أقل من ثانيتين = عيّنة صغيرة جداً تنتج أرقاماً خرافية.
    const wpm =
    startedAt && elapsedSeconds >= 2 ?
    Math.round(correct / 5 / (elapsedSeconds / 60)) :
    0;

    setMetrics({
      wpm: Math.max(0, Math.min(wpm, 400)),
      accuracy: Math.max(0, Math.min(displayedAccuracyRef.current, 100)),
      correctChars: correct,
      incorrectChars: errorCount,
      totalCharsTyped: total,
      timeSpentSeconds: Math.round(elapsedSeconds)
    });
  }, []);

  const processInput = useCallback(
    (rawValue: string) => {
      if (!targetText || isCompleted) return;

      const previous = typedRef.current;
      const value = expandKeystroke(previous, rawValue, targetText);
      if (value.length > targetText.length) return;

      if (value.length > previous.length) {
        if (sessionStartRef.current === null) sessionStartRef.current = Date.now();
        if (lineStartRef.current === null) lineStartRef.current = Date.now();

        // كل حرف جديد يُحسب مرة واحدة وللأبد (Backspace لا يمحو الخطأ).
        for (let index = previous.length; index < value.length; index += 1) {
          const isWrong = !charEquals(value[index], targetText[index]);
          keystrokesRef.current += 1;
          if (isWrong) {
            errorKeystrokesRef.current += 1;
            lineMistakesRef.current.add(index);
          } else {
            correctKeystrokesRef.current += 1;
          }
        }

        const lastWrong = !charEquals(
          value[value.length - 1],
          targetText[value.length - 1]
        );
        if (lastWrong) {
          SoundEffects.playKeyError();
        } else {
          SoundEffects.playKeyClick();
        }
      }

      typedRef.current = value;
      setTypedChars(value);
      publishMetrics();

      // ── صوت اكتمال الكلمة: كلمة مكتملة = كل حروفها صحيحة ومرّ حدّها ──
      const wordBoundaries: number[] = [];
      for (let index = 0; index < targetText.length; index += 1) {
        if (targetText[index] === " ") wordBoundaries.push(index);
      }
      wordBoundaries.push(targetText.length);

      let finishedWords = 0;
      for (const boundary of wordBoundaries) {
        if (value.length < boundary) break;
        let clean = true;
        for (let index = 0; index < boundary; index += 1) {
          if (!charEquals(value[index], targetText[index])) {
            clean = false;
            break;
          }
        }
        if (!clean) break;
        finishedWords += 1;
      }

      if (
      finishedWords > completedWordsCount.current &&
      finishedWords < wordBoundaries.length)
      {
        SoundEffects.playWordSuccess();
      }
      completedWordsCount.current = finishedWords;

      // ── اكتمال السطر: مُلئ بالكامل وكل حرف صحيح، لا أقل ──
      const filled = value.length === targetText.length;
      const flawless =
      filled &&
      value.split("").every((char, index) => charEquals(char, targetText[index]));

      if (flawless && reportedLineRef.current !== currentLineIndex) {
        reportedLineRef.current = currentLineIndex;
        SoundEffects.playLineSuccess();

        const isLast = currentLineIndex >= lines.length - 1;
        const lineSeconds = lineStartRef.current ?
        Math.max(1, Math.round((Date.now() - lineStartRef.current) / 1000)) :
        1;

        // مجموع الاثنين = طول السطر بالضبط ⇒ السيرفر لا يرفض المحاولة.
        const mistakes = Math.min(lineMistakesRef.current.size, targetText.length);
        const lineCorrect = targetText.length - mistakes;
        const lineAccuracy =
        targetText.length > 0 ?
        Math.round(lineCorrect / targetText.length * 100) :
        100;
        const lineWpm = Math.max(
          0,
          Math.min(Math.round(lineCorrect / 5 / (lineSeconds / 60)), 400)
        );

        onLineCompleteRef.current?.({
          lineIndex: currentLineIndex,
          nextLineIndex: isLast ? currentLineIndex : currentLineIndex + 1,
          totalLines: lines.length,
          accuracy: Math.max(0, Math.min(displayedAccuracyRef.current, 100)),
          wpm: metrics.wpm,
          lineSeconds,
          isLast,
          lineAccuracy,
          lineWpm,
          lineCorrectChars: lineCorrect,
          lineIncorrectChars: mistakes,
          lineText: targetText
        });

        if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
        advanceTimeout.current = setTimeout(() => {
          if (!isLast) {
            setCurrentLineIndex((prev) => prev + 1);
          } else {
            setIsCompleted(true);
            onCompleteRef.current?.();
          }
        }, 900);
      }
    },
    [targetText, isCompleted, currentLineIndex, lines.length, metrics.wpm, publishMetrics]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInput(e.target.value);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        processInput(typedRef.current.slice(0, -1));
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        resetLine();
        return;
      }

      if (e.key.length === 1 && e.key !== "\\") {
        e.preventDefault();
        processInput(typedRef.current + e.key);
      }
    },
    [processInput, resetLine]
  );

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  /** حالة كل حرف — المصدر الوحيد الذي ترسمه الواجهة. */
  const cells = useMemo<TypedCell[]>(
    () =>
    targetText.split("").map((char, index) => {
      const typed = index < typedChars.length ? typedChars[index] : null;
      const state: CellState =
      typed === null ? "pending" : charEquals(typed, char) ? "correct" : "wrong";
      return { char, typed, state, isSpace: char === " " };
    }),
    [targetText, typedChars]
  );

  const lineErrorCount = useMemo(
    () => cells.filter((cell) => cell.state === "wrong").length,
    [cells]
  );

  const isLineFilled = typedChars.length > 0 && typedChars.length === targetText.length;
  const isLineComplete = isLineFilled && lineErrorCount === 0;

  /** نسبة إتمام الجملة الحالية (0-1) — لشريط تقدم سلس. */
  const lineFraction = targetText.length > 0 ? typedChars.length / targetText.length : 0;

  return {
    currentLineIndex,
    currentLine,
    totalLines,
    targetText,
    inputRef,
    typedChars,
    cells,
    /** متروكة للتوافق مع أي مستهلك قديم. */
    errors: cells.map((cell) => cell.state === "wrong"),
    caretIndex: typedChars.length,
    currentIndex: typedChars.length,
    lineFraction,
    lineErrorCount,
    isLineFilled,
    handleInputChange,
    handleKeyDown,
    focusInput,
    metrics,
    isLineComplete,
    isCompleted,
    resetLine,
    restart,
    goToLine,
    goNext,
    goPrev
  };
}