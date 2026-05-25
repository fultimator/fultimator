import { z } from "zod";

export const ConsumableSchema = z.object({
  fuid: z.string().optional(),
  name: z.string(),
  description: z.string().default(""),
  ipCost: z.number().int().default(0),
});

export type Consumable = z.infer<typeof ConsumableSchema>;
