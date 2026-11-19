'use client';

import * as THREE from "three";
import type { ManifestOrgan } from "@/lib/schemas";
import { matchOrganToEntry } from "@/lib/atlasKnowledgeIndex";
import type { BoneLandmark3D } from "./AnatomyScene";

export function sliceSubdividedMuscleGeometry(
  baseGeom: THREE.BufferGeometry,
  nodeMatrix: THREE.Matrix4,
  organId: string,
): THREE.BufferGeometry | null {
  const SUBDIVIDED_IDS = new Set([
    "rectus_abdominis_sup_l",
    "rectus_abdominis_sup_r",
    "rectus_abdominis_upmid_l",
    "rectus_abdominis_upmid_r",
    "rectus_abdominis_lowmid_l",
    "rectus_abdominis_lowmid_r",
    "rectus_abdominis_muscle_l",
    "rectus_abdominis_muscle_r",
    "external_abdominal_oblique_sup_l",
    "external_abdominal_oblique_sup_r",
    "external_abdominal_oblique_muscle_l",
    "external_abdominal_oblique_muscle_r",
    "internal_abdominal_oblique_sup_l",
    "internal_abdominal_oblique_sup_r",
    "internal_abdominal_oblique_muscle_l",
    "internal_abdominal_oblique_muscle_r",
    "latissimus_dorsi_vertebral_l",
    "latissimus_dorsi_vertebral_r",
    "latissimus_dorsi_costal_l",
    "latissimus_dorsi_costal_r",
    "latissimus_dorsi_muscle_l",
    "latissimus_dorsi_muscle_r",
  ]);
  const isDistalTendon = organId.startsWith("skel_tendon_distal_");
  // Keep every muscle belly 100% intact and solid (خلي كل جز بحاله مصمت مش الياف بيعدي منها ضوء); only slice distal tendons for Skeletal view
  if (!isDistalTendon) return null;

  const posAttr = baseGeom.attributes.position as THREE.BufferAttribute | undefined;
  if (!posAttr || posAttr.count < 3) return null;

  const wBox = new THREE.Box3();
  const vTmp = new THREE.Vector3();
  const worldVerts = new Float32Array(posAttr.count * 3);
  for (let i = 0; i < posAttr.count; i++) {
    vTmp.fromBufferAttribute(posAttr, i).applyMatrix4(nodeMatrix);
    worldVerts[i * 3] = vTmp.x;
    worldVerts[i * 3 + 1] = vTmp.y;
    worldVerts[i * 3 + 2] = vTmp.z;
    wBox.expandByPoint(vTmp);
  }

  const yMin = wBox.min.y;
  const ySpan = Math.max(wBox.max.y - yMin, 1e-4);
  const xMinAbs = Math.min(Math.abs(wBox.min.x), Math.abs(wBox.max.x));
  const xMaxAbs = Math.max(Math.abs(wBox.min.x), Math.abs(wBox.max.x));
  const xSpanAbs = Math.max(xMaxAbs - xMinAbs, 1e-4);

  let yLow = 0;
  let yHigh = 1;
  let trimMedialRectus = false;
  let trimMedialParaspinal = false;
  let grooveCuts: number[] = [];

  if (organId.startsWith("rectus_abdominis_sup_")) {
    yLow = 0.74; yHigh = 1.01; grooveCuts = [0.74];
  } else if (organId.startsWith("rectus_abdominis_upmid_")) {
    yLow = 0.49; yHigh = 0.74; grooveCuts = [0.49, 0.74];
  } else if (organId.startsWith("rectus_abdominis_lowmid_")) {
    yLow = 0.27; yHigh = 0.49; grooveCuts = [0.27, 0.49];
  } else if (organId.startsWith("rectus_abdominis_muscle_")) {
    yLow = -0.01; yHigh = 0.27; grooveCuts = [0.27];
  } else if (organId.startsWith("external_abdominal_oblique_sup_")) {
    yLow = 0.48; yHigh = 1.01; trimMedialRectus = true; grooveCuts = [0.48];
  } else if (organId.startsWith("external_abdominal_oblique_muscle_")) {
    yLow = -0.01; yHigh = 0.48; trimMedialRectus = true; grooveCuts = [0.48];
  } else if (organId.startsWith("internal_abdominal_oblique_sup_")) {
    yLow = 0.50; yHigh = 1.01; trimMedialRectus = true; grooveCuts = [0.50];
  } else if (organId.startsWith("internal_abdominal_oblique_muscle_")) {
    yLow = -0.01; yHigh = 0.50; trimMedialRectus = true; grooveCuts = [0.50];
  } else if (organId.startsWith("latissimus_dorsi_vertebral_")) {
    yLow = 0.62; yHigh = 1.01; trimMedialParaspinal = true; grooveCuts = [0.62];
  } else if (organId.startsWith("latissimus_dorsi_costal_")) {
    yLow = 0.32; yHigh = 0.62; trimMedialParaspinal = true; grooveCuts = [0.32, 0.62];
  } else if (organId.startsWith("latissimus_dorsi_muscle_")) {
    yLow = -0.01; yHigh = 0.32; trimMedialParaspinal = true; grooveCuts = [0.32];
  } else if (organId.startsWith("skel_tendon_distal_patellar_")) {
    yLow = -0.01; yHigh = 0.088;
  } else if (organId.startsWith("skel_tendon_distal_quadriceps_")) {
    yLow = 0.088; yHigh = 0.25;
  } else if (isDistalTendon) {
    yLow = -0.01; yHigh = 0.24;
  }

  const indexAttr = baseGeom.index;
  const triCount = indexAttr ? Math.floor(indexAttr.count / 3) : Math.floor(posAttr.count / 3);
  const keptIndices: number[] = [];

  for (let t = 0; t < triCount; t++) {
    const a = indexAttr ? indexAttr.getX(t * 3) : t * 3;
    const b = indexAttr ? indexAttr.getX(t * 3 + 1) : t * 3 + 1;
    const c = indexAttr ? indexAttr.getX(t * 3 + 2) : t * 3 + 2;

    const cx = (worldVerts[a * 3]! + worldVerts[b * 3]! + worldVerts[c * 3]!) / 3;
    const cy = (worldVerts[a * 3 + 1]! + worldVerts[b * 3 + 1]! + worldVerts[c * 3 + 1]!) / 3;
    const cz = (worldVerts[a * 3 + 2]! + worldVerts[b * 3 + 2]! + worldVerts[c * 3 + 2]!) / 3;

    const yFrac = (cy - yMin) / ySpan;
    const xFrac = (Math.abs(cx) - xMinAbs) / xSpanAbs;

    if (yFrac < yLow || yFrac > yHigh) continue;
    // Trim anterior medial aponeurosis over Rectus Abdominis so Rectus 8 segments are uncovered
    if (trimMedialRectus && Math.abs(cx) < 0.064 && cz > wBox.min.z + (wBox.max.z - wBox.min.z) * 0.45) {
      continue;
    }
    // Trim medial thoracolumbar aponeurosis window so Erector spinae columns are uncovered on the back
    if (trimMedialParaspinal && xFrac < 0.24 && yFrac < 0.60) {
      continue;
    }
    keptIndices.push(a, b, c);
  }

  if (keptIndices.length < 9) return null;

  const sliced = baseGeom.clone();
  sliced.setIndex(keptIndices);

  // Indent vertices along tendinous intersection / subdivision boundaries to form deep shadow grooves
  if (grooveCuts.length > 0) {
    const invMat = nodeMatrix.clone().invert();
    const sPos = sliced.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < sPos.count; i++) {
      const wx = worldVerts[i * 3]!;
      const wy = worldVerts[i * 3 + 1]!;
      let wz = worldVerts[i * 3 + 2]!;
      const yf = (wy - yMin) / ySpan;
      for (const cut of grooveCuts) {
        const dist = Math.abs(yf - cut);
        if (dist < 0.026) {
          const indent = (1 - dist / 0.026) * 0.0028;
          wz += wz >= 0 ? -indent : indent;
        }
      }
      vTmp.set(wx, wy, wz).applyMatrix4(invMat);
      sPos.setXYZ(i, vTmp.x, vTmp.y, vTmp.z);
    }
    sPos.needsUpdate = true;
    sliced.computeVertexNormals();
  }

  sliced.computeBoundingBox();
  sliced.computeBoundingSphere();
  return sliced;
}

/**
 * Generates interactive 3D Key Anatomy Landmarks & Notches for any selected bone,
 * snapping each landmark to the nearest actual vertex on the bone's 3D surface.
 */
