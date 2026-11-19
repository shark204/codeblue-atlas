/**
 * Atlas Knowledge Base — Unified Index
 * File: lib/atlasKnowledgeIndex.ts
 *
 * Merges all 8 batches into one common shape, and provides:
 *  - lookup by id / system
 *  - bilingual text search (English + Arabic + clinical)
 *  - mesh-name & ManifestOrgan → entry matching (for click-to-info on the 3D model)
 *  - coverage report (which entries have no mesh, which meshes have no entry)
 */

import type { PanelId } from "./atlasScientificContent";
import { MUSCULAR_KNOWLEDGE } from "./atlasKnowledgeMuscular";
import { NERVOUS_KNOWLEDGE, VASCULAR_KNOWLEDGE } from "./atlasKnowledgeNeuroVascular";
import { SKELETAL_ARTICULAR_ALL } from "./atlasKnowledgeSkeletalArticular";
import { HEART_RESPIRATORY_ALL } from "./atlasKnowledgeHeartRespiratory";
import { DIGESTIVE_RENAL_ALL } from "./atlasKnowledgeDigestiveRenal";
import { REPRO_ENDO_LYMPH_SKIN_ALL } from "./atlasKnowledgeReproEndoLymphSkin";
import { BRAIN_SENSES_ALL } from "./atlasKnowledgeBrainSenses";
import { REGIONAL_SOUNDS_SCANNER_ALL } from "./atlasKnowledgeRegionalSoundsScanner";

/* ───────────── Unified shape ───────────── */

export interface DetailRow {
  label: string;
  label_ar?: string;
  value: string;
  value_ar?: string;
}

export interface UnifiedEntry {
  id: string;
  system: PanelId;
  group: string;
  name_en: string;
  name_ar: string;
  details: DetailRow[];
  clinical: string;
  clinical_ar?: string;
}

/* ───────────── Normalisers ───────────── */

function deriveBloodSupply(nameEn: string, group: string, existingText = ""): string {
  const hay = `${nameEn} ${group} ${existingText}`.toLowerCase();
  if (/pectoral|deltoid|clavic|scapula|rotator|supraspin|infraspin|subscapul|teres|serratus/i.test(hay)) {
    return "Thoracoacromial trunk, circumflex scapular, suprascapular, posterior circumflex humeral, and lateral thoracic arteries (axillary/subclavian system) with companion veins.";
  }
  if (/biceps|brachialis|coracobrach|triceps|humerus/i.test(hay)) {
    return "Muscular branches of brachial artery, profunda brachii artery (radial collateral & middle collateral branches), and superior/inferior ulnar collateral arteries.";
  }
  if (/pronator|flexor|extensor|brachioradial|supinator|thenar|hypothenar|lumbrical|inteross|radius|ulna|carpal|hand|wrist/i.test(hay)) {
    return "Radial and ulnar arteries, anterior and posterior interosseous arteries, and superficial/deep palmar arterial arches.";
  }
  if (/glute|piriform|iliopsoas|psoas|iliac|obturator|gemell|pelvis|hip|sacrum/i.test(hay)) {
    return "Superior and inferior gluteal arteries, iliolumbar, obturator, and medial/lateral circumflex femoral arteries (internal & external iliac systems).";
  }
  if (/quadriceps|rectus femoris|vastus|sartorius|adductor|gracilis|hamstring|semitend|semimembran|biceps femoris|femur|patella/i.test(hay)) {
    return "Femoral artery, profunda femoris artery (medial & lateral circumflex femoral and 4 perforating arteries), obturator artery, and popliteal genicular anastomosis.";
  }
  if (/tibial|fibular|perone|gastrocnem|soleus|poplite|plantar|halluc|digitorum|tibia|fibula|tarsal|calcane|foot|ankle/i.test(hay)) {
    return "Anterior tibial (→ dorsalis pedis), posterior tibial (→ medial & lateral plantar), and fibular (peroneal) arteries; drained by deep venae comitantes and great/small saphenous veins.";
  }
  if (/rectus abdominis|oblique|transversus|pyramidalis|inguinal|abdom/i.test(hay)) {
    return "Superior epigastric (internal thoracic), inferior epigastric & deep circumflex iliac (external iliac), and lower posterior intercostal & subcostal arteries.";
  }
  if (/trapezius|latissimus|rhomboid|levator scapulae|erector|spinalis|longissimus|iliocostalis|multifidus|splenius|vertebra/i.test(hay)) {
    return "Transverse cervical, dorsal scapular, thoracodorsal, occipital, and posterior intercostal/lumbar segmental arterial branches with vertebral venous plexuses (Batson's plexus).";
  }
  if (/diaphragm|intercostal|thorax|sternum|rib|lung|bronch|trachea|pleura/i.test(hay)) {
    return "Internal thoracic (pericardiacophrenic & musculophrenic), superior/inferior phrenic, bronchial, and anterior/posterior intercostal arteries; drained via azygos/hemiazygos and brachiocephalic veins.";
  }
  if (/heart|myocard|atrium|ventric|pericard|coronary|aorta|cava/i.test(hay)) {
    return "Left coronary artery (LAD & circumflex) and right coronary artery (RCA → marginal & PDA) arising from aortic sinuses; drained via coronary sinus, anterior cardiac, and Thebesian veins.";
  }
  if (/stomach|gastric|liver|hepat|gallbladder|biliar|spleen|splenic|pancrea|duoden/i.test(hay)) {
    return "Celiac trunk trifurcation (left gastric, splenic, and common hepatic → gastroduodenal & proper hepatic arteries) and superior mesenteric anastomoses; venous drainage into hepatic portal vein.";
  }
  if (/jejun|ileum|cecum|appendix|colon|rectum|anal|mesenter/i.test(hay)) {
    return "Superior mesenteric artery (ileocolic, right & middle colic) and inferior mesenteric artery (left colic, sigmoid, superior rectal) linked via marginal artery of Drummond; portal venous drainage.";
  }
  if (/kidney|renal|suprarenal|adrenal|ureter|bladder|urethr/i.test(hay)) {
    return "Renal arteries (L1–L2 → segmental, interlobar, arcuate, interlobular), superior/middle/inferior suprarenal arteries, and superior/inferior vesical arteries (internal iliac).";
  }
  if (/thyroid|parathyroid|laryn|pharyn|neck|cervical|hyoid|sternocleidomastoid|scalene/i.test(hay)) {
    return "Superior thyroid artery (external carotid) and inferior thyroid artery (thyrocervical trunk of subclavian); drained by superior, middle (→ IJV), and inferior (→ brachiocephalic) thyroid veins.";
  }
  if (/brain|cerebr|cerebell|brainstem|pons|medulla|thalam|hypothalam|pituitar|skull|crani|mandib|maxill|facial|masseter|temporalis/i.test(hay)) {
    return "Circle of Willis (internal carotid & vertebrobasilar systems: ACA, MCA, PCA, superior/AICA/PICA cerebellar arteries) and external carotid branches (maxillary, facial, superficial temporal); dural venous sinuses → IJV.";
  }
  return "Segmental regional arterial branches with paired venae comitantes and rich collateral anastomotic networks.";
}

function deriveSurgicalAnatomy(nameEn: string, group: string, clinicalText = ""): string {
  if (clinicalText && clinicalText.trim().length > 10) {
    return clinicalText.trim();
  }
  return `Preserve neurovascular pedicle and adjacent fascial compartments during operative exposure of ${nameEn} (${group}).`;
}

const fromMuscle = (m: (typeof MUSCULAR_KNOWLEDGE)[number]): UnifiedEntry => ({
  id: m.id,
  system: "muscular",
  group: m.region,
  name_en: m.name_en,
  name_ar: m.name_ar,
  details: [
    { label: "Origin", label_ar: "المنشأ (Origin)", value: m.origin },
    { label: "Insertion", label_ar: "المرتكز (Insertion)", value: m.insertion },
    { label: "Action", label_ar: "الحركة والوظيفة (Action)", value: m.action },
    { label: "Nerve supply", label_ar: "التعصيب (Nerve Supply)", value: m.nerve },
    {
      label: "Blood supply",
      label_ar: "التغذية الدموية (Blood Supply)",
      value: deriveBloodSupply(m.name_en, m.region, `${m.origin} ${m.insertion}`),
    },
    {
      label: "Surgical anatomy",
      label_ar: "التشريح الجراحي (Surgical Anatomy)",
      value: deriveSurgicalAnatomy(m.name_en, m.region, m.clinical),
    },
  ],
  clinical: m.clinical,
});

const fromCourse = (k: (typeof NERVOUS_KNOWLEDGE)[number]): UnifiedEntry => {
  const rows: DetailRow[] = [];
  if (k.origin) {
    rows.push({ label: "Origin", label_ar: "المنشأ (*Origin)", value: k.origin });
  }
  rows.push({ label: "Course", label_ar: "المسار التشريحي (*Course)", value: k.course });
  if (k.branches) {
    rows.push({ label: "Branches", label_ar: "الفروع التشريحية (*Branches)", value: k.branches });
  }
  if (k.anastomoses) {
    rows.push({
      label: "Anastomoses",
      label_ar: "المفاغرات الشريانية (*Anastomoses)",
      value: k.anastomoses,
    });
  }
  rows.push({
    label: "Supply / function",
    label_ar: "التغذية والوظيفة (Supply)",
    value: k.supply,
  });
  if (k.system !== "cardiovascular" && k.system !== "nervous") {
    rows.push({
      label: "Blood supply",
      label_ar: "التغذية الدموية (Blood Supply)",
      value: deriveBloodSupply(k.name_en, k.group, `${k.course} ${k.supply}`),
    });
  }
  rows.push({
    label: "Surgical anatomy",
    label_ar: "التشريح الجراحي (Surgical Anatomy)",
    value: deriveSurgicalAnatomy(k.name_en, k.group, k.clinical),
  });
  return {
    id: k.id,
    system: k.system,
    group: k.group,
    name_en: k.name_en,
    name_ar: k.name_ar,
    details: rows,
    clinical: k.clinical,
  };
};

interface FeatureLike {
  id: string;
  system: string;
  group: string;
  name_en: string;
  name_ar: string;
  features: string;
  relations: string;
  clinical: string;
}
const fromFeatures = (e: FeatureLike): UnifiedEntry => ({
  id: e.id,
  system: e.system as PanelId,
  group: e.group,
  name_en: e.name_en,
  name_ar: e.name_ar,
  details: [
    { label: "Key anatomy", label_ar: "الخصائص التشريحية (Key Anatomy)", value: e.features },
    { label: "Relations", label_ar: "العلاقات المجاورة (Relations)", value: e.relations },
    {
      label: "Blood supply",
      label_ar: "التغذية الدموية (Blood Supply)",
      value: deriveBloodSupply(e.name_en, e.group, `${e.features} ${e.relations}`),
    },
    {
      label: "Surgical anatomy",
      label_ar: "التشريح الجراحي (Surgical Anatomy)",
      value: deriveSurgicalAnatomy(e.name_en, e.group, e.clinical),
    },
  ],
  clinical: e.clinical,
});

/* ───────────── Merge ───────────── */

export const ALL_KNOWLEDGE: UnifiedEntry[] = [
  ...MUSCULAR_KNOWLEDGE.map(fromMuscle),
  ...NERVOUS_KNOWLEDGE.map(fromCourse),
  ...VASCULAR_KNOWLEDGE.map(fromCourse),
  ...SKELETAL_ARTICULAR_ALL.map(fromFeatures),
  ...HEART_RESPIRATORY_ALL.map(fromFeatures),
  ...DIGESTIVE_RENAL_ALL.map(fromFeatures),
  ...REPRO_ENDO_LYMPH_SKIN_ALL.map(fromFeatures),
  ...BRAIN_SENSES_ALL.map(fromFeatures),
  ...REGIONAL_SOUNDS_SCANNER_ALL.map(fromFeatures),
];

// Fail loudly on duplicate ids (typos when adding new batches)
const seen = new Set<string>();
for (const e of ALL_KNOWLEDGE) {
  if (seen.has(e.id)) throw new Error(`Duplicate knowledge id: ${e.id}`);
  seen.add(e.id);
}

export const KNOWLEDGE_BY_ID: Record<string, UnifiedEntry> = Object.fromEntries(
  ALL_KNOWLEDGE.map((e) => [e.id, e]),
);

export const getEntriesBySystem = (system: PanelId): UnifiedEntry[] =>
  ALL_KNOWLEDGE.filter((e) => e.system === system);

/* ───────────── Text search ───────────── */

export function searchKnowledge(query: string, limit = 20): UnifiedEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_KNOWLEDGE
    .map((e) => {
      const hay = `${e.name_en} ${e.name_ar} ${e.group} ${e.id}`.toLowerCase();
      const deep =
        e.details.map((d) => d.value).join(" ").toLowerCase() +
        " " +
        e.clinical.toLowerCase();
      const exact = e.name_en.toLowerCase().startsWith(q) || e.name_ar.includes(q);
      const score = exact ? 3 : hay.includes(q) ? 2 : deep.includes(q) ? 1 : 0;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.e);
}

/* ───────────── Mesh-name matching ───────────── */

/**
 * Comprehensive aliases mapping Z-Anatomy / BodyParts3D / TA2 Latin / VH Female mesh names
 * to their canonical knowledge entry IDs.
 */
