import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Clear } from "@mui/icons-material";
import CustomTextarea from "../../components/common/CustomTextarea";
import ChangeCustomizations from "../../routes/equip/customWeapons/ChangeCustomizations";
import ChangeAccuracyCheck from "../../routes/equip/customWeapons/ChangeAccuracyCheck";
import SlotTierPicker from "../../components/player/equipment/technospheres/SlotTierPicker";
import SlotEditor from "../../components/player/equipment/technospheres/SlotEditor";
import { TypeIcon } from "../../components/types";
import { useTranslate } from "../../translation/translate";
import type { FieldRendererProps } from "./fieldRendererProps";

// Typed wrapper for untyped JSX components.
interface ChangeAccuracyCheckProps {
  value: { att1: string; att2: string };
  onChange: (v: { att1: string; att2: string }) => void;
  disabled?: boolean;
}

interface ChangeCustomizationsProps {
  selectedCustomization: string;
  setSelectedCustomization: (v: string) => void;
  onCustomizationAdd: (custom: unknown) => void;
  onCustomizationRemove: (name: string) => void;
  currentCustomizations: unknown[];
  selectedCategory: string;
  isSecondForm: boolean;
  rareAccuracyBonus: boolean;
}
interface SlotTierPickerProps {
  value: string;
  onChange: (tier: string) => void;
  isWeapon: boolean;
  isIntegrated: boolean;
}
interface SlotEditorProps {
  item: unknown;
  onChange: (updated: unknown) => void;
  player: unknown;
  isWeapon: boolean;
  onAddToBank: unknown;
}

const TypedChangeAccuracyCheck =
  ChangeAccuracyCheck as React.ComponentType<ChangeAccuracyCheckProps>;

const TypedChangeCustomizations =
  ChangeCustomizations as React.ComponentType<ChangeCustomizationsProps>;
const TypedSlotTierPicker =
  SlotTierPicker as React.ComponentType<SlotTierPickerProps>;
const TypedSlotEditor = SlotEditor as React.ComponentType<SlotEditorProps>;

// Shared select option shapes.
export interface SelectOption {
  value: string | number;
  label: string;
}
export interface SelectGroup {
  header: string;
  options: SelectOption[];
}

export function TextRenderer({
  label,
  value,
  onCommit,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  return (
    <TextField
      label={t(label)}
      value={(value as string) ?? ""}
      onChange={(e) => onCommit(e.target.value)}
      disabled={disabled}
      fullWidth
      variant="standard"
    />
  );
}

export function CustomTextareaRenderer({
  label,
  value,
  onCommit,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  return (
    <CustomTextarea
      label={t(label)}
      value={(value as string) ?? ""}
      onChange={(e) => onCommit(e.target.value)}
      readOnly={disabled}
    />
  );
}

// Number input with sign-based color.
export function NumberRenderer({ label, value, onCommit }: FieldRendererProps) {
  const { t } = useTranslate();
  const n = (value as number) ?? 0;
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        label={t(label)}
        value={n}
        onChange={(e) => onCommit(Number(e.target.value))}
        type="number"
        color={n > 0 ? "success" : n < 0 ? "error" : "primary"}
        focused={n !== 0}
      />
    </FormControl>
  );
}

export function CheckboxRenderer({
  label,
  value,
  onCommit,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={(value as boolean) ?? false}
          onChange={(e) => onCommit(e.target.checked)}
          disabled={disabled}
        />
      }
      label={t(label)}
    />
  );
}

