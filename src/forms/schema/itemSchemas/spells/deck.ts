import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const CardSchema = z.object({
  type: z.literal("card"),
  suit: z.string(),
  value: z.number().int(),
  isJoker: z.boolean().default(false),
});

const SuitConfigurationSchema = z.record(z.string(), z.string());

export const PlayerSpellDeckSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("deck"),
  spellName: z.string().default("Ace of Cards Deck"),
  suitConfiguration: SuitConfigurationSchema.default({
    Air: "air",
    Earth: "earth",
    Fire: "fire",
    Ice: "ice",
  }),
  cardsInDeck: z.number().int().default(30),
  hand: z.array(CardSchema).default([]),
  discardPile: z.array(CardSchema).default([]),
});
