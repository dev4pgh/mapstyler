import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useMapContext } from "@/context/MapContext";

type FrameStyle =
  | "none"
  | "circle"
  | "fade"
  | "square"
  | "squareFade"
  | "roundedSquare"
  | "diamond"
  | "hexagon";

export function ExportImageDialog() {
  const { mapRef } = useMapContext();
  const [open, setOpen] = useState(false);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
  const [imageURL, setImageURL] = useState<string | null>(null);

  const handleExport = () => {
    if (!mapRef.current) return;

    // Wait until the map is idle so it's fully rendered.
    mapRef.current.once("idle", () => {
      const mapCanvas = mapRef.current!.getCanvas();
      const rawMapDataURL = mapCanvas.toDataURL("image/png");

      // Create an offscreen canvas to apply the mask.
      const offscreen = document.createElement("canvas");
      offscreen.width = mapCanvas.width;
      offscreen.height = mapCanvas.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      const image = new Image();
      image.src = rawMapDataURL;
      image.onload = () => {
        // Draw the base map image.
        ctx.drawImage(image, 0, 0);

        switch (frameStyle) {
          case "none":
            break;
          case "circle":
            applyCircleMask(ctx, offscreen.width, offscreen.height);
            break;
          case "fade":
            applyFadeMask(ctx, offscreen.width, offscreen.height);
            break;
          case "square":
            applySquareMask(ctx, offscreen.width, offscreen.height);
            break;
          case "squareFade":
            applySquareFade(ctx, offscreen.width, offscreen.height);
            break;
          case "roundedSquare":
            applyRoundedSquareMask(ctx, offscreen.width, offscreen.height);
            break;
          case "diamond":
            applyDiamondMask(ctx, offscreen.width, offscreen.height);
            break;
          case "hexagon":
            applyHexagonMask(ctx, offscreen.width, offscreen.height);
            break;
        }

        const finalDataURL = offscreen.toDataURL("image/png");
        setImageURL(finalDataURL);
      };
    });

    // Force a redraw in case the map needs it.
    mapRef.current.triggerRepaint();
  };

  const handleDownload = () => {
    if (!imageURL) return;
    const a = document.createElement("a");
    a.href = imageURL;
    a.download = `map-export-${frameStyle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-green-800 text-primary-foreground shadow hover:bg-green-800/90">
          Save Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Map Image</DialogTitle>
          <DialogDescription>
            Choose a frame style and export the map as an image.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Select
            value={frameStyle}
            onValueChange={(val: FrameStyle) => setFrameStyle(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Frame Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Frame</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="fade">Circle Fade</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="squareFade">Square Fade</SelectItem>
              <SelectItem value="roundedSquare">Rounded Square</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
              <SelectItem value="hexagon">Hexagon</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport}>
              Generate Image
            </Button>
            {imageURL && (
              <Button onClick={handleDownload} variant="default">
                Download
              </Button>
            )}
          </div>
          {imageURL && (
            <div className="mt-2 border rounded-sm p-2">
              <div className="text-sm font-medium mb-1">Preview:</div>
              <img src={imageURL} alt="Map Export Preview" className="max-w-full" />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function applyCircleMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) / 2 - 10;
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill();
  ctx.restore();
}

function applyFadeMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const centerX = w / 2;
  const centerY = h / 2;
  const maxRadius = Math.min(w, h) / 2;
  const grad = ctx.createRadialGradient(centerX, centerY, maxRadius / 2, centerX, centerY, maxRadius);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function applySquareMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const size = Math.min(w, h) - 20;
  const x = (w - size) / 2;
  const y = (h - size) / 2;
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill();
  ctx.restore();
}

function applySquareFade(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext("2d");
  if (!maskCtx) return;

  const padding = 10;
  const size = Math.min(w, h) - 2 * padding;
  const x = (w - size) / 2;
  const y = (h - size) / 2;

  // Fill the square fully opaque.
  maskCtx.fillStyle = "white";
  maskCtx.fillRect(x, y, size, size);

  // Set composite mode to subtract opacity.
  maskCtx.globalCompositeOperation = "destination-out";
  const fadeWidth = size / 4;

  let grad = maskCtx.createLinearGradient(x, 0, x + fadeWidth, 0);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  maskCtx.fillStyle = grad;
  maskCtx.fillRect(x, y, fadeWidth, size);

  grad = maskCtx.createLinearGradient(x + size - fadeWidth, 0, x + size, 0);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,1)");
  maskCtx.fillStyle = grad;
  maskCtx.fillRect(x + size - fadeWidth, y, fadeWidth, size);

  grad = maskCtx.createLinearGradient(0, y, 0, y + fadeWidth);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  maskCtx.fillStyle = grad;
  maskCtx.fillRect(x, y, size, fadeWidth);

  grad = maskCtx.createLinearGradient(0, y + size - fadeWidth, 0, y + size);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,1)");
  maskCtx.fillStyle = grad;
  maskCtx.fillRect(x, y + size - fadeWidth, size, fadeWidth);

  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();
}

function applyRoundedSquareMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const padding = 10;
  const size = Math.min(w, h) - 2 * padding;
  const x = (w - size) / 2;
  const y = (h - size) / 2;
  const radius = size / 12;
  ctx.beginPath();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill();
  ctx.restore();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function applyDiamondMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const padding = 10;
  const size = Math.min(w, h) - 2 * padding;
  const centerX = w / 2;
  const centerY = h / 2;
  const halfSize = size / 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - halfSize);
  ctx.lineTo(centerX + halfSize, centerY);
  ctx.lineTo(centerX, centerY + halfSize);
  ctx.lineTo(centerX - halfSize, centerY);
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill();
  ctx.restore();
}

function applyHexagonMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const padding = 10;
  const size = Math.min(w, h) - 2 * padding;
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = size / 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill();
  ctx.restore();
}
