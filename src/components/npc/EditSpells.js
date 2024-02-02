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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { OffensiveSpellIcon } from "../icons";

export default function EditSpells({ npc, setNpc }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
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
        Spells
        <IconButton onClick={addSpell}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.spells?.map((spell, i) => {
        return (
          <Grid container key={i} spacing={isSmallScreen ? 1 : 2}>
            <Grid item xs={isSmallScreen ? 12 : isMediumScreen ? 12 : 12}>
              <EditSpell
                spell={spell}
                setSpell={onChangeSpells(i)}
                removeSpell={removeSpell(i)}
              />
            </Grid>
            {i !== npc.spells.length - 1 && (
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

function EditSpell({ spell, setSpell, removeSpell, i }) {
  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item>
        <IconButton onClick={removeSpell}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item xs={10} md={3} lg>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label="Name:"
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
            size="medium"
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
        <Grid item xs={5} sm={4} md={2} lg={1}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr1label"}>Attr 1:</InputLabel>
            <Select
              value={spell.attr1}
              labelId={"spell-" + i + "-attr1label"}
              id={"spell-" + i + "-attr1"}
              label="Attr 1"
              size="small"
              onChange={(e) => {
                return setSpell("attr1", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>Dex</MenuItem>
              <MenuItem value={"insight"}>Ins</MenuItem>
              <MenuItem value={"might"}>Mig</MenuItem>
              <MenuItem value={"will"}>Wil</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      {spell.type === "offensive" && (
        <Grid item xs={5} sm={4} md={2} lg={1}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr2label"}>Attr 2:</InputLabel>
            <Select
              value={spell.attr2}
              labelId={"spell-" + i + "-attr2label"}
              id={"spell-" + i + "-attr2"}
              label="Attr 2"
              size="small"
              onChange={(e, value) => {
                return setSpell("attr2", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>Dex</MenuItem>
              <MenuItem value={"insight"}>Ins</MenuItem>
              <MenuItem value={"might"}>Mig</MenuItem>
              <MenuItem value={"will"}>Wil</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs={2} md={2} lg={1}>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="mp"
            label="MP:"
            value={spell.mp}
            onChange={(e) => {
              return setSpell("mp", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4} md={3} lg={2}>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="target"
            label="Target:"
            value={spell.target}
            onChange={(e) => {
              return setSpell("target", e.target.value);
            }}
            multiline
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={4} md>
        <FormControl variant="outlined" fullWidth>
          <TextField
            id="duration"
            label="Duration:"
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
            label="Effect:"
            value={spell.effect}
            onChange={(e) => {
              return setSpell("effect", e.target.value);
            }}
            multiline
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}
