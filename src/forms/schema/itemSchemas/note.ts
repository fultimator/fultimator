import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string().optional(),
  fuid: z.string().optional(),
  name: z.string(),
  description: z.string().default(""),
  effect: z.string().optional(),
});

export type Note = z.infer<typeof NoteSchema>;
