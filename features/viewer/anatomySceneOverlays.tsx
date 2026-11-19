'use client';

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef , useState } from "react";
import * as THREE from "three";
import { matchOrganToEntry } from "@/lib/atlasKnowledgeIndex";
import type { AnatomyManifest, ManifestOrgan } from "@/lib/schemas";
import { useSceneStore } from "@/stores/sceneStore";
import {
  type BoneLandmark3D,
  type OrganGeometry,
  type OrganRelationItem,
  useInspector3DStore,
} from "./anatomySceneTypes";

/**
 * Micro-tag with an ultra-thin hairline leader arrow (سهم رفيع جدا + كلمة صغيرة)
 * pointing directly at the 3D anatomical point without covering the model.
 */
interface CalloutPlacementInput {
  id: string;
  worldPos: [number, number, number];
  text: string;
}

interface CalloutPlacementResult {
  side: "left" | "right";
  vOffset: number;
  hOffset: number;
}

/**
 * Universal Non-Overlapping 3D Callout Layout Engine (`layoutNonOverlappingCallouts`):
 * - Sorts all 3D pins from top to bottom by world Y (`worldPos[1]` descending).
 * - Alternates `"right"` and `"left"` columns down the vertical rank so vertically adjacent pins
 *   are ALWAYS placed on opposite sides of the bone/organ (fixing Head of humerus vs Intertubercular sulcus!).
 * - Within each side column (`left` and `right`), enforces a strict minimum vertical pixel separation
 *   (`minGapPx = 46px` per bubble) by assigning angled `vOffset` pixel shifts and drawing a crisp
 *   SVG leader line from the exact 3D point `(0, 0)` to the displaced bubble `(±hOffset, vOffset)`.
 */
function layoutNonOverlappingCallouts(
  items: CalloutPlacementInput[],
  worldSpanY = 0.18,
): Map<string, CalloutPlacementResult> {
  const result = new Map<string, CalloutPlacementResult>();
  if (items.length === 0) return result;

  // Sort from highest Y (top of screen) to lowest Y (bottom of screen)
  const sorted = [...items].sort((a, b) => b.worldPos[1] - a.worldPos[1]);

  const leftCol: { item: CalloutPlacementInput; approxY: number; heightPx: number; targetY: number }[] = [];
  const rightCol: { item: CalloutPlacementInput; approxY: number; heightPx: number; targetY: number }[] = [];

  // Conservative screen-pixel scale for 3D vertical span (even when zoomed out, 1.0 span = 220px)
  const pxPerMeter = 220 / Math.max(worldSpanY, 0.08);
  const topY = sorted[0]!.worldPos[1];

  sorted.forEach((item, rank) => {
    const side: "left" | "right" = rank % 2 === 0 ? "right" : "left";
    const lineCount = stackTwoWords(item.text).length;
    const heightPx = Math.max(32, lineCount * 11 + 12);
    const approxY = (topY - item.worldPos[1]) * pxPerMeter;
    const entry = { item, approxY, heightPx, targetY: approxY };
    if (side === "left") leftCol.push(entry);
    else rightCol.push(entry);
  });

  const solveColumn = (
    col: { item: CalloutPlacementInput; approxY: number; heightPx: number; targetY: number }[],
    side: "left" | "right",
  ) => {
    if (col.length === 0) return;
    const PAD_PX = 12;
    // Forward pass: push down any bubble that would overlap the one above it
    for (let i = 1; i < col.length; i++) {
      const prev = col[i - 1]!;
      const curr = col[i]!;
      const minAllowedY = prev.targetY + (prev.heightPx + curr.heightPx) * 0.5 + PAD_PX;
      if (curr.targetY < minAllowedY) {
        curr.targetY = minAllowedY;
      }
    }
    // Re-center the column around its original average Y so top and bottom spread symmetrically
    const origAvg = col.reduce((acc, c) => acc + c.approxY, 0) / col.length;
    const newAvg = col.reduce((acc, c) => acc + c.targetY, 0) / col.length;
    const shift = origAvg - newAvg;
    for (let i = 0; i < col.length; i++) {
      const c = col[i]!;
      c.targetY += shift;
    }
    // Second forward pass after centering to guarantee 100% zero overlap
    for (let i = 1; i < col.length; i++) {
      const prev = col[i - 1]!;
      const curr = col[i]!;
      const minAllowedY = prev.targetY + (prev.heightPx + curr.heightPx) * 0.5 + PAD_PX;
      if (curr.targetY < minAllowedY) {
        curr.targetY = minAllowedY;
      }
    }

    for (let i = 0; i < col.length; i++) {
      const c = col[i]!;
      const vOffset = Math.max(-22, Math.min(22, Math.round((c.targetY - c.approxY) * 0.35)));
      const hOffset = 44 + (i % 2) * 14;
      result.set(c.item.id, { side, vOffset, hOffset });
    }
  };

  solveColumn(leftCol, "left");
  solveColumn(rightCol, "right");
  return result;
}

interface CalloutOcclusionSliceBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const ACTIVE_CALLOUT_OCCLUSION_CTX: {
  camera: THREE.Camera | null;
  organBox: CalloutOcclusionSliceBox | null;
  solidBoxes: CalloutOcclusionSliceBox[];
} = {
  camera: null,
  organBox: null,
  solidBoxes: [],
};

/**
 * Strictly TWO-VIEW Callout Visibility (`والبيانات عالمجسم خليها تظهر وتختفي في تو فيوس فقط مش اربع اتجاهات او اكثر`):
 * - Callouts on the 3D model ONLY appear in TWO views:
 *   1. Front View (Anterior: `vzRaw >= 0` within the anterior view cone)
 *   2. Back View (Posterior: `vzRaw < 0` within the posterior view cone)
 * - In Lateral (Left/Right) or Top/Bottom camera angles, callouts are hidden (`return false`).
 * - Each callout is assigned strictly to either Front View or Back View along the Anterior-Posterior (Z) axis only,
 *   never requiring 4-direction (Left/Right/Top/Bottom) rotation.
 */
function isCalloutPointFacingCamera(
  worldPos?: [number, number, number] | THREE.Vector3,
  labelText?: string,
): boolean {
  if (!worldPos) return true;
  const cam = ACTIVE_CALLOUT_OCCLUSION_CTX.camera;
  if (!cam) return true;

  const px = Array.isArray(worldPos) ? worldPos[0] : worldPos.x;
  const py = Array.isArray(worldPos) ? worldPos[1] : worldPos.y;
  const pz = Array.isArray(worldPos) ? worldPos[2] : worldPos.z;

  const ob = ACTIVE_CALLOUT_OCCLUSION_CTX.organBox;
  const solid = ACTIVE_CALLOUT_OCCLUSION_CTX.solidBoxes;

  let minX = ob ? ob.minX : px - 0.02;
  let maxX = ob ? ob.maxX : px + 0.02;
  let minZ = ob ? ob.minZ : pz - 0.02;
  let maxZ = ob ? ob.maxZ : pz + 0.02;

  for (let i = 0; i < solid.length; i++) {
    const b = solid[i]!;
    if (py < b.minY - 0.045 || py > b.maxY + 0.045) continue;
    if (px < b.minX - 0.14 || px > b.maxX + 0.14) continue;
    if (b.minX < minX) minX = b.minX;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.minZ < minZ) minZ = b.minZ;
    if (b.maxZ > maxZ) maxZ = b.maxZ;
  }

  // Reference center of the selected structure (or body slice when full context is visible)
  const ocx = ob ? (ob.minX + ob.maxX) * 0.5 : (minX + maxX) * 0.5;
  const ocy = ob ? (ob.minY + ob.maxY) * 0.5 : py;
  const ocz = ob ? (ob.minZ + ob.maxZ) * 0.5 : (minZ + maxZ) * 0.5;
  const bcx = (minX + maxX) * 0.5;
  const bcz = (minZ + maxZ) * 0.5;

  // Camera direction vector from structure center to camera (supports all 360-degree camera directions!)
  const vx = cam.position.x - ocx;
  const vy = cam.position.y - ocy;
  const vz = cam.position.z - ocz;
  const camLen = Math.hypot(vx, vy, vz);
  if (camLen < 1e-6) return true;
  const camDx = vx / camLen;
  const camDy = vy / camLen;
  const camDz = vz / camLen;

  const low = (labelText ?? "").toLowerCase();
  const explicitPosterior =
    /\b(posterior|dorsal|olecranon|infraspinous|supraspinous|spine of scapula|gluteal|popliteal|linea aspera|calcaneal|spinous|lamina)\b/i.test(
      low,
    );
  const explicitAnterior =
    /\b(anterior|ventral|coracoid|subscapular|intertubercular|deltoid tuberosity|radial fossa|coronoid|patellar|tibial tuberosity|pectineal|pubic tubercle|manubrium|xiphoid)\b/i.test(
      low,
    );

  // Compute outward surface normal of the callout point ("من برا") so checked items remain visible across all rotation angles
  // on the camera-facing outside surface while hiding points occluded on the opposite back side of the opaque muscle/bone
  let nx = (px - ocx) + (px - bcx) * 0.65;
  let ny = (py - ocy) * 0.22;
  let nz = (pz - ocz) + (pz - bcz) * 0.85;

  if (explicitPosterior && !explicitAnterior) {
    nz -= 0.045;
  } else if (explicitAnterior && !explicitPosterior) {
    nz += 0.045;
  }

  const nLen = Math.hypot(nx, ny, nz);
  if (nLen < 1e-5) return true;
  nx /= nLen;
  ny /= nLen;
  nz /= nLen;

  const dot = nx * camDx + ny * camDy + nz * camDz;
  return dot >= -0.22;
}

function MicroPinCallout({
  text,
  accent = "#38bdf8",
  active = false,
  side = "right",
  vOffset = 0,
  hOffset = 28,
  worldPos,
  onClick,
}: {
  text: string;
  accent?: string;
  active?: boolean;
  side?: "left" | "right";
  vOffset?: number;
  hOffset?: number;
  worldPos?: [number, number, number] | THREE.Vector3;
  onClick?: () => void;
}) {
  const isLeft = side === "left";
  const endX = isLeft ? -hOffset : hOffset;
  const endY = vOffset;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!worldPos) return;
    let raf = 0;
    let lastVisible: boolean | null = null;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = rootRef.current;
      if (!el) return;
      const facing = isCalloutPointFacingCamera(worldPos, text);
      if (facing !== lastVisible) {
        lastVisible = facing;
        el.style.opacity = facing ? "1" : "0";
        el.style.visibility = facing ? "visible" : "hidden";
        el.style.pointerEvents = facing ? "" : "none";
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [worldPos, text]);

  return (
    <div
      ref={rootRef}
      dir="ltr"
      className="relative h-0 w-0 select-none overflow-visible transition-opacity duration-150"
    >
      {/* Diagonal/Horizontal ultra-thin hairline leader arrow from (0,0) [the 3D point] to (endX, endY) [the bubble] */}
      <svg
        width="1"
        height="1"
        viewBox="0 0 1 1"
        fill="none"
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        aria-hidden="true"
      >
        <line
          x1={endX}
          y1={endY}
          x2={0}
          y2={0}
          stroke={accent}
          strokeWidth="0.9"
        />
        <circle cx={0} cy={0} r="1.6" fill={accent} />
      </svg>

      <div
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick();
          }
        }}
        style={{
          transform: `translate(${isLeft ? `calc(-100% - ${hOffset}px)` : `${hOffset}px`}, calc(-50% + ${vOffset}px))`,
        }}
        className={`absolute left-0 top-0 ${
          onClick ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
        }`}
      >
        <span
          style={{ borderColor: accent }}
          className={`flex flex-col rounded border bg-slate-950/95 px-1.5 py-[2px] text-left text-[8px] font-bold leading-[1.15] text-white shadow-lg backdrop-blur-xs transition ${
            active ? "scale-105 ring-1 ring-white" : "opacity-95 hover:opacity-100"
          }`}
        >
          {stackTwoWords(text).map((line, idx) => (
            <span key={idx} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

function stackTwoWords(raw: string): string[] {
  const rawTokens = raw.trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) return [raw];
  const tokens: string[] = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i]!;
    if ((t === "·" || t === "-" || t === "—") && i + 1 < rawTokens.length) {
      tokens.push(`${t} ${rawTokens[i + 1]!}`);
      i += 1;
    } else {
      tokens.push(t);
    }
  }
  const lines: string[] = [];
  for (let i = 0; i < tokens.length; i += 2) {
    lines.push(tokens.slice(i, i + 2).join(" "));
  }
  return lines.length > 0 ? lines : [raw];
}

/**
 * Slices a BufferGeometry into anatomical subdivisions (e.g., 8 six-pack segments of Rectus abdominis,
 * Superior/Inferior parts of External & Internal oblique with medial rectus-sheath aponeurosis recessed,
 * 6 parts of Latissimus dorsi with paraspinal window open, and distal tendons for Skeletal view).
 */
import { buildBoneLandmarks3D, buildMuscleBranches3D, sliceSubdividedMuscleGeometry } from "./anatomySceneLandmarks";

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

export { buildBoneLandmarks3D, buildMuscleBranches3D, sliceSubdividedMuscleGeometry };

