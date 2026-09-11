import React from "react";
import { prisma } from "@/lib/prisma";
import { defaultFinderSteps } from "@/lib/finderDefaultData";
import { AestheticFinderWizard } from "@/components/finder/AestheticFinderWizard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 0;

export default async function FinderPage() {
  let steps = await prisma.finderStep.findMany({
    orderBy: { order: "asc" },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Auto-seed if empty
  if (!steps || steps.length === 0) {
    try {
      for (const s of defaultFinderSteps) {
        const createdStep = await prisma.finderStep.create({
          data: {
            stepNumber: s.stepNumber,
            key: s.key,
            title: s.title,
            highlightWord: s.highlightWord,
            subtitle: s.subtitle,
            description: s.description,
            order: s.order,
          },
        });

        for (const opt of s.options) {
          await prisma.finderOption.create({
            data: {
              stepId: createdStep.id,
              label: opt.label,
              value: opt.value,
              imageUrl: opt.imageUrl,
              colorHex: opt.colorHex,
              order: opt.order,
            },
          });
        }
      }

      steps = await prisma.finderStep.findMany({
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      });
    } catch (err) {
      console.error("Auto-seeding finder steps error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 relative overflow-hidden">
      {/* Sitewide Background Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-gold-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sitewide Navbar */}
      <Navbar />

      {/* Main Finder Wizard Area */}
      <main className="flex-1 py-8 sm:py-12 relative z-10">
        <AestheticFinderWizard initialSteps={steps} />
      </main>

      {/* Sitewide Footer */}
      <Footer />
    </div>
  );
}
