export const availableGifts = [
  {
    fuid: "atmokinesis",
    name: "esper_gift_atmokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_atmokinesis_desc",
  },
  {
    fuid: "clairvoyance",
    name: "esper_gift_clairvoyance",
    event: "esper_event_npc_focus_or_bond",
    effect: "esper_gift_clairvoyance_desc",
  },
  {
    fuid: "gravitokinesis",
    name: "esper_gift_gravitokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_gravitokinesis_desc",
  },
  {
    fuid: "life-transference",
    name: "esper_gift_life_transference",
    event: "When you **cause one or more enemies to lose HP**",
    effect: "esper_gift_life_transference_desc",
  },
  {
    fuid: "photokinesis",
    name: "esper_gift_photokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_photokinesis_desc",
  },
  {
    fuid: "psychic-backlash",
    name: "esper_gift_psychic_backlash",
    event: "esper_event_succ_opp_check_lose_hp",
    effect: "esper_gift_psychic_backlash_desc",
  },
  {
    fuid: "psychic-shield",
    name: "esper_gift_psychic_shield",
    event: "esper_event_enemy_acc_mag_check",
    effect: "esper_gift_psychic_shield_desc",
  },
  {
    fuid: "reassuring-presence",
    name: "esper_gift_reassuring_presence",
    event: "esper_event_cover_ally",
    effect: "esper_gift_reassuring_presence_desc",
  },
  {
    fuid: "thermokinesis",
    name: "esper_gift_thermokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_thermokinesis_desc",
  },
  {
    fuid: "custom-gift",
    name: "esper_gift_custom_name",
    event: "",
    effect: "",
    customName: "",
  },
];

export const availableDances = [
  {
    fuid: "angel-dance",
    name: "dance_angel",
    effect: "dance_angel_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "banshee-dance",
    name: "dance_banshee",
    effect: "dance_banshee_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "bat-dance",
    name: "dance_bat",
    effect: "dance_bat_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "golem-dance",
    name: "dance_golem",
    effect: "dance_golem_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "griffin-dance",
    name: "dance_griffin",
    effect: "dance_griffin_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "hydra-dance",
    name: "dance_hydra",
    effect: "dance_hydra_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "kraken-dance",
    name: "dance_kraken",
    effect: "dance_kraken_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "lion-dance",
    name: "dance_lion",
    effect: "dance_lion_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "maenad-dance",
    name: "dance_maenad",
    effect: "dance_maenad_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "myrmidon-dance",
    name: "dance_myrmidon",
    effect: "dance_myrmidon_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "nightmare-dance",
    name: "dance_nightmare",
    effect: "dance_nightmare_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "ouroboros-dance",
    name: "dance_ouroboros",
    effect: "dance_ouroboros_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "peacock-dance",
    name: "dance_peacock",
    effect: "dance_peacock_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "phoenix-dance",
    name: "dance_phoenix",
    effect: "dance_phoenix_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "satyr-dance",
    name: "dance_satyr",
    effect: "dance_satyr_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "unicorn-dance",
    name: "dance_unicorn",
    effect: "dance_unicorn_desc",
    duration: "dance_duration_instant",
  },
  {
    fuid: "yeti-dance",
    name: "dance_yeti",
    effect: "dance_yeti_desc",
    duration: "dance_duration_next_turn",
  },
  {
    fuid: "custom-dance",
    name: "dance_custom_name",
    effect: "",
    duration: "",
    customName: "",
  },
];

export const availableMagichantKeys = [
  {
    fuid: "flame",
    name: "magichant_flame",
    type: "fire",
    status: "Shaken",
    attribute: "MIG",
    recovery: "HP",
  },
  {
    fuid: "frost",
    name: "magichant_frost",
    type: "ice",
    status: "Weak",
    attribute: "WLP",
    recovery: "MP",
  },
  {
    fuid: "iron",
    name: "magichant_iron",
    type: "physical",
    status: "Slow",
    attribute: "WLP",
    recovery: "MP",
  },
  {
    fuid: "radiance",
    name: "magichant_radiance",
    type: "light",
    status: "Dazed",
    attribute: "INS",
    recovery: "HP",
  },
  {
    fuid: "shadow",
    name: "magichant_shadow",
    type: "dark",
    status: "Weak",
    attribute: "DEX",
    recovery: "MP",
  },
  {
    fuid: "stone",
    name: "magichant_stone",
    type: "earth",
    status: "Dazed",
    attribute: "MIG",
    recovery: "HP",
  },
  {
    fuid: "thunder",
    name: "magichant_thunder",
    type: "bolt",
    status: "Shaken",
    attribute: "DEX",
    recovery: "HP",
  },
  {
    fuid: "wind",
    name: "magichant_wind",
    type: "wind",
    status: "Slow",
    attribute: "INS",
    recovery: "MP",
  },
  {
    fuid: "custom-key",
    name: "magichant_custom_name",
    type: "",
    status: "",
    attribute: "",
    recovery: "",
    customName: "",
  },
];

