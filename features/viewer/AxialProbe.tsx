'use client';

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { SHARED_SCAN } from "./scanBand";
import type { SectionPlaneName, SliceBasis, SlicePlane, SliceWindow } from "./axialSlice";
import { useScanStore } from "@/stores/scanStore";

import {
  AXIAL_CANVAS,
  cameraForwardOf,
  cameraUpOf,
  cutPlanes,
  paintSlice,
  planePoint,
  sliceBasis,
  sliceWindowOf,
  slabPlanes,
  SLAB_HALF_THICKNESS,
  SECTION_VIEW,
  SLICE_PIXELS,
  sliceSize,
  TORCH,
} from "./axialSlice";
import { aimStudioAt, rakingKey } from "./lighting";

export const AXIAL_PROBE = {
  renderMs: -1,
  readbackMs: -1,
  drawCalls: -1,
  runs: 0,
  drawn: -1,
  frameCm: -1,
  base: { h: 0, v: 0, half: 0 } as SliceWindow,
  shown: { h: 0, v: 0, half: 0 } as SliceWindow,
  basis: sliceBasis(1) as SliceBasis,
  at: 0,
  plane: "axial" as SectionPlaneName,
};

export function AxialProbe({
  bounds,
  request,
  high,
  leftSign,
  plane,
}: {
  bounds: THREE.Box3 | null;
  request: number;
  high: boolean;
  leftSign: 1 | -1;
  plane: SlicePlane;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const done = useRef(0);

  const size = sliceSize(high, gl.capabilities.maxTextureSize);
  useEffect(() => {
    SLICE_PIXELS.value = size;
  }, [size]);

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(size, size, {
        depthBuffer: true,
        stencilBuffer: false,
      }),
    [size],
  );
  useEffect(() => () => target.dispose(), [target]);

  const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 2.5), []);
  const pixels = useMemo(() => new Uint8Array(size * size * 4), [size]);
  const hiddenMeshes = useRef<THREE.Mesh[]>([]);
  const forcedSolid = useRef<
    {
      material: THREE.Material;
      transparent: boolean;
      opacity: number;
      depthWrite: boolean;
      side: THREE.Side;
    }[]
  >([]);
  const worldBox = useMemo(() => new THREE.Box3(), []);
  const content = useMemo(() => new THREE.Box3(), []);

  useFrame(() => {
    if (request === done.current || !bounds || bounds.isEmpty()) return;
    done.current = request;

    const at = SHARED_SCAN.value;

    const ring = scene.getObjectByName("scan-ring");
    const ringWasVisible = ring?.visible ?? false;
    if (ring) ring.visible = false;

    const hidden = hiddenMeshes.current;
    const solid = forcedSolid.current;
    hidden.length = 0;
    solid.length = 0;
    let considered = 0;
    content.makeEmpty();

    scene.traverseVisible((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      considered += 1;
      const geometry = mesh.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if (!geometry.boundingBox) return;
      worldBox.copy(geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      const near = worldBox.min.dot(plane.normal);
      const far = worldBox.max.dot(plane.normal);

      // Keep structures at and immediately below the cut plane so the 3D cross-section renders solid internal 3D anatomy
      if (far < at - 0.34 || near > at + SLAB_HALF_THICKNESS) {
        mesh.visible = false;
        hidden.push(mesh);
        return;
      }

      if (far >= at - SLAB_HALF_THICKNESS && near <= at + SLAB_HALF_THICKNESS) {
        content.union(worldBox);
      }

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        solid.push({
          material,
          transparent: material.transparent,
          opacity: material.opacity,
          depthWrite: material.depthWrite,
          side: material.side,
        });
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.side = THREE.DoubleSide;
      }
    });

    const base: SliceWindow = sliceWindowOf(content.isEmpty() ? bounds : content, plane);
    const shown = SECTION_VIEW.value ?? base;
    camera.left = -shown.half;
    camera.right = shown.half;
    camera.top = shown.half;
    camera.bottom = -shown.half;
    const middle = planePoint(plane, shown.h, shown.v, at);
    camera.position.copy(middle).addScaledVector(plane.normal, 0.55);
    camera.up.copy(cameraUpOf(plane));
    camera.lookAt(middle);
    camera.updateProjectionMatrix();
    AXIAL_PROBE.frameCm = shown.half * 200;
    AXIAL_PROBE.base = base;
    AXIAL_PROBE.shown = shown;

    const previousClipping = gl.clippingPlanes;
    const previousTarget = gl.getRenderTarget();
    const torch = TORCH.value;
    // Use solid 3D anatomical cut-section rendering (`cutPlanes`) so internal 3D chambers, vessels, and parenchyma are solid & vivid
    const cutting = true;
    const forward = cameraForwardOf(plane);
    const up = cameraUpOf(plane);
    const restoreLights = aimStudioAt(scene, forward, up, {
      key: torch ?? (cutting ? undefined : rakingKey(forward, up)),
      support: torch ? 0.85 : 1.62,
    });
    try {
      gl.clippingPlanes = cutting ? cutPlanes(plane, at) : slabPlanes(plane, at);

      gl.info.reset();
      const startedRender = performance.now();
      gl.setRenderTarget(target);
      gl.render(scene, camera);
      gl.getContext().finish();
      AXIAL_PROBE.renderMs = performance.now() - startedRender;
      AXIAL_PROBE.drawCalls = gl.info.render.calls;

      const startedReadback = performance.now();
      gl.readRenderTargetPixels(target, 0, 0, size, size, pixels);
      AXIAL_PROBE.readbackMs = performance.now() - startedReadback;
    } finally {
      restoreLights();
      gl.setRenderTarget(previousTarget);
      gl.clippingPlanes = previousClipping;
      if (ring) ring.visible = ringWasVisible;
      for (const mesh of hidden) mesh.visible = true;
      for (const was of solid) {
        was.material.transparent = was.transparent;
        was.material.opacity = was.opacity;
        was.material.depthWrite = was.depthWrite;
        was.material.side = was.side;
        was.material.needsUpdate = true;
      }
      solid.length = 0;
    }
    AXIAL_PROBE.drawn = considered - hidden.length;
    hidden.length = 0;
    AXIAL_PROBE.runs += 1;

    const surface = AXIAL_CANVAS.value;
    const basis = sliceBasis(leftSign);
    AXIAL_PROBE.basis = basis;
    AXIAL_PROBE.at = at;
    AXIAL_PROBE.plane = plane.name;
    if (surface) paintSlice(surface, pixels, size, basis, plane);

    useScanStore.getState().sectionTaken();
  });

  return null;
}
