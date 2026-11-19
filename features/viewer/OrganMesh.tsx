'use client';

import { memo, useCallback, useEffect, useMemo, useRef , useState } from "react";
import * as THREE from "three";

import { GHOST_CLICK_THROUGH, useSceneStore, type PathologyOverlay } from "@/stores/sceneStore";
import { useInspector3DStore } from "./anatomySceneTypes";

import { reportClick } from "./depthStack";
import { pressTravelled, shouldRunRaycastPass } from "./dragGuard";

import { shouldSuppressClick } from "./areaSelect";
import { coverageColour } from "./coverage";
import { registerCarry } from "./breathCarry";
import { BREATH_ROLE, breathData, breathOnBeforeCompile } from "./breathing";
import { scanColour, type BodyTone } from "./scan";
import { ATLAS_STYLE } from "./background";
export { ATLAS_STYLE } from "./background";
import { FACING, scanBandMaterialProps, scanRangeAlong, STANDING } from "./scanBand";
import {
  beatChamber,
  heartbeatOnBeforeCompile,
  isAtrium,
  isChamberWall,
  registerBeating,
} from "./heartbeat";
import { flowMaterial, isFlowSeed, registerFlowing, vesselFlow } from "./bloodFlow";
import { useHeartStore } from "@/stores/heartStore";
import { useBreathStore } from "@/stores/breathStore";
import { useScanStore } from "@/stores/scanStore";
import { probeGlow, reportDepthStack, stackFromCrossings } from "./depthStack";
import type { AnatomicalSystem, ManifestOrgan } from "@/lib/schemas";

function useSafeStore<S, T>(
  store: { getState: () => S; subscribe: (listener: (state: S) => void) => () => void },
  selector: (state: S) => T,
): T {
  const selRef = useRef(selector);
  selRef.current = selector;
  const [val, setVal] = useState<T>(() => selRef.current(store.getState()));
  useEffect(() => {
    setVal((prev) => {
      const next = selRef.current(store.getState());
      return Object.is(prev, next) ? prev : next;
    });
    return store.subscribe((st) => {
      setVal((prev) => {
        const next = selRef.current(st);
        return Object.is(prev, next) ? prev : next;
      });
    });
  }, [store]);
  return val;
}


// --- INLINED ANATOMICAL TISSUE PALETTE & PBR MICROSTRUCTURE DEFINITIONS ---

/**
 * Gray's Atlas & Netter's Atlas Photorealistic 3D Anatomical Tissue Palette (`palette.ts`).
 *
 * Calibrated against Gray's Atlas of Anatomy, Netter's Atlas of Human Anatomy (8th Ed), and VOKA 3D:
 * - Warm natural cortical bone ivory (#f3ecdc) & pearlescent collagenous tendons (#eee6d5)
 * - Rich striated crimson-terracotta muscle bellies (#b9444d) with anisotropic myofibrillar sheen
 * - Wet myocardial & arterial crimson (#c63d47) and sapphire venous blue (#4472b8)
 * - Translucent rose-pearl pleura & lungs (#ebb4be)
 * - Coral-pink cerebral cortex gyri (#e5989e) & myelinated nerve gold (#eedb7a)
 */
export const SYSTEM_COLOURS: Record<AnatomicalSystem, string> = {
  //: Ivory/bone-white (#EFE6D8)
  skeletal: ATLAS_STYLE.bones.color,
  //: Glossy sky-cyan hyaline cartilage & joint capsules
  articular: "#38bdf8",
  //: Soft salmon-pink (#E8A09A) Human Atlas pastel clay
  muscular: ATLAS_STYLE.muscles.baseColor,
  //: Deep oxygenated myocardium & arterial tone
  cardiovascular: "#c63d47",
  //: Warm myelinated peripheral nerve gold
  nervous: "#eedb7a",
  //: Calm sage-emerald for lymphatics
  lymphatic: "#22c55e",
  //: Visceral serosa coral-terracotta for digestive tract
  digestive: "#d48c6f",
  //: Soft translucent rose-pink for lungs & pleura
  respiratory: "#ebb4be",
  //: Rich renal cortex mahogany-rose
  renal: "#aa5344",
  //: Glandular honey-amber for endocrine glands
  endocrine: "#c084fc",
  //: Visceral rose-mauve for reproductive organs
  reproductive: "#cc85a2",
  //: Natural dermal & mammary tone
  integumentary: "#c6bfb7",
  //: Natural dermal & surface regional skin tone
  regional: "#e7baa4",
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
  regional: "Surface & regional",
};

/** One entry in the legend: a colour, and what it means. */
export interface TissueFamily {
  id: string;
  label: string;
  hex: string;
}

/** Venous blood sapphire blue. */
const VEIN_BLUE = "#4472b8";
/** Arterial blood bright oxygenated red. */
const ARTERY_RED = "#d6423d";

const VENOUS = /\b(vena|venae|venous|vein|veins|sinus)\b/i;
const ARTERIAL = /\b(arteria|arteriae|arterial|artery|arteries|aorta|truncus)\b/i;

interface TissueRule {
  readonly id: string;
  readonly label: string;
  readonly test: RegExp;
  readonly colour: string;
  readonly systems?: readonly AnatomicalSystem[];
}

