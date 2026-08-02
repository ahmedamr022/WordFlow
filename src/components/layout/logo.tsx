interface LogoProps {
  /** height of the W mark in px */
  size?: number;
  /** show the "WordFlow" wordmark next to the mark */
  showWordmark?: boolean;
  className?: string;
}

/**
 * WordFlow brand lockup.
 * - Mark: a bold "W" drawn with a cyan → indigo → purple gradient stroke (no box).
 * - Wordmark: "Word" in white + "Flow" in a pink → red-orange gradient.
 */
export function Logo({ size = 30, showWordmark = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} dir="ltr">
      <svg
        width={size * 1.18}
        height={size}
        viewBox="0 0 48 40"
        fill="none"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 2px 10px rgba(56,189,248,0.35))" }}
      >
        <defs>
          <linearGradient id="wf-mark" x1="2" y1="4" x2="46" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4ff" />
            <stop offset="52%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#b14bff" />
          </linearGradient>
        </defs>
        <path
          d="M5 6 L15 34 L24 15 L33 34 L43 6"
          stroke="url(#wf-mark)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span
          className="font-extrabold tracking-tight leading-none"
          style={{ fontSize: size * 0.66 }}
        >
          <span className="text-white">Word</span>
          <span
            style={{
              background: "linear-gradient(90deg,#ff5c8a 0%,#ff4d5e 55%,#ff7a45 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Flow
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
