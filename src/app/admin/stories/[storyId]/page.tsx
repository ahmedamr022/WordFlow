import React from "react";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import {
  getStoryForAdmin,
  listCategories,
  listStoryVersions } from
"@/lib/admin/queries";
import { draftSchema, toDraft } from "@/lib/admin/draft";
import { StoryStudio } from "@/components/admin/studio/StoryStudio";

/**
 * مسار Story Studio.
 *
 * نقطة البداية للتحرير: لو للقصة **مسودة غير منشورة** نستكمل منها (فلا يفقد
 * الأدمن عملاً بدأه أمس)، وإلا نبدأ من الحالة المنشورة. التحقق بـ zod هنا لأن
 * المسودة jsonb قد تكون من إصدار أقدم من المخطط.
 */

export default async function StoryStudioPage({
  params



}: {params: Promise<{storyId: string;}>;}) {
  await requireAdmin();
  const { storyId } = await params;

  const story = await getStoryForAdmin(storyId);
  if (!story) notFound();

  const [categories, versions] = await Promise.all([
  listCategories(),
  listStoryVersions(story.id)]
  );

  const parsedDraft = draftSchema.safeParse(story.rawDraft);
  const initialDraft = parsedDraft.success ? parsedDraft.data : toDraft(story);

  return (
    <StoryStudio
      story={story}
      initialDraft={initialDraft}
      categories={categories}
      versions={versions} />);


}