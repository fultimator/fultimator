import type { PlayerSpellFormState } from "./types";

export const isDefault = (s: PlayerSpellFormState) => s.spellType === "default";
export const isArcanist = (s: PlayerSpellFormState) =>
  s.spellType === "arcanist" || s.spellType === "arcanist-rework";
export const isArcanistRework = (s: PlayerSpellFormState) => s.spellType === "arcanist-rework";
export const isTinkererAlchemy = (s: PlayerSpellFormState) => s.spellType === "tinkerer-alchemy";
export const isTinkererInfusion = (s: PlayerSpellFormState) => s.spellType === "tinkerer-infusion";
export const isPilot = (s: PlayerSpellFormState) => s.spellType === "pilot-vehicle";

export const showDuration = (s: PlayerSpellFormState) => isDefault(s);
