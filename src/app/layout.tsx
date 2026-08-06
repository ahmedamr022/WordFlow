import type { Metadata, Viewport } from "next";
import {
  Inter,
  Outfit,
  Readex_Pro,
  IBM_Plex_Sans_Arabic,
  Cairo,
  Plus_Jakarta_Sans } from
"next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

/**
 * Six families is a lot. Only the two families actually used for body copy
 * (Readex Pro for Arabic, Outfit for Latin) are preloaded; the rest are
 * loaded lazily when a component references their CSS variable.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

const readexPro = Readex_Pro({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex-pro",
  display: "swap"
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
  preload: false
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
  preload: false
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: false
});

const siteUrl =
process.env.NEXT_PUBLIC_SITE_URL ?? (
process.env.VERCEL_PROJECT_PRODUCTION_URL ?
`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` :
"http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WordFlow — تعلم الإنجليزية سطرًا بسطر",
    template: "%s"
  },
  description: "منصة تعلم الإنجليزية التفاعلية الرائدة.",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "WordFlow",
    title: "WordFlow — تعلم الإنجليزية سطرًا بسطر",
    description: "منصة تعلم الإنجليزية التفاعلية الرائدة."
  }
};

export const viewport: Viewport = {
  themeColor: "#05070e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${inter.variable} ${outfit.variable} ${readexPro.variable} ${ibmPlexArabic.variable} ${cairo.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning>
      
      <body className="bg-background font-cairo text-foreground antialiased">
        {children}
        <Analytics />
      </body>
    </html>);

}