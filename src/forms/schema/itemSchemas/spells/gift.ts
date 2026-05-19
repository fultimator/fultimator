import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const GiftItemSchema = z.object({
  name: z.string(),
  customName: z.string().default(""),
  event: z.string().default(""),
  effect: z.string().default(""),
});

export const PlayerSpellGiftSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("gift"),
  clock: z.number().int().default(0),
  gifts: z.array(GiftItemSchema).default([]),
});
