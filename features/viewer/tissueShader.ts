"use client";

import * as THREE from "three";

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
