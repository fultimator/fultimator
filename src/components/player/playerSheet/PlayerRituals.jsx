import { useState } from "react";
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
  Table,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import Clock from "./Clock";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerRituals({
  player,
  clockSections,
  setClockSections,
  clockState,
  setClockState,
  isEditMode,
  isCharacterSheet,
  compact = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

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
    (playerClass) => playerClass.benefits.rituals.ritualism,
  );

  const hasSpiritism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Spiritism",
    ),
  );

  const hasArcanism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Arcanism",
    ),
  );

  const hasElementalism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Elementalism",
    ),
  );

  const hasEntropism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Entropism",
    ),
  );

  const hasChimerism = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.currentLvl > 0 && skill.specialSkill === "Ritual Chimerism",
    ),
  );

  const resetClock = () => {
    setClockState(new Array(clockSections).fill(false));
  };

  const setNewClock = () => {
    setClockSections(calcClock());
    resetClock();
  };

  const incrementClock = () => {
    const currentFilled = clockState.filter(Boolean).length;
    if (currentFilled < clockSections) {
      const newState = new Array(clockSections).fill(false);
      for (let i = 0; i <= currentFilled; i++) {
        newState[i] = true;
      }
      setClockState(newState);
    }
  };

  const decrementClock = () => {
    const currentFilled = clockState.filter(Boolean).length;
    if (currentFilled > 0) {
      const newState = [...clockState];
      newState[currentFilled - 1] = false;
      setClockState(newState);
    }
  };

  if (
    !hasRitualism &&
    !hasSpiritism &&
    !hasArcanism &&
    !hasElementalism &&
    !hasEntropism &&
    !hasChimerism
  ) {
    return null;
  }

  const checkboxFontSize = compact
    ? { xs: "0.8em" }
    : { xs: "0.8em", sm: "1.0em", md: "1.2em" };

  const verticalHeader = (
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
        color: custom.white,
        borderRadius: "0 8px 8px 0",
        transform: "rotate(180deg)",
        fontSize: "2em",
        minHeight: "100px",
      }}
      align="center"
    >
      {t("Rituals")}
    </Typography>
  );

  const checkboxGrid = (
    <Grid
      container
      spacing={compact ? 0 : 2}
      sx={{ padding: compact ? "0.2em 0.4em" : "0.7em" }}
    >
      {[
        { checked: hasArcanism, label: "Arcanism" },
        { checked: hasChimerism, label: "Chimerism" },
        { checked: hasElementalism, label: "Elementalism" },
        { checked: hasEntropism, label: "Entropism" },
        { checked: hasRitualism, label: "Ritualism" },
        { checked: hasSpiritism, label: "Spiritism" },
      ].map(({ checked, label }) => (
        <Grid
          key={label}
          size={{
            xs: 4,
            md: 2,
          }}
        >
          <FormControlLabel
            sx={compact ? { margin: 0 } : undefined}
            control={
              <Checkbox
                checked={checked}
                size={compact ? "small" : "medium"}
                sx={{
                  pointerEvents: "none",
                  opacity: 1,
                  ...(compact && { p: "2px" }),
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: checkboxFontSize }}>
                {t(label)}
              </Typography>
            }
          />
        </Grid>
      ))}

      {isEditMode && (
        <Grid
          container
          spacing={compact ? 1 : 2}
          sx={{ padding: compact ? "0.4em" : "1em" }}
        >
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <RitualsCalculator
              compact={compact}
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
            sx={{
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Clock
              numSections={clockSections}
              size={compact ? 140 : 200}
              state={clockState}
              setState={setClockState}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Button
              variant="contained"
              size={compact ? "small" : "medium"}
              sx={{ width: "100%" }}
              onClick={setNewClock}
            >
              {t("Set New Clock")}
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
            container
            sx={{ justifyContent: "center", gap: compact ? 0.5 : 1 }}
          >
            <Tooltip title={t("Decrement")} arrow>
              <IconButton
                color="primary"
                onClick={decrementClock}
                size={compact ? "small" : "medium"}
                variant="outlined"
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Reset")} arrow>
              <IconButton
                color="primary"
                onClick={resetClock}
                size={compact ? "small" : "medium"}
                variant="outlined"
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Increment")} arrow>
              <IconButton
                color="primary"
                onClick={incrementClock}
                size={compact ? "small" : "medium"}
                variant="outlined"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      )}
    </Grid>
  );

  if (compact) {
    return (
      <>
        {isCharacterSheet ? (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: primary,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}
              >
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4">{t("Rituals")}</Typography>
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
          </Table>
        ) : (
          verticalHeader
        )}
        {checkboxGrid}
      </>
    );
  }

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <Paper
        elevation={3}
        sx={{
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          display: "flex",
          flexDirection: isCharacterSheet ? "column" : undefined,
          boxShadow: isCharacterSheet ? "none" : undefined,
        }}
      >
        {isCharacterSheet ? (
          <Typography
            variant="h1"
            sx={{
              textTransform: "uppercase",
              padding: "5px",
              backgroundColor: primary,
              color: custom.white,
              borderRadius: "8px 8px 0 0",
              fontSize: "1.5em",
            }}
            align="center"
          >
            {t("Rituals")}
          </Typography>
        ) : (
          verticalHeader
        )}
        {checkboxGrid}
      </Paper>
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

function RitualsCalculator({
  compact = false,
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

  const labelFontSize = compact
    ? { xs: "0.75em" }
    : { xs: "0.8em", sm: "1.0em", md: "1.2em" };
  const legendFontSize = compact
    ? { xs: "0.8em" }
    : { xs: "0.9em", sm: "1.1em", md: "1.3em" };
  const controlSize = compact ? "small" : "medium";
  const controlSx = compact ? { p: "2px" } : undefined;

  return (
    <Paper
      elevation={3}
      sx={{
        p: compact ? "8px" : "14px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid size={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: legendFontSize }}>
              {t("Potency")}
            </FormLabel>
            <RadioGroup
              aria-label="power"
              name="power-group"
              value={power}
              onChange={(e) => setPower(e.target.value)}
            >
              {["minor", "medium", "major", "extreme"].map((val) => (
                <FormControlLabel
                  key={val}
                  value={val}
                  sx={compact ? { margin: 0 } : undefined}
                  control={<Radio size={controlSize} sx={controlSx} />}
                  label={
                    <Typography sx={{ fontSize: labelFontSize }}>
                      {t(val.charAt(0).toUpperCase() + val.slice(1))}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: legendFontSize }}>
              {t("Area")}
            </FormLabel>
            <RadioGroup
              aria-label="area"
              name="area-group"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              {["individual", "small", "large", "huge"].map((val) => (
                <FormControlLabel
                  key={val}
                  value={val}
                  sx={compact ? { margin: 0 } : undefined}
                  control={<Radio size={controlSize} sx={controlSx} />}
                  label={
                    <Typography sx={{ fontSize: labelFontSize }}>
                      {t(val.charAt(0).toUpperCase() + val.slice(1))}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: legendFontSize }}>
              {t("Reductions")}
            </FormLabel>

            {[
              {
                value: ingredient,
                onChange: setIngredient,
                label: "Using special ingredient",
              },
              {
                value: itemHeld,
                onChange: setItemHeld,
                label: "Relevant item held",
              },
            ].map(({ value, onChange, label }) => (
              <FormControlLabel
                key={label}
                sx={compact ? { margin: 0 } : undefined}
                control={
                  <Checkbox value={value} size={controlSize} sx={controlSx} />
                }
                onChange={(e) => onChange(e.target.checked)}
                label={
                  <Typography sx={{ fontSize: labelFontSize }}>
                    {t(label)}
                  </Typography>
                }
              />
            ))}
            {itemHeld && (
              <FormControl variant="standard" fullWidth>
                <InputLabel
                  htmlFor="dlReduction"
                  sx={{ fontSize: labelFontSize }}
                >
                  {t("DL Reduction")}
                </InputLabel>
                <Input
                  id="dlReduction"
                  type="number"
                  value={dlReduction}
                  onChange={(e) => setDLReduction(e.target.value)}
                  sx={compact ? { fontSize: "0.85em" } : undefined}
                />
              </FormControl>
            )}

            <FormControlLabel
              sx={compact ? { margin: 0 } : undefined}
              control={
                <Checkbox
                  value={fastRitual}
                  size={controlSize}
                  sx={controlSx}
                />
              }
              onChange={(e) => setFastRitual(e.target.checked)}
              label={
                <Typography sx={{ fontSize: labelFontSize }}>
                  {t("Fast Ritual")}
                </Typography>
              }
            />
          </FormControl>
        </Grid>
      </Grid>
      <Divider />
      <Grid container sx={{ m: compact ? 0.5 : 1 }}>
        <Grid size={4}>
          <Typography
            sx={{
              fontSize: compact ? "0.8em" : undefined,
              fontWeight: "bold",
            }}
          >
            {calcPM} {t("MP")}
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography
            sx={{
              fontSize: compact ? "0.8em" : undefined,
              fontWeight: "bold",
            }}
          >
            {calcLD} {t("DL")}
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography
            sx={{
              fontSize: compact ? "0.8em" : undefined,
              fontWeight: "bold",
            }}
          >
            {t("Clock")} {calcClock}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
