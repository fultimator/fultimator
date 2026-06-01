import React from "react";
import { Grid } from "@mui/material";
import { SchemaFieldRenderer } from "/src/forms/rendering/SchemaFieldRenderer";
import { npcFieldConfig } from "/src/forms/rendering/config/actorConfigs/npc";

export function EditAttributes({ npc, setNpc }) {
  return (
    <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
      <SchemaFieldRenderer
        config={npcFieldConfig}
        state={npc}
        onChange={setNpc}
        surface="edit"
        group="attributes"
        cols={1}
      />
    </Grid>
  );
}
