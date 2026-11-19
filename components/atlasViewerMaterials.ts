"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { AnatomicalSystem } from "@/lib/schemas";
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
  // 0: Deep Rich Osseous Cortical & Cancellous Bone — deep warm mineral tan, reduced white bleached specular
  float cavityAO = smoothstep(0.62, -0.58, cbNorm.y) * 0.28;
  float boneCrease = clamp(length(fwidth(cbNorm)) * 2.15, 0.0, 0.45);
  float osteonGrain = (sin(cbAcross * 340.0 + cbNoise3(vCbObjPos * 42.0) * 1.8) * 0.5 + 0.5 - 0.5) * 0.05;
  float mineralPore = (cbNoise3(vCbObjPos * 85.0) - 0.5) * 0.04;
  float boneEdgeAO = smoothstep(0.02, 0.52, cbNdotV);
  cbMuscleEdgeSulcus = mix(0.30, 1.02, sqrt(boneEdgeAO)) * (1.0 - boneCrease * 0.60);
  cbMicroShade = osteonGrain + mineralPore - cavityAO;
  cbWetness = 0.08;
  cbSssTint = vec3(0.12, 0.085, 0.045);
#elif ${tissueId} == 1
  // 1: Striated Skeletal Muscle Belly — multi-scale myofibrillar fascicles + deep 3D epimysial sulcus & normal-crease separation
  float warp = cbNoise3(vCbObjPos * 26.0) * 0.045;
  float fasciclePrimary = sin((cbAcross + warp) * 350.0 + cbAlong * 40.0);
  float fascicleSecondary = sin((cbAcross - warp * 0.6) * 800.0 - cbAlong * 65.0);
  float endomysium = smoothstep(-0.88, 0.92, fasciclePrimary) * 0.70 + (fascicleSecondary * 0.5 + 0.5) * 0.30;
  float grooveAO = smoothstep(0.36, 0.0, endomysium);
  float sarcomere = sin(cbAlong * 420.0 + fasciclePrimary * 1.4) * 0.03;
  // Screen-space curvature / anatomical crease detection along muscle boundaries & pennate clefts
  float normalCrease = clamp(length(fwidth(cbNorm)) * 2.4, 0.0, 0.42);
  // Deep grazing-angle epimysial sulcus darkening at the perimeter of each individual muscle mesh
  float edgeBase = smoothstep(0.02, 0.58, cbNdotV);
  cbMuscleEdgeSulcus = sqrt(edgeBase) * (1.0 - normalCrease * 0.65);
  float bellyCrown = cbNdotV * cbNdotV * 0.14;
  cbMicroShade = (endomysium - 0.50) * 0.28 - grooveAO * 0.16 + bellyCrown - normalCrease * 0.35 + sarcomere;
  cbWetness = 0.58;
  cbSssTint = vec3(0.18, 0.025, 0.018);
#elif ${tissueId} == 2
  // 2: Z-Anatomy Costal & Articular Cartilage, Intervertebral Discs, Menisci, Tendons & Ligaments
  float collagen = sin(cbAcross * 480.0 + cbNoise3(vCbObjPos * 46.0) * 1.8) * 0.5 + 0.5;
  float crimp = sin(cbAlong * 200.0) * 0.5 + 0.5;
  float cartCrease = clamp(length(fwidth(cbNorm)) * 1.85, 0.0, 0.34);
  float cartEdgeAO = smoothstep(0.02, 0.48, cbNdotV);
  cbMuscleEdgeSulcus = mix(0.38, 1.03, sqrt(cartEdgeAO)) * (1.0 - cartCrease * 0.48);
  cbMicroShade = (collagen - 0.5) * 0.095 + (crimp - 0.5) * 0.04;
  cbWetness = 0.64;
  cbSssTint = vec3(0.12, 0.14, 0.12);
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
diffuseColor.rgb = clamp(diffuseColor.rgb * (1.0 + cbMicroShade) * mix(0.16, 1.10, cbMuscleEdgeSulcus), 0.0, 1.0);

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
#if ${tissueId} == 1 || ${tissueId} == 0
float cbRimBoost = 0.03;
float cbFresnelSss = cbFresnel * 0.04;
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
import { useSceneStore } from "@/stores/sceneStore";

export interface Tissue {
  organ_id: string;
  ta2_latin: string;
  name_en: string;
  system: AnatomicalSystem;
}

const shaderIdCache = new Map<string, number>();
const colourCache = new Map<string, THREE.Color>();

