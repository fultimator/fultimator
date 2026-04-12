import { useMemo } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  FormHelperText,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import attributes from "../../../../libs/attributes";

const SECOND_EFFECT_DICE = [1, 2, 3, 4, 5, 6];
const TARGET_DICE = Array.from({ length: 12 }, (_, i) => i + 1);

export default function GambleGeneralSection({ formState, setFormState, t }) {
  const targets = Array.isArray(formState.targets) ? formState.targets : [];

  const validationError = useMemo(() => {
    if (targets.length < 2) return t("At least two targets are required.");

    const normalized = targets
      .map((target) => ({
        from: Number(target?.rangeFrom),
        to: Number(target?.rangeTo),
        effect: String(target?.effect || "").trim(),
      }))
      .sort((a, b) => a.from - b.from);

    if (normalized.some((target) => !target.from || !target.to || target.from > target.to)) {
      return t("Each target range must be valid.");
    }

    for (let i = 0; i < normalized.length - 1; i += 1) {
      if (normalized[i].to >= normalized[i + 1].from) {
        return t("Ranges cannot overlap.");
      }
    }

    const covered = new Set();
    normalized.forEach((target) => {
      for (let value = target.from; value <= target.to; value += 1) covered.add(value);
    });
    if (covered.size !== 12) return t("All 12 die faces must be covered without overlap.");
    if (normalized.some((target) => !target.effect)) return t("All target effect fields must be filled out.");

    for (const target of targets) {
      if (!target?.secondRoll) continue;
      const secondEffects = Array.isArray(target.secondEffects) ? target.secondEffects : [];
      if (secondEffects.length !== 6) return t("All 6 die values for second effects must be covered.");
      const secondCovered = new Set(secondEffects.map((entry) => Number(entry?.dieValue)));
      if (secondCovered.size !== 6 || SECOND_EFFECT_DICE.some((value) => !secondCovered.has(value))) {
        return t("All 6 die values for second effects must be covered.");
      }
      if (secondEffects.some((entry) => !String(entry?.effect || "").trim())) {
        return t("All second effect fields must be filled out.");
      }
    }

    return "";
  }, [targets, t]);

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateTarget = (index, patch) => {
    setFormState((prev) => {
      const nextTargets = [...(Array.isArray(prev.targets) ? prev.targets : [])];
      nextTargets[index] = { ...nextTargets[index], ...patch };
      return { ...prev, targets: nextTargets };
    });
  };

  const addTarget = () => {
    setFormState((prev) => ({
      ...prev,
      targets: [
        ...(Array.isArray(prev.targets) ? prev.targets : []),
        { rangeFrom: 1, rangeTo: 1, effect: "", secondRoll: false, secondEffects: [] },
      ],
    }));
  };

  const removeTarget = (index) => {
    setFormState((prev) => ({
      ...prev,
      targets: (Array.isArray(prev.targets) ? prev.targets : []).filter((_, i) => i !== index),
    }));
  };

  const addSecondEffect = (targetIndex) => {
    const current = targets[targetIndex];
    const usedDice = new Set((current?.secondEffects || []).map((entry) => Number(entry?.dieValue)));
    const nextDie = SECOND_EFFECT_DICE.find((value) => !usedDice.has(value)) || 1;

    setFormState((prev) => {
      const nextTargets = [...(Array.isArray(prev.targets) ? prev.targets : [])];
      const secondEffects = Array.isArray(nextTargets[targetIndex]?.secondEffects)
        ? nextTargets[targetIndex].secondEffects
        : [];
      nextTargets[targetIndex] = {
        ...nextTargets[targetIndex],
        secondEffects: [...secondEffects, { dieValue: nextDie, effect: "" }],
      };
      return { ...prev, targets: nextTargets };
    });
  };

  const updateSecondEffect = (targetIndex, effectIndex, patch) => {
    setFormState((prev) => {
      const nextTargets = [...(Array.isArray(prev.targets) ? prev.targets : [])];
      const secondEffects = Array.isArray(nextTargets[targetIndex]?.secondEffects)
        ? [...nextTargets[targetIndex].secondEffects]
        : [];
      secondEffects[effectIndex] = { ...secondEffects[effectIndex], ...patch };
      nextTargets[targetIndex] = { ...nextTargets[targetIndex], secondEffects };
      return { ...prev, targets: nextTargets };
    });
  };

  const removeSecondEffect = (targetIndex, effectIndex) => {
    setFormState((prev) => {
      const nextTargets = [...(Array.isArray(prev.targets) ? prev.targets : [])];
      const secondEffects = Array.isArray(nextTargets[targetIndex]?.secondEffects)
        ? nextTargets[targetIndex].secondEffects.filter((_, i) => i !== effectIndex)
        : [];
      nextTargets[targetIndex] = { ...nextTargets[targetIndex], secondEffects };
      return { ...prev, targets: nextTargets };
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={t("Spell Name")}
          fullWidth
          value={formState.spellName || ""}
          onChange={(e) => updateField("spellName", e.target.value)}
          inputProps={{ maxLength: 50 }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          type="number"
          label={t("MP x Dice")}
          fullWidth
          value={formState.mp ?? 0}
          onChange={(e) => updateField("mp", Math.max(0, Number(e.target.value) || 0))}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          type="number"
          label={t("Max Throwable Dices")}
          fullWidth
          value={formState.maxTargets ?? 0}
          onChange={(e) => updateField("maxTargets", Math.max(0, Number(e.target.value) || 0))}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>{t("Attribute")}</InputLabel>
          <Select
            value={formState.attr || "will"}
            label={t("Attribute")}
            onChange={(e) => updateField("attr", e.target.value)}
          >
            {Object.keys(attributes).map((key) => (
              <MenuItem key={key} value={key}>
                {attributes[key].shortcaps}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      {targets.map((target, targetIndex) => (
        <Grid item xs={12} key={`target-${targetIndex}`}>
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Range From")}</InputLabel>
                  <Select
                    value={target.rangeFrom ?? 1}
                    label={t("Range From")}
                    onChange={(e) => updateTarget(targetIndex, { rangeFrom: Number(e.target.value) })}
                  >
                    {TARGET_DICE.map((value) => (
                      <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Range To")}</InputLabel>
                  <Select
                    value={target.rangeTo ?? 1}
                    label={t("Range To")}
                    onChange={(e) => updateTarget(targetIndex, { rangeTo: Number(e.target.value) })}
                  >
                    {TARGET_DICE.map((value) => (
                      <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label={t("Effect")}
                  fullWidth
                  size="small"
                  value={target.effect || ""}
                  onChange={(e) => updateTarget(targetIndex, { effect: e.target.value })}
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(target.secondRoll)}
                      onChange={(e) =>
                        updateTarget(targetIndex, {
                          secondRoll: e.target.checked,
                          secondEffects: e.target.checked ? (target.secondEffects || []) : [],
                        })
                      }
                    />
                  }
                  label={t("Second Roll")}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton color="error" onClick={() => removeTarget(targetIndex)}>
                  <Delete />
                </IconButton>
              </Grid>

              {target.secondRoll && (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    {(target.secondEffects || []).map((entry, effectIndex) => (
                      <Grid item xs={12} key={`target-${targetIndex}-effect-${effectIndex}`}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs={4} sm={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel>{t("Die")}</InputLabel>
                              <Select
                                value={entry.dieValue ?? 1}
                                label={t("Die")}
                                onChange={(e) =>
                                  updateSecondEffect(targetIndex, effectIndex, { dieValue: Number(e.target.value) })
                                }
                              >
                                {SECOND_EFFECT_DICE.map((die) => (
                                  <MenuItem key={die} value={die}>{die}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={8} sm={9}>
                            <TextField
                              label={t("Effect")}
                              fullWidth
                              size="small"
                              value={entry.effect || ""}
                              onChange={(e) =>
                                updateSecondEffect(targetIndex, effectIndex, { effect: e.target.value })
                              }
                              inputProps={{ maxLength: 200 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1}>
                            <IconButton color="error" onClick={() => removeSecondEffect(targetIndex, effectIndex)}>
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))}
                    {(target.secondEffects || []).length < 6 && (
                      <Grid item xs={12}>
                        <Button size="small" variant="outlined" onClick={() => addSecondEffect(targetIndex)}>
                          {t("Add Second Effect")}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button variant="contained" onClick={addTarget}>
          {t("Add Target")}
        </Button>
      </Grid>

      {validationError ? (
        <Grid item xs={12}>
          <FormHelperText error>{validationError}</FormHelperText>
        </Grid>
      ) : null}

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formState.showInPlayerSheet !== false}
              onChange={(e) => updateField("showInPlayerSheet", e.target.checked)}
            />
          }
          label={t("Show in Character Sheet")}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(formState.isMagisphere)}
              onChange={(e) => updateField("isMagisphere", e.target.checked)}
            />
          }
          label={t("Is a Magisphere?")}
        />
      </Grid>
    </Grid>
  );
}
