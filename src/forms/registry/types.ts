import type { ReactNode } from "react";
import type { ZodType } from "zod";
import type {
  CompendiumItem,
  CompendiumItemType,
} from "../../types/CompendiumPack";
import type { TabDefinition } from "../rendering/config/fieldConfig";

export interface FormContext {
  compendiumClasses: CompendiumItem[];
  compendiumItems: CompendiumItem[];
  affinityOptions: Array<{ value: string; label: string }>;
}

type PayloadBuilder<TState, TPayload> = (
  state: TState,
  context: FormContext,
) => TPayload | null;

export interface ItemSubtypeDefinition<TState = unknown, TPayload = unknown> {
  schema: ZodType<TPayload>;
  defaultState?: () => TState;
  buildPayload?: PayloadBuilder<TState, TPayload>;
}

export interface ItemFormDefinition<TState = unknown, TPayload = unknown> {
  key: CompendiumItemType;
  label: string;
  implementation: "schema-config" | "quick-create-panel";
  schema?: ZodType<TPayload>;
  defaultState?: () => TState;
  fields?: unknown;
  tabs?: TabDefinition[];
  buildPayload?: PayloadBuilder<TState, TPayload>;
  discriminatorKey?: string;
  subtypeDefinitions?: Record<string, ItemSubtypeDefinition<TState, TPayload>>;
  preview?: (payload: TPayload | null) => ReactNode;
  addItemType: CompendiumItemType;
  exportDataType: string;
}
