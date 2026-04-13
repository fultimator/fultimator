import {
  Checkbox,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  InputLabel,
  Input,
  TextField,
  Typography,
  Paper,
  useTheme,
  ThemeProvider,
  useScrollTrigger,
} from "@mui/material";
import { Spa } from '@mui/icons-material'
import { useState } from "react";
import Layout from "../../components/Layout";
import Weapons from "../equip/weapons/Weapons";
import ArmorShield from "../equip/ArmorShield/ArmorShield";
import Accessories from "../equip/Accessories/Accessories";
import Arcana from "../equip/Arcana/Arcana";
import Qualities from "../equip/Qualities/Qualities";
import CustomWeapons from "../equip/customWeapons/CustomWeapons.jsx";
import { RitualPretty, ProjectPretty } from "../equip/ritualsProjects/Pretty";
import { useTranslate } from "../../translation/translate";
import CustomHeaderAlt from '../../components/common/CustomHeaderAlt';
import CustomTextarea from "../../components/common/CustomTextarea";

const powerPMs = {
  minor: 20,
  medium: 30,
  major: 40,
  extreme: 50,
};

const powerLDs = {
  minor: 7,
  medium: 10,
  major: 13,
  extreme: 16,
};

const powerClocks = {
  minor: 4,
  medium: 6,
  major: 6,
  extreme: 8,
};

const powerCosts = {
  minor: 100,
  medium: 200,
  major: 400,
  extreme: 800,
};

const areaPMs = {
  individual: 1,
  small: 2,
  large: 3,
  huge: 4,
};

const areaCosts = {
  individual: 1,
  small: 2,
  large: 3,
  huge: 4,
};

const usesCosts = {
  consumable: 1,
  permanent: 5,
};

function RitualsProjects() {
  const { t } = useTranslate();
  const theme = useTheme();
  const appBarHidden = useScrollTrigger();
  const sectionGap = 4;
  const appBarOffset = appBarHidden ? 0 : window.innerWidth < 600 ? 56 : 64;
  const hotbarTop = appBarOffset + 8;
  const hotbarHeight = 56;
  const sectionScrollOffset = hotbarTop + hotbarHeight + 8;

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - sectionScrollOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <ThemeProvider theme={theme}>
      <Layout spacing>
        <Paper
          elevation={3}
          sx={{
            p: 1,
            mb: sectionGap,
            position: "sticky",
            top: `${hotbarTop}px`,
            zIndex: 20,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            backdropFilter: "blur(6px)",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-rituals")}>{t("Rituals")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-projects")}>{t("Projects")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-weapons")}>{t("Rare Weapons")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-custom-weapons")}>{t("Custom Weapons")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-armor-shield")}>{t("Armor & Shields")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-accessories")}>{t("Accessories")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-arcana")}>{t("Arcana")}</Button>
            <Button size="small" variant="outlined" onClick={() => scrollToSection("section-qualities")}>{t("Qualities")}</Button>
          </Box>
        </Paper>

        <Grid container spacing={2} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-rituals">
          <Grid size={12}>
            <Rituals />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-projects">
          <Grid size={12}>
            <Projects />
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-weapons">
          <Grid size={12}>
            <Weapons />
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-custom-weapons">
          <Grid size={12}>
            <CustomWeapons />
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-armor-shield">
          <Grid size={12}>
            <ArmorShield />
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-accessories">
          <Grid size={12}>
            <Accessories />
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-arcana">
          <Grid size={12}>
            <Arcana />
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ mb: sectionGap, scrollMarginTop: `${sectionScrollOffset}px` }} id="section-qualities">
          <Grid size={12}>
            <Qualities />
          </Grid>
        </Grid>

      </Layout>
    </ThemeProvider>
  );
}

