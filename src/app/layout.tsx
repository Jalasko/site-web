import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Providers, themeInitScript } from "@/components/Providers";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ValoStats — Le hub VALORANT : joueurs pro, agents, armes, cartes & esport", template: "%s · ValoStats" },
  description:
    "ValoStats est le hub d'informations le plus complet sur VALORANT : statistiques des joueurs pro, agents, armes, cartes, tier lists, compositions, esport VCT et patch notes.",
  keywords: ["VALORANT", "joueurs pro", "tier list", "agents", "armes", "cartes", "VCT", "esport", "méta", "réticule", "crosshair"],
  openGraph: { type: "website", locale: "fr_FR", siteName: "ValoStats" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1923" },
    { media: "(prefers-color-scheme: light)", color: "#ECE8E1" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${bebas.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://media.valorant-api.com" />
      </head>
      <body className="min-h-screen">
        <Providers>
          <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
            Aller au contenu
          </a>
          <Navbar />
          <main id="contenu">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
