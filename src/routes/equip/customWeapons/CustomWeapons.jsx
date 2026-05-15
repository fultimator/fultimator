import React, { useState, useRef } from "react";
import {
  Paper,
  Grid,
  Button,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import { AutoAwesome, Download, Search } from "@mui/icons-material";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import { SharedCustomWeaponCard } from "../../../components/shared/itemCards";
import Export from "../../../components/Export";
import useDownloadImage from "../../../hooks/useDownloadImage";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import allQualities from "../../../libs/qualities";
const qualities = allQualities.filter((q) => q.filter?.includes("weapon"));
import groupBy from "../../../libs/groupby";
import { calculateCustomWeaponStats } from "../../../components/player/common/playerCalculations";
import { categories, accuracyChecks } from "./libs.jsx";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import { customWeaponFieldConfig } from "../../../forms/rendering/config/itemConfigs/customWeapon";

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
    : (value?.accuracy?.attr1 ?? value?.attr1 ?? value?.att1);
  const attr2 = Array.isArray(value)
    ? value[1]
    : (value?.accuracy?.attr2 ?? value?.attr2 ?? value?.att2);
  const validAttrs = ["dexterity", "insight", "might", "will"];
  if (validAttrs.includes(attr1) && validAttrs.includes(attr2)) {
    return { attr1, attr2 };
  }
  return fallback;
}

function buildInitialState(data) {
  if (!data) {
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
      isSlotsVariant: false,
    };
  }

  const rare = data.rare ?? {};
  const overrideAccuracyAttributes =
    rare.overrideAccuracyAttributes ?? data.overrideAccuracyAttributes ?? false;
  const ac = data.accuracy ?? {};
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

  const secondAc = data.secondAccuracy ?? {};
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
    rare.overrideDamageType ?? data.overrideDamageType ?? false;
  const customDamageType =
    rare.overrideDamageTypeValue ??
    data.customDamageType ??
    data.damage?.type ??
    "physical";

  const currentCustomizations = data.customizations ?? [];
  const hasTransforming = currentCustomizations.some(
    (c) => c.name === "weapon_customization_transforming",
  );

  return {
    itemType: "customWeapon",
    name: data.name ?? "",
    category: data.category ?? categories[0],
    range: data.range ?? "melee",
    hands: data.hands ?? 2,
    martial: data.martial ?? false,
    accuracy: data.accuracy ?? {
      attr1: "dexterity",
      attr2: "insight",
      value: 0,
      defense: "def",
    },
    damage: data.damage ?? { value: 0, type: "physical", hrZero: false },
    modifiers: data.modifiers ?? { damage: 0, accuracy: 0, def: 0, mdef: 0 },
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
    quality: data.quality ?? "",
    qualityCost: data.qualityCost ?? 0,
    cost: data.cost ?? 300,
    secondName: data.secondName ?? "",
    secondCategory: data.secondCategory ?? categories[0],
    secondRange: data.secondRange ?? "melee",
    secondAccuracy: data.secondAccuracy,
    secondDamage: data.secondDamage,
    secondModifiers: data.secondModifiers ?? {
      damage: 0,
      accuracy: 0,
      def: 0,
      mdef: 0,
    },
    secondCustomizations: data.secondCustomizations ?? [],
    dataType: "weapon",
    selectedQuality: data.selectedQuality ?? "",
    qualityName: data.qualityName ?? "",
    isEquipped: false,
    selectedCategory: data.category ?? categories[0],
    selectedRange: data.range ?? "melee",
    selectedAccuracyCheck,
    customDamageType,
    primaryHrZero: data.damage?.hrZero === true,
    rareAccuracyBonus: rare.accuracyBonus ?? false,
    rareDamageBonus: rare.damageBonus ?? false,
    overrideDamageType,
    overrideAccuracyAttributes,
    precModifier: data.modifiers?.accuracy ?? 0,
    damageModifier: data.modifiers?.damage ?? 0,
    defModifier: data.modifiers?.def ?? 0,
    mDefModifier: data.modifiers?.mdef ?? 0,
    hasTransforming,
    secondWeaponName: data.secondName ?? "",
    secondSelectedCategory: data.secondCategory ?? categories[0],
    secondSelectedRange: data.secondRange ?? "melee",
    secondSelectedAccuracyCheck,
    secondaryHrZero: data.secondDamage?.hrZero === true,
    secondOverrideDamageType: !!(
      data.secondDamage?.type && data.secondDamage.type !== "physical"
    ),
    secondCustomDamageType: data.secondDamage?.type ?? "physical",
    secondPrecModifier: data.secondModifiers?.accuracy ?? 0,
    secondDamageModifier: data.secondModifiers?.damage ?? 0,
    secondDefModifier: data.secondModifiers?.def ?? 0,
    secondMDefModifier: data.secondModifiers?.mdef ?? 0,
    isSlotsVariant: false,
  };
}