function Rituals() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [power, setPower] = useState("minor");
  const [area, setArea] = useState("individual");
  const [ingredient, setIngredient] = useState(false);
  const [itemHeld, setItemHeld] = useState(false);
  const [dlReduction, setDLReduction] = useState(2);
  const [fastRitual, setFastRitual] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const ingredientMod = ingredient ? 0.5 : 1;
  const itemHeldMod = itemHeld ? dlReduction : 0;

  function calcPM() {
    return powerPMs[power] * areaPMs[area] * ingredientMod;
  }

  function calcLD() {
    return powerLDs[power] - itemHeldMod;
  }

  function calcClock() {
    let clockValue = powerClocks[power];
    if (fastRitual && clockValue >= 6) {
      clockValue -= 2;
    }
    return clockValue;
  }

  const ritualPreview = {
    name: name || t("Custom Ritual"),
    description,
    power,
    area,
    pm: calcPM(),
    dl: calcLD(),
    clock: calcClock(),
    ingredient,
    itemHeld,
    dlReduction,
    fastRitual,
    notes: [
      `${t("Area")}: ${t(area)}`,
      ingredient ? t("Using special ingredient") : null,
      itemHeld ? `${t("Override DL")}: -${dlReduction}` : null,
      fastRitual ? t("Fast Ritual") : null,
    ].filter(Boolean).join(" • "),
  };
  return (
    <>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 6,
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
            <CustomHeaderAlt headerText={t("Rituals")} icon={<Spa fontSize="large" />} />
            <Grid container>
              <Grid size={12} sx={{ mb: 1 }}>
                <TextField
                  id="ritual-name"
                  label={t("Ritual Name")}
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid size={12} sx={{ mb: 1 }}>
                <CustomTextarea
                  label={t("Description")}
                  value={description}
                  helperText=""
                  onChange={(e) => setDescription(e.target.value)}
                  maxRows={4}
                />
              </Grid>
              <Grid size={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("Potency")}</FormLabel>
                  <RadioGroup
                    aria-label="power"
                    name="power-group"
                    value={power}
                    onChange={(e) => {
                      setPower(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="minor"
                      control={<Radio />}
                      label={t("Minor")}
                    />
                    <FormControlLabel
                      value="medium"
                      control={<Radio />}
                      label={t("Medium")}
                    />
                    <FormControlLabel
                      value="major"
                      control={<Radio />}
                      label={t("Major")}
                    />
                    <FormControlLabel
                      value="extreme"
                      control={<Radio />}
                      label={t("Extreme")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("Area")}</FormLabel>
                  <RadioGroup
                    aria-label="area"
                    name="area-group"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="individual"
                      control={<Radio />}
                      label={t("Individual")}
                    />
                    <FormControlLabel
                      value="small"
                      control={<Radio />}
                      label={t("Small")}
                    />
                    <FormControlLabel
                      value="large"
                      control={<Radio />}
                      label={t("Large")}
                    />
                    <FormControlLabel
                      value="huge"
                      control={<Radio />}
                      label={t("Huge")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("Reductions")}</FormLabel>

                  <FormControlLabel
                    control={<Checkbox value={ingredient} />}
                    onChange={(e) => {
                      setIngredient(e.target.checked);
                    }}
                    label={t("Using special ingredient")}
                  />

                  <FormControlLabel
                    control={<Checkbox value={itemHeld} />}
                    onChange={(e) => {
                      setItemHeld(e.target.checked);
                    }}
                    label={t("Override DL")}
                  />
                  {itemHeld && (
                    <FormControl variant="standard" fullWidth>
                      <InputLabel htmlFor="dlReduction">
                        {t("DL Reduction")}
                      </InputLabel>
                      <Input
                        id="dlReduction"
                        type="number"
                        value={dlReduction}
                        onChange={(e) => setDLReduction(e.target.value)}
                      />
                    </FormControl>
                  )}

                  <FormControlLabel
                    control={<Checkbox value={fastRitual} />}
                    onChange={(e) => {
                      setFastRitual(e.target.checked);
                    }}
                    label={t("Fast Ritual")}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Divider />
            <Grid container sx={{ m: 1 }}>
              <Grid size={4}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {calcPM()} {t("MP")}
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {calcLD()} {t("DL")}
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {t("Clock")} {calcClock()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <RitualPretty ritual={ritualPreview} />
        </Grid>
      </Grid>
    </>
  );
}
function Projects() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [power, setPower] = useState("minor");
  const [area, setArea] = useState("individual");
  const [uses, setUses] = useState("consumable");
  const [defect, setDefect] = useState(false);
  const [tinkerers, setThinkerers] = useState(1);
  const [helpers, setHelpers] = useState(0);
  const [visionary, setVisionary] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const defectMod = defect ? 0.75 : 1;
  const cost =
    powerCosts[power] * areaCosts[area] * usesCosts[uses] * defectMod;
  const progress = Math.ceil(cost / 100 > 1 ? cost / 100 : 1);
  const progressPerDay = tinkerers * 2 + helpers + visionary;
  const days = progress / progressPerDay;

  const projectPreview = {
    name: name || t("Custom Project"),
    description,
    power,
    area,
    uses,
    defect,
    cost,
    progress,
    days: Math.ceil(days),
    tinkerers,
    helpers,
    visionary,
    progressPerDay,
    notes: [
      `${t("Area")}: ${t(area)}`,
      `${t("Uses")}: ${t(uses)}`,
      defect ? t("Has terrible flaw") : null,
      `${t("Crew")}: ${tinkerers} ${t("Tinkerers")}, ${helpers} ${t("Helpers")}, ${visionary} ${t("Visionary")}`,
      `${t("progress per day")}: ${progressPerDay}`,
    ].filter(Boolean).join(" • "),
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 6,
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
            <CustomHeaderAlt headerText={t("Projects")} icon={<Spa fontSize="large" />} />
            <Grid container>
              <Grid size={12} sx={{ mb: 1 }}>
                <TextField
                  id="project-name"
                  label={t("Project Name")}
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid size={12} sx={{ mb: 1 }}>
                <CustomTextarea
                  label={t("Description")}
                  value={description}
                  helperText=""
                  onChange={(e) => setDescription(e.target.value)}
                  maxRows={4}
                />
              </Grid>
              <Grid size={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("Potency")}</FormLabel>
                  <RadioGroup
                    aria-label="power"
                    name="power-group"
                    value={power}
                    onChange={(e) => {
                      setPower(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="minor"
                      control={<Radio />}
                      label={t("Minor")}
                    />
                    <FormControlLabel
                      value="medium"
                      control={<Radio />}
                      label={t("Medium")}
                    />
                    <FormControlLabel
                      value="major"
                      control={<Radio />}
                      label={t("Major")}
                    />
                    <FormControlLabel
                      value="extreme"
                      control={<Radio />}
                      label={t("Extreme")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("Area")}</FormLabel>
                  <RadioGroup
                    aria-label="area"
                    name="area-group"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="individual"
                      control={<Radio />}
                      label={t("Individual")}
                    />
                    <FormControlLabel
                      value="small"
                      control={<Radio />}
                      label={t("Small")}
                    />
                    <FormControlLabel
                      value="large"
                      control={<Radio />}
                      label={t("Large")}
                    />
                    <FormControlLabel
                      value="huge"
                      control={<Radio />}
                      label={t("Huge")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("Uses")}</FormLabel>
                  <RadioGroup
                    aria-label="uses"
                    name="uses-group"
                    value={uses}
                    onChange={(e) => {
                      setUses(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="consumable"
                      control={<Radio />}
                      label={t("Consumable")}
                    />
                    <FormControlLabel
                      value="permanent"
                      control={<Radio />}
                      label={t("Permanent")}
                    />
                  </RadioGroup>
                  <br />
                  <FormControlLabel
                    control={<Checkbox value={defect} />}
                    onChange={(e) => {
                      setDefect(e.target.checked);
                    }}
                    label={t("Has terrible flaw")}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1}>
              <Grid size={4}>
                <FormControl variant="standard" fullWidth>
                  <TextField
                    id="tinkerers"
                    label={t("Number of Tinkerers")}
                    type="number"
                    size="small"
                    min={1}
                    max={10}
                    value={tinkerers}
                    onChange={(e) => {
                      if (e.target.value !== "")
                        setThinkerers(parseInt(e.target.value));
                      else setThinkerers(0);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl variant="standard" fullWidth>
                  <TextField
                    id="helpers"
                    label={t("Number of Hired Helpers")}
                    type="number"
                    size="small"
                    min={1}
                    max={10}
                    value={helpers}
                    onChange={(e) => {
                      if (e.target.value !== "")
                        setHelpers(parseInt(e.target.value));
                      else setHelpers(0);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl variant="standard" fullWidth>
                  <TextField
                    id="visionary"
                    label={t("Levels in Visionary")}
                    type="number"
                    size="small"
                    min={1}
                    max={10}
                    value={visionary}
                    onChange={(e) => {
                      if (e.target.value !== "")
                        setVisionary(parseInt(e.target.value));
                      else setVisionary(0);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={4}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {cost} {t("Zenit")}
                </Typography>
                {visionary > 0 && (
                  <Typography sx={{ fontWeight: "bold" }}>
                    {visionary * 100} {t("Cost covered by Visionary")}
                  </Typography>
                )}
              </Grid>
              <Grid size={4}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {progress} {t("Progress")}
                </Typography>
              </Grid>
              <Grid size={4}>
                {days < 1 && (
                  <Typography sx={{ fontWeight: "bold" }}>
                    {t("Number of days")} {Math.ceil(days)}
                  </Typography>
                )}
                {days >= 1 && (
                  <Typography sx={{ fontWeight: "bold" }}>
                    {progressPerDay} {t("progress per day")}/ {Math.ceil(days)}{" "}
                    {t("days")}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ProjectPretty project={projectPreview} />
        </Grid>
      </Grid>
    </>
  );
}

export default RitualsProjects;
