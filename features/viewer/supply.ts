'use client';

import * as THREE from "three";

import type { AnatomicalSystem, ManifestOrgan } from "@/lib/schemas";

export type SupplyKind = "vascular" | "neural" | "lymphatic" | "all";

/** Which system each request draws from. */
export const SUPPLY_SYSTEM: Record<Exclude<SupplyKind, "all">, AnatomicalSystem> = {
  vascular: "cardiovascular",
  neural: "nervous",
  lymphatic: "lymphatic",
};

export const ALL_CONNECTION_SYSTEMS: readonly AnatomicalSystem[] = [
  "cardiovascular",
  "nervous",
  "lymphatic",
  "articular",
];

/** What to call it in the interface. */
export const SUPPLY_LABEL: Record<SupplyKind, string> = {
  vascular: "vessels",
  neural: "nerves",
  lymphatic: "lymphatics",
  all: "vessels, nerves & lymphatics",
};

/**
 * Tight margin around a single organ (1.8% of its size) so only vessels, nerves,
 * and lymphatics that directly touch or enter the organ are considered.
 */
export const REACH = 0.018;

/** Maximum number of spatial branches added when no exact name match exists. */
const MAX_SPATIAL_ADDITIONS = 10;

export function studyEnvelope(
  ids: Iterable<string>,
  boxes: Map<string, THREE.Box3>,
): THREE.Box3 | null {
  const envelope = new THREE.Box3();
  let measured = false;
  for (const id of ids) {
    const box = boxes.get(id);
    if (!box) continue;
    envelope.union(box);
    measured = true;
  }
  if (!measured) return null;

  const size = envelope.getSize(new THREE.Vector3());
  return envelope.expandByScalar(Math.max(size.x, size.y, size.z, 0.02) * REACH);
}

/**
 * Smart, proximity-ranked & size-filtered spatial supply collector.
 *
 * Instead of unioning all `studyIds` into one giant torso box (which would grab
 * every vessel and nerve in the body), this measures ONLY around the primary
 * target organ(s), filters out huge whole-body trunks (>2.2x the organ's size),
 * and returns only the closest local vessels/nerves/lymphatics that directly
 * touch the target organ.
 */
export function collectSupply(
  studyIds: string[],
  candidateIds: Iterable<string>,
  boxes: Map<string, THREE.Box3>,
): string[] {
  if (studyIds.length === 0) return [];

  // Use ONLY the primary organ (first 1-3 core structures) to define the local target envelope,
  // never the long vessels already added to the set.
  const coreIds = studyIds.slice(0, 3);
  const envelope = studyEnvelope(coreIds, boxes);
  if (!envelope) return [];

  const coreCenter = envelope.getCenter(new THREE.Vector3());
  const coreSize = envelope.getSize(new THREE.Vector3());
  const coreDiag = Math.max(coreSize.length(), 0.03);

  const already = new Set(studyIds);
  const scored: { id: string; dist: number }[] = [];

  for (const id of candidateIds) {
    if (already.has(id)) continue;
    const box = boxes.get(id);
    if (!box) continue;
    if (!box.intersectsBox(envelope)) continue;

    // Reject giant systemic trunks whose bounding box spans the whole torso (>2.2x organ size)
    const candDiag = box.getSize(new THREE.Vector3()).length();
    if (candDiag > coreDiag * 2.2) continue;

    // Distance from the organ's center to the closest point on the candidate's box
    const closestPt = box.clampPoint(coreCenter, new THREE.Vector3());
    const dist = closestPt.distanceTo(coreCenter);
    scored.push({ id, dist });
  }

  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, MAX_SPATIAL_ADDITIONS).map((entry) => entry.id);
}

export function isSystemMeasured(
  candidateIds: Iterable<string>,
  boxes: Map<string, THREE.Box3>,
): boolean {
  for (const id of candidateIds) {
    if (boxes.has(id)) return true;
  }
  return false;
}

/**
 * Broad system-level path nodes that must NEVER be expanded as a "parent organ".
 */
const BROAD_SYSTEM_NODES = new Set([
  "Urinary system",
  "Digestive system",
  "Digestive canal",
  "Respiratory system",
  "Lymphoid system",
  "Endocrine glands",
  "Visceral systems",
  "Cardiovascular system",
  "Systemic arteries",
  "Systemic veins",
  "Pulmonary vessels",
  "Pulmonary arteries",
  "Pulmonary veins",
  "Cardiac vessels",
  "Nervous system",
  "Peripheral nervous system",
  "Autonomic nervous system",
  "Central nervous system",
  "Cranial nerves",
  "Spinal nerves",
  "Skeletal system",
  "Axial skeleton",
  "Appendicular skeleton",
  "Muscular system",
  "Articular system",
  "Reproductive system",
  "Female reproductive system",
  "Male reproductive system",
  "Sense organs",
  "Integument",
]);

