import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { Martial } from "../icons";
import { baseArmors } from "../../libs/equip";
import { baseShields } from "../../libs/equip";
import { useTranslate } from "../../translation/translate";
import React, { useCallback, useMemo } from "react";

export default function EditExtra({ npc, setNpc }) {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Stack spacing={1}>
            <Defenses npc={npc} setNpc={setNpc} />
            <SelectArmor npc={npc} setNpc={setNpc} />
            <SelectShield npc={npc} setNpc={setNpc} />
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack spacing={1}>
            <Init npc={npc} setNpc={setNpc} />
            <Precision npc={npc} setNpc={setNpc} />
            <Magic npc={npc} setNpc={setNpc} />
            <HP npc={npc} setNpc={setNpc} />
            <MP npc={npc} setNpc={setNpc} />
            <ExtraInit npc={npc} setNpc={setNpc} />
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Immunities npc={npc} setNpc={setNpc} />
        </Grid>
      </Grid>
    </>
  );
}


const Immunities = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();

  // List of all immunities from NpcImmunities
  const allImmunities = {
    slow: false,
    dazed: false,
    weak: false,
    shaken: false,
    enraged: false,
    poisoned: false,
  };

  const immunities = { ...allImmunities, ...(npc.immunities || {}) };

  const onChange = useCallback(
    (e) => {
      const { name, checked } = e.target;
      setNpc((prevState) => ({
        ...prevState,
        immunities: {
          ...prevState.immunities,
          [name]: checked,
        },
      }));
    },
    [setNpc]
  );

  return (
    <FormGroup>
      <FormLabel id="extra-defenses">{t("Immunities")}</FormLabel>
      {Object.keys(allImmunities).map((immunity) => (
        <FormControlLabel
          key={immunity}
          control={
            <Checkbox
              checked={immunities[immunity]}
              onChange={onChange}
              name={immunity}
            />
          }
          label={`${t(immunity.charAt(0).toUpperCase() + immunity.slice(1), true)}`}
        />
      ))}
    </FormGroup>
  );
});

const Defenses = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback(
    (e) => {
      setNpc((prevState) => {
        const newState = { ...prevState, extra: { ...prevState.extra } };
        switch (e.target.value) {
          case "00":
            newState.extra.def = 0;
            newState.extra.mDef = 0;
            break;
          case "12":
            newState.extra.def = 1;
            newState.extra.mDef = 2;
            break;
          case "21":
            newState.extra.def = 2;
            newState.extra.mDef = 1;
            break;
          case "33":
            newState.extra.def = 3;
            newState.extra.mDef = 3;
            break;
          case "24":
            newState.extra.def = 2;
            newState.extra.mDef = 4;
            break;
          case "42":
            newState.extra.def = 4;
            newState.extra.mDef = 2;
            break;
          default:
            break;
        }
        return newState;
      });
    },
    [setNpc]
  );

  const from = useMemo(() => {
    const { def, mDef } = npc.extra || {};
    if (def === 0) return "00";
    if (def === 1) return "12";
    if (mDef === 1) return "21";
    if (def === 3) return "33";
    if (def === 4) return "42";
    if (mDef === 4) return "24";

    return "00";
  }, [npc.extra]);

  return (
    <FormControl>
      <FormLabel id="extra-defenses">{t("Defenses")}</FormLabel>
      <RadioGroup
        size="small"
        aria-labelledby="extra-defenses"
        name="extra-defenses"
        value={from}
        onChange={onChange}
      >
        <FormControlLabel
          value="00"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label={`+0 ${t("DEF", true)} / +0 ${t("M.DEF", true)}`}
        />
        <FormControlLabel
          value="12"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label={`+1 ${t("DEF", true)} / +2 ${t("M.DEF", true)}`}
        />
        <FormControlLabel
          value="21"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label={`+2 ${t("DEF", true)} / +1 ${t("M.DEF", true)}`}
        />
        <FormControlLabel
          value="33"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label={`+3 ${t("DEF", true)} / +3 ${t("M.DEF", true)}`}
        />
        <FormControlLabel
          value="24"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label={`+2 ${t("DEF", true)} / +4 ${t("M.DEF", true)}`}
        />
        <FormControlLabel
          value="42"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label={`+4 ${t("DEF", true)} / +2 ${t("M.DEF", true)}`}
        />
      </RadioGroup>
    </FormControl>
  );
});

