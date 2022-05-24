import { Grid, IconButton, Typography } from "@mui/material";
import { D4Icon, D6Icon } from "../../components/icons";
import Layout from "../../components/Layout";
import Roll from "../../components/roller/roll";

function Roller() {
  return (
    <Layout>
      <Typography fontSize="3rem" component="div">
        <Grid container>
          <Grid item>
            <IconButton sx={{ fontSize: "4rem" }}>
              <D4Icon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton sx={{ fontSize: "4rem" }}>
              <D6Icon />
            </IconButton>
          </Grid>
        </Grid>
      </Typography>

      <Roll></Roll>
    </Layout>
  );
}

export default Roller;
