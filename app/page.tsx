"use client";
import dynamic from "next/dynamic";

function AtlasBootLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        background: "radial-gradient(circle at 50% 35%, #0f1b38 0%, #060913 75%)",
        color: "#e2e8f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <img
        src="/icon.png"
        alt="Code Blue Atlas"
        style={{ width: 68, height: 68, borderRadius: 16, boxShadow: "0 0 30px rgba(56,189,248,0.35)" }}
      />
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>CODE BLUE ATLAS</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Loading 3D Anatomy Studio...</div>
    </div>
  );
}

const AtlasScreen = dynamic(() => import("@/components/screens/AtlasScreen"), {
  ssr: false,
  loading: () => <AtlasBootLoader />,
});

export default function StandaloneAtlasPage() {
  return <AtlasScreen />;
}
