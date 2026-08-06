import { notFound } from "next/navigation";

import { getCatalogStory } from "@/lib/stories/catalog";
import { StoryReader, type ReaderStory } from "./StoryReader";

/**
 * صفحة القصة — صارت **Server Component**.
 *
 * قبل ذلك كانت الصفحة كلها `` وتنادي `getStoryById()` من
 * `src/data/stories.ts`، أي أنها لا تعرف إلا القصص المكتوبة في الملف الثابت.
 * فأي قصة ينشئها الأدمن — مهما كانت منشورة وكاملة الجُمل — كانت تعرض
 * «القصة غير موجودة».
 *
 * الآن القرار على السيرفر عبر `getCatalogStory(slug)`:
 *   · قصة في جدول `stories` ⇒ جُملها من `story_lines` ومظهرها وقفلها من نفس الصف.
 *   · قصة من الكتالوج الثابت ⇒ كما كانت بالحرف.
 *   · القصتان معاً ⇒ الداتابيز تتقدّم، والجُمل الثابتة تبقى بديلاً.
 * والقارئ نفسه بقي client component يستقبل القصة props.
 */

export const dynamic = "force-dynamic";

export default async function StoryPage({
  params


}: {params: Promise<{storyId?: string;id?: string;}>;}) {
  const resolved = await params;
  const slug = resolved?.storyId || resolved?.id || "";

  const story = await getCatalogStory(slug);
  if (!story) notFound();

  const readerStory: ReaderStory = {
    id: story.id,
    title: story.title,
    titleAr: story.titleAr,
    cefrLevel: story.cefrLevel,
    background: story.background,
    lines: story.lines.map((line, index) => ({
      id: typeof line.id === "number" ? line.id : index + 1,
      text: line.text,
      translationAr: line.translationAr ?? "",
      words: line.words ?? []
    })),
    appearance: story.appearance.storyPage,
    access: story.access
  };

  return <StoryReader story={readerStory} />;
}