export const availableMagichantTones = [
  {
    fuid: "calm",
    name: "magichant_tone_calm",
    effect: "magichant_tone_calm_desc",
  },
  {
    fuid: "energetic",
    name: "magichant_tone_energetic",
    effect: "magichant_tone_energetic_desc",
  },
  {
    fuid: "frantic",
    name: "magichant_tone_frantic",
    effect: "magichant_tone_frantic_desc",
  },
  {
    fuid: "haunting",
    name: "magichant_tone_haunting",
    effect: "magichant_tone_haunting_desc",
  },
  {
    fuid: "lively",
    name: "magichant_tone_lively",
    effect: "magichant_tone_lively_desc",
  },
  {
    fuid: "menacing",
    name: "magichant_tone_menacing",
    effect: "magichant_tone_menacing_desc",
  },
  {
    fuid: "solemn",
    name: "magichant_tone_solemn",
    effect: "magichant_tone_solemn_desc",
  },
  {
    fuid: "custom-tone",
    name: "magichant_custom_name",
    effect: "",
    customName: "",
  },
];

export const availableTherioforms = [
  {
    fuid: "amphibia",
    name: "mutant_therioform_amphibia",
    genoclepsis: "mutant_therioform_amphibia_geno",
    description: "mutant_therioform_amphibia_desc",
  },
  {
    fuid: "arpaktida",
    name: "mutant_therioform_arpaktida",
    genoclepsis: "mutant_therioform_arpaktida_geno",
    description: "mutant_therioform_arpaktida_desc",
  },
  {
    fuid: "dynamotheria",
    name: "mutant_therioform_dynamotheria",
    genoclepsis: "mutant_therioform_dynamotheria_geno",
    description: "mutant_therioform_dynamotheria_desc",
  },
  {
    fuid: "electrophora",
    name: "mutant_therioform_electrophora",
    genoclepsis: "mutant_therioform_electrophora_geno",
    description: "mutant_therioform_electrophora_desc",
  },
  {
    fuid: "neurophagoida",
    name: "mutant_therioform_neurophagoida",
    genoclepsis: "mutant_therioform_neurophagoida_geno",
    description: "mutant_therioform_neurophagoida_desc",
  },
  {
    fuid: "placophora",
    name: "mutant_therioform_placophora",
    genoclepsis: "mutant_therioform_placophora_geno",
    description: "mutant_therioform_placophora_desc",
  },
  {
    fuid: "pneumophora",
    name: "mutant_therioform_pneumophora",
    genoclepsis: "mutant_therioform_pneumophora_geno",
    description: "mutant_therioform_pneumophora_desc",
  },
  {
    fuid: "polypoda",
    name: "mutant_therioform_polypoda",
    genoclepsis: "mutant_therioform_polypoda_geno",
    description: "mutant_therioform_polypoda_desc",
  },
  {
    fuid: "pterotheria",
    name: "mutant_therioform_pterotheria",
    genoclepsis: "mutant_therioform_pterotheria_geno",
    description: "mutant_therioform_pterotheria_desc",
  },
  {
    fuid: "pyrophora",
    name: "mutant_therioform_pyrophora",
    genoclepsis: "mutant_therioform_pyrophora_geno",
    description: "mutant_therioform_pyrophora_desc",
  },
  {
    fuid: "tachytheria",
    name: "mutant_therioform_tachytheria",
    genoclepsis: "mutant_therioform_tachytheria_geno",
    description: "mutant_therioform_tachytheria_desc",
  },
  {
    fuid: "toxicophora",
    name: "mutant_therioform_toxicophora",
    genoclepsis: "mutant_therioform_toxicophora_geno",
    description: "mutant_therioform_toxicophora_desc",
  },
  {
    fuid: "custom-therioform",
    name: "mutant_therioform_custom_name",
    genoclepsis: "",
    description: "",
    customName: "",
  },
];

