"use client";

import dynamic from "next/dynamic";

const AgeGate = dynamic(() => import("@/components/layouts/AgeGate"), {
  ssr: false,
});

export default function AgeGateClient() {
  return <AgeGate />;
}
