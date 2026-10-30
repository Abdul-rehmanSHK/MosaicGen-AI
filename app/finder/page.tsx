import React from "react";
import { prisma } from "@/lib/prisma";
import { getCachedPageBySlug } from "@/lib/cache";
import { defaultFinderSteps } from "@/lib/finderDefaultData";
import { AestheticFinderWizard } from "@/components/finder/AestheticFinderWizard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseProductSpecs(specsStr: string | null | undefined) {
  try {
    return JSON.parse(specsStr || "{}");
  } catch {
    return {};
  }
}

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

  // Fetch active products from catalog as the single source of truth
  const products = await prisma.product.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
  });

  // Synchronize wizard style & space cards with real catalog products
  const synchronizedSteps = steps.map((step) => {
    if (step.key === "style") {
      const updatedOptions = step.options.map((opt) => {
        // Find matching product from catalog
        const matchingProduct = products.find((p) => {
          const specs = parseProductSpecs(p.specs);
          const pStyle = (specs.style || p.category || "").toLowerCase();
          const optVal = opt.value.toLowerCase();
          const optLabel = opt.label.toLowerCase();
          return pStyle.includes(optVal) || optVal.includes(pStyle) || pStyle.includes(optLabel);
        });

        if (matchingProduct?.sampleImageUrl) {
          return { ...opt, imageUrl: matchingProduct.sampleImageUrl };
        }
        return opt;
      });

      return { ...step, options: updatedOptions };
    }

    if (step.key === "space") {
      const updatedOptions = step.options.map((opt) => {
        const matchingProduct = products.find((p) => {
          const specs = parseProductSpecs(p.specs);
          const pSpace = (specs.space || "").toLowerCase();
          const pCategory = (p.category || "").toLowerCase();
          const optVal = opt.value.toLowerCase();
          return pSpace.includes(optVal) || optVal.includes(pSpace) || pCategory.includes(optVal);
        });

        if (matchingProduct?.sampleImageUrl) {
          return { ...opt, imageUrl: matchingProduct.sampleImageUrl };
        }
        return opt;
      });

      return { ...step, options: updatedOptions };
    }

    return step;
  });

  // Fetch AI generated mosaic designs from studio
  const rawGenerations = await prisma.aIGeneration.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      resultImageUrl: true,
      prompt: true,
      placement: true,
      userEmail: true,
      createdAt: true,
      status: true,
    },
  });

  const serializedGenerations = rawGenerations.map((g) => ({
    ...g,
    createdAt: g.createdAt.toISOString(),
  }));

  const pageContent = await getCachedPageBySlug("finder");

  return (
    <div className="min-h-screen bg-[#f4f3f2] text-stone-900 flex flex-col justify-between selection:bg-stone-300 selection:text-stone-900 relative">
      {/* Sitewide Navbar */}
      <Navbar />

      {/* Main Finder Wizard Area */}
      <main className="flex-1 py-8 sm:py-12 relative z-10">
        <AestheticFinderWizard
          initialSteps={synchronizedSteps}
          availableProducts={products}
          availableGenerations={serializedGenerations}
          pageContent={pageContent ? {
            heading: pageContent.heading,
            bodyText: pageContent.bodyText,
            badge: pageContent.secondaryText || "FIND YOUR AESTHETIC",
          } : undefined}
        />
      </main>

      {/* Sitewide Footer */}
      <Footer />
    </div>
  );
}
