import { RemoveCircleOutline } from "@mui/icons-material";
import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState } from "react";
import types from "../../libs/types";
import { DistanceIcon, MeleeIcon } from "../icons";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';
import { Add } from "@mui/icons-material";
import CompendiumHandler from './CompendiumHandler';

export default function EditAttacks({ npc, setNpc }) {
  const { t } = useTranslate();

  const [modalOpen, setModalOpen] = useState(false);

  const openCompendiumModal = () => {
    setModalOpen(true);
  };

  const closeCompendiumModal = () => {
    setModalOpen(false);
  };

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
        itemType: "basic",
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
      <CustomHeader type="top" openCompendium={openCompendiumModal} addItem={addAttack} headerText={t("Basic Attacks")} icon={Add} />
      {npc.attacks?.map((attack, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item xs={12} md={6}>
              <EditAttack
                attack={attack}
                setAttack={onChangeAttacks(i)}
                removeAttack={removeAttack(i)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <EditAttackSpecial
                attack={attack}
                setAttack={onChangeAttacks(i)}
              />
            </Grid>
            {i !== npc.attacks.length - 1 && (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            )}
          </Grid>
        );
      })}
      <CompendiumHandler npc={npc} setNpc={setNpc} typeName="basic" open={modalOpen} onClose={closeCompendiumModal} />
    </>
  );
}

function EditAttack({ attack, setAttack, removeAttack, i }) {
  const { t } = useTranslate();
  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item sx={{ p: 0, m: 0 }}>
        <IconButton onClick={removeAttack}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item xs={10}>
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
            <MenuItem value={"dexterity"}>{t("DEX")}</MenuItem>
            <MenuItem value={"insight"}>{t("INS")}</MenuItem>
            <MenuItem value={"might"}>{t("MIG")}</MenuItem>
            <MenuItem value={"will"}>{t("WLP")}</MenuItem>
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
            <MenuItem value={"dexterity"}>{t("DEX")}</MenuItem>
            <MenuItem value={"insight"}>{t("INS")}</MenuItem>
            <MenuItem value={"might"}>{t("MIG")}</MenuItem>
            <MenuItem value={"will"}>{t("WLP")}</MenuItem>
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
            label={t("Type:")}
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
            <MenuItem value={"nodmg"}>
              {t("no damage")}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
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
      <Grid item xs={3}>
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
      <Grid item xs={3}>
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
      <Grid item xs>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="medium"
                checked={attack.extraDamage}
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
          {/* <TextField
            id="special"
            label={t("Special:")}
            value={specials}
            onChange={onChange}
            size="small"
            helperText={t("Adding a special effect cost 1 skill point")}
          ></TextField> */}

          <CustomTextarea
            id="special"
            label={t("Special:")}
            value={specials}
            onChange={onChange}
            helperText={t("Adding a special effect cost 1 skill point")}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
