import { z } from "zod";

export const ResourceTrackSchema = z.object({
  enabled: z.boolean().default(false),
  name: z.string().default(""),
  current: z.number().int().min(0).default(0),
  step: z.number().int().min(1).default(1),
  max: z.number().int().min(0).default(0),
  maxScalesWithLevel: z.boolean().default(false),
  maxLevelBonus: z.number().int().default(0),
});

export type ResourceTrack = z.infer<typeof ResourceTrackSchema>;

export function emptyResourceTrack(): ResourceTrack {
  return {
    enabled: false,
    name: "",
    current: 0,
    step: 1,
    max: 0,
    maxScalesWithLevel: false,
    maxLevelBonus: 0,
  };
}

export function resolveResourceMax(
  track: ResourceTrack,
  skillLevel: number,
): number {
  if (track.maxScalesWithLevel) {
    return Math.max(0, skillLevel + track.maxLevelBonus);
  }
  return track.max;
}
