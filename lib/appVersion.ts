'use client';

/**
 * Web-safe application version for Code Blue 3D Anatomy Atlas (Anatria3D Web).
 */
export const APP_VERSION: string =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ATLAS_VERSION
    ? process.env.NEXT_PUBLIC_ATLAS_VERSION
    : "0.6.0";

export const APP_VERSION_LABEL = `v${APP_VERSION}`;
