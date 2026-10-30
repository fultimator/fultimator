import { t } from "../translation/translate";

const types = {
  physical: {
    long: t("physical", true),
  },
  air: {
    long: t("air", true),
  },
  bolt: {
    long: t("bolt", true),
  },
  dark: {
    long: t("dark", true),
  },
  earth: {
    long: t("earth", true),
  },
  fire: {
    long: t("fire", true),
  },
  ice: {
    long: t("ice", true),
  },
  light: {
    long: t("light", true),
  },
  poison: {
    long: t("poison", true),
  },
  untyped: {
    long: t("untyped", true),
  },
};

export const typesList = [
  "physical",
  "air",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
  "untyped",
];

export default types;
