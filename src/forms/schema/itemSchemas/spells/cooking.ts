import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const CookbookEffectSchema = z.object({
  taste1: z.string().default(""),
  taste2: z.string().default(""),
  effect: z.string().default(""),
  customChoices: z.record(z.string(), z.unknown()).default({}),
});

const IngredientSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  quantity: z.number().int().default(1),
  taste: z.string().default(""),
});

export const PlayerSpellCookingSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("cooking"),
  spellName: z.string().default("Cookbook"),
  cookbookEffects: z
    .union([
      z.array(CookbookEffectSchema),
      z.record(z.string(), CookbookEffectSchema),
    ])
    .default([]),
  ingredientInventory: z.array(IngredientSchema).default([]),
});
