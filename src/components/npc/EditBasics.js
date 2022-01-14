import { Add, Remove } from "@mui/icons-material";
import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Card,
  Typography,
  Divider,
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
        e.target.value === "Bestia" ||
        e.target.value === "Demone" ||
        e.target.value === "Mostro" ||
        e.target.value === "Pianta" ||
        e.target.value === "Umanoide"
      ) {
        newState.affinities = {};
      }
      if (e.target.value === "Costrutto") {
        newState.affinities = {
          poison: "im",
          earth: "rs",
        };
      }
      if (e.target.value === "Elementale") {
        newState.affinities = {
          poison: "im",
        };
      }
      if (e.target.value === "Non Morto") {
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
      <Grid item xs={2}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label="Nome"
            value={npc.name}
            onChange={onChange("name")}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="traits"
            label="Tratti"
            value={npc.traits}
            onChange={onChange("traits")}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <EditLevel npc={npc} setnpc={setNpc} />
      </Grid>
      <Grid item xs={2}>
        <FormControl fullWidth>
          <InputLabel id="species">Specie</InputLabel>
          <Select
            labelId="species"
            id="select-species"
            value={npc.species}
            label="Specie"
            onChange={onChangeSpecies}
          >
            <MenuItem value={"Bestia"}>Bestia</MenuItem>
            <MenuItem value={"Costrutto"}>Costrutto</MenuItem>
            <MenuItem value={"Demone"}>Demone</MenuItem>
            <MenuItem value={"Elementale"}>Elementale</MenuItem>
            <MenuItem value={"Mostro"}>Mostro</MenuItem>
            <MenuItem value={"Pianta"}>Pianta</MenuItem>
            <MenuItem value={"Non Morto"}>Non Morto</MenuItem>
            <MenuItem value={"Umanoide"}>Umanoide</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <FormControl fullWidth>
          <InputLabel id="rank">Rango</InputLabel>
          <Select
            labelId="rank"
            id="select-rank"
            value={npc.rank}
            label="Rango"
            onChange={onChange("rank")}
          >
            <MenuItem value={"soldier"}>Soldato</MenuItem>
            <MenuItem value={"elite"}>Elite</MenuItem>
            <MenuItem value={"champion2"}>Campione(2)</MenuItem>
            <MenuItem value={"champion3"}>Campione(3)</MenuItem>
            <MenuItem value={"champion4"}>Campione(4)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={7}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="Description"
            label="Descrizione"
            value={npc.description}
            onChange={onChange("description")}
            multiline
            rows={5}
          ></TextField>
        </FormControl>
      </Grid>

      <Grid item xs={2}>
        <EditAttributes npc={npc} setNpc={setNpc} />
      </Grid>
      <Grid item xs>
        <Grid item>
          <Card sx={{ p: 1.61 }}>
            <Typography>
              <strong>Tuttofare</strong>: d8, d8, d8, d8
            </Typography>
            <Typography>
              <strong>Standard</strong>: d10, d8, d8, d6
            </Typography>
            <Typography>
              <strong>Specializzato</strong>: d10, d10, d6, d6
            </Typography>
            <Typography>
              <strong>Iperspecializzato</strong>: d12, d8, d6, d6
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              Ai lvl <strong>20</strong>, <strong>40</strong>,{" "}
              <strong>60</strong> puoi aumentare una caratteristica
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
        label="Livello"
        type="number"
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
