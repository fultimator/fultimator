import {
  faMinus,
  faMinusCircle,
  faPlus,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { elementList, elementName } from "./elements/Elements";

function ChangeAttacks({ npc, setnpc }) {
  const addAttack = () => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.attacks.push({
        name: "Attack",
        type: "melee",
        ab1: "Des",
        ab2: "Des",
        effects: [],
      });
      return newState;
    });
  };

  const removeAttack = (i) => {
    return () => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <Grid container spacing={1} rowSpacing={2} sx={{ pr: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h6">
          Attacchi
          <IconButton color="primary" onClick={addAttack}>
            <FontAwesomeIcon icon={faPlus} />
          </IconButton>
        </Typography>
      </Grid>
      {npc.attacks.map((attack, i) => {
        return (
          <React.Fragment key={i}>
            <Grid item xs={11}>
              <ChangeAttack npc={npc} setnpc={setnpc} i={i} />
            </Grid>
            <Grid item xs={1}>
              <IconButton color="primary" onClick={removeAttack(i)}>
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

function ChangeAttack({ npc, setnpc, i }) {
  const addEffect = () => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.attacks[i].effects.push("");
      return newState;
    });
  };

  const removeEffect = (j) => {
    return () => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks[i].effects.splice(j, 1);
        return newState;
      });
    };
  };

  const onChangeAttacks = (key) => {
    return (e) => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks[i][key] = e.target.value;
        return newState;
      });
    };
  };

  const onChangeEffect = (j) => {
    return (e) => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks[i].effects[j] = e.target.value;
        return newState;
      });
    };
  };

  const attack = npc.attacks[i];

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="name"
              label="Nome"
              value={attack.name}
              onChange={onChangeAttacks("name")}
              size="small"
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl variant="standard" fullWidth>
            <ToggleButtonGroup
              size="small"
              value={attack.type}
              exclusive
              onChange={onChangeAttacks("type")}
              aria-label="text alignment"
            >
              <ToggleButton value="M" aria-label="left aligned">
                M
              </ToggleButton>
              <ToggleButton value="R" aria-label="right">
                D
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"attack-" + i + "-ab1label"}>Car 1</InputLabel>
            <Select
              value={attack.ab1}
              labelId={"attack-" + i + "-ab1label"}
              id={"attack-" + i + "-ab1"}
              label="Car 1"
              size="small"
              onChange={onChangeAttacks("ab1")}
            >
              <MenuItem value={"Des"}>Des</MenuItem>
              <MenuItem value={"Int"}>Int</MenuItem>
              <MenuItem value={"Vig"}>Vig</MenuItem>
              <MenuItem value={"Vol"}>Vol</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"attack-" + i + "-ab2label"}>Car 2</InputLabel>
            <Select
              value={attack.ab2}
              labelId={"attack-" + i + "-ab2label"}
              id={"attack-" + i + "-ab2"}
              label="Car 2"
              size="small"
              onChange={onChangeAttacks("ab2")}
            >
              <MenuItem value={"Des"}>Des</MenuItem>
              <MenuItem value={"Int"}>Int</MenuItem>
              <MenuItem value={"Vig"}>Vig</MenuItem>
              <MenuItem value={"Vol"}>Vol</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"attack-" + i + "-element"}>Tipo</InputLabel>
            <Select
              value={attack.element}
              labelId={"attack-" + i + "-element"}
              id={"attack-" + i + "-element"}
              label="Ab 1"
              size="small"
              onChange={onChangeAttacks("element")}
            >
              {elementList.map((element) => {
                return (
                  <MenuItem key={element} value={element}>
                    {elementName(element)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container rowSpacing={1} sx={{ mt: 1 }}>
        {/* Effects */}
        {attack.effects.map((effect, i) => {
          return (
            <React.Fragment key={i}>
              <Grid item xs={1}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={removeEffect(i)}
                >
                  <FontAwesomeIcon icon={faMinusCircle} />
                </IconButton>
              </Grid>
              <Grid item xs={10}>
                <FormControl variant="standard" fullWidth>
                  <TextField
                    label="Effetto"
                    value={effect}
                    onChange={onChangeEffect(i)}
                    multiline={true}
                    size="small"
                  ></TextField>
                </FormControl>
              </Grid>
              <Grid item xs={1} />
            </React.Fragment>
          );
        })}
        <Grid item>
          <IconButton color="primary" size="small" onClick={addEffect}>
            <FontAwesomeIcon icon={faPlusCircle} />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );
}

export default ChangeAttacks;
