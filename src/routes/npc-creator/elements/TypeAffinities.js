import { Grid, Typography } from "@mui/material";
import { CheckElement, elementList } from "./Elements";

function TypeAffinities({ npc, setnpc }) {
  if (npc.type === "Demone") {
    return <TypeAffinitiesDemon npc={npc} setnpc={setnpc} />;
  }
  if (npc.type === "Elementale") {
    return <TypeAffinitiesElemental npc={npc} setnpc={setnpc} />;
  }
  if (npc.type === "Pianta") {
    return <TypeAffinitiesPlant npc={npc} setnpc={setnpc} />;
  }
  return null;
}

function TypeAffinitiesDemon({ npc, setnpc }) {
  const isResistant = (npc, element) => {
    return npc.typeRules.demonResistances[element];
  };

  const countResistances = (npc) => {
    let sum = 0;
    Object.entries(npc.typeRules.demonResistances).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countResistances(npc) >= 2) {
      if (!isResistant(npc, e.target.name)) {
        return;
      }
    }
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.typeRules.demonResistances[e.target.name] =
        !prevState.typeRules.demonResistances[e.target.name];

      return newState;
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography>
          Scegli due tipi di danno a cui il Demone è resistente
        </Typography>
      </Grid>
      {elementList.map((element) => {
        return (
          <Grid item key={element}>
            <CheckElement
              element={element}
              checked={isResistant(npc, element)}
              onSelectElement={onSelectElement}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

function TypeAffinitiesElemental({ npc, setnpc }) {
  const isImmune = (npc, element) => {
    return npc.typeRules.elementalImmunities[element];
  };

  const countImmunities = (npc) => {
    let sum = 0;
    Object.entries(npc.typeRules.elementalImmunities).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countImmunities(npc) >= 2) {
      if (!isImmune(npc, e.target.name)) {
        return;
      }
    }
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.typeRules.elementalImmunities[e.target.name] =
        !prevState.typeRules.elementalImmunities[e.target.name];

      return newState;
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography>
          Scegli un tipo di danno a cui l'Elementale è immune (oltre a Veleno)
        </Typography>
      </Grid>
      {elementList.map((element) => {
        return (
          <Grid item key={element}>
            <CheckElement
              element={element}
              checked={isImmune(npc, element)}
              onSelectElement={onSelectElement}
              readonly={element === "poison"}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

function TypeAffinitiesPlant({ npc, setnpc }) {
  const isVulnerable = (npc, element) => {
    return npc.typeRules.plantVulnerabilities[element];
  };

  const countVulnerabilities = (npc) => {
    let sum = 0;
    Object.entries(npc.typeRules.plantVulnerabilities).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countVulnerabilities(npc) >= 2) {
      if (!isVulnerable(npc, e.target.name)) {
        return;
      }
    }
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.typeRules.plantVulnerabilities[e.target.name] =
        !prevState.typeRules.plantVulnerabilities[e.target.name];

      return newState;
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography>
          Scegli un tipo di danno a cui la Pianta è vulnerabile
        </Typography>
      </Grid>
      {elementList.map((element) => {
        if (
          element !== "wind" &&
          element !== "lightning" &&
          element !== "fire" &&
          element !== "ice"
        ) {
          return null;
        }
        return (
          <Grid item key={element}>
            <CheckElement
              element={element}
              checked={isVulnerable(npc, element)}
              onSelectElement={onSelectElement}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default TypeAffinities;
