import { z } from "zod";

export const ClockDefinitionSchema = z.object({
  sections: z.number().int().min(2).max(12),
});
export type ClockDefinition = z.infer<typeof ClockDefinitionSchema>;

export const ClockStateSchema = z.object({
  sections: z.number().int().min(2).max(12),
  state: z.array(z.boolean()),
});
export type ClockState = z.infer<typeof ClockStateSchema>;

export function emptyClockState(sections: number): ClockState {
  return { sections, state: new Array(sections).fill(false) };
}
