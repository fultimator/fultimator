import { Grid, Paper, Button, useTheme, Typography } from "@mui/material";
import { useStickyTop } from "../../../hooks/useStickyTop";
import {
  AutoAwesome,
  ArrowDownward,
  Download,
  Search,
} from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import useDownloadImage from "../../../hooks/useDownloadImage";
import { useState, useEffect, useRef } from "react";
import weapons from "../../../libs/weapons";
import { SharedWeaponCard } from "../../../components/shared/itemCards";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import {
  getWeaponAttr1,
  getWeaponAttr2,
  getWeaponRange,
  getWeaponType,
  normalizeWeaponLike,
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
} from "../../../libs/weaponNormalization";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import {
  weaponFieldConfig,
  weaponGroupLabels,
} from "../../../forms/rendering/config/itemConfigs/weapon";

function buildInitialState(weapon) {
  const weaponAccuracy = weapon?.accuracy ?? {};
  const weaponDamage =
    weapon?.damage && typeof weapon.damage === "object" ? weapon.damage : {};
  const base = weapon?.base || weapons[0];
  return {
    base,
    name: weapon?.name || weapons[0].name,
    category: weapon?.category || base.category || "",
    type: weaponDamage.type || weapon?.type || getWeaponType(weapons[0]),
    hands: weapon?.hands || weapons[0].hands,
    att1: weaponAccuracy.attr1 || weapon?.att1 || getWeaponAttr1(weapons[0]),
    att2: weaponAccuracy.attr2 || weapon?.att2 || getWeaponAttr2(weapons[0]),
    martial: weapon?.martial || false,
    damageHrZero: weaponDamage.hrZero === true,
    damageBonus: weapon?.damageBonus || false,
    damageReworkBonus: weapon?.damageReworkBonus || false,
    precBonus: weapon?.precBonus || false,
    rareBonuses: {
      precBonus: weapon?.precBonus || false,
      damageBonus: weapon?.damageBonus || false,
      damageReworkBonus: weapon?.damageReworkBonus || false,
    },
    rework: weapon?.rework || false,
    quality: weapon?.quality || "",
    range: weapon?.range || getWeaponRange(base),
    qualityName: weapon?.qualityName || weapon?.selectedQuality || "",
    qualityCost: weapon?.qualityCost || 0,
    totalBonus: weapon?.totalBonus || 0,
    selectedQuality: weapon?.selectedQuality || "",
    precModifier: weapon?.modifiers?.accuracy ?? weapon?.precModifier ?? 0,
    damageModifier: weapon?.modifiers?.damage ?? weapon?.damageModifier ?? 0,
    defModifier: weapon?.modifiers?.def ?? weapon?.defModifier ?? 0,
    mDefModifier: weapon?.modifiers?.mdef ?? weapon?.mDefModifier ?? 0,
    isEquipped: false,
  };
}

