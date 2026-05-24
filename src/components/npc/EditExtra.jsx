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
} from "@mui/material";
import {
  ShieldOutlined,
  HealthAndSafetyOutlined,
  QueryStatsOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { npcFieldConfig } from "../../forms/rendering/config/actorConfigs/npc";
import { getFreeImmunities } from "../../forms/rendering/config/actorConfigs/npcSpeciesEffects";
import { useTranslate } from "../../translation/translate";
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
      let value = parseInt(e.target.value);
      if (isNaN(value)) value = 0;
      if (value < 0) value = 0;
      if (value > 3) value = 3;
      setNpc((prev) => ({
        ...prev,
        extra: { ...prev.extra, statusImmunity: value },
      }));
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
              <BottomNavigationAction
                label={t("Overrides")}
                icon={<TuneOutlined />}
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

            {mobileTab === 3 && (
              <FormControl variant="standard" fullWidth>
                <TextField
                  type="number"
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      min: 0,
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
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {/* Left: Defenses + Immunities */}
      <Grid size={6}>
        <Grid container spacing={1}>
          <SchemaFieldRenderer
            config={npcFieldConfig}
            state={npc}
            onChange={setNpc}
            surface="edit"
            group="defenses"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcFieldConfig}
            state={npc}
            onChange={setNpc}
            surface="edit"
            group="immunities"
            cols={1}
            extraProps={{ freeImmunities }}
          />
        </Grid>
      </Grid>

      {/* Right: Stats + Overrides */}
      <Grid size={6}>
        <Grid container spacing={1}>
          <SchemaFieldRenderer
            config={npcFieldConfig}
            state={npc}
            onChange={setNpc}
            surface="edit"
            group="stats"
            cols={3}
          />
          <Grid size={12}>
            <FormLabel sx={{ display: "block", mb: 1 }}>
              {t("Overrides")}
            </FormLabel>
            <FormControl variant="standard" fullWidth>
              <TextField
                type="number"
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 0,
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
      </Grid>
    </Grid>
  );
}