export function tissueShaderId(tissue: Tissue): number {
  const cached = shaderIdCache.get(tissue.organ_id);
  if (cached !== undefined) return cached;

  const n = tissue.name_en.toLowerCase();
  let id = 6;
  if (
    /bone|skull|vertebra|rib|costa|femur|tibia|fibula|humerus|radius|ulna|sternum|mandible|maxilla|pelvis|scapula|clavic|carpal|tarsal|phalan|sacrum|coccyx|patella|os /.test(
      n,
    )
  ) {
    id = 0;
  } else if (
    /tendo|aponeurosis|fascia|retinaculum|ligament|cartilag|meniscus|discus|bursa/.test(n)
  ) {
    id = 2;
  } else if (
    /muscle|muscul|biceps|triceps|deltoid|rectus|gluteus|pectoral|latissimus|trapezius|masseter|temporalis|sartorius|gastrocnemius|soleus|diaphragm|oblique|vastus|adductor|semitendin|semimembran|iliopsoas|psoas|pronator|flexor|extensor|anconeus|supinator|brachioradialis/.test(
      n,
    )
  ) {
    id = 1;
  } else if (
    /artery|arteria|aorta|carotid|coronary|truncus|ventricle|atrium|heart|myocard|vein|vena|jugular|cava|sinus|saphen/.test(
      n,
    )
  ) {
    id = 3;
  } else if (
    /nerve|nervus|plexus|brain|cerebr|cerebell|spinal|vagus|sciatic|ganglion|gyrus|sulcus|thalam|putamen|caudat|insula/.test(
      n,
    )
  ) {
    id = 4;
  } else if (
    /liver|hepar|gallbladder|biliary|spleen|pancrea|stomach|gaster|kidney|ren|lung|pulmo/.test(
      n,
    )
  ) {
    id = 5;
  }

  shaderIdCache.set(tissue.organ_id, id);
  return id;
}

export function tissueColour(tissue: Tissue): THREE.Color {
  const cached = colourCache.get(tissue.organ_id);
  if (cached) return cached.clone();

  const n = tissue.name_en.toLowerCase();
  let hex = "#d48c6f";
  if (
    /bone|skull|vertebra|rib|costa|femur|tibia|fibula|humerus|radius|ulna|sternum|mandible|maxilla|pelvis|scapula|clavic|carpal|tarsal|phalan|sacrum|coccyx|patella/.test(
      n,
    )
  ) {
    hex = "#bf9868";
  } else if (/cartilag|meniscus|discus|ligament/.test(n)) {
    hex = "#38bdf8";
  } else if (/tendo|tendon|aponeurosis|retinaculum/.test(n)) {
    hex = "#f59e0b";
  } else if (
    /muscle|muscul|biceps|triceps|deltoid|rectus|gluteus|pectoral|latissimus|trapezius|masseter|temporalis|sartorius|gastrocnemius|soleus|diaphragm|oblique|vastus|adductor|semitendin|semimembran|iliopsoas|psoas|pronator|flexor|extensor|anconeus|supinator|brachioradialis/.test(
      n,
    )
  ) {
    hex = "#be343f";
  } else if (/artery|arteria|aorta|carotid|coronary|truncus/.test(n)) {
    hex = "#d6423d";
  } else if (/vein|vena|jugular|cava|sinus|saphen/.test(n)) {
    hex = "#4472b8";
  } else if (/myocard|ventricle|atrium|heart/.test(n)) {
    hex = "#be404a";
  } else if (/nerve|nervus|plexus/.test(n)) {
    hex = "#eedb7a";
  } else if (
    /brain|cerebr|cerebell|gyrus|sulcus|thalam|putamen|caudat|insula|hippocamp/.test(n)
  ) {
    hex = "#e4969c";
  } else if (/lymph|node|nodus|thymus|spleen/.test(n)) {
    hex = "#22c55e";
  } else if (/kidney|ren/.test(n)) {
    hex = "#aa5344";
  } else if (/pancreas|pancreatic/.test(n)) {
    hex = "#e1c68e";
  } else if (/liver|hepar/.test(n)) {
    hex = "#8a3c2f";
  } else if (/stomach|gaster/.test(n)) {
    hex = "#cf8672";
  } else if (/lung|pulmo/.test(n)) {
    hex = "#ebb4be";
  } else if (
    /thyroid|parathyroid|adrenal|suprarenal|pituitary|pineal|hypothalamus/.test(n)
  ) {
    hex = "#c084fc";
  }

  const col = new THREE.Color(hex);
  colourCache.set(tissue.organ_id, col);
  return col.clone();
}

export function tissueRoughness(system: AnatomicalSystem): number {
  if (system === "skeletal") return 0.44;
  if (system === "articular") return 0.18;
  if (system === "muscular") return 0.28;
  if (system === "cardiovascular") return 0.20;
  if (system === "nervous") return 0.26;
  return 0.24;
}

