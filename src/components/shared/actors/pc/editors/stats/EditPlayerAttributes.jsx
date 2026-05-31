import React from "react";
import {
  Box,
  FormControl,
  Grid,
  Typography,
  Slider,
} from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ExplainPlayerAttributes from "/src/components/shared/actors/pc/editors/stats/ExplainPlayerAttributes";

export default function EditPlayerAttributes({
  player,
  setPlayer,
  isEditMode,
  updateMaxStats,
}) {
  const { t } = useTranslate();

  const onChange = (key) => {
    return (e, value) => {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.attributes = {
          ...newState.attributes,
          [key]: { ...newState.attributes[key], base: value },
        };
        return newState;
      });
      updateMaxStats();
    };
  };

  const attributeList = [
    {
      key: "dexterity",
      label: t("DEX"),
      min: 6,
      max: 12,
      step: 2,
      marks: true,
    },
    {
      key: "insight",
      label: t("INS"),
      min: 6,
      max: 12,
      step: 2,
      marks: true,
    },
    { key: "might", label: t("MIG"), min: 6, max: 12, step: 2, marks: true },
    {
      key: "willpower",
      label: t("WLP"),
      min: 6,
      max: 12,
      step: 2,
      marks: [
        { value: 6, label: "d6" },
        { value: 8, label: "d8" },
        { value: 10, label: "d10" },
        { value: 12, label: "d12" },
      ],
    },
  ];

  return (
    <SectionCard title={t("Attributes")}>
      <Box sx={{ p: "15px" }}>
      <Grid container spacing={2}>
        {/* Attributes control */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
            {attributeList.map((attribute, i) => (
              <Grid
                container
                spacing={2}
                key={i}
                sx={{ alignItems: "center" }}
                size={12}
              >
                <Grid size={2}>
                  <Typography variant="h2" sx={{ minWidth: "50px" }}>
                    {attribute.label}
                  </Typography>
                </Grid>
                <Grid size={10}>
                  <FormControl variant="standard" fullWidth>
                    <Slider
                      marks={attribute.marks}
                      min={attribute.min}
                      max={attribute.max}
                      step={attribute.step}
                      size="medium"
                      value={player.attributes[attribute.key]?.base}
                      onChange={onChange(attribute.key)}
                      disabled={!isEditMode}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
        {/* Attributes Explanation Card */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <ExplainPlayerAttributes />
        </Grid>
      </Grid>
      </Box>
    </SectionCard>
  );
}
