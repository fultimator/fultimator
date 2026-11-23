import type { PlayerSpellFormState } from "./types";

export const isDefault = (s: PlayerSpellFormState) => s.spellType === "default";
export const isArcanist = (s: PlayerSpellFormState) =>
  s.spellType === "arcanist" || s.spellType === "arcanist-rework";
export const isArcanistRework = (s: PlayerSpellFormState) =>
  s.spellType === "arcanist-rework";
export const isTinkererAlchemy = (s: PlayerSpellFormState) =>
  s.spellType === "tinkerer-alchemy";
export const isTinkererInfusion = (s: PlayerSpellFormState) =>
  s.spellType === "tinkerer-infusion";
export const isTinkererMagitech = (s: PlayerSpellFormState) =>
  s.spellType === "tinkerer-magitech";
export const isPilot = (s: PlayerSpellFormState) =>
  s.spellType === "pilot-vehicle";
export const isGift = (s: PlayerSpellFormState) => s.spellType === "gift";
export const isDance = (s: PlayerSpellFormState) => s.spellType === "dance";
export const isTherioform = (s: PlayerSpellFormState) =>
  s.spellType === "therioform";
export const isMagichantKey = (s: PlayerSpellFormState) =>
  s.spellType === "magichant-key";
export const isMagichantTone = (s: PlayerSpellFormState) =>
  s.spellType === "magichant";
export const isSymbol = (s: PlayerSpellFormState) => s.spellType === "symbol";
export const isInvocation = (s: PlayerSpellFormState) =>
  s.spellType === "invocation";
export const isCooking = (s: PlayerSpellFormState) => s.spellType === "cooking";
export const isMagiseed = (s: PlayerSpellFormState) =>
  s.spellType === "magiseed";
export const isWellspring = (s: PlayerSpellFormState) =>
  s.spellType === "wellspring";

export const showDuration = (s: PlayerSpellFormState) => isDefault(s);
