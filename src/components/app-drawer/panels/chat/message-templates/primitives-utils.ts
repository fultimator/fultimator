export const ATTR_LABEL: Record<string, string> = {
  dex: "DEX",
  ins: "INS",
  mig: "MIG",
  wlp: "WLP",
};

export function normalizeDamageType(damageType: string): string {
  const rawDamageType = String(damageType || "physical")
    .toLowerCase()
    .trim();
  if (
    [
      "physical",
      "air",
      "bolt",
      "dark",
      "earth",
      "fire",
      "ice",
      "light",
      "poison",
    ].includes(rawDamageType)
  ) {
    return rawDamageType;
  }
  return "physical";
}

export function formatSpellType(spellType: string | undefined): string {
  const clean = String(spellType || "default")
    .replace(/_/g, " ")
    .trim();
  if (!clean) return "Default";
  return clean.replace(/\b\w/g, (m) => m.toUpperCase());
}
