"use client";

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

interface RecommendedStoriesProps {
  stories: Story[];
}

export default function RecommendedStories({
  stories,
}: RecommendedStoriesProps) {
  return (
    <section className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-white">
            مقترحة لك
          </h2>

          <p className="mt-2 text-slate-400">
            بناءً على مستواك ونشاطك الأخير.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

        {stories.slice(0, 2).map((story) => (
          <StoryCard
            key={story.id}
            {...story}
          />
        ))}

      </div>

    </section>
  );
}