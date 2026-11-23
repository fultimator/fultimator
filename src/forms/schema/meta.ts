import { z } from "zod";

export const MetaSchema = z.object({
  book: z.string().default(""),
  page: z.number().optional(),
  bookName: z.string().optional(),
  isOfficial: z.boolean().default(false),
});

export type Meta = z.infer<typeof MetaSchema>;
