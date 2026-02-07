import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import PwaInstallPrompt from "./_components/PwaInstallPrompt";
import ServiceWorkerRegistrar from "./_components/ServiceWorkerRegistrar";
import SessionBootstrap from "./_components/SessionBootstrap";
import AppProviders from "./_components/AppProviders";
import { DM_Mono, Space_Grotesk } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeoBazaar - Nepal's AI-Powered Marketplace",
  description: "Buy, Rent, Auction, Exchange - Nepal's first AI-powered trusted marketplace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "ne" ? "ne" : "en";
  const themeCookie = cookieStore.get("theme")?.value;
  const theme = themeCookie === "festival" || themeCookie === "midnight" ? themeCookie : "default";

  return (
    <html lang={lang} data-theme={theme}>
      <body className={`${dmMono.variable} ${spaceGrotesk.variable} antialiased`}>
        <AppProviders>
          <ServiceWorkerRegistrar />
          <PwaInstallPrompt />
          <SessionBootstrap />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}