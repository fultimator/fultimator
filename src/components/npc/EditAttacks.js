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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import types from "../../libs/types";
import { DistanceIcon, MeleeIcon } from "../icons";
import { useTranslate } from "../../translation/translate";

export default function EditAttacks({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
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
        {t("Basic Attacks")}
        <IconButton onClick={addAttack}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.attacks?.map((attack, i) => {
        return (
          <Grid container key={i} spacing={1}>
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
            {i !== npc.attacks.length - 1 && (
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
      <Grid item xs={8}>
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
      <Grid item xs={2} md={1}>
        <FormControl variant="standard" fullWidth>
          <ToggleButtonGroup
            size="medium"
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
      <Grid item xs={6} md={4} lg={3}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-attr1label"}>
            {t("Attr 1:")}
          </InputLabel>
          <Select
            value={attack.attr1}
            labelId={"attack-" + i + "-attr1label"}
            id={"attack-" + i + "-attr1"}
            label={t("Attr 1:")}
            size="small"
            onChange={(e) => {
              return setAttack("attr1", e.target.value);
            }}
          >
            <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
            <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
            <MenuItem value={"might"}>{t("Mig")}</MenuItem>
            <MenuItem value={"will"}>{t("Wil")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} md={4} lg={3}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-attr2label"}>
            {t("Attr 2:")}
          </InputLabel>
          <Select
            value={attack.attr2}
            labelId={"attack-" + i + "-attr2label"}
            id={"attack-" + i + "-attr2"}
            label={t("Attr 2:")}
            size="small"
            onChange={(e, value) => {
              return setAttack("attr2", e.target.value);
            }}
          >
            <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
            <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
            <MenuItem value={"might"}>{t("Mig")}</MenuItem>
            <MenuItem value={"will"}>{t("Wil")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={8} lg={3}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-type"}>{t("Type:")}</InputLabel>
          <Select
            value={attack.type}
            labelId={"attack-" + i + "-type"}
            id={"attack-" + i + "-type"}
            label={t("Ab 1:")}
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
