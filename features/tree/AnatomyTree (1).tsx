'use client';

import React, { useMemo, useState } from "react";
import { useAtlasLocale } from "@/lib/atlasI18n";
import { Activity, ArrowLeft, Brain, Check, ChevronDown, ChevronRight, ChevronUp, ClipboardList, Contrast, Eye, EyeOff, Folder, Heart, Info, Layers, ScanLine, Stethoscope, User, Wind, X } from "lucide-react";
import type { AnatomicalSystem, ManifestOrgan } from "@/lib/schemas";
export const SYSTEM_COLOURS: Record<AnatomicalSystem, string> = {
  skeletal: "#c6b08c",
  articular: "#38bdf8",
  muscular: "#a41e28",
  cardiovascular: "#c63d47",
  nervous: "#eedb7a",
  lymphatic: "#22c55e",
  digestive: "#d48c6f",
  respiratory: "#ebb4be",
  renal: "#aa5344",
  endocrine: "#c084fc",
  reproductive: "#cc85a2",
  integumentary: "#c6bfb7",
  regional: "#e7baa4"
};
export const SYSTEM_LABELS: Record<AnatomicalSystem, string> = {
  skeletal: "Bone",
  articular: "Joint",
  muscular: "Muscle",
  cardiovascular: "Heart & vessel",
  nervous: "Nerve",
  lymphatic: "Lymphatic",
  digestive: "Digestive tract",
  respiratory: "Airway",
  renal: "Urinary",
  endocrine: "Endocrine gland",
  reproductive: "Reproductive",
  integumentary: "Skin and breast",
  regional: "Surface & regional"
};
import { StructureSearch } from "./StructureSearch";
import { isOrganVisible, matchesMobileBodyRegion, organLabel, useSceneStore, type MobileBodyRegion } from "@/stores/sceneStore";
import { useUIStore } from "@/stores/uiStore";
import { useHeartStore } from "@/stores/heartStore";
import { primeHeartSound } from "@/features/viewer/heartSound";
import { primeBreathSound } from "@/features/viewer/breathing";
import { useBreathStore } from "@/stores/breathStore";
import { useScanStore } from "@/stores/scanStore";
import { SystemIllustration, type SystemCardSpec, SYSTEMIC_PANELS, REGIONAL_VISCERAL_PANELS, SOUNDS_AND_IMAGING_PANELS } from "./SystemIllustration";
const ALL_ANATOMICAL_SYSTEMS: AnatomicalSystem[] = ["skeletal", "articular", "muscular", "cardiovascular", "nervous", "lymphatic", "digestive", "respiratory", "renal", "endocrine", "reproductive", "integumentary", "regional"];
export const VISCERAL_SCAN_SYSTEMS: AnatomicalSystem[] = ["digestive", "renal", "endocrine", "cardiovascular", "respiratory"];
const MOBILE_BODY_PARTS: {
  id: MobileBodyRegion;
  ar: string;
  en: string;
}[] = [{
  id: "all",
  ar: "الجسم كامل",
  en: "Full Body"
}, {
  id: "head_neck",
  ar: "الرأس والرقبة",
  en: "Head & Neck"
}, {
  id: "trunk",
  ar: "الصدر والبطن",
  en: "Trunk & Thorax"
}, {
  id: "upper_limb",
  ar: "الطرف العلوي",
  en: "Upper Limb"
}, {
  id: "lower_limb",
  ar: "الطرف السفلي",
  en: "Lower Limb"
}];
export function systemIsOpen(expanded: Record<string, boolean>, system: string): boolean {
  return expanded[system] === true;
}
export function AnatomyTree({
  onMobileActionComplete
}: {
  onMobileActionComplete?: () => void;
} = {}) {
  const {
    isAr,
    at
  } = useAtlasLocale();
  const manifest = useSceneStore(s => s.manifest);
  const organs = useSceneStore(s => s.organs);
  const hiddenSystems = useSceneStore(s => s.hiddenSystems);
  const hiddenOrganIds = useSceneStore(s => s.hiddenOrganIds);
  const isolatedOrganIds = useSceneStore(s => s.isolatedOrganIds);
  const hideConnective = useSceneStore(s => s.hideConnective);
  const connectiveIds = useSceneStore(s => s.connectiveIds);
  const setHideConnective = useSceneStore(s => s.setHideConnective);
  const toggleOrganHidden = useSceneStore(s => s.toggleOrganHidden);
  const toggleOrgansHidden = useSceneStore(s => s.toggleOrgansHidden);
  const mobileBodyRegion = useSceneStore(s => s.mobileBodyRegion);
  const setMobileBodyRegion = useSceneStore(s => s.setMobileBodyRegion);
  const [selectedCategory, setSelectedCategory] = useState<"systemic" | "regional" | "sounds" | null>(null);
  const [expandedPartsSystem, setExpandedPartsSystem] = useState<string | null>(null);
  const [partsFilter, setPartsFilter] = useState("");
  const [expandedBranchGroups, setExpandedBranchGroups] = useState<Record<string, boolean>>({});
  const selectOrgan = useSceneStore(s => s.selectOrgan);
  const selectedOrganIds = useSceneStore(s => s.selectedOrganIds);
  const genderModel = useSceneStore(s => s.genderModel);
  const switchReproductiveGender = useSceneStore(s => s.switchReproductiveGender);
  const toggleNervousBodyContext = useSceneStore(s => s.toggleNervousBodyContext);
  const toggleSystem = useSceneStore(s => s.toggleSystem);
  const soloSystem = useSceneStore(s => s.soloSystem);
  const studyGroup = useSceneStore(s => s.studyGroup);
  const clearIsolation = useSceneStore(s => s.clearIsolation);
  const showAllSystems = useSceneStore(s => s.showAllSystems);
  const hideAllSystems = useSceneStore(s => s.hideAllSystems);
  const systemOpacity = useSceneStore(s => s.systemOpacity);
  const cycleSystemOpacity = useSceneStore(s => s.cycleSystemOpacity);
  const background = useSceneStore(s => s.background);
  const siteTheme = useUIStore(s => s.theme);
  const isLight = background === "light" || siteTheme === "light";
  const applyCommand = useSceneStore(s => s.applyCommand);
  const heartEnabled = useHeartStore(s => s.enabled);
  const toggleHeart = useHeartStore(s => s.toggle);
  const setHeartSound = useHeartStore(s => s.setSound);
  const breathEnabled = useBreathStore(s => s.enabled);
  const toggleBreath = useBreathStore(s => s.toggle);
  const setBreathSound = useBreathStore(s => s.setSound);
  const scanEnabled = useScanStore(s => s.enabled);
  const toggleScan = useScanStore(s => s.toggle);
  const bySystem = useMemo(() => {
    const groups = new Map<AnatomicalSystem, ManifestOrgan[]>();
    for (const organ of Object.values(organs)) {
      const list = groups.get(organ.system) ?? [];
      list.push(organ);
      groups.set(organ.system, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => organLabel(a).localeCompare(organLabel(b)));
    }
    return groups;
  }, [organs]);
  const tendonsList = useMemo(() => {
    const list: ManifestOrgan[] = [];
    for (const organ of Object.values(organs)) {
      if (connectiveIds.has(organ.organ_id)) {
        list.push(organ);
      }
    }
    list.sort((a, b) => organLabel(a).localeCompare(organLabel(b)));
    return list;
  }, [organs, connectiveIds]);
  const totalSystems = manifest?.systems.length ?? 12;
  const activeSystemCount = Math.max(0, totalSystems - hiddenSystems.length) + (hideConnective ? 0 : 1) + (heartEnabled ? 1 : 0) + (breathEnabled ? 1 : 0) + (scanEnabled ? 1 : 0);
  const visibilityState = {
    hiddenSystems,
    isolatedOrganIds,
    hiddenOrganIds,
    hideConnective,
    connectiveIds,
    systemOpacity
  };
  const closeSidebarAndFocusModel = () => {
    if (onMobileActionComplete) {
      onMobileActionComplete();
    } else if (typeof document !== "undefined") {
      const closeBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Close sidebar"]');
      closeBtn?.click();
    }
    useSceneStore.getState().fitView();
    setTimeout(() => {
      useSceneStore.getState().fitView();
    }, 60);
    setTimeout(() => {
      useSceneStore.getState().fitView();
    }, 200);
  };
  const activateVisceralBodyScanner = (choice: "echo" | "chest_xray" | "neuro_ct" | "abdomen_us" = "echo") => {
    if (heartEnabled) {
      setHeartSound(false);
      toggleHeart();
    }
    if (breathEnabled) {
      setBreathSound(false);
      toggleBreath();
    }
    const scan = useScanStore.getState();
    scan.setGhost(false);
    scan.setAxial(true);
    scan.setCut(false);
    if (!scan.enabled) {
      scan.toggle();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cb:open-imaging-hub", {
        detail: {
          choice
        }
      }));
    }
    closeSidebarAndFocusModel();
  };
  const handleSelectSystemPanel = (system: AnatomicalSystem) => {
    if (heartEnabled) {
      setHeartSound(false);
      toggleHeart();
    }
    if (breathEnabled) {
      setBreathSound(false);
      toggleBreath();
    }
    if (scanEnabled) {
      toggleScan();
    }
    clearIsolation();
    soloSystem(system);
    closeSidebarAndFocusModel();
  };
  const handleTurnAllOff = () => {
    clearIsolation();
    hideAllSystems();
    if (heartEnabled) {
      setHeartSound(false);
      toggleHeart();
    }
    if (breathEnabled) {
      setBreathSound(false);
      toggleBreath();
    }
    if (scanEnabled) {
      toggleScan();
    }
  };
  const renderPartsDropdown = (panelKey: string, title: string, list: ManifestOrgan[], parentSystem?: AnatomicalSystem) => {
    if (expandedPartsSystem !== panelKey) return null;
    const filtered = list.filter(o => {
      if (mobileBodyRegion !== "all" && !matchesMobileBodyRegion(o, mobileBodyRegion)) {
        return false;
      }
      const rawQ = partsFilter.trim().toLowerCase();
      if (!rawQ) return true;
      const norm = (s: string) => s.toLowerCase().replace(/\bprofundo\b/g, "profunda").replace(/\bcoeliac\b/g, "celiac").replace(/\boesophag/g, "esophag").replace(/\bperoneal\b/g, "fibular").replace(/\bperoneus\b/g, "fibularis");
      const q = norm(rawQ);
      const hay = norm(`${o.name_en} ${o.ta2_latin} ${o.organ_id} ${(o.path ?? []).join(" ")}`);
      if (hay.includes(q)) return true;
      const qTokens = q.split(/\s+/).filter(Boolean);
      return qTokens.length > 1 && qTokens.every(t => hay.includes(t));
    });
    const allShown = filtered.length > 0 && filtered.every(o => isOrganVisible(visibilityState, o));
    const branchGroups = new Map<string, ManifestOrgan[]>();
    for (const o of filtered) {
      const branchLabel = o.path && o.path.length >= 2 ? `${o.path[0]} › ${o.path[1]}` : o.path?.[0] || title;
      const arr = branchGroups.get(branchLabel);
      if (arr) arr.push(o);else branchGroups.set(branchLabel, [o]);
    }
    const hasMultipleBranches = branchGroups.size > 1 && !partsFilter.trim();
    return <div dir={isAr ? "rtl" : "ltr"} onClick={e => e.stopPropagation()} className="mt-2 rounded-xl border border-[#26324d] bg-[#0b1120]/98 p-2 text-start shadow-xl">
        <div className="mb-1.5 flex items-center gap-1">
          <input type="search" value={partsFilter} onChange={e => setPartsFilter(e.target.value)} placeholder={at(`ابحث في ${filtered.length} جزء أو فرع…`, `Filter ${filtered.length} parts & branches…`)} className="flex-1 rounded-lg border border-[#26324d] bg-[#131c31] px-2 py-1 text-[10px] font-semibold text-white outline-none focus:border-emerald-400" />
          <button type="button" onClick={() => toggleOrgansHidden(filtered.map(o => o.organ_id))} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-1.5 py-1 text-[9px] font-black text-[#d98a96]">
            <Check size={10} />
            <span>{allShown ? at("الكل", "All") : at("لا شيء", "None")}</span>
          </button>
        </div>

        <p className="mb-1.5 px-1 font-mono text-[8.5px] font-medium uppercase tracking-[0.15em] text-[#94a3b8]">
          {at("TAP ANY ITEM TO TRACE ITS CHAIN · اختر أي فرع لتتبعه", "TAP ANY ITEM TO TRACE ITS CHAIN")}
        </p>
        <div className="max-h-60 space-y-1.5 overflow-y-auto pr-0.5">
          {hasMultipleBranches ? <div className="relative space-y-1.5 ps-3.5">
              {Array.from(branchGroups.entries()).map(([branchName, items], bIdx) => {
            const gKey = `${panelKey}::${branchName}`;
            const isGroupOpen = Boolean(expandedBranchGroups[gKey]);
            const groupAllShown = items.every(o => isOrganVisible(visibilityState, o));
            const branchAccent = bIdx % 3 === 0 ? "border-s-[3.5px] border-s-[#c83e4d]" : bIdx % 3 === 1 ? "border-s-[3.5px] border-s-[#2563eb]" : "border-s-[3.5px] border-s-[#ca8a04]";
            return <div key={gKey} className="relative">
                    <svg aria-hidden viewBox="0 0 14 24" className="pointer-events-none absolute -start-3.5 top-3.5 h-5 w-3.5 -translate-y-1/2 overflow-visible">
                      <path d="M 1 2 C 1 12, 6 12, 13 12" fill="none" stroke={isGroupOpen ? "#d98a96" : "rgba(163, 155, 144, 0.42)"} strokeWidth={isGroupOpen ? "1.6" : "1.15"} strokeLinecap="round" />
                    </svg>
                    <div className={`rounded-xl border border-[#26324d] ${branchAccent} bg-[#131c31] p-1.5 transition hover:border-[#3b4d71]`}>
                      <div className="flex items-center justify-between gap-1.5">
                        <button type="button" onClick={e => {
                    e.stopPropagation();
                    toggleOrgansHidden(items.map(o => o.organ_id));
                  }} className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${groupAllShown ? "border-emerald-400 bg-emerald-500 text-slate-950" : "border-[#26324d] bg-[#0b1120] text-transparent"}`}>
                          <Check size={10} strokeWidth={3.5} />
                        </button>
                        <button type="button" onClick={() => setExpandedBranchGroups(prev => ({
                    ...prev,
                    [gKey]: !prev[gKey]
                  }))} className="flex min-w-0 flex-1 items-center justify-between gap-1 px-1 py-0.5 text-start">
                          <span className="truncate text-[10px] font-medium text-[#f1f5f9]">
                            {branchName}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 font-mono text-[8.5px] font-medium text-[#94a3b8]">
                            <span>{items.length}</span>
                            {isGroupOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </span>
                        </button>
                      </div>
                      {isGroupOpen && <div className="relative mt-1.5 space-y-1 border-t border-[#26324d] ps-4 pt-1.5">
                          {items.map((o, itemIdx) => {
                    const isSel = selectedOrganIds.includes(o.organ_id);
                    const isShown = isOrganVisible(visibilityState, o);
                    const itemAccent = itemIdx % 3 === 0 ? "border-s-[3px] border-s-[#2563eb]" : itemIdx % 3 === 1 ? "border-s-[3px] border-s-[#c83e4d]" : "border-s-[3px] border-s-[#10b981]";
                    return <div key={o.organ_id} className="relative flex items-center">
                                <svg aria-hidden viewBox="0 0 14 24" className="pointer-events-none absolute -start-3 top-1/2 h-4 w-3 -translate-y-1/2 overflow-visible">
                                  <path d="M 1 2 C 1 12, 6 12, 13 12" fill="none" stroke={isSel ? "#38bdf8" : "rgba(163, 155, 144, 0.38)"} strokeWidth={isSel ? "1.5" : "1.1"} strokeLinecap="round" />
                                </svg>
                                <div className={`flex w-full items-center gap-1.5 rounded-lg border border-[#26324d] ${itemAccent} px-2 py-1 text-start transition ${isSel ? "bg-[#1e293b] text-[#f1f5f9]" : "bg-[#0b1120]/90 hover:bg-[#1e293b] text-white"}`}>
                                  <button type="button" onClick={e => {
                          e.stopPropagation();
                          toggleOrganHidden(o.organ_id);
                        }} className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isShown ? "border-emerald-400 bg-emerald-500 text-slate-950" : "border-[#26324d] bg-[#131c31] text-transparent"}`}>
                                    <Check size={10} strokeWidth={3.5} />
                                  </button>
                                  <button type="button" onClick={() => {
                          if (parentSystem && hiddenSystems.includes(parentSystem)) {
                            toggleSystem(parentSystem);
                          }
                          if (!isShown) {
                            toggleOrganHidden(o.organ_id);
                          }
                          selectOrgan(o.organ_id, false);
                          applyCommand({
                            action: "focus_organ",
                            organ_id: o.organ_id
                          });
                          if (onMobileActionComplete) {
                            onMobileActionComplete();
                          }
                        }} className="flex min-w-0 flex-1 items-center justify-between gap-1 text-start">
                                    <span className={`truncate text-[10px] font-medium ${!isShown ? "line-through opacity-55" : "text-[#f1f5f9]"}`}>
                                      {organLabel(o)}
                                    </span>
                                  </button>
                                </div>
                              </div>;
                  })}
                        </div>}
                    </div>
                  </div>;
          })}
            </div> : <div className="relative space-y-1.5 ps-3.5">
              {filtered.slice(0, 200).map((o, idx) => {
            const isSel = selectedOrganIds.includes(o.organ_id);
            const isShown = isOrganVisible(visibilityState, o);
            const itemAccent = idx % 3 === 0 ? "border-s-[3.5px] border-s-[#c83e4d]" : idx % 3 === 1 ? "border-s-[3.5px] border-s-[#2563eb]" : "border-s-[3.5px] border-s-[#ca8a04]";
            return <div key={o.organ_id} className="relative flex items-center">
                    <svg aria-hidden viewBox="0 0 14 24" className="pointer-events-none absolute -start-3.5 top-1/2 h-5 w-3.5 -translate-y-1/2 overflow-visible">
                      <path d="M 1 2 C 1 12, 6 12, 13 12" fill="none" stroke={isSel ? "#d98a96" : "rgba(163, 155, 144, 0.42)"} strokeWidth={isSel ? "1.6" : "1.15"} strokeLinecap="round" />
                    </svg>
                    <div className={`flex w-full items-center gap-1.5 rounded-xl border border-[#26324d] ${itemAccent} px-2 py-1 text-start transition ${isSel ? "bg-[#1e293b] text-[#f1f5f9]" : "bg-[#131c31] hover:bg-[#1e293b] text-white"}`}>
                      <button type="button" onClick={e => {
                  e.stopPropagation();
                  toggleOrganHidden(o.organ_id);
                }} className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isShown ? "border-emerald-400 bg-emerald-500 text-slate-950" : "border-[#26324d] bg-[#131c31] text-transparent"}`}>
                        <Check size={10} strokeWidth={3.5} />
                      </button>
                      <button type="button" onClick={() => {
                  if (parentSystem && hiddenSystems.includes(parentSystem)) {
                    toggleSystem(parentSystem);
                  }
                  if (!isShown) {
                    toggleOrganHidden(o.organ_id);
                  }
                  selectOrgan(o.organ_id, false);
                  applyCommand({
                    action: "focus_organ",
                    organ_id: o.organ_id
                  });
                  if (onMobileActionComplete) {
                    onMobileActionComplete();
                  }
                }} className="flex min-w-0 flex-1 items-center justify-between gap-1 text-start">
                        <span className={`truncate text-[10px] font-medium ${!isShown ? "line-through opacity-55" : "text-[#f1f5f9]"}`}>
                          {organLabel(o)}
                        </span>
                      </button>
                    </div>
                  </div>;
          })}
            </div>}
        </div>
      </div>;
  };
  const SYSTEM_DESCRIPTIONS_AR: Record<string, string> = {
    skeletal: "دراسة العظام المحورية والطرفية والمعالم التشريحية ومناطق اتصال العضلات.",
    muscular: "استعراض العضلات الهيكلية مع المنشأ والمرتكز والأكشن والتغذية العصبية والدموية.",
    articular: "المفاصل الزليلية والغضروفية والمحافظ المفصلية والأربطة الداعمة.",
    tendons: "الأوتار والصفاقات والأغماد الوترية واللفافات العميقة والسطحية.",
    nervous: "الجهاز العصبي المركزي والطرفي والضفائر العصبية ومساراتها والعضلات التي تغذيها.",
    lymphatic: "العقد والأوعية الليمفاوية والقنوات الرئيسية ومسارات التصريف الليمفاوي السريري.",
    cardiovascular: "القلب والشرايين والأوردة الجهازية والرئوية والتفاغرات الوعائية والأعضاء المغذاة.",
    respiratory: "المسالك الهوائية العليا والسفلى والرئتين والفصوص والغشاء البلوري.",
    digestive: "القناة الهضمية والكبد والمرارة والبنكرياس والعلاقات البريتونية.",
    renal: "الكليتين والحالبين والمثانة البولية والإحليل والتروية الكلوية.",
    endocrine: "الغدد الصماء الرئيسية: النخامية والدرقية والجار درقية والكظرية.",
    reproductive: "الأعضاء التناسلية الذكرية والأنثوية وتراكيب الحوض والعجان."
  };
  const SYSTEM_DESCRIPTIONS_EN: Record<string, string> = {
    skeletal: "Explore axial and appendicular bones, osteological landmarks, and attachment sites.",
    muscular: "Inspect skeletal muscles with origin, insertion, action, and neurovascular supply.",
    articular: "Synovial and cartilaginous joints, articular capsules, and stabilizing ligaments.",
    tendons: "Tendons, aponeuroses, retinacula, tendon sheaths, and deep fascial planes.",
    nervous: "Central and peripheral nervous system, plexuses, courses, and innervated muscles.",
    lymphatic: "Regional lymph nodes, lymphatic trunks, ducts, and clinical drainage pathways.",
    cardiovascular: "Heart chambers, systemic and pulmonary arteries and veins, and supplied organs.",
    respiratory: "Upper and lower airways, bronchial tree, lungs, lobes, and pleura.",
    digestive: "Alimentary tract, liver, biliary tree, pancreas, and peritoneal relations.",
    renal: "Kidneys, renal segments, ureters, urinary bladder, and urethra.",
    endocrine: "Pituitary, thyroid, parathyroid, adrenal, and endocrine pancreatic glands.",
    reproductive: "Male and female reproductive organs, pelvic floor, and perineal structures."
  };
  const SYSTEM_LATIN_META: Record<string, string> = {
    skeletal: "TA2: Systema skeletale",
    muscular: "TA2: Systema musculare",
    articular: "TA2: Juncturae",
    tendons: "TA2: Fasciae et tendines",
    nervous: "TA2: Systema nervosum",
    lymphatic: "TA2: Systema lymphoideum",
    cardiovascular: "TA2: Systema cardiovasculare",
    respiratory: "TA2: Systema respiratorium",
    digestive: "TA2: Systema digestorium",
    renal: "TA2: Systema urinarium",
    endocrine: "TA2: Glandulae endocrinae",
    reproductive: "TA2: Systemata genitalia"
  };
  const renderSystemCard = (spec: SystemCardSpec) => {
    const localizedTitle = isAr ? spec.title_ar || spec.title : spec.title;
    if (spec.id === "tendons") {
      const list = tendonsList;
      if (list.length === 0) return null;
      const isVisible = !hideConnective;
      const desc = isAr ? SYSTEM_DESCRIPTIONS_AR.tendons : SYSTEM_DESCRIPTIONS_EN.tendons;
      return <div key="tendons" dir={isAr ? "rtl" : "ltr"} className={`self-start flex flex-col justify-between rounded-2xl border p-4 transition ${isVisible ? "border-[#3b4d71] bg-[#131c31]" : "border-[#26324d] bg-[#131c31] hover:border-[#3b4d71] hover:bg-[#1e293b]"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Folder size={16} strokeWidth={1.6} className="text-[#94a3b8]" />
                <span className="font-mono text-[10px] text-[#94a3b8]">
                  {isVisible ? at("مفعل · ON", "Active · ON") : at("متوقف · OFF", "Inactive · OFF")}
                </span>
              </div>

              <h3 onClick={() => {
              setHideConnective(!hideConnective);
              if (hideConnective) closeSidebarAndFocusModel();
            }} className="mt-2 cursor-pointer text-[15px] font-bold tracking-tight text-[#d98a96]">
                {localizedTitle}
              </h3>

              <p className="mt-1 text-[11.5px] font-normal leading-relaxed text-[#94a3b8]">
                {desc}
              </p>

              <p className="mt-2 font-mono text-[10.5px] text-[#94a3b8]">
                {SYSTEM_LATIN_META.tendons}
              </p>
            </div>

            <div onClick={() => {
            setHideConnective(!hideConnective);
            if (hideConnective) closeSidebarAndFocusModel();
          }} className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[#26324d] bg-[#0b1120] p-0.5">
              <SystemIllustration id="tendons" accent="#d98a96" />
            </div>
          </div>

          {renderPartsDropdown("tendons", localizedTitle, list)}

          <div className="mt-3 flex items-center justify-between border-t border-[#26324d] pt-2.5 font-mono text-[11px] text-[#94a3b8]">
            <button type="button" onClick={e => {
            e.stopPropagation();
            setExpandedPartsSystem(prev => prev === "tendons" ? null : "tendons");
          }} className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#f1f5f9]">
              <span>{list.length} {at("عنصر تشريحي", "sections")}</span>
            </button>
            <button type="button" onClick={() => {
            setHideConnective(!hideConnective);
            if (hideConnective) closeSidebarAndFocusModel();
          }} className="inline-flex items-center gap-1 text-[#f1f5f9] hover:underline">
              <span>{isVisible ? at("إخفاء", "Hide") : at("عرض", "Open")}</span>
              <ChevronRight size={13} className="text-[#94a3b8]" />
            </button>
          </div>
        </div>;
    }
    const system = spec.system;
    if (!system || system === "integumentary" || system === "regional") return null;
    const list = bySystem.get(system) ?? [];
    if (list.length === 0) return null;
    const isVisible = !hiddenSystems.includes(system) && (systemOpacity[system] ?? 1) >= 0.5;
    const desc = isAr ? SYSTEM_DESCRIPTIONS_AR[system] || spec.subtitle : SYSTEM_DESCRIPTIONS_EN[system] || spec.subtitle;
    const latinMeta = SYSTEM_LATIN_META[system] || `System: ${system}`;
    const dotColor = SYSTEM_COLOURS[system] ?? "#d98a96";
    return <div key={system} dir={isAr ? "rtl" : "ltr"} className={`self-start flex flex-col justify-between rounded-2xl border p-4 transition ${isVisible ? "border-[#3b4d71] bg-[#131c31]" : "border-[#26324d] bg-[#131c31] hover:border-[#3b4d71] hover:bg-[#1e293b]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Folder size={16} strokeWidth={1.6} className="text-[#94a3b8]" />
              <span className="font-mono text-[10px] text-[#94a3b8]">
                {isVisible ? at("مفعل · ON", "Active · ON") : at("متوقف · OFF", "Inactive · OFF")}
              </span>
              <button type="button" onClick={() => {
              if (!isVisible) toggleSystem(system);
              cycleSystemOpacity(system);
            }} title={at("تغيير درجة الشفافية", "Cycle opacity")} className="inline-flex h-5 w-5 items-center justify-center rounded border border-[#26324d] bg-[#0f172a] text-[#94a3b8] hover:text-[#f1f5f9]">
                <Contrast size={11} />
              </button>
            </div>

            <h3 onClick={() => handleSelectSystemPanel(system)} className="mt-2 cursor-pointer text-[15px] font-bold tracking-tight text-[#d98a96]">
              {localizedTitle}
            </h3>

            <p onClick={() => handleSelectSystemPanel(system)} className="mt-1 cursor-pointer text-[11.5px] font-normal leading-relaxed text-[#94a3b8]">
              {desc}
            </p>

            <p className="mt-2 font-mono text-[10.5px] text-[#94a3b8]">
              {latinMeta}
            </p>
          </div>

          <div onClick={() => handleSelectSystemPanel(system)} className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[#26324d] bg-[#0b1120] p-0.5">
            <SystemIllustration id={spec.id} accent={dotColor} />
          </div>
        </div>

        {system === "reproductive" && <div className="mt-2.5 flex items-center gap-1.5">
            <button type="button" onClick={() => {
          if (heartEnabled) {
            setHeartSound(false);
            toggleHeart();
          }
          if (breathEnabled) {
            setBreathSound(false);
            toggleBreath();
          }
          if (scanEnabled) {
            toggleScan();
          }
          switchReproductiveGender("male");
          closeSidebarAndFocusModel();
        }} className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${isVisible && genderModel === "male" ? "border-[#3b4d71] bg-[#26324d] text-[#f1f5f9]" : "border-[#26324d] bg-[#0f172a] text-[#94a3b8]"}`}>
              <User size={11} />
              <span>{at("ذكري (Male)", "Male")}</span>
            </button>
            <button type="button" onClick={() => {
          if (heartEnabled) {
            setHeartSound(false);
            toggleHeart();
          }
          if (breathEnabled) {
            setBreathSound(false);
            toggleBreath();
          }
          if (scanEnabled) {
            toggleScan();
          }
          switchReproductiveGender("female");
          closeSidebarAndFocusModel();
        }} className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${isVisible && genderModel === "female" ? "border-[#3b4d71] bg-[#26324d] text-[#f1f5f9]" : "border-[#26324d] bg-[#0f172a] text-[#94a3b8]"}`}>
              <User size={11} />
              <span>{at("أنثوي (Female)", "Female")}</span>
            </button>
          </div>}

        {renderPartsDropdown(system, localizedTitle, list, system)}

        {}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[#26324d] pt-2.5">
          <button type="button" onClick={e => {
          e.stopPropagation();
          if (isVisible) {
            hideAllSystems();
          } else {
            handleSelectSystemPanel(system);
          }
        }} className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold shadow-sm transition ${isVisible ? "border-rose-400/70 bg-rose-500/25 text-[#f1f5f9] hover:bg-rose-500/40" : "border-emerald-400/70 bg-emerald-500/25 text-[#f1f5f9] hover:bg-emerald-500/40"}`}>
            {isVisible ? <EyeOff size={13} className="text-rose-300" /> : <Eye size={13} className="text-emerald-300" />}
            <span>
              {isVisible ? at("إخفاء المجسم · Hide 3D Model", "Hide 3D Model") : at("إظهار المجسم 3D · Show 3D Model", "Show 3D Model")}
            </span>
          </button>

          {(spec.category === "Regional Anatomy" || system === "nervous" || system === "lymphatic") && <button type="button" onClick={e => {
          e.stopPropagation();
          if (!isVisible) {
            toggleSystem(system);
          } else {
            toggleNervousBodyContext();
          }
        }} className={`inline-flex items-center justify-center gap-1 rounded-xl border px-2.5 py-1.5 text-[10.5px] font-bold transition ${isVisible && !hiddenSystems.includes("skeletal") ? "border-amber-400/75 bg-amber-500/25 text-amber-100 hover:bg-amber-500/40" : "border-[#26324d] bg-[#0f172a] text-[#94a3b8] hover:border-amber-400/60 hover:text-[#f1f5f9]"}`} title={at("إظهار أو إخفاء مجسم الجسم المحيط بالعضو", "Show or Hide outer 3D Body Model")}>
              <Layers size={12} />
              <span>
                {isVisible && !hiddenSystems.includes("skeletal") ? at("بمجسم الجسم · Body ON", "Body ON") : at("بدون الجسم · Body OFF", "Body OFF")}
              </span>
            </button>}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[#26324d]/60 pt-2 font-mono text-[11px] text-[#94a3b8]">
          <button type="button" onClick={e => {
          e.stopPropagation();
          setExpandedPartsSystem(prev => prev === system ? null : system);
        }} className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#f1f5f9]">
            <ClipboardList size={11} />
            <span>{list.length} {at("قسم تشريحي", "anatomical parts")}</span>
          </button>
          <button type="button" onClick={() => handleSelectSystemPanel(system)} className="inline-flex items-center gap-1 font-bold text-[#d98a96] hover:underline">
            <span>{isVisible ? at("تركيز المجسم · Focus", "Focus 3D") : at("فتح المجسم · Open 3D", "Open 3D")}</span>
            <ChevronRight size={13} className="text-[#d98a96]" />
          </button>
        </div>
      </div>;
  };
  const renderSoundImagingCard = (spec: SystemCardSpec) => {
    const isHeart = spec.id === "heart_sounds";
    const isBreath = spec.id === "breath_sounds";
    const isActive = isHeart ? heartEnabled : isBreath ? breathEnabled : scanEnabled;
    const localizedTitle = isAr ? spec.title_ar || spec.title : spec.title;
    const desc = isHeart ? at("محاكاة صوتية وحركية لنبض القلب وتخطيط ECG واللغط القلبي (S1/S2 & Murmurs).", "Interactive cardiac auscultation, live 3D myocardial contraction, ECG strip, and murmurs.") : isBreath ? at("محاكاة حركية وصوتية للشهيق والزفير وحركة الحجاب الحاجز والقفص الصدري.", "Dynamic respiratory mechanics, diaphragm descent, rib-cage excursion, and breath sounds.") : at("قاعدة بيانات الأشعة المقطعية والإيكو والسونار (60 حالة مرضية) مع أداة التشخيص الإشعاعي.", "Clinical radiology & pathology database (60 cases) across Echo, Chest, Neuro CT & Abdominal US.");
    const handleTrigger = () => {
      if (isHeart) {
        if (breathEnabled) {
          setBreathSound(false);
          toggleBreath();
        }
        if (scanEnabled) {
          toggleScan();
        }
        if (!heartEnabled) {
          primeHeartSound();
          clearIsolation();
          useSceneStore.getState().clearSelection();
          useSceneStore.getState().studyGroup("Heart");
          useSceneStore.getState().clearGhosting();
          useSceneStore.getState().fitView();
          setHeartSound(true);
          toggleHeart();
          closeSidebarAndFocusModel();
        } else {
          setHeartSound(false);
          clearIsolation();
          useSceneStore.getState().clearSelection();
          hideAllSystems();
          toggleHeart();
        }
      } else if (isBreath) {
        if (heartEnabled) {
          setHeartSound(false);
          clearIsolation();
          toggleHeart();
        }
        if (scanEnabled) {
          toggleScan();
        }
        if (!breathEnabled) {
          primeBreathSound();
          clearIsolation();
          useSceneStore.getState().clearSelection();
          hideAllSystems();
          setBreathSound(true);
          toggleBreath();
          closeSidebarAndFocusModel();
        } else {
          setBreathSound(false);
          clearIsolation();
          useSceneStore.getState().clearSelection();
          hideAllSystems();
          toggleBreath();
        }
      } else {
        if (!scanEnabled) {
          activateVisceralBodyScanner("echo");
        } else {
          toggleScan();
        }
      }
    };
    return <div key={spec.id} dir={isAr ? "rtl" : "ltr"} className={`self-start flex flex-col justify-between rounded-2xl border p-4 transition ${isActive ? "border-[#3b4d71] bg-[#131c31]" : "border-[#26324d] bg-[#131c31] hover:border-[#3b4d71] hover:bg-[#1e293b]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Folder size={16} strokeWidth={1.6} className="text-[#94a3b8]" />
              <span className="font-mono text-[10px] text-[#94a3b8]">
                {isActive ? at("مفعل · ON", "Active · ON") : at("متوقف · OFF", "Ready · OFF")}
              </span>
            </div>

            <h3 onClick={handleTrigger} className="mt-2 cursor-pointer text-[15px] font-bold tracking-tight text-[#d98a96]">
              {localizedTitle}
            </h3>

            <p onClick={handleTrigger} className="mt-1 cursor-pointer text-[11.5px] font-normal leading-relaxed text-[#94a3b8]">
              {desc}
            </p>

            <p className="mt-2 font-mono text-[10.5px] text-[#94a3b8]">
              {isHeart ? "Clinical Auscultation · S1 / S2 / ECG" : isBreath ? "Respiratory Mechanics · Inspiration / Expiration" : "Radiology Suite · 60 Clinical Cases"}
            </p>
          </div>

          <div onClick={handleTrigger} className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[#26324d] bg-[#0b1120] p-1">
            <SystemIllustration id={spec.id} accent="#d98a96" />
          </div>
        </div>

        {!isHeart && !isBreath && <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => activateVisceralBodyScanner("echo")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#26324d] bg-[#0f172a] px-2.5 py-1.5 text-start text-[10.5px] font-bold text-[#f1f5f9] hover:border-[#3b4d71]">
              <Heart size={12} className="shrink-0 text-[#d98a96]" />
              <span>{at("١. إيكو القلب", "1. Heart Echo")}</span>
            </button>
            <button type="button" onClick={() => activateVisceralBodyScanner("chest_xray")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#26324d] bg-[#0f172a] px-2.5 py-1.5 text-start text-[10.5px] font-bold text-[#f1f5f9] hover:border-[#3b4d71]">
              <Wind size={12} className="shrink-0 text-[#d98a96]" />
              <span>{at("٢. أشعة الصدر", "2. Chest Radiology")}</span>
            </button>
            <button type="button" onClick={() => activateVisceralBodyScanner("neuro_ct")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#26324d] bg-[#0f172a] px-2.5 py-1.5 text-start text-[10.5px] font-bold text-[#f1f5f9] hover:border-[#3b4d71]">
              <Brain size={12} className="shrink-0 text-[#d98a96]" />
              <span>{at("٣. مقطعية الرأس", "3. Head CT")}</span>
            </button>
            <button type="button" onClick={() => activateVisceralBodyScanner("abdomen_us")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#26324d] bg-[#0f172a] px-2.5 py-1.5 text-start text-[10.5px] font-bold text-[#f1f5f9] hover:border-[#3b4d71]">
              <Stethoscope size={12} className="shrink-0 text-[#d98a96]" />
              <span>{at("٤. الجهاز الهضمي", "4. Digestive")}</span>
            </button>
          </div>}

        <div onClick={handleTrigger} className="mt-3 flex cursor-pointer items-center justify-between border-t border-[#26324d] pt-2.5 font-mono text-[11px] text-[#94a3b8]">
          <span>{isHeart ? "8 rhythms" : isBreath ? "11 patterns" : "5 modalities · 68 cases"}</span>
          <span className="inline-flex items-center gap-1 text-[#f1f5f9]">
            <span>{isActive ? at("إيقاف", "Stop") : at("تشغيل", "Launch")}</span>
            <ChevronRight size={13} className="text-[#94a3b8]" />
          </span>
        </div>
      </div>;
  };
  return <div className={`flex h-full min-h-0 flex-col overflow-hidden ${isLight ? "bg-[#f0f7ff] text-[#0b1120]" : "bg-[#0b1120] text-[#f1f5f9]"}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-1 min-h-0 flex-col gap-2.5 overflow-y-auto px-3 py-3">
        <div className="flex items-center justify-between px-1 pb-0.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#d98a96]">
            {at("الأصوات السريرية (القلب والتنفس)", "Clinical Heart & Breath Sounds")}
          </h2>
          <span className="font-mono text-[10px] text-[#94a3b8]">
            2 {at("وحدات", "modules")} · 19 {at("نمطاً", "patterns")}
          </span>
        </div>

        <div className="space-y-3">
          {SOUNDS_AND_IMAGING_PANELS.filter(spec => spec.id === "heart_sounds" || spec.id === "breath_sounds").map(spec => renderSoundImagingCard(spec))}
        </div>
      </div>
    </div>;
}
