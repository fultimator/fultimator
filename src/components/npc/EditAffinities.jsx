import { Grid } from "@mui/material";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { npcFieldConfig } from "../../forms/rendering/config/actorConfigs/npc";

export default function EditAffinities({ npc, setNpc }) {
  return (
    <Grid container sx={{ pr: 2, py: 2 }} rowSpacing={2}>
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
