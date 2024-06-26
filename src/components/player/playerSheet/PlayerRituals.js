import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Input,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import Clock from "./Clock";

export default function PlayerRituals({
  player,
  clockSections,
  setClockSections,
  clockState,
  setClockState,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [power, setPower] = useState("minor");
  const [area, setArea] = useState("individual");
  const [ingredient, setIngredient] = useState(false);
  const [itemHeld, setItemHeld] = useState(false);
  const [dlReduction, setDLReduction] = useState(2);
  const [fastRitual, setFastRitual] = useState(false);

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

  const hasRitualism = player.classes.some(
    (playerClass) => playerClass.benefits.rituals.ritualism
  );

  const hasSpiritism = player.classes.some(
    (playerClass) => playerClass.benefits.rituals.spiritism
  );

  const hasArcanism = player.classes.some(
    (playerClass) => playerClass.benefits.rituals.arcanism
  );

  const hasElementalism = player.classes.some(
    (playerClass) => playerClass.benefits.rituals.elementalism
  );

  const hasEntropism = player.classes.some(
    (playerClass) => playerClass.benefits.rituals.entropism
  );

  const hasChimerism = player.classes.some(
    (playerClass) => playerClass.benefits.rituals.chimerism
  );

  const resetClock = () => {
    setClockState(new Array(clockSections).fill(false));
  };

  const setNewClock = () => {
    setClockSections(calcClock());
    resetClock();
  };

  return (
    <>
      {(hasRitualism ||
        hasSpiritism ||
        hasArcanism ||
        hasElementalism ||
        hasEntropism ||
        hasChimerism) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                writingMode: "vertical-lr",
                textTransform: "uppercase",
                marginLeft: "-1px",
                marginRight: "10px",
                marginTop: "-1px",
                marginBottom: "-1px",
                backgroundColor: primary,
                color: ternary,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
                minHeight: "3.5em",
              }}
              align="center"
            >
              {t("Rituals")}
            </Typography>
            <Grid container spacing={2} sx={{ padding: "1em" }}>
              <Grid item xs={4} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasRitualism}
                      sx={{ pointerEvents: "none", opacity: 1 }}
                    />
                  }
                  label={t("Ritualism")}
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasSpiritism}
                      sx={{ pointerEvents: "none", opacity: 1 }}
                    />
                  }
                  label={t("Spiritism")}
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasArcanism}
                      sx={{ pointerEvents: "none", opacity: 1 }}
                    />
                  }
                  label={t("Arcanism")}
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasElementalism}
                      sx={{ pointerEvents: "none", opacity: 1 }}
                    />
                  }
                  label={t("Elementalism")}
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasEntropism}
                      sx={{ pointerEvents: "none", opacity: 1 }}
                    />
                  }
                  label={t("Entropism")}
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasChimerism}
                      sx={{ pointerEvents: "none", opacity: 1 }}
                    />
                  }
                  label={t("Chimerism")}
                />
              </Grid>
              {isEditMode && (
                <Grid container spacing={2} sx={{ padding: "1em" }}>
                  <Grid item xs={12} md={8}>
                    <Rituals
                      power={power}
                      setPower={setPower}
                      area={area}
                      setArea={setArea}
                      ingredient={ingredient}
                      setIngredient={setIngredient}
                      itemHeld={itemHeld}
                      setItemHeld={setItemHeld}
                      fastRitual={fastRitual}
                      setFastRitual={setFastRitual}
                      dlReduction={dlReduction}
                      setDLReduction={setDLReduction}
                      calcPM={calcPM()}
                      calcLD={calcLD()}
                      calcClock={calcClock()}
                    />
                  </Grid>

                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    item
                    xs={12}
                    md={4}
                    sx={{ textAlign: "center" }}
                  >
                    <Clock
                      numSections={clockSections}
                      size={200}
                      state={clockState}
                      setState={setClockState}
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Button
                      variant="contained"
                      sx={{ width: "100%" }}
                      onClick={setNewClock}
                    >
                      {t("Set New Clock")}
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      sx={{ width: "100%" }}
                      onClick={resetClock}
                    >
                      {t("Reset Clock")}
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}

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

const areaPMs = {
  individual: 1,
  small: 2,
  large: 3,
  huge: 4,
};

function Rituals({
  power,
  setPower,
  area,
  setArea,
  ingredient,
  setIngredient,
  itemHeld,
  setItemHeld,
  fastRitual,
  setFastRitual,
  dlReduction,
  setDLReduction,
  calcPM,
  calcLD,
  calcClock,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: "14px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
        }}
      >
        <Grid container>
          <Grid item xs={4}>
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
          <Grid item xs={4}>
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
          <Grid item xs={4}>
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
                label={t("Relevant item held")}
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
          <Grid item xs={4}>
            <Typography fontWeight="bold">
              {calcPM} {t("MP")}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography fontWeight="bold">
              {calcLD} {t("DL")}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography fontWeight="bold">
              {t("Clock")} {calcClock}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
