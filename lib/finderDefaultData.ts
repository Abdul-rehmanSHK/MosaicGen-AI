export interface FinderOptionDefault {
  label: string;
  value: string;
  imageUrl?: string;
  colorHex?: string;
  order: number;
}

export interface FinderStepDefault {
  stepNumber: number;
  key: "style" | "shape" | "color" | "space" | "result";
  subtitle: string;
  title: string;
  highlightWord: string;
  description: string;
  order: number;
  options: FinderOptionDefault[];
}

export const defaultFinderSteps: FinderStepDefault[] = [
  {
    stepNumber: 1,
    key: "style",
    subtitle: "STEP 01 · STYLE",
    title: "Which mosaic style speaks to you?",
    highlightWord: "speaks to you?",
    description: "Tell us which mosaic style appeals to you the most.",
    order: 1,
    options: [
      {
        label: "Abstract",
        value: "abstract",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2025/10/Crimson-Mirage-Mosaic-796x1024.jpg",
        order: 1,
      },
      {
        label: "Geometric",
        value: "geometric",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2019/09/x1.-RIAD-.jpg",
        order: 2,
      },
      {
        label: "Floral",
        value: "floral",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2025/10/Geometric-Floral-Trellis-Mosaic.webp",
        order: 3,
      },
      {
        label: "Landscape",
        value: "landscape",
        imageUrl: "https://mecartworks.ae/wp-content/uploads/2026/02/Mosaic-Wall-Art-Tropical-theme-1024x737.webp",
        order: 4,
      },
      {
        label: "Portrait",
        value: "portrait",
        imageUrl: "https://mecartworks.ae/wp-content/uploads/2025/06/A-Mosaic-Portrait-1.webp",
        order: 5,
      },
      {
        label: "Animal",
        value: "animal",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2026/02/Emerald-Wildlife-Mosaic-Wall-1-1024x1024.webp",
        order: 6,
      },
    ],
  },
  {
    stepNumber: 2,
    key: "shape",
    subtitle: "STEP 02 · SHAPE",
    title: "Choose a shape for your space",
    highlightWord: "shape",
    description: "Art comes in different shapes to accentuate the mosaic piece itself. Which shape would you choose?",
    order: 2,
    options: [
      {
        label: "Rectangular landscape",
        value: "rect-landscape",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2023/07/mountain-handcut-mosaic-landscape-scenery-divider-wall-art.jpg",
        order: 1,
      },
      {
        label: "Round",
        value: "round",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2026/01/Starfish-Pool-Mosaic-Medallion-565x1024.webp",
        order: 2,
      },
      {
        label: "Square",
        value: "square",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2019/09/37-1.jpg",
        order: 3,
      },
      {
        label: "Rectangular portrait",
        value: "rect-portrait",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2022/12/Greek-Bougainvillea-wall-mosaic-artwork-handcut-glass-tile-curor-600x800.jpg",
        order: 4,
      },
      {
        label: "No preference",
        value: "any",
        order: 5,
      },
    ],
  },
  {
    stepNumber: 3,
    key: "color",
    subtitle: "STEP 03 · COLOR",
    title: "Pick a color story",
    highlightWord: "color story",
    description: "Mosaic art lives and breathes through colour. Pick the palette that feels right.",
    order: 3,
    options: [
      { label: "Black", value: "black", colorHex: "#1a1a1a", order: 1 },
      { label: "White", value: "white", colorHex: "#f5f1ea", order: 2 },
      { label: "Gold", value: "gold", colorHex: "#b58438", order: 3 },
      { label: "Silver", value: "silver", colorHex: "#b8bcc2", order: 4 },
      { label: "Blue", value: "blue", colorHex: "#152755", order: 5 },
      { label: "Teal", value: "teal", colorHex: "#1f8a8a", order: 6 },
      { label: "Green", value: "green", colorHex: "#2f5d3a", order: 7 },
      { label: "Purple", value: "purple", colorHex: "#5a3a7a", order: 8 },
      { label: "Pink / Coral", value: "pink", colorHex: "#d4756f", order: 9 },
      { label: "Yellow", value: "yellow", colorHex: "#d4a73c", order: 10 },
      { label: "Earth / Terracotta", value: "earth", colorHex: "#a8633f", order: 11 },
      { label: "Multicolor", value: "multicolor", colorHex: "linear-gradient(135deg, #b58438, #152755, #2f5d3a, #a8633f)", order: 12 },
    ],
  },
  {
    stepNumber: 4,
    key: "space",
    subtitle: "STEP 04 · SPACE",
    title: "Where will it live?",
    highlightWord: "live?",
    description: "The setting shapes the design. Tell us where this piece is going.",
    order: 4,
    options: [
      {
        label: "Wall",
        value: "wall",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2026/02/Emerald-Wildlife-Mosaic-Wall-1-1024x1024.webp",
        order: 1,
      },
      {
        label: "Floor",
        value: "floor",
        imageUrl: "https://mecartworks.ae/wp-content/uploads/2025/06/Baroque-Symphony-Mosaic-Floor.jpg",
        order: 2,
      },
      {
        label: "Pool",
        value: "pool",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2026/01/Starfish-Pool-Mosaic-Medallion-565x1024.webp",
        order: 3,
      },
      {
        label: "Backsplash",
        value: "backsplash",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2025/10/Amber-Dusk-Mosaic.jpg",
        order: 4,
      },
      {
        label: "Lobby",
        value: "lobby",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2025/05/juniper-table-marble-mosaic-entrance-banner.jpg",
        order: 5,
      },
      {
        label: "Outdoor",
        value: "outdoor",
        imageUrl: "https://mecartworks.com/wp-content/uploads/2025/09/Blog-Banner--1024x655.jpg",
        order: 6,
      },
    ],
  },
  {
    stepNumber: 5,
    key: "result",
    subtitle: "STEP 05 · RESULT",
    title: "Your mosaic",
    highlightWord: "mosaic",
    description: "Based on your taste, here's a one-of-a-kind design crafted for you.",
    order: 5,
    options: [],
  },
];
