"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  HistoryIcon,
  ImageIcon,
  InfoIcon,
  ListIcon,
  LockIcon,
  PaletteIcon,
  SaveIcon,
  TriangleAlertIcon } from
"lucide-react";

import { publishStoryAction } from "@/app/actions/admin/stories";
import { Button } from "@/components/admin/ui/controls";
import { Spinner } from "@/components/admin/ui/surfaces";
import { useStoryDraft } from "@/components/admin/studio/useStoryDraft";
import { LivePreview } from "@/components/admin/studio/LivePreview";
import { AppearancePanel } from "@/components/admin/studio/AppearancePanel";
import { InformationTab } from "@/components/admin/studio/tabs/InformationTab";
import { SentencesTab } from "@/components/admin/studio/tabs/SentencesTab";
import { MediaTab } from "@/components/admin/studio/tabs/MediaTab";
import { AccessTab } from "@/components/admin/studio/tabs/AccessTab";
import { HistoryTab } from "@/components/admin/studio/tabs/HistoryTab";
import type { StoryDraft } from "@/lib/admin/draft";
import type {
  AdminCategory,
  AdminStory,
  AdminStoryMedia,
  AdminStoryVersion,
  SurfaceKey } from
"@/types/admin";

/**
 * Story Studio — إعادة تنظيم كاملة للتجربة.
 *
 * ── ما كان يشتّت ─────────────────────────────────────────────────────────────
 * ١) **أربعة أعمدة تعمل في نفس اللحظة**: تبويبات + محرّر + معاينة + لوح مظهر
 *    دائم. عدد الأزرار المرئية في الشاشة كان يقارب الثلاثين.
 * ٢) **تكرار حقيقي**: تبويب «المظهر» كان صفحة شرح فقط بينما أدوات المظهر تعيش
 *    في عمود رابع دائم، وحقول «الوصول» مكرّرة بين تبويبها ولوح أسفل المعاينة.
 * ٣) **التبويبات تهرب مع التمرير**: كانت في مجرى الصفحة، فبمجرد النزول في قائمة
 *    الجُمل تختفي من الشاشة ولا تعرف أين أنت.
 *
 * ── الشكل الجديد ─────────────────────────────────────────────────────────────
 *   [شريط أوامر ثابت]           ← رجوع · حالة الحفظ · حفظ · معاينة · نشر
 *   [شريط خطوات ثابت]           ← ٦ خطوات مرقّمة، دائماً ظاهرة
 *   [منطقة العمل]               ← عمود واحد للخطوة الحالية + معاينة على اليسار
 *
 * الاستوديو صار لوحاً بارتفاع الشاشة والتمرير **داخل الأعمدة** لا في الصفحة،
 * فشريط الخطوات لا يغيب أبداً. وكل خطوة لها مكان واحد لا يتكرر في غيره:
 * المظهر داخل خطوته، والوصول داخل خطوته، والحفظ في شريط الأوامر وحده.
 */

const STEPS = [
{
  key: "information" as const,
  label: "المعلومات",
  icon: InfoIcon,
  hint: "العنوان والوصف والمستوى والحالة"
},
{
  key: "sentences" as const,
  label: "الجُمل",
  icon: ListIcon,
  hint: "نص القصة وترجمته سطراً سطراً"
},
{
  key: "media" as const,
  label: "الوسائط",
  icon: ImageIcon,
  hint: "الغلاف والخلفية ومكتبة صور القصة"
},
{
  key: "appearance" as const,
  label: "المظهر",
  icon: PaletteIcon,
  hint: "تموضع الصورة في كل سطح يظهر فيه"
},
{
  key: "access" as const,
  label: "الوصول",
  icon: LockIcon,
  hint: "القفل ورسالته"
},
{
  key: "history" as const,
  label: "الإصدارات",
  icon: HistoryIcon,
  hint: "استعادة نسخة سابقة"
}];


type StepKey = (typeof STEPS)[number]["key"];

export interface StoryStudioProps {
  story: AdminStory;
  initialDraft: StoryDraft;
  categories: AdminCategory[];
  versions: AdminStoryVersion[];
}

