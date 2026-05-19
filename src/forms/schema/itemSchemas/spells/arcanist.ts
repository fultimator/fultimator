import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const ArcanistBaseFields = {
  description: z.string().default(""),
  domain: z.string().default(""),
  domainDesc: z.string().default(""),
  merge: z.string().default(""),
  mergeDesc: z.string().default(""),
  dismiss: z.string().default(""),
  dismissDesc: z.string().default(""),
};

export const PlayerSpellArcanistSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("arcanist"),
  ...ArcanistBaseFields,
});

export const PlayerSpellArcanistReworkSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("arcanist-rework"),
    ...ArcanistBaseFields,
    pulse: z.string().default(""),
    pulseDesc: z.string().default(""),
  });
