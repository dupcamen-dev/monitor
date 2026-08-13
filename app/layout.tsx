import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeScript } from "@/components/theme-script";
import { ThemeHydration } from "@/components/theme-hydration";
import { TrackVisit } from "@/components/track-visit";
import { CookieBanner } from "@/components/cookie-banner";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "TopStatus — Monitoring & Status Pages",
    template: "%s · TopStatus",
  },
  description:
    "Uptime monitoring and status pages in one place. Get reliable monitoring and beautiful status pages without overpaying.",
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <head>
        <ThemeScript />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-body-sm text-on-surface antialiased">
        <ToastProvider>
          <ThemeHydration />
          <TrackVisit />
          <CookieBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
