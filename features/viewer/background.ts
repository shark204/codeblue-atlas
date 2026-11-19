'use client';

export type BackgroundMode = "dark" | "light";

export interface BackgroundTheme {
  canvas: string;
  gradient: string;
  ambient: number;
  leader: string;
  chip: string;
  ink: string;
  footerInk: string;
  footerSubtle: string;
}

/**
 * Single centralized configuration object (`ATLAS_STYLE`) for the "Human Atlas"
 * soft stylized clay / pastel medical illustration aesthetic.
 * Tweak any color, roughness, sheen, lighting, or rendering value here.
 */
export const ATLAS_STYLE = {
  muscles: {
    baseColor: "#E8A09A",
    minColor: "#E39A93",
    maxColor: "#F0B5AE",
    roughness: 0.70,
    roughnessMin: 0.65,
    roughnessMax: 0.75,
    metalness: 0.0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.6,
    sheen: 0.3,
    sheenColor: "#FFD6D0",
    normalScale: 0.15,
    selectedColor: "#F7C4BE",
    selectedEmissive: "#FF9C94",
    selectedEmissiveIntensity: 0.25,
    unselectedDimOpacity: 0.40,
    outlineColor: "#C9837D",
    outlineWidthPx: 1,
  },
  tendons: {
    color: "#F3E3D3",
    roughness: 0.80,
    metalness: 0.0,
  },
  bones: {
    color: "#EFE6D8",
    roughness: 0.70,
    metalness: 0.0,
  },
  lighting: {
    keyIntensity: 1.6,
    keyColor: "#FFFDFB",
    fillIntensity: 0.8,
    fillColor: "#F8FAFC",
    rimIntensity: 0.6,
    rimColor: "#F2F7FF",
    hemisphereSky: "#FFFFFF",
    hemisphereGround: "#F2D9D4",
    hemisphereIntensity: 0.6,
    envMapIntensity: 0.5,
    shadowOpacity: 0.25,
    shadowBlur: 3.2,
  },
  rendering: {
    toneMappingExposure: 1.0,
    backgroundTop: "#FFFFFF",
    backgroundBottom: "#F4F4F6",
    backgroundGradient: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)",
    enableSSAO: true,
    ssaoIntensity: 0.32,
    ssaoRadius: 0.18,
    enableOutline: true,
  },
} as const;

const HUMAN_ATLAS_LIGHT_THEME: BackgroundTheme = {
  canvas: ATLAS_STYLE.rendering.backgroundBottom,
  gradient: ATLAS_STYLE.rendering.backgroundGradient,
  ambient: 0.65,
  leader: "rgba(201, 131, 125, 0.92)",
  chip: "rgba(255, 255, 255, 0.96)",
  ink: "#1e293b",
  footerInk: "#1e293b",
  footerSubtle: "#475569",
};

const PRO_CONTRAST_THEME: BackgroundTheme = {
  canvas: ATLAS_STYLE.rendering.backgroundBottom,
  gradient: ATLAS_STYLE.rendering.backgroundGradient,
  ambient: 0.65,
  leader: "rgba(201, 131, 125, 0.92)",
  chip: "rgba(255, 255, 255, 0.96)",
  ink: "#1e293b",
  footerInk: "#1e293b",
  footerSubtle: "#475569",
};

export const BACKGROUNDS: Record<BackgroundMode, BackgroundTheme> = {
  dark: PRO_CONTRAST_THEME,
  light: HUMAN_ATLAS_LIGHT_THEME,
};

export function backgroundTheme(mode: BackgroundMode): BackgroundTheme {
  return BACKGROUNDS[mode] ?? HUMAN_ATLAS_LIGHT_THEME;
}
