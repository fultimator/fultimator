import { Checkbox, FormControlLabel, Typography } from "@mui/material";

import {
  GiExplosionRays,
  GiPlainDagger,
  GiPowerLightning,
  GiSnowflake1,
  GiWindSlap,
} from "react-icons/gi";

function CheckElement({ element, icon, checked, onSelectElement }) {
  return (
    <FormControlLabel
      control={
        <Checkbox checked={checked} onChange={onSelectElement} name={element} />
      }
      label={
        <>
          {elementIcons[element]} {elementNames[element]}
        </>
      }
    />
  );
}

const elementNames = {
  physical: "Fisico",
  wind: "Vento",
  lightning: "Fulmine",
  dark: "Ombra",
  earth: "Terra",
  fire: "Fuoco",
  ice: "Ghiaccio",
  light: "Luce",
  poison: "Veleno",
};

const elementIcons = {
  physical: (
    <GiPlainDagger
      stroke="#000000"
      strokeWidth={16}
      size={20}
      color="#c6c6c6"
      style={{ verticalAlign: "sub", transform: "rotate(-90deg)" }}
    />
  ),
  wind: (
    <GiWindSlap
      stroke="#000000"
      strokeWidth={16}
      size={20}
      color="#cfd600"
      style={{ verticalAlign: "sub" }}
    />
  ),
  lightning: (
    <GiPowerLightning
      stroke="#000000"
      strokeWidth={16}
      size={20}
      color="#ffef26"
      style={{ verticalAlign: "sub" }}
    />
  ),
  dark: "",
  earth: "",
  fire: "",
  ice: (
    <GiSnowflake1
      stroke="#000000"
      strokeWidth={16}
      size={20}
      color="#bce4fa"
      style={{ verticalAlign: "sub" }}
    />
  ),
  light: (
    <GiExplosionRays
      stroke="#000000"
      strokeWidth={16}
      size={20}
      color="#fff7b2"
      style={{ verticalAlign: "sub" }}
    />
  ),
  poison: "",
};

const elementList = [
  "physical",
  "wind",
  "lightning",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
];

// Affinity is calculated in a progressive manner from these:
// race - race options - skills
function calcAffinity(npc, element, opts) {}

function elementName(element) {
  return elementNames[element];
}

function elementDamage(element) {
  if (element === "physical") {
    return (
      <>
        <Typography component="span">danni</Typography>{" "}
        <Typography component="span" fontWeight="bold">
          fisici
        </Typography>
      </>
    );
  }

  return (
    <>
      <Typography component="span">danni da</Typography>{" "}
      <Typography
        component="span"
        fontWeight="bold"
        sx={{ textTransform: "lowercase" }}
      >
        {elementName(element)}
      </Typography>
    </>
  );
}

export { elementList, elementName, elementDamage, calcAffinity, CheckElement };
