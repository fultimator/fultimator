import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import {
  vehicleModuleFieldConfig,
  type VehicleModuleFormState,
} from "../../vehicleModule";

export type PilotModuleItemState = VehicleModuleFormState & {
  behaviors?: unknown[];
};

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const isCustomModule = (s: PilotModuleItemState) =>
  s.name === "pilot_custom_armor" ||
  s.name === "pilot_custom_weapon" ||
  s.name === "pilot_custom_support";

export const pilotModuleItemFields: ItemFieldConfig<PilotModuleItemState> = [
  ...(vehicleModuleFieldConfig as ItemFieldConfig<PilotModuleItemState>),
  behaviorsTabField,
];
