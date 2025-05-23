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
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../translation/translate";
import Clock from "../Clock";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

export default function PlayerRituals({
  player,
  clockSections,
  setClockSections,
  clockState,
  setClockState,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

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

  const hasSpiritism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Spiritism"
    )
  );

  const hasArcanism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Arcanism"
    )
  );

  const hasElementalism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Elementalism"
    )
  );

  const hasEntropism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Entropism"
    )
  );

  const hasChimerism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Chimerism"
    )
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
          {isCharacterSheet ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: theme.primary,
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      textTransform: "uppercase",
                    },
                  }}
                >
                  <StyledTableCellHeader sx={{ width: 24 }} />
                  <StyledTableCellHeader>
                    <Typography variant="h4">{t("Rituals")}</Typography>
                  </StyledTableCellHeader>
                </TableRow>
              </TableHead>
            </Table>
          ) : (
            <Typography
              variant="h1"
              sx={{
                writingMode: "vertical-lr",
                textTransform: "uppercase",
                marginLeft: "-1px",
                marginRight: "10px",
                marginTop: "-1px",
                marginBottom: "-1px",
                backgroundColor: theme.primary,
                color: "white",
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
                minHeight: "100px",
              }}
              align="center"
            >
              {t("Rituals")}
            </Typography>
          )}
          <Grid container spacing={2} sx={{ padding: "0.4em" }}>
            <Grid item xs={4} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasArcanism}
                    sx={{ pointerEvents: "none", opacity: 1 }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em" },
                    }}
                  >
                    {t("Arcanism")}
                  </Typography>
                }
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
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em" },
                    }}
                  >
                    {t("Chimerism")}
                  </Typography>
                }
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
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em" },
                    }}
                  >
                    {t("Elementalism")}
                  </Typography>
                }
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
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em" },
                    }}
                  >
                    {t("Entropism")}
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={4} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasRitualism}
                    sx={{ pointerEvents: "none", opacity: 1 }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em" },
                    }}
                  >
                    {t("Ritualism")}
                  </Typography>
                }
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
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em" },
                    }}
                  >
                    {t("Spiritism")}
                  </Typography>
                }
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
  const theme = useCustomTheme();

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: "14px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: theme.secondary,
        }}
      >
        <Grid container>
          <Grid item xs={4}>
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{ fontSize: { xs: "0.9em", sm: "1.1em", md: "1.3em" } }}
              >
                {t("Potency")}
              </FormLabel>
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
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Minor")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="medium"
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Medium")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="major"
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Major")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="extreme"
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Extreme")}
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{ fontSize: { xs: "0.9em", sm: "1.1em", md: "1.3em" } }}
              >
                {t("Area")}
              </FormLabel>
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
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Individual")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="small"
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Small")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="large"
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Large")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="huge"
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                      }}
                    >
                      {t("Huge")}
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{ fontSize: { xs: "0.9em", sm: "1.1em", md: "1.3em" } }}
              >
                {t("Reductions")}
              </FormLabel>

              <FormControlLabel
                control={<Checkbox value={ingredient} />}
                onChange={(e) => {
                  setIngredient(e.target.checked);
                }}
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                    }}
                  >
                    {t("Using special ingredient")}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox value={itemHeld} />}
                onChange={(e) => {
                  setItemHeld(e.target.checked);
                }}
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                    }}
                  >
                    {t("Relevant item held")}
                  </Typography>
                }
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
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8em", sm: "1.0em", md: "1.2em" },
                    }}
                  >
                    {t("Fast Ritual")}
                  </Typography>
                }
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
