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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import attributes from "../../libs/attributes";
import { baseWeapons } from "../../libs/equip";
import { CloseBracket, OpenBracket } from "../Bracket";
import { useTranslate } from "../../translation/translate";

export default function EditWeaponAttacks({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
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
        {t("Attacks with Weapons")}
        <IconButton onClick={addAttack}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.weaponattacks?.map((attack, i) => {
        return (
          <Grid container key={i} spacing={isSmallScreen ? 0 : 1}>
            <Grid item xs={isSmallScreen ? 12 : isMediumScreen ? 10 : 5}>
              <EditAttack
                attack={attack}
                setAttack={onChangeAttacks(i)}
                removeAttack={removeAttack(i)}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <EditAttackSpecial
                attack={attack}
                setAttack={onChangeAttacks(i)}
              />
            </Grid>
            {i !== npc.weaponattacks.length - 1 && (
              <Grid item xs={12} sx={{ py: isSmallScreen ? 1 : 2 }}>
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
  const { t } = useTranslate();
  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item sx={{ mx: -1 }}>
        <IconButton onClick={removeAttack}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item xs={11}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label={t("Name:")}
            value={attack.name}
            onChange={(e) => {
              return setAttack("name", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <SelectWeapon
          weapon={attack.weapon}
          setWeapon={(value) => {
            return setAttack("weapon", value);
          }}
          size="small"
        />
      </Grid>
      <Grid item xs={3} sm={3}>
        <FormControl variant="standard">
          <TextField
            id="flathit"
            type="number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            label={t("Acc.")}
            value={attack.flathit || 0}
            onChange={(e) => {
              return setAttack("flathit", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={3} sm={3}>
        <FormControl variant="standard">
          <TextField
            id="flatdmg"
            type="number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            label={t("Dmg.")}
            value={attack.flatdmg || 0}
            onChange={(e) => {
              return setAttack("flatdmg", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4} lg={2}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="medium"
                value={attack.extraDamage}
                onChange={(e, value) => {
                  return setAttack("extraDamage", e.target.checked);
                }}
              />
            }
            label={t("Extra Damage")}
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
}

function EditAttackSpecial({ attack, setAttack }) {
  const { t } = useTranslate();
  const [specials, setSpecials] = useState(attack.special[0]);

  const onChange = (e) => {
    setSpecials(e.target.value);

    if (e.target.value === "") {
      setAttack("special", []);
      return;
    }

    setAttack("special", [e.target.value]);
  };

  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="special"
            label={t("Special:")}
            value={specials}
            onChange={onChange}
            size="small"
            helperText={t("Adding a special effect cost 1 skill point")}
          ></TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}

function SelectWeapon({ weapon, setWeapon }) {
  const { t } = useTranslate();
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
        {t("HR +")} {weapon.damage}
        <CloseBracket />
      </MenuItem>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("Weapon:")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={weapon.name}
        label={t("Weapon:")}
        onChange={onChange}
        size="small"
      >
        {options}
      </Select>
    </FormControl>
  );
}
