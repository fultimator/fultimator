import type { ReactNode } from "react";
import type { ZodType } from "zod";
import type { CompendiumItem, CompendiumItemType } from "../../types/CompendiumPack";

export interface FormContext {
  compendiumClasses: CompendiumItem[];
  compendiumItems: CompendiumItem[];
  affinityOptions: Array<{ value: string; label: string }>;
}

type PayloadBuilder<TState, TPayload> = (
  state: TState,
  context: FormContext,
) => TPayload | null;

export interface ItemFormDefinition<TState = unknown, TPayload = unknown> {
  key: CompendiumItemType;
  label: string;
  implementation: "schema-config" | "quick-create-panel";
  schema?: ZodType<TPayload>;
  defaultState?: () => TState;
  fields?: unknown;
  buildPayload?: PayloadBuilder<TState, TPayload>;
  preview?: (payload: TPayload | null) => ReactNode;
  addItemType: CompendiumItemType;
  exportDataType: string;
}
