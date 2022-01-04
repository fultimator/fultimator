import { Typography } from "@mui/material";
import {
  BoltIcon,
  DarkIcon,
  EarthIcon,
  FireIcon,
  IceIcon,
  LightIcon,
  PhysicalIcon,
  PoisonIcon,
  WindIcon,
} from "./icons";

export function TypeName({ type }) {
  return (
    <>
      {type === "physical" && "Fisico"}
      {type === "wind" && "Aria"}
      {type === "bolt" && "Fulmine"}
      {type === "dark" && "Oscurità"}
      {type === "earth" && "Terra"}
      {type === "fire" && "Fuoco"}
      {type === "ice" && "Ghiaccio"}
      {type === "light" && "Luce"}
      {type === "poison" && "Veleno"}
    </>
  );
}

export function TypeIcon({ type, disabled }) {
  return (
    <>
      {type === "physical" && <PhysicalIcon disabled={disabled} />}
      {type === "wind" && <WindIcon disabled={disabled} />}
      {type === "bolt" && <BoltIcon disabled={disabled} />}
      {type === "dark" && <DarkIcon disabled={disabled} />}
      {type === "earth" && <EarthIcon disabled={disabled} />}
      {type === "fire" && <FireIcon disabled={disabled} />}
      {type === "ice" && <IceIcon disabled={disabled} />}
      {type === "light" && <LightIcon disabled={disabled} />}
      {type === "poison" && <PoisonIcon disabled={disabled} />}
    </>
  );
}

export function TypeAffinity({ type, affinity }) {
  const disabled = affinity === 1;

  return (
    <Typography fontSize="1rem" color="red.main" fontWeight="bold">
      {/* Type */}
      <TypeIcon type={type} disabled={disabled} />

      {/* Affinity */}
      {affinity === 0 && " VU"}
      {affinity === 2 && " RS"}
      {affinity === 3 && " IM"}
      {affinity === 4 && " AS"}
    </Typography>
  );
}

export const typeList = [
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
