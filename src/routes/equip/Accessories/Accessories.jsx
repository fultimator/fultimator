import {
  Grid,
  Paper,
  Button,
  useTheme,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useRef } from "react";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "./SelectQuality";
import ChangeName from "../common/ChangeName";
import ChangeModifiers from "../../../components/player/equipment/ChangeModifiers";
import qualities from "./qualities";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";

function Accessories() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [name, setName] = useState("");
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [defModifier, setDefModifier] = useState(0);
  const [mDefModifier, setMDefModifier] = useState(0);
  const [initModifier, setInitModifier] = useState(0);
  const [magicModifier, setMagicModifier] = useState(0);
  const [precModifier, setPrecModifier] = useState(0);
  const [damageMeleeModifier, setDamageMeleeModifier] = useState(0);
  const [damageRangedModifier, setDamageRangedModifier] = useState(0);
  const [modifiersExpanded, setModifiersExpanded] = useState(false);

  function calcCost() {
    return parseInt(qualityCost);
  }

  const cost = calcCost();

  const fileInputRef = useRef(null);

  const handleFileUpload = (data) => {
    if (data) {
      if (data.name) setName(data.name);
      if (data.quality) { setSelectedQuality(""); setQuality(data.quality); }
      if (data.qualityCost) setQualityCost(data.qualityCost);

      if (data.defModifier) { setDefModifier(data.defModifier); setModifiersExpanded(true); }
      if (data.mDefModifier) { setMDefModifier(data.mDefModifier); setModifiersExpanded(true); }
      if (data.initModifier) { setInitModifier(data.initModifier); setModifiersExpanded(true); }
      if (data.magicModifier) { setMagicModifier(data.magicModifier); setModifiersExpanded(true); }
      if (data.precModifier) { setPrecModifier(data.precModifier); setModifiersExpanded(true); }
      if (data.damageMeleeModifier) { setDamageMeleeModifier(data.damageMeleeModifier); setModifiersExpanded(true); }
      if (data.damageRangedModifier) { setDamageRangedModifier(data.damageRangedModifier); setModifiersExpanded(true); }
    }
  };

  const handleClearFields = () => {
    setName("");
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setDefModifier(0);
    setMDefModifier(0);
    setInitModifier(0);
    setMagicModifier(0);
    setPrecModifier(0);
    setDamageMeleeModifier(0);
    setDamageRangedModifier(0);
    setModifiersExpanded(false);
  };

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
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
            headerText={t("Accessories")}
            icon={<AutoAwesome fontSize="large" />}
          />
          <Grid container spacing={2} alignItems="center">
            <Grid  size={6}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid  size={6}>
              <SelectQuality
                quality={selectedQuality}
                setQuality={(e) => {
                  const quality = qualities.find(
                    (el) => el.name === e.target.value
                  );
                  setSelectedQuality(quality.name);
                  setQuality(quality.quality);
                  setQualityCost(quality.cost);
                }}
              />
            </Grid>
            <Grid  size={12}>
              <ChangeQuality
                quality={quality}
                setQuality={(e) => setQuality(e.target.value)}
                qualityCost={qualityCost}
                setQualityCost={(e) => setQualityCost(e.target.value)}
              />
              <Divider />
            </Grid>
            <Grid  size={12}>
              <Accordion
                sx={{ width: "100%" }}
                expanded={modifiersExpanded}
                onChange={() => setModifiersExpanded(!modifiersExpanded)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{t("Modifiers")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"DEF Modifier"} value={defModifier} onChange={(e) => setDefModifier(e.target.value)} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"MDEF Modifier"} value={mDefModifier} onChange={(e) => setMDefModifier(e.target.value)} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"INIT Modifier"} value={initModifier} onChange={(e) => setInitModifier(e.target.value)} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"Magic Modifier"} value={magicModifier} onChange={(e) => setMagicModifier(e.target.value)} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"Precision Modifier"} value={precModifier} onChange={(e) => setPrecModifier(e.target.value)} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"Damage (Melee) Modifier"} value={damageMeleeModifier} onChange={(e) => setDamageMeleeModifier(e.target.value)} />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4
                      }}>
                      <ChangeModifiers label={"Damage (Ranged) Modifier"} value={damageRangedModifier} onChange={(e) => setDamageRangedModifier(e.target.value)} />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Divider />
            </Grid>
            <Grid  size={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid >
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid >
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
          sm: 6
        }}>
        <Pretty
          custom={{
            name: name,
            cost: cost,
            quality: quality,
            qualityCost: qualityCost,
            selectedQuality: selectedQuality,
            defModifier: defModifier,
            mDefModifier: mDefModifier,
            initModifier: initModifier,
            magicModifier: magicModifier,
            precModifier: precModifier,
            damageMeleeModifier: damageMeleeModifier,
            damageRangedModifier: damageRangedModifier,
            damageModifier: 0,
            isEquipped: false,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default Accessories;
