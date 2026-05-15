import {
  Grid,
  Paper,
  useTheme,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AutoAwesome, ArrowDownward, Download } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import useDownloadImage from "../../../hooks/useDownloadImage";
import { useState, useRef } from "react";
import allBases from "./base";
import {
  SharedArmorCard,
  SharedShieldCard,
} from "../../../components/shared/itemCards";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import { armorFieldConfig } from "../../../forms/rendering/config/itemConfigs/armor";
import { shieldFieldConfig } from "../../../forms/rendering/config/itemConfigs/shield";

const defaultBase = allBases[0];

function buildInitialState(base) {
  const b = base ?? defaultBase;
  return {
    itemType: b.category === "Shield" ? "shield" : "armor",
    base: b,
    name: b.name,
    martial: b.martial ?? false,
    def: b.def ?? 0,
    mdef: b.mdef ?? 0,
    init: b.init ?? 0,
    rework: false,
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    cost: b.cost ?? 0,
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

function ArmorShield() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [formState, setFormState] = useState(() => buildInitialState(null));

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    formState.name,
    cardRef,
  );

  const isShield = formState.base?.category === "Shield";
  const fieldConfig = isShield ? shieldFieldConfig : armorFieldConfig;
  const SharedCard = isShield ? SharedShieldCard : SharedArmorCard;
  const itemType = isShield ? "shield" : "armor";

  const handleBaseChange = (e) => {
    const selected = allBases.find((b) => b.name === e.target.value);
    if (!selected) return;
    setFormState(buildInitialState(selected));
  };

  const handleFileUpload = (rawData) => {
    if (!rawData) return;
    const baseMatch = rawData.base
      ? (allBases.find((b) => b.name === rawData.base?.name) ?? defaultBase)
      : defaultBase;
    const next = buildInitialState(baseMatch);
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
    setFormState(next);
  };

  const handleClearFields = () => setFormState(buildInitialState(null));

  const customItem = {
    ...formState.base,
    ...formState,
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
              headerText={t("Armor and Shield")}
              icon={<AutoAwesome fontSize="large" />}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Base")}</InputLabel>
                  <Select
                    value={formState.base?.name ?? ""}
                    label={t("Base")}
                    onChange={handleBaseChange}
                  >
                    {allBases.map((b) => (
                      <MenuItem key={b.name} value={b.name}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <SchemaFieldRenderer
                config={fieldConfig}
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
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
                label={t("Quality")}
                cols={2}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={fieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="modifiers"
                label={t("Modifiers")}
                cols={2}
              />
            </Grid>
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
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
          sx={{ position: "sticky", top: 16, alignSelf: "flex-start" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SharedCard
              item={formState.base}
              variant="equip"
              imageMode="slot"
              showImageToggle
            />
            <Typography sx={{ textAlign: "center" }}>
              <ArrowDownward />
            </Typography>
            <div ref={cardRef}>
              <SharedCard
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
    </>
  );
}
export default ArmorShield;