const RULES: readonly TissueRule[] = [
  // Pale cream (#F3E3D3) for Tendons, Aponeuroses & Fascia ("Tendons / fascia: pale cream (#F3E3D3), roughness 0.8")
  {
    id: "muscular-tendon",
    label: "Aponeurosis, tendon & retinaculum (Muscular)",
    test: /\b(aponeurosis|iliotibial|thoracolumbar|investing abdominal|inguinal ligament|iliopectineal|superficial transverse|tendo|tendon|tendons|tendinis|retinaculum|sheath|vincula|chiasm|fascia)\b/i,
    colour: ATLAS_STYLE.tendons.color,
    systems: ["muscular"],
  },
  {
    id: "connective",
    label: "Tendon, sheath & retinaculum",
    test: /\b(tendo|tendon|tendons|tendinis|retinaculum|sheath|vincula|chiasm|aponeurosis|iliotibial|fascia)\b/i,
    colour: ATLAS_STYLE.tendons.color,
  },
  // Vivid Hyaline Sky Cyan-Blue Cartilages, Costal Cartilages, Laryngeal Cartilages, Menisci, Labra & Intervertebral Discs
  {
    id: "reproductive-ovary",
    label: "Ovary",
    test: /\b(ovar|ovarium|ovary)\b/i,
    colour: "#f3dfb6",
    systems: ["reproductive", "endocrine"],
  },
  {
    id: "reproductive-tube",
    label: "Uterine (Fallopian) tube & fimbriae",
    test: /\b(uterine tube|fallopian|salpinx|ampulla of uterine|infundibulum of uterine|isthmus of uterine|fimbriae)\b/i,
    colour: "#e07a72",
    systems: ["reproductive"],
  },
  {
    id: "reproductive-uterus",
    label: "Uterus, fundus & cervix",
    test: /\b(uterus|uteri|uterine|fundus of uterus|body of uterus|cervix|cervical os)\b/i,
    colour: "#d46a7e",
    systems: ["reproductive"],
  },
  {
    id: "reproductive-vagina",
    label: "Vagina",
    test: /\b(vagina|vaginal)\b/i,
    colour: "#b85468",
    systems: ["reproductive"],
  },
  {
    id: "reproductive-ligament",
    label: "Pelvic & uterine supporting ligaments",
    test: /\b(round ligament|ovarian ligament|suspensory ligament|cardinal ligament|uterosacral ligament|broad ligament)\b/i,
    colour: "#dfb8b0",
    systems: ["reproductive"],
  },
  {
    id: "cartilage",
    label: "Cartilage, meniscus & disc",
    test: /\b(cartilago|cartilage|cartilagines|meniscus|discus|intervertebral disc|nucleus pulposus|articular disc|labrum|symphysis|synchondrosis)\b/i,
    colour: "#38bdf8",
    systems: ["skeletal", "articular", "respiratory"],
  },
  // Vivid Sky Cyan-Blue Joint Capsules & Articular Ligaments (matching Cartilage & Joints color #38bdf8)
  {
    id: "ligament",
    label: "Joint capsule & ligament",
    test: /\b(ligamentum|ligament|ligaments|ligamenta|frenula|capsula articularis|articular capsule|syndesmosis|membrane|oblique cord)\b/i,
    colour: "#38bdf8",
    systems: ["skeletal", "articular"],
  },
  {
    id: "bursa",
    label: "Synovial bursa",
    test: /\b(bursa|bursae)\b/i,
    colour: "#7dd3fc",
  },
  {
    id: "fat",
    label: "Fat",
    test: /\b(adiposum|adipose|fat|panniculus|corpus adiposum)\b/i,
    colour: "#e8cd6e",
  },
  {
    id: "tooth",
    label: "Tooth",
    test: /\b(dens|dentes|tooth|teeth|molaris|incisivus|caninus|enamel|enamelum)\b/i,
    colour: "#f9f6ee",
    systems: ["digestive", "skeletal"],
  },

  // Nervous tissue (Gray's / Netter's coral-pink cortex, deep sulcal shadow grooves & ivory white matter)
  {
    id: "cerebral-sulcus",
    label: "Cerebral sulcus & fissure shadow",
    test: /\b(sulcus|sulci|fissura|fissure)\b/i,
    colour: "#38141c",
    systems: ["nervous"],
  },
  {
    id: "grey-matter",
    label: "Cerebral & cerebellar cortex",
    test: /\b(substantia grisea|grey matter|gray matter|cortex|cerebr|cerebell|gyrus|lobus|lobe|thalam|putamen|caudat|hippocamp|insula|rectus|precuneus|cuneus|culmen|declive|flocculus|tonsil of cerebellum|lingula|uvula|nodulus|pyramis|tuber|folium|amygdal|claustrum|pallidus|uncus|subiculum)\b/i,
    colour: "#e4969c",
  },
  {
    id: "white-matter",
    label: "White matter",
    test: /\b(substantia alba|white matter|corpus callosum|fornix|pedunculus|pons|medulla oblongata|corona radiata|capsula interna)\b/i,
    colour: "#f0e7db",
  },
  { id: "dura", label: "Dura mater", test: /\b(dura mater|dural|falx|tentorium)\b/i, colour: "#c8b4a0" },
  {
    id: "spinal-cord",
    label: "Spinal cord",
    test: /\b(medulla spinalis|spinal cord|canalis centralis|central canal)\b/i,
    colour: "#ede3ce",
  },

  // Viscera
  { id: "liver", label: "Liver", test: /\b(hepar|liver|hepatis)\b/i, colour: "#8a3c2f" },
  {
    id: "biliary",
    label: "Gallbladder & bile",
    test: /\b(vesica biliaris|vesica fellea|gallbladder|bilis|bile|ductus choledochus|ductus cysticus|ductus hepaticus|ampulla hepatopancreatica)\b/i,
    colour: "#4f7d3b",
  },
  {
    id: "spleen",
    label: "Spleen",
    test: /\b(splen|lien|spleen|splenic)\b/i,
    colour: "#7a3452",
  },
  { id: "pancreas", label: "Pancreas", test: /\b(pancreas|pancreatic)\b/i, colour: "#e1c68e" },
  { id: "stomach", label: "Stomach", test: /\b(gaster|stomach|gastric|pylor)\b/i, colour: "#cf8672" },
  { id: "lung", label: "Lung", test: /\b(pulmo|lung|lungs|pulmonis)\b/i, colour: "#ebb4be" },
  {
    id: "bronchus",
    label: "Trachea & bronchi",
    test: /\b(trachea|bronchus|bronchi|larynx)\b/i,
    colour: "#67e8f9",
  },
  {
    id: "parathyroid",
    label: "Parathyroid gland",
    test: /\b(parathyroid|parathyroidea)\b/i,
    colour: "#facc15",
  },
  {
    id: "neuroendocrine",
    label: "Hypothalamus, pituitary & pineal",
    test: /\b(hypothalamus|adenohypophysis|neurohypophysis|hypophysis|pituitary|pineal|pinealis)\b/i,
    colour: "#c084fc",
  },
  {
    id: "kidney",
    label: "Kidney",
    test: /\b(ren|renis|kidney|kidneys|renal cortex|renal medulla|renal pyramid|calyx)\b/i,
    colour: "#aa5344",
  },
  {
    id: "adrenal",
    label: "Adrenal gland",
    test: /\b(glandula suprarenalis|suprarenal|adrenal)\b/i,
    colour: "#e0b750",
  },
  {
    id: "thyroid",
    label: "Thyroid & salivary gland",
    test: /\b(glandula thyroidea|thyroid|thyroidea|parotis|parotid|submandibularis|sublingualis)\b/i,
    colour: "#b25a4c",
  },
  {
    id: "myocardium",
    label: "Myocardium & heart",
    test: /\b(myocardium|myocardial|cor\b|ventricul|atrium|auricula)\b/i,
    colour: "#be404a",
    systems: ["cardiovascular"],
  },
  {
    id: "heart-valve",
    label: "Cardiac valve & chordae",
    test: /\b(valva|valve|cuspis|chordae tendineae|annulus fibrosus)\b/i,
    colour: "#eae1d4",
    systems: ["cardiovascular"],
  },
  // Primary & mucosa-associated lymphoid organs in crimson-red matching the reference anatomical diagram
  {
    id: "lymphoid-organ",
    label: "Primary & mucosal lymphoid organ",
    test: /\b(tonsilla|tonsil|thymus|thymi|vermiform appendix|bone marrow of humerus|medulla ossium rubra)\b/i,
    colour: "#dc2626",
  },
  {
    id: "lymphoid-venous-angle",
    label: "Venous angle confluence",
    test: /\b(venous angle)\b/i,
    colour: "#0284c7",
  },
  {
    id: "lymphatic-vessel",
    label: "Lymphatic vessel & trunk",
    test: /\b(thoracic duct|cisterna chyli|lymphatic duct|lymphatic trunk|lymphatic vessels|lymphatic plexus)\b/i,
    colour: "#4ade80",
  },
  {
    id: "lymphoid",
    label: "Lymph node",
    test: /\b(nodus|nodi|node|nodes|lymph)\b/i,
    colour: "#16a34a",
  },

  // Eye
  { id: "sclera", label: "Sclera", test: /\b(sclera|scleral)\b/i, colour: "#f5f1e9" },
  { id: "iris", label: "Iris", test: /\biris\b/i, colour: "#3d6ea8" },
  {
    id: "ocular-interior",
    label: "Vitreous body",
    test: /\b(corpus vitreum|humor vitreus|vitreous)\b/i,
    colour: "#141a24",
  },
  {
    id: "ocular-clear",
    label: "Cornea & lens",
    test: /\b(cornea|corneal|lens|lentis|camera anterior|anterior chamber|segmentum anterius|anterior segment)\b/i,
    colour: "#cfe2ea",
  },

  // Keratin & Mammary
  { id: "nail", label: "Nail", test: /\b(unguis|nail|nails|perionyx)\b/i, colour: "#edd2c6" },
  { id: "hair", label: "Hair", test: /\b(pilus|pili|hair|hairs|capilli|cilia|eyelash|eyebrow|supercilii|pubes)\b/i, colour: "#564132" },
  { id: "mammary", label: "Mammary gland & breast", test: /\b(mammary|mammaria|breast|inframammary)\b/i, colour: "#e8b4a0" },
];

export interface Tissue {
  organ_id: string;
  ta2_latin: string;
  name_en: string;
  system: AnatomicalSystem;
  path?: readonly string[];
}

export function tissueFamily(organ: Tissue): TissueFamily {
  const name = `${organ.ta2_latin} ${organ.name_en}`;

  if (
    organ.organ_id.startsWith("skel_tendon_") ||
    organ.path?.[0] === "Tendons" ||
    organ.path?.[0] === "Tendons, Sheaths & Retinacula"
  ) {
    return { id: "connective", label: "Tendon, sheath & retinaculum", hex: ATLAS_STYLE.tendons.color };
  }

  if (organ.system === "cardiovascular") {
    if (VENOUS.test(name)) return { id: "vein", label: "Vein", hex: VEIN_BLUE };
    if (ARTERIAL.test(name)) return { id: "artery", label: "Artery", hex: ARTERY_RED };
  }

  for (const rule of RULES) {
    if (rule.systems && !rule.systems.includes(organ.system)) continue;
    if (rule.test.test(name)) {
      return { id: rule.id, label: rule.label, hex: rule.colour };
    }
  }

  return {
    id: organ.system,
    label: SYSTEM_LABELS[organ.system],
    hex: SYSTEM_COLOURS[organ.system],
  };
}

/**
 * Maps an organ to its procedural shader microstructure ID (`uTissueType` in `OrganMesh.tsx`):
 *  0 = Cortical/cancellous bone & teeth (Haversian longitudinal grain + mineral micropores)
 *  1 = Striated skeletal muscle belly (anisotropic myofibrillar fascicles & perimysial grooves)
 *  2 = Tendon, aponeurosis, ligament, cartilage & meniscus (dense parallel collagenous fibril shimmer)
 *  3 = Myocardium, arteries & veins (helical/tunica media weave + wet endothelial dual-lobe clearcoat)
 *  4 = Cerebral/cerebellar cortex, white matter & myelinated nerves (gyral-sulcal shading + fascicular sheen)
 *  5 = Parenchymal viscera: liver, kidney, lung, spleen, GI tract (lobular/acinar tessellation + serous coat)
 *  6 = Skin, mammary, lymphoid & endocrine glands (dermal/follicular micro-relief + warm SSS)
 */
