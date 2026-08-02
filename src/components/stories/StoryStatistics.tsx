"use client";

import { BookOpen, Trophy, Clock3, Flame } from "lucide-react";

export default function StoryStatistics() {
  const stats = [
    {
      icon: BookOpen,
      value: "247",
      label: "قصة",
      color: "text-cyan-400",
    },
    {
      icon: Trophy,
      value: "81%",
      label: "الإكمال",
      color: "text-yellow-400",
    },
    {
      icon: Clock3,
      value: "64h",
      label: "وقت القراءة",
      color: "text-green-400",
    },
    {
      icon: Flame,
      value: "12",
      label: "Streak",
      color: "text-orange-400",
    },
  ];

  return (
    <div className="rounded-[30px] border border-white/5 bg-[#101623] p-7">

      <h3 className="mb-7 text-xl font-bold text-white">
        إحصائياتك
      </h3>

      <div className="grid grid-cols-2 gap-5">

        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-cyan-400/20"
            >

              <Icon
                size={24}
                className={item.color}
              />

              <h4 className="mt-5 text-3xl font-black text-white">
                {item.value}
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                {item.label}
              </p>

            </div>
          );

        })}

      </div>

    </div>
  );
}