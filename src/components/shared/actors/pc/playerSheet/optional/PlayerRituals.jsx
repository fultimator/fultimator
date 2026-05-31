import { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Input,
  InputLabel,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useTranslate } from "../../../../../../translation/translate";
import Clock from "./Clock";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SectionCard from "../../../common/SectionCard";
import CompactSectionHeader from "../../variants/compact/CompactSectionHeader";

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

  const [power, setPower] = useState("minor");
  const [area, setArea] = useState("individual");
  const [ingredient, setIngredient] = useState(false);
  const [itemHeld, setItemHeld] = useState(false);
  const [dlReduction, setDLReduction] = useState(2);
  const [fastRitual, setFastRitual] = useState(false);

  const ingredientMod = ingredient ? 0.5 : 1;
  const itemHeldMod = itemHeld ? dlReduction : 0;

  const calcPM = () => powerPMs[power] * areaPMs[area] * ingredientMod;
  const calcLD = () => powerLDs[power] - itemHeldMod;
  const calcClock = () => {
    let v = powerClocks[power];
    if (fastRitual && v >= 6) v -= 2;
    return v;
  };

  const hasRitualism = (player?.classes ?? []).some((c) => c?.benefits?.rituals?.ritualism);
  const hasSpiritism = (player?.classes ?? []).some((c) =>
    (c?.skills ?? []).some((s) => s.currentLvl > 0 && s.specialSkill === "Ritual Spiritism"),
  );
  const hasArcanism = (player?.classes ?? []).some((c) =>
    (c?.skills ?? []).some((s) => s.currentLvl > 0 && s.specialSkill === "Ritual Arcanism"),
  );
  const hasElementalism = (player?.classes ?? []).some((c) =>
    (c?.skills ?? []).some((s) => s.currentLvl > 0 && s.specialSkill === "Ritual Elementalism"),
  );
  const hasEntropism = (player?.classes ?? []).some((c) =>
    (c?.skills ?? []).some((s) => s.currentLvl > 0 && s.specialSkill === "Ritual Entropism"),
  );
  const hasChimerism = (player?.classes ?? []).some((c) =>
    (c?.skills ?? []).some((s) => s.currentLvl > 0 && s.specialSkill === "Ritual Chimerism"),
  );

  const ritualTypes = [
    { checked: hasArcanism, label: "Arcanism" },
    { checked: hasChimerism, label: "Chimerism" },
    { checked: hasElementalism, label: "Elementalism" },
    { checked: hasEntropism, label: "Entropism" },
    { checked: hasRitualism, label: "Ritualism" },
    { checked: hasSpiritism, label: "Spiritism" },
  ];

  const hasAny = ritualTypes.some((r) => r.checked);

  const resetClock = () => setClockState(new Array(clockSections).fill(false));
  const setNewClock = () => { setClockSections(calcClock()); resetClock(); };
  const incrementClock = () => {
    const filled = clockState.filter(Boolean).length;
    if (filled < clockSections) {
      const next = new Array(clockSections).fill(false);
      for (let i = 0; i <= filled; i++) next[i] = true;
      setClockState(next);
    }
  };
  const decrementClock = () => {
    const filled = clockState.filter(Boolean).length;
    if (filled > 0) {
      const next = [...clockState];
      next[filled - 1] = false;
      setClockState(next);
    }
  };

  if (!hasAny) {
    if (compact) {
      return (
        <Typography sx={{ fontStyle: "italic", color: "text.secondary", fontSize: "0.9rem", py: 1 }}>
          {t("No rituals")}
        </Typography>
      );
    }
    return null;
  }

  // Ritual type chips row
  const typesRow = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, px: 1.5, py: 1 }}>
      {ritualTypes.map(({ checked, label }) => (
        <Chip
          key={label}
          label={t(label)}
          size="small"
          variant={checked ? "filled" : "outlined"}
          color={checked ? "primary" : "default"}
          sx={{ opacity: checked ? 1 : 0.4, fontSize: "0.75rem", height: 24 }}
        />
      ))}
    </Box>
  );

  // Calculator section (only in edit mode)
  const calculator = isEditMode && (
    <Box sx={{ px: 1.5, pb: 1.5 }}>
      {/* Two-column: options left, clock right */}
      <Grid container spacing={2} alignItems="stretch">
        {/* Left: Potency + Area + Reductions */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <Grid container spacing={1}>
            {/* Potency */}
            <Grid size={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
                {t("Potency")}
              </Typography>
              <RadioGroup value={power} onChange={(e) => setPower(e.target.value)} sx={{ mt: 0.25 }}>
                {["minor", "medium", "major", "extreme"].map((val) => (
                  <FormControlLabel
                    key={val}
                    value={val}
                    sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: "1rem" } }}
                    control={<Radio size="small" sx={{ p: "3px" }} />}
                    label={t(val.charAt(0).toUpperCase() + val.slice(1))}
                  />
                ))}
              </RadioGroup>
            </Grid>
            {/* Area */}
            <Grid size={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
                {t("Area")}
              </Typography>
              <RadioGroup value={area} onChange={(e) => setArea(e.target.value)} sx={{ mt: 0.25 }}>
                {["individual", "small", "large", "huge"].map((val) => (
                  <FormControlLabel
                    key={val}
                    value={val}
                    sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: "1rem" } }}
                    control={<Radio size="small" sx={{ p: "3px" }} />}
                    label={t(val.charAt(0).toUpperCase() + val.slice(1))}
                  />
                ))}
              </RadioGroup>
            </Grid>
            {/* Reductions */}
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
                {t("Reductions")}
              </Typography>
              <Stack sx={{ mt: 0.25 }}>
                <FormControlLabel
                  sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: "1rem" } }}
                  control={<Checkbox checked={ingredient} size="small" sx={{ p: "3px" }} onChange={(e) => setIngredient(e.target.checked)} />}
                  label={t("Using special ingredient")}
                />
                <FormControlLabel
                  sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: "1rem" } }}
                  control={<Checkbox checked={itemHeld} size="small" sx={{ p: "3px" }} onChange={(e) => setItemHeld(e.target.checked)} />}
                  label={t("Relevant item held")}
                />
                {itemHeld && (
                  <FormControl variant="standard" sx={{ maxWidth: 120, ml: 3.5, mt: 0.5 }}>
                    <InputLabel htmlFor="dlReduction" sx={{ fontSize: "0.85rem" }}>
                      {t("DL Reduction")}
                    </InputLabel>
                    <Input
                      id="dlReduction"
                      type="number"
                      value={dlReduction}
                      onChange={(e) => setDLReduction(e.target.value)}
                      sx={{ fontSize: "0.9rem" }}
                    />
                  </FormControl>
                )}
                <FormControlLabel
                  sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: "1rem" } }}
                  control={<Checkbox checked={fastRitual} size="small" sx={{ p: "3px" }} onChange={(e) => setFastRitual(e.target.checked)} />}
                  label={t("Fast Ritual")}
                />
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        {/* Right: Clock */}
        <Grid size={{ xs: 12, sm: 5 }} sx={{ display: "flex" }}>
          <Box
            sx={{
              flex: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              py: 3,
              px: 1.5,
            }}
          >
            <Clock
              numSections={clockSections}
              size={compact ? 120 : 180}
              state={clockState}
              setState={setClockState}
            />
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={t("Decrement")} arrow>
                <IconButton onClick={decrementClock} size="small">
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Reset")} arrow>
                <IconButton onClick={resetClock} size="small">
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Increment")} arrow>
                <IconButton onClick={incrementClock} size="small">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Result bar + Set New Clock */}
      <Box
        sx={{
          mt: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 1.5,
        }}
      >
        <Box sx={{ display: "flex", flex: 1, justifyContent: "space-around" }}>
          {[
            { value: calcPM(), label: t("MP") },
            { value: calcLD(), label: t("DL") },
            { value: calcClock(), label: t("Clock") },
          ].map(({ value, label }) => (
            <Box key={label} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.5rem", lineHeight: 1 }}>{value}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
            </Box>
          ))}
        </Box>
        <Button variant="contained" size="small" onClick={setNewClock} sx={{ flexShrink: 0 }}>
          {t("Set New Clock")}
        </Button>
      </Box>
    </Box>
  );

  if (compact) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ mb: 1, overflow: "hidden" }}>
        <CompactSectionHeader title={t("Rituals")} />
        {typesRow}
        {calculator}
      </Paper>
    );
  }

  return (
    <SectionCard title={t("Rituals")} noShadow={isCharacterSheet} sx={{ mb: 1 }}>
      {typesRow}
      {calculator}
    </SectionCard>
  );
}

const powerPMs = { minor: 20, medium: 30, major: 40, extreme: 50 };
const powerLDs = { minor: 7, medium: 10, major: 13, extreme: 16 };
const powerClocks = { minor: 4, medium: 6, major: 6, extreme: 8 };
const areaPMs = { individual: 1, small: 2, large: 3, huge: 4 };
