"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Paintbrush, Eraser, Trash2, Upload, RefreshCw, Layers } from "lucide-react";

export interface CanvasDrawRef {
  getMaskBase64: () => string | null;
  getInputImageBase64: () => string | null;
  clearCanvas: () => void;
  loadPresetImage: (url: string) => void;
}

interface CanvasDrawProps {
  onImageUploaded?: (hasImage: boolean) => void;
}

const PRESET_ROOMS = [
  {
    name: "Luxury Foyer Rotunda",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Master Bath Vanity Wall",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Chef Kitchen Backsplash",
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Infinity Pool Terrace",
    url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
  }
];

export const CanvasDraw = forwardRef<CanvasDrawRef, CanvasDrawProps>(({ onImageUploaded }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"draw" | "erase">("draw");
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasBackgroundImage, setHasBackgroundImage] = useState<boolean>(false);
  const [backgroundImageElement, setBackgroundImageElement] = useState<HTMLImageElement | null>(null);

  // Initialize canvas resolution
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && imageCanvasRef.current && drawCanvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 800;
        const height = Math.min(rect.width * 0.65, 550);

        imageCanvasRef.current.width = width;
        imageCanvasRef.current.height = height;
        drawCanvasRef.current.width = width;
        drawCanvasRef.current.height = height;

        redrawBackground();
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [backgroundImageElement]);

  const redrawBackground = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImageElement) {
      // Draw image to cover canvas smoothly
      const hRatio = canvas.width / backgroundImageElement.width;
      const vRatio = canvas.height / backgroundImageElement.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - backgroundImageElement.width * ratio) / 2;
      const centerShift_y = (canvas.height - backgroundImageElement.height * ratio) / 2;

      ctx.drawImage(
        backgroundImageElement,
        0,
        0,
        backgroundImageElement.width,
        backgroundImageElement.height,
        centerShift_x,
        centerShift_y,
        backgroundImageElement.width * ratio,
        backgroundImageElement.height * ratio
      );
    } else {
      // Grid scratch backdrop
      ctx.fillStyle = "#0F1015";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#1F2330";
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
      if (onImageUploaded) onImageUploaded(true);
    };
    img.src = url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBackgroundImageElement(img);
        setHasBackgroundImage(true);
        if (onImageUploaded) onImageUploaded(true);
      };
      img.src = event.target?.result as string;
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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
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
      ctx.strokeStyle = "rgba(203, 167, 65, 0.75)"; // Gold mask preview overlay
      ctx.fillStyle = "rgba(203, 167, 65, 0.75)";
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
      if (!canvas) return null;
      // Create black & white mask canvas
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) return null;

      maskCtx.fillStyle = "#000000";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      maskCtx.drawImage(canvas, 0, 0);
      maskCtx.globalCompositeOperation = "source-in";
      maskCtx.fillStyle = "#FFFFFF";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      return maskCanvas.toDataURL("image/png");
    },
    getInputImageBase64: () => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    },
    clearCanvas,
    loadPresetImage
  }));

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-obsidian-900/90 border border-gold-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === "draw"
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                : "bg-obsidian-800 text-neutral-300 hover:bg-obsidian-700"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" /> Mask Brush
          </button>
          <button
            type="button"
            onClick={() => setMode("erase")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === "erase"
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                : "bg-obsidian-800 text-neutral-300 hover:bg-obsidian-700"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" /> Eraser
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-obsidian-800 text-red-400 hover:bg-red-950/40 flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Mask
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-medium">Brush Size:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-gold-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-gold-400 w-6">{brushSize}px</span>
        </div>

        {/* File Upload Button */}
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/30 hover:bg-gold-500/20 cursor-pointer flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload Room Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Preset Room Quick Pickers */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-400 font-serif uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-gold-400" /> Presets:
        </span>
        {PRESET_ROOMS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => loadPresetImage(preset.url)}
            className="text-xs px-2.5 py-1 rounded-md bg-obsidian-800/80 hover:bg-gold-500/20 text-neutral-300 hover:text-gold-300 border border-neutral-800 transition-all"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Interactive Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-gold-500/30 shadow-2xl bg-obsidian-950 min-h-[380px] flex items-center justify-center cursor-crosshair"
      >
        <canvas ref={imageCanvasRef} className="absolute inset-0 z-0 w-full h-full object-cover" />
        <canvas
          ref={drawCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 z-10 w-full h-full touch-none"
        />

        {!hasBackgroundImage && (
          <div className="absolute z-20 pointer-events-none text-center px-4 py-3 rounded-xl bg-obsidian-950/80 backdrop-blur-md border border-gold-500/20">
            <p className="text-sm font-semibold text-gold-300">Scratch Design Mode Active</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Draw your target mosaic boundary above or select a luxury room preset
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

CanvasDraw.displayName = "CanvasDraw";