/**
 * Curated anatomical rules mapping each major organ to ONLY its true direct
 * vessels, nerves, lymph nodes, ducts, and ligaments.
 */
const ORGAN_CONNECTION_RULES: readonly {
  trigger: RegExp;
  match: RegExp;
  exclude?: RegExp;
}[] = [
  {
    // Stomach (Gaster)
    trigger: /\b(gaster|stomach|mucosa of stomach|pylorus|cardia)\b/i,
    match: /\b(stomach|mucosa of stomach|left gastric|right gastric|short gastric|gastro-omental|gastroepiploic|gastroduodenal|coeliac trunk|coeliac nodes|gastric nodes|pyloric nodes|hepatogastric|gastrocolic|gastrosplenic|gastrophrenic|vagus nerve)\b/i,
    exclude: /\b(gastrocnemius|epigastric|digastric|nucleus)\b/i,
  },
  {
    // Liver & Gallbladder (Hepar & Vesica biliaris)
    trigger: /\b(hepar|liver|hepatis|gallbladder|vesica biliaris|vesica fellea|cystic)\b/i,
    match: /\b(liver|segment.*liver|segmentum.*hepatis|gallbladder|vesica biliaris|cystic|common hepatic|proper hepatic|hepatic portal vein|vena portae|hepatic veins|venae hepaticae|choledoch|bile duct|falciform|coronary ligament|round ligament of liver|hepatoduodenal|hepatogastric)\b/i,
  },
  {
    // Kidney (Ren)
    trigger: /\b(ren|kidney|renal pelvis|pelvis renalis|hilum renale)\b/i,
    match: /\b(kidney|renal artery|arteria renalis|intrarenal arteries|renal vein|vena renalis|intrarenal veins|renal pelvis|pelvis renalis|ureter|inferior suprarenal artery|suprarenal gland|renal plexus|renal nodes)\b/i,
    exclude: /\b(splenorenal|hepatorenal)\b/i,
  },
  {
    // Spleen (Lien / Splen)
    trigger: /\b(splen|lien|spleen)\b/i,
    match: /\b(spleen|lien|splenic artery|arteria splenica|splenic vein|vena splenica|splenic nodes|nodi splenici|gastrosplenic|splenorenal|short gastric)\b/i,
    exclude: /\b(splenius)\b/i,
  },
  {
    // Pancreas
    trigger: /\b(pancreas|pancreatic)\b/i,
    match: /\b(pancreas|pancreatic duct|accessory pancreatic duct|pancreaticoduodenal|pancreatic nodes|splenic artery|splenic vein)\b/i,
  },
  {
    // Thyroid & Parathyroid Glands
    trigger: /\b(thyroid gland|glandula thyreoidea|glandula thyroidea|parathyroid)\b/i,
    match: /\b(thyroid gland|glandula thyreoidea|parathyroid gland|glandula parathyreoidea|superior thyroid|inferior thyroid|thyroidima|thyroid nodes|thyroid cartilage|cricoid cartilage|recurrent laryngeal)\b/i,
    exclude: /\b(thyrohyoid|thyropharyngeus|thyro-arytenoid|thyro-epiglottic)\b/i,
  },
  {
    // Heart (Cor)
    trigger: /\b(cor|heart|ventriculus sinister|ventriculus dexter|atrium cordis|myocardium)\b/i,
    match: /\b(heart|cordis|atrium|ventricle|ventriculus|myocardium|coronary|interventricular artery|circumflex artery of heart|great cardiac vein|middle cardiac vein|small cardiac vein|anterior cardiac|aortic valve|mitral valve|tricuspid valve|pulmonary valve|ascending aorta|aorta ascendens|pulmonary trunk|truncus pulmonalis|fibrous trigone|interatrial septum|interventricular septum)\b/i,
    exclude: /\b(fourth ventricle|third ventricle|lateral ventricle|cerebr|laryn)\b/i,
  },
  {
    // Lungs (Pulmo)
    trigger: /\b(pulmo|lung|bronchus|hilum pulmonis)\b/i,
    match: /\b(lung|pulmonis|lobar artery|segmental artery|lingular artery|pulmonary artery|pulmonary vein|main bronchus|lobar bronchus|segmental bronchus|bronchopulmonary|tracheobronchial)\b/i,
  },
  {
    // Urinary Bladder (Vesica urinaria)
    trigger: /\b(urinary bladder|vesica urinaria|trigone of bladder)\b/i,
    match: /\b(urinary bladder|vesica urinaria|trigone|vesical artery|vesical vein|vesical venous|ureter|internal urethral|urethra)\b/i,
  },
  {
    // Uterus & Ovaries
    trigger: /\b(uterus|ovary|ovarium|uterine|fallopian|tuba uterina)\b/i,
    match: /\b(uterus|uterine|ovary|ovarian|fallopian|tuba uterina|broad ligament|round ligament of uterus|uterosacral|suspensory ligament of ovary|vagina)\b/i,
  },
];

