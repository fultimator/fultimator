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
} from "@mui/material";
import { OffensiveSpellIcon } from "../icons";

export default function EditSpells({ npc, setNpc }) {
  const onChangeSpells = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.spells[i][key] = value;
        return newState;
      });
    };
  };

  const addSpell = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.spells) {
        newState.spells = [];
      }
      newState.spells.push({
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

  const removeSpell = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.spells.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem">
        Incantesimi
        <IconButton onClick={addSpell}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.spells?.map((spell, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item xs={9}>
              <EditSpell
                spell={spell}
                setSpell={onChangeSpells(i)}
                removeSpell={removeSpell(i)}
              />
            </Grid>
            {i !== npc.spells.length - 1 && (
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

function EditSpell({ spell, setSpell, removeSpell, i }) {
  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item>
        <IconButton onClick={removeSpell}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label="Nome"
            value={spell.name}
            onChange={(e) => {
              return setSpell("name", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl variant="standard" fullWidth>
          <ToggleButtonGroup
            size="small"
            value={spell.type}
            exclusive
            onChange={(e, value) => {
              return setSpell("type", value);
            }}
            aria-label="text alignment"
          >
            <ToggleButton value="offensive" aria-label="left aligned">
              <OffensiveSpellIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Grid>
      {spell.type === "offensive" && (
        <Grid item>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr1label"}>Car 1</InputLabel>
            <Select
              value={spell.attr1}
              labelId={"spell-" + i + "-attr1label"}
              id={"spell-" + i + "-attr1"}
              label="Car 1"
              size="small"
              onChange={(e) => {
                return setSpell("attr1", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>Des</MenuItem>
              <MenuItem value={"insight"}>Int</MenuItem>
              <MenuItem value={"might"}>Vig</MenuItem>
              <MenuItem value={"will"}>Vol</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      {spell.type === "offensive" && (
        <Grid item>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr2label"}>Car 2</InputLabel>
            <Select
              value={spell.attr2}
              labelId={"spell-" + i + "-attr2label"}
              id={"spell-" + i + "-attr2"}
              label="Car 2"
              size="small"
              onChange={(e, value) => {
                return setSpell("attr2", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>Des</MenuItem>
              <MenuItem value={"insight"}>Int</MenuItem>
              <MenuItem value={"might"}>Vig</MenuItem>
              <MenuItem value={"will"}>Vol</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="mp"
            label="PM"
            value={spell.mp}
            onChange={(e) => {
              return setSpell("mp", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="target"
            label="Bersaglio"
            value={spell.target}
            onChange={(e) => {
              return setSpell("target", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="duration"
            label="Durata"
            value={spell.duration}
            onChange={(e) => {
              return setSpell("duration", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="effect"
            label="Effetto"
            value={spell.effect}
            onChange={(e) => {
              return setSpell("effect", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}
