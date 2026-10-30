import {
  Grid,
  Paper,
  Button,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AutoAwesome, Download, Search } from "@mui/icons-material";
import { useState, useRef } from "react";
import { SharedArcanumCard } from "../../../components/shared/items";
import ApplyRework from "../common/ApplyRework";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import useDownloadImage from "../../../hooks/useDownloadImage";
import useUploadJSON from "../../../hooks/useUploadJSON";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import { playerSpellFieldConfig } from "../../../forms/rendering/config/itemConfigs/spells";

function buildInitialState() {
  return {
    spellType: "arcanist",
    fuid: undefined,
    name: "Arcanum",
    // default fields (zeroed)
    class: "",
    isOffensive: false,
    "cost.resource": "mp",
    "cost.amount": 0,
    "cost.perTarget": false,
    maxTargets: 1,
    targetDescription: "",
    duration: "",
    "accuracy.attr1": "insight",
    "accuracy.attr2": "will",
    "accuracy.value": 0,
    "accuracy.defense": "mdef",
    "damage.value": 0,
    "damage.type": "physical",
    "damage.hrZero": false,
    description: "",
    // arcanist fields
    domain: "",
    domainDesc: "",
    merge: "",
    mergeDesc: "",
    pulse: "",
    pulseDesc: "",
    dismiss: "",
    dismissDesc: "",
    // other fields (zeroed)
    category: "",
    infusionRank: null,
    event: "",
    genoclepsis: "",
    type: "",
    status: "",
    attribute: "",
    recovery: "",
    effect: "",
    wellspring: "",
    cookingEffects: [],
    "meta.book": "",
    "meta.page": undefined,
    "meta.bookName": "",
    "meta.isOfficial": false,
  };
}

function Arcana({ variant = "equip" }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const stickyTop = useStickyTop();
  const secondary = theme.palette.secondary.main;

  const [formState, setFormState] = useState(buildInitialState);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    formState.name,
    cardRef,
  );

  const { handleFileUpload } = useUploadJSON((data) => {
    if (!data) return;
    setFormState((prev) => ({
      ...prev,
      name: data.name ?? prev.name,
      domain:
        data.domain ?? (data.domainDesc ? t(data.domainDesc) : prev.domain),
      domainDesc: data.domainDesc
        ? t(data.domainDesc)
        : (data.domain ?? prev.domainDesc),
      merge: data.merge ? t(data.merge) : (data.mergeName ?? prev.merge),
      mergeDesc: data.mergeDesc
        ? t(data.mergeDesc)
        : (data.mergeBenefit ?? prev.mergeDesc),
      pulse: data.pulse ? t(data.pulse) : (data.pulseName ?? prev.pulse),
      pulseDesc: data.pulseDesc
        ? t(data.pulseDesc)
        : (data.pulseBenefit ?? prev.pulseDesc),
      dismiss: data.dismiss
        ? t(data.dismiss)
        : (data.dismissName ?? prev.dismiss),
      dismissDesc: data.dismissDesc
        ? t(data.dismissDesc)
        : (data.dismissBenefit ?? prev.dismissDesc),
      spellType:
        data.spellType ?? (data.rework ? "arcanist-rework" : "arcanist"),
      fuid: data.fuid ?? prev.fuid,
    }));
  });

  const handleArcanumSelected = (item) => {
    setFormState((prev) => ({
      ...prev,
      name: item.name ?? prev.name,
      domain:
        item.domain ?? (item.domainDesc ? t(item.domainDesc) : prev.domain),
      domainDesc: item.domainDesc
        ? t(item.domainDesc)
        : (item.domain ?? prev.domainDesc),
      merge: item.merge ? t(item.merge) : (item.mergeName ?? prev.merge),
      mergeDesc: item.mergeDesc
        ? t(item.mergeDesc)
        : (item.mergeBenefit ?? prev.mergeDesc),
      pulse: item.pulse ? t(item.pulse) : (item.pulseName ?? prev.pulse),
      pulseDesc: item.pulseDesc
        ? t(item.pulseDesc)
        : (item.pulseBenefit ?? prev.pulseDesc),
      dismiss: item.dismiss
        ? t(item.dismiss)
        : (item.dismissName ?? prev.dismiss),
      dismissDesc: item.dismissDesc
        ? t(item.dismissDesc)
        : (item.dismissBenefit ?? prev.dismissDesc),
      spellType:
        item.spellType ?? (item.rework ? "arcanist-rework" : "arcanist"),
      fuid: item.fuid ?? prev.fuid,
    }));
    setCompendiumOpen(false);
  };

  const handleClearFields = () => setFormState(buildInitialState());

  const isRework = formState.spellType === "arcanist-rework";

  const arcanumData = {
    spellType: formState.spellType,
    rework: isRework,
    name: formState.name,
    fuid: formState.fuid,
    domain: formState.domain,
    domainDesc: formState.domainDesc,
    merge: formState.merge,
    mergeDesc: formState.mergeDesc,
    pulse: formState.pulse,
    pulseDesc: formState.pulseDesc,
    dismiss: formState.dismiss,
    dismissDesc: formState.dismissDesc,
    description: formState.description,
  };

  return (
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
            headerText={t("Arcana")}
            icon={<AutoAwesome fontSize="large" />}
            actionIcon={<Search fontSize="large" />}
            onAction={() => setCompendiumOpen(true)}
          />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <SchemaFieldRenderer
              config={playerSpellFieldConfig.filter(
                (f) => f.key !== "spellType",
              )}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
            />
          </Grid>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <SchemaFieldRenderer
              config={playerSpellFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="arcanist"
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
              <Button variant="outlined" fullWidth onClick={handleClearFields}>
                {t("Clear All Fields")}
              </Button>
            </Grid>
            <Grid size={12}>
              <ApplyRework
                rework={isRework}
                setRework={(val) =>
                  setFormState((prev) => ({
                    ...prev,
                    spellType: val ? "arcanist-rework" : "arcanist",
                  }))
                }
              />
            </Grid>
          </Grid>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
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
          <SharedArcanumCard
            item={arcanumData}
            variant={variant}
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
                  name={formState.name}
                  dataType="player-spells"
                  data={arcanumData}
                />
                <AddToCompendiumButton
                  itemType="player-spell"
                  data={arcanumData}
                />
              </div>
            }
          />
        </div>
      </Grid>
      {downloadSnackbar}
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleArcanumSelected}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Arcanist"
      />
    </Grid>
  );
}
export default Arcana;
