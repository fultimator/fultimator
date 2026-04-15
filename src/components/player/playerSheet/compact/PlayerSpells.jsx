import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Collapse,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVert,
  Edit,
  Add,
  Search,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import SpellDefault from "./spells/SpellDefault";
import SpellArcanist from "./spells/SpellArcanist";
import SpellEntropistGamble from "./spells/SpellEntropistGamble";
import SpellInvoker from "./spells/SpellInvoker";
import SpellGourmet from "./spells/SpellGourmet";
import SpellMagiseed from "./spells/SpellMagiseed";
import SpellGadget from "./spells/SpellGadget";
import SpellMagichant from "./spells/SpellMagichant";
import SpellSymbol from "./spells/SpellSymbol";
import SpellDance from "./spells/SpellDance";
import SpellGift from "./spells/SpellGift";
import SpellTherioform from "./spells/SpellTherioform";
import SpellVehicle from "./spells/SpellVehicle";
import SpellDeck from "./spells/SpellDeck";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import UnifiedSpellModal from "../../spells/modals/UnifiedSpellModal";
import DefaultSpellSection from "../../spells/sections/DefaultSpellSection";
import ArcanistGeneralSection from "../../spells/sections/ArcanistGeneralSection";
import GeneralSection from "../../spells/sections/GeneralSection";
import MagiseedGeneralSection from "../../spells/sections/MagiseedGeneralSection";
import MagiseedContentSection from "../../spells/sections/MagiseedContentSection";
import GiftContentSection from "../../spells/sections/GiftContentSection";
import DancerContentSection from "../../spells/sections/DancerContentSection";
import SymbolistContentSection from "../../spells/sections/SymbolistContentSection";
import MagichantKeysContentSection from "../../spells/sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "../../spells/sections/MagichantTonesContentSection";
import MutantContentSection from "../../spells/sections/MutantContentSection";
import PilotGeneralSection from "../../spells/sections/PilotGeneralSection";
import PilotContentSection from "../../spells/sections/PilotContentSection";
import InvokerGeneralSection from "../../spells/sections/InvokerGeneralSection";
import InvokerContentSection from "../../spells/sections/InvokerContentSection";
import GourmetGeneralSection from "../../spells/sections/GourmetGeneralSection";
import GourmetContentSection from "../../spells/sections/GourmetContentSection";
import GourmetInventoryTab from "../../spells/sections/GourmetInventoryTab";
import GourmetCookingTab from "../../spells/sections/GourmetCookingTab";
import GambleGeneralSection from "../../spells/sections/GambleGeneralSection";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import classList, {
  tinkererAlchemy,
  tinkererInfusion,
} from "../../../../libs/classes";
import SpellTinkererMagitechRankModal from "../../spells/SpellTinkererMagitechRankModal";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });
const SINGLE_INSTANCE_SPELL_TYPES = new Set([
  "tinkerer-alchemy",
  "tinkerer-infusion",
  "tinkerer-magitech",
  "magichant",
  "symbol",
  "dance",
  "gift",
  "therioform",
  "pilot-vehicle",
  "magiseed",
  "cooking",
  "invocation",
  "deck",
]);

function createBlankSpellForType(spellType) {
  if (spellType === "default") {
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
  }

  if (spellType === "arcanist") {
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
  }

  if (spellType === "arcanist-rework") {
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
  }

  if (spellType === "tinkerer-alchemy") {
    return {
      spellType,
      showInPlayerSheet: true,
      ...tinkererAlchemy,
    };
  }

  if (spellType === "tinkerer-infusion") {
    return {
      spellType,
      showInPlayerSheet: true,
      ...tinkererInfusion,
    };
  }

  if (spellType === "tinkerer-magitech") {
    return {
      spellType,
      showInPlayerSheet: true,
      rank: 1,
      magispheres: [],
    };
  }

  if (spellType === "gamble") {
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
  }

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
  if (spellType === "magiseed") {
    return {
      spellType,
      showInPlayerSheet: true,
      magiseeds: [],
      currentMagiseed: null,
      growthClock: 0,
      gardenDescription: "",
    };
  }
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
  if (spellType === "deck") {
    return {
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
    };
  }

  return { spellType, showInPlayerSheet: true };
}

