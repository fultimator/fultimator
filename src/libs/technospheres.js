export function getHoplosphereCoagKey(hoplosphere) {
  if (!hoplosphere) return "";
  if (hoplosphere.fuid) return hoplosphere.fuid;
  if (hoplosphere._packItemId) return hoplosphere._packItemId;
  return JSON.stringify({
    name: hoplosphere.name ?? "",
    description: hoplosphere.description ?? "",
    requiredSlots: hoplosphere.requiredSlots ?? 1,
    socketable: hoplosphere.socketable ?? "all",
    cost: hoplosphere.cost ?? 500,
    coagEffects: hoplosphere.coagEffects ?? {},
  });
}

export function buildSphereData(item, player) {
  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? [];
  const hoplospheres = eq0.hoplospheres ?? [];
  const slotted = item?.slotted ?? [];

  if (slotted.length === 0) return null;

  return {
    slotTier: item?.slots ?? "alpha",
    slottedSpheres: buildSlottedSphereData(slotted, mnemospheres, hoplospheres),
  };
}

function buildSlottedSphereData(slotted, mnemospheres, hoplospheres) {
  const spheres = [];
  const hoploCounts = new Map();
  const hoploEntries = new Map();

  for (const id of slotted) {
    const mnemo = mnemospheres.find((m) => m.id === id);
    if (mnemo) {
      spheres.push({
        id,
        name: `${mnemo.class} Lv.${mnemo.lvl ?? 1}`,
        type: "mnemosphere",
        description: "",
        coagCount: 1,
      });
      continue;
    }

    const hoplo = hoplospheres.find((h) => h.id === id);
    if (!hoplo) continue;

    const key = getHoplosphereCoagKey(hoplo);
    hoploCounts.set(key, (hoploCounts.get(key) ?? 0) + 1);
    if (!hoploEntries.has(key)) {
      hoploEntries.set(key, {
        id,
        coagKey: key,
        name: hoplo.name,
        type: "hoplosphere",
        description: hoplo.description,
        coagCount: 1,
        coagEffects: hoplo.coagEffects,
      });
    }
  }

  for (const [key, entry] of hoploEntries) {
    spheres.push({ ...entry, coagCount: hoploCounts.get(key) ?? 1 });
  }

  return spheres;
}
