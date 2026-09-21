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
  inputImageBase64?: string;
  maskBase64?: string;
  finish?: string;
  groutColor?: string;
  surfaceDetection?: {
    detected?: boolean;
    surfaceName?: string;
    box_2d?: [number, number, number, number] | number[];
    polygon?: [number, number][] | number[][];
    description?: string;
    confidence?: number;
    architecturalGuideline?: string;
  };
}

export interface GenerateMosaicResult {
  resultImageUrl: string;
  estimatedSqFt: number;
  estimatedTileCount: number;
  estimatedMaterialCost: number;
  promptApplied: string;
}

// Curated authentic luxury mosaic art pieces (Zakiah Mosaics bespoke portfolio & architectural installations)
const LUXURY_MOSAIC_PRESETS: Record<string, string[]> = {
  "Auto-detect": [
    "https://mecartworks.com/wp-content/uploads/2025/12/Medallion-Design-For-Gary-819x1024.webp",
    "https://mecartworks.com/wp-content/uploads/2025/10/Amber-Dusk-Mosaic.jpg",
    "https://mecartworks.ae/wp-content/uploads/2026/02/Mosaic-Wall-Art-Tropical-theme-1024x737.webp",
    "https://mecartworks.ae/wp-content/uploads/2025/06/Baroque-Symphony-Mosaic-Floor.jpg"
  ],
  "Floor Medallion": [
    "https://mecartworks.com/wp-content/uploads/2025/12/Medallion-Design-For-Gary-819x1024.webp",
    "https://mecartworks.ae/wp-content/uploads/2025/06/Baroque-Symphony-Mosaic-Floor.jpg",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80"
  ],
  "Backsplash": [
    "https://mecartworks.com/wp-content/uploads/2025/10/Amber-Dusk-Mosaic.jpg",
    "https://mecartworks.com/wp-content/uploads/2019/09/x1.-RIAD-.jpg",
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80"
  ],
  "Accent Wall": [
    "https://mecartworks.ae/wp-content/uploads/2026/02/Mosaic-Wall-Art-Tropical-theme-1024x737.webp",
    "https://mecartworks.com/wp-content/uploads/2025/10/Crimson-Mirage-Mosaic-796x1024.jpg",
    "https://mecartworks.com/wp-content/uploads/2026/02/Emerald-Wildlife-Mosaic-Wall-1-1024x1024.webp",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=80"
  ],
  "Pool": [
    "https://mecartworks.com/wp-content/uploads/2026/01/Starfish-Pool-Mosaic-Medallion-565x1024.webp",
    "https://mecartworks.com/wp-content/uploads/2026/02/Emerald-Wildlife-Mosaic-Wall-1-1024x1024.webp",
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1400&q=80"
  ],
  "Entryway": [
    "https://mecartworks.com/wp-content/uploads/2025/05/juniper-table-marble-mosaic-entrance-banner.jpg",
    "https://mecartworks.ae/wp-content/uploads/2025/06/Baroque-Symphony-Mosaic-Floor.jpg",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80"
  ]
};

const SURFACE_DETECTION_GUIDELINES: Record<string, string> = {
  "Auto-detect": "Analyze the room photo and automatically detect the most natural prominent architectural surface (such as the main floor plane, kitchen backsplash wall, bathroom wall, or patio ground). Seamlessly embed and inpaint the mosaic tile design onto that detected surface while keeping all other room architecture, lighting, and furniture intact.",
  "Floor Medallion": "Detect the primary floor plane in the room photo (such as the floor space in front of the bed, furniture, or entryway). Retain all walls, furniture, ceiling, and ambient lighting intact. Seamlessly inpaint and install an exquisite handcrafted architectural floor medallion mosaic tile artwork directly onto the floor plane in accurate floor perspective.",
  "Backsplash": "Detect the kitchen counter backsplash or bathroom vanity wall space (the vertical wall area directly above countertops, sinks, or behind ranges). Retain all cabinetry, countertops, fixtures, and appliances intact. Seamlessly inpaint an intricate architectural mosaic tile backsplash onto that wall surface.",
  "Accent Wall": "Detect the prominent architectural feature wall / main vertical accent wall in the room photo. Retain the room perspective, ceiling, floor, and furniture intact. Seamlessly inpaint a breathtaking luxury mosaic tile mural onto the accent wall.",
  "Pool": "Detect the swimming pool basin, pool floor, waterline edge, or surrounding wellness terrace. Retain all landscaping, water reflections, and architectural boundaries intact. Seamlessly inpaint an ultra-luxurious, moisture-grade architectural aquatic mosaic tile installation.",
  "Entryway": "Detect the entryway foyer floor, doorway threshold, or rotunda vestibule. Retain all entrance doors, arches, and structural columns intact. Seamlessly inpaint a grand entrance foyer mosaic rug or medallion in true floor perspective."
};

