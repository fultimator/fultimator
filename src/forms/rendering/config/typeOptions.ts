import types from "../../../libs/types";
import type { SelectOption } from "../fieldRenderers";

export const typeOptions: SelectOption[] = Object.entries(
  types as Record<string, { long: string }>,
).map(([key, val]) => ({ value: key, label: val.long }));
