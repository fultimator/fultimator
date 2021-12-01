import { Grid } from "@mui/material";
import Layout from "../../components/Layout";
import Weapons from "./weapons/Weapons";

function Equip() {
  return (
    <Layout>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Weapons />
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Equip;
