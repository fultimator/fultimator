import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Paper,
  Autocomplete,
  Button,
  useTheme,
  ThemeProvider
} from "@mui/material";

import { RestartAltOutlined, Spa } from "@mui/icons-material";
import { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import Weapons from "../equip/weapons/Weapons";
import randomQualities from "./randomqualities.json";
import Fabula from "../../themes/Fabula";

const powerPMs = {
  minor: 20,
  medium: 30,
  major: 40,
  extreme: 50,
};

const powerLDs = {
  minor: 7,
  medium: 10,
  major: 13,
  extreme: 16,
};

const powerClocks = {
  minor: 4,
  medium: 6,
  major: 6,
  extreme: 8,
};

const powerCosts = {
  minor: 100,
  medium: 200,
  major: 400,
  extreme: 800,
};

const areaPMs = {
  individual: 1,
  small: 2,
  large: 3,
  huge: 4,
};

const areaCosts = {
  individual: 1,
  small: 2,
  large: 3,
  huge: 4,
};

const usesCosts = {
  consumable: 1,
  permanent: 5,
};

function RitualsProjects() {
  return (
    <ThemeProvider theme={Fabula}>
    <Layout>
      <Grid container spacing={2} sx={{ marginBottom: 1, marginTop: 1 }}>
        <Grid item xs={12}>
          <QualitiesGenerator />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ marginBottom: 1, marginTop: 1 }}>
        <Grid item xs={12} sm={5}>
          <Rituals />
        </Grid>
        <Grid item xs={12} sm={1} />
        <Grid item xs={12} sm={6}>
          <Projects />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginBottom: 1, marginTop: 1 }}>
        <Grid item xs={12}>
          <Weapons />
        </Grid>
      </Grid>
    </Layout>
    </ThemeProvider>
  );
}