export function buildBoneLandmarks3D(
  organ: ManifestOrgan,
  geom: THREE.BufferGeometry,
  matrix: THREE.Matrix4,
  worldBox: THREE.Box3,
): BoneLandmark3D[] {
  const n = `${organ.ta2_latin} ${organ.name_en}`.toLowerCase();
  const isRight = /(right|dexter|\.r)/i.test(n);
  const latSign = isRight ? -1 : 1; // In Z-Anatomy world space, +X is Left, -X is Right

  interface RawSpec {
    id: string;
    name_en: string;
    name_ar: string;
    kind: "notch" | "landmark";
    description: string;
    // Normalized coordinates within worldBox: nx in [-1 (medial), +1 (lateral)], ny in [0 (inferior), 1 (superior)], nz in [0 (posterior), 1 (anterior)]
    nx: number;
    ny: number;
    nz: number;
  }

  const specs: RawSpec[] = [];

  if (/scapula/i.test(n)) {
    specs.push(
      { id: "suprascapular_notch", name_en: "Suprascapular notch", name_ar: "الثلمة فوق الكتف (Suprascapular Notch)", kind: "notch", description: "Superior border notch medial to coracoid process; transmits suprascapular nerve under superior transverse scapular ligament.", nx: 0.25, ny: 0.88, nz: 0.55 },
      { id: "spinoglenoid_notch", name_en: "Spinoglenoid (Greater scapular) notch", name_ar: "الثلمة الشوكية الحقانية (Spinoglenoid Notch)", kind: "notch", description: "Connects supraspinous and infraspinous fossae lateral to root of spine; transmits suprascapular vessels and nerve.", nx: 0.72, ny: 0.72, nz: 0.35 },
      { id: "glenoid_cavity", name_en: "Glenoid cavity (fossa)", name_ar: "الجوف الحقاني (Glenoid Cavity)", kind: "landmark", description: "Lateral piriform articular fossa articulating with head of humerus; deepened by glenoid labrum.", nx: 0.95, ny: 0.74, nz: 0.55 },
      { id: "coracoid_process", name_en: "Coracoid process", name_ar: "الناتئ الغرابي (Coracoid Process)", kind: "landmark", description: "Hook-like anterior projection; attachment for pectoralis minor, coracobrachialis, and short head of biceps.", nx: 0.68, ny: 0.86, nz: 0.92 },
      { id: "acromion", name_en: "Acromion", name_ar: "الأخرم (Acromion)", kind: "landmark", description: "Lateral summit of spine of scapula overarching the shoulder joint; articulates with clavicle.", nx: 0.92, ny: 0.94, nz: 0.25 },
      { id: "spine_of_scapula", name_en: "Spine of scapula", name_ar: "شوكة لوح الكتف (Spine of Scapula)", kind: "landmark", description: "Oblique posterior ridge separating supraspinous and infraspinous fossae; attachment for trapezius and deltoid.", nx: 0.15, ny: 0.76, nz: 0.08 },
      { id: "inferior_angle_scapula", name_en: "Inferior angle of scapula", name_ar: "الزاوية السفلية للوح الكتف (Inferior Angle)", kind: "landmark", description: "Located at T7 vertebral level; attachment for teres major and serratus anterior.", nx: -0.55, ny: 0.06, nz: 0.35 },
    );
  } else if (/humerus/i.test(n)) {
    specs.push(
      { id: "head_humerus", name_en: "Head of humerus", name_ar: "رأس العضد (Head of Humerus)", kind: "landmark", description: "Hemispherical articular surface facing medially, superiorly, and posteriorly to articulate with glenoid cavity.", nx: -0.75, ny: 0.96, nz: 0.45 },
      { id: "surgical_neck_humerus", name_en: "Surgical neck of humerus", name_ar: "العنق الجراحي للعضد (Surgical Neck)", kind: "landmark", description: "Narrow constriction below tubercles; axillary nerve and posterior circumflex humeral artery wind posteriorly here.", nx: 0.0, ny: 0.84, nz: 0.45 },
      { id: "intertubercular_sulcus", name_en: "Intertubercular sulcus (Bicipital groove)", name_ar: "الثلم بين الحديبتين (Bicipital Groove)", kind: "notch", description: "Deep anterior groove between greater and lesser tubercles lodging long head of biceps tendon.", nx: 0.25, ny: 0.90, nz: 0.88 },
      { id: "deltoid_tuberosity", name_en: "Deltoid tuberosity", name_ar: "الأحدوبة الدالية (Deltoid Tuberosity)", kind: "landmark", description: "V-shaped lateral roughened elevation at mid-shaft for deltoid insertion.", nx: 0.65, ny: 0.54, nz: 0.55 },
      { id: "radial_groove", name_en: "Radial sulcus (Spiral groove)", name_ar: "ثلم العصب الكعبري (Radial Groove)", kind: "notch", description: "Oblique posterior groove lodging radial nerve and profunda brachii artery between lateral and medial heads of triceps.", nx: 0.15, ny: 0.50, nz: 0.12 },
      { id: "medial_epicondyle_humerus", name_en: "Medial epicondyle & ulnar nerve groove", name_ar: "اللقيمة الإنسية وثلم العصب الزندي", kind: "landmark", description: "Prominent medial projection for common flexor origin; ulnar nerve runs in groove posteriorly.", nx: -0.92, ny: 0.07, nz: 0.42 },
      { id: "trochlea_capitulum", name_en: "Trochlea, Capitulum & Olecranon fossa", name_ar: "البكرة والرويس والحفرة الزجية", kind: "notch", description: "Distal articular condyle (trochlea medially for ulna, capitulum laterally for radius) with deep olecranon fossa posteriorly.", nx: 0.10, ny: 0.03, nz: 0.50 },
    );
  } else if (/ulna/i.test(n)) {
    specs.push(
      { id: "trochlear_notch", name_en: "Trochlear (Semilunar) notch", name_ar: "الثلمة البكرية (Trochlear Notch)", kind: "notch", description: "Large C-shaped proximal wrench-like notch articulating with trochlea of humerus between olecranon and coronoid process.", nx: 0.0, ny: 0.93, nz: 0.78 },
      { id: "radial_notch_ulna", name_en: "Radial notch of ulna", name_ar: "الثلمة الكعبرية للزند (Radial Notch)", kind: "notch", description: "Concave lateral articular notch below trochlear notch for circumference of head of radius (proximal radioulnar joint).", nx: 0.75, ny: 0.88, nz: 0.62 },
      { id: "olecranon", name_en: "Olecranon", name_ar: "الناتئ الزجي (Olecranon)", kind: "landmark", description: "Proximal posterior beak of ulna; insertion of triceps brachii tendon.", nx: -0.1, ny: 0.98, nz: 0.18 },
      { id: "coronoid_process_ulna", name_en: "Coronoid process & Ulnar tuberosity", name_ar: "الناتئ الإكليلي وأحدوبة الزند", kind: "landmark", description: "Anterior shelf below trochlear notch; insertion of brachialis muscle.", nx: 0.0, ny: 0.87, nz: 0.88 },
      { id: "head_styloid_ulna", name_en: "Head of ulna & Ulnar styloid process", name_ar: "رأس الزند والناتئ الإبري الزندي", kind: "landmark", description: "Distal rounded head articulating with ulnar notch of radius and TFCC.", nx: -0.35, ny: 0.03, nz: 0.45 },
    );
  } else if (/radius/i.test(n)) {
    specs.push(
      { id: "ulnar_notch_radius", name_en: "Ulnar notch of radius", name_ar: "الثلمة الزندية للكعبرة (Ulnar Notch)", kind: "notch", description: "Concave medial notch at distal end of radius articulating with head of ulna (distal radioulnar joint).", nx: -0.85, ny: 0.06, nz: 0.48 },
      { id: "head_radius", name_en: "Head & Neck of radius", name_ar: "رأس وعنق الكعبرة (Head & Neck of Radius)", kind: "landmark", description: "Discoid proximal head encircled by annular ligament; articulates with capitulum and radial notch of ulna.", nx: 0.15, ny: 0.96, nz: 0.50 },
      { id: "radial_tuberosity", name_en: "Radial (Bicipital) tuberosity", name_ar: "الأحدوبة الكعبرية (Radial Tuberosity)", kind: "landmark", description: "Anteromedial prominence below neck; insertion of biceps brachii tendon.", nx: -0.55, ny: 0.84, nz: 0.72 },
      { id: "radial_styloid", name_en: "Radial styloid process & Lister's dorsal tubercle", name_ar: "الناتئ الإبري الكعبري وحديبة ليستر", kind: "landmark", description: "Lateral distal projection (1 cm lower than ulnar styloid) and dorsal pulley for extensor pollicis longus tendon.", nx: 0.88, ny: 0.02, nz: 0.35 },
    );
  } else if (/hip bone|os coxae|ilium|ischium|pubis|pelvis/i.test(n)) {
    specs.push(
      { id: "greater_sciatic_notch", name_en: "Greater sciatic notch", name_ar: "الثلمة الوركية الكبرى (Greater Sciatic Notch)", kind: "notch", description: "Deep posterior notch superior to ischial spine; converted into greater sciatic foramen transmitting piriformis & sciatic nerve.", nx: -0.35, ny: 0.48, nz: 0.15 },
      { id: "lesser_sciatic_notch", name_en: "Lesser sciatic notch", name_ar: "الثلمة الوركية الصغرى (Lesser Sciatic Notch)", kind: "notch", description: "Smooth posterior notch between ischial spine and ischial tuberosity; transmits obturator internus tendon and pudendal neurovascular bundle.", nx: -0.32, ny: 0.24, nz: 0.18 },
      { id: "acetabular_notch", name_en: "Acetabular notch & Acetabulum", name_ar: "ثلمة الحق والجوف الحقي (Acetabular Notch)", kind: "notch", description: "Inferior deficiency of lunate articular surface of acetabulum bridged by transverse acetabular ligament.", nx: 0.65, ny: 0.38, nz: 0.55 },
      { id: "iliac_crest_asis", name_en: "Iliac crest & ASIS", name_ar: "العرف الحرقفي والشوكة الحرقفية الأمامية العلوية", kind: "landmark", description: "Superior border of ilium (L4 level) ending anteriorly at ASIS (origin of sartorius and inguinal ligament).", nx: 0.75, ny: 0.92, nz: 0.82 },
      { id: "ischial_spine_tuberosity", name_en: "Ischial spine & Ischial tuberosity", name_ar: "الشوكة الوركية والأحدوبة الوركية", kind: "landmark", description: "Ischial spine separates greater and lesser sciatic notches (pudendal block landmark); tuberosity gives origin to hamstrings.", nx: -0.25, ny: 0.08, nz: 0.25 },
      { id: "pubic_tubercle_foramen", name_en: "Pubic tubercle & Obturator foramen", name_ar: "الحديبة العانية والثقبة السدادية", kind: "landmark", description: "Medial attachment of inguinal ligament above obturator foramen.", nx: -0.82, ny: 0.28, nz: 0.88 },
    );
  } else if (/femur/i.test(n)) {
    specs.push(
      { id: "intercondylar_notch", name_en: "Intercondylar fossa (notch)", name_ar: "الثلمة / الحفرة بين اللقمتين (Intercondylar Notch)", kind: "notch", description: "Deep posterior notch between medial and lateral femoral condyles housing ACL and PCL attachments.", nx: 0.0, ny: 0.05, nz: 0.15 },
      { id: "head_neck_femur", name_en: "Head & Neck of femur (Fovea capitis)", name_ar: "رأس وعنق الفخذ (Head & Neck of Femur)", kind: "landmark", description: "Spherical head articulating with acetabulum; intracapsular neck supplied by retinacular branches of medial circumflex femoral artery.", nx: -0.85, ny: 0.96, nz: 0.55 },
      { id: "greater_trochanter", name_en: "Greater trochanter & Trochanteric fossa", name_ar: "المدور الكبير (Greater Trochanter)", kind: "landmark", description: "Large lateral traction apophysis for gluteus medius, gluteus minimus, and piriformis.", nx: 0.82, ny: 0.92, nz: 0.45 },
      { id: "lesser_trochanter", name_en: "Lesser trochanter", name_ar: "المدور الصغير (Lesser Trochanter)", kind: "landmark", description: "Posteromedial conical projection at base of neck for iliopsoas tendon insertion.", nx: -0.52, ny: 0.79, nz: 0.25 },
      { id: "linea_aspera", name_en: "Linea aspera", name_ar: "الخط الخشن (Linea Aspera)", kind: "landmark", description: "Prominent longitudinal posterior ridge on mid-shaft with medial and lateral lips for adductors and vasti.", nx: 0.0, ny: 0.50, nz: 0.12 },
      { id: "condyles_adductor_tubercle", name_en: "Medial & Lateral condyles + Adductor tubercle", name_ar: "اللقمتان الإنسية والوحشية وحديبة المقربات", kind: "landmark", description: "Distal articular condyles for tibia and patella; adductor tubercle superior to medial epicondyle.", nx: -0.75, ny: 0.08, nz: 0.55 },
    );
  } else if (/tibia/i.test(n)) {
    specs.push(
      { id: "fibular_notch_tibia", name_en: "Fibular notch of tibia (Incisura fibularis)", name_ar: "الثلمة الشظوية للظنبوب (Fibular Notch)", kind: "notch", description: "Distal lateral triangular concavity receiving distal fibula to form the tibiofibular syndesmosis.", nx: 0.85, ny: 0.06, nz: 0.45 },
      { id: "tibial_plateau_eminence", name_en: "Medial & Lateral condyles + Intercondylar eminence", name_ar: "لقمتا الظنبوب والبارزة بين اللقمتين", kind: "landmark", description: "Proximal tibial plateau bearing medial and lateral menisci and cruciate ligament attachments.", nx: 0.0, ny: 0.97, nz: 0.50 },
      { id: "tibial_tuberosity", name_en: "Tibial tuberosity", name_ar: "الأحدوبة الظنبوبية (Tibial Tuberosity)", kind: "landmark", description: "Anterior proximal elevation where patellar ligament (quadriceps mechanism) inserts.", nx: 0.05, ny: 0.86, nz: 0.92 },
      { id: "soleal_line", name_en: "Soleal line", name_ar: "الخط النعلي (Soleal Line)", kind: "landmark", description: "Oblique posterior ridge on upper third of tibia; origin of soleus and lower border of popliteus.", nx: 0.0, ny: 0.72, nz: 0.15 },
      { id: "medial_malleolus", name_en: "Medial malleolus", name_ar: "الكعب الإنسي (Medial Malleolus)", kind: "landmark", description: "Distal medial projection articulating with talus and anchoring deltoid ligament.", nx: -0.88, ny: 0.02, nz: 0.55 },
    );
  } else if (/sternum|manubrium|xiphoid/i.test(n)) {
    specs.push(
      { id: "jugular_notch", name_en: "Jugular (Suprasternal) notch", name_ar: "الثلمة الوداجية / فوق القص (Jugular Notch)", kind: "notch", description: "Superior midline notch of manubrium at T2–T3 vertebral level between medial ends of clavicles.", nx: 0.0, ny: 0.98, nz: 0.65 },
      { id: "clavicular_notch", name_en: "Clavicular notch", name_ar: "الثلمة الترقوية (Clavicular Notch)", kind: "notch", description: "Superolateral oval articular notch on manubrium for sternoclavicular joint.", nx: 0.78, ny: 0.94, nz: 0.60 },
      { id: "sternal_angle", name_en: "Sternal angle (Angle of Louis)", name_ar: "الزاوية القصية - زاوية لويس (Sternal Angle)", kind: "landmark", description: "Manubriosternal junction at T4–T5 level; marks 2nd costal cartilage, tracheal bifurcation, and aortic arch.", nx: 0.0, ny: 0.72, nz: 0.85 },
      { id: "costal_notches", name_en: "Costal notches (1st–7th)", name_ar: "الثلمات الضلعية (Costal Notches)", kind: "notch", description: "Lateral indentations along manubrium and sternal body receiving costal cartilages of true ribs 1–7.", nx: 0.82, ny: 0.45, nz: 0.60 },
      { id: "xiphoid_process_lm", name_en: "Xiphoid process", name_ar: "الناتئ الرهابي (Xiphoid Process)", kind: "landmark", description: "Inferior cartilaginous/ossified tip at T9–T10 level; attachment for linea alba and diaphragm.", nx: 0.0, ny: 0.05, nz: 0.45 },
    );
  } else if (/mandib/i.test(n)) {
    specs.push(
      { id: "mandibular_notch", name_en: "Mandibular notch (Incisura mandibulae)", name_ar: "ثلمة الفك السفلي (Mandibular Notch)", kind: "notch", description: "Deep superior concavity on ramus between condylar and coronoid processes; transmits masseteric nerve and vessels.", nx: 0.85, ny: 0.84, nz: 0.35 },
      { id: "condylar_process", name_en: "Condylar process (Head of mandible)", name_ar: "الناتئ اللقمي ورأس الفك السفلي", kind: "landmark", description: "Posterior process of ramus articulating with temporal bone at the temporomandibular joint (TMJ).", nx: 0.92, ny: 0.95, nz: 0.15 },
      { id: "coronoid_process_mandible", name_en: "Coronoid process of mandible", name_ar: "الناتئ الإكليلي للفك السفلي", kind: "landmark", description: "Anterior triangular process of ramus for insertion of temporalis muscle.", nx: 0.82, ny: 0.92, nz: 0.52 },
      { id: "angle_of_mandible", name_en: "Angle of mandible & Masseteric tuberosity", name_ar: "زاوية الفك السفلي (Angle of Mandible)", kind: "landmark", description: "Junction of posterior border of ramus and inferior border of body; masseter inserts laterally, medial pterygoid medially.", nx: 0.88, ny: 0.25, nz: 0.22 },
      { id: "mental_foramen", name_en: "Mental foramen & Chin symphysis", name_ar: "الثقبة الذقنية والارتفاق الذقني", kind: "notch", description: "Anterolateral opening below 2nd premolar transmitting mental nerve and vessels.", nx: 0.35, ny: 0.28, nz: 0.88 },
    );
  } else if (/frontal|crani|occipital|temporal|sphenoid|maxilla/i.test(n)) {
    specs.push(
      { id: "supraorbital_notch", name_en: "Supraorbital notch / foramen", name_ar: "الثلمة / الثقبة فوق الحجاج (Supraorbital Notch)", kind: "notch", description: "Notch at junction of medial 1/3 and lateral 2/3 of supraorbital margin transmitting supraorbital nerve & vessels.", nx: 0.38, ny: 0.32, nz: 0.92 },
      { id: "cranial_notch_main", name_en: "Jugular / Mastoid / Nasal notch", name_ar: "الثلمة القحفية (Jugular / Mastoid / Nasal Notch)", kind: "notch", description: "Key cranial osteological notch transmitting neurovascular structures at the cranial base or orbit.", nx: 0.22, ny: 0.15, nz: 0.55 },
      { id: "glabella_superciliary", name_en: "Prominent osteological eminence / process", name_ar: "البارزة العظمية والناتئ المفصلي", kind: "landmark", description: "Primary surface landmark and muscular/ligamentous attachment site.", nx: 0.0, ny: 0.65, nz: 0.88 },
    );
  } else if (/vertebra|atlas|axis|sacrum/i.test(n)) {
    specs.push(
      { id: "sup_vertebral_notch", name_en: "Superior vertebral notch", name_ar: "الثلمة الفقرية العلوية (Superior Vertebral Notch)", kind: "notch", description: "Shallow notch on superior border of pedicle; forms intervertebral foramen with inferior notch of vertebra above.", nx: 0.45, ny: 0.85, nz: 0.52 },
      { id: "inf_vertebral_notch", name_en: "Inferior vertebral notch", name_ar: "الثلمة الفقرية السفلية (Inferior Vertebral Notch)", kind: "notch", description: "Deep notch on inferior border of pedicle; bounds the intervertebral foramen for the exiting spinal nerve root.", nx: 0.45, ny: 0.18, nz: 0.52 },
      { id: "vertebral_body_promontory", name_en: "Vertebral body / Anterior surface", name_ar: "جسم الفقرة (Vertebral Body)", kind: "landmark", description: "Weight-bearing anterior cylinder joined by intervertebral discs and anterior/posterior longitudinal ligaments.", nx: 0.0, ny: 0.50, nz: 0.88 },
      { id: "spinous_process", name_en: "Spinous process", name_ar: "الناتئ الشوكي (Spinous Process)", kind: "landmark", description: "Posterior midline projection from junction of laminae; attachment for supraspinous/interspinous ligaments and erector spinae.", nx: 0.0, ny: 0.35, nz: 0.06 },
      { id: "transverse_articular_process", name_en: "Transverse & Articular processes", name_ar: "الناتئ المستعرض والناتئ المفصلي", kind: "landmark", description: "Lateral projection from pedicle-lamina junction for rib articulation (thoracic) or deep back muscles.", nx: 0.88, ny: 0.60, nz: 0.38 },
    );
  } else {
    const entry = matchOrganToEntry(organ);
    const featText = entry?.details?.find((d: { label: string; value: string }) => /key anatomy|features/i.test(d.label))?.value ?? "";
    const parts = featText
      ? featText.split(/[.;]/).map((s: string) => s.trim()).filter((s: string) => s.length > 4).slice(0, 4)
      : [];
    specs.push(
      {
        id: "proximal_epiphysis",
        name_en: parts[0] ? parts[0].slice(0, 48) : `Proximal head / articular surface of ${organ.name_en}`,
        name_ar: "النهاية العلوية والسطح المفصلي (Proximal Articular End)",
        kind: "landmark",
        description: parts[0] ?? `Proximal articular surface and epiphyseal landmark of ${organ.name_en}.`,
        nx: 0.0,
        ny: 0.92,
        nz: 0.55,
      },
      {
        id: "articular_notch_groove",
        name_en: `Articular notch & neurovascular groove of ${organ.name_en.replace(/\s*\((left|right)\)/i, "")}`,
        name_ar: "الثلمة المفصلية والثلم العصبي الوعائي (Notch & Groove)",
        kind: "notch",
        description: parts[1] ?? `Osteological notch / groove along ${organ.name_en} for tendon and neurovascular passage.`,
        nx: 0.55,
        ny: 0.58,
        nz: 0.68,
      },
      {
        id: "shaft_tuberosity",
        name_en: parts[2] ? parts[2].slice(0, 48) : `Shaft & muscular tuberosity of ${organ.name_en.replace(/\s*\((left|right)\)/i, "")}`,
        name_ar: "جسم العظم والأحدوبة العضلية (Diaphysis & Tuberosity)",
        kind: "landmark",
        description: parts[2] ?? `Diaphyseal cortex and ligamentous/muscular attachment ridge of ${organ.name_en}.`,
        nx: -0.35,
        ny: 0.45,
        nz: 0.35,
      },
      {
        id: "distal_condyle_process",
        name_en: parts[3] ? parts[3].slice(0, 48) : `Distal process / condyle of ${organ.name_en}`,
        name_ar: "النهاية السفلية والناتئ المفصلي (Distal Condyle / Process)",
        kind: "landmark",
        description: parts[3] ?? `Distal articular extremity and styloid/condylar process of ${organ.name_en}.`,
        nx: 0.20,
        ny: 0.08,
        nz: 0.55,
      },
    );
  }

  const posAttr = geom.attributes.position as THREE.BufferAttribute | undefined;
  const center = worldBox.getCenter(new THREE.Vector3());
  const size = worldBox.getSize(new THREE.Vector3());
  const v = new THREE.Vector3();

  return specs.map((spec) => {
    const targetX = center.x + spec.nx * latSign * (size.x * 0.48);
    const targetY = worldBox.min.y + spec.ny * size.y;
    const targetZ = worldBox.min.z + spec.nz * size.z;

    let bestX = targetX;
    let bestY = targetY;
    let bestZ = targetZ;

    if (posAttr && posAttr.count > 0) {
      let minDistSq = Number.POSITIVE_INFINITY;
      const stride = Math.max(1, Math.floor(posAttr.count / 600));
      for (let i = 0; i < posAttr.count; i += stride) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(matrix);
        const dx = v.x - targetX;
        const dy = v.y - targetY;
        const dz = v.z - targetZ;
        const dSq = dx * dx + dy * dy + dz * dz;
        if (dSq < minDistSq) {
          minDistSq = dSq;
          bestX = v.x;
          bestY = v.y;
          bestZ = v.z;
        }
      }
    }

    return {
      id: spec.id,
      name_en: spec.name_en,
      name_ar: spec.name_ar,
      kind: spec.kind,
      description: spec.description,
      worldPos: [bestX, bestY, bestZ],
    };
  });
}

