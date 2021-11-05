import { Divider, Grid } from "@mui/material";

import Layout from "../../components/Layout";
import { useState } from "react";
import ChangeName from "./ChangeName";
import ChangeTraits from "./ChangeTraits";
import ChangeLevel from "./ChangeLevel";
import ChangeType from "./ChangeType";
import ChangeAbilities from "./ChangeAbilities";
import ExplainAbilities from "./ExplainAbilities";
import Pretty from "./Pretty";
import ChangeElements from "./ChangeElements";

function MonsterCreator() {
  const [monster, setMonster] = useState({
    name: "",
    // image: monsterImg,
    lvl: 5,
    type: "Bestia",
    desc: "",
    traits: "",
    des: 8,
    int: 8,
    vig: 8,
    vol: 8,
    typeRules: {
      demonResistances: {
        physical: false,
        air: false,
        lightning: false,
        dark: false,
        earth: false,
        fire: false,
        ice: false,
        light: false,
        poison: false,
      },
      elementalImmunities: {
        physical: false,
        air: false,
        lightning: false,
        dark: false,
        earth: false,
        fire: false,
        ice: false,
        light: false,
        poison: true,
      },
      plantVulnerabilities: {
        physical: false,
        air: false,
        lightning: false,
        dark: false,
        earth: false,
        fire: false,
        ice: false,
        light: false,
        poison: false,
      },
    },
  });
  return (
    <Layout>
      <Manage monster={monster} setMonster={setMonster} />

      <Divider sx={{ my: 2 }} />

      <Pretty monster={monster}></Pretty>
    </Layout>
  );
}

function Manage({ monster, setMonster }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <ChangeName monster={monster} setMonster={setMonster} />
      </Grid>
      <Grid item xs={5}>
        <ChangeTraits monster={monster} setMonster={setMonster} />
      </Grid>
      <Grid item xs={2}>
        <ChangeLevel monster={monster} setMonster={setMonster} />
      </Grid>
      <Grid item xs={2}>
        <ChangeType monster={monster} setMonster={setMonster} />
      </Grid>
      <Grid item xs={2}>
        <ChangeAbilities monster={monster} setMonster={setMonster} />
      </Grid>
      <Grid item xs={3}>
        <ExplainAbilities />
      </Grid>
      <Grid item xs={5}>
        <ChangeElements monster={monster} setMonster={setMonster} />
      </Grid>
    </Grid>
  );
}

export default MonsterCreator;
