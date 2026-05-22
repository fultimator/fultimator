import { Grid, Paper, Button, useTheme } from "@mui/material";
import { AutoAwesome, Download } from "@mui/icons-material";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import { IconButton, Tooltip } from "@mui/material";
import useDownloadImage from "../../../hooks/useDownloadImage";
import { useState, useRef } from "react";
import { SharedAccessoryCard } from "../../../components/shared/itemCards";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import {
  accessoryFieldConfig,
  accessoryGroupLabels,
} from "../../../forms/rendering/config/itemConfigs/accessory";

function buildInitialState() {
  return {
    itemType: "accessory",
    name: "",
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    cost: 0,
    defModifier: 0,
    mDefModifier: 0,
    initModifier: 0,
    magicModifier: 0,
    precModifier: 0,
    damageMeleeModifier: 0,
    damageRangedModifier: 0,
    isEquipped: false,
  };
}

function Accessories() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const stickyTop = useStickyTop();

  const [formState, setFormState] = useState(buildInitialState);
  const [qualityBrowserOpen, setQualityBrowserOpen] = useState(false);

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

  const handleFileUpload = (rawData) => {
    if (!rawData) return;
    const next = buildInitialState();
    if (rawData.name) next.name = rawData.name;
    if (rawData.quality) {
      next.selectedQuality = "";
      next.quality = rawData.quality;
    }
    if (rawData.qualityCost) next.qualityCost = rawData.qualityCost;
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
    next.cost = Number(next.qualityCost) || 0;
    setFormState(next);
  };

  const handleClearFields = () => setFormState(buildInitialState());

  const { name, cost, quality, qualityCost } = formState;

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
              headerText={t("Accessories")}
              icon={<AutoAwesome fontSize="large" />}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={accessoryFieldConfig}
                groupLabels={accessoryGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                cols={1}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={accessoryFieldConfig}
                groupLabels={accessoryGroupLabels}
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
                config={accessoryFieldConfig}
                groupLabels={accessoryGroupLabels}
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
          <div ref={cardRef}>
            <SharedAccessoryCard
              variant="equip"
              item={formState}
              imageMode="slot"
              showImageToggle
              actionContent={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Tooltip title={t("Download as Image")}>
                    <IconButton onClick={downloadImage}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Export
                    name={name}
                    dataType="accessory"
                    data={{ name, cost, quality, qualityCost }}
                  />
                  <AddToCompendiumButton
                    itemType="accessory"
                    data={{ name, cost, quality, qualityCost }}
                  />
                </div>
              }
            />
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
        initialQualityFilters={["accessory"]}
      />
    </>
  );
}
export default Accessories;
