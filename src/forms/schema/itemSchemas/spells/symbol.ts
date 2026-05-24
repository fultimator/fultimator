import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const SymbolItemSchema = z.object({
  key: z.string(),
  customName: z.string().default(""),
  effect: z.string().default(""),
});

export const PlayerSpellSymbolSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("symbol"),
  symbols: z.array(SymbolItemSchema).default([]),
});
