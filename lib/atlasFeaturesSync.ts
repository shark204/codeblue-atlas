/**
 * Clean no-op sync helper: all Atlas UI and Radiology features are directly applied in source files.
 * Zero dynamic fs calls so Turbopack / Webpack never emit filesystem tracing warnings.
 */
export function ensureAtlasFeaturesSynced(): void {
  // No-op: files are already updated in place
}

export function syncAtlasFeaturesToDisk(): { synced: number } {
  return { synced: 0 };
}