export function StoryStudio({ story, initialDraft, categories, versions }: StoryStudioProps) {
  const router = useRouter();
  const {
    draft,
    patch,
    patchSurface,
    replaceDraft,
    markPublished,
    saveNow,
    status,
    savedLabel,
    error,
    isDirty
  } = useStoryDraft(story.id, initialDraft);

  const [step, setStep] = useState<StepKey>("information");
  const [surfaceKey, setSurfaceKey] = useState<SurfaceKey>("storyPage");
  const [previewLocked, setPreviewLocked] = useState(true);
  const [media, setMedia] = useState<AdminStoryMedia[]>(story.media);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, startPublish] = useTransition();

  // Ctrl/⌘ + S = حفظ فوري.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveNow]);

  function publish() {
    setPublishError(null);
    startPublish(async () => {
      const result = await publishStoryAction(story.id, draft, "تحديث من الاستوديو");
      if (!result.ok) {
        setPublishError(result.error);
        return;
      }
      markPublished(draft);
      if (result.data.slug !== story.slug) {
        router.replace(`/admin/stories/${result.data.slug}`);
      } else {
        router.refresh();
      }
    });
  }

  const stepIndex = STEPS.findIndex((item) => item.key === step);
  const activeStep = STEPS[stepIndex] ?? STEPS[0];
  const previousStep = stepIndex > 0 ? STEPS[stepIndex - 1] : null;
  const nextStep = stepIndex < STEPS.length - 1 ? STEPS[stepIndex + 1] : null;

  async function goTo(key: StepKey) {
    await saveNow();
    setStep(key);
  }

  const statusLabel =
  status === "saving" ?
  "جاري الحفظ..." :
  status === "error" ?
  error ?? "تعذر الحفظ" :
  isDirty ?
  "تغييرات غير محفوظة" :
  savedLabel ?? "محفوظ";

  const missingTitle = draft.titleEn.trim().length === 0;
  const missingSentences = draft.sentences.length === 0;

  return (
    <div className="flex h-[calc(100vh-132px)] min-h-[620px] flex-col gap-3">
      {/* ── شريط الأوامر (ثابت) ──────────────────────────────────────────── */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/[0.06] bg-[#090F18]/85 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/stories"
            aria-label="رجوع إلى القصص"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] text-slate-300 transition-colors hover:text-white">

            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-black text-white">
              {draft.titleAr || draft.titleEn || "قصة بلا عنوان"}
            </h1>
            <p className="font-en mt-0.5 truncate text-[11.5px] text-slate-500">
              {draft.seo.slug || story.slug} ·{" "}
              {draft.status === "published" ?
              "منشورة" :
              draft.status === "draft" ?
              "مسودة" :
              "مقفلة"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`flex items-center gap-1.5 text-[11.5px] font-bold ${
            status === "error" ?
            "text-rose-300" :
            isDirty ?
            "text-amber-300" :
            "text-emerald-300"}`
            }>

            {status === "saving" ?
            <Spinner /> :
            status === "error" ?
            <TriangleAlertIcon className="h-3.5 w-3.5" /> :

            <CheckIcon className="h-3.5 w-3.5" />
            }
            {statusLabel}
          </span>

          <Button
            tone="outline"
            onClick={() => void saveNow()}
            disabled={status === "saving" || !isDirty}>

            <SaveIcon className="h-4 w-4" aria-hidden />
            حفظ
          </Button>

          <Link
            href={`/story/${story.slug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#0B111C] px-3.5 py-2.5 text-[12.5px] font-bold text-slate-200 transition-colors hover:text-white">

            <EyeIcon className="h-4 w-4" />
            معاينة في الموقع
          </Link>

          <Button tone="primary" onClick={publish} disabled={publishing || missingTitle}>
            {publishing ? <Spinner /> : "نشر التغييرات"}
          </Button>
        </div>
      </header>

      {/* ── شريط الخطوات (ثابت — لا يغيب مع التمرير) ─────────────────────── */}
      <nav
        aria-label="خطوات إعداد القصة"
        className="flex shrink-0 items-stretch gap-1.5 overflow-x-auto rounded-[16px] border border-white/[0.06] bg-[#090F18]/85 p-1.5">

        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const active = step === item.key;
          const warn =
          item.key === "information" && missingTitle ||
          item.key === "sentences" && missingSentences;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => void goTo(item.key)}
              aria-current={active ? "step" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-[12px] px-3.5 py-2.5 text-[12.5px] font-bold transition-all ${
              active ?
              "border border-cyan-400/30 bg-cyan-500/10 text-white" :
              "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"}`
              }>

              <span
                className={`font-en flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                active ? "bg-cyan-400/20 text-cyan-200" : "bg-white/[0.06] text-slate-500"}`
                }
                aria-hidden>

                {index + 1}
              </span>
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
              {warn &&
              <span
                className="h-1.5 w-1.5 rounded-full bg-amber-400"
                aria-label="يحتاج إكمالاً" />
              }
            </button>);

        })}
      </nav>

      {publishError &&
      <p className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[12.5px] font-bold text-rose-300">
          {publishError}
        </p>
      }

      {/* ── منطقة العمل: خطوة واحدة + معاينة ────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto pl-1 [scrollbar-width:thin]">
          <div className="flex items-center gap-2 px-1">
            <h2 className="text-[14px] font-black text-slate-100">{activeStep.label}</h2>
            <span className="text-[11.5px] text-slate-500">— {activeStep.hint}</span>
          </div>

          {step === "information" &&
          <InformationTab draft={draft} patch={patch} categories={categories} />
          }

          {step === "sentences" && <SentencesTab draft={draft} patch={patch} />}

          {step === "media" &&
          <MediaTab
            storyId={story.id}
            draft={draft}
            patch={patch}
            media={media}
            onMediaChange={setMedia} />

          }

          {/* أدوات المظهر تعيش داخل خطوتها — لا عمود دائم ولا تبويب شرح فارغ */}
          {step === "appearance" &&
          <AppearancePanel
            draft={draft}
            surfaceKey={surfaceKey}
            onSurfaceKeyChange={setSurfaceKey}
            onPatchSurface={patchSurface}
            media={media}
            onPickCover={() => setStep("media")} />

          }

          {step === "access" && <AccessTab draft={draft} patch={patch} />}

          {step === "history" &&
          <HistoryTab
            storyId={story.id}
            versions={versions}
            onRestored={(restored) => {
              replaceDraft(restored);
              setStep("information");
            }} />

          }

          {/* تنقّل الخطوات — الزرّان الوحيدان أسفل المحرّر */}
          <div className="mt-auto flex shrink-0 items-center justify-between gap-3 rounded-[16px] border border-white/[0.06] bg-[#090F18]/85 px-4 py-3">
            <div>
              {previousStep ?
              <Button tone="ghost" onClick={() => void goTo(previousStep.key)}>
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  {previousStep.label}
                </Button> :

              <span className="text-[11.5px] text-slate-600">أول خطوة</span>
              }
            </div>

            <span className="font-en text-[11px] font-bold text-slate-600">
              {stepIndex + 1} / {STEPS.length}
            </span>

            <div>
              {nextStep ?
              <Button tone="primary" onClick={() => void goTo(nextStep.key)}>
                  {nextStep.label}
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden />
                </Button> :

              <Button tone="primary" onClick={publish} disabled={publishing || missingTitle}>
                  {publishing ? <Spinner /> : "نشر التغييرات"}
                </Button>
              }
            </div>
          </div>
        </div>

        {/* المعاينة — مرجع بصري ثابت بلا أدوات تحرير */}
        <aside className="flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto [scrollbar-width:thin]">
          <LivePreview
            draft={draft}
            surfaceKey={surfaceKey}
            onSurfaceChange={setSurfaceKey}
            previewLocked={previewLocked}
            onPreviewLockedChange={setPreviewLocked} />


          <div className="rounded-[16px] border border-white/[0.06] bg-[#090F18]/85 px-4 py-3">
            <ul className="flex flex-col gap-2 text-[11.5px] text-slate-400">
              <li className="flex items-center justify-between">
                <span>الجُمل</span>
                <span className="font-en font-bold text-slate-200">
                  {draft.sentences.length}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>الصور</span>
                <span className="font-en font-bold text-slate-200">{media.length}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>المستوى</span>
                <span className="font-en font-bold text-slate-200">{draft.cefrLevel}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>الوصول</span>
                <span className="font-bold text-slate-200">
                  {draft.access.locked ?
                  draft.access.lockType === "hidden" ?
                  "مقفلة ومخفية" :
                  "مقفلة وظاهرة" :
                  "مفتوحة"}
                </span>
              </li>
            </ul>

            <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-slate-500">
              الحفظ تلقائي، و<span className="font-en">Ctrl+S</span> يحفظ فوراً. القصة لا
              تظهر للمستخدمين حتى تضغط «نشر التغييرات» وتكون حالتها «منشورة».
            </p>
          </div>
        </aside>
      </div>
    </div>);

}

export default StoryStudio;