/**
 * Anatomical Myotome & Peripheral Nerve -> Target Muscle Innervation Rules
 * Ensures selecting any nerve highlights its true anatomically innervated muscles (on the matching L/R side),
 * and selecting any muscle lists its true innervating nerve(s) first!
 */
const NERVE_TO_MUSCLE_RULES: [RegExp, RegExp][] = [
  [/\b(oculomotor)\b/i, /\b(superior rectus|inferior rectus|medial rectus|inferior oblique|levator palpebrae)\b/i],
  [/\b(trochlear)\b/i, /\b(superior oblique)\b/i],
  [/\b(abducens)\b/i, /\b(lateral rectus)\b/i],
  [/\b(trigeminal|mandibular|mylohyoid|masseteric|deep temporal)\b/i, /\b(masseter|temporalis|pterygoid|mylohyoid|anterior belly of digastric|tensor veli|tensor tympani)\b/i],
  [/\b(facial nerve)\b/i, /\b(orbicularis|zygomaticus|buccinator|bucinator|risorius|mentalis|depressor|levator labii|nasalis|procerus|frontalis|occipitalis|corrugator|platysma|stylohyoid|posterior belly of digastric)\b/i],
  [/\b(glossopharyngeal)\b/i, /\b(stylopharyngeus)\b/i],
  [/\b(vagus|recurrent laryngeal|superior laryngeal)\b/i, /\b(pharyngeal constrictor|cricothyroid|crico-arytenoid|thyro-arytenoid|arytenoid|palatoglossus|levator veli)\b/i],
  [/\b(accessory nerve)\b/i, /\b(sternocleidomastoid|trapezius)\b/i],
  [/\b(hypoglossal)\b/i, /\b(genioglossus|hyoglossus|styloglossus)\b/i],
  [/\b(dorsal scapular)\b/i, /\b(rhomboid|levator scapulae)\b/i],
  [/\b(long thoracic)\b/i, /\b(serratus anterior)\b/i],
  [/\b(suprascapular)\b/i, /\b(supraspinatus|infraspinatus)\b/i],
  [/\b(subclavian nerve)\b/i, /\b(subclavius)\b/i],
  [/\b(lateral pectoral)\b/i, /\b(pectoralis major)\b/i],
  [/\b(medial pectoral)\b/i, /\b(pectoralis minor|sternocostal head of pectoralis major)\b/i],
  [/\b(subscapular)\b/i, /\b(subscapularis|teres major)\b/i],
  [/\b(thoracodorsal)\b/i, /\b(latissimus dorsi)\b/i],
  [/\b(axillary nerve)\b/i, /\b(deltoid|teres minor)\b/i],
  [/\b(musculocutaneous)\b/i, /\b(biceps brachii|brachialis|coracobrachialis)\b/i],
  [/\b(anterior interosseous)\b/i, /\b(flexor pollicis longus|pronator quadratus|flexor digitorum profundus)\b/i],
  [/\b(median nerve)\b/i, /\b(pronator teres|flexor carpi radialis|palmaris longus|flexor digitorum superficialis|abductor pollicis brevis|opponens pollicis|superficial head of flexor pollicis brevis)\b/i],
  [/\b(deep branch of ulnar|ulnar nerve)\b/i, /\b(flexor carpi ulnaris|adductor pollicis|interossei|abductor digiti minimi of hand|flexor digiti minimi of hand|opponens digiti minimi muscle of hand|deep head of flexor pollicis brevis)\b/i],
  [/\b(posterior interosseous|deep branch of radial)\b/i, /\b(extensor digitorum|extensor digiti minimi|extensor carpi ulnaris|supinator|abductor pollicis longus|extensor pollicis|extensor indicis)\b/i],
  [/\b(radial nerve)\b/i, /\b(triceps brachii|anconeus|brachioradialis|extensor carpi radialis|extensor digitorum)\b/i],
  [/\b(intercostal nerve)\b/i, /\b(intercostal|transversus thoracis|external abdominal oblique|internal abdominal oblique|transversus abdominis|rectus abdominis)\b/i],
  [/\b(iliohypogastric|ilio-inguinal)\b/i, /\b(internal abdominal oblique|transversus abdominis)\b/i],
  [/\b(femoral nerve)\b/i, /\b(rectus femoris|vastus|iliacus|sartorius|pectineus)\b/i],
  [/\b(obturator nerve)\b/i, /\b(adductor longus|adductor brevis|adductor magnus|gracilis|obturator externus)\b/i],
  [/\b(superior gluteal)\b/i, /\b(gluteus medius|gluteus minimus|tensor fasciae latae)\b/i],
  [/\b(inferior gluteal)\b/i, /\b(gluteus maximus)\b/i],
  [/\b(nerve to piriformis)\b/i, /\b(piriformis)\b/i],
  [/\b(nerve to quadratus femoris)\b/i, /\b(quadratus femoris|inferior gemellus)\b/i],
  [/\b(sciatic nerve)\b/i, /\b(biceps femoris|semitendinosus|semimembranosus|adductor magnus)\b/i],
  [/\b(deep fibular)\b/i, /\b(tibialis anterior|extensor hallucis longus|extensor digitorum longus|fibularis tertius|extensor digitorum brevis|extensor hallucis brevis)\b/i],
  [/\b(superficial fibular)\b/i, /\b(fibularis longus|fibularis brevis)\b/i],
  [/\b(common fibular)\b/i, /\b(tibialis anterior|fibularis longus|fibularis brevis|extensor digitorum longus)\b/i],
  [/\b(medial plantar)\b/i, /\b(abductor hallucis|flexor digitorum brevis|flexor hallucis brevis)\b/i],
  [/\b(lateral plantar)\b/i, /\b(abductor digiti minimi of foot|quadratus plantae|adductor hallucis|plantar interossei|dorsal interossei muscles of foot|flexor digiti minimi of foot)\b/i],
  [/\b(tibial nerve)\b/i, /\b(gastrocnemius|soleus|plantaris|popliteus|tibialis posterior|flexor digitorum longus|flexor hallucis longus)\b/i],
  [/\b(pudendal nerve)\b/i, /\b(bulbospongiosus|ischiocavernosus|external anal sphincter|superficial transverse perineal|levator ani)\b/i],
  // Complete 100% Coverage for all Facial, Mastication, Extraocular, Pharyngeal, Laryngeal, Hyoid, Deep Back, Suboccipital, Pelvic/Perineal & Intrinsic Hand/Foot Muscles:
  [/facial|buccal|zygomatic|temporal_branches|marginal_mandibular|cervical_branch|posterior_auricular/i, /orbicularis|zygomaticus|risorius|buccinator|mentalis|depressor_anguli|depressor_labii|levator_labii|levator_anguli|nasalis|procerus|corrugator|depressor_supercilii|occipitofrontalis|temporoparietalis|platysma|auricularis|stapedius|stylohyoid|posterior_belly_of_digastric/i],
  [/mandibular|inferior_alveolar|mylohyoid|lingual_nerve|auriculotemporal|buccal_nerve|masseteric|deep_temporal/i, /masseter|temporalis|medial_pterygoid|lateral_pterygoid|mylohyoid|anterior_belly_of_digastric|tensor_veli_palatini|tensor_tympani/i],
  [/oculomotor|trochlear|abducens|ophthalmic|frontal_nerve|nasociliary/i, /rectus|obliquus_oculi|superior_oblique|inferior_oblique|levator_palpebrae/i],
  [/hypoglossal|lingual/i, /genioglossus|hyoglossus|styloglossus|intrinsic_muscles_of_tongue|geniohyoid/i],
  [/vagus|recurrent_laryngeal|superior_laryngeal|glossopharyngeal|accessory/i, /constrictor|cricothyroid|cricoarytenoid|thyroarytenoid|arytenoid|thyroepiglottic|vocalis|palatoglossus|palatopharyngeus|salpingopharyngeus|stylopharyngeus|levator_veli_palatini|musculus_uvulae|trachealis/i],
  [/ansa_cervicalis|cervical_plexus|transverse_cervical|supraclavicular|lesser_occipital|great_auricular|phrenic|suboccipital|greater_occipital|third_occipital|cervical_nerve/i, /sternohyoid|sternothyroid|thyrohyoid|omohyoid|longus_colli|longus_capitis|rectus_capitis|obliquus_capitis|scalenus|scalene|splenius|semispinalis|longissimus_capitis|longissimus_cervicis|iliocostalis_cervicis|interspinales_cervicis|intertransversarii|multifidus_cervicis|rotatores|diaphragm/i],
  [/dorsal_scapular|suprascapular|long_thoracic|subclavius|pectoral|thoracodorsal|subscapular|axillary/i, /rhomboid|levator_scapulae|supraspinatus|infraspinatus|serratus_anterior|subclavius|pectoralis|latissimus_dorsi|subscapularis|teres_major|teres_minor|deltoid/i],
  [/intercostal|subcostal|thoracic_nerve|dorsal_ram/i, /intercostal|subcostal|transversus_thoracis|levatores_costarum|serratus_posterior|erector_spinae|iliocostalis|longissimus|spinalis|multifidus|rotatores|interspinales|intertransversarii/i],
  [/iliohypogastric|ilioinguinal|genitofemoral|subcostal|intercostal/i, /rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis|pyramidalis|cremaster|quadratus_lumborum/i],
  [/pudendal|perineal|inferior_rectal|dorsal_nerve|pelvic_splanchnic|sacral|coccygeal/i, /levator_ani|pubococcygeus|puborectalis|iliococcygeus|coccygeus|ischiocavernosus|bulbospongiosus|transverse_perineal|external_anal_sphincter|urethral_sphincter|compressor_urethrae/i],
  [/sciatic|tibial|gluteal|sacral_plexus|piriformis|obturator_internus|quadratus_femoris/i, /piriformis|obturator_internus|superior_gemellus|inferior_gemellus|quadratus_femoris|gluteus|tensor_fasciae_latae|articularis_genus/i],
];

