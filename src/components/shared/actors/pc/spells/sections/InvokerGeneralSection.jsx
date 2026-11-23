import {
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  resolveWellsprings,
  affinityIconSrc,
} from "/src/libs/player/wellsprings";

/**
 * InvokerGeneralSection - Settings tab for Invoker spell
 * Manages skill level, wellspring selection, and showInPlayerSheet
 */
export default function InvokerGeneralSection({ formState, setFormState, t }) {
  const skillLevel = formState.skillLevel || 1;
  const chosenWellspring = formState.chosenWellspring || "";
  const innerWellspring = formState.innerWellspring || false;
  const showInPlayerSheet = formState.showInPlayerSheet !== false;
  const customWellsprings = formState.customWellsprings || [];
  const alwaysActiveWellsprings = formState.alwaysActiveWellsprings || [];

  const allWellsprings = resolveWellsprings(customWellsprings);

  const handleAlwaysActiveChange = (newValue) => {
    setFormState((prev) => ({ ...prev, alwaysActiveWellsprings: newValue }));
  };

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

  return (
    <Grid container spacing={3}>
      {/* Show in Player Sheet */}
      <Grid size={12}>
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
      <Grid size={12}>
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
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          {t("Skill level determines which invocation types are available")}
        </Typography>
      </Grid>
      {/* Inner Wellspring Toggle */}
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={innerWellspring}
              onChange={handleInnerWellspringChange}
            />
          }
          label={t("Inner Wellspring")}
        />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("When enabled, one wellspring is locked as the inner wellspring")}
        </Typography>
      </Grid>
      {/* Chosen Wellspring (if Inner Wellspring enabled) */}
      {innerWellspring && (
        <Grid size={12}>
          <FormControl fullWidth>
            <InputLabel>{t("Inner Wellspring")}</InputLabel>
            <Select
              value={chosenWellspring}
              onChange={(e) => handleChosenWellspringChange(e.target.value)}
              label={t("Inner Wellspring")}
              renderValue={(val) => {
                const w = allWellsprings.find((x) => x.key === val);
                if (!w) return val;
                const label = w.label ?? w.key;
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={affinityIconSrc(w.icon)}
                      width={18}
                      height={18}
                      style={{ objectFit: "contain", flexShrink: 0 }}
                      alt={label}
                    />
                    {label}
                  </Box>
                );
              }}
            >
              {allWellsprings.map((w) => (
                <MenuItem key={w.key} value={w.key}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={affinityIconSrc(w.icon)}
                      width={18}
                      height={18}
                      style={{ objectFit: "contain", flexShrink: 0 }}
                      alt={w.label ?? w.key}
                    />
                    {w.label ?? w.key}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {/* Available Invocations Preview */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t("invoker_always_active")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          {t("invoker_always_active_hint")}
        </Typography>
        <FormControl fullWidth>
          <InputLabel>{t("invoker_always_active")}</InputLabel>
          <Select
            multiple
            value={alwaysActiveWellsprings}
            onChange={(e) => handleAlwaysActiveChange(e.target.value)}
            label={t("invoker_always_active")}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((val) => {
                  const w = allWellsprings.find((x) => x.key === val);
                  const isOrphaned = !w;
                  const label = w?.label ?? val;
                  const removeVal = (e) => {
                    e.stopPropagation();
                    handleAlwaysActiveChange(
                      alwaysActiveWellsprings.filter((v) => v !== val),
                    );
                  };
                  return (
                    <Tooltip
                      key={val}
                      title={isOrphaned ? t("invoker_missing_wellspring") : ""}
                      arrow
                      disableHoverListener={!isOrphaned}
                    >
                      <Chip
                        size="small"
                        label={
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {w && (
                              <img
                                src={affinityIconSrc(w.icon)}
                                width={14}
                                height={14}
                                style={{ objectFit: "contain", flexShrink: 0 }}
                                alt={label}
                              />
                            )}
                            <span
                              style={
                                isOrphaned
                                  ? { textDecoration: "line-through" }
                                  : undefined
                              }
                            >
                              {label}
                            </span>
                          </span>
                        }
                        onClick={isOrphaned ? removeVal : undefined}
                        onDelete={removeVal}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{
                          height: 24,
                          ...(isOrphaned && {
                            borderColor: "error.main",
                            color: "error.main",
                            bgcolor: "transparent",
                            border: "1px solid",
                            cursor: "pointer",
                          }),
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            )}
          >
            {allWellsprings.map((w) => (
              <MenuItem
                key={w.key}
                value={w.key}
                disabled={alwaysActiveWellsprings.includes(w.key)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <img
                    src={affinityIconSrc(w.icon)}
                    width={18}
                    height={18}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                    alt={w.label ?? w.key}
                  />
                  {w.label ?? w.key}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Available Invocation Types")}
        </Typography>
        <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
          {skillLevel === 1 && <Typography>{t("Blast")}</Typography>}
          {skillLevel === 2 && (
            <Typography>
              {t("Blast")}, {t("Hex")}
            </Typography>
          )}
          {skillLevel === 3 && (
            <Typography>
              {t("Blast")}, {t("Hex")}, {t("Utility")}
            </Typography>
          )}
          {skillLevel !== 1 && skillLevel !== 2 && skillLevel !== 3 && (
            <Typography>{t("None")}</Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
