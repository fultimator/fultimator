import { Card, Typography } from "@mui/material";
import { elementList, ElementNameIcon } from "./elements/Elements";

function ExplainElements({ npc }) {
  return (
    <Card sx={{ p: 1.61 }}>
      <Typography>Legenda dei tipi</Typography>
      {elementList.map((element) => {
        return (
          <Typography key={element} component="div">
            <ElementNameIcon element={element} />
          </Typography>
        );
      })}
    </Card>
  );
}

export default ExplainElements;