interface MuscleBranchSpec {
  id: string;
  name_en: string;
  name_ar: string;
  kind: "notch" | "landmark";
  subKind?: "head" | "slip" | "motor";
  nx: number; // -1 medial, 0 center, +1 lateral
  ny: number; // 0 inferior .. 1 superior
  nz: number; // 0 posterior .. 1 anterior
  description: string;
}

export function buildMuscleBranches3D(
  organ: ManifestOrgan,
  geom: THREE.BufferGeometry,
  matrix: THREE.Matrix4,
  worldBox: THREE.Box3,
): BoneLandmark3D[] {
  const nameLow = `${organ.organ_id} ${organ.name_en} ${organ.ta2_latin}`.toLowerCase();
  const isRight =
    organ.organ_id.endsWith("_r") ||
    /\(right\)/i.test(organ.name_en) ||
    /\bdexter|dextra|dextrum\b/i.test(organ.ta2_latin);
  const latSign = isRight ? -1 : 1;

  const entry = matchOrganToEntry(organ);
  const getDetail = (rx: RegExp) =>
    entry?.details.find((d) => rx.test(d.label))?.value ?? "";
  const originTxt = getDetail(/origin/i);
  const insertionTxt = getDetail(/insertion/i);
  const nerveTxt = getDetail(/nerve|innervation/i);
  const bloodTxt = getDetail(/blood|artery|vascular/i);
  const actionTxt = getDetail(/action|function/i);

  const specs: MuscleBranchSpec[] = [];

  if (/sternocleidomastoid/.test(nameLow)) {
    specs.push(
      {
        id: "scm_sternal_head",
        name_en: "Sternal Head (Rounded Tendinous Branch)",
        name_ar: "الرأس القصي (الفرع الوتري الإنسي)",
        kind: "landmark",
        nx: -0.55,
        ny: 0.14,
        nz: 0.82,
        description: "Rounded tendinous medial head arising from the anterior surface of the manubrium sterni; travels superolaterally.",
      },
      {
        id: "scm_clavicular_head",
        name_en: "Clavicular Head (Fleshy Lateral Branch)",
        name_ar: "الرأس الترقوي (الفرع العضلي الوحشي)",
        kind: "landmark",
        nx: 0.35,
        ny: 0.12,
        nz: 0.58,
        description: "Broad fleshy lateral head arising from the superior surface of the medial third of the clavicle; separated from sternal head by the lesser supraclavicular fossa.",
      },
      {
        id: "scm_lesser_fossa",
        name_en: "Lesser Supraclavicular Fossa (IJV Triangle)",
        name_ar: "الحفرة فوق الترقوة الصغرى (مثلث الوريد الوداجي الداخلي)",
        kind: "notch",
        nx: -0.1,
        ny: 0.2,
        nz: 0.7,
        description: "Triangular interval between the sternal and clavicular heads; surface landmark for central venous cannulation of the internal jugular vein.",
      },
      {
        id: "scm_accessory_hilum",
        name_en: "Spinal Accessory Nerve (CN XI) & Erb's Point Branch",
        name_ar: "مدخل العصب الإضافي (CN XI) ونقطة إرب العصبية",
        kind: "notch",
        nx: 0.25,
        ny: 0.55,
        nz: 0.35,
        description: "Motor hilum where CN XI pierces the deep belly and cutaneous branches of the cervical plexus (C2–C4) emerge at the posterior border (Erb's point).",
      },
      {
        id: "scm_mastoid_insertion",
        name_en: "Mastoid & Superior Nuchal Aponeurotic Insertion",
        name_ar: "المرتكز الخشائي والخط القفوي العلوي",
        kind: "landmark",
        nx: 0.65,
        ny: 0.88,
        nz: 0.2,
        description: "Fused superior belly inserting onto the lateral surface of the mastoid process and lateral half of the superior nuchal line.",
      },
    );
  } else if (/pectoralis_major/.test(nameLow)) {
    specs.push(
      {
        id: "pec_clavicular_head",
        name_en: "Clavicular Head (Superior Flexor Branch)",
        name_ar: "الرأس الترقوي العلوي (الفرع القابض للكتف)",
        kind: "landmark",
        nx: 0.05,
        ny: 0.84,
        nz: 0.78,
        description: "Arises from the anterior surface of the medial half of the clavicle; flexes and horizontally adducts the arm. Innervated by lateral pectoral nerve (C5–C7).",
      },
      {
        id: "pec_sternocostal_head",
        name_en: "Sternocostal Head (Main Fan-Shaped Belly)",
        name_ar: "الرأس القصي الضلعي الأوسط (البطن المروحي الرئيسي)",
        kind: "landmark",
        nx: -0.35,
        ny: 0.5,
        nz: 0.85,
        description: "Largest fan-shaped division arising from the anterior sternum and costal cartilages 1–6; extends the flexed arm and powerfully adducts.",
      },
      {
        id: "pec_abdominal_part",
        name_en: "Abdominal Part (Rectus Sheath Slip)",
        name_ar: "الجزء البطني السفلي (فرع غمد العضلة المستقيمة)",
        kind: "landmark",
        nx: -0.25,
        ny: 0.16,
        nz: 0.78,
        description: "Inferior muscular slip arising from the anterior layer of the rectus sheath (external oblique aponeurosis); twists posteriorly to form the posterior lamina of the insertion tendon.",
      },
      {
        id: "pec_deltopectoral_groove",
        name_en: "Deltopectoral Groove & Thoracoacromial Hilum",
        name_ar: "الأخدود الدالي الصدري ومدخل الشريان الصدري الأخرمي",
        kind: "notch",
        nx: 0.55,
        ny: 0.76,
        nz: 0.68,
        description: "Superolateral border transmitting the cephalic vein and deltoid branch of the thoracoacromial artery; deep surface receives medial & lateral pectoral nerves.",
      },
      {
        id: "pec_bilaminar_tendon",
        name_en: "Bilaminar Humeral Tendon (Lateral Lip of Bicipital Groove)",
        name_ar: "الوتر العضدي ثنائي الصفيحة (الشفة الوحشية لميزابة ذات الرأسين)",
        kind: "landmark",
        nx: 0.82,
        ny: 0.62,
        nz: 0.45,
        description: "5 cm flat bilaminar tendon (anterior U-lamina from clavicular/upper sternal fibers; twisted posterior lamina from lower sternal/abdominal fibers) inserting on the lateral lip of the intertubercular sulcus.",
      },
    );
  } else if (/pectoralis_minor/.test(nameLow)) {
    specs.push(
      {
        id: "pec_min_slip3",
        name_en: "Superior Costal Slip (3rd Rib Origin)",
        name_ar: "اللسان الضلعي العلوي (الضلع الثالث)",
        kind: "landmark",
        nx: -0.35,
        ny: 0.62,
        nz: 0.75,
        description: "Superior muscular slip arising from the anterior surface of the 3rd rib near its costal cartilage.",
      },
      {
        id: "pec_min_slip4",
        name_en: "Middle Costal Slip (4th Rib Origin)",
        name_ar: "اللسان الضلعي الأوسط (الضلع الرابع)",
        kind: "landmark",
        nx: -0.3,
        ny: 0.4,
        nz: 0.78,
        description: "Middle slip arising from the 4th rib; surgical landmark dividing the axillary artery into 1st (medial), 2nd (posterior), and 3rd (lateral) parts.",
      },
      {
        id: "pec_min_slip5",
        name_en: "Inferior Costal Slip (5th Rib Origin) & Medial Pectoral Nerve",
        name_ar: "اللسان الضلعي السفلي (الضلع الخامس) والعصب الصدري الإنسي",
        kind: "notch",
        nx: -0.25,
        ny: 0.18,
        nz: 0.72,
        description: "Inferior slip arising from the 5th rib; pierced directly by the medial pectoral nerve (C8–T1).",
      },
      {
        id: "pec_min_coracoid",
        name_en: "Coracoid Process Tendinous Insertion",
        name_ar: "المرتكز الوتري على الناتئ الغرابي",
        kind: "landmark",
        nx: 0.68,
        ny: 0.86,
        nz: 0.58,
        description: "Convergent superolateral tendon inserting onto the medial border and superior surface of the coracoid process of the scapula.",
      },
    );
  } else if (/deltoid|deltoideus/.test(nameLow)) {
    specs.push(
      {
        id: "delt_clavicular_part",
        name_en: "Anterior (Clavicular) Part — Flexor & Internal Rotator",
        name_ar: "الجزء الأمامي (الترقوي) — قابض ومدور داخلي",
        kind: "landmark",
        nx: -0.25,
        ny: 0.75,
        nz: 0.85,
        description: "Arises from the anterior border of the lateral third of the clavicle; flexes and medially rotates the arm.",
      },
      {
        id: "delt_acromial_part",
        name_en: "Middle (Acromial) Multipennate Part — Primary Abductor",
        name_ar: "الجزء الأوسط (الأخرمي متعدد الريش) — مباعد الذراع الرئيسي",
        kind: "landmark",
        nx: 0.75,
        ny: 0.65,
        nz: 0.5,
        description: "Powerful multipennate central belly arising from the lateral margin of the acromion (4 proximal & 3 distal intramuscular septa); abducts arm from 15° to 90°.",
      },
      {
        id: "delt_spinal_part",
        name_en: "Posterior (Scapular Spinal) Part — Extensor & External Rotator",
        name_ar: "الجزء الخلفي (الشوكي الكتفي) — باسط ومدور خارجي",
        kind: "landmark",
        nx: -0.2,
        ny: 0.72,
        nz: 0.15,
        description: "Arises from the inferior lip of the crest of the spine of the scapula; extends and laterally rotates the arm.",
      },
      {
        id: "delt_axillary_branch",
        name_en: "Deep Neurovascular Hilum (Axillary Nerve C5–C6 & PCHA)",
        name_ar: "المدخل العصبي الوعائي العميق (العصب الإبطي والشريان المنعطف الخلفي)",
        kind: "notch",
        nx: 0.35,
        ny: 0.45,
        nz: 0.28,
        description: "Surgical neck level (~5 cm below acromion) where the anterior & posterior branches of the axillary nerve and posterior circumflex humeral artery wrap around the deep surface.",
      },
      {
        id: "delt_tuberosity_insertion",
        name_en: "Deltoid Tuberosity V-Shaped Humeral Insertion",
        name_ar: "مرتكز الأحدوبة الدالية على منتصف عظم العضد",
        kind: "landmark",
        nx: 0.65,
        ny: 0.14,
        nz: 0.52,
        description: "Thick convergent tendon inserting onto the V-shaped deltoid tuberosity on the anterolateral mid-shaft of the humerus.",
      },
    );
  } else if (/trapezius/.test(nameLow)) {
    specs.push(
      {
        id: "trap_descending",
        name_en: "Descending (Superior) Fibers — Scapular Elevator Branch",
        name_ar: "الألياف النازلة (العلوية) — رافعة لوح الكتف",
        kind: "landmark",
        nx: -0.25,
        ny: 0.85,
        nz: 0.35,
        description: "Arises from the external occipital protuberance, medial superior nuchal line, and ligamentum nuchae; inserts onto the lateral third of the clavicle to elevate the scapula.",
      },
      {
        id: "trap_transverse",
        name_en: "Transverse (Middle) Fibers — Scapular Retractor Branch",
        name_ar: "الألياف المستعرضة (الوسطى) — ضامة لوح الكتف للخلف",
        kind: "landmark",
        nx: 0.35,
        ny: 0.62,
        nz: 0.25,
        description: "Arises from C7–T3 spinous processes and inserts onto the medial margin of the acromion and crest of the scapular spine; strongly retracts the scapula.",
      },
      {
        id: "trap_ascending",
        name_en: "Ascending (Inferior) Fibers — Scapular Depressor Branch",
        name_ar: "الألياف الصاعدة (السفلية) — خافضة ومدورة لوح الكتف",
        kind: "landmark",
        nx: -0.3,
        ny: 0.25,
        nz: 0.2,
        description: "Arises from T4–T12 spinous processes and converges into a gliding aponeurosis over the medial root of the scapular spine; depresses the medial scapula for upward glenoid rotation.",
      },
      {
        id: "trap_accessory_branch",
        name_en: "Spinal Accessory Nerve (CN XI) & Transverse Cervical Plexus",
        name_ar: "فرع العصب الإضافي الشوكي (CN XI) والشريان العنقي المستعرض",
        kind: "notch",
        nx: 0.2,
        ny: 0.68,
        nz: 0.35,
        description: "Deep neurovascular plexus formed by CN XI (motor) and C3–C4 proprioceptive branches accompanied by the superficial branch of the transverse cervical artery.",
      },
    );
  } else if (/biceps_brachii/.test(nameLow)) {
    specs.push(
      {
        id: "bic_long_head",
        name_en: "Long Head (Supraglenoid & Intertubercular Branch)",
        name_ar: "الرأس الطويل (فرع الحديبة فوق الحقية وميزابة العضد)",
        kind: "landmark",
        nx: 0.45,
        ny: 0.82,
        nz: 0.62,
        description: "Intra-articular extrasynovial tendon arising from the supraglenoid tubercle and superior glenoid labrum, descending through the intertubercular sulcus under the transverse humeral ligament.",
      },
      {
        id: "bic_short_head",
        name_en: "Short Head (Coracoid Conjoint Tendon Branch)",
        name_ar: "الرأس القصير (الفرع الإنسي من الناتئ الغرابي)",
        kind: "landmark",
        nx: -0.45,
        ny: 0.78,
        nz: 0.68,
        description: "Medial head arising via a conjoint tendon with coracobrachialis from the apex of the coracoid process of the scapula.",
      },
      {
        id: "bic_mc_motor_branch",
        name_en: "Musculocutaneous Nerve (C5–C6) Motor Hilum",
        name_ar: "الفرع الحركي للعصب العضلي الجلدي (C5–C6)",
        kind: "notch",
        nx: -0.1,
        ny: 0.52,
        nz: 0.5,
        description: "Deep motor branch from the musculocutaneous nerve (C5–C6) entering the fusiform belly between biceps brachii and brachialis.",
      },
      {
        id: "bic_radial_tendon",
        name_en: "Distal Radial Tuberosity Tendon (Main Supinator Insertion)",
        name_ar: "الوتر القاصي للأحدوبة الكعبرية (مرتكز الاستلقاء الرئيسي)",
        kind: "landmark",
        nx: 0.15,
        ny: 0.1,
        nz: 0.45,
        description: "Stout distal tendon inserting onto the posterior rough part of the radial tuberosity (buffered by the bicipitoradial bursa); powerful forearm supinator.",
      },
      {
        id: "bic_lacertus_fibrosus",
        name_en: "Bicipital Aponeurosis (Lacertus Fibrosus Medial Slip)",
        name_ar: "الصفاق الصفاقي لذات الرأسين (Lacertus Fibrosus)",
        kind: "notch",
        nx: -0.55,
        ny: 0.12,
        nz: 0.82,
        description: "Medial aponeurotic expansion blending into the deep antebrachial fascia over the common flexor origin; roofs and protects the brachial artery and median nerve in the cubital fossa.",
      },
    );
  } else if (/deep_brachial_artery|profunda_brachii|profundo_brachii/.test(nameLow)) {
    specs.push(
      {
        id: "pb_branch1_muscular",
        name_en: "Muscular branches (to Triceps brachii)",
        name_ar: "الفروع العضلية (لرؤوس العضلة ثلاثية الرؤوس)",
        kind: "landmark",
        nx: -0.15,
        ny: 0.58,
        nz: 0.28,
        description:
          "Supplies muscular branches to the long, lateral, and medial heads of triceps brachii along the spiral groove.",
      },
      {
        id: "pb_branch2_nutrient",
        name_en: "Nutrient artery (to Humerus)",
        name_ar: "الشريان المغذي لعظم العضد (Nutrient artery)",
        kind: "notch",
        nx: 0.22,
        ny: 0.52,
        nz: 0.55,
        description:
          "Enters the nutrient canal of the humeral shaft near the deltoid tuberosity.",
      },
      {
        id: "pb_branch3_ascending_cruciate",
        name_en: "Ascending (deltoid) branch (Cruciate anastomosis)",
        name_ar: "الفرع الصاعد (يتفاغر مع المنعطف العضدي الخلفي)",
        kind: "notch",
        nx: 0.38,
        ny: 0.84,
        nz: 0.32,
        description:
          "Ascends between the lateral and long heads of triceps to anastomose with the descending branch of the posterior circumflex humeral artery on the back of the surgical neck (Cruciate anastomosis).",
      },
      {
        id: "pb_branch4_ant_descending_radial_collateral",
        name_en: "Ant. descending terminal — Radial collateral (من قدام)",
        name_ar: "الفرع الأمامي النازل — الشريان الرديف الكعبري (من قدام)",
        kind: "notch",
        nx: 0.52,
        ny: 0.16,
        nz: 0.78,
        description:
          "Pierces the lateral intermuscular septum with the radial nerve to reach the front of the lateral epicondyle, where it anastomoses with the radial recurrent artery.",
      },
      {
        id: "pb_branch5_post_descending_middle_collateral",
        name_en: "Post. descending terminal — Middle collateral (من ورا)",
        name_ar: "الفرع الخلفي النازل — الشريان الرديف الأوسط (من ورا)",
        kind: "notch",
        nx: 0.35,
        ny: 0.12,
        nz: 0.22,
        description:
          "Descends in the medial head of triceps to reach the back of the lateral epicondyle, anastomosing with the posterior interosseous recurrent artery.",
      },
    );
  } else if (/radial_collateral_artery/.test(nameLow)) {
    specs.push(
      {
        id: "rc_septum_piercing",
        name_en: "Lateral intermuscular septum passage (with Radial N.)",
        name_ar: "اختراق الحاجز العضلي الوحشي (مع العصب الكعبري)",
        kind: "notch",
        nx: 0.35,
        ny: 0.55,
        nz: 0.65,
        description: "Pierces the lateral intermuscular septum with the radial nerve to enter the anterior compartment between brachialis and brachioradialis.",
      },
      {
        id: "rc_elbow_anastomosis",
        name_en: "Anterior lateral epicondyle anastomosis (↔ Radial recurrent A.)",
        name_ar: "مفاغرة أمام اللقيمة الوحشية (مع الشريان الكعبري الراجع)",
        kind: "notch",
        nx: 0.25,
        ny: 0.1,
        nz: 0.82,
        description: "Anastomoses in front of the lateral epicondyle with the radial recurrent artery.",
      },
    );
  } else if (/middle_collateral_artery/.test(nameLow)) {
    specs.push(
      {
        id: "mc_course_medial_triceps",
        name_en: "Intramuscular course (in Medial head of Triceps)",
        name_ar: "المسار داخل الرأس الإنسي للعضلة ثلاثية الرؤوس",
        kind: "landmark",
        nx: 0.1,
        ny: 0.52,
        nz: 0.28,
        description: "Descends within the substance of the medial head of triceps brachii.",
      },
      {
        id: "mc_elbow_anastomosis",
        name_en: "Posterior lateral epicondyle anastomosis (↔ Post. interosseous recurrent A.)",
        name_ar: "مفاغرة خلف اللقيمة الوحشية (مع الشريان الراجع بين العظمين الخلفي)",
        kind: "notch",
        nx: 0.3,
        ny: 0.1,
        nz: 0.2,
        description: "Anastomoses behind the lateral epicondyle with the posterior interosseous recurrent artery.",
      },
    );
  } else if (/brachial_artery/.test(nameLow)) {
    specs.push(
      {
        id: "ba_branch1_profunda",
        name_en: "Profunda brachii (Deep brachial) artery",
        name_ar: "الشريان العضدي العميق (Profunda brachii)",
        kind: "notch",
        nx: -0.2,
        ny: 0.82,
        nz: 0.35,
        description: "Largest posteromedial branch; enters the lower triangular space and spiral groove with the radial nerve.",
      },
      {
        id: "ba_branch2_nutrient_muscular",
        name_en: "Nutrient artery (to Humerus) & Muscular branches",
        name_ar: "الشريان المغذي للعضد والفروع العضلية الأمامية",
        kind: "landmark",
        nx: 0.15,
        ny: 0.62,
        nz: 0.65,
        description: "Supplies muscular branches to biceps, coracobrachialis, and brachialis, plus the nutrient artery to the humerus.",
      },
      {
        id: "ba_branch3_sup_ulnar_collateral",
        name_en: "Superior ulnar collateral artery (with Ulnar N.)",
        name_ar: "الشريان الرديف الزندي العلوي (مع العصب الزندي)",
        kind: "notch",
        nx: -0.48,
        ny: 0.45,
        nz: 0.38,
        description: "Accompanies the ulnar nerve behind the medial epicondyle to anastomose with the posterior ulnar recurrent artery.",
      },
      {
        id: "ba_branch4_inf_ulnar_collateral",
        name_en: "Inferior ulnar collateral (Supratrochlear) artery",
        name_ar: "الشريان الرديف الزندي السفلي (فوق البكرة)",
        kind: "notch",
        nx: -0.42,
        ny: 0.22,
        nz: 0.68,
        description: "Arises ~5 cm above the elbow and divides into anterior and posterior branches around the medial epicondyle.",
      },
      {
        id: "ba_terminal_bifurcation",
        name_en: "Terminal bifurcation (Radial & Ulnar arteries)",
        name_ar: "الانقسام الانتهائي (الشريان الكعبري والزندي)",
        kind: "landmark",
        nx: 0.05,
        ny: 0.06,
        nz: 0.75,
        description: "Divides at the neck of the radius in the cubital fossa into the radial and ulnar arteries.",
      },
    );
  } else if (/deep_femoral_artery|profunda_femoris/.test(nameLow)) {
    specs.push(
      {
        id: "pf_lat_circumflex",
        name_en: "Lateral circumflex femoral artery",
        name_ar: "الشريان المنعطف الفخذي الوحشي",
        kind: "notch",
        nx: 0.55,
        ny: 0.78,
        nz: 0.58,
        description: "Gives ascending, transverse (to cruciate anastomosis), and descending branches.",
      },
      {
        id: "pf_med_circumflex",
        name_en: "Medial circumflex femoral artery",
        name_ar: "الشريان المنعطف الفخذي الإنسي",
        kind: "notch",
        nx: -0.48,
        ny: 0.82,
        nz: 0.35,
        description: "Primary blood supply to the femoral head and neck via retinacular branches.",
      },
      {
        id: "pf_perforating_1_4",
        name_en: "Four perforating arteries (1st–4th)",
        name_ar: "الشرايين الثاقبة الأربعة (١–٤)",
        kind: "notch",
        nx: 0.05,
        ny: 0.25,
        nz: 0.32,
        description: "Pierce adductor magnus to supply the posterior and medial thigh compartments.",
      },
    );
  } else if (/triceps_brachii/.test(nameLow)) {
    specs.push(
      {
        id: "tri_long_head",
        name_en: "Long head (Infraglenoid tubercle)",
        name_ar: "الرأس الطويل (الحديبة تحت الحقية)",
        kind: "landmark",
        nx: -0.35,
        ny: 0.82,
        nz: 0.35,
        description: "Arises from the infraglenoid tubercle of the scapula; forms the medial border of the lower triangular space.",
      },
      {
        id: "tri_lateral_head",
        name_en: "Lateral head (Above spiral groove)",
        name_ar: "الرأس الوحشي (أعلى التلم الحلزوني)",
        kind: "landmark",
        nx: 0.55,
        ny: 0.68,
        nz: 0.3,
        description: "Arises superior to the spiral groove; roofs the tunnel transmitting Profunda brachii A. and Radial N.",
      },
      {
        id: "tri_medial_head",
        name_en: "Medial (deep) head (Below spiral groove)",
        name_ar: "الرأس الإنسي العميق (أسفل التلم الحلزوني)",
        kind: "landmark",
        nx: -0.1,
        ny: 0.38,
        nz: 0.48,
        description: "Deep head arising inferior to the spiral groove; contains the middle collateral branch of Profunda brachii.",
      },
      {
        id: "tri_radial_groove_branches",
        name_en: "Spiral groove (Profunda brachii A. & Radial N.)",
        name_ar: "التلم الحلزوني (الشريان العضدي العميق والعصب الكعبري)",
        kind: "notch",
        nx: 0.15,
        ny: 0.56,
        nz: 0.52,
        description: "Transmits Profunda brachii artery (giving muscular, nutrient, ascending, radial collateral & middle collateral branches) and radial nerve between the lateral and medial heads.",
      },
      {
        id: "tri_olecranon_tendon",
        name_en: "Common triceps tendon (Olecranon insertion)",
        name_ar: "الوتر المشترك (يرتكز على الناتئ المرفقي)",
        kind: "landmark",
        nx: 0.0,
        ny: 0.08,
        nz: 0.25,
        description: "Inserts onto the posterior superior surface of the olecranon process of the ulna.",
      },
    );
  } else if (/serratus_anterior/.test(nameLow)) {
    specs.push(
      {
        id: "ser_sup_part",
        name_en: "Superior Part (1st & 2nd Rib Digitations → Superior Angle)",
        name_ar: "الجزء العلوي (تسننات الضلع ١–٢ إلى الزاوية العلوية للكتف)",
        kind: "landmark",
        nx: 0.1,
        ny: 0.85,
        nz: 0.45,
        description: "Upper fleshy digitations from ribs 1–2 converging onto the costal surface of the superior angle of the scapula; forms the pivot for scapular rotation.",
      },
      {
        id: "ser_mid_part",
        name_en: "Intermediate Part (2nd–4th Rib Digitations → Medial Border)",
        name_ar: "الجزء الأوسط (تسننات الضلع ٢–٤ إلى الحافة الإنسية للكتف)",
        kind: "landmark",
        nx: 0.35,
        ny: 0.58,
        nz: 0.52,
        description: "Thin sheet arising from ribs 2–4 inserting along the entire costal length of the medial scapular border; protracts the scapula.",
      },
      {
        id: "ser_inf_part",
        name_en: "Inferior Part (5th–9th Rib Digitations → Inferior Angle)",
        name_ar: "الجزء السفلي القوي (تسننات الضلع ٥–٩ إلى الزاوية السفلية للكتف)",
        kind: "landmark",
        nx: 0.55,
        ny: 0.22,
        nz: 0.65,
        description: "Strongest lower digitations interdigitating with external oblique on ribs 5–9 and converging on the inferior angle of the scapula to rotate the glenoid upward above 90°.",
      },
      {
        id: "ser_long_thoracic_branch",
        name_en: "Long Thoracic Nerve (Bell's Nerve C5–C7) & Lateral Thoracic Artery",
        name_ar: "مسار العصب الصدري الطويل (C5–C7) والشريان الصدري الوحشي",
        kind: "notch",
        nx: 0.65,
        ny: 0.52,
        nz: 0.58,
        description: "Runs vertically on the superficial midaxillary surface of the digitations; injury during axillary dissection causes winged scapula.",
      },
    );
  } else if (/latissimus_dorsi/.test(nameLow)) {
    specs.push(
      {
        id: "lat_vertebral_part",
        name_en: "Vertebral & Thoracolumbar Aponeurotic Part (T7–L5)",
        name_ar: "الجزء الفقري والصفاق الصدري القطني (T7–L5)",
        kind: "landmark",
        nx: -0.55,
        ny: 0.55,
        nz: 0.18,
        description: "Broad medial aponeurotic origin from T7–T12 spinous processes and posterior layer of the thoracolumbar fascia.",
      },
      {
        id: "lat_iliac_part",
        name_en: "Iliac Part (Posterior Iliac Crest & Lumbar Triangle Base)",
        name_ar: "الجزء الحرقفي (العرف الحرقفي الخلفي ومثلث بيتي)",
        kind: "landmark",
        nx: -0.25,
        ny: 0.14,
        nz: 0.25,
        description: "Inferior fibers arising from the posterior third of the iliac crest; its inferolateral border forms the medial boundary of the inferior lumbar triangle of Petit.",
      },
      {
        id: "lat_costal_part",
        name_en: "Costal Part (9th–12th Rib Muscular Slips)",
        name_ar: "الجزء الضلعي (ألسنة الأضلاع ٩–١٢)",
        kind: "landmark",
        nx: 0.48,
        ny: 0.42,
        nz: 0.52,
        description: "Anterolateral muscular slips arising from the lower 3 or 4 ribs (ribs 9–12), interdigitating with the external abdominal oblique.",
      },
      {
        id: "lat_scapular_part",
        name_en: "Scapular Slip (Inferior Angle of Scapula) & Thoracodorsal Pedicle",
        name_ar: "الفرع الكتفي والحزمة العصبية الوعائية الصدرية الظهرية (C6–C8)",
        kind: "notch",
        nx: 0.35,
        ny: 0.75,
        nz: 0.35,
        description: "Superior slip crossing the inferior angle of the scapula; deep surface receives the thoracodorsal nerve (C6–C8) and thoracodorsal artery (pedicle for reconstructive flaps).",
      },
      {
        id: "lat_humeral_tendon",
        name_en: "Spiral Humeral Tendon (Floor of Intertubercular Sulcus)",
        name_ar: "الوتر العضدي الملتوي (قاع الميزابة بين الحديبتين)",
        kind: "landmark",
        nx: 0.78,
        ny: 0.92,
        nz: 0.62,
        description: "Quadrilateral tendon that twists 180° around teres major to insert into the floor of the intertubercular sulcus of the humerus ('Lady Between Two Majors').",
      },
    );
  } else if (/rectus_abdominis/.test(nameLow)) {
    specs.push(
      {
        id: "rect_sup_intersections",
        name_en: "Tendinous Intersections (Xiphoid, Umbilical & Midway Bands)",
        name_ar: "التقاطعات الوترية الثلاثة (تحت الرهابة وفوق وعند السرة)",
        kind: "notch",
        nx: 0.0,
        ny: 0.68,
        nz: 0.85,
        description: "Three transverse fibrous bands adherent to the anterior rectus sheath that divide the muscle into four segmental bellies and contain segmental T7–T11 vascular arcades.",
      },
      {
        id: "rect_lateral_head",
        name_en: "Lateral Pubic Crest Head (Broad Inferior Origin)",
        name_ar: "الرأس العاني الوحشي (عرف العانة)",
        kind: "landmark",
        nx: 0.35,
        ny: 0.1,
        nz: 0.75,
        description: "Larger lateral tendon arising from the crest of the pubis between the pubic tubercle and symphysis.",
      },
      {
        id: "rect_medial_head",
        name_en: "Medial Pubic Symphysis Head (Decussating Fibers)",
        name_ar: "الرأس الإنسي للارتفاق العاني",
        kind: "landmark",
        nx: -0.45,
        ny: 0.08,
        nz: 0.78,
        description: "Medial tendon interlacing with its contralateral fellow on the anterior pubic symphysis.",
      },
      {
        id: "rect_epigastric_anastomosis",
        name_en: "Deep Epigastric Neurovascular Axis & Arcuate Line",
        name_ar: "فرع المفاغرة الشرسوفية العلوية والسفلية والخط المقوس (T7–T12)",
        kind: "notch",
        nx: 0.25,
        ny: 0.35,
        nz: 0.35,
        description: "Deep surface channel carrying the superior & inferior epigastric vessels (internal thoracic–external iliac anastomosis) and thoracoabdominal nerves (T7–T11) & subcostal nerve (T12).",
      },
    );
  } else if (/diaphragm/.test(nameLow)) {
    specs.push(
      {
        id: "diaph_central_tendon",
        name_en: "Trifoliate Central Tendon & Caval Opening (T8)",
        name_ar: "الوتر المركزي ثلاثي الوريقات وفتحة الوريد الأجوف السفلي (T8)",
        kind: "notch",
        nx: -0.22,
        ny: 0.86,
        nz: 0.55,
        description: "Boomerang-shaped aponeurotic central tendon pierced at T8 level by the inferior vena cava and right phrenic nerve terminal branch.",
      },
      {
        id: "diaph_esophageal_hiatus",
        name_en: "Right Muscular Crus & Esophageal Hiatus (T10)",
        name_ar: "الساق اليمنى للحجاب الحاجز وفرجة المريء (T10)",
        kind: "notch",
        nx: 0.05,
        ny: 0.58,
        nz: 0.45,
        description: "Muscular sling formed by splitting fibers of the right crus (L1–L3) at T10 transmitting the esophagus, anterior & posterior vagal trunks, and esophageal branches of left gastric vessels.",
      },
      {
        id: "diaph_aortic_hiatus",
        name_en: "Left Muscular Crus, Median Arcuate Ligament & Aortic Hiatus (T12)",
        name_ar: "الساق اليسرى والرباط المقوس الناصف وفرجة الأبهر (T12)",
        kind: "notch",
        nx: 0.0,
        ny: 0.28,
        nz: 0.22,
        description: "Osseofibrous retrocrural opening at T12 transmitting the abdominal aorta, thoracic duct, and azygos/hemiazygos veins.",
      },
      {
        id: "diaph_sternal_part",
        name_en: "Sternal Part & Sternocostal Triangle (Foramen of Morgagni)",
        name_ar: "الجزء القصي ومثلث مورغاني الأمامي",
        kind: "landmark",
        nx: 0.0,
        ny: 0.72,
        nz: 0.92,
        description: "Two fleshy slips from the posterior xiphoid process; flanked by the sternocostal triangles (Larrey/Morgagni) transmitting the superior epigastric vessels.",
      },
      {
        id: "diaph_costal_domes",
        name_en: "Right & Left Costal Domes & Phrenic Nerve Branches (C3–C5)",
        name_ar: "القبتان الضلعيتان وفروع العصب الحجابي الأيمن والأيسر (C3–C5)",
        kind: "landmark",
        nx: 0.65,
        ny: 0.62,
        nz: 0.52,
        description: "Muscular slips from the internal surfaces of the lower 6 costal cartilages and ribs (7–12) supplied by anterior, lateral, and crural branches of the phrenic nerves.",
      },
    );
  } else if (/gluteus_maximus/.test(nameLow)) {
    specs.push(
      {
        id: "gmax_superficial_itt",
        name_en: "Superficial & Superior Three-Quarters (Iliotibial Tract Branch)",
        name_ar: "الألياف العلوية والسطحية (مرتكز السبيل الحرقفي الظنبوبي)",
        kind: "landmark",
        nx: 0.65,
        ny: 0.65,
        nz: 0.45,
        description: "Superior and superficial 75% of fibers inserting into the iliotibial tract of the fascia lata to stabilize the extended knee and abduct the hip.",
      },
      {
        id: "gmax_deep_gluteal_tuberosity",
        name_en: "Deep Inferior Quarter (Gluteal Tuberosity Femoral Branch)",
        name_ar: "الربع السفلي العميق (مرتكز الأحدوبة الألوية لعظم الفخذ)",
        kind: "landmark",
        nx: 0.45,
        ny: 0.18,
        nz: 0.52,
        description: "Deep inferior 25% of fibers inserting directly onto the gluteal tuberosity of the femur between vastus lateralis and adductor magnus.",
      },
      {
        id: "gmax_inf_gluteal_pedicle",
        name_en: "Infrapiriform Neurovascular Hilum (Inferior Gluteal Nerve L5–S2)",
        name_ar: "المدخل العصبي الوعائي تحت الكمثرية (العصب والشريان الألوي السفلي)",
        kind: "notch",
        nx: -0.15,
        ny: 0.48,
        nz: 0.58,
        description: "Deep hilum entering via the greater sciatic foramen inferior to piriformis; carries the inferior gluteal nerve (L5–S2) and inferior & superior gluteal arteries.",
      },
      {
        id: "gmax_sacrotuberous_origin",
        name_en: "Ilium, Sacrum & Sacrotuberous Ligament Medial Origin",
        name_ar: "المنشأ الإنسي من الحرقفة والعجز والرباط العجزي الحدبي",
        kind: "landmark",
        nx: -0.65,
        ny: 0.72,
        nz: 0.22,
        description: "Broad medial origin posterior to the posterior gluteal line of the ilium, dorsal sacrum/coccyx, and sacrotuberous ligament.",
      },
    );
  } else if (/gluteus_medius|gluteus_minimus/.test(nameLow)) {
    specs.push(
      {
        id: "gmed_anterior_fibers",
        name_en: "Anterior Fan Fibers (Flexor & Internal Rotator Branch)",
        name_ar: "الألياف المروحية الأمامية (قابضة ومدورة داخلية للفخذ)",
        kind: "landmark",
        nx: 0.35,
        ny: 0.68,
        nz: 0.82,
        description: "Anterior fibers running posteroinferiorly to the greater trochanter; medially rotate and flex the hip.",
      },
      {
        id: "gmed_middle_abductor",
        name_en: "Middle Vertical Fibers (Primary Pelvic Stabilizer / Trendelenburg)",
        name_ar: "الألياف العمودية الوسطى (مثبت الحوض الرئيسي ومباعد الفخذ)",
        kind: "landmark",
        nx: 0.25,
        ny: 0.76,
        nz: 0.5,
        description: "Vertical central fibers abducting the femur and preventing contralateral pelvic drop during single-leg stance.",
      },
      {
        id: "gmed_posterior_fibers",
        name_en: "Posterior Fibers & Superior Gluteal Neurovascular Branch (L4–S1)",
        name_ar: "الألياف الخلفية وحزمة العصب والشريان الألوي العلوي (L4–S1)",
        kind: "notch",
        nx: -0.25,
        ny: 0.58,
        nz: 0.25,
        description: "Posterior oblique fibers supplied by the superior gluteal nerve (L4–S1) and deep branch of the superior gluteal artery between gluteus medius and minimus.",
      },
      {
        id: "gmed_trochanteric_insertion",
        name_en: "Greater Trochanter Facet Insertion",
        name_ar: "المرتكز الوتري على المدور الكبير لعظم الفخذ",
        kind: "landmark",
        nx: 0.78,
        ny: 0.16,
        nz: 0.52,
        description: "Stout tendon inserting onto the lateral oblique facet (gluteus medius) or anterior facet (gluteus minimus) of the greater trochanter.",
      },
    );
  } else if (/rectus_femoris/.test(nameLow)) {
    specs.push(
      {
        id: "rf_straight_head",
        name_en: "Straight (Direct) Head — AIIS Origin Branch",
        name_ar: "الرأس المستقيم المباشر (الشوكة الحرقفية الأمامية السفلية AIIS)",
        kind: "landmark",
        nx: -0.1,
        ny: 0.94,
        nz: 0.78,
        description: "Vertical tendon arising directly from the anterior inferior iliac spine (AIIS); vulnerable to avulsion in kicking athletes.",
      },
      {
        id: "rf_reflected_head",
        name_en: "Reflected (Indirect) Head — Supra-Acetabular Groove Branch",
        name_ar: "الرأس المنعكس غير المباشر (الأخدود فوق الحقي ومحفظة الورك)",
        kind: "notch",
        nx: 0.25,
        ny: 0.89,
        nz: 0.42,
        description: "Curved flat tendon arising from the ilium superior to the acetabulum and fibrous capsule of the hip joint.",
      },
      {
        id: "rf_bipennate_belly",
        name_en: "Central Bipennate Belly & Femoral Nerve Branch (L2–L4)",
        name_ar: "البطن ثنائي الريش وفرع العصب الفخذي والشريان الفخذي العميق",
        kind: "notch",
        nx: 0.0,
        ny: 0.56,
        nz: 0.72,
        description: "Classic bipennate midline belly supplied by muscular branches of the femoral nerve (L2–L4) and descending branch of the lateral circumflex femoral artery.",
      },
      {
        id: "rf_quadriceps_tendon",
        name_en: "Superficial Lamina of Quadriceps Tendon (Base of Patella)",
        name_ar: "الصفيحة السطحية لوتر رباعية الرؤوس (قاعدة الرضفة)",
        kind: "landmark",
        nx: -0.05,
        ny: 0.08,
        nz: 0.82,
        description: "Distal aponeurotic tendon forming the superficial layer of the trilaminar quadriceps femoris tendon inserting on the base of the patella.",
      },
    );
  } else if (/adductor_magnus/.test(nameLow)) {
    specs.push(
      {
        id: "addm_pubofemoral_part",
        name_en: "Adductor (Pubofemoral) Part — Obturator Nerve Branch (L2–L4)",
        name_ar: "الجزء المقرب (العاني الفخذي) — فرع العصب السدادي (L2–L4)",
        kind: "landmark",
        nx: 0.15,
        ny: 0.72,
        nz: 0.62,
        description: "Oblique anterior/superior fibers arising from the ischiopubic ramus and inserting along the linea aspera; innervated by the posterior division of the obturator nerve.",
      },
      {
        id: "addm_hamstring_part",
        name_en: "Hamstring (Ischiocondylar) Part — Tibial Sciatic Branch (L4)",
        name_ar: "الجزء المأبضي (الإسكي اللقمي) — فرع القسم الظنبوبي للعصب الوركي (L4)",
        kind: "landmark",
        nx: -0.35,
        ny: 0.55,
        nz: 0.35,
        description: "Vertical medial fibers arising from the inferolateral ischial tuberosity and descending to the adductor tubercle; extends the hip and is innervated by the tibial nerve.",
      },
      {
        id: "addm_adductor_hiatus",
        name_en: "Adductor Hiatus (Femoral-to-Popliteal Vascular Portal) & Perforating Arches",
        name_ar: "فرجة المقربة الفخذية (بوابة الشريان والوريد الفخذي إلى المأبضي)",
        kind: "notch",
        nx: 0.2,
        ny: 0.18,
        nz: 0.48,
        description: "Osseomuscular tendinous arch between the linea aspera and adductor tubercle insertions through which the femoral artery and vein pass into the popliteal fossa.",
      },
      {
        id: "addm_tubercle_insertion",
        name_en: "Adductor Tubercle Tendon (Medial Femoral Condyle)",
        name_ar: "مرتكز حديبة المقربة على اللقمة الإنسية لعظم الفخذ",
        kind: "landmark",
        nx: -0.25,
        ny: 0.06,
        nz: 0.45,
        description: "Round palpable distal tendon inserting on the adductor tubercle of the medial epicondyle of the femur.",
      },
    );
  } else if (/biceps_femoris/.test(nameLow)) {
    specs.push(
      {
        id: "bf_long_head",
        name_en: "Long Head (Ischial Tuberosity — Tibial Division of Sciatic L5–S2)",
        name_ar: "الرأس الطويل (الأحدوبة الإسكية — القسم الظنبوبي للعصب الوركي)",
        kind: "landmark",
        nx: -0.35,
        ny: 0.82,
        nz: 0.35,
        description: "Crosses both hip and knee; arises from the medial facet of the ischial tuberosity via a conjoint tendon with semitendinosus. Innervated by tibial division of sciatic nerve.",
      },
      {
        id: "bf_short_head",
        name_en: "Short Head (Linea Aspera — Common Fibular Division of Sciatic L5–S2)",
        name_ar: "الرأس القصير (الخط الخشن — القسم الشظوي المشترك للعصب الوركي)",
        kind: "landmark",
        nx: 0.42,
        ny: 0.48,
        nz: 0.62,
        description: "Mono-articular knee flexor arising from the lateral lip of the linea aspera and lateral supracondylar line; uniquely innervated by the common fibular division of the sciatic nerve.",
      },
      {
        id: "bf_fibular_head_insertion",
        name_en: "Distal Tendon Split by Fibular Collateral Ligament & Common Fibular Nerve Relation",
        name_ar: "الوتر القاصي على رأس الشظية وعلاقته بالعصب الشظوي المشترك",
        kind: "notch",
        nx: 0.65,
        ny: 0.08,
        nz: 0.48,
        description: "Forms the superolateral border of the popliteal fossa; its distal tendon is split by the fibular collateral ligament on the fibular head with the common fibular nerve running along its medial edge.",
      },
    );
  } else if (/gastrocnemius/.test(nameLow)) {
    specs.push(
      {
        id: "gast_medial_head",
        name_en: "Medial Head (Larger Medial Femoral Condyle Belly)",
        name_ar: "الرأس الإنسي (البطن الإنسي الأكبر من اللقمة الفخذية الإنسية)",
        kind: "landmark",
        nx: -0.45,
        ny: 0.82,
        nz: 0.45,
        description: "Larger and more inferiorly extending head arising from the popliteal surface of the femur superior to the medial condyle.",
      },
      {
        id: "gast_lateral_head",
        name_en: "Lateral Head (Lateral Femoral Condyle & Fabella Branch)",
        name_ar: "الرأس الوحشي (اللقمة الفخذية الوحشية وعظيمة الفابيلا)",
        kind: "landmark",
        nx: 0.48,
        ny: 0.84,
        nz: 0.45,
        description: "Arises from the lateral aspect of the lateral femoral condyle; often contains the sesamoid bone fabella.",
      },
      {
        id: "gast_popliteal_hilum",
        name_en: "Popliteal Neurovascular Groove (Tibial Nerve S1–S2 & Sural Arteries)",
        name_ar: "الميزابة المأبضية وفروع العصب الظنبوبي والشرايين الربلية (S1–S2)",
        kind: "notch",
        nx: 0.0,
        ny: 0.72,
        nz: 0.68,
        description: "Inferior triangle of the popliteal fossa between the two heads where tibial nerve motor branches and medial/lateral sural arteries enter.",
      },
      {
        id: "gast_achilles_junction",
        name_en: "Musculotendinous Junction & Calcaneal (Achilles) Tendon",
        name_ar: "الملتقى العضلي الوتري ووتر العرقوب (أخيل)",
        kind: "landmark",
        nx: 0.0,
        ny: 0.14,
        nz: 0.35,
        description: "Aponeurotic confluence with the soleus tendon forming the calcaneal tendon (Achilles tendon) inserting on the middle third of the posterior calcaneus.",
      },
    );
  } else if (/soleus/.test(nameLow)) {
    specs.push(
      {
        id: "sol_fibular_head",
        name_en: "Fibular Origin Branch (Posterior Head & Upper Shaft of Fibula)",
        name_ar: "المنشأ الشظوي الوحشي (رأس وأعلى عظم الشظية)",
        kind: "landmark",
        nx: 0.55,
        ny: 0.85,
        nz: 0.55,
        description: "Lateral origin from the posterior aspect of the head and superior quarter of the shaft of the fibula.",
      },
      {
        id: "sol_tendinous_arch",
        name_en: "Tendinous Arch of Soleus (Tibial Nerve & Posterior Tibial Artery Portal)",
        name_ar: "القوس الوتري للعضلة النعلية (ممر العصب الظنبوبي والشريان الظنبوبي الخلفي)",
        kind: "notch",
        nx: 0.0,
        ny: 0.78,
        nz: 0.68,
        description: "Fibrous arch spanning between the fibula and tibia through which the popliteal vessels and tibial nerve pass into the deep posterior compartment.",
      },
      {
        id: "sol_tibial_soleal_line",
        name_en: "Tibial Origin Branch (Soleal Line & Middle Medial Border)",
        name_ar: "المنشأ الظنبوبي الإنسي (الخط النعلي والحافة الإنسية للظنبوب)",
        kind: "landmark",
        nx: -0.5,
        ny: 0.7,
        nz: 0.6,
        description: "Oblique origin along the soleal line and middle third of the medial border of the tibia; houses the rich venous plexus ('peripheral heart' calf pump).",
      },
      {
        id: "sol_calcaneal_tendon",
        name_en: "Deep Lamina of Calcaneal (Achilles) Tendon",
        name_ar: "الصفيحة العميقة لوتر العرقوب (أخيل)",
        kind: "landmark",
        nx: 0.0,
        ny: 0.1,
        nz: 0.35,
        description: "Thick distal tendon joining gastrocnemius to insert onto the posterior surface of the calcaneus.",
      },
    );
  } else if (/digastric/.test(nameLow)) {
    specs.push(
      {
        id: "dig_anterior_belly",
        name_en: "Anterior Belly (Digastric Fossa — Nerve to Mylohyoid CN V3)",
        name_ar: "البطن الأمامي (الحفرة ذات البطنين — العصب الضرسي اللامي CN V3)",
        kind: "landmark",
        nx: -0.35,
        ny: 0.28,
        nz: 0.88,
        description: "Derived from the 1st pharyngeal arch; arises from the digastric fossa of the mandible and is innervated by the nerve to mylohyoid (branch of inferior alveolar nerve, CN V3).",
      },
      {
        id: "dig_intermediate_tendon",
        name_en: "Intermediate Tendon & Fibrous Hyoid Sling (Submandibular Triangle Apex)",
        name_ar: "الوتر الأوسط والرباط الليفي للعظم اللامي",
        kind: "notch",
        nx: 0.05,
        ny: 0.14,
        nz: 0.55,
        description: "Rounded intermediate tendon perforating stylohyoid and tethered to the body/greater horn of the hyoid bone by a fibrous fascial sling.",
      },
      {
        id: "dig_posterior_belly",
        name_en: "Posterior Belly (Mastoid Notch — Digastric Branch of Facial Nerve CN VII)",
        name_ar: "البطن الخلفي (الثلمة الخشائية — الفرع ذو البطنين للعصب الوجهي CN VII)",
        kind: "landmark",
        nx: 0.65,
        ny: 0.85,
        nz: 0.15,
        description: "Derived from the 2nd pharyngeal arch; arises from the mastoid notch of the temporal bone, innervated by the digastric branch of CN VII, and serves as the surgical shield lateral to the carotid sheath & CN XII.",
      },
    );
  } else if (/omohyoid/.test(nameLow)) {
    specs.push(
      {
        id: "omo_superior_belly",
        name_en: "Superior Belly (Hyoid Body — Superior Root of Ansa Cervicalis C1)",
        name_ar: "البطن العلوي (العظم اللامي — الجذر العلوي للعروة العنقية C1)",
        kind: "landmark",
        nx: -0.55,
        ny: 0.86,
        nz: 0.78,
        description: "Descends nearly vertically from the inferior border of the body of the hyoid bone, dividing the anterior triangle into carotid and muscular triangles.",
      },
      {
        id: "omo_intermediate_tendon",
        name_en: "Intermediate Tendon & Clavipectoral Fascial Sling (Over IJV)",
        name_ar: "الوتر الأوسط والرباط الصفاقي الترقوي (أمام الوريد الوداجي الداخلي)",
        kind: "notch",
        nx: 0.0,
        ny: 0.42,
        nz: 0.58,
        description: "Anchored to the clavicle by a deep cervical fascial sling directly overlying the internal jugular vein (surgical landmark for Level III/IV neck node division).",
      },
      {
        id: "omo_inferior_belly",
        name_en: "Inferior Belly (Suprascapular Notch — Ansa Cervicalis C1–C3)",
        name_ar: "البطن السفلي (الثلمة فوق الكتف — العروة العنقية C1–C3)",
        kind: "landmark",
        nx: 0.68,
        ny: 0.16,
        nz: 0.25,
        description: "Arises from the superior border of the scapula near the suprascapular notch; subdivides the posterior triangle into occipital and supraclavicular (omoclavicular) triangles.",
      },
    );
  } else if (/temporalis/.test(nameLow)) {
    specs.push(
      {
        id: "temp_anterior_vertical",
        name_en: "Anterior Vertical Fibers (Mandibular Elevator Branch)",
        name_ar: "الألياف العمودية الأمامية (رافعة الفك السفلي)",
        kind: "landmark",
        nx: 0.15,
        ny: 0.65,
        nz: 0.82,
        description: "Vertical anterior fibers arising from the anterior temporal fossa; elevate the mandible to close the jaws.",
      },
      {
        id: "temp_middle_oblique",
        name_en: "Middle Fan-Shaped Oblique Fibers & Deep Temporal Nerves (CN V3)",
        name_ar: "الألياف المائلة الوسطى والأعصاب الصدغية العميقة (CN V3)",
        kind: "notch",
        nx: 0.25,
        ny: 0.72,
        nz: 0.5,
        description: "Central fan fibers supplied on their deep bony aspect by the anterior and posterior deep temporal nerves (CN V3) and deep temporal branches of the maxillary artery.",
      },
      {
        id: "temp_posterior_horizontal",
        name_en: "Posterior Horizontal Fibers (Mandibular Retractor Branch)",
        name_ar: "الألياف الأفقية الخلفية (مرجعة الفك السفلي للخلف)",
        kind: "landmark",
        nx: 0.15,
        ny: 0.55,
        nz: 0.18,
        description: "Horizontal posterior fibers pulling the protruded mandible backward (retraction).",
      },
      {
        id: "temp_coronoid_insertion",
        name_en: "Coronoid Process & Anterior Ramus Tendinous Insertion",
        name_ar: "المرتكز الوتري على الناتئ المنقاري والحافة الأمامية للفرع الفكي",
        kind: "landmark",
        nx: -0.25,
        ny: 0.12,
        nz: 0.68,
        description: "Convergent tendon passing deep to the zygomatic arch to insert onto the apex, medial surface, and anterior border of the coronoid process of the mandible.",
      },
    );
  } else if (/masseter/.test(nameLow)) {
    specs.push(
      {
        id: "mass_superficial_part",
        name_en: "Superficial Part (Zygomatic Process of Maxilla → Angle of Mandible)",
        name_ar: "الجزء السطحي الكبير (الناتئ الوجني للفك العلوي إلى زاوية الفك السفلي)",
        kind: "landmark",
        nx: 0.35,
        ny: 0.45,
        nz: 0.75,
        description: "Thickest oblique lamina arising from the anterior two-thirds of the lower border of the zygomatic arch and inserting onto the masseteric tuberosity at the mandibular angle.",
      },
      {
        id: "mass_deep_part",
        name_en: "Deep Vertical Part & Masseteric Neurovascular Notch Branch (CN V3)",
        name_ar: "الجزء العميق العمودي وحزمة العصب والشريان الماضغي عبر ثلمة الفك",
        kind: "notch",
        nx: -0.2,
        ny: 0.76,
        nz: 0.35,
        description: "Vertical deep fibers from the posterior third and medial surface of the zygomatic arch; receives the masseteric nerve (CN V3) and artery traversing the mandibular notch.",
      },
    );
  } else if (/levator_ani|pubococcygeus|iliococcygeus|puborectalis/.test(nameLow)) {
    specs.push(
      {
        id: "la_puborectalis",
        name_en: "Puborectalis Sling (80° Anorectal Continence Angle)",
        name_ar: "عروة العضلة العانية المستقيمية (الزاوية الشرجية المستقيمية)",
        kind: "notch",
        nx: -0.45,
        ny: 0.35,
        nz: 0.65,
        description: "U-shaped medial muscular sling looping around the anorectal junction to maintain the 80° anorectal angle for fecal continence.",
      },
      {
        id: "la_pubococcygeus",
        name_en: "Pubococcygeus Part (Puboprostaticus / Pubovaginalis & Perineal Body)",
        name_ar: "الجزء العاني العصعصي (الألياف العانية البروستاتية / المهبلية)",
        kind: "landmark",
        nx: -0.15,
        ny: 0.5,
        nz: 0.72,
        description: "Intermediate medial fibers arising from the posterior body of the pubis and anterior tendinous arch, inserting into the perineal body and anococcygeal ligament.",
      },
      {
        id: "la_iliococcygeus",
        name_en: "Iliococcygeus Part (Tendinous Arch of Levator Ani → Coccyx)",
        name_ar: "الجزء الحرقفي العصعصي (القوس الوتري للرافعة الشرجية)",
        kind: "landmark",
        nx: 0.55,
        ny: 0.68,
        nz: 0.32,
        description: "Posterolateral sheet arising from the tendinous arch of the obturator internus fascia and ischial spine; innervated by nerve to levator ani (S3–S4) and inferior rectal/perineal branches of pudendal nerve.",
      },
    );
  } else {
    // Comprehensive 4-Point Anatomical Branch System for every remaining muscle in the 503-muscle atlas!
    const cleanEn = organ.name_en.replace(/\s*\((left|right)\)\s*/gi, "").trim();
    const isHorizontal =
      worldBox.max.x - worldBox.min.x > (worldBox.max.y - worldBox.min.y) * 1.15;

    specs.push(
      {
        id: "prox_origin_branch",
        name_en: `Proximal Origin Head / Attachment (${cleanEn.slice(0, 22)})`,
        name_ar: "الرأس الداني / فرع المنشأ العضلي (Proximal Head)",
        kind: "landmark",
        nx: isHorizontal ? -0.65 : -0.15,
        ny: isHorizontal ? 0.55 : 0.86,
        nz: 0.55,
        description:
          originTxt ||
          `Proximal muscular origin head and aponeurotic attachment fibers of ${cleanEn}.`,
      },
      {
        id: "neurovascular_hilum_branch",
        name_en: "Motor Nerve & Vascular Hilum Branch (Motor Point)",
        name_ar: "المدخل العصبي الحركي والفرع الشرياني المغذي (Motor Hilum)",
        kind: "notch",
        nx: 0.18,
        ny: 0.62,
        nz: 0.38,
        description:
          nerveTxt || bloodTxt
            ? `Motor Nerve Branch: ${nerveTxt || "Regional motor branch"}. Vascular Branch: ${bloodTxt || "Regional muscular arterial perforators"}.`
            : `Deep neurovascular hilum where motor nerve twigs and muscular arterial branches enter ${cleanEn}.`,
      },
      {
        id: "contractile_belly_branch",
        name_en: "Main Contractile Belly & Fascicular Fascicle",
        name_ar: "البطن العضلي الانقباضي الرئيسي وحزم الألياف",
        kind: "landmark",
        nx: 0.0,
        ny: 0.48,
        nz: 0.68,
        description:
          actionTxt ||
          `Central contractile muscular belly of ${cleanEn} generating primary line-of-pull tension.`,
      },
      {
        id: "distal_tendon_branch",
        name_en: `Distal Tendinous Slip / Insertion (${cleanEn.slice(0, 22)})`,
        name_ar: "الفرع الوتري القاصي / لسان المرتكز (Distal Slip)",
        kind: "landmark",
        nx: isHorizontal ? 0.68 : 0.15,
        ny: isHorizontal ? 0.45 : 0.12,
        nz: 0.52,
        description:
          insertionTxt ||
          `Distal tendinous slip and osteotendinous insertion branch of ${cleanEn}.`,
      },
    );
  }

  const size = worldBox.getSize(new THREE.Vector3());
  const center = worldBox.getCenter(new THREE.Vector3());
  const posAttr = geom.attributes.position as THREE.BufferAttribute | undefined;
  const v = new THREE.Vector3();

  return specs.map((spec) => {
    const targetX = center.x + spec.nx * latSign * (size.x * 0.46);
    const targetY = worldBox.min.y + spec.ny * size.y;
    const targetZ = worldBox.min.z + spec.nz * size.z;

    let bestX = targetX;
    let bestY = targetY;
    let bestZ = targetZ;

    if (posAttr && posAttr.count > 0) {
      let minDistSq = Number.POSITIVE_INFINITY;
      const stride = Math.max(1, Math.floor(posAttr.count / 650));
      for (let i = 0; i < posAttr.count; i += stride) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(matrix);
        const dx = v.x - targetX;
        const dy = v.y - targetY;
        const dz = v.z - targetZ;
        const dSq = dx * dx + dy * dy + dz * dz;
        if (dSq < minDistSq) {
          minDistSq = dSq;
          bestX = v.x;
          bestY = v.y;
          bestZ = v.z;
        }
      }
    }

    return {
      id: spec.id,
      name_en: spec.name_en,
      name_ar: spec.name_ar,
      kind: spec.kind,
      description: spec.description,
      worldPos: [bestX, bestY, bestZ],
    };
  });
}