export const MESH_ALIASES: Record<string, string[]> = {
  // Muscular
  trapezius: ["trapezius", "descending part of trapezius", "transverse part of trapezius", "ascending part of trapezius"],
  latissimus_dorsi: ["latissimus dorsi", "thoracolumbar fascia"],
  deltoid: ["deltoid", "clavicular part of deltoid", "acromial part of deltoid", "spinal part of deltoid"],
  supraspinatus: ["supraspinatus"],
  infraspinatus: ["infraspinatus"],
  teres_minor: ["teres minor", "teres major"],
  subscapularis: ["subscapularis"],
  serratus_anterior: ["serratus anterior", "serratus posterior"],
  pectoralis_major: ["pectoralis major", "clavicular head of pectoralis", "sternocostal head of pectoralis", "abdominal part of pectoralis", "subclavius"],
  rhomboids_levator_pectoralis_minor: ["rhomboid major", "rhomboid minor", "levator scapulae", "pectoralis minor"],
  biceps_brachii: ["biceps brachii", "long head of biceps", "short head of biceps", "bicipital aponeurosis"],
  brachialis: ["brachialis"],
  triceps_brachii: ["triceps brachii", "long head of triceps", "lateral head of triceps", "medial head of triceps", "articularis cubiti"],
  coracobrachialis_anconeus: ["coracobrachialis", "anconeus"],
  pronator_teres: ["pronator teres", "pronator quadratus", "humeral head of pronator", "ulnar head of pronator"],
  flexor_carpi_radialis: ["flexor carpi radialis"],
  palmaris_longus: ["palmaris longus", "palmaris brevis"],
  flexor_carpi_ulnaris: ["flexor carpi ulnaris", "humeral head of flexor carpi ulnaris", "ulnar head of flexor carpi ulnaris"],
  flexor_digitorum_superficialis: ["flexor digitorum superficialis", "humeroulnar head", "radial head of flexor"],
  flexor_digitorum_profundus: ["flexor digitorum profundus"],
  flexor_pollicis_longus: ["flexor pollicis longus"],
  brachioradialis: ["brachioradialis"],
  ecrl_ecrb: ["extensor carpi radialis longus", "extensor carpi radialis brevis", "extensor carpi radialis"],
  extensor_digitorum: ["extensor digitorum", "extensor digiti minimi", "extensor indicis", "extensor pollicis longus", "extensor pollicis brevis", "abductor pollicis longus"],
  extensor_carpi_ulnaris: ["extensor carpi ulnaris"],
  supinator: ["supinator"],
  thenar_muscles: ["abductor pollicis brevis", "flexor pollicis brevis", "opponens pollicis", "thenar"],
  adductor_pollicis: ["adductor pollicis", "oblique head of adductor pollicis", "transverse head of adductor pollicis"],
  hypothenar_muscles: ["abductor digiti minimi", "flexor digiti minimi brevis", "opponens digiti minimi", "hypothenar"],
  lumbricals_interossei: ["lumbrical", "dorsal interosseous", "palmar interosseous", "interossei"],
  gluteus_maximus: ["gluteus maximus"],
  gluteus_medius_minimus: ["gluteus medius", "gluteus minimus"],
  piriformis: ["piriformis"],
  iliopsoas: ["iliopsoas", "psoas major", "psoas minor", "iliacus", "quadratus lumborum"],
  deep_hip_rotators_tfl: ["tensor fasciae latae", "obturator internus", "obturator externus", "superior gemellus", "inferior gemellus", "quadratus femoris", "articularis genus"],
  quadriceps_femoris: ["rectus femoris", "vastus lateralis", "vastus medialis", "vastus intermedius", "quadriceps femoris"],
  sartorius: ["sartorius"],
  adductor_group: ["adductor longus", "adductor brevis", "adductor magnus", "adductor minimus", "pectineus"],
  gracilis: ["gracilis"],
  hamstrings: ["biceps femoris", "semitendinosus", "semimembranosus"],
  tibialis_anterior: ["tibialis anterior", "extensor hallucis longus", "extensor digitorum longus", "fibularis tertius", "peroneus tertius"],
  fibularis_group: ["fibularis longus", "fibularis brevis", "peroneus longus", "peroneus brevis"],
  gastrocnemius: ["gastrocnemius", "medial head of gastrocnemius", "lateral head of gastrocnemius", "plantaris", "triceps surae"],
  soleus: ["soleus"],
  tibialis_posterior: ["tibialis posterior", "flexor hallucis longus", "flexor digitorum longus"],
  popliteus: ["popliteus"],
  intrinsic_foot_muscles: ["extensor digitorum brevis", "extensor hallucis brevis", "abductor hallucis", "flexor digitorum brevis", "abductor digiti minimi of foot", "quadratus plantae", "flexor hallucis brevis", "adductor hallucis", "flexor digiti minimi brevis of foot", "plantar interosseous", "dorsal interosseous of foot", "opponens digiti minimi muscle of foot"],
  diaphragm: ["diaphragm", "lumbar part of diaphragm", "costal part of diaphragm", "sternal part of diaphragm", "central tendon of diaphragm", "crus of diaphragm"],
  intercostals: ["external intercostal", "internal intercostal", "innermost intercostal", "subcostal", "transversus thoracis", "levatores costarum"],
  rectus_abdominis: ["rectus abdominis", "pyramidalis", "tendinous intersection"],
  abdominal_flat_muscles: ["external oblique", "internal oblique", "transversus abdominis", "cremaster"],
  erector_spinae: ["iliocostalis", "longissimus", "spinalis", "erector spinae"],
  suboccipital_deep_back: ["rectus capitis posterior", "obliquus capitis", "splenius capitis", "splenius cervicis", "semispinalis", "multifidus", "rotatores", "interspinales", "intertransversarii"],
  sternocleidomastoid: ["sternocleidomastoid", "platysma"],
  suprahyoid_infrahyoid_scalenes: ["digastric", "stylohyoid", "mylohyoid", "geniohyoid", "sternohyoid", "omohyoid", "sternothyroid", "thyrohyoid", "anterior scalene", "middle scalene", "posterior scalene", "scalene", "longus colli", "longus capitis", "rectus capitis anterior", "rectus capitis lateralis"],
  masseter: ["masseter", "superficial part of masseter", "deep part of masseter"],
  temporalis: ["temporalis", "temporal fascia"],
  pterygoids: ["medial pterygoid", "lateral pterygoid"],
  facial_expression: ["orbicularis oculi", "orbicularis oris", "buccinator", "zygomaticus", "frontalis", "occipitofrontalis", "corrugator supercilii", "procerus", "nasalis", "levator labii", "depressor anguli", "depressor labii", "mentalis", "risorius", "auricularis"],
  synovial_bursae_sheaths: ["bursa", "subtendinous", "subcutaneous", "synovial sheath", "tendinous sheath", "fibrous sheath"],

  // Nervous & Vascular
  cn1: ["olfactory nerve", "olfactory bulb", "olfactory tract", "olfactory stria"],
  cn2: ["optic nerve", "optic chiasm", "optic tract", "lateral geniculate"],
  cn3: ["oculomotor nerve", "ciliary ganglion", "short ciliary"],
  cn4: ["trochlear nerve"],
  cn5: ["trigeminal nerve", "trigeminal ganglion", "ophthalmic nerve", "maxillary nerve", "mandibular nerve", "supraorbital nerve", "infraorbital nerve", "mental nerve", "lingual nerve", "inferior alveolar nerve", "auriculotemporal nerve", "buccal nerve", "nasociliary", "frontal nerve", "lacrimal nerve"],
  cn6: ["abducens nerve"],
  cn7: ["facial nerve", "geniculate ganglion", "greater petrosal", "chorda tympani", "posterior auricular nerve", "temporal branches of facial", "zygomatic branches of facial", "buccal branches of facial", "marginal mandibular", "cervical branch of facial"],
  cn8: ["vestibulocochlear nerve", "cochlear nerve", "vestibular nerve", "spiral ganglion", "vestibular ganglion"],
  cn9: ["glossopharyngeal nerve", "tympanic nerve", "carotid sinus nerve"],
  cn10: ["vagus nerve", "superior laryngeal nerve", "recurrent laryngeal nerve", "esophageal plexus", "anterior vagal trunk", "posterior vagal trunk"],
  cn11: ["accessory nerve", "spinal root of accessory", "cranial root of accessory"],
  cn12: ["hypoglossal nerve"],
  spinal_cord: ["spinal cord", "central canal", "conus medullaris", "cauda equina", "filum terminale", "spinal ganglion", "dorsal root", "ventral root", "anterior root", "posterior root", "spinal nerve"],
  cervical_plexus: ["cervical plexus", "ansa cervicalis", "lesser occipital nerve", "great auricular nerve", "transverse cervical nerve", "supraclavicular nerve", "greater occipital nerve", "third occipital nerve", "suboccipital nerve"],
  phrenic: ["phrenic nerve", "accessory phrenic"],
  brachial_plexus: ["brachial plexus", "superior trunk", "middle trunk", "inferior trunk", "lateral cord", "medial cord", "posterior cord", "dorsal scapular nerve", "long thoracic nerve", "suprascapular nerve", "subscapular nerve", "thoracodorsal nerve", "medial pectoral", "lateral pectoral", "medial cutaneous nerve of arm", "medial cutaneous nerve of forearm"],
  axillary_nerve: ["axillary nerve", "superior lateral cutaneous nerve of arm"],
  radial_nerve: ["radial nerve", "deep branch of radial", "superficial branch of radial", "posterior interosseous nerve", "posterior cutaneous nerve of arm", "posterior cutaneous nerve of forearm", "dorsal digital nerves of radial"],
  musculocutaneous_nerve: ["musculocutaneous nerve", "lateral cutaneous nerve of forearm"],
  median_nerve: ["median nerve", "anterior interosseous nerve", "palmar digital nerves of median", "communicating branch of median nerve with ulnar"],
  ulnar_nerve: ["ulnar nerve", "dorsal branch of ulnar", "deep branch of ulnar", "superficial branch of ulnar", "palmar digital nerves of ulnar"],
  lumbar_plexus: ["lumbar plexus", "iliohypogastric nerve", "ilioinguinal nerve", "genitofemoral nerve", "lateral cutaneous nerve of thigh", "subcostal nerve", "intercostal nerve", "thoracoabdominal"],
  femoral_nerve: ["femoral nerve", "saphenous nerve", "anterior cutaneous branches of femoral", "infrapatellar branch"],
  obturator_nerve: ["obturator nerve", "anterior branch of obturator", "posterior branch of obturator", "accessory obturator"],
  sciatic_nerve: ["sciatic nerve", "sacral plexus", "lumbosacral trunk", "superior gluteal nerve", "inferior gluteal nerve", "posterior cutaneous nerve of thigh", "nerve to quadratus femoris", "nerve to obturator internus", "nerve to piriformis", "perforating cutaneous"],
  tibial_nerve: ["tibial nerve", "medial sural cutaneous", "sural nerve", "medial plantar nerve", "lateral plantar nerve", "medial calcaneal"],
  common_fibular_nerve: ["common fibular nerve", "common peroneal nerve", "superficial fibular nerve", "deep fibular nerve", "lateral sural cutaneous", "dorsal digital nerves of foot"],
  pudendal_nerve: ["pudendal nerve", "inferior rectal nerve", "perineal nerve", "dorsal nerve of penis", "dorsal nerve of clitoris", "posterior scrotal", "posterior labial", "coccygeal plexus", "anococcygeal"],
  autonomic_nervous_system: ["sympathetic trunk", "sympathetic ganglion", "cervical ganglion", "stellate ganglion", "cervicothoracic ganglion", "thoracic ganglia", "lumbar ganglia", "sacral ganglia", "ganglion impar", "greater splanchnic", "lesser splanchnic", "least splanchnic", "lumbar splanchnic", "pelvic splanchnic", "celiac ganglion", "celiac plexus", "superior mesenteric ganglion", "inferior mesenteric ganglion", "aorticorenal", "superior hypogastric", "inferior hypogastric", "ramus communicans"],
  aorta: ["ascending aorta", "aortic arch", "arch of aorta", "descending aorta", "thoracic aorta", "abdominal aorta", "aortic sinus", "posterior intercostal artery", "subcostal artery", "inferior phrenic artery", "lumbar artery", "median sacral artery"],
  common_carotid: ["common carotid artery", "carotid bifurcation", "carotid body", "carotid sinus", "brachiocephalic trunk"],
  external_carotid: ["external carotid artery", "superior thyroid artery", "ascending pharyngeal artery", "lingual artery", "facial artery", "occipital artery", "posterior auricular artery", "superficial temporal artery", "maxillary artery", "middle meningeal artery", "inferior alveolar artery", "infraorbital artery", "sphenopalatine artery", "angular artery", "submental artery", "labial artery"],
  internal_carotid: ["internal carotid artery", "ophthalmic artery", "central retinal artery", "supraorbital artery", "supratrochlear artery", "ethmoidal artery", "lacrimal artery", "ciliary artery"],
  vertebral_artery: ["vertebral artery", "basilar artery", "pontine arteries", "labyrinthine artery", "anterior spinal artery", "posterior spinal artery"],
  profunda_brachii: ["profunda brachii", "profundo brachii", "deep brachial artery", "arteria profunda brachii", "deep artery of arm"],
  radial_collateral_artery: ["radial collateral artery", "arteria collateralis radialis", "anterior descending branch of profunda brachii"],
  middle_collateral_artery: ["middle collateral artery", "arteria collateralis media", "posterior descending branch of profunda brachii"],
  brachial_artery: ["brachial artery", "arteria brachialis"],
  elbow_anastomosis_collaterals: ["superior ulnar collateral", "inferior ulnar collateral", "supratrochlear artery", "ulnar recurrent artery", "radial recurrent artery", "recurrent interosseous artery", "posterior interosseous recurrent", "arteria interossea recurrens", "anastomosis around elbow"],
  radial_ulnar_arteries: ["radial artery", "ulnar artery", "common interosseous artery", "anterior interosseous artery", "posterior interosseous artery", "dorsal carpal branch", "palmar carpal branch"],
  subclavian_axillary_brachial: ["subclavian artery", "internal thoracic artery", "internal mammary", "thyrocervical trunk", "inferior thyroid artery", "suprascapular artery", "transverse cervical artery", "costocervical trunk", "dorsal scapular artery", "axillary artery", "thoracoacromial artery", "thoraco-acromial artery", "pectoral branches of thoraco-acromial", "lateral thoracic artery", "subscapular artery", "circumflex scapular", "thoracodorsal artery", "anterior circumflex humeral", "posterior circumflex humeral", "humeral circumflex artery"],
  profunda_femoris: ["profunda femoris", "profundo femoris", "deep femoral artery", "arteria profunda femoris", "deep artery of thigh", "lateral circumflex femoral", "medial circumflex femoral", "descending branch of lateral circumflex femoral", "perforating femoral arteries"],
  hand_arches: ["superficial palmar arch", "deep palmar arch", "palmar digital artery", "palmar metacarpal artery", "dorsal carpal", "princeps pollicis", "radialis indicis"],
  coronary_arteries: ["right coronary artery", "left coronary artery", "anterior interventricular", "posterior interventricular", "circumflex branch of left coronary", "marginal branch", "conus branch", "sinuatrial nodal"],
  coeliac_sma_ima: ["celiac trunk", "coeliac trunk", "left gastric artery", "splenic artery", "common hepatic artery", "proper hepatic artery", "gastroduodenal artery", "gastroepiploic", "gastroomental", "pancreaticoduodenal", "right gastric", "cystic artery", "superior mesenteric artery", "jejunal arteries", "ileal arteries", "ileocolic artery", "appendicular artery", "right colic artery", "middle colic artery", "inferior mesenteric artery", "left colic artery", "sigmoid arteries", "superior rectal artery", "marginal artery of colon"],
  iliac_femoral: ["common iliac artery", "external iliac artery", "internal iliac artery", "umbilical artery", "obturator artery", "superior vesical", "inferior vesical", "uterine artery", "vaginal artery", "middle rectal", "internal pudendal artery", "inferior gluteal artery", "superior gluteal artery", "iliolumbar", "lateral sacral", "femoral artery", "profunda femoris", "deep artery of thigh", "circumflex femoral", "perforating artery", "descending genicular", "popliteal artery", "genicular artery", "anterior tibial artery", "posterior tibial artery", "fibular artery", "peroneal artery", "dorsalis pedis", "arcuate artery", "plantar artery", "plantar arch", "metatarsal artery", "digital artery of foot", "epigastric artery", "circumflex iliac"],
  svc_ivc: ["superior vena cava", "inferior vena cava", "brachiocephalic vein", "internal jugular vein", "external jugular vein", "anterior jugular", "subclavian vein", "axillary vein", "brachial vein", "cephalic vein", "basilic vein", "median cubital vein", "radial vein", "ulnar vein", "palmar venous", "dorsal venous network", "common iliac vein", "external iliac vein", "internal iliac vein", "femoral vein", "deep femoral vein", "popliteal vein", "tibial vein", "fibular vein", "renal vein", "suprarenal vein", "testicular vein", "ovarian vein", "pampiniform", "hepatic vein", "lumbar vein", "phrenic vein", "facial vein", "retromandibular vein", "lingual vein", "thyroid vein", "ophthalmic vein", "emissary vein", "diploic", "vertebral vein", "intercostal vein", "internal thoracic vein", "epigastric vein", "pudendal vein", "gluteal vein", "obturator vein", "vesical venous", "prostatic venous", "uterine venous", "rectal vein"],
  azygos_system: ["azygos vein", "hemiazygos vein", "accessory hemiazygos", "ascending lumbar vein", "superior intercostal vein", "posterior intercostal vein"],
  portal_system: ["hepatic portal vein", "portal vein", "splenic vein", "superior mesenteric vein", "inferior mesenteric vein", "left gastric vein", "right gastric vein", "cystic vein", "paraumbilical"],
  saphenous_veins: ["great saphenous vein", "small saphenous vein", "accessory saphenous", "dorsal venous arch of foot"],
  dural_venous_sinuses: ["superior sagittal sinus", "inferior sagittal sinus", "straight sinus", "transverse sinus", "sigmoid sinus", "confluence of sinuses", "cavernous sinus", "intercavernous", "superior petrosal sinus", "inferior petrosal sinus", "sphenoparietal sinus", "occipital sinus", "basilar plexus", "cerebral vein", "great cerebral vein", "basal vein", "thalamostriate vein", "choroid vein"],

  // Skeletal & Articular
  skeleton_overview: ["periosteum", "bone marrow", "endosteum"],
  skull_bones_sutures: ["frontal bone", "parietal bone", "occipital bone", "temporal bone", "sphenoid bone", "ethmoid bone", "coronal suture", "sagittal suture", "lambdoid suture", "squamous suture", "pterion", "calvaria", "external occipital protuberance", "mastoid process", "styloid process", "zygomatic process"],
  fontanelles: ["anterior fontanelle", "posterior fontanelle", "sphenoidal fontanelle", "mastoid fontanelle", "bregma", "lambda"],
  skull_base_foramina: ["foramen magnum", "jugular foramen", "carotid canal", "foramen ovale", "foramen spinosum", "foramen rotundum", "foramen lacerum", "internal acoustic meatus", "hypoglossal canal", "stylomastoid foramen", "cribriform plate"],
  orbit: ["orbit", "superior orbital fissure", "inferior orbital fissure", "optic canal", "lacrimal bone", "orbital plate"],
  mandible_facial_bones: ["mandible", "maxilla", "zygomatic bone", "nasal bone", "vomer", "palatine bone", "inferior nasal concha", "hyoid bone", "tooth", "incisor", "canine", "premolar", "molar", "dental", "ramus of mandible", "body of mandible", "condylar process", "coronoid process"],
  vertebral_column: ["vertebral column", "intervertebral foramen", "vertebral canal"],
  cervical_vertebrae: ["atlas", "axis", "cervical vertebra", "dens", "odontoid", "vertebra prominens"],
  thoracic_lumbar_vertebrae: ["thoracic vertebra", "lumbar vertebra", "pedicle", "lamina", "spinous process", "transverse process", "articular process"],
  intervertebral_disc: ["intervertebral disc", "anulus fibrosus", "nucleus pulposus"],
  sacrum_coccyx: ["sacrum", "coccyx", "sacral promontory", "sacral hiatus", "sacral canal"],
  sternum: ["sternum", "manubrium", "body of sternum", "xiphoid process", "sternal angle", "jugular notch"],
  ribs: ["rib", "costal cartilage", "first rib", "second rib", "floating rib", "costochondral"],
  clavicle_scapula: ["clavicle", "scapula", "acromion", "coracoid process", "glenoid cavity", "spine of scapula", "subscapular fossa", "supraspinous fossa", "infraspinous fossa"],
  humerus: ["humerus", "head of humerus", "greater tubercle", "lesser tubercle", "surgical neck", "deltoid tuberosity", "radial groove", "medial epicondyle", "lateral epicondyle", "trochlea of humerus", "capitulum", "olecranon fossa", "coronoid fossa"],
  radius_ulna: ["radius", "ulna", "olecranon", "coronoid process of ulna", "radial head", "radial tuberosity", "styloid process of radius", "styloid process of ulna", "interosseous membrane of forearm"],
  carpal_bones: ["scaphoid", "lunate", "triquetrum", "pisiform", "trapezium", "trapezoid", "capitate", "hamate", "carpal"],
  hand_bones: ["metacarpal", "phalanx of hand", "proximal phalanx", "middle phalanx", "distal phalanx", "sesamoid"],
  pelvis: ["hip bone", "ilium", "ischium", "pubis", "acetabulum", "iliac crest", "anterior superior iliac spine", "ischial tuberosity", "ischial spine", "obturator foramen", "pelvic brim", "pubic tubercle"],
  femur: ["femur", "head of femur", "neck of femur", "greater trochanter", "lesser trochanter", "intertrochanteric", "linea aspera", "medial condyle of femur", "lateral condyle of femur", "intercondylar fossa", "adductor tubercle"],
  patella_tibia_fibula: ["patella", "tibia", "fibula", "tibial plateau", "tibial tuberosity", "medial malleolus", "lateral malleolus", "interosseous membrane of leg", "soleal line"],
  tarsals_foot: ["talus", "calcaneus", "navicular", "cuboid", "medial cuneiform", "intermediate cuneiform", "lateral cuneiform", "cuneiform", "metatarsal", "phalanx of foot", "sustentaculum tali"],
  joint_classification: ["synovial joint", "fibrous joint", "cartilaginous joint", "joint capsule", "articular capsule", "frenula capsulae", "Capsular frenula"],
  tmj: ["temporomandibular joint", "articular disc of temporomandibular", "sphenomandibular ligament", "stylomandibular ligament", "lateral ligament of temporomandibular"],
  atlantoaxial: ["atlanto-occipital", "atlantoaxial", "atlanto-axial", "cruciate ligament of atlas", "transverse ligament of atlas", "alar ligament", "apical ligament", "tectorial membrane", "anterior atlanto-occipital", "posterior atlanto-occipital"],
  shoulder_joint: ["glenohumeral", "shoulder joint", "glenoid labrum", "coracohumeral ligament", "glenohumeral ligament", "transverse humeral ligament", "coracoacromial ligament"],
  ac_sc_joints: ["acromioclavicular", "sternoclavicular", "coracoclavicular", "conoid ligament", "trapezoid ligament", "costoclavicular ligament", "interclavicular ligament"],
  elbow_joint: ["elbow joint", "humeroulnar", "humeroradial", "proximal radioulnar", "annular ligament of radius", "ulnar collateral ligament of elbow", "radial collateral ligament of elbow", "quadrate ligament"],
  wrist_joint: ["radiocarpal", "wrist joint", "distal radioulnar", "triangular fibrocartilage", "intercarpal", "carpometacarpal", "metacarpophalangeal", "interphalangeal joint of hand", "palmar radiocarpal", "dorsal radiocarpal", "ulnar collateral ligament of wrist", "radial collateral ligament of wrist", "pisohamate", "pisometacarpal", "deep transverse metacarpal"],
  hip_joint: ["hip joint", "coxal joint", "iliofemoral ligament", "pubofemoral ligament", "ischiofemoral ligament", "ligament of head of femur", "acetabular labrum", "transverse acetabular ligament", "zona orbicularis"],
  knee_joint: ["knee joint", "medial meniscus", "lateral meniscus", "anterior cruciate ligament", "posterior cruciate ligament", "tibial collateral ligament", "fibular collateral ligament", "patellar ligament", "oblique popliteal ligament", "arcuate popliteal ligament", "transverse ligament of knee", "posterior meniscofemoral", "anterior meniscofemoral", "coronary ligament of knee"],
  ankle_joint: ["ankle joint", "talocrural", "deltoid ligament", "medial ligament of ankle", "anterior talofibular", "posterior talofibular", "calcaneofibular", "tibiofibular syndesmosis", "anterior tibiofibular", "posterior tibiofibular"],
  subtalar_foot_joints: ["subtalar", "talocalcaneal", "talocalcaneonavicular", "calcaneocuboid", "plantar calcaneonavicular", "spring ligament", "long plantar ligament", "short plantar ligament", "plantar calcaneocuboid", "bifurcate ligament", "cuneonavicular", "cuboidonavicular", "intercuneiform", "tarsometatarsal", "intermetatarsal", "metatarsophalangeal", "interphalangeal joint of foot", "plantar ligament", "dorsal tarsometatarsal", "dorsal cuneonavicular"],
  vertebral_joints: ["anterior longitudinal ligament", "posterior longitudinal ligament", "ligamentum flavum", "flaval ligament", "supraspinous ligament", "interspinous ligament", "intertransverse ligament", "nuchal ligament", "ligamentum nuchae", "zygapophyseal", "costovertebral", "costotransverse", "radiate ligament of head of rib", "sternocostal", "interchondral"],
  sacroiliac_symphysis: ["sacroiliac", "pubic symphysis", "sacrotuberous ligament", "sacrospinous ligament", "iliolumbar ligament", "anterior sacroiliac", "posterior sacroiliac", "interosseous sacroiliac", "superior pubic ligament", "inferior pubic ligament", "obturator membrane", "inguinal ligament", "lacunar ligament", "pectineal ligament"],

  // Heart & Respiratory
  mediastinum: ["mediastinum"],
  pericardium: ["pericardium", "fibrous pericardium", "serous pericardium"],
  heart_surface: ["heart", "myocardium", "epicardium", "endocardium", "interventricular septum", "interatrial septum", "trabeculae carneae"],
  right_atrium: ["right atrium", "right auricle", "crista terminalis", "fossa ovalis", "pectinate muscles", "coronary sinus"],
  right_ventricle: ["right ventricle", "conus arteriosus", "infundibulum", "moderator band", "septomarginal trabecula", "papillary muscle of right ventricle"],
  left_atrium: ["left atrium", "left auricle"],
  left_ventricle: ["left ventricle", "papillary muscle of left ventricle"],
  heart_valves: ["aortic valve", "mitral valve", "tricuspid valve", "pulmonary valve", "chordae tendineae", "cusp of", "semilunar"],
  conduction_system: ["sinuatrial node", "atrioventricular node", "atrioventricular bundle", "bundle of his", "purkinje"],
  coronary_circulation: ["great cardiac vein", "middle cardiac vein", "small cardiac vein", "posterior vein of left ventricle", "inferior vein of left ventricle", "oblique vein of left atrium", "anterior cardiac vein"],
  cardiac_innervation: ["cardiac plexus"],
  fetal_circulation: ["ligamentum arteriosum", "ligamentum venosum", "round ligament of liver", "ligamentum teres hepatis", "medial umbilical ligament"],
  tetralogy_fallot: ["membranous part of interventricular septum"],
  great_vessels_thorax: ["pulmonary trunk", "right pulmonary artery", "left pulmonary artery", "superior pulmonary vein", "inferior pulmonary vein"],
  nose_sinuses: ["nasal cavity", "nasal septum", "nasal cartilage", "alar cartilage", "frontal sinus", "maxillary sinus", "sphenoidal sinus", "ethmoidal cells"],
  pharynx: ["pharynx", "nasopharynx", "oropharynx", "laryngopharynx", "superior pharyngeal constrictor", "middle pharyngeal constrictor", "inferior pharyngeal constrictor", "stylopharyngeus", "salpingopharyngeus", "palatopharyngeus", "soft palate", "uvula", "levator veli palatini", "tensor veli palatini"],
  larynx: ["larynx", "thyroid cartilage", "cricoid cartilage", "arytenoid cartilage", "epiglottis", "corniculate cartilage", "cuneiform cartilage", "thyrohyoid membrane", "cricothyroid ligament", "cricothyroid muscle", "posterior cricoarytenoid", "lateral cricoarytenoid", "transverse arytenoid", "oblique arytenoid", "thyroarytenoid", "vocalis", "vocal fold", "vestibular fold", "glottis"],
  trachea: ["trachea", "tracheal cartilage", "carina", "trachealis"],
  bronchi: ["main bronchus", "right main bronchus", "left main bronchus", "principal bronchus"],
  bronchial_tree: ["lobar bronchus", "segmental bronchus", "bronchus", "bronchiole", "anteromedial basal"],
  lungs: ["right lung", "left lung", "superior lobe of", "middle lobe of", "inferior lobe of", "apex of lung", "base of lung", "lingula", "oblique fissure", "horizontal fissure", "hilum of lung"],
  pleura: ["pleura", "parietal pleura", "visceral pleura", "costodiaphragmatic", "pleural cavity"],
  pulmonary_vessels: ["bronchial artery", "bronchial vein"],

  // Digestive & Renal
  tongue_salivary: ["tongue", "genioglossus", "hyoglossus", "styloglossus", "palatoglossus", "intrinsic muscle of tongue", "longitudinal muscle of tongue", "transverse muscle of tongue", "vertical muscle of tongue", "parotid gland", "accessory parotid gland", "parotid duct", "submandibular gland", "submandibular duct", "sublingual gland"],
  oesophagus: ["esophagus", "oesophagus", "esophageal"],
  peritoneum_omenta: ["peritoneum", "greater omentum", "lesser omentum", "mesentery", "mesocolon", "falciform ligament", "coronary ligament of liver", "triangular ligament", "hepatoduodenal", "hepatogastric"],
  stomach: ["stomach", "cardia", "fundus of stomach", "body of stomach", "pyloric", "pylorus", "lesser curvature", "greater curvature"],
  duodenum: ["duodenum", "superior part of duodenum", "descending part of duodenum", "horizontal part of duodenum", "ascending part of duodenum", "duodenojejunal", "suspensory muscle of duodenum"],
  jejunum_ileum: ["jejunum", "ileum", "small intestine", "ileocecal"],
  caecum_appendix: ["cecum", "caecum", "appendix", "vermiform appendix"],
  colon: ["ascending colon", "transverse colon", "descending colon", "sigmoid colon", "colon", "right colic flexure", "left colic flexure", "taenia coli", "haustra"],
  rectum_anal_canal: ["rectum", "anal canal", "external anal sphincter", "internal anal sphincter", "anorectal"],
  liver: ["liver", "right lobe of liver", "left lobe of liver", "caudate lobe", "quadrate lobe", "porta hepatis", "bare area"],
  gallbladder_biliary: ["gallbladder", "cystic duct", "common hepatic duct", "right hepatic duct", "left hepatic duct", "bile duct", "common bile duct", "hepatopancreatic ampulla", "sphincter of oddi"],
  pancreas: ["pancreas", "head of pancreas", "uncinate process", "neck of pancreas", "body of pancreas", "tail of pancreas", "pancreatic duct", "accessory pancreatic duct"],
  kidney_position_relations: ["kidney", "right kidney", "left kidney", "renal capsule", "fibrous capsule of kidney", "perirenal fat", "renal fascia", "hilum of kidney"],
  kidney_internal_structure: ["renal cortex", "renal medulla", "renal pyramid", "renal papilla", "renal column", "renal lobe", "major calyx", "minor calyx", "renal pelvis", "renal sinus", "outer stripe", "inner stripe", "inner zone"],
  renal_vasculature: ["renal artery", "segmental renal", "interlobar artery", "arcuate artery of kidney"],
  ureter: ["ureter", "right ureter", "left ureter"],
  bladder: ["urinary bladder", "detrusor", "trigone of bladder", "apex of bladder", "fundus of bladder", "neck of bladder", "median umbilical ligament"],
  urethra: ["urethra", "prostatic urethra", "membranous urethra", "spongy urethra", "external urethral sphincter", "internal urethral sphincter"],

  // Repro, Endo, Lymph, Skin
  testis_epididymis: ["testis", "epididymis", "tunica vaginalis", "tunica albuginea", "appendix of testis", "scrotum", "dartos"],
  spermatic_cord: ["spermatic cord", "ductus deferens", "vas deferens", "ampulla of ductus deferens", "ejaculatory duct", "cremasteric fascia", "internal spermatic fascia", "external spermatic fascia"],
  prostate_seminal: ["prostate", "seminal vesicle", "seminal gland", "bulbourethral gland"],
  penis: ["penis", "corpus cavernosum", "corpus spongiosum", "bulb of penis", "crus of penis", "glans penis", "prepuce", "suspensory ligament of penis"],
  uterus: ["uterus", "cervix of uterus", "body of uterus", "fundus of uterus", "endometrium", "myometrium", "parametrium", "broad ligament", "round ligament of uterus", "uterosacral ligament", "cardinal ligament", "transverse cervical ligament"],
  tubes_ovaries: ["uterine tube", "fallopian tube", "infundibulum of uterine tube", "fimbriae", "ampulla of uterine tube", "isthmus of uterine tube", "ovary", "ovarian ligament", "suspensory ligament of ovary", "mesosalpinx", "mesovarium"],
  vagina: ["vagina", "vaginal", "vestibule of vagina", "clitoris", "crus of clitoris", "bulb of vestibule", "greater vestibular gland", "labium majus", "labium minus", "mons pubis", "hymen"],
  pelvic_floor_perineum: ["levator ani", "puborectalis", "pubococcygeus", "iliococcygeus", "coccygeus", "ischiococcygeus", "perineal body", "superficial transverse perineal", "deep transverse perineal", "bulbospongiosus", "ischiocavernosus", "perineal membrane", "urogenital region", "anal region"],
  pituitary: ["pituitary gland", "hypophysis", "adenohypophysis", "neurohypophysis", "infundibulum of pituitary"],
  pineal: ["pineal gland", "pineal body"],
  thyroid: ["thyroid gland", "right lobe of thyroid", "left lobe of thyroid", "isthmus of thyroid", "pyramidal lobe"],
  parathyroid: ["parathyroid gland", "superior parathyroid", "inferior parathyroid"],
  adrenal: ["suprarenal gland", "adrenal gland", "right suprarenal", "left suprarenal", "adrenal cortex", "adrenal medulla"],
  lymphatic_overview: ["thoracic duct", "cisterna chyli", "right lymphatic duct", "jugular trunk", "subclavian trunk", "bronchomediastinal trunk", "lumbar trunk", "intestinal trunk", "lymphatic vessel"],
  head_neck_nodes: ["submental node", "submandibular node", "parotid node", "preauricular", "mastoid node", "occipital node", "facial node", "buccal node", "lingual node", "retropharyngeal node", "anterior cervical node", "lateral cervical node", "jugulodigastric", "jugulo-omohyoid", "deep cervical node", "superficial cervical node", "supraclavicular node"],
  axillary_nodes: ["axillary lymph node", "apical axillary", "central axillary", "lateral axillary", "pectoral node", "subscapular node", "interpectoral"],
  inguinal_pelvic_nodes: ["superficial inguinal node", "deep inguinal node", "lacunar node", "cloquet"],
  spleen: ["spleen", "splenic"],
  thymus: ["thymus"],
  tonsils_malt: ["palatine tonsil", "pharyngeal tonsil", "lingual tonsil", "tubal tonsil", "aggregated lymphoid"],
  skin_layers: ["skin", "epidermis", "dermis", "subcutaneous tissue", "hypodermis", "cutis"],
  skin_appendages: ["hairs of head", "eyelashes", "hairs of eyebrow", "eyebrow", "pubic hairs", "nail plate", "perionyx", "nail bed", "hair", "sebaceous", "sweat gland"],
  dermatomes: ["umbilicus", "umbilical region"],
  breast_structure: ["mammary gland", "mammary region", "inframammary region", "breast", "nipple", "areola", "lactiferous", "suspensory ligaments of breast"],

  // Brain & Senses
  meninges: ["dura mater", "falx cerebri", "tentorium cerebelli", "falx cerebelli", "diaphragma sellae", "arachnoid", "pia mater", "choroid plexus"],
  ventricles_csf: ["lateral ventricle", "third ventricle", "fourth ventricle", "cerebral aqueduct", "interventricular foramen", "septum pellucidum"],
  cerebral_cortex_lobes: ["frontal lobe", "parietal lobe", "temporal lobe", "occipital lobe", "insula", "insular", "precentral gyrus", "postcentral gyrus", "frontal gyrus", "temporal gyrus", "parietal lobule", "supramarginal", "angular gyrus", "occipital gyrus", "occipitotemporal", "fusiform gyrus", "cuneus", "precuneus", "lingual gyrus", "paracentral", "straight gyrus", "gyrus rectus", "orbital gyri", "orbital sulci", "central sulcus", "lateral sulcus", "precentral sulcus", "postcentral sulcus", "frontal sulcus", "temporal sulcus", "intraparietal sulcus", "parieto-occipital", "calcarine", "collateral sulcus", "occipitotemporal sulcus", "lunate sulcus", "transverse frontopolar", "anterior occipital sulcus", "sulcus interm", "operculum", "corpus callosum", "anterior commissure", "posterior commissure"],
  basal_ganglia: ["caudate nucleus", "putamen", "globus pallidus", "lentiform nucleus", "striatum", "claustrum", "substantia nigra", "subthalamic nucleus", "nucleus accumbens"],
  thalamus_hypothalamus: ["thalamus", "hypothalamus", "epithalamus", "metathalamus", "medial geniculate", "mammillary body", "tuber cinereum", "optic recess", "subthalamus", "habenula", "stria medullaris"],
  internal_capsule: ["internal capsule", "corona radiata", "external capsule", "extreme capsule", "cerebral peduncle"],
  limbic_system: ["hippocampus", "dentate gyrus", "fornix", "amygdala", "amygdaloid", "cingulate gyrus", "cingulate sulcus", "parahippocampal", "uncus", "septal nuclei", "stria terminalis", "inducium griseum"],
  brainstem: ["midbrain", "mesencephalon", "pons", "medulla oblongata", "superior colliculus", "inferior colliculus", "tectum", "tegmentum", "red nucleus", "olive", "pyramid of medulla", "gracile tubercle", "cuneate tubercle", "rhomboid fossa", "cerebellar peduncle"],
  cerebellum: ["cerebellum", "cerebellar hemisphere", "vermis of cerebellum", "flocculonodular", "flocculus", "nodulus", "tonsil of cerebellum", "dentate nucleus", "fastigial", "interposed", "globose", "emboliform", "arbor vitae"],
  spinal_tracts: ["fasciculus gracilis", "fasciculus cuneatus", "spinothalamic", "corticospinal", "dorsal column", "anterior funiculus", "lateral funiculus", "posterior funiculus"],
  circle_of_willis: ["anterior cerebral artery", "middle cerebral artery", "posterior cerebral artery", "anterior communicating artery", "posterior communicating artery", "superior cerebellar artery", "anterior inferior cerebellar", "posterior inferior cerebellar", "striate branches", "artery of central sulcus", "artery of precentral sulcus", "branch to angular gyrus", "frontobasal artery", "prefrontal artery", "posterior parietal artery", "temporal branch", "temporo-occipital branch", "choroidal artery", "pericallosal", "callosomarginal"],
  visual_pathway: ["optic radiation"],
  eye_structure: ["eyeball", "sclera", "cornea", "choroid", "ciliary body", "iris", "pupil", "lens", "retina", "vitreous", "anterior chamber", "posterior chamber", "conjunctiva"],
  extraocular_muscles: ["superior rectus", "inferior rectus", "medial rectus", "lateral rectus", "superior oblique", "inferior oblique", "levator palpebrae superioris", "orbitalis", "tarsus", "palpebral", "eyelid", "suspensory ligament of eyeball", "periorbita"],
  lacrimal_system: ["lacrimal gland", "lacrimal sac", "nasolacrimal duct", "lacrimal canaliculus", "lacrimal caruncle"],
  external_ear: ["auricle", "external acoustic meatus", "tympanic membrane", "helix", "antihelix", "tragus", "antitragus", "concha", "cymba conchae", "cavity of concha", "lobule of auricle", "scapha", "triangular fossa", "fossa antihelica", "intertragic", "anterior notch of auricle", "apex of auricle", "crura of antihelix", "eminentia conchae", "eminentia scaphae", "eminentia fossae", "auricular tubercle", "posterior auricular groove", "auricular cartilage"],
  middle_ear: ["malleus", "incus", "stapes", "tympanic cavity", "pharyngotympanic tube", "auditory tube", "eustachian", "tensor tympani", "stapedius", "mastoid antrum"],
  inner_ear: ["cochlea", "semicircular canal", "semicircular duct", "vestibule of ear", "utricle", "saccule", "bony labyrinth", "membranous labyrinth", "endolymphatic"],

  // Regional & Tendons
  abdominal_regions_planes: ["epigastric region", "hypochondriac region", "lumbar region", "lateral region of abdomen", "inguinal region", "hypogastric region"],
  vertebral_level_landmarks: ["vertebral region", "sacral region", "presternal region", "pectoral region", "lateral region of thorax", "infrascapular region", "interscapular region", "scapular region"],
  anterior_neck_triangle: ["carotid triangle", "submandibular triangle", "submental triangle", "muscular triangle", "sternocleidomastoid region"],
  posterior_neck_triangle: ["lateral region of neck", "posterior region of neck", "greater supraclavicular fossa", "lesser supraclavicular fossa"],
  scalp_face_landmarks: ["frontal region", "parietal region", "occipital region", "temporal region", "mastoid region", "auricular region", "orbital region", "infra-orbital region", "nasal region", "oral region", "mentolabial", "nasolabial", "philtrum", "labial commissure", "angle of mouth", "tubercle of upper lip", "buccal region", "parotideomasseteric", "zygomatic region", "mental region"],
  axilla: ["axillary region", "axillary fossa", "infraclavicular fossa", "deltopectoral triangle", "deltoid region", "triangle of auscultation"],
  cubital_fossa: ["cubital fossa", "anterior region of elbow", "posterior region of elbow", "anterior region of arm", "posterior region of arm", "lateral bicipital groove", "medial bicipital groove"],
  anatomical_snuffbox: ["radial foveola", "anterior region of forearm", "posterior region of forearm", "lateral border of forearm", "medial border of forearm", "anterior region of wrist", "posterior region of wrist", "palm", "dorsum of hand", "dorsal surfaces of digits of hand", "palmar surfaces of digits of hand"],
  gluteal_foramina: ["gluteal region", "gluteal fold", "hip region"],
  femoral_triangle: ["femoral triangle", "anterior region of thigh", "posterior region of thigh"],
  popliteal_fossa: ["popliteal fossa", "anterior region of knee", "posterior region of knee", "anterior region of leg", "posterior region of leg", "anterior region of ankle", "lateral retromalleolar", "medial retromalleolar", "heel region", "dorsum of foot", "sole", "metatarsal region", "dorsal surfaces of digits of foot", "plantar surfaces of digits of foot", "lateral border of foot", "medial border of foot", "hallucial eminence", "arch of foot"],
  carpal_tunnel: ["flexor retinaculum of hand", "carpal tunnel"],
  extensor_compartments: ["extensor retinaculum of hand", "dorsal carpal ligament"],
  hand_flexor_fascia: ["palmar aponeurosis", "annular part of fibrous", "cruciate part of fibrous"],
  quadriceps_patellar_tendon: ["iliotibial tract", "fascia lata"],
  achilles_ankle_tendons: ["calcaneal tendon", "achilles", "flexor retinaculum of foot", "superior extensor retinaculum", "inferior extensor retinaculum", "fibular retinaculum", "plantar aponeurosis"],
  rectus_sheath: ["rectus sheath", "linea alba", "linea semilunaris"],
  cervical_fascia: ["investing layer of cervical fascia", "pretracheal", "prevertebral fascia", "buccopharyngeal"],
  limb_compartments: ["crural fascia", "antebrachial fascia", "brachial fascia", "intermuscular septum"],
};

