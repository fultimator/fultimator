export const STANDARD_WELLSPRINGS = [
  { key: "Air", color: "#87cfeb", textColor: "black", icon: "air" },
  { key: "Earth", color: "#8B4513", textColor: "white", icon: "earth" },
  { key: "Fire", color: "#D63B00", textColor: "white", icon: "fire" },
  { key: "Lightning", color: "#E6C800", textColor: "black", icon: "bolt" },
  { key: "Water", color: "#2F6FA1", textColor: "white", icon: "water" },
];

export const AFFINITY_ICON_OPTIONS = [
  { value: "air", label: "Air" },
  { value: "earth", label: "Earth" },
  { value: "fire", label: "Fire" },
  { value: "bolt", label: "Lightning" },
  { value: "water", label: "Water" },
  { value: "ice", label: "Ice" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "poison", label: "Poison" },
  { value: "physical", label: "Physical" },
  { value: "untyped", label: "Untyped" },
];

export const affinityIconSrc = (icon) =>
  `/assets/icons/affinities/icons/${icon || "untyped"}.png`;

export function resolveWellsprings(customWellsprings = []) {
  const standard = STANDARD_WELLSPRINGS.map((w) => ({
    ...w,
    isStandard: true,
  }));
  const custom = (customWellsprings || []).map((w) => ({
    key: w.name,
    color: w.color || "#888",
    textColor: w.textColor || "white",
    icon: w.icon || "untyped",
    isStandard: false,
  }));
  return [...standard, ...custom];
}
