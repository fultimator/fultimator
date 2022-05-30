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
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useEffect, useState } from "react";
import attributes from "../../libs/attributes";
import { baseWeapons } from "../../libs/equip";
import { CloseBracket, OpenBracket } from "../Bracket";

export default function EditWeaponAttacks({ npc, setNpc }) {
  const onChangeAttacks = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.weaponattacks[i][key] = value;
        return newState;
      });
    };
  };

  const addAttack = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.weaponattacks) {
        newState.weaponattacks = [];
      }
      newState.weaponattacks.push({
        name: "",
        weapon: baseWeapons[0],
        special: [],
      });
      return newState;
    });
  };

  const removeAttack = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.weaponattacks.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem">
        Attacchi Con Armi
        <IconButton onClick={addAttack}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.weaponattacks?.map((attack, i) => {
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
            {i !== npc.weaponattacks.length - 1 && (
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
            label="Nome"
            value={attack.name}
            onChange={(e) => {
              return setAttack("name", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item>
        <SelectWeapon
          weapon={attack.weapon}
          setWeapon={(value) => {
            return setAttack("weapon", value);
          }}
        />
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
            label="Danno Extra"
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
        label="Speciale"
        multiline
        value={specials}
        onChange={onChange}
        size="small"
        helperText="Vai a capo per introdurre diversi effetti speciali (ogni linea costa 1 abilità)"
      ></TextField>
    </FormControl>
  );
}

function SelectWeapon({ weapon, setWeapon }) {
  const onChange = function (e) {
    const weapon = baseWeapons.find((weapon) => weapon.name === e.target.value);

    setWeapon(weapon);
  };

  const options = [<MenuItem key={1} value="" disabled />];

  for (const weapon of baseWeapons) {
    options.push(
      <MenuItem key={weapon.name} value={weapon.name}>
        {weapon.name} <OpenBracket />
        {attributes[weapon.att1].shortcaps}+{attributes[weapon.att2].shortcaps}
        {weapon.prec > 0 && `+${weapon.prec}`}
        <CloseBracket /> <OpenBracket />
        TM + {weapon.damage}
        <CloseBracket />
      </MenuItem>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="type">Arma</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={weapon.name}
        label="Arma"
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}
