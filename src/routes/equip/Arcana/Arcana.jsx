import {
  Grid,
  Paper,
  useTheme,
  Button,
  FormControl,
  TextField,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AutoAwesome, Download, Search } from "@mui/icons-material";
import { useState, useRef } from "react";
import { SharedArcanumCard } from "../../../components/shared/items";
import ChangeName from "../common/ChangeName";
import ApplyRework from "../common/ApplyRework";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import CustomTextarea from "../../../components/common/CustomTextarea";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import useDownloadImage from "../../../hooks/useDownloadImage";

function Arcana({ variant = "equip" }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const stickyTop = useStickyTop();
  const secondary = theme.palette.secondary.main;

  const [name, setName] = useState("Arcanum");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [mergeName, setMergeName] = useState("");
  const [mergeBenefit, setMergeBenefit] = useState("");
  const [pulseName, setPulseName] = useState("");
  const [pulseBenefit, setPulseBenefit] = useState("");
  const [dismissName, setDismissName] = useState("");
  const [dismissBenefit, setDismissBenefit] = useState("");
  const [rework, setRework] = useState(false);

  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(name, cardRef);

  const arcanumData = {
    name,
    description,
    domain,
    mergeName,
    mergeBenefit,
    pulseName,
    pulseBenefit,
    dismissName,
    dismissBenefit,
    rework,
    spellType: rework ? "arcanist-rework" : "arcanist",
  };

  const handleFileUpload = (data) => {
    if (data) {
      const {
        name: uploadedName,
        description: uploadedDescription,
        domain: uploadedDomain,
        mergeName: uploadedMergeName,
        mergeBenefit: uploadedMergeBenefit,
        pulseName: uploadedPulseName,
        pulseBenefit: uploadedPulseBenefit,
        dismissName: uploadedDismissName,
        dismissBenefit: uploadedDismissBenefit,
        rework: uploadedRework,
      } = data;

      if (uploadedName) {
        setName(uploadedName);
      }
      if (uploadedDescription) {
        setDescription(uploadedDescription);
      }
      if (uploadedDomain) {
        setDomain(uploadedDomain);
      }
      if (uploadedMergeName) {
        setMergeName(uploadedMergeName);
      }
      if (uploadedMergeBenefit) {
        setMergeBenefit(uploadedMergeBenefit);
      }
      if (uploadedPulseName) {
        setPulseName(uploadedPulseName);
      }
      if (uploadedPulseBenefit) {
        setPulseBenefit(uploadedPulseBenefit);
      }
      if (uploadedDismissName) {
        setDismissName(uploadedDismissName);
      }
      if (uploadedDismissBenefit) {
        setDismissBenefit(uploadedDismissBenefit);
      }
      if (uploadedRework) {
        setRework(uploadedRework);
      }
    }
  };

  const handleArcanumSelected = (item) => {
    if (item.name) setName(item.name);
    setDescription(item.description || (item.descriptionKey ? t(item.descriptionKey) : ""));
    setDomain(item.domain || (item.domainDesc ? t(item.domainDesc) : ""));
    setMergeName(item.mergeName || (item.merge ? t(item.merge) : ""));
    setMergeBenefit(item.mergeBenefit || (item.mergeDesc ? t(item.mergeDesc) : ""));
    setPulseName(item.pulseName || (item.pulse ? t(item.pulse) : ""));
    setPulseBenefit(item.pulseBenefit || (item.pulseDesc ? t(item.pulseDesc) : ""));
    setDismissName(item.dismissName || (item.dismiss ? t(item.dismiss) : ""));
    setDismissBenefit(item.dismissBenefit || (item.dismissDesc ? t(item.dismissDesc) : ""));
    if (item.rework !== undefined) setRework(item.rework);
    else if (item.spellType === "arcanist-rework") setRework(true);
    setCompendiumOpen(false);
  };

  const handleClearFields = () => {
    setName("Arcanum");
    setDescription("");
    setDomain("");
    setMergeName("");
    setMergeBenefit("");
    setPulseName("");
    setPulseBenefit("");
    setDismissName("");
    setDismissBenefit("");
  };

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: "14px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          {/* Header */}
          <CustomHeaderAlt
            headerText={t("Arcana")}
            icon={<AutoAwesome fontSize="large" />}
            actionIcon={<Search fontSize="large" />}
            onAction={() => setCompendiumOpen(true)}
          />
          <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid size={6}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="effect"
                  label={t("Domain")}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <CustomTextarea
                label={t("Description")}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxRows={10}
                maxLength={1500}
              />
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="mergeName"
                  label={t("Merge Name")}
                  value={mergeName}
                  onChange={(e) => setMergeName(e.target.value)}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <CustomTextarea
                  id="mergeBenefit"
                  label={t("Merge Benefit")}
                  value={mergeBenefit}
                  onChange={(e) => setMergeBenefit(e.target.value)}
                />
              </FormControl>
            </Grid>

            {/* Pulse fields */}
            {rework && (
              <>
                <Grid size={12}>
                  <FormControl variant="standard" fullWidth>
                    <TextField
                      id="pulseName"
                      label={t("Pulse Name")}
                      value={pulseName}
                      onChange={(e) => setPulseName(e.target.value)}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl variant="standard" fullWidth>
                    <CustomTextarea
                      id="pulseBenefit"
                      label={t("Pulse Benefit")}
                      value={pulseBenefit}
                      onChange={(e) => setPulseBenefit(e.target.value)}
                    />
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="dismissName"
                  label={t("Dismiss Name")}
                  value={dismissName}
                  onChange={(e) => setDismissName(e.target.value)}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <CustomTextarea
                  id="dismissBenefit"
                  label={t("Dismiss Benefit")}
                  value={dismissBenefit}
                  onChange={(e) => setDismissBenefit(e.target.value)}
                />
              </FormControl>
              <Divider />
            </Grid>
            <Grid size={12}>
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
                <Grid size="grow">
                  <ApplyRework rework={rework} setRework={setRework} />
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
                      const result = JSON.parse(reader.result);
                      handleFileUpload(result);
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      {/* Pretty */}
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
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
                  name={name}
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