export const availableSymbols = [
  {
    fuid: "symbol-of-binding",
    name: "symbol_binding",
    effect: "symbol_binding_desc",
  },
  {
    fuid: "symbol-of-creation",
    name: "symbol_creation",
    effect: "symbol_creation_desc",
  },
  {
    fuid: "symbol-of-despair",
    name: "symbol_despair",
    effect: "symbol_despair_desc",
  },
  {
    fuid: "symbol-of-destiny",
    name: "symbol_destiny",
    effect: "symbol_destiny_desc",
  },
  {
    fuid: "symbol-of-elements",
    name: "symbol_elements",
    effect: "symbol_elements_desc",
  },
  {
    fuid: "symbol-of-enmity",
    name: "symbol_enmity",
    effect: "symbol_enmity_desc",
  },
  {
    fuid: "symbol-of-flux",
    name: "symbol_flux",
    effect: "symbol_flux_desc",
  },
  {
    fuid: "symbol-of-forbiddance",
    name: "symbol_forbiddance",
    effect: "symbol_forbiddance_desc",
  },
  {
    fuid: "symbol-of-growth",
    name: "symbol_growth",
    effect: "symbol_growth_desc",
  },
  {
    fuid: "symbol-of-metamorphosis",
    name: "symbol_metamorphosis",
    effect: "symbol_metamorphosis_desc",
  },
  {
    fuid: "symbol-of-prosperity",
    name: "symbol_prosperity",
    effect: "symbol_prosperity_desc",
  },
  {
    fuid: "symbol-of-protection",
    name: "symbol_protection",
    effect: "symbol_protection_desc",
  },
  {
    fuid: "symbol-of-rebellion",
    name: "symbol_rebellion",
    effect: "symbol_rebellion_desc",
  },
  {
    fuid: "symbol-of-rebirth",
    name: "symbol_rebirth",
    effect: "symbol_rebirth_desc",
  },
  {
    fuid: "symbol-of-revenge",
    name: "symbol_revenge",
    effect: "symbol_revenge_desc",
  },
  {
    fuid: "symbol-of-sacrifice",
    name: "symbol_sacrifice",
    effect: "symbol_sacrifice_desc",
  },
  {
    fuid: "symbol-of-sorcery",
    name: "symbol_sorcery",
    effect: "symbol_sorcery_desc",
  },
  {
    fuid: "symbol-of-truth",
    name: "symbol_truth",
    effect: "symbol_truth_desc",
  },
  {
    fuid: "symbol-of-weakness",
    name: "symbol_weakness",
    effect: "symbol_weakness_desc",
  },
  {
    fuid: "symbol-of-custom",
    name: "symbol_custom_name",
    effect: "",
    customName: "",
  },
];

export const invocationsByWellspring = {
  Air: [
    {
      fuid: "aero-blast",
      name: "invoker_aero_blast",
      type: "Blast",
      effect: "invoker_aero_blast_desc",
    },
    {
      fuid: "aero-hex",
      name: "invoker_aero_hex",
      type: "Hex",
      effect: "invoker_aero_hex_desc",
    },
    {
      fuid: "breeze",
      name: "invoker_breeze",
      type: "Utility",
      effect: "invoker_breeze_desc",
    },
    {
      fuid: "twister",
      name: "invoker_twister",
      type: "Utility",
      effect: "invoker_twister_desc",
    },
  ],
  Earth: [
    {
      fuid: "geo-blast",
      name: "invoker_geo_blast",
      type: "Blast",
      effect: "invoker_geo_blast_desc",
    },
    {
      fuid: "geo-hex",
      name: "invoker_geo_hex",
      type: "Hex",
      effect: "invoker_geo_hex_desc",
    },
    {
      fuid: "geo-growth",
      name: "invoker_growth",
      type: "Utility",
      effect: "invoker_growth_desc",
    },
    {
      fuid: "quicksand",
      name: "invoker_quicksand",
      type: "Utility",
      effect: "invoker_quicksand_desc",
    },
  ],
  Fire: [
    {
      fuid: "pyro-blast",
      name: "invoker_pyro_blast",
      type: "Blast",
      effect: "invoker_pyro_blast_desc",
    },
    {
      fuid: "pyro-hex",
      name: "invoker_pyro_hex",
      type: "Hex",
      effect: "invoker_pyro_hex_desc",
    },
    {
      fuid: "burst",
      name: "invoker_burst",
      type: "Utility",
      effect: "invoker_burst_desc",
    },
    {
      fuid: "smoke",
      name: "invoker_smoke",
      type: "Utility",
      effect: "invoker_smoke_desc",
    },
  ],
  Lightning: [
    {
      fuid: "electro-blast",
      name: "invoker_electro_blast",
      type: "Blast",
      effect: "invoker_electro_blast_desc",
    },
    {
      fuid: "electro-hex",
      name: "invoker_electro_hex",
      type: "Hex",
      effect: "invoker_electro_hex_desc",
    },
    {
      fuid: "static",
      name: "invoker_static",
      type: "Utility",
      effect: "invoker_static_desc",
    },
    {
      fuid: "thunder",
      name: "invoker_thunder",
      type: "Utility",
      effect: "invoker_thunder_desc",
    },
  ],
  Water: [
    {
      fuid: "hydro-blast",
      name: "invoker_hydro_blast",
      type: "Blast",
      effect: "invoker_hydro_blast_desc",
    },
    {
      fuid: "hydro-hex",
      name: "invoker_hydro_hex",
      type: "Hex",
      effect: "invoker_hydro_hex_desc",
    },
    {
      fuid: "chill",
      name: "invoker_chill",
      type: "Utility",
      effect: "invoker_chill_desc",
    },
    {
      fuid: "frostbite",
      name: "invoker_frostbite",
      type: "Utility",
      effect: "invoker_frostbite_desc",
    },
  ],
};

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

[
  availableGifts,
  availableDances,
  availableTherioforms,
  availableMagichantKeys,
  availableMagichantTones,
  availableSymbols,
].forEach((list) => {
  list.forEach((item) => {
    if (item.fuid === undefined && item.name) item.fuid = slugify(item.name);
  });
});
Object.values(invocationsByWellspring).forEach((list) => {
  list.forEach((item) => {
    if (item.fuid === undefined && item.name) item.fuid = slugify(item.name);
  });
});