export function tissueOpacity(tissue: Tissue): number {
  const n = tissue.name_en.toLowerCase();
  if (/cornea|lens|vitreous/.test(n)) return 0.25;
  if (/bursa/.test(n)) return 0.35;
  return 1.0;
}

type StoreOrgansRecord = Record<string, Tissue & { node?: string }>;
const storeIndexCache = new WeakMap<object, Map<string, Tissue>>();

function getTissueLookupMap(storeOrgans: StoreOrgansRecord): Map<string, Tissue> {
  const cached = storeIndexCache.get(storeOrgans);
  if (cached) return cached;

  const map = new Map<string, Tissue>();
  for (const [key, org] of Object.entries(storeOrgans)) {
    map.set(key, org);
    if (org.node) {
      map.set(org.node, org);
      map.set(THREE.PropertyBinding.sanitizeNodeName(org.node), org);
    }
  }
  storeIndexCache.set(storeOrgans, map);
  return map;
}

export function resolveOrganTissue(
  meshName: string,
  panelId: string,
  fallbackSystem?: AnatomicalSystem,
): Tissue {
  const storeOrgans = useSceneStore.getState().organs as StoreOrgansRecord | undefined;
  if (storeOrgans && typeof storeOrgans === "object") {
    const hit = getTissueLookupMap(storeOrgans).get(meshName);
    if (hit) return hit;
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

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

/**
 * Shared material cache so both Desktop and Mobile enjoy full MeshPhysicalMaterial
 * + clearcoat + sheen + VOKA histological shader with zero duplicate compilation.
 */
const materialCache = new Map<string, THREE.MeshPhysicalMaterial>();

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
  const baseColor = isSelected
    ? tissue.system === "nervous"
      ? new THREE.Color("#fef08a")
      : new THREE.Color("#38bdf8")
    : tissueColour(tissue);
  const roughness = tissueRoughness(tissue.system);
  const opacity = panelId === "tendons" ? 1 : tissueOpacity(tissue);
  const ghosted = opacity < 1;
  const hasClipping = Boolean(clippingPlanes && clippingPlanes.length > 0);
  const side = hasClipping ? THREE.DoubleSide : THREE.FrontSide;

  if (!hasClipping && !isSelected) {
    const cacheKey = `${tShaderId}_${baseColor.getHexString()}_${roughness.toFixed(2)}_${opacity.toFixed(2)}_${accent}`;
    const cached = materialCache.get(cacheKey);
    if (cached) return cached;
  }

  const emissive = isSelected
    ? tissue.system === "nervous"
      ? new THREE.Color("#facc15")
      : new THREE.Color("#00a8e8")
    : new THREE.Color(accent).multiplyScalar(0.02);
  const emissiveIntensity = isSelected
    ? tissue.system === "nervous"
      ? 1.55
      : 0.26
    : 0.08;

  let physicalCoat: THREE.MeshPhysicalMaterialParameters;
  if (tShaderId === 0) {
    physicalCoat = {
      clearcoat: 0.28,
      clearcoatRoughness: 0.28,
      sheen: 0.16,
      sheenColor: new THREE.Color("#fffdf7"),
    };
  } else if (tShaderId === 2) {
    physicalCoat = {
      clearcoat: 0.64,
      clearcoatRoughness: 0.14,
      sheen: 0.52,
      sheenColor: new THREE.Color("#e8f4fa"),
    };
  } else if (tShaderId === 1) {
    physicalCoat = {
      clearcoat: 0.52,
      clearcoatRoughness: 0.24,
      sheen: 0.72,
      sheenColor: new THREE.Color("#ff9aa8"),
    };
  } else if (tShaderId === 3) {
    physicalCoat = {
      clearcoat: 0.78,
      clearcoatRoughness: 0.14,
      sheen: 0.58,
      sheenColor: new THREE.Color("#ffb3c1"),
    };
  } else if (tShaderId === 4) {
    physicalCoat = {
      clearcoat: 0.42,
      clearcoatRoughness: 0.20,
      sheen: 0.50,
      sheenColor: new THREE.Color("#fff3c4"),
    };
  } else {
    physicalCoat = {
      clearcoat: 0.62,
      clearcoatRoughness: 0.18,
      sheen: 0.58,
      sheenColor: new THREE.Color("#ffd6dc"),
    };
  }

  const mat = new THREE.MeshPhysicalMaterial({
    color: baseColor,
    roughness,
    metalness: 0.04,
    envMapIntensity: 0.92,
    ...physicalCoat,
    transparent: ghosted,
    opacity,
    depthWrite: !ghosted,
    side,
    clippingPlanes,
    clipShadows: false,
    emissive,
    emissiveIntensity,
  });

  mat.onBeforeCompile = (shader) => injectVokaAnatomicalShader(shader, tShaderId);
  mat.customProgramCacheKey = () =>
    `cb-darkspot-t${tShaderId}-${isSelected ? "sel" : "std"}-v7`;

  if (!hasClipping && !isSelected) {
    const cacheKey = `${tShaderId}_${baseColor.getHexString()}_${roughness.toFixed(2)}_${opacity.toFixed(2)}_${accent}`;
    materialCache.set(cacheKey, mat);
  }
  return mat;
}

const rendererEnvCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

function getOrBuildDarkSpotEnvironmentTexture(gl: THREE.WebGLRenderer): THREE.Texture {
  const cached = rendererEnvCache.get(gl);
  if (cached) return cached;

  const pmrem = new THREE.PMREMGenerator(gl);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#020408");

  const sideSpotBox = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 3.25, 2.95) }),
  );
  sideSpotBox.position.set(-7.5, 2.2, 3.8);
  sideSpotBox.lookAt(0, 0, 0);

  const rimBox = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.55, 0.85) }),
  );
  rimBox.position.set(6, 1.5, -5);
  rimBox.lookAt(0, 0, 0);

  envScene.add(sideSpotBox, rimBox);

  const renderTarget = pmrem.fromScene(envScene, 0.04);
  sideSpotBox.geometry.dispose();
  (sideSpotBox.material as THREE.Material).dispose();
  rimBox.geometry.dispose();
  (rimBox.material as THREE.Material).dispose();
  pmrem.dispose();

  rendererEnvCache.set(gl, renderTarget.texture);
  return renderTarget.texture;
}

