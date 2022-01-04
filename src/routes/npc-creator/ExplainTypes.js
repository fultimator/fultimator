import { Card, Typography } from "@mui/material";
import { typeList, TypeName, TypeIcon } from "../../components/types";

function ExplainTypes({ npc }) {
  return (
    <Card sx={{ p: 1.61 }}>
      <Typography>Legenda dei tipi</Typography>
      {typeList.map((type) => {
        return (
          <Typography key={type} component="div">
            <TypeIcon type={type} /> <TypeName type={type} />
          </Typography>
        );
      })}
    </Card>
  );
}

export default ExplainTypes;