function collectStringValues(value, bag = []) {
  if (typeof value === "string") {
    bag.push(value);
    return bag;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStringValues(entry, bag));
    return bag;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((entry) => collectStringValues(entry, bag));
  }
  return bag;
}

// function highlightMarkdownText(text, query) {
//   if (!text || !query) return text;
//   const pattern = new RegExp(`(${escapeRegExp(query)})`, "ig");
//   return String(text).replace(pattern, "<mark>$1</mark>");
// }

function getSpellModalSections(spellType) {
  const sectionMap = {
    default: [
      {
        id: "general",
        title: "settings",
        component: DefaultSpellSection,
        props: {},
      },
    ],
    magiseed: [
      {
        id: "general",
        title: "settings",
        component: MagiseedGeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: MagiseedContentSection,
        props: {},
      },
    ],
    gift: [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: GiftContentSection,
        props: {},
      },
    ],
    dance: [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: DancerContentSection,
        props: {},
      },
    ],
    symbol: [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: SymbolistContentSection,
        props: {},
      },
    ],
    therioform: [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: MutantContentSection,
        props: {},
      },
    ],
    "pilot-vehicle": [
      {
        id: "general",
        title: "settings",
        component: PilotGeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: PilotContentSection,
        props: {},
      },
    ],
    invocation: [
      {
        id: "general",
        title: "settings",
        component: InvokerGeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: InvokerContentSection,
        props: {},
      },
    ],
    cooking: [
      {
        id: "general",
        title: "settings",
        component: GourmetGeneralSection,
        props: {},
      },
      {
        id: "content",
        title: "content",
        component: GourmetContentSection,
        props: {},
      },
      {
        id: "inventory",
        title: "inventory",
        component: GourmetInventoryTab,
        props: {},
      },
      {
        id: "cooking",
        title: "cooking",
        component: GourmetCookingTab,
        props: {},
      },
    ],
    gamble: [
      {
        id: "general",
        title: "settings",
        component: GambleGeneralSection,
        props: {},
      },
    ],
    magichant: [
      {
        id: "keys",
        title: "magichant_edit_keys_button",
        component: MagichantKeysContentSection,
        props: {},
      },
      {
        id: "tones",
        title: "magichant_edit_tones_button",
        component: MagichantTonesContentSection,
        props: {},
      },
      {
        id: "general",
        title: "magichant_settings_button",
        component: GeneralSection,
        props: { customFields: [] },
      },
    ],
    deck: [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
    ],
    arcanist: [
      {
        id: "general",
        title: "settings",
        component: ArcanistGeneralSection,
        props: {},
      },
    ],
    "arcanist-rework": [
      {
        id: "general",
        title: "settings",
        component: ArcanistGeneralSection,
        props: {},
      },
    ],
  };

  // Handle tinkerer types
  if (spellType?.startsWith("tinkerer-")) {
    return [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
    ];
  }

  return (
    sectionMap[spellType] || [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
    ]
  );
}

function renderSpellContent(spell, setPlayer, searchQuery, highlightMatchFn) {
  switch (spell.spellType) {
    case "default":
      return (
        <SpellDefault
          spellName={highlightMatchFn(spell.name, searchQuery)}
          mp={spell.mp}
          maxTargets={spell.maxTargets}
          targetDesc={spell.targetDesc}
          duration={spell.duration}
          description={highlightMatchFn(spell.description, searchQuery)}
          isEditMode={false}
          isOffensive={spell.isOffensive}
          isMagisphere={spell.isMagisphere || false}
          attr1={spell.attr1}
          attr2={spell.attr2}
        />
      );
    case "gamble":
      return <SpellEntropistGamble gamble={spell} isEditMode={false} />;
    case "invocation":
      return <SpellInvoker spell={spell} setPlayer={setPlayer} open={true} />;
    case "cooking":
      return <SpellGourmet spell={spell} open={true} />;
    case "magiseed":
      return <SpellMagiseed spell={spell} setPlayer={setPlayer} open={true} />;
    case "magichant":
      return <SpellMagichant spell={spell} />;
    case "symbol":
      return <SpellSymbol spell={spell} />;
    case "dance":
      return <SpellDance spell={spell} />;
    case "gift":
      return <SpellGift spell={spell} setPlayer={setPlayer} open={true} />;
    case "therioform":
      return <SpellTherioform spell={spell} />;
    case "pilot-vehicle":
      return <SpellVehicle spell={spell} />;
    case "deck":
      return <SpellDeck spell={spell} setPlayer={setPlayer} open={true} />;
    case "arcanist":
    case "arcanist-rework":
      return (
        <SpellArcanist
          arcana={spell}
          isEditMode={false}
          rework={spell.spellType === "arcanist-rework"}
        />
      );
    default:
      if (spell.spellType?.startsWith("tinkerer-"))
        return <SpellGadget spell={spell} />;
      return null;
  }
}

