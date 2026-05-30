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
} from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { Close } from "@mui/icons-material";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { SharedCustomWeaponCard } from "/src/components/shared/items";
import { SLOT_TIERS } from "/src/libs/player/slotTiers";
import allQualities from "/src/libs/qualities";
import groupBy from "/src/libs/groupby";
import {
  categories,
  accuracyChecks,
} from "/src/routes/equip/customWeapons/libs";
import { calculateCustomWeaponStats } from "/src/libs/playerCalculations";
import { buildSphereData } from "/src/libs/technospheres";
import { validateCustomWeaponPersisted } from "/src/forms/schema/itemSchemas/customWeapon";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  customWeaponFieldConfig,
  customWeaponGroupLabels,
  customWeaponTabs,
} from "/src/forms/rendering/config/itemConfigs/customWeapon";

// Quality grouped options built once at module load.
const qualities = allQualities
  .filter(
    (q) => q.filter?.includes("weapon") || q.filter?.includes("customWeapon"),
  )
  .filter(
    (q, idx, arr) => arr.findIndex((entry) => entry.name === q.name) === idx,
  );
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
      rareOverrideDamageTypeValue: "physical",
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
  const customDamageType = customWeapon.damage?.type ?? "physical";
  const rareOverrideDamageTypeValue =
    rare.overrideDamageTypeValue ??
    customWeapon.rareOverrideDamageTypeValue ??
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
      overrideDamageTypeValue: rareOverrideDamageTypeValue,
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
    rareOverrideDamageTypeValue,
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
  useEffect(() => {
    setFormState(buildInitialFormState(customWeapon, isSlotsVariant));
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
      ? (formState.damage?.type ?? customDamageType ?? "physical")
      : overrideDamageType
        ? (formState.rareOverrideDamageTypeValue ?? "physical")
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
        ? (formState.secondDamage?.type ?? secondCustomDamageType ?? "physical")
        : overrideDamageType
          ? (formState.rareOverrideDamageTypeValue ?? "physical")
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
        overrideDamageTypeValue: formState.rareOverrideDamageTypeValue,
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
  };

  const handleFileUpload = (data) => {
    if (data && data.dataType === "weapon") {
      setFormState(buildInitialFormState(data, isSlotsVariant));
    }
  };

  // extraProps bundles carry dynamic values into renderers via componentProps merge.
  const coreExtraProps = {
    selectedCategory,
    rareAccuracyBonus,
    isSecondForm: false,
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
    ? (formState.damage?.type ?? customDamageType ?? "physical")
    : overrideDamageType
      ? (formState.rareOverrideDamageTypeValue ?? "physical")
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
    ? (formState.secondDamage?.type ?? secondCustomDamageType ?? "physical")
    : overrideDamageType
      ? (formState.rareOverrideDamageTypeValue ?? "physical")
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
            <TabbedSchemaFormRenderer
              tabs={customWeaponTabs}
              config={customWeaponFieldConfig}
              groupLabels={customWeaponGroupLabels}
              state={formState}
              onChange={(next) => {
                if (isSlotsVariant && next.slots !== formState.slots) {
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
              cols={2}
              extraProps={{
                ...coreExtraProps,
                ...slotsExtraProps,
                ...qualityExtraProps,
              }}
            />

            {/* Controls: upload, clear */}
            <Grid
              container
              spacing={1}
              sx={{ alignItems: "center", mb: 1, mt: 2 }}
            >
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
