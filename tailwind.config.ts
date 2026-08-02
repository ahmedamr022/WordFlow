import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Deep navy canvas (matches new landing design) */
        background: "#0B1220",
        surface: {
          DEFAULT: "#121A2B",
          soft: "#16203400",
          elevated: "#1A2438",
        },
        card: {
          DEFAULT: "#111A2A",
          elevated: "#182236",
        },
        /* Neon brand palette */
        brand: {
          teal: "#2DE2C5",
          mint: "#5BF0D6",
          coral: "#FF6B6B",
          rose: "#FF8E8E",
        },
        primary: {
          DEFAULT: "#2DE2C5",
          teal: "#2DE2C5",
          coral: "#FF6B6B",
          peach: "#FFA07A",
        },
        secondary: {
          DEFAULT: "#FF6B6B",
          coral: "#FF6B6B",
        },
        accent: {
          cyan: "#00F2FE",
          emerald: "#2ECC71",
        },
        muted: {
          DEFAULT: "#6B7896",
          text: "#9AA7C0",
        },
        border: "#20293D",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-inter)", "sans-serif"],
        arabic: [
          "var(--font-readex-pro)",
          "var(--font-ibm-plex-arabic)",
          "sans-serif",
        ],
      },
      boxShadow: {
        "neon-teal":
          "0 0 0 1px rgba(45,226,197,0.5), 0 0 22px rgba(45,226,197,0.35), inset 0 0 18px rgba(45,226,197,0.12)",
        "neon-coral":
          "0 0 0 1px rgba(255,107,107,0.5), 0 0 22px rgba(255,107,107,0.35), inset 0 0 18px rgba(255,107,107,0.12)",
        "soft-lg": "0 24px 60px -18px rgba(0,0,0,0.65)",
      },
      keyframes: {
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 50%" },
          "100%": { backgroundPosition: "-200% 50%" },
        },
      },
      animation: {
        "float-y": "float-y 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 4s ease-in-out infinite",
        "spin-slow": "spin-slow 26s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