function Weapons() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const stickyTop = useStickyTop();

  const [formState, setFormState] = useState(() => buildInitialState(null));
  const [qualityBrowserOpen, setQualityBrowserOpen] = useState(false);
  const [baseBrowserOpen, setBaseBrowserOpen] = useState(false);

  const handleBaseSelected = (item) => {
    setFormState(buildInitialState({ base: item }));
    setBaseBrowserOpen(false);
  };

  const handleQualitySelected = (item) => {
    setFormState((prev) => ({
      ...prev,
      selectedQuality: item.name,
      qualityName: item.name,
      quality: item.quality ?? "",
      qualityCost: item.cost ?? 0,
      qualityApplicableTo: Array.isArray(item.filter) ? item.filter : [],
      cost: (prev.cost ?? 0) - (prev.qualityCost ?? 0) + (item.cost ?? 0),
    }));
    setQualityBrowserOpen(false);
  };

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    formState.name,
    cardRef,
  );

  const {
    base,
    name,
    category,
    type,
    hands,
    att1,
    att2,
    martial,
    damageHrZero,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityName,
    qualityCost,
    totalBonus,
    selectedQuality,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
  } = formState;

  const cost = calcWeaponCost({
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
  });
  const damage = calcWeaponDamage({
    base,
    hands,
    rework,
    damageBonus,
    damageReworkBonus,
    damageModifier,
    cost,
  });
  const prec = calcWeaponPrec({ base, rework, precBonus, precModifier });

  useEffect(() => {
    const bonus = Math.floor(cost / 1000) * 2;
    setFormState((prev) => ({ ...prev, totalBonus: bonus }));
  }, [damageReworkBonus, cost, qualityCost, rework]);

  const handleFileUpload = (data) => {
    if (data) {
      const normalized = normalizeWeaponLike(data);
      const {
        base: newBase,
        name: newName,
        accuracy,
        martial: newMartial,
        category: newCategory,
        damage: newDamage,
        hand,
        hands: newHands,
        quality: newQuality,
        qualityCost: newQualityCost,
        damageBonus: newDamageBonus,
        damageReworkBonus: newDamageReworkBonus,
        precBonus: newPrecBonus,
        rework: newRework,
        defModifier: newDefModifier,
        mDefModifier: newMDefModifier,
        precModifier: newPrecModifier,
        damageModifier: newDamageModifier,
      } = normalized;

      const next = buildInitialState(null);
      if (newBase) next.base = newBase;
      if (newName) next.name = newName;
      if (accuracy?.attr1) next.att1 = accuracy.attr1;
      if (accuracy?.attr2) next.att2 = accuracy.attr2;
      if (newMartial) next.martial = newMartial;
      if (newCategory) next.category = newCategory;
      if (newDamage?.type) next.type = newDamage.type;
      next.damageHrZero = newDamage?.hrZero === true;
      if (hand || newHands) next.hands = hand ?? newHands;
      if (newQuality) {
        next.selectedQuality = "";
        next.quality = newQuality;
      }
      if (newQualityCost) next.qualityCost = newQualityCost;
      if (newDamageBonus) next.damageBonus = newDamageBonus;
      if (newDamageReworkBonus) next.damageReworkBonus = newDamageReworkBonus;
      if (newPrecBonus) next.precBonus = newPrecBonus;
      if (newRework) next.rework = newRework;
      if (newDefModifier) next.defModifier = newDefModifier;
      if (newMDefModifier) next.mDefModifier = newMDefModifier;
      if (newPrecModifier) next.precModifier = newPrecModifier;
      if (newDamageModifier) next.damageModifier = newDamageModifier;
      setFormState(next);
    }
  };

  const handleClearFields = () => setFormState(buildInitialState(null));

  const customItem = normalizeWeaponLike({
    base,
    name,
    att1,
    att2,
    martial,
    type,
    hands,
    category: base.category,
    range: getWeaponRange(base),
    cost,
    damage: { value: damage, type, hrZero: damageHrZero },
    prec,
    quality,
    qualityCost,
    selectedQuality,
    totalBonus,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    damageModifier,
    precModifier,
    defModifier,
    mDefModifier,
  });

  const exportItem = {
    itemType: "weapon",
    name: customItem.name,
    category: customItem.category,
    range: customItem.range,
    hands: customItem.hands,
    martial: customItem.martial,
    accuracy: customItem.accuracy,
    damage: customItem.damage,
    modifiers: {
      damage: parseInt(damageModifier, 10) || 0,
      accuracy: parseInt(precModifier, 10) || 0,
      def: parseInt(defModifier, 10) || 0,
      mdef: parseInt(mDefModifier, 10) || 0,
    },
    rare: {
      accuracyBonus: !!precBonus,
      damageBonus: !!(rework ? damageReworkBonus : damageBonus),
    },
    quality: customItem.quality ?? "",
    cost: customItem.cost ?? 0,
    special: Array.isArray(customItem.special) ? customItem.special : [],
    dataType: "weapon",
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Form */}
        <Grid size={{ xs: 12, sm: 6 }}>
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
              headerText={t("Rare Weapons")}
              icon={<AutoAwesome fontSize="large" />}
              actionIcon={<Search fontSize="large" />}
              onAction={() => setBaseBrowserOpen(true)}
              actionTooltip={t("Browse Compendium")}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="base"
                cols={1}
              />
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                label={t("Weapon")}
                cols={2}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="accuracy"
                cols={2}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="damage"
                cols={2}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
                cols={2}
                extraProps={{ onBrowse: () => setQualityBrowserOpen(true) }}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="rareBonus"
                cols={1}
                extraProps={{
                  rework,
                  totalBonus,
                  basePrec: calcWeaponPrec({
                    base,
                    rework: false,
                    precBonus: false,
                    precModifier: 0,
                  }),
                }}
              />
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="rare"
                cols={2}
              />
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="modifiers"
                cols={2}
              />
            </Grid>
            <Grid container spacing={2}>
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
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleClearFields}
                >
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
        {/* Preview */}
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{ position: "sticky", top: stickyTop, alignSelf: "flex-start" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SharedWeaponCard
              item={base}
              variant="equip"
              imageMode="slot"
              showImageToggle
            />
            <Typography sx={{ textAlign: "center" }}>
              <ArrowDownward />
            </Typography>
            <div ref={cardRef}>
              <SharedWeaponCard
                item={customItem}
                variant="equip"
                imageMode="slot"
                showImageToggle
                actionContent={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Tooltip title={t("Download as Image")}>
                      <IconButton onClick={downloadImage}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Export name={name} dataType="weapon" data={exportItem} />
                    <AddToCompendiumButton
                      itemType="weapon"
                      data={exportItem}
                    />
                  </div>
                }
              />
            </div>
          </div>
        </Grid>
      </Grid>
      {downloadSnackbar}
      <CompendiumViewerModal
        open={qualityBrowserOpen}
        onClose={() => setQualityBrowserOpen(false)}
        onAddItem={handleQualitySelected}
        initialType="qualities"
        restrictToTypes={["qualities"]}
        initialQualityFilters={["weapon"]}
      />
      <CompendiumViewerModal
        open={baseBrowserOpen}
        onClose={() => setBaseBrowserOpen(false)}
        onAddItem={handleBaseSelected}
        initialType="weapons"
        restrictToTypes={["weapons"]}
      />
    </>
  );
}
export default Weapons;