const VESSEL_SPECIFIC_TARGET_RULES: [RegExp, RegExp][] = [
  [/\b(deep_brachial|profunda_brachii|profundo_brachii|radial_collateral|middle_collateral|recurrent_interosseous)\b/i, /\b(triceps_brachii|anconeus)\b/i],
  [/\b(brachial_artery|brachial_vein|cephalic_vein|basilic_vein|median_cubital)\b/i, /\b(biceps_brachii|brachialis|coracobrachialis)\b/i],
  [/\b(superior_ulnar_collateral|inferior_ulnar_collateral|ulnar_recurrent)\b/i, /\b(brachialis|triceps_brachii|flexor_carpi_ulnaris|pronator_teres)\b/i],
  [/\b(anterior_circumflex_humeral|posterior_circumflex_humeral)\b/i, /\b(deltoid|teres_minor|subscapularis)\b/i],
  [/\b(thoracoacromial|thoraco_acromial|lateral_thoracic)\b/i, /\b(pectoralis_major|pectoralis_minor|serratus_anterior|subclavius|deltoid)\b/i],
  [/\b(subscapular|thoracodorsal|circumflex_scapular)\b/i, /\b(subscapularis|latissimus_dorsi|teres_major|infraspinatus)\b/i],
  [/\b(suprascapular|dorsal_scapular)\b/i, /\b(supraspinatus|infraspinatus|rhomboid|levator_scapulae)\b/i],
  [/\b(axillary_artery|axillary_vein|subclavian_artery|subclavian_vein)\b/i, /\b(pectoralis_major|pectoralis_minor|subclavius|serratus_anterior|deltoid|subscapularis)\b/i],
  [/\b(radial_artery|radial_vein|radial_recurrent|deep_palmar|princeps_pollicis|radialis_indicis|dorsal_metacarpal|dorsal_digital_veins_of_hand|dorsal_venous_network_of_hand)\b/i, /\b(brachioradialis|flexor_carpi_radialis|extensor_carpi_radialis|pronator_teres|supinator|abductor_pollicis|opponens_pollicis|adductor_pollicis)\b/i],
  [/\b(ulnar_artery|ulnar_vein|superficial_palmar|palmar_digital|palmar_metacarpal|palmar_venous|median_antebrachial)\b/i, /\b(flexor_carpi_ulnaris|flexor_digitorum_superficialis|flexor_digitorum_profundus|abductor_digiti_minimi|flexor_digiti_minimi|opponens_digiti_minimi|lumbrical|interosseous)\b/i],
  [/\b(anterior_interosseous|posterior_interosseous|common_interosseous)\b/i, /\b(flexor_pollicis_longus|flexor_digitorum_profundus|pronator_quadratus|extensor_digitorum|supinator|abductor_pollicis_longus|extensor_pollicis)\b/i],
  [/\b(deep_femoral|profunda_femoris|perforating_femoral)\b/i, /\b(adductor_magnus|adductor_longus|adductor_brevis|biceps_femoris|semitendinosus|semimembranosus)\b/i],
  [/\b(lateral_circumflex_femoral|descending_branch_of_lateral_circumflex)\b/i, /\b(rectus_femoris|vastus_lateralis|vastus_intermedius|tensor_fasciae_latae)\b/i],
  [/\b(medial_circumflex_femoral|obturator_artery|obturator_vein)\b/i, /\b(pectineus|adductor_longus|adductor_brevis|adductor_magnus|gracilis|obturator_externus|obturator_internus)\b/i],
  [/\b(femoral_artery|femoral_vein|great_saphenous|descending_genicular)\b/i, /\b(rectus_femoris|vastus_medialis|vastus_lateralis|vastus_intermedius|sartorius|pectineus|adductor_longus|gracilis)\b/i],
  [/\b(superior_gluteal)\b/i, /\b(gluteus_medius|gluteus_minimus|tensor_fasciae_latae)\b/i],
  [/\b(inferior_gluteal)\b/i, /\b(gluteus_maximus|piriformis|quadratus_femoris)\b/i],
  [/\b(popliteal_artery|popliteal_vein|small_saphenous|genicular|sural)\b/i, /\b(popliteus|gastrocnemius|soleus|plantaris)\b/i],
  [/\b(anterior_tibial|dorsalis_pedis|arcuate_artery|dorsal_metatarsal|dorsal_venous_arch_of_foot|dorsal_digital_veins_of_foot)\b/i, /\b(tibialis_anterior|extensor_hallucis_longus|extensor_digitorum_longus|extensor_digitorum_brevis|extensor_hallucis_brevis)\b/i],
  [/\b(posterior_tibial|medial_plantar|lateral_plantar|plantar_arch|plantar_metatarsal|plantar_digital|plantar_venous)\b/i, /\b(tibialis_posterior|flexor_digitorum_longus|flexor_hallucis_longus|gastrocnemius|soleus|abductor_hallucis|flexor_digitorum_brevis|quadratus_plantae)\b/i],
  [/\b(fibular_artery|fibular_vein|peroneal)\b/i, /\b(fibularis_longus|fibularis_brevis|soleus|tibialis_posterior)\b/i],
  [/\b(renal_artery|renal_vein)\b/i, /\b(kidney)\b/i],
  [/\b(suprarenal_artery|suprarenal_vein)\b/i, /\b(suprarenal_gland|adrenal|kidney)\b/i],
  [/\b(splenic_artery|splenic_vein)\b/i, /\b(spleen|stomach)\b/i],
  [/\b(hepatic_artery|hepatic_vein|portal_vein|cystic_artery|cystic_vein)\b/i, /\b(liver|gallbladder)\b/i],
  [/\b(gastric_artery|gastric_vein|gastroomental|gastroepiploic|gastroduodenal|celiac_trunk)\b/i, /\b(stomach|duodenum|liver|spleen)\b/i],
  [/\b(superior_mesenteric|jejunal|ileal|ileocolic|right_colic|middle_colic|appendicular)\b/i, /\b(small_intestine|jejunum|ileum|caecum|ascending_colon|transverse_colon|vermiform_appendix)\b/i],
  [/\b(inferior_mesenteric|left_colic|sigmoid|rectal)\b/i, /\b(descending_colon|sigmoid_colon|rectum)\b/i],
  [/\b(pulmonary_artery|pulmonary_vein|pulmonary_trunk|bronchial)\b/i, /\b(lung)\b/i],
  [/\b(coronary_artery|cardiac_vein|coronary_sinus|interventricular_branch|marginal_branch|circumflex_branch_of_left_coronary)\b/i, /\b(ventricular_myocardium|left_ventricle|right_ventricle|left_atrium|right_atrium)\b/i],
  [/\b(testicular_artery|testicular_vein|pampiniform|ovarian_artery|ovarian_vein)\b/i, /\b(testis|epididymis|ovary|uterine_tube)\b/i],
  [/\b(uterine_artery|uterine_vein|vaginal)\b/i, /\b(uterus|vagina)\b/i],
  [/\b(vesical_artery|vesical_vein|umbilical_artery)\b/i, /\b(urinary_bladder)\b/i],
  [/\b(internal_pudendal|dorsal_artery_of_penis|deep_dorsal_vein)\b/i, /\b(bulbospongiosus|ischiocavernosus|levator_ani|corpus_cavernosum|corpus_spongiosum)\b/i],
  [/\b(superior_thyroid|inferior_thyroid|thyroid_vein|thyrocervical)\b/i, /\b(thyroid_gland|sternothyroid|sternohyoid|thyrohyoid|cricothyroid)\b/i],
  [/\b(lingual_artery|lingual_vein)\b/i, /\b(genioglossus|hyoglossus|styloglossus|tongue)\b/i],
  [/\b(facial_artery|facial_vein|transverse_facial)\b/i, /\b(masseter|buccinator|orbicularis_oris|zygomaticus|levator_labii)\b/i],
  [/\b(maxillary_artery|maxillary_vein|deep_temporal|masseteric)\b/i, /\b(temporalis|masseter|lateral_pterygoid|medial_pterygoid)\b/i],
  [/\b(ophthalmic_artery|ophthalmic_vein)\b/i, /\b(eyeball|superior_rectus|lateral_rectus|medial_rectus|inferior_rectus|superior_oblique)\b/i],
  [/\b(internal_carotid|vertebral_artery|basilar_artery|cerebral_artery|cerebellar_artery|communicating_artery|choroidal|striate|frontobasal|prefrontal|pericallosal|callosomarginal|sagittal_sinus|transverse_sinus|sigmoid_sinus|cavernous_sinus|petrosal_sinus|straight_sinus|confluence_of_sinuses|cerebral_vein)\b/i, /\b(frontal_lobe|parietal_lobe|temporal_lobe|occipital_lobe|cerebellum|insula|cingulate|hippocampus|thalamus|caudate|putamen)\b/i],
  [/\b(internal_jugular|external_jugular|anterior_jugular|common_carotid|external_carotid|occipital_artery|posterior_auricular|superficial_temporal|retromandibular)\b/i, /\b(sternocleidomastoid|platysma|digastric|omohyoid|sternohyoid|temporalis|masseter|splenius)\b/i],
  [/\b(internal_thoracic|superior_epigastric|inferior_epigastric|intercostal|subcostal|azygos|hemiazygos|lumbar_vein|lumbar_artery|iliolumbar|deep_circumflex_iliac)\b/i, /\b(rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis|external_intercostal|internal_intercostal|diaphragm|pectoralis_major|psoas_major|quadratus_lumborum)\b/i],
  [/\b(phrenic|musculophrenic|pericardiacophrenic)\b/i, /\b(diaphragm)\b/i],
  [/\b(common_iliac|external_iliac|internal_iliac)\b/i, /\b(iliacus|psoas_major|gluteus_maximus|gluteus_medius|obturator_internus)\b/i],
  [/\b(ascending_aorta|arch_of_aorta|descending_aorta|thoracic_aorta|abdominal_aorta|superior_vena_cava|inferior_vena_cava|brachiocephalic)\b/i, /\b(ventricular_myocardium|left_ventricle|right_atrium|diaphragm|liver|kidney)\b/i],
];

const VESSEL_TO_MUSCLE_RULES: [RegExp, RegExp][] = [
  [/facial|maxillary|superficial_temporal|transverse_facial|ophthalmic|supraorbital|infraorbital|lingual|superior_thyroid|ascending_pharyngeal|occipital|posterior_auricular|external_carotid|internal_jugular|external_jugular/i, /orbicularis|zygomaticus|risorius|buccinator|mentalis|depressor|levator_labii|levator_anguli|nasalis|procerus|corrugator|occipitofrontalis|temporoparietalis|platysma|auricularis|masseter|temporalis|pterygoid|digastric|mylohyoid|stylohyoid|geniohyoid|genioglossus|hyoglossus|styloglossus|constrictor|pharyng|palat|uvulae|rectus|oblique|levator_palpebrae/i],
  [/superior_thyroid|inferior_thyroid|thyrocervical|transverse_cervical|suprascapular|ascending_cervical|deep_cervical|vertebral|occipital|common_carotid|internal_jugular|subclavian/i, /sternocleidomastoid|sternohyoid|sternothyroid|thyrohyoid|omohyoid|cricothyroid|cricoarytenoid|thyroarytenoid|arytenoid|scalenus|scalene|longus_colli|longus_capitis|rectus_capitis|obliquus_capitis|splenius|trapezius|levator_scapulae/i],
  [/thoracoacromial|lateral_thoracic|internal_thoracic|subscapular|circumflex_scapular|thoracodorsal|suprascapular|dorsal_scapular|posterior_circumflex_humeral|anterior_circumflex_humeral|axillary|cephalic|basilic/i, /pectoralis|subclavius|serratus_anterior|deltoid|supraspinatus|infraspinatus|subscapularis|teres_major|teres_minor|latissimus_dorsi|rhomboid|coracobrachialis/i],
  [/brachial|profunda_brachii|deep_brachial|superior_ulnar_collateral|inferior_ulnar_collateral|radial_recurrent|cephalic|basilic/i, /biceps_brachii|brachialis|coracobrachialis|triceps_brachii|anconeus/i],
  [/radial|ulnar|anterior_interosseous|posterior_interosseous|palmar_arch|metacarpal|digital/i, /pronator|flexor_carpi|palmaris|flexor_digitorum|flexor_pollicis|brachioradialis|extensor_carpi|extensor_digitorum|extensor_digiti|extensor_pollicis|extensor_indicis|supinator|abductor_pollicis|adductor_pollicis|opponens|lumbrical|interosseous|abductor_digiti_minimi|flexor_digiti_minimi/i],
  [/intercostal|internal_thoracic|musculophrenic|superior_epigastric|inferior_epigastric|subcostal|lumbar|deep_circumflex_iliac|phrenic|azygos|hemiazygos/i, /intercostal|subcostal|transversus_thoracis|diaphragm|serratus_posterior|levatores_costarum|erector_spinae|iliocostalis|longissimus|spinalis|multifidus|rotatores|rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis|pyramidalis|quadratus_lumborum/i],
  [/internal_iliac|external_iliac|iliolumbar|superior_gluteal|inferior_gluteal|internal_pudendal|obturator|lateral_sacral/i, /iliopsoas|psoas|iliacus|gluteus|tensor_fasciae_latae|piriformis|obturator|gemellus|quadratus_femoris|levator_ani|pubococcygeus|puborectalis|iliococcygeus|coccygeus|perineal|sphincter|ischiocavernosus|bulbospongiosus/i],
  [/femoral|profunda_femoris|deep_femoral|lateral_circumflex_femoral|medial_circumflex_femoral|perforating|obturator|descending_genicular|great_saphenous/i, /sartorius|rectus_femoris|vastus|articularis_genus|pectineus|adductor|gracilis|biceps_femoris|semitendinosus|semimembranosus/i],
  [/popliteal|anterior_tibial|posterior_tibial|fibular|peroneal|sural|dorsalis_pedis|plantar|Arcuate|saphenous/i, /popliteus|gastrocnemius|soleus|plantaris|tibialis|extensor_hallucis|extensor_digitorum_longus|extensor_digitorum_brevis|fibularis|peroneus|flexor_hallucis|flexor_digitorum_longus|flexor_digitorum_brevis|quadratus_plantae|abductor_hallucis|adductor_hallucis|abductor_digiti_minimi_of_foot|flexor_digiti_minimi_brevis_of_foot/i],
];

const SIBLING_MUSCLE_GROUP_PATTERNS: RegExp[] = [
  /^(biceps_brachii|long_head_of_biceps_brachii|short_head_of_biceps_brachii)/i,
  /^(triceps_brachii|long_head_of_triceps|lateral_head_of_triceps|medial_head_of_triceps|anconeus)/i,
  /^(deltoid|clavicular_part_of_deltoid|acromial_part_of_deltoid|scapular_spinal_part_of_deltoid)/i,
  /^(pectoralis_major|clavicular_head_of_pectoralis|sternocostal_head_of_pectoralis|abdominal_part_of_pectoralis|pectoralis_minor|subclavius)/i,
  /^(trapezius|descending_part_of_trapezius|transverse_part_of_trapezius|ascending_part_of_trapezius)/i,
  /^(latissimus_dorsi|teres_major)/i,
  /^(supraspinatus|infraspinatus|teres_minor|subscapularis)/i,
  /^(rhomboid_major|rhomboid_minor|levator_scapulae)/i,
  /^(rectus_femoris|vastus_lateralis|vastus_medialis|vastus_intermedius|articularis_genus)/i,
  /^(biceps_femoris|long_head_of_biceps_femoris|short_head_of_biceps_femoris|semitendinosus|semimembranosus)/i,
  /^(adductor_magnus|adductor_longus|adductor_brevis|adductor_minimus|pectineus|gracilis)/i,
  /^(gluteus_maximus|gluteus_medius|gluteus_minimus|tensor_fasciae_latae)/i,
  /^(piriformis|obturator_internus|obturator_externus|superior_gemellus|inferior_gemellus|quadratus_femoris)/i,
  /^(gastrocnemius|lateral_head_of_gastrocnemius|medial_head_of_gastrocnemius|soleus|plantaris)/i,
  /^(psoas_major|psoas_minor|iliacus|iliopsoas)/i,
  /^(rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis|pyramidalis)/i,
  /^(scalenus_anterior|scalenus_medius|scalenus_posterior|anterior_scalene|middle_scalene|posterior_scalene)/i,
  /^(sternocleidomastoid|sternohyoid|sternothyroid|thyrohyoid|omohyoid|superior_belly_of_omohyoid|inferior_belly_of_omohyoid)/i,
  /^(digastric|anterior_belly_of_digastric|posterior_belly_of_digastric|stylohyoid|mylohyoid|geniohyoid)/i,
  /^(masseter|temporalis|medial_pterygoid|lateral_pterygoid)/i,
  /^(superior_rectus|inferior_rectus|medial_rectus|lateral_rectus|superior_oblique|inferior_oblique|levator_palpebrae)/i,
  /^(superior_pharyngeal_constrictor|middle_pharyngeal_constrictor|inferior_pharyngeal_constrictor|stylopharyngeus|palatopharyngeus|salpingopharyngeus)/i,
  /^(cricothyroid|posterior_cricoarytenoid|lateral_cricoarytenoid|thyroarytenoid|transverse_arytenoid|oblique_arytenoid|vocalis)/i,
  /^(rectus_capitis_posterior_major|rectus_capitis_posterior_minor|obliquus_capitis_superior|obliquus_capitis_inferior)/i,
  /^(iliocostalis|longissimus|spinalis|erector_spinae)/i,
  /^(semispinalis|multifidus|rotatores)/i,
  /^(levator_ani|pubococcygeus|puborectalis|iliococcygeus|coccygeus)/i,
  /^(pronator_teres|humeral_head_of_pronator_teres|ulnar_head_of_pronator_teres|pronator_quadratus)/i,
  /^(flexor_digitorum_superficialis|flexor_digitorum_profundus|flexor_pollicis_longus)/i,
  /^(flexor_carpi_radialis|palmaris_longus|flexor_carpi_ulnaris)/i,
  /^(brachioradialis|extensor_carpi_radialis_longus|extensor_carpi_radialis_brevis|extensor_carpi_ulnaris)/i,
  /^(extensor_digitorum|extensor_digiti_minimi|extensor_indicis)/i,
  /^(abductor_pollicis_longus|extensor_pollicis_brevis|extensor_pollicis_longus)/i,
  /^(abductor_pollicis_brevis|flexor_pollicis_brevis|opponens_pollicis|adductor_pollicis)/i,
  /^(abductor_digiti_minimi|flexor_digiti_minimi_brevis|opponens_digiti_minimi)/i,
  /^(tibialis_anterior|extensor_hallucis_longus|extensor_digitorum_longus|fibularis_tertius)/i,
  /^(fibularis_longus|fibularis_brevis|peroneus_longus|peroneus_brevis)/i,
  /^(tibialis_posterior|flexor_hallucis_longus|flexor_digitorum_longus|popliteus)/i,
];

function findSiblingMuscleBranches(
  activeOrgan: ManifestOrgan,
  allOrgans: ManifestOrgan[],
  boxes: Map<string, THREE.Box3>,
  centres: Map<string, THREE.Vector3>,
): string[] {
  const isRight = activeOrgan.organ_id.endsWith("_r");
  const side = isRight ? "r" : "l";
  const activeNameLow = `${activeOrgan.organ_id} ${activeOrgan.name_en} ${activeOrgan.ta2_latin}`.toLowerCase();

  // Direct textbook collateral & neurovascular bundle mapping for Profunda brachii, Elbow Anastomosis, Triceps brachii, and Profunda femoris
  const organIdSet = new Set(allOrgans.map((o) => o.organ_id));
  const pickExisting = (candidates: string[]) =>
    candidates.filter((id) => id !== activeOrgan.organ_id && organIdSet.has(id));

  if (/deep_brachial_artery|profunda_brachii|profundo_brachii|radial_collateral_artery|middle_collateral_artery/.test(activeNameLow)) {
    return pickExisting([
      `deep_brachial_artery_${side}`,
      `radial_collateral_artery_${side}`,
      `middle_collateral_artery_${side}`,
      `posterior_circumflex_humeral_artery_${side}`,
      `recurrent_interosseous_artery_${side}`,
      `ulnar_recurrent_artery_${side}`,
      `superior_ulnar_collateral_artery_${side}`,
      `inferior_ulnar_collateral_artery_${side}`,
      `brachial_artery_${side}`,
      `radial_nerve_${side}`,
      `lateral_head_of_triceps_brachii_${side}`,
      `medial_head_of_triceps_brachii_${side}`,
      `long_head_of_triceps_brachii_${side}`,
    ]);
  }

  if (/brachial_artery|superior_ulnar_collateral|inferior_ulnar_collateral|ulnar_recurrent|recurrent_interosseous/.test(activeNameLow)) {
    return pickExisting([
      `deep_brachial_artery_${side}`,
      `radial_collateral_artery_${side}`,
      `middle_collateral_artery_${side}`,
      `superior_ulnar_collateral_artery_${side}`,
      `inferior_ulnar_collateral_artery_${side}`,
      `ulnar_recurrent_artery_${side}`,
      `recurrent_interosseous_artery_${side}`,
      `radial_artery_${side}`,
      `ulnar_artery_${side}`,
      `axillary_artery_${side}`,
    ]);
  }

  if (/triceps_brachii/.test(activeNameLow)) {
    return pickExisting([
      `long_head_of_triceps_brachii_${side}`,
      `lateral_head_of_triceps_brachii_${side}`,
      `medial_head_of_triceps_brachii_${side}`,
      `deep_brachial_artery_${side}`,
      `radial_collateral_artery_${side}`,
      `middle_collateral_artery_${side}`,
      `radial_nerve_${side}`,
      `anconeus_${side}`,
    ]);
  }

  if (/deep_femoral_artery|profunda_femoris|circumflex_femoral|perforating_femoral/.test(activeNameLow)) {
    return pickExisting([
      `deep_femoral_artery_${side}`,
      `lateral_circumflex_femoral_artery_${side}`,
      `medial_circumflex_femoral_artery_${side}`,
      `descending_branch_of_lateral_circumflex_femoral_artery_${side}`,
      `perforating_femoral_arteries_${side}`,
      `femoral_artery_${side}`,
      `popliteal_artery_${side}`,
    ]);
  }

  if (activeOrgan.system === "cardiovascular") {
    const parentGroup = activeOrgan.path?.[activeOrgan.path.length - 1] ?? "";
    const activeCentre = centres.get(activeOrgan.organ_id);
    const vMatched: { id: string; score: number }[] = [];
    for (const o of allOrgans) {
      if (o.system !== "cardiovascular" || o.organ_id === activeOrgan.organ_id) continue;
      if (isRight && o.organ_id.endsWith("_l")) continue;
      if (!isRight && o.organ_id.endsWith("_r")) continue;
      const candCentre = centres.get(o.organ_id);
      const dist = activeCentre && candCentre ? activeCentre.distanceTo(candCentre) : 0.3;
      if (o.path?.[o.path.length - 1] === parentGroup && dist <= 0.26) {
        vMatched.push({ id: o.organ_id, score: dist });
      }
    }
    vMatched.sort((a, b) => a.score - b.score);
    return vMatched.slice(0, 8).map((m) => m.id);
  }

  if (activeOrgan.system !== "muscular") return [];
  const isLeft = activeOrgan.organ_id.endsWith("_l");
  const cleanActive = activeOrgan.organ_id.replace(/_(l|r)$/i, "");

  // Extract root muscle family keyword if multi-part
  const parentGroup = activeOrgan.path?.[activeOrgan.path.length - 1] ?? "";
  const activeCentre = centres.get(activeOrgan.organ_id);

  const matched: { id: string; score: number }[] = [];

  for (const o of allOrgans) {
    if (o.system !== "muscular" || o.organ_id === activeOrgan.organ_id) continue;
    if (o.organ_id.startsWith("skel_")) continue;
    // Match same side
    if (isRight && o.organ_id.endsWith("_l")) continue;
    if (isLeft && o.organ_id.endsWith("_r")) continue;

    const cleanCand = o.organ_id.replace(/_(l|r)$/i, "");
    const candNameLow = `${o.organ_id} ${o.name_en}`.toLowerCase();
    const candCentre = centres.get(o.organ_id);
    const dist = activeCentre && candCentre ? activeCentre.distanceTo(candCentre) : 0.25;

    // 1. Direct multi-head / subdivision match (e.g., rectus_abdominis_sup_l & rectus_abdominis_upmid_l, biceps long & short head)
    let isDirectHead = false;
    for (const pat of SIBLING_MUSCLE_GROUP_PATTERNS) {
      if (pat.test(cleanActive) && pat.test(cleanCand)) {
        isDirectHead = true;
        break;
      }
      if (pat.test(activeNameLow) && pat.test(candNameLow)) {
        isDirectHead = true;
        break;
      }
    }

    // 2. Shared stem or shared specific anatomical sub-folder in manifest
    const sameSubFolder =
      parentGroup &&
      parentGroup !== "Other muscles" &&
      o.path?.[o.path.length - 1] === parentGroup;

    if (isDirectHead) {
      matched.push({ id: o.organ_id, score: dist * 0.2 });
    } else if (sameSubFolder && dist <= 0.28) {
      matched.push({ id: o.organ_id, score: dist });
    }
  }

  matched.sort((a, b) => a.score - b.score);
  return matched.slice(0, 8).map((m) => m.id);
}


function getOrganSideTag(o: Pick<ManifestOrgan, "organ_id" | "name_en" | "node">): "l" | "r" | null {
  const s = `${o.organ_id} ${o.name_en} ${o.node}`;
  if (/\b(left|sinister)\b|\.(l|ol|el)$|_l$/i.test(s)) return "l";
  if (/\b(right|dexter)\b|\.(r|or|er)$|_r$/i.test(s)) return "r";
  return null;
}


export function Selection3DOverlays({
  activeOrgan,
  manifest,
  boxes,
  centres,
  geometriesById,
  rawNodesByFile,
  revision,
}: {
  activeOrgan: ManifestOrgan | undefined;
  manifest: AnatomyManifest;
  boxes: Map<string, THREE.Box3>;
  centres: Map<string, THREE.Vector3>;
  geometriesById: Map<string, OrganGeometry>;
  rawNodesByFile: Map<string, Record<string, THREE.Object3D>>;
  revision: number;
}) {
  const activeFocusPart = useSafeStore(useInspector3DStore, (s) => s.activeFocusPart);
  const animateMuscleAction = useSafeStore(useInspector3DStore, (s) => s.animateMuscleAction);
  const activeLandmarkId = useSafeStore(useInspector3DStore, (s) => s.activeLandmarkId);
  const setActiveLandmarkId = useSafeStore(useInspector3DStore, (s) => s.setActiveLandmarkId);
  const setComputed3DData = useSafeStore(useInspector3DStore, (s) => s.setComputed3DData);
  const selectOrgan = useSafeStore(useSceneStore, (s) => s.selectOrgan);

  const pulseRef = useRef<THREE.Mesh>(null);
  const nervePulseRef = useRef<THREE.Mesh>(null);
  const nerveGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const actionContractGroupRef = useRef<THREE.Group>(null);

  const knowledgeEntry = useMemo(
    () => (activeOrgan ? matchOrganToEntry(activeOrgan) : null),
    [activeOrgan],
  );

  // 1. Compute Muscle Origin, Insertion, Action Vector & Attachment Patch Meshes
  const muscleOverlay = useMemo(() => {
    if (!activeOrgan || activeOrgan.system !== "muscular") return null;
    const geomEntry = geometriesById.get(activeOrgan.organ_id);
    const wBox = boxes.get(activeOrgan.organ_id);
    if (!geomEntry || !wBox || wBox.isEmpty()) return null;

    const muscNodes = rawNodesByFile.get("muscular_male.glb") ?? {};
    const isRight = /\b(right|dexter|\.r|_r$)\b/i.test(`${activeOrgan.organ_id} ${activeOrgan.name_en} ${activeOrgan.node}`);
    const oSuffix = isRight ? ".or" : ".ol";
    const eSuffix = isRight ? ".er" : ".el";
    const baseNodeName = activeOrgan.node
      .replace(/^\(|\)$/g, "")
      .replace(/\.(l|r)$/i, "")
      .trim();
    const strippedNodeName = baseNodeName.replace(/\s+muscle$/i, "").trim();

    const originNode =
      muscNodes[`${baseNodeName}${oSuffix}`] ??
      muscNodes[`${strippedNodeName}${oSuffix}`] ??
      null;
    const insertionNode =
      muscNodes[`${baseNodeName}${eSuffix}`] ??
      muscNodes[`${strippedNodeName}${eSuffix}`] ??
      null;

    let originPatch: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 } | null = null;
    let insertionPatch: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 } | null = null;
    const originPos = new THREE.Vector3();
    const insertionPos = new THREE.Vector3();

    if (originNode instanceof THREE.Mesh && originNode.geometry) {
      originNode.updateWorldMatrix(true, false);
      if (!originNode.geometry.boundingBox) originNode.geometry.computeBoundingBox();
      const b = originNode.geometry.boundingBox!.clone().applyMatrix4(originNode.matrixWorld);
      b.getCenter(originPos);
      originPatch = { geometry: originNode.geometry, matrix: originNode.matrixWorld.clone() };
    }

    if (insertionNode instanceof THREE.Mesh && insertionNode.geometry) {
      insertionNode.updateWorldMatrix(true, false);
      if (!insertionNode.geometry.boundingBox) insertionNode.geometry.computeBoundingBox();
      const b = insertionNode.geometry.boundingBox!.clone().applyMatrix4(insertionNode.matrixWorld);
      b.getCenter(insertionPos);
      insertionPatch = { geometry: insertionNode.geometry, matrix: insertionNode.matrixWorld.clone() };
    }

    // Fallback: compute exact proximal/medial Origin pole and distal/lateral Insertion pole from the muscle's 3D vertices
    const posAttr = geomEntry.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if ((!originPatch || !insertionPatch) && posAttr && posAttr.count > 0) {
      const v = new THREE.Vector3();
      const size = wBox.getSize(new THREE.Vector3());
      const horizontalDominant = size.x > size.y * 1.15;

      let bestOriginScore = Number.NEGATIVE_INFINITY;
      let bestInsertionScore = Number.NEGATIVE_INFINITY;
      const calcO = new THREE.Vector3();
      const calcI = new THREE.Vector3();

      const stride = Math.max(1, Math.floor(posAttr.count / 500));
      for (let i = 0; i < posAttr.count; i += stride) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(geomEntry.matrix);
        // Origin is typically more proximal (+Y) and/or more medial (smaller |X|); Insertion is more distal (-Y) and/or more lateral (larger |X|)
        const oScore = horizontalDominant
          ? -Math.abs(v.x) * 1.5 + v.y * 0.4
          : v.y * 1.4 - Math.abs(v.x) * 0.45;
        const iScore = horizontalDominant
          ? Math.abs(v.x) * 1.5 - v.y * 0.4
          : -v.y * 1.4 + Math.abs(v.x) * 0.45;

        if (oScore > bestOriginScore) {
          bestOriginScore = oScore;
          calcO.copy(v);
        }
        if (iScore > bestInsertionScore) {
          bestInsertionScore = iScore;
          calcI.copy(v);
        }
      }
      if (!originPatch) originPos.copy(calcO);
      if (!insertionPatch) insertionPos.copy(calcI);
    }

    // Find innervating 3D nerves for this muscle (anatomical myotome match first, then spatial proximity)
    const muscSide = getOrganSideTag(activeOrgan);
    const muscText = `${activeOrgan.name_en} ${activeOrgan.ta2_latin}`;
    const matchedNervePatterns = NERVE_TO_MUSCLE_RULES.filter(([, mRx]) => mRx.test(muscText)).map(([nRx]) => nRx);
    const nerveIds: string[] = [];
    if (matchedNervePatterns.length > 0) {
      for (const o of manifest.organs) {
        if (o.system !== "nervous" || o.path?.[0] === "Central nervous system") continue;
        if (muscSide && getOrganSideTag(o) && getOrganSideTag(o) !== muscSide) continue;
        const nText = `${o.name_en} ${o.ta2_latin}`;
        if (matchedNervePatterns.some((rx) => rx.test(nText))) {
          nerveIds.push(o.organ_id);
          if (nerveIds.length >= 4) break;
        }
      }
    }
    if (nerveIds.length < 4) {
      const expandedBox = wBox.clone().expandByScalar(0.045);
      for (const o of manifest.organs) {
        if (o.system === "nervous" && o.path?.[0] !== "Central nervous system" && !nerveIds.includes(o.organ_id)) {
          if (muscSide && getOrganSideTag(o) && getOrganSideTag(o) !== muscSide) continue;
          const nb = boxes.get(o.organ_id);
          if (nb && expandedBox.intersectsBox(nb)) {
            nerveIds.push(o.organ_id);
            if (nerveIds.length >= 4) break;
          }
        }
      }
    }

    const pullVec = originPos.clone().sub(insertionPos);
    const length = Math.max(pullVec.length(), 0.02);
    const pullDir =
      pullVec.lengthSq() > 1e-6 ? pullVec.clone().normalize() : new THREE.Vector3(0, 1, 0);
    // Ensure Origin & Insertion 3D pin anchors are separated by at least 4.5cm so their arrows never collide
    if (originPos.distanceTo(insertionPos) < 0.045) {
      const mid = originPos.clone().lerp(insertionPos, 0.5);
      originPos.copy(mid).addScaledVector(pullDir, 0.024);
      insertionPos.copy(mid).addScaledVector(pullDir, -0.024);
    }
    // Snap Origin & Insertion pins slightly outward onto the exterior surface ("من برا") of the opaque muscle
    const muscCentre = wBox.getCenter(new THREE.Vector3());
    const outO = new THREE.Vector3(originPos.x * 0.35, 0, originPos.z >= muscCentre.z - 0.004 ? 1 : -1).normalize();
    const outI = new THREE.Vector3(insertionPos.x * 0.35, 0, insertionPos.z >= muscCentre.z - 0.004 ? 1 : -1).normalize();
    originPos.addScaledVector(outO, 0.0035);
    insertionPos.addScaledVector(outI, 0.0035);
    const midPos = insertionPos.clone().lerp(originPos, 0.5);
    // Offset action arrow slightly anteriorly/outward so it sits clearly on the surface of the muscle belly
    const outward = new THREE.Vector3(midPos.x * 0.3, 0, wBox.max.z >= 0 ? 1 : -1).normalize();
    const arrowStart = insertionPos.clone().addScaledVector(outward, 0.012);
    const arrowEnd = originPos.clone().addScaledVector(outward, 0.012);
    const arrowMid = arrowStart.clone().lerp(arrowEnd, 0.5);
    const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pullDir,
    );

    const siblingBranchIds = findSiblingMuscleBranches(activeOrgan, manifest.organs, boxes, centres);

    return {
      originPos,
      insertionPos,
      originPatch,
      insertionPatch,
      arrowStart,
      arrowEnd,
      arrowMid,
      arrowQuat,
      arrowLen: Math.max(length * 0.72, 0.025),
      pullDir,
      nerveIds,
      siblingBranchIds,
      geomEntry,
      centre: wBox.getCenter(new THREE.Vector3()),
    };
  }, [activeOrgan, geometriesById, boxes, rawNodesByFile, manifest.organs, revision]);

  // 1b. Compute Nerve / Artery / Vein Root Origin & Distal Supplied/Drained Muscle or Organ Target
  const nerveInsertionOverlay = useMemo(() => {
    if (!activeOrgan) return null;
    const isPeripNerve =
      activeOrgan.system === "nervous" &&
      activeOrgan.path?.[0] !== "Central nervous system";
    const isCardioVessel =
      activeOrgan.system === "cardiovascular" &&
      !/\b(atrium|ventricle|valve|cusp|myocard|papillary|septum|conus|sinuatrial|atrioventricular|pericard)\b/i.test(
        `${activeOrgan.organ_id} ${activeOrgan.name_en}`,
      );
    if (!isPeripNerve && !isCardioVessel) {
      return null;
    }
    const isVein =
      isCardioVessel &&
      /\b(vein|vena|venae|sinus|saphenous|cephalic|basilic|jugular|azygos|hemiazygos|cava|portal|pampiniform)\b/i.test(
        `${activeOrgan.organ_id} ${activeOrgan.name_en} ${activeOrgan.ta2_latin}`,
      );

    const geomEntry = geometriesById.get(activeOrgan.organ_id);
    const wBox = boxes.get(activeOrgan.organ_id);
    if (!geomEntry || !wBox || wBox.isEmpty()) return null;

    const posAttr = geomEntry.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const rootPos = new THREE.Vector3();
    const insertionPos = new THREE.Vector3();

    if (posAttr && posAttr.count > 0) {
      const v = new THREE.Vector3();
      let bestRootScore = Number.NEGATIVE_INFINITY;
      let bestInsScore = Number.NEGATIVE_INFINITY;
      const stride = Math.max(1, Math.floor(posAttr.count / 500));
      for (let i = 0; i < posAttr.count; i += stride) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(geomEntry.matrix);
        const rootScore = -Math.abs(v.x) * 1.6 + v.y * 1.1;
        const insScore = Math.abs(v.x) * 1.6 - v.y * 1.1;
        if (rootScore > bestRootScore) {
          bestRootScore = rootScore;
          rootPos.copy(v);
        }
        if (insScore > bestInsScore) {
          bestInsScore = insScore;
          insertionPos.copy(v);
        }
      }
    } else {
      rootPos.set(wBox.min.x, wBox.max.y, (wBox.min.z + wBox.max.z) * 0.5);
      insertionPos.set(wBox.max.x, wBox.min.y, (wBox.min.z + wBox.max.z) * 0.5);
    }

    // Find the target muscle(s) or organ(s) innervated, supplied, or drained by this nerve/artery/vein
    const sideTag = getOrganSideTag(activeOrgan);
    const activeText = `${activeOrgan.organ_id} ${activeOrgan.name_en} ${activeOrgan.ta2_latin} ${(activeOrgan.path ?? []).join(" ")}`;
    const matchedSpecificVesselRule = isCardioVessel
      ? VESSEL_SPECIFIC_TARGET_RULES.find(([vRx]) => vRx.test(activeText))?.[1] ?? null
      : null;
    const matchedGeneralRule = isPeripNerve
      ? NERVE_TO_MUSCLE_RULES.find(([nRx]) => nRx.test(activeText))?.[1] ?? null
      : VESSEL_TO_MUSCLE_RULES.find(([vRx]) => vRx.test(activeText))?.[1] ?? null;

    const targetCandidates: { organ: ManifestOrgan; dist: number }[] = [];
    const expandedBox = wBox.clone().expandByScalar(isCardioVessel ? 0.045 : 0.035);

    for (const o of manifest.organs) {
      if (o.organ_id === activeOrgan.organ_id) continue;
      if (o.organ_id.startsWith("skel_") || o.organ_id.startsWith("lymph_vessel_")) continue;
      if (sideTag && getOrganSideTag(o) && getOrganSideTag(o) !== sideTag) continue;

      const candText = `${o.organ_id} ${o.name_en} ${o.ta2_latin}`;
      const mb = boxes.get(o.organ_id);
      if (!mb) continue;
      const dIns = Math.min(mb.distanceToPoint(insertionPos), wBox.distanceToPoint(mb.getCenter(new THREE.Vector3())));

      if (matchedSpecificVesselRule && matchedSpecificVesselRule.test(candText)) {
        if (
          o.system === "muscular" ||
          o.system === "digestive" ||
          o.system === "respiratory" ||
          o.system === "renal" ||
          o.system === "endocrine" ||
          o.system === "reproductive" ||
          o.system === "nervous" ||
          (o.system === "cardiovascular" && /myocard|ventricle|atrium/i.test(o.organ_id))
        ) {
          targetCandidates.push({ organ: o, dist: dIns * 0.04 });
          continue;
        }
      }

      if (o.system !== "muscular") continue;

      if (matchedGeneralRule && matchedGeneralRule.test(candText)) {
        if (dIns <= 0.25 || expandedBox.intersectsBox(mb)) {
          targetCandidates.push({ organ: o, dist: dIns * 0.15 + 0.01 });
          continue;
        }
      }

      const intersectsCourse = expandedBox.intersectsBox(mb);
      if (!matchedSpecificVesselRule && !matchedGeneralRule && (dIns <= 0.065 || intersectsCourse)) {
        const score = dIns <= 0.065 ? dIns : dIns * 1.35;
        targetCandidates.push({ organ: o, dist: score + 0.05 });
      }
    }

    // Fallback if rules were too strict for a vessel: grab closest intersecting muscles/organs
    if (targetCandidates.length === 0 && isCardioVessel) {
      for (const o of manifest.organs) {
        if (
          o.system !== "muscular" &&
          o.system !== "digestive" &&
          o.system !== "respiratory" &&
          o.system !== "renal"
        ) {
          continue;
        }
        if (sideTag && getOrganSideTag(o) && getOrganSideTag(o) !== sideTag) continue;
        const mb = boxes.get(o.organ_id);
        if (!mb) continue;
        const dIns = Math.min(mb.distanceToPoint(insertionPos), wBox.distanceToPoint(mb.getCenter(new THREE.Vector3())));
        if (dIns <= 0.085 || expandedBox.intersectsBox(mb)) {
          targetCandidates.push({ organ: o, dist: dIns });
        }
      }
    }

    targetCandidates.sort((a, b) => a.dist - b.dist);
    const topTargets = targetCandidates.slice(0, 4);
    const targetMuscle = topTargets[0]?.organ ?? null;
    const targetMuscleGeom = targetMuscle ? geometriesById.get(targetMuscle.organ_id) ?? null : null;
    const targetMuscleGeoms = topTargets
      .map((c) => {
        const g = geometriesById.get(c.organ.organ_id);
        return g ? { id: c.organ.organ_id, organ: c.organ, geometry: g.geometry, matrix: g.matrix } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const targetMuscleIds = topTargets.map((c) => c.organ.organ_id);

    return {
      rootPos,
      insertionPos,
      nerveGeom: geomEntry,
      targetMuscle,
      targetMuscleGeom,
      targetMuscleGeoms,
      targetMuscleIds,
      isCardioVessel,
      isVein,
    };
  }, [activeOrgan, geometriesById, boxes, manifest.organs, revision]);

  // 2. Compute Organ Surrounding Relations & Neurovascular/Lymphatic Supply (Arteries, Veins, Nerves, Lymph) for ANY selected structure
  const organOverlay = useMemo(() => {
    if (!activeOrgan) return null;

    const wBox = boxes.get(activeOrgan.organ_id);
    const centre = centres.get(activeOrgan.organ_id);
    if (!wBox || !centre) return null;

    const searchBox = wBox.clone().expandByScalar(0.065);
    const supplyBox = wBox.clone().expandByScalar(0.058);

    const relCandidates: { organ: ManifestOrgan; dist: number; dir: string }[] = [];
    const arteryCandidates: { organ: ManifestOrgan; dist: number }[] = [];
    const veinCandidates: { organ: ManifestOrgan; dist: number }[] = [];
    const nerveCandidates: { organ: ManifestOrgan; dist: number }[] = [];
    const lymphCandidates: { organ: ManifestOrgan; dist: number }[] = [];

    const stem = activeOrgan.name_en
      .toLowerCase()
      .replace(/\s*\((left|right)\)\s*/g, "")
      .split(/\s+/)[0] ?? "";

    for (const o of manifest.organs) {
      if (o.organ_id === activeOrgan.organ_id) continue;
      if (o.organ_id.startsWith("skel_") || o.organ_id.startsWith("lymph_vessel_")) continue;
      if (/\b(pancreas|pancreatic|hepatopancreatic)\b/i.test(`${o.organ_id} ${o.name_en} ${o.ta2_latin}`)) continue;
      if (activeOrgan.system === "reproductive" && o.system === "digestive" && !/\b(rectum|anal|sigmoid|caecum|appendix|ileum)\b/i.test(o.name_en)) continue;
      const ob = boxes.get(o.organ_id);
      const oc = centres.get(o.organ_id);
      if (!ob || !oc) continue;

      const dist = wBox.distanceToPoint(oc);
      const nameLow = `${o.ta2_latin} ${o.name_en}`.toLowerCase();
      const nameMatchesOrgan = stem.length >= 4 && nameLow.includes(stem);

      if (o.system === "cardiovascular") {
        const isRightActive = activeOrgan.organ_id.endsWith("_r");
        const isLeftActive = activeOrgan.organ_id.endsWith("_l");
        if ((isRightActive && o.organ_id.endsWith("_l")) || (isLeftActive && o.organ_id.endsWith("_r"))) {
          continue;
        }
        let ruleVesselMatch = false;
        if (activeOrgan.system === "muscular") {
          const mLow = `${activeOrgan.organ_id} ${activeOrgan.name_en} ${activeOrgan.ta2_latin}`.toLowerCase();
          for (const [vRx, mRx] of VESSEL_TO_MUSCLE_RULES) {
            if (mRx.test(mLow) && vRx.test(`${o.organ_id} ${nameLow}`)) {
              ruleVesselMatch = true;
              break;
            }
          }
        }
        if (dist <= 0.075 || supplyBox.intersectsBox(ob) || nameMatchesOrgan || (ruleVesselMatch && dist <= 0.22)) {
          const score = nameMatchesOrgan ? dist * 0.2 : ruleVesselMatch ? dist * 0.35 : dist;
          if (/\b(vena|venae|vein|veins|sinus)\b/i.test(nameLow)) {
            veinCandidates.push({ organ: o, dist: score });
          } else if (/\b(arteria|arteriae|artery|arteries|aorta|truncus|trunk)\b/i.test(nameLow)) {
            arteryCandidates.push({ organ: o, dist: score });
          }
        }
      } else if (o.system === "nervous" && o.path?.[0] !== "Central nervous system") {
        if (dist <= 0.065 || supplyBox.intersectsBox(ob) || nameMatchesOrgan) {
          const score = nameMatchesOrgan ? dist * 0.25 : dist;
          nerveCandidates.push({ organ: o, dist: score });
        }
      } else if (o.system === "lymphatic") {
        if (dist <= 0.075 || supplyBox.intersectsBox(ob) || nameMatchesOrgan) {
          const score = nameMatchesOrgan ? dist * 0.25 : dist;
          lymphCandidates.push({ organ: o, dist: score });
        }
      } else if (
        o.system !== "muscular" &&
        o.system !== "integumentary" &&
        o.system !== "regional" &&
        (o.system !== "articular" || activeOrgan.system === "skeletal" || activeOrgan.system === "articular") &&
        (dist <= 0.065 || searchBox.intersectsBox(ob))
      ) {
        const dx = oc.x - centre.x;
        const dy = oc.y - centre.y;
        const dz = oc.z - centre.z;
        let dir = "Adjacent";
        const ax = Math.abs(dx), ay = Math.abs(dy), az = Math.abs(dz);
        if (ay >= ax && ay >= az) dir = dy > 0 ? "Superior" : "Inferior";
        else if (az >= ax && az >= ay) dir = dz > 0 ? "Anterior" : "Posterior";
        else dir = Math.abs(oc.x) < Math.abs(centre.x) ? "Medial" : "Lateral";

        relCandidates.push({ organ: o, dist, dir });
      }
    }

    relCandidates.sort((a, b) => a.dist - b.dist);
    arteryCandidates.sort((a, b) => a.dist - b.dist);
    veinCandidates.sort((a, b) => a.dist - b.dist);
    nerveCandidates.sort((a, b) => a.dist - b.dist);

    const seenNames = new Set<string>();
    const relations: OrganRelationItem[] = [];
    for (const item of relCandidates) {
      const base = item.organ.name_en.toLowerCase();
      if (seenNames.has(base)) continue;
      seenNames.add(base);
      relations.push({
        organId: item.organ.organ_id,
        name_en: item.organ.name_en,
        direction: item.dir,
        system: item.organ.system,
      });
      if (relations.length >= 6) break;
    }

    lymphCandidates.sort((a, b) => a.dist - b.dist);
    const arteryIds = [...new Set(arteryCandidates.map((x) => x.organ.organ_id))].slice(0, 5);
    const veinIds = [...new Set(veinCandidates.map((x) => x.organ.organ_id))].slice(0, 5);
    const nerveIds = [...new Set(nerveCandidates.map((x) => x.organ.organ_id))].slice(0, 5);
    const lymphIds = [...new Set(lymphCandidates.map((x) => x.organ.organ_id))].slice(0, 5);

    return { relations, arteryIds, veinIds, nerveIds, lymphIds };
  }, [activeOrgan, boxes, centres, manifest.organs, revision]);

  // 3. Compute Bone Interactive Key Anatomy Landmarks & Notches OR Muscle / Artery Interactive 3D Branches, Heads & Parts
  const boneLandmarks = useMemo(() => {
    if (
      !activeOrgan ||
      (activeOrgan.system !== "skeletal" &&
        activeOrgan.system !== "muscular" &&
        activeOrgan.system !== "cardiovascular") ||
      activeOrgan.organ_id.startsWith("skel_") ||
      activeOrgan.path?.[0] === "Tendons"
    ) {
      return [];
    }
    const geomEntry = geometriesById.get(activeOrgan.organ_id);
    const wBox = boxes.get(activeOrgan.organ_id);
    if (!geomEntry || !wBox || wBox.isEmpty()) return [];
    if (activeOrgan.system === "muscular" || activeOrgan.system === "cardiovascular") {
      return buildMuscleBranches3D(activeOrgan, geomEntry.geometry, geomEntry.matrix, wBox);
    }
    return buildBoneLandmarks3D(activeOrgan, geomEntry.geometry, geomEntry.matrix, wBox);
  }, [activeOrgan, geometriesById, boxes, revision]);

  const enabled3DToggles = useSafeStore(useInspector3DStore, (s) => s.enabled3DToggles);

  // Sync computed 3D data into useInspector3DStore for the Left-Side Inspector Panel
  useEffect(() => {
    if (!activeOrgan) {
      const cur = useInspector3DStore.getState();
      if (
        cur.muscleData.originPos !== null ||
        cur.organData.relations.length > 0 ||
        cur.boneLandmarks.length > 0 ||
        cur.hasNerveInsertion3D
      ) {
        setComputed3DData({
          hasNerveInsertion3D: false,
          muscleData: { originPos: null, insertionPos: null, nerveIds: [] },
          organData: { relations: [], arteryIds: [], veinIds: [], nerveIds: [], lymphIds: [], targetMuscleIds: [] },
          boneLandmarks: [],
        });
      }
      return;
    }
    setComputed3DData({
      hasNerveInsertion3D: Boolean(nerveInsertionOverlay),
      muscleData: muscleOverlay
        ? {
            originPos: [muscleOverlay.originPos.x, muscleOverlay.originPos.y, muscleOverlay.originPos.z],
            insertionPos: [muscleOverlay.insertionPos.x, muscleOverlay.insertionPos.y, muscleOverlay.insertionPos.z],
            nerveIds: muscleOverlay.nerveIds,
            siblingBranchIds: muscleOverlay.siblingBranchIds,
          }
        : {
            originPos: null,
            insertionPos: null,
            nerveIds: [],
            siblingBranchIds:
              activeOrgan.system === "cardiovascular"
                ? findSiblingMuscleBranches(activeOrgan, manifest.organs, boxes, centres)
                : [],
          },
      organData: {
        ...(organOverlay ?? { relations: [], arteryIds: [], veinIds: [], nerveIds: [], lymphIds: [] }),
        targetMuscleIds: nerveInsertionOverlay?.targetMuscleIds ?? [],
      },
      boneLandmarks,
    });
  }, [activeOrgan, muscleOverlay, nerveInsertionOverlay, organOverlay, boneLandmarks, setComputed3DData]);

  // Sync occlusion boxes for front/back camera callout culling (`البانل اللي موجودة بالخلف تظل بالخلف لحد م الف المجسم`)
  useEffect(() => {
    if (!activeOrgan) {
      ACTIVE_CALLOUT_OCCLUSION_CTX.organBox = null;
      ACTIVE_CALLOUT_OCCLUSION_CTX.solidBoxes = [];
      return;
    }
    const ob = boxes.get(activeOrgan.organ_id);
    ACTIVE_CALLOUT_OCCLUSION_CTX.organBox = ob
      ? {
          minX: ob.min.x,
          maxX: ob.max.x,
          minY: ob.min.y,
          maxY: ob.max.y,
          minZ: ob.min.z,
          maxZ: ob.max.z,
        }
      : null;

    const st = useSceneStore.getState();
    const solid: CalloutOcclusionSliceBox[] = [];
    for (const o of manifest.organs) {
      if (st.hiddenSystems.includes(o.system)) continue;
      if ((st.systemOpacity[o.system] ?? 1) < 0.45) continue;
      if (st.isolatedOrganIds && !st.isolatedOrganIds.includes(o.organ_id)) continue;
      if (st.hiddenOrganIds.includes(o.organ_id)) continue;
      const b = boxes.get(o.organ_id);
      if (!b || b.isEmpty()) continue;
      solid.push({
        minX: b.min.x,
        maxX: b.max.x,
        minY: b.min.y,
        maxY: b.max.y,
        minZ: b.min.z,
        maxZ: b.max.z,
      });
    }
    ACTIVE_CALLOUT_OCCLUSION_CTX.solidBoxes = solid;
  }, [activeOrgan, boxes, manifest.organs, revision]);

  // Animate the 3D Action Vector pulse, gentle rhythmic 3D muscle contraction, AND selected Nerve Glow
  useFrame(({ clock, camera }) => {
    ACTIVE_CALLOUT_OCCLUSION_CTX.camera = camera;
    if (!activeOrgan || !animateMuscleAction) return;
    const t = clock.getElapsedTime();
    if (nerveGlowMatRef.current) {
      nerveGlowMatRef.current.opacity = 0.55 + 0.28 * Math.sin(t * 5.2);
    }
    if (nerveInsertionOverlay && nervePulseRef.current) {
      const u = (t * 1.15) % 1;
      // Veins drain from target muscle/organ (insertionPos) toward rootPos; Arteries & Nerves travel from rootPos to insertionPos
      nervePulseRef.current.position.lerpVectors(
        nerveInsertionOverlay.isVein ? nerveInsertionOverlay.insertionPos : nerveInsertionOverlay.rootPos,
        nerveInsertionOverlay.isVein ? nerveInsertionOverlay.rootPos : nerveInsertionOverlay.insertionPos,
        u,
      );
    }
    if (!muscleOverlay) return;
    if (pulseRef.current) {
      const u = (t * 0.85) % 1;
      pulseRef.current.position.lerpVectors(muscleOverlay.arrowStart, muscleOverlay.arrowEnd, u);
    }
    if (actionContractGroupRef.current) {
      if (animateMuscleAction) {
        const wave = 0.5 - 0.5 * Math.cos(t * 3.4);
        const shift = wave * 0.0065;
        actionContractGroupRef.current.position
          .copy(muscleOverlay.pullDir)
          .multiplyScalar(shift);
      } else {
        actionContractGroupRef.current.position.set(0, 0, 0);
      }
    }
  });

  if (!activeOrgan) return null;

  const showMuscleOrigin = Boolean(enabled3DToggles["muscle_origin"]);
  const showMuscleInsertion = Boolean(enabled3DToggles["muscle_insertion"]);
  const showMuscleAction = Boolean(enabled3DToggles["muscle_action"]);
  const showNerveInsertion = Boolean(enabled3DToggles["nerve_insertion"]);

  return (
    <group>
      {/* CASE 1: MUSCLE 3D OVERLAYS (Rendered ONLY when their respective checkbox is enabled!) */}
      {muscleOverlay && (showMuscleOrigin || showMuscleInsertion || showMuscleAction) && (
        <group>
          {showMuscleOrigin && muscleOverlay.originPatch && (
            <mesh
              geometry={muscleOverlay.originPatch.geometry}
              matrixAutoUpdate={false}
              matrix={muscleOverlay.originPatch.matrix}
              renderOrder={12}
            >
              <meshBasicMaterial
                color="#ef4444"
                transparent
                opacity={0.92}
                depthTest={true}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {showMuscleInsertion && muscleOverlay.insertionPatch && (
            <mesh
              geometry={muscleOverlay.insertionPatch.geometry}
              matrixAutoUpdate={false}
              matrix={muscleOverlay.insertionPatch.matrix}
              renderOrder={12}
            >
              <meshBasicMaterial
                color="#10b981"
                transparent
                opacity={0.92}
                depthTest={true}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Animated 3D Action Vector Pulse Sphere along the muscle belly */}
          {showMuscleAction && (
            <mesh ref={pulseRef} position={muscleOverlay.arrowStart} renderOrder={16}>
              <sphereGeometry args={[0.0052, 16, 16]} />
              <meshBasicMaterial color="#fbbf24" depthTest={true} />
            </mesh>
          )}

          {/* Small 3D Origin Pin (shown only when Origin checkbox is ON) */}
          {showMuscleOrigin && (
            <group position={muscleOverlay.originPos}>
              <mesh renderOrder={15}>
                <sphereGeometry args={[activeFocusPart === "origin" ? 0.0065 : 0.0045, 16, 16]} />
                <meshBasicMaterial color="#ef4444" depthTest={true} />
              </mesh>
              <Html center zIndexRange={[18, 0]}>
                <MicroPinCallout
                  worldPos={muscleOverlay.originPos}
                  text="Origin"
                  accent="#f87171"
                  active={activeFocusPart === "origin"}
                  side="left"
                  vOffset={-16}
                />
              </Html>
            </group>
          )}

          {/* Small 3D Insertion Pin (shown only when Insertion checkbox is ON) */}
          {showMuscleInsertion && (
            <group position={muscleOverlay.insertionPos}>
              <mesh renderOrder={15}>
                <sphereGeometry args={[activeFocusPart === "insertion" ? 0.0065 : 0.0045, 16, 16]} />
                <meshBasicMaterial color="#10b981" depthTest={true} />
              </mesh>
              <Html center zIndexRange={[18, 0]}>
                <MicroPinCallout
                  worldPos={muscleOverlay.insertionPos}
                  text="Insertion"
                  accent="#34d399"
                  active={activeFocusPart === "insertion"}
                  side="right"
                  vOffset={16}
                />
              </Html>
            </group>
          )}
        </group>
      )}



      {/* CASE 1B: NERVE / ARTERY / VEIN TARGET MUSCLE & ORGAN 3D COLORING OVERLAY */}
      {nerveInsertionOverlay && showNerveInsertion && (
        <group>
          <mesh ref={nervePulseRef} position={nerveInsertionOverlay.rootPos} renderOrder={17}>
            <sphereGeometry args={[0.006, 16, 16]} />
            <meshBasicMaterial
              color={
                nerveInsertionOverlay.isVein
                  ? "#38bdf8"
                  : nerveInsertionOverlay.isCardioVessel
                    ? "#fb7185"
                    : "#fef08a"
              }
              depthTest={true}
            />
          </mesh>
          {nerveInsertionOverlay.targetMuscleGeoms.map((tg) => {
            if (enabled3DToggles[`organ3d_${tg.id}`] === false) return null;
            return (
              <mesh
                key={tg.id}
                geometry={tg.geometry}
                matrixAutoUpdate={false}
                matrix={tg.matrix}
                renderOrder={11}
              >
                <meshStandardMaterial
                  color={nerveInsertionOverlay.isVein ? "#0ea5e9" : "#e11d48"}
                  emissive={nerveInsertionOverlay.isVein ? "#0284c7" : "#be123c"}
                  emissiveIntensity={0.28}
                  roughness={0.45}
                  transparent={false}
                  opacity={1.0}
                  depthWrite={true}
                />
              </mesh>
            );
          })}

          <group position={nerveInsertionOverlay.rootPos}>
            <mesh renderOrder={15}>
              <sphereGeometry args={[0.0045, 16, 16]} />
              <meshBasicMaterial
                color={
                  nerveInsertionOverlay.isVein
                    ? "#38bdf8"
                    : nerveInsertionOverlay.isCardioVessel
                      ? "#f87171"
                      : "#fbbf24"
                }
                depthTest={true}
              />
            </mesh>
            <Html center zIndexRange={[18, 0]}>
              <MicroPinCallout
                worldPos={nerveInsertionOverlay.rootPos}
                text={
                  nerveInsertionOverlay.isVein
                    ? "Venous Termination"
                    : nerveInsertionOverlay.isCardioVessel
                      ? "Arterial Origin"
                      : "Nerve Origin"
                }
                accent={
                  nerveInsertionOverlay.isVein
                    ? "#38bdf8"
                    : nerveInsertionOverlay.isCardioVessel
                      ? "#f87171"
                      : "#fbbf24"
                }
                side="left"
                vOffset={-14}
              />
            </Html>
          </group>

          <group position={nerveInsertionOverlay.insertionPos}>
            <mesh renderOrder={15}>
              <sphereGeometry args={[0.0052, 16, 16]} />
              <meshBasicMaterial
                color={
                  nerveInsertionOverlay.isVein
                    ? "#0ea5e9"
                    : nerveInsertionOverlay.isCardioVessel
                      ? "#fb7185"
                      : "#10b981"
                }
                depthTest={true}
              />
            </mesh>
            <Html center zIndexRange={[18, 0]}>
              <MicroPinCallout
                worldPos={nerveInsertionOverlay.insertionPos}
                text={
                  nerveInsertionOverlay.targetMuscle
                    ? `${
                        nerveInsertionOverlay.isVein
                          ? "Drains"
                          : nerveInsertionOverlay.isCardioVessel
                            ? "Supplies"
                            : "Insertion"
                      }: ${nerveInsertionOverlay.targetMuscle.name_en.replace(/\s*\((left|right)\)\s*/gi, "")}`
                    : nerveInsertionOverlay.isVein
                      ? "Venous Drainage"
                      : nerveInsertionOverlay.isCardioVessel
                        ? "Arterial Supply"
                        : "Nerve Insertion"
                }
                accent={
                  nerveInsertionOverlay.isVein
                    ? "#38bdf8"
                    : nerveInsertionOverlay.isCardioVessel
                      ? "#fb7185"
                      : "#34d399"
                }
                side="right"
                vOffset={14}
                onClick={
                  nerveInsertionOverlay.targetMuscle
                    ? () => selectOrgan(nerveInsertionOverlay.targetMuscle!.organ_id)
                    : undefined
                }
              />
            </Html>
          </group>
        </group>
      )}

      {/* CASE 2: ORGAN 3D CALLOUT PINS (Rendered ONLY for items whose checkbox is enabled!) */}
      {organOverlay && (() => {
        const allOrganCallouts: {
          id: string;
          worldPos: [number, number, number];
          text: string;
          accent: string;
        }[] = [];
        const seenCalloutIds = new Set<string>();
        const pushUniqueCallout = (entry: {
          id: string;
          worldPos: [number, number, number];
          text: string;
          accent: string;
        }) => {
          if (seenCalloutIds.has(entry.id)) return;
          seenCalloutIds.add(entry.id);
          allOrganCallouts.push(entry);
        };
        const showAllRels = Boolean(enabled3DToggles["organ_relations"]);
        const showAllBlood = Boolean(
          enabled3DToggles["organ_blood"] || enabled3DToggles["conn_cardiovascular"],
        );
        const showAllNerves = Boolean(
          enabled3DToggles["organ_nerves"] ||
            enabled3DToggles["muscle_nerves"] ||
            enabled3DToggles["conn_nervous"],
        );

        for (const rel of organOverlay.relations.slice(0, 4)) {
          if (!showAllRels && !enabled3DToggles[`organ3d_${rel.organId}`]) continue;
          const c = centres.get(rel.organId);
          if (c) {
            pushUniqueCallout({
              id: rel.organId,
              worldPos: [c.x, c.y, c.z],
              text: `${rel.direction}: ${rel.name_en.slice(0, 22)}`,
              accent: "#22d3ee",
            });
          }
        }
        for (const aid of organOverlay.arteryIds.slice(0, 3)) {
          if (!showAllBlood && !enabled3DToggles[`organ3d_${aid}`]) continue;
          const c = centres.get(aid);
          const org = useSceneStore.getState().organs[aid];
          if (c && org) {
            pushUniqueCallout({
              id: aid,
              worldPos: [c.x, c.y, c.z],
              text: org.name_en.slice(0, 24),
              accent: "#f87171",
            });
          }
        }
        for (const vid of organOverlay.veinIds.slice(0, 3)) {
          if (!showAllBlood && !enabled3DToggles[`organ3d_${vid}`]) continue;
          const c = centres.get(vid);
          const org = useSceneStore.getState().organs[vid];
          if (c && org) {
            pushUniqueCallout({
              id: vid,
              worldPos: [c.x, c.y, c.z],
              text: org.name_en.slice(0, 24),
              accent: "#60a5fa",
            });
          }
        }
        const combinedNerveIds = [
          ...new Set([...(muscleOverlay?.nerveIds ?? []), ...organOverlay.nerveIds]),
        ];
        for (const nid of combinedNerveIds.slice(0, 6)) {
          if (!showAllNerves && !enabled3DToggles[`organ3d_${nid}`]) continue;
          const c = centres.get(nid);
          const org = useSceneStore.getState().organs[nid];
          if (c && org) {
            pushUniqueCallout({
              id: nid,
              worldPos: [c.x, c.y, c.z],
              text: org.name_en.slice(0, 26),
              accent: "#facc15",
            });
          }
        }
        const showAllSiblingHeads = Boolean(enabled3DToggles["muscle_sibling_heads"]);
        for (const sid of (muscleOverlay?.siblingBranchIds ?? []).slice(0, 8)) {
          if (!showAllSiblingHeads && !enabled3DToggles[`organ3d_${sid}`]) continue;
          const c = centres.get(sid);
          const org = useSceneStore.getState().organs[sid];
          if (c && org) {
            pushUniqueCallout({
              id: sid,
              worldPos: [c.x, c.y, c.z],
              text: org.name_en.replace(/\s*\((left|right)\)\s*/gi, "").slice(0, 26),
              accent: "#fb7185",
            });
          }
        }
        if (allOrganCallouts.length === 0) return null;
        const organBox = activeOrgan ? boxes.get(activeOrgan.organ_id) : undefined;
        const organSpanY = organBox ? Math.max(organBox.max.y - organBox.min.y, 0.12) : 0.16;
        const layoutMap = layoutNonOverlappingCallouts(allOrganCallouts, organSpanY);
        return (
          <group>
            {allOrganCallouts.map((item, idx) => {
              const placement = layoutMap.get(item.id) ?? {
                side: "right" as const,
                vOffset: 0,
                hOffset: 28,
              };
              return (
                <group key={`${item.id}_${idx}`} position={item.worldPos}>
                  <Html center zIndexRange={[17, 0]}>
                    <MicroPinCallout
                      worldPos={item.worldPos}
                      text={item.text}
                      accent={item.accent}
                      side={placement.side}
                      vOffset={placement.vOffset}
                      hOffset={placement.hOffset}
                      onClick={() => selectOrgan(item.id)}
                    />
                  </Html>
                </group>
              );
            })}
          </group>
        );
      })()}

      {/* CASE 3: BONE INTERACTIVE 3D KEY ANATOMY LANDMARKS & NOTCHES (Rendered ONLY for checked landmarks!) */}
      {boneLandmarks.length > 0 && (() => {
        const visibleLandmarks = boneLandmarks.filter(
          (lm) =>
            Boolean(
              enabled3DToggles[`landmark_${lm.id}`] ||
                enabled3DToggles["bone_landmarks"] ||
                enabled3DToggles["muscle_branches"],
            ),
        );
        if (visibleLandmarks.length === 0) return null;
        const boneBox = activeOrgan ? boxes.get(activeOrgan.organ_id) : undefined;
        const boneSpanY = boneBox ? Math.max(boneBox.max.y - boneBox.min.y, 0.14) : 0.22;
        const boneCalloutInputs: CalloutPlacementInput[] = visibleLandmarks.map((lm) => {
          const origIdx = boneLandmarks.findIndex((x) => x.id === lm.id);
          return {
            id: lm.id,
            worldPos: lm.worldPos,
            text: `${origIdx + 1}. ${lm.name_en.slice(0, 26)}`,
          };
        });
        const boneLayoutMap = layoutNonOverlappingCallouts(boneCalloutInputs, boneSpanY);

        return (
          <group>
            {visibleLandmarks.map((lm, idx) => {
              const origIdx = boneLandmarks.findIndex((x) => x.id === lm.id);
              const isActive = activeLandmarkId === lm.id;
              const isNotch = lm.kind === "notch";
              const pinColor = isActive ? "#10b981" : isNotch ? "#f59e0b" : "#38bdf8";
              const placement = boneLayoutMap.get(lm.id) ?? {
                side: idx % 2 === 0 ? ("right" as const) : ("left" as const),
                vOffset: 0,
                hOffset: 28,
              };
              return (
                <group key={lm.id} position={lm.worldPos}>
                  <mesh
                    renderOrder={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLandmarkId(isActive ? null : lm.id);
                    }}
                  >
                    <sphereGeometry args={[isActive ? 0.0055 : 0.0038, 16, 16]} />
                    <meshBasicMaterial color={pinColor} depthTest={true} />
                  </mesh>
                  <Html center zIndexRange={[18, 0]}>
                    <MicroPinCallout
                      worldPos={lm.worldPos}
                      text={`${origIdx + 1}. ${lm.name_en.slice(0, 26)}`}
                      accent={pinColor}
                      active={isActive}
                      side={placement.side}
                      vOffset={placement.vOffset}
                      hOffset={placement.hOffset}
                      onClick={() => setActiveLandmarkId(isActive ? null : lm.id)}
                    />
                  </Html>
                </group>
              );
            })}
          </group>
        );
      })()}
    </group>
  );
}

/**
 * Ultra-Thin Neural Impulse Light Beams (`NeuralImpulseBeams`):
 * Every minute (and on opening the Nervous system or pressing Pulse), a razor-thin beam of light
 * descends from the Brain -> Spinal Cord -> branches into every major peripheral nerve
 * (Vagus, Phrenic, Brachial plexus -> Axillary, Radial, Median, Ulnar, Intercostals,
 * Lumbar plexus -> Femoral/Saphenous, Obturator, Sacral plexus -> Sciatic, Tibial, Common/Deep Fibular)
 * and terminates at the distal ends of each major nerve!
 */
interface NeuralBranchSpec {
  id: string;
  startWindow: number;
  endWindow: number;
  points: [number, number, number][];
}

const NEURAL_TREE_BRANCHES: NeuralBranchSpec[] = [
  // 1. Brain Cortex -> Diencephalon -> Brainstem -> Foramen Magnum (0.00 -> 0.16)
  {
    id: "brain_to_cord",
    startWindow: 0.0,
    endWindow: 0.16,
    points: [
      [0.0, 1.665, 0.015],
      [-0.028, 1.64, 0.005],
      [0.0, 1.605, -0.005],
      [0.0, 1.56, -0.018],
      [0.0, 1.515, -0.025],
    ],
  },
  {
    id: "brain_right_hemi",
    startWindow: 0.0,
    endWindow: 0.15,
    points: [
      [0.028, 1.64, 0.005],
      [0.015, 1.60, -0.005],
      [0.0, 1.56, -0.018],
    ],
  },
  // 2. Spinal Cord: Cervical C1 -> Thoracic -> Lumbar Conus -> Sacral Cauda Equina (0.14 -> 0.44)
  {
    id: "spinal_cord_main",
    startWindow: 0.14,
    endWindow: 0.44,
    points: [
      [0.0, 1.515, -0.025],
      [0.0, 1.44, -0.028],
      [0.0, 1.36, -0.035],
      [0.0, 1.26, -0.042],
      [0.0, 1.15, -0.038],
      [0.0, 1.04, -0.028],
      [0.0, 0.94, -0.024],
      [0.0, 0.85, -0.032],
    ],
  },
  // 3. Bilateral Vagus & Phrenic Nerves (0.16 -> 0.58)
  ...([-1, 1] as const).flatMap((s) => [
    {
      id: `vagus_${s}`,
      startWindow: 0.15,
      endWindow: 0.56,
      points: [
        [0.0, 1.53, -0.02],
        [s * 0.022, 1.46, 0.00],
        [s * 0.026, 1.36, 0.012],
        [s * 0.022, 1.22, 0.018],
        [s * 0.018, 1.08, 0.028],
      ] as [number, number, number][],
    },
    {
      id: `phrenic_${s}`,
      startWindow: 0.20,
      endWindow: 0.55,
      points: [
        [0.0, 1.44, -0.028],
        [s * 0.032, 1.38, 0.005],
        [s * 0.052, 1.25, 0.025],
        [s * 0.075, 1.12, 0.035],
      ] as [number, number, number][],
    },
    // 4. Brachial Plexus (C5-T1) -> Axillary, Radial, Median, Ulnar Nerves (0.22 -> 0.92)
    {
      id: `axillary_${s}`,
      startWindow: 0.22,
      endWindow: 0.54,
      points: [
        [0.0, 1.42, -0.028],
        [s * 0.075, 1.39, -0.015],
        [s * 0.145, 1.355, -0.012],
        [s * 0.182, 1.325, -0.018],
      ] as [number, number, number][],
    },
    {
      id: `radial_${s}`,
      startWindow: 0.22,
      endWindow: 0.90,
      points: [
        [0.0, 1.42, -0.028],
        [s * 0.08, 1.39, -0.015],
        [s * 0.155, 1.34, -0.015],
        [s * 0.195, 1.21, -0.025],
        [s * 0.228, 1.07, -0.012],
        [s * 0.252, 0.93, -0.008],
        [s * 0.272, 0.79, 0.015],
      ] as [number, number, number][],
    },
    {
      id: `median_${s}`,
      startWindow: 0.23,
      endWindow: 0.94,
      points: [
        [0.0, 1.41, -0.028],
        [s * 0.085, 1.38, -0.01],
        [s * 0.16, 1.33, -0.005],
        [s * 0.19, 1.19, 0.002],
        [s * 0.222, 1.06, 0.012],
        [s * 0.248, 0.92, 0.022],
        [s * 0.268, 0.75, 0.038],
      ] as [number, number, number][],
    },
    {
      id: `ulnar_${s}`,
      startWindow: 0.24,
      endWindow: 0.94,
      points: [
        [0.0, 1.39, -0.03],
        [s * 0.085, 1.37, -0.012],
        [s * 0.16, 1.32, -0.01],
        [s * 0.188, 1.18, -0.012],
        [s * 0.205, 1.05, -0.015],
        [s * 0.235, 0.91, 0.012],
        [s * 0.255, 0.75, 0.032],
      ] as [number, number, number][],
    },
    // 5. Thoracic Intercostal Nerves (0.28 -> 0.62)
    {
      id: `intercostal_t5_${s}`,
      startWindow: 0.28,
      endWindow: 0.60,
      points: [
        [0.0, 1.26, -0.04],
        [s * 0.075, 1.24, -0.035],
        [s * 0.125, 1.21, 0.015],
        [s * 0.085, 1.19, 0.075],
      ] as [number, number, number][],
    },
    {
      id: `intercostal_t9_${s}`,
      startWindow: 0.32,
      endWindow: 0.64,
      points: [
        [0.0, 1.14, -0.036],
        [s * 0.08, 1.12, -0.03],
        [s * 0.125, 1.08, 0.02],
        [s * 0.075, 1.05, 0.082],
      ] as [number, number, number][],
    },
    // 6. Lumbar Plexus -> Femoral, Saphenous & Obturator Nerves (0.38 -> 0.95)
    {
      id: `obturator_${s}`,
      startWindow: 0.38,
      endWindow: 0.72,
      points: [
        [0.0, 0.98, -0.025],
        [s * 0.048, 0.90, -0.005],
        [s * 0.058, 0.81, 0.015],
        [s * 0.065, 0.63, 0.012],
      ] as [number, number, number][],
    },
    {
      id: `femoral_saphenous_${s}`,
      startWindow: 0.38,
      endWindow: 0.95,
      points: [
        [0.0, 0.99, -0.025],
        [s * 0.062, 0.92, 0.008],
        [s * 0.088, 0.85, 0.038],
        [s * 0.102, 0.67, 0.045],
        [s * 0.078, 0.48, 0.022],
        [s * 0.068, 0.28, 0.022],
        [s * 0.062, 0.09, 0.035],
      ] as [number, number, number][],
    },
    // 7. Sacral Plexus -> Sciatic -> Tibial & Common/Deep Fibular Nerves to Foot Tips (0.42 -> 1.00)
    {
      id: `sciatic_tibial_${s}`,
      startWindow: 0.42,
      endWindow: 1.0,
      points: [
        [0.0, 0.91, -0.028],
        [s * 0.065, 0.86, -0.038],
        [s * 0.092, 0.79, -0.045],
        [s * 0.095, 0.63, -0.035],
        [s * 0.088, 0.48, -0.025],
        [s * 0.082, 0.29, -0.026],
        [s * 0.072, 0.08, -0.012],
        [s * 0.078, 0.025, 0.085],
      ] as [number, number, number][],
    },
    {
      id: `sciatic_fibular_${s}`,
      startWindow: 0.66,
      endWindow: 1.0,
      points: [
        [s * 0.088, 0.48, -0.025],
        [s * 0.106, 0.42, -0.005],
        [s * 0.095, 0.26, 0.018],
        [s * 0.085, 0.09, 0.038],
        [s * 0.085, 0.025, 0.115],
      ] as [number, number, number][],
    },
  ]),
];

export function NeuralImpulseBeams({ visible }: { visible: boolean }) {
  const neuralPulseSeq = useSafeStore(useInspector3DStore, (s) => s.neuralPulseSeq);
  const lastFiredRef = useRef(-60);
  const pulseStartRef = useRef(0);

  const branchRuntime = useMemo(() => {
    const SEGMENTS = 36;
    return NEURAL_TREE_BRANCHES.map((b) => {
      const curve = new THREE.CatmullRomCurve3(
        b.points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      );
      const pts = curve.getPoints(SEGMENTS);
      const positions = new Float32Array((SEGMENTS + 1) * 3);
      const colors = new Float32Array((SEGMENTS + 1) * 3);
      for (let i = 0; i <= SEGMENTS; i++) {
        const pt = pts[i]!;
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const colorAttr = new THREE.BufferAttribute(colors, 3);
      geom.setAttribute("color", colorAttr);
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const lineObj = new THREE.Line(geom, mat);
      lineObj.renderOrder = 14;
      const tipPos = pts[pts.length - 1]!.clone();
      return {
        ...b,
        lineObj,
        colorAttr,
        segments: SEGMENTS,
        tipPos,
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      for (const br of branchRuntime) {
        br.lineObj.geometry.dispose();
        (br.lineObj.material as THREE.Material).dispose();
      }
    };
  }, [branchRuntime]);

  useEffect(() => {
    if (visible) {
      pulseStartRef.current = performance.now() / 1000;
    }
  }, [visible, neuralPulseSeq]);

  const tipRefs = useRef<(THREE.Mesh | null)[]>([]);
  const wasWaveActiveRef = useRef(true);
  const { invalidate: invalidateBeams } = useThree();

  useFrame(({ clock }) => {
    if (!visible || (typeof window !== "undefined" && window.innerWidth < 768)) return;
    const now = clock.getElapsedTime();
    const elapsed = now - pulseStartRef.current;
    const WAVE_DURATION = 6.5; // 6.5-second smooth cascade from Brain -> Spinal Cord -> Distal Nerve Tips
    const waveProgress = elapsed >= 0 && elapsed <= WAVE_DURATION ? elapsed / WAVE_DURATION : -1;
    if (waveProgress < 0) {
      if (!wasWaveActiveRef.current) return;
      wasWaveActiveRef.current = false;
    } else {
      wasWaveActiveRef.current = true;
      invalidateBeams();
    }

    for (let idx = 0; idx < branchRuntime.length; idx++) {
      const br = branchRuntime[idx]!;
      const cArr = br.colorAttr.array as Float32Array;
      const span = Math.max(br.endWindow - br.startWindow, 0.05);

      for (let i = 0; i <= br.segments; i++) {
        const frac = i / br.segments;
        const globalT = br.startWindow + frac * span;
        let intensity = 0.0;
        if (waveProgress >= 0) {
          const dist = waveProgress - globalT;
          // Sharp leading light head + glowing tail
          if (dist >= -0.03 && dist <= 0.14) {
            const head = Math.exp(-Math.pow(dist / 0.045, 2));
            intensity = Math.max(intensity, head);
          }
        }
        // Bright cyan-white core with golden distal glow
        const r = intensity * (0.45 + 0.55 * frac);
        const g = intensity * 0.92;
        const b = intensity * 1.0;
        cArr[i * 3] = r;
        cArr[i * 3 + 1] = g;
        cArr[i * 3 + 2] = b;
      }
      br.colorAttr.needsUpdate = true;
      br.lineObj.visible = waveProgress >= 0;

      const tipMesh = tipRefs.current[idx];
      if (tipMesh) {
        const tipGlow =
          waveProgress >= 0
            ? Math.exp(-Math.pow((waveProgress - br.endWindow) / 0.04, 2))
            : 0;
        tipMesh.visible = tipGlow > 0.08;
        const s = 0.5 + tipGlow * 1.1;
        tipMesh.scale.setScalar(s);
      }
    }
  });

  if (!visible) return null;

  return (
    <group>
      {branchRuntime.map((br, idx) => (
        <group key={br.id}>
          <primitive object={br.lineObj} />
          <mesh
            ref={(el) => {
              tipRefs.current[idx] = el;
            }}
            position={br.tipPos}
            visible={false}
            renderOrder={15}
          >
            <sphereGeometry args={[0.0024, 10, 10]} />
            <meshBasicMaterial
              color="#fde047"
              transparent
              opacity={0.95}
              depthTest={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

