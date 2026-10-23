import {
  Grid,
  FormControl,
  TextField,
  FormLabel,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
  Box,
  Chip,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  ShieldOutlined,
  HealthAndSafetyOutlined,
  QueryStatsOutlined,
} from "@mui/icons-material";
import { SchemaFieldRenderer } from "/src/forms/rendering/SchemaFieldRenderer";
import { npcFieldConfig } from "/src/forms/rendering/config/actorConfigs/npc";
import { getFreeImmunities } from "/src/forms/rendering/config/actorConfigs/npcSpeciesEffects";
import { useTranslate } from "/src/translation/translate";
import React, { useMemo, useCallback, useState } from "react";

export default function EditExtra({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileTab, setMobileTab] = useState(0);

  const freeImmunities = useMemo(
    () => getFreeImmunities(npc.species || ""),
    [npc.species],
  );

  const speciesImmunityCount = useMemo(
    () => Object.values(freeImmunities).filter(Boolean).length,
    [freeImmunities],
  );

  const totalAllotted = useMemo(
    () => (npc.extra?.statusImmunity || 0) * 2 + speciesImmunityCount,
    [npc.extra?.statusImmunity, speciesImmunityCount],
  );

  const totalPicked = useMemo(
    () => Object.values(npc.immunities || {}).filter(Boolean).length,
    [npc.immunities],
  );

  const handleStatusImmunityChange = useCallback(
    (e) => {
      let value = parseFloat(e.target.value);
      if (isNaN(value)) value = 0;
      value = Math.round(value * 2) / 2;
      if (value < 0) value = 0;
      if (value > 3) value = 3;
      setNpc((prev) => ({
        ...prev,
        extra: { ...prev.extra, statusImmunity: value },
      }));
    },
    [setNpc],
  );

  const toggleSpeciesImmunity = useCallback(
    (status) => {
      setNpc((prev) => {
        const speciesGrants = prev.speciesGrants || {};
        const immunities = { ...speciesGrants.immunities };
        const npcImmunities = { ...prev.immunities };

        if (immunities[status]) {
          delete immunities[status];
          npcImmunities[status] = false;
        } else {
          immunities[status] = true;
          npcImmunities[status] = true;
        }

        return {
          ...prev,
          speciesGrants: {
            ...speciesGrants,
            immunities:
              Object.keys(immunities).length > 0 ? immunities : undefined,
          },
          immunities: npcImmunities,
        };
      });
    },
    [setNpc],
  );

  if (isMobile) {
    return (
      <Grid container spacing={1}>
        <Grid size={12}>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <BottomNavigation
              showLabels
              value={mobileTab}
              onChange={(_, newValue) => setMobileTab(newValue)}
              sx={{ mb: 1 }}
            >
              <BottomNavigationAction
                label={t("Defenses")}
                icon={<ShieldOutlined />}
              />
              <BottomNavigationAction
                label={t("Immunities")}
                icon={<HealthAndSafetyOutlined />}
              />
              <BottomNavigationAction
                label={t("Stats")}
                icon={<QueryStatsOutlined />}
              />
            </BottomNavigation>

            {mobileTab === 0 && (
              <Grid container spacing={1}>
                <Grid size={12}>
                  <Grid
                    container
                    spacing={0}
                    sx={{
                      "& .MuiFormGroup-root": {
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        columnGap: 2,
                        rowGap: 1,
                      },
                      "& .MuiFormGroup-root > .MuiFormLabel-root": {
                        gridColumn: "1 / -1",
                        mb: 0.5,
                      },
                      "& .MuiFormControl-root": {
                        gridColumn: "1 / -1",
                        mt: 1,
                      },
                      "& .MuiFormControl-root + .MuiFormControl-root": {
                        mt: 1.25,
                      },
                    }}
                  >
                    <SchemaFieldRenderer
                      config={npcFieldConfig}
                      state={npc}
                      onChange={setNpc}
                      surface="edit"
                      group="defenses"
                      cols={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {mobileTab === 1 && (
              <Grid container spacing={1}>
                <Grid size={12}>
                  <FormControl variant="standard" fullWidth sx={{ mb: 1 }}>
                    <TextField
                      type="number"
                      slotProps={{
                        htmlInput: {
                          inputMode: "decimal",
                          min: 0,
                          max: 3,
                          step: 0.5,
                        },
                        formHelperText: {
                          sx: {
                            color:
                              totalPicked > totalAllotted
                                ? "red !important"
                                : "inherit",
                          },
                        },
                      }}
                      label={t("Status Effect Immunity")}
                      value={npc.extra?.statusImmunity || 0}
                      onChange={handleStatusImmunityChange}
                      helperText={`${t("Gain 2 Immunities per 1 SP")} - ${t("Total")}: ${totalPicked} / ${totalAllotted}`}
                    />
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <Grid
                    container
                    spacing={0}
                    sx={{
                      "& .MuiFormGroup-root": {
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        columnGap: 1,
                      },
                      "& .MuiFormGroup-root > .MuiFormLabel-root": {
                        gridColumn: "1 / -1",
                        mb: 0.5,
                      },
                    }}
                  >
                    <SchemaFieldRenderer
                      config={npcFieldConfig}
                      state={npc}
                      onChange={setNpc}
                      surface="edit"
                      group="immunities"
                      cols={2}
                      extraProps={{ freeImmunities }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {mobileTab === 2 && (
              <Grid container spacing={1}>
                <SchemaFieldRenderer
                  config={npcFieldConfig}
                  state={npc}
                  onChange={setNpc}
                  surface="edit"
                  group="stats"
                  cols={3}
                />
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {/* Left column: Defenses + Stats */}
      <Grid size={6}>
        <Grid container spacing={2}>
          {/* Defenses */}
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  mb: 1.5,
                  color: "text.primary",
                }}
              >
                {t("Defenses")}
              </Typography>
              <Grid container spacing={1.5}>
                {/* Defenses */}
                <Grid size={12}>
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      "& > :first-of-type .MuiFormLabel-root": {
                        display: "none",
                      },
                    }}
                  >
                    <SchemaFieldRenderer
                      config={npcFieldConfig}
                      state={npc}
                      onChange={setNpc}
                      surface="edit"
                      group="defenses"
                      cols={1}
                    />
                  </Grid>
                </Grid>

                {/* Defense Overrides */}
                <Grid
                  size={12}
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    pt: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      mb: 1,
                      color: "text.secondary",
                    }}
                  >
                    {t("Overrides")}
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          mb: 1,
                          color: "text.secondary",
                        }}
                      >
                        {t("DEF Override")}
                      </Typography>
                      <FormControl fullWidth>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={npc.extra?.defOverride || false}
                              onChange={(e) => {
                                setNpc((prev) => ({
                                  ...prev,
                                  extra: {
                                    ...prev.extra,
                                    defOverride: e.target.checked,
                                    def: e.target.checked
                                      ? prev.extra?.def || 0
                                      : undefined,
                                  },
                                }));
                              }}
                            />
                          }
                          label={t("Override DEF")}
                        />
                      </FormControl>
                      <FormControl variant="standard" fullWidth sx={{ mt: 1 }}>
                        <TextField
                          type="number"
                          label={
                            npc.extra?.defOverride
                              ? t("DEF Value")
                              : t("DEF Bonus")
                          }
                          value={npc.extra?.def || 0}
                          onChange={(e) => {
                            setNpc((prev) => ({
                              ...prev,
                              extra: {
                                ...prev.extra,
                                def: parseInt(e.target.value) || 0,
                              },
                            }));
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          mb: 1,
                          color: "text.secondary",
                        }}
                      >
                        {t("M.DEF Override")}
                      </Typography>
                      <FormControl fullWidth>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={npc.extra?.mDefOverride || false}
                              onChange={(e) => {
                                setNpc((prev) => ({
                                  ...prev,
                                  extra: {
                                    ...prev.extra,
                                    mDefOverride: e.target.checked,
                                    mDef: e.target.checked
                                      ? prev.extra?.mDef || 0
                                      : undefined,
                                  },
                                }));
                              }}
                            />
                          }
                          label={t("Override M.DEF")}
                        />
                      </FormControl>
                      <FormControl variant="standard" fullWidth sx={{ mt: 1 }}>
                        <TextField
                          type="number"
                          label={
                            npc.extra?.mDefOverride
                              ? t("M.DEF Value")
                              : t("M.DEF Bonus")
                          }
                          value={npc.extra?.mDef || 0}
                          onChange={(e) => {
                            setNpc((prev) => ({
                              ...prev,
                              extra: {
                                ...prev.extra,
                                mDef: parseInt(e.target.value) || 0,
                              },
                            }));
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Stats */}
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  mb: 1.5,
                  color: "text.primary",
                }}
              >
                {t("Stats")}
              </Typography>
              <Grid container spacing={1}>
                <SchemaFieldRenderer
                  config={npcFieldConfig}
                  state={npc}
                  onChange={setNpc}
                  surface="edit"
                  group="stats"
                  cols={2}
                />
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {/* Right column: Immunities & Overrides */}
      <Grid size={6}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {/* Species Immunities Grant */}
            {Object.keys(freeImmunities).length > 0 && (
              <Grid size={12}>
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    mb: 1,
                    color: "text.primary",
                  }}
                >
                  Species Immunities (Free)
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {Object.entries(freeImmunities).map(([status, isFree]) =>
                    isFree ? (
                      <Chip
                        key={status}
                        size="small"
                        label={t(status, undefined, true)}
                        color={npc.immunities?.[status] ? "primary" : "default"}
                        variant={
                          npc.immunities?.[status] ? "filled" : "outlined"
                        }
                        onClick={() => toggleSpeciesImmunity(status)}
                        sx={{ cursor: "pointer" }}
                      />
                    ) : null,
                  )}
                </Box>
              </Grid>
            )}

            {/* Status Immunities */}
            <Grid size={12}>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  mb: 1.5,
                  color: "text.primary",
                }}
              >
                {t("Immunities")}
              </Typography>
              <Grid
                sx={{
                  "& > :first-of-type .MuiFormLabel-root": { display: "none" },
                }}
              >
                <SchemaFieldRenderer
                  config={npcFieldConfig}
                  state={npc}
                  onChange={setNpc}
                  surface="edit"
                  group="immunities"
                  cols={2}
                  extraProps={{ freeImmunities }}
                />
              </Grid>
            </Grid>

            {/* Overrides */}
            <Grid
              size={12}
              sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1.5 }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  mb: 1.5,
                  color: "text.secondary",
                }}
              >
                {t("Overrides")}
              </Typography>
              <FormControl variant="standard" fullWidth>
                <TextField
                  type="number"
                  slotProps={{
                    htmlInput: {
                      inputMode: "decimal",
                      min: 0,
                      max: 3,
                      step: 0.5,
                    },
                    formHelperText: {
                      sx: {
                        color:
                          totalPicked > totalAllotted
                            ? "red !important"
                            : "inherit",
                      },
                    },
                  }}
                  label={t("Status Effect Immunity")}
                  value={npc.extra?.statusImmunity || 0}
                  onChange={handleStatusImmunityChange}
                  helperText={`${t("Gain 2 Immunities per 1 SP")} - ${t("Total")}: ${totalPicked} / ${totalAllotted}`}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}
