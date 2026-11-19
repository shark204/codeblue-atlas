'use client';
import dynamic from "next/dynamic";

const AtlasScreen = dynamic(() => import("@/components/screens/AtlasScreen"), { ssr: false });

export default function StandaloneAtlasPage() {
  return <AtlasScreen />;
}
