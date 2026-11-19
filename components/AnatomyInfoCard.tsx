"use client";
// components/AnatomyInfoCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAtlasLocale } from "@/lib/atlasI18n";
import type { UnifiedEntry } from "@/lib/atlasKnowledgeIndex";

export interface AnatomyInfoCardProps {
  entry: UnifiedEntry | null;
  accent?: string;
  onClose?: () => void;
  variant?: "floating" | "embedded";
  mode?: "floating" | "embedded";
  defaultLang?: "en" | "ar";
}

interface CardPage {
  title_en: string;
  title_ar: string;
  details: UnifiedEntry["details"];
  showClinical: boolean;
}

export default function AnatomyInfoCard({
  entry,
  accent = "#0ea5e9",
  onClose,
  variant,
  mode,
  defaultLang,
}: AnatomyInfoCardProps) {
  const { isAr } = useAtlasLocale();
  const [lang, setLang] = useState<"en" | "ar">(defaultLang ?? (isAr ? "ar" : "en"));
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!defaultLang) {
      setLang(isAr ? "ar" : "en");
    }
  }, [isAr, defaultLang]);

  useEffect(() => {
    setPage(0);
  }, [entry?.id]);

  const effectiveVariant = variant ?? mode ?? "floating";

  const pages = useMemo<CardPage[]>(() => {
    if (!entry) return [];
    const rows = entry.details ?? [];
    const list: CardPage[] = [];

    const chunkSize = rows.length > 2 ? 2 : 1;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const slice = rows.slice(i, i + chunkSize);
      list.push({
        title_en: i === 0 ? "Anatomical Facts" : "Relations & Supply",
        title_ar: i === 0 ? "الحقائق التشريحية" : "العلاقات والتروية",
        details: slice,
        showClinical: false,
      });
    }

    if (entry.clinical) {
      list.push({
        title_en: "Clinical & Surgical Pearl",
        title_ar: "الأهمية الإكلينيكية والجراحية",
        details: [],
        showClinical: true,
      });
    }

    return list.length > 0
      ? list
      : [
          {
            title_en: "Overview",
            title_ar: "نظرة عامة",
            details: rows,
            showClinical: true,
          },
        ];
  }, [entry]);

  if (!entry) return null;

  const safePage = Math.min(page, Math.max(0, pages.length - 1));
  const current = pages[safePage];
  const clinicalText =
    lang === "ar" && entry.clinical_ar ? entry.clinical_ar : entry.clinical;

  if (effectiveVariant === "embedded") {
    return (
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="mt-2 flex flex-col justify-between border-t border-slate-700/70 pt-2 text-[11px] leading-relaxed text-white"
      >
        {/* Compact Header (Main title is already shown prominently at the top of SelectedOrganCard) */}
        <div className="mb-1.5 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            {lang === "ar" && entry.name_ar && (
              <div className="truncate font-extrabold text-amber-300" dir="rtl">
                {entry.name_ar}
              </div>
            )}
            <div className="truncate text-[9.5px] font-semibold text-white">
              {lang === "ar" ? current.title_ar : current.title_en} · {entry.group}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="shrink-0 rounded-md border border-sky-400/50 bg-sky-500/15 px-2 py-0.5 text-[9.5px] font-extrabold text-sky-300 transition hover:bg-sky-500/30"
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
        </div>

        {/* Page Content */}
        <div className="min-h-[92px] space-y-1.5">
          {current.details.map((d) => (
            <div
              key={d.label}
              className="rounded-lg border border-slate-800 bg-slate-950/75 px-2.5 py-1.5"
            >
              <dt
                className="text-[9.5px] font-extrabold uppercase tracking-wide"
                style={{ color: accent }}
              >
                {lang === "ar" && d.label_ar ? d.label_ar : d.label}
              </dt>
              <dd className="mt-0.5 text-[10.5px] font-medium leading-snug text-white">
                {lang === "ar" && d.value_ar ? d.value_ar : d.value}
              </dd>
            </div>
          ))}

          {current.showClinical && (
            <div
              className="rounded-lg px-2.5 py-2 text-[10.5px] leading-snug"
              style={{
                background: `${accent}1f`,
                borderLeft: lang === "en" ? `3px solid ${accent}` : undefined,
                borderRight: lang === "ar" ? `3px solid ${accent}` : undefined,
              }}
            >
              <strong className="mb-0.5 block font-extrabold text-amber-300">
                {lang === "ar"
                  ? "الأهمية الإكلينيكية (Clinical Pearl):"
                  : "Clinical Pearl:"}
              </strong>
              <span className="text-white/95">{clinicalText}</span>
            </div>
          )}
        </div>

        {/* Bottom Pagination Bar */}
        {pages.length > 1 && (
          <div
            dir="ltr"
            className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-1.5"
          >
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-extrabold text-sky-300 transition hover:border-sky-400 disabled:opacity-35"
            >
              {lang === "ar" ? "‹ السابق" : "‹ Prev"}
            </button>

            <div className="flex items-center gap-1.5">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPage(idx)}
                  aria-label={`Page ${idx + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: idx === safePage ? 16 : 6,
                    backgroundColor:
                      idx === safePage ? accent : "rgba(148,163,184,0.35)",
                  }}
                />
              ))}
              <span className="ml-1 text-[9.5px] font-bold text-white">
                {safePage + 1}/{pages.length}
              </span>
            </div>

            <button
              type="button"
              disabled={safePage === pages.length - 1}
              onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
              className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-extrabold text-sky-300 transition hover:border-sky-400 disabled:opacity-35"
            >
              {lang === "ar" ? "التالي ›" : "Next ›"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        top: 12,
        right: 14,
        zIndex: 40,
        width: 340,
        maxWidth: "calc(100% - 28px)",
        maxHeight: "calc(100% - 84px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${accent}66`,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 16px 40px rgba(2, 6, 23, 0.55)",
        color: "#f8fafc",
        fontSize: 12.5,
        lineHeight: 1.55,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          borderBottom: "1px solid rgba(148,163,184,0.18)",
          paddingBottom: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#ffffff" }}>
            {lang === "en" ? entry.name_en : entry.name_ar}
          </div>
          <div style={{ color: "#ffffff", fontSize: 11, fontWeight: 600 }}>
            {lang === "ar" ? `${entry.name_en} · ${entry.group}` : entry.group}
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

      <div style={{ margin: "10px 0", overflowY: "auto", flex: 1 }}>
        {current.details.map((d) => (
          <div
            key={d.label}
            style={{
              marginBottom: 8,
              background: "rgba(2, 6, 23, 0.55)",
              border: "1px solid rgba(51, 65, 85, 0.7)",
              borderRadius: 10,
              padding: "8px 10px",
            }}
          >
            <dt style={{ fontWeight: 800, color: accent, fontSize: 11 }}>
              {lang === "ar" && d.label_ar ? d.label_ar : d.label}
            </dt>
            <dd style={{ margin: "2px 0 0", color: "#e2e8f0" }}>
              {lang === "ar" && d.value_ar ? d.value_ar : d.value}
            </dd>
          </div>
        ))}

        {current.showClinical && (
          <div
            style={{
              background: `${accent}1f`,
              borderLeft: lang === "en" ? `3px solid ${accent}` : undefined,
              borderRight: lang === "ar" ? `3px solid ${accent}` : undefined,
              padding: "10px 12px",
              borderRadius: 10,
            }}
          >
            <strong style={{ color: "#fcd34d", display: "block", marginBottom: 3 }}>
              {lang === "ar" ? "الأهمية الإكلينيكية:" : "Clinical Pearl:"}
            </strong>
            {clinicalText}
          </div>
        )}
      </div>

      {pages.length > 1 && (
        <footer
          dir="ltr"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(148,163,184,0.18)",
            paddingTop: 8,
          }}
        >
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{
              ...chip(accent),
              opacity: safePage === 0 ? 0.35 : 1,
            }}
          >
            {lang === "ar" ? "‹ السابق" : "‹ Prev"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {pages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPage(idx)}
                style={{
                  width: idx === safePage ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  border: "none",
                  background:
                    idx === safePage ? accent : "rgba(148,163,184,0.35)",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
            <span style={{ color: "#ffffff", fontSize: 11, marginLeft: 4 }}>
              {safePage + 1}/{pages.length}
            </span>
          </div>

          <button
            type="button"
            disabled={safePage === pages.length - 1}
            onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            style={{
              ...chip(accent),
              opacity: safePage === pages.length - 1 ? 0.35 : 1,
            }}
          >
            {lang === "ar" ? "التالي ›" : "Next ›"}
          </button>
        </footer>
      )}
    </aside>
  );
}

const chip = (accent: string): React.CSSProperties => ({
  border: `1px solid ${accent}66`,
  background: "rgba(15, 23, 42, 0.7)",
  color: accent,
  borderRadius: 8,
  padding: "2px 8px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
});
