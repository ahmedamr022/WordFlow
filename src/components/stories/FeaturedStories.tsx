"use client";

import Link from "next/link";
import StoryCard from "./StoryCard";

interface Story {
  id: string;
  title: string;
  titleAr: string;
  image: string;
  level: string;
  duration: string;
  rating: number;
  words: number;
}

interface FeaturedStoriesProps {
  stories: Story[];
}

export default function FeaturedStories({
  stories,
}: FeaturedStoriesProps) {
  return (
    <section className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-white">
            القصص المميزة
          </h2>

          <p className="mt-2 text-slate-400">
            أفضل القصص المقترحة لك اليوم.
          </p>
        </div>

        <Link
          href="/stories"
          className="rounded-2xl border border-white/5 bg-[#101623] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
        >
          عرض الكل
        </Link>

      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">

        {stories.map((story) => (
          <StoryCard
            key={story.id}
            featured
            {...story}
          />
        ))}

      </div>

    </section>
  );
}