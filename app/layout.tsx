import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Zakiah Mosaics | Bespoke Architectural Surface & Floor Studio",
  description: "Luxury handcrafted mosaic surface and floor design studio. Visualize bespoke Italian marble medallions, Byzantine gold glass, and artisanal tesserae live in your architectural spaces.",
  keywords: "Zakiah Mosaics, luxury mosaic, architectural surface studio, floor medallion, Italian marble mosaic, bespoke mosaic art",
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
