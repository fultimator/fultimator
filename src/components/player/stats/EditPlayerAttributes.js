import React from "react";
import {
  FormControl,
  Grid,
  InputLabel,
  useTheme,
  Paper,
  Slider,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import ExplainPlayerAttributes from "./ExplainPlayerAttributes";

export default function EditPlayerAttributes({
  player,
  setPlayer,
  isEditMode,
  updateMaxStats,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const onChange = (key) => {
    return (e, value) => {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.attributes[key] = value;
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
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Attributes")}
            addItem={() => console.log(player)}
          />
        </Grid>
        {/* Attributes control */}
        <Grid item xs={12} sm={6}>
          <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
            {attributeList.map((attribute, i) => (
              <Grid
                container
                item
                xs={12}
                spacing={2}
                key={i}
                alignItems="center"
              >
                <Grid item xs={2}>
                  <InputLabel
                    id={attribute.key}
                    sx={{ fontSize: "20px", fontWeight: 400 }}
                  >
                    {attribute.label}
                  </InputLabel>
                </Grid>
                <Grid item xs={10}>
                  <FormControl variant="standard" fullWidth>
                    <Slider
                      marks={attribute.marks}
                      min={attribute.min}
                      max={attribute.max}
                      step={attribute.step}
                      size="medium"
                      value={player.attributes[attribute.key]}
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
        <Grid item xs={12} sm={6}>
          <ExplainPlayerAttributes />
        </Grid>
      </Grid>
    </Paper>
  );
}
