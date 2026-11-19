'use client';

import { useGLTF } from "@react-three/drei";
import { create } from "zustand";
import * as THREE from "three";
import type { SectionPlane } from "@/lib/schemas";

export const PLANE_NORMALS: Record<SectionPlane, THREE.Vector3> = {
  sagittal: new THREE.Vector3(-1, 0, 0),
  coronal: new THREE.Vector3(0, 0, -1),
  axial: new THREE.Vector3(0, -1, 0),
};

export const DRACO_DECODER_PATH = "/draco/";
try {
  useGLTF.setDecoderPath(DRACO_DECODER_PATH);
} catch {}

export interface OrganGeometry {
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
}

export interface BoneLandmark3D {
  id: string;
  name_en: string;
  name_ar: string;
  kind: "notch" | "landmark";
  description: string;
  worldPos: [number, number, number];
}

export interface OrganRelationItem {
  organId: string;
  name_en: string;
  direction: string;
  system: string;
}

const TOGGLES_STORAGE_KEY = "cb_atlas_3d_toggles_v1";

const DEFAULT_3D_TOGGLES: Record<string, boolean> = {};

function loadPersisted3DToggles(): Record<string, boolean> {
  return { ...DEFAULT_3D_TOGGLES };
}

function savePersisted3DToggles(toggles: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOGGLES_STORAGE_KEY, JSON.stringify(toggles));
  } catch {}
}

export interface Inspector3DStoreState {
  activeFocusPart: "origin" | "insertion" | "action" | "nerve" | null;
  animateMuscleAction: boolean;
  activeLandmarkId: string | null;
  panelZoomScale: number;
  neuralPulseSeq: number;
  inspectorPanelOpen: boolean;
  model3DReady: boolean;
  enabled3DToggles: Record<string, boolean>;
  hasNerveInsertion3D: boolean;
  muscleData: {
    originPos: [number, number, number] | null;
    insertionPos: [number, number, number] | null;
    nerveIds: string[];
    siblingBranchIds?: string[];
  };
  organData: {
    relations: OrganRelationItem[];
    arteryIds: string[];
    veinIds: string[];
    nerveIds: string[];
    lymphIds?: string[];
    targetMuscleIds?: string[];
  };
  boneLandmarks: BoneLandmark3D[];
  setActiveFocusPart: (part: "origin" | "insertion" | "action" | "nerve" | null) => void;
  setAnimateMuscleAction: (animate: boolean) => void;
  setActiveLandmarkId: (id: string | null) => void;
  setPanelZoomScale: (scale: number) => void;
  triggerNeuralPulse: () => void;
  setInspectorPanelOpen: (open: boolean) => void;
  setModel3DReady: (ready: boolean) => void;
  toggle3DKey: (key: string) => void;
  set3DKey: (key: string, value: boolean) => void;
  hydrate3DToggles: () => void;
  setComputed3DData: (
    partial: Partial<
      Pick<
        Inspector3DStoreState,
        "muscleData" | "organData" | "boneLandmarks" | "hasNerveInsertion3D"
      >
    >,
  ) => void;
}

export const useInspector3DStore = create<Inspector3DStoreState>()((set) => ({
  activeFocusPart: null,
  animateMuscleAction: false,
  activeLandmarkId: null,
  panelZoomScale: 1,
  neuralPulseSeq: 0,
  inspectorPanelOpen: false,
  model3DReady: true,
  enabled3DToggles: loadPersisted3DToggles(),
  hasNerveInsertion3D: false,
  muscleData: { originPos: null, insertionPos: null, nerveIds: [], siblingBranchIds: [] },
  organData: { relations: [], arteryIds: [], veinIds: [], nerveIds: [], lymphIds: [], targetMuscleIds: [] },
  boneLandmarks: [],
  setActiveFocusPart: (activeFocusPart) => set({ activeFocusPart }),
  setAnimateMuscleAction: (animateMuscleAction) => set({ animateMuscleAction }),
  setActiveLandmarkId: (activeLandmarkId) => set({ activeLandmarkId }),
  setPanelZoomScale: (panelZoomScale) => set({ panelZoomScale }),
  triggerNeuralPulse: () => set((s) => ({ neuralPulseSeq: s.neuralPulseSeq + 1 })),
  setInspectorPanelOpen: (inspectorPanelOpen) => set({ inspectorPanelOpen }),
  setModel3DReady: (model3DReady) => set({ model3DReady }),
  toggle3DKey: (key) =>
    set((s) => {
      const next = { ...s.enabled3DToggles, [key]: !s.enabled3DToggles[key] };
      savePersisted3DToggles(next);
      return { enabled3DToggles: next };
    }),
  set3DKey: (key, value) =>
    set((s) => {
      const next = { ...s.enabled3DToggles, [key]: value };
      savePersisted3DToggles(next);
      return { enabled3DToggles: next };
    }),
  hydrate3DToggles: () =>
    set(() => ({
      enabled3DToggles: loadPersisted3DToggles(),
    })),
  setComputed3DData: (partial) => set((s) => ({ ...s, ...partial })),
}));
