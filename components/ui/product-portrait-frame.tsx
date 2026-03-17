"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProductPortraitFrameProps {
  className?: string;
  children?: ReactNode;
}

export function ProductPortraitFrame({ className, children }: ProductPortraitFrameProps) {
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-white", className)}>
      {children}
    </div>
  );
}
