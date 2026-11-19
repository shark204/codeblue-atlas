import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { ManifestOrgan } from "@/lib/schemas";
import { organLabel, useSceneStore } from "@/stores/sceneStore";
import { useAtlasLocale } from "@/lib/atlasI18n";

const MAX_RESULTS = 40;

function normalizeMedicalQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\bprofundo\b/g, "profunda")
    .replace(/\bcoeliac\b/g, "celiac")
    .replace(/\boesophag/g, "esophag")
    .replace(/\bhaem/g, "hem")
    .replace(/\bperoneal\b/g, "fibular")
    .replace(/\bperoneus\b/g, "fibularis")
    .replace(/\binternal mammary\b/g, "internal thoracic")
    .replace(/\bposterior interosseous recurrent\b/g, "recurrent interosseous")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .trim();
}

export function StructureSearch({
  onSelectComplete,
}: {
  onSelectComplete?: () => void;
} = {}) {
  const { at } = useAtlasLocale();
  const organs = useSceneStore((s) => s.organs);
  const hiddenSystems = useSceneStore((s) => s.hiddenSystems);
  const selectOrgan = useSceneStore((s) => s.selectOrgan);
  const setHovered = useSceneStore((s) => s.setHovered);
  const applyCommand = useSceneStore((s) => s.applyCommand);
  const toggleSystem = useSceneStore((s) => s.toggleSystem);

  const [query, setQuery] = useState("");
  const needle = normalizeMedicalQuery(query);

  const results = useMemo(() => {
    if (needle.length < 2) return [];
    const tokens = needle.split(/\s+/).filter(Boolean);
    const matches: { organ: ManifestOrgan; score: number }[] = [];
    for (const organ of Object.values(organs)) {
      const hay = normalizeMedicalQuery(
        `${organ.name_en} ${organ.ta2_latin} ${organ.organ_id} ${(organ.path ?? []).join(" ")}`,
      );
      if (hay.includes(needle)) {
        const starts = normalizeMedicalQuery(organ.name_en).startsWith(needle) ? 3 : 2;
        matches.push({ organ, score: starts });
      } else if (tokens.length > 1 && tokens.every((t) => hay.includes(t))) {
        matches.push({ organ, score: 1 });
      }
    }
    matches.sort(
      (a, b) =>
        b.score - a.score || a.organ.name_en.length - b.organ.name_en.length,
    );
    return matches.map((m) => m.organ);
  }, [organs, needle]);

  const shown = results.slice(0, MAX_RESULTS);

  function reveal(organ: ManifestOrgan) {
    if (hiddenSystems.includes(organ.system)) toggleSystem(organ.system);
    selectOrgan(organ.organ_id);
    applyCommand({ action: "focus_organ", organ_id: organ.organ_id });
    onSelectComplete?.();
  }

  return (
    <section className="border-b border-[#26324d] bg-[#0b1120] px-3 py-2.5">
      <div className="relative flex items-center">
        <Search size={13} className="pointer-events-none absolute left-3 text-[#94a3b8]" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={at("ابحث في جميع الأجزاء والتفرعات التشريحية…", "Search all anatomical structures…")}
          className="w-full rounded-xl border border-[#26324d] bg-[#0f172a] py-1.5 pl-8 pr-12 text-xs text-[#f1f5f9] outline-none placeholder:text-[#94a3b8] focus:border-[#3b4d71]"
        />
        {needle.length >= 2 && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#94a3b8]">
            {results.length}
          </span>
        )}
      </div>

      {needle.length >= 2 && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#26324d] bg-[#131c31]">
          {shown.length === 0 && (
            <p className="px-3 py-2.5 text-[11px] text-[#94a3b8]">
              {at("لا توجد نتائج مطابقة.", "No structure matches.")}
            </p>
          )}
          {shown.map((organ) => {
            const notLoaded = hiddenSystems.includes(organ.system);
            return (
              <button
                key={organ.organ_id}
                type="button"
                onMouseEnter={() => !notLoaded && setHovered(organ.organ_id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => reveal(organ)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-[#26324d] px-3 py-2 text-left last:border-0 hover:bg-[#1e293b]"
              >
                {organ.path.length > 0 && (
                  <span className="w-full truncate font-mono text-[9.5px] text-[#94a3b8]">
                    {organ.path.slice(-2).join(" › ")}
                  </span>
                )}
                <span className="w-full truncate text-xs font-bold text-[#f1f5f9]">
                  {organLabel(organ)}
                </span>
                <span className="flex w-full items-center justify-between gap-2 pt-0.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[#94a3b8]">
                    {organ.ta2_latin || organ.name_en}
                  </span>
                  <span className="shrink-0 rounded border border-[#26324d] bg-[#0f172a] px-1.5 py-0.5 font-mono text-[9px] text-[#94a3b8]">
                    {notLoaded ? `load ${organ.system}` : organ.system}
                  </span>
                </span>
              </button>
            );
          })}
          {results.length > shown.length && (
            <p className="px-3 py-2 font-mono text-[10px] text-[#94a3b8]">
              {results.length - shown.length} more — narrow the search.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
