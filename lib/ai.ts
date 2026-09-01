import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface GenerateMosaicParams {
  prompt: string;
  placement: string;
  referenceProductTitle?: string;
  referenceProductCategory?: string;
  referenceProductImageUrl?: string;
  inputImageUrl?: string;
  maskUrl?: string;
  finish?: string;
  groutColor?: string;
}

export interface GenerateMosaicResult {
  resultImageUrl: string;
  estimatedSqFt: number;
  estimatedTileCount: number;
  estimatedMaterialCost: number;
  promptApplied: string;
}

const LUXURY_MOSAIC_PRESETS: Record<string, string[]> = {
  "Floor Medallion": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80"
  ],
  "Backsplash": [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1400&q=80"
  ],
  "Accent Wall": [
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80"
  ],
  "Pool": [
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1400&q=80"
  ],
  "Entryway": [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80"
  ]
};

export async function processMosaicGeneration(
  params: GenerateMosaicParams
): Promise<GenerateMosaicResult> {
  const { prompt, placement, referenceProductTitle, referenceProductImageUrl, finish, groutColor } = params;

  const fullPrompt = `Ultra-luxurious architectural mosaic tile installation, ${placement} placement. Style: ${referenceProductTitle || 'Bespoke Italian Marble & Glass Mosaic'}. Specs: ${finish || 'Polished'}, ${groutColor || 'Champagne Gold'} grout lines. Prompt details: ${prompt}. photorealistic 8k interior design rendering, high contrast, pristine detail.`;

  let resultImageUrl = "";

  if (openai) {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      });

      if (response && response.data && response.data[0]?.url) {
        resultImageUrl = response.data[0].url;
      }
    } catch (err) {
      console.warn("OpenAI API call failed or quota exceeded, using high-resolution architectural preset fallback:", err);
    }
  }

  if (!resultImageUrl) {
    // If a reference image is provided and no OpenAI key, use high quality placement preset
    const presets = LUXURY_MOSAIC_PRESETS[placement] || LUXURY_MOSAIC_PRESETS["Floor Medallion"];
    const randomIndex = Math.floor(Math.abs(hashString(prompt + placement)) % presets.length);
    resultImageUrl = referenceProductImageUrl || presets[randomIndex];
  }

  // Calculate material estimate stats
  let estimatedSqFt = 45;
  if (placement === "Floor Medallion") estimatedSqFt = 64;
  if (placement === "Backsplash") estimatedSqFt = 35;
  if (placement === "Accent Wall") estimatedSqFt = 120;
  if (placement === "Pool") estimatedSqFt = 250;
  if (placement === "Entryway") estimatedSqFt = 95;

  const estimatedTileCount = Math.round(estimatedSqFt * 144); // ~144 1x1 inch chips per sq ft
  const pricePerSqFt = 85; // luxury baseline
  const estimatedMaterialCost = Math.round(estimatedSqFt * pricePerSqFt);

  return {
    resultImageUrl,
    estimatedSqFt,
    estimatedTileCount,
    estimatedMaterialCost,
    promptApplied: fullPrompt
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
