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

import npc from "./npc.jpg";

function Home() {
  return (
    <Layout>
      <Card sx={{ width: 300 }}>
        <CardMedia component="img" height="140" image={npc} alt="" />
        <CardContent>
          <Typography gutterBottom variant="h5">
            Progettare PNG
          </Typography>
          <Typography>Crea il tuo PNG!</Typography>
          <Typography variant="caption">
            Ora col 100% in più di pucciosità
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="outlined"
            component={RouterLink}
            to="/npc-creator"
          >
            Vai
          </Button>
        </CardActions>
      </Card>
    </Layout>
  );
}

export default Home;
