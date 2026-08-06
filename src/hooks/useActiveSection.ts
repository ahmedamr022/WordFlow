"use client";

import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently sitting under the top bar,
 * used to highlight the matching link in the navbar while scrolling.
 */
export function useActiveSection(ids: string[], offset = 160): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      let current = '';

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }

      const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140;
      if (atBottom) current = ids[ids.length - 1];

      setActive((prev) => prev === current ? prev : current);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offset]);

  return active;
}