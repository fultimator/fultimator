import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableFrames } from "../../../../../../libs/pilotVehicleData";

export type PilotVehicleItemState = {
  customName: string;
  frame: string;
  description?: string;
  enabled?: boolean;
  maxEnabledModules?: number;
  behaviors?: unknown[];
};

const frameOptions = (availableFrames as { name: string }[]).map((f) => ({
  value: f.name,
  label: f.name,
}));

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const pilotVehicleItemFields: ItemFieldConfig<PilotVehicleItemState> = [
  {
    key: "customName",
    kind: "editable",
    label: "shared.name",
    component: "text",
    defaultValue: "",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 6 },
  },
  {
    key: "frame",
    kind: "editable",
    label: "pilot.frame",
    component: "select",
    defaultValue: "pilot_frame_exoskeleton",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 6 },
    componentProps: { options: frameOptions },
  },
  {
    key: "maxEnabledModules",
    kind: "editable",
    label: "pilot.maxEnabledModules",
    component: "number",
    defaultValue: 3,
    group: "",
    order: 2,
    gridSize: { xs: 12, sm: 4 },
    parse: (v) => Number(v) || 3,
  },
  {
    key: "description",
    kind: "editable",
    label: "shared.description",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 3,
    fullWidth: true,
  },
  behaviorsTabField,
];
