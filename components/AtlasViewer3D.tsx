"use client";

import { ATLAS_VIEWER_SNAPSHOTS as PREBAKED_STUDIO_SNAPSHOTS } from "./atlasViewerSnapshots";

import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  ContactShadows,
  Bounds,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader, DRACOLoader } from "three-stdlib";
import type { AtlasPanelScientificEntry } from "@/lib/atlasScientificContent";
import type { AnatomicalSystem } from "@/lib/schemas";
import { matchMeshToEntry } from "@/lib/atlasKnowledgeIndex";
import AnatomyInfoCard from "@/components/AnatomyInfoCard";
import { injectVokaAnatomicalShader } from "@/features/viewer/OrganMesh";
export interface Tissue {
  organ_id: string;
  ta2_latin: string;
  name_en: string;
  system: AnatomicalSystem;
}

export function tissueShaderId(tissue: Tissue): number {
  const n = tissue.name_en.toLowerCase();
  if (/bone|skull|vertebra|rib|costa|femur|tibia|fibula|humerus|radius|ulna|sternum|mandible|maxilla|pelvis|scapula|clavic|carpal|tarsal|phalan|sacrum|coccyx|patella|os /.test(n)) {
    return 0;
  }
  if (/tendo|aponeurosis|fascia|retinaculum|ligament|cartilag|meniscus|discus|bursa/.test(n)) {
    return 2;
  }
  if (/muscle|muscul|biceps|triceps|deltoid|rectus|gluteus|pectoral|latissimus|trapezius|masseter|temporalis|sartorius|gastrocnemius|soleus|diaphragm|oblique|vastus|adductor|semitendin|semimembran|iliopsoas|psoas|pronator|flexor|extensor|anconeus|supinator|brachioradialis/.test(n)) {
    return 1;
  }
  if (/artery|arteria|aorta|carotid|coronary|truncus|ventricle|atrium|heart|myocard|vein|vena|jugular|cava|sinus|saphen/.test(n)) {
    return 3;
  }
  if (/nerve|nervus|plexus|brain|cerebr|cerebell|spinal|vagus|sciatic|ganglion|gyrus|sulcus|thalam|putamen|caudat|insula/.test(n)) {
    return 4;
  }
  if (/liver|hepar|gallbladder|biliary|spleen|pancrea|stomach|gaster|kidney|ren|lung|pulmo/.test(n)) {
    return 5;
  }
  return 6;
}

export function tissueColour(tissue: Tissue): THREE.Color {
  const n = tissue.name_en.toLowerCase();
  if (/bone|skull|vertebra|rib|costa|femur|tibia|fibula|humerus|radius|ulna|sternum|mandible|maxilla|pelvis|scapula|clavic|carpal|tarsal|phalan|sacrum|coccyx|patella/.test(n)) {
    return new THREE.Color("#EFE6D8");
  }
  if (/cartilag|meniscus|discus|ligament/.test(n)) {
    return new THREE.Color("#38bdf8");
  }
  if (/tendo|tendon|aponeurosis|retinaculum/.test(n)) {
    return new THREE.Color("#F3E3D3");
  }
  if (/muscle|muscul|biceps|triceps|deltoid|rectus|gluteus|pectoral|latissimus|trapezius|masseter|temporalis|sartorius|gastrocnemius|soleus|diaphragm|oblique|vastus|adductor|semitendin|semimembran|iliopsoas|psoas|pronator|flexor|extensor|anconeus|supinator|brachioradialis/.test(n)) {
    return new THREE.Color("#E8A09A");
  }
  if (/artery|arteria|aorta|carotid|coronary|truncus/.test(n)) {
    return new THREE.Color("#d6423d");
  }
  if (/vein|vena|jugular|cava|sinus|saphen/.test(n)) {
    return new THREE.Color("#4472b8");
  }
  if (/myocard|ventricle|atrium|heart/.test(n)) {
    return new THREE.Color("#be404a");
  }
  if (/nerve|nervus|plexus/.test(n)) {
    return new THREE.Color("#eedb7a");
  }
  if (/brain|cerebr|cerebell|gyrus|sulcus|thalam|putamen|caudat|insula|hippocamp/.test(n)) {
    return new THREE.Color("#e4969c");
  }
  if (/lymph|node|nodus|thymus|spleen/.test(n)) {
    return new THREE.Color("#22c55e");
  }
  if (/kidney|ren/.test(n)) {
    return new THREE.Color("#aa5344");
  }
  if (/pancreas|pancreatic/.test(n)) {
    return new THREE.Color("#e1c68e");
  }
  if (/liver|hepar/.test(n)) {
    return new THREE.Color("#8a3c2f");
  }
  if (/stomach|gaster/.test(n)) {
    return new THREE.Color("#cf8672");
  }
  if (/lung|pulmo/.test(n)) {
    return new THREE.Color("#ebb4be");
  }
  if (/thyroid|parathyroid|adrenal|suprarenal|pituitary|pineal|hypothalamus/.test(n)) {
    return new THREE.Color("#c084fc");
  }
  return new THREE.Color("#d48c6f");
}

export function tissueRoughness(system: AnatomicalSystem): number {
  if (system === "skeletal") return 0.70;
  if (system === "articular") return 0.22;
  if (system === "muscular") return 0.70;
  if (system === "cardiovascular") return 0.24;
  if (system === "nervous") return 0.32;
  return 0.32;
}

export function tissueOpacity(tissue: Tissue): number {
  const n = tissue.name_en.toLowerCase();
  if (/cornea|lens|vitreous/.test(n)) return 0.25;
  if (/bursa/.test(n)) return 0.35;
  return 1.0;
}
import { useSceneStore } from "@/stores/sceneStore";

const DRACO_DECODER_PATH = "/draco/";
try {
  useGLTF.setDecoderPath(DRACO_DECODER_PATH);
} catch {}

/**
 * تحويل اسم الـ Mesh في ملف الـ GLB إلى كائن Tissue مطابق تماماً لما يستخدمه العرض التفاعلي الرئيسي
 * (`OrganMesh.tsx` + `palette.ts`) لضمان تطابق الألوان والخامات بنسبة 100%.
 */
function resolveOrganTissue(
  meshName: string,
  panelId: string,
  fallbackSystem?: AnatomicalSystem,
): Tissue {
  const storeOrgans = useSceneStore.getState().organs;
  if (storeOrgans) {
    const direct = storeOrgans[meshName];
    if (direct) return direct;
    for (const org of Object.values(storeOrgans)) {
      if (
        org.node === meshName ||
        THREE.PropertyBinding.sanitizeNodeName(org.node) === meshName
      ) {
        return org;
      }
    }
  }

  const cleanName = meshName
    .replace(/_/g, " ")
    .replace(/\.l$/i, " left")
    .replace(/\.r$/i, " right")
    .replace(/\d+$/g, "")
    .trim();

  const resolvedSystem: AnatomicalSystem =
    fallbackSystem ??
    (panelId === "tendons"
      ? "muscular"
      : panelId === "heart_sounds"
        ? "cardiovascular"
        : panelId === "breath_sounds"
          ? "respiratory"
          : panelId === "scanner"
            ? "skeletal"
            : (panelId as AnatomicalSystem));

  return {
    organ_id: meshName,
    ta2_latin: cleanName,
    name_en: cleanName,
    system: resolvedSystem,
  };
}

/**
 * خامات واقعية فيزيائية مطابقة تماماً للعرض التفاعلي الرئيسي (`OrganMesh.tsx` + `palette.ts`)
 */
