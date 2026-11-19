'use client';

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef , useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { SectionPlane } from "@/lib/schemas";
import {
  useSceneStore,
  type CrossSection,
  type FocusRequest,
  type ViewpointRequest,
} from "@/stores/sceneStore";
import { useHeartStore } from "@/stores/heartStore";
import { useBreathStore } from "@/stores/breathStore";
import { useScanStore } from "@/stores/scanStore";
import { ATLAS_STYLE, backgroundTheme } from "./background";
import { framingDistance, scanStance, viewDirection } from "./cameraViews";
import {
  STUDIO_AMBIENT,
  STUDIO_FILL,
  STUDIO_KEY,
  STUDIO_RIM,
  studioLightDirections,
} from "./lighting";
import { studyEnvelope } from "./supply";
import { setViewerHandle } from "./viewerBridge";
import { PLANE_NORMALS, useInspector3DStore } from "./anatomySceneTypes";

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


export function buildClippingPlanes(
  section: CrossSection | null,
  bounds: THREE.Box3 | null,
): THREE.Plane[] {
  if (!section) return [];
  const normal = PLANE_NORMALS[section.plane].clone();

  let constant = section.position;
  if (bounds && !bounds.isEmpty()) {
    const centre = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const axis: Record<SectionPlane, "x" | "y" | "z"> = {
      sagittal: "x",
      coronal: "z",
      axial: "y",
    };
    const key = axis[section.plane];
    constant = -(centre[key] + (section.position * size[key]) / 2) * normal[key];
  }
  return [new THREE.Plane(normal, constant)];
}

export function ViewerBridge({
  centres,
  offsets,
  geometryRevision,
}: {
  centres: Map<string, THREE.Vector3>;
  offsets: Map<string, THREE.Vector3>;
  geometryRevision: number;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as { enabled: boolean } | null;

  useEffect(() => {
    setViewerHandle({ gl, scene, camera, centres, offsets, controls, geometryRevision });
    return () => setViewerHandle(null);
  }, [gl, scene, camera, centres, offsets, controls, geometryRevision]);

  return null;
}

/**
 * VOKA-Calibrated 3-Point Clinical Studio Lighting Rig (`StudioLights`).
 * Only recomputes light vectors when camera orientation actually changes.
 */
export function StudioLights() {
  const { gl, scene, size } = useThree();
  const background = useSafeStore(useSceneStore, (s) => s.background);
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const isMobileLight = size.width > 0 && size.width < 768;

  // Neutral Studio Soft-Box HDRI Environment at envMapIntensity 0.5 ("Use a neutral studio HDRI (soft box environment) at envMapIntensity 0.5")
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color("#F4F4F6");
    const keyBox = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.38, 1.36) }),
    );
    keyBox.position.set(-6.0, 4.0, 5.5);
    keyBox.lookAt(0, 0, 0);
    const fillBox = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 14),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.05, 1.06, 1.08) }),
    );
    fillBox.position.set(6.0, 2.5, 4.5);
    fillBox.lookAt(0, 0, 0);
    const rimBox = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.14, 1.2) }),
    );
    rimBox.position.set(0, 4.5, -6.5);
    rimBox.lookAt(0, 0, 0);
    envScene.add(keyBox, fillBox, rimBox);
    const rt = pmrem.fromScene(envScene, 0.05);
    keyBox.geometry.dispose();
    (keyBox.material as THREE.Material).dispose();
    fillBox.geometry.dispose();
    (fillBox.material as THREE.Material).dispose();
    rimBox.geometry.dispose();
    (rimBox.material as THREE.Material).dispose();
    scene.environment = rt.texture;
    (scene as unknown as { environmentIntensity?: number }).environmentIntensity =
      ATLAS_STYLE.lighting.envMapIntensity;
    return () => {
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, background, isMobileLight]);

  const forward = useRef(new THREE.Vector3());
  const lastQuat = useRef(new THREE.Quaternion());
  const directions = useRef(
    studioLightDirections(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)),
  );

  useFrame(({ camera }) => {
    if (lastQuat.current.equals(camera.quaternion)) return;
    lastQuat.current.copy(camera.quaternion);
    camera.getWorldDirection(forward.current);
    const aimed = studioLightDirections(forward.current, camera.up, directions.current);
    key.current?.position.copy(aimed.key).multiplyScalar(10);
    fill.current?.position.copy(aimed.fill).multiplyScalar(10);
    rim.current?.position.copy(aimed.rim).multiplyScalar(10);
  });

  return (
    <>
      <ambientLight name={STUDIO_AMBIENT} intensity={0.35} color="#FFFFFF" />
      <hemisphereLight
        args={[
          ATLAS_STYLE.lighting.hemisphereSky,
          ATLAS_STYLE.lighting.hemisphereGround,
          ATLAS_STYLE.lighting.hemisphereIntensity,
        ]}
      />
      <directionalLight
        name={STUDIO_KEY}
        ref={key}
        intensity={ATLAS_STYLE.lighting.keyIntensity}
        color={ATLAS_STYLE.lighting.keyColor}
      />
      <directionalLight
        name={STUDIO_FILL}
        ref={fill}
        intensity={ATLAS_STYLE.lighting.fillIntensity}
        color={ATLAS_STYLE.lighting.fillColor}
      />
      <directionalLight
        name={STUDIO_RIM}
        ref={rim}
        intensity={ATLAS_STYLE.lighting.rimIntensity}
        color={ATLAS_STYLE.lighting.rimColor}
      />
    </>
  );
}

