import type { ZodType } from "zod";
import type { ItemFieldConfig } from "../rendering/config/fieldConfig";

export function createDefaultStateFromFields<TState extends Record<string, unknown>>(
  fields: ItemFieldConfig<TState>,
): TState {
  return fields.reduce((acc, field) => {
    if ("defaultValue" in field) {
      acc[field.key] = field.defaultValue;
    }
    return acc;
  }, {} as Record<string, unknown>) as TState;
}

export function createSchemaPayloadBuilder<TState, TPayload>(
  schema: ZodType<TPayload>,
) {
  return (state: TState): TPayload | null => {
    const parsed = schema.safeParse(state);
    return parsed.success ? parsed.data : null;
  };
}
