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
import ChangeDescription from "./ChangeDescription";
import ExplainSkills from "./ExplainSkills";
import ExplainElements from "./ExplainElements";
import ChangeSpecials from "./ChangeSpecials";

function NpcCreator() {
  const [npc, setnpc] = useState({
    name: "Ghigliopendra",
    // image: npcImg,
    lvl: 5,
    type: "Bestia",
    desc: "Centopiedi di grandi dimensioni che si appallottolano per respingere gli attacchi, solo per scattare e mordere un attimo dopo",
    traits: "lenta, pesante, resiliente, territoriale",
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
    vulnerabilities: {
      physical: false,
      air: false,
      lightning: false,
      dark: false,
      earth: false,
      fire: true,
      ice: true,
      light: false,
      poison: false,
    },
    resistances: {
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
    special: [
      {
        name: "Appallottolarsi",
        skills: 2,
        effect:
          "Quando esegue l'azione di **Guardia**, la ghigliopendra dventa Immune ai danni **fisici** fino all'inizio del suo prossimo turno",
      },
    ],
  });
  return (
    <Layout>
      <Manage npc={npc} setnpc={setnpc} />

      <Divider sx={{ my: 2 }} />

      <Pretty npc={npc}></Pretty>
    </Layout>
  );
}

function Manage({ npc, setnpc }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={7}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <ChangeName npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={8}>
            <ChangeTraits npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={12}>
            <ChangeDescription npc={npc} setnpc={setnpc} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={5}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ChangeLevel npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={6}>
            <ChangeType npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={5}>
            <ChangeAbilities npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={7}>
            <ExplainAbilities />
          </Grid>
        </Grid>
      </Grid>
      <Divider
        orientation="horizontal"
        flexItem
        sx={{ width: "100%", my: 1 }}
      />
      <Grid item xs={10}>
        <Grid container>
          <Grid item xs={8}>
            <ChangeAttacks npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={4}>
            <ChangeElements npc={npc} setnpc={setnpc} />
          </Grid>
          <Grid item xs={5}>
            <ChangeSpecials npc={npc} setnpc={setnpc} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <ExplainSkills npc={npc} />
        <ExplainElements />
      </Grid>

      <Grid item xs={4}></Grid>
      <Grid item xs={2}></Grid>
      <Grid item xs={6}></Grid>
      {/* <Grid item xs={5}>
        <ChangeSkills npc={npc} setnpc={setnpc} />
      </Grid> */}
    </Grid>
  );
}

export default NpcCreator;