/**
 * Returns ONLY the structures that truly belong to or directly supply/drain/innervate
 * the selected organ (respecting Left vs Right side).
 */
export function collectKeywordConnections(
  rootOrgan: ManifestOrgan,
  organs: Record<string, ManifestOrgan>,
): string[] {
  const rootText = `${rootOrgan.ta2_latin} ${rootOrgan.name_en}`;
  const isLeft =
    /\b(left|sinister|sinistra|sinistrum|sinistri)\b/i.test(rootText) ||
    rootOrgan.organ_id.endsWith("_l");
  const isRight =
    /\b(right|dexter|dextra|dextrum|dextri)\b/i.test(rootText) ||
    rootOrgan.organ_id.endsWith("_r");

  const activeRule = ORGAN_CONNECTION_RULES.find((rule) =>
    rule.trigger.test(rootText),
  );

  const results = new Set<string>([rootOrgan.organ_id]);

  // If the organ has a specific organ-level parent node (e.g. "Liver", "Heart"),
  // include sibling parts of that exact organ (never broad system nodes!)
  const immediateParent =
    rootOrgan.path.length > 0
      ? rootOrgan.path[rootOrgan.path.length - 1]
      : null;
  const allowParentGroup =
    immediateParent !== null && !BROAD_SYSTEM_NODES.has(immediateParent);

  // Extract a specific anatomical adjective if no curated rule matched (e.g. "femoral", "brachial", "radial", "ulnar", "sciatic", "obturator", "axillary", "carotid", "facial")
  const specificStems = [
    "femoral", "femoris", "brachial", "brachii", "radial", "radialis",
    "ulnar", "ulnaris", "median", "medianus", "sciatic", "ischiadicus",
    "tibial", "tibialis", "fibular", "fibularis", "peroneal", "obturator",
    "axillary", "axillaris", "subclavian", "subclavia", "carotid", "carotis",
    "maxillary", "maxillaris", "mandibular", "mandibularis", "facial", "facialis",
    "lingual", "lingualis", "ophthalmic", "ophthalmica", "gluteal", "glutea",
    "iliac", "iliaca", "popliteal", "poplitea", "pudendal", "pudenda",
    "intercostal", "intercostalis", "phrenic", "phrenica", "suprascapular",
    "subscapular", "circumflex", "mesenteric", "mesenterica", "colic", "colica",
    "rectal", "rectalis", "sigmoidal", "ileocolic", "appendicular", "esophageal",
  ];
  const matchedSpecificStems = activeRule
    ? []
    : specificStems.filter((stem) => rootText.toLowerCase().includes(stem));

  for (const candidate of Object.values(organs)) {
    if (candidate.organ_id === rootOrgan.organ_id) continue;
    const candText = `${candidate.ta2_latin} ${candidate.name_en}`;

    // Strict Side Filter: if the selected organ is Right, never pull Left vessels/nerves (and vice versa)
    if (isRight) {
      if (
        /\b(left|sinister|sinistra|sinistrum|sinistri)\b/i.test(candText) ||
        candidate.organ_id.endsWith("_l")
      ) {
        continue;
      }
    }
    if (isLeft) {
      if (
        /\b(right|dexter|dextra|dextrum|dextri)\b/i.test(candText) ||
        candidate.organ_id.endsWith("_r")
      ) {
        continue;
      }
    }

    // 1. Sub-parts of the exact same organ node
    if (
      allowParentGroup &&
      immediateParent &&
      (candidate.node === immediateParent ||
        candidate.path[candidate.path.length - 1] === immediateParent)
    ) {
      results.add(candidate.organ_id);
      continue;
    }

    // 2. Curated Organ Connection Rule (Stomach, Liver, Kidney, Spleen, Pancreas, Heart, Thyroid, Lung, Bladder, Uterus)
    if (activeRule) {
      if (activeRule.exclude && activeRule.exclude.test(candText)) continue;
      if (
        activeRule.match.test(candText) &&
        (candidate.system === rootOrgan.system ||
          candidate.system === "cardiovascular" ||
          candidate.system === "nervous" ||
          candidate.system === "lymphatic" ||
          candidate.system === "articular")
      ) {
        results.add(candidate.organ_id);
      }
      continue;
    }

    // 3. Specific anatomical neurovascular bundle stem match (e.g. Femoral bone/muscle -> Femoral artery, vein, nerve, nodes)
    if (
      matchedSpecificStems.length > 0 &&
      (candidate.system === "cardiovascular" ||
        candidate.system === "nervous" ||
        candidate.system === "lymphatic")
    ) {
      const lowerCand = candText.toLowerCase();
      if (matchedSpecificStems.some((stem) => lowerCand.includes(stem))) {
        results.add(candidate.organ_id);
      }
    }
  }

  return [...results];
}