// Flat select renderer.
export function SelectRenderer({
  label,
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const options = (componentProps?.options as SelectOption[]) ?? [];
  const disabled = (componentProps?.disabled as boolean) ?? false;
  const labelId = `select-${label}`;
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <Select
        labelId={labelId}
        value={(value as string | number) ?? ""}
        label={t(label)}
        onChange={(e) => onCommit(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {t(opt.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// Grouped select renderer with optional clear button.
export function GroupedSelectRenderer({
  label,
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const groups = (componentProps?.groups as SelectGroup[]) ?? [];
  const allowClear = (componentProps?.allowClear as boolean) ?? false;
  const current = (value as string) ?? "";
  const labelId = `grouped-select-${label}`;
  const items: React.ReactNode[] = [];
  for (const group of groups) {
    items.push(
      <ListSubheader key={group.header}>{t(group.header)}</ListSubheader>,
    );
    for (const opt of group.options) {
      items.push(
        <MenuItem key={opt.value} value={opt.value}>
          {t(opt.label)}
        </MenuItem>,
      );
    }
  }
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <Select
        labelId={labelId}
        value={current}
        label={t(label)}
        onChange={(e) => onCommit(e.target.value)}
        endAdornment={
          allowClear && current ? (
            <InputAdornment position="end" sx={{ mr: 2 }}>
              <IconButton size="small" onClick={() => onCommit("")}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
      >
        {items}
      </Select>
    </FormControl>
  );
}

// Damage/element type select with icons.
export function TypeSelectRenderer({
  label,
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const options = (componentProps?.options as SelectOption[]) ?? [];
  const labelId = `type-select-${label}`;
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <Select
        labelId={labelId}
        value={(value as string) ?? ""}
        label={t(label)}
        onChange={(e) => onCommit(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{ display: "flex", alignItems: "center", paddingY: "6px" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 70 }}>
              <TypeIcon type={opt.value as string} disabled={false} />
              <ListItemText
                sx={{ ml: 1, marginBottom: 0, textTransform: "capitalize" }}
              >
                {t(opt.label)}
              </ListItemText>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const ATTRIBUTE_OPTIONS = ["dexterity", "insight", "might", "will"] as const;
const ATTRIBUTE_LABELS: Record<string, string> = {
  dexterity: "DEX",
  insight: "INS",
  might: "MIG",
  will: "WLP",
};

// Free-pick pair of attribute selects for override accuracy. Value is {attr1, attr2}.
export function AccuracyAttrPairRenderer({
  value,
  onCommit,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const v = (value as { attr1: string; attr2: string } | undefined) ?? {
    attr1: "dexterity",
    attr2: "insight",
  };
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="override-acc-attr1">{t("Attribute 1")}</InputLabel>
          <Select
            labelId="override-acc-attr1"
            value={v.attr1}
            label={t("Attribute 1")}
            onChange={(e) => onCommit({ ...v, attr1: e.target.value })}
          >
            {ATTRIBUTE_OPTIONS.map((attr) => (
              <MenuItem key={`attr1-${attr}`} value={attr}>
                {ATTRIBUTE_LABELS[attr] ?? attr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="override-acc-attr2">{t("Attribute 2")}</InputLabel>
          <Select
            labelId="override-acc-attr2"
            value={v.attr2}
            label={t("Attribute 2")}
            onChange={(e) => onCommit({ ...v, attr2: e.target.value })}
          >
            {ATTRIBUTE_OPTIONS.map((attr) => (
              <MenuItem key={`attr2-${attr}`} value={attr}>
                {ATTRIBUTE_LABELS[attr] ?? attr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}

// Accuracy check picker. Form state canonical shape is {attr1, attr2}.
// ChangeAccuracyCheck still uses legacy {att1, att2}; bridge it here.
export function AccuracyCheckRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const v = value as { attr1: string; attr2: string } | undefined;
  const bridged = {
    att1: v?.attr1 ?? "dexterity",
    att2: v?.attr2 ?? "insight",
  };
  return (
    <TypedChangeAccuracyCheck
      value={bridged}
      onChange={(next: { att1: string; att2: string }) =>
        onCommit({ attr1: next.att1, attr2: next.att2 })
      }
      disabled={(componentProps?.disabled as boolean) ?? false}
    />
  );
}

export function ReadonlyNumberRenderer({ label, value }: FieldRendererProps) {
  const { t } = useTranslate();
  return (
    <TextField
      label={t(label)}
      value={(value as number) ?? 0}
      slotProps={{ input: { readOnly: true } }}
      fullWidth
      variant="standard"
    />
  );
}

export function CustomizationListRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const [selectedCustomization, setSelectedCustomization] = useState("");
  const current = (value as unknown[]) ?? [];
  const selectedCategory = (componentProps?.selectedCategory as string) ?? "";
  const isSecondForm = (componentProps?.isSecondForm as boolean) ?? false;
  const rareAccuracyBonus =
    (componentProps?.rareAccuracyBonus as boolean) ?? false;

  return (
    <TypedChangeCustomizations
      selectedCustomization={selectedCustomization}
      setSelectedCustomization={setSelectedCustomization}
      onCustomizationAdd={(custom) => onCommit([...current, custom])}
      onCustomizationRemove={(name) =>
        onCommit(current.filter((c) => (c as { name: string }).name !== name))
      }
      currentCustomizations={current}
      selectedCategory={selectedCategory}
      isSecondForm={isSecondForm}
      rareAccuracyBonus={rareAccuracyBonus}
    />
  );
}

export function SlotTierPickerRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const player = componentProps?.player as
    | { settings?: { optionalRules?: { technospheresVariant?: string } } }
    | undefined;
  const variant = player?.settings?.optionalRules?.technospheresVariant;
  const derivedIsIntegrated =
    variant === "integrated" || variant === "hoplospheres";
  const isIntegrated =
    (componentProps?.isIntegrated as boolean | undefined) ??
    derivedIsIntegrated;

  return (
    <TypedSlotTierPicker
      value={(value as string) ?? "alpha"}
      onChange={(tier) => onCommit(tier)}
      isWeapon={(componentProps?.isWeapon as boolean) ?? true}
      isIntegrated={isIntegrated}
    />
  );
}

export function RareBonusBlockRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const v = (value as {
    precBonus: boolean;
    damageBonus: boolean;
    damageReworkBonus: boolean;
  }) ?? {
    precBonus: false,
    damageBonus: false,
    damageReworkBonus: false,
  };
  const rework = (componentProps?.rework as boolean) ?? false;
  const totalBonus = (componentProps?.totalBonus as number) ?? 0;
  const basePrec = (componentProps?.basePrec as number) ?? 0;

  const emit = (patch: Partial<typeof v>) => onCommit({ ...v, ...patch });

  return (
    <FormControl variant="outlined" fullWidth>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={v.precBonus}
                onChange={(e) => emit({ precBonus: e.target.checked })}
                disabled={
                  (rework && basePrec >= 2) || (!rework && basePrec >= 1)
                }
              />
            }
            label={`+1 ${t("weapon.rare.accuracyBonus.label")} (+100z)`}
          />
        </Grid>
        {!rework && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={v.damageBonus}
                  onChange={(e) => emit({ damageBonus: e.target.checked })}
                />
              }
              label={`+4 ${t("weapon.rare.damageBonus.label")} (+200z)`}
            />
          </Grid>
        )}
        {rework && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={v.damageReworkBonus}
                  onChange={(e) =>
                    emit({ damageReworkBonus: e.target.checked })
                  }
                />
              }
              label={`+${totalBonus} ${t("weapon.rare.damageReworkBonus.label")}`}
            />
          </Grid>
        )}
      </Grid>
    </FormControl>
  );
}

export function SlotEditorRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const slots = componentProps?.slots as string | undefined;
  const item = { slots, slotted: (value as unknown[]) ?? [] };
  return (
    <TypedSlotEditor
      item={item}
      onChange={(updated) =>
        onCommit((updated as { slotted: unknown[] }).slotted)
      }
      player={componentProps?.player}
      isWeapon={(componentProps?.isWeapon as boolean) ?? true}
      onAddToBank={componentProps?.onAddToBank as unknown}
    />
  );
}
