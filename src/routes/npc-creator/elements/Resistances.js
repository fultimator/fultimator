import { Grid, Typography } from "@mui/material";
import { CheckElement, elementList } from "./Elements";

function Resistances({ npc, setnpc }) {
  const isResistant = (npc, element) => {
    return npc.resistances[element];
  };

  const onSelectElement = (e) => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.resistances[e.target.name] =
        !prevState.resistances[e.target.name];

      return newState;
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography>Aggiungi resistenze (2 per punto abilità)</Typography>
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

export default Resistances;
