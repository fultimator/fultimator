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

import monster from "./monster.jpg";

function Home() {
  return (
    <Layout>
      <Card sx={{ width: 300 }}>
        <CardMedia component="img" height="140" image={monster} alt="" />
        <CardContent>
          <Typography gutterBottom variant="h5">
            Monster creator
          </Typography>
          <Typography>Create your own Fabula Ultima monster!</Typography>
          <Typography variant="caption">Now with 100% more cuteness</Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="outlined"
            component={RouterLink}
            to="/monster-creator"
          >
            Take me there
          </Button>
        </CardActions>
      </Card>
    </Layout>
  );
}

export default Home;
