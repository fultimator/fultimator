const ATTR_VALUE_KEYS = new Set([
  "attr",
  "attr1",
  "attr2",
  "att1",
  "att2",
  "attribute",
  "overrideAccuracyAttr1",
  "overrideAccuracyAttr2",
]);

export function renameWillAttrValueDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => renameWillAttrValueDeep(v)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (ATTR_VALUE_KEYS.has(k) && (v === "will" || v === "wlp")) {
        out[k] = "willpower";
      } else {
        out[k] = renameWillAttrValueDeep(v);
      }
    }
    return out as T;
  }
  return value;
}