export function tissueShaderId(organ: Tissue): number {
  const fam = tissueFamily(organ).id;
  if (fam === "skeletal" || fam === "tooth" || fam === "sclera") return 0;
  if (fam === "connective" || fam === "muscular-tendon" || fam === "ligament" || fam === "cartilage" || fam === "heart-valve" || fam === "bronchus") return 2;
  if (fam === "muscular") return 1;
  if (fam === "myocardium" || fam === "artery" || fam === "vein" || fam === "cardiovascular") return 3;
  if (fam === "cerebral-sulcus" || fam === "grey-matter" || fam === "white-matter" || fam === "spinal-cord" || fam === "dura" || fam === "nervous") return 4;
  if (
    fam === "liver" ||
    fam === "biliary" ||
    fam === "spleen" ||
    fam === "pancreas" ||
    fam === "stomach" ||
    fam === "lung" ||
    fam === "kidney" ||
    fam === "digestive" ||
    fam === "respiratory" ||
    fam === "renal" ||
    fam === "reproductive"
  ) {
    return 5;
  }
  return 6;
}

export function tissueHex(organ: Tissue): string {
  return tissueFamily(organ).hex;
}

const CONTINUOUS: ReadonlySet<AnatomicalSystem> = new Set(["integumentary"]);

function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

function spread(seed: number, shift: number): number {
  return (((seed >>> shift) & 0xff) / 128) - 1;
}

const cache = new Map<string, THREE.Color>();

