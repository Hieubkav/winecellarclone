"use client";

import AgeGate from "@/components/layouts/AgeGate";
import { useHydrated } from "@/hooks/use-hydrated";

export default function AgeGateClient() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <AgeGate />;
}
