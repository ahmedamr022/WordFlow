"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { saveStoryDraftAction } from "@/app/actions/admin/stories";
import { draftFingerprint, type StoryDraft } from "@/lib/admin/draft";
import type { StoryAppearance, SurfaceAppearance, SurfaceKey } from "@/types/admin";

/**
 * حالة التحرير + الحفظ التلقائي.
 *
 * قواعد مقصودة:
 *   · **لا زر Save إلزامي.** الحفظ التلقائي بعد 900ms من آخر تعديل.
 *   · **الحفظ التلقائي يكتب مسودة فقط.** النشر قرار صريح بزر واحد.
 *   · بصمة نصية للمقارنة بدل deep-equal: أرخص وأدق لكائن صغير كهذا.
 *   · الطلب الأحدث يفوز (seq).
 *
 * الجديد في هذه الدفعة:
 *   · `saveNow()` لزر «حفظ التغييرات» الصريح (بعض المستخدمين لا يثقون في
 *     الحفظ التلقائي، وزر واضح يقلّل القلق بلا تكلفة).
 *   · `lastSavedAgo` كنص «تم الحفظ قبل ٨ ثوانٍ» يتحدّث كل ٥ ثوانٍ — نفس
 *     مؤشّر التصميم المرجعي.
 */

export type SaveStatus = "clean" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 900;

function agoLabel(date: Date | null): string | null {
  if (!date) return null;
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return "تم الحفظ الآن";
  if (seconds < 60) return `تم الحفظ قبل ${seconds} ثانية`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `تم الحفظ قبل ${minutes} دقيقة`;
  return `تم الحفظ ${date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`;
}

export function useStoryDraft(storyId: string, initial: StoryDraft) {
  const [draft, setDraft] = useState<StoryDraft>(initial);
  const [status, setStatus] = useState<SaveStatus>("clean");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const publishedFingerprint = useRef(draftFingerprint(initial));
  const timer = useRef<number | null>(null);
  const seq = useRef(0);
  const latest = useRef(draft);
  latest.current = draft;

  const fingerprint = useMemo(() => draftFingerprint(draft), [draft]);
  const isDirty = fingerprint !== publishedFingerprint.current;

  const persist = useCallback(
    async (payload: StoryDraft) => {
      const ticket = ++seq.current;
      setStatus("saving");
      const result = await saveStoryDraftAction(storyId, payload);
      if (ticket !== seq.current) return result;

      if (result.ok) {
        setStatus("saved");
        setSavedAt(new Date());
        setError(null);
      } else {
        setStatus("error");
        setError(result.error);
      }
      return result;
    },
    [storyId]
  );

  // ── الحفظ التلقائي ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    setStatus("dirty");

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void persist(latest.current);
    }, AUTOSAVE_DELAY);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [fingerprint, isDirty, persist]);

  // تحديث نص «قبل كم» بلا إعادة رِندر ثقيلة.
  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 5000);
    return () => window.clearInterval(interval);
  }, []);

  // تحذير المتصفح لو غادر وهناك تغييرات لم تُحفظ بعد.
  useEffect(() => {
    if (status !== "dirty" && status !== "saving") return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  const patch = useCallback((changes: Partial<StoryDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  }, []);

  const patchSurface = useCallback(
    (key: SurfaceKey, changes: Partial<SurfaceAppearance>) => {
      setDraft((current) => ({
        ...current,
        appearance: {
          ...current.appearance,
          [key]: { ...current.appearance[key], ...changes }
        } as StoryAppearance
      }));
    },
    []
  );

  /** حفظ صريح فوري — يلغي مؤقّت الحفظ التلقائي المعلّق. */
  const saveNow = useCallback(async () => {
    if (timer.current) window.clearTimeout(timer.current);
    return persist(latest.current);
  }, [persist]);

  /** يُنادى بعد نشر ناجح: الحالة المنشورة أصبحت هي الحالية. */
  const markPublished = useCallback((published: StoryDraft) => {
    publishedFingerprint.current = draftFingerprint(published);
    setDraft(published);
    setStatus("clean");
    setSavedAt(new Date());
  }, []);

  const replaceDraft = useCallback((next: StoryDraft) => {
    setDraft(next);
    setStatus("dirty");
  }, []);

  const savedLabel = useMemo(() => {
    void tick;
    return agoLabel(savedAt);
  }, [savedAt, tick]);

  return {
    draft,
    patch,
    patchSurface,
    replaceDraft,
    markPublished,
    saveNow,
    status,
    savedAt,
    savedLabel,
    error,
    isDirty
  };
}