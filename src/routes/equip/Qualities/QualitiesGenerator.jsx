import {
  Autocomplete,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { RestartAltOutlined } from "@mui/icons-material";
import { useMemo, useState, useEffect } from "react";
import randomQualities from "../../generator/randomqualities.json";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import CopyToClipboard from "../../../components/common/CopyToClipboard";

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

function QualitiesGenerator({ onGenerate }) {
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(to right, ${theme.primary}, ${theme.quaternary})`
      : `linear-gradient(to right, ${theme.ternary}, transparent)`;
  const [selectedDamageType, setSelectedDamageType] = useState("All");
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [selectedAttributes, setSelectedAttributes] = useState("All");
  const [selectedStatuses, setSelectedStatues] = useState("All");
  const [generate, setGenerate] = useState(0);
  const [currentGeneratedText, setCurrentGeneratedText] = useState("");

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
            prefixes.push(item.Conditions.replace("{type}", selectedDamageType));
        } else if (item.Conditions.includes("{species}")) {
          if (selectedSpecies === "All") {
            species.forEach((speciesGet) => {
              prefixes.push(item.Conditions.replace("{species}", speciesGet));
            });
          } else
            prefixes.push(item.Conditions.replace("{species}", selectedSpecies));
        } else if (item.Conditions.includes("{status}")) {
          if (selectedStatuses === "All") {
            statuses.forEach((status) => {
              prefixes.push(item.Conditions.replace("{status}", status));
            });
          } else
            prefixes.push(item.Conditions.replace("{status}", selectedStatuses));
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

  const generateRandomValues = () => {
    const prefix = getRandomPrefix();
    const suffix = getRandomSuffix();
    const result = `${prefix}, ${suffix}`;
    setCurrentGeneratedText(result);
    if (onGenerate) onGenerate(result);
  };

  useEffect(() => {
    generateRandomValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate]);

  return (
    <Grid container spacing={1}>
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <Autocomplete
          disablePortal
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
          renderInput={(params) => <TextField {...params} label="Damage Type" />}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <Autocomplete
          disablePortal
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
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <Autocomplete
          disablePortal
          fullWidth
          value={selectedAttributes}
          options={["All", ...attributes]}
          size="small"
          onChange={(evt, val2) => {
            if (val2) {
              setSelectedAttributes(val2);
            } else setSelectedAttributes("All");
          }}
          renderInput={(params) => <TextField {...params} label="Attributes" />}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <Autocomplete
          disablePortal
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
      <Grid  size={12}>
        <Paper
          sx={{
            background,
            padding: 2,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mb: 1,
            mt: 1,
          }}
        >
          <Typography
            sx={{
              px: 1,
              flex: 1,
            }}
          >
            {" "}
            {currentGeneratedText}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RestartAltOutlined />}
            onClick={() => {
              setGenerate(generate + 1);
              generateRandomValues();
            }}
            sx={{
              minWidth: 100,
              fontWeight: "bold",
              mr: 1,
            }}
          >
            Generate
          </Button>
          <CopyToClipboard textToCopy={currentGeneratedText} />
        </Paper>
        <Typography sx={{ fontSize: 12, marginLeft: 1 }}>
          Warning: Some effects are imbalanced, use with caution!
        </Typography>
      </Grid>
    </Grid>
  );
}

export default QualitiesGenerator;
