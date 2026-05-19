import { z } from "zod";

export const PlayerSpellTypeSchema = z.enum([
  "default",
  "gift",
  "dance",
  "therioform",
  "magichant",
  "symbol",
  "invocation",
  "arcanist",
  "arcanist-rework",
  "tinkerer-alchemy",
  "tinkerer-infusion",
  "tinkerer-magitech",
  "cooking",
  "magiseed",
  "pilot-vehicle",
  "gamble",
  "deck",
]);