export function CameraRig({
  focusRequest,
  viewpoint,
  centres,
  offsets,
  boxes,
  isolatedOrganIds,
  foregroundOrganIds,
  hasGhostSkeleton,
  leftSign,
  bounds,
  finestDetail,
}: {
  focusRequest: FocusRequest | null;
  viewpoint: ViewpointRequest | null;
  centres: Map<string, THREE.Vector3>;
  offsets: Map<string, THREE.Vector3>;
  boxes: React.RefObject<Map<string, THREE.Box3>>;
  isolatedOrganIds: string[] | null;
  foregroundOrganIds: string[];
  hasGhostSkeleton: boolean;
  leftSign: 1 | -1;
  bounds: THREE.Box3 | null;
  finestDetail: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const desiredTarget = useRef(new THREE.Vector3());
  const desiredPosition = useRef(new THREE.Vector3());
  const { camera, size, invalidate } = useThree();
  const heartEnabled = useSafeStore(useHeartStore, (s) => s.enabled);
  const breathEnabled = useSafeStore(useBreathStore, (s) => s.enabled);
  const scanEnabled = useSafeStore(useScanStore, (s) => s.enabled);
  const isSoundMode = heartEnabled || breathEnabled;

  const selectedOrganIds = useSafeStore(useSceneStore, (s) => s.selectedOrganIds);
  const inspectorPanelOpen = useSafeStore(useInspector3DStore, (s) => s.inspectorPanelOpen);
  const isMobileCanvas =
    size.width > 0 &&
    (size.width < 768 || (typeof window !== "undefined" && window.innerWidth < 768));
  const shouldShiftMobileRight =
    isMobileCanvas && !scanEnabled && (inspectorPanelOpen || selectedOrganIds.length > 0);

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    if (scanEnabled) {
      perspective.clearViewOffset();
      perspective.updateProjectionMatrix();
      invalidate();
    } else if ((isSoundMode || shouldShiftMobileRight) && size.width > 0 && size.height > 0) {
      const rightShiftFraction = shouldShiftMobileRight ? 0.25 : 0.24;
      perspective.setViewOffset(
        size.width,
        size.height,
        -size.width * rightShiftFraction,
        0,
        size.width,
        size.height,
      );
      perspective.updateProjectionMatrix();
      invalidate();
    } else {
      perspective.clearViewOffset();
      perspective.updateProjectionMatrix();
      invalidate();
    }
    return () => {
      perspective.clearViewOffset();
      perspective.updateProjectionMatrix();
    };
  }, [isSoundMode, scanEnabled, isMobileCanvas, shouldShiftMobileRight, size.width, size.height, camera, invalidate]);
  const lastSeq = useRef(-1);
  const lastViewpointSeq = useRef(-1);
  const framedRadius = useRef(0);
  const easing = useRef<"none" | "target" | "both">("none");
  const orientOrbit = useRef<{
    active: boolean;
    elapsed: number;
    duration: number;
    startRadius: number;
    endRadius: number;
    startPhi: number;
    endPhi: number;
    startTheta: number;
    deltaTheta: number;
    target: THREE.Vector3;
  }>({
    active: false,
    elapsed: 0,
    duration: 2.0,
    startRadius: 1.5,
    endRadius: 1.5,
    startPhi: Math.PI * 0.5,
    endPhi: Math.PI * 0.5,
    startTheta: 0,
    deltaTheta: 0,
    target: new THREE.Vector3(),
  });

  useEffect(() => {
    if (!bounds || bounds.isEmpty()) {
      framedRadius.current = 0;
      return;
    }
    if (useScanStore.getState().enabled || (isolatedOrganIds && isolatedOrganIds.length > 0)) {
      return;
    }

    // Lock consistent full-body framing size (radius = maxDim * 0.50) whenever the outer body is visible or no organ is isolated
    const hasOuterBody = !useSceneStore.getState().hiddenSystems.includes("skeletal");
    const activeEnv =
      hasOuterBody
        ? bounds
        : foregroundOrganIds.length > 0
          ? studyEnvelope(foregroundOrganIds, boxes.current) ?? bounds
          : bounds;
    const centre = activeEnv.getCenter(new THREE.Vector3());
    const size = activeEnv.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1e-4) * 0.50;

    if (framedRadius.current > 0 && radius <= framedRadius.current * 1.25) return;
    const isFirstFrame = framedRadius.current === 0;
    framedRadius.current = radius;

    const perspective = camera as THREE.PerspectiveCamera;
    const aspect = Math.max(perspective.aspect || 1, 0.55);
    const distance = framingDistance(radius, perspective.fov, aspect);

    desiredTarget.current.copy(centre);
    desiredPosition.current.set(centre.x, centre.y, centre.z + distance);
    if (isFirstFrame) {
      camera.position.copy(desiredPosition.current);
    } else {
      easing.current = "both";
    }
    perspective.near = 0.015;
    perspective.far = Math.max(distance * 8, 14);
    perspective.updateProjectionMatrix();

    const orbit = controls.current;
    if (orbit) {
      if (isFirstFrame) orbit.target.copy(centre);
      orbit.minDistance = Math.max(finestDetail * 1.5, 0.12);
      orbit.maxDistance = Math.min(Math.max(distance * 1.35, 2.5), 3.4);
      orbit.update();
    }
    invalidate();
  }, [bounds, camera, finestDetail, invalidate]);

  useEffect(() => {
    if (!focusRequest || focusRequest.seq === lastSeq.current) return;
    const centre = centres.get(focusRequest.organId);
    if (!centre) return;
    lastSeq.current = focusRequest.seq;
    desiredTarget.current.copy(centre);
    const offset = offsets.get(focusRequest.organId);
    if (offset) desiredTarget.current.add(offset);
    easing.current = "target";
    invalidate();
  }, [focusRequest, centres, offsets, invalidate]);

  useEffect(() => {
    const orbit = controls.current;
    if (!viewpoint || !orbit || viewpoint.seq === lastViewpointSeq.current) return;
    lastViewpointSeq.current = viewpoint.seq;

    const perspective = camera as THREE.PerspectiveCamera;
    const offsetFrom = camera.position.clone().sub(orbit.target);
    const distance = offsetFrom.length();

    if (viewpoint.kind === "dolly") {
      orientOrbit.current.active = false;
      const next = THREE.MathUtils.clamp(
        distance * viewpoint.factor,
        orbit.minDistance,
        orbit.maxDistance,
      );
      desiredTarget.current.copy(orbit.target);
      desiredPosition.current
        .copy(orbit.target)
        .add(offsetFrom.normalize().multiplyScalar(next));
      easing.current = "both";
    } else if (viewpoint.kind === "orient" || viewpoint.kind === "scan") {
      // Smooth 2.0-second spherical orbit around the body (التبديل بين وضعين front back خلي الانتقال حلو وبطيء علي ثانيتين)
      const safeDist = Math.max(distance, 0.25);
      const startSph = new THREE.Spherical().setFromVector3(
        offsetFrom.lengthSq() > 1e-6 ? offsetFrom : new THREE.Vector3(0, 0, safeDist),
      );
      const targetDir = (
        viewpoint.kind === "scan"
          ? scanStance()
          : viewDirection(viewpoint.view, leftSign)
      )
        .clone()
        .normalize();
      const endSph = new THREE.Spherical().setFromVector3(
        targetDir.multiplyScalar(safeDist),
      );

      let dTheta = endSph.theta - startSph.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      if (Math.abs(Math.abs(dTheta) - Math.PI) < 0.08) {
        dTheta = Math.PI;
      }

      orientOrbit.current = {
        active: true,
        elapsed: 0,
        duration: isMobileCanvas ? 0.65 : 1.25,
        startRadius: startSph.radius,
        endRadius: endSph.radius,
        startPhi: startSph.phi,
        endPhi: endSph.phi,
        startTheta: startSph.theta,
        deltaTheta: dTheta,
        target: orbit.target.clone(),
      };
      easing.current = "none";
    } else {
      orientOrbit.current.active = false;
      const hasOuterBodyNow = !useSceneStore.getState().hiddenSystems.includes("skeletal");
      const targetIds =
        isolatedOrganIds ??
        (!hasOuterBodyNow && foregroundOrganIds.length > 0
          ? foregroundOrganIds
          : boxes.current.keys());
      const framing =
        !isolatedOrganIds && hasOuterBodyNow && bounds && !bounds.isEmpty()
          ? bounds
          : studyEnvelope(targetIds, boxes.current);
      if (!framing) return;
      const centre = framing.getCenter(new THREE.Vector3());
      const boxSize = framing.getSize(new THREE.Vector3());
      const radius = Math.max(boxSize.x, boxSize.y, boxSize.z, 1e-4) * (heartEnabled ? 0.68 : 0.46);

      const horizSpan = Math.max(
        Math.hypot(boxSize.x, boxSize.z) * 0.5,
        Math.max(boxSize.x, boxSize.z) * 0.62,
        0.04,
      );
      const ringRadius = horizSpan * 1.15;
      const effectiveRadius = scanEnabled
        ? Math.max(ringRadius * 1.12, boxSize.y * 0.58, 0.05)
        : radius;
      const scanScale = scanEnabled ? (isMobileCanvas ? 1.18 : 1.12) : heartEnabled ? 1.38 : 1.0;
      const aspectNow =
        size.width > 0 && size.height > 0 ? size.width / size.height : perspective.aspect || 1;
      const targetDist = framingDistance(effectiveRadius, perspective.fov, aspectNow) * scanScale;

      desiredTarget.current.copy(centre);
      const dir = scanEnabled
        ? new THREE.Vector3(0.22, 0.25, 0.94).normalize()
        : isSoundMode
          ? new THREE.Vector3(0, 0.04, 1).normalize()
          : offsetFrom.lengthSq() > 1e-6
            ? offsetFrom.normalize()
            : new THREE.Vector3(0, 0.08, 1).normalize();
      desiredPosition.current
        .copy(centre)
        .add(dir.multiplyScalar(targetDist));
      if (scanEnabled || isSoundMode) {
        orbit.target.copy(centre);
        camera.position.copy(desiredPosition.current);
        orbit.update();
      }
      easing.current = "both";
    }
    invalidate();
  }, [viewpoint, camera, isolatedOrganIds, foregroundOrganIds, hasGhostSkeleton, leftSign, boxes, invalidate]);

  const lastZoomScale = useRef(0.86);
  const lastScaleCheckAt = useRef(0);
  const clampOrbitTargetToViewport = (orbit: OrbitControlsImpl) => {
    if (!bounds || bounds.isEmpty()) return;
    const bCentre = bounds.getCenter(new THREE.Vector3());
    const bSize = bounds.getSize(new THREE.Vector3());
    const hasSelOrIso =
      (isolatedOrganIds && isolatedOrganIds.length > 0) ||
      useSceneStore.getState().selectedOrganIds.length > 0;
    const maxYOffset = hasSelOrIso ? bSize.y * 0.42 : bSize.y * 0.08;
    const maxXOffset = hasSelOrIso ? Math.max(bSize.x * 0.45, 0.25) : Math.max(bSize.x * 0.18, 0.10);
    const maxZOffset = hasSelOrIso ? Math.max(bSize.z * 0.45, 0.25) : Math.max(bSize.z * 0.18, 0.10);
    const clampedY = THREE.MathUtils.clamp(
      orbit.target.y,
      bCentre.y - maxYOffset,
      bCentre.y + maxYOffset,
    );
    const clampedX = THREE.MathUtils.clamp(
      orbit.target.x,
      bCentre.x - maxXOffset,
      bCentre.x + maxXOffset,
    );
    const clampedZ = THREE.MathUtils.clamp(
      orbit.target.z,
      bCentre.z - maxZOffset,
      bCentre.z + maxZOffset,
    );
    if (
      Math.abs(clampedY - orbit.target.y) > 1e-5 ||
      Math.abs(clampedX - orbit.target.x) > 1e-5 ||
      Math.abs(clampedZ - orbit.target.z) > 1e-5
    ) {
      const dy = clampedY - orbit.target.y;
      const dx = clampedX - orbit.target.x;
      const dz = clampedZ - orbit.target.z;
      orbit.target.set(clampedX, clampedY, clampedZ);
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;
    }
  };

  useFrame(({ clock }, delta) => {
    const orbit = controls.current;
    if (!orbit) return;
    clampOrbitTargetToViewport(orbit);

    const now = clock.getElapsedTime();
    if (now - lastScaleCheckAt.current >= 0.22) {
      lastScaleCheckAt.current = now;
      if (!isMobileCanvas) {
        if (lastZoomScale.current !== 1) {
          lastZoomScale.current = 1;
          useInspector3DStore.getState().setPanelZoomScale(1);
        }
      } else {
        const d = camera.position.distanceTo(orbit.target);
        const norm = THREE.MathUtils.clamp((d - 0.32) / 1.15, 0, 1);
        const nextScale = Number((0.66 + norm * 0.24).toFixed(2));
        if (Math.abs(nextScale - lastZoomScale.current) >= 0.03) {
          lastZoomScale.current = nextScale;
          useInspector3DStore.getState().setPanelZoomScale(nextScale);
        }
      }
    }

    if (orientOrbit.current.active) {
      const st = orientOrbit.current;
      st.elapsed += Math.min(delta, 0.05);
      const u = Math.min(1, st.elapsed / st.duration);
      // Silky cubic ease-in-out over 2.0 seconds
      const ease = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const sph = new THREE.Spherical(
        THREE.MathUtils.lerp(st.startRadius, st.endRadius, ease),
        THREE.MathUtils.lerp(st.startPhi, st.endPhi, ease),
        st.startTheta + st.deltaTheta * ease,
      );
      sph.makeSafe();
      orbit.target.copy(st.target);
      camera.position.setFromSpherical(sph).add(st.target);
      orbit.update();
      if (u >= 1) {
        st.active = false;
      } else {
        invalidate();
      }
      return;
    }

    if (easing.current === "none") return;

    const alpha = 1 - Math.pow(0.005, delta);
    orbit.target.lerp(desiredTarget.current, alpha);
    if (easing.current === "both") camera.position.lerp(desiredPosition.current, alpha);
    orbit.update();

    const settled =
      orbit.target.distanceToSquared(desiredTarget.current) < 1e-8 &&
      (easing.current === "target" ||
        camera.position.distanceToSquared(desiredPosition.current) < 1e-8);
    if (settled) {
      orbit.target.copy(desiredTarget.current);
      if (easing.current === "both") camera.position.copy(desiredPosition.current);
      orbit.update();
      easing.current = "none";
    } else {
      invalidate();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      camera={camera}
      enabled={!isSoundMode && !scanEnabled}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
      enableDamping
      dampingFactor={isMobileCanvas ? 0.11 : 0.14}
      rotateSpeed={isMobileCanvas ? 0.56 : 0.85}
      zoomSpeed={isMobileCanvas ? 1.02 : 1.3}
      minDistance={0.12}
      maxDistance={3.4}
      minPolarAngle={Math.PI * 0.24}
      maxPolarAngle={Math.PI * 0.76}
      zoomToCursor={false}
      screenSpacePanning
      enablePan={false}
      makeDefault
      onChange={() => {
        if (controls.current) clampOrbitTargetToViewport(controls.current);
      }}
      onStart={() => {
        easing.current = "none";
        orientOrbit.current.active = false;
      }}
    />
  );
}