const HP = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    setNpc((prevState) => {
      const newState = { ...prevState, extra: { ...prevState.extra, hp: e.target.value } };
      return newState;
    });
  }, [setNpc]);

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="HP"
        type="number"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*", step: 10 }}
        label={t("Extra HP:")}
        value={npc.extra?.hp || 0}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
});

const MP = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    setNpc((prevState) => {
      const newState = { ...prevState, extra: { ...prevState.extra, mp: e.target.value } };
      return newState;
    });
  }, [setNpc]);

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="mp"
        type="number"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*", step: 10 }}
        label={t("Extra MP:")}
        value={npc.extra?.mp || 0}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
});

const Init = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    setNpc((prevState) => {
      const newState = { ...prevState, extra: { ...prevState.extra, init: e.target.checked } };
      return newState;
    });
  }, [setNpc]);

  return (
    <FormGroup>
      <FormLabel id="extra-defenses">{t("Bonuses")}</FormLabel>
      <FormControlLabel
        control={<Checkbox checked={npc.extra?.init} value={npc.extra?.init} onChange={onChange} />}
        label={`+4 ${t("Initiative", true)}`}
      />
    </FormGroup>
  );
});

const ExtraInit = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    setNpc((prevState) => {
      const newState = { ...prevState, extra: { ...prevState.extra, extrainit: e.target.value } };
      return newState;
    });
  }, [setNpc]);

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="extrainit"
        type="number"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        label={t("Extra Init:")}
        value={npc.extra?.extrainit || 0}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
});

const Precision = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    setNpc((prevState) => {
      const newState = { ...prevState, extra: { ...prevState.extra, precision: e.target.checked } };
      return newState;
    });
  }, [setNpc]);

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={npc.extra?.precision} value={npc.extra?.precision} onChange={onChange} />}
        label={`+3 ${t("bonus to all Accuracy Checks", true)}`}
      />
    </FormGroup>
  );
});

const Magic = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    setNpc((prevState) => {
      const newState = { ...prevState, extra: { ...prevState.extra, magic: e.target.checked } };
      return newState;
    });
  }, [setNpc]);

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={npc.extra?.magic} value={npc.extra?.magic} onChange={onChange} />}
        label={`+3 ${t("bonus to all Magic Checks", true)}`}
      />
    </FormGroup>
  );
});

const SelectArmor = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    const armor = baseArmors.find((armor) => armor.name === e.target.value);

    setNpc((prevState) => {
      const newState = { ...prevState, armor };
      if (!newState.extra) {
        newState.extra = {};
      }
      return newState;
    });
  }, [setNpc]);

  const options = useMemo(() => {
    const opts = [<MenuItem key={1} value="" disabled />];
    for (const armor of baseArmors) {
      opts.push(
        <MenuItem key={armor.name} value={armor.name}>
          {armor.name}
          {armor.martial && <Martial />}{" "}
        </MenuItem>
      );
    }
    return opts;
  }, []);

  let armor = npc.armor;
  if (!armor) {
    armor = baseArmors[0];
  }

  return (
    <FormControl fullWidth sx={{ mt: 1 }}>
      <InputLabel id="type">{t("Armor")}</InputLabel>
      <Select
        size="medium"
        labelId="armor"
        id="select-armor"
        value={armor.name}
        label={t("Armor")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
});

const SelectShield = React.memo(({ npc, setNpc }) => {
  const { t } = useTranslate();
  const onChange = useCallback((e) => {
    const shield = baseShields.find((shield) => shield.name === e.target.value);

    setNpc((prevState) => {
      const newState = { ...prevState, shield };
      if (!newState.extra) {
        newState.extra = {};
      }
      return newState;
    });
  }, [setNpc]);

  const options = useMemo(() => {
    const opts = [<MenuItem key={1} value="" disabled />];
    for (const shield of baseShields) {
      opts.push(
        <MenuItem key={shield.name} value={shield.name}>
          {shield.name}
          {shield.martial && <Martial />}{" "}
        </MenuItem>
      );
    }
    return opts;
  }, []);

  let shield = npc.shield;
  if (!shield) {
    shield = baseShields[0];
  }

  return (
    <FormControl fullWidth sx={{ mt: 1 }}>
      <InputLabel id="type">{t("Shield")}</InputLabel>
      <Select
        size="medium"
        labelId="shield"
        id="select-shield"
        value={shield.name}
        label={t("Shield")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
});
