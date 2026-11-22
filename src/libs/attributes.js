import { t } from "../translation/translate";

const attributes = {
  dexterity: {
    short: t("dex", true),
    shortcaps: t("DEX", true),
    long: t("Dexterity", true),
  },
  insight: {
    short: t("ins", true),
    shortcaps: t("INS", true),
    long: t("Insight", true),
  },
  might: {
    short: t("mig", true),
    shortcaps: t("MIG", true),
    long: t("Might", true),
  },
  willpower: {
    short: t("wil", true),
    shortcaps: t("WLP", true),
    long: t("Willpower", true),
  },
};

Object.defineProperties(attributes, {
  will: {
    get() {
      return this.willpower;
    },
    enumerable: false,
    configurable: true,
  },
  wlp: {
    get() {
      return this.willpower;
    },
    enumerable: false,
    configurable: true,
  },
  dex: {
    get() {
      return this.dexterity;
    },
    enumerable: false,
    configurable: true,
  },
  ins: {
    get() {
      return this.insight;
    },
    enumerable: false,
    configurable: true,
  },
  mig: {
    get() {
      return this.might;
    },
    enumerable: false,
    configurable: true,
  },
});

export default attributes;

export const attrNoTranslation = {
  dexterity: {
    short: "dex",
    shortcaps: "DEX",
    long: "Dexterity",
  },
  insight: {
    short: "ins",
    shortcaps: "INS",
    long: "Insight",
  },
  might: {
    short: "mig",
    shortcaps: "MIG",
    long: "Might",
  },
  willpower: {
    short: "wlp",
    shortcaps: "WLP",
    long: "Willpower",
  },
};

Object.defineProperties(attrNoTranslation, {
  will: {
    get() {
      return this.willpower;
    },
    enumerable: false,
    configurable: true,
  },
  wlp: {
    get() {
      return this.willpower;
    },
    enumerable: false,
    configurable: true,
  },
  dex: {
    get() {
      return this.dexterity;
    },
    enumerable: false,
    configurable: true,
  },
  ins: {
    get() {
      return this.insight;
    },
    enumerable: false,
    configurable: true,
  },
  mig: {
    get() {
      return this.might;
    },
    enumerable: false,
    configurable: true,
  },
});
