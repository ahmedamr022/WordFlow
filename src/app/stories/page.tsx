import { getStoriesOverview } from "@/lib/stories/data";
import {
  listCatalogStories,
  recommendStories,
  toStoryItems } from
"@/lib/stories/catalog";
import { getUserLevel } from "@/lib/stories/userLevel";
import StoriesPageClient from "./StoriesPageClient";

/**
 * Server Component.
 *
 * ما تغيّر: الكتالوج لم يعد يأتي من `src/data/stories.ts` داخل العميل، بل من
 * `listCatalogStories()` التي تدمج الكتالوج الثابت مع **كل قصة منشورة في
 * جدول `stories`** — وهذا هو إصلاح «القصة اللي بعملها مش بتظهر في المكتبة».
 *
 * و«موصى به لك» صار مبنياً على مستوى المستخدم الحقيقي
 * (`profiles.english_level`) وعلى تقدّمه، ويتغيّر كل يوم.
 */
export default async function StoriesPage() {
  const [overview, catalog, level] = await Promise.all([
  getStoriesOverview(),
  listCatalogStories(),
  getUserLevel()]
  );

  const recommended = recommendStories({
    stories: catalog,
    level,
    positions: overview.positions,
    limit: 10
  });

  return (
    <StoriesPageClient
      overview={overview}
      catalog={toStoryItems(catalog)}
      recommended={toStoryItems(recommended)}
      userLevel={level} />);

}