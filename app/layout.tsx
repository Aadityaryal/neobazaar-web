import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoBazaar - Nepal's AI-Powered Marketplace",
  description: "Buy, Rent, Auction, Exchange - Nepal's first AI-powered trusted marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}