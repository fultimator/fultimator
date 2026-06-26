import { z } from "zod";

export const ItemSchema = z.object({
  fuid: z.string().optional(),
  name: z.string(),
  description: z.string().default(""),
  value: z.number().int().default(0),
  quantity: z.number().int().default(0),
});

export type Item = z.infer<typeof ItemSchema>;