export function pickMaterial(
  name: string,
  accent: string,
  clippingPlanes?: THREE.Plane[],
  isSelected = false,
  panelId = "muscular",
  system?: AnatomicalSystem,
): THREE.Material {
  const tissue = resolveOrganTissue(name, panelId, system);
  const tShaderId = tissueShaderId(tissue);
  const baseColor = isSelected ? (tissue.system === "nervous" ? new THREE.Color("#fef08a") : new THREE.Color("#38bdf8")) : tissueColour(tissue);
  const roughness = tissueRoughness(tissue.system);
  const opacity = panelId === "tendons" ? 1 : tissueOpacity(tissue);
  const ghosted = opacity < 1;

  let physicalCoat: THREE.MeshPhysicalMaterialParameters;
  if (tShaderId === 0) {
    physicalCoat = {
      clearcoat: 0.22,
      clearcoatRoughness: 0.32,
      sheen: 0.14,
      sheenColor: new THREE.Color("#fffdf7"),
    };
  } else if (tShaderId === 2) {
    physicalCoat = {
      clearcoat: 0.58,
      clearcoatRoughness: 0.16,
      sheen: 0.48,
      sheenColor: new THREE.Color("#e8f4fa"),
    };
  } else if (tShaderId === 1) {
    physicalCoat = {
      clearcoat: 0.0,
      clearcoatRoughness: 1.0,
      sheen: 0.04,
      sheenColor: new THREE.Color("#4a1216"),
    };
  } else if (tShaderId === 3) {
    physicalCoat = {
      clearcoat: 0.72,
      clearcoatRoughness: 0.16,
      sheen: 0.54,
      sheenColor: new THREE.Color("#ffb3c1"),
    };
  } else if (tShaderId === 4) {
    physicalCoat = {
      clearcoat: 0.34,
      clearcoatRoughness: 0.24,
      sheen: 0.48,
      sheenColor: new THREE.Color("#fff3c4"),
    };
  } else {
    physicalCoat = {
      clearcoat: 0.48,
      clearcoatRoughness: 0.22,
      sheen: 0.55,
      sheenColor: new THREE.Color("#ffd6dc"),
    };
  }

  const mat = new THREE.MeshPhysicalMaterial({
    color: baseColor,
    roughness,
    metalness: tShaderId === 1 ? 0.0 : 0.04,
    envMapIntensity: tShaderId === 1 ? 0.12 : 0.85,
    ...physicalCoat,
    transparent: ghosted,
    opacity,
    depthWrite: !ghosted,
    side: THREE.DoubleSide,
    clippingPlanes,
    clipShadows: true,
    emissive: isSelected
      ? tissue.system === "nervous"
        ? new THREE.Color("#facc15")
        : new THREE.Color("#00a8e8")
      : new THREE.Color(accent).multiplyScalar(0.02),
    emissiveIntensity: isSelected ? (tissue.system === "nervous" ? 1.55 : 0.26) : 0.08,
  });

  mat.onBeforeCompile = (shader) => injectVokaAnatomicalShader(shader, tShaderId);
  mat.customProgramCacheKey = () =>
    `cb-darkspot-t${tShaderId}-${isSelected ? "sel" : "std"}-v5`;
  return mat;
}

/**
 * بيئة الغرفة المظلمة مع كشاف الإضاءة الجانبي (Dark Room + Side Spotlight PMREM Environment)
 */
function buildDarkSpotEnvironmentTexture(gl: THREE.WebGLRenderer): {
  texture: THREE.Texture;
  dispose: () => void;
} {
  const pmrem = new THREE.PMREMGenerator(gl);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#020408");

  // كشاف إضاءة جانبي ساطع (Side Spotlight Softbox)
  const sideSpotBox = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 3.25, 2.95) }),
  );
  sideSpotBox.position.set(-7.5, 2.2, 3.8);
  sideSpotBox.lookAt(0, 0, 0);

  // إضاءة حافة خلفية خفيفة جداً لفصل المجسم عن الخلفية السوداء
  const rimBox = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.55, 0.85) }),
  );
  rimBox.position.set(6, 1.5, -5);
  rimBox.lookAt(0, 0, 0);

  envScene.add(sideSpotBox, rimBox);

  const renderTarget = pmrem.fromScene(envScene, 0.04);
  return {
    texture: renderTarget.texture,
    dispose: () => {
      renderTarget.dispose();
      pmrem.dispose();
    },
  };
}

export function StudioEnvironment() {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    const { texture, dispose } = buildDarkSpotEnvironmentTexture(gl);
    const previousEnv = scene.environment;
    scene.environment = texture;

    return () => {
      scene.environment = previousEnv;
      dispose();
    };
  }, [gl, scene]);

  return null;
}

/**
 * إعداد إضاءة الغرفة المظلمة مع السبوت الجانبي (Side Spotlight in Dark Room)
 */
function addDarkRoomSideSpotlight(scene: THREE.Scene, target: THREE.Vector3) {
  // إضاءة محيطية خافتة جداً للحفاظ على سواد الغرفة والظلال العميقة
  const ambient = new THREE.AmbientLight(0x0c1222, 0.22);

  // كشاف السبوت الجانبي الرئيسي (Main Side Spotlight)
  const sideSpot = new THREE.DirectionalLight(0xfff6e6, 3.65);
  sideSpot.position.set(
    target.x - 3.6,
    target.y + 1.15,
    target.z + 2.1,
  );
  sideSpot.target.position.copy(target);

  // إضاءة تحديد خلفية خفيفة (Subtle Edge Rim Light)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.52);
  rimLight.position.set(
    target.x + 2.8,
    target.y + 0.7,
    target.z - 2.4,
  );
  rimLight.target.position.copy(target);

  // إضاءة ملء خفيفة جداً من الأمام لمنع انعدام التفاصيل في التجاويف العميقة
  const softFill = new THREE.DirectionalLight(0x94a3b8, 0.28);
  softFill.position.set(
    target.x + 1.2,
    target.y - 0.4,
    target.z + 3.0,
  );
  softFill.target.position.copy(target);

  scene.add(
    ambient,
    sideSpot,
    sideSpot.target,
    rimLight,
    rimLight.target,
    softFill,
    softFill.target,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Shared Offscreen 3D Renderer & GLTF Cache
 * ═══════════════════════════════════════════════════════════════════════════ */

// Imported from ./atlasViewerSnapshots


const SNAPSHOT_CACHE = new Map<string, string>(
  Object.entries(PREBAKED_STUDIO_SNAPSHOTS),
);
const SNAPSHOT_INFLIGHT = new Map<string, Promise<string>>();
const GLTF_SCENE_CACHE = new Map<string, Promise<THREE.Group>>();

let sharedLoader: GLTFLoader | null = null;
let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedEnvTexture: THREE.Texture | null = null;
let renderQueue: Promise<unknown> = Promise.resolve();

function getSharedGltfLoader(): GLTFLoader {
  if (!sharedLoader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_DECODER_PATH);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    sharedLoader = loader;
  }
  return sharedLoader;
}

export function loadCachedGltfScene(url: string): Promise<THREE.Group> {
  const existing = GLTF_SCENE_CACHE.get(url);
  if (existing) return existing;

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    getSharedGltfLoader().load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (err) => {
        GLTF_SCENE_CACHE.delete(url);
        reject(err);
      },
    );
  });

  GLTF_SCENE_CACHE.set(url, promise);
  return promise;
}

const SNAPSHOT_WIDTH = 560;
const SNAPSHOT_HEIGHT = 400;

function getSharedStudioRenderer(): {
  renderer: THREE.WebGLRenderer;
  envTexture: THREE.Texture;
} {
  if (!sharedRenderer || !sharedEnvTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = SNAPSHOT_WIDTH;
    canvas.height = SNAPSHOT_HEIGHT;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.localClippingEnabled = true;

    const env = buildDarkSpotEnvironmentTexture(renderer);
    sharedRenderer = renderer;
    sharedEnvTexture = env.texture;
  }
  return { renderer: sharedRenderer, envTexture: sharedEnvTexture };
}

/**
 * تحديد ما إذا كان الـ Mesh ينتمي للقلب والأوعية الكبرى (وليس أوعية الأطراف البعيدة)
 */
