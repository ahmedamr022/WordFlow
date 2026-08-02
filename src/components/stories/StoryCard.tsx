"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  Star,
  Play,
  ArrowUpRight,
} from "lucide-react";

interface StoryCardProps {
  id: string;
  title: string;
  titleAr: string;
  image: string;
  level: string;
  duration: string;
  rating: number;
  words: number;
  featured?: boolean;
}

export default function StoryCard({
  id,
  title,
  titleAr,
  image,
  level,
  duration,
  rating,
  words,
  featured = false,
}: StoryCardProps) {
  return (
    <Link
      href={`/story/${id}`}
      className={`group relative overflow-hidden rounded-[30px] border border-white/5 bg-[#101623] transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-[0_25px_70px_rgba(34,211,238,.12)] ${
        featured ? "h-[430px]" : "h-[370px]"
      }`}
    >
      <div className="absolute inset-0">

        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090ed8] to-transparent" />

      </div>

      <div className="absolute right-5 top-5 z-20">

        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 backdrop-blur-xl">
          {level}
        </span>

      </div>

      <div className="absolute left-5 top-5 z-20">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl transition duration-300 group-hover:bg-cyan-400 group-hover:text-black">

          <Play
            size={18}
            fill="currentColor"
          />

        </div>

      </div>

      <div className="absolute bottom-0 z-20 flex h-[46%] w-full flex-col justify-end p-7">

        <div className="mb-3 flex items-center gap-2">

          <BookOpen
            size={16}
            className="text-cyan-300"
          />

          <span className="text-xs tracking-wide text-slate-300">
            Story
          </span>

        </div>

        <h2 className="text-2xl font-extrabold leading-tight text-white transition duration-300 group-hover:text-cyan-300">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {titleAr}
        </p>

        <div className="mt-6 flex items-center justify-between">

          <div className="flex items-center gap-4 text-sm text-slate-300">

            <div className="flex items-center gap-2">

              <Clock3 size={16} />

              <span>{duration}</span>

            </div>

            <div className="flex items-center gap-2">

              <BookOpen size={16} />

              <span>{words} كلمة</span>

            </div>

          </div>

          <div className="flex items-center gap-1">

            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="font-semibold text-white">
              {rating.toFixed(1)}
            </span>

          </div>

        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">

          <span className="text-sm font-medium text-slate-300 transition group-hover:text-white">
            ابدأ القراءة
          </span>

          <ArrowUpRight className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />

        </div>

      </div>

      <div className="absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/5" />
    </Link>
  );
}