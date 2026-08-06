"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon } from
"lucide-react";

import { Button, Field, Select, TextArea, TextInput } from "@/components/admin/ui/controls";
import { EmptyState, Panel } from "@/components/admin/ui/surfaces";
import type { StoryDraft } from "@/lib/admin/draft";
import type { AdminSentence } from "@/types/admin";

/**
 * محرّر جُمل القصة — كل جملة هي وحدة تعلّم (نص + ترجمة + مفردات).
 * الترتيب = line_index = مسار ملف الصوت، لذا الإضافة/الحذف/التحريك عمليات صريحة.
 */

export interface SentencesTabProps {
  draft: StoryDraft;
  patch: (changes: Partial<StoryDraft>) => void;
}

const LEVELS = ["", "A1", "A2", "B1", "B2", "C1", "C2"];

function newSentence(index: number, level: string): AdminSentence {
  return {
    id: `new-${Date.now().toString(36)}-${index}`,
    lineIndex: index,
    text: "",
    translationAr: "",
    level,
    vocabulary: []
  };
}

export function SentencesTab({ draft, patch }: SentencesTabProps) {
  const [expanded, setExpanded] = useState<string | null>(draft.sentences[0]?.id ?? null);

  const wordCount = useMemo(
    () =>
    draft.sentences.reduce(
      (total, sentence) => total + sentence.text.split(/\s+/).filter(Boolean).length,
      0
    ),
    [draft.sentences]
  );

  const setSentences = (sentences: AdminSentence[]) =>
    patch({ sentences: sentences.map((sentence, index) => ({ ...sentence, lineIndex: index })) });

  const updateSentence = (id: string, changes: Partial<AdminSentence>) =>
    setSentences(
      draft.sentences.map((sentence) =>
      sentence.id === id ? { ...sentence, ...changes } : sentence
      )
    );

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.sentences.length) return;
    const next = [...draft.sentences];
    [next[index], next[target]] = [next[target], next[index]];
    setSentences(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="محتوى القصة"
        action={
        <span className="flex items-center gap-3 text-[11.5px] font-bold text-slate-500">
            <span className="font-en">{draft.sentences.length}</span> جملة
            <span className="h-3 w-px bg-white/10" />
            <span className="font-en">{wordCount}</span> كلمة
          </span>
        }>

        {draft.sentences.length === 0 ?
        <EmptyState
          title="لا توجد جُمل بعد"
          description="أضف أول جملة إنجليزية مع ترجمتها العربية — كل جملة تصبح سطراً صوتياً مستقلاً في القارئ."
          action={
          <Button
            tone="primary"
            className="mt-3"
            onClick={() => setSentences([newSentence(0, draft.cefrLevel)])}>

                <PlusIcon className="h-4 w-4" />
                أضف أول جملة
              </Button>
          } /> :


        <ul className="flex flex-col gap-2">
            {draft.sentences.map((sentence, index) => {
            const open = expanded === sentence.id;
            return (
              <li
                key={sentence.id}
                className={`rounded-xl border transition-all ${
                open ?
                "border-cyan-400/30 bg-[#0B111C] shadow-[0_0_0_1px_rgba(34,211,238,0.1)]" :
                "border-white/[0.06] bg-[#0B111C]/60 hover:border-white/[0.12]"}`
                }>

                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="flex flex-col items-center gap-0.5 text-slate-600">
                      <GripVerticalIcon className="h-3.5 w-3.5" aria-hidden />
                    </span>

                    <span className="font-en flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-[11.5px] font-black text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                    type="button"
                    onClick={() => setExpanded(open ? null : sentence.id)}
                    className="min-w-0 flex-1 text-right">

                      <span
                      dir="ltr"
                      className="font-en block truncate text-[13px] font-bold text-slate-100">

                        {sentence.text || "— جملة فارغة —"}
                      </span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {sentence.translationAr || "لا توجد ترجمة"}
                      </span>
                    </button>

                    {sentence.vocabulary.length > 0 &&
                    <span className="hidden shrink-0 items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10.5px] font-bold text-violet-300 sm:flex">
                        <span className="font-en">{sentence.vocabulary.length}</span> كلمة
                      </span>
                    }

                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                      type="button"
                      aria-label="تحريك لأعلى"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-25 disabled:hover:bg-transparent">

                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                      <button
                      type="button"
                      aria-label="تحريك لأسفل"
                      disabled={index === draft.sentences.length - 1}
                      onClick={() => move(index, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-25 disabled:hover:bg-transparent">

                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                      <button
                      type="button"
                      aria-label="حذف الجملة"
                      onClick={() => {
                        setSentences(draft.sentences.filter((item) => item.id !== sentence.id));
                        if (open) setExpanded(null);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300">

                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {open &&
                <div className="flex flex-col gap-3 border-t border-white/[0.05] px-3 py-3.5">
                      <Field label="الجملة (إنجليزي)">
                        <TextArea
                      dir="ltr"
                      value={sentence.text}
                      onChange={(event) =>
                      updateSentence(sentence.id, { text: event.target.value })
                      }
                      placeholder="The Titanic was one of the largest ships ever built." />

                      </Field>

                      <Field label="الترجمة (عربي)">
                        <TextArea
                      value={sentence.translationAr}
                      onChange={(event) =>
                      updateSentence(sentence.id, { translationAr: event.target.value })
                      }
                      placeholder="كانت سفينة تايتانيك واحدة من أكبر السفن التي بُنيت." />

                      </Field>

                      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                        <Field label="مستوى الجملة">
                          <Select
                        value={sentence.level}
                        onChange={(event) =>
                        updateSentence(sentence.id, { level: event.target.value })
                        }>

                            {LEVELS.map((level) =>
                        <option key={level || "inherit"} value={level}>
                                {level || `مثل القصة (${draft.cefrLevel})`}
                              </option>
                        )}
                          </Select>
                        </Field>

                        <Field label="المفردات المهمة" hint="اكتب كلمة واضغط Enter">
                          <VocabInput
                          words={sentence.vocabulary}
                          onChange={(vocabulary) => updateSentence(sentence.id, { vocabulary })}
                          />
                        </Field>
                      </div>

                      <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[11px] leading-relaxed text-amber-200/85">
                        ملف الصوت لهذه الجملة هو{" "}
                        <span className="font-en">line_{index + 1}.mp3</span> — تغيير
                        الترتيب يعني تغيير الملف المرتبط بها.
                      </p>
                    </div>
                }
                </li>);

          })}
          </ul>
        }

        {draft.sentences.length > 0 &&
        <Button
          tone="outline"
          className="mt-3.5 w-full"
          onClick={() => {
            const created = newSentence(draft.sentences.length, draft.cefrLevel);
            setSentences([...draft.sentences, created]);
            setExpanded(created.id);
          }}>

            <PlusIcon className="h-4 w-4" />
            إضافة جملة
          </Button>
        }
      </Panel>

      <Panel title="إضافة سريعة من نص كامل">
        <QuickImport
          onImport={(lines) => {
            const created = lines.map((text, index) => ({
              ...newSentence(draft.sentences.length + index, draft.cefrLevel),
              text
            }));
            setSentences([...draft.sentences, ...created]);
          }} />

      </Panel>
    </div>);

}

/** إدخال المفردات لكل جملة على حدة — لا حالة مشتركة بين الجمل. */
function VocabInput({
  words,
  onChange
}: {words: string[];onChange: (words: string[]) => void;}) {
  const [input, setInput] = useState("");

  function add() {
    const word = input.trim();
    if (!word || words.includes(word)) return;
    onChange([...words, word].slice(0, 24));
    setInput("");
  }

  return (
    <div className="flex flex-col gap-2">
      <TextInput
        dir="ltr"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          add();
        }}
        placeholder="passenger" />


      {words.length > 0 &&
      <div className="flex flex-wrap gap-1.5">
          {words.map((word) =>
        <span
          key={word}
          className="font-en flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-200">

              {word}
              <button
            type="button"
            aria-label={`حذف ${word}`}
            onClick={() => onChange(words.filter((item) => item !== word))}
            className="text-violet-300/70 transition-colors hover:text-white">

                <XIcon className="h-3 w-3" />
              </button>
            </span>
        )}
        </div>
      }
    </div>);
}

function QuickImport({ onImport }: {onImport: (lines: string[]) => void;}) {
  const [value, setValue] = useState("");
  const lines = value.
  split(/\n|(?<=[.!?])\s+/).
  map((line) => line.trim()).
  filter((line) => line.length > 1);

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="الصق نص القصة"
        hint="سنقسّمه إلى جُمل تلقائياً (بالنقطة أو سطر جديد)، ثم تضيف الترجمة لكل جملة.">

        <TextArea
          dir="ltr"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="The Titanic was one of the largest ships ever built. It sailed from Southampton in 1912." />

      </Field>

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500">
          <SparklesIcon className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          سيتم إنشاء <span className="font-en text-slate-300">{lines.length}</span> جملة
        </p>
        <Button
          tone="outline"
          disabled={lines.length === 0}
          onClick={() => {
            onImport(lines);
            setValue("");
          }}>

          إضافة الجُمل
        </Button>
      </div>
    </div>);
}

export default SentencesTab;
