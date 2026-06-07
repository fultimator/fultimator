import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  makePassivesTabField,
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { SPELL_SUBITEM_SCOPED_KEYS } from "../../../shared/itemScopedKeys";
import {
  vehicleModuleFieldConfig,
  type VehicleModuleFormState,
} from "../../vehicleModule";

export type PilotModuleItemState = VehicleModuleFormState & {
  passives?: unknown[];
  behaviors?: unknown[];
};

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const isCustomModule = (s: PilotModuleItemState) =>
  s.name === "pilot_custom_armor" ||
  s.name === "pilot_custom_weapon" ||
  s.name === "pilot_custom_support";

export const pilotModuleItemFields: ItemFieldConfig<PilotModuleItemState> = [
  ...(vehicleModuleFieldConfig as ItemFieldConfig<PilotModuleItemState>),
  makePassivesTabField((outerState) =>
    isCustomModule(outerState as PilotModuleItemState)
      ? SPELL_SUBITEM_SCOPED_KEYS.pilotModule
      : [],
  ),
  behaviorsTabField,
];
