import { tinkererAlchemy, tinkererInfusion } from "/src/libs/classes";

export function createBlankSpellForType(spellType) {
  if (spellType === "default")
    return {
      spellType,
      name: "New Spell",
      cost: { resource: "mp", amount: 0, perTarget: true },
      maxTargets: 0,
      targetDescription: "",
      duration: "",
      description: "",
      isOffensive: false,
      attr1: "dexterity",
      attr2: "dexterity",
      showInPlayerSheet: true,
    };
  if (spellType === "arcanist")
    return {
      spellType,
      name: "New Arcana",
      domain: "",
      description: "",
      domainDesc: "",
      merge: "",
      mergeDesc: "",
      dismiss: "",
      dismissDesc: "",
      showInPlayerSheet: true,
    };
  if (spellType === "arcanist-rework")
    return {
      spellType,
      name: "New Arcana",
      domain: "",
      description: "",
      domainDesc: "",
      merge: "",
      mergeDesc: "",
      pulse: "",
      pulseDesc: "",
      dismiss: "",
      dismissDesc: "",
      showInPlayerSheet: true,
    };
  if (spellType === "tinkerer-alchemy")
    return { spellType, showInPlayerSheet: true, ...tinkererAlchemy };
  if (spellType === "tinkerer-infusion")
    return { spellType, showInPlayerSheet: true, ...tinkererInfusion };
  if (spellType === "tinkerer-magitech")
    return { spellType, showInPlayerSheet: true, rank: 1, magispheres: [] };
  if (spellType === "gamble")
    return {
      spellType,
      showInPlayerSheet: true,
      spellName: "New Gamble",
      cost: { resource: "mp", amount: 10, perTarget: true },
      maxTargets: 2,
      targetDescription: "Special",
      duration: "Instantaneous",
      attr: "will",
      targets: [
        { rangeFrom: 1, rangeTo: 6, effect: "First Effect", secondRoll: false, secondEffects: [] },
        { rangeFrom: 7, rangeTo: 12, effect: "Second Effect", secondRoll: false, secondEffects: [] },
      ],
    };
  if (spellType === "magichant")
    return { spellType, showInPlayerSheet: true, keys: [], tones: [] };
  if (spellType === "symbol")
    return { spellType, showInPlayerSheet: true, symbols: [] };
  if (spellType === "dance")
    return { spellType, showInPlayerSheet: true, dances: [] };
  if (spellType === "gift")
    return { spellType, showInPlayerSheet: true, gifts: [], clock: 0 };
  if (spellType === "therioform")
    return { spellType, showInPlayerSheet: true, therioforms: [] };
  if (spellType === "pilot-vehicle")
    return { spellType, showInPlayerSheet: true, vehicles: [] };
  if (spellType === "magiseed")
    return {
      spellType,
      showInPlayerSheet: true,
      magiseeds: [],
      currentMagiseed: null,
      growthClock: 0,
      gardenDescription: "",
    };
  if (spellType === "cooking")
    return { spellType, spellName: "Cookbook", cookbookEffects: [], showInPlayerSheet: true };
  if (spellType === "invocation")
    return {
      spellType,
      spellName: "Invocation",
      invocations: [],
      activeWellsprings: [],
      showInPlayerSheet: true,
    };
  if (spellType === "deck")
    return {
      spellType: "deck",
      spellName: "Ace of Cards Deck",
      suitConfiguration: { Air: "air", Earth: "earth", Fire: "fire", Ice: "ice" },
      cardsInDeck: 30,
      hand: [],
      discardPile: [],
      showInPlayerSheet: true,
    };
  return { spellType, showInPlayerSheet: true };
}