function isHeartOrGreatVesselName(rawName: string): boolean {
  const n = rawName.replace(/_/g, " ").toLowerCase();
  // إظهار مجسم القلب نفسه فقط (الحجرات الأربع، الصمامات، العضلة القلبية، والشرايين/الأوردة التاجية الملتصقة بجدار القلب) دون الشرايين والأوردة الخارجية
  return /\b(left atrium|right atrium|left ventricle|right ventricle|atrium|auricula|ventricul|myocard|coronar|anterior interventricular|posterior interventricular|circumflex branch of left|great cardiac vein|middle cardiac vein|small cardiac vein|coronary sinus|sinus coronarius|tricuspid valve|mitral valve|aortic valve|pulmonary valve|valva|cuspis|chordae|papillar|fibrous ring|fibrous trigone)\b/.test(
    n,
  );
}

/**
 * فلترة الـ Meshes الخاصة بكل بانل بدقة مطابقة للعرض التفاعلي
 */
function filterAndStylePanelClone(
  baseScene: THREE.Group,
  panel: AtlasPanelScientificEntry,
  activePlanes: THREE.Plane[] = [],
): {
  clone: THREE.Group;
  materials: THREE.Material[];
  visibleBox: THREE.Box3;
} {
  const clone = baseScene.clone(true);
  clone.updateMatrixWorld(true);
  const materials: THREE.Material[] = [];

  // في حالة أصوات القلب، نعزل القلب والأوعية الكبرى المتصلة به مباشرة
  let heartCoreBox: THREE.Box3 | null = null;
  if (panel.id === "heart_sounds") {
    const hb = new THREE.Box3();
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry && isHeartOrGreatVesselName(m.name)) {
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        if (m.geometry.boundingBox) {
          hb.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));
        }
      }
    });
    if (!hb.isEmpty()) {
      heartCoreBox = hb.expandByScalar(0.035);
    }
  }

  const visibleBox = new THREE.Box3();

  clone.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;

    const cleanName = m.name.replace(/_/g, " ").toLowerCase();
    let showMesh = true;

    const isInsertionPatch =
      m.name.endsWith(".el") ||
      m.name.endsWith(".er") ||
      m.name.endsWith(".ol") ||
      m.name.endsWith(".or");

    if (panel.id === "tendons") {
      // إظهار الأوتار والأغماد الوترية والقيود فقط بعد إزالة الفاشيا والجرابات الزليلية بالكامل
      showMesh =
        !isInsertionPatch &&
        /\b(tendo|tendon|tendinis|retinaculum|sheath|vincula|chiasm)\b/.test(
          cleanName,
        ) &&
        !/\b(fascia|bursa|aponeurosis|iliotibial)\b/.test(cleanName);
    } else if (panel.id === "muscular") {
      // إظهار المجسم العضلي مطابقاً 100% للمجسم التفاعلي ثلاثي الأبعاد
      showMesh =
        !isInsertionPatch &&
        !/\b(fascia|bursa|bursae|sheath|sheaths|retinaculum|septum|iliopectineal arch|palmar aponeurosis|plantar aponeurosis|epicranial aponeurosis|linea alba|inguinal ligament)\b/.test(
          cleanName,
        ) ||
        /tensor fasciae latae/.test(cleanName);
    } else if (panel.id === "integumentary") {
      const tissue = resolveOrganTissue(m.name, panel.id, panel.system);
      if (tissue.system && tissue.system !== "integumentary") {
        showMesh = /\b(mammary|mammaria|breast|nipple|areola|skin|cutis|dermis|subcut|pectoral)\b/.test(
          cleanName,
        );
      }
    } else if (panel.id === "heart_sounds") {
      showMesh = isHeartOrGreatVesselName(m.name);
    } else if (panel.id === "breath_sounds") {
      // التركيز على الرئتين والقصبة الهوائية والشعب الهوائية
      showMesh =
        /\b(pulmo|lung|lobe|lobus|trachea|bronch|carina|pleura|hilum|lingula)\b/.test(
          cleanName,
        ) || !/\b(nose|nasal|sinus|pharyn|oral|tongue)\b/.test(cleanName);
    }

    m.visible = showMesh;
    if (showMesh) {
      const mat = pickMaterial(
        m.name,
        panel.accent,
        activePlanes,
        false,
        panel.id,
        panel.system,
      );
      materials.push(mat);
      m.material = mat;
      if (m.geometry) {
        if (panel.id === "lymphatic" && !m.geometry.userData.__cbStudioLymphExpanded) {
          const posAttr = m.geometry.attributes.position;
          if (posAttr && posAttr.count >= 86 && posAttr.count % 86 === 0) {
            const gClone = m.geometry.clone();
            if (!gClone.attributes.normal) gClone.computeVertexNormals();
            const pos = gClone.attributes.position as THREE.BufferAttribute;
            const norm = gClone.attributes.normal as THREE.BufferAttribute | undefined;
            const avgScale =
              (Math.abs(m.scale.x) + Math.abs(m.scale.y) + Math.abs(m.scale.z)) / 3 || 1.3;
            const targetLocalRadius = 0.0052 / Math.max(0.5, avgScale);
            const numSpheres = pos.count / 86;
            for (let s = 0; s < numSpheres; s++) {
              const start = s * 86;
              let cx = 0, cy = 0, cz = 0;
              for (let i = start; i < start + 86; i++) {
                cx += pos.getX(i);
                cy += pos.getY(i);
                cz += pos.getZ(i);
              }
              cx /= 86; cy /= 86; cz /= 86;
              let maxR = 0;
              for (let i = start; i < start + 86; i++) {
                const dx = pos.getX(i) - cx;
                const dy = pos.getY(i) - cy;
                const dz = pos.getZ(i) - cz;
                const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (r > maxR) maxR = r;
              }
              if (maxR > 0 && maxR <= 0.025) {
                for (let i = start; i < start + 86; i++) {
                  const dx = pos.getX(i) - cx;
                  const dy = pos.getY(i) - cy;
                  const dz = pos.getZ(i) - cz;
                  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
                  const nx = dx / len, ny = dy / len, nz = dz / len;
                  pos.setXYZ(i, cx + nx * targetLocalRadius, cy + ny * targetLocalRadius, cz + nz * targetLocalRadius);
                  const nSign = m.matrixWorld.determinant() < 0 ? -1 : 1;
                  if (norm) norm.setXYZ(i, nx * nSign, ny * nSign, nz * nSign);
                }
              }
            }
            pos.needsUpdate = true;
            if (norm) norm.needsUpdate = true;
            gClone.computeBoundingBox();
            gClone.computeBoundingSphere();
            gClone.userData.__cbStudioLymphExpanded = true;
            m.geometry = gClone;
          }
        }
        if (!m.geometry.attributes.normal) {
          m.geometry.computeVertexNormals();
        }
        if (!m.geometry.boundingBox) {
          m.geometry.computeBoundingBox();
        }
        if (m.geometry.boundingBox) {
          visibleBox.union(
            m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld),
          );
        }
      }
    }
  });

  if (visibleBox.isEmpty()) {
    visibleBox.setFromObject(clone);
  }

  return { clone, materials, visibleBox };
}

function configurePanelCamera(
  camera: THREE.PerspectiveCamera,
  box: THREE.Box3,
  panelId: string,
): THREE.Vector3 {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const isFullBody = size.y > size.x * 1.85;
  const target = center.clone();
  let fitHeight = Math.max(size.y, 0.05);
  let fitWidth = Math.max(size.x, 0.05);
  let azimuth = 0.18;
  let elevation = 0.06;
  let padding = 1.14;

  if (isFullBody) {
    // Frame the complete 3D model harmoniously inside its square thumbnail (`نسخة مصغرة من كل مجسم متناسقة في مربعها`)
    target.copy(center);
    fitHeight = size.y;
    fitWidth = size.x;
    azimuth = panelId === "cardiovascular" ? -0.16 : 0.18;
    elevation = 0.05;
    padding = 1.14;
  } else {
    if (panelId === "cardiovascular" || panelId === "heart_sounds") {
      azimuth = -0.22;
      elevation = 0.14;
      padding = 1.04;
    } else if (panelId === "respiratory" || panelId === "breath_sounds") {
      azimuth = 0.18;
      elevation = 0.1;
      padding = 1.04;
    } else if (panelId === "digestive") {
      azimuth = 0.2;
      elevation = 0.1;
      padding = 1.02;
    } else if (panelId === "endocrine") {
      azimuth = 0.18;
      elevation = 0.08;
      padding = 1.08;
    } else if (panelId === "renal" || panelId === "reproductive") {
      azimuth = 0.22;
      elevation = 0.16;
      padding = 1.06;
    }
  }

  const halfFovRad = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distForHeight = (fitHeight * 0.5) / Math.tan(halfFovRad);
  const distForWidth =
    (fitWidth * 0.5) / (Math.tan(halfFovRad) * camera.aspect);
  const distance =
    Math.max(distForHeight, distForWidth) * padding + size.z * 0.42;

  const cosEl = Math.cos(elevation);
  const offset = new THREE.Vector3(
    Math.sin(azimuth) * cosEl * distance,
    Math.sin(elevation) * distance,
    Math.cos(azimuth) * cosEl * distance,
  );

  camera.near = Math.max(0.01, distance * 0.04);
  camera.far = Math.max(50, distance * 8);
  camera.position.copy(target).add(offset);
  camera.lookAt(target);
  camera.updateProjectionMatrix();

  return target;
}

