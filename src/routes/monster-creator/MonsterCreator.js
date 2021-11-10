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
import ChangeAttacks from "./ChangeAttacks";

function MonsterCreator() {
  const [monster, setMonster] = useState({
    name: "Ghigliopendra",
    // image: monsterImg,
    lvl: 5,
    type: "Bestia",
    desc: "",
    traits: "",
    des: 8,
    int: 6,
    vig: 10,
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
    attacks: [
      {
        name: "Mandibola",
        type: "M",
        ab1: "Des",
        ab2: "Vig",
        element: "poison",
        effects: ["Il bersaglio subisce lo status **debole**."],
      },
      {
        name: "Sfera Tagliente",
        type: "M",
        ab1: "Des",
        ab2: "Vig",
        element: "physical",
        effects: [
          "Se la ghigliopendra ha eseguito l'azione di **Guardia** nel suo turno precedente, questo attacco infligge 5 danni extra.",
        ],
      },
    ],
    skills: [
      {
        name: "special-rule",
        options: {
          name: "Appallottolarsi",
          effect:
            "Quando esegue l'azione di **Guardia**, la Ghigliopendra diventa Immune ai danni **fisici** fino all'inizio del suo prossimo turno",
        },
      },
      {
        name: "element-resistance",
        options: {
          physical: false,
          air: false,
          lightning: false,
          dark: true,
          earth: true,
          fire: false,
          ice: false,
          light: false,
          poison: false,
        },
      },
      {
        name: "extra-defenses",
        options: {
          def: 2,
          dmag: 1,
        },
      },
    ],
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
      <Grid item xs={6}>
        <ChangeAttacks monster={monster} setMonster={setMonster} />
      </Grid>
      <Grid item xs={1} />
      {/* <Grid item xs={5}>
        <ChangeSkills monster={monster} setMonster={setMonster} />
      </Grid> */}
    </Grid>
  );
}

export default MonsterCreator;
