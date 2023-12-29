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
} from "@mui/material";
import { useState } from "react";
import Layout from "../../components/Layout";
import Weapons from "../equip/weapons/Weapons";

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
    <Layout>
      <Grid container>
        <Grid item xs={4}>
          <Rituals />
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={6}>
          <Projects />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginBottom: 10, marginTop: 5 }}>
        <Grid item xs={12}>
          <Weapons />
        </Grid>
      </Grid>
    </Layout>
  );
}

function Rituals() {
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
      <Typography variant="h4">Rituals</Typography>
      <Grid container>
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
    </>
  );
}
function Projects() {
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
      <Typography variant="h4">Projects</Typography>
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
    </>
  );
}

export default RitualsProjects;
