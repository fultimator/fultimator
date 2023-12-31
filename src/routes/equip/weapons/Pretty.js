import { Card, Grid, Stack, Typography } from "@mui/material";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import attributes from "../../../libs/attributes";
import types from "../../../libs/types";
import ReactMarkdown from "react-markdown";

function Pretty({ base, custom }) {
  console.debug("base", base);
  console.debug("custom", custom);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <PrettySingle weapon={base} />
      <Typography textAlign="center">
        <ArrowDownward />
      </Typography>
      <PrettySingle weapon={custom} />
    </div>
  );
}

function PrettySingle({ weapon }) {
  return (
    <Card sx={{ p: 1, mb: 2 }}>
      <Stack>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography fontWeight="bold">{weapon.name}</Typography>
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography fontWeight="bold">
              {weapon.cost} z 【{attributes[weapon.att1].shortcaps} +{" "}
              {attributes[weapon.att2].shortcaps}】
              {weapon.prec !== 0 && `+${weapon.prec}`}
              【HR + {weapon.damage}】{types[weapon.type].long}
            </Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <Typography>
              {weapon.hands === 1 && "One Hand"}
              {weapon.hands === 2 && "Two Hands"}
            </Typography>
          </Grid>
          <Grid item>
            <Typography>◆</Typography>
          </Grid>
          <Grid item>
            <Typography>
              {weapon.melee && "Melee"}
              {weapon.ranged && "Distant"}
            </Typography>
          </Grid>
        </Grid>
        <Typography>
          {!weapon.quality && "No Qualities"}{" "}
          <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
            {weapon.quality}
          </ReactMarkdown>
        </Typography>
      </Stack>
    </Card>
  );
}

export default Pretty;
