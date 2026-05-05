export function slugFuid(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseRef(value) {
  if (typeof value !== "string") return null;
  const idx = value.indexOf(":");
  if (idx <= 0) return null;
  const packFuid = slugFuid(value.slice(0, idx));
  const itemFuid = slugFuid(value.slice(idx + 1));
  if (!packFuid) return null;
  return { packFuid, itemFuid };
}

export function buildRef(packFuid, itemFuid) {
  const pack = slugFuid(packFuid);
  const item = slugFuid(itemFuid);
  if (!pack || !item) return "";
  return `${pack}:${item}`;
}

export function collectRefPacks(data) {
  const fuids = new Set();
  for (const [key, value] of Object.entries(data ?? {})) {
    if (!key.endsWith("Ref")) continue;
    const parsed = parseRef(value);
    if (parsed?.packFuid) fuids.add(parsed.packFuid);
  }
  return Array.from(fuids);
}

export function resolveRef(refValue, packs) {
  const parsed = parseRef(refValue);
  if (!parsed) return null;
  const { packFuid, itemFuid } = parsed;

  for (const pack of packs) {
    const currentPackFuid = slugFuid(pack?.fuid || pack?.name || "");
    if (currentPackFuid !== packFuid) continue;

    let entry = null;
    if (itemFuid) {
      entry = pack.items?.find(
        (i) => slugFuid(i?.data?.fuid ?? "") === itemFuid,
      );
    }
    if (!entry) {
      entry = pack.items?.find(
        (i) => i?.id === String(refValue).split(":", 2)[1],
      );
    }
    if (entry) return entry.data;
  }
  return null;
}
