"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Paintbrush, Eraser, Trash2, Upload, RefreshCw } from "lucide-react";

export interface CanvasDrawRef {
  getMaskBase64: () => string | null;
  getInputImageBase64: () => string | null;
  clearCanvas: () => void;
  loadPresetImage: (url: string) => void;
  loadCustomImage?: (dataUrl: string) => void;
  resizeCanvas?: () => void;
  hasDrawnMask?: () => boolean;
  applyDetectedSurfaceMask?: (
    box_2d: [number, number, number, number],
    polygon?: [number, number][]
  ) => void;
}

export interface CanvasDrawProps {
  onImageUploaded?: (hasImage: boolean, previewUrl?: string) => void;
  onMaskDrawn?: () => void;
}


export const CanvasDraw = forwardRef<CanvasDrawRef, CanvasDrawProps>(({ onImageUploaded, onMaskDrawn }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"draw" | "erase">("draw");
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasBackgroundImage, setHasBackgroundImage] = useState<boolean>(false);
  const [backgroundImageElement, setBackgroundImageElement] = useState<HTMLImageElement | null>(null);
  const [hasMaskStrokes, setHasMaskStrokes] = useState<boolean>(false);

  // Initialize canvas resolution and aspect ratio matching uploaded space photo
  const updateCanvasSize = () => {
    if (imageCanvasRef.current && drawCanvasRef.current) {
      const drawCanvas = drawCanvasRef.current;
      const imageCanvas = imageCanvasRef.current;

      let width = 800;
      let height = 500;

      if (backgroundImageElement && backgroundImageElement.naturalWidth > 0 && backgroundImageElement.naturalHeight > 0) {
        // High-resolution image canvas matching EXACT natural dimensions of the uploaded photo
        const natW = backgroundImageElement.naturalWidth;
        const natH = backgroundImageElement.naturalHeight;
        // Clamp maximum canvas internal dimension to 1600px for optimal memory and silky smooth drawing
        const maxDim = 1600;
        if (natW > maxDim || natH > maxDim) {
          const scale = maxDim / Math.max(natW, natH);
          width = Math.round(natW * scale);
          height = Math.round(natH * scale);
        } else {
          width = natW;
          height = natH;
        }
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        width = rect.width > 0 ? Math.round(rect.width) : 800;
        height = Math.round(width * 0.625);
      }

      let tempCanvas: HTMLCanvasElement | null = null;
      if (hasMaskStrokes && drawCanvas.width > 0 && drawCanvas.height > 0) {
        tempCanvas = document.createElement("canvas");
        tempCanvas.width = drawCanvas.width;
        tempCanvas.height = drawCanvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx?.drawImage(drawCanvas, 0, 0);
      }

      imageCanvas.width = width;
      imageCanvas.height = height;
      drawCanvas.width = width;
      drawCanvas.height = height;

      if (tempCanvas) {
        const drawCtx = drawCanvas.getContext("2d");
        drawCtx?.drawImage(tempCanvas, 0, 0, width, height);
      }

      redrawBackground();
    }
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [backgroundImageElement]);

  const redrawBackground = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImageElement && backgroundImageElement.width > 0 && backgroundImageElement.height > 0) {
      try {
        // Draw image filling 100% of the canvas from corner to corner - ZERO empty sidebars, ZERO letterboxing
        ctx.drawImage(backgroundImageElement, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        console.warn("Error drawing background image onto canvas:", err);
      }
    } else {
      // Grid scratch backdrop (light luxury architectural paper)
      ctx.fillStyle = "#FAF9F8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#E7E5E4";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  };

  const loadPresetImage = (url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setBackgroundImageElement(img);
      setHasBackgroundImage(true);
      if (onImageUploaded) onImageUploaded(true, url);
    };
    img.src = url;
  };

  const loadCustomImage = (dataUrl: string) => {
    const img = new Image();
    if (!dataUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      setBackgroundImageElement(img);
      setHasBackgroundImage(true);
      if (onImageUploaded) onImageUploaded(true, dataUrl);
    };
    img.src = dataUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setBackgroundImageElement(img);
        setHasBackgroundImage(true);
        if (onImageUploaded) onImageUploaded(true, dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasMaskStrokes(false);
  };

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    // Strictly clamp within canvas/photo bounds
    const x = Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY));

    return { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (mode === "draw") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(212, 175, 55, 0.78)"; // Luxurious architectural gold mask overlay
      ctx.fillStyle = "rgba(212, 175, 55, 0.78)";
      setHasMaskStrokes(true);
      if (onMaskDrawn) onMaskDrawn();
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  useImperativeHandle(ref, () => ({
    getMaskBase64: () => {
      const canvas = drawCanvasRef.current;
      if (!canvas || canvas.width <= 0 || canvas.height <= 0 || !hasMaskStrokes) {
        return null;
      }
      try {
        // Create clean binary mask canvas matching photo resolution 1:1
        // Pure white (#FFFFFF) on drawn strokes, pure black (#000000) on unmasked background
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return null;

        // 1. Draw user's painted strokes onto transparent canvas
        maskCtx.drawImage(canvas, 0, 0);
        // 2. Turn all painted brush strokes pure opaque white
        maskCtx.globalCompositeOperation = "source-in";
        maskCtx.fillStyle = "#FFFFFF";
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        // 3. Fill all unpainted background with pure opaque black
        maskCtx.globalCompositeOperation = "destination-over";
        maskCtx.fillStyle = "#000000";
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        return maskCanvas.toDataURL("image/png");
      } catch (err) {
        console.warn("Mask base64 export skipped or failed:", err);
        return null;
      }
    },
    getInputImageBase64: () => {
      const canvas = imageCanvasRef.current;
      if (!canvas || canvas.width <= 0 || canvas.height <= 0) return null;
      try {
        return canvas.toDataURL("image/jpeg", 0.95);
      } catch (err) {
        console.warn("Input image base64 export failed:", err);
        return null;
      }
    },
    clearCanvas,
    loadPresetImage,
    loadCustomImage,
    resizeCanvas: updateCanvasSize,
    hasDrawnMask: () => hasMaskStrokes,
    applyDetectedSurfaceMask: (
      box_2d: [number, number, number, number],
      polygon?: [number, number][]
    ) => {
      const canvas = drawCanvasRef.current;
      if (!canvas || canvas.width <= 0 || canvas.height <= 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear any previous mask strokes
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(212, 175, 55, 0.72)"; // Luxurious gold mask overlay
      ctx.strokeStyle = "rgba(245, 210, 105, 0.95)";
      ctx.lineWidth = 2.5;

      if (polygon && polygon.length >= 3) {
        ctx.beginPath();
        const startX = Math.max(0, Math.min(canvas.width, (polygon[0][0] / 1000) * canvas.width));
        const startY = Math.max(0, Math.min(canvas.height, (polygon[0][1] / 1000) * canvas.height));
        ctx.moveTo(startX, startY);

        for (let i = 1; i < polygon.length; i++) {
          const ptX = Math.max(0, Math.min(canvas.width, (polygon[i][0] / 1000) * canvas.width));
          const ptY = Math.max(0, Math.min(canvas.height, (polygon[i][1] / 1000) * canvas.height));
          ctx.lineTo(ptX, ptY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (box_2d && box_2d.length === 4) {
        const [ymin, xmin, ymax, xmax] = box_2d;
        // Strictly clamp within photo boundaries
        const cXmin = Math.max(0, Math.min(990, xmin));
        const cYmin = Math.max(0, Math.min(990, ymin));
        const cXmax = Math.max(cXmin + 10, Math.min(1000, xmax));
        const cYmax = Math.max(cYmin + 10, Math.min(1000, ymax));

        const x = (cXmin / 1000) * canvas.width;
        const y = (cYmin / 1000) * canvas.height;
        const w = ((cXmax - cXmin) / 1000) * canvas.width;
        const h = ((cYmax - cYmin) / 1000) * canvas.height;

        ctx.beginPath();
        const radius = Math.min(12, w / 4, h / 4);
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, w, h, radius);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
      setHasMaskStrokes(true);
      if (onMaskDrawn) onMaskDrawn();
    },
  }));

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900 border border-stone-800 text-white shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "draw"
                ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" /> Mask Brush
          </button>
          <button
            type="button"
            onClick={() => setMode("erase")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "erase"
                ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" /> Eraser
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-rose-300 hover:bg-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Mask
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 font-medium">Brush Size:</span>
          <input
            type="range"
            min="10"
            max="120"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-amber-400 w-8">{brushSize}px</span>
        </div>

        {/* File Upload Button */}
        <div className="flex items-center gap-2">
          <label className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload Room Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Interactive Canvas Container - Sized 1:1 to image aspect ratio */}
      <div className="w-full flex items-center justify-center overflow-hidden py-1">
        <div
          ref={containerRef}
          style={
            backgroundImageElement && backgroundImageElement.naturalWidth > 0
              ? {
                  aspectRatio: `${backgroundImageElement.naturalWidth} / ${backgroundImageElement.naturalHeight}`,
                  maxHeight: "min(62vh, 520px)",
                  maxWidth: "100%",
                  width: "auto",
                }
              : {
                  aspectRatio: "16 / 10",
                  maxHeight: "min(55vh, 460px)",
                  width: "100%",
                }
          }
          className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl bg-stone-100 flex items-center justify-center cursor-crosshair mx-auto transition-all"
        >
          <canvas
            ref={imageCanvasRef}
            className="absolute inset-0 z-0 w-full h-full block"
            style={{ width: "100%", height: "100%" }}
          />
          <canvas
            ref={drawCanvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 z-10 w-full h-full touch-none block"
            style={{ width: "100%", height: "100%" }}
          />

          {!hasBackgroundImage && (
            <div className="absolute z-20 pointer-events-none text-center px-4 py-3 rounded-xl bg-stone-900/80 backdrop-blur-md border border-amber-500/30 text-white">
              <p className="text-sm font-semibold text-amber-300">Scratch Design Mode Active</p>
              <p className="text-xs text-stone-300 mt-0.5">
                Draw your target mosaic boundary above or upload a room photo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CanvasDraw.displayName = "CanvasDraw";
