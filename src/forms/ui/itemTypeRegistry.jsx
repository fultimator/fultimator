import { accessoryFieldConfig } from "../rendering/config/itemConfigs/accessory";
import { armorFieldConfig } from "../rendering/config/itemConfigs/armor";
import { customWeaponFieldConfig } from "../rendering/config/itemConfigs/customWeapon";
import { heroicFieldConfig } from "../rendering/config/itemConfigs/heroic";
import { shieldFieldConfig } from "../rendering/config/itemConfigs/shield";
import { weaponFieldConfig } from "../rendering/config/itemConfigs/weapon";
import {
  buildAccessoryFormState,
  buildAccessorySavePayload,
  validateAccessoryPersisted,
} from "../schema/itemSchemas/accessory";
import {
  buildArmorFormState,
  buildArmorSavePayload,
  applyArmorZenitSideEffect,
  applyArmorSlotTierChange,
  getArmorSlotCostInfo,
  validateArmorPersisted,
} from "../schema/itemSchemas/armor";
import {
  buildHeroicFormState,
  buildHeroicSavePayload,
  validateHeroic,
  normalizeHeroic,
} from "../schema/itemSchemas/heroic";
import {
  buildShieldFormState,
  buildShieldSavePayload,
  validateShieldPersisted,
} from "../schema/itemSchemas/shield";
import {
  buildWeaponFormState,
  buildWeaponSavePayload,
  validateWeaponPersisted,
} from "../schema/itemSchemas/weapon";
import {
  buildCustomWeaponFormState,
  buildCustomWeaponSavePayload,
  applyCustomWeaponZenitSideEffect,
  applyCustomWeaponSlotTierChange,
  getCustomWeaponSlotCostInfo,
  validateCustomWeaponPersisted,
  normalizeCustomWeapon,
} from "../schema/itemSchemas/customWeapon";
import { normalizeDefensiveItem } from "../../libs/equipmentDefensiveNormalization";
import { normalizeWeaponLike } from "../../libs/weaponNormalization";
import allQualities from "../../libs/qualities";
import groupBy from "../../libs/groupby";
import {
  AccessoryPreviewCard,
  ArmorPreviewCard,
  CustomWeaponPreviewCard,
  HeroicPreviewCard,
  ShieldPreviewCard,
  WeaponPreviewCard,
} from "./itemPreviewCards";

const weaponQualities = allQualities.filter((q) => q.filter?.includes("weapon"));
const qualityGroups = Object.entries(groupBy(weaponQualities, "category")).map(
  ([category, qs]) => ({
    header: category,
    options: qs.map((q) => ({ value: q.name, label: `${q.name} (${q.cost}z)` })),
  }),
);

export const ITEM_TYPE_REGISTRY = {
  heroic: {
    buildState: (item) => buildHeroicFormState(item),
    buildSavePayload: (formState) => buildHeroicSavePayload(formState),
    normalizeUpload: (raw) => normalizeHeroic(raw),
    validate: validateHeroic,
    fieldConfig: heroicFieldConfig,
    groups: [
      { key: "core", label: "Core", cols: 2 },
      { key: "body", label: "Body", cols: 1 },
      { key: "meta", label: "Meta", cols: 2 },
    ],
    PreviewCard: HeroicPreviewCard,
  },

  accessory: {
    buildState: (item) => buildAccessoryFormState(item),
    buildSavePayload: (formState) => buildAccessorySavePayload(formState),
    normalizeUpload: (raw) => normalizeDefensiveItem(raw),
    validate: validateAccessoryPersisted,
    fieldConfig: accessoryFieldConfig,
    groups: [
      { key: "core", label: "Accessory", cols: 2 },
      { key: "quality", label: "Quality", cols: 2 },
      { key: "modifiers", label: "Modifiers", cols: 2 },
    ],
    PreviewCard: AccessoryPreviewCard,
  },

  armor: {
    buildState: (item, ctx) => buildArmorFormState(item, ctx),
    buildSavePayload: (formState, originalItem) => buildArmorSavePayload(formState, originalItem),
    onAfterSave: (formState, originalItem, ctx) => applyArmorZenitSideEffect(formState, originalItem, ctx),
    normalizeUpload: (raw) => {
      const data = normalizeDefensiveItem(raw);
      return data?.base?.category === "Armor" ? data : null;
    },
    validate: validateArmorPersisted,
    fieldConfig: armorFieldConfig,
    groups: (formState) => [
      { key: "core", label: "Armor", cols: 2 },
      formState.isSlotsVariant
        ? { key: "slots", label: "Technospheres", cols: 1 }
        : { key: "quality", label: "Quality", cols: 2 },
      { key: "modifiers", label: "Modifiers", cols: 2 },
    ],
    getSlotCostInfo: (formState, originalItem, ctx) =>
      getArmorSlotCostInfo(formState, originalItem, ctx),
    getSlotOnChange: (_formState, setFormState, ctx) => (key, next) => {
      if (key !== "slots") return setFormState(next);
      setFormState(applyArmorSlotTierChange(next, next.slots, ctx));
    },
    PreviewCard: ArmorPreviewCard,
  },

  shield: {
    buildState: (item) => buildShieldFormState(item),
    buildSavePayload: (formState, originalItem) => buildShieldSavePayload(formState, originalItem),
    normalizeUpload: (raw) => {
      const data = normalizeDefensiveItem(raw);
      return data?.base?.category === "Shield" ? data : null;
    },
    validate: validateShieldPersisted,
    fieldConfig: shieldFieldConfig,
    groups: [
      { key: "core", label: "Shield", cols: 2 },
      { key: "quality", label: "Quality", cols: 2 },
      { key: "modifiers", label: "Modifiers", cols: 2 },
    ],
    PreviewCard: ShieldPreviewCard,
  },

  weapon: {
    buildState: (item) => buildWeaponFormState(item),
    buildSavePayload: (formState, originalItem) => buildWeaponSavePayload(formState, originalItem),
    normalizeUpload: (raw) => normalizeWeaponLike(raw),
    validate: validateWeaponPersisted,
    fieldConfig: weaponFieldConfig,
    groups: [
      { key: "core", label: "Weapon", cols: 2 },
      { key: "accuracy", label: "Accuracy", cols: 2 },
      { key: "damage", label: "Damage", cols: 2 },
      { key: "quality", label: "Quality", cols: 2 },
      { key: "rareBonus", label: "Rare Bonus", cols: 2 },
      { key: "rare", label: "Rare", cols: 2 },
      { key: "modifiers", label: "Modifiers", cols: 2 },
    ],
    PreviewCard: WeaponPreviewCard,
  },

  customWeapon: {
    buildState: (item, ctx) => buildCustomWeaponFormState(item, ctx),
    buildSavePayload: (formState, originalItem) => buildCustomWeaponSavePayload(formState, originalItem),
    onAfterSave: (formState, originalItem, ctx) => applyCustomWeaponZenitSideEffect(formState, originalItem, ctx),
    normalizeUpload: (raw) => {
      if (raw?.dataType !== "weapon") return null;
      try { return normalizeCustomWeapon(raw); } catch { return null; }
    },
    validate: validateCustomWeaponPersisted,
    fieldConfig: customWeaponFieldConfig,
    groups: (formState) => [
      { key: "core", label: "Custom Weapon", cols: 2,
        extraProps: { selectedCategory: formState.selectedCategory, rareAccuracyBonus: formState.rareAccuracyBonus, isSecondForm: false } },
      { key: "accuracy", label: "Accuracy", cols: 2 },
      { key: "damage", label: "Damage", cols: 2 },
      formState.isSlotsVariant
        ? { key: "slots", label: "Slots", cols: 1,
            extraProps: (fs, ctx) => ({
              isWeapon: true,
              isIntegrated: fs.isIntegrated,
              slots: fs.slots,
              player: ctx?.player,
              onAddToBank: ctx?.setPlayer
                ? (item, type) => {
                    const bankKey = type === "mnemospheres" ? "mnemospheres" : "hoplospheres";
                    const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
                    ctx.setPlayer((prev) => {
                      const prevEq0 = prev?.equipment?.[0] ?? {};
                      const eq0New = { ...prevEq0, [bankKey]: [...(prevEq0[bankKey] ?? []), { ...item, id: item.id ?? genId() }] };
                      const equipment = prev?.equipment ? [eq0New, ...prev.equipment.slice(1)] : [eq0New];
                      return { ...prev, equipment };
                    });
                  }
                : undefined,
            }) }
        : { key: "quality", label: "Quality", cols: 2, extraProps: { groups: qualityGroups } },
      { key: "rare", label: "Modifiers", cols: 2, accordionGroup: "modifiers_accordion",
        accordionDefaultExpanded: (s) =>
          (s.precModifier ?? 0) !== 0 || (s.damageModifier ?? 0) !== 0 ||
          (s.defModifier ?? 0) !== 0 || (s.mDefModifier ?? 0) !== 0 ||
          s.overrideDamageType || s.rareAccuracyBonus || s.rareDamageBonus },
      { key: "modifiers", label: "Modifiers", cols: 2, accordionGroup: "modifiers_accordion" },
      ...(formState.hasTransforming ? [
        { key: "secondary", label: "weapon_customization_transforming_form", cols: 2,
          extraProps: { selectedCategory: formState.secondSelectedCategory, rareAccuracyBonus: formState.rareAccuracyBonus, isSecondForm: true } },
        { key: "secondaryModifiers", label: "weapon_customization_transforming_form_modifiers", cols: 2, accordionGroup: "secondary_modifiers_accordion",
          accordionDefaultExpanded: (s) =>
            (s.secondPrecModifier ?? 0) !== 0 || (s.secondDamageModifier ?? 0) !== 0 ||
            (s.secondDefModifier ?? 0) !== 0 || (s.secondMDefModifier ?? 0) !== 0 },
      ] : []),
    ],
    getSlotCostInfo: (formState, originalItem, ctx) =>
      getCustomWeaponSlotCostInfo(formState, originalItem, ctx),
    getSlotOnChange: (_formState, setFormState, ctx) => (key, next) => {
      if (key !== "slots") return setFormState(next);
      setFormState(applyCustomWeaponSlotTierChange(next, next.slots, ctx));
    },
    getQualityOnChange: (formState, setFormState) => (next) => {
      if (next.selectedQuality !== formState.selectedQuality && next.selectedQuality) {
        const q = weaponQualities.find((qu) => qu.name === next.selectedQuality);
        if (q) {
          setFormState({ ...next, qualityName: q.name, quality: q.quality, qualityCost: q.cost });
          return;
        }
      }
      setFormState(next);
    },
    PreviewCard: CustomWeaponPreviewCard,
  },
};