export const FINISH_ARCHITECTURAL_SPECS: Record<string, string> = {
  "Polished High-Gloss": "Ultra-reflective mirror polish, specular light highlights glistening on individual hand-cut tesserae chips, luminous glass and polished marble depth with reflective glaze.",
  "Satin Honed": "Soft-diffused elegant satin luster, zero glare, smooth velvety honed stone touch, refined matte architectural sheen that diffuses ambient room lighting smoothly.",
  "Antiqued Tumbled": "Weathered artisan edges, softened distressed corners, classical Roman tumbled texture with rich historical patina and slight textural height variations between tesserae.",
  "Textured Matte": "Natural tactile stone relief, cleft texture with rustic organic depth, non-reflective authentic artisan tilework with raw earthy appeal."
};

export const GROUT_ARCHITECTURAL_SPECS: Record<string, { promptSpec: string; hexColor: string; borderColor: string; highlightColor: string; opacity: number }> = {
  "Champagne Gold": {
    promptSpec: "Metallic luminous champagne gold grout lines with subtle warm glimmer framing each individual tile chip.",
    hexColor: "#D4AF37",
    borderColor: "#E5C378",
    highlightColor: "rgba(255, 235, 150, 0.45)",
    opacity: 0.95
  },
  "Pure Thassos White": {
    promptSpec: "Crisp, ultra-clean pure white minimalist grout lines providing sharp graphic definition and luminous high-contrast clarity.",
    hexColor: "#FFFFFF",
    borderColor: "#F0F4F8",
    highlightColor: "rgba(255, 255, 255, 0.65)",
    opacity: 0.98
  },
  "Charcoal Slate": {
    promptSpec: "Deep dramatic charcoal noir shadow grout joints creating dramatic depth, architectural shadow lines, and graphic delineation.",
    hexColor: "#1E2028",
    borderColor: "#2C303B",
    highlightColor: "rgba(90, 100, 120, 0.35)",
    opacity: 0.95
  },
  "Platinum Silver": {
    promptSpec: "Cool shimmering metallic silver grout joints reflecting ambient light with modern architectural elegance and subtle pearl iridescence.",
    hexColor: "#B0BEC5",
    borderColor: "#CFD8DC",
    highlightColor: "rgba(220, 230, 245, 0.55)",
    opacity: 0.92
  }
};

