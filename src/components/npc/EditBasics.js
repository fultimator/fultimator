import { Add, Remove } from "@mui/icons-material";
import {
  Card,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { EditAttributes } from "./EditAttributes";

export default function EditBasics({ npc, setNpc }) {
  const onChange = (key) => {
    return (e) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState[key] = e.target.value;
        return newState;
      });
    };
  };

  const onChangeSpecies = function (e) {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.species = e.target.value;

      if (
        e.target.value === "Beast" ||
        e.target.value === "Demon" ||
        e.target.value === "Monster" ||
        e.target.value === "Plant" ||
        e.target.value === "Humanoid"
      ) {
        newState.affinities = {};
      }
      if (e.target.value === "Construct") {
        newState.affinities = {
          poison: "im",
          earth: "rs",
        };
      }
      if (e.target.value === "Elemental") {
        newState.affinities = {
          poison: "im",
        };
      }
      if (e.target.value === "Undead") {
        newState.affinities = {
          dark: "im",
          poison: "im",
          light: "vu",
        };
      }

      return newState;
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label="Name:"
            value={npc.name}
            onChange={onChange("name")}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={8}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="traits"
            label="Traits:"
            value={npc.traits}
            onChange={onChange("traits")}
            multiline
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4} sm={3}>
        <EditLevel npc={npc} setnpc={setNpc} />
      </Grid>
      <Grid item xs={4} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="species">Species:</InputLabel>
          <Select
            labelId="species"
            id="select-species"
            value={npc.species}
            label="Species:"
            onChange={onChangeSpecies}
          >
            <MenuItem value={"Beast"}>Beast</MenuItem>
            <MenuItem value={"Construct"}>Construct</MenuItem>
            <MenuItem value={"Demon"}>Demon</MenuItem>
            <MenuItem value={"Elemental"}>Elemental</MenuItem>
            <MenuItem value={"Monster"}>Monster</MenuItem>
            <MenuItem value={"Plant"}>Plant</MenuItem>
            <MenuItem value={"Undead"}>Undead</MenuItem>
            <MenuItem value={"Humanoid"}>Humanoid</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4} sm={3}>
        <Stack spacing={1}>
          <FormControl fullWidth>
            <InputLabel id="rank">Rank:</InputLabel>
            <Select
              labelId="rank"
              id="select-rank"
              value={npc.rank}
              label="Rank:"
              onChange={onChange("rank")}
            >
              <MenuItem value={"soldier"}>Soldier</MenuItem>
              <MenuItem value={"elite"}>Elite</MenuItem>
              <MenuItem value={"champion2"}>Champion(2)</MenuItem>
              <MenuItem value={"champion3"}>Champion(3)</MenuItem>
              <MenuItem value={"champion4"}>Champion(4)</MenuItem>
              <MenuItem value={"champion5"}>Champion(5)</MenuItem>
              <MenuItem value={"companion"}>Companion</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      {/* Villain & Phase Section*/}
      <Grid item xs={4} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="villain">Villain:</InputLabel>
          <Select
            labelId="villain"
            id="select-villain"
            value={npc.villain}
            label="Villain:"
            onChange={onChange("villain")}
          >
            <MenuItem value={""}>None</MenuItem>
            <MenuItem value={"minor"}>Minor</MenuItem>
            <MenuItem value={"major"}>Major</MenuItem>
            <MenuItem value={"supreme"}>Supreme</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={3} sm={3}>
        <FormControl fullWidth>
          <TextField
            labelId="phases"
            id="textfield-phases"
            value={npc.phases || 0}
            label="Phases:"
            onChange={onChange("phases")}
            type="number"
          ></TextField>
        </FormControl>
      </Grid>

      {npc.rank === "companion" && (
        <Grid item xs={2} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="companionlvl">SL</InputLabel>
            <Select
              labelId="companionlvl"
              id="select-companionlvl"
              value={npc.companionlvl || 1}
              label="Skill Level:"
              onChange={onChange("companionlvl")}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={5}>5</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}

      {npc.rank === "companion" && (
        <Grid item xs={3} sm={2}>
          <FormControl fullWidth>
            <TextField
              labelId="companionpclvl"
              id="textfield-companionpclvl"
              value={npc.companionpclvl || 5}
              label="PC Level:"
              onChange={onChange("companionpclvl")}
              type="number"
            ></TextField>
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12} sm={5} md>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="multipart"
            label="Multi-Part:"
            value={npc.multipart}
            onChange={onChange("multipart")}
            multiline
          ></TextField>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="Description"
            label="Description:"
            value={npc.description}
            onChange={onChange("description")}
            multiline
            rows={5}
          ></TextField>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <EditAttributes npc={npc} setNpc={setNpc} />
      </Grid>
      <Grid item xs>
        <Grid item>
          <Card sx={{ p: 1.61 }}>
            <Typography>
              <strong>Jack of All Trades</strong>: d8, d8, d8, d8
            </Typography>
            <Typography>
              <strong>Standard</strong>: d10, d8, d8, d6
            </Typography>
            <Typography>
              <strong>Specialized</strong>: d10, d10, d6, d6
            </Typography>
            <Typography>
              <strong>Super Specialized</strong>: d12, d8, d6, d6
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              Upon reaching levels <strong>20</strong>, <strong>40</strong>, and{" "}
              <strong>60</strong> , the NPC chooses one of its Attributes and
              increases it by one die size (to a maximum of d12).
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

function EditLevel({ npc, setnpc }) {
  const onRaiseLevel = (e) => {
    setnpc((prevState) => {
      if (prevState.lvl >= 60) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl + 5;
      return newState;
    });
  };
  const onLowerLevel = (e) => {
    setnpc((prevState) => {
      if (prevState.lvl <= 5) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl - 5;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label="Level:"
        //type="number"
        min={5}
        max={60}
        value={npc.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="start"
              onClick={onLowerLevel}
            >
              <Remove />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="end"
              onClick={onRaiseLevel}
            >
              <Add />
            </IconButton>
          ),
        }}
      />
    </FormControl>
  );
}
