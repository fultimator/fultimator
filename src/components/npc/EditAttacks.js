import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useEffect, useState } from "react";
import types from "../../libs/types";
import { DistanceIcon, MeleeIcon } from "../icons";

export default function EditAttacks({ npc, setNpc }) {
  const onChangeAttacks = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks[i][key] = value;
        return newState;
      });
    };
  };

  const addAttack = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.attacks) {
        newState.attacks = [];
      }
      newState.attacks.push({
        name: "",
        range: "melee",
        attr1: "dexterity",
        attr2: "dexterity",
        type: "physical",
        special: [],
      });
      return newState;
    });
  };

  const removeAttack = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem">
        Basic Attacks
        <IconButton onClick={addAttack}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.attacks?.map((attack, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item xs={7}>
              <EditAttack
                attack={attack}
                setAttack={onChangeAttacks(i)}
                removeAttack={removeAttack(i)}
              />
            </Grid>
            <Grid item xs={5}>
              <EditAttackSpecial
                attack={attack}
                setAttack={onChangeAttacks(i)}
              />
            </Grid>
            {i !== npc.attacks.length - 1 && (
              <Grid item xs={12} sx={{ py: 1 }}>
                <Divider />
              </Grid>
            )}
          </Grid>
        );
      })}
    </>
  );
}

function EditAttack({ attack, setAttack, removeAttack, i }) {
  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item sx={{ mx: -1 }}>
        <IconButton onClick={removeAttack}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label="Name"
            value={attack.name}
            onChange={(e) => {
              return setAttack("name", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl variant="standard" fullWidth>
          <ToggleButtonGroup
            size="small"
            value={attack.range}
            exclusive
            onChange={(e, value) => {
              return setAttack("range", value);
            }}
            aria-label="text alignment"
          >
            <ToggleButton value="melee" aria-label="left aligned">
              <MeleeIcon />
            </ToggleButton>
            <ToggleButton value="distance" aria-label="right">
              <DistanceIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-attr1label"}>Attr 1</InputLabel>
          <Select
            value={attack.attr1}
            labelId={"attack-" + i + "-attr1label"}
            id={"attack-" + i + "-attr1"}
            label="Attr 1"
            size="small"
            onChange={(e) => {
              return setAttack("attr1", e.target.value);
            }}
          >
            <MenuItem value={"dexterity"}>Dex</MenuItem>
            <MenuItem value={"insight"}>Ins</MenuItem>
            <MenuItem value={"might"}>Mig</MenuItem>
            <MenuItem value={"will"}>Wil</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-attr2label"}>Attr 2</InputLabel>
          <Select
            value={attack.attr2}
            labelId={"attack-" + i + "-attr2label"}
            id={"attack-" + i + "-attr2"}
            label="Attr 2"
            size="small"
            onChange={(e, value) => {
              return setAttack("attr2", e.target.value);
            }}
          >
            <MenuItem value={"dexterity"}>Dex</MenuItem>
            <MenuItem value={"insight"}>Ins</MenuItem>
            <MenuItem value={"might"}>Mig</MenuItem>
            <MenuItem value={"will"}>Wil</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-type"}>Type</InputLabel>
          <Select
            value={attack.type}
            labelId={"attack-" + i + "-type"}
            id={"attack-" + i + "-type"}
            label="Ab 1"
            size="small"
            onChange={(e, value) => {
              return setAttack("type", e.target.value);
            }}
          >
            {Object.keys(types).map((type) => {
              return (
                <MenuItem key={type} value={type}>
                  {types[type].long}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                value={attack.extraDamage}
                onChange={(e, value) => {
                  return setAttack("extraDamage", e.target.checked);
                }}
              />
            }
            label="Extra Damage"
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
}

function EditAttackSpecial({ attack, setAttack }) {
  const [specials, setSpecials] = useState(attack.special.join("/n"));

  useEffect(() => {
    setSpecials(attack.special.join("\n"));
  }, [attack.special, setSpecials]);

  const onChange = (e) => {
    if (e.target.value === "") {
      setAttack("special", []);
      return;
    }

    const parts = e.target.value.split("\n");
    setAttack("special", parts);
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="special"
        label="Special"
        multiline
        value={specials}
        onChange={onChange}
        size="small"
        helperText="Adding a special effect cost 1 skill point"
      ></TextField>
    </FormControl>
  );
}
