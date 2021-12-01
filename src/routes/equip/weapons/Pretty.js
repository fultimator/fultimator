import { Card, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import attributes from "../../../libs/attributes";
import types from "../../../libs/types";
import ReactMarkdown from "react-markdown";

function Pretty({ base, custom }) {
  console.debug("base", base);
  console.debug("custom", custom);
  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item xs>
        <PrettySingle weapon={base} />
      </Grid>
      <Grid item sx={{ mx: 1 }}>
        <Typography textAlign="center">
          <ArrowForwardIcon />
        </Typography>
      </Grid>
      <Grid item xs>
        <PrettySingle weapon={custom} />
      </Grid>
    </Grid>
  );
}

function PrettySingle({ weapon }) {
  return (
    <Card sx={{ p: 1 }}>
      <Stack>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography fontWeight="bold">{weapon.name}</Typography>
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography>{weapon.cost} z</Typography>
          </Grid>
          <Grid item>
            <Typography fontWeight="bold">
              【{attributes[weapon.att1].shortcaps} +{" "}
              {attributes[weapon.att2].shortcaps}】
              {weapon.prec !== 0 && `+${weapon.prec}`}
            </Typography>
          </Grid>
          <Grid item>
            <Typography fontWeight="bold">
              【TM + {weapon.damage}】{types[weapon.type].long}
            </Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <Typography>
              {weapon.hands === 1 && "Una mano"}
              {weapon.hands === 2 && "Due mani"}
            </Typography>
          </Grid>
          <Grid item>
            <Typography>◆</Typography>
          </Grid>
          <Grid item>
            <Typography>
              {weapon.melee && "Mischia"}
              {weapon.distance && "Distanza"}
            </Typography>
          </Grid>
        </Grid>
        <Typography>
          {!weapon.quality && "Nessuna Qualità :("}{" "}
          <ReactMarkdown allowedElements={["strong"]} unwrapDisallowed={true}>
            {weapon.quality}
          </ReactMarkdown>
        </Typography>
      </Stack>
    </Card>
  );
}

export default Pretty;
