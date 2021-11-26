import { Grid, Typography } from "@mui/material";
import { CheckElement, elementList } from "./Elements";

function Vulnerabilities({ npc, setnpc }) {
  const isVulnerable = (npc, element) => {
    return npc.vulnerabilities[element];
  };

  const onSelectElement = (e) => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.vulnerabilities[e.target.name] =
        !prevState.vulnerabilities[e.target.name];

      return newState;
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography>Aggiungi vulnerabilità per ottenere abilità</Typography>
      </Grid>
      {elementList.map((element) => {
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

export default Vulnerabilities;
