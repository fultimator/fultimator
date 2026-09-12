import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

export const PlayerSpellTinkererAlchemySchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("tinkerer-alchemy"),
    category: z.string().optional(),
  });
export const PlayerSpellTinkererInfusionSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("tinkerer-infusion"),
    infusionRank: z.number().int().optional(),
  });