async function compositeMosaicOntoRoomPhoto(params: {
  inputImageBase64: string;
  placement: string;
  prompt: string;
  finish: string;
  groutColor: string;
  box_2d?: [number, number, number, number] | number[];
  referenceProductImageUrl?: string;
}): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const base64Data = params.inputImageBase64.includes(",")
      ? params.inputImageBase64.split(",")[1]
      : params.inputImageBase64;
    const imageBuffer = Buffer.from(base64Data, "base64");
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) return null;

    const box = params.box_2d || [380, 200, 750, 800];
    const top = Math.max(0, Math.round((box[0] / 1000) * metadata.height));
    const left = Math.max(0, Math.round((box[1] / 1000) * metadata.width));
    const height = Math.max(20, Math.round(((box[2] - box[0]) / 1000) * metadata.height));
    const width = Math.max(20, Math.round(((box[3] - box[1]) / 1000) * metadata.width));

    const pLower = params.prompt.toLowerCase();
    const isMoroccan = pLower.includes("zellige") || pLower.includes("moroccan") || pLower.includes("terracotta") || pLower.includes("indigo");
    const isGold = pLower.includes("gold") || pLower.includes("calacatta") || pLower.includes("baroque") || pLower.includes("sunburst");
    const isGreen = pLower.includes("emerald") || pLower.includes("deco") || pLower.includes("botanical");

    const tileColor1 = isMoroccan ? "#C86D51" : isGold ? "#D4AF37" : isGreen ? "#1B4D3E" : "#8A7968";
    const tileColor2 = isMoroccan ? "#264653" : isGold ? "#F3E5AB" : isGreen ? "#2E8B57" : "#4A5568";
    const tileColor3 = isMoroccan ? "#E9C46A" : isGold ? "#996515" : isGreen ? "#0D2818" : "#EDF2F7";

    // Surface finish styling parameters
    const finishKey = params.finish in FINISH_ARCHITECTURAL_SPECS ? params.finish : "Polished High-Gloss";
    const isHighGloss = finishKey === "Polished High-Gloss";
    const isTumbled = finishKey === "Antiqued Tumbled";
    const isMatte = finishKey === "Textured Matte";

    // Grout configuration
    const groutConfig = GROUT_ARCHITECTURAL_SPECS[params.groutColor] || GROUT_ARCHITECTURAL_SPECS["Champagne Gold"];
    const grout = groutConfig.hexColor;
    const groutBorder = groutConfig.borderColor;
    const groutHighlight = groutConfig.highlightColor;
    const groutOpacity = groutConfig.opacity;

    // Specular highlight opacity based on finish
    const specularOpacity = isHighGloss ? 0.65 : isTumbled ? 0.2 : isMatte ? 0.08 : 0.35;
    const tileRadius = isTumbled ? 4 : isMatte ? 1 : 2;

    let mosaicBuffer: Buffer = Buffer.alloc(0);
    let usedRealImage = false;

    // If a reference product mosaic artwork is provided, composite the actual authentic mosaic!
    if (params.referenceProductImageUrl) {
      try {
        let refBuffer: Buffer | null = null;
        if (params.referenceProductImageUrl.startsWith("data:image")) {
          refBuffer = Buffer.from(params.referenceProductImageUrl.split(",")[1], "base64");
        } else if (params.referenceProductImageUrl.startsWith("http")) {
          const res = await fetch(params.referenceProductImageUrl);
          if (res.ok) {
            refBuffer = Buffer.from(await res.arrayBuffer());
          }
        }
        if (refBuffer) {
          const resizedRef = await sharp(refBuffer)
            .resize(width, height, { fit: "cover" })
            .png()
            .toBuffer();

          const overlaySvg = `
          <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="vignette" cx="45%" cy="45%" r="55%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="${isHighGloss ? '0.35' : '0.1'}" />
                <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.0" />
                <stop offset="100%" stop-color="#000000" stop-opacity="${isHighGloss ? '0.35' : '0.2'}" />
              </radialGradient>
            </defs>
            <rect width="${width}" height="${height}" rx="6" fill="url(#vignette)" style="mix-blend-mode: overlay;" />
            <rect width="${width}" height="${height}" rx="6" fill="none" stroke="${groutBorder}" stroke-width="2.5" opacity="0.85" />
          </svg>
          `;
          const overlayBuffer = await sharp(Buffer.from(overlaySvg)).resize(width, height).png().toBuffer();

          mosaicBuffer = await sharp(resizedRef)
            .composite([{ input: overlayBuffer, blend: "over" }])
            .png()
            .toBuffer();
          usedRealImage = true;
        }
      } catch (err) {
        console.warn("[COMPOSITOR REAL IMAGE COMPOSITE NOTICE]:", err);
      }
    }

    if (!usedRealImage) {
      const svgPattern = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tesserae" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="${grout}" opacity="${groutOpacity}" />
            <rect x="2" y="2" width="13" height="13" rx="${tileRadius}" fill="${tileColor1}" stroke="${groutBorder}" stroke-width="0.75" />
            <rect x="17" y="2" width="13" height="13" rx="${tileRadius}" fill="${tileColor2}" stroke="${groutBorder}" stroke-width="0.75" />
            <rect x="2" y="17" width="13" height="13" rx="${tileRadius}" fill="${tileColor3}" stroke="${groutBorder}" stroke-width="0.75" />
            <rect x="17" y="17" width="13" height="13" rx="${tileRadius}" fill="${tileColor1}" stroke="${groutBorder}" stroke-width="0.75" />
            ${specularOpacity > 0.1 ? `
            <circle cx="6" cy="6" r="2.5" fill="#FFF" opacity="${specularOpacity}" />
            <circle cx="21" cy="21" r="2.5" fill="#FFF" opacity="${specularOpacity}" />
            <line x1="2" y1="2" x2="15" y2="2" stroke="${groutHighlight}" stroke-width="0.75" opacity="0.8" />
            ` : ''}
          </pattern>
          <radialGradient id="vignette" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="${isHighGloss ? '0.45' : '0.15'}" />
            <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="${isHighGloss ? '0.4' : '0.25'}" />
          </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" rx="6" fill="url(#tesserae)" />
        <rect width="${width}" height="${height}" rx="6" fill="url(#vignette)" style="mix-blend-mode: overlay;" />
        <rect width="${width}" height="${height}" rx="6" fill="none" stroke="${groutBorder}" stroke-width="3" opacity="0.9" />
      </svg>
      `;

      mosaicBuffer = await sharp(Buffer.from(svgPattern))
        .resize(width, height)
        .png()
        .toBuffer();
    }

    const composited = await sharp(imageBuffer)
      .composite([
        {
          input: mosaicBuffer,
          top,
          left,
          blend: "over",
        },
      ])
      .jpeg({ quality: 92 })
      .toBuffer();

    return `data:image/jpeg;base64,${composited.toString("base64")}`;
  } catch (err) {
    console.warn("[COMPOSITOR ERROR]:", err);
    return null;
  }
}

export async function processMosaicGeneration(
  params: GenerateMosaicParams
): Promise<GenerateMosaicResult> {
  const {
    prompt,
    placement,
    finish = "Polished High-Gloss",
    groutColor = "Champagne Gold",
    inputImageBase64
  } = params;

  const isRoomInpainting = Boolean(inputImageBase64 || params.inputImageUrl);
  const detectedGuideline = params.surfaceDetection?.architecturalGuideline
    ? `${params.surfaceDetection.description || ""}. ${params.surfaceDetection.architecturalGuideline}`
    : null;
  const surfaceGuideline = detectedGuideline || SURFACE_DETECTION_GUIDELINES[placement] || `Target and identify the ${placement} architectural feature in the room. Seamlessly inpaint the mosaic tile design into that area while retaining room structure.`;

  const finishDetail = FINISH_ARCHITECTURAL_SPECS[finish] || `${finish} finish`;
  const groutConfig = GROUT_ARCHITECTURAL_SPECS[groutColor] || GROUT_ARCHITECTURAL_SPECS["Champagne Gold"];
  const groutDetail = groutConfig.promptSpec;

  // Strict architectural mosaic prompt engineering:
  // Instruct AI to detect the specific surface and seamlessly inpaint the mosaic tile design into that area while retaining room structure.
  const fullPrompt = isRoomInpainting
    ? `[ARCHITECTURAL INPAINTING & SPACE VISUALIZATION] You are an elite architectural visualization AI. Look at the provided room photo. ${surfaceGuideline} The mosaic tile artwork must be: ${prompt}. Surface Finish Specification: ${finish} (${finishDetail}). Grout Line Specification: ${groutColor} (${groutDetail}). The mosaic must be laid in precise perspective matching the room's surface plane and ambient lighting, made of realistic hand-cut tesserae chips and detailed grout. Photorealistic 8k interior design rendering.`
    : `Ultra-luxurious handcrafted architectural mosaic tile installation, ${placement} placement. Surface finish: ${finish} (${finishDetail}). Grout Accent: ${groutColor} (${groutDetail}). Pure mosaic art made of hand-cut glass, marble, or ceramic tesserae tiles. Motif & artistic details: ${prompt}. Photorealistic 8k architectural rendering, high contrast, pristine artisan tilework detail, zero generic non-mosaic imagery.`;

  let resultImageUrl = "";

  // 1. Try Google Gemini Image Generation if GEMINI_API_KEY is configured
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    const geminiModel = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
    console.log("=======================================================");
    console.log(`[GEMINI AI PIPELINE] 🚀 Executing Gemini Image Generation (${geminiModel})...`);
    console.log("[GEMINI INPAINTING]:", isRoomInpainting ? "YES (Room Reference Provided)" : "NO (From Scratch)");
    console.log("[GEMINI PROMPT]:", fullPrompt);
    console.log("=======================================================");

    try {
      if (geminiModel.toLowerCase().includes("imagen")) {
        // Imagen 3 predict API
        const imagenRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:predict?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt: fullPrompt }],
              parameters: {
                sampleCount: 1,
                aspectRatio: "1:1",
              },
            }),
          }
        );

        const imagenData: any = await imagenRes.json();
        if (imagenRes.ok && imagenData.predictions?.[0]?.bytesBase64Encoded) {
          resultImageUrl = `data:image/png;base64,${imagenData.predictions[0].bytesBase64Encoded}`;
          console.log("[IMAGEN SUCCESS] ✅ Live Imagen 3 Mosaic Render Generated successfully!");
        } else {
          console.warn("[IMAGEN NOTICE]:", imagenData.error?.message || "Model response did not contain image data.");
        }
      } else {
        // Gemini multimodal image generation API (nano-banana-pro-preview, gemini-2.5-flash-image, etc.)
        const parts: any[] = [];

        // If user uploaded a room photo / reference image, supply as inline multimodal context
        if (inputImageBase64 && inputImageBase64.startsWith("data:image")) {
          const [header, base64Data] = inputImageBase64.split(",");
          const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }

        parts.push({
          text: `You are an elite architectural mosaic specialist. Based on the uploaded space photo: ${surfaceGuideline} Create an ultra-luxurious, handcrafted architectural mosaic tile installation strictly matching this design prompt: ${fullPrompt}. Must ONLY generate a true mosaic tile design composed of individual hand-cut tesserae chips and visible grout lines laid seamlessly onto the target surface.`,
        });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseModalities: ["IMAGE"],
              },
            }),
          }
        );

        const geminiData: any = await geminiRes.json();

        if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts) {
          const imagePart = geminiData.candidates[0].content.parts.find(
            (p: any) => p.inlineData?.data
          );
          if (imagePart) {
            resultImageUrl = `data:${imagePart.inlineData.mimeType || "image/png"};base64,${imagePart.inlineData.data}`;
            console.log("[GEMINI SUCCESS] ✅ Live Gemini Mosaic Render Generated successfully!");
          }
        } else {
          console.warn("[GEMINI NOTICE]:", geminiData.error?.message || "Model response did not contain image data.");
        }
      }
    } catch (geminiErr: any) {
      console.warn("[GEMINI WARNING] ⚠️ Call error:", geminiErr?.message || geminiErr);
    }
  }

  // 2. Fallback to OpenAI DALL-E 3 if available and Gemini didn't return an image
  if (!resultImageUrl && openai) {
    console.log("=======================================================");
    console.log("[OPENAI AI PIPELINE] 🚀 Executing DALL-E 3 Image Generation...");
    console.log("[OPENAI PROMPT]:", fullPrompt);
    console.log("=======================================================");
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      });

      if (response && response.data && response.data[0]?.url) {
        resultImageUrl = response.data[0].url;
        console.log("[OPENAI SUCCESS] ✅ Live DALL-E 3 image URL generated:", resultImageUrl);
      }
    } catch (err: any) {
      console.warn("[OPENAI WARNING] ⚠️ Quota or API limit reached:", err?.message || err);
    }
  }

  // 3. Fallback: If user uploaded a room photo, composite the bespoke mosaic into the detected surface boundary of their room
  if (!resultImageUrl && isRoomInpainting && inputImageBase64) {
    const composited = await compositeMosaicOntoRoomPhoto({
      inputImageBase64,
      placement,
      prompt,
      finish,
      groutColor,
      box_2d: params.surfaceDetection?.box_2d,
      referenceProductImageUrl: params.referenceProductImageUrl,
    });
    if (composited) {
      resultImageUrl = composited;
      console.log(`[MOSAIC PIPELINE] 🎨 Composited bespoke mosaic onto detected "${placement}" surface of user room photo!`);
    }
  }

  // 4. Fallback: If user selected an authentic reference mosaic design, serve that design!
  if (!resultImageUrl && params.referenceProductImageUrl) {
    resultImageUrl = params.referenceProductImageUrl;
    console.log(`[MOSAIC PIPELINE] 🎨 Served selected authentic mosaic design '${params.referenceProductTitle || params.placement}'!`);
  }

  // 5. Fallback: Curated authentic mosaic tile artworks based strictly on the user's prompt & placement
  if (!resultImageUrl) {
    const pLower = prompt.toLowerCase();
    // If prompt is Moroccan Zellige / Terracotta / Indigo in bedroom/floor/backsplash space:
    if (
      (pLower.includes("zellige") || pLower.includes("moroccan") || pLower.includes("terracotta") || pLower.includes("indigo")) &&
      (placement.toLowerCase().includes("floor") || placement === "Backsplash" || isRoomInpainting)
    ) {
      if (placement === "Backsplash") {
        resultImageUrl = "https://mecartworks.com/wp-content/uploads/2019/09/x1.-RIAD-.jpg";
      } else {
        resultImageUrl = "/images/moroccan-zellige-bedroom-render.jpg";
      }
      console.log(`[MOSAIC PIPELINE] 🎨 Served authentic Moroccan Zellige render for '${placement}'!`);
    } else {
      const key = placement in LUXURY_MOSAIC_PRESETS ? placement : "Floor Medallion";
      const presets = LUXURY_MOSAIC_PRESETS[key] || LUXURY_MOSAIC_PRESETS["Floor Medallion"];
      const hash = Math.abs(hashString(prompt + placement + finish + groutColor));
      const selectedIndex = hash % presets.length;
      resultImageUrl = presets[selectedIndex];
      console.log(`[MOSAIC PIPELINE] 🎨 Served prompt-curated authentic mosaic design #${selectedIndex + 1} for '${placement}'`);
    }
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
    promptApplied: fullPrompt,
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
