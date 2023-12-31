import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import Layout from "../components/Layout";

import goo from "./goo.png";
import book from "./book.png";
import axe from "./axe.png";
import scroll from "./scroll.png";
import dice from "./dice.png";
import React from "react";

function Home() {
  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Card sx={{ padding: "1.5em", width: 300 }}>
          <CardMedia
            component="img"
            height="140"
            image={goo}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5">
              Adversary Designer
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

        <Card sx={{ padding: "1.5em", width: 300 }}>
          <CardMedia
            component="img"
            height="140"
            image={book}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5">
              Adversary Compedium
            </Typography>
            <Typography>
              View and copy creations made by other people!
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              variant="outlined"
              component={RouterLink}
              to="/npc-compedium"
            >
              Go
            </Button>
          </CardActions>
        </Card>

        <Card sx={{ padding: "1.5em", width: 300 }}>
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

        <Card sx={{ padding: "1.5em", width: 300 }}>
          <CardMedia
            component="img"
            height="140"
            image={axe}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5">
              Items, Projects, Rituals
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

        <Card sx={{ padding: "1.5em", width: 300 }}>
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
      </div>

      <Typography sx={{ p: 3 }}>
        Monster Icons are from{" "}
        <a href="http://www.akashics.moe/" target="_blank" rel="noreferrer">
          http://www.akashics.moe/
        </a>
      </Typography>
    </Layout>
  );
}

export default Home;
