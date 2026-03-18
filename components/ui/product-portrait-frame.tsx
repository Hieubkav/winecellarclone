"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_IMAGE_ASPECT_CLASS } from "@/lib/constants/product-image";

interface ProductPortraitFrameProps {
  className?: string;
  children?: ReactNode;
}

export function ProductPortraitFrame({ className, children }: ProductPortraitFrameProps) {
  return (
    <div className={cn("relative overflow-hidden bg-white", PRODUCT_IMAGE_ASPECT_CLASS, className)}>
      {children}
    </div>
  );
}
