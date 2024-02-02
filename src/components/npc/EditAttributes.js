import React from "react";
import { FormControl, Grid, InputLabel, Slider } from "@mui/material";

export function EditAttributes({ npc, setNpc }) {
  const onChange = (key) => {
    return (e, value) => {
      setNpc((prevState) => {
        const newState = { ...prevState };
        newState.attributes[key] = value;
        return newState;
      });
    };
  };

  const attributeList = [
    { key: "dexterity", label: "Dex", min: 6, max: 12, step: 2, marks: true },
    { key: "insight", label: "Ins", min: 6, max: 12, step: 2, marks: true },
    { key: "might", label: "Mig", min: 6, max: 12, step: 2, marks: true },
    { key: "will", label: "Wil",  min: 6, max: 12, step: 2, marks: [
        { value: 6, label: "d6" },
        { value: 8, label: "d8" },
        { value: 10, label: "d10" },
        { value: 12, label: "d12" },
      ],
    },
  ];

  return (
    <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
      {attributeList.map((attribute, i) => (
        <React.Fragment key={i}>
          <Grid item xs={2}>
            <InputLabel id={attribute.key} sx={{ fontSize: "20px", fontWeight: 400 }}>
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
                value={npc.attributes[attribute.key]}
                onChange={onChange(attribute.key)}
              />
            </FormControl>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
}
