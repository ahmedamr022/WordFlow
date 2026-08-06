"use client";

import React from "react";
import { ChevronDownIcon } from "lucide-react";

/**
 * مؤشّر «فيه محتوى تحت».
 *
 * السبب: الكروت السفلية في الداشبورد (التحدي الأسبوعي + ركن القصص) تقع أسفل
 * حدّ الشاشة على اللابتوب، وبلا أي إشارة كان المستخدم قد لا ينزل إليها أبداً.
 * هذا المؤشّر يظهر مرّة واحدة، ويختفي بمجرد أول تمرير أو بعد استخدامه — فلا
 * يزحم الواجهة ولا يظهر لمن يمرّر أصلاً.
 */

export interface ScrollCueProps {
  /** id العنصر الذي ننزل إليه. */
  targetId: string;
  label?: string;
}

export function ScrollCue({ targetId, label = "المزيد بالأسفل" }: ScrollCueProps) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const container =
    anchorRef.current?.closest<HTMLElement>("[data-scroll-container]") ?? null;
    if (!container) return;

    const evaluate = () => {
      const overflow = container.scrollHeight - container.clientHeight;
      setVisible(overflow > 80 && container.scrollTop < 24);
    };

    evaluate();

    const onScroll = () => {
      if (container.scrollTop > 24) setVisible(false);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(evaluate);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const jump = () => {
    setVisible(false);
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div ref={anchorRef} aria-hidden={!visible}>
      {visible &&
      <button
        type="button"
        onClick={jump}
        dir="rtl"
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan-400/30 bg-[#08121c]/90 px-4 py-2.5 text-[12px] font-bold text-cyan-100 shadow-[0_12px_34px_-14px_rgba(34,211,238,0.75)] backdrop-blur-xl transition-transform hover:-translate-y-[1px] hover:border-cyan-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">

          <span>{label}</span>
          <ChevronDownIcon className="h-4 w-4 animate-bounce" aria-hidden />
        </button>
      }
    </div>);

}

export default ScrollCue;