const STOP = new Set([
  "the",
  "of",
  "and",
  "left",
  "right",
  "muscle",
  "muscles",
  "group",
  "part",
  "insertion",
  "origin",
  "node",
  "nodes",
  "lymph",
  "lymphatic",
  "vein",
  "veins",
  "artery",
  "arteries",
  "nerve",
  "nerves",
  "branch",
  "branches",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ") // drop parenthetical abbreviations
    .replace(/[^a-z\u00C0-\u024F]+/g, " ") // keep letters only (drops .L / _02 / digits)
    .split(" ")
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

const CANDIDATES: { id: string; sets: string[][]; rawAliases: string[] }[] = ALL_KNOWLEDGE.map((e) => {
  const names = [e.name_en, ...(MESH_ALIASES[e.id] ?? [])];
  return {
    id: e.id,
    sets: names.map(tokens).filter((t) => t.length > 0),
    rawAliases: names.map((n) => n.toLowerCase()),
  };
});

// Fast keyword fallback rules for specialized Z-Anatomy nodes (e.g. muscular insertions, small branches, regional surfaces)
const KEYWORD_FALLBACKS: [RegExp, string][] = [
  [/\bbursa\b|\bsheath\b/i, "synovial_bursae_sheaths"],
  [/\bpleura\b/i, "pleura"],
  [/\bbronch/i, "bronchial_tree"],
  [/\blung\b|\bpulmon/i, "lungs"],
  [/\blaryn|\bthyroid cartilage|\bcricoid|\barytenoid|\bepiglott|\bvocal/i, "larynx"],
  [/\bpharyn|\bpalat|\buvula/i, "pharynx"],
  [/\btrachea/i, "trachea"],
  [/\bnasal|\bsinus|\bconcha/i, "nose_sinuses"],
  [/\batrium|\bauricle of/i, "right_atrium"],
  [/\bventricle of heart|\bpapillary muscle|\btrabecul|\bmoderator/i, "left_ventricle"],
  [/\bvalve|\bchordae tendineae|\bcusp/i, "heart_valves"],
  [/\bcoronary|\bcardiac vein/i, "coronary_circulation"],
  [/\bpericardi/i, "pericardium"],
  [/\bgyrus|\bsulcus|\blobule|\blobe of cerebr|\binsula|\bopercul|\bcallos|\bcommissure/i, "cerebral_cortex_lobes"],
  [/\bcaudate|\bputamen|\bpallidus|\bstriat|\bclaustrum|\bsubstantia nigra/i, "basal_ganglia"],
  [/\bthalam|\bhypothalam|\bgeniculate|\bmammillary|\bhabenul|\bpineal/i, "thalamus_hypothalamus"],
  [/\bhippocamp|\bfornix|\bamygdal|\bcingulat|\bparahippocamp|\buncus|\bdentate gyrus/i, "limbic_system"],
  [/\bcerebell|\bvermis|\bfloccul/i, "cerebellum"],
  [/\bpons\b|\bmedulla|\bmidbrain|\bmesencephal|\bcollicul|\bolive\b|\bpeduncle/i, "brainstem"],
  [/\bventricle|\bchoroid plexus|\baqueduct|\bseptum pellucidum/i, "ventricles_csf"],
  [/\bdura\b|\bfalx|\btentorium|\barachnoid|\bpia\b/i, "meninges"],
  [/\bspinal cord|\bfuniculus|\bfasciculus|\bconus|\bcauda equina|\bfilum|\bcentral canal/i, "spinal_cord"],
  [/\bsympathetic|\bsplanchnic|\bceliac|\bhypogastric|\bautonomic|\bganglion impar/i, "autonomic_nervous_system"],
  [/\beyeball|\bsclera|\bcornea|\bretina|\blens\b|\biris\b|\bciliary|\bchoroid/i, "eye_structure"],
  [/\brectus\b.*\beye|\boblique\b.*\beye|\bpalpebr|\btarsal|\bconjunctiv/i, "extraocular_muscles"],
  [/\blacrimal/i, "lacrimal_system"],
  [/\bcochlea|\bsemicircular|\bvestibul|\blabyrinth|\butricle|\bsaccule/i, "inner_ear"],
  [/\bmalleus|\bincus|\bstapes|\btympan|\bauditory tube|\bmastoid/i, "middle_ear"],
  [/\bauricl|\bhelix|\btragus|\bconcha|\blobule of auricle|\bscapha/i, "external_ear"],
  [/\bliver|\bhepat/i, "liver"],
  [/\bgallbladder|\bbile|\bcystic duct/i, "gallbladder_biliary"],
  [/\bpancrea/i, "pancreas"],
  [/\bstomach|\bgastric|\bpylor/i, "stomach"],
  [/\bduoden/i, "duodenum"],
  [/\bjejun|\bileum|\bmesenter/i, "jejunum_ileum"],
  [/\bcecum|\bcaecum|\bappendi/i, "caecum_appendix"],
  [/\bcolon|\bcolic|\bsigmoid/i, "colon"],
  [/\brectum|\brectal|\banal\b|\banus/i, "rectum_anal_canal"],
  [/\besophag|\boesophag/i, "oesophagus"],
  [/\btongue|\bgloss|\bparotid|\bsubmandibular|\bsublingual|\bsalivar/i, "tongue_salivary"],
  [/\boment|\bperitone/i, "peritoneum_omenta"],
  [/\bkidney|\brenal cortex|\brenal medulla|\brenal pyramid|\brenal papilla|\brenal column|\brenal lobe|\bcalyx|\brenal pelvis|\bouter stripe|\binner stripe|\binner zone/i, "kidney_internal_structure"],
  [/\bureter/i, "ureter"],
  [/\bbladder|\bdetrusor|\btrigone|\burach/i, "bladder"],
  [/\burethra/i, "urethra"],
  [/\btestis|\bepididym|\bscrot|\btunica vaginalis/i, "testis_epididymis"],
  [/\bductus deferens|\bvas deferens|\bspermatic|\bejaculatory/i, "spermatic_cord"],
  [/\bprostat|\bseminal|\bbulbourethral/i, "prostate_seminal"],
  [/\bpenis|\bcavernos|\bspongios|\bglans/i, "penis"],
  [/\buterus|\buterin|\bcervix|\bround ligament of uterus|\bbroad ligament/i, "uterus"],
  [/\bovary|\bovarian|\bfallopian|\bfimbria|\bsalpinx/i, "tubes_ovaries"],
  [/\bvagina|\bclitor|\bvestibul|\blabi/i, "vagina"],
  [/\blevator ani|\bcoccygeus|\bperine|\bischiocavern|\bbulbospongios/i, "pelvic_floor_perineum"],
  [/\bthyroid/i, "thyroid"],
  [/\bparathyroid/i, "parathyroid"],
  [/\bsuprarenal|\badrenal/i, "adrenal"],
  [/\bpituitary|\bhypophys/i, "pituitary"],
  [/\bspleen|\bsplenic/i, "spleen"],
  [/\bthymus/i, "thymus"],
  [/\btonsil/i, "tonsils_malt"],
  [/\bthoracic duct|\bcisterna|\blymphatic trunk|\blymphatic duct/i, "lymphatic_overview"],
  [/\baxillary.*node|\bpectoral.*node|\bsubscapular.*node/i, "axillary_nodes"],
  [/\binguinal.*node|\blacunar.*node|\bcloquet/i, "inguinal_pelvic_nodes"],
  [/\bcervical.*node|\bsubmandibular.*node|\bsubmental.*node|\bsupraclavicular.*node|\bjugul/i, "head_neck_nodes"],
  [/\bmammary|\bbreast|\bnipple|\bareola|\blactifer/i, "breast_structure"],
  [/\bhair|\beyelash|\beyebrow|\bnail|\bperionyx/i, "skin_appendages"],
  [/\bskin|\bdermis|\bepidermis|\bcutis|\bsubcutan/i, "skin_layers"],
  [/\bsinus\b.*\bdura|\bsagittal sinus|\btransverse sinus|\bsigmoid sinus|\bcavernous sinus|\bpetrosal sinus|\bcerebral vein/i, "dural_venous_sinuses"],
  [/\bolfactory nerve|\bcn i\b/i, "cn1"],
  [/\boptic nerve|\boptic chiasm|\boptic tract/i, "cn2"],
  [/\boculomotor/i, "cn3"],
  [/\btrochlear nerve/i, "cn4"],
  [/\bophthalmic nerve/i, "v1_ophthalmic"],
  [/\bmaxillary nerve/i, "v2_maxillary"],
  [/\bmandibular nerve|\binferior alveolar|\blingual nerve|\bbuccal nerve|\bmental nerve|\bmylohyoid/i, "v3_mandibular"],
  [/\btrigeminal/i, "cn5"],
  [/\babducens/i, "cn6"],
  [/\bchorda tympani/i, "chorda_tympani"],
  [/\bfacial nerve/i, "cn7"],
  [/\bvestibulocochlear|\bcochlear nerve|\bvestibular nerve/i, "cn8"],
  [/\bglossopharyngeal/i, "cn9"],
  [/\bvagus/i, "cn10"],
  [/\baccessory nerve/i, "cn11"],
  [/\bhypoglossal/i, "cn12"],
  [/\bdorsal scapular/i, "dorsal_scapular_nerve"],
  [/\blong thoracic/i, "long_thoracic_nerve"],
  [/\bsuprascapular/i, "suprascapular_nerve"],
  [/\bpectoral nerve/i, "pectoral_nerves"],
  [/\bsubscapular nerve|\bthoracodorsal/i, "subscapular_thoracodorsal_nerves"],
  [/\bposterior interosseous|\bdeep branch of radial/i, "posterior_interosseous_nerve"],
  [/\banterior interosseous/i, "anterior_interosseous_nerve"],
  [/\baxillary nerve|\bbrachial cutaneous/i, "axillary_nerve"],
  [/\bradial nerve/i, "radial_nerve"],
  [/\bmusculocutaneous|\blateral antebrachial cutaneous/i, "musculocutaneous_nerve"],
  [/\bmedian nerve/i, "median_nerve"],
  [/\bulnar nerve|\bmedial antebrachial cutaneous/i, "ulnar_nerve"],
  [/\bbrachial plexus|\btrunk of brachial|\bcord of brachial|\bsubclavian nerve/i, "brachial_plexus"],
  [/\biliohypogastric|\bilio-inguinal|\bilioinguinal|\bgenitofemoral/i, "iliohypogastric_ilioinguinal_genitofemoral"],
  [/\bsaphenous nerve|\binfrapatellar branch|\bsural/i, "saphenous_sural_nerves"],
  [/\bgluteal nerve|\bnerve to piriformis|\bnerve to quadratus femoris|\bposterior femoral cutaneous/i, "gluteal_nerves"],
  [/\bdeep fibular|\bsuperficial fibular|\bplantar nerve|\bdorsal cutaneous nerve of foot/i, "deep_superficial_fibular_plantar"],
  [/\bfemoral nerve|\blateral femoral cutaneous/i, "femoral_nerve"],
  [/\bobturator nerve/i, "obturator_nerve"],
  [/\bsciatic nerve/i, "sciatic_nerve"],
  [/\btibial nerve/i, "tibial_nerve"],
  [/\bcommon fibular/i, "common_fibular_nerve"],
  [/\bpudendal nerve/i, "pudendal_nerve"],
  [/\bintercostal nerve/i, "intercostal_nerves"],
  [/\bspinal cord|\bcorticospinal|\bspinothalamic|\bspinocerebellar|\bgracile|\bcuneate|\bhorn of spinal|\bspinal ganglion|\bspinal nerve/i, "spinal_cord"],
  [/\bintervertebral disc|\bnucleus pulposus/i, "intervertebral_disc"],
  [/\banular ligament|\bannular ligament|\bquadrate ligament|\boblique cord|\bcollateral ligament/i, "elbow_joint"],
  [/\bcoraco-acromial|\bcoracoacromial|\bglenohumeral|\bglenoid/i, "shoulder_joint"],
  [/\bsacro-iliac|\bsacroiliac|\bsacrotuberous|\bsacrospinous|\biliolumbar/i, "sacroiliac_symphysis"],
  [/\bcalcaneal tendon|\bplantar aponeurosis|\bretinaculum.*ankle|\bfibular retinaculum|\btendon.*foot|\btendon.*hallucis|\btendon.*tibialis/i, "foot_arches_gait"],
  [/\bpalmar aponeurosis|\bretinaculum.*wrist|\bflexor tendon|\bextensor tendon|\btendon sheath/i, "carpal_tunnel_retinaculum"],
  [/\biliotibial|\bfascia lata|\bpatellar retinaculum/i, "fascia_lata_itb"],
  [/\bsaphenous/i, "saphenous_veins"],
  [/\bportal vein|\bmesenteric vein|\bsplenic vein/i, "portal_system"],
  [/\bazygos/i, "azygos_system"],
  [/\bsuperior vena cava|\binferior vena cava\b/i, "svc_ivc"],
  [/\bcerebral artery|\bcommunicating artery|\bcerebellar artery|\bstriate|\bsulcus.*artery|\bgyrus.*artery/i, "circle_of_willis"],
  [/\bcarotid/i, "external_carotid"],
  [/\bvertebral artery|\bbasilar artery|\bspinal artery/i, "vertebral_artery"],
  [/\bprofunda brachii|\bprofundo brachii|\bdeep brachial/i, "profunda_brachii"],
  [/\bradial collateral/i, "radial_collateral_artery"],
  [/\bmiddle collateral/i, "middle_collateral_artery"],
  [/\bulnar collateral|\brecurrent interosseous|\binterossea recurrens|\bulnar recurrent|\bradial recurrent/i, "elbow_anastomosis_collaterals"],
  [/\bbrachial artery|\barteria brachialis/i, "brachial_artery"],
  [/\bradial artery|\bulnar artery|\binterosseous artery|\bcarpal branch/i, "radial_ulnar_arteries"],
  [/\bsubclavian|\baxillary artery|\bcircumflex humeral|\bthoraco-acromial|\bthoracoacromial|\bsubscapular artery|\bcircumflex scapular|\bthoracodorsal artery|\bthoracic artery|\bthyrocervical|\btransverse cervical/i, "subclavian_axillary_brachial"],
  [/\bprofunda femoris|\bprofundo femoris|\bdeep femoral|\bcircumflex femoral|\bperforating femoral/i, "profunda_femoris"],
  [/\bpalmar arch|\bdigital artery of hand|\bmetacarpal artery/i, "hand_arches"],
  [/\bceliac|\bcoeliac|\bmesenteric artery|\bgastric artery|\bhepatic artery|\bsplenic artery|\bcolic artery|\brectal artery|\bappendicular artery/i, "coeliac_sma_ima"],
  [/\biliac artery|\bfemoral artery|\bpopliteal artery|\btibial artery|\bfibular artery|\bgluteal artery|\bpudendal artery|\bobturator artery|\bgenicular artery|\bplantar artery|\bdorsalis pedis/i, "iliac_femoral"],
  [/\baorta|\baortic|\bintercostal artery|\blumbar artery|\bphrenic artery|\bsacral artery/i, "aorta"],
  [/\bmeniscus|\bcruciate|\bpatellar ligament|\bpopliteal ligament|\bknee/i, "knee_joint"],
  [/\bglenohumeral|\bglenoid|\bcoracohumeral|\bcoracoacromial/i, "shoulder_joint"],
  [/\bacromioclavicular|\bsternoclavicular|\bcoracoclavicular|\bconoid|\btrapezoid ligament|\bcostoclavicular/i, "ac_sc_joints"],
  [/\bannular ligament|\bhumeroulnar|\bhumeroradial|\bradioulnar|\belbow/i, "elbow_joint"],
  [/\bradiocarpal|\bintercarpal|\bcarpometacarpal|\bmetacarpophalangeal|\bpisohamate|\bwrist/i, "wrist_joint"],
  [/\biliofemoral|\bpubofemoral|\bischiofemoral|\bacetabul|\bhip joint/i, "hip_joint"],
  [/\btalofibular|\bcalcaneofibular|\bdeltoid ligament|\btibiofibular|\bankle/i, "ankle_joint"],
  [/\btalocalcane|\bcalcaneonavicular|\bcalcaneocuboid|\bplantar ligament|\bcuneonavicular|\btarsometatarsal|\bmetatarsophalangeal|\binterphalangeal|\bfoot joint/i, "subtalar_foot_joints"],
  [/\bsacroiliac|\bsacrotuberous|\bsacrospinous|\bpubic symphysis|\bobturator membrane|\binguinal ligament/i, "sacroiliac_symphysis"],
  [/\batlanto|\bcruciate ligament of atlas|\balar ligament|\btectorial/i, "atlantoaxial"],
  [/\btemporomandibular|\bsphenomandibular|\bstylomandibular/i, "tmj"],
  [/\blongitudinal ligament|\bflavum|\bflaval|\bsupraspinous|\binterspinous|\bnuchal|\bcostovertebral|\bcostotransverse|\bsternocostal|\bzygapophyseal/i, "vertebral_joints"],
  [/\bfrontal bone|\bparietal bone|\boccipital bone|\btemporal bone|\bsphenoid|\bethmoid|\bsuture|\bcalvaria|\bpterion/i, "skull_bones_sutures"],
  [/\bmandible|\bmaxilla|\bzygomatic|\bnasal bone|\bvomer|\bpalatine|\bhyoid|\btooth|\bincisor|\bcanine|\bpremolar|\bmolar/i, "mandible_facial_bones"],
  [/\batlas\b|\baxis\b|\bcervical vertebra/i, "cervical_vertebrae"],
  [/\bthoracic vertebra|\blumbar vertebra/i, "thoracic_lumbar_vertebrae"],
  [/\bsacrum|\bcoccyx/i, "sacrum_coccyx"],
  [/\bsternum|\bmanubrium|\bxiphoid/i, "sternum"],
  [/\brib\b|\bcostal/i, "ribs"],
  [/\bclavicle|\bscapula|\bacromion|\bcoracoid/i, "clavicle_scapula"],
  [/\bhumerus/i, "humerus"],
  [/\bradius|\bulna/i, "radius_ulna"],
  [/\bscaphoid|\blunate|\btriquetr|\bpisiform|\btrapezium|\btrapezoid|\bcapitate|\bhamate|\bcarpal/i, "carpal_bones"],
  [/\bmetacarpal|\bphalanx of hand/i, "hand_bones"],
  [/\bhip bone|\bilium|\bischium|\bpubis|\bpelvi/i, "pelvis"],
  [/\bfemur|\bfemoral/i, "femur"],
  [/\bpatella|\btibia|\bfibula/i, "patella_tibia_fibula"],
  [/\btalus|\bcalcaneus|\bnavicular|\bcuboid|\bcuneiform|\bmetatarsal|\bphalanx|\bfoot/i, "tarsals_foot"],
];

const SYSTEM_DEFAULT_ENTRY: Partial<Record<PanelId, string>> = {
  muscular: "erector_spinae",
  skeletal: "skeleton_overview",
  articular: "joint_classification",
  nervous: "spinal_cord",
  cardiovascular: "aorta",
  lymphatic: "lymphatic_overview",
  respiratory: "lungs",
  digestive: "stomach",
  renal: "kidney_position_relations",
  reproductive: "pelvic_floor_perineum",
  endocrine: "pituitary",
  integumentary: "skin_layers",
  regional: "abdominal_regions_planes",
  tendons: "limb_compartments",
  heart_sounds: "s1_s2",
  breath_sounds: "normal_breath_sounds",
  scanner: "ct_mri_basics",
};

/**
 * Returns the best matching knowledge entry for a mesh name, or null.
 * Threshold 0.6 = at least 60% of an entry/alias's tokens must appear in the mesh name.
 */
export function matchMeshToEntry(meshName: string, threshold = 0.6): UnifiedEntry | null {
  if (!meshName) return null;
  const cleaned = meshName
    .replace(/^VH_F_/i, "")
    .replace(/_/g, " ")
    .replace(/\.(l|r)$/i, "");
  const lower = cleaned.toLowerCase();

  // 1. Direct substring match against rawAliases (longest alias match wins)
  let bestSubstring: { id: string; len: number } | null = null;
  for (const c of CANDIDATES) {
    for (const alias of c.rawAliases) {
      if (alias.length >= 4 && lower.includes(alias)) {
        if (!bestSubstring || alias.length > bestSubstring.len) {
          bestSubstring = { id: c.id, score: 1, len: alias.length } as { id: string; len: number };
        }
      }
    }
  }
  if (bestSubstring) return KNOWLEDGE_BY_ID[bestSubstring.id];

  // 2. Token overlap scoring
  const m = new Set(tokens(cleaned));
  if (m.size > 0) {
    let best: { id: string; score: number; size: number } | null = null;
    for (const c of CANDIDATES) {
      for (const set of c.sets) {
        const hits = set.filter((t) => m.has(t)).length;
        if (hits === 0) continue;
        const score = hits / set.length;
        if (score < threshold) continue;
        if (!best || score > best.score || (score === best.score && set.length > best.size)) {
          best = { id: c.id, score, size: set.length };
        }
      }
    }
    if (best) return KNOWLEDGE_BY_ID[best.id];
  }

  // 3. Regex keyword fallback
  for (const [rx, entryId] of KEYWORD_FALLBACKS) {
    if (rx.test(cleaned) && KNOWLEDGE_BY_ID[entryId]) {
      return KNOWLEDGE_BY_ID[entryId];
    }
  }

  return null;
}

/**
 * Matches a full ManifestOrgan (checking name_en, node, ta2_latin, path, and system)
 * so every single clickable 3D organ resolves to a rich anatomical knowledge card.
 */
const EXACT_ARABIC_LEXICON: [RegExp, string][] = [
  [/\bprofunda brachii|profundo brachii|deep brachial artery\b/i, "الشريان العضدي العميق (Profunda / Profundo brachii Artery)"],
  [/\bradial collateral artery\b/i, "الشريان الرديف الكعبري (الفرع الأمامي النازل للشريان العضدي العميق)"],
  [/\bmiddle collateral artery\b/i, "الشريان الرديف الأوسط (الفرع الخلفي النازل للشريان العضدي العميق)"],
  [/\bposterior interosseous recurrent|recurrent interosseous artery\b/i, "الشريان الراجع بين العظمين الخلفي (Posterior Interosseous Recurrent A.)"],
  [/\bsuperior ulnar collateral artery\b/i, "الشريان الرديف الزندي العلوي (Superior Ulnar Collateral A.)"],
  [/\binferior ulnar collateral artery\b/i, "الشريان الرديف الزندي السفلي (Inferior Ulnar Collateral A.)"],
  [/\bulnar recurrent artery\b/i, "الشريان الزندي الراجع (Ulnar Recurrent A.)"],
  [/\bposterior circumflex humeral artery\b/i, "الشريان المنعطف العضدي الخلفي (Posterior Circumflex Humeral A.)"],
  [/\banterior circumflex humeral artery\b/i, "الشريان المنعطف العضدي الأمامي (Anterior Circumflex Humeral A.)"],
  [/\bbrachial artery\b/i, "الشريان العضدي (Brachial Artery)"],
  [/\baxillary artery\b/i, "الشريان الإبطي (Axillary Artery)"],
  [/\bradial artery\b/i, "الشريان الكعبري (Radial Artery)"],
  [/\bulnar artery\b/i, "الشريان الزندي (Ulnar Artery)"],
  [/\bprofunda femoris|profundo femoris|deep femoral artery\b/i, "الشريان الفخذي العميق (Profunda femoris Artery)"],
  [/\bfemoral artery\b/i, "الشريان الفخذي (Femoral Artery)"],
  [/\bpopliteal artery\b/i, "الشريان المأبضي (Popliteal Artery)"],
  [/\bplatysma\b/i, "العضلة الجلدية العنقية (Platysma)"],
  [/\bsternocleidomastoid\b/i, "العضلة القصية الترقوية الخشائية"],
  [/\btrapezius\b/i, "العضلة شبه المنحرفة"],
  [/\blatissimus dorsi\b/i, "العضلة الظهرية العريضة"],
  [/\bdeltoid\b/i, "العضلة الدالية"],
  [/\bsupraspinatus\b/i, "العضلة فوق الشوكة"],
  [/\binfraspinatus\b/i, "العضلة تحت الشوكة"],
  [/\bteres minor\b/i, "العضلة المدورة الصغرى"],
  [/\bteres major\b/i, "العضلة المدورة الكبرى"],
  [/\bsubscapularis\b/i, "العضلة تحت الكتف"],
  [/\brhomboid major\b/i, "العضلة المعينية الكبرى"],
  [/\brhomboid minor\b/i, "العضلة المعينية الصغرى"],
  [/\blevator scapulae\b/i, "العضلة رافعة الكتف"],
  [/\bserratus anterior\b/i, "العضلة المنشارية الأمامية"],
  [/\bserratus posterior superior\b/i, "العضلة المنشارية الخلفية العلوية"],
  [/\bserratus posterior inferior\b/i, "العضلة المنشارية الخلفية السفلية"],
  [/\bpectoralis major\b/i, "العضلة الصدرية الكبرى"],
  [/\bpectoralis minor\b/i, "العضلة الصدرية الصغرى"],
  [/\bsubclavius\b/i, "العضلة تحت الترقوة"],
  [/\bbiceps brachii\b/i, "العضلة ذات الرأسين العضدية"],
  [/\bcoracobrachialis\b/i, "العضلة الغرابية العضدية"],
  [/\bbrachialis\b/i, "العضلة العضدية"],
  [/\btriceps brachii\b/i, "العضلة ثلاثية الرؤوس العضدية"],
  [/\banconeus\b/i, "العضلة المرفقية"],
  [/\bpronator teres\b/i, "العضلة الكابة المدورة"],
  [/\bpronator quadratus\b/i, "العضلة الكابة المربعة"],
  [/\bflexor carpi radialis\b/i, "قابضة الرسغ الكعبرية"],
  [/\bpalmaris longus\b/i, "العضلة الراحية الطويلة"],
  [/\bpalmaris brevis\b/i, "العضلة الراحية القصيرة"],
  [/\bflexor carpi ulnaris\b/i, "قابضة الرسغ الزندية"],
  [/\bflexor digitorum superficialis\b/i, "قابضة الأصابع السطحية"],
  [/\bflexor digitorum profundus\b/i, "قابضة الأصابع العميقة"],
  [/\bflexor pollicis longus\b/i, "قابضة الإبهام الطويلة"],
  [/\bbrachioradialis\b/i, "العضلة العضدية الكعبرية"],
  [/\bextensor carpi radialis longus\b/i, "باسطة الرسغ الكعبرية الطويلة"],
  [/\bextensor carpi radialis brevis\b/i, "باسطة الرسغ الكعبرية القصيرة"],
  [/\bextensor digitorum\b/i, "باسطة الأصابع"],
  [/\bextensor digiti minimi\b/i, "باسطة الخنصر"],
  [/\bextensor carpi ulnaris\b/i, "باسطة الرسغ الزندية"],
  [/\bsupinator\b/i, "العضلة الباسطة الكعبرية (Supinator)"],
  [/\babductor pollicis longus\b/i, "مبعدة الإبهام الطويلة"],
  [/\bextensor pollicis brevis\b/i, "باسطة الإبهام القصيرة"],
  [/\bextensor pollicis longus\b/i, "باسطة الإبهام الطويلة"],
  [/\bextensor indicis\b/i, "باسطة السبابة"],
  [/\babductor pollicis brevis\b/i, "مبعدة الإبهام القصيرة"],
  [/\bflexor pollicis brevis\b/i, "قابضة الإبهام القصيرة"],
  [/\bopponens pollicis\b/i, "مقابلة الإبهام"],
  [/\badductor pollicis\b/i, "مقربة الإبهام"],
  [/\babductor digiti minimi\b/i, "مبعدة الخنصر"],
  [/\bflexor digiti minimi brevis\b/i, "قابضة الخنصر القصيرة"],
  [/\bopponens digiti minimi\b/i, "مقابلة الخنصر"],
  [/\blumbrical/i, "العضلة الخراطينية (Lumbrical)"],
  [/\bdorsal interosseous\b/i, "العضلة بين العظام الظهرية"],
  [/\bpalmar interosseous\b/i, "العضلة بين العظام الراحية"],
  [/\bplantar interosseous\b/i, "العضلة بين العظام الأخمصية"],
  [/\bgluteus maximus\b/i, "العضلة الألوية الكبرى"],
  [/\bgluteus medius\b/i, "العضلة الألوية الوسطى"],
  [/\bgluteus minimus\b/i, "العضلة الألوية الصغرى"],
  [/\btensor fasciae latae\b/i, "شادة اللفافة العريضة"],
  [/\bpiriformis\b/i, "العضلة الكمثرية"],
  [/\bobturator internus\b/i, "العضلة السدادية الغائرة"],
  [/\bobturator externus\b/i, "العضلة السدادية الظاهرة"],
  [/\bsuperior gemellus\b/i, "العضلة التوأمية العلوية"],
  [/\binferior gemellus\b/i, "العضلة التوأمية السفلية"],
  [/\bquadratus femoris\b/i, "العضلة المربعة الفخذية"],
  [/\bpsoas major\b/i, "العضلة القطنية الكبرى (Psoas Major)"],
  [/\bpsoas minor\b/i, "العضلة القطنية الصغرى"],
  [/\biliacus\b/i, "العضلة الحرقفية (Iliacus)"],
  [/\biliopsoas\b/i, "العضلة الحرقفية القطنية (Iliopsoas)"],
  [/\bquadratus lumborum\b/i, "العضلة المربعة القطنية"],
  [/\bsartorius\b/i, "العضلة الخياطية (Sartorius)"],
  [/\brectus femoris\b/i, "المستقيمة الفخذية"],
  [/\bvastus lateralis\b/i, "المتسعة الوحشية"],
  [/\bvastus medialis\b/i, "المتسعة الإنسية"],
  [/\bvastus intermedius\b/i, "المتسعة المتوسطة"],
  [/\barticularis genus\b/i, "العضلة المفصلية للركبة"],
  [/\bpectineus\b/i, "العضلة العانية (Pectineus)"],
  [/\bgracilis\b/i, "العضلة الرشيقة (Gracilis)"],
  [/\badductor longus\b/i, "المقربة الطويلة"],
  [/\badductor brevis\b/i, "المقربة القصيرة"],
  [/\badductor magnus\b/i, "المقربة الكبرى"],
  [/\badductor minimus\b/i, "المقربة الصغرى"],
  [/\bbiceps femoris\b/i, "ذات الرأسين الفخذية"],
  [/\bsemitendinosus\b/i, "نصف الوترية (Semitendinosus)"],
  [/\bsemimembranosus\b/i, "نصف الغشائية (Semimembranosus)"],
  [/\btibialis anterior\b/i, "الظنبوبية الأمامية"],
  [/\bextensor hallucis longus\b/i, "باسطة إبهام القدم الطويلة"],
  [/\bextensor digitorum longus\b/i, "باسطة أصابع القدم الطويلة"],
  [/\bfibularis tertius|peroneus tertius\b/i, "الشظوية الثالثة"],
  [/\bfibularis longus|peroneus longus\b/i, "الشظوية الطويلة"],
  [/\bfibularis brevis|peroneus brevis\b/i, "الشظوية القصيرة"],
  [/\bgastrocnemius\b/i, "عضلة الساق التوأمية (Gastrocnemius)"],
  [/\bsoleus\b/i, "العضلة النعلية (Soleus)"],
  [/\bplantaris\b/i, "العضلة الأخمصية (Plantaris)"],
  [/\bpopliteus\b/i, "العضلة المأبضية (Popliteus)"],
  [/\btibialis posterior\b/i, "الظنبوبية الخلفية"],
  [/\bflexor hallucis longus\b/i, "قابضة إبهام القدم الطويلة"],
  [/\bflexor digitorum longus\b/i, "قابضة أصابع القدم الطويلة"],
  [/\bextensor hallucis brevis\b/i, "باسطة إبهام القدم القصيرة"],
  [/\bextensor digitorum brevis\b/i, "باسطة أصابع القدم القصيرة"],
  [/\babductor hallucis\b/i, "مبعدة إبهام القدم"],
  [/\bflexor digitorum brevis\b/i, "قابضة أصابع القدم القصيرة"],
  [/\bquadratus plantae\b/i, "المربعة الأخمصية"],
  [/\bflexor hallucis brevis\b/i, "قابضة إبهام القدم القصيرة"],
  [/\badductor hallucis\b/i, "مقربة إبهام القدم"],
  [/\bdiaphragm\b/i, "الحجاب الحاجز"],
  [/\bexternal intercostal\b/i, "العضلة الوربية الخارجية"],
  [/\binternal intercostal\b/i, "العضلة الوربية الداخلية"],
  [/\binnermost intercostal\b/i, "العضلة الوربية العميقة"],
  [/\bsubcostal\b/i, "العضلة تحت الضلعية"],
  [/\btransversus thoracis\b/i, "المستعرضة الصدرية"],
  [/\brectus abdominis\b/i, "المستقيمة البطنية"],
  [/\bexternal oblique\b/i, "المائلة البطنية الخارجية"],
  [/\binternal oblique\b/i, "المائلة البطنية الداخلية"],
  [/\btransversus abdominis\b/i, "المستعرضة البطنية"],
  [/\bpyramidalis\b/i, "العضلة الهرمية"],
  [/\bcremaster\b/i, "العضلة المشمرة (Cremaster)"],
  [/\btemporalis\b/i, "العضلة الصدغية"],
  [/\bmasseter\b/i, "العضلة الماضغة (Masseter)"],
  [/\blateral pterygoid\b/i, "العضلة الجناحية الوحشية"],
  [/\bmedial pterygoid\b/i, "العضلة الجناحية الإنسية"],
  [/\bbuccinator\b/i, "العضلة المبوقة (Buccinator)"],
  [/\borbicularis oculi\b/i, "دويرية العين"],
  [/\borbicularis oris\b/i, "دويرية الفم"],
  [/\bzygomaticus major\b/i, "الوجنية الكبرى"],
  [/\bzygomaticus minor\b/i, "الوجنية الصغرى"],
  [/\brisorius\b/i, "العضلة الضاحكة (Risorius)"],
  [/\bmental/i, "العضلة الذقنية"],
  [/\bdigastric\b/i, "ذات البطنين (Digastric)"],
  [/\bmylohyoid\b/i, "الضرسية اللامية (Mylohyoid)"],
  [/\bstylohyoid\b/i, "الإبرية اللامية"],
  [/\bgeniohyoid\b/i, "الذقنية اللامية"],
  [/\bsternohyoid\b/i, "القصية اللامية"],
  [/\bomohyoid\b/i, "الكتفية اللامية (Omohyoid)"],
  [/\bsternothyroid\b/i, "القصية الدرقية"],
  [/\bthyrohyoid\b/i, "الدرقية اللامية"],
  [/\bscalenus anterior|anterior scalene\b/i, "الأخمعية الأمامية (Anterior Scalene)"],
  [/\bscalenus medius|middle scalene\b/i, "الأخمعية الوسطى (Middle Scalene)"],
  [/\bscalenus posterior|posterior scalene\b/i, "الأخمعية الخلفية (Posterior Scalene)"],
  [/\blongus colli\b/i, "طويلة العنق (Longus Colli)"],
  [/\blongus capitis\b/i, "طويلة الرأس (Longus Capitis)"],
  [/\bsplenius capitis\b/i, "الطحالية الرأسية (Splenius Capitis)"],
  [/\bsplenius cervicis\b/i, "الطحالية العنقية (Splenius Cervicis)"],
  [/\biliocostalis\b/i, "الحرقفية الضلعية (Iliocostalis)"],
  [/\blongissimus\b/i, "الطولى (Longissimus)"],
  [/\bspinalis\b/i, "الشوكية (Spinalis)"],
  [/\bsemispinalis\b/i, "نصف الشوكية (Semispinalis)"],
  [/\bmultifidus\b/i, "العضلة عديدة الفلوح (Multifidus)"],
  [/\brotatores\b/i, "العضلات المدورة الفقرية (Rotatores)"],
  [/\blevator ani\b/i, "رافعة الشرج (Levator Ani)"],
  [/\biliococcygeus\b/i, "الحرقفية العصعصية"],
  [/\bpubococcygeus\b/i, "العانية العصعصية"],
  [/\bpuborectalis\b/i, "العانية المستقيمية"],
  [/\bcoccygeus|ischiococcygeus\b/i, "العضلة العصعصية"],
  [/\bbulbospongiosus\b/i, "البصلية الإسفنجية"],
  [/\bischiocavernosus\b/i, "الإسكية الكهفية"],
  [/\biliotibial tract\b/i, "السبيل الحرقفي الظنبوبي (Iliotibial Tract)"],
  [/\bpalmar aponeurosis\b/i, "الصفاق الراحي (Palmar Aponeurosis)"],
  [/\bplantar aponeurosis\b/i, "الصفاق الأخمصي (Plantar Aponeurosis)"],
  [/\bepicranial aponeurosis|galea aponeurotica\b/i, "الخوذة الصفاقية (Galea Aponeurotica)"],
  [/\bcalcaneal tendon|achilles\b/i, "وتر العرقوب (أخيل / Calcaneal Tendon)"],
];

function translateOrganTitleAr(
  nameEn?: string,
  system?: string,
  baseNameAr?: string,
): string {
  const safeNameEn = typeof nameEn === "string" ? nameEn : "";
  const sideMatch = safeNameEn.match(/\((left|right)\)\s*$/i);
  const sideAr = sideMatch
    ? sideMatch[1].toLowerCase() === "left"
      ? " (الأيسر)"
      : " (الأيمن)"
    : "";
  const coreEn = safeNameEn.replace(/\s*\((left|right)\)\s*$/i, "").trim();

  // Qualifier prefix (e.g. Long head of ..., Clavicular part of ..., Tendon of ...)
  let prefixAr = "";
  if (/^long head of\b/i.test(coreEn)) prefixAr = "الرأس الطويل لـ ";
  else if (/^short head of\b/i.test(coreEn)) prefixAr = "الرأس القصير لـ ";
  else if (/^lateral head of\b/i.test(coreEn)) prefixAr = "الرأس الوحشي لـ ";
  else if (/^medial head of\b/i.test(coreEn)) prefixAr = "الرأس الإنسي لـ ";
  else if (/^oblique head of\b/i.test(coreEn)) prefixAr = "الرأس المائل لـ ";
  else if (/^transverse head of\b/i.test(coreEn)) prefixAr = "الرأس المستعرض لـ ";
  else if (/^humeral head of\b/i.test(coreEn)) prefixAr = "الرأس العضدي لـ ";
  else if (/^ulnar head of\b/i.test(coreEn)) prefixAr = "الرأس الزندي لـ ";
  else if (/^radial head of\b/i.test(coreEn)) prefixAr = "الرأس الكعبري لـ ";
  else if (/^clavicular (part|head) of\b/i.test(coreEn)) prefixAr = "الجزء الترقوي لـ ";
  else if (/^sternocostal (part|head) of\b/i.test(coreEn)) prefixAr = "الجزء القصي الضلعي لـ ";
  else if (/^abdominal part of\b/i.test(coreEn)) prefixAr = "الجزء البطني لـ ";
  else if (/^acromial part of\b/i.test(coreEn)) prefixAr = "الجزء الأخرمي لـ ";
  else if (/^spinal part of\b/i.test(coreEn)) prefixAr = "الجزء الشوكي لـ ";
  else if (/^descending part of\b/i.test(coreEn)) prefixAr = "الجزء النازل لـ ";
  else if (/^transverse part of\b/i.test(coreEn)) prefixAr = "الجزء المستعرض لـ ";
  else if (/^ascending part of\b/i.test(coreEn)) prefixAr = "الجزء الصاعد لـ ";
  else if (/^anterior belly of\b/i.test(coreEn)) prefixAr = "البطن الأمامي لـ ";
  else if (/^posterior belly of\b/i.test(coreEn)) prefixAr = "البطن الخلفي لـ ";
  else if (/^superior belly of\b/i.test(coreEn)) prefixAr = "البطن العلوي لـ ";
  else if (/^inferior belly of\b/i.test(coreEn)) prefixAr = "البطن السفلي لـ ";
  else if (/^tendon of\b/i.test(coreEn)) prefixAr = "وتر ";
  else if (/^tendinous sheath of\b/i.test(coreEn)) prefixAr = "الغمد الوتري لـ ";

  for (const [rx, ar] of EXACT_ARABIC_LEXICON) {
    if (rx.test(coreEn)) {
      return `${prefixAr}${ar}${sideAr}`;
    }
  }

  if (baseNameAr) {
    return `${prefixAr}${baseNameAr}${sideAr}`;
  }

  const sysPrefix: Record<string, string> = {
    muscular: "العضلة / التركيب العضلي",
    skeletal: "العظم / المعلم العظمي",
    articular: "المفصل / الرباط",
    cardiovascular: "الوعاء الدموي / التركيب القلبي",
    nervous: "العصب / التركيب العصبي",
    lymphatic: "العقدة / الوعاء الليمفاوي",
    digestive: "التركيب الهضمي",
    respiratory: "التركيب التنفسي",
    renal: "التركيب الكلوي / البولي",
    reproductive: "التركيب التناسلي",
    endocrine: "الغدة الصماء",
    integumentary: "التركيب الجلدي / الثديي",
    regional: "المنطقة التشريحية",
  };
  const label = sysPrefix[system ?? ""] ?? "التركيب التشريحي";
  return `${label}: ${coreEn}${sideAr}`;
}

function buildSpecificOrganDetails(organ: {
  organ_id?: string;
  name_en: string;
  ta2_latin?: string;
  system?: string;
  path?: string[];
}): { details: DetailRow[]; clinical: string; clinical_ar?: string } {
  const pathStr = organ.path && organ.path.length > 0 ? organ.path.join(" › ") : organ.system ?? "Anatomy";
  const text = `${organ.name_en} ${organ.ta2_latin ?? ""} ${pathStr}`.toLowerCase();

  if (organ.system === "muscular") {
    let origin = "يرتكز منشؤها على المعالم العظمية أو اللفافية المجاورة ضمن الحيز التشريحي (" + pathStr + ").";
    let insertion = "ترتكز عبر وترها على العظم المستهدف لتحريك المفصل المقابل بدقة ميكانيكية.";
    let nerve = "العصب الحركي الإقليمي المغذي لهذه المجموعة العضلية.";
    let action = "تعمل بالتآزر مع عضلات الحيز لإنجاز الحركة الفسيولوجية وتثبيت المفصل.";
    let clinical = "تُفحص سريرياً باختبار القوة الحركية ضد المقاومة وتقييم المنعكس العصبي سلامةً للجذور العصبية المغذية.";

    if (/facial|orbicularis|zygomatic|buccinator|risorius|mental|depressor|levator labii|nasalis|procerus|occipitofrontalis|frontal belly|occipital belly|auricular|platysma/.test(text)) {
      origin = "عظام الوجه السطحية أو اللفافة الوجهية والجلد (بدون لفافة عميقة)";
      insertion = "أدمة جلد الوجه والألياف العضلية المحيطة بالعين والفم";
      nerve = "العصب الوجهي — Facial nerve (CN VII) وفروعه الخمسة (الصدغي، الوجني، الشدقي، الهامشي الفكي، العنقي)";
      action = "التعبيرات الوجهية، إغلاق الجفنين والشفتين، وحماية القرنية";
      clinical = "شلل العصب السابع المحيطي (Bell’s Palsy) يؤدي لضعف نصف الوجه الكامل على نفس الجهة، بينما تحافظ إصابة العصبون العلوي (Stroke) على عضلات الجبهة.";
    } else if (/masseter|temporalis|pterygoid|masticat/.test(text)) {
      origin = "الحفرة الصدغية / القوس الوجنية / الصفيحة الجناحية للعظم الوتدي";
      insertion = "الرأد (Ramus) والناتئ الإكليلي واللقمة الفكية لعظم الفك السفلي (Mandible)";
      nerve = "العصب الفكي السفلي — Mandibular division of Trigeminal nerve (CN V3)";
      action = "إطباق الفك السفلي ومضغ الطعام (العضلة الجناحية الوحشية تفتح الفك وتدفعه للأمام)";
      clinical = "انحراف الفك السفلي عند فتح الفم يكون باتجاه الجهة المصابة في شلل العصب الثلاثي التوائم (CN V3).";
    } else if (/suprahyoid|digastric|mylohyoid|stylohyoid|geniohyoid|infrahyoid|sternohyoid|omohyoid|sternothyroid|thyrohyoid/.test(text)) {
      origin = "الفك السفلي / الناتئ الإبري (لفوق اللامية) أو القص والترقوة والغضروف الدرقي (لتحت اللامية)";
      insertion = "جسم وقرنا العظم اللامي (Hyoid bone) والصفيحة الدرقية";
      nerve = "العروة العنقية (Ansa cervicalis C1–C3) لعضلات تحت اللامية، وCN V3 / CN VII لعضلات فوق اللامية";
      action = "رفع وتثبيت وخفض العظم اللامي والحنجرة أثناء البلع والنطق";
      clinical = "تُعد عضلات تحت اللامية (Strap muscles) معلماً جراحياً أساسياً يتم إبعاده للوصول إلى الغدة الدرقية والقصبة الهوائية.";
    } else if (/scalene|scalenus|longus colli|longus capitis|prevertebral/.test(text)) {
      origin = "النواتئ المستعرضة وأجسام الفقرات العنقية (C1–C7)";
      insertion = "الضلع الأول والثاني (للأخمعيات) أو قاعدة القحف والفقرات العنقية";
      nerve = "الفروع الأمامية للأعصاب العنقية (Ventral rami C2–C8)";
      action = "ثني العنق للأمام والجانب ورفع الضلعين الأول والثاني كعضلات تنفسية مساعدة";
      clinical = "يمر الضفير العضدي والشريان تحت الترقوة بين الأخمعية الأمامية والوسطى (Interscalene triangle)؛ انضغاطهما يسبب متلازمة مخرج الصدر (TOS).";
    } else if (/splenius|iliocostalis|longissimus|spinalis|semispinalis|multifidus|rotatores|interspinal|intertransvers|suboccipital|rectus capitis|obliquus capitis|dorsal|back/.test(text)) {
      origin = "العجز، العرف الحرقفي، والنواتئ الشوكية والمستعرضة للفقرات";
      insertion = "الأضلاع، النواتئ المستعرضة والشوكية للفقرات الأعلى، والعظم القذالي";
      nerve = "الفروع الخلفية للأعصاب الشوكية — Dorsal rami of spinal nerves (وSuboccipital nerve C1 للمثلث تحت القذالي)";
      action = "بسط العمود الفقري والرأس، الحفاظ على القوام المنتصب، والدوران المحوري";
      clinical = "يمر الشريان الفقري (Vertebral artery) والعصب C1 داخل المثلث تحت القذالي فوق القوس الخلفية للأطلس (C1).";
    } else if (/pharyn|palat|uvula|levator veli|tensor veli|stylopharyngeus|salpingopharyngeus|constrictor/.test(text)) {
      origin = "قاعدة الجمجمة، الناتئ الإبري، الغضروف الدرقي والحلقي، والصفاق الحنكي";
      insertion = "الرفاء البلعومي المتوسط (Median pharyngeal raphe) والحنك الرخو";
      nerve = "الضفيرة البلعومية (CN X & CN IX)؛ الإبرية البلعومية بـ CN IX؛ موترة الحنك بـ CN V3";
      action = "رفع الحنك الرخو وإغلاق البلعوم الأنفي ودفع اللقمة الغذائية نحو المريء";
      clinical = "سلامة منعكس التقيؤ (Gag reflex) تعتمد على CN IX (حسي) وCN X (حركي) مع انحراف اللهاة للجهة السليمة عند إصابة CN X.";
    } else if (/laryn|cricothyroid|cricoarytenoid|thyroarytenoid|arytenoid|vocalis/.test(text)) {
      origin = "الغضروف الدرقي والغضروف الحلقي (Cricoid & Thyroid cartilages)";
      insertion = "الغضروفان الطرجهاليان (Arytenoid cartilages) والأحبال الصوتية";
      nerve = "العصب الحنجري الراجع (Recurrent laryngeal nerve - CN X) لجميع عضلات الحنجرة ما عدا الحلقية الدرقية (External laryngeal nerve)";
      action = "تقريب وتبعيد وتوتر الأحبال الصوتية للتحكم في الصوت ومجرى الهواء";
      clinical = "العضلة الحلقية الطرجهالية الخلفية (Posterior cricoarytenoid) هي الوحيدة التي تفتح المزمار؛ إصابة العصب الراجع الثنائية تسبب اختناقاً حاداً.";
    } else if (/tongue|genioglossus|hyoglossus|styloglossus|palatoglossus|longitudinal muscle of tongue|transverse muscle of tongue|vertical muscle of tongue/.test(text)) {
      origin = "الفك السفلي، العظم اللامي، الناتئ الإبري، والحنك الرخو";
      insertion = "جسم اللسان والصفاق اللساني";
      nerve = "العصب تحت اللساني — Hypoglossal nerve (CN XII) لجميع عضلات اللسان ما عدا الحنكية اللسانية (CN X)";
      action = "إبراز اللسان وإرجاعه وتحريكه للمضغ والبلع والنطق";
      clinical = "عند إصابة العصب الثاني عشر (CN XII) ينحرف اللسان عند إخراجه باتجاه الجهة المصابة.";
    } else if (/rectus|obliquus|levator palpebrae|extraocular|eye/.test(text)) {
      origin = "الحلقة الوترية المشتركة (Annulus of Zinn) في قمة الحجاج";
      insertion = "صلبة كرة العين (Sclera)";
      nerve = "LR6 (CN VI للمستقيمة الوحشية)، SO4 (CN IV للمائلة العلوية)، والباقي بـ CN III";
      action = "تحريك كرة العين في المحاور الستة ورفع الجفن العلوي";
      clinical = "قاعدة (LR6 SO4 R3): شلل CN VI يمنع التبعيد، وشلل CN III يسبب تدلي الجفن (Ptosis) وتوجه العين للخارج والأسفل.";
    } else if (/intercostal|subcostal|transversus thoracis|diaphragm|levatores costarum|thoracic/.test(text)) {
      origin = "الحواف الضلعية والغضاريف الضلعية والفقرات الصدرية";
      insertion = "الأضلاع المجاورة والوتر المركزي للحجاب الحاجز";
      nerve = "الأعصاب الوربية (Intercostal nerves T1–T11) والعصب الحجابي (Phrenic nerve C3–C5)";
      action = "توسيع وتقليص القفص الصدري أثناء الشهيق والزفير";
      clinical = "الحزمة الوعائية العصبية الوربية (VAN) تسير في التلم الضلعي أسفل كل ضلع، لذا يُجرى البزل الصدري دائماً فوق الحافة العلوية للضلع.";
    } else if (/abdomin|oblique|pyramidalis|cremaster|quadratus lumborum/.test(text)) {
      origin = "الأضلاع السفلية، اللفافة الصدرية القطنية، والعرف الحرقفي";
      insertion = "الخط الأبيض (Linea alba)، غمد المستقيمة، وعظم العانة";
      nerve = "الأعصاب الصدرية البطنية (T7–T11)، العصب تحت الضلعي (T12)، والحرقفي الخثلي والحرقفي الإربي (L1)";
      action = "ضغط الأحشاء البطنية، ثني ودوران الجذع، وتثبيت الحوض";
      clinical = "تتشكل القناة الإربية (Inguinal canal) فوق النصف الإنسي للرباط الإربي وتنقل الحبل المنوي أو الرباط المستدير.";
    } else if (/pelvic|perine|levator ani|coccyge|sphincter|bulbospongiosus|ischiocavernosus|transverse perineal/.test(text)) {
      origin = "عظم العانة، القوس الوترية للعضلة رافعة الشرج، والحدبة الإسكية";
      insertion = "الجسم العجاني، العصعص، والمستقيم والإحليل";
      nerve = "العصب الفرجي (Pudendal nerve S2–S4) وفروع S3–S4 المباشرة";
      action = "دعم أحشاء الحوض، الحفاظ على الاستمساك البولي والشرجي، والوظيفة الجنسية";
      clinical = "إحصار العصب الفرجي (Pudendal nerve block) يُجرى عبر المهبل عند الشوكة الإسكية (Ischial spine) لتخدير العجان أثناء الولادة.";
    } else if (/hand|pollicis|digiti minimi|lumbrical|interosseous|palmar/.test(text)) {
      origin = "عظام الرسغ، السنعيّات (Metacarpals)، وأوتار قابضة الأصابع العميقة";
      insertion = "السلاميات القريبة والقلنسوة الباسطة (Extensor expansion) للأصابع";
      nerve = "العصب الزندي (Ulnar nerve C8–T1) لمعظم عضلات اليد، والعصب المتوسط (Median nerve) لعضلات الرانفة (Thenar) والخراطينيتين 1 و2";
      action = "الحركات الدقيقة للأصابع، مقابلة الإبهام، وتقريب وتبعيد الأصابع (PAD & DAB)";
      clinical = "إصابة العصب الزندي تسبب يد المخلب (Claw hand) وضعف تبعيد وتقريب الأصابع، بينما إصابة العصب المتوسط تسبب ضمور الرانفة (Ape hand).";
    } else if (/forearm|carpi|digitorum|pronator|supinator|brachioradialis|indicis/.test(text)) {
      origin = "اللقيمة الإنسية للعضد (للقابضات) أو اللقيمة الوحشية للعضد (للباسطات) وعظمي الكعبرة والزند";
      insertion = "عظام الرسغ، السنعيّات، وسلاميات الأصابع";
      nerve = "العصب المتوسط والزندي (للحيز الأمامي القابض) والعصب الكعبري / الخلفي بين العظمين PIN (للحيز الخلفي الباسط)";
      action = "قبض وبسط الرسغ والأصابع، وكب وبسط الساعد (Pronation & Supination)";
      clinical = "التهاب اللقيمة الوحشية (Tennis elbow) يصيب منشأ الباسطات (وخاصة ECRB)، بينما التهاب اللقيمة الإنسية (Golfer’s elbow) يصيب منشأ القابضات.";
    } else if (/shoulder|scapula|deltoid|pectoral|clavic|spinatus|teres|latissimus|rhomboid|serratus|brachii|brachialis|coracobrachialis|anconeus/.test(text)) {
      origin = "الحزام الكتفي (الترقوة ولوح الكتف) أو القفص الصدري وعظم العضد";
      insertion = "الحدبة الكبرى/الصغرى للعضد، عظم الكعبرة والزند، أو الحافة الإنسية للوح الكتف";
      nerve = "فروع الضفيرة العضدية — Brachial plexus (C5–T1: الإبطي، العضلي الجلدي، الكعبري، فوق الكتفي، الصدري الطويل)";
      action = "تثبيت وتحريك مفصل الكتف والمرفق في جميع المستويات";
      clinical = "كفة المدبرات (Rotator cuff - SITS) تثبت رأس العضد داخل الجوف الحقاني؛ وتر فوق الشوكة (Supraspinatus) هو الأكثر عرضة للتمزق.";
    } else if (/glute|piriformis|obturator|gemellus|quadratus femoris|tensor fasciae|iliopsoas|psoas|iliacus/.test(text)) {
      origin = "الحرقفة، العجز، الفقرات القطنية، أو الثقبة السدادية";
      insertion = "المدور الكبير أو الصغير لعظم الفخذ (Greater/Lesser trochanter) والسبيل الحرقفي الظنبوبي";
      nerve = "الأعصاب الألوية العلوي والسفلي (L4–S2)، العصب الفخذي (L2–L4)، وفروع الضفيرة العجزية";
      action = "بسط وتبعيد ودوران الفخذ وتثبيت الحوض أثناء المشي";
      clinical = "إصابة العصب الألوي العلوي (L4–S1) تضعف الألوية الوسطى والصغرى مما يؤدي لعلامة ترندلنبورغ الإيجابية (Trendelenburg gait) وهبوط الحوض في الجهة المقابلة.";
    } else if (/femoris|vastus|sartorius|pectineus|gracilis|adductor|semitendinosus|semimembranosus|thigh/.test(text)) {
      origin = "الشوكة الحرقفية، عظم العانة، الحدبة الإسكية، أو جسم عظم الفخذ";
      insertion = "الرضفة والأحدوبة الظنبوبية، الخط الخشن للفخذ (Linea aspera)، أو أعلى الظنبوب والشظية";
      nerve = "العصب الفخذي (للحيز الأمامي)، العصب السدادي (للحيز الإنسي المقرب)، والعصب الوركي (للحيز الخلفي)";
      action = "بسط وقبض الركبة، وتقريب وثني الفخذ";
      clinical = "أوتار الخياطية والرشيقة ونصف الوترية (SGT) تجتمع لتكوين قدم الإوزة (Pes anserinus) على السطح الأنسي العلوي للظنبوب.";
    } else if (/tibialis|fibularis|peroneus|gastrocnemius|soleus|plantaris|popliteus|hallucis|foot|plantae/.test(text)) {
      origin = "عظمي الظنبوب والشظية والغشاء بين العظمين وعظام رسغ القدم";
      insertion = "عظام رسغ القدم، الأمشاط (Metatarsals)، وسلاميات أصابع القدم";
      nerve = "العصب الشظوي العميق (حيز أمامي)، الشظوي السطحي (حيز وحشي)، والعصب الظنبوبي/الأخمصي الإنسي والوحشي (حيز خلفي وأخمص القدم)";
      action = "العطف الظهري والأخمصي للكاحل، الشتر للداخل والخارج (Inversion & Eversion)، ودعم أقواس القدم";
      clinical = "إصابة العصب الشظوي المشترك عند عنق الشظية تسبب سقوط القدم (Foot drop) ومشية الخطو العالي (Steppage gait) مع خدر ظهر القدم.";
    }

    return {
      details: [
        {
          label: "Nomenclature & Hierarchy",
          label_ar: "التسمية والتصنيف التشريحي",
          value: `${organ.name_en} (${organ.ta2_latin || "TA2"}) · ${pathStr}`,
        },
        {
          label: "Compartment & Origin",
          label_ar: "المنشأ (Origin)",
          value: `Proximal bony/fascial attachment within ${pathStr}`,
          value_ar: origin,
        },
        {
          label: "Insertion",
          label_ar: "المرتكز (Insertion)",
          value: `Distal tendinous insertion acting across the corresponding joint (${organ.name_en})`,
          value_ar: insertion,
        },
        {
          label: "Motor Innervation & Action",
          label_ar: "التعصيب والوظيفة",
          value: `Regional motor nerve supply & synergistic action within ${pathStr}`,
          value_ar: `${nerve} — ${action}`,
        },
      ],
      clinical: `High-yield surgical and clinical landmark within ${pathStr}. Use Isolate, Hide, or '+ Nerves, Vessels & Lymph' to inspect its neurovascular supply.`,
      clinical_ar: clinical,
    };
  }

  if (organ.system === "lymphatic") {
    let keyAnat = `${organ.name_en} (${organ.ta2_latin || "Terminologia Anatomica"}) — regional lymphatic structure within ${pathStr}.`;
    let relations = `Located along the neurovascular bundle of ${pathStr}; receives afferent lymphatics from its regional drainage basin.`;
    let surg = `Important regional lymphatic station for staging and surgical dissection of ${organ.name_en}.`;
    let surgAr = `محطة عقدية ليمفاوية إقليمية هامة للتصنيف الجراحي والتشخيص السريري لـ (${organ.name_en}).`;

    if (/supratrochlear|cubital|epitrochlear/.test(text)) {
      keyAnat = "Superficial medial aspect of the elbow (~4–5 cm superior to the medial epicondyle of the humerus) in superficial fascia alongside the basilic vein; receives afferent lymphatics from the ulnar side of the hand (ring & little fingers, ulnar palm) and medial forearm.";
      relations = "Medial to biceps brachii and brachial vessels; superficial to the deep fascia above the medial epicondyle; efferents accompany the basilic vein to pierce the deep fascia and drain into lateral (humeral) and central axillary lymph nodes.";
      surg = "Palpated just above the medial epicondyle with the elbow flexed at 90°; enlarged in infections of the ulnar hand/4th–5th digits, cat-scratch disease (Bartonella henselae), secondary syphilis (classic epitrochlear lymphadenopathy), and non-Hodgkin lymphoma.";
      surgAr = "تقع العقد فوق البكرية (Supratrochlear / Cubital nodes) في اللفافة السطحية أعلى اللقيمة الإنسية للعضد بـ 4–5 سم بجوار الوريد البازلي، وتستقبل الليمف من الإصبعين الرابع والخامس والحافة الزندية لليد والساعد، ثم تصب في العقد الإبطية الوحشية؛ تتضخم في التهابات الجانب الزندي لليد ومرض خدش القطة والزهري الثانوي والليمفوما.";
    } else if (/deltopectoral|infraclavicular/.test(text)) {
      keyAnat = "Located in the deltopectoral groove (clavipectoral triangle) alongside the cephalic vein just inferior to the clavicle; receives superficial lymphatics from the radial/lateral side of the upper limb (thumb, index finger, lateral forearm/arm).";
      relations = "Lies between pectoralis major and deltoid along the cephalic vein; efferent vessels pierce the clavipectoral fascia to drain directly into the apical axillary and supraclavicular lymph nodes.";
      surg = "Can serve as a direct skip-metastasis station from radial upper-limb melanoma or breast lesions directly to the apical axillary (Level III) nodes via the clavipectoral fascia.";
      surgAr = "تقع العقد الدالية الصدرية (Deltopectoral nodes) في الميزابة الدالية الصدرية بجوار الوريد الرأسي أسفل الترقوة، وتستقبل الليمف السطحي من الجانب الكعبري للطرف العلوي (الإبهام والسبابة) وتخترق اللفافة الترقوية الصدرية لتصب مباشرة في العقد الإبطية القمية.";
    } else if (/parasternal|internal thoracic|internal mammary/.test(text)) {
      keyAnat = "Arranged along the internal thoracic (mammary) vessels at the anterior ends of the 1st–6th intercostal spaces deep to the costal cartilages; receives afferents from the medial breast quadrants, deep anterior thoracic wall, pleura, and upper rectus sheath.";
      relations = "Posterior to the costal cartilages and internal intercostal muscles, anterior to the endothoracic fascia and parietal pleura, directly alongside the internal thoracic artery and vein.";
      surg = "Second major lymphatic drainage pathway of the breast (~20–25% of breast lymph); critical in staging medial-quadrant breast carcinoma and internal mammary sentinel lymph node mapping.";
      surgAr = "تقع العقد جانب القصية (Parasternal / Internal thoracic nodes) على امتداد الأوعية الصدرية الغائرة خلف الغضاريف الضلعية، وتستقبل 20–25% من ليمف الثدي (الربعين الإنسيين) وجدار الصدر الأمامي لتصب في الجذع القصبي المنصفي.";
    } else if (/bronchopulmonary|tracheobronchial|mediastinal|paratracheal|azygos|ligamentum arteriosum|pulmonary/.test(text)) {
      keyAnat = "Intrathoracic lymph node stations positioned at the pulmonary hilum (bronchopulmonary/hilar nodes), carinal bifurcation (inferior tracheobronchial), and along the trachea and great vessels in the mediastinum.";
      relations = "Closely related to the main bronchi, pulmonary arteries/veins, carina, trachea, phrenic nerves, and left recurrent laryngeal nerve (especially the node of ligamentum arteriosum); drains into the bronchomediastinal trunks.";
      surg = "Staged systematically during lung cancer surgery (N1 ipsilateral hilar/bronchopulmonary vs N2 ipsilateral mediastinal/subcarinal nodes); enlargement near the aortic arch can compress the left recurrent laryngeal nerve causing hoarseness.";
      surgAr = "تتوزع العقد القصبية الرئوية والمنصفية عند سرة الرئة (Hilar N1) وتفرع القصبة الهوائية (Carina N2) وحول الرغامى، وتصب في الجذعين القصبيين المنصفيين؛ تضخم عقدة الرباط الشرياني قد يضغط على العصب الحنجري الراجع الأيسر مسبباً بحة الصوت.";
    } else if (/celiac|gastric|pyloric|hepatic|pancreaticosplenic|mesenteric|ileocolic|mesocolic|appendicular|colic/.test(text)) {
      keyAnat = "Preaortic and intermediate visceral abdominal lymph nodes arranged along the celiac trunk, superior mesenteric artery (SMA), and inferior mesenteric artery (IMA) and their mesenteries.";
      relations = "Follows the arterial arcades of the foregut (celiac nodes), midgut (superior mesenteric & ileocolic nodes), and hindgut (inferior mesenteric nodes); efferents unite to form the intestinal lymph trunk entering the cisterna chyli.";
      surg = "Defines oncological resection margins in gastrointestinal surgery: D2 lymphadenectomy along celiac/hepatic/splenic branches in gastric cancer, and high vascular ligation with complete mesocolic excision (CME) in colorectal cancer.";
      surgAr = "تتوزع العقد الحشوية البطنية حول فروع الشريان البطني (الزلاقي) والمساريقي العلوي والسفلي، وتجمع ليمف القناة الهضمية لتشكيل الجذع المعوي الذي يصب في صهريج الكيلوس؛ تحدد مدى التجريف الليمفاوي الجراحي في أورام المعدة والقولون.";
    } else if (/lumbar|aortic|caval|preaortic|retroaortic|lateral aortic/.test(text)) {
      keyAnat = "Para-aortic (lateral aortic, preaortic, retroaortic) and pericaval lymph nodes extending from L1 to L4 along the abdominal aorta and inferior vena cava.";
      relations = "Receives direct afferent lymphatics from the kidneys, suprarenal glands, testes and ovaries (accompanying the gonadal vessels directly to L1–L2 para-aortic nodes), uterine fundus, and common iliac nodes; efferents form the right and left lumbar trunks.";
      surg = "Testicular and ovarian malignancies metastasize directly to the lumbar (para-aortic) lymph nodes at the renal hilum level (L1–L2) along the gonadal vessels—never to the inguinal nodes unless the scrotal skin is breached.";
      surgAr = "تقع العقد القطنية (جانب الأبهري وحول الأجوف السفلي) من L1 إلى L4، وتستقبل التصريف الليمفاوي المباشر من الكليتين والخصيتين والمبيضين (عبر الأوعية التناسلية مباشرة إلى مستوى L1–L2)؛ تنتشر أورام الخصية والمبيض إليها مباشرة.";
    } else if (/iliac|sacral|obturator|paravesical|pararectal|parametrial/.test(text)) {
      keyAnat = "Pelvic lymph node chains arranged along the external iliac, internal iliac (hypogastric), and common iliac vessels and within the presacral space.";
      relations = "External iliac nodes receive deep inguinal and lower abdominal wall lymph; internal iliac & sacral nodes drain pelvic viscera (urinary bladder, prostate, cervix, upper vagina, rectum); both unite at common iliac nodes → lumbar nodes.";
      surg = "Pelvic lymph node dissection (PLND) in radical prostatectomy, radical cystectomy, and Wertheim radical hysterectomy removes external/internal iliac and obturator node packets while carefully preserving the obturator nerve and ureters.";
      surgAr = "تمتد العقد الحرقفية (الخارجية والداخلية والمشتركة) والعجزية على طول الأوعية الحرقفية، وتستقبل ليمف الطرف السفلي وأحشاء الحوض (المثانة، البروستاتا، عنق الرحم، المستقيم)؛ تُجرف جراحياً في استئصال أورام الحوض مع الحفاظ على العصب السدادي والحالب.";
    } else if (/popliteal|tibial|fibular/.test(text)) {
      keyAnat = "Lower-limb deep lymph nodes embedded in the popliteal fossa fat along the popliteal vessels and at the saphenopopliteal junction (plus anterior/posterior tibial nodes).";
      relations = "Receives superficial lymphatics accompanying the small saphenous vein from the lateral foot, heel, and posterior calf, plus deep lymphatics from the knee joint and leg; efferents ascend alongside the femoral vessels to the deep inguinal nodes.";
      surg = "Examined by deep palpation of the popliteal fossa with the knee flexed; enlarged in infections or melanoma of the lateral foot, heel, and posterior calf.";
      surgAr = "تقع العقد المأبضية والظنبوبية في الحفرة المأبضية بجوار الأوعية المأبضية وعند مصب الوريد الصافن الصغير، وتستقبل الليمف من الجانب الوحشي للقدم والعقب وخلف الساق لتصعد إلى العقد الإربية العميقة.";
    }

    return {
      details: [
        {
          label: "Key anatomy",
          label_ar: "المعالم التشريحية والتصريف (Anatomical Landmarks & Drainage)",
          value: keyAnat,
        },
        {
          label: "Relations",
          label_ar: "العلاقات التشريحية المحيطة (Relations)",
          value: relations,
        },
        {
          label: "Surgical anatomy",
          label_ar: "التشريح الجراحي والسريري (Surgical Anatomy)",
          value: surg,
        },
      ],
      clinical: surg,
      clinical_ar: surgAr,
    };
  }

  if (organ.system === "nervous") {
    return {
      details: [
        {
          label: "Course",
          label_ar: "المسار التشريحي (Course)",
          value: `Courses through ${pathStr} (${organ.ta2_latin || organ.name_en}) along its regional neurovascular compartment.`,
          value_ar: `يسير ضمن (${pathStr}) في مساره التشريحي الدقيق برفقة الحزمة الوعائية العصبية الإقليمية.`,
        },
        {
          label: "Supply / function",
          label_ar: "التغذية العصبية والوظيفة (Supply & Innervation)",
          value: `Provides specialized motor, sensory, or central integrative innervation within ${pathStr}.`,
          value_ar: `يوفر التغذية العصبية الحركية أو الحسية أو التكامل العصبي المركزي ضمن (${pathStr}).`,
        },
        {
          label: "Blood supply",
          label_ar: "التغذية الدموية (Vasa Nervorum / Cerebral Vessels)",
          value: deriveBloodSupply(organ.name_en, pathStr),
        },
        {
          label: "Surgical anatomy",
          label_ar: "التشريح الجراحي (Surgical Anatomy)",
          value: `Preserve ${organ.name_en} and its vasa nervorum during regional surgical dissection across ${pathStr}.`,
          value_ar: `يجب تحديد وحماية (${organ.name_en}) وترويته الدقيقة أثناء التسليخ الجراحي في منطقة (${pathStr}).`,
        },
      ],
      clinical: `High-yield neuroanatomical and surgical landmark within (${pathStr}).`,
      clinical_ar: `معلم عصبي وجراحي دقيق ضمن (${pathStr}).`,
    };
  }

  // Non-muscular systems (Skeletal, Articular, Viscera, Vessels): specific anatomical details & clinical pearls
  return {
    details: [
      {
        label: "Key anatomy",
        label_ar: "الخصائص التشريحية (Key Anatomy)",
        value: `${organ.name_en} (${organ.ta2_latin || "Terminologia Anatomica"}) — structural component of ${pathStr}.`,
      },
      {
        label: "Relations",
        label_ar: "العلاقات المجاورة والمفاصل (Relations & Articulations)",
        value: `Located within ${pathStr}; articulates and interfaces with adjacent anatomical structures in its regional compartment.`,
      },
      {
        label: "Blood supply",
        label_ar: "التغذية الدموية (Blood Supply)",
        value: deriveBloodSupply(organ.name_en, pathStr),
      },
      {
        label: "Surgical anatomy",
        label_ar: "التشريح الجراحي (Surgical Anatomy)",
        value: `Critical anatomical and surgical landmark within ${pathStr}; preserve periosteal/capsular blood supply and adjacent neurovascular bundles during exposure.`,
      },
    ],
    clinical: `Key anatomical and surgical structure within (${pathStr}); use Isolate, Hide, or '+ Nerves, Vessels & Lymph' to inspect its adjacent relations and neurovascular supply.`,
    clinical_ar: `معلم تشريحي وجراحي دقيق ضمن (${pathStr})؛ يمكن عزله أو إخفاؤه أو استكشاف علاقاته وترويته الدموية وتعصيبه المباشر.`,
  };
}

/**
 * Matches a full ManifestOrgan (checking name_en, node, ta2_latin, path, and system)
 * so EVERY SINGLE clickable 3D muscle and organ resolves to a rich, personalized
 * anatomical knowledge card with its exact Arabic & English name and unique ID.
 */
export function matchOrganToEntry(
  organOrId:
    | {
        organ_id?: string;
        name_en: string;
        ta2_latin?: string;
        node?: string;
        system?: string;
        path?: string[];
      }
    | string
    | null
    | undefined,
  nameEnArg?: string,
  ta2LatinArg?: string,
  systemArg?: string,
): UnifiedEntry | null {
  if (!organOrId) return null;
  const organ =
    typeof organOrId === "string"
      ? {
          organ_id: organOrId,
          name_en: nameEnArg ?? organOrId,
          ta2_latin: ta2LatinArg,
          system: systemArg,
        }
      : organOrId;
  if (!organ.name_en) return null;

  const directMatch =
    matchMeshToEntry(organ.name_en) ??
    (organ.node ? matchMeshToEntry(organ.node) : null) ??
    (organ.ta2_latin ? matchMeshToEntry(organ.ta2_latin) : null);

  const uniqueId = organ.organ_id || `${organ.system ?? "org"}_${organ.name_en}`;
  const pathGroup =
    organ.path && organ.path.length > 0
      ? organ.path.slice(-2).join(" › ")
      : directMatch?.group ?? organ.system ?? "Anatomy";

  if (directMatch) {
    const specificAr = translateOrganTitleAr(
      organ.name_en,
      organ.system,
      directMatch.name_ar,
    );
    const hasClassificationRow = directMatch.details.some(
      (d) => d.label === "TA2 / Structure",
    );
    const enrichedDetails: DetailRow[] = hasClassificationRow
      ? directMatch.details
      : [
          {
            label: "TA2 / Structure",
            label_ar: "التركيب والاسم اللاتيني",
            value: `${organ.name_en}${organ.ta2_latin ? ` (${organ.ta2_latin})` : ""}`,
          },
          ...directMatch.details,
        ];
    return {
      ...directMatch,
      id: uniqueId,
      group: pathGroup,
      name_en: organ.name_en,
      name_ar: specificAr,
      details: enrichedDetails,
    };
  }

  const synthesized = buildSpecificOrganDetails(organ);
  return {
    id: uniqueId,
    system: (organ.system as PanelId) ?? "muscular",
    group: pathGroup,
    name_en: organ.name_en,
    name_ar: translateOrganTitleAr(organ.name_en, organ.system),
    details: synthesized.details,
    clinical: synthesized.clinical,
    clinical_ar: synthesized.clinical_ar,
  };
}

/* ───────────── Coverage report ───────────── */

export function coverageReport(meshNames: string[]) {
  const matched = new Set<string>();
  const unmatchedMeshes: string[] = [];
  for (const n of meshNames) {
    const e = matchMeshToEntry(n);
    if (e) matched.add(e.id);
    else unmatchedMeshes.push(n);
  }
  return {
    entriesTotal: ALL_KNOWLEDGE.length,
    entriesWithMesh: matched.size,
    entriesWithoutMesh: ALL_KNOWLEDGE.filter((e) => !matched.has(e.id)).map((e) => e.id),
    unmatchedMeshes,
  };
}
