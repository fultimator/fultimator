import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Clear, Search } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Martial,
  MartialOutline,
  OffensiveSpellIcon,
} from "../../components/icons";
import FuidField from "../../components/common/FuidField";
import CustomTextarea from "../../components/common/CustomTextarea";
import ChangeCustomizations from "../../routes/equip/customWeapons/ChangeCustomizations";
import ChangeAccuracyCheck from "../../routes/equip/customWeapons/ChangeAccuracyCheck";
import SlotTierPicker from "/src/libs/player/SlotTierPicker.jsx";
import SlotEditor from "/src/libs/player/SlotEditor.jsx";
import { TypeIcon, TypeName } from "../../components/types";
import { useTranslate } from "../../translation/translate";
import type { FieldRendererProps } from "./fieldRendererProps";
import type { GroupLabels } from "./config/fieldConfig";
import { affinityStrToNum, affinityNumToStr } from "./npcAffinityUtils";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";

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

const UNIFORM_SELECT_SX = {
  "& .MuiSelect-select": {
    minHeight: "unset !important",
    paddingTop: "8.5px",
    paddingBottom: "8.5px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
};

function humanizeToken(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text
    .replace(/[.\-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function translateOrHumanize(
  t: (key: string, skipLoad?: boolean) => string,
  label: unknown,
): string {
  const key = String(label ?? "");
  if (!key) return "";
  const translated = t(key);
  if (!translated || translated === key) {
    return humanizeToken(label);
  }
  return translated;
}

export function FuidRenderer({
  label,
  value,
  onCommit,
  componentProps,
  disabled,
}: FieldRendererProps) {
  const name = (componentProps?.name as string) ?? "";
  const onBrowse = componentProps?.onBrowse as (() => void) | undefined;
  return (
    <FuidField
      value={value as string | undefined}
      name={name}
      label={label}
      onChange={(v) => onCommit(v)}
      onBrowse={onBrowse}
      disabled={disabled}
      autoSync
    />
  );
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
      variant="outlined"
      size="small"
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

// Number input with sign-based color and scroll-wheel stepping.
export function NumberRenderer({ label, value, onCommit }: FieldRendererProps) {
  const { t } = useTranslate();
  const n = (value as number) ?? 0;
  const nRef = useRef(n);
  nRef.current = n;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (document.activeElement !== el) return;
      e.preventDefault();
      e.stopPropagation();
      onCommit(nRef.current + (e.deltaY < 0 ? 1 : -1));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [onCommit]);

  return (
    <FormControl fullWidth size="small">
      <TextField
        inputRef={inputRef}
        label={t(label)}
        value={n}
        onChange={(e) => onCommit(Number(e.target.value))}
        type="number"
        variant="outlined"
        size="small"
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

export function MartialToggleRenderer({
  value,
  onCommit,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const active = (value as boolean) ?? false;
  return (
    <Tooltip title={t("Martial")} placement="top">
      <span>
        <IconButton
          onClick={() => onCommit(!active)}
          disabled={disabled}
          color={active ? "secondary" : "default"}
          sx={{
            border: "1px solid",
            borderColor: active ? "secondary.main" : "divider",
            borderRadius: 1,
            width: 40,
            height: 40,
            "& svg": { width: 20, height: 20 },
          }}
        >
          {active ? <Martial /> : <MartialOutline />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function OffensiveToggleRenderer({
  value,
  onCommit,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const active = (value as boolean) ?? false;
  return (
    <Tooltip title={t("Offensive")} placement="top">
      <span>
        <IconButton
          onClick={() => onCommit(!active)}
          disabled={disabled}
          color={active ? "secondary" : "default"}
          sx={{
            border: "1px solid",
            borderColor: active ? "secondary.main" : "divider",
            borderRadius: 1,
            width: 40,
            height: 40,
            "& svg": { width: 20, height: 20 },
          }}
        >
          <OffensiveSpellIcon />
        </IconButton>
      </span>
    </Tooltip>
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
  const multiple = (componentProps?.multiple as boolean) ?? false;
  const onBrowse = componentProps?.onBrowse as (() => void) | undefined;
  const labelId = `select-${label}`;

  const normalizedValue = multiple
    ? ((value as string[]) ?? [])
    : ((value as string | number) ?? "");
  const labelForValue = (selected: string | number) =>
    translateOrHumanize(
      t,
      String(options.find((opt) => opt.value === selected)?.label ?? selected),
    );

  return (
    <FormControl variant="outlined" fullWidth size="small">
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <Select
        labelId={labelId}
        value={normalizedValue}
        label={t(label)}
        sx={UNIFORM_SELECT_SX}
        multiple={multiple}
        onChange={(e) => onCommit(e.target.value)}
        disabled={disabled}
        renderValue={(selected) => {
          if (Array.isArray(selected)) {
            return selected.map((entry) => labelForValue(entry)).join(", ");
          }
          return labelForValue(selected as string | number);
        }}
        startAdornment={
          onBrowse ? (
            <InputAdornment position="start">
              <IconButton
                size="small"
                edge="start"
                onClick={(e) => {
                  e.stopPropagation();
                  onBrowse();
                }}
              >
                <Search fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {multiple && (
              <Checkbox
                checked={
                  Array.isArray(normalizedValue) &&
                  normalizedValue.includes(opt.value as string)
                }
                size="small"
                sx={{ p: 0, mr: 1 }}
              />
            )}
            {multiple ? <ListItemText primary={t(opt.label)} /> : t(opt.label)}
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
  const onBrowse = componentProps?.onBrowse as (() => void) | undefined;

  return (
    <FormControl variant="outlined" fullWidth size="small">
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <Select
        labelId={labelId}
        value={current}
        label={t(label)}
        sx={UNIFORM_SELECT_SX}
        onChange={(e) => onCommit(e.target.value)}
        startAdornment={
          onBrowse ? (
            <InputAdornment position="start">
              <IconButton
                size="small"
                edge="start"
                onClick={(e) => {
                  e.stopPropagation();
                  onBrowse();
                }}
              >
                <Search fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
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
  const DAMAGE_TYPE_ALIASES: Record<string, string> = { wind: "air" };
  const raw = (value as string) ?? "";
  const current = DAMAGE_TYPE_ALIASES[raw] ?? raw;
  return (
    <FormControl variant="outlined" fullWidth size="small">
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <Select
        labelId={labelId}
        value={current}
        label={t(label)}
        sx={UNIFORM_SELECT_SX}
        onChange={(e) =>
          onCommit(DAMAGE_TYPE_ALIASES[e.target.value] ?? e.target.value)
        }
        renderValue={(v) => {
          const opt = options.find((o) => o.value === v);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TypeIcon type={v as string} disabled={false} />
              <span style={{ textTransform: "capitalize" }}>
                {opt ? t(opt.label) : v}
              </span>
            </Box>
          );
        }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TypeIcon type={opt.value as string} disabled={false} />
            <ListItemText sx={{ marginBottom: 0, textTransform: "capitalize" }}>
              {t(opt.label)}
            </ListItemText>
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
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl variant="outlined" fullWidth size="small">
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
        <FormControl variant="outlined" fullWidth size="small">
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
    </Grid>
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
      variant="outlined"
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
                checked={!!v.precBonus}
                onChange={(e) => emit({ precBonus: e.target.checked })}
                disabled={
                  (rework && basePrec >= 2) || (!rework && basePrec >= 1)
                }
              />
            }
            label={`+1 ${t("shared.modifiers.accuracy")} (+100z)`}
          />
        </Grid>
        {!rework && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!v.damageBonus}
                  onChange={(e) => emit({ damageBonus: e.target.checked })}
                />
              }
              label={`+4 ${t("shared.modifiers.damage")} (+200z)`}
            />
          </Grid>
        )}
        {rework && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!v.damageReworkBonus}
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

// NPC-specific renderers

// Attribute slider (d6-d12, step 2). componentProps: { label: string }
// The label is shown inline as a short tag (DEX / INS / MIG / WLP).
export function NpcAttrSliderRenderer({
  label,
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const min = (componentProps?.min as number) ?? 6;
  const max = (componentProps?.max as number) ?? 12;
  const step = (componentProps?.step as number) ?? 2;
  const showMarks = (componentProps?.showMarks as boolean) ?? false;
  const marks = showMarks
    ? [
        { value: 6, label: "d6" },
        { value: 8, label: "d8" },
        { value: 10, label: "d10" },
        { value: 12, label: "d12" },
      ]
    : true;

  return (
    <Grid container spacing={1} sx={{ pr: 2, alignItems: "center" }}>
      <Grid size={2}>
        <InputLabel sx={{ fontSize: "20px", fontWeight: 400 }}>
          {t(label)}
        </InputLabel>
      </Grid>
      <Grid size={10}>
        <FormControl variant="standard" fullWidth>
          <Slider
            marks={marks}
            min={min}
            max={max}
            step={step}
            size="medium"
            value={(value as number) ?? min}
            onChange={(_e, v) => onCommit(v)}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

// Affinity slider. value is the string key ("vu"|"rs"|"im"|"ab"|"").
// label is the element type key (e.g. "physical", "air") - used to show TypeIcon.
// componentProps: { showLabels?: boolean }
export function NpcAffinitySliderRenderer({
  label,
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const showLabels = (componentProps?.showLabels as boolean) ?? false;

  const marks = showLabels
    ? [
        { value: 0, label: t("Vulnerability", true) },
        { value: 1, label: " " },
        { value: 2, label: t("Resistance", true) },
        { value: 3, label: t("Immunity", true) },
        { value: 4, label: t("Absorption", true) },
      ]
    : true;

  const numValue = affinityStrToNum(value as string | undefined);
  // label is the element key ("Physical", "Air", etc.) - lower-case for TypeIcon
  const typeKey = label.toLowerCase();

  return (
    <Grid container spacing={1} sx={{ pr: 2, alignItems: "center" }}>
      <Grid size={3}>
        <InputLabel sx={{ fontSize: "20px", fontWeight: 400 }}>
          <TypeIcon type={typeKey} disabled={false} />{" "}
          <TypeName type={typeKey} />
        </InputLabel>
      </Grid>
      <Grid size={9}>
        <FormControl variant="standard" fullWidth>
          <Slider
            marks={marks}
            min={0}
            max={4}
            step={1}
            size="medium"
            value={numValue}
            onChange={(_e, v) => onCommit(affinityNumToStr(v as number))}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

// Armor or shield select. componentProps: { items: {name, martial?}[], label: string }
export function NpcArmorSelectRenderer({
  label,
  value,
  onCommit,
  componentProps,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const items =
    (componentProps?.items as { name: string; martial?: boolean }[]) ?? [];
  const currentName =
    (value as { name?: string } | undefined)?.name ?? items[0]?.name ?? "";

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>{t(label)}</InputLabel>
      <Select
        value={currentName}
        label={t(label)}
        onChange={(e) => {
          const found = items.find((i) => i.name === e.target.value);
          if (found) onCommit(found);
        }}
      >
        {items.map((item) => (
          <MenuItem key={item.name} value={item.name}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// Status immunities checkbox group.
// componentProps: { freeImmunities?: Record<string,boolean> }
// value is NpcImmunities record.
const IMMUNITY_KEYS = [
  "slow",
  "dazed",
  "weak",
  "shaken",
  "enraged",
  "poisoned",
] as const;

export function NpcImmunitiesRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const immunities = (value as Record<string, boolean>) ?? {};
  const freeImmunities =
    (componentProps?.freeImmunities as Record<string, boolean>) ?? {};

  const handleChange = (key: string, checked: boolean) => {
    onCommit({ ...immunities, [key]: checked });
  };

  return (
    <FormGroup>
      <FormLabel>{t("Immunities")}</FormLabel>
      {IMMUNITY_KEYS.map((key) => {
        const isFree = !!freeImmunities[key];
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={!!immunities[key]}
                onChange={(e) => handleChange(key, e.target.checked)}
                name={key}
              />
            }
            label={
              <Typography
                sx={{
                  color: isFree ? "success.main" : "inherit",
                  fontWeight: isFree ? "bold" : "inherit",
                }}
              >
                {t(key.charAt(0).toUpperCase() + key.slice(1), true)}
              </Typography>
            }
          />
        );
      })}
    </FormGroup>
  );
}

// Defense radio group (+def / +mDef pairs).
// value is { def: number, mDef: number }.
const DEFENSE_COMBOS = [
  { code: "00", def: 0, mDef: 0 },
  { code: "12", def: 1, mDef: 2 },
  { code: "21", def: 2, mDef: 1 },
  { code: "33", def: 3, mDef: 3 },
  { code: "24", def: 2, mDef: 4 },
  { code: "42", def: 4, mDef: 2 },
] as const;

function defenseCode(def?: number, mDef?: number): string {
  const match = DEFENSE_COMBOS.find((c) => c.def === def && c.mDef === mDef);
  return match?.code ?? "00";
}

// value is the full `extra` object. Commits a merged extra with updated def/mDef.
export function NpcDefenseRadioRenderer({
  value,
  onCommit,
  disabled,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const extra = (value as Record<string, unknown>) ?? {};
  const code = defenseCode(extra.def as number, extra.mDef as number);

  return (
    <FormControl disabled={disabled}>
      <FormLabel>{t("Defenses")}</FormLabel>
      <RadioGroup
        value={code}
        onChange={(e) => {
          const combo = DEFENSE_COMBOS.find((c) => c.code === e.target.value);
          if (combo) onCommit({ ...extra, def: combo.def, mDef: combo.mDef });
        }}
      >
        {DEFENSE_COMBOS.map((c) => (
          <FormControlLabel
            key={c.code}
            value={c.code}
            control={<Radio size="small" sx={{ py: 0.8 }} />}
            label={`+${c.def} ${t("DEF", true)} / +${c.mDef} ${t("M.DEF", true)}`}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

// Autocomplete renderer with optional free-solo entry.
// componentProps: { options: SelectOption[], freeSolo?: boolean, multiple?: boolean }
export function AutocompleteRenderer({
  label,
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const rawOptions = (componentProps?.options as unknown[]) ?? [];
  const options: SelectOption[] = rawOptions.map((entry) => {
    if (
      entry &&
      typeof entry === "object" &&
      "value" in (entry as Record<string, unknown>)
    ) {
      const opt = entry as SelectOption;
      return { value: opt.value, label: opt.label ?? String(opt.value) };
    }
    const val = String(entry ?? "");
    return { value: val, label: val };
  });
  const freeSolo = (componentProps?.freeSolo as boolean) ?? false;
  const noOptionsText = componentProps?.noOptionsText as string | undefined;
  const multiple =
    (componentProps?.multiple as boolean | undefined) ?? Array.isArray(value);
  const optionLabels = options.map((o) => o.value as string);
  const selectedMulti = Array.isArray(value) ? value : [];
  const selectedSingle =
    typeof value === "string" && value.trim().length > 0 ? value : null;

  if (noOptionsText !== undefined && options.length === 0) {
    return (
      <TextField
        label={t(label)}
        value=""
        disabled
        size="small"
        fullWidth
        helperText={noOptionsText}
      />
    );
  }

  // Cast needed: MUI Autocomplete freeSolo generic can't be satisfied with a
  // runtime boolean; the FreeSolo type param must be a literal true/false.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC = Autocomplete as any;
  return (
    <AC
      multiple={multiple}
      freeSolo={freeSolo}
      options={optionLabels}
      value={multiple ? selectedMulti : selectedSingle}
      onChange={(_: unknown, newValue: string[] | string | null) =>
        onCommit(
          multiple
            ? Array.isArray(newValue)
              ? newValue
              : []
            : (newValue ?? ""),
        )
      }
      getOptionLabel={(opt: string) => {
        const found = options.find((o) => o.value === opt);
        if (!found) return String(opt);
        // Raw-key options (label === value): show the key as-is in the input
        if (found.label === found.value) return found.value as string;
        return translateOrHumanize(t, found.label);
      }}
      renderOption={(props: object, opt: string) => {
        const found = options.find((o) => o.value === opt);
        const human = found ? translateOrHumanize(t, found.label) : String(opt);
        const isRaw = found && found.label === found.value;
        const { key, ...liProps } =
          props as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
        return (
          <li key={key} {...liProps}>
            {isRaw ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.2,
                }}
              >
                <span>{human}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.55 }}>{opt}</span>
              </Box>
            ) : (
              human
            )}
          </li>
        );
      }}
      renderInput={(params: object) => (
        <TextField {...(params as object)} label={t(label)} size="small" />
      )}
      size="small"
    />
  );
}

// Toggle-group renderer: a row of clickable chips for boolean or multi-boolean values.
// componentProps:
//   options: { key: string; label: string }[] - each entry maps to a key in the value object
//   color?: "primary" | "secondary"             - chip color when active (default "primary")
// value shape: Record<string, boolean>
export function ToggleGroupRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const options =
    (componentProps?.options as { key: string; label: string }[]) ?? [];
  const color = (componentProps?.color as "primary" | "secondary") ?? "primary";
  const current = (value as Record<string, boolean>) ?? {};

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {options.map(({ key, label }) => (
        <Chip
          key={key}
          label={t(label)}
          size="small"
          clickable
          color={current[key] ? color : "default"}
          variant={current[key] ? "filled" : "outlined"}
          onClick={() => onCommit({ ...current, [key]: !current[key] })}
        />
      ))}
    </Box>
  );
}

// Chip-multi-select renderer: a wrap row of chips where each toggles membership in a string[].
// componentProps:
//   options: { value: string; label: string }[]
//   color?: "primary" | "secondary"
// value shape: string[]
export function ChipMultiSelectRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const options =
    (componentProps?.options as { value: string; label: string }[]) ?? [];
  const color =
    (componentProps?.color as "primary" | "secondary") ?? "secondary";
  const selected = (value as string[]) ?? [];

  const toggle = (val: string) =>
    onCommit(
      selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val],
    );

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {options.map(({ value: val, label }) => (
        <Chip
          key={val}
          label={translateOrHumanize(t, label)}
          size="small"
          clickable
          color={selected.includes(val) ? color : "default"}
          variant={selected.includes(val) ? "filled" : "outlined"}
          onClick={() => toggle(val)}
        />
      ))}
    </Box>
  );
}

// Object-list renderer: a dynamic list of structured row objects, each rendered as a
// nested field group using a sub-config.
// componentProps:
//   fields: FieldConfig<TRow>[]              - field config for each row
//   itemDefaults: TRow                        - blank row template for new entries
//   fixedCount?: number                       - if set, rows are fixed (no add/remove)
//   addLabel?: string                         - label for the add button (default "Add")
//   rowLabel?: (row: TRow, i: number) => string - optional row heading
// value shape: TRow[]
export function ObjectListRenderer({
  value,
  onCommit,
  componentProps,
}: FieldRendererProps) {
  const { t } = useTranslate();
  const fields = useMemo(
    () =>
      (componentProps?.fields as import("./config/fieldConfig").ItemFieldConfig<
        Record<string, unknown>
      >) ?? [],
    [componentProps?.fields],
  );
  const itemDefaults =
    (componentProps?.itemDefaults as Record<string, unknown>) ?? {};
  const fixedCount = componentProps?.fixedCount as number | undefined;
  const addLabel = (componentProps?.addLabel as string) ?? "Add";
  const variant = (componentProps?.variant as string | undefined) ?? "";
  const rowLabel = componentProps?.rowLabel as
    | ((row: Record<string, unknown>, i: number) => string)
    | undefined;
  const renderNestedFields = componentProps?.renderNestedFields as
    | ((args: {
        config: import("./config/fieldConfig").ItemFieldConfig<
          Record<string, unknown>
        >;
        state: Record<string, unknown>;
        onChange: (next: Record<string, unknown>) => void;
        surface?: "quickCreate" | "create" | "edit";
        cols?: 1 | 2 | 3 | 4;
        group?: string;
        groupLabels?: GroupLabels;
      }) => React.ReactNode)
    | undefined;
  const nestedGroupLabels = componentProps?.groupLabels as
    | GroupLabels
    | undefined;

  const rows = useMemo(
    () => (value as Record<string, unknown>[]) ?? [],
    [value],
  );
  const isBehaviorCard = variant === "behavior-card";
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuRowIndex, setMenuRowIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    setExpandedRows((prev) => {
      const next: Record<number, boolean> = {};
      rows.forEach((_, i) => {
        next[i] = prev[i] ?? false;
      });
      return next;
    });
  }, [rows]);

  const updateRow = (i: number, next: Record<string, unknown>) => {
    const updated = rows.map((r, idx) => (idx === i ? next : r));
    onCommit(updated);
  };

  const addRow = () => {
    const nextIndex = rows.length;
    if (isBehaviorCard) {
      setExpandedRows((prev) => ({ ...prev, [nextIndex]: true }));
    }
    onCommit([...rows, { ...itemDefaults }]);
  };

  const removeRow = (i: number) => onCommit(rows.filter((_, idx) => idx !== i));
  const requestDeleteRow = (i: number) => setDeleteIndex(i);
  const confirmDeleteRow = () => {
    if (deleteIndex == null) return;
    removeRow(deleteIndex);
    setDeleteIndex(null);
  };
  const visibleGroupedFields = useMemo(() => {
    if (!isBehaviorCard) return null;
    const withoutFormState = fields.filter((f) => f.kind !== "form-state");
    const keys: string[] = [];
    for (const f of withoutFormState) {
      const g = f.group ?? "";
      if (!keys.includes(g)) keys.push(g);
    }
    return keys;
  }, [fields, isBehaviorCard]);
  const toggleExpanded = (i: number) =>
    setExpandedRows((prev) => ({ ...prev, [i]: !prev[i] }));
  const openMenu = (event: React.MouseEvent<HTMLElement>, rowIndex: number) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuRowIndex(rowIndex);
  };
  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuRowIndex(null);
  };
  const toggleEnabled = (i: number, checked: boolean) => {
    const row = rows[i] ?? {};
    updateRow(i, {
      ...row,
      disabled: !checked,
    });
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}
    >
      {rows.map((row, i) => (
        <Box
          key={i}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1.5,
          }}
        >
          {isBehaviorCard ? (
            <>
              <Box
                onClick={() => toggleExpanded(i)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  minHeight: 40,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, flexGrow: 1, overflow: "hidden" }}
                  noWrap
                >
                  {rowLabel ? rowLabel(row, i) : `Item ${i + 1}`}
                </Typography>
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Typography variant="caption" sx={{ mr: 0.5 }}>
                    {t("Enabled")}
                  </Typography>
                  <Checkbox
                    size="small"
                    checked={row.disabled !== true}
                    onChange={(e) => toggleEnabled(i, e.target.checked)}
                  />
                </Box>
                <IconButton size="small" onClick={(e) => openMenu(e, i)}>
                  <MenuIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(i);
                  }}
                >
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transform: expandedRows[i]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                    }}
                  />
                </IconButton>
              </Box>
              {expandedRows[i] && (
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {renderNestedFields && visibleGroupedFields
                    ? visibleGroupedFields.map((groupKey) => (
                        <React.Fragment key={`${i}-${groupKey || "default"}`}>
                          {renderNestedFields({
                            config: fields,
                            state: row,
                            onChange: (next) => updateRow(i, next),
                            surface: "edit",
                            cols:
                              fields.filter(
                                (f) =>
                                  f.kind !== "form-state" &&
                                  f.kind !== "computed" &&
                                  f.component,
                              ).length > 3
                                ? 2
                                : 1,
                            group: groupKey || undefined,
                            groupLabels: nestedGroupLabels,
                          })}
                        </React.Fragment>
                      ))
                    : null}
                </Grid>
              )}
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                {rowLabel && (
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    {rowLabel(row, i)}
                  </Typography>
                )}
                {fixedCount === undefined && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => requestDeleteRow(i)}
                    sx={{ ml: "auto" }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Grid container spacing={1}>
                {renderNestedFields
                  ? renderNestedFields({
                      config: fields,
                      state: row,
                      onChange: (next) => updateRow(i, next),
                      surface: "edit",
                      cols:
                        fields.filter(
                          (f) =>
                            f.kind !== "form-state" &&
                            f.kind !== "computed" &&
                            f.component,
                        ).length > 3
                          ? 2
                          : 1,
                    })
                  : null}
              </Grid>
            </>
          )}
        </Box>
      ))}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuRowIndex != null) requestDeleteRow(menuRowIndex);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
          disabled={fixedCount !== undefined || menuRowIndex == null}
        >
          {t("Delete")}
        </MenuItem>
      </Menu>
      <DeleteConfirmationDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={confirmDeleteRow}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          deleteIndex !== null
            ? (rowLabel?.(rows[deleteIndex] ?? {}, deleteIndex) ?? "")
            : ""
        }
      />
      {fixedCount === undefined && (
        <Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={addRow}
          >
            {t(addLabel)}
          </Button>
        </Box>
      )}
    </Box>
  );
}
