/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070e',
          900: '#080b14',
          850: '#0b0f1c',
          800: '#121a2b',
          700: '#1a2337',
        },
        brand: {
          teal: '#2de2c5',
          mint: '#5bf0d6',
          cyan: '#00f2fe',
          purple: '#7c6cff',
          violet: '#8b5cf6',
          pink: '#ff4d7a',
          coral: '#ff6b6b',
          gold: '#fbbf24',
        },
      },
      fontFamily: {
        ar: ['Readex Pro', 'Cairo', 'system-ui', 'sans-serif'],
        en: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 40px -24px rgba(0,0,0,0.9)',
        panel: '-24px 0 60px -20px rgba(0,0,0,0.75)',
        'glow-purple': '0 12px 40px -12px rgba(124,108,255,0.55)',
        'glow-teal': '0 12px 40px -12px rgba(45,226,197,0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
