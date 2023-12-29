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
import scroll from "./scroll.png";
import dice from "./dice.png";
import React from "react";

function Home() {
  return (
    <Layout>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "1.5em" }}>
            <CardMedia
              component="img"
              height="140"
              image={robot}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Rituals and Projects
              </Typography>
              <Typography>Calculate requirements and effects</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="generate"
              >
                Go
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "1.5em" }}>
            <CardMedia
              component="img"
              height="140"
              image={axe}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Rare Items
              </Typography>
              <Typography>Design rewards and its cost</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="equip"
              >
                Go
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "1.5em" }}>
            <CardMedia
              component="img"
              height="140"
              image={goo}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Monster Designer
              </Typography>
              <Typography>Create your own NPC!</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/npc-gallery"
              >
                Go
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "1.5em" }}>
            <CardMedia
              component="img"
              height="140"
              image={scroll}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Combat Simulator and Tracker
              </Typography>
              <Typography>Tracks HP, MP and Statuses</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/combat"
              >
                Go
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "1.5em" }}>
            <CardMedia
              component="img"
              height="140"
              image={dice}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Dice Roller
              </Typography>
              <Typography>Share your rolls with other players</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/roller"
              >
                Go
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "1.5em" }}>
            <CardMedia
              component="img"
              height="140"
              image={dice}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5">
                Dice Probability
              </Typography>
              <Typography>Calculate your probability and chance</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/probs"
              >
                Go
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Typography sx={{ p: 3 }}>
        Images and Icons are from{" "}
        <a href="https://game-icons.net/" target="_blank" rel="noreferrer">
          https://game-icons.net/
        </a>{" "}
        under CC BY 3.0 licence
      </Typography>
    </Layout>
  );
}

export default Home;
