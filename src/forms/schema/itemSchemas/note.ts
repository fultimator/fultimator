import { z } from "zod";

export const NoteSchema = z.object({
  fuid: z.string().optional(),
  name: z.string(),
  description: z.string().default(""),
});

export type Note = z.infer<typeof NoteSchema>;