export function tissueColour(organ: Tissue): THREE.Color {
  const cached = cache.get(organ.organ_id);
  if (cached) return cached;

  if (/\bovary\b/i.test(organ.organ_id) || /\bovary\b/i.test(organ.name_en)) {
    const ovCol = new THREE.Color("#f6d58e");
    cache.set(organ.organ_id, ovCol);
    return ovCol;
  }
  const fam = tissueFamily(organ);
  const colour = new THREE.Color(fam.hex);
  if (
    fam.id === "connective" ||
    fam.id === "muscular-tendon" ||
    fam.id === "cartilage" ||
    fam.id === "ligament" ||
    fam.id === "cerebral-sulcus"
  ) {
    cache.set(organ.organ_id, colour);
    return colour;
  }
  if (fam.id === "grey-matter") {
    const pathStr = (organ.path ?? []).join(" ").toLowerCase() + " " + organ.name_en.toLowerCase();
    if (pathStr.includes("frontal lobe")) {
      colour.set("#e9979d");
    } else if (pathStr.includes("parietal lobe") || pathStr.includes("precuneus")) {
      colour.set("#d9828b");
    } else if (pathStr.includes("temporal lobe") || pathStr.includes("hippocamp") || pathStr.includes("uncus")) {
      colour.set("#e29c87");
    } else if (pathStr.includes("occipital lobe") || pathStr.includes("cuneus")) {
      colour.set("#c97380");
    } else if (pathStr.includes("insular") || pathStr.includes("insula")) {
      colour.set("#d47c92");
    } else if (pathStr.includes("limbic") || pathStr.includes("cingul")) {
      colour.set("#df8e99");
    } else if (pathStr.includes("cerebellum") || pathStr.includes("culmen") || pathStr.includes("declive") || pathStr.includes("flocculus")) {
      colour.set("#c77872");
    }
    const gSeed = hash(organ.name_en.replace(/\s*\((left|right)\)\s*/gi, "").trim().toLowerCase());
    const hsl = { h: 0, s: 0, l: 0 };
    colour.getHSL(hsl);
    colour.setHSL(
      hsl.h,
      Math.min(Math.max(hsl.s + spread(gSeed, 8) * 0.04, 0.36), 0.62),
      Math.min(Math.max(hsl.l + spread(gSeed, 16) * 0.045, 0.52), 0.72),
    );
    cache.set(organ.organ_id, colour);
    return colour;
  }
  if (fam.id === "skeletal") {
    // Human Atlas Ivory/Bone-White (#EFE6D8) with gentle natural variation
    const boneBaseName = organ.name_en
      .replace(/\s*\((left|right)\)\s*/gi, "")
      .trim()
      .toLowerCase();
    const bSeed = hash(boneBaseName);
    const baseBone = new THREE.Color(ATLAS_STYLE.bones.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseBone.getHSL(hsl);
    const lightShift = spread(bSeed, 16) * 0.018;
    colour.setHSL(hsl.h, hsl.s, Math.min(Math.max(hsl.l + lightShift, 0.86), 0.93));
    cache.set(organ.organ_id, colour);
    return colour;
  }
  if (organ.system === "muscular") {
    // Human Atlas Soft Salmon-Pink (#E8A09A) with slight variation per muscle group (#E39A93 to #F0B5AE). Never saturated red.
    const groupKey =
      organ.path && organ.path.length > 0
        ? organ.path.slice(0, 3).join("/")
        : organ.organ_id.replace(/_(l|r|left|right)$/i, "").trim().toLowerCase();
    const muscleSymKey = organ.organ_id
      .replace(/_(l|r|left|right)$/i, "")
      .trim()
      .toLowerCase();
    const gSeed = hash(groupKey);
    const mSeed = hash(muscleSymKey + "::" + organ.name_en.replace(/\s*\((left|right)\)\s*/gi, "").trim().toLowerCase());
    const t = Math.min(1, Math.max(0, 0.5 + spread(gSeed, 0) * 0.32 + spread(mSeed, 8) * 0.18));
    const minCol = new THREE.Color(ATLAS_STYLE.muscles.minColor);
    const baseCol = new THREE.Color(ATLAS_STYLE.muscles.baseColor);
    const maxCol = new THREE.Color(ATLAS_STYLE.muscles.maxColor);
    if (t < 0.5) {
      colour.copy(minCol).lerp(baseCol, t * 2);
    } else {
      colour.copy(baseCol).lerp(maxCol, (t - 0.5) * 2);
    }
    cache.set(organ.organ_id, colour);
    return colour;
  }
  if (!CONTINUOUS.has(organ.system)) {
    const groupKey =
      organ.path && organ.path.length > 0
        ? organ.path.slice(0, 3).join("/")
        : organ.name_en
            .replace(
              /\b(left|right|anterior|posterior|superior|inferior|medial|lateral|superficial|deep|internal|external|part|branch|ramus|caput)\b/gi,
              "",
            )
            .trim();
    const groupSeed = hash(groupKey || organ.system);
    const symBaseName = organ.name_en.replace(/\s*\((left|right)\)\s*/gi, "").trim().toLowerCase();
    const organSeed = hash(symBaseName || organ.organ_id);

    const hsl = { h: 0, s: 0, l: 0 };
    colour.getHSL(hsl);

    const hueShift = spread(groupSeed, 0) * 0.026 + spread(organSeed, 0) * 0.01;
    const satShift = spread(groupSeed, 8) * 0.055 + spread(organSeed, 8) * 0.03;
    const lightShift = spread(groupSeed, 16) * 0.048 + spread(organSeed, 16) * 0.035;

    colour.setHSL(
      (hsl.h + hueShift + 1) % 1,
      Math.min(Math.max(hsl.s * 0.94 + satShift, 0.14), 0.76),
      Math.min(Math.max(hsl.l + lightShift, 0.22), 0.92),
    );
  }

  cache.set(organ.organ_id, colour);
  return colour;
}

/**
 * Calibrated tissue roughness: wet internal organs and vessels have a
 * crisp serous sheen (~0.24–0.32), while cortical bone has a smooth satin-ivory finish (~0.44).
 */
const ROUGHNESS: Partial<Record<AnatomicalSystem, number>> = {
  skeletal: ATLAS_STYLE.bones.roughness,
  articular: 0.45,
  muscular: ATLAS_STYLE.muscles.roughness,
  cardiovascular: 0.38,
  nervous: 0.42,
  lymphatic: 0.42,
  respiratory: 0.42,
  digestive: 0.42,
  renal: 0.38,
  endocrine: 0.42,
  reproductive: 0.42,
  integumentary: 0.65,
  regional: 0.65,
};

export function tissueRoughness(system: AnatomicalSystem, organ?: Tissue): number {
  if (organ) {
    const famId = tissueFamily(organ).id;
    if (famId === "connective" || famId === "muscular-tendon") {
      return ATLAS_STYLE.tendons.roughness;
    }
    if (famId === "skeletal") {
      return ATLAS_STYLE.bones.roughness;
    }
    if (system === "muscular") {
      return ATLAS_STYLE.muscles.roughness;
    }
  }
  return ROUGHNESS[system] ?? 0.68;
}

const TRANSPARENCY: Record<string, number> = {
  "ocular-clear": 0.18,
  "ocular-interior": 0.55,
  bursa: 0.35,
};

export function tissueOpacity(organ: Tissue): number {
  return TRANSPARENCY[tissueFamily(organ).id] ?? 1;
}

const DEPTH_BIAS: Readonly<Record<string, number>> = {
  regional: -2,
  integumentary: -2,
  connective: -1,
  ligament: -1,
};

export function tissueDepthBias(organ: Tissue): number {
  return DEPTH_BIAS[tissueFamily(organ).id] ?? 0;
}

// --- END ANATOMICAL TISSUE PALETTE ---

/** Mid-severity overlay. */
const AMBER = new THREE.Color("#e8a33d");
/** Full-severity overlay. */
const CRIMSON = new THREE.Color("#c62828");
/** Selection accent, matching the brand cyan. */
const SELECTED = new THREE.Color("#ff007a");
/** The light the cursor casts into the body when DepthProbe is active. */
const PROBE_LIGHT = new THREE.Color("#ffe8c4");
/** The colour the assistant marks what it is explaining. */
const LIT_LIGHT = new THREE.Color("#35e07a");

const LIT_FLOOR = 0.22;
const LIT_RANGE = 0.75;
const OCCLUDED_FLOOR = 0.16;
const OCCLUDED_RANGE = 0.34;
const LIT_MIN_OPACITY = 0.92;
const SELECTED_MIN_OPACITY = 1.0;

const VOKA_HISTOLOGY_VERTEX_CHUNK = /* glsl */ `
#include <common>
varying vec3 vCbWorldPos;
varying vec3 vCbObjPos;
varying vec3 vCbObjNormal;
`;

const VOKA_HISTOLOGY_BEGINNORMAL_CHUNK = /* glsl */ `
#include <beginnormal_vertex>
vCbObjNormal = objectNormal;
`;

const VOKA_HISTOLOGY_WORLD_CHUNK = /* glsl */ `
#include <worldpos_vertex>
vCbObjPos = transformed;
vCbWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
`;

const VOKA_HISTOLOGY_PARS_FRAGMENT_CHUNK = /* glsl */ `
#include <common>
varying vec3 vCbWorldPos;
varying vec3 vCbObjPos;
varying vec3 vCbObjNormal;

// Hardware-accelerated 3D organic gyroid noise (single-cycle sin/cos on desktop & mobile GPUs with zero thermal overhead)
float cbNoise3(vec3 p) {
  float g1 = dot(sin(p * 1.5707963), cos(p.yzx * 1.5707963));
  float g2 = dot(sin(p * 3.1415926 + 1.1), cos(p.zxy * 3.1415926 + 2.3));
  return clamp((g1 * 0.68 + g2 * 0.32) * 0.3333 + 0.5, 0.0, 1.0);
}
`;

export function buildVokaFragmentLightingChunk(tissueId: number): string {
  return /* glsl */ `
#include <lights_fragment_begin>
vec3 cbViewDir = normalize(vViewPosition);
vec3 cbNorm = normalize(normal);
vec3 cbObjN = normalize(vCbObjNormal + vec3(1e-5));
float cbNdotV = clamp(dot(cbNorm, cbViewDir), 0.0, 1.0);
float cbOneMinusNdotV = 1.0 - cbNdotV;
float cbFresnel = cbOneMinusNdotV * cbOneMinusNdotV * cbOneMinusNdotV;

// Object-space tangent & bitangent frame for anatomical fiber & fascicle alignment
vec3 cbUp = abs(cbObjN.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
vec3 cbTangent = normalize(cross(cbUp, cbObjN));
vec3 cbBitangent = cross(cbObjN, cbTangent);
float cbAlong = dot(vCbObjPos, cbBitangent);
float cbAcross = dot(vCbObjPos, cbTangent);

float cbMicroShade = 0.0;
float cbWetness = 0.48;
vec3 cbSssTint = vec3(0.18, 0.035, 0.025);
float cbMuscleEdgeSulcus = 1.0;

#if ${tissueId} == 0
  // 0: Ivory/Bone-White (#EFE6D8, roughness 0.7) — smooth clay-ivory bone with subtle crease AO
  float cavityAO = smoothstep(0.62, -0.58, cbNorm.y) * 0.12;
  float boneCrease = clamp(length(fwidth(cbNorm)) * 1.4, 0.0, 0.22);
  float boneEdgeAO = smoothstep(0.04, 0.38, cbNdotV);
  cbMuscleEdgeSulcus = mix(0.76, 1.0, sqrt(boneEdgeAO)) * (1.0 - boneCrease * 0.35);
  cbMicroShade = -cavityAO;
  cbWetness = 0.04;
  cbSssTint = vec3(0.08, 0.065, 0.05);
#elif ${tissueId} == 1
  // 1: Human Atlas Soft Stylized Clay / Pastel Medical Illustration Muscle (#E8A09A)
  // Smooth and slightly rubbery: ZERO fiber/striation textures, ZERO bump noise.
  // Subtle SSAO/GTAO crease darkening between muscles + soft subsurface sheen (#FFD6D0) + thin 1px outline (#C9837D).
  float normalCrease = ${ATLAS_STYLE.rendering.enableSSAO ? 'true' : 'false'} ? clamp(length(fwidth(cbNorm)) * 1.65, 0.0, 0.28) : 0.0;
  float edgeAO = ${ATLAS_STYLE.rendering.enableSSAO ? 'true' : 'false'} ? smoothstep(0.04, 0.42, cbNdotV) : 1.0;
  cbMuscleEdgeSulcus = mix(0.74, 1.0, sqrt(edgeAO)) * (1.0 - normalCrease * 0.48);
  cbMicroShade = 0.0;
  // Thin soft 1px outline pass (#C9837D = vec3(0.788, 0.514, 0.490)) at silhouette & inter-muscular creases
  if (${ATLAS_STYLE.rendering.enableOutline ? 'true' : 'false'}) {
    float outlineFactor = (1.0 - smoothstep(0.08, 0.22, cbNdotV)) * 0.55 + normalCrease * 0.65;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.788, 0.514, 0.490), clamp(outlineFactor, 0.0, 0.65));
  }
  // Subtle subsurface-like softness: sheen 0.3 with sheenColor #FFD6D0 (vec3(1.0, 0.839, 0.816))
  float rimSheen = pow(1.0 - cbNdotV, 2.2) * 0.30;
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.839, 0.816), rimSheen);
  cbWetness = 0.06;
  cbSssTint = vec3(0.14, 0.06, 0.05);
#elif ${tissueId} == 2
  // 2: Pale Cream Tendons / Fascia (#F3E3D3, roughness 0.8) — smooth clay surface
  float cartCrease = clamp(length(fwidth(cbNorm)) * 1.35, 0.0, 0.20);
  float cartEdgeAO = smoothstep(0.04, 0.38, cbNdotV);
  cbMuscleEdgeSulcus = mix(0.80, 1.0, sqrt(cartEdgeAO)) * (1.0 - cartCrease * 0.32);
  cbMicroShade = 0.0;
  cbWetness = 0.03;
  cbSssTint = vec3(0.06, 0.055, 0.045);
#elif ${tissueId} == 3
  // 3: Myocardium, Arteries & Veins
  float n3 = cbNoise3(vCbObjPos * 36.0);
  float helical = sin((cbAcross + cbAlong * 0.55) * 290.0 + n3 * 3.0) * 0.5 + 0.5;
  cbMicroShade = (helical - 0.5) * 0.14 + (n3 - 0.5) * 0.065;
  cbWetness = 0.88;
  cbSssTint = vec3(0.28, 0.03, 0.035);
#elif ${tissueId} == 4
  // 4: Brain Cortex, White Matter & Myelinated Nerves
  float n4 = cbNoise3(vCbObjPos * 24.0);
  float sulcalAO = smoothstep(-0.35, 0.65, n4);
  float fascicleNerve = sin(cbAcross * 360.0 + n4 * 2.2) * 0.5 + 0.5;
  cbMicroShade = (sulcalAO - 0.48) * 0.13 + (fascicleNerve - 0.5) * 0.075;
  cbWetness = 0.72;
  cbSssTint = vec3(0.22, 0.09, 0.065);
#elif ${tissueId} == 5
  // 5: Parenchymal Viscera
  float lobule = cbNoise3(vCbObjPos * 68.0);
  float septa = smoothstep(0.18, 0.02, abs(lobule - 0.5));
  cbMicroShade = (lobule - 0.5) * 0.15 - septa * 0.065;
  cbWetness = 0.86;
  cbSssTint = vec3(0.25, 0.045, 0.032);
#else
  // 6: Regional Surface, Skin, Mammary, Lymphoid & Endocrine
  float dermal = cbNoise3(vCbObjPos * 92.0);
  cbMicroShade = (dermal - 0.5) * 0.095;
  cbWetness = 0.56;
  cbSssTint = vec3(0.21, 0.075, 0.048);
#endif

// Apply histological micro-relief shading and sculptural ambient-occlusion boundary darkening
diffuseColor.rgb = clamp(diffuseColor.rgb * (1.0 + cbMicroShade) * mix(0.68, 1.00, cbMuscleEdgeSulcus), 0.0, 1.0);

// Key directional medical studio light in view space
vec3 cbKeyDir = normalize(vec3(0.36, 0.58, 0.73));
vec3 cbHalfVec = normalize(cbKeyDir + cbViewDir);
float cbNdotL = dot(cbNorm, cbKeyDir);

// Warm subsurface wrap-lighting on terminator
float cbWrap = max(0.0, (cbNdotL + 0.48) / 1.48);
float cbTerminator = smoothstep(0.0, 0.55, cbWrap) * (1.0 - smoothstep(0.45, 1.0, max(0.0, cbNdotL)));

// Dual-lobe wet serous/endothelial specular clearcoat highlight
float cbNdotH = max(0.0, dot(cbNorm, cbHalfVec));
float cbSpec = pow(cbNdotH, 48.0) * (0.42 * cbWetness) * (1.0 + cbMicroShade * 1.6);
float cbCoat = pow(cbNdotH, 175.0) * (0.34 * cbWetness);

// Secondary rim specular lobe
vec3 cbRimLightDir = normalize(vec3(-0.52, 0.42, 0.74));
vec3 cbRimHalf = normalize(cbRimLightDir + cbViewDir);
float cbRimSpec = pow(max(0.0, dot(cbNorm, cbRimHalf)), 64.0) * (0.14 * cbWetness);

float cbAlbedoLum = clamp(dot(diffuseColor.rgb, vec3(0.333)) * 2.2, 0.08, 1.0) * cbMuscleEdgeSulcus;
vec3 cbHemiFill = mix(vec3(0.03, 0.045, 0.07), vec3(0.11, 0.105, 0.095), cbNorm.y * 0.5 + 0.5);
#if ${tissueId} == 1
float cbRimBoost = 0.0;
float cbFresnelSss = 0.0;
#elif ${tissueId} == 0
float cbRimBoost = 0.025;
float cbFresnelSss = cbFresnel * 0.035;
#else
float cbRimBoost = 0.12;
float cbFresnelSss = cbFresnel * 0.18;
#endif
totalEmissiveRadiance += diffuseColor.rgb * cbHemiFill
  + cbSssTint * (cbTerminator * 0.28 + cbFresnelSss) * cbAlbedoLum
  + vec3(1.0, 0.985, 0.96) * (cbSpec + cbCoat + cbRimSpec) * cbAlbedoLum
  + diffuseColor.rgb * cbFresnel * cbRimBoost;
`;
}

export function injectVokaAnatomicalShader(
  shader: THREE.WebGLProgramParametersWithUniforms,
  tissueId: number,
): void {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", VOKA_HISTOLOGY_VERTEX_CHUNK)
    .replace("#include <beginnormal_vertex>", VOKA_HISTOLOGY_BEGINNORMAL_CHUNK)
    .replace("#include <worldpos_vertex>", VOKA_HISTOLOGY_WORLD_CHUNK);

  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", VOKA_HISTOLOGY_PARS_FRAGMENT_CHUNK)
    .replace(
      "#include <lights_fragment_begin>",
      buildVokaFragmentLightingChunk(tissueId),
    );
}

const IS_LOW_END_MOBILE = false;

const TISSUE_TYPES = [0, 1, 2, 3, 4, 5, 6] as const;

const STD_COMPILERS = TISSUE_TYPES.map(
  (t) =>
    function (this: unknown, shader: THREE.WebGLProgramParametersWithUniforms) {
      injectVokaAnatomicalShader(shader, t);
    },
);
const STD_CACHE_KEYS = TISSUE_TYPES.map((t) => () => `cb-atlas-std-t${t}-v32`);

/**
 * IMPORTANT: Use regular `function (this: unknown, shader)` and `.call(this, shader)`
 * so Three.js passes the `MeshPhysicalMaterial` instance as `this` into
 * `breathOnBeforeCompile` and `heartbeatOnBeforeCompile`.
 * Using an arrow function lost `this`, which caused `uBeatCentre` to fall back to
 * `(0, 0, 0)` (the floor at the feet) and stretched the beating heart downward!
 */
const BREATH_COMPILERS = TISSUE_TYPES.map(
  (t) =>
    function (this: unknown, shader: THREE.WebGLProgramParametersWithUniforms) {
      breathOnBeforeCompile.call(this, shader);
      injectVokaAnatomicalShader(shader, t);
    },
);
const BREATH_CACHE_KEYS = TISSUE_TYPES.map((t) => () => `cb-atlas-breath-t${t}-v32`);

const BEAT_COMPILERS = TISSUE_TYPES.map(
  (t) =>
    function (this: unknown, shader: THREE.WebGLProgramParametersWithUniforms) {
      heartbeatOnBeforeCompile.call(this, shader);
      injectVokaAnatomicalShader(shader, t);
    },
);
const BEAT_CACHE_KEYS = TISSUE_TYPES.map((t) => () => `cb-atlas-beat-t${t}-v32`);

const SELECTED_WRAP_CACHE_KEY = () => "cb-atlas-selected-wrap-sheath-v32";
const SELECTED_WRAP_COMPILER = function (
  this: unknown,
  shader: THREE.WebGLProgramParametersWithUniforms,
) {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
transformed += normalize(vec3(normal) + vec3(1e-5)) * 0.00024;`,
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <lights_fragment_begin>",
    `#include <lights_fragment_begin>
vec3 wrapV = normalize(vViewPosition);
vec3 wrapN = normalize(normal);
float wrapNdotV = clamp(abs(dot(wrapN, wrapV)), 0.0, 1.0);
float wrapRim = pow(1.0 - wrapNdotV, 1.85);
// Thin warm outline (#C9837D) + soft emissive (#FF9C94)
diffuseColor.rgb = mix(vec3(0.969, 0.769, 0.745), vec3(0.788, 0.514, 0.490), wrapRim);
diffuseColor.a = clamp(0.08 + 0.78 * wrapRim, 0.0, 0.85);
totalEmissiveRadiance += vec3(1.0, 0.612, 0.580) * (0.25 * wrapRim);`,
  );
};

/** Opting a mesh out of raycasting entirely. */
const NO_RAYCAST = () => null;
/** three.js's default mesh raycast, named so it can be restored explicitly. */
const DEFAULT_RAYCAST = THREE.Mesh.prototype.raycast;
const _sphereTmp = new THREE.Sphere();
const FAST_RAYCAST: THREE.Object3D["raycast"] = function fastRaycast(
  this: THREE.Mesh,
  raycaster,
  intersects,
) {
  if (!shouldRunRaycastPass(raycaster)) return;
  const geom = this.geometry;
  if (geom) {
    if (!geom.boundingSphere) geom.computeBoundingSphere();
    if (geom.boundingSphere) {
      _sphereTmp.copy(geom.boundingSphere).applyMatrix4(this.matrixWorld);
      if (!raycaster.ray.intersectsSphere(_sphereTmp)) return;
    }
  }
  DEFAULT_RAYCAST.call(this, raycaster, intersects);
};

function pathologyColour(tissue: THREE.Color, severity: number): THREE.Color {
  const clamped = Math.min(Math.max(severity, 0), 1);
  return clamped <= 0.5
    ? tissue.clone().lerp(AMBER, clamped * 2)
    : AMBER.clone().lerp(CRIMSON, (clamped - 0.5) * 2);
}

interface OrganMeshProps {
  organ: ManifestOrgan;
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  visible: boolean;
  opacity: number;
  hovered: boolean;
  selected: boolean;
  overlay: PathologyOverlay | undefined;
  coverageTouches: number | undefined;
  coverageBusiest: number | undefined;
  probeDepth: number | undefined;
  litGlow: number | undefined;
  isContextSolid?: boolean | undefined;
  tone: BodyTone;
  scanBandEnabled?: boolean;
  worldBox?: THREE.Box3 | undefined;
  clippingPlanes: THREE.Plane[];
  onHover: (organId: string | null) => void;
  onSelect: (organId: string, additive: boolean) => void;
  onStudy: (organId: string, additive: boolean) => void;
  onProbe?: ((organIds: string[]) => void) | undefined;
  onContextMenu: (organId: string, x: number, y: number) => void;
  onRegister?: (organId: string, mesh: THREE.Mesh | null, base: THREE.Matrix4) => void;
}

let lastMobileOrganTap: { organId: string; time: number } = { organId: "", time: 0 };

/**
 * Seals the circular anterior dissectible cutout window on the Z-Anatomy Stomach (`stomach`)
 * and Mucosa of stomach (`mucosa_of_stomach`) meshes with a smooth, C1-continuous convex dome cap
 * ("خلي المعدة مكتملة") so the 3D Stomach renders as a complete, intact organ without a hole.
 */
function sealStomachAnteriorWindow(baseGeom: THREE.BufferGeometry): THREE.BufferGeometry {
  if (baseGeom.userData.__cbStomachSealed) return baseGeom;
  const posAttr = baseGeom.getAttribute("position") as THREE.BufferAttribute | undefined;
  const indexAttr = baseGeom.getIndex();
  if (!posAttr || !indexAttr || posAttr.count < 100) {
    baseGeom.userData.__cbStomachSealed = true;
    return baseGeom;
  }

  const vCount = posAttr.count;
  const qToCanon = new Map<string, number>();
  const idxToCanon = new Int32Array(vCount);
  for (let i = 0; i < vCount; i++) {
    const qx = Math.round(posAttr.getX(i) * 100000);
    const qy = Math.round(posAttr.getY(i) * 100000);
    const qz = Math.round(posAttr.getZ(i) * 100000);
    const key = `${qx}_${qy}_${qz}`;
    let c = qToCanon.get(key);
    if (c === undefined) {
      c = i;
      qToCanon.set(key, i);
    }
    idxToCanon[i] = c;
  }

  const edgeCnt = new Map<string, number>();
  const directedHalf = new Map<string, [number, number]>();
  const idxArr = indexAttr.array;
  const iCount = indexAttr.count;

  for (let i = 0; i < iCount; i += 3) {
    const ca = idxToCanon[idxArr[i]!]!;
    const cb = idxToCanon[idxArr[i + 1]!]!;
    const cc = idxToCanon[idxArr[i + 2]!]!;
    const pairs: [number, number][] = [
      [ca, cb],
      [cb, cc],
      [cc, ca],
    ];
    for (const [u, v] of pairs) {
      if (u === v) continue;
      const k = u < v ? `${u}_${v}` : `${v}_${u}`;
      edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
      directedHalf.set(k, [u, v]);
    }
  }

  const nextCanon = new Map<number, number>();
  for (const [k, cnt] of edgeCnt.entries()) {
    if (cnt === 1) {
      const pair = directedHalf.get(k);
      if (!pair) continue;
      const [u, v] = pair;
      if (posAttr.getZ(u) > 0.02 && posAttr.getZ(v) > 0.02) {
        nextCanon.set(v, u);
      }
    }
  }

  if (nextCanon.size < 10) {
    baseGeom.userData.__cbStomachSealed = true;
    return baseGeom;
  }

  const start = nextCanon.keys().next().value as number;
  const loop: number[] = [];
  const visited = new Set<number>();
  let curr: number | undefined = start;
  while (curr !== undefined && !visited.has(curr)) {
    visited.add(curr);
    loop.push(curr);
    curr = nextCanon.get(curr);
  }

  const N = loop.length;
  if (N < 10) {
    baseGeom.userData.__cbStomachSealed = true;
    return baseGeom;
  }

  let cx = 0;
  let cy = 0;
  let zMean = 0;
  for (let i = 0; i < N; i++) {
    const idx = loop[i]!;
    cx += posAttr.getX(idx);
    cy += posAttr.getY(idx);
    zMean += posAttr.getZ(idx);
  }
  cx /= N;
  cy /= N;
  zMean /= N;

  const dx = new Float64Array(N);
  const dy = new Float64Array(N);
  const dz = new Float64Array(N);
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  let sxz = 0;
  let syz = 0;

  for (let i = 0; i < N; i++) {
    const idx = loop[i]!;
    const x = posAttr.getX(idx) - cx;
    const y = posAttr.getY(idx) - cy;
    const z = posAttr.getZ(idx) - zMean;
    dx[i] = x;
    dy[i] = y;
    dz[i] = z;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
    sxz += x * z;
    syz += y * z;
  }

  const det = sxx * syy - sxy * sxy;
  const axSlope = Math.abs(det) > 1e-12 ? (syy * sxz - sxy * syz) / det : 0;
  const aySlope = Math.abs(det) > 1e-12 ? (sxx * syz - sxy * sxz) / det : 0;

  const zRes = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    zRes[i] = dz[i]! - (axSlope * dx[i]! + aySlope * dy[i]!);
  }

  const R = 12;
  const domeBulge = 0.0044;
  const addedVerts = (R - 1) * N + 1;
  const totalVerts = vCount + addedVerts;

  const newPos = new Float32Array(totalVerts * 3);
  for (let i = 0; i < vCount; i++) {
    newPos[i * 3] = posAttr.getX(i);
    newPos[i * 3 + 1] = posAttr.getY(i);
    newPos[i * 3 + 2] = posAttr.getZ(i);
  }

  const ringIndices: number[][] = [loop];
  let writeVert = vCount;
  for (let rIdx = 1; rIdx < R; rIdx++) {
    const s = 1.0 - rIdx / R;
    const bulge = domeBulge * (1.0 - s * s);
    const resWeight = Math.pow(s, 2.2);
    const ring: number[] = [];
    for (let i = 0; i < N; i++) {
      const px = cx + s * dx[i]!;
      const py = cy + s * dy[i]!;
      const pz = zMean + s * (axSlope * dx[i]! + aySlope * dy[i]!) + resWeight * zRes[i]! + bulge;
      newPos[writeVert * 3] = px;
      newPos[writeVert * 3 + 1] = py;
      newPos[writeVert * 3 + 2] = pz;
      ring.push(writeVert);
      writeVert++;
    }
    ringIndices.push(ring);
  }

  const apexIdx = writeVert;
  newPos[apexIdx * 3] = cx;
  newPos[apexIdx * 3 + 1] = cy;
  newPos[apexIdx * 3 + 2] = zMean + domeBulge;

  const addedTris = (R - 1) * N * 2 + N;
  const totalIndices = iCount + addedTris * 3;
  const newIndices = new Uint32Array(totalIndices);
  for (let i = 0; i < iCount; i++) {
    newIndices[i] = idxArr[i]!;
  }

  let writeIdx = iCount;
  for (let rIdx = 0; rIdx < R - 1; rIdx++) {
    const rOut = ringIndices[rIdx]!;
    const rIn = ringIndices[rIdx + 1]!;
    for (let i = 0; i < N; i++) {
      const iNext = (i + 1) % N;
      const u0 = rOut[i]!;
      const u1 = rOut[iNext]!;
      const v0 = rIn[i]!;
      const v1 = rIn[iNext]!;
      newIndices[writeIdx++] = u0;
      newIndices[writeIdx++] = u1;
      newIndices[writeIdx++] = v1;
      newIndices[writeIdx++] = u0;
      newIndices[writeIdx++] = v1;
      newIndices[writeIdx++] = v0;
    }
  }

  const rLast = ringIndices[R - 1]!;
  for (let i = 0; i < N; i++) {
    const iNext = (i + 1) % N;
    newIndices[writeIdx++] = rLast[i]!;
    newIndices[writeIdx++] = rLast[iNext]!;
    newIndices[writeIdx++] = apexIdx;
  }

  const sealed = new THREE.BufferGeometry();
  sealed.setAttribute("position", new THREE.BufferAttribute(newPos, 3));
  sealed.setIndex(new THREE.BufferAttribute(newIndices, 1));
  sealed.computeVertexNormals();
  sealed.computeBoundingBox();
  sealed.computeBoundingSphere();
  sealed.userData = { ...baseGeom.userData, __cbStomachSealed: true };
  return sealed;
}

export const OrganMesh = memo(function OrganMesh({
  organ,
  geometry: rawGeometry,
  matrix,
  visible,
  opacity: layerOpacity,
  hovered,
  selected,
  overlay,
  coverageTouches,
  coverageBusiest,
  probeDepth,
  litGlow: litGlowProp,
  isContextSolid = false,
  tone,
  scanBandEnabled = false,
  worldBox,
  clippingPlanes,
  onHover,
  onSelect,
  onStudy,
  onProbe,
  onContextMenu,
  onRegister,
}: OrganMeshProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const lastSelectAtRef = useRef(0);
  const register = useCallback(
    (mesh: THREE.Mesh | null) => {
      meshRef.current = mesh;
      if (mesh) {
        mesh.matrix.copy(matrix);
        mesh.matrixWorld.copy(matrix);
        mesh.matrixWorldNeedsUpdate = true;
      }
      onRegister?.(organ.organ_id, mesh, matrix);
    },
    [onRegister, organ.organ_id, matrix],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.matrix.copy(matrix);
    mesh.matrixWorld.copy(matrix);
    mesh.matrixWorldNeedsUpdate = true;
  }, [matrix]);
  const userData = useMemo(() => ({ organId: organ.organ_id }), [organ.organ_id]);

  const litGlow = litGlowProp ?? 0;

  const isExplicitlyFaded = layerOpacity < 0.5;
  const opacity = isExplicitlyFaded
    ? layerOpacity
    : organ.system === "muscular" || selected || isContextSolid
      ? 1.0
      : Math.max(
          layerOpacity * tissueOpacity(organ),
          litGlow > 0 ? LIT_MIN_OPACITY : 0,
          selected ? SELECTED_MIN_OPACITY : 0,
        );
  const clickThrough = opacity < GHOST_CLICK_THROUGH;
  const ghosted = opacity < 1;
  const depthBias = tissueDepthBias(organ);
  const tShaderId = useMemo(() => tissueShaderId(organ), [organ]);

  const material = useRef<THREE.MeshStandardMaterial>(null);
  const scanMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const beatMaterial = useRef<THREE.MeshStandardMaterial>(null);
  useEffect(() => {
    if (material.current) material.current.needsUpdate = true;
    if (scanMaterial.current) scanMaterial.current.needsUpdate = true;
    if (beatMaterial.current) beatMaterial.current.needsUpdate = true;
  }, [ghosted]);

  const chamber = useMemo(() => beatChamber(organ), [organ]);
  const breath = useMemo(() => breathData(organ, worldBox, chamber !== null), [organ, worldBox, chamber]);
  const carryPart = useMemo(() => {
    if (breath.breathRole === BREATH_ROLE.viscera) return "carrier" as const;
    if (breath.breathRole === BREATH_ROLE.heart) return "heart" as const;
    if (breath.breathRole !== BREATH_ROLE.vessel) return null;
    const name = organ.name_en.toLowerCase();
    if (name.includes("aorta")) return "anchor" as const;
    return name.includes("vena cava") ? ("vena cava" as const) : ("vessel" as const);
  }, [breath, organ.name_en]);
  const isBreathOrgan = carryPart !== null || breath.breathRole !== 0;
  const breathing = useSafeStore(useBreathStore, (s) => isBreathOrgan && s.enabled);
  useEffect(() => {
    const mesh = meshRef.current;
    if (!breathing || !mesh || carryPart === null) return;
    return registerCarry(organ.organ_id, { mesh, part: carryPart });
  }, [breathing, carryPart, organ.organ_id]);

  const beating = useSafeStore(useHeartStore, (s) => chamber !== null && s.enabled);
  const beatUserData = useMemo(() => {
    if (chamber === null) return null;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const centre = geometry.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3();
    return {
      ...breath,
      organId: organ.organ_id,
      beatAtrium: isAtrium(chamber) ? 1 : 0,
      beatLeft: chamber.startsWith("left") ? 1 : 0,
      beatCentre: { value: centre },
    };
  }, [chamber, geometry, organ.organ_id, breath]);
  useEffect(() => {
    const mesh = meshRef.current;
    if (!beating || !mesh || chamber === null || !beatUserData) return;
    return registerBeating(organ.organ_id, {
      mesh,
      chamber,
      wall: isChamberWall(organ),
      centre: beatUserData.beatCentre,
    });
  }, [beating, chamber, beatUserData, organ]);

  const flowKind = useMemo(() => vesselFlow(organ), [organ]);
  const flowBeating = useSafeStore(useHeartStore, (s) => flowKind !== null && s.enabled);
  const flowing = flowBeating && visible && layerOpacity < 1;
  const flow = flowing && flowKind ? flowMaterial(flowKind) : null;
  useEffect(() => {
    if (flow) flow.clippingPlanes = clippingPlanes;
  }, [flow, clippingPlanes]);
  useEffect(() => {
    const mesh = meshRef.current;
    if (!flowing || !mesh || flowKind === null) return;
    return registerFlowing(organ.organ_id, { mesh, kind: flowKind, seed: isFlowSeed(flowKind, organ) });
  }, [flowing, flowKind, organ]);

  const { color, emissive, emissiveIntensity } = useMemo(() => {
    const tissue =
      coverageTouches !== undefined && coverageBusiest !== undefined
        ? coverageColour(coverageTouches, coverageBusiest)
        : scanColour(tissueColour(organ), "solid");
    const base = overlay ? pathologyColour(tissue, overlay.severity) : tissue;

    if (overlay) {
      return {
        color: base,
        emissive: base,
        emissiveIntensity: 0.15 + overlay.severity * 0.35,
      };
    }
    if (selected) {
      if (organ.system === "muscular") {
        // Human Atlas selected muscle: lighten to #F7C4BE with soft emissive (#FF9C94, intensity 0.25)
        return {
          color: new THREE.Color(ATLAS_STYLE.muscles.selectedColor),
          emissive: new THREE.Color(ATLAS_STYLE.muscles.selectedEmissive),
          emissiveIntensity: ATLAS_STYLE.muscles.selectedEmissiveIntensity,
        };
      }
      return {
        color: new THREE.Color(ATLAS_STYLE.muscles.selectedColor),
        emissive: new THREE.Color(ATLAS_STYLE.muscles.selectedEmissive),
        emissiveIntensity: ATLAS_STYLE.muscles.selectedEmissiveIntensity,
      };
    }
    if (isContextSolid) {
      // Connected nerves/vessels/target muscles enabled from Anatomy Map / Muscle Map / Nerve Map:
      if (organ.system === "nervous") {
        return {
          color: new THREE.Color("#facc15"),
          emissive: new THREE.Color("#eab308"),
          emissiveIntensity: 0.32,
        };
      }
      if (organ.system === "muscular") {
        // Target muscle innervated/supplied/drained by a selected nerve, artery, or vein
        const selId = useSceneStore.getState().selectedOrganIds[0] ?? "";
        const selOrg = selId ? useSceneStore.getState().organs[selId] : null;
        const isVeinSelected =
          selOrg?.system === "cardiovascular" && tissueFamily(selOrg).id === "vein";
        if (isVeinSelected) {
          return {
            color: new THREE.Color("#0ea5e9"),
            emissive: new THREE.Color("#0284c7"),
            emissiveIntensity: 0.3,
          };
        }
        return {
          color: new THREE.Color("#e11d48"),
          emissive: new THREE.Color("#be123c"),
          emissiveIntensity: 0.28,
        };
      }
      if (organ.system === "cardiovascular") {
        const famId = tissueFamily(organ).id;
        if (famId === "vein") {
          return {
            color: new THREE.Color("#2563eb"),
            emissive: new THREE.Color("#1d4ed8"),
            emissiveIntensity: 0.26,
          };
        }
        return {
          color: new THREE.Color("#ef4444"),
          emissive: new THREE.Color("#dc2626"),
          emissiveIntensity: 0.26,
        };
      }
      if (organ.system === "lymphatic") {
        return {
          color: new THREE.Color("#22c55e"),
          emissive: new THREE.Color("#16a34a"),
          emissiveIntensity: 0.25,
        };
      }
    }
    if (litGlow > 0) {
      return {
        color: base.clone().lerp(LIT_LIGHT, 0.45),
        emissive: LIT_LIGHT,
        emissiveIntensity: LIT_FLOOR + litGlow * LIT_RANGE,
      };
    }
    if (hovered) {
      if (organ.system === "muscular") {
        return {
          color: new THREE.Color(ATLAS_STYLE.muscles.selectedColor),
          emissive: new THREE.Color(ATLAS_STYLE.muscles.selectedEmissive),
          emissiveIntensity: ATLAS_STYLE.muscles.selectedEmissiveIntensity,
        };
      }
      if (organ.system === "nervous") {
        return {
          color: new THREE.Color("#5c3506"),
          emissive: new THREE.Color("#291702"),
          emissiveIntensity: 0.05,
        };
      }
      return {
        color: new THREE.Color(ATLAS_STYLE.muscles.selectedColor),
        emissive: new THREE.Color(ATLAS_STYLE.muscles.selectedEmissive),
        emissiveIntensity: 0.18,
      };
    }
    if (probeDepth !== undefined) {
      const glow = probeGlow(probeDepth);
      if (glow > 0) {
        return {
          color: base,
          emissive: PROBE_LIGHT,
          emissiveIntensity: 0.08 + glow * 0.5,
        };
      }
    }
    return { color: base, emissive: base, emissiveIntensity: 0 };
  }, [
    organ,
    hovered,
    selected,
    overlay,
    coverageTouches,
    coverageBusiest,
    probeDepth,
    litGlow,
    isContextSolid,
    layerOpacity,
    tone,
  ]);

  const scanSpan = useMemo((): readonly [number, number] | undefined => {
    if (!scanBandEnabled || !worldBox) return undefined;
    const { from, to } = scanRangeAlong(
      [worldBox.min.x, worldBox.min.y, worldBox.min.z],
      [worldBox.max.x, worldBox.max.y, worldBox.max.z],
      STANDING,
    );
    return [from, to];
  }, [scanBandEnabled, worldBox]);

  const scanSpanFront = useMemo((): readonly [number, number] | undefined => {
    if (!scanBandEnabled || !worldBox) return undefined;
    const { from, to } = scanRangeAlong(
      [worldBox.min.x, worldBox.min.y, worldBox.min.z],
      [worldBox.max.x, worldBox.max.y, worldBox.max.z],
      FACING,
    );
    return [from, to];
  }, [scanBandEnabled, worldBox]);

  const revealColour = useMemo((): readonly [number, number, number] | undefined => {
    if (!scanBandEnabled) return undefined;
    const tissue =
      coverageTouches !== undefined && coverageBusiest !== undefined
        ? coverageColour(coverageTouches, coverageBusiest)
        : tissueColour(organ);
    const shown = overlay ? pathologyColour(tissue, overlay.severity) : tissue;
    return [shown.r, shown.g, shown.b];
  }, [scanBandEnabled, organ, overlay, coverageTouches, coverageBusiest]);

  const scanProps = useMemo(() => {
    if (!scanBandEnabled) return null;
    const props = scanBandMaterialProps(true, scanSpan, revealColour, scanSpanFront);
    const own = (props as { userData?: object }).userData;
    return { ...props, userData: { ...own, ...breath } };
  }, [scanBandEnabled, scanSpan, revealColour, scanSpanFront, breath]);

  const effectiveDepthBias = selected ? -8 : hovered ? -4 : depthBias;
  const isMuscularSys = organ.system === "muscular";
  const surface = {
    color,
    emissive,
    emissiveIntensity,
    roughness: tissueRoughness(organ.system, organ),
    metalness: 0.0,
    clearcoat: isMuscularSys ? ATLAS_STYLE.muscles.clearcoat : 0.04,
    clearcoatRoughness: isMuscularSys ? ATLAS_STYLE.muscles.clearcoatRoughness : 0.5,
    sheen: isMuscularSys ? ATLAS_STYLE.muscles.sheen : 0.1,
    sheenColor: isMuscularSys ? new THREE.Color(ATLAS_STYLE.muscles.sheenColor) : new THREE.Color("#ffffff"),
    envMapIntensity: ATLAS_STYLE.lighting.envMapIntensity,
    transparent: ghosted,
    opacity,
    depthWrite: !ghosted,
    polygonOffset: effectiveDepthBias !== 0,
    polygonOffsetFactor: effectiveDepthBias,
    polygonOffsetUnits: effectiveDepthBias,
    clippingPlanes,
    side: clippingPlanes.length > 0 || organ.system === "reproductive" || organ.system === "endocrine" ? THREE.DoubleSide : THREE.FrontSide,
  };

  const longPressTimerRef = useRef<number | null>(null);
  const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartRef.current = null;
  }, []);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const isoIdsNow = useSceneStore.getState().isolatedOrganIds;
  const blockedByIsolate =
    isoIdsNow !== null && isoIdsNow.length > 0 && !isoIdsNow.includes(organ.organ_id);

  const triggerTapOrClickOpen = (event: {
    stopPropagation: () => void;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    button?: number;
    pointerType?: string;
    nativeEvent?: { pointerType?: string };
  }) => {
    clearLongPress();
    const curIso = useSceneStore.getState().isolatedOrganIds;
    if (curIso !== null && curIso.length > 0 && !curIso.includes(organ.organ_id)) return;
    if (clickThrough || useScanStore.getState().enabled || useHeartStore.getState().enabled || useBreathStore.getState().enabled) return;
    if (typeof event.button === "number" && event.button !== 0) return;
    event.stopPropagation();
    if (shouldSuppressClick()) return;
    if (pressTravelled()) return;

    const now = performance.now();
    const pType = event.pointerType ?? event.nativeEvent?.pointerType;
    const isMobileOrTouch =
      pType === "touch" || (typeof window !== "undefined" && window.innerWidth < 768);

    // On mobile: Double-tap resets camera angle & view ("Double tap: إعادة ضبط الزاوية (Reset View)"),
    // while Long-press selects the part and displays its name & notes!
    if (isMobileOrTouch) {
      const elapsed = now - lastMobileOrganTap.time;
      if (elapsed > 30 && elapsed <= 340) {
        lastMobileOrganTap = { organId: "", time: 0 };
        lastSelectAtRef.current = now;
        reportClick();
        useSceneStore.getState().orientView("anterior");
        useSceneStore.getState().fitView();
      } else {
        lastMobileOrganTap = { organId: organ.organ_id, time: now };
      }
      return;
    }

    if (now - lastSelectAtRef.current < 160) {
      reportClick();
      return;
    }
    lastSelectAtRef.current = now;

    reportClick();
    const additive = Boolean(event.shiftKey || event.ctrlKey || event.metaKey);
    onSelect(organ.organ_id, additive);
  };

  return (
    <mesh
      ref={register}
      geometry={geometry}
      matrix={matrix}
      matrixAutoUpdate={false}
      visible={visible}
      userData={userData}
      raycast={visible && !blockedByIsolate && !clickThrough && !scanBandEnabled && !beating && !breathing && !useHeartStore.getState().enabled && !useBreathStore.getState().enabled ? FAST_RAYCAST : NO_RAYCAST}
      onPointerDown={(event) => {
        if (clickThrough || useScanStore.getState().enabled || useHeartStore.getState().enabled || useBreathStore.getState().enabled) return;
        const pType = event.pointerType ?? event.nativeEvent?.pointerType;
        const isMobileOrTouch =
          pType === "touch" || (typeof window !== "undefined" && window.innerWidth < 768);
        if (!isMobileOrTouch) return;
        clearLongPress();
        longPressStartRef.current = { x: event.clientX, y: event.clientY };
        longPressTimerRef.current = window.setTimeout(() => {
          longPressTimerRef.current = null;
          if (pressTravelled() || shouldSuppressClick() || useScanStore.getState().enabled || useHeartStore.getState().enabled || useBreathStore.getState().enabled) return;
          lastSelectAtRef.current = performance.now();
          lastMobileOrganTap = { organId: "", time: 0 };
          reportClick();
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            try {
              navigator.vibrate(18);
            } catch {}
          }
          onSelect(organ.organ_id, false);
          useInspector3DStore.getState().setInspectorPanelOpen(true);
        }, 380);
      }}
      onPointerMove={(event) => {
        if (longPressTimerRef.current !== null && longPressStartRef.current) {
          const moved = Math.hypot(
            event.clientX - longPressStartRef.current.x,
            event.clientY - longPressStartRef.current.y,
          );
          if (moved > 9 || pressTravelled()) {
            clearLongPress();
          }
        }
        if (onProbe) {
          event.stopPropagation();
          reportDepthStack();
          onProbe(stackFromCrossings(event.intersections));
        }
      }}
      onPointerUp={(event) => {
        triggerTapOrClickOpen(event);
      }}
      onPointerCancel={() => {
        clearLongPress();
      }}
      onPointerOver={(event) => {
        if (blockedByIsolate || clickThrough || useScanStore.getState().enabled || useHeartStore.getState().enabled || useBreathStore.getState().enabled) return;
        event.stopPropagation();
        onHover(organ.organ_id);
      }}
      onPointerOut={() => {
        clearLongPress();
        onHover(null);
      }}
      onContextMenu={(event) => {
        if (useScanStore.getState().enabled || useHeartStore.getState().enabled || useBreathStore.getState().enabled) return;
        event.stopPropagation();
        onContextMenu(organ.organ_id, event.clientX, event.clientY);
      }}
      onDoubleClick={(event) => {
        if (blockedByIsolate || clickThrough || useScanStore.getState().enabled || useHeartStore.getState().enabled || useBreathStore.getState().enabled) return;
        const pType = (event as unknown as { pointerType?: string }).pointerType;
        if (pType === "touch" || (typeof window !== "undefined" && window.innerWidth < 768)) {
          event.stopPropagation();
          useSceneStore.getState().orientView("anterior");
          useSceneStore.getState().fitView();
          return;
        }
        event.stopPropagation();
        if (pressTravelled()) return;
        const additive = Boolean(event.shiftKey || event.ctrlKey || event.metaKey);
        onSelect(organ.organ_id, additive);
      }}
    >
      {beating && beatUserData ? (
        <meshStandardMaterial
          key={`beat-${tShaderId}`}
          ref={beatMaterial}
          {...surface}
          onBeforeCompile={BEAT_COMPILERS[tShaderId]}
          customProgramCacheKey={BEAT_CACHE_KEYS[tShaderId]}
          userData={beatUserData}
        />
      ) : scanBandEnabled && scanProps ? (
        <meshStandardMaterial
          key={`scan-${tShaderId}`}
          ref={scanMaterial}
          {...surface}
          {...scanProps}
        />
      ) : !breathing && IS_LOW_END_MOBILE ? (
        <meshLambertMaterial
          key={`lambert-${tShaderId}`}
          color={surface.color}
          emissive={surface.emissive}
          emissiveIntensity={surface.emissiveIntensity}
          transparent={surface.transparent}
          opacity={surface.opacity}
          depthWrite={surface.depthWrite}
          polygonOffset={surface.polygonOffset}
          polygonOffsetFactor={surface.polygonOffsetFactor}
          polygonOffsetUnits={surface.polygonOffsetUnits}
          clippingPlanes={surface.clippingPlanes}
          side={surface.side}
        />
      ) : (
        <meshPhysicalMaterial
          key={breathing ? `breath-on-${tShaderId}` : `breath-off-${tShaderId}`}
          ref={material}
          {...surface}
          onBeforeCompile={breathing ? BREATH_COMPILERS[tShaderId] : STD_COMPILERS[tShaderId]}
          customProgramCacheKey={breathing ? BREATH_CACHE_KEYS[tShaderId] : STD_CACHE_KEYS[tShaderId]}
          userData={breathing ? breath : undefined}
        />
      )}

      {flow && (
        <mesh
          geometry={geometry}
          material={flow}
          raycast={NO_RAYCAST}
          renderOrder={3}
        />
      )}

      {(selected || (hovered && organ.system === "muscular")) && ATLAS_STYLE.rendering.enableOutline && (
        <mesh
          geometry={geometry}
          raycast={NO_RAYCAST}
          renderOrder={5}
        >
          <meshStandardMaterial
            color={ATLAS_STYLE.muscles.outlineColor}
            emissive={ATLAS_STYLE.muscles.selectedEmissive}
            emissiveIntensity={ATLAS_STYLE.muscles.selectedEmissiveIntensity}
            roughness={0.2}
            metalness={0.0}
            transparent
            opacity={0.78}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-12}
            polygonOffsetUnits={-12}
            toneMapped={false}
            clippingPlanes={clippingPlanes}
            onBeforeCompile={SELECTED_WRAP_COMPILER}
            customProgramCacheKey={SELECTED_WRAP_CACHE_KEY}
          />
        </mesh>
      )}

      {litGlow > 0 && (
        <mesh
          geometry={geometry}
          raycast={NO_RAYCAST}
          renderOrder={4}
        >
          <meshBasicMaterial
            onBeforeCompile={breathOnBeforeCompile}
            userData={breath}
            color={LIT_LIGHT}
            transparent
            opacity={OCCLUDED_FLOOR + litGlow * OCCLUDED_RANGE}
            depthFunc={THREE.GreaterDepth}
            depthWrite={false}
            toneMapped={false}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}
    </mesh>
  );
});
