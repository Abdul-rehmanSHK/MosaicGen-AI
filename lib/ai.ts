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

function parsePromptAndStyle(prompt: string, placement: string) {
  const p = (prompt || "").toLowerCase();

  // 1. Color Palette Detection
  let primaryColors = ["#48CAE4", "#0096C7", "#0077B6", "#90E0EF", "#00B4D8"]; // Default Sea-Glass Cyan
  let accentColor = "#CAF0F8";
  let metallicColor = "#A0E7E5";
  let themeName = "Iridescent Sea-Glass";

  if (p.includes("zellige") || p.includes("moroccan") || p.includes("terracotta") || p.includes("saffron") || p.includes("marrakech")) {
    primaryColors = ["#C86D51", "#E76F51", "#F4A261", "#E9C46A", "#264653"];
    accentColor = "#2A9D8F";
    metallicColor = "#E9C46A";
    themeName = "Moroccan Terracotta";
  } else if (p.includes("gold") || p.includes("calacatta") || p.includes("brass") || p.includes("sunburst") || p.includes("medallion") || p.includes("baroque")) {
    primaryColors = ["#D4AF37", "#F3E5AB", "#C5A059", "#B8860B", "#FDFBF7"];
    accentColor = "#996515";
    metallicColor = "#FFD700";
    themeName = "Calacatta Gold";
  } else if (p.includes("emerald") || p.includes("botanical") || p.includes("jade") || p.includes("forest") || p.includes("green") || p.includes("deco")) {
    primaryColors = ["#1B4D3E", "#2E8B57", "#52796F", "#354F52", "#84A98C"];
    accentColor = "#D4AF37";
    metallicColor = "#C5A059";
    themeName = "Emerald Botanical";
  } else if (p.includes("lapis") || p.includes("blue") || p.includes("azure") || p.includes("cobalt") || p.includes("navy") || p.includes("sapphire")) {
    primaryColors = ["#1E3A8A", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA"];
    accentColor = "#D4AF37";
    metallicColor = "#F3E5AB";
    themeName = "Lapis Lazuli";
  } else if (p.includes("noir") || p.includes("black") || p.includes("charcoal") || p.includes("marquina") || p.includes("monochrome") || p.includes("slate")) {
    primaryColors = ["#18181B", "#27272A", "#3F3F46", "#F4F4F5", "#A1A1AA"];
    accentColor = "#E4E4E7";
    metallicColor = "#D4AF37";
    themeName = "Nero Marquina";
  } else if (p.includes("ruby") || p.includes("rose") || p.includes("burgundy") || p.includes("wine") || p.includes("copper")) {
    primaryColors = ["#9F1239", "#BE123C", "#E11D48", "#FB7185", "#881337"];
    accentColor = "#FDA4AF";
    metallicColor = "#FFD700";
    themeName = "Venetian Ruby";
  } else if (p.includes("sea-glass") || p.includes("wave") || p.includes("ocean") || p.includes("aqua") || p.includes("teal") || p.includes("cyan") || p.includes("water") || p.includes("ripple")) {
    primaryColors = ["#48CAE4", "#0096C7", "#0077B6", "#90E0EF", "#00B4D8"];
    accentColor = "#CAF0F8";
    metallicColor = "#A0E7E5";
    themeName = "Iridescent Sea-Glass";
  }

  // 2. Motif / Pattern Detection
  let motif = "wave";
  if (p.includes("medallion") || p.includes("sunburst") || p.includes("radial") || p.includes("rosette") || placement === "Floor Medallion") {
    motif = "medallion";
  } else if (p.includes("zellige") || p.includes("moroccan") || p.includes("star") || p.includes("arabesque")) {
    motif = "zellige";
  } else if (p.includes("herringbone") || p.includes("chevron")) {
    motif = "herringbone";
  } else if (p.includes("wave") || p.includes("flowing") || p.includes("ocean") || p.includes("water") || p.includes("ripple") || p.includes("sea")) {
    motif = "wave";
  } else if (p.includes("geometric") || p.includes("diamond")) {
    motif = "geometric";
  } else {
    motif = placement === "Floor Medallion" ? "medallion" : "wave";
  }

  return { primaryColors, accentColor, metallicColor, themeName, motif };
}

function generateArtisanMosaicSvg(
  width: number,
  height: number,
  styles: ReturnType<typeof parsePromptAndStyle>,
  finish: string,
  groutHex: string,
  groutBorder: string
): string {
  const { primaryColors, accentColor, metallicColor, motif } = styles;
  const isHighGloss = finish === "Polished High-Gloss";
  const isTumbled = finish === "Antiqued Tumbled";
  const rx = isTumbled ? 4 : 1.5;

  const elements: string[] = [];

  if (motif === "wave") {
    // Flowing sinusoidal currents of hand-cut tesserae chips (Opus Vermiculatum)
    const tileSize = Math.max(16, Math.min(26, Math.round(width / 35)));
    const waveFreq = 0.012;
    const waveAmp = 28;

    for (let y = -tileSize; y < height + tileSize * 2; y += tileSize) {
      const rowIdx = Math.floor(y / tileSize);
      for (let x = -tileSize; x < width + tileSize; x += tileSize) {
        const waveOffset = Math.sin(x * waveFreq + rowIdx * 0.35) * waveAmp;
        const curY = y + waveOffset;
        if (curY < -tileSize || curY > height + tileSize) continue;

        const bandIdx = Math.abs(Math.floor((y + waveOffset * 1.4) / 40)) % primaryColors.length;
        const isAccent = (x * 7 + y * 3) % 19 === 0;
        const col = isAccent ? metallicColor : primaryColors[bandIdx];

        // Hand-cut organic jitter
        const jx = ((x * 17 + y * 11) % 5) - 2;
        const jy = ((x * 11 + y * 17) % 5) - 2;
        const w = tileSize - 3.2;
        const h = tileSize - 3.2;

        elements.push(`
          <rect x="${x + jx}" y="${curY + jy}" width="${w}" height="${h}" rx="${rx}"
                fill="${col}" stroke="${groutBorder}" stroke-width="0.75" />
          ${isHighGloss ? `<circle cx="${x + jx + 4}" cy="${curY + jy + 4}" r="1.8" fill="#FFFFFF" opacity="0.45" />` : ''}
        `);
      }
    }
  } else if (motif === "medallion") {
    // Concentric radial opus sectile rings
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.max(width, height) * 0.75;
    const ringSpacing = Math.max(16, Math.min(24, Math.round(width / 40)));

    for (let r = 8; r < maxRadius; r += ringSpacing) {
      const circumference = 2 * Math.PI * r;
      const chipSize = ringSpacing - 3;
      const count = Math.max(8, Math.floor(circumference / (ringSpacing + 1)));
      const ringIdx = Math.floor(r / ringSpacing);
      const ringColor = primaryColors[ringIdx % primaryColors.length];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const tx = cx + Math.cos(angle) * r;
        const ty = cy + Math.sin(angle) * r;

        if (tx < -30 || tx > width + 30 || ty < -30 || ty > height + 30) continue;

        const deg = (angle * 180) / Math.PI;
        const isSpecial = (i % 6 === 0 && ringIdx % 2 === 0);
        const col = isSpecial ? metallicColor : ringColor;

        elements.push(`
          <rect x="${tx - chipSize / 2}" y="${ty - chipSize / 2}" width="${chipSize}" height="${chipSize}" rx="${rx}"
                transform="rotate(${deg} ${tx} ${ty})"
                fill="${col}" stroke="${groutBorder}" stroke-width="0.75" />
          ${isHighGloss ? `<circle cx="${tx - 2}" cy="${ty - 2}" r="1.6" fill="#FFF" opacity="0.4" />` : ''}
        `);
      }
    }
  } else if (motif === "zellige") {
    // Moroccan geometric 8-point stars and interlocking tesserae
    const tileSize = Math.max(22, Math.min(32, Math.round(width / 25)));
    for (let y = 0; y < height + tileSize; y += tileSize) {
      const row = Math.floor(y / tileSize);
      for (let x = 0; x < width + tileSize; x += tileSize) {
        const col = Math.floor(x / tileSize);
        const isStarCenter = (row + col) % 2 === 0;
        const color = isStarCenter ? primaryColors[0] : primaryColors[(row + col) % primaryColors.length];

        elements.push(`
          <rect x="${x + 2}" y="${y + 2}" width="${tileSize - 4}" height="${tileSize - 4}" rx="${rx}"
                transform="rotate(${isStarCenter ? 45 : 0} ${x + tileSize / 2} ${y + tileSize / 2})"
                fill="${color}" stroke="${groutBorder}" stroke-width="0.9" />
          ${isStarCenter ? `<circle cx="${x + tileSize / 2}" cy="${y + tileSize / 2}" r="2.8" fill="${metallicColor}" opacity="0.9" />` : ''}
        `);
      }
    }
  } else {
    // Classic staggered Opus Tessellatum brickwork
    const tileW = Math.max(18, Math.min(28, Math.round(width / 32)));
    const tileH = Math.max(18, Math.min(28, Math.round(width / 32)));

    for (let y = 0; y < height + tileH; y += tileH) {
      const row = Math.floor(y / tileH);
      const offsetX = (row % 2 === 0) ? 0 : tileW / 2;
      for (let x = -tileW; x < width + tileW; x += tileW) {
        const colIdx = Math.abs((x * 5 + y * 13)) % primaryColors.length;
        const color = primaryColors[colIdx];
        const isAccent = (x + y) % 8 === 0;
        const finalColor = isAccent ? metallicColor : color;

        elements.push(`
          <rect x="${x + offsetX + 1.5}" y="${y + 1.5}" width="${tileW - 3}" height="${tileH - 3}" rx="${rx}"
                fill="${finalColor}" stroke="${groutBorder}" stroke-width="0.75" />
          ${isHighGloss ? `<circle cx="${x + offsetX + 5}" cy="${y + 5}" r="1.8" fill="#FFF" opacity="0.4" />` : ''}
        `);
      }
    }
  }

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="specularGleam" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="${isHighGloss ? '0.35' : '0.1'}" />
        <stop offset="65%" stop-color="#FFFFFF" stop-opacity="0.0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="${isHighGloss ? '0.32' : '0.15'}" />
      </radialGradient>
      <filter id="tileRelief">
        <feDropShadow dx="0.5" dy="0.8" stdDeviation="0.6" flood-color="#000000" flood-opacity="0.22" />
      </filter>
    </defs>
    <!-- Grout Matrix Bed -->
    <rect width="${width}" height="${height}" fill="${groutHex}" />
    <!-- Hand-cut Tesserae Layer -->
    <g filter="url(#tileRelief)">
      ${elements.join('\n')}
    </g>
    <!-- Architectural Light & Specular Vignette -->
    <rect width="${width}" height="${height}" fill="url(#specularGleam)" style="mix-blend-mode: overlay;" />
  </svg>
  `;
}

async function compositeMosaicOntoRoomPhoto(params: {
  inputImageBase64: string;
  maskBase64?: string;
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

    const imgWidth = metadata.width;
    const imgHeight = metadata.height;

    const finishKey = params.finish in FINISH_ARCHITECTURAL_SPECS ? params.finish : "Polished High-Gloss";
    const isHighGloss = finishKey === "Polished High-Gloss";
    const groutConfig = GROUT_ARCHITECTURAL_SPECS[params.groutColor] || GROUT_ARCHITECTURAL_SPECS["Champagne Gold"];
    const grout = groutConfig.hexColor;
    const groutBorder = groutConfig.borderColor;

    const styles = parsePromptAndStyle(params.prompt, params.placement);

    // =========================================================================
    // CASE A: User painted an inpainting mask (strict mask-guided composite)
    // =========================================================================
    if (params.maskBase64) {
      console.log("[COMPOSITOR] 🎨 Synthesizing full-resolution mosaic texture for inpainting mask...");
      
      let mosaicBuffer: Buffer = Buffer.alloc(0);
      let usedRealImage = false;

      // If user selected an authentic reference product, resize that product texture
      if (params.referenceProductImageUrl) {
        try {
          let refBuffer: Buffer | null = null;
          if (params.referenceProductImageUrl.startsWith("data:image")) {
            refBuffer = Buffer.from(params.referenceProductImageUrl.split(",")[1], "base64");
          } else if (params.referenceProductImageUrl.startsWith("http")) {
            const res = await fetch(params.referenceProductImageUrl);
            if (res.ok) refBuffer = Buffer.from(await res.arrayBuffer());
          }
          if (refBuffer) {
            mosaicBuffer = await sharp(refBuffer).resize(imgWidth, imgHeight, { fit: "cover" }).png().toBuffer();
            usedRealImage = true;
          }
        } catch (err) {
          console.warn("[COMPOSITOR REFERENCE IMAGE NOTICE]:", err);
        }
      }

      if (!usedRealImage) {
        const svgString = generateArtisanMosaicSvg(imgWidth, imgHeight, styles, finishKey, grout, groutBorder);
        mosaicBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
      }

      // Decode and resize user painted inpainting mask
      const maskRawBase64 = params.maskBase64.includes(",")
        ? params.maskBase64.split(",")[1]
        : params.maskBase64;
      const userMaskBuffer = Buffer.from(maskRawBase64, "base64");

      const resizedMask = await sharp(userMaskBuffer)
        .resize(imgWidth, imgHeight, { fit: "fill" })
        .ensureAlpha()
        .raw()
        .toBuffer();

      const rawMosaic = await sharp(mosaicBuffer)
        .resize(imgWidth, imgHeight, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer();

      // Interleave mosaic RGB with mask Alpha: White / gold strokes = 255 (mosaic visible), Black/transparent = 0 (room photo untouched)
      const rgbaBuffer = Buffer.alloc(imgWidth * imgHeight * 4);
      let maskedPixelCount = 0;

      for (let i = 0; i < imgWidth * imgHeight; i++) {
        const mr = resizedMask[i * 4];
        const mg = resizedMask[i * 4 + 1];
        const mb = resizedMask[i * 4 + 2];
        const ma = resizedMask[i * 4 + 3];

        const isMasked = ma > 25 && (mr > 30 || mg > 30 || mb > 30);
        if (isMasked) maskedPixelCount++;

        rgbaBuffer[i * 4] = rawMosaic[i * 3];
        rgbaBuffer[i * 4 + 1] = rawMosaic[i * 3 + 1];
        rgbaBuffer[i * 4 + 2] = rawMosaic[i * 3 + 2];
        rgbaBuffer[i * 4 + 3] = isMasked ? 255 : 0;
      }

      console.log(`[COMPOSITOR] Inpainting applied to ${maskedPixelCount} masked pixels (${Math.round((maskedPixelCount / (imgWidth * imgHeight)) * 100)}% of space photo)`);

      const maskedMosaic = await sharp(rgbaBuffer, {
        raw: { width: imgWidth, height: imgHeight, channels: 4 }
      }).png().toBuffer();

      const composited = await sharp(imageBuffer)
        .composite([{ input: maskedMosaic, blend: "over" }])
        .jpeg({ quality: 92 })
        .toBuffer();

      return `data:image/jpeg;base64,${composited.toString("base64")}`;
    }

    // =========================================================================
    // CASE B: No mask painted - target detected surface box or placement plane
    // =========================================================================
    let top = 0;
    let left = 0;
    let width = imgWidth;
    let height = imgHeight;

    if (params.box_2d && params.box_2d.length === 4) {
      top = Math.max(0, Math.round((params.box_2d[0] / 1000) * imgHeight));
      left = Math.max(0, Math.round((params.box_2d[1] / 1000) * imgWidth));
      height = Math.max(30, Math.round(((params.box_2d[2] - params.box_2d[0]) / 1000) * imgHeight));
      width = Math.max(30, Math.round(((params.box_2d[3] - params.box_2d[1]) / 1000) * imgWidth));
    } else {
      // Architectural perspective bounds based on placement type
      if (params.placement === "Floor Medallion" || params.placement.toLowerCase().includes("floor")) {
        top = Math.round(imgHeight * 0.52);
        left = Math.round(imgWidth * 0.18);
        width = Math.round(imgWidth * 0.64);
        height = Math.round(imgHeight * 0.42);
      } else if (params.placement === "Backsplash") {
        top = Math.round(imgHeight * 0.32);
        left = Math.round(imgWidth * 0.12);
        width = Math.round(imgWidth * 0.76);
        height = Math.round(imgHeight * 0.38);
      } else if (params.placement === "Pool") {
        top = Math.round(imgHeight * 0.44);
        left = Math.round(imgWidth * 0.10);
        width = Math.round(imgWidth * 0.80);
        height = Math.round(imgHeight * 0.50);
      } else {
        // Accent Wall / Auto-detect
        top = Math.round(imgHeight * 0.16);
        left = Math.round(imgWidth * 0.14);
        width = Math.round(imgWidth * 0.72);
        height = Math.round(imgHeight * 0.62);
      }
    }

    let mosaicBuffer: Buffer = Buffer.alloc(0);
    let usedRealImage = false;

    if (params.referenceProductImageUrl) {
      try {
        let refBuffer: Buffer | null = null;
        if (params.referenceProductImageUrl.startsWith("data:image")) {
          refBuffer = Buffer.from(params.referenceProductImageUrl.split(",")[1], "base64");
        } else if (params.referenceProductImageUrl.startsWith("http")) {
          const res = await fetch(params.referenceProductImageUrl);
          if (res.ok) refBuffer = Buffer.from(await res.arrayBuffer());
        }
        if (refBuffer) {
          mosaicBuffer = await sharp(refBuffer).resize(width, height, { fit: "cover" }).png().toBuffer();
          usedRealImage = true;
        }
      } catch (err) {
        console.warn("[COMPOSITOR REAL IMAGE NOTICE]:", err);
      }
    }

    if (!usedRealImage) {
      const svgPattern = generateArtisanMosaicSvg(width, height, styles, finishKey, grout, groutBorder);
      mosaicBuffer = await sharp(Buffer.from(svgPattern)).resize(width, height).png().toBuffer();
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

  // 1. Top Priority for Inpainting Mask: When user draws a mask on their space photo,
  // execute pixel-perfect inpainting directly onto the masked region while preserving their room/portrait 100%!
  if (isRoomInpainting && inputImageBase64 && params.maskBase64) {
    console.log("=======================================================");
    console.log("[INPAINTING PIPELINE] 🎯 Processing user-drawn Inpainting Mask composite...");
    console.log("[INPAINTING PROMPT]:", prompt);
    console.log("=======================================================");
    const composited = await compositeMosaicOntoRoomPhoto({
      inputImageBase64,
      maskBase64: params.maskBase64,
      placement,
      prompt,
      finish,
      groutColor,
      box_2d: params.surfaceDetection?.box_2d,
      referenceProductImageUrl: params.referenceProductImageUrl,
    });
    if (composited) {
      resultImageUrl = composited;
      console.log("[INPAINTING SUCCESS] ✅ Inpainting mask composited seamlessly onto uploaded space photo!");
    }
  }

  // 2. Try Google Gemini Image Generation if GEMINI_API_KEY is configured (for scratch generations or unmasked spaces)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!resultImageUrl && geminiApiKey) {
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

  // 3. Fallback to OpenAI DALL-E 3 if available and Gemini didn't return an image
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

  // 4. Space Photo Compositor: If user uploaded a room photo, composite the bespoke mosaic into the detected surface boundary
  if (!resultImageUrl && isRoomInpainting && inputImageBase64) {
    const composited = await compositeMosaicOntoRoomPhoto({
      inputImageBase64,
      maskBase64: params.maskBase64,
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

  // 5. From-Scratch Artisan Mosaic Generator: When no photo uploaded, synthesize high-resolution 1024x1024 artisan mosaic artwork
  if (!resultImageUrl && !isRoomInpainting) {
    try {
      const sharp = (await import("sharp")).default;
      const styles = parsePromptAndStyle(prompt, placement);
      const groutConfig = GROUT_ARCHITECTURAL_SPECS[groutColor] || GROUT_ARCHITECTURAL_SPECS["Champagne Gold"];
      const svgArt = generateArtisanMosaicSvg(1024, 1024, styles, finish, groutConfig.hexColor, groutConfig.borderColor);
      const artBuf = await sharp(Buffer.from(svgArt)).jpeg({ quality: 92 }).toBuffer();
      resultImageUrl = `data:image/jpeg;base64,${artBuf.toString("base64")}`;
      console.log(`[MOSAIC PIPELINE] 🎨 Synthesized 1024x1024 bespoke artisan mosaic render for '${styles.themeName}' (${styles.motif})!`);
    } catch (artErr) {
      console.warn("[MOSAIC PIPELINE SYNTHESIS NOTICE]:", artErr);
    }
  }

  // 6. Fallback: If user selected an authentic reference mosaic design, serve that design!
  if (!resultImageUrl && params.referenceProductImageUrl) {
    resultImageUrl = params.referenceProductImageUrl;
    console.log(`[MOSAIC PIPELINE] 🎨 Served selected authentic mosaic design '${params.referenceProductTitle || params.placement}'!`);
  }

  // 7. Fallback: Curated authentic mosaic tile artworks based strictly on the user's prompt & placement
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
