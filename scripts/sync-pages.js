const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Upserting the 3 primary studio pages in Prisma...");

  // 1. Customize your space (/)
  const page1 = await prisma.page.upsert({
    where: { slug: "customize-space" },
    update: {
      title: "Customize your space",
      templateType: "studio_home",
      heading: "AI Mosaic Studio",
      bodyText: "Upload a photo of your space — see a bespoke mosaic rendered into it.",
      secondaryText: "CUSTOMIZE YOUR SPACE",
    },
    create: {
      title: "Customize your space",
      slug: "customize-space",
      templateType: "studio_home",
      heading: "AI Mosaic Studio",
      bodyText: "Upload a photo of your space — see a bespoke mosaic rendered into it.",
      secondaryText: "CUSTOMIZE YOUR SPACE",
    },
  });
  console.log("Page 1 updated/created:", page1.slug, "=>", page1.heading);

  // 2. Imagine from scratch (/from-scratch)
  const page2 = await prisma.page.upsert({
    where: { slug: "from-scratch" },
    update: {
      title: "Imagine from scratch",
      templateType: "studio_scratch",
      heading: "Generative Architectural Mosaic Studio",
      bodyText: "Articulate your architectural vision — synthesize bespoke, artisan-grade mosaic concepts in authentic Italian marble, Venetian smalti, and 24k gold leaf.",
      secondaryText: "IMAGINE FROM SCRATCH",
    },
    create: {
      title: "Imagine from scratch",
      slug: "from-scratch",
      templateType: "studio_scratch",
      heading: "Generative Architectural Mosaic Studio",
      bodyText: "Articulate your architectural vision — synthesize bespoke, artisan-grade mosaic concepts in authentic Italian marble, Venetian smalti, and 24k gold leaf.",
      secondaryText: "IMAGINE FROM SCRATCH",
    },
  });
  console.log("Page 2 updated/created:", page2.slug, "=>", page2.heading);

  // 3. Find your aesthetic (/finder)
  const page3 = await prisma.page.upsert({
    where: { slug: "finder" },
    update: {
      title: "Find your aesthetic",
      templateType: "studio_finder",
      heading: "Mosaic Aesthetic Studio",
      bodyText: "Answer concise design preferences to formulate an original bespoke mosaic concept tailored to your architectural space.",
      secondaryText: "FIND YOUR AESTHETIC",
    },
    create: {
      title: "Find your aesthetic",
      slug: "finder",
      templateType: "studio_finder",
      heading: "Mosaic Aesthetic Studio",
      bodyText: "Answer concise design preferences to formulate an original bespoke mosaic concept tailored to your architectural space.",
      secondaryText: "FIND YOUR AESTHETIC",
    },
  });
  console.log("Page 3 updated/created:", page3.slug, "=>", page3.heading);

  const allPages = await prisma.page.findMany();
  console.log("All pages now in DB:", allPages.map(p => ({ title: p.title, slug: p.slug, heading: p.heading })));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

