import React from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatCards } from "@/components/dashboard/StatCards";
import { StoryOfTheDay } from "@/components/dashboard/StoryOfTheDay";
import { VocabularyReview } from "@/components/dashboard/VocabularyReview";
import { WeeklyChallenge } from "@/components/dashboard/WeeklyChallenge";
import { AllStoriesList } from "@/components/dashboard/AllStoriesList";

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen text-white flex select-none font-sans"
      style={{ background: "#020305" }}
      dir="ltr"
    >
      {/* الـ Sidebar الموحد على اليسار */}
      <AppSidebar active="الرئيسية" />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-8 overflow-y-auto space-y-6" dir="rtl">
          <DashboardHero />
          <StatCards />

          <section className="grid grid-cols-12 gap-5" dir="ltr">
            <StoryOfTheDay />
            <VocabularyReview />
          </section>

          <section
            className="grid grid-cols-12 gap-5 items-stretch"
            dir="rtl"
          >
            <WeeklyChallenge />
            <AllStoriesList />
          </section>
        </main>
      </div>
    </div>
  );
}