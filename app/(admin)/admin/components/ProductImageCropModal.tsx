"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button, Label } from "./ui";

interface ProductImageCropModalProps {
  open: boolean;
  src: string;
  fileName?: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
}

type ImageSize = { width: number; height: number };

const DEFAULT_OUTPUT_WIDTH = 1200;
const DEFAULT_OUTPUT_HEIGHT = 1500;
const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 200;

export function ProductImageCropModal({
  open,
  src,
  fileName = "product-image.webp",
  onCancel,
  onConfirm,
  aspectRatio = 4 / 5,
  outputWidth = DEFAULT_OUTPUT_WIDTH,
  outputHeight = DEFAULT_OUTPUT_HEIGHT,
}: ProductImageCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [containerSize, setContainerSize] = useState<ImageSize | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({ active: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [open, src]);

  const previewSize = useMemo(() => {
    return { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT };
  }, []);

  useEffect(() => {
    if (!previewSize) return;
    setContainerSize(previewSize);
  }, [previewSize]);

  const baseScale = useMemo(() => {
    if (!imageSize || !containerSize) return 1;
    return Math.min(containerSize.width / imageSize.width, containerSize.height / imageSize.height);
  }, [imageSize, containerSize]);

  const actualScale = baseScale * zoom;

  const cropRect = useMemo(() => {
    if (!containerSize) return null;
    const cropWidth = Math.min(containerSize.width, containerSize.height * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    return {
      width: cropWidth,
      height: cropHeight,
      left: (containerSize.width - cropWidth) / 2,
      top: (containerSize.height - cropHeight) / 2,
    };
  }, [aspectRatio, containerSize]);

  const clampOffset = useCallback(
    (nextOffset: { x: number; y: number }) => {
      if (!imageSize || !containerSize) return nextOffset;
      const viewWidth = cropRect?.width ?? containerSize.width;
      const viewHeight = cropRect?.height ?? containerSize.height;
      const displayWidth = imageSize.width * actualScale;
      const displayHeight = imageSize.height * actualScale;
      const maxX = Math.max(0, (displayWidth - viewWidth) / 2);
      const maxY = Math.max(0, (displayHeight - viewHeight) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
        y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
      };
    },
    [actualScale, containerSize, cropRect, imageSize]
  );

  useEffect(() => {
    setOffset((prev) => clampOffset(prev));
  }, [actualScale, clampOffset]);

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return;
    setImageSize({
      width: imageRef.current.naturalWidth,
      height: imageRef.current.naturalHeight,
    });
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragState({
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.active) return;
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    setOffset(
      clampOffset({
        x: dragState.startOffsetX + deltaX,
        y: dragState.startOffsetY + deltaY,
      })
    );
  };

  const handlePointerUp = () => {
    setDragState((prev) => ({ ...prev, active: false }));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    if (!imageRef.current || !containerSize || !imageSize) return;
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const viewWidth = cropRect?.width ?? containerSize.width;
    const viewHeight = cropRect?.height ?? containerSize.height;
    const cropWidth = viewWidth / actualScale;
    const cropHeight = viewHeight / actualScale;
    const cropX = (imageSize.width / 2) - (cropWidth / 2) - offset.x / actualScale;
    const cropY = (imageSize.height / 2) - (cropHeight / 2) - offset.y / actualScale;

    const safeCropX = Math.max(0, Math.min(imageSize.width - cropWidth, cropX));
    const safeCropY = Math.max(0, Math.min(imageSize.height - cropHeight, cropY));

    ctx.drawImage(
      imageRef.current,
      safeCropX,
      safeCropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], fileName.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
      onConfirm(croppedFile);
    }, "image/webp", 0.9);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Cắt ảnh sản phẩm</h2>
            <p className="text-xs text-slate-500">Khung 4:5 • Kéo để canh ảnh</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              style={{
                width: `${PREVIEW_WIDTH}px`,
                height: `${PREVIEW_HEIGHT}px`,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img
                ref={imageRef}
                src={src}
                alt="Crop preview"
                onLoad={handleImageLoad}
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${actualScale})`,
                }}
                draggable={false}
              />
              {cropRect && (
                <div
                  className="pointer-events-none absolute border border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]"
                  style={{
                    width: cropRect.width,
                    height: cropRect.height,
                    left: cropRect.left,
                    top: cropRect.top,
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Thu phóng</Label>
              <div className="flex items-center gap-2">
                <ZoomOut size={16} className="text-slate-500" />
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full"
                />
                <ZoomIn size={16} className="text-slate-500" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Ảnh gốc • khung trắng là vùng cắt 4:5</span>
                <span>{outputWidth}×{outputHeight}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="outline" type="button" onClick={handleReset}>
                <RotateCcw size={14} className="mr-2" />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel}>
                  Hủy
                </Button>
                <Button onClick={handleConfirm}>
                  Dùng ảnh này
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
