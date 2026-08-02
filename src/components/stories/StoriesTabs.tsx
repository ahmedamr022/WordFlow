"use client";

import { BookOpen, Flame, Clock3, Sparkles } from "lucide-react";

const tabs = [
  {
    id: "featured",
    label: "المميزة",
    icon: Sparkles,
  },
  {
    id: "all",
    label: "جميع القصص",
    icon: BookOpen,
  },
  {
    id: "continue",
    label: "أكمل القراءة",
    icon: Clock3,
  },
  {
    id: "popular",
    label: "الأكثر قراءة",
    icon: Flame,
  },
];

export default function StoriesTabs() {
  return (
    <div className="flex flex-wrap gap-4">

      {tabs.map((tab) => {

        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            className={`
            group
            flex
            items-center
            gap-3
            rounded-2xl
            border
            px-5
            py-3
            transition-all
            duration-300
            ${
              tab.id === "featured"
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                : "border-white/5 bg-[#101623] text-slate-300 hover:border-cyan-400/20 hover:text-cyan-300"
            }
            `}
          >
            <Icon
              size={18}
              className="transition group-hover:scale-110"
            />

            <span className="font-semibold">
              {tab.label}
            </span>

          </button>
        );

      })}

    </div>
  );
}