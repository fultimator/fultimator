import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { Close, ExpandMore } from "@mui/icons-material";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { SharedCustomWeaponCard } from "../../../../components/shared/itemCards";
import { SLOT_TIERS } from "../technospheres/slotTiers";
import allQualities from "../../../../libs/qualities";
const qualities = allQualities.filter((q) => q.filter?.includes("weapon"));
import groupBy from "../../../../libs/groupby";
import {
  categories,
  accuracyChecks,
} from "../../../../routes/equip/customWeapons/libs";
import { calculateCustomWeaponStats } from "../../common/playerCalculations";
import { buildSphereData } from "../../../../libs/technospheres";
import { validateCustomWeaponPersisted } from "../../../../forms/schema/itemSchemas/customWeapon";
import { SchemaFieldRenderer } from "../../../../forms/rendering/SchemaFieldRenderer";
import { customWeaponFieldConfig } from "../../../../forms/rendering/config/itemConfigs/customWeapon";

// Quality grouped options built once at module load.
const qualityGroups = Object.entries(groupBy(qualities, "category")).map(
  ([category, qs]) => ({
    header: category,
    options: qs.map((q) => ({
      value: q.name,
      label: `${q.name} (${q.cost}z)`,
    })),
  }),
);

function normalizeAccuracyCheck(
  value,
  fallback = { attr1: accuracyChecks[0].att1, attr2: accuracyChecks[0].att2 },
) {
  const attr1 = Array.isArray(value)
    ? value[0]
    : (value?.accuracy?.attr1 ??
      value?.attr1 ??
      value?.att1 ??
      value?.accuracy?.att1);
  const attr2 = Array.isArray(value)
    ? value[1]
    : (value?.accuracy?.attr2 ??
      value?.attr2 ??
      value?.att2 ??
      value?.accuracy?.att2);
  const validAttrs = ["dexterity", "insight", "might", "will"];
  if (validAttrs.includes(attr1) && validAttrs.includes(attr2)) {
    return { attr1, attr2 };
  }
  return fallback;
}

function hasAnyPrimaryModifier(item) {
  return (
    (item?.modifiers?.accuracy ?? item?.precModifier ?? 0) !== 0 ||
    (item?.modifiers?.damage ?? item?.damageModifier ?? 0) !== 0 ||
    (item?.modifiers?.def ?? item?.defModifier ?? 0) !== 0 ||
    (item?.modifiers?.mdef ?? item?.mDefModifier ?? 0) !== 0 ||
    !!(item?.rare?.overrideDamageType ?? item?.overrideDamageType)
  );
}

function hasAnySecondaryModifier(item) {
  return !!(
    item?.secondModifiers?.damage ||
    item?.secondModifiers?.accuracy ||
    item?.secondModifiers?.def ||
    item?.secondModifiers?.mdef
  );
}

function buildInitialFormState(customWeapon, isSlotsVariant) {
  if (!customWeapon) {
    return {
      itemType: "customWeapon",
      name: "",
      category: categories[0],
      range: "melee",
      hands: 2,
      martial: false,
      accuracy: {
        attr1: "dexterity",
        attr2: "insight",
        value: 0,
        defense: "def",
      },
      damage: { value: 0, type: "physical", hrZero: false },
      modifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
      rare: {
        accuracyBonus: false,
        damageBonus: false,
        overrideDamageType: false,
        overrideAccuracyAttributes: false,
      },
      customizations: [],
      quality: "",
      qualityCost: 0,
      cost: 300,
      slots: "alpha",
      slotted: [],
      secondName: "",
      secondCategory: categories[0],
      secondRange: "melee",
      secondAccuracy: undefined,
      secondDamage: undefined,
      secondModifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
      secondCustomizations: [],
      dataType: "weapon",
      selectedQuality: "",
      qualityName: "",
      isEquipped: false,
      selectedCategory: categories[0],
      selectedRange: "melee",
      selectedAccuracyCheck: {
        attr1: accuracyChecks[0].att1,
        attr2: accuracyChecks[0].att2,
      },
      customDamageType: "physical",
      primaryHrZero: false,
      rareAccuracyBonus: false,
      rareDamageBonus: false,
      overrideDamageType: false,
      overrideAccuracyAttributes: false,
      precModifier: 0,
      damageModifier: 0,
      defModifier: 0,
      mDefModifier: 0,
      hasTransforming: false,
      secondWeaponName: "",
      secondSelectedCategory: categories[0],
      secondSelectedRange: "melee",
      secondSelectedAccuracyCheck: {
        attr1: accuracyChecks[0].att1,
        attr2: accuracyChecks[0].att2,
      },
      secondaryHrZero: false,
      secondOverrideDamageType: false,
      secondCustomDamageType: "physical",
      secondPrecModifier: 0,
      secondDamageModifier: 0,
      secondDefModifier: 0,
      secondMDefModifier: 0,
      isSlotsVariant: isSlotsVariant ?? false,
    };
  }

  const rare = customWeapon.rare ?? {};
  const overrideAccuracyAttributes =
    rare.overrideAccuracyAttributes ??
    customWeapon.overrideAccuracyAttributes ??
    false;
  const ac = customWeapon.accuracy ?? {};
  const selectedAccuracyCheck = overrideAccuracyAttributes
    ? normalizeAccuracyCheck(ac)
    : (() => {
        const found =
          accuracyChecks.find(
            (c) =>
              c.att1 === (ac.attr1 ?? ac.att1) &&
              c.att2 === (ac.attr2 ?? ac.att2),
          ) ?? accuracyChecks[0];
        return { attr1: found.att1, attr2: found.att2 };
      })();

  const secondAc = customWeapon.secondAccuracy ?? {};
  const secondSelectedAccuracyCheck = (() => {
    const found =
      accuracyChecks.find(
        (c) =>
          c.att1 === (secondAc.attr1 ?? secondAc.att1) &&
          c.att2 === (secondAc.attr2 ?? secondAc.att2),
      ) ?? accuracyChecks[0];
    return { attr1: found.att1, attr2: found.att2 };
  })();

  const overrideDamageType =
    rare.overrideDamageType ?? customWeapon.overrideDamageType ?? false;
  const customDamageType =
    rare.overrideDamageTypeValue ??
    customWeapon.customDamageType ??
    customWeapon.damage?.type ??
    "physical";

  const currentCustomizations = customWeapon.customizations ?? [];
  const hasTransforming = currentCustomizations.some(
    (c) => c.name === "weapon_customization_transforming",
  );

  return {
    itemType: "customWeapon",
    name: customWeapon.name ?? "",
    category: customWeapon.category ?? categories[0],
    range: customWeapon.range ?? "melee",
    hands: customWeapon.hands ?? 2,
    martial: customWeapon.martial ?? false,
    accuracy: customWeapon.accuracy ?? {
      attr1: "dexterity",
      attr2: "insight",
      value: 0,
      defense: "def",
    },
    damage: customWeapon.damage ?? {
      value: 0,
      type: "physical",
      hrZero: false,
    },
    modifiers: customWeapon.modifiers ?? {
      damage: 0,
      accuracy: 0,
      def: 0,
      mdef: 0,
    },
    rare: {
      accuracyBonus: rare.accuracyBonus ?? false,
      damageBonus: rare.damageBonus ?? false,
      overrideDamageType,
      overrideAccuracyAttributes,
      overrideDamageTypeValue: customDamageType,
      overrideAccuracyAttr1: selectedAccuracyCheck.attr1,
      overrideAccuracyAttr2: selectedAccuracyCheck.attr2,
    },
    customizations: currentCustomizations,
    quality: customWeapon.quality ?? "",
    qualityCost: customWeapon.qualityCost ?? 0,
    cost: customWeapon.cost ?? 300,
    slots: customWeapon.slots ?? "alpha",
    slotted: customWeapon.slotted ?? [],
    secondName: customWeapon.secondName ?? "",
    secondCategory: customWeapon.secondCategory ?? categories[0],
    secondRange: customWeapon.secondRange ?? "melee",
    secondAccuracy: customWeapon.secondAccuracy,
    secondDamage: customWeapon.secondDamage,
    secondModifiers: customWeapon.secondModifiers ?? {
      damage: 0,
      accuracy: 0,
      def: 0,
      mdef: 0,
    },
    secondCustomizations: customWeapon.secondCustomizations ?? [],
    dataType: "weapon",
    selectedQuality: customWeapon.selectedQuality ?? "",
    qualityName: customWeapon.qualityName ?? "",
    isEquipped: customWeapon.isEquipped ?? false,
    selectedCategory: customWeapon.category ?? categories[0],
    selectedRange: customWeapon.range ?? "melee",
    selectedAccuracyCheck,
    customDamageType,
    primaryHrZero: customWeapon.damage?.hrZero === true,
    rareAccuracyBonus: rare.accuracyBonus ?? false,
    rareDamageBonus: rare.damageBonus ?? false,
    overrideDamageType,
    overrideAccuracyAttributes,
    precModifier: customWeapon.modifiers?.accuracy ?? 0,
    damageModifier: customWeapon.modifiers?.damage ?? 0,
    defModifier: customWeapon.modifiers?.def ?? 0,
    mDefModifier: customWeapon.modifiers?.mdef ?? 0,
    hasTransforming,
    secondWeaponName: customWeapon.secondName ?? "",
    secondSelectedCategory: customWeapon.secondCategory ?? categories[0],
    secondSelectedRange: customWeapon.secondRange ?? "melee",
    secondSelectedAccuracyCheck,
    secondaryHrZero: customWeapon.secondDamage?.hrZero === true,
    secondOverrideDamageType: !!(
      customWeapon.secondDamage?.type &&
      customWeapon.secondDamage.type !== "physical"
    ),
    secondCustomDamageType: customWeapon.secondDamage?.type ?? "physical",
    secondPrecModifier: customWeapon.secondModifiers?.accuracy ?? 0,
    secondDamageModifier: customWeapon.secondModifiers?.damage ?? 0,
    secondDefModifier: customWeapon.secondModifiers?.def ?? 0,
    secondMDefModifier: customWeapon.secondModifiers?.mdef ?? 0,
    isSlotsVariant: isSlotsVariant ?? false,
  };
}