function CustomWeapons() {
  const { t } = useTranslate();
  const stickyTop = useStickyTop();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const weaponCardsRef = React.useRef();
  const fileInputRef = React.useRef();

  const [formState, setFormState] = useState(() => buildInitialState(null));
  const [qualityBrowserOpen, setQualityBrowserOpen] = useState(false);
  const [baseBrowserOpen, setBaseBrowserOpen] = useState(false);

  const handleBaseSelected = (item) => {
    setFormState(buildInitialState(item));
    setBaseBrowserOpen(false);
  };

  const handleQualitySelected = (item) => {
    setFormState((prev) => ({
      ...prev,
      selectedQuality: item.name,
      qualityName: item.name,
      quality: item.quality ?? "",
      qualityCost: item.cost ?? 0,
      cost: (prev.cost ?? 0) - (prev.qualityCost ?? 0) + (item.cost ?? 0),
    }));
    setQualityBrowserOpen(false);
  };

  const [downloadImage, downloadSnackbar] = useDownloadImage(
    formState.name || "Custom Weapon",
    weaponCardsRef,
  );

  const handleFileUpload = (data) => {
    if (data && data.dataType === "weapon") {
      setFormState(buildInitialState(data));
    }
  };

  const handleClearFields = () => setFormState(buildInitialState(null));

  const {
    name,
    selectedCategory,
    selectedRange,
    martial,
    selectedAccuracyCheck,
    customDamageType,
    overrideDamageType,
    rareAccuracyBonus,
    rareDamageBonus,
    customizations,
    quality,
    qualityCost,
    cost,
    hasTransforming,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
    overrideAccuracyAttributes,
    secondWeaponName,
    secondSelectedCategory,
    secondSelectedRange,
    secondSelectedAccuracyCheck,
    secondCustomDamageType,
    secondOverrideDamageType,
    secondCustomizations,
    secondPrecModifier,
    secondDamageModifier,
    secondDefModifier,
    secondMDefModifier,
    primaryHrZero,
    secondaryHrZero,
  } = formState;

  const { precision: pPrec, damage: pDmg } = calculateCustomWeaponStats(
    {
      category: selectedCategory,
      customizations,
      rareAccuracyBonus,
      rareDamageBonus,
      damageModifier,
      precModifier,
    },
    false,
  );

  const pHasElemental = (customizations ?? []).some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const pType = pHasElemental
    ? customDamageType
    : overrideDamageType
      ? customDamageType
      : selectedCategory;

  const exportData = {
    name,
    itemType: "customWeapon",
    category: selectedCategory,
    range: selectedRange,
    martial,
    accuracy: {
      attr1: selectedAccuracyCheck?.attr1 ?? "dexterity",
      attr2: selectedAccuracyCheck?.attr2 ?? "insight",
      value: pPrec,
      defense: "def",
    },
    damage: {
      value: pDmg,
      type: formState.damage?.type ?? "physical",
      hrZero: primaryHrZero,
    },
    modifiers: {
      damage: parseInt(damageModifier) || 0,
      accuracy: parseInt(precModifier) || 0,
      def: parseInt(defModifier) || 0,
      mdef: parseInt(mDefModifier) || 0,
    },
    rare: {
      accuracyBonus: rareAccuracyBonus,
      damageBonus: rareDamageBonus,
      overrideAccuracyAttributes,
      overrideDamageType,
      overrideDamageTypeValue: customDamageType,
      overrideAccuracyAttr1: selectedAccuracyCheck?.attr1 ?? "dexterity",
      overrideAccuracyAttr2: selectedAccuracyCheck?.attr2 ?? "insight",
    },
    customizations,
    selectedQuality: formState.selectedQuality,
    quality,
    qualityCost,
    cost,
    hands: 2,
    dataType: "weapon",
    ...(hasTransforming &&
      (() => {
        const { precision: s2Prec, damage: s2Dmg } = calculateCustomWeaponStats(
          {
            secondSelectedCategory,
            secondCurrentCustomizations: secondCustomizations,
            rareAccuracyBonus,
            rareDamageBonus,
            secondDamageModifier: secondDamageModifier,
            secondPrecModifier: secondPrecModifier,
          },
          true,
        );
        const s2HasElemental = (secondCustomizations ?? []).some(
          (c) => c.name === "weapon_customization_elemental",
        );
        const s2Type = s2HasElemental
          ? secondCustomDamageType
          : secondOverrideDamageType
            ? secondCustomDamageType
            : "physical";
        return {
          secondName: secondWeaponName,
          secondCategory: secondSelectedCategory,
          secondRange: secondSelectedRange,
          secondMartial: formState.secondMartial ?? false,
          secondCustomizations,
          secondAccuracy: {
            attr1: secondSelectedAccuracyCheck?.attr1 ?? "dexterity",
            attr2: secondSelectedAccuracyCheck?.attr2 ?? "insight",
            value: s2Prec,
            defense: "def",
          },
          secondDamage: { value: s2Dmg, type: s2Type, hrZero: secondaryHrZero },
          secondModifiers: {
            damage: parseInt(secondDamageModifier) || 0,
            accuracy: parseInt(secondPrecModifier) || 0,
            def: parseInt(secondDefModifier) || 0,
            mdef: parseInt(secondMDefModifier) || 0,
          },
        };
      })()),
  };

  return (
    <Grid container spacing={2}>
      {/* Left side - Configuration Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: "14px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <CustomHeaderAlt
            headerText={t("Custom Weapons")}
            icon={<AutoAwesome fontSize="large" />}
            actionIcon={<Search fontSize="large" />}
            onAction={() => setBaseBrowserOpen(true)}
            actionTooltip={t("Browse Compendium")}
          />

          {/* Primary Weapon Form */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              label={t("Primary Weapon")}
              cols={2}
              extraProps={{
                selectedCategory,
                rareAccuracyBonus,
                isSecondForm: false,
              }}
            />
          </Grid>
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
          <Grid container spacing={2} sx={{ mb: 2 }}>
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
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="quality"
              label={t("Quality")}
              cols={2}
              extraProps={{
                groups: qualityGroups,
                onBrowse: () => setQualityBrowserOpen(true),
              }}
            />
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="rare"
              label={t("Rare Weapon Options")}
              cols={2}
            />
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
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

          {/* Secondary Weapon Form (transforming only) */}
          {hasTransforming && (
            <>
              <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="secondary"
                  label={t("Transforming Form")}
                  cols={2}
                  extraProps={{
                    selectedCategory: secondSelectedCategory,
                    rareAccuracyBonus,
                    isSecondForm: true,
                  }}
                />
              </Grid>
              <Grid container spacing={2}>
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="secondaryModifiers"
                  label={t("Secondary Modifiers")}
                  cols={2}
                />
              </Grid>
            </>
          )}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => fileInputRef.current.click()}
              >
                {t("Upload JSON")}
              </Button>
            </Grid>
            <Grid size={6}>
              <Button variant="outlined" fullWidth onClick={handleClearFields}>
                {t("Clear All Fields")}
              </Button>
            </Grid>
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
                  } catch {
                    // ignore malformed JSON
                  }
                };
                reader.readAsText(file);
              }
            }}
            style={{ display: "none" }}
          />
        </Paper>
      </Grid>

      {/* Right side - Weapon Preview */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{ position: "sticky", top: stickyTop, alignSelf: "flex-start" }}
      >
        <SharedCustomWeaponCard
          variant="equip"
          item={exportData}
          cardRef={weaponCardsRef}
          imageMode="slot"
          showImageToggle
          actionContent={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tooltip title={t("Download as Image")}>
                <IconButton onClick={downloadImage}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Export
                name={name || "Custom Weapon"}
                dataType="weapon"
                data={{ ...exportData, dataType: "weapon" }}
              />
              <AddToCompendiumButton
                itemType="custom-weapon"
                data={exportData}
              />
            </div>
          }
        />
      </Grid>
      {downloadSnackbar}
      <CompendiumViewerModal
        open={qualityBrowserOpen}
        onClose={() => setQualityBrowserOpen(false)}
        onAddItem={handleQualitySelected}
        initialType="qualities"
        restrictToTypes={["qualities"]}
        initialQualityFilters={["weapon", "customWeapon"]}
      />
      <CompendiumViewerModal
        open={baseBrowserOpen}
        onClose={() => setBaseBrowserOpen(false)}
        onAddItem={handleBaseSelected}
        initialType="custom-weapons"
        restrictToTypes={["custom-weapons"]}
      />
    </Grid>
  );
}

export default CustomWeapons;