export default function PlayerSpellsFull({
  player,
  setPlayer,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();

  const [editingSpell, setEditingSpell] = useState(null);
  const [_editingSpellIndex, setEditingSpellIndex] = useState(null);
  const [editingSpellClassIndex, setEditingSpellClassIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [magitechModalOpen, setMagitechModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTargetClassIndex, setImportTargetClassIndex] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [addMenuClassIndex, setAddMenuClassIndex] = useState(null);

  const handleEditSpell = (spell, spellIndex, classIndex) => {
    if (spell.spellType === "tinkerer-magitech") {
      setEditingSpell({ ...spell, index: spellIndex });
      setEditingSpellIndex(spellIndex);
      setEditingSpellClassIndex(classIndex);
      setMagitechModalOpen(true);
    } else {
      setEditingSpell({ ...spell, index: spellIndex });
      setEditingSpellIndex(spellIndex);
      setEditingSpellClassIndex(classIndex);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setMagitechModalOpen(false);
    setEditingSpell(null);
    setEditingSpellIndex(null);
    setEditingSpellClassIndex(null);
  };

  const handleSaveSpell = (spellIndex, updatedSpell) => {
    if (editingSpellClassIndex === null) return;
    const updatedClasses = [...player.classes];
    updatedClasses[editingSpellClassIndex].spells[spellIndex] = updatedSpell;
    setPlayer({ ...player, classes: updatedClasses });
    handleCloseModal();
  };

  const handleDeleteSpell = (spellIndex) => {
    if (editingSpellClassIndex === null) return;
    const updatedClasses = [...player.classes];
    updatedClasses[editingSpellClassIndex].spells.splice(spellIndex, 1);
    setPlayer({ ...player, classes: updatedClasses });
    handleCloseModal();
  };

  const getClassSpellTypes = (cls) => {
    const direct = Array.isArray(cls?.benefits?.spellClasses)
      ? cls.benefits.spellClasses
      : [];
    if (direct.length > 0) return direct;
    const base = classList.find((baseClass) => baseClass.name === cls?.name);
    return Array.isArray(base?.benefits?.spellClasses)
      ? base.benefits.spellClasses
      : [];
  };

  const canAddSpellTypeToClass = (cls, spellType) => {
    if (!spellType) return false;
    if (!SINGLE_INSTANCE_SPELL_TYPES.has(spellType)) return true;
    return !(cls.spells || []).some((spell) => spell.spellType === spellType);
  };

  const handleAddNewSpell = (classIndex, spellType) => {
    if (!spellType) return;
    const classRef = player.classes?.[classIndex];
    if (!classRef || !canAddSpellTypeToClass(classRef, spellType)) return;

    const newSpell = createBlankSpellForType(spellType);
    const updatedClasses = [...player.classes];
    updatedClasses[classIndex].spells.push(newSpell);
    setPlayer({ ...player, classes: updatedClasses });
  };

  const updateSpellInClass = (classIndex, spellIndex, updater) => {
    setPlayer((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((cls, idx) => {
        if (idx !== classIndex) return cls;
        const spells = [...(cls.spells || [])];
        const current = spells[spellIndex];
        if (!current) return cls;
        spells[spellIndex] = updater(current);
        return { ...cls, spells };
      }),
    }));
  };

  const addSubItemToSingletonSpell = (classIndex, spellType, subType) => {
    const cls = player.classes?.[classIndex];
    if (!cls) return;
    const spellIndex = (cls.spells || []).findIndex(
      (spell) => spell.spellType === spellType,
    );
    if (spellIndex < 0) return;

    const addByType = {
      magichant: (spell) => {
        if (subType === "key") {
          return {
            ...spell,
            keys: [
              ...(spell.keys || []),
              {
                name: "magichant_custom_name",
                type: "",
                status: "",
                attribute: "",
                recovery: "",
                customName: "",
              },
            ],
          };
        }
        return {
          ...spell,
          tones: [
            ...(spell.tones || []),
            {
              name: "magichant_custom_name",
              effect: "",
              customName: "",
            },
          ],
        };
      },
      "pilot-vehicle": (spell) => ({
        ...spell,
        vehicles: [
          ...(spell.vehicles || []),
          {
            description: "",
            customName: "",
            frame: "pilot_frame_exoskeleton",
            modules: [],
            enabledModules: [],
            maxEnabledModules: 3,
            enabled: (spell.vehicles || []).length === 0,
          },
        ],
      }),
      symbol: (spell) => ({
        ...spell,
        symbols: [
          ...(spell.symbols || []),
          {
            name: "symbol_custom_name",
            effect: "",
            customName: "",
          },
        ],
      }),
      dance: (spell) => ({
        ...spell,
        dances: [
          ...(spell.dances || []),
          {
            name: "dance_custom",
            effect: "",
            duration: "",
            customName: "",
          },
        ],
      }),
      gift: (spell) => ({
        ...spell,
        gifts: [
          ...(spell.gifts || []),
          {
            name: "esper_gift_custom_name",
            event: "",
            effect: "",
            customName: "",
          },
        ],
      }),
      therioform: (spell) => ({
        ...spell,
        therioforms: [
          ...(spell.therioforms || []),
          {
            name: "mutant_therioform_custom",
            genoclepsis: "",
            description: "",
            customName: "",
          },
        ],
      }),
      magiseed: (spell) => ({
        ...spell,
        magiseeds: [
          ...(spell.magiseeds || []),
          {
            name: "magiseed_custom",
            customName: "",
            description: "",
            rangeStart: 0,
            rangeEnd: 3,
            effects: { 0: "", 1: "", 2: "", 3: "" },
          },
        ],
      }),
    };

    const updater = addByType[spellType];
    if (!updater) return;
    updateSpellInClass(classIndex, spellIndex, updater);
  };

  const getSpellTypeDisplayName = (spellType) => {
    switch (spellType) {
      case "default":
        return t("Spell");
      case "arcanist":
        return t("Arcanist");
      case "arcanist-rework":
        return t("Arcanist-Rework");
      case "pilot-vehicle":
        return t("Pilot Vehicle");
      default:
        return t(spellType);
    }
  };

  const getAddActionsForClass = (cls, classIndex) => {
    const spellTypes = getClassSpellTypes(cls);
    const actions = [];

    spellTypes.forEach((spellType) => {
      const existingIndex = (cls.spells || []).findIndex(
        (spell) => spell.spellType === spellType,
      );
      const hasExisting = existingIndex >= 0;

      if (!hasExisting || !SINGLE_INSTANCE_SPELL_TYPES.has(spellType)) {
        actions.push({
          id: `new-${spellType}`,
          label: `${t("Add")} ${getSpellTypeDisplayName(spellType)}`,
          onClick: () => handleAddNewSpell(classIndex, spellType),
        });
        return;
      }

      if (spellType === "magichant") {
        actions.push({
          id: "magichant-key",
          label: t("magichant_add_key"),
          onClick: () =>
            addSubItemToSingletonSpell(classIndex, "magichant", "key"),
        });
        actions.push({
          id: "magichant-tone",
          label: t("magichant_add_tone"),
          onClick: () =>
            addSubItemToSingletonSpell(classIndex, "magichant", "tone"),
        });
        return;
      }

      if (
        [
          "pilot-vehicle",
          "symbol",
          "dance",
          "gift",
          "therioform",
          "magiseed",
        ].includes(spellType)
      ) {
        const labelMap = {
          "pilot-vehicle": t("pilot_vehicles_add"),
          symbol: t("Add Symbol"),
          dance: t("Add Dance"),
          gift: t("Add Gift"),
          therioform: t("Add Therioform"),
          magiseed: t("magiseed_add_magiseed"),
        };
        actions.push({
          id: `${spellType}-content`,
          label:
            labelMap[spellType] ||
            `${t("Add")} ${getSpellTypeDisplayName(spellType)}`,
          onClick: () => addSubItemToSingletonSpell(classIndex, spellType),
        });
      }
    });

    return actions;
  };

  const handleOpenAddMenu = (event, classIndex) => {
    event.stopPropagation();
    setAddMenuAnchor(event.currentTarget);
    setAddMenuClassIndex(classIndex);
  };

  const handleCloseAddMenu = () => {
    setAddMenuAnchor(null);
    setAddMenuClassIndex(null);
  };

  const handleOpenImportModal = (classIndex) => {
    setImportTargetClassIndex(classIndex);
    setImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setImportTargetClassIndex(null);
  };

  const normalizeImportedSpell = (spell) => {
    if (!spell || typeof spell !== "object") return null;

    if (spell.spellType === "default") {
      return {
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
      };
    }

    if (spell.spellType === "gamble") {
      return {
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
      };
    }

    if (spell.spellType === "arcanist") {
      return {
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
      };
    }

    if (spell.spellType === "arcanist-rework") {
      return {
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
      };
    }

    const cloned = JSON.parse(JSON.stringify(spell));
    return {
      ...cloned,
      showInPlayerSheet:
        cloned.showInPlayerSheet === undefined
          ? true
          : cloned.showInPlayerSheet,
    };
  };

  const handleImportFromCompendium = (item, selectedType) => {
    if (importTargetClassIndex === null || selectedType !== "player-spells")
      return;
    const classRef = player.classes?.[importTargetClassIndex];
    if (!classRef) return;
    if (!canAddSpellTypeToClass(classRef, item?.spellType)) return;

    const imported = normalizeImportedSpell(item);
    if (!imported) return;

    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, index) =>
        index === importTargetClassIndex
          ? { ...cls, spells: [...(cls.spells || []), imported] }
          : cls,
      ),
    }));
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "ig");
    const parts = String(text).split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <span key={idx} style={{ backgroundColor: "yellow" }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const filterSpells = (spells, query) => {
    if (!query) return spells;
    const q = query.toLowerCase();
    return spells.filter((spell) => {
      const rawStrings = collectStringValues(spell, []);
      const translatedStrings = rawStrings.map((text) => t(text));
      return [...rawStrings, ...translatedStrings]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  };

  const getSpellName = (spell) => {
    const name = spell.name || spell.spellName;
    if (name && name !== t("Unnamed Spell")) return name;

    switch (spell.spellType) {
      case "magiseed":
        return t("magiseed_garden");
      case "cooking":
        return t("Gourmet");
      case "invocation":
        return t("Invoker");
      case "deck":
        return t("ace_deck_management");
      case "tinkerer-alchemy":
        return t("Alchemy");
      case "tinkerer-infusion":
        return t("Infusion");
      case "tinkerer-magitech":
        return t("Magitech");
      case "magichant":
        return t("Magichant");
      case "symbol":
        return t("Symbol");
      case "dance":
        return t("Dance");
      case "gift":
        return t("Gift");
      case "therioform":
        return t("Therioform");
      case "pilot-vehicle":
        return t("Pilot Vehicle");
      case "arcanist":
        return t("Arcanist");
      case "arcanist-rework":
        return t("Arcanist-Rework");
      default:
        return t("Unnamed Spell");
    }
  };

  if (!player.classes?.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {player.classes.map((c, classIndex) => {
        const spellsInClass = c.spells
          .map((s) => ({ ...s, className: c.name }))
          .filter(
            (spell) =>
              spell.showInPlayerSheet || spell.showInPlayerSheet === undefined,
          );

        const filteredSpells = filterSpells(spellsInClass, searchQuery);
        const addActions = getAddActionsForClass(c, classIndex);
        const addDisabled = addActions.length === 0;

        if (filteredSpells.length === 0) return null;

        return (
          <TableContainer
            key={classIndex}
            component={Paper}
            sx={{ overflowX: "auto" }}
          >
            <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow sx={{ background: theme.primary }}>
                  <StyledTableCellHeader sx={{ width: 36 }} />
                  <StyledTableCellHeader>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{ textTransform: "uppercase", color: "white" }}
                      >
                        {t("Spells") + " - " + t(c.name)}
                      </Typography>
                    </Box>
                  </StyledTableCellHeader>
                  <StyledTableCellHeader
                    sx={{
                      width: { xs: 55, sm: 80 },
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  />
                  <StyledTableCellHeader
                    sx={{
                      width: { xs: 65, sm: 90 },
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  />
                  <StyledTableCellHeader
                    sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Tooltip
                        title={
                          addDisabled
                            ? t("Cannot add more of this spell type")
                            : t("Add New Spell")
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={(event) =>
                              handleOpenAddMenu(event, classIndex)
                            }
                            disabled={addDisabled}
                            sx={{ color: "#fff", p: 0 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={t("Search Compendium")}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenImportModal(classIndex)}
                          sx={{ color: "#fff", p: 0 }}
                        >
                          <Search fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </StyledTableCellHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSpells.map((spell, spellIndex) => {
                  const spellKey = `spell-${classIndex}-${spellIndex}`;
                  const spellName = getSpellName(spell, t);

                  return (
                    <React.Fragment key={spellKey}>
                      <TableRow
                        sx={{
                          backgroundColor: openRows.spells[spellKey]
                            ? "rgba(0,0,0,0.02)"
                            : "inherit",
                        }}
                      >
                        <StyledTableCell sx={{ width: 36 }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow("spells", spellKey);
                            }}
                            size="small"
                            sx={{ p: 0.5 }}
                          >
                            {openRows.spells[spellKey] ? (
                              <KeyboardArrowUp fontSize="small" />
                            ) : (
                              <KeyboardArrowDown fontSize="small" />
                            )}
                          </IconButton>
                        </StyledTableCell>
                        <StyledTableCell
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow("spells", spellKey);
                          }}
                          sx={{
                            cursor: "pointer",
                            minWidth: { xs: 60, sm: 100 },
                            wordBreak: "break-word",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                mr: 0.5,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                              }}
                            >
                              {highlightMatch(spellName, searchQuery)}
                            </Typography>
                            <Tooltip title={t("Spell")}>
                              <MoreVert
                                sx={{
                                  color: theme.secondary,
                                  fontSize: "1rem",
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            width: { xs: 55, sm: 80 },
                            display: { xs: "none", sm: "table-cell" },
                          }}
                        />
                        <StyledTableCell
                          sx={{
                            width: { xs: 65, sm: 90 },
                            display: { xs: "none", sm: "table-cell" },
                          }}
                        />
                        <StyledTableCell
                          sx={{
                            width: { xs: 110, sm: 110 },
                            textAlign: "right",
                          }}
                        >
                          <Tooltip title={t("Edit")}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSpell(spell, spellIndex, classIndex);
                              }}
                              sx={{ p: 0.5 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </StyledTableCell>
                      </TableRow>

                      <TableRow>
                        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
                          <Collapse
                            in={openRows.spells[spellKey]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ p: 1, ml: { xs: 1, sm: 4 } }}>
                              {renderSpellContent(
                                spell,
                                setPlayer,
                                searchQuery,
                                highlightMatch,
                              )}
                            </Box>
                          </Collapse>
                        </StyledTableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        );
      })}

      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleCloseAddMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {(addMenuClassIndex !== null
          ? getAddActionsForClass(
              player.classes?.[addMenuClassIndex],
              addMenuClassIndex,
            )
          : []
        ).map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => {
              action.onClick();
              handleCloseAddMenu();
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>

      {modalOpen && editingSpell && (
        <UnifiedSpellModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveSpell}
          onDelete={handleDeleteSpell}
          spellType={editingSpell.spellType}
          spell={editingSpell}
          sections={getSpellModalSections(editingSpell.spellType)}
        />
      )}

      {magitechModalOpen && editingSpell && (
        <SpellTinkererMagitechRankModal
          open={magitechModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveSpell}
          onDelete={handleDeleteSpell}
          magitech={editingSpell}
        />
      )}

      <CompendiumViewerModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        onAddItem={handleImportFromCompendium}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={player.classes?.[importTargetClassIndex]?.name || ""}
        context="player"
      />
    </Box>
  );
}
