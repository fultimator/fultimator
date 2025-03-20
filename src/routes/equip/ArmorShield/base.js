import { t } from "../../../translation/translate";

const shield = [
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
  },
  {
    category: t("Armor", true),
    name: t("Silk Shirt", true),
    cost: 100,
    def: 0,
    mdef: 2,
    armor: true,
    martial: false,
    init: -1
  },
  {
    category: t("Armor", true),
    name: t("Travel Garb", true),
    cost: 100,
    def: 1,
    mdef: 1,
    armor: true,
    martial: false,
    init: -1
  },
  {
    category: t("Armor", true),
    name: t("Combat Tunic", true),
    cost: 150,
    def: 1,
    mdef: 1,
    armor: true,
    martial: false,
    init: 0
  },
  {
    category: t("Armor", true),
    name: t("Combat Tunic (Rework)", true),
    cost: 150,
    def: 2,
    mdef: 0,
    armor: true,
    martial: false,
    init: 0
  },
  {
    category: t("Armor", true),
    name: t("Sage Robe", true),
    cost: 200,
    def: 1,
    mdef: 2,
    armor: true,
    martial: false,
    init: -2
  },
  {
    category: t("Armor", true),
    name: t("Brigandine", true),
    cost: 150,
    def: 10,
    mdef: 0,
    armor: true,
    martial: true,
    init: -2
  },
  {
    category: t("Armor", true),
    name: t("Bronze Plate", true),
    cost: 200,
    def: 11,
    mdef: 0,
    armor: true,
    martial: true,
    init: -3
  },
  {
    category: t("Armor", true),
    name: t("Runic Plate", true),
    cost: 250,
    def: 11,
    mdef: 1,
    armor: true,
    martial: true,
    init: -3
  },
  {
    category: t("Armor", true),
    name: t("Steel Plate", true),
    cost: 300,
    def: 12,
    mdef: 0,
    armor: true,
    martial: true,
    init: -4
  },
];

export default shield;
