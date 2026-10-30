export interface DefaultStudioPage {
  title: string;
  slug: string;
  templateType: string;
  heading: string;
  bodyText: string;
  secondaryText: string;
}

export const DEFAULT_STUDIO_PAGES: DefaultStudioPage[] = [
  {
    title: "Customize your space",
    slug: "customize-space",
    templateType: "studio_home",
    heading: "AI Mosaic Studio",
    bodyText: "Upload a photo of your space — see a bespoke mosaic rendered into it.",
    secondaryText: "CUSTOMIZE YOUR SPACE",
  },
  {
    title: "Imagine from scratch",
    slug: "from-scratch",
    templateType: "studio_scratch",
    heading: "Generative Architectural Mosaic Studio",
    bodyText: "Articulate your architectural vision — synthesize bespoke, artisan-grade mosaic concepts in authentic Italian marble, Venetian smalti, and 24k gold leaf.",
    secondaryText: "IMAGINE FROM SCRATCH",
  },
  {
    title: "Find your aesthetic",
    slug: "finder",
    templateType: "studio_finder",
    heading: "Mosaic Aesthetic Studio",
    bodyText: "Answer concise design preferences to formulate an original bespoke mosaic concept tailored to your architectural space.",
    secondaryText: "FIND YOUR AESTHETIC",
  },
];
