'use client';

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useScanStore } from "@/stores/scanStore";

import { SCAN_ENTRY, SCAN_PULSE, SHARED_SCAN } from "./scanBand";
import type { SectionPlaneName } from "./axialSlice";
import { scanTint } from "./scanTints";

/** Emitter blocks around the inner face. One instanced draw call, not 24. */
const EMITTERS = 24;

function fadeToBlack(
  geometry: THREE.BufferGeometry,
  weight: (x: number, y: number, z: number) => number,
): THREE.BufferGeometry {
  const position = geometry.getAttribute("position");
  const colours = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const t = Math.max(0, Math.min(1, weight(position.getX(i), position.getY(i), position.getZ(i))));
    colours[i * 3] = t;
    colours[i * 3 + 1] = t;
    colours[i * 3 + 2] = t;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  return geometry;
}

/** Slow enough to read as a machine working, not as something spinning. */
const TURNS_PER_SECOND = 0.04;

const ENTRY_APERTURE = 0.03;
const PULSE_SPREAD = 0.25;
const PULSE_GLOW = 1.6;

/**
 * Kept as a helper export in case external tests import `nameplateText`,
 * while the 3D ScanRing mesh itself renders zero text (`وميكونش مكتوب عليها اي حاجة`).
 */
export function nameplateText(_byAssistant: boolean, _plane: SectionPlaneName = "axial"): string {
  return "";
}

const DISC_OPACITY = 0.16;
const LENS_OPACITY = 0.12;
const EMITTER_GLOW = 2.4;
const EDGE_TOWARDS_WHITE = 0.55;

