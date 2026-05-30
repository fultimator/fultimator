import { Grid, Paper, useTheme, Button, Typography } from "@mui/material";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import {
  AutoAwesome,
  ArrowDownward,
  Download,
  Search,
} from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import useDownloadImage from "../../../hooks/useDownloadImage";
import { useState, useRef } from "react";
import armorBases from "../../../libs/armor";
import shieldBases from "../../../libs/shields";
import {
  SharedArmorCard,
  SharedShieldCard,
} from "../../../components/shared/itemCards";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import {
  armorFieldConfig,
  armorGroupLabels,
} from "../../../forms/rendering/config/itemConfigs/armor";
import {
  shieldFieldConfig,
  shieldGroupLabels,
} from "../../../forms/rendering/config/itemConfigs/shield";

function buildState(base) {
  return {
    itemType: base.category === "Shield" ? "shield" : "armor",
    base,
    name: base.name,
    martial: base.martial ?? false,
    def: base.def ?? 0,
    mdef: base.mdef ?? 0,
    init: base.init ?? 0,
    rework: false,
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    cost: base.cost ?? 0,
    defModifier: 0,
    mDefModifier: 0,
    initModifier: 0,
    magicModifier: 0,
    precModifier: 0,
    damageMeleeModifier: 0,
    damageRangedModifier: 0,
    isEquipped: false,
    isSlotsVariant: false,
    slots: "alpha",
    slotted: [],
    modifiers: {
      def: 0,
      mdef: 0,
      init: 0,
      magic: 0,
      accuracy: 0,
      damageMelee: 0,
      damageRanged: 0,
    },
  };
}

function applyFileUpload(rawData, bases) {
  const baseMatch = rawData.base
    ? (bases.find((b) => b.name === rawData.base?.name) ?? bases[0])
    : bases[0];
  const next = buildState(baseMatch);
  if (rawData.name) next.name = rawData.name;
  if (rawData.quality) {
    next.selectedQuality = "";
    next.quality = rawData.quality;
  }
  if (rawData.martial !== undefined) next.martial = rawData.martial;
  if (rawData.qualityCost) next.qualityCost = rawData.qualityCost;
  if (rawData.rework) next.rework = rawData.rework;
  if (rawData.defModifier) next.defModifier = rawData.defModifier;
  if (rawData.mDefModifier) next.mDefModifier = rawData.mDefModifier;
  if (rawData.initModifier) next.initModifier = rawData.initModifier;
  if (rawData.magicModifier) next.magicModifier = rawData.magicModifier;
  if (rawData.precModifier ?? rawData.modifiers?.accuracy)
    next.precModifier = rawData.modifiers?.accuracy ?? rawData.precModifier;
  if (rawData.damageMeleeModifier)
    next.damageMeleeModifier = rawData.damageMeleeModifier;
  if (rawData.damageRangedModifier)
    next.damageRangedModifier = rawData.damageRangedModifier;
  next.cost = (baseMatch.cost ?? 0) + (Number(next.qualityCost) || 0);
  return next;
}

function ItemPanel({
  title,
  bases,
  fieldConfig,
  groupLabels,
  SharedCard,
  itemTypeFilter,
  variant = "equip",
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const stickyTop = useStickyTop();

  const [formState, setFormState] = useState(() => buildState(bases[0]));
  const [qualityBrowserOpen, setQualityBrowserOpen] = useState(false);
  const [baseBrowserOpen, setBaseBrowserOpen] = useState(false);

  const handleBaseSelected = (item) => {
    const matched =
      bases.find((b) => b.name === item.base?.name || b.name === item.name) ??
      bases[0];
    setFormState(applyFileUpload(item, bases.length ? bases : [matched]));
    setBaseBrowserOpen(false);
  };

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    formState.name,
    cardRef,
  );

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

  const handleFileUpload = (rawData) => {
    if (!rawData) return;
    setFormState(applyFileUpload(rawData, bases));
  };

  const customItem = { ...formState.base, ...formState };
  const itemType = formState.itemType;

  return (
    <>
      <Grid container spacing={2}>
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
              headerText={t(title)}
              icon={<AutoAwesome fontSize="large" />}
              actionIcon={<Search fontSize="large" />}
              onAction={() => setBaseBrowserOpen(true)}
              actionTooltip={t("Browse Compendium")}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={fieldConfig}
                groupLabels={groupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="base"
                cols={1}
              />
              <SchemaFieldRenderer
                config={fieldConfig}
                groupLabels={groupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                cols={2}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={fieldConfig}
                groupLabels={groupLabels}
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
                config={fieldConfig}
                groupLabels={groupLabels}
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
                  onClick={() => setFormState(buildState(bases[0]))}
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
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{ position: "sticky", top: stickyTop, alignSelf: "flex-start" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SharedCard
              item={formState.base}
              variant={variant}
              imageMode="slot"
              showImageToggle
            />
            <Typography sx={{ textAlign: "center" }}>
              <ArrowDownward />
            </Typography>
            <div ref={cardRef}>
              <SharedCard
                item={customItem}
                variant={variant}
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
                    <Export
                      name={formState.name}
                      dataType={itemType}
                      data={customItem}
                    />
                    <AddToCompendiumButton
                      itemType={itemType}
                      data={customItem}
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
        initialQualityFilters={[itemTypeFilter]}
      />
      <CompendiumViewerModal
        open={baseBrowserOpen}
        onClose={() => setBaseBrowserOpen(false)}
        onAddItem={handleBaseSelected}
        initialType={itemTypeFilter === "armor" ? "armor" : "shields"}
        restrictToTypes={[itemTypeFilter === "armor" ? "armor" : "shields"]}
      />
    </>
  );
}

export function ArmorPanel({ variant = "equip" }) {
  return (
    <ItemPanel
      title="Armor"
      bases={armorBases}
      fieldConfig={armorFieldConfig}
      groupLabels={armorGroupLabels}
      SharedCard={SharedArmorCard}
      itemTypeFilter="armor"
      variant={variant}
    />
  );
}

export function ShieldPanel({ variant = "equip" }) {
  return (
    <ItemPanel
      title="Shield"
      bases={shieldBases}
      fieldConfig={shieldFieldConfig}
      groupLabels={shieldGroupLabels}
      SharedCard={SharedShieldCard}
      itemTypeFilter="shield"
      variant={variant}
    />
  );
}

function ArmorShield() {
  return (
    <Grid container spacing={4}>
      <Grid size={12}>
        <ArmorPanel />
      </Grid>
      <Grid size={12}>
        <ShieldPanel />
      </Grid>
    </Grid>
  );
}

export default ArmorShield;
