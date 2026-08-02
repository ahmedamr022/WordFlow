"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoryCarouselProps {
  children: React.ReactNode;
  /** How many card-widths to scroll per arrow click */
  scrollPages?: number;
}

export function StoryCarousel({ children, scrollPages = 2 }: StoryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, children]);

  const scroll = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const cardWidth = card?.offsetWidth ?? 180;
    const gap = 20;
    el.scrollBy({ left: direction * (cardWidth + gap) * scrollPages, behavior: "smooth" });
  };

  return (
    <div className="relative" dir="ltr">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="السابق"
          className="absolute -left-3 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(37,99,235,0.95))",
            boxShadow: "0 8px 24px rgba(124,58,237,0.45)",
          }}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      )}

      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="التالي"
          className="absolute -right-3 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(37,99,235,0.95))",
            boxShadow: "0 8px 24px rgba(124,58,237,0.45)",
          }}
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
