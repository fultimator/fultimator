function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return undefined;
}

export function normalizeDefensiveItem<T extends object>(
  item: T | undefined,
): T | undefined {
  if (!item) return item;

  const next: Record<string, unknown> = {
    ...(item as Record<string, unknown>),
  };

  // Canonical: martial (legacy alias: isMartial).
  if (next.martial === undefined && typeof next.isMartial === "boolean") {
    next.martial = next.isMartial;
  }
  if (next.martial === undefined) {
    next.martial = false;
  }
  // Mirror legacy alias for compatibility.
  next.isMartial = next.martial;

  if (next.cost === undefined && next.value !== undefined) {
    next.cost = next.value;
  }
  if (next.value === undefined && next.cost !== undefined) {
    next.value = next.cost;
  }

  if (next.quality === undefined) {
    next.quality = "";
  }

  const modifiers =
    next.modifiers && typeof next.modifiers === "object"
      ? ({ ...(next.modifiers as Record<string, unknown>) } as Record<
          string,
          unknown
        >)
      : undefined;

  const modifierAccuracy = modifiers
    ? (toNumber(modifiers.accuracy) ?? toNumber(modifiers.prec))
    : undefined;
  const flatPrec = toNumber(next.precModifier);
  const effectiveAccuracy = modifierAccuracy ?? flatPrec ?? 0;

  if (modifiers) {
    modifiers.accuracy = effectiveAccuracy;
    delete modifiers.prec;
    next.modifiers = modifiers;
  } else if (flatPrec !== undefined) {
    next.modifiers = { accuracy: flatPrec };
  }

  if (flatPrec === undefined) {
    next.precModifier = effectiveAccuracy;
  }

  const def = toNumber(next.def);
  const mdef = toNumber(next.mdef);
  const defBonus = toNumber(next.defbonus) ?? 0;
  const mdefBonus = toNumber(next.mdefbonus) ?? 0;
  if ((def ?? 0) === 0 && defBonus !== 0) {
    next.def = (def ?? 0) + defBonus;
  }
  if ((mdef ?? 0) === 0 && mdefBonus !== 0) {
    next.mdef = (mdef ?? 0) + mdefBonus;
  }
  // Keep legacy bonus keys coherent with canonical totals.
  if (
    toNumber(next.def) !== undefined &&
    toNumber(next.defbonus) === undefined
  ) {
    next.defbonus = 0;
  }
  if (
    toNumber(next.mdef) !== undefined &&
    toNumber(next.mdefbonus) === undefined
  ) {
    next.mdefbonus = 0;
  }

  return next as T;
}

export function normalizeDefensiveList<T extends object>(items: T[] = []): T[] {
  return items.map((item) => normalizeDefensiveItem(item) as T);
}
