import type { Metadata } from "next";
import { Inter, Outfit, Readex_Pro, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const readexPro = Readex_Pro({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex-pro",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WordFlow — تعلم الإنجليزية سطرًا بسطر",
  description:
    "منصة تعلم الإنجليزية التفاعلية الرائدة. اقرأ واكتب قصصاً حقيقية سطر بسطر مع نطق أمريكي وشرح قواعد بـ Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${inter.variable} ${outfit.variable} ${readexPro.variable} ${ibmPlexArabic.variable}`}
    >
      <body className="antialiased bg-[#05070E] text-white font-sans">
        {children}
      </body>
    </html>
  );
}