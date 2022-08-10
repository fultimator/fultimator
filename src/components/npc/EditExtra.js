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
import { Fragment } from "react";
import { baseArmors } from "../../libs/equip";
import { baseShields } from "../../libs/equip";

export default function EditExtra({ npc, setNpc }) {
  return (
    <>
      <Grid container sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Defenses npc={npc} setNpc={setNpc} />
          <SelectArmor npc={npc} setNpc={setNpc} />
          <SelectShield npc={npc} setNpc={setNpc} />
        </Grid>
        <Grid item xs={6}>
          <Stack spacing={1}>
            <HP npc={npc} setNpc={setNpc} />
            <MP npc={npc} setNpc={setNpc} />
            <Init npc={npc} setNpc={setNpc} />
            <Precision npc={npc} setNpc={setNpc} />
            <Magic npc={npc} setNpc={setNpc} />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

function Defenses({ npc, setNpc }) {
  const onChange = (e) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }

      if (e.target.value === "00") {
        newState.extra.def = 0;
        newState.extra.mDef = 0;
      }

      if (e.target.value === "12") {
        newState.extra.def = 1;
        newState.extra.mDef = 2;
      }

      if (e.target.value === "21") {
        newState.extra.def = 2;
        newState.extra.mDef = 1;
      }

      if (e.target.value === "33") {
        newState.extra.def = 3;
        newState.extra.mDef = 3;
      }

      if (e.target.value === "24") {
        newState.extra.def = 2;
        newState.extra.mDef = 4;
      }

      if (e.target.value === "42") {
        newState.extra.def = 4;
        newState.extra.mDef = 2;
      }

      return newState;
    });
  };

  const from = () => {
    if (!npc.extra?.def || npc.extra?.def === 0) {
      return "00";
    }

    if (npc.extra?.def === 1) {
      return "12";
    }

    if (npc.extra?.mDef === 1) {
      return "21";
    }

    if (npc.extra?.def === 3) {
      return "33";
    }

    if (npc.extra?.def === 3) {
      return "33";
    }

    if (npc.extra?.def === 4) {
      return "42";
    }

    if (npc.extra?.mDef === 4) {
      return "24";
    }
  };

  return (
    <FormControl>
      <FormLabel id="extra-defenses">Difese</FormLabel>
      <RadioGroup
        size="small"
        aria-labelledby="extra-defenses"
        name="extra-defenses"
        value={from()}
        onChange={onChange}
      >
        <FormControlLabel
          value="00"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label="+0 Def / +0 M. Def"
        />
        <FormControlLabel
          value="12"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label="+1 Def / +2 M. Def"
        />
        <FormControlLabel
          value="21"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label="+2 Def / +1 M. Def"
        />
        <FormControlLabel
          value="33"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label="+3 Def / +3 M. Def"
        />
        <FormControlLabel
          value="24"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label="+2 Def / +4 M. Def"
        />
        <FormControlLabel
          value="42"
          control={<Radio size="small" sx={{ py: 0.8 }} />}
          label="+4 Def / +2 M. Def"
        />
      </RadioGroup>
    </FormControl>
  );
}

function HP({ npc, setNpc }) {
  const onChange = (e) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.extra.hp = e.target.value;
      return newState;
    });
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="pv"
        type="number"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*", step: 10 }}
        label="Extra PV"
        value={npc.extra?.hp || 0}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
}

function MP({ npc, setNpc }) {
  const onChange = (e) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.extra.mp = e.target.value;
      return newState;
    });
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="mp"
        type="number"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*", step: 10 }}
        label="Extra PM"
        value={npc.extra?.mp || 0}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
}
function Init({ npc, setNpc }) {
  const onChange = (e) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.extra.init = e.target.checked;
      return newState;
    });
  };
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox value={npc.extra?.init} onChange={onChange} />}
        label="+4 Iniziativa"
      />
    </FormGroup>
  );
}

function Precision({ npc, setNpc }) {
  const onChange = (e) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.extra.precision = e.target.checked;
      return newState;
    });
  };
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox value={npc.extra?.precision} onChange={onChange} />}
        label="+3 ai test di Precisione"
      />
    </FormGroup>
  );
}

function Magic({ npc, setNpc }) {
  const onChange = (e) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.extra.magic = e.target.checked;
      return newState;
    });
  };
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox value={npc.extra?.magic} onChange={onChange} />}
        label="+3 ai test di Magia"
      />
    </FormGroup>
  );
}

function SelectArmor({ npc, setNpc }) {
  const onChange = function (e) {
    const armor = baseArmors.find((armor) => armor.name === e.target.value);

    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.armor = armor;
      return newState;
    });
  };

  const options = [<MenuItem key={1} value="" disabled />];

  for (const armor of baseArmors) {
    options.push(
      <MenuItem key={armor.name} value={armor.name}>
        {armor.name}
      </MenuItem>
    );
  }

  let armor = npc.armor;
  if (!armor) {
    armor = baseArmors[0];
  }

  console.debug(armor);

  return (
    <FormControl fullWidth sx={{ pr: 3, mt: 1 }}>
      <InputLabel id="type">Armatura</InputLabel>
      <Select
        size="small"
        labelId="armor"
        id="select-armor"
        value={armor.name}
        label="Armatura"
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

function SelectShield({ npc, setNpc }) {
  const onChange = function (e) {
    const shield = baseShields.find((shield) => shield.name === e.target.value);

    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.extra) {
        newState.extra = {};
      }
      newState.shield = shield;
      return newState;
    });
  };

  const options = [<MenuItem key={1} value="" disabled />];

  for (const shield of baseShields) {
    options.push(
      <MenuItem key={shield.name} value={shield.name}>
        {shield.name}
      </MenuItem>
    );
  }

  let shield = npc.shield;
  if (!shield) {
    shield = baseShields[0];
  }

  console.debug(shield);

  return (
    <FormControl fullWidth sx={{ pr: 3, mt: 1 }}>
      <InputLabel id="type">Scudo</InputLabel>
      <Select
        size="small"
        labelId="shield"
        id="select-shield"
        value={shield.name}
        label="Scudo"
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}
