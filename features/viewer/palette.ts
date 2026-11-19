'use client';

import * as THREE from "three";

import type { AnatomicalSystem } from "@/lib/schemas";

export const SYSTEM_COLOURS: Record<AnatomicalSystem, string> = {
  //: Warm natural cortical ivory bone
  skeletal: "#bf9868",
  //: Glossy sky-cyan hyaline cartilage & joint capsules
  articular: "#38bdf8",
  //: Striated muscle belly crimson-rose
  muscular: "#a41e28",
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
  // Pearlescent Collagen White-Ivory for Aponeuroses, Iliotibial Tract, Thoracolumbar Fascia, Rectus Sheath & Muscular Tendons (matching Muscular System posters)
  {
    id: "muscular-tendon",
    label: "Aponeurosis, tendon & retinaculum (Muscular)",
    test: /\b(aponeurosis|iliotibial|thoracolumbar|investing abdominal|inguinal ligament|iliopectineal|superficial transverse|tendo|tendon|tendons|tendinis|retinaculum|sheath|vincula|chiasm)\b/i,
    colour: "#f2ead8",
    systems: ["muscular"],
  },
  // Golden-Amber Tendons, Tendon Sheaths & Retinacula in Skeletal System (3-Color Coding: Warm Bone #bf9868, Cyan Cartilage/Joints #38bdf8, Amber Tendon #f59e0b)
  {
    id: "connective",
    label: "Tendon, sheath & retinaculum",
    test: /\b(tendo|tendon|tendons|tendinis|retinaculum|sheath|vincula|chiasm|aponeurosis|iliotibial)\b/i,
    colour: "#f59e0b",
  },
  // Vivid Hyaline Sky Cyan-Blue Cartilages, Costal Cartilages, Laryngeal Cartilages, Menisci, Labra & Intervertebral Discs
  {
    id: "cartilage",
    label: "Cartilage, meniscus & disc",
    test: /\b(cartilago|cartilage|cartilagines|meniscus|discus|intervertebral disc|nucleus pulposus|articular disc|labrum|symphysis|synchondrosis)\b/i,
    colour: "#38bdf8",
  },
  // Vivid Sky Cyan-Blue Joint Capsules & Articular Ligaments (matching Cartilage & Joints color #38bdf8)
  {
    id: "ligament",
    label: "Joint capsule & ligament",
    test: /\b(ligamentum|ligament|ligaments|ligamenta|frenula|capsula articularis|articular capsule|syndesmosis|membrane|oblique cord)\b/i,
    colour: "#38bdf8",
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
    return { id: "connective", label: "Tendon, sheath & retinaculum", hex: "#f59e0b" };
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
    // Rich osseous cortical bone shade (#bf9868) with deeper mineral warmth and zero bleached white
    const boneBaseName = organ.name_en
      .replace(/\s*\((left|right)\)\s*/gi, "")
      .trim()
      .toLowerCase();
    const bSeed = hash(boneBaseName);
    const hsl = { h: 0, s: 0, l: 0 };
    colour.getHSL(hsl);
    const hueShift = spread(bSeed, 0) * 0.014;
    const satShift = spread(bSeed, 8) * 0.05;
    const lightShift = spread(bSeed, 16) * 0.045;
    colour.setHSL(
      (hsl.h + hueShift + 1) % 1,
      Math.min(Math.max(hsl.s + satShift, 0.32), 0.48),
      Math.min(Math.max(hsl.l + lightShift, 0.46), 0.58),
    );
    cache.set(organ.organ_id, colour);
    return colour;
  }
  if (organ.system === "muscular") {
    // Distinct per-muscle anatomical myoglobin shade (24% lightness spread + subtle ruby/terracotta/crimson hue shift)
    // so adjacent muscles and muscle heads are clearly separated ("فالعضلات زود الفصل بين كل جزء بطريقة كويسة انت اختارها")
    const muscleSymKey = organ.organ_id
      .replace(/_(l|r|left|right)$/i, "")
      .trim()
      .toLowerCase();
    const mSeed = hash(muscleSymKey + "::" + organ.name_en.replace(/\s*\((left|right)\)\s*/gi, "").trim().toLowerCase());
    const hsl = { h: 0, s: 0, l: 0 };
    colour.getHSL(hsl);
    const hueShift = spread(mSeed, 0) * 0.018;
    const satShift = spread(mSeed, 8) * 0.11;
    const lightShift = spread(mSeed, 16) * 0.115;
    colour.setHSL(
      (hsl.h + hueShift + 1) % 1,
      Math.min(Math.max(hsl.s + satShift, 0.62), 0.86),
      Math.min(Math.max(hsl.l + lightShift, 0.25), 0.48),
    );
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
  skeletal: 0.44,
  articular: 0.18,
  muscular: 0.26,
  cardiovascular: 0.20,
  nervous: 0.26,
  lymphatic: 0.26,
  respiratory: 0.22,
  digestive: 0.24,
  renal: 0.20,
  endocrine: 0.24,
  reproductive: 0.26,
  integumentary: 0.34,
  regional: 0.34,
};

export function tissueRoughness(system: AnatomicalSystem): number {
  return ROUGHNESS[system] ?? 0.40;
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

