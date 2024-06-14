import { t } from "../translation/translate";

const shields = [
  {
    category: t("Shield", true),
    name: t("Bronze Shield", true),
    cost: 100,
    def: 2,
    mdef: 0,
    martial: false,
    init: 0
  },
  {
    category: t("Shield", true),
    name: t("Runic Shield", true),
    cost: 150,
    def: 2,
    mdef: 2,
    martial: true,
    init: 0
  }
];

export default shields;
