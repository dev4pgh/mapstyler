// src/components/ExportImageDialog.tsx
import React, { useState, useRef } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useMapContext } from "@/context/MapContext";

type FrameStyle = "none" | "circle" | "fade";

export function ExportImageDialog() {
  const { mapRef } = useMapContext();
  const [open, setOpen] = useState(false);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
  const [imageURL, setImageURL] = useState<string | null>(null);

  // The user clicks "Export" -> create the image and show a preview or force-download
  const handleExport = () => {
    if (!mapRef.current) return;
  
    // Wait until the map is fully rendered
    mapRef.current.once("idle", () => {
      const rawMapDataURL = mapRef.current.getCanvas().toDataURL("image/png");
  
      const offscreen = document.createElement("canvas");
      const mapCanvas = mapRef.current.getCanvas();
      offscreen.width = mapCanvas.width;
      offscreen.height = mapCanvas.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;
  
      const image = new Image();
      image.src = rawMapDataURL;
      image.onload = () => {
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
        }
  
        const finalDataURL = offscreen.toDataURL("image/png");
        setImageURL(finalDataURL);
      };
    });
  
    // Force a redraw just in case
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
        <Button>Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Map Image</DialogTitle>
          <DialogDescription>
            Choose a frame style (circle, fade out, or none) and export the map as an image.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Select value={frameStyle} onValueChange={(val: FrameStyle) => setFrameStyle(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Frame Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Frame</SelectItem>
              <SelectItem value="circle">Circle Mask</SelectItem>
              <SelectItem value="fade">Fade Edges</SelectItem>
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

/**
 * Circle Mask:
 *  - Overwrites everything except a circular area
 *  - We can do this by "destination-in" or by clipping the context.
 */
function applyCircleMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) / 2 - 10; // 10px padding
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  // “destination-in” keeps only the shape region
  ctx.globalCompositeOperation = "destination-in";
  ctx.fill();
  ctx.restore();
}

/**
 * Fade Mask:
 *  - Gradually fade out at the edges (radial gradient from center).
 */
function applyFadeMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();

  // Create a radial gradient that goes from fully opaque in center to transparent at edges
  const centerX = w / 2;
  const centerY = h / 2;
  const maxRadius = Math.min(w, h) / 2;
  const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)"); // fully opaque
  grad.addColorStop(1, "rgba(255, 255, 255, 0)"); // transparent

  // Use 'destination-in' to keep only the existing pixels but multiplied by the gradient
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
