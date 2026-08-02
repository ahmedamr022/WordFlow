"use client";

import React from "react";
import { useParams } from "next/navigation";
import { getStoryById } from "@/data/stories";
import { TypingEngine } from "@/components/typing/TypingEngine";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StoryPage() {
  const params = useParams();
  const storyId = params?.storyId as string;

  const story = getStoryById(storyId || "ready-to-learn");

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0f] text-white font-arabic dir-rtl">
        <h1 className="text-2xl font-bold mb-4">عذراً، القصة غير موجودة.</h1>
        <Link
          href="/paths"
          className="px-6 py-2.5 rounded-full bg-primary-coral text-white font-bold"
        >
          العودة للمسارات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans p-4">
      {/* Top Header Navigation */}
      <div className="max-w-4xl mx-auto flex items-center justify-between py-2 border-b border-border/30 dir-rtl font-arabic">
        <Link
          href="/paths"
          className="flex items-center gap-2 text-xs text-muted-text hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى المسارات</span>
        </Link>
      </div>

      {/* Typing Engine */}
      <div className="mt-4">
        <TypingEngine story={story} />
      </div>
    </div>
  );
}
