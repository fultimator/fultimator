import { Grid, Paper, Button, useTheme, Tabs, Tab, IconButton, Tooltip } from "@mui/material";
import { AutoAwesome, Download } from "@mui/icons-material";
import { useState, useRef } from "react";
import { SharedQualityCard } from "../../../components/shared/itemCards";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import useUploadJSON from "../../../hooks/useUploadJSON";
import QualitiesGenerator from "./QualitiesGenerator";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import useDownloadImage from "../../../hooks/useDownloadImage";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import {
  qualityFieldConfig,
  qualityGroupLabels,
} from "../../../forms/rendering/config/itemConfigs/quality";

function buildInitialState() {
  return {
    name: "",
    category: "Offensive",
    quality: "",
    cost: 0,
    filter: [],
    selectedBase: "",
  };
}

function Qualities({ variant = "equip" }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const stickyTop = useStickyTop();
  const secondary = theme.palette.secondary.main;

  const [tab, setTab] = useState(0);
  const [formState, setFormState] = useState(buildInitialState);

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(formState.name, cardRef);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (!data) return;
    setFormState((prev) => ({
      ...prev,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.quality !== undefined && { quality: data.quality }),
      ...(data.cost !== undefined && { cost: data.cost }),
      ...(data.filter !== undefined && { filter: data.filter }),
    }));
  });

  const handleClearFields = () => setFormState(buildInitialState());

  const qualityData = {
    name: formState.name,
    category: formState.category,
    quality: formState.quality,
    cost: formState.cost,
    filter: formState.filter,
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
            headerText={t("Qualities")}
            icon={<AutoAwesome fontSize="large" />}
          />

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              mb: 2,
              "& .MuiTab-root": {
                color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : undefined,
              },
              "& .MuiTab-root.Mui-selected": {
                color: theme.palette.mode === "dark" ? "#ffffff" : undefined,
                fontWeight: 700,
              },
            }}
          >
            <Tab label={t("Custom")} />
            <Tab label={t("Generator")} />
          </Tabs>

          {tab === 0 && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={qualityFieldConfig}
                  groupLabels={qualityGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="core"
                  cols={2}
                />
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={qualityFieldConfig}
                  groupLabels={qualityGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="quality"
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
                  <Button variant="outlined" fullWidth onClick={handleClearFields}>
                    {t("Clear All Fields")}
                  </Button>
                </Grid>
              </Grid>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </>
          )}

          {tab === 1 && (
            <QualitiesGenerator onGenerate={(text) => setFormState((prev) => ({ ...prev, quality: text }))} />
          )}
        </Paper>
      </Grid>

      {/* Card preview */}
      <Grid
        size={{ xs: 12, sm: 6 }}
        sx={{ position: "sticky", top: stickyTop, alignSelf: "flex-start" }}
      >
        <div ref={cardRef}>
          <SharedQualityCard
            item={qualityData}
            variant={variant}
            imageMode="slot"
            showImageToggle
            actionContent={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tooltip title={t("Download as Image")}>
                  <IconButton onClick={downloadImage}>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Export name={formState.name} dataType="qualities" data={qualityData} />
                <AddToCompendiumButton itemType="quality" data={qualityData} />
              </div>
            }
          />
        </div>
      </Grid>
      {downloadSnackbar}
    </Grid>
  );
}

export default Qualities;
