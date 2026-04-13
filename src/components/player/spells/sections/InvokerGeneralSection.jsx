import { Grid, FormControlLabel, Switch, Typography, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { invocationsByWellspring } from "../spellOptionData";

/**
 * InvokerGeneralSection - Settings tab for Invoker spell
 * Manages skill level, wellspring selection, and showInPlayerSheet
 */
export default function InvokerGeneralSection({ formState, setFormState, t }) {
  const skillLevel = formState.skillLevel || 1;
  const chosenWellspring = formState.chosenWellspring || "";
  const innerWellspring = formState.innerWellspring || false;
  const showInPlayerSheet = formState.showInPlayerSheet !== false;

  const handleSkillLevelChange = (newLevel) => {
    setFormState((prev) => ({ ...prev, skillLevel: Number(newLevel) }));
  };

  const handleChosenWellspringChange = (newWellspring) => {
    setFormState((prev) => ({ ...prev, chosenWellspring: newWellspring }));
  };

  const handleInnerWellspringChange = (e) => {
    setFormState((prev) => ({ ...prev, innerWellspring: e.target.checked }));
  };

  const handleShowInPlayerSheetChange = (e) => {
    setFormState((prev) => ({ ...prev, showInPlayerSheet: e.target.checked }));
  };

  const getAvailableInvocations = (level) => {
    const availableTypes = [];
    switch (level) {
      case 1:
        availableTypes.push("Blast");
        break;
      case 2:
        availableTypes.push("Blast", "Hex");
        break;
      case 3:
        availableTypes.push("Blast", "Hex", "Utility");
        break;
      default:
        return [];
    }

    const invocations = [];
    Object.entries(invocationsByWellspring).forEach(([wellspring, invs]) => {
      invs.forEach((inv) => {
        if (availableTypes.includes(inv.type)) {
          invocations.push({ ...inv, wellspring });
        }
      });
    });
    return invocations;
  };

  return (
    <Grid container spacing={3}>
      {/* Show in Player Sheet */}
      <Grid  size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={showInPlayerSheet}
              onChange={handleShowInPlayerSheetChange}
            />
          }
          label={t("Show in Character Sheet")}
        />
      </Grid>
      {/* Skill Level */}
      <Grid  size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Skill Level")}
        </Typography>
        <FormControl fullWidth>
          <InputLabel>{t("Skill Level")}</InputLabel>
          <Select
            value={skillLevel}
            onChange={(e) => handleSkillLevelChange(e.target.value)}
            label={t("Skill Level")}
          >
            <MenuItem value={1}>{t("Skill Level 1 (Blast)")}</MenuItem>
            <MenuItem value={2}>{t("Skill Level 2 (Blast + Hex)")}</MenuItem>
            <MenuItem value={3}>{t("Skill Level 3 (All Types)")}</MenuItem>
          </Select>
        </FormControl>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 1
          }}>
          {t("Skill level determines which invocation types are available")}
        </Typography>
      </Grid>
      {/* Inner Wellspring Toggle */}
      <Grid  size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={innerWellspring}
              onChange={handleInnerWellspringChange}
            />
          }
          label={t("Inner Wellspring")}
        />
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          {t("When enabled, one wellspring is locked as the inner wellspring")}
        </Typography>
      </Grid>
      {/* Chosen Wellspring (if Inner Wellspring enabled) */}
      {innerWellspring && (
        <Grid  size={12}>
          <FormControl fullWidth>
            <InputLabel>{t("Inner Wellspring")}</InputLabel>
            <Select
              value={chosenWellspring}
              onChange={(e) => handleChosenWellspringChange(e.target.value)}
              label={t("Inner Wellspring")}
            >
              {Object.keys(invocationsByWellspring).map((wellspring) => (
                <MenuItem key={wellspring} value={wellspring}>
                  {t(wellspring)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {/* Available Invocations Preview */}
      <Grid  size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Available Invocation Types")}
        </Typography>
        <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
          {(() => {
            const availableTypes = [];
            switch (skillLevel) {
              case 1:
                return <Typography>{t("Blast")}</Typography>;
              case 2:
                return <Typography>{t("Blast")}, {t("Hex")}</Typography>;
              case 3:
                return (
                  <Typography>
                    {t("Blast")}, {t("Hex")}, {t("Utility")}
                  </Typography>
                );
              default:
                return <Typography>{t("None")}</Typography>;
            }
          })()}
        </Box>
      </Grid>
    </Grid>
  );
}