export default function PlayerCustomWeaponModal({
  open,
  onClose,
  editCustomWeaponIndex,
  customWeapon,
  onAddCustomWeapon,
  onDeleteCustomWeapon,
  player,
  setPlayer,
}) {
  const { t } = useTranslate();
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;
  const technospheresVariant =
    player?.settings?.optionalRules?.technospheresVariant ?? "standard";
  const isIntegrated =
    isTechnospheres &&
    (technospheresVariant === "integrated" ||
      technospheresVariant === "hoplospheres");
  const isSlotsVariant =
    isTechnospheres && technospheresVariant !== "mnemospheres";

  const fileInputRef = useRef();

  const [formState, setFormState] = useState(() =>
    buildInitialFormState(customWeapon, isSlotsVariant),
  );
  const [modifiersExpanded, setModifiersExpanded] = useState(() =>
    hasAnyPrimaryModifier(customWeapon),
  );
  const [secondModifiersExpanded, setSecondModifiersExpanded] = useState(() =>
    hasAnySecondaryModifier(customWeapon),
  );

  useEffect(() => {
    setFormState(buildInitialFormState(customWeapon, isSlotsVariant));
    setModifiersExpanded(hasAnyPrimaryModifier(customWeapon));
    setSecondModifiersExpanded(hasAnySecondaryModifier(customWeapon));
  }, [customWeapon, isSlotsVariant]);

  const {
    selectedCategory,
    selectedAccuracyCheck,
    overrideAccuracyAttributes,
    rareAccuracyBonus,
    hasTransforming,
    secondSelectedCategory,
    slots,
    slotted,
    primaryHrZero,
    customDamageType,
    overrideDamageType,
    damageModifier,
    precModifier,
    secondSelectedAccuracyCheck,
    secondaryHrZero,
    secondOverrideDamageType,
    secondCustomDamageType,
    secondDamageModifier,
    secondPrecModifier,
    secondCustomizations,
  } = formState;

  // Slot cost delta for zenit display and deduction on save.
  const paidSlots = customWeapon?.slots ?? "alpha";
  const paidSlotTier =
    SLOT_TIERS.find((tier) => tier.value === paidSlots) ?? SLOT_TIERS[0];
  const selectedSlotTier =
    SLOT_TIERS.find((tier) => tier.value === slots) ?? SLOT_TIERS[0];
  const slotCostDelta = isSlotsVariant
    ? selectedSlotTier.cost - paidSlotTier.cost
    : 0;
  const currentZenit = player?.info?.zenit ?? 0;
  const cannotAffordSlotTier = slotCostDelta > currentZenit;
  const slotCostChangeLabel =
    slotCostDelta > 0
      ? `${t("Deduct on save")}: ${slotCostDelta}z`
      : slotCostDelta < 0
        ? `${t("Refund on save")}: ${Math.abs(slotCostDelta)}z`
        : "";
  const currentZenitLabel = `${t("Current Zenit")}: ${currentZenit}z`;

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editCustomWeaponIndex !== null) {
        onDeleteCustomWeapon(editCustomWeaponIndex);
        onClose();
      }
    },
  });

  const handleSave = () => {
    const { precision, damage: dmgVal } = calculateCustomWeaponStats(
      {
        category: selectedCategory,
        customizations: formState.customizations,
        rareAccuracyBonus,
        rareDamageBonus: formState.rareDamageBonus,
        damageModifier: parseInt(damageModifier) || 0,
        precModifier: parseInt(precModifier) || 0,
      },
      false,
    );

    const hasElemental = (formState.customizations ?? []).some(
      (c) => c.name === "weapon_customization_elemental",
    );
    const resolvedDamageType = hasElemental
      ? customDamageType
      : overrideDamageType
        ? customDamageType
        : "physical";

    const primaryAccuracy = {
      attr1: selectedAccuracyCheck.attr1,
      attr2: selectedAccuracyCheck.attr2,
      value: precision,
      defense: "def",
    };
    const primaryDamage = {
      value: dmgVal,
      type: resolvedDamageType,
      hrZero: primaryHrZero,
    };

    let secondAccuracy, secondDamage;
    if (hasTransforming) {
      const { precision: s2prec, damage: s2dmg } = calculateCustomWeaponStats(
        {
          secondSelectedCategory: formState.secondSelectedCategory,
          secondCurrentCustomizations: secondCustomizations,
          rareAccuracyBonus,
          rareDamageBonus: formState.rareDamageBonus,
          secondDamageModifier: parseInt(secondDamageModifier) || 0,
          secondPrecModifier: parseInt(secondPrecModifier) || 0,
        },
        true,
      );
      const s2HasElemental = (secondCustomizations ?? []).some(
        (c) => c.name === "weapon_customization_elemental",
      );
      const s2DamageType = s2HasElemental
        ? secondCustomDamageType
        : secondOverrideDamageType
          ? secondCustomDamageType
          : "physical";
      secondAccuracy = {
        attr1: secondSelectedAccuracyCheck.attr1,
        attr2: secondSelectedAccuracyCheck.attr2,
        value: s2prec,
        defense: "def",
      };
      secondDamage = {
        value: s2dmg,
        type: s2DamageType,
        hrZero: secondaryHrZero,
      };
    }

    const weaponData = {
      itemType: "customWeapon",
      name: formState.name,
      category: selectedCategory,
      range: formState.selectedRange,
      accuracy: primaryAccuracy,
      damage: primaryDamage,
      modifiers: {
        damage: parseInt(damageModifier) || 0,
        accuracy: parseInt(precModifier) || 0,
        def: parseInt(formState.defModifier) || 0,
        mdef: parseInt(formState.mDefModifier) || 0,
      },
      rare: {
        accuracyBonus: rareAccuracyBonus,
        damageBonus: formState.rareDamageBonus,
        overrideDamageType,
        overrideAccuracyAttributes,
        overrideDamageTypeValue: customDamageType,
        overrideAccuracyAttr1: selectedAccuracyCheck.attr1,
        overrideAccuracyAttr2: selectedAccuracyCheck.attr2,
      },
      customizations: formState.customizations ?? [],
      selectedQuality: formState.selectedQuality,
      qualityName: formState.qualityName,
      quality: formState.quality,
      qualityCost: parseInt(formState.qualityCost) || 0,
      cost: formState.cost ?? 300,
      hands: 2,
      martial: formState.martial,
      isEquipped: editCustomWeaponIndex !== null ? formState.isEquipped : false,
      secondName: formState.secondWeaponName,
      secondCategory: formState.secondSelectedCategory,
      secondRange: formState.secondSelectedRange,
      secondCustomizations: secondCustomizations ?? [],
      secondModifiers: {
        damage: parseInt(secondDamageModifier) || 0,
        accuracy: parseInt(secondPrecModifier) || 0,
        def: parseInt(formState.secondDefModifier) || 0,
        mdef: parseInt(formState.secondMDefModifier) || 0,
      },
      ...(hasTransforming ? { secondAccuracy, secondDamage } : {}),
      dataType: "weapon",
      ...(isSlotsVariant || customWeapon?.slots || customWeapon?.slotted
        ? { slots, slotted }
        : {}),
    };

    if (import.meta.env.DEV) {
      const result = validateCustomWeaponPersisted(weaponData);
      if (!result.success) {
        console.warn(
          "[PlayerCustomWeaponModal] customWeapon schema validation failed",
          result.error.issues,
        );
      }
    }

    onAddCustomWeapon(weaponData);

    if (slotCostDelta !== 0 && setPlayer) {
      setPlayer((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          zenit: Math.max(0, (prev.info?.zenit ?? 0) - slotCostDelta),
        },
      }));
    }
    onClose();
  };

  const handleClearFields = () => {
    setFormState(buildInitialFormState(null, isSlotsVariant));
    setModifiersExpanded(false);
    setSecondModifiersExpanded(false);
  };

  const handleFileUpload = (data) => {
    if (data && data.dataType === "weapon") {
      setFormState(buildInitialFormState(data, isSlotsVariant));
      const rare = data.rare ?? {};
      setModifiersExpanded(
        !!(rare.overrideDamageType ?? data.overrideDamageType) ||
          (data.modifiers?.accuracy ?? data.precModifier ?? 0) !== 0 ||
          (data.modifiers?.damage ?? data.damageModifier ?? 0) !== 0 ||
          (data.modifiers?.def ?? data.defModifier ?? 0) !== 0 ||
          (data.modifiers?.mdef ?? data.mDefModifier ?? 0) !== 0,
      );
      setSecondModifiersExpanded(
        (data.secondModifiers?.damage ?? 0) !== 0 ||
          (data.secondModifiers?.accuracy ?? 0) !== 0 ||
          (data.secondModifiers?.def ?? 0) !== 0 ||
          (data.secondModifiers?.mdef ?? 0) !== 0,
      );
    }
  };

  // extraProps bundles carry dynamic values into renderers via componentProps merge.
  const coreExtraProps = {
    selectedCategory,
    rareAccuracyBonus,
    isSecondForm: false,
  };
  const secondaryExtraProps = {
    selectedCategory: secondSelectedCategory,
    rareAccuracyBonus,
    isSecondForm: true,
  };
  const slotsExtraProps = {
    isWeapon: true,
    isIntegrated,
    slots,
    player,
    onAddToBank: setPlayer
      ? (item, type) => {
          const key = type === "mnemospheres" ? "mnemospheres" : "hoplospheres";
          const genId = () =>
            Math.random().toString(36).slice(2) + Date.now().toString(36);
          setPlayer((prev) => {
            const prevEq0 = prev?.equipment?.[0] ?? {};
            const eq0New = {
              ...prevEq0,
              [key]: [
                ...(prevEq0[key] ?? []),
                { ...item, id: item.id ?? genId() },
              ],
            };
            const equipment = prev?.equipment
              ? [eq0New, ...prev.equipment.slice(1)]
              : [eq0New];
            return { ...prev, equipment };
          });
        }
      : undefined,
  };
  const qualityExtraProps = { groups: qualityGroups };

  // Preview values.
  const { precision: pPrec, damage: pDmg } = calculateCustomWeaponStats(
    {
      category: selectedCategory,
      customizations: formState.customizations,
      rareAccuracyBonus,
      rareDamageBonus: formState.rareDamageBonus,
      damageModifier: parseInt(damageModifier) || 0,
      precModifier: parseInt(precModifier) || 0,
    },
    false,
  );
  const pHasElemental = (formState.customizations ?? []).some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const pType = pHasElemental
    ? customDamageType
    : overrideDamageType
      ? customDamageType
      : "physical";

  const { precision: s2Prec, damage: s2Dmg } = hasTransforming
    ? calculateCustomWeaponStats(
        {
          secondSelectedCategory: formState.secondSelectedCategory,
          secondCurrentCustomizations: secondCustomizations,
          rareAccuracyBonus,
          rareDamageBonus: formState.rareDamageBonus,
          secondDamageModifier: parseInt(secondDamageModifier) || 0,
          secondPrecModifier: parseInt(secondPrecModifier) || 0,
        },
        true,
      )
    : { precision: 0, damage: 0 };
  const s2HasElemental = (secondCustomizations ?? []).some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const s2Type = s2HasElemental
    ? secondCustomDamageType
    : secondOverrideDamageType
      ? secondCustomDamageType
      : "physical";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: "100%", maxWidth: "lg" } } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {editCustomWeaponIndex !== null ? t("Edit") : t("Add Custom Weapon")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      <DialogContent>
        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          {/* Left column: form fields */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Core: name, category, range, equipped, customizations */}
            <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
              <SchemaFieldRenderer
                config={customWeaponFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                label={t("Custom Weapon")}
                cols={2}
                extraProps={coreExtraProps}
              />
            </Grid>

            {/* Accuracy: preset picker (hidden when overrideAccuracyAttributes is on) */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={customWeaponFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="accuracy"
                label={t("Accuracy")}
                cols={2}
              />
            </Grid>

            {/* Damage: hrZero + elemental/override type */}
            <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
              <SchemaFieldRenderer
                config={customWeaponFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="damage"
                label={t("Damage")}
                cols={2}
              />
            </Grid>

            {/* Quality or Slots */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {isSlotsVariant ? (
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={(next) => {
                    if (next.slots !== formState.slots) {
                      const newTier = SLOT_TIERS.find(
                        (tier) => tier.value === next.slots,
                      );
                      const hoplospheres =
                        player?.equipment?.[0]?.hoplospheres ?? [];
                      const kept = [];
                      let cost = 0;
                      for (const id of formState.slotted ?? []) {
                        const hoplo = hoplospheres.find((h) => h.id === id);
                        const slotCost = hoplo?.requiredSlots ?? 1;
                        if (cost + slotCost <= (newTier?.slots ?? 1)) {
                          kept.push(id);
                          cost += slotCost;
                        }
                      }
                      setFormState({ ...next, slotted: kept });
                    } else {
                      setFormState(next);
                    }
                  }}
                  surface="edit"
                  group="slots"
                  label={t("Slots")}
                  cols={1}
                  extraProps={slotsExtraProps}
                />
              ) : (
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={(next) => {
                    if (
                      next.selectedQuality !== formState.selectedQuality &&
                      next.selectedQuality
                    ) {
                      const q = qualities.find(
                        (qu) => qu.name === next.selectedQuality,
                      );
                      if (q) {
                        setFormState({
                          ...next,
                          qualityName: q.name,
                          quality: q.quality,
                          qualityCost: q.cost,
                        });
                        return;
                      }
                    }
                    setFormState(next);
                  }}
                  surface="edit"
                  group="quality"
                  label={t("Quality")}
                  cols={2}
                  extraProps={qualityExtraProps}
                />
              )}
            </Grid>

            {/* Modifiers + Rare accordion */}
            <Accordion
              sx={{ width: "100%", mb: 2 }}
              expanded={modifiersExpanded}
              onChange={() => setModifiersExpanded(!modifiersExpanded)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{t("Modifiers")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <SchemaFieldRenderer
                    config={customWeaponFieldConfig}
                    state={formState}
                    onChange={setFormState}
                    surface="edit"
                    group="rare"
                    label={t("Rare Weapon Options")}
                    cols={2}
                  />

                  <SchemaFieldRenderer
                    config={customWeaponFieldConfig}
                    state={formState}
                    onChange={setFormState}
                    surface="edit"
                    group="modifiers"
                    label={t("Modifiers")}
                    cols={2}
                  />
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Secondary weapon (transforming) */}
            {hasTransforming && (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <SchemaFieldRenderer
                    config={customWeaponFieldConfig}
                    state={formState}
                    onChange={setFormState}
                    surface="edit"
                    group="secondary"
                    label={t("weapon_customization_transforming_form")}
                    cols={2}
                    extraProps={secondaryExtraProps}
                  />
                </Grid>
                <Accordion
                  sx={{ width: "100%", mb: 2 }}
                  expanded={secondModifiersExpanded}
                  onChange={() =>
                    setSecondModifiersExpanded(!secondModifiersExpanded)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>
                      {t("weapon_customization_transforming_form_modifiers")}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <SchemaFieldRenderer
                        config={customWeaponFieldConfig}
                        state={formState}
                        onChange={setFormState}
                        surface="edit"
                        group="secondaryModifiers"
                        cols={2}
                        extraProps={secondaryExtraProps}
                      />
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </>
            )}

            {/* Controls: upload, clear */}
            <Grid container spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Grid>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current.click()}
                >
                  {t("Upload JSON")}
                </Button>
              </Grid>
              <Grid>
                <Button variant="outlined" onClick={handleClearFields}>
                  {t("Clear All Fields")}
                </Button>
              </Grid>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        handleFileUpload(JSON.parse(reader.result));
                      } catch (err) {
                        console.error("Error parsing JSON file:", err);
                        alert("Invalid JSON file format");
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </Grid>
          </Grid>

          {/* Right column: preview card, sticky so it stays visible while scrolling */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ position: "sticky", top: 0 }}>
            <SharedCustomWeaponCard
              item={{
                ...customWeapon,
                name: formState.name,
                category: selectedCategory,
                range: formState.selectedRange,
                accuracy: {
                  attr1: selectedAccuracyCheck.attr1,
                  attr2: selectedAccuracyCheck.attr2,
                  value: pPrec,
                  defense: "def",
                },
                damage: { value: pDmg, type: pType, hrZero: primaryHrZero },
                customizations: formState.customizations,
                quality: formState.quality,
                cost: formState.cost ?? 300,
                hands: 2,
                martial: formState.martial,
                rareAccuracyBonus,
                rareDamageBonus: formState.rareDamageBonus,
                overrideAccuracyAttributes,
                overrideDamageType,
                defModifier: parseInt(formState.defModifier) || 0,
                mDefModifier: parseInt(formState.mDefModifier) || 0,
                slots,
                slotted,
                // Second form fields read by buildSecondWeaponItem inside the card.
                secondWeaponName: formState.secondWeaponName,
                secondSelectedCategory: formState.secondSelectedCategory,
                secondSelectedRange: formState.secondSelectedRange,
                secondAccuracy: hasTransforming
                  ? {
                      attr1: secondSelectedAccuracyCheck.attr1,
                      attr2: secondSelectedAccuracyCheck.attr2,
                      value: s2Prec,
                      defense: "def",
                    }
                  : undefined,
                secondDamage: hasTransforming
                  ? { value: s2Dmg, type: s2Type, hrZero: secondaryHrZero }
                  : undefined,
                secondCurrentCustomizations: hasTransforming
                  ? secondCustomizations
                  : undefined,
              }}
              sphereData={buildSphereData({ slots, slotted }, player)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        {editCustomWeaponIndex !== null && (
          <Button onClick={handleDelete} color="error" variant="contained">
            {t("Delete")}
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {slotCostChangeLabel && (
          <Typography
            variant="body2"
            color={cannotAffordSlotTier ? "error" : "text.secondary"}
          >
            {slotCostChangeLabel} ({currentZenitLabel})
            {cannotAffordSlotTier ? ` - ${t("Not enough Zenit")}` : ""}
          </Typography>
        )}
        <Button onClick={onClose} color="secondary">
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={cannotAffordSlotTier}
        >
          {t("Save")}
        </Button>
      </DialogActions>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => {
          if (editCustomWeaponIndex !== null) {
            onDeleteCustomWeapon(editCustomWeaponIndex);
            onClose();
          }
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete this custom weapon?")}
        itemPreview={
          <Typography variant="h4">
            {formState.name || t("weapon_name")}
          </Typography>
        }
      />
    </Dialog>
  );
}
