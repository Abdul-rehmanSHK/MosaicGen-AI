import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "MEC AI Mosaic | Bespoke Architectural Surface & Floor Studio",
  description: "Luxury AI-powered mosaic surface and floor design studio. Render custom Italian marble medallions, Byzantine gold glass, and waterjet patterns live in architectural spaces.",
  keywords: "mosaic design, AI mosaic generator, floor medallion, Italian marble, waterjet mosaic, architectural surfaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-obsidian-950 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
