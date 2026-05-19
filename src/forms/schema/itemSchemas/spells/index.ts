import { z } from "zod";
import { PlayerSpellDefaultSchema } from "./default";
import { PlayerSpellGiftSchema } from "./gift";
import { PlayerSpellDanceSchema } from "./dance";
import { PlayerSpellTherioformSchema } from "./therioform";
import { PlayerSpellMagichantSchema } from "./magichant";
import { PlayerSpellSymbolSchema } from "./symbol";
import { PlayerSpellInvocationSchema } from "./invocation";
import { PlayerSpellArcanistSchema, PlayerSpellArcanistReworkSchema } from "./arcanist";
import { PlayerSpellTinkererAlchemySchema, PlayerSpellTinkererInfusionSchema } from "./tinkerer";
import { PlayerSpellMagitechSchema } from "./magitech";
import { PlayerSpellCookingSchema } from "./cooking";
import { PlayerSpellMagiseedSchema } from "./magiseed";
import { PlayerSpellPilotVehicleSchema } from "./pilotVehicle";
import { PlayerSpellGambleSchema } from "./gamble";
import { PlayerSpellDeckSchema } from "./deck";

export * from "./types";
export * from "./shared";
export * from "./default";
export * from "./gift";
export * from "./dance";
export * from "./therioform";
export * from "./magichant";
export * from "./symbol";
export * from "./invocation";
export * from "./arcanist";
export * from "./tinkerer";
export * from "./magitech";
export * from "./cooking";
export * from "./magiseed";
export * from "./pilotVehicle";
export * from "./gamble";
export * from "./deck";

export const PlayerSpellSubtypeSchemas = {
  default: PlayerSpellDefaultSchema,
  gift: PlayerSpellGiftSchema,
  dance: PlayerSpellDanceSchema,
  therioform: PlayerSpellTherioformSchema,
  magichant: PlayerSpellMagichantSchema,
  symbol: PlayerSpellSymbolSchema,
  invocation: PlayerSpellInvocationSchema,
  arcanist: PlayerSpellArcanistSchema,
  "arcanist-rework": PlayerSpellArcanistReworkSchema,
  "tinkerer-alchemy": PlayerSpellTinkererAlchemySchema,
  "tinkerer-infusion": PlayerSpellTinkererInfusionSchema,
  "tinkerer-magitech": PlayerSpellMagitechSchema,
  cooking: PlayerSpellCookingSchema,
  magiseed: PlayerSpellMagiseedSchema,
  "pilot-vehicle": PlayerSpellPilotVehicleSchema,
  gamble: PlayerSpellGambleSchema,
  deck: PlayerSpellDeckSchema,
} as const;

export const PlayerSpellSchema = z.union(
  Object.values(PlayerSpellSubtypeSchemas) as [
    (typeof PlayerSpellSubtypeSchemas)[keyof typeof PlayerSpellSubtypeSchemas],
    ...(typeof PlayerSpellSubtypeSchemas)[keyof typeof PlayerSpellSubtypeSchemas][],
  ],
);

export type PlayerSpell = z.infer<typeof PlayerSpellSchema>;
