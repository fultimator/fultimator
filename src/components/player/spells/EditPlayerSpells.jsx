import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, TextField, Button, Divider } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import SpellDefault from "./SpellDefault";
import SpellArcanistModal from "./SpellArcanistModal";
import SpellArcanist from "./SpellArcanist";
import CustomHeader2 from "../../common/CustomHeader2";
import SpellDefaultModal from "./SpellDefaultModal";
import SpellTinkererAlchemy from "./SpellTinkererAlchemy";
import SpellTinkererAlchemyRankModal from "./SpellTinkererAlchemyRankModal";
import SpellTinkererAlchemyTargetModal from "./SpellTinkererAlchemyTargetModal";
import SpellTinkererAlchemyEffectsModal from "./SpellTinkererAlchemyEffectsModal";
import { tinkererAlchemy, tinkererInfusion } from "../../../libs/classes";
import SpellTinkererInfusion from "./SpellTinkererInfusion";
import SpellTinkererInfusionModal from "./SpellTinkererInfusionModal";
import SpellCompendiumModal from "./SpellCompendiumModal";
import SpellTinkererMagitech from "./SpellTinkererMagitech";
import SpellTinkererMagitechRankModal from "./SpellTinkererMagitechRankModal";
import SpellEntropistGambleModal from "./SpellEntropistGambleModal";
import SpellEntropistGamble from "./SpellEntropistGamble";
import SpellChanter from "./SpellChanter";
import SpellChanterModal from "./SpellChanterModal";
import SpellChanterKeysModal from "./SpellChanterKeysModal";
import SpellChanterTonesModal from "./SpellChanterTonesModal";
import SpellSymbolist from "./SpellSymbolist";
import SpellSymbolistModal from "./SpellSymbolistModal";
import SpellSymbolistSymbolsModal from "./SpellSymbolistSymbolsModal";
import SpellDancer from "./SpellDancer";
import SpellDancerModal from "./SpellDancerModal";
import SpellDancerDancesModal from "./SpellDancerDancesModal";
import SpellGift from "./SpellGift";
import SpellGiftModal from "./SpellGiftModal";
import SpellGiftGiftsModal from "./SpellGiftGiftsModal";
import SpellMutant from "./SpellMutant";
import SpellMutantModal from "./SpellMutantModal";
import SpellMutantTherioformsModal from "./SpellMutantTherioformsModal";
import SpellPilot from "./SpellPilot";
import SpellPilotModal from "./SpellPilotModal";
import SpellPilotVehiclesModal from "./SpellPilotVehiclesModal";
import SpellMagiseed from "./SpellMagiseed";
import SpellMagiseedModal from "./SpellMagiseedModal";
import SpellMagiseedMagiseedsModal from "./SpellMagiseedMagiseedsModal";
import SpellGourmet from "./SpellGourmet";
import SpellGourmetModal from "./SpellGourmetModal";
import SpellGourmetCookingModal from "./SpellGourmetCookingModal";
import SpellInvoker from "./SpellInvoker";
import SpellInvokerModal from "./SpellInvokerModal";
import SpellInvokerInvocationsModal from "./SpellInvokerInvocationsModal";
import SpellDeck from "./SpellDeck";
import SpellDeckModal from "./SpellDeckModal";
import GambleExplain from "./GambleExplain";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const [openSpellDefaultModal, setOpenSpellDefaultModal] = useState(false);
  const [openSpellArcanistModal, setOpenSpellArcanistModal] = useState(false);
  const [openAlchemyRankModal, setOpenAlchemyRankModal] = useState(false);
  const [openAlchemyTargetModal, setOpenAlchemyTargetModal] = useState(false);
  const [openAlchemyEffectsModal, setOpenAlchemyEffectsModal] = useState(false);
  const [openInfusionModal, setOpenInfusionModal] = useState(false);
  const [openMagitechRankModal, setOpenMagitechRankModal] = useState(false);
  const [openGambleModal, setOpenGambleModal] = useState(false);
  const [openChantModal, setOpenChantModal] = useState(false);
  const [openChantKeyModal, setOpenChantKeyModal] = useState(false);
  const [openChantToneModal, setOpenChantToneModal] = useState(false);
  const [openSymbolModal, setOpenSymbolModal] = useState(false);
  const [openSymbolSymbolsModal, setOpenSymbolSymbolsModal] = useState(false);
  const [openDancerModal, setOpenDancerModal] = useState(false);
  const [openDancerDancesModal, setOpenDancerDancesModal] = useState(false);
  const [openGiftModal, setOpenGiftModal] = useState(false);
  const [openGiftGiftsModal, setOpenGiftGiftsModal] = useState(false);
  const [openMutantModal, setOpenMutantModal] = useState(false);
  const [openMutantTherioformsModal, setOpenMutantTherioformsModal] = useState(false);
  const [openPilotModal, setOpenPilotModal] = useState(false);
  const [openPilotVehiclesModal, setOpenPilotVehiclesModal] = useState(false);
  const [openMagiseedModal, setOpenMagiseedModal] = useState(false);
  const [openMagiseedMagiseedsModal, setOpenMagiseedMagiseedsModal] = useState(false);
  const [openGourmetModal, setOpenGourmetModal] = useState(false);
  const [openGourmetCookingModal, setOpenGourmetCookingModal] = useState(false);
  const [openInvokerModal, setOpenInvokerModal] = useState(false);
  const [openInvokerInvocationsModal, setOpenInvokerInvocationsModal] = useState(false);
  const [openDeckModal, setOpenDeckModal] = useState(false);

  const [spellBeingEdited, setSpellBeingEdited] = useState(null);
  const [editingSpellClass, setEditingSpellClass] = useState(null);
  const [editingSpellIndex, setEditingSpellIndex] = useState(null);

  const [openCompendiumModal, setOpenCompendiumModal] = useState(false);

  const handleClassChange = (event, newValue) => {
    setSelectedClass(
      newValue
        ? player.classes.find((cls) => t(cls.name) === newValue)?.name
        : null
    );
    setSelectedSpell(null); // Reset selected spell when class changes
  };

  const handleSpellChange = (event, newValue) => {
    setSelectedSpell(newValue);
  };

  const filteredSpells = selectedClass
    ? player.classes.find((cls) => cls.name === selectedClass)?.benefits
        .spellClasses || []
    : [];

  const addNewSpell = (spell) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === selectedClass) {
          if (spell === "default") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  name: "New Spell",
                  mp: 0,
                  maxTargets: 0,
                  targetDesc: "",
                  duration: "",
                  description: "",
                  isOffensive: false,
                  attr1: "dexterity",
                  attr2: "dexterity",
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell === "arcanist") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  name: "New Arcana",
                  domain: "",
                  description: "",
                  domainDesc: "",
                  merge: "",
                  mergeDesc: "",
                  dismiss: "",
                  dismissDesc: "",
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell === "arcanist-rework") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
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
                },
              ],
            };
          } else if (spell === "tinkerer-alchemy") {
            // Check if there's already a tinkerer-alchemy spell
            const hasTinkererAlchemy = cls.spells.some(
              (sp) => sp.spellType === "tinkerer-alchemy"
            );

            if (hasTinkererAlchemy) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-alchemy spell"
                );
              } else {
                alert("You already have a tinkerer-alchemy spell");
              }

              return cls;
            } else {
              // Add a new tinkerer-alchemy spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    // add from tinkererAlchemy const
                    ...tinkererAlchemy,
                  },
                ],
              };
            }
          } else if (spell === "tinkerer-infusion") {
            // Check if there's already a tinkerer-infusion spell
            const hasTinkererInfusion = cls.spells.some(
              (sp) => sp.spellType === "tinkerer-infusion"
            );

            if (hasTinkererInfusion) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-infusion spell"
                );
              } else {
                alert("You already have a tinkerer-infusion spell");
              }
              return cls;
            } else {
              // Add a new tinkerer-infusion spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    // add from tinkererAlchemy const
                    ...tinkererInfusion,
                  },
                ],
              };
            }
          } else if (spell === "tinkerer-magitech") {
            // Check if there's already a tinkerer-magitech spell
            const hasTinkererMagitech = cls.spells.some(
              (sp) => sp.spellType === "tinkerer-magitech"
            );

            if (hasTinkererMagitech) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-magitech spell"
                );
              } else {
                alert("You already have a tinkerer-magitech spell");
              }
              return cls;
            } else {
              // Add a new tinkerer-magitech spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    rank: 1,
                    magispheres: [],
                  },
                ],
              };
            }
          } else if (spell === "gamble") {
            // Add a new gamble spell
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  showInPlayerSheet: true,

                  spellName: "New Gamble",
                  mp: 10,
                  maxTargets: 2,
                  targetDesc: "Special",
                  duration: "Instantaneous",
                  attr: "will",
                  targets: [
                    {
                      rangeFrom: 1,
                      rangeTo: 6,
                      effect: "First Effect",
                      secondRoll: false,
                      secondEffects: [],
                    },
                    {
                      rangeFrom: 7,
                      rangeTo: 12,
                      effect: "Second Effect",
                      secondRoll: false,
                      secondEffects: [],
                    },
                  ],
                },
              ],
            };
          } else if (spell === "magichant") {
            // Check if there's already a magichant spell
            const hasMagichant = cls.spells.some(
              (sp) => sp.spellType === "magichant"
            );

            if (hasMagichant) {
              if (window.electron) {
                window.electron.alert("You already have a magichant spell");
              } else {
                alert("You already have a magichant spell");
              }
              return cls;
            } else {
              // Add a new magichant spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    keys: [],
                    tones: [],
                  },
                ],
              };
            }
          } else if (spell === "symbol") {
            // Check if there's already a symbol spell
            const hasSymbol = cls.spells.some(
              (sp) => sp.spellType === "symbol"
            );

            if (hasSymbol) {
              if (window.electron) {
                window.electron.alert("You already have a symbol spell");
              } else {
                alert("You already have a symbol spell");
              }
              return cls;
            } else {
              // Add a new symbol spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    symbols: [],
                  },
                ],
              };
            }
          } else if (spell === "dance") {
            // Check if there's already a dance spell
            const hasDance = cls.spells.some((sp) => sp.spellType === "dance");

            if (hasDance) {
              if (window.electron) {
                window.electron.alert("You already have a dance spell");
              } else {
                alert("You already have a dance spell");
              }
              return cls;
            } else {
              // Add a new dance spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    dances: [],
                  },
                ],
              };
            }
          } else if (spell === "gift") {
            // Check if there's already a gift spell
            const hasGift = cls.spells.some((sp) => sp.spellType === "gift");
            if (hasGift) {
              if (window.electron) {
                window.electron.alert("You already have a gift spell");
              } else {
                alert("You already have a gift spell");
              }
              return cls;
            } else {
              // Add a new gift spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    gifts: [],
                    clock: 0,
                  },
                ],
              };
            }
          } else if (spell === "therioform") {
            // Check if there's already a mutant spell
            const hasTherioform = cls.spells.some((sp) => sp.spellType === "therioform");
            if (hasTherioform) {
              if (window.electron) {
                window.electron.alert("You already have a mutant spell");
              } else {
                alert("You already have a mutant spell");
              }
              return cls;
            } else {
              // Add a new mutant spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    therioforms: [],
                  },
                ],
              };
            }
          } else if (spell === "pilot-vehicle") {
            // Check if there's already a pilot spell
            const hasPilot = cls.spells.some((sp) => sp.spellType === "pilot-vehicle");
            if (hasPilot) {
              if (window.electron) {
                window.electron.alert("You already have a pilot spell");
              } else {
                alert("You already have a pilot spell");
              }
              return cls;
            } else {
              // Add a new pilot spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    vehicles: [],
                  },
                ],
              };
            }
          } else if (spell === "magiseed") {
            const hasMagiseed = cls.spells.some((sp) => sp.spellType === "magiseed");
            if (hasMagiseed) {
              if (window.electron) {
                window.electron.alert("You already have a magiseed spell");
              } else {
                alert("You already have a magiseed spell");
              }
              return cls;
            } else {
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    magiseeds: [],
                    currentMagiseed: null,
                    growthClock: 0,
                    gardenDescription: "",
                  },
                ],
              };
            }
          } else if (spell === "cooking") {
            const hasCooking = cls.spells.some((sp) => sp.spellType === "cooking");
            if (hasCooking) {
              if (window.electron) {
                window.electron.alert("You already have a cooking spell");
              } else {
                alert("You already have a cooking spell");
              }
              return cls;
            } else {
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    spellName: "New Cooking Spell",
                    cookbookEffects: [],
                    showInPlayerSheet: true,
                  },
                ],
              };
            }
          } else if (spell === "invocation") {
            const hasInvocation = cls.spells.some((sp) => sp.spellType === "invocation");
            if (hasInvocation) {
              if (window.electron) {
                window.electron.alert("You already have an invocation spell");
              } else {
                alert("You already have an invocation spell");
              }
              return cls;
            } else {
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    spellName: "Invocation",
                    invocations: [],
                    activeWellsprings: [],
                    showInPlayerSheet: true,
                  },
                ],
              };
            }
          } else if (spell === "deck") {
            const hasDeck = cls.spells.some((sp) => sp.spellType === "deck");
            if (hasDeck) {
              if (window.electron) {
                window.electron.alert("You already have a deck spell");
              } else {
                alert("You already have a deck spell");
              }
              return cls;
            } else {
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: "deck",
                    spellName: "Ace of Cards Deck",
                    suitConfiguration: {
                      Air: 'air',
                      Earth: 'earth',
                      Fire: 'fire',
                      Ice: 'ice'
                    },
                    cardsInDeck: 30,
                    hand: [],
                    discardPile: [],
                    showInPlayerSheet: true,
                  },
                ],
              };
            }
          } else {
            if (window.electron) {
              window.electron.alert(
                spell.toUpperCase() + " spell not implemented yet"
              );
            } else {
              alert(spell.toUpperCase() + " spell not implemented yet");
            }

            return cls;
          }
        }
        return cls;
      }),
    }));

    setSelectedClass(null);
    setSelectedSpell(null);
  };

  const addSpellFromCompendium = (spell) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === selectedClass) {
          if (spell.spellType === "default") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell.spellType,
                  name: t(spell.name),
                  mp: spell.mp,
                  maxTargets: spell.maxTargets,
                  targetDesc: t(spell.targetDesc),
                  duration: t(spell.duration),
                  description: t(spell.description),
                  isOffensive: spell.isOffensive,
                  attr1: spell.attr1,
                  attr2: spell.attr2,
                  isMagisphere: spell.isMagisphere || false,
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell.spellType === "gamble") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell.spellType,
                  spellName: t(spell.name),
                  mp: spell.mp,
                  maxTargets: spell.maxTargets,
                  targetDesc: t(spell.targetDesc),
                  duration: t(spell.duration),
                  attr: spell.attr,
                  targets: spell.targets,
                  isMagisphere: spell.isMagisphere || false,
                  showInPlayerSheet: true,
                },
              ],
            };
          }
        }
        return cls;
      }),
    }));
    setSelectedClass(null);
    setSelectedSpell(null);
  };

  const handleEditDefaultSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenSpellDefaultModal(true);
  };

  const handleEditArcanistSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenSpellArcanistModal(true);
  };

  const handleEditAlchemyRank = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenAlchemyRankModal(true);
  };

  const handleEditAlchemyTarget = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenAlchemyTargetModal(true);
  };

  const handleEditAlchemyEffects = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenAlchemyEffectsModal(true);
  };

  const handleEditInfusionSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenInfusionModal(true);
  };

  const handleEditMagitechRank = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenMagitechRankModal(true);
  };

  const handleEditGambleSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenGambleModal(true);
  };

  const handleEditChantSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenChantModal(true);
  };

  const handleEditChantKey = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenChantKeyModal(true);
  };

  const handleEditChantTone = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenChantToneModal(true);
  };

  const handleEditSymbol = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenSymbolModal(true);
  };

  const handleEditSymbolSymbols = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenSymbolSymbolsModal(true);
  };

  const handleEditDanceSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenDancerModal(true);
  };

  const handleEditDancerDances = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenDancerDancesModal(true);
  };
  const handleEditGiftSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenGiftModal(true);
  };
  const handleEditGiftGifts = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenGiftGiftsModal(true);
  };
  const handleEditMutantSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenMutantModal(true);
  };
  const handleEditMutantTherioforms = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenMutantTherioformsModal(true);
  };

  const handleEditPilotSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenPilotModal(true);
  };

  const handleEditPilotVehicles = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenPilotVehiclesModal(true);
  };

  const handleEditMagiseedSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenMagiseedModal(true);
  };

  const handleEditGourmetSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenGourmetModal(true);
  };

  const handleEditGourmetCooking = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenGourmetCookingModal(true);
  };

  const handleEditInvokerSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenInvokerModal(true);
  };

  const handleEditInvokerInvocations = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenInvokerInvocationsModal(true);
  };

  const handleEditDeckSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenDeckModal(true);
  };

  const handleDeckUpdate = (spellClass, spellIndex, updatedDeck) => {
    setPlayer(prev => ({
      ...prev,
      classes: prev.classes.map(cls => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, idx) => 
              idx === spellIndex ? { ...spell, ...updatedDeck } : spell
            )
          };
        }
        return cls;
      })
    }));
  };

  const handleWellspringToggle = (className, spellIndex, wellspringName) => {
    setPlayer(prev => ({
      ...prev,
      classes: prev.classes.map(cls => {
        if (cls.name === className) {
          return {
            ...cls,
            spells: cls.spells.map((spell, idx) => {
              if (idx === spellIndex && spell.spellType === "invocation") {
                const currentWellsprings = spell.activeWellsprings || [];
                const hasInnerWellspring = spell.innerWellspring && spell.chosenWellspring;
                const isInnerWellspring = hasInnerWellspring && spell.chosenWellspring === wellspringName;
                
                // Don't allow toggling the inner wellspring
                if (isInnerWellspring) {
                  return spell;
                }
                
                let newWellsprings;
                
                if (currentWellsprings.includes(wellspringName)) {
                  // Remove wellspring
                  newWellsprings = currentWellsprings.filter(w => w !== wellspringName);
                } else {
                  // Add wellspring, but limit to 2
                  if (currentWellsprings.length < 2) {
                    newWellsprings = [...currentWellsprings, wellspringName];
                  } else {
                    // Replace the first wellspring with the new one
                    newWellsprings = [currentWellsprings[1], wellspringName];
                  }
                }
                
                return {
                  ...spell,
                  activeWellsprings: newWellsprings,
                };
              }
              return spell;
            })
          };
        }
        return cls;
      })
    }));
  };

  const handleEditMagiseedMagiseeds = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenMagiseedMagiseedsModal(true);
  };

  const handleMagiseedChange = (spellClass, spellIndex, newMagiseed) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, spellIdx) => {
              if (spellIdx === spellIndex && spell.spellType === "magiseed") {
                return {
                  ...spell,
                  currentMagiseed: newMagiseed,
                };
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));
  };

  const handleGrowthClockChange = (spellClass, spellIndex, newValue) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, spellIdx) => {
              if (spellIdx === spellIndex && spell.spellType === "magiseed") {
                return {
                  ...spell,
                  growthClock: newValue,
                };
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));
  };

  const handleGiftClockChange = (spellClass, spellIndex, newValue) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, spellIdx) => {
              if (spellIdx === spellIndex && spell.spellType === "gift") {
                return {
                  ...spell,
                  clock: newValue,
                };
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));
  };

  const handlePilotModuleChange = (spellClass, spellIndex, vehicleIndex, moduleIndex, field, value) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, spellIdx) => {
              if (spellIdx === spellIndex && spell.spellType === "pilot-vehicle") {
                const updatedVehicles = [...spell.vehicles];
                const updatedModules = [...updatedVehicles[vehicleIndex].modules];
                
                if (field === "equipped") {
                  const module = updatedModules[moduleIndex];
                  
                  if (value) {
                    // Equipping - determine default slot
                    if (module.type === "pilot_module_armor") {
                      module.equippedSlot = "armor";
                    } else if (module.type === "pilot_module_weapon" || module.type === "pilot_module_shield") {
                      module.equippedSlot = module.cumbersome ? "both" : "main";
                    } else if (module.type === "pilot_module_support") {
                      module.equippedSlot = "support";
                    }
                    
                    // If weapon is cumbersome, disable other weapon modules
                    if (module.cumbersome && (module.type === "pilot_module_weapon" || module.type === "pilot_module_shield")) {
                      updatedModules.forEach((otherModule, otherIndex) => {
                        if (otherIndex !== moduleIndex && 
                            (otherModule.type === "pilot_module_weapon" || otherModule.type === "pilot_module_shield")) {
                          otherModule.equipped = false;
                          otherModule.enabled = false;
                          otherModule.equippedSlot = null;
                        }
                      });
                    }
                  } else {
                    // Unequipping
                    module.equippedSlot = null;
                  }
                  
                  module.equipped = value;
                  module.enabled = value;
                } else if (field === "equippedSlot") {
                  // Handle equipped slot changes with smart swapping logic
                  const module = updatedModules[moduleIndex];
                  module.equippedSlot = value;
                  
                  // Smart weapon hand swapping logic
                  if (module.type === "pilot_module_weapon" && !module.isShield && !module.cumbersome) {
                    // Find other equipped weapons that are not shields or cumbersome
                    updatedModules.forEach((otherModule, otherIndex) => {
                      if (otherIndex !== moduleIndex && 
                          otherModule.equipped && 
                          otherModule.type === "pilot_module_weapon" &&
                          !otherModule.isShield && 
                          !otherModule.cumbersome) {
                        
                        // If we're switching to main hand and other weapon is in main hand
                        if (value === "main" && otherModule.equippedSlot === "main") {
                          otherModule.equippedSlot = "off";
                        }
                        // If we're switching to off hand and other weapon is in off hand  
                        else if (value === "off" && otherModule.equippedSlot === "off") {
                          otherModule.equippedSlot = "main";
                        }
                      }
                    });
                  }
                } else {
                  // Handle other field changes
                  updatedModules[moduleIndex][field] = value;
                }
                
                updatedVehicles[vehicleIndex].modules = updatedModules;
                
                // Update enabled modules list for display
                const enabledModules = updatedVehicles[vehicleIndex].modules
                  .filter((m) => m.enabled || m.equipped)
                  .map((m) => m.name === "pilot_custom_module" ? m.customName : m.name);
                updatedVehicles[vehicleIndex].enabledModules = enabledModules;
                
                return {
                  ...spell,
                  vehicles: updatedVehicles,
                };
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));
  };

  const handlePilotVehicleChange = (spellClass, spellIndex, vehicleIndex, field, value) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, spellIdx) => {
              if (spellIdx === spellIndex && spell.spellType === "pilot-vehicle") {
                const updatedVehicles = [...spell.vehicles];
                
                if (field === "enabled") {
                  // Only one vehicle can be enabled at a time
                  updatedVehicles.forEach((vehicle, idx) => {
                    vehicle.enabled = idx === vehicleIndex ? value : false;
                  });
                }
                
                return {
                  ...spell,
                  vehicles: updatedVehicles,
                };
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));
  };

  const handleSaveEditedSpell = (spellIndex, editedSpell) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === editingSpellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, index) => {
              if (index === spellIndex) {
                return editedSpell;
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));

    closeModals();
  };

  const handleDeleteSpell = (spellIndex) => {
    /*console.log(
      "spellIndex",
      spellIndex,
      "editingSpellClass",
      editingSpellClass
    );*/
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === editingSpellClass) {
          return {
            ...cls,
            spells: cls.spells.filter((_, index) => index !== spellIndex),
          };
        }
        return cls;
      }),
    }));
    closeModals();
  };

  const closeModals = () => {
    setOpenSpellDefaultModal(false);
    setOpenSpellArcanistModal(false);
    setOpenAlchemyRankModal(false);
    setOpenAlchemyTargetModal(false);
    setOpenAlchemyEffectsModal(false);
    setOpenInfusionModal(false);
    setOpenGambleModal(false);
    setSpellBeingEdited(null);
    setOpenMagitechRankModal(false);
    setOpenChantModal(false);
    setOpenChantKeyModal(false);
    setOpenChantToneModal(false);
    setOpenSymbolModal(false);
    setOpenSymbolSymbolsModal(false);
    setOpenDancerModal(false);
    setOpenDancerDancesModal(false);
    setOpenGiftModal(false);
    setOpenGiftGiftsModal(false);
    setOpenMutantModal(false);
    setOpenMutantTherioformsModal(false);
    setOpenPilotModal(false);
    setOpenPilotVehiclesModal(false);
    setOpenMagiseedModal(false);
    setOpenMagiseedMagiseedsModal(false);
    setOpenGourmetModal(false);
    setOpenGourmetCookingModal(false);
    setOpenInvokerModal(false);
    setOpenInvokerInvocationsModal(false);
    setOpenDeckModal(false);
    setEditingSpellClass(null);
  };

  return (
    <>
      {isEditMode ? (
        <>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container>
              <Grid item xs={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Spells")}
                  showIconButton={false}
                />
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    options={player.classes
                      .filter(
                        (cls) =>
                          cls.benefits.spellClasses &&
                          cls.benefits.spellClasses.length > 0
                      )
                      .map((cls) => t(cls.name))}
                    value={
                      selectedClass
                        ? t(
                            player.classes.find(
                              (cls) => cls.name === selectedClass
                            )?.name
                          )
                        : null
                    }
                    onChange={handleClassChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Class")}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    options={filteredSpells}
                    value={selectedSpell}
                    onChange={handleSpellChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Select Spell")}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    disabled={!selectedClass}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Button
                    variant="contained"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedSpell}
                    onClick={() => addNewSpell(selectedSpell)}
                  >
                    {t("Add Blank Spell")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Button
                    variant="outlined"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedClass}
                    onClick={() => setOpenCompendiumModal(true)}
                  >
                    {t("Add from Compendium")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
        </>
      ) : null}
      {player.classes
        .filter((cls) => cls.spells && cls.spells.length > 0)
        .filter(
          (cls) =>
            cls.benefits.spellClasses && cls.benefits.spellClasses.length > 0
        )
        .map((cls) => {
          const spellTypeHeaders = {
            default: false,
            arcanist: false,
            arcanistRework: false,
            tinkererAlchemy: false,
            tinkererInfusion: false,
            tinkererMagitech: false,
            gamble: false,
            magichant: false,
            symbol: false,
            dance: false,
            gift: false,
            therioform: false,
            pilot: false,
            magiseed: false,
            cooking: false,
            invocation: false,
            deck: false,
          };

          return (
            <React.Fragment key={cls.name}>
              <Paper
                elevation={3}
                sx={{
                  p: "15px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                }}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <CustomHeader
                      type="top"
                      headerText={t("Spells") + " - " + t(cls.name)}
                      showIconButton={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {cls.spells
                      .sort((a, b) => a.spellType.localeCompare(b.spellType))
                      .map((spell, index) => (
                        <React.Fragment key={index}>
                          <div
                            style={{
                              marginTop:
                                index === 0 ||
                                spell.spellType === "default" ||
                                spell.spellType === "gamble"
                                  ? 0
                                  : 50,
                            }}
                          >
                            {spell.spellType === "default" &&
                              !spellTypeHeaders.default && (
                                <>
                                  <CustomHeader2
                                    headerText={t("Default Spells")}
                                  />
                                  {(spellTypeHeaders.default = true)}
                                </>
                              )}
                            {spell.spellType === "arcanist" &&
                              !spellTypeHeaders.arcanist && (
                                <>
                                  <CustomHeader2 headerText={t("Arcana")} />
                                  {(spellTypeHeaders.arcanist = true)}
                                </>
                              )}
                            {spell.spellType === "arcanist-rework" &&
                              !spellTypeHeaders.arcanistRework && (
                                <>
                                  <CustomHeader2
                                    headerText={t("Arcana - Rework")}
                                  />
                                  {(spellTypeHeaders.arcanistRework = true)}
                                </>
                              )}
                            {spell.spellType === "tinkerer-alchemy" &&
                              !spellTypeHeaders.tinkererAlchemy && (
                                <>
                                  <CustomHeader2 headerText={t("Alchemy")} />
                                  {(spellTypeHeaders.tinkererAlchemy = true)}
                                </>
                              )}
                            {spell.spellType === "tinkerer-infusion" &&
                              !spellTypeHeaders.tinkererInfusion && (
                                <>
                                  <CustomHeader2 headerText={t("Infusions")} />
                                  {(spellTypeHeaders.tinkererInfusion = true)}
                                </>
                              )}
                            {spell.spellType === "tinkerer-magitech" &&
                              !spellTypeHeaders.tinkererMagitech && (
                                <>
                                  <CustomHeader2 headerText={t("Magitech")} />
                                  {(spellTypeHeaders.tinkererMagitech = true)}
                                </>
                              )}
                            {spell.spellType === "gamble" &&
                              !spellTypeHeaders.gamble && (
                                <>
                                  <CustomHeader2 headerText={t("Gamble")} />
                                  {(spellTypeHeaders.gamble = true)}
                                  <GambleExplain />
                                </>
                              )}
                            {spell.spellType === "magichant" &&
                              !spellTypeHeaders.magichant && (
                                <>
                                  <CustomHeader2 headerText={t("Magichant")} />
                                  {(spellTypeHeaders.magichant = true)}
                                </>
                              )}
                            {spell.spellType === "symbol" &&
                              !spellTypeHeaders.symbol && (
                                <>
                                  <CustomHeader2
                                    headerText={t("symbol_symbol")}
                                  />
                                  {(spellTypeHeaders.symbol = true)}
                                </>
                              )}
                            {spell.spellType === "dance" &&
                              !spellTypeHeaders.dance && (
                                <>
                                  <CustomHeader2
                                    headerText={t("dance_dance")}
                                  />
                                  {(spellTypeHeaders.dance = true)}
                                </>
                              )}
                            {spell.spellType === "gift" &&
                              !spellTypeHeaders.gift && (
                                <>
                                  <CustomHeader2
                                    headerText={t("esper_gift")}
                                  />
                                  {(spellTypeHeaders.gift = true)}
                                </>
                              )}
                            {spell.spellType === "therioform" &&
                              !spellTypeHeaders.therioform && (
                                <>
                                  <CustomHeader2
                                    headerText={t("mutant_therioforms")}
                                  />
                                  {(spellTypeHeaders.therioform = true)}
                                </>
                              )}
                            {spell.spellType === "pilot-vehicle" &&
                              !spellTypeHeaders.pilot && (
                                <>
                                  <CustomHeader2
                                    headerText={t("pilot_vehicles")}
                                  />
                                  {(spellTypeHeaders.pilot = true)}
                                </>
                              )}
                            {spell.spellType === "magiseed" &&
                              !spellTypeHeaders.magiseed && (
                                <>
                                  <CustomHeader2
                                    headerText={t("magiseed_garden")}
                                  />
                                  {(spellTypeHeaders.magiseed = true)}
                                </>
                              )}
                            {spell.spellType === "cooking" &&
                              !spellTypeHeaders.cooking && (
                                <>
                                  <CustomHeader2
                                    headerText={t("gourmet_cookbook")}
                                  />
                                  {(spellTypeHeaders.cooking = true)}
                                </>
                              )}
                            {spell.spellType === "invocation" &&
                              !spellTypeHeaders.invocation && (
                                <>
                                  <CustomHeader2
                                    headerText={t("invoker_invocation")}
                                  />
                                  {(spellTypeHeaders.invocation = true)}
                                </>
                              )}
                            {spell.spellType === "deck" &&
                              !spellTypeHeaders.deck && (
                                <>
                                  <CustomHeader2
                                    headerText={t("ace_deck_of_cards")}
                                  />
                                  {(spellTypeHeaders.deck = true)}
                                </>
                              )}
                          </div>
                          {spell.spellType === "default" && (
                            <SpellDefault
                              spellName={spell.name}
                              mp={spell.mp}
                              maxTargets={spell.maxTargets}
                              targetDesc={spell.targetDesc}
                              duration={spell.duration}
                              description={spell.description}
                              onEdit={() =>
                                handleEditDefaultSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                              isOffensive={spell.isOffensive}
                              attr1={spell.attr1}
                              attr2={spell.attr2}
                              isMagisphere={spell.isMagisphere || false}
                              showInPlayerSheet={
                                spell.showInPlayerSheet ||
                                spell.showInPlayerSheet === undefined
                              }
                              index={index}
                              key={index}
                            />
                          )}
                          {spell.spellType === "arcanist" && (
                            <SpellArcanist
                              arcana={spell}
                              rework={false}
                              key={index}
                              onEdit={() =>
                                handleEditArcanistSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "arcanist-rework" && (
                            <SpellArcanist
                              arcana={spell}
                              rework={true}
                              key={index}
                              onEdit={() =>
                                handleEditArcanistSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "tinkerer-alchemy" && (
                            <SpellTinkererAlchemy
                              alchemy={spell}
                              key={index}
                              onEditRank={() => {
                                handleEditAlchemyRank(spell, cls.name, index);
                              }}
                              onEditTargets={() => {
                                handleEditAlchemyTarget(spell, cls.name, index);
                              }}
                              onEditEffects={() => {
                                handleEditAlchemyEffects(
                                  spell,
                                  cls.name,
                                  index
                                );
                              }}
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "tinkerer-infusion" && (
                            <SpellTinkererInfusion
                              infusion={spell}
                              key={index}
                              onEdit={() =>
                                handleEditInfusionSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "tinkerer-magitech" && (
                            <SpellTinkererMagitech
                              magitech={spell}
                              key={index}
                              onEdit={() =>
                                handleEditMagitechRank(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "gamble" && (
                            <SpellEntropistGamble
                              gamble={spell}
                              key={index}
                              onEdit={() =>
                                handleEditGambleSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "magichant" && (
                            <SpellChanter
                              magichant={spell}
                              key={index}
                              onEdit={() =>
                                handleEditChantSpell(spell, cls.name, index)
                              }
                              onEditKeys={() =>
                                handleEditChantKey(spell, cls.name, index)
                              }
                              onEditTones={() =>
                                handleEditChantTone(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "symbol" && (
                            <SpellSymbolist
                              symbol={spell}
                              key={index}
                              onEdit={() =>
                                handleEditSymbol(spell, cls.name, index)
                              }
                              onEditSymbols={() =>
                                handleEditSymbolSymbols(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "dance" && (
                            <SpellDancer
                              dance={spell}
                              key={index}
                              onEdit={() =>
                                handleEditDanceSpell(spell, cls.name, index)
                              }
                              onEditDances={() =>
                                handleEditDancerDances(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "gift" && (
                            <SpellGift
                              gift={spell}
                              key={index}
                              onEdit={() =>
                                handleEditGiftSpell(spell, cls.name, index)
                              }
                              onEditGifts={() =>
                                handleEditGiftGifts(spell, cls.name, index)
                              }
                              onClockChange={(newValue) =>
                                handleGiftClockChange(cls.name, index, newValue)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "therioform" && (
                            <SpellMutant
                              mutant={spell}
                              key={index}
                              onEdit={() =>
                                handleEditMutantSpell(spell, cls.name, index)
                              }
                              onEditTherioforms={() =>
                                handleEditMutantTherioforms(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "pilot-vehicle" && (
                            <SpellPilot
                              pilot={spell}
                              key={index}
                              onEdit={() =>
                                handleEditPilotSpell(spell, cls.name, index)
                              }
                              onEditVehicles={() =>
                                handleEditPilotVehicles(spell, cls.name, index)
                              }
                              onModuleChange={(vehicleIndex, moduleIndex, field, value) =>
                                handlePilotModuleChange(cls.name, index, vehicleIndex, moduleIndex, field, value)
                              }
                              onVehicleChange={(vehicleIndex, field, value) =>
                                handlePilotVehicleChange(cls.name, index, vehicleIndex, field, value)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "magiseed" && (
                            <SpellMagiseed
                              magiseed={spell}
                              key={index}
                              onEdit={() =>
                                handleEditMagiseedSpell(spell, cls.name, index)
                              }
                              onEditMagiseeds={() =>
                                handleEditMagiseedMagiseeds(spell, cls.name, index)
                              }
                              onMagiseedChange={(newMagiseed) =>
                                handleMagiseedChange(cls.name, index, newMagiseed)
                              }
                              onGrowthClockChange={(newValue) =>
                                handleGrowthClockChange(cls.name, index, newValue)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "cooking" && (
                            <SpellGourmet
                              spell={spell}
                              key={`${cls.name}-cooking-${index}-${spell.spellName}-${JSON.stringify(spell.cookbookEffects)}`}
                              onEdit={() =>
                                handleEditGourmetSpell(spell, cls.name, index)
                              }
                              onEditCooking={() =>
                                handleEditGourmetCooking(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "invocation" && (
                            <SpellInvoker
                              invoker={spell}
                              key={`${cls.name}-invocation-${index}-${spell.spellName}-${JSON.stringify(spell.invocations)}-${JSON.stringify(spell.activeWellsprings)}`}
                              onEdit={() =>
                                handleEditInvokerSpell(spell, cls.name, index)
                              }
                              onEditInvocations={() =>
                                handleEditInvokerInvocations(spell, cls.name, index)
                              }
                              onWellspringToggle={(wellspringName) =>
                                handleWellspringToggle(cls.name, index, wellspringName)
                              }
                              player={player}
                              index={index}
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "deck" && (
                            <SpellDeck
                              deck={spell}
                              key={`${cls.name}-deck-${index}-${spell.spellName}`}
                              onEdit={() =>
                                handleEditDeckSpell(spell, cls.name, index)
                              }
                              onDeckUpdate={(updatedDeck) =>
                                handleDeckUpdate(cls.name, index, updatedDeck)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                        </React.Fragment>
                      ))}
                  </Grid>
                </Grid>
              </Paper>
              <Divider sx={{ my: 2 }} />
            </React.Fragment>
          );
        })}
      <SpellDefaultModal
        isEditMode={isEditMode}
        open={openSpellDefaultModal}
        onClose={() => {
          setOpenSpellDefaultModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellArcanistModal
        open={openSpellArcanistModal}
        onClose={() => {
          setOpenSpellArcanistModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        isRework={spellBeingEdited?.spellType === "arcanist-rework"}
      />
      <SpellTinkererAlchemyRankModal
        open={openAlchemyRankModal}
        onClose={() => {
          setOpenAlchemyRankModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererAlchemyTargetModal
        open={openAlchemyTargetModal}
        onClose={() => {
          setOpenAlchemyTargetModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererAlchemyEffectsModal
        open={openAlchemyEffectsModal}
        onClose={() => {
          setOpenAlchemyEffectsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererInfusionModal
        open={openInfusionModal}
        onClose={() => {
          setOpenInfusionModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        infusion={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererMagitechRankModal
        open={openMagitechRankModal}
        onClose={() => {
          setOpenMagitechRankModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        magitech={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellEntropistGambleModal
        open={openGambleModal}
        onClose={() => {
          setOpenGambleModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        gamble={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellChanterModal
        open={openChantModal}
        onClose={() => {
          setOpenChantModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        magichant={{ ...spellBeingEdited, index: editingSpellIndex }}
      />

      <SpellChanterKeysModal
        open={openChantKeyModal}
        onClose={() => {
          setOpenChantKeyModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        magichant={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellChanterTonesModal
        open={openChantToneModal}
        onClose={() => {
          setOpenChantToneModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        magichant={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellSymbolistModal
        open={openSymbolModal}
        onClose={() => {
          setOpenSymbolModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        symbol={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellSymbolistSymbolsModal
        open={openSymbolSymbolsModal}
        onClose={() => {
          setOpenSymbolSymbolsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        symbol={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellDancerModal
        open={openDancerModal}
        onClose={() => {
          setOpenDancerModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        dance={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellDancerDancesModal
        open={openDancerDancesModal}
        onClose={() => {
          setOpenDancerDancesModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        dance={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellGiftModal
        open={openGiftModal}
        onClose={() => {
          setOpenGiftModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        gift={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellGiftGiftsModal
        open={openGiftGiftsModal}
        onClose={() => {
          setOpenGiftGiftsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        gift={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellMutantModal
        open={openMutantModal}
        onClose={() => {
          setOpenMutantModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        mutant={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellMutantTherioformsModal
        open={openMutantTherioformsModal}
        onClose={() => {
          setOpenMutantTherioformsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        mutant={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellPilotModal
        open={openPilotModal}
        onClose={() => {
          setOpenPilotModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        pilot={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellPilotVehiclesModal
        open={openPilotVehiclesModal}
        onClose={() => {
          setOpenPilotVehiclesModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        pilot={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellMagiseedModal
        open={openMagiseedModal}
        onClose={() => {
          setOpenMagiseedModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        magiseed={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellMagiseedMagiseedsModal
        open={openMagiseedMagiseedsModal}
        onClose={() => {
          setOpenMagiseedMagiseedsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        magiseed={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellGourmetModal
        open={openGourmetModal}
        onClose={() => {
          setOpenGourmetModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        player={player}
        onPlayerUpdate={setPlayer}
      />
      <SpellGourmetCookingModal
        open={openGourmetCookingModal}
        onClose={() => {
          setOpenGourmetCookingModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={(cookbookEffects, inventory, spellData) => {
          const updatedSpell = { 
            ...spellBeingEdited, 
            cookbookEffects,
            ingredientInventory: inventory || [],
            ...spellData
          };
          handleSaveEditedSpell(editingSpellIndex, updatedSpell);
        }}
        cookbookEffects={spellBeingEdited?.cookbookEffects || []}
        ingredientInventory={spellBeingEdited?.ingredientInventory || []}
        player={player}
        onPlayerUpdate={setPlayer}
        spell={spellBeingEdited}
      />
      <SpellInvokerModal
        open={openInvokerModal}
        onClose={() => {
          setOpenInvokerModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellInvokerInvocationsModal
        open={openInvokerInvocationsModal}
        onClose={() => {
          setOpenInvokerInvocationsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        invoker={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellDeckModal
        open={openDeckModal}
        onClose={() => {
          setOpenDeckModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        deck={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellCompendiumModal
        open={openCompendiumModal}
        onClose={() => setOpenCompendiumModal(false)}
        typeName={selectedClass}
        onSave={(spell) => addSpellFromCompendium(spell)}
      />
    </>
  );
}
