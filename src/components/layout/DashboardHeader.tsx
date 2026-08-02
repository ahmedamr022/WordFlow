"use client";

import DashboardSearch from "./DashboardSearch";
import DashboardUser from "./DashboardUser";
import DashboardStreak from "./DashboardStreak";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 h-[76px] border-b border-white/5 bg-[#07090E]/75 backdrop-blur-3xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-8">

        <div className="flex items-center gap-5">
          <DashboardSearch />
        </div>

        <div className="flex items-center gap-4">
          <DashboardStreak />
          <DashboardUser />
        </div>

      </div>
    </header>
  );
}