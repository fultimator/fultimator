import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

export const PlayerSpellMagitechSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("tinkerer-magitech"),
  rank: z.number().int().min(1).max(3).default(1),
  magispheres: z.array(z.unknown()).default([]),
});
