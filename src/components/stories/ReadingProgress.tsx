"use client";

import { BookOpen, Clock3 } from "lucide-react";

interface ReadingProgressProps {
  progress?: number;
  currentStory?: string;
}

export default function ReadingProgress({
  progress = 68,
  currentStory = "The Last Voyage",
}: ReadingProgressProps) {
  return (
    <div className="rounded-[30px] border border-white/5 bg-[#101623] p-7">

      <div className="mb-6 flex items-center justify-between">

        <h3 className="text-xl font-bold text-white">
          أكمل القراءة
        </h3>

        <BookOpen
          className="text-cyan-400"
          size={22}
        />

      </div>

      <p className="text-lg font-semibold text-white">
        {currentStory}
      </p>

      <p className="mt-2 text-sm text-slate-400">
        استكمل من حيث توقفت.
      </p>

      <div className="mt-7">

        <div className="mb-2 flex justify-between text-sm">

          <span className="text-slate-400">
            التقدم
          </span>

          <span className="font-bold text-cyan-300">
            {progress}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/5">

          <div
            style={{
              width: `${progress}%`,
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500"
          />

        </div>

      </div>

      <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 py-4 font-bold text-black transition hover:scale-[1.02]">

        <Clock3 size={18} />

        متابعة القراءة

      </button>

    </div>
  );
}