import { Grid } from "@mui/material";
import { SchemaFieldRenderer } from "/src/forms/rendering/SchemaFieldRenderer";
import { npcFieldConfig } from "/src/forms/rendering/config/actorConfigs/npc";

export default function EditAffinities({ npc, setNpc }) {
  return (
    <Grid container rowSpacing={2}>
      <SchemaFieldRenderer
        config={npcFieldConfig}
        state={npc}
        onChange={setNpc}
        surface="edit"
        group="affinities"
        cols={1}
      />
    </Grid>
  );
}
