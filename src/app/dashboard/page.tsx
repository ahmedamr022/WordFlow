import React from "react";
import { redirect } from "next/navigation";

import AppSidebar from "@/components/layout/app-sidebar";
import { isCurrentUserAdmin } from "@/lib/auth/admin";

import { LegacyProgressMigrator } from "@/components/migration/legacy-progress-migrator";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatCards } from "@/components/dashboard/StatCards";
import { StoryOfTheDay } from "@/components/dashboard/StoryOfTheDay";
import { VocabularyReview } from "@/components/dashboard/VocabularyReview";
import { WeeklyChallenge } from "@/components/dashboard/WeeklyChallenge";
import { AllStoriesList } from "@/components/dashboard/AllStoriesList";
import { ScrollCue } from "@/components/dashboard/ScrollCue";
import { StoryModalProvider } from "@/components/stories/StoryModalProvider";
import { getDashboardData } from "@/lib/dashboard/data";
import { getStoriesOverview } from "@/lib/stories/data";
import { getStoryVisuals } from "@/lib/stories/storyAppearance";
import {
  listCatalogStories,
  recommendStories,
  toStoryItems } from
"@/lib/stories/catalog";
import { getUserLevel } from "@/lib/stories/userLevel";
import {
  buildContinueHighlight,
  pickStoryOfTheDay } from
"@/lib/stories/highlights";

/**
 * المصادقة والـ onboarding مفروضان في src/app/dashboard/layout.tsx
 * (ProtectedShell).
 *
 * ── ما تغيّر في هذه الدفعة ───────────────────────────────────────────────────
 * ١) **الكتالوج الكامل**: قصة اليوم و«ركن القصص» ومودال التفاصيل تقرأ الآن من
 *    `listCatalogStories()` (الثابت + المنشور من الداتابيز)، فأي قصة ينشئها
 *    الأدمن تظهر هنا ولها كارت يفتح تفاصيلها.
 * ٢) **ركن القصص صار مرشَّحاً لمستوى المستخدم** بدل أول أربع قصص في الملف.
 * ٣) **الصفوف بارتفاع واحد** (`items-stretch`) وبمسافات أضيق، والكروت السفلية
 *    لها مؤشّر «المزيد بالأسفل» فلا يفوتها المستخدم.
 */
export default async function DashboardPage() {
  const [data, overview, catalog, level] = await Promise.all([
  getDashboardData(),
  getStoriesOverview(),
  listCatalogStories(),
  getUserLevel()]
  );

  // التحقق من صلاحية المستخدم الحالية من Server Component.
  const isAdmin = await isCurrentUserAdmin();

  // لا يحدث عملياً لأن ProtectedShell يحمي المسار، لكنه يضمن النوع.
  if (!data) {
    redirect("/login");
  }

  const catalogItems = toStoryItems(catalog);

  const storyOfTheDay = pickStoryOfTheDay(overview.positions, undefined, catalog);

  // إعدادات المظهر المنشورة لقصة اليوم (إن وُجدت في جدول stories).
  const storyOfTheDayVisuals = await getStoryVisuals(storyOfTheDay?.id);

  const continueStory =
  buildContinueHighlight(overview.continueSlug, overview.positions, catalog) ??
  data.continueStory;

  const cornerStories = recommendStories({
    stories: catalog,
    level,
    positions: overview.positions,
    limit: 4
  });

  return (
    <StoryModalProvider positions={overview.positions} catalog={catalogItems}>
      <div
        className="flex min-h-screen select-none bg-background font-sans text-foreground"
        dir="ltr">

        <LegacyProgressMigrator />

        <AppSidebar
          active="الرئيسية"
          isAdmin={isAdmin}
          dailyXp={data.today.xpEarned}
          dailyGoalXp={data.today.goalXp}
          streak={data.stats.streakCount} />


        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            nickname={data.profile.nickname}
            level={data.profile.level}
            avatarUrl={data.profile.avatarUrl}
            streak={data.stats.streakCount} />


          <main
            data-scroll-container
            className="relative flex-1 overflow-y-auto px-6 pb-8 pt-5"
            dir="rtl">

            <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
              <DashboardHero
                nickname={data.profile.nickname}
                today={data.today}
                continueStory={continueStory} />


              <StatCards stats={data.stats} activity={data.activity} />

              {/* الصف الأول: قصة اليوم + مراجعة الكلمات — بارتفاع واحد */}
              <section className="grid grid-cols-12 items-stretch gap-4" dir="ltr">
                <StoryOfTheDay
                  story={storyOfTheDay}
                  appearance={storyOfTheDayVisuals?.appearance}
                  coverOverride={storyOfTheDayVisuals?.coverImage ?? null} />


                <VocabularyReview vocabulary={data.vocabulary} />
              </section>

              {/* الصف الثاني: التحدي + ركن القصص */}
              <section
                id="dashboard-more"
                className="grid scroll-mt-4 grid-cols-12 items-stretch gap-4"
                dir="rtl">

                <WeeklyChallenge weekly={data.weekly} />

                <AllStoriesList
                  stories={cornerStories}
                  totalCount={catalog.length}
                  level={level} />

              </section>
            </div>

            <ScrollCue targetId="dashboard-more" label="التحديات وركن القصص بالأسفل" />
          </main>
        </div>
      </div>
    </StoryModalProvider>);

}