import { Box, Typography } from "@mui/material";
import {
  BoltIcon,
  DarkIcon,
  EarthIcon,
  FireIcon,
  IceIcon,
  LightIcon,
  PhysicalIcon,
  PoisonIcon,
  AirIcon,
} from "../../icons";
import { useTranslate } from "../../../translation/translate";
// import { typeList } from "../../typeConstants";

export function TypeName({ type }) {
  const { t } = useTranslate();
  return (
    <>
      {type === "physical" && t("Physical")}
      {type === "air" && t("Air")}
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

export function TypeIcon({ type, disabled, size }) {
  return (
    <>
      {type === "physical" && <PhysicalIcon disabled={disabled} size={size} />}
      {type === "air" && <AirIcon disabled={disabled} size={size} />}
      {type === "bolt" && <BoltIcon disabled={disabled} size={size} />}
      {type === "dark" && <DarkIcon disabled={disabled} size={size} />}
      {type === "earth" && <EarthIcon disabled={disabled} size={size} />}
      {type === "fire" && <FireIcon disabled={disabled} size={size} />}
      {type === "ice" && <IceIcon disabled={disabled} size={size} />}
      {type === "light" && <LightIcon disabled={disabled} size={size} />}
      {type === "poison" && <PoisonIcon disabled={disabled} size={size} />}
    </>
  );
}

export function TypeAffinity({ type, affinity, iconSize }) {
  if (!affinity) {
    affinity = "";
  }
  const disabled = affinity === "";

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
      <TypeIcon type={type} disabled={disabled} size={iconSize} />
      {affinity && (
        <Typography
          sx={{
            color: "red.main",
            fontWeight: "bold",
            fontFamily: "Antonio",
            textTransform: "uppercase",
            fontSize: "1.1rem",
            lineHeight: 1,
            letterSpacing: "0.03em",
          }}
        >
          {affinity}
        </Typography>
      )}
    </Box>
  );
}