export function ScanRing({
  bounds,
  instrument,
}: {
  bounds: THREE.Box3 | null;
  instrument: boolean;
}) {
  const tint = scanTint(useScanStore((s) => s.tint));
  const lit = useMemo(() => new THREE.Color(tint.hex), [tint]);
  const edgeLit = useMemo(
    () => new THREE.Color(tint.hex).lerp(new THREE.Color("#ffffff"), EDGE_TOWARDS_WHITE),
    [tint],
  );

  const ring = useRef<THREE.Group>(null);
  const emitters = useRef<THREE.InstancedMesh>(null);
  const discMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const lensMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const emitterMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const shellMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const glowGroup = useRef<THREE.Group>(null);
  const blended = useRef(false);

  const shape = useMemo(() => {
    if (!bounds || bounds.isEmpty()) return null;
    const size = bounds.getSize(new THREE.Vector3());
    const centre = bounds.getCenter(new THREE.Vector3());
    // Compact, reasonable ring radius hugging the selected organ (`حلقة الاشعة كبيرة خلي حجمها معقول`)
    const radius = Math.max(size.x, size.z) * 0.52;
    const tube = radius * 0.026;
    return {
      x: centre.x,
      z: centre.z,
      minY: bounds.min.y,
      maxY: bounds.max.y,
      radius,
      tube,
      emitterRadius: radius - tube * 2.4,
      lightRadius: radius - tube * 4.0,
      emitter: tube * 0.85,
    };
  }, [bounds]);

  const glow = useMemo(() => {
    if (!shape) return null;

    const disc = fadeToBlack(
      new THREE.RingGeometry(shape.lightRadius * 0.05, shape.lightRadius, 64, 8),
      (x, y) => Math.pow(Math.hypot(x, y) / shape.lightRadius, 2),
    );

    const skirt = fadeToBlack(
      new THREE.SphereGeometry(shape.lightRadius, 48, 24),
      (x, y, z) => {
        const r = Math.hypot(x, y, z) || 1;
        return Math.pow(1 - Math.abs(y / r), 2.6);
      },
    );

    return { disc, skirt };
  }, [shape]);

  useEffect(
    () => () => {
      glow?.disc.dispose();
      glow?.skirt.dispose();
    },
    [glow],
  );

  useLayoutEffect(() => {
    const mesh = emitters.current;
    if (!mesh || !shape) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < EMITTERS; i++) {
      const angle = (i / EMITTERS) * Math.PI * 2;
      position.set(Math.cos(angle) * shape.emitterRadius, 0, Math.sin(angle) * shape.emitterRadius);
      rotation.set(0, -angle, 0);
      matrix.compose(position, quaternion.setFromEuler(rotation), scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [shape, instrument]);

  useFrame((state, delta) => {
    const group = ring.current;
    if (!group || !shape) return;

    group.rotation.y += delta * Math.PI * 2 * TURNS_PER_SECOND * SCAN_ENTRY.value;

    const travel = Math.sin(SHARED_SCAN.value * 34);
    const drift = Math.sin(state.clock.elapsedTime * 1.7);
    const breath = 0.78 + 0.22 * (travel * 0.6 + drift * 0.4);

    const arrival = SCAN_ENTRY.value;

    // Strictly clamp vertical motion to the top and bottom of the selected organ (`دايرة الاشعة خليها تتحرك لاعلي واسفل العضو فقط`)
    const clampedY = Math.max(shape.minY, Math.min(shape.maxY, SHARED_SCAN.value));
    group.position.y = clampedY;

    const aperture = 1 + ENTRY_APERTURE * (1 - arrival);
    group.scale.x = aperture;
    group.scale.z = aperture;

    const pulse = SCAN_PULSE.value;
    if (glowGroup.current) {
      glowGroup.current.visible = true;
      const spread = 1 + PULSE_SPREAD * pulse;
      glowGroup.current.scale.set(spread, 1, spread);
    }

    if (discMaterial.current) {
      discMaterial.current.opacity = DISC_OPACITY * breath * arrival * (1 + PULSE_GLOW * pulse);
    }
    if (lensMaterial.current) {
      lensMaterial.current.opacity = LENS_OPACITY * breath * arrival * (1 + PULSE_GLOW * pulse);
    }
    if (edgeMaterial.current) edgeMaterial.current.color.copy(edgeLit).multiplyScalar(arrival);
    if (emitterMaterial.current) {
      emitterMaterial.current.emissiveIntensity = EMITTER_GLOW * (0.85 + 0.3 * breath) * arrival;
    }

    const arriving = arrival < 1;
    const hardware = [shellMaterial.current, emitterMaterial.current];
    if (arriving !== blended.current) {
      blended.current = arriving;
      for (const material of hardware) {
        if (!material) continue;
        material.transparent = arriving;
        material.opacity = arriving ? arrival : 1;
        material.needsUpdate = true;
      }
    } else if (arriving) {
      for (const material of hardware) if (material) material.opacity = arrival;
    }
  });

  if (!shape) return null;

  return (
    <group ref={ring} name="scan-ring" position={[shape.x, shape.minY, shape.z]}>
      {instrument && (
        <>
          {/* Outer metallic shell (NO text nameplate — `وميكونش مكتوب عليها اي حاجة`) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[shape.radius, shape.tube, 10, 96]} />
            <meshStandardMaterial
              ref={shellMaterial}
              color="#1b2735"
              roughness={0.3}
              metalness={0.75}
            />
          </mesh>

          {/* Emitter array */}
          <instancedMesh ref={emitters} args={[undefined, undefined, EMITTERS]}>
            <boxGeometry args={[shape.emitter * 0.55, shape.emitter * 0.7, shape.emitter * 2.2]} />
            <meshStandardMaterial
              color="#0b1c24"
              ref={emitterMaterial}
              emissive={tint.hex}
              emissiveIntensity={EMITTER_GLOW}
              roughness={0.25}
              metalness={0.4}
            />
          </instancedMesh>

          {/* Lit inner ring edge */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[shape.lightRadius, shape.tube * 0.22, 6, 96]} />
            <meshBasicMaterial ref={edgeMaterial} color={edgeLit} toneMapped={false} />
          </mesh>
        </>
      )}

      {glow && (
        <group ref={glowGroup}>
          <mesh geometry={glow.disc} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
              ref={discMaterial}
              color={lit}
              vertexColors
              transparent
              opacity={DISC_OPACITY}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh geometry={glow.skirt} scale={[1, 0.42, 1]}>
            <meshBasicMaterial
              ref={lensMaterial}
              color={lit}
              vertexColors
              transparent
              opacity={LENS_OPACITY}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
