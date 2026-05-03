import React, { useState } from "react";
import { useSpellModals } from "../common/hooks/useSpellModals";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import SearchIcon from "@mui/icons-material/Search";
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
import SpellSymbolist from "./SpellSymbolist";
import SpellDancer from "./SpellDancer";
import SpellGift from "./SpellGift";
import SpellMutant from "./SpellMutant";
import SpellPilot from "./SpellPilot";
import SpellMagiseed from "./SpellMagiseed";
import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GeneralSection from "./sections/GeneralSection";
import MagiseedGeneralSection from "./sections/MagiseedGeneralSection";
import MagiseedContentSection from "./sections/MagiseedContentSection";
import GiftContentSection from "./sections/GiftContentSection";
import DancerContentSection from "./sections/DancerContentSection";
import SymbolistContentSection from "./sections/SymbolistContentSection";
import MagichantKeysContentSection from "./sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "./sections/MagichantTonesContentSection";
import MutantContentSection from "./sections/MutantContentSection";
import PilotGeneralSection from "./sections/PilotGeneralSection";
import PilotContentSection from "./sections/PilotContentSection";
import InvokerGeneralSection from "./sections/InvokerGeneralSection";
import InvokerContentSection from "./sections/InvokerContentSection";
import GourmetGeneralSection from "./sections/GourmetGeneralSection";
import GourmetContentSection from "./sections/GourmetContentSection";
import GourmetInventoryTab from "./sections/GourmetInventoryTab";
import GourmetCookingTab from "./sections/GourmetCookingTab";
import SpellGourmet from "./SpellGourmet";
import SpellInvoker from "./SpellInvoker";
import SpellDeck from "./SpellDeck";
import SpellDeckModal from "./SpellDeckModal";
import GambleExplain from "./GambleExplain";
import { VEHICLE_ACTIONS, vehicleReducer } from "./vehicleReducer";
import { deriveVehicleSlots } from "../equipment/slots/equipmentSlots";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import { getActiveMnemospheres } from "../classes/mnemosphereClassUtils";
import { getMnemosphereClassDefinition } from "../../../libs/mnemospheres";
import useSphereBank from "../equipment/technospheres/useSphereBank";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [defaultCompendiumClass, setDefaultCompendiumClass] = useState(null);
  const [arcanaCompendiumClass, setArcanaCompendiumClass] = useState(null);
  const [arcanaReworkCompendiumClass, setArcanaReworkCompendiumClass] =
    useState(null);
  const [systemCompendiumTarget, setSystemCompendiumTarget] = useState(null); // { className, spellType, label }
  const [mnemoCompendiumTarget, setMnemoCompendiumTarget] = useState(null); // { mnemoId, spellType, label, className }

  const {
    isOpen,
    openModal,
    closeModal,
    spellBeingEdited,
    editingSpellClass,
    editingSpellIndex,
  } = useSpellModals();

  const { addMnemoSpell, updateMnemoSpell, deleteMnemoSpell } = useSphereBank(
    player,
    setPlayer,
  );

  const activeMnemospheres = getActiveMnemospheres(player);

  const [selectedMnemoTarget, setSelectedMnemoTarget] = useState(null);
  const [selectedMnemoSpellType, setSelectedMnemoSpellType] = useState(null);

  const handleMnemoTargetChange = (mnemoId, newValue) => {
    setSelectedMnemoTarget(mnemoId);
    setSelectedMnemoSpellType(newValue);
  };

  const addNewMnemoSpell = (mnemoId, spellType) => {
    if (!mnemoId || !spellType) return;
    const newSpell = buildBlankSpell(spellType);
    if (!newSpell) return;
    addMnemoSpell(mnemoId, newSpell);
    setSelectedMnemoTarget(null);
    setSelectedMnemoSpellType(null);
  };

  const addMnemoSpellFromCompendium = (mnemoId, spell) => {
    if (!mnemoId) return;
    if (spell.spellType === "default") {
      addMnemoSpell(mnemoId, {
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
        _packItemId: spell._packItemId,
      });
    } else if (spell.spellType === "gamble") {
      addMnemoSpell(mnemoId, {
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
        _packItemId: spell._packItemId,
      });
    } else {
      const clonedSpell = JSON.parse(JSON.stringify(spell));
      addMnemoSpell(mnemoId, {
        ...clonedSpell,
        _packItemId: spell._packItemId,
        showInPlayerSheet:
          clonedSpell.showInPlayerSheet === undefined
            ? true
            : clonedSpell.showInPlayerSheet,
      });
    }
    setSelectedMnemoTarget(null);
    setSelectedMnemoSpellType(null);
  };

  const handleClassChange = (event, newValue) => {
    setSelectedClass(
      newValue
        ? player.classes.find((cls) => t(cls.name) === newValue)?.name
        : null,
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

  const buildBlankSpell = (spellType) => {
    if (spellType === "default")
      return {
        spellType,
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
      return {
        spellType,
        spellName: "Cookbook",
        cookbookEffects: [],
        showInPlayerSheet: true,
      };
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
        spellType,
        spellName: "Ace of Cards Deck",
        suitConfiguration: {
          Air: "air",
          Earth: "earth",
          Fire: "fire",
          Ice: "ice",
        },
        cardsInDeck: 30,
        hand: [],
        discardPile: [],
        showInPlayerSheet: true,
      };
    return null;
  };

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
              (sp) => sp.spellType === "tinkerer-alchemy",
            );

            if (hasTinkererAlchemy) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-alchemy spell",
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
              (sp) => sp.spellType === "tinkerer-infusion",
            );

            if (hasTinkererInfusion) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-infusion spell",
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
              (sp) => sp.spellType === "tinkerer-magitech",
            );

            if (hasTinkererMagitech) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-magitech spell",
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
              (sp) => sp.spellType === "magichant",
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
              (sp) => sp.spellType === "symbol",
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
            const hasTherioform = cls.spells.some(
              (sp) => sp.spellType === "therioform",
            );
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
            const hasPilot = cls.spells.some(
              (sp) => sp.spellType === "pilot-vehicle",
            );
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
            const hasMagiseed = cls.spells.some(
              (sp) => sp.spellType === "magiseed",
            );
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
            const hasCooking = cls.spells.some(
              (sp) => sp.spellType === "cooking",
            );
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
                    spellName: "Cookbook",
                    cookbookEffects: [],
                    showInPlayerSheet: true,
                  },
                ],
              };
            }
          } else if (spell === "invocation") {
            const hasInvocation = cls.spells.some(
              (sp) => sp.spellType === "invocation",
            );
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
                      Air: "air",
                      Earth: "earth",
                      Fire: "fire",
                      Ice: "ice",
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
                spell.toUpperCase() + " spell not implemented yet",
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

  const addDefaultSpellFromCompendium = (spell, className) => {
    if (!className) return;
    if (spell?.spellType !== "default") {
      if (window.electron)
        window.electron.alert("Please select a Default Spell.");
      else alert("Please select a Default Spell.");
      return false;
    }
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name !== className) return cls;
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
              _packItemId: spell._packItemId,
            },
          ],
        };
      }),
    }));
    return true;
  };

  const addArcanaFromCompendium = (spell, className) => {
    if (!className) return;
    if (spell?.spellType !== "arcanist") {
      if (window.electron)
        window.electron.alert("Please select an Arcana spell.");
      else alert("Please select an Arcana spell.");
      return false;
    }
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name !== className) return cls;
        return {
          ...cls,
          spells: [
            ...cls.spells,
            {
              spellType: "arcanist",
              name: t(spell.name),
              domain: t(spell.domain || ""),
              description: t(spell.description || ""),
              domainDesc: t(spell.domainDesc || ""),
              merge: t(spell.merge || ""),
              mergeDesc: t(spell.mergeDesc || ""),
              dismiss: t(spell.dismiss || ""),
              dismissDesc: t(spell.dismissDesc || ""),
              showInPlayerSheet: true,
              _packItemId: spell._packItemId,
            },
          ],
        };
      }),
    }));
    return true;
  };

  const addArcanaReworkFromCompendium = (spell, className) => {
    if (!className) return false;
    if (spell?.spellType !== "arcanist-rework") {
      if (window.electron)
        window.electron.alert("Please select an Arcana - Rework spell.");
      else alert("Please select an Arcana - Rework spell.");
      return false;
    }
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name !== className) return cls;
        return {
          ...cls,
          spells: [
            ...cls.spells,
            {
              spellType: "arcanist-rework",
              name: t(spell.name),
              domain: t(spell.domain || ""),
              description: t(spell.description || ""),
              domainDesc: t(spell.domainDesc || ""),
              merge: t(spell.merge || ""),
              mergeDesc: t(spell.mergeDesc || ""),
              pulse: t(spell.pulse || ""),
              pulseDesc: t(spell.pulseDesc || ""),
              dismiss: t(spell.dismiss || ""),
              dismissDesc: t(spell.dismissDesc || ""),
              showInPlayerSheet: true,
              _packItemId: spell._packItemId,
            },
          ],
        };
      }),
    }));
    return true;
  };

  const addSystemSpellFromCompendium = (spell, className, spellType, label) => {
    if (!className) return false;
    if (spell?.spellType !== spellType) {
      if (window.electron)
        window.electron.alert(`Please select a ${label} spell.`);
      else alert(`Please select a ${label} spell.`);
      return false;
    }
    const clonedSpell = JSON.parse(JSON.stringify(spell));
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name !== className) return cls;
        return {
          ...cls,
          spells: [
            ...cls.spells,
            {
              ...clonedSpell,
              _packItemId: spell._packItemId,
              showInPlayerSheet:
                clonedSpell.showInPlayerSheet === undefined
                  ? true
                  : clonedSpell.showInPlayerSheet,
            },
          ],
        };
      }),
    }));
    return true;
  };

  const renderCompendiumHeader = (headerText, onClick) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Antonio",
        fontWeight: "normal",
        fontSize: "1em",
        pl: "17px",
        pt: "5px",
        pb: "5px",
        color: theme.palette.mode === "dark" ? "white" : "black",
        textAlign: "left",
        mb: "10px",
        textTransform: "uppercase",
        backgroundColor: theme.palette.ternary.main,
      }}
    >
      <Typography variant="h2" sx={{ fontSize: "1.3em" }}>
        {headerText}
      </Typography>
      <Tooltip title={t("Add from Compendium")}>
        <IconButton size="small" onClick={onClick} sx={{ mr: 1 }}>
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const handleEditDefaultSpell = (spell, spellClass, spellIndex) =>
    openModal("spellDefault", spell, spellClass, spellIndex);
  const handleEditArcanistSpell = (spell, spellClass, spellIndex) =>
    openModal("spellArcanist", spell, spellClass, spellIndex);
  const handleEditAlchemyRank = (spell, spellClass, spellIndex) =>
    openModal("alchemyRank", spell, spellClass, spellIndex);
  const handleEditAlchemyTarget = (spell, spellClass, spellIndex) =>
    openModal("alchemyTarget", spell, spellClass, spellIndex);
  const handleEditAlchemyEffects = (spell, spellClass, spellIndex) =>
    openModal("alchemyEffects", spell, spellClass, spellIndex);
  const handleEditInfusionSpell = (spell, spellClass, spellIndex) =>
    openModal("infusion", spell, spellClass, spellIndex);
  const handleEditMagitechRank = (spell, spellClass, spellIndex) =>
    openModal("magitechRank", spell, spellClass, spellIndex);
  const handleEditGambleSpell = (spell, spellClass, spellIndex) =>
    openModal("gamble", spell, spellClass, spellIndex);
  const handleEditChantSpell = (spell, spellClass, spellIndex) =>
    openModal("chant", spell, spellClass, spellIndex);
  const handleEditChantKey = (spell, spellClass, spellIndex) =>
    openModal("chantKey", spell, spellClass, spellIndex);
  const handleEditChantTone = (spell, spellClass, spellIndex) =>
    openModal("chantTone", spell, spellClass, spellIndex);
  const handleEditSymbol = (spell, spellClass, spellIndex) =>
    openModal("symbolist", spell, spellClass, spellIndex);
  const handleEditDancer = (spell, spellClass, spellIndex) =>
    openModal("dancer", spell, spellClass, spellIndex);
  const handleEditGift = (spell, spellClass, spellIndex) =>
    openModal("gift", spell, spellClass, spellIndex);
  const handleEditMutant = (spell, spellClass, spellIndex) =>
    openModal("mutant", spell, spellClass, spellIndex);
  const handleEditPilot = (spell, spellClass, spellIndex) =>
    openModal("pilot", spell, spellClass, spellIndex);
  const handleEditMagiseed = (spell, spellClass, spellIndex) =>
    openModal("magiseed", spell, spellClass, spellIndex);
  const handleEditGourmet = (spell, spellClass, spellIndex) =>
    openModal("gourmet", spell, spellClass, spellIndex);
  const handleEditInvoker = (spell, spellClass, spellIndex) =>
    openModal("invoker", spell, spellClass, spellIndex);
  const handleEditDeckSpell = (spell, spellClass, spellIndex) =>
    openModal("deck", spell, spellClass, spellIndex);

  const handleDeckUpdate = (spellClass, spellIndex, updatedDeck) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, idx) =>
              idx === spellIndex ? { ...spell, ...updatedDeck } : spell,
            ),
          };
        }
        return cls;
      }),
    }));
  };

  const handleWellspringToggle = (className, spellIndex, wellspringName) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === className) {
          return {
            ...cls,
            spells: cls.spells.map((spell, idx) => {
              if (idx === spellIndex && spell.spellType === "invocation") {
                const currentWellsprings = spell.activeWellsprings || [];
                const hasInnerWellspring =
                  spell.innerWellspring && spell.chosenWellspring;
                const isInnerWellspring =
                  hasInnerWellspring &&
                  spell.chosenWellspring === wellspringName;

                // Don't allow toggling the inner wellspring
                if (isInnerWellspring) {
                  return spell;
                }

                let newWellsprings;

                if (currentWellsprings.includes(wellspringName)) {
                  // Remove wellspring
                  newWellsprings = currentWellsprings.filter(
                    (w) => w !== wellspringName,
                  );
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
            }),
          };
        }
        return cls;
      }),
    }));
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

  const handlePilotModuleChange = (
    spellClass,
    spellIndex,
    vehicleIndex,
    moduleIndex,
    field,
    value,
  ) => {
    setPlayer((prev) => {
      const updatedPlayer = {
        ...prev,
        classes: prev.classes.map((cls) => {
          if (cls.name === spellClass) {
            return {
              ...cls,
              spells: cls.spells.map((spell, spellIdx) => {
                if (
                  spellIdx === spellIndex &&
                  spell.spellType === "pilot-vehicle"
                ) {
                  // Use the vehicleReducer logic to update the state
                  const tempState = {
                    currentVehicles: spell.vehicles,
                    showInPlayerSheet: spell.showInPlayerSheet,
                  };
                  const action = {
                    type: VEHICLE_ACTIONS.UPDATE_MODULE,
                    payload: { vehicleIndex, moduleIndex, field, value, t },
                  };
                  const newState = vehicleReducer(tempState, action);

                  return {
                    ...spell,
                    vehicles: newState.currentVehicles,
                  };
                }
                return spell;
              }),
            };
          }
          return cls;
        }),
      };
      // Re-derive vehicleSlots from the updated vehicle state
      return {
        ...updatedPlayer,
        vehicleSlots: deriveVehicleSlots(updatedPlayer),
      };
    });
  };

  const handlePilotVehicleChange = (
    spellClass,
    spellIndex,
    vehicleIndex,
    field,
    value,
  ) => {
    setPlayer((prev) => {
      const updatedPlayer = {
        ...prev,
        classes: prev.classes.map((cls) => {
          if (cls.name === spellClass) {
            return {
              ...cls,
              spells: cls.spells.map((spell, spellIdx) => {
                if (
                  spellIdx === spellIndex &&
                  spell.spellType === "pilot-vehicle"
                ) {
                  const updatedVehicles = [...spell.vehicles];

                  if (field === "enabled") {
                    // Only one vehicle can be enabled at a time
                    updatedVehicles.forEach((vehicle, idx) => {
                      vehicle.enabled = idx === vehicleIndex ? value : false;
                    });
                  } else {
                    updatedVehicles[vehicleIndex] = {
                      ...updatedVehicles[vehicleIndex],
                      [field]: value,
                    };
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
      };
      return {
        ...updatedPlayer,
        vehicleSlots: deriveVehicleSlots(updatedPlayer),
      };
    });
  };

  const isMnemoEditingTarget = (id) =>
    activeMnemospheres.some((m) => m.id === id);

  const handleSaveEditedSpell = (spellIndex, editedSpell) => {
    if (isMnemoEditingTarget(editingSpellClass)) {
      updateMnemoSpell(editingSpellClass, spellIndex, editedSpell);
    } else {
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
    }
    closeModals();
  };

  const handleDeleteSpell = (spellIndex) => {
    if (isMnemoEditingTarget(editingSpellClass)) {
      deleteMnemoSpell(editingSpellClass, spellIndex);
    } else {
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
    }
    closeModals();
  };

  const closeModals = () => closeModal();

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
              <Grid size={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Spells")}
                  showIconButton={false}
                />
              </Grid>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <Autocomplete
                    options={player.classes
                      .filter(
                        (cls) =>
                          cls.benefits.spellClasses &&
                          cls.benefits.spellClasses.length > 0,
                      )
                      .map((cls) => t(cls.name))}
                    value={
                      selectedClass
                        ? t(
                            player.classes.find(
                              (cls) => cls.name === selectedClass,
                            )?.name,
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
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
                <Grid
                  size={{
                    xs: 6,
                    sm: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedSpell}
                    onClick={() => addNewSpell(selectedSpell)}
                  >
                    {t("Add Blank Spell")}
                  </Button>
                </Grid>
                <Grid
                  size={{
                    xs: 6,
                    sm: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedClass}
                    onClick={() => openModal("compendium")}
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
            cls.benefits.spellClasses && cls.benefits.spellClasses.length > 0,
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
                  <Grid size={12}>
                    <CustomHeader
                      type="top"
                      headerText={t("Spells") + " - " + t(cls.name)}
                      showIconButton={false}
                    />
                  </Grid>
                  <Grid size={12}>
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
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      fontFamily: "Antonio",
                                      fontWeight: "normal",
                                      fontSize: "1em",
                                      pl: "17px",
                                      pt: "5px",
                                      pb: "5px",
                                      color:
                                        theme.palette.mode === "dark"
                                          ? "white"
                                          : "black",
                                      textAlign: "left",
                                      mb: "10px",
                                      textTransform: "uppercase",
                                      backgroundColor:
                                        theme.palette.ternary.main,
                                    }}
                                  >
                                    <Typography
                                      variant="h2"
                                      sx={{ fontSize: "1.3em" }}
                                    >
                                      {t("Default Spells")}
                                    </Typography>
                                    <Tooltip title={t("Add from Compendium")}>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setDefaultCompendiumClass(cls.name)
                                        }
                                        sx={{ mr: 1 }}
                                      >
                                        <SearchIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  {(spellTypeHeaders.default = true)}
                                </>
                              )}
                            {spell.spellType === "arcanist" &&
                              !spellTypeHeaders.arcanist && (
                                <>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      fontFamily: "Antonio",
                                      fontWeight: "normal",
                                      fontSize: "1em",
                                      pl: "17px",
                                      pt: "5px",
                                      pb: "5px",
                                      color:
                                        theme.palette.mode === "dark"
                                          ? "white"
                                          : "black",
                                      textAlign: "left",
                                      mb: "10px",
                                      textTransform: "uppercase",
                                      backgroundColor:
                                        theme.palette.ternary.main,
                                    }}
                                  >
                                    <Typography
                                      variant="h2"
                                      sx={{ fontSize: "1.3em" }}
                                    >
                                      {t("Arcana")}
                                    </Typography>
                                    <Tooltip title={t("Add from Compendium")}>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setArcanaCompendiumClass(cls.name)
                                        }
                                        sx={{ mr: 1 }}
                                      >
                                        <SearchIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  {(spellTypeHeaders.arcanist = true)}
                                </>
                              )}
                            {spell.spellType === "arcanist-rework" &&
                              !spellTypeHeaders.arcanistRework && (
                                <>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      fontFamily: "Antonio",
                                      fontWeight: "normal",
                                      fontSize: "1em",
                                      pl: "17px",
                                      pt: "5px",
                                      pb: "5px",
                                      color:
                                        theme.palette.mode === "dark"
                                          ? "white"
                                          : "black",
                                      textAlign: "left",
                                      mb: "10px",
                                      textTransform: "uppercase",
                                      backgroundColor:
                                        theme.palette.ternary.main,
                                    }}
                                  >
                                    <Typography
                                      variant="h2"
                                      sx={{ fontSize: "1.3em" }}
                                    >
                                      {t("Arcana - Rework")}
                                    </Typography>
                                    <Tooltip title={t("Add from Compendium")}>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setArcanaReworkCompendiumClass(
                                            cls.name,
                                          )
                                        }
                                        sx={{ mr: 1 }}
                                      >
                                        <SearchIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
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
                                  {renderCompendiumHeader(t("Magichant"), () =>
                                    setSystemCompendiumTarget({
                                      className: cls.name,
                                      spellType: "magichant",
                                      label: t("Magichant"),
                                    }),
                                  )}
                                  {(spellTypeHeaders.magichant = true)}
                                </>
                              )}
                            {spell.spellType === "symbol" &&
                              !spellTypeHeaders.symbol && (
                                <>
                                  {renderCompendiumHeader(
                                    t("symbol_symbol"),
                                    () =>
                                      setSystemCompendiumTarget({
                                        className: cls.name,
                                        spellType: "symbol",
                                        label: t("symbol_symbol"),
                                      }),
                                  )}
                                  {(spellTypeHeaders.symbol = true)}
                                </>
                              )}
                            {spell.spellType === "dance" &&
                              !spellTypeHeaders.dance && (
                                <>
                                  {renderCompendiumHeader(
                                    t("dance_dance"),
                                    () =>
                                      setSystemCompendiumTarget({
                                        className: cls.name,
                                        spellType: "dance",
                                        label: t("dance_dance"),
                                      }),
                                  )}
                                  {(spellTypeHeaders.dance = true)}
                                </>
                              )}
                            {spell.spellType === "gift" &&
                              !spellTypeHeaders.gift && (
                                <>
                                  {renderCompendiumHeader(t("esper_gift"), () =>
                                    setSystemCompendiumTarget({
                                      className: cls.name,
                                      spellType: "gift",
                                      label: t("esper_gift"),
                                    }),
                                  )}
                                  {(spellTypeHeaders.gift = true)}
                                </>
                              )}
                            {spell.spellType === "therioform" &&
                              !spellTypeHeaders.therioform && (
                                <>
                                  {renderCompendiumHeader(
                                    t("mutant_therioforms"),
                                    () =>
                                      setSystemCompendiumTarget({
                                        className: cls.name,
                                        spellType: "therioform",
                                        label: t("mutant_therioforms"),
                                      }),
                                  )}
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
                                  {renderCompendiumHeader(
                                    t("magiseed_garden"),
                                    () =>
                                      setSystemCompendiumTarget({
                                        className: cls.name,
                                        spellType: "magiseed",
                                        label: t("magiseed_garden"),
                                      }),
                                  )}
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
                                  index,
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
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "dance" && (
                            <SpellDancer
                              dance={spell}
                              key={index}
                              onEdit={() =>
                                handleEditDancer(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "gift" && (
                            <SpellGift
                              gift={spell}
                              key={index}
                              onEdit={() =>
                                handleEditGift(spell, cls.name, index)
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
                                handleEditMutant(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "pilot-vehicle" && (
                            <SpellPilot
                              pilot={spell}
                              key={index}
                              onEdit={() =>
                                handleEditPilot(spell, cls.name, index)
                              }
                              onModuleChange={(
                                vehicleIndex,
                                moduleIndex,
                                field,
                                value,
                              ) =>
                                handlePilotModuleChange(
                                  cls.name,
                                  index,
                                  vehicleIndex,
                                  moduleIndex,
                                  field,
                                  value,
                                )
                              }
                              onVehicleChange={(vehicleIndex, field, value) =>
                                handlePilotVehicleChange(
                                  cls.name,
                                  index,
                                  vehicleIndex,
                                  field,
                                  value,
                                )
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "magiseed" && (
                            <SpellMagiseed
                              magiseed={spell}
                              key={index}
                              onEdit={() =>
                                handleEditMagiseed(spell, cls.name, index)
                              }
                              onMagiseedChange={(newMagiseed) =>
                                handleMagiseedChange(
                                  cls.name,
                                  index,
                                  newMagiseed,
                                )
                              }
                              onGrowthClockChange={(newValue) =>
                                handleGrowthClockChange(
                                  cls.name,
                                  index,
                                  newValue,
                                )
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "cooking" && (
                            <SpellGourmet
                              spell={spell}
                              key={`${cls.name}-cooking-${index}-${spell.spellName}-${JSON.stringify(spell.cookbookEffects)}`}
                              onEdit={() =>
                                handleEditGourmet(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "invocation" && (
                            <SpellInvoker
                              invoker={spell}
                              key={`${cls.name}-invocation-${index}-${spell.spellName}-${JSON.stringify(spell.invocations)}-${JSON.stringify(spell.activeWellsprings)}`}
                              onEdit={() =>
                                handleEditInvoker(spell, cls.name, index)
                              }
                              onWellspringToggle={(wellspringName) =>
                                handleWellspringToggle(
                                  cls.name,
                                  index,
                                  wellspringName,
                                )
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
      {isTechnospheres &&
        activeMnemospheres
          .filter((mnemo) => {
            const classDef = getMnemosphereClassDefinition(mnemo.class);
            return classDef?.benefits?.spellClasses?.length > 0;
          })
          .map((mnemo) => {
            const classDef = getMnemosphereClassDefinition(mnemo.class);
            const mnemoSpellClasses = classDef?.benefits?.spellClasses ?? [];
            const mnemoSpells = mnemo.spells ?? [];
            const mnemoSpellTypeHeaders = {
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
              <React.Fragment key={mnemo.id}>
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
                    <Grid size={12}>
                      <CustomHeader
                        type="top"
                        headerText={
                          t("Spells") +
                          " - " +
                          t(mnemo.class) +
                          " (" +
                          t("Mnemosphere") +
                          ")"
                        }
                        showIconButton={false}
                      />
                    </Grid>
                    {isEditMode && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Autocomplete
                            options={mnemoSpellClasses}
                            value={
                              selectedMnemoTarget === mnemo.id
                                ? selectedMnemoSpellType
                                : null
                            }
                            onChange={(_, val) =>
                              handleMnemoTargetChange(mnemo.id, val)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={t("Select Spell")}
                                variant="outlined"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Button
                            variant="contained"
                            sx={{ width: "100%", height: "100%" }}
                            disabled={
                              selectedMnemoTarget !== mnemo.id ||
                              !selectedMnemoSpellType
                            }
                            onClick={() =>
                              addNewMnemoSpell(mnemo.id, selectedMnemoSpellType)
                            }
                          >
                            {t("Add Blank Spell")}
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Button
                            variant="outlined"
                            sx={{ width: "100%", height: "100%" }}
                            onClick={() =>
                              setMnemoCompendiumTarget({
                                mnemoId: mnemo.id,
                                spellType:
                                  selectedMnemoTarget === mnemo.id
                                    ? selectedMnemoSpellType
                                    : mnemoSpellClasses[0],
                                label: t("Spell"),
                                className: mnemo.class,
                              })
                            }
                          >
                            {t("Add from Compendium")}
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    <Grid size={12}>
                      {mnemoSpells
                        .sort((a, b) =>
                          (a.spellType ?? "").localeCompare(b.spellType ?? ""),
                        )
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
                                !mnemoSpellTypeHeaders.default && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("Default Spells"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "default",
                                          label: t("Default Spells"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.default = true)}
                                  </>
                                )}
                              {spell.spellType === "arcanist" &&
                                !mnemoSpellTypeHeaders.arcanist && (
                                  <>
                                    {renderCompendiumHeader(t("Arcana"), () =>
                                      setMnemoCompendiumTarget({
                                        mnemoId: mnemo.id,
                                        spellType: "arcanist",
                                        label: t("Arcana"),
                                        className: mnemo.class,
                                      }),
                                    )}
                                    {(mnemoSpellTypeHeaders.arcanist = true)}
                                  </>
                                )}
                              {spell.spellType === "arcanist-rework" &&
                                !mnemoSpellTypeHeaders.arcanistRework && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("Arcana - Rework"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "arcanist-rework",
                                          label: t("Arcana - Rework"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {
                                      (mnemoSpellTypeHeaders.arcanistRework = true)
                                    }
                                  </>
                                )}
                              {spell.spellType === "tinkerer-alchemy" &&
                                !mnemoSpellTypeHeaders.tinkererAlchemy && (
                                  <>
                                    <CustomHeader2 headerText={t("Alchemy")} />
                                    {
                                      (mnemoSpellTypeHeaders.tinkererAlchemy = true)
                                    }
                                  </>
                                )}
                              {spell.spellType === "tinkerer-infusion" &&
                                !mnemoSpellTypeHeaders.tinkererInfusion && (
                                  <>
                                    <CustomHeader2
                                      headerText={t("Infusions")}
                                    />
                                    {
                                      (mnemoSpellTypeHeaders.tinkererInfusion = true)
                                    }
                                  </>
                                )}
                              {spell.spellType === "tinkerer-magitech" &&
                                !mnemoSpellTypeHeaders.tinkererMagitech && (
                                  <>
                                    <CustomHeader2 headerText={t("Magitech")} />
                                    {
                                      (mnemoSpellTypeHeaders.tinkererMagitech = true)
                                    }
                                  </>
                                )}
                              {spell.spellType === "gamble" &&
                                !mnemoSpellTypeHeaders.gamble && (
                                  <>
                                    <CustomHeader2 headerText={t("Gamble")} />
                                    {(mnemoSpellTypeHeaders.gamble = true)}
                                    <GambleExplain />
                                  </>
                                )}
                              {spell.spellType === "magichant" &&
                                !mnemoSpellTypeHeaders.magichant && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("Magichant"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "magichant",
                                          label: t("Magichant"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.magichant = true)}
                                  </>
                                )}
                              {spell.spellType === "symbol" &&
                                !mnemoSpellTypeHeaders.symbol && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("symbol_symbol"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "symbol",
                                          label: t("symbol_symbol"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.symbol = true)}
                                  </>
                                )}
                              {spell.spellType === "dance" &&
                                !mnemoSpellTypeHeaders.dance && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("dance_dance"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "dance",
                                          label: t("dance_dance"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.dance = true)}
                                  </>
                                )}
                              {spell.spellType === "gift" &&
                                !mnemoSpellTypeHeaders.gift && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("esper_gift"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "gift",
                                          label: t("esper_gift"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.gift = true)}
                                  </>
                                )}
                              {spell.spellType === "therioform" &&
                                !mnemoSpellTypeHeaders.therioform && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("mutant_therioforms"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "therioform",
                                          label: t("mutant_therioforms"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.therioform = true)}
                                  </>
                                )}
                              {spell.spellType === "pilot-vehicle" &&
                                !mnemoSpellTypeHeaders.pilot && (
                                  <>
                                    <CustomHeader2
                                      headerText={t("pilot_vehicles")}
                                    />
                                    {(mnemoSpellTypeHeaders.pilot = true)}
                                  </>
                                )}
                              {spell.spellType === "magiseed" &&
                                !mnemoSpellTypeHeaders.magiseed && (
                                  <>
                                    {renderCompendiumHeader(
                                      t("magiseed_garden"),
                                      () =>
                                        setMnemoCompendiumTarget({
                                          mnemoId: mnemo.id,
                                          spellType: "magiseed",
                                          label: t("magiseed_garden"),
                                          className: mnemo.class,
                                        }),
                                    )}
                                    {(mnemoSpellTypeHeaders.magiseed = true)}
                                  </>
                                )}
                              {spell.spellType === "cooking" &&
                                !mnemoSpellTypeHeaders.cooking && (
                                  <>
                                    <CustomHeader2
                                      headerText={t("gourmet_cookbook")}
                                    />
                                    {(mnemoSpellTypeHeaders.cooking = true)}
                                  </>
                                )}
                              {spell.spellType === "invocation" &&
                                !mnemoSpellTypeHeaders.invocation && (
                                  <>
                                    <CustomHeader2
                                      headerText={t("invoker_invocation")}
                                    />
                                    {(mnemoSpellTypeHeaders.invocation = true)}
                                  </>
                                )}
                              {spell.spellType === "deck" &&
                                !mnemoSpellTypeHeaders.deck && (
                                  <>
                                    <CustomHeader2
                                      headerText={t("ace_deck_of_cards")}
                                    />
                                    {(mnemoSpellTypeHeaders.deck = true)}
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
                                  handleEditDefaultSpell(spell, mnemo.id, index)
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
                            {(spell.spellType === "arcanist" ||
                              spell.spellType === "arcanist-rework") && (
                              <SpellArcanist
                                arcana={spell}
                                rework={spell.spellType === "arcanist-rework"}
                                key={index}
                                onEdit={() =>
                                  handleEditArcanistSpell(
                                    spell,
                                    mnemo.id,
                                    index,
                                  )
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "tinkerer-alchemy" && (
                              <SpellTinkererAlchemy
                                alchemy={spell}
                                key={index}
                                onEditRank={() =>
                                  handleEditAlchemyRank(spell, mnemo.id, index)
                                }
                                onEditTargets={() =>
                                  handleEditAlchemyTarget(
                                    spell,
                                    mnemo.id,
                                    index,
                                  )
                                }
                                onEditEffects={() =>
                                  handleEditAlchemyEffects(
                                    spell,
                                    mnemo.id,
                                    index,
                                  )
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "tinkerer-infusion" && (
                              <SpellTinkererInfusion
                                infusion={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditInfusionSpell(
                                    spell,
                                    mnemo.id,
                                    index,
                                  )
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "tinkerer-magitech" && (
                              <SpellTinkererMagitech
                                magitech={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditMagitechRank(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "gamble" && (
                              <SpellEntropistGamble
                                gamble={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditGambleSpell(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "magichant" && (
                              <SpellChanter
                                magichant={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditChantSpell(spell, mnemo.id, index)
                                }
                                onEditKeys={() =>
                                  handleEditChantKey(spell, mnemo.id, index)
                                }
                                onEditTones={() =>
                                  handleEditChantTone(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "symbol" && (
                              <SpellSymbolist
                                symbol={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditSymbol(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "dance" && (
                              <SpellDancer
                                dance={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditDancer(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "gift" && (
                              <SpellGift
                                gift={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditGift(spell, mnemo.id, index)
                                }
                                onClockChange={(newValue) => {
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    clock: newValue,
                                  });
                                }}
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "therioform" && (
                              <SpellMutant
                                mutant={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditMutant(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "pilot-vehicle" && (
                              <SpellPilot
                                pilot={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditPilot(spell, mnemo.id, index)
                                }
                                onModuleChange={(
                                  vehicleIndex,
                                  moduleIndex,
                                  field,
                                  value,
                                ) => {
                                  const tempState = {
                                    currentVehicles: spell.vehicles,
                                    showInPlayerSheet: spell.showInPlayerSheet,
                                  };
                                  const newState = vehicleReducer(tempState, {
                                    type: VEHICLE_ACTIONS.UPDATE_MODULE,
                                    payload: {
                                      vehicleIndex,
                                      moduleIndex,
                                      field,
                                      value,
                                      t,
                                    },
                                  });
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    vehicles: newState.currentVehicles,
                                  });
                                }}
                                onVehicleChange={(
                                  vehicleIndex,
                                  field,
                                  value,
                                ) => {
                                  const updatedVehicles = [...spell.vehicles];
                                  if (field === "enabled")
                                    updatedVehicles.forEach((v, i) => {
                                      v.enabled =
                                        i === vehicleIndex ? value : false;
                                    });
                                  else
                                    updatedVehicles[vehicleIndex] = {
                                      ...updatedVehicles[vehicleIndex],
                                      [field]: value,
                                    };
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    vehicles: updatedVehicles,
                                  });
                                }}
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "magiseed" && (
                              <SpellMagiseed
                                magiseed={spell}
                                key={index}
                                onEdit={() =>
                                  handleEditMagiseed(spell, mnemo.id, index)
                                }
                                onMagiseedChange={(newMagiseed) =>
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    currentMagiseed: newMagiseed,
                                  })
                                }
                                onGrowthClockChange={(newValue) =>
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    growthClock: newValue,
                                  })
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "cooking" && (
                              <SpellGourmet
                                spell={spell}
                                key={`${mnemo.id}-cooking-${index}-${spell.spellName}-${JSON.stringify(spell.cookbookEffects)}`}
                                onEdit={() =>
                                  handleEditGourmet(spell, mnemo.id, index)
                                }
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "invocation" && (
                              <SpellInvoker
                                invoker={spell}
                                key={`${mnemo.id}-invocation-${index}-${spell.spellName}-${JSON.stringify(spell.invocations)}-${JSON.stringify(spell.activeWellsprings)}`}
                                onEdit={() =>
                                  handleEditInvoker(spell, mnemo.id, index)
                                }
                                onWellspringToggle={(wellspringName) => {
                                  const currentWellsprings =
                                    spell.activeWellsprings || [];
                                  const hasInner =
                                    spell.innerWellspring &&
                                    spell.chosenWellspring;
                                  if (
                                    hasInner &&
                                    spell.chosenWellspring === wellspringName
                                  )
                                    return;
                                  let newWellsprings;
                                  if (
                                    currentWellsprings.includes(wellspringName)
                                  ) {
                                    newWellsprings = currentWellsprings.filter(
                                      (w) => w !== wellspringName,
                                    );
                                  } else if (currentWellsprings.length < 2) {
                                    newWellsprings = [
                                      ...currentWellsprings,
                                      wellspringName,
                                    ];
                                  } else {
                                    newWellsprings = [
                                      currentWellsprings[1],
                                      wellspringName,
                                    ];
                                  }
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    activeWellsprings: newWellsprings,
                                  });
                                }}
                                player={player}
                                index={index}
                                isEditMode={isEditMode}
                              />
                            )}
                            {spell.spellType === "deck" && (
                              <SpellDeck
                                deck={spell}
                                key={`${mnemo.id}-deck-${index}-${spell.spellName}`}
                                onEdit={() =>
                                  handleEditDeckSpell(spell, mnemo.id, index)
                                }
                                onDeckUpdate={(updatedDeck) =>
                                  updateMnemoSpell(mnemo.id, index, {
                                    ...spell,
                                    ...updatedDeck,
                                  })
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
        open={isOpen("spellDefault")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellArcanistModal
        open={isOpen("spellArcanist")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        isRework={spellBeingEdited?.spellType === "arcanist-rework"}
      />
      <SpellTinkererAlchemyRankModal
        open={isOpen("alchemyRank")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererAlchemyTargetModal
        open={isOpen("alchemyTarget")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererAlchemyEffectsModal
        open={isOpen("alchemyEffects")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererInfusionModal
        open={isOpen("infusion")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        infusion={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererMagitechRankModal
        open={isOpen("magitechRank")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        magitech={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellEntropistGambleModal
        open={isOpen("gamble")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        gamble={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <UnifiedSpellModal
        open={isOpen("chant")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="magichant"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        initialSectionId="general"
        sections={[
          {
            id: "keys",
            title: "magichant_edit_keys_button",
            component: MagichantKeysContentSection,
            props: {},
            order: 0,
          },
          {
            id: "tones",
            title: "magichant_edit_tones_button",
            component: MagichantTonesContentSection,
            props: {},
            order: 1,
          },
          {
            id: "general",
            title: "magichant_settings_button",
            component: GeneralSection,
            props: { customFields: [] },
            order: 2,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("chantKey")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="magichant"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        initialSectionId="keys"
        sections={[
          {
            id: "keys",
            title: "magichant_edit_keys_button",
            component: MagichantKeysContentSection,
            props: {},
            order: 0,
          },
          {
            id: "tones",
            title: "magichant_edit_tones_button",
            component: MagichantTonesContentSection,
            props: {},
            order: 1,
          },
          {
            id: "general",
            title: "magichant_settings_button",
            component: GeneralSection,
            props: { customFields: [] },
            order: 2,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("chantTone")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="magichant"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        initialSectionId="tones"
        sections={[
          {
            id: "keys",
            title: "magichant_edit_keys_button",
            component: MagichantKeysContentSection,
            props: {},
            order: 0,
          },
          {
            id: "tones",
            title: "magichant_edit_tones_button",
            component: MagichantTonesContentSection,
            props: {},
            order: 1,
          },
          {
            id: "general",
            title: "magichant_settings_button",
            component: GeneralSection,
            props: { customFields: [] },
            order: 2,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("symbolist")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="symbol"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        sections={[
          {
            id: "content",
            title: "symbol_edit_symbols_button",
            component: SymbolistContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "symbol_settings_button",
            component: GeneralSection,
            props: { customFields: [] },
            order: 1,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("dancer")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="dancer"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        sections={[
          {
            id: "content",
            title: "dance_edit_dances_button",
            component: DancerContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "dance_settings_button",
            component: GeneralSection,
            props: { customFields: [] },
            order: 1,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("gift")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="gift"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        sections={[
          {
            id: "content",
            title: "esper_gifts",
            component: GiftContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "esper_settings_modal",
            component: GeneralSection,
            props: { customFields: [] },
            order: 1,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("mutant")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="mutant"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        sections={[
          {
            id: "content",
            title: "mutant_therioforms",
            component: MutantContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "mutant_settings_button",
            component: GeneralSection,
            props: { customFields: [] },
            order: 1,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("pilot")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="pilot"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        sections={[
          {
            id: "content",
            title: "pilot_vehicles",
            component: PilotContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "pilot_settings_button",
            component: PilotGeneralSection,
            props: {},
            order: 1,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("magiseed")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="magiseed"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        sections={[
          {
            id: "content",
            title: "magiseed_edit_magiseeds_button",
            component: MagiseedContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "magiseed_settings_button",
            component: MagiseedGeneralSection,
            props: {},
            order: 1,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("gourmet")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="gourmet"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        title={spellBeingEdited?.spellName}
        sections={[
          {
            id: "cookbook",
            title: "gourmet_cookbook",
            component: GourmetContentSection,
            props: {},
            order: 0,
          },
          {
            id: "inventory",
            title: "gourmet_ingredient_inventory",
            component: GourmetInventoryTab,
            props: {},
            order: 1,
          },
          {
            id: "cooking",
            title: "gourmet_cooking",
            component: GourmetCookingTab,
            props: {},
            order: 2,
          },
          {
            id: "general",
            title: "gourmet_edit_cooking_button",
            component: GourmetGeneralSection,
            props: {},
            order: 3,
          },
        ]}
      />
      <UnifiedSpellModal
        open={isOpen("invoker")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        spellType="invoker"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        title={spellBeingEdited?.spellName}
        sections={[
          {
            id: "content",
            title: "invoker_manage_invocation_button",
            component: InvokerContentSection,
            props: {},
            order: 0,
          },
          {
            id: "general",
            title: "invoker_edit_invocation_button",
            component: InvokerGeneralSection,
            props: {},
            order: 1,
          },
        ]}
      />
      <SpellDeckModal
        open={isOpen("deck")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={(spellIndex) =>
          handleDeleteSpell(spellIndex, editingSpellClass)
        }
        deck={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellCompendiumModal
        open={isOpen("compendium")}
        onClose={closeModal}
        typeName={selectedClass}
        onSave={(spell) => addSpellFromCompendium(spell)}
      />
      <CompendiumViewerModal
        open={defaultCompendiumClass !== null}
        onClose={() => setDefaultCompendiumClass(null)}
        onAddItem={(item) => {
          if (addDefaultSpellFromCompendium(item, defaultCompendiumClass)) {
            setDefaultCompendiumClass(null);
          }
        }}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={defaultCompendiumClass || ""}
        context="player"
      />
      <CompendiumViewerModal
        open={arcanaCompendiumClass !== null}
        onClose={() => setArcanaCompendiumClass(null)}
        onAddItem={(item) => {
          if (addArcanaFromCompendium(item, arcanaCompendiumClass)) {
            setArcanaCompendiumClass(null);
          }
        }}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={arcanaCompendiumClass || ""}
        context="player"
      />
      <CompendiumViewerModal
        open={arcanaReworkCompendiumClass !== null}
        onClose={() => setArcanaReworkCompendiumClass(null)}
        onAddItem={(item) => {
          if (
            addArcanaReworkFromCompendium(item, arcanaReworkCompendiumClass)
          ) {
            setArcanaReworkCompendiumClass(null);
          }
        }}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={arcanaReworkCompendiumClass || ""}
        context="player"
      />
      <CompendiumViewerModal
        open={systemCompendiumTarget !== null}
        onClose={() => setSystemCompendiumTarget(null)}
        onAddItem={(item) => {
          if (
            addSystemSpellFromCompendium(
              item,
              systemCompendiumTarget?.className,
              systemCompendiumTarget?.spellType,
              systemCompendiumTarget?.label || t("Spell"),
            )
          ) {
            setSystemCompendiumTarget(null);
          }
        }}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={systemCompendiumTarget?.className || ""}
        context="player"
      />
      <CompendiumViewerModal
        open={mnemoCompendiumTarget !== null}
        onClose={() => setMnemoCompendiumTarget(null)}
        onAddItem={(item) => {
          const { mnemoId, spellType, label } = mnemoCompendiumTarget;
          if (item?.spellType !== spellType) {
            if (window.electron)
              window.electron.alert(`Please select a ${label} spell.`);
            else alert(`Please select a ${label} spell.`);
            return;
          }
          addMnemoSpellFromCompendium(mnemoId, item);
          setMnemoCompendiumTarget(null);
        }}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={mnemoCompendiumTarget?.className || ""}
        context="player"
      />
    </>
  );
}
