import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Divider,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

function ChangeSpecials({ npc, setnpc }) {
  const addSpecial = () => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.special.push({
        name: "",
        skills: 1,
        effect: "",
      });
      return newState;
    });
  };

  const removeSpecial = (i) => {
    return () => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.special.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <Grid container spacing={1} rowSpacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">
          Regole Speciali
          <IconButton color="primary" onClick={addSpecial}>
            <FontAwesomeIcon icon={faPlus} />
          </IconButton>
        </Typography>
      </Grid>
      {npc.special.map((special, i) => {
        return (
          <React.Fragment key={i}>
            <Grid item xs={11}>
              <ChangeSpecial npc={npc} setnpc={setnpc} i={i} />
            </Grid>
            <Grid item xs={1}>
              <IconButton color="primary" onClick={removeSpecial(i)}>
                <FontAwesomeIcon icon={faMinus} />
              </IconButton>
            </Grid>
            <Divider flexItem sx={{ width: "100%", mt: 2 }}></Divider>
          </React.Fragment>
        );
      })}
    </Grid>
  );
}

function ChangeSpecial({ npc, setnpc, i }) {
  const onChangeSpecial = (key) => {
    return (e) => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.special[i][key] = e.target.value;
        return newState;
      });
    };
  };

  const special = npc.special[i];

  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid item xs>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label="Nome"
            value={special.name}
            onChange={onChangeSpecial("name")}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item sx={{ width: 60 }}>
        <FormControl variant="standard" fullWidth>
          <TextField
            type="number"
            id="skills"
            label="Costo"
            value={special.skills}
            onChange={onChangeSpecial("skills")}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="effect"
            label="Effetto"
            value={special.effect}
            onChange={onChangeSpecial("effect")}
            size="small"
            multiline={true}
          ></TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ChangeSpecials;