export function StudioEnvironment() {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    const texture = getOrBuildDarkSpotEnvironmentTexture(gl);
    const previousEnv = scene.environment;
    scene.environment = texture;

    return () => {
      scene.environment = previousEnv;
    };
  }, [gl, scene]);

  return null;
}

export function isHeartOrGreatVesselName(rawName: string): boolean {
  const n = rawName.replace(/_/g, " ").toLowerCase();
  return /\b(left atrium|right atrium|left ventricle|right ventricle|atrium|auricula|ventricul|myocard|coronar|anterior interventricular|posterior interventricular|circumflex branch of left|great cardiac vein|middle cardiac vein|small cardiac vein|coronary sinus|sinus coronarius|tricuspid valve|mitral valve|aortic valve|pulmonary valve|valva|cuspis|chordae|papillar|fibrous ring|fibrous trigone)\b/.test(
    n,
  );
}

export function shouldShowPanelMesh(
  meshName: string,
  panelId: string,
  system?: AnatomicalSystem,
): boolean {
  const cleanName = meshName.replace(/_/g, " ").toLowerCase();
  const isInsertionPatch =
    meshName.endsWith(".el") ||
    meshName.endsWith(".er") ||
    meshName.endsWith(".ol") ||
    meshName.endsWith(".or");

  if (panelId === "tendons") {
    return (
      !isInsertionPatch &&
      /\b(tendo|tendon|tendinis|retinaculum|sheath|vincula|chiasm)\b/.test(cleanName) &&
      !/\b(fascia|bursa|aponeurosis|iliotibial)\b/.test(cleanName)
    );
  }
  if (panelId === "muscular") {
    return (
      !isInsertionPatch &&
      (!/\b(fascia|bursa|bursae|sheath|sheaths|retinaculum|septum|iliopectineal arch|palmar aponeurosis|plantar aponeurosis|epicranial aponeurosis|linea alba|inguinal ligament)\b/.test(
        cleanName,
      ) ||
        /tensor fasciae latae/.test(cleanName))
    );
  }
  if (panelId === "integumentary") {
    const tissue = resolveOrganTissue(meshName, panelId, system);
    if (tissue.system && tissue.system !== "integumentary") {
      return /\b(mammary|mammaria|breast|nipple|areola|skin|cutis|dermis|subcut|pectoral)\b/.test(
        cleanName,
      );
    }
    return true;
  }
  if (panelId === "heart_sounds") {
    return isHeartOrGreatVesselName(meshName);
  }
  if (panelId === "breath_sounds") {
    return (
      /\b(pulmo|lung|lobe|lobus|trachea|bronch|carina|pleura|hilum|lingula)\b/.test(
        cleanName,
      ) || !/\b(nose|nasal|sinus|pharyn|oral|tongue)\b/.test(cleanName)
    );
  }
  return true;
}
