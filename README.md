# 🌊 WordFlow

> **Master English through Interactive Typing, Smart Audio, and AI-Powered Learning.**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-DB_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

WordFlow is a premium AI-powered English learning platform designed specifically for Arabic speakers (with multi-language support coming soon). Inspired by the simplicity of linebyline.cc but supercharged with modern pedagogical tools, WordFlow combines interactive story typing, synchronized high-quality American English audio, AI-driven explanations, and spaced repetition (FSRS) to create an immersive language acquisition experience.

## ✨ Key Features

- **⌨️ Interactive Story Typing**: Character-by-character validation engine with hidden inputs for native-like performance.
- **🎧 Smart Synchronized Audio**: On-demand, high-quality American English TTS (powered by Kokoro) with intelligent caching.
- **🧠 AI Grammar & Vocab Tutors**: Context-aware explanations powered by Google Gemini, grounded in a robust vocabulary database.
- **📈 FSRS Spaced Repetition**: State-of-the-art vocabulary review algorithm to ensure long-term retention.
- **🎯 Adaptive Placement Tests**: Automatically calibrates learners to the correct CEFR level (A1-B2).
- **🏆 Gamified Dashboard**: XP, streaks, levels, daily goals, and heatmaps to keep learners engaged.
- **🌙 Premium Dark-First UI**: Beautiful, accessible, and distraction-free learning environment.

## 📸 Screenshots

*(Placeholders for future screenshots)*

| Dashboard | Typing Interface | AI Explanations |
| :---: | :---: | :---: |
| ![Dashboard](./docs/assets/dashboard-placeholder.png) | ![Typing](./docs/assets/typing-placeholder.png) | ![AI](./docs/assets/ai-placeholder.png) |

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 14+ (App Router), React, TypeScript | Core application framework |
| **Styling & UI** | Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion | Design system, animations, accessibility |
| **Backend / DB** | Supabase (PostgreSQL, Auth, Storage, RLS) | Database, authentication, audio storage |
| **AI Services** | Google Gemini 1.5 Flash/Pro | Contextual grammar and vocabulary explanations |
| **Text-to-Speech** | Kokoro TTS (af_heart, af_bella, am_adam) | High-quality American English audio generation |
| **Spaced Repetition**| ts-fsrs (FSRS-4.5) | Vocabulary review algorithm |
| **Forms & Validation**| React Hook Form, Zod | Robust data entry and type safety |
| **Testing** | Vitest, Playwright | Unit and end-to-end testing |
| **Analytics & Logging**| PostHog, Sentry | User behavior tracking and error monitoring |
| **Deployment** | Vercel | Hosting and CI/CD |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.17.0 or higher)
- pnpm (recommended) or npm/yarn
- Supabase CLI (optional, for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wordflow.git
   cd wordflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Copy the example environment file and fill in your credentials.
   ```bash
   cp .env.example .env.local
   ```
   *Required Variables:*
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `KOKORO_API_URL`

4. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```text
wordflow/
├── docs/                # Project documentation
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages and layouts
│   ├── components/      # Reusable React components (shadcn/ui + custom)
│   ├── lib/             # Utility functions, Supabase clients, FSRS logic
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Global state management (Zustand)
│   ├── types/           # TypeScript definitions
│   └── actions/         # Next.js Server Actions
├── supabase/            # Supabase migrations and configuration
└── ...config files
```

## 📚 Documentation links

For deep dives into the project architecture and guidelines, please refer to the following documents:
- [START_PROMPT.md](./docs/START_PROMPT.md) - The Golden Prompt and AI coding guidelines.
- [01_PRODUCT_REQUIREMENTS.md](./docs/01_PRODUCT_REQUIREMENTS.md) - Complete PRD, personas, and feature matrix.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes all linting (`pnpm lint`) and tests (`pnpm test`) before submitting.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [linebyline.cc](https://linebyline.cc) for the original interactive typing inspiration.
- The creators of [Kokoro TTS](https://github.com/hexgrad/kokoro) for making incredible open-source audio available.
- [shadcn](https://ui.shadcn.com/) for the foundational UI components.