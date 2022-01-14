import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import Layout from "../components/Layout";

import goo from "./goo.png";
import robot from "./robot.png";
import axe from "./axe.png";

function Home() {
  return (
    <Layout>
      <Grid container spacing={3}>
        <Grid item>
          <Card sx={{ width: 300 }}>
            <CardMedia
              component="img"
              height="140"
              image={robot}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Rituali e Progetti
              </Typography>
              <Typography>Calcola requisiti ed effetti</Typography>
              <Typography variant="caption">
                Questo è più facile del creatore di mostri!
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="rituals"
              >
                Vai
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item>
          <Card sx={{ width: 300 }}>
            <CardMedia
              component="img"
              height="140"
              image={axe}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Oggetti rari
              </Typography>
              <Typography>Progetta ricompense</Typography>
              <Typography variant="caption">Senza esagerare</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="equip"
              >
                Vai
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item>
          <Card sx={{ width: 300 }}>
            <CardMedia
              component="img"
              height="140"
              image={goo}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Progettare PNG
              </Typography>
              <Typography>Crea il tuo PNG!</Typography>
              <Typography variant="caption">
                Puoi anche salvarteli adesso :O
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/npc-gallery"
              >
                Vai
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Home;
