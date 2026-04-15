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
} from "../../icons"
import { useTranslate } from "../../../translation/translate";
// import { typeList } from "../../typeConstants";

export function TypeName({ type }) {
  const { t } = useTranslate();
  return (
    <>
      {type === "physical" && t("Physical")}
      {type === "wind" && t("Air")}
      {type === "bolt" && t("Bolt")}
      {type === "dark" && t("Dark")}
      {type === "earth" && t("Earth")}
      {type === "fire" && t("Fire")}
      {type === "ice" && t("Ice")}
      {type === "light" && t("Light")}
      {type === "poison" && t("Poison")}
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
  if (!affinity) {
    affinity = "";
  }
  const disabled = affinity === "";

  return (
    <Typography
      sx={{
        color: "red.main",
        fontWeight: "bold",
        fontFamily: "inherit",
        textAlign: "left",
        textTransform: "uppercase",
        px: 0.2,
        fontSize: "1rem"
      }}>
      {/* Type */}
      <TypeIcon type={type} disabled={disabled} />
      {/* Affinity */} {affinity}
    </Typography>
  );
}
