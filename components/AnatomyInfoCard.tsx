"use client";
// components/AnatomyInfoCard.tsx
import React, { useState } from "react";
import type { UnifiedEntry } from "@/lib/atlasKnowledgeIndex";

export interface AnatomyInfoCardProps {
  entry: UnifiedEntry | null;
  accent?: string;
  onClose?: () => void;
  /**
   * "floating" = standalone glass card overlaid on 3D canvas (default)
   * "embedded" = compact dark-mode section inside AnatomyViewer's SelectedOrganCard
   */
  variant?: "floating" | "embedded";
  defaultLang?: "en" | "ar";
}

export default function AnatomyInfoCard({
  entry,
  accent = "#0ea5e9",
  onClose,
  variant = "floating",
  defaultLang = "en",
}: AnatomyInfoCardProps) {
  const [lang, setLang] = useState<"en" | "ar">(defaultLang);
  if (!entry) return null;

  if (variant === "embedded") {
    return (
      <div
        dir="ltr"
        className="mt-2 border-t border-slate-700/70 pt-2 text-[11px] leading-relaxed text-slate-100"
      >
        <div className="mb-1.5 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="truncate font-extrabold text-amber-300" dir="rtl">
              {entry.name_ar}
            </div>
            <div className="truncate text-[9.5px] font-semibold text-slate-400">
              {entry.group} · {entry.system}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="shrink-0 rounded-md border border-sky-400/50 bg-sky-500/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-sky-300 transition hover:bg-sky-500/30"
          >
            {lang === "en" ? "AR / عربي" : "EN"}
          </button>
        </div>

        <dl className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
          {entry.details.map((d) => (
            <div
              key={d.label}
              className="rounded-lg border border-slate-800 bg-slate-950/65 px-2 py-1"
            >
              <dt
                className="text-[9.5px] font-extrabold uppercase tracking-wide"
                style={{ color: accent }}
              >
                {lang === "ar" && d.label_ar ? d.label_ar : d.label}
              </dt>
              <dd className="mt-0.5 text-[10.5px] font-medium leading-snug text-slate-100">
                {d.value}
              </dd>
            </div>
          ))}
          <div
            className="rounded-lg px-2 py-1.5 text-[10.5px] leading-snug"
            style={{
              background: `${accent}1f`,
              borderLeft: `3px solid ${accent}`,
            }}
          >
            <strong className="font-extrabold text-amber-300">
              {lang === "ar" ? "الأهمية الإكلينيكية (Clinical): " : "Clinical: "}
            </strong>
            <span className="text-white/95">{entry.clinical}</span>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <aside
      dir="ltr"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 30,
        width: 340,
        maxWidth: "calc(100% - 32px)",
        maxHeight: "82%",
        overflowY: "auto",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${accent}66`,
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
        color: "#0f172a",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {lang === "en" ? entry.name_en : entry.name_ar}
          </div>
          <div style={{ color: "#475569", fontSize: 11.5, fontWeight: 600 }}>
            {lang === "en" ? entry.name_ar : entry.name_en} · {entry.group} ({entry.system})
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            style={chip(accent)}
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={chip(accent)}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <dl style={{ margin: "12px 0 0" }}>
        {entry.details.map((d) => (
          <div key={d.label} style={{ marginBottom: 8 }}>
            <dt style={{ fontWeight: 700, color: accent, fontSize: 12 }}>
              {lang === "ar" && d.label_ar ? d.label_ar : d.label}
            </dt>
            <dd style={{ margin: 0 }}>{d.value}</dd>
          </div>
        ))}
      </dl>

      <div
        style={{
          background: `${accent}16`,
          borderLeft: `3px solid ${accent}`,
          padding: "8px 10px",
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        <strong>{lang === "ar" ? "Clinical / إكلينيكياً: " : "Clinical: "}</strong>
        {entry.clinical}
      </div>
    </aside>
  );
}

const chip = (accent: string): React.CSSProperties => ({
  border: `1px solid ${accent}66`,
  background: "transparent",
  color: accent,
  borderRadius: 8,
  padding: "2px 8px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
});
