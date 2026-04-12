export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Bump this when the app version changes.
const APP_VERSION = "2.0.0";

function parseVersion(v: string): number[] {
  return v.split(".").map((n) => parseInt(n, 10) || 0);
}

/** Returns true if `minVersion` is <= `APP_VERSION`. */
export function isVersionCompatible(minVersion: string): boolean {
  const min = parseVersion(minVersion);
  const current = parseVersion(APP_VERSION);
  const len = Math.max(min.length, current.length);
  for (let i = 0; i < len; i++) {
    const c = current[i] ?? 0;
    const m = min[i] ?? 0;
    if (c > m) return true;
    if (c < m) return false;
  }
  return true; // equal versions are compatible
}

/** Validates the top-level manifest object from a .fcp archive. */
export function validateManifest(manifest: unknown): ValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return { valid: false, errors: ["Manifest must be a JSON object"] };
  }

  const m = manifest as Record<string, unknown>;

  if (!m.name || typeof m.name !== "string" || !m.name.trim()) {
    errors.push('Missing or invalid "name" field');
  }
  if (m.description !== undefined && typeof m.description !== "string") {
    errors.push('"description" must be a string');
  }
  if (m.author !== undefined && typeof m.author !== "string") {
    errors.push('"author" must be a string');
  }
  if (m.fultimatorMinVersion !== undefined && typeof m.fultimatorMinVersion !== "string") {
    errors.push('"fultimatorMinVersion" must be a string');
  }
  if (
    m.fultimatorMinVersion &&
    typeof m.fultimatorMinVersion === "string" &&
    !isVersionCompatible(m.fultimatorMinVersion)
  ) {
    errors.push(
      `Pack requires fultimator >= ${m.fultimatorMinVersion} (current: ${APP_VERSION})`
    );
  }

  return { valid: errors.length === 0, errors };
}
