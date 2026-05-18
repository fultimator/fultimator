import type { ZodType, ZodTypeAny } from "zod";
import type { ItemFieldConfig } from "../rendering/config/fieldConfig";

export function createDefaultStateFromFields<
  TState extends Record<string, unknown>,
>(fields: ItemFieldConfig<TState>): TState {
  const acc: Record<string, unknown> = {};
  for (const field of fields) {
    if (!("defaultValue" in field)) continue;
    if (field.key.includes(".")) {
      const parts = field.key.split(".");
      let cursor = acc;
      for (let i = 0; i < parts.length - 1; i++) {
        if (cursor[parts[i]] == null || typeof cursor[parts[i]] !== "object") {
          cursor[parts[i]] = {};
        }
        cursor = cursor[parts[i]] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1]] = field.defaultValue;
    } else {
      acc[field.key] = field.defaultValue;
    }
  }
  return acc as TState;
}

export function createSchemaPayloadBuilder<TState, TPayload>(
  schema: ZodType<TPayload>,
) {
  return (state: TState): TPayload | null => {
    const parsed = schema.safeParse(state);
    return parsed.success ? parsed.data : null;
  };
}

export function createSubtypePayloadBuilder<
  TSchemas extends Record<string, ZodTypeAny>,
>(
  discriminatorKey: string,
  subtypeSchemas: TSchemas,
) {
  return (state: unknown): ReturnType<TSchemas[keyof TSchemas]["parse"]> | null => {
    const rawSubtype =
      state && typeof state === "object"
        ? (state as Record<string, unknown>)[discriminatorKey]
        : undefined;
    const subtype = typeof rawSubtype === "string" ? rawSubtype : "";
    const schema = subtypeSchemas[subtype as keyof TSchemas];
    if (!schema) return null;
    const parsed = schema.safeParse(state);
    return parsed.success ? parsed.data : null;
  };
}