function Rituals() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const quaternary = theme.palette.quaternary.main;
  const [power, setPower] = useState("minor");
  const [area, setArea] = useState("individual");

  function calcPM() {
    return powerPMs[power] * areaPMs[area];
  }

  function calcLD() {
    return powerLDs[power];
  }

  function calcClock() {
    return powerClocks[power];
  }
  return (
    <>
      <Typography
        variant="h4"
        sx={{
          px: 3,
          py: 1,
          color: "#ffffff",
          background: `linear-gradient(to right, ${primary}, ${quaternary},  transparent)`,
        }}
      >
        <Spa sx={{ fontSize: 36, marginRight: 1 }} />
        Rituals
      </Typography>
      <Paper
        sx={{
          padding: 2,
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
      <Grid container >
        <Grid item xs={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Potency</FormLabel>
            <RadioGroup
              aria-label="power"
              name="power-group"
              value={power}
              onChange={(e) => {
                setPower(e.target.value);
              }}
            >
              <FormControlLabel
                value="minor"
                control={<Radio />}
                label="Minor"
              />
              <FormControlLabel
                value="medium"
                control={<Radio />}
                label="Medium"
              />
              <FormControlLabel
                value="major"
                control={<Radio />}
                label="Major"
              />
              <FormControlLabel
                value="extreme"
                control={<Radio />}
                label="Extreme"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Area</FormLabel>
            <RadioGroup
              aria-label="area"
              name="area-group"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
              }}
            >
              <FormControlLabel
                value="individual"
                control={<Radio />}
                label="Individual"
              />
              <FormControlLabel
                value="small"
                control={<Radio />}
                label="Small"
              />
              <FormControlLabel
                value="large"
                control={<Radio />}
                label="Large"
              />
              <FormControlLabel value="huge" control={<Radio />} label="Huge" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Divider />
      <Grid container sx={{ m: 1 }}>
        <Grid item xs={4}>
          <Typography fontWeight="bold">{calcPM()} MP</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography fontWeight="bold">{calcLD()} DL</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography fontWeight="bold">Clock {calcClock()}</Typography>
        </Grid>
      </Grid>
      </Paper>
    </>
  );
}
function Projects() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const quaternary = theme.palette.quaternary.main;
  const [power, setPower] = useState("minor");
  const [area, setArea] = useState("individual");
  const [uses, setUses] = useState("consumable");
  const [defect, setDefect] = useState(false);
  const [tinkerers, setThinkerers] = useState(1);
  const [helpers, setHelpers] = useState(0);
  const [visionary, setVisionary] = useState(0);

  const defectMod = defect ? 0.75 : 1;
  const cost =
    powerCosts[power] * areaCosts[area] * usesCosts[uses] * defectMod;
  const progress = Math.ceil(cost / 100 > 1 ? cost / 100 : 1);
  const progressPerDay = tinkerers * 2 + helpers + visionary;
  const days = progress / progressPerDay;

  return (
    <>
      <Typography
        variant="h4"
        sx={{
          px: 3,
          py: 1,
          color: "#ffffff",
          background: `linear-gradient(to right, ${primary}, ${quaternary}, transparent)`,
        }}
      >
        <Spa sx={{ fontSize: 36, marginRight: 1 }} />
        Projects
        </Typography>      
        <Paper
        sx={{
          padding: 2,
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
      <Grid container>
        <Grid item xs={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Potency</FormLabel>
            <RadioGroup
              aria-label="power"
              name="power-group"
              value={power}
              onChange={(e) => {
                setPower(e.target.value);
              }}
            >
              <FormControlLabel
                value="minor"
                control={<Radio />}
                label="Minor"
              />
              <FormControlLabel
                value="medium"
                control={<Radio />}
                label="Medium"
              />
              <FormControlLabel
                value="major"
                control={<Radio />}
                label="Major"
              />
              <FormControlLabel
                value="extreme"
                control={<Radio />}
                label="Extreme"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Area</FormLabel>
            <RadioGroup
              aria-label="area"
              name="area-group"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
              }}
            >
              <FormControlLabel
                value="individual"
                control={<Radio />}
                label="Individual"
              />
              <FormControlLabel
                value="small"
                control={<Radio />}
                label="Small"
              />
              <FormControlLabel
                value="large"
                control={<Radio />}
                label="Large"
              />
              <FormControlLabel value="huge" control={<Radio />} label="Huge" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Uses</FormLabel>
            <RadioGroup
              aria-label="uses"
              name="uses-group"
              value={uses}
              onChange={(e) => {
                setUses(e.target.value);
              }}
            >
              <FormControlLabel
                value="consumable"
                control={<Radio />}
                label="Consumable"
              />
              <FormControlLabel
                value="permanent"
                control={<Radio />}
                label="Permanent"
              />
            </RadioGroup>
            <br />
            <FormControlLabel
              control={<Checkbox value={defect} />}
              onChange={(e) => {
                setDefect(e.target.checked);
              }}
              label="Has terrible flaw"
            />
          </FormControl>
        </Grid>
      </Grid>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="tinkerers"
              label="Number of Tinkerers"
              type="number"
              size="small"
              min={1}
              max={10}
              value={tinkerers}
              onChange={(e) => {
                if (e.target.value !== "")
                  setThinkerers(parseInt(e.target.value));
                else setThinkerers(0);
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="helpers"
              label="Number of Hired Helpers"
              type="number"
              size="small"
              min={1}
              max={10}
              value={helpers}
              onChange={(e) => {
                if (e.target.value !== "") setHelpers(parseInt(e.target.value));
                else setHelpers(0);
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="visionary"
              label="Levels in Visionary"
              type="number"
              size="small"
              min={1}
              max={10}
              value={visionary}
              onChange={(e) => {
                if (e.target.value !== "")
                  setVisionary(parseInt(e.target.value));
                else setVisionary(0);
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <Typography fontWeight="bold">{cost} Zenith</Typography>
          {visionary > 0 && (
            <Typography fontWeight="bold">
              {visionary * 100} Cost covered by Visionary
            </Typography>
          )}
        </Grid>
        <Grid item xs={4}>
          <Typography fontWeight="bold">{progress} Progress</Typography>
        </Grid>
        <Grid item xs={4}>
          {days < 1 && (
            <Typography fontWeight="bold">
              Number of days {Math.ceil(days)}
            </Typography>
          )}
          {days >= 1 && (
            <Typography fontWeight="bold">
              {progressPerDay} progress per day / {Math.ceil(days)} days
            </Typography>
          )}
        </Grid>
      </Grid>
      </Paper>
    </>
  );
}

const damageTypes = [
  "physical",
  "wind",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
];

const species = [
  "beast",
  "construct",
  "demon",
  "elemental",
  "humanoid",
  "monster",
  "plant",
  "undead",
];

const attributes = ["dexterity", "insight", "strength", "willpower"];

const statuses = ["dazed", "weak", "slow", "shaken", "poisoned", "enraged"];

function QualitiesGenerator() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const quaternary = theme.palette.quaternary.main;
  const [selectedDamageType, setSelectedDamageType] = useState("All");
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [selectedAttributes, setSelectedAttributes] = useState("All");
  const [selectedStatuses, setSelectedStatues] = useState("All");
  const [generate, setGenerate] = useState(0);

  const generatePrefixes = () => {
    const prefixes = [];
    randomQualities.forEach((item) => {
      if (item.Conditions && item.Conditions !== "") {
        if (item.Conditions.includes("{type}")) {
          if (selectedDamageType === "All") {
            damageTypes.forEach((type) => {
              prefixes.push(item.Conditions.replace("{type}", type));
            });
          } else
            prefixes.push(
              item.Conditions.replace("{type}", selectedDamageType)
            );
        } else if (item.Conditions.includes("{species}")) {
          if (selectedSpecies === "All") {
            species.forEach((speciesGet) => {
              prefixes.push(item.Conditions.replace("{species}", speciesGet));
            });
          } else
            prefixes.push(
              item.Conditions.replace("{species}", selectedSpecies)
            );
        } else if (item.Conditions.includes("{status}")) {
          if (selectedStatuses === "All") {
            statuses.forEach((status) => {
              prefixes.push(item.Conditions.replace("{status}", status));
            });
          } else
            prefixes.push(
              item.Conditions.replace("{status}", selectedStatuses)
            );
        } else {
          prefixes.push(item.Conditions);
        }
      }
    });
    return prefixes;
  };

  const generateSuffixes = () => {
    const prefixes = [];
    randomQualities.forEach((item) => {
      if (item.Effects && item.Effects !== "") {
        if (item.Effects.includes("{type}")) {
          if (selectedDamageType === "All") {
            damageTypes.forEach((type) => {
              prefixes.push(item.Effects.replace("{type}", type));
            });
          } else
            prefixes.push(item.Effects.replace("{type}", selectedDamageType));
        } else if (item.Effects.includes("{species}")) {
          if (selectedSpecies === "All") {
            species.forEach((speciesGet) => {
              prefixes.push(item.Effects.replace("{species}", speciesGet));
            });
          } else
            prefixes.push(item.Effects.replace("{species}", selectedSpecies));
        } else if (item.Effects.includes("{status}")) {
          if (selectedStatuses === "All") {
            statuses.forEach((status) => {
              prefixes.push(item.Effects.replace("{status}", status));
            });
          } else
            prefixes.push(item.Effects.replace("{status}", selectedStatuses));
        } else if (item.Effects.includes("{attribute}")) {
          if (selectedAttributes === "All") {
            attributes.forEach((attribute) => {
              prefixes.push(item.Effects.replace("{attribute}", attribute));
            });
          } else
            prefixes.push(
              item.Effects.replace("{attribute}", selectedAttributes)
            );
        } else {
          prefixes.push(item.Effects);
        }
      }
    });
    return prefixes;
  };

  const prefixes = useMemo(generatePrefixes, [
    selectedDamageType,
    selectedSpecies,
    selectedStatuses,
  ]);
  const suffixes = useMemo(generateSuffixes, [
    selectedDamageType,
    selectedSpecies,
    selectedStatuses,
    selectedAttributes,
  ]);

  const getRandomPrefix = () => {
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  };

  const getRandomSuffix = () => {
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  };

  return (
    <>
      <Typography
        variant="h4"
        sx={{
          px: 3,
          py: 1,
          color: "#ffffff",
          background: `linear-gradient(to right, ${primary}, ${quaternary}, transparent)`,
        }}
      >
        <Spa sx={{ fontSize: 36, marginRight: 1 }} />
        Qualities Generator
      </Typography>
      <Paper
        sx={{
          background: "#ffffff",
          padding: 2,
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
      <Grid container spacing={1} sx={{ my: 1 }}>
        <Grid item xs={3}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            defaultValue={"All"}
            value={selectedDamageType}
            options={["All", ...damageTypes]}
            size="small"
            onChange={(evt, val2) => {
              if (val2) {
                setSelectedDamageType(val2);
              } else setSelectedDamageType("All");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Damage Type" />
            )}
          />
        </Grid>
        <Grid item xs={3}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            value={selectedSpecies}
            options={["All", ...species]}
            size="small"
            onChange={(evt, val2) => {
              if (val2) {
                setSelectedSpecies(val2);
              } else setSelectedSpecies("All");
            }}
            renderInput={(params) => <TextField {...params} label="Species" />}
          />
        </Grid>
        <Grid item xs={3}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            value={selectedAttributes}
            options={["All", ...attributes]}
            size="small"
            onChange={(evt, val2) => {
              if (val2) {
                setSelectedAttributes(val2);
              } else setSelectedAttributes("All");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Attributes" />
            )}
          />
        </Grid>
        <Grid item xs={3}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            value={selectedStatuses}
            options={["All", ...statuses]}
            size="small"
            onChange={(evt, val2) => {
              if (val2) {
                setSelectedStatues(val2);
              } else setSelectedStatues("All");
            }}
            renderInput={(params) => <TextField {...params} label="Statuses" />}
          />
        </Grid>
      </Grid>

      <Paper
        sx={{
          background: "linear-gradient(to right, #eaf0f4, transparent)",
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            px: 1,
          }}
        > {`${getRandomPrefix()}, ${getRandomSuffix()}`}</Typography>
        <Button
          variant="contained"
          startIcon={<RestartAltOutlined />}
          onClick={() => {
            setGenerate(generate + 1);
          }}
          sx={{
            minWidth: 100,
          }}
        >
          Generate
        </Button>
      </Paper>
      <Typography sx={{ fontSize: 14, marginLeft: 1}}>
        Warning: Some effects are imbalanced, use with caution!
      </Typography>
      </Paper>
    </>
  );
}

export default RitualsProjects;