function renderPanelStudioSnapshot(
  panel: AtlasPanelScientificEntry,
): Promise<string> {
  const modelUrl = panel.model_url ?? "/anatomy/muscular_male.glb";
  const cacheKey = `${panel.id}::${modelUrl}::square-mini-v12`;

  const cached = SNAPSHOT_CACHE.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const inflight = SNAPSHOT_INFLIGHT.get(cacheKey);
  if (inflight) return inflight;

  const job = (async () => {
    const baseScene = await loadCachedGltfScene(modelUrl);

    return new Promise<string>((resolve, reject) => {
      renderQueue = renderQueue
        .catch(() => {})
        .then(() => {
          try {
            const { renderer, envTexture } = getSharedStudioRenderer();
            const scene = new THREE.Scene();
            scene.environment = envTexture;

            const { clone, materials, visibleBox } = filterAndStylePanelClone(
              baseScene,
              panel,
            );
            scene.add(clone);

            const camera = new THREE.PerspectiveCamera(
              28,
              SNAPSHOT_WIDTH / SNAPSHOT_HEIGHT,
              0.02,
              100,
            );
            const target = configurePanelCamera(camera, visibleBox, panel.id);
            addDarkRoomSideSpotlight(scene, target);

            renderer.setClearColor(0x000000, 0);
            renderer.clear(true, true, true);
            renderer.render(scene, camera);

            const dataUrl = renderer.domElement.toDataURL("image/webp", 0.94);
            SNAPSHOT_CACHE.set(cacheKey, dataUrl);

            scene.remove(clone);
            for (const mat of materials) {
              mat.dispose();
            }

            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        });
    });
  })().finally(() => {
    SNAPSHOT_INFLIGHT.delete(cacheKey);
  });

  SNAPSHOT_INFLIGHT.set(cacheKey, job);
  return job;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * مشغل الفيديوهات الطبية ثلاثية الأبعاد للبانلز الـ 3:
 * 1. `heart_sounds`: فيديو قلب ثلاثي الأبعاد ينبض فسيولوجياً (انقباض الأذينين ثم البطينين حول مركزهما بدون أي مط لأسفل) + تخطيط ECG مباشر.
 * 2. `breath_sounds`: فيديو رئة ثلاثية الأبعاد تتنفس (شهيق وزفير) مع إضاءة سبوت جانبية في غرفة مظلمة.
 * 3. `scanner`: فيديو رنين مغناطيسي (MRI) يمسح الجسم من أعلى الدماغ حتى القدمين بسرعة بطيئة مع عرض المقطع المحوري لكل مستوى.
 * ═══════════════════════════════════════════════════════════════════════════ */

const VIDEO_FRAMES_CACHE = new Map<string, HTMLCanvasElement[]>();
const VIDEO_FRAMES_INFLIGHT = new Map<string, Promise<HTMLCanvasElement[]>>();

const VIDEO_W = 360;
const VIDEO_H = 250;

/**
 * توليد إطارات فيديو ثلاثي الأبعاد حقيقي للقلب النابض أو الرئة المتنفسة من ملفات الـ GLB
 */
async function buildOrgan3DVideoFrames(
  panel: AtlasPanelScientificEntry,
  frameCount = 28,
): Promise<HTMLCanvasElement[]> {
  const cacheKey = `vid3d::${panel.id}::v7`;
  const cached = VIDEO_FRAMES_CACHE.get(cacheKey);
  if (cached) return cached;

  const inflight = VIDEO_FRAMES_INFLIGHT.get(cacheKey);
  if (inflight) return inflight;

  const modelUrl = panel.model_url ?? "/anatomy/cardiovascular_male.glb";
  const job = (async () => {
    const baseScene = await loadCachedGltfScene(modelUrl);

    return new Promise<HTMLCanvasElement[]>((resolve, reject) => {
      renderQueue = renderQueue
        .catch(() => {})
        .then(() => {
          try {
            const { renderer, envTexture } = getSharedStudioRenderer();
            const scene = new THREE.Scene();
            scene.environment = envTexture;

            const { clone, materials, visibleBox } = filterAndStylePanelClone(
              baseScene,
              panel,
            );
            scene.add(clone);

            const camera = new THREE.PerspectiveCamera(
              28,
              SNAPSHOT_WIDTH / SNAPSHOT_HEIGHT,
              0.02,
              100,
            );
            const target = configurePanelCamera(camera, visibleBox, panel.id);
            addDarkRoomSideSpotlight(scene, target);

            // حفظ المصفوفات والمراكز المحلية لكل جزء لتحريكه فسيولوجياً حول مركزه بدون أي مط لأسفل
            interface PartAnimInfo {
              mesh: THREE.Mesh;
              basePos: THREE.Vector3;
              baseScale: THREE.Vector3;
              localPivot: THREE.Vector3;
              role: "atrium" | "ventricle" | "vessel" | "lung" | "trachea";
            }
            const parts: PartAnimInfo[] = [];
            const boxCenterWorld = visibleBox.getCenter(new THREE.Vector3());
            const boxSizeWorld = visibleBox.getSize(new THREE.Vector3());

            clone.traverse((o) => {
              const m = o as THREE.Mesh;
              if (!m.isMesh || !m.visible || !m.geometry) return;
              if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
              const localCenter = m.geometry.boundingBox
                ? m.geometry.boundingBox.getCenter(new THREE.Vector3())
                : new THREE.Vector3();
              const worldCenter = localCenter.clone().applyMatrix4(m.matrixWorld);
              const n = m.name.replace(/_/g, " ").toLowerCase();

              let role: PartAnimInfo["role"] = "vessel";
              if (panel.id === "heart_sounds") {
                if (/\b(atrium|auricula)\b/.test(n)) {
                  role = "atrium";
                } else if (
                  /\b(ventricul|myocard|cor\b|cordis|papillar|chordae|interventricular)\b/.test(
                    n,
                  ) ||
                  worldCenter.y < boxCenterWorld.y + boxSizeWorld.y * 0.08
                ) {
                  role = "ventricle";
                } else {
                  role = "vessel";
                }
              } else {
                if (/\b(trachea|carina|laryn|cartilag)\b/.test(n)) {
                  role = "trachea";
                } else {
                  role = "lung";
                }
              }

              parts.push({
                mesh: m,
                basePos: m.position.clone(),
                baseScale: m.scale.clone(),
                localPivot: localCenter,
                role,
              });
            });

            const frames: HTMLCanvasElement[] = [];

            for (let i = 0; i < frameCount; i++) {
              const phase = i / frameCount;

              if (panel.id === "heart_sounds") {
                // الدورة القلبية الفسيولوجية الدقيقة (انقباض الأذينين ثم انقباض البطينين حول مركزهما)
                const atrialBump = Math.exp(-Math.pow((phase - 0.1) * 10, 2));
                const ventBump =
                  Math.exp(-Math.pow((phase - 0.3) * 7.5, 2)) +
                  0.22 * Math.exp(-Math.pow((phase - 0.44) * 11, 2));
                const arterialPulse = Math.exp(-Math.pow((phase - 0.36) * 8, 2));

                for (const p of parts) {
                  const isRotX = Math.abs(p.mesh.quaternion.x) > 0.5;
                  let sx = 1;
                  let sy = 1;
                  let sz = 1;
                  if (p.role === "atrium") {
                    const c = atrialBump * 0.075;
                    sx = 1 - c;
                    sy = isRotX ? 1 - c : 1 - c * 0.55;
                    sz = isRotX ? 1 - c * 0.55 : 1 - c;
                  } else if (p.role === "ventricle") {
                    // انقباض شعاعي متماسك للبطينين والشرايين التاجية مع مراعاة دوران المحاور المحلية (+90° X)
                    const c = ventBump * 0.082;
                    sx = 1 - c;
                    sy = isRotX ? 1 - c * 0.92 : 1 - c * 0.35;
                    sz = isRotX ? 1 - c * 0.35 : 1 - c * 0.92;
                  } else {
                    // إبقاء الأوعية والشرايين ثابتة تماماً بحيث يتحرك القلب فقط (الأذينان والبطينان)
                    sx = 1;
                    sy = 1;
                    sz = 1;
                  }

                  p.mesh.scale.set(
                    p.baseScale.x * sx,
                    p.baseScale.y * sy,
                    p.baseScale.z * sz,
                  );
                  // تثبيت نقطة الارتكاز في الإحداثيات العالمية الصحيحة مع تطبيق دوران الـ Quaternion الخاص بكل حجرة
                  const deltaLocal = new THREE.Vector3(
                    p.localPivot.x * p.baseScale.x * (1 - sx),
                    p.localPivot.y * p.baseScale.y * (1 - sy),
                    p.localPivot.z * p.baseScale.z * (1 - sz),
                  ).applyQuaternion(p.mesh.quaternion);
                  p.mesh.position.copy(p.basePos).add(deltaLocal);
                }
              } else if (panel.id === "breath_sounds") {
                // دورة التنفس الطبيعية (تمدد الرئتين في الشهيق وارتدادهما في الزفير)
                const inhale =
                  phase < 0.44
                    ? 0.5 - 0.5 * Math.cos((Math.PI * phase) / 0.44)
                    : 0.5 + 0.5 * Math.cos((Math.PI * (phase - 0.44)) / 0.56);

                for (const p of parts) {
                  if (p.role === "lung") {
                    const sx = 1 + inhale * 0.075;
                    const sy = 1 + inhale * 0.055;
                    const sz = 1 + inhale * 0.085;
                    p.mesh.scale.set(
                      p.baseScale.x * sx,
                      p.baseScale.y * sy,
                      p.baseScale.z * sz,
                    );
                    // تثبيت قمة الرئة (Apex) بحيث يتمدد الفص السفلي والقاعدة مع الحجاب الحاجز
                    const deltaLocal = new THREE.Vector3(
                      p.localPivot.x * p.baseScale.x * (1 - sx),
                      p.localPivot.y * p.baseScale.y * (1 - sy),
                      p.localPivot.z * p.baseScale.z * (1 - sz),
                    ).applyQuaternion(p.mesh.quaternion);
                    p.mesh.position.copy(p.basePos).add(deltaLocal);
                  }
                }
              }

              clone.updateMatrixWorld(true);
              renderer.setClearColor(0x000000, 0);
              renderer.clear(true, true, true);
              renderer.render(scene, camera);

              const frameCanvas = document.createElement("canvas");
              frameCanvas.width = VIDEO_W;
              frameCanvas.height = VIDEO_H;
              const fctx = frameCanvas.getContext("2d");
              if (fctx) {
                fctx.drawImage(renderer.domElement, 0, 0, VIDEO_W, VIDEO_H);
              }
              frames.push(frameCanvas);
            }

            scene.remove(clone);
            for (const mat of materials) {
              mat.dispose();
            }

            VIDEO_FRAMES_CACHE.set(cacheKey, frames);
            resolve(frames);
          } catch (err) {
            reject(err);
          }
        });
    });
  })().finally(() => {
    VIDEO_FRAMES_INFLIGHT.delete(cacheKey);
  });

  VIDEO_FRAMES_INFLIGHT.set(cacheKey, job);
  return job;
}

/**
 * رسم مقطع الرنين المغناطيسي المحوري (Axial T1/T2 MRI Slice) بدقة تشريحية من الدماغ حتى القدمين
 */
function drawAxialMriSliceAtLevel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  progress: number, // 0.0 = أعلى الدماغ (Vertex) -> 1.0 = الساقين والقدمين (Legs)
) {
  ctx.save();

  // هالة خلفية الرنين المغناطيسي
  const bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius * 1.15);
  bgGrad.addColorStop(0, "rgba(15, 23, 42, 0.95)");
  bgGrad.addColorStop(1, "rgba(2, 4, 10, 0.0)");
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
  ctx.fill();

  if (progress < 0.16) {
    // ─── 1. BRAIN & CRANIUM (0.00 -> 0.16): القشرة المخية، البطينات الجانبية، المهاد، المخيخ ───
    const u = progress / 0.16;
    const headScale = Math.sin(Math.max(0.18, Math.min(0.96, u)) * Math.PI);
    const rx = radius * 0.72 * (0.65 + 0.35 * headScale);
    const ry = radius * 0.86 * (0.65 + 0.35 * headScale);

    // عظام الجمجمة (Skull Diploë & Inner/Outer Tables)
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 3.2;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // نصفي الكرة المخية (Cerebral Hemispheres - Grey & White Matter)
    const brainGrad = ctx.createRadialGradient(cx, cy, rx * 0.15, cx, cy, rx * 0.92);
    brainGrad.addColorStop(0, "#ffffff");
    brainGrad.addColorStop(0.55, "#ffffff");
    brainGrad.addColorStop(0.88, "#ffffff");
    brainGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = brainGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.9, ry * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // التلافيف والأخاديد القشرية (Sulci & Gyri)
    ctx.strokeStyle = "rgba(15, 23, 42, 0.65)";
    ctx.lineWidth = 1.1;
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * rx * 0.62, cy + Math.sin(ang) * ry * 0.62);
      ctx.quadraticCurveTo(
        cx + Math.cos(ang + 0.15) * rx * 0.76,
        cy + Math.sin(ang + 0.15) * ry * 0.76,
        cx + Math.cos(ang) * rx * 0.88,
        cy + Math.sin(ang) * ry * 0.88,
      );
      ctx.stroke();
    }

    // الشق الطولي الوسطي ومنجل المخ (Interhemispheric Longitudinal Fissure / Falx Cerebri)
    ctx.strokeStyle = "#090d16";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry * 0.9);
    ctx.lineTo(cx, cy + ry * 0.9);
    ctx.stroke();

    // البطينان الجانبيان والمهاد (Lateral Ventricles & Thalami) في منتصف الدماغ
    if (u > 0.25 && u < 0.78) {
      ctx.fillStyle = "#020617"; // CSF dark on T1 FLAIR
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.16, cy - ry * 0.05, rx * 0.11, ry * 0.22, -0.22, 0, Math.PI * 2);
      ctx.ellipse(cx + rx * 0.16, cy - ry * 0.05, rx * 0.11, ry * 0.22, 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    // المخيخ وجذع المخ ومقلتا العينين عند قاعدة الجمجمة
    if (u >= 0.68) {
      // مقلتا العينين للأمام (Orbits / Globes)
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(cx - rx * 0.36, cy - ry * 0.72, rx * 0.14, 0, Math.PI * 2);
      ctx.arc(cx + rx * 0.36, cy - ry * 0.72, rx * 0.14, 0, Math.PI * 2);
      ctx.fill();
      // جذع المخ (Pons / Medulla)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy + ry * 0.12, rx * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (progress < 0.23) {
    // ─── 2. NECK / CERVICAL SPINE C1–C7 (0.16 -> 0.23): الفقرة العنقية، القصبة الهوائية، الدرقية، السباتي ───
    const rx = radius * 0.46;
    const ry = radius * 0.42;

    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // الفقرة العنقية والحبل الشوكي (Cervical Vertebra & Spinal Cord)
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.arc(cx, cy + ry * 0.25, rx * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy + ry * 0.32, rx * 0.11, 0, Math.PI * 2);
    ctx.fill();

    // القصبة الهوائية والغدة الدرقية (Trachea & Thyroid Lobes)
    ctx.fillStyle = "#020617";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - ry * 0.32, rx * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // الغمد السباتي (Carotid Sheath: CCA & IJV)
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(cx - rx * 0.42, cy - ry * 0.1, rx * 0.09, 0, Math.PI * 2);
    ctx.arc(cx + rx * 0.42, cy - ry * 0.1, rx * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else if (progress < 0.40) {
    // ─── 3. THORAX T1–T10 (0.23 -> 0.40): الرئتان، القلب بحجراته الأربع، الأورطي، العمود الفقري الصدري ───
    const rx = radius * 0.88;
    const ry = radius * 0.62;

    // جدار الصدر والأضلاع (Thoracic Wall & Ribs)
    ctx.fillStyle = "#475569";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // الرئة اليمنى واليسرى (Right & Left Lung Fields - Dark Air on MRI/CT)
    ctx.fillStyle = "#060b16";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.42, cy - ry * 0.04, rx * 0.36, ry * 0.72, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx + rx * 0.44, cy - ry * 0.02, rx * 0.33, ry * 0.7, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // القلب في المنصف الأوسط (Heart Chambers & Myocardium)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx + rx * 0.08, cy - ry * 0.18, rx * 0.28, ry * 0.42, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // تجاويف البطينين (Ventricular Blood Pool)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.ellipse(cx + rx * 0.14, cy - ry * 0.16, rx * 0.11, ry * 0.22, -0.25, 0, Math.PI * 2);
    ctx.ellipse(cx - rx * 0.02, cy - ry * 0.26, rx * 0.1, ry * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // جسم الفقرة الصدرية والقناة الشوكية والأورطي النازل
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(cx, cy + ry * 0.56, rx * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx + rx * 0.12, cy + ry * 0.34, rx * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (progress < 0.54) {
    // ─── 4. ABDOMEN T11–L3 (0.40 -> 0.54): الكبد، المعدة، الطحال، الكليتان، الأورطي البطني ───
    const u = (progress - 0.4) / 0.14;
    const rx = radius * 0.82;
    const ry = radius * 0.58;

    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (u < 0.55) {
      // الكبد في الربع العلوي الأيمن (يسار الصورة بالمقياس الإشعاعي) + المعدة والطحال
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.34, cy - ry * 0.08, rx * 0.42, ry * 0.62, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // المعدة (Stomach Lumen)
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx + rx * 0.26, cy - ry * 0.22, rx * 0.22, ry * 0.28, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // الطحال (Spleen)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx + rx * 0.56, cy + ry * 0.16, rx * 0.16, ry * 0.32, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // الكليتان اليمنى واليسرى (Right & Left Kidneys) + عرى الأمعاء
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.36, cy + ry * 0.22, rx * 0.18, ry * 0.28, 0.25, 0, Math.PI * 2);
      ctx.ellipse(cx + rx * 0.36, cy + ry * 0.22, rx * 0.18, ry * 0.28, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // الفقرة القطنية (Lumbar Vertebra L1-L3) + العضلتان القطنيتان (Psoas Major)
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(cx, cy + ry * 0.48, rx * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.22, cy + ry * 0.48, rx * 0.11, ry * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + rx * 0.22, cy + ry * 0.48, rx * 0.11, ry * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (progress < 0.65) {
    // ─── 5. PELVIS L4–S3 (0.54 -> 0.65): عظم الحوض، مفصل الورك، المثانة، العضلات الألوية ───
    const rx = radius * 0.84;
    const ry = radius * 0.56;

    ctx.fillStyle = "#475569";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // جناحا الحرقفة والعجز ورأسا عظم الفخذ (Iliac Wings, Sacrum & Femoral Heads)
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(cx - rx * 0.46, cy + ry * 0.05, rx * 0.16, 0, Math.PI * 2);
    ctx.arc(cx + rx * 0.46, cy + ry * 0.05, rx * 0.16, 0, Math.PI * 2);
    ctx.stroke();

    // المثانة البولية في الحوض الأمامي (Urinary Bladder)
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.22, rx * 0.22, ry * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // العجز (Sacrum)
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.46, rx * 0.22, ry * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (progress < 0.83) {
    // ─── 6. THIGHS / FEMORA (0.65 -> 0.83): مقطعا الفخذين الأيمن والأيسر وعظم الفخذ ───
    const u = (progress - 0.65) / 0.18;
    const thighR = radius * (0.38 - u * 0.06);
    const sep = radius * 0.44;

    [-1, 1].forEach((side) => {
      const tx = cx + side * sep;
      // العضلات المحيطة بالفخذ (Quadriceps, Adductors, Hamstrings)
      ctx.fillStyle = "#475569";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(tx, cy, thighR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // الحواجز اللفافية بين حجرات الفخذ (Intermuscular Septa)
      ctx.strokeStyle = "rgba(226, 232, 240, 0.35)";
      ctx.lineWidth = 1;
      for (let a = 0; a < 3; a++) {
        const ang = a * ((Math.PI * 2) / 3) + 0.4;
        ctx.beginPath();
        ctx.moveTo(tx, cy);
        ctx.lineTo(tx + Math.cos(ang) * thighR, cy + Math.sin(ang) * thighR);
        ctx.stroke();
      }

      // قشرة عظم الفخذ ونقي العظم (Femoral Cortex & Medullary Cavity)
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(tx - side * thighR * 0.12, cy - thighR * 0.08, thighR * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else {
    // ─── 7. LEGS / TIBIA & FIBULA (0.83 -> 1.00): الساقان والظنبوب والشظية ───
    const u = (progress - 0.83) / 0.17;
    const legR = radius * (0.31 - u * 0.07);
    const sep = radius * 0.44;

    [-1, 1].forEach((side) => {
      const lx = cx + side * sep;
      ctx.fillStyle = "#475569";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(lx, cy, legR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // عظم الظنبوب (Tibia)
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(lx - side * legR * 0.18, cy - legR * 0.22, legR * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // عظم الشظية (Fibula)
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(lx + side * legR * 0.34, cy + legR * 0.15, legR * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.restore();
}

function getMriLevelLabel(progress: number): { region: string; level: string } {
  if (progress < 0.16) return { region: "BRAIN / CRANIUM", level: "Cortex & Ventricles" };
  if (progress < 0.23) return { region: "NECK · C1–C7", level: "Thyroid & Carotid" };
  if (progress < 0.40) return { region: "THORAX · T1–T10", level: "Heart & Lungs" };
  if (progress < 0.54) return { region: "ABDOMEN · T11–L3", level: "Liver, Spleen & Kidneys" };
  if (progress < 0.65) return { region: "PELVIS · L4–S3", level: "Iliac & Hip Joints" };
  if (progress < 0.83) return { region: "THIGH · FEMUR", level: "Quadriceps & Femur" };
  return { region: "LEG · TIBIA & FIBULA", level: "Crural Compartments" };
}

/**
 * مكوّن عرض الفيديوهات الطبية ثلاثية الأبعاد للبانلز الثلاثة:
 * - `heart_sounds`: فيديو قلب ثلاثي الأبعاد ينبض طبيعياً + شريط ECG
 * - `breath_sounds`: فيديو رئة ثلاثية الأبعاد تتنفس + منحنى التنفس
 * - `scanner`: فيديو رنين مغناطيسي يمسح من الدماغ حتى القدمين بسرعة بطيئة
 */
function PanelMedicalVideoPreview({
  panel,
  height = 112,
  className = "",
}: AtlasViewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [organImg, setOrganImg] = useState<HTMLImageElement | null>(null);
  const [extVideoFailed, setExtVideoFailed] = useState(false);

  // تحميل الصورة ثلاثية الأبعاد المخبوزة مسبقاً (0ms) للقلب المعزول أو الرئتين لتحريكها فوراً بدون انتظار تحميل GLB
  useEffect(() => {
    if (panel.id !== "heart_sounds" && panel.id !== "breath_sounds") return;
    const src = PREBAKED_STUDIO_SNAPSHOTS[panel.id];
    if (!src) return;
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setOrganImg(img);
    };
    img.src = src;
    return () => {
      active = false;
    };
  }, [panel.id]);

  useEffect(() => {
    if (panel.id === "scanner" && panel.video_url && !extVideoFailed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const startTime = performance.now();

    const renderLoop = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (panel.id === "scanner") {
        // احتياطي السونار (2D B-Mode Sector Ultrasound) في حال انقطاع الإنترنت فقط
        const cx = w * 0.5;
        const apexY = 14;
        const maxR = h - 24;
        const halfAng = 0.58;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, apexY);
        ctx.arc(cx, apexY, maxR, Math.PI * 0.5 - halfAng, Math.PI * 0.5 + halfAng);
        ctx.closePath();
        ctx.clip();

        const usGrad = ctx.createRadialGradient(cx, apexY, 8, cx, apexY, maxR);
        usGrad.addColorStop(0, "#1e293b");
        usGrad.addColorStop(0.55, "#0f172a");
        usGrad.addColorStop(1, "#020617");
        ctx.fillStyle = usGrad;
        ctx.fillRect(0, 0, w, h);

        const beat = Math.sin(elapsedSec * 7.2) * 0.08;
        ctx.strokeStyle = "rgba(226, 232, 240, 0.78)";
        ctx.lineWidth = 3.2;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.ellipse(cx - 16, apexY + maxR * 0.56, 24 * (1 - beat), 38 * (1 - beat * 0.5), -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + 18, apexY + maxR * 0.54, 18 * (1 - beat), 34 * (1 - beat * 0.5), 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (panel.id === "heart_sounds") {
        // فيديو القلب النابض ثلاثي الأبعاد (القلب فقط ينقبض حول مركزه بدون أي حركة للشرايين) + شريط ECG
        const cycleSec = 60 / 72;
        const phase = (elapsedSec % cycleSec) / cycleSec;
        const ventSystole =
          Math.exp(-Math.pow((phase - 0.28) * 7.5, 2)) * 0.068 +
          0.2 * Math.exp(-Math.pow((phase - 0.42) * 11, 2)) * 0.045;

        if (organImg) {
          ctx.save();
          const cx = w * 0.5;
          const cy = h * 0.46;
          ctx.translate(cx, cy);
          ctx.scale(1 - ventSystole * 0.92, 1 - ventSystole * 0.52);
          ctx.drawImage(organImg, -w * 0.5, -h * 0.48, w, h * 0.94);
          ctx.restore();
        }

        // رسم شريط ECG حي متزامن في أسفل الفيديو
        ctx.save();
        ctx.strokeStyle = "rgba(244, 63, 94, 0.92)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const ecgBaseY = h - 14;
        for (let x = 8; x < w - 8; x += 2) {
          const t = ((elapsedSec * 1.2 + x / w) % 1 + 1) % 1;
          const pWave = 3 * Math.exp(-Math.pow((t - 0.1) * 32, 2));
          const qWave = -2.5 * Math.exp(-Math.pow((t - 0.18) * 80, 2));
          const rWave = 13 * Math.exp(-Math.pow((t - 0.2) * 75, 2));
          const sWave = -4 * Math.exp(-Math.pow((t - 0.22) * 80, 2));
          const tWave = 4.5 * Math.exp(-Math.pow((t - 0.36) * 24, 2));
          const y = ecgBaseY - (pWave + qWave + rWave + sWave + tWave);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (panel.id === "breath_sounds") {
        // فيديو الرئة المتنفسة ثلاثية الأبعاد (شهيق وزفير) + منحنى التنفس
        const breathPeriod = 4.0;
        const phase = (elapsedSec % breathPeriod) / breathPeriod;
        const inhale =
          phase < 0.44
            ? 0.5 - 0.5 * Math.cos((Math.PI * phase) / 0.44)
            : 0.5 + 0.5 * Math.cos((Math.PI * (phase - 0.44)) / 0.56);

        if (organImg) {
          ctx.save();
          const cx = w * 0.5;
          const cy = h * 0.46;
          ctx.translate(cx, cy);
          ctx.scale(1 + inhale * 0.068, 1 + inhale * 0.048);
          ctx.drawImage(organImg, -w * 0.5, -h * 0.48, w, h * 0.94);
          ctx.restore();
        }

        // موجة التنفس (Spirometry Flow Wave) في أسفل الفيديو
        ctx.save();
        ctx.strokeStyle = "rgba(45, 212, 191, 0.92)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const waveBaseY = h - 13;
        for (let x = 8; x < w - 8; x += 2) {
          const p = ((phase + x / w) % 1 + 1) % 1;
          const val =
            p < 0.44
              ? Math.sin((Math.PI * p) / 0.44)
              : -0.55 * Math.sin((Math.PI * (p - 0.44)) / 0.56);
          const y = waveBaseY - val * 8;
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, [panel, organImg, extVideoFailed]);

  // في بانل السكانر: يظهر فيديو السونار (US) فقط كما طُلب
  const usVideoUrl =
    panel.video_url ??
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A4CTTS_(CardioNetworks_ECHOpedia).webm";

  if (panel.id === "scanner" && !extVideoFailed) {
    return (
      <div
        className={`group relative flex w-full items-center justify-center overflow-hidden select-none ${className}`}
        style={{
          height,
          borderRadius: 12,
          background: "radial-gradient(ellipse 72% 68% at 50% 44%, #273954 0%, #162236 48%, #0b1220 82%, #050911 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 24px rgba(0,0,0,0.85)",
        }}
      >
        <video
          src={usVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setExtVideoFailed(true)}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 0.75;
          }}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 pointer-events-none"
        />

      </div>
    );
  }

  const isSoundThumb = panel.id === "heart_sounds" || panel.id === "breath_sounds";
  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "100%",
        borderRadius: 10,
        background: "radial-gradient(ellipse 72% 68% at 50% 44%, #273954 0%, #162236 48%, #0b1220 82%, #050911 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 24px rgba(0,0,0,0.85)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={VIDEO_W}
        height={VIDEO_H}
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />

    </div>
  );
}

function formatPartName(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\.l$/i, " (Left)")
    .replace(/\.r$/i, " (Right)")
    .replace(/\d+$/g, "")
    .trim();
}

function Model({
  url,
  accent,
  panelId,
  system,
  selectedPart,
  isolatedPart,
  onSelectPart,
  onLoaded,
}: {
  url: string;
  accent: string;
  panelId: string;
  system?: AnatomicalSystem;
  selectedPart: string | null;
  isolatedPart: string | null;
  onSelectPart: (name: string) => void;
  onLoaded?: () => void;
}) {
  const { gl } = useThree();
  const { scene } = useGLTF(url, DRACO_DECODER_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const downAtRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    onLoaded?.();
  }, [scene, onLoaded]);

  const clippingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.5),
    [],
  );
  const activePlanes = useMemo(
    () => (panelId === "scanner" ? [clippingPlane] : []),
    [panelId, clippingPlane],
  );

  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        let showMesh = true;
        if (panelId === "tendons") {
          const cn = m.name.toLowerCase();
          showMesh =
            !m.name.endsWith(".el") &&
            !m.name.endsWith(".er") &&
            !m.name.endsWith(".ol") &&
            !m.name.endsWith(".or") &&
            /\b(tendo|tendon|tendinis|retinaculum|sheath|vincula|chiasm)\b/.test(cn) &&
            !/\b(fascia|bursa|aponeurosis|iliotibial)\b/.test(cn);
        } else if (panelId === "heart_sounds") {
          showMesh = isHeartOrGreatVesselName(m.name);
        }
        if (isolatedPart && m.name !== isolatedPart) {
          showMesh = false;
        }
        m.visible = showMesh;
        m.material = pickMaterial(
          m.name,
          accent,
          activePlanes,
          selectedPart === m.name,
          panelId,
          system,
        );
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.geometry && !m.geometry.attributes.normal) {
          m.geometry.computeVertexNormals();
        }
      }
    });
    return clone;
  }, [scene, accent, panelId, system, activePlanes, selectedPart, isolatedPart]);

  const sceneCenter = useMemo(() => {
    clonedScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clonedScene);
    return box.isEmpty() ? new THREE.Vector3(0, 1.28, 0) : box.getCenter(new THREE.Vector3());
  }, [clonedScene]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;

    if (panelId === "heart_sounds") {
      const phase = (t * 1.2) % 1;
      const s1 = Math.exp(-Math.pow((phase - 0.15) * 14, 2)) * 0.038;
      const s2 = Math.exp(-Math.pow((phase - 0.34) * 18, 2)) * 0.018;
      const beat = s1 + s2;
      const sx = 1 - beat;
      const sy = 1 - beat * 0.35;
      const sz = 1 - beat;
      groupRef.current.scale.set(sx, sy, sz);
      groupRef.current.position.set(
        sceneCenter.x * (1 - sx),
        sceneCenter.y * (1 - sy),
        sceneCenter.z * (1 - sz),
      );
    } else if (panelId === "breath_sounds") {
      const breath = Math.sin(t * 1.5) * 0.028;
      const sx = 1 + breath * 0.85;
      const sy = 1 + breath * 0.35;
      const sz = 1 + breath;
      groupRef.current.scale.set(sx, sy, sz);
      groupRef.current.position.set(
        sceneCenter.x * (1 - sx),
        sceneCenter.y * (1 - sy),
        sceneCenter.z * (1 - sz),
      );
    } else if (panelId === "scanner") {
      clippingPlane.constant = Math.sin(t * 0.35) * 0.85;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        downAtRef.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        e.stopPropagation();
        const start = downAtRef.current;
        if (
          start &&
          Math.hypot(e.clientX - start.x, e.clientY - start.y) > 14
        )
          return;
        const hitName = e.object?.name;
        if (hitName) {
          onSelectPart(hitName);
        }
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}


export interface AtlasViewer3DProps {
  panel: AtlasPanelScientificEntry;
  height?: number;
  className?: string;
  panelPreview?: boolean;
  fallback?: React.ReactNode;
}

function PanelStudioPreview({
  panel,
  height = 112,
  className = "",
}: AtlasViewer3DProps) {
  const isSoundThumb = panel.id === "heart_sounds" || panel.id === "breath_sounds";
  const isVideoPanel =
    panel.id === "heart_sounds" ||
    panel.id === "breath_sounds" ||
    panel.id === "scanner";

  const [liveSnapUrl, setLiveSnapUrl] = useState<string | null>(
    () => SNAPSHOT_CACHE.get(`${panel.id}::${panel.model_url ?? "/anatomy/muscular_male.glb"}::square-mini-v12`) ?? null,
  );

  useEffect(() => {
    if (isVideoPanel) return;
    let active = true;
    renderPanelStudioSnapshot(panel)
      .then((url) => {
        if (active && url) setLiveSnapUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [panel, isVideoPanel]);

  const prebakedUrl =
    liveSnapUrl ??
    PREBAKED_STUDIO_SNAPSHOTS[panel.id] ??
    (panel.system ? PREBAKED_STUDIO_SNAPSHOTS[panel.system] : undefined) ??
    SNAPSHOT_CACHE.get(panel.id) ??
    null;

  if (isVideoPanel) {
    return (
      <PanelMedicalVideoPreview
        panel={panel}
        height={height}
        className={className}
      />
    );
  }

  return (
    <div
      className={`group relative flex w-full items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "100%",
        borderRadius: 10,
        background:
          "radial-gradient(ellipse 72% 68% at 50% 44%, #273954 0%, #162236 48%, #0b1220 82%, #050911 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -12px 24px rgba(0, 0, 0, 0.65)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${panel.accent}24 0%, rgba(96, 165, 250, 0.12) 38%, transparent 72%)`,
        }}
      />

      {prebakedUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={prebakedUrl}
          alt={panel.title}
          draggable={false}
          className={`relative z-10 h-full w-full transition-transform duration-300 ease-out group-hover:scale-105 object-contain p-1`}
          style={{
            filter:
              "drop-shadow(0 10px 16px rgba(2, 6, 23, 0.78)) drop-shadow(0 0 10px rgba(148, 163, 184, 0.16))",
          }}
        />
      )}
    </div>
  );
}

export default function AtlasViewer3D({
  panel,
  height = 520,
  className = "",
  panelPreview = false,
  fallback,
}: AtlasViewer3DProps) {
  const isCompact = height < 300;

  if (panelPreview || isCompact) {
    return (
      <PanelStudioPreview
        panel={panel}
        height={height}
        className={className}
        fallback={fallback}
      />
    );
  }

  return (
    <InteractiveStudioViewer
      panel={panel}
      height={height}
      className={className}
    />
  );
}

function InteractiveStudioViewer({
  panel,
  height = 520,
  className = "",
}: {
  panel: AtlasPanelScientificEntry;
  height?: number;
  className?: string;
}) {
  const modelUrl = panel.model_url ?? "/anatomy/muscular_male.glb";
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isolatedPart, setIsolatedPart] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    setModelLoaded(false);
  }, [modelUrl]);

  const matchedEntry = useMemo(
    () => (selectedPart ? matchMeshToEntry(selectedPart) : null),
    [selectedPart],
  );

  return (
    <div
      className={`relative w-full overflow-hidden shadow-inner ${className}`}
      style={{
        height,
        borderRadius: 24,
        background:
          "radial-gradient(ellipse at 22% 35%, #111827 0%, #050811 65%, #020307 100%)",
        border: "1px solid #1e293b",
      }}
    >
      {!modelLoaded && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-xl border border-sky-500/40 bg-slate-950/90 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg backdrop-blur">
            Loading 3D {panel.title}…
          </div>
        </div>
      )}

      {selectedPart && (
        <div
          dir="ltr"
          className="pointer-events-auto absolute left-2.5 right-2.5 top-2.5 z-20 flex items-center justify-between gap-2 rounded-xl border border-sky-400/60 bg-slate-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur"
        >
          <span className="truncate font-extrabold italic text-sky-300">
            {formatPartName(selectedPart)}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setIsolatedPart((prev) =>
                  prev === selectedPart ? null : selectedPart,
                )
              }
              className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold transition ${
                isolatedPart === selectedPart
                  ? "border-emerald-400 bg-emerald-500/25 text-emerald-200"
                  : "border-sky-400/50 bg-sky-500/20 text-sky-200 hover:bg-sky-500/35"
              }`}
            >
              {isolatedPart === selectedPart ? "Show All" : "Isolate"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPart(null);
                setIsolatedPart(null);
              }}
              className="rounded-md border border-rose-400/50 bg-rose-500/30 px-1.5 py-0.5 text-[10px] font-black text-white hover:bg-rose-500/50"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {matchedEntry && (
        <AnatomyInfoCard
          entry={matchedEntry}
          accent={panel.accent}
          onClose={() => setSelectedPart(null)}
        />
      )}

      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        camera={{
          position: panel.camera_position ?? [0, 0.3, 2.4],
          fov: 34,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <ambientLight intensity={0.22} color="#0c1222" />
        <directionalLight
          position={[-3.6, 1.4, 2.2]}
          intensity={3.5}
          color="#fff6e6"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[2.8, 0.8, -2.4]}
          intensity={0.5}
          color="#38bdf8"
        />

        <Suspense fallback={null}>
          <StudioEnvironment />
          <Bounds fit clip margin={1.12}>
            <Model
              url={modelUrl}
              accent={panel.accent}
              panelId={panel.id}
              system={panel.system}
              selectedPart={selectedPart}
              isolatedPart={isolatedPart}
              onSelectPart={(name) => setSelectedPart(name)}
              onLoaded={() => setModelLoaded(true)}
            />
          </Bounds>
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.4}
            blur={3}
            scale={6}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={0.35}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
