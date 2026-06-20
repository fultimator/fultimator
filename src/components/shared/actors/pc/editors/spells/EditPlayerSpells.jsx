import React, { useState, useEffect } from "react";
import { useSpellModals } from "/src/hooks/useSpellModals";
import { useTheme } from "@mui/material/styles";
import {
  TextField,
  Button,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Popover,
} from "@mui/material";
import {
  UnfoldMore,
  UnfoldLess,
  ExpandMore,
  ExpandLess,
  Add as AddIcon,
} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "/src/translation/translate";
import SearchIcon from "@mui/icons-material/Search";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import SpellDefault from "/src/components/shared/actors/pc/spells/SpellDefault";
import SpellArcanistModal from "/src/components/shared/actors/pc/spells/SpellArcanistModal";
import SpellArcanist from "/src/components/shared/actors/pc/spells/SpellArcanist";
import SpellDefaultModal from "/src/components/shared/actors/pc/spells/SpellDefaultModal";
import SpellTinkererAlchemy from "/src/components/shared/actors/pc/spells/SpellTinkererAlchemy";
import SpellTinkererAlchemyModal from "/src/components/shared/actors/pc/spells/SpellTinkererAlchemyModal";
import { tinkererAlchemy, tinkererInfusion } from "/src/libs/classes";
import SpellTinkererInfusion from "/src/components/shared/actors/pc/spells/SpellTinkererInfusion";
import SpellTinkererInfusionModal from "/src/components/shared/actors/pc/spells/SpellTinkererInfusionModal";
import SpellTinkererMagitech from "/src/components/shared/actors/pc/spells/SpellTinkererMagitech";
import SpellTinkererMagitechRankModal from "/src/components/shared/actors/pc/spells/SpellTinkererMagitechRankModal";
import SpellEntropistGambleModal from "/src/components/shared/actors/pc/spells/SpellEntropistGambleModal";
import SpellEntropistGamble from "/src/components/shared/actors/pc/spells/SpellEntropistGamble";
import SpellChanter from "/src/components/shared/actors/pc/spells/SpellChanter";
import SpellSymbolist from "/src/components/shared/actors/pc/spells/SpellSymbolist";
import SpellDancer from "/src/components/shared/actors/pc/spells/SpellDancer";
import SpellGift from "/src/components/shared/actors/pc/spells/SpellGift";
import SpellMutant from "/src/components/shared/actors/pc/spells/SpellMutant";
import SpellPilot from "/src/components/shared/actors/pc/spells/SpellPilot";
import SpellMagiseed from "/src/components/shared/actors/pc/spells/SpellMagiseed";
import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import GeneralSection from "/src/components/shared/actors/pc/spells/sections/GeneralSection";
import {
  hasActiveSpellInList,
  setNestedActivation,
  setSpellListActivation,
} from "/src/components/shared/actors/pc/spells/spellActivationPolicies";
import { ARCANA_POLICY_KEY } from "/src/components/shared/actors/pc/spells/arcanaActions";
import MagiseedGeneralSection from "/src/components/shared/actors/pc/spells/sections/MagiseedGeneralSection";
import MagiseedContentSection from "/src/components/shared/actors/pc/spells/sections/MagiseedContentSection";
import GiftContentSection from "/src/components/shared/actors/pc/spells/sections/GiftContentSection";
import DancerContentSection from "/src/components/shared/actors/pc/spells/sections/DancerContentSection";
import SymbolistContentSection from "/src/components/shared/actors/pc/spells/sections/SymbolistContentSection";
import MagichantKeysContentSection from "/src/components/shared/actors/pc/spells/sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "/src/components/shared/actors/pc/spells/sections/MagichantTonesContentSection";
import MutantContentSection from "/src/components/shared/actors/pc/spells/sections/MutantContentSection";
import PilotGeneralSection from "/src/components/shared/actors/pc/spells/sections/PilotGeneralSection";
import PilotContentSection from "/src/components/shared/actors/pc/spells/sections/PilotContentSection";
import InvokerGeneralSection from "/src/components/shared/actors/pc/spells/sections/InvokerGeneralSection";
import InvokerContentSection from "/src/components/shared/actors/pc/spells/sections/InvokerContentSection";
import InvokerCustomSection from "/src/components/shared/actors/pc/spells/sections/InvokerCustomSection";
import GourmetGeneralSection from "/src/components/shared/actors/pc/spells/sections/GourmetGeneralSection";
import GourmetContentSection from "/src/components/shared/actors/pc/spells/sections/GourmetContentSection";
import GourmetInventoryTab from "/src/components/shared/actors/pc/spells/sections/GourmetInventoryTab";
import GourmetCookingTab from "/src/components/shared/actors/pc/spells/sections/GourmetCookingTab";
import SpellGourmet from "/src/components/shared/actors/pc/spells/SpellGourmet";
import SpellInvoker from "/src/components/shared/actors/pc/spells/SpellInvoker";
import SpellDeck from "/src/components/shared/actors/pc/spells/SpellDeck";
import SpellDeckModal from "/src/components/shared/actors/pc/spells/SpellDeckModal";
import GambleExplain from "/src/components/shared/actors/pc/spells/GambleExplain";
import {
  VEHICLE_ACTIONS,
  vehicleReducer,
} from "/src/components/shared/actors/pc/spells/vehicleReducer";
import { deriveVehicleSlots } from "/src/libs/player/slots/equipmentSlots";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { getActiveMnemospheres } from "/src/libs/player/mnemosphereClassUtils";
import { getMnemosphereClassDefinition } from "/src/libs/mnemospheres";
import useSphereBank from "/src/hooks/useSphereBank";
import { calculateAttribute } from "/src/libs/playerCalculations";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/magic-checks";
import {
  accuracyModifiersFromEffects,
  outgoingDamageBonusFromEffects,
} from "/src/components/app-drawer/panels/chat/domain/effect-modifiers";
import { sendRollMessage, sendDisplayMessage } from "/src/hooks/useRollToChat";

function CollapsibleSection({ title, actions, forceExpanded, defaultExpanded = false, headerColor, children, sx }) {
  const [collapsed, setCollapsed] = useState(!defaultExpanded);
  const theme = useTheme();
  const bg = headerColor ?? theme.palette.primary.main;
  const isDark = theme.palette.mode === "dark";
  const textColor = headerColor ? (isDark ? "#fff" : "#000") : "#fff";

  useEffect(() => {
    if (forceExpanded === null) return;
    setCollapsed(!forceExpanded.expanded);
  }, [forceExpanded]);

  return (
    <Box
      sx={{
        borderRadius: "8px",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
        ...sx,
      }}
    >
      <Box
        onClick={() => setCollapsed((v) => !v)}
        sx={{
          background: bg,
          px: headerColor ? "17px" : 1,
          py: headerColor ? "4px" : "6px",
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Typography
          noWrap
          sx={{
            color: textColor,
            fontFamily: "Antonio",
            fontWeight: headerColor ? "normal" : 800,
            fontSize: headerColor ? "1.3em" : { xs: "1.1rem", sm: "1.2rem" },
            textTransform: "uppercase",
            letterSpacing: headerColor ? undefined : "0.06em",
            lineHeight: 1.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          {actions}
          {collapsed
            ? <ExpandMore sx={{ fontSize: "1.4rem", color: textColor }} />
            : <ExpandLess sx={{ fontSize: "1.4rem", color: textColor }} />}
        </Box>
      </Box>
      <Collapse in={!collapsed}>{children}</Collapse>
    </Box>
  );
}

export default function EditPlayerSpells({ player, setPlayer, isEditMode, defaultExpandAll = false }) {
  const { t } = useTranslate();
  const theme = useTheme();

  const normalizeAttr = (raw) => {
    const k = String(raw ?? "").toLowerCase();
    if (k === "dex" || k === "dexterity") return "dexterity";
    if (k === "ins" || k === "insight") return "insight";
    if (k === "mig" || k === "might") return "might";
    if (k === "wlp" || k === "will" || k === "willpower") return "willpower";
    return "dexterity";
  };

  const getAttrDie = (key) => {
    const normKey = normalizeAttr(key);
    const base = player?.attributes?.[normKey]?.base ?? 8;
    const cfg = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    }[normKey] ?? [[], []];
    return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
  };

  const buildSpellTags = (spell) => {
    const tags = [];
    if (spell.cost?.amount != null) {
      tags.push(
        `${spell.cost.amount}${spell.cost.perTarget && spell.maxTargets !== 1 ? " × T" : ""} MP`,
      );
    }
    if (spell.targetDescription) tags.push(spell.targetDescription);
    if (spell.duration) tags.push(spell.duration);
    return tags;
  };

  const handleRollSpell = (spell) => {
    if (!spell.isOffensive) return;
    const attr1 = normalizeAttr(spell.accuracy?.attr1);
    const attr2 = normalizeAttr(spell.accuracy?.attr2);
    const damageType = spell.damage?.type ?? "physical";
    const magicModifiers = player
      ? accuracyModifiersFromEffects(player, { checkType: "magic" })
      : [];
    const damageOutgoingBonus = player
      ? outgoingDamageBonusFromEffects(player, { range: "spell", damageType })
      : 0;
    const intent = prepareMagicCheck(
      {
        name: spell.name,
        spellType: spell.spellType,
        attr1,
        attr2,
        accuracyBonus: spell.accuracy?.value ?? 0,
        baseDamage: spell.damage?.value ?? 0,
        damageType,
        accuracyDefense: spell.accuracy?.defense ?? "mdef",
        damageHrZero: spell.damage?.hrZero === true,
        description: spell.description,
        extraTags: buildSpellTags(spell),
      },
      magicModifiers,
      { damageOutgoingBonus },
    );
    const dieSizes = {
      primary: getAttrDie(attr1),
      secondary: getAttrDie(attr2),
    };
    const rolls = rollMagicCheck(dieSizes);
    const result = processMagicCheck(
      intent,
      rolls,
      dieSizes,
      player?.info?.name || player?.name || "",
    );
    sendRollMessage(buildMagicCheckMessage(result));
  };

  const handleChatSpell = (spell) => {
    sendDisplayMessage("spell", spell.name || "", {
      tags: buildSpellTags(spell),
      description: spell.description,
      speaker: player?.info?.name || player?.name || "",
    });
  };

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [expandSignal, setExpandSignal] = useState(
    defaultExpandAll ? { expanded: true, seq: 0 } : null,
  );
  const toggleExpandSignal = () =>
    setExpandSignal((prev) => {
      const wasExpanded = prev === null ? false : prev.expanded;
      return { expanded: !wasExpanded, seq: (prev?.seq ?? 0) + 1 };
    });
  const [addSpellAnchor, setAddSpellAnchor] = useState(null);
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

  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;
  const activeMnemospheres = isTechnospheres
    ? getActiveMnemospheres(player)
    : [];

  const [selectedMnemoTarget, setSelectedMnemoTarget] = useState(null);
  const [selectedMnemoSpellType, setSelectedMnemoSpellType] = useState(null);

  const handleMnemoTargetChange = (mnemoId, newValue) => {
    setSelectedMnemoTarget(mnemoId);
    setSelectedMnemoSpellType(newValue);
  };

  const addNewMnemoSpell = (mnemoId, spellType) => {
    if (!mnemoId || !spellType) return;
    const baseSpell = buildBlankSpell(spellType);
    const mnemo = activeMnemospheres.find((entry) => entry.id === mnemoId);
    const newSpell =
      spellType === "arcanist" || spellType === "arcanist-rework"
        ? {
          ...baseSpell,
          enabled: !hasActiveSpellInList(
            mnemo?.spells || [],
            ARCANA_POLICY_KEY,
          ),
        }
        : baseSpell;
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
        cost: spell.cost ?? { resource: "mp", amount: 0, perTarget: true },
        maxTargets: spell.maxTargets,
        targetDescription: t(spell.targetDescription),
        duration: t(spell.duration),
        description: t(spell.description),
        isOffensive: spell.isOffensive,
        accuracy: spell.accuracy ?? {
          attr1: spell.attr1 || "insight",
          attr2: spell.attr2 || "will",
          value: 0,
          defense: "mdef",
        },
        damage: spell.damage ?? undefined,
        isMagisphere: spell.isMagisphere || false,
        showInPlayerSheet: true,
        fuid: spell.fuid,
        _packItemId: spell._packItemId,
      });
    } else if (spell.spellType === "gamble") {
      addMnemoSpell(mnemoId, {
        spellType: spell.spellType,
        spellName: t(spell.name),
        cost: spell.cost ?? { resource: "mp", amount: 0, perTarget: true },
        maxTargets: spell.maxTargets,
        targetDescription: t(spell.targetDescription),
        duration: t(spell.duration),
        attr: spell.attr,
        targets: spell.targets,
        isMagisphere: spell.isMagisphere || false,
        showInPlayerSheet: true,
        fuid: spell.fuid,
        _packItemId: spell._packItemId,
      });
    } else {
      const clonedSpell = JSON.parse(JSON.stringify(spell));
      const baseSpell = {
        ...clonedSpell,
        _packItemId: spell._packItemId,
        showInPlayerSheet:
          clonedSpell.showInPlayerSheet === undefined
            ? true
            : clonedSpell.showInPlayerSheet,
      };
      const mnemo = activeMnemospheres.find((entry) => entry.id === mnemoId);
      addMnemoSpell(
        mnemoId,
        spell.spellType === "arcanist" ||
          spell.spellType === "arcanist-rework"
          ? {
            ...baseSpell,
            enabled: !hasActiveSpellInList(
              mnemo?.spells || [],
              ARCANA_POLICY_KEY,
            ),
          }
          : baseSpell,
      );
    }
    setSelectedMnemoTarget(null);
    setSelectedMnemoSpellType(null);
  };

  const spellTypeOptions = player.classes
    .filter(
      (cls) =>
        cls.benefits.spellClasses && cls.benefits.spellClasses.length > 0,
    )
    .flatMap((cls) =>
      cls.benefits.spellClasses.map((spellType) => ({
        label: `${spellType.charAt(0).toUpperCase() + spellType.slice(1)} (${t(cls.name)})`,
        spellType,
        className: cls.name,
      })),
    );

  const optionAlreadyExists = (option) => {
    const cls = player.classes.find((c) => c.name === option.className);
    if (!cls) return false;
    return (cls.spells ?? []).some((s) => s.spellType === option.spellType);
  };

  const selectedSpellTypeOption =
    selectedClass && selectedSpell
      ? (spellTypeOptions.find(
        (o) => o.className === selectedClass && o.spellType === selectedSpell,
      ) ?? null)
      : null;

  const handleSpellTypeOptionChange = (event, newValue) => {
    setSelectedClass(newValue ? newValue.className : null);
    setSelectedSpell(newValue ? newValue.spellType : null);
  };

  const isTinkererClass = (cls) =>
    cls?.fuid === "tinkerer" || cls?.name === "Tinkerer";

  const buildBlankSpell = (spellType) => {
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
        accuracy: {
          attr1: "dexterity",
          attr2: "dexterity",
          value: 0,
          defense: "mdef",
        },
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
                  cost: { resource: "mp", amount: 0, perTarget: true },
                  maxTargets: 0,
                  targetDescription: "",
                  duration: "",
                  description: "",
                  isOffensive: false,
                  accuracy: {
                    attr1: "insight",
                    attr2: "will",
                    value: 0,
                    defense: "mdef",
                  },
                  isMagisphere: isTinkererClass(cls),
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
                  enabled: !hasActiveSpellInList(
                    cls.spells,
                    ARCANA_POLICY_KEY,
                  ),
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
                  enabled: !hasActiveSpellInList(
                    cls.spells,
                    ARCANA_POLICY_KEY,
                  ),
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
                  cost: { resource: "mp", amount: 10, perTarget: true },
                  maxTargets: 2,
                  targetDescription: "Special",
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
              cost: spell.cost ?? {
                resource: "mp",
                amount: 0,
                perTarget: true,
              },
              maxTargets: spell.maxTargets,
              targetDescription: t(spell.targetDescription),
              duration: t(spell.duration),
              description: t(spell.description),
              isOffensive: spell.isOffensive,
              accuracy: spell.accuracy ?? {
                attr1: "insight",
                attr2: "will",
                value: 0,
                defense: "mdef",
              },
              isMagisphere: isTinkererClass(cls)
                ? true
                : spell.isMagisphere || false,
              showInPlayerSheet: true,
              fuid: spell.fuid,
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
              enabled: !hasActiveSpellInList(cls.spells, ARCANA_POLICY_KEY),
              showInPlayerSheet: true,
              fuid: spell.fuid,
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
              enabled: !hasActiveSpellInList(cls.spells, ARCANA_POLICY_KEY),
              showInPlayerSheet: true,
              fuid: spell.fuid,
              _packItemId: spell._packItemId,
            },
          ],
        };
      }),
    }));
    return true;
  };

  const singletonSpellTypes = new Set([
    "magichant",
    "symbol",
    "dance",
    "gift",
    "therioform",
    "pilot-vehicle",
    "magiseed",
    "gourmet",
    "invoker",
    "deck",
    "alchemy",
    "infusion",
    "magitech",
    "mutant",
  ]);

  const addSystemSpellFromCompendium = (spell, className, spellType, label) => {
    if (!className) return false;
    if (spell?.spellType !== spellType) {
      if (window.electron)
        window.electron.alert(`Please select a ${label} spell.`);
      else alert(`Please select a ${label} spell.`);
      return false;
    }
    if (spellType === "dance" || spellType === "symbol") {
      const subItem =
        spellType === "dance"
          ? {
            key: spell.key || spell.name,
            name: spell.name,
            effect: spell.effect || "",
            duration: spell.duration || "",
            customName: "",
            _packItemId: spell._packItemId,
          }
          : {
            key: spell.key || spell.name,
            name: spell.name,
            effect: spell.effect || "",
            customName: "",
            _packItemId: spell._packItemId,
          };
      const itemsKey = spellType === "dance" ? "dances" : "symbols";
      setPlayer((prev) => ({
        ...prev,
        classes: prev.classes.map((cls) => {
          if (cls.name !== className) return cls;
          const existingIndex = (cls.spells || []).findIndex(
            (sp) => sp.spellType === spellType,
          );
          if (existingIndex >= 0) {
            return {
              ...cls,
              spells: cls.spells.map((sp, index) =>
                index === existingIndex
                  ? {
                    ...sp,
                    [itemsKey]: [...(sp[itemsKey] || []), subItem],
                  }
                  : sp,
              ),
            };
          }
          return {
            ...cls,
            spells: [
              ...(cls.spells || []),
              {
                ...buildBlankSpell(spellType),
                [itemsKey]: [subItem],
              },
            ],
          };
        }),
      }));
      return true;
    }
    if (singletonSpellTypes.has(spellType)) {
      const already = (
        player.classes.find((c) => c.name === className)?.spells ?? []
      ).some((sp) => sp.spellType === spellType);
      if (already) {
        const msg = `You already have a ${label} spell`;
        if (window.electron) window.electron.alert(msg);
        else alert(msg);
        return false;
      }
      setPlayer((prev) => ({
        ...prev,
        classes: prev.classes.map((cls) => {
          if (cls.name !== className) return cls;
          return {
            ...cls,
            spells: [...cls.spells, buildBlankSpell(spellType)],
          };
        }),
      }));
      return true;
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

  const handleEditDefaultSpell = (spell, spellClass, spellIndex) =>
    openModal("spellDefault", spell, spellClass, spellIndex);
  const handleEditArcanistSpell = (spell, spellClass, spellIndex) =>
    openModal("spellArcanist", spell, spellClass, spellIndex);
  const handleActivateArcana = (
    spellClass,
    spellIndex,
    spellType,
    active = true,
  ) => {
    setPlayer((prev) => {
      const equipment = prev.equipment ? [...prev.equipment] : [];
      const eq0 = equipment[0];
      const mnemospheres = eq0?.mnemospheres || [];
      const mnemoIndex = mnemospheres.findIndex((m) => m.id === spellClass);

      if (mnemoIndex >= 0) {
        const nextMnemospheres = mnemospheres.map((mnemo, index) =>
          index === mnemoIndex
            ? {
              ...mnemo,
              spells: setSpellListActivation(
                mnemo.spells || [],
                spellIndex,
                ARCANA_POLICY_KEY,
                active,
              ),
            }
            : mnemo,
        );
        const nextEq0 = { ...eq0, mnemospheres: nextMnemospheres };
        return {
          ...prev,
          equipment: [nextEq0, ...equipment.slice(1)],
        };
      }

      return {
        ...prev,
        classes: (prev.classes || []).map((cls) =>
          cls.name === spellClass
            ? {
              ...cls,
              spells: setSpellListActivation(
                cls.spells || [],
                spellIndex,
                ARCANA_POLICY_KEY,
                active,
              ),
            }
            : cls,
        ),
      };
    });
  };
  const handleEditAlchemySpell = (spell, spellClass, spellIndex) =>
    openModal("alchemy", spell, spellClass, spellIndex);
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
                const tracker = spell.tracker || {};
                const currentWellsprings = tracker.activeWellsprings || [];
                const innerWellspringEnabled =
                  spell.innerWellspring || tracker.innerWellspring || false;
                const chosenWellspring =
                  spell.chosenWellspring || tracker.chosenWellspring || "";
                const alwaysActive = spell.alwaysActiveWellsprings || [];
                const isLocked =
                  (innerWellspringEnabled &&
                    chosenWellspring === wellspringName) ||
                  alwaysActive.includes(wellspringName);

                if (isLocked) {
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
                  tracker: {
                    ...tracker,
                    activeWellsprings: newWellsprings,
                  },
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

  const handleMagiseedChange = (
    spellClass,
    spellIndex,
    newMagiseed,
    seedIndex,
  ) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === spellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, spellIdx) => {
              if (spellIdx === spellIndex && spell.spellType === "magiseed") {
                return setNestedActivation(
                  spell,
                  seedIndex,
                  "magiseed",
                  Boolean(newMagiseed),
                );
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
                  if (field === "enabled") {
                    return setNestedActivation(
                      spell,
                      vehicleIndex,
                      "pilot-vehicle",
                      value,
                    );
                  }

                  const updatedVehicles = [...spell.vehicles];
                  updatedVehicles[vehicleIndex] = {
                    ...updatedVehicles[vehicleIndex],
                    [field]: value,
                  };

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
    const pendingZenitSpent = Math.max(
      0,
      Number(editedSpell?._pendingZenitSpent) || 0,
    );
    const { _pendingZenitSpent, ...spellToSave } = editedSpell || {};

    if (isMnemoEditingTarget(editingSpellClass)) {
      updateMnemoSpell(editingSpellClass, spellIndex, spellToSave);
      if (pendingZenitSpent > 0) {
        setPlayer((prev) => ({
          ...prev,
          info: {
            ...prev.info,
            zenit: Math.max(
              0,
              (Number(prev.info?.zenit) || 0) - pendingZenitSpent,
            ),
          },
        }));
      }
    } else {
      setPlayer((prev) => ({
        ...prev,
        info:
          pendingZenitSpent > 0
            ? {
              ...prev.info,
              zenit: Math.max(
                0,
                (Number(prev.info?.zenit) || 0) - pendingZenitSpent,
              ),
            }
            : prev.info,
        classes: prev.classes.map((cls) => {
          if (cls.name === editingSpellClass) {
            return {
              ...cls,
              spells: cls.spells.map((spell, index) => {
                if (index === spellIndex) {
                  return spellToSave;
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

  const spellTypeLabel = {
    default: t("Default Spells"),
    arcanist: t("Arcana"),
    "arcanist-rework": t("Arcana - Rework"),
    "tinkerer-alchemy": t("Alchemy"),
    "tinkerer-infusion": t("Infusions"),
    "tinkerer-magitech": t("Magitech"),
    gamble: t("Gamble"),
    magichant: t("Magichant"),
    symbol: t("symbol_symbol"),
    dance: t("dance_dance"),
    gift: t("esper_gift"),
    therioform: t("mutant_therioforms"),
    "pilot-vehicle": t("pilot_vehicles"),
    magiseed: t("magiseed_garden"),
    cooking: t("gourmet_cookbook"),
    invocation: t("invoker_invocation"),
    deck: t("ace_deck_of_cards"),
  };

  return (
    <>
      <SectionCard
        title={t("Spells")}
        actions={
          <>
            {isEditMode && (
              <>
                <Tooltip title={t("Add Spell Type")}>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setAddSpellAnchor(e.currentTarget); }}
                    sx={{ color: "#fff", p: "2px" }}
                  >
                    <AddIcon sx={{ fontSize: "1.3rem" }} />
                  </IconButton>
                </Tooltip>
                <Popover
                  open={Boolean(addSpellAnchor)}
                  anchorEl={addSpellAnchor}
                  onClose={() => setAddSpellAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Box sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center", minWidth: 340 }}>
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={spellTypeOptions}
                      value={selectedSpellTypeOption}
                      onChange={handleSpellTypeOptionChange}
                      getOptionDisabled={optionAlreadyExists}
                      getOptionLabel={(o) => o.label}
                      isOptionEqualToValue={(a, b) =>
                        a.className === b.className && a.spellType === b.spellType
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("Select Spell Type")}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    />
                    <Button
                      variant="contained"
                      disabled={!selectedSpell}
                      onClick={() => {
                        addNewSpell(selectedSpell);
                        setAddSpellAnchor(null);
                        setSelectedClass(null);
                        setSelectedSpell(null);
                      }}
                    >
                      {t("Add")}
                    </Button>
                  </Box>
                </Popover>
              </>
            )}
            <Tooltip title={expandSignal?.expanded ? t("Collapse All") : t("Expand All")}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); toggleExpandSignal(); }}
                sx={{ color: "#fff", p: "2px" }}
              >
                {expandSignal?.expanded ? (
                  <UnfoldLess sx={{ fontSize: "1.3rem" }} />
                ) : (
                  <UnfoldMore sx={{ fontSize: "1.3rem" }} />
                )}
              </IconButton>
            </Tooltip>
          </>
        }
      >
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          {player.classes
            .filter((cls) => cls.spells && cls.spells.length > 0)
            .filter(
              (cls) =>
                cls.benefits.spellClasses && cls.benefits.spellClasses.length > 0,
            )
            .map((cls) => {
              const sortedSpells = [...cls.spells].sort((a, b) =>
                a.spellType.localeCompare(b.spellType),
              );
              const grouped = {};
              sortedSpells.forEach((spell) => {
                const type = spell.spellType;
                if (!grouped[type]) grouped[type] = [];
                grouped[type].push({ spell, index: cls.spells.indexOf(spell) });
              });

              const hasCompendiumSearch = (type) =>
                ["default", "arcanist", "arcanist-rework", "magichant", "symbol", "dance", "gift", "therioform", "pilot-vehicle", "magiseed"].includes(type);

              const getCompendiumClick = (type) => {
                if (type === "default") return () => setDefaultCompendiumClass(cls.name);
                if (type === "arcanist") return () => setArcanaCompendiumClass(cls.name);
                if (type === "arcanist-rework") return () => setArcanaReworkCompendiumClass(cls.name);
                return () => setSystemCompendiumTarget({ className: cls.name, spellType: type, label: spellTypeLabel[type] });
              };

              const addSpellToClass = (spellType) => {
                const blank = buildBlankSpell(spellType);
                setPlayer((prev) => ({
                  ...prev,
                  classes: prev.classes.map((c) =>
                    c.name === cls.name
                      ? { ...c, spells: [...c.spells, blank] }
                      : c,
                  ),
                }));
              };

              const spellTypeSections = Object.entries(grouped).map(([type, entries]) => {
                const label = spellTypeLabel[type] || type;
                const headerActions = (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {isEditMode && (
                      <Tooltip title={t("Add New")}>
                        <IconButton
                          onClick={(e) => { e.stopPropagation(); addSpellToClass(type); }}
                          sx={{ p: "4px" }}
                        >
                          <AddIcon sx={{ fontSize: "1.3rem" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {hasCompendiumSearch(type) && (
                      <Tooltip title={t("Add from Compendium")}>
                        <IconButton
                          onClick={(e) => { e.stopPropagation(); getCompendiumClick(type)(); }}
                          sx={{ p: "4px" }}
                        >
                          <SearchIcon sx={{ fontSize: "1.3rem" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
                const content = (
                  <Box>
                    {type === "gamble" && <GambleExplain />}
                    {entries.map(({ spell, index }) => (
                      <React.Fragment key={index}>
                        {spell.spellType === "default" && (
                          <SpellDefault
                            spellName={spell.name}
                            mp={spell.cost?.amount}
                            perTarget={spell.cost?.perTarget ?? true}
                            maxTargets={spell.maxTargets}
                            targetDescription={spell.targetDescription}
                            duration={spell.duration}
                            description={spell.description}
                            onEdit={() =>
                              handleEditDefaultSpell(spell, cls.name, index)
                            }
                            onRoll={
                              spell.isOffensive
                                ? () => handleRollSpell(spell)
                                : undefined
                            }
                            onChat={() => handleChatSpell(spell)}
                            isEditMode={isEditMode}
                            isOffensive={spell.isOffensive}
                            attr1={spell.accuracy?.attr1}
                            attr2={spell.accuracy?.attr2}
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
                            onActivate={(active) =>
                              handleActivateArcana(
                                cls.name,
                                index,
                                spell.spellType,
                                active,
                              )
                            }
                            alwaysExpanded
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
                            onActivate={(active) =>
                              handleActivateArcana(
                                cls.name,
                                index,
                                spell.spellType,
                                active,
                              )
                            }
                            alwaysExpanded
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "tinkerer-alchemy" && (
                          <SpellTinkererAlchemy
                            alchemy={spell}
                            key={index}
                            onEditRank={() => {
                              handleEditAlchemySpell(spell, cls.name, index);
                            }}
                            onEditTargets={() => {
                              handleEditAlchemySpell(spell, cls.name, index);
                            }}
                            onEditEffects={() => {
                              handleEditAlchemySpell(spell, cls.name, index);
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
                            player={player}
                          />
                        )}
                        {spell.spellType === "magiseed" && (
                          <SpellMagiseed
                            magiseed={spell}
                            key={index}
                            onEdit={() =>
                              handleEditMagiseed(spell, cls.name, index)
                            }
                            onMagiseedChange={(newMagiseed, seedIndex) =>
                              handleMagiseedChange(
                                cls.name,
                                index,
                                newMagiseed,
                                seedIndex,
                              )
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
                            key={`${cls.name}-cooking-${index}-${spell.spellName}-${JSON.stringify(spell.cookbook?.effects || [])}`}
                            onEdit={() =>
                              handleEditGourmet(spell, cls.name, index)
                            }
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "invocation" && (
                          <SpellInvoker
                            invoker={spell}
                            key={`${cls.name}-invocation-${index}-${spell.spellName}-${JSON.stringify(spell.invocations)}-${JSON.stringify(spell.tracker?.activeWellsprings || [])}`}
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
                  </Box>
                );

                return (
                  <CollapsibleSection
                    key={type}
                    title={label}
                    actions={headerActions}
                    forceExpanded={expandSignal}
                    defaultExpanded={defaultExpandAll}
                    headerColor={theme.palette.ternary.main}
                    sx={{ mb: 0, borderRadius: 0, boxShadow: "none" }}
                  >
                    {content}
                  </CollapsibleSection>
                );
              });

              return (
                <CollapsibleSection
                  key={cls.name}
                  title={t(cls.name)}
                  forceExpanded={expandSignal}
                  defaultExpanded={defaultExpandAll}
                  sx={{ mb: 1 }}
                >
                  {spellTypeSections}
                </CollapsibleSection>
              );
            })}
        </Box>
      </SectionCard>
      <Divider sx={{ my: 2 }} />
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
            const mnemoGrouped = {};
            mnemoSpells.forEach((spell, index) => {
              const type = spell.spellType ?? "default";
              if (!mnemoGrouped[type]) mnemoGrouped[type] = [];
              mnemoGrouped[type].push({ spell, index });
            });

            const mnemoHasCompendiumSearch = (type) =>
              ["default", "arcanist", "arcanist-rework", "magichant", "symbol", "dance", "gift", "therioform", "magiseed"].includes(type);

            const getMnemoCompendiumClick = (type) => () =>
              setMnemoCompendiumTarget({
                mnemoId: mnemo.id,
                spellType: type,
                label: spellTypeLabel[type] || type,
                className: mnemo.class,
              });

            const mnemoSpellTypeSections = Object.entries(mnemoGrouped).map(([type, entries]) => {
              const label = spellTypeLabel[type] || type;
              const mnemoHeaderActions = mnemoHasCompendiumSearch(type) ? (
                <Tooltip title={t("Add from Compendium")}>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); getMnemoCompendiumClick(type)(); }}
                    sx={{ p: "4px" }}
                  >
                    <SearchIcon sx={{ fontSize: "1.3rem" }} />
                  </IconButton>
                </Tooltip>
              ) : null;

              const mnemoContent = (
                <Box>
                  {type === "gamble" && <GambleExplain />}
                  {entries.map(({ spell, index }) => (
                    <React.Fragment key={index}>
                      {spell.spellType === "default" && (
                        <SpellDefault
                          spellName={spell.name}
                          mp={spell.cost?.amount}
                          perTarget={spell.cost?.perTarget ?? true}
                          maxTargets={spell.maxTargets}
                          targetDescription={spell.targetDescription}
                          duration={spell.duration}
                          description={spell.description}
                          onEdit={() =>
                            handleEditDefaultSpell(spell, mnemo.id, index)
                          }
                          onRoll={
                            spell.isOffensive
                              ? () => handleRollSpell(spell)
                              : undefined
                          }
                          onChat={() => handleChatSpell(spell)}
                          isEditMode={isEditMode}
                          isOffensive={spell.isOffensive}
                          attr1={spell.accuracy?.attr1}
                          attr2={spell.accuracy?.attr2}
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
                              handleEditArcanistSpell(spell, mnemo.id, index)
                            }
                            onActivate={(active) =>
                              handleActivateArcana(
                                mnemo.id,
                                index,
                                spell.spellType,
                                active,
                              )
                            }
                            alwaysExpanded
                            isEditMode={isEditMode}
                          />
                        )}
                      {spell.spellType === "tinkerer-alchemy" && (
                        <SpellTinkererAlchemy
                          alchemy={spell}
                          key={index}
                          onEditRank={() =>
                            handleEditAlchemySpell(spell, mnemo.id, index)
                          }
                          onEditTargets={() =>
                            handleEditAlchemySpell(spell, mnemo.id, index)
                          }
                          onEditEffects={() =>
                            handleEditAlchemySpell(spell, mnemo.id, index)
                          }
                          isEditMode={isEditMode}
                        />
                      )}
                      {spell.spellType === "tinkerer-infusion" && (
                        <SpellTinkererInfusion
                          infusion={spell}
                          key={index}
                          onEdit={() =>
                            handleEditInfusionSpell(spell, mnemo.id, index)
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
                          onVehicleChange={(vehicleIndex, field, value) => {
                            if (field === "enabled") {
                              updateMnemoSpell(
                                mnemo.id,
                                index,
                                setNestedActivation(
                                  spell,
                                  vehicleIndex,
                                  "pilot-vehicle",
                                  value,
                                ),
                              );
                              return;
                            }
                            const updatedVehicles = [...spell.vehicles];
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
                          player={player}
                        />
                      )}
                      {spell.spellType === "magiseed" && (
                        <SpellMagiseed
                          magiseed={spell}
                          key={index}
                          onEdit={() =>
                            handleEditMagiseed(spell, mnemo.id, index)
                          }
                          onMagiseedChange={(newMagiseed, seedIndex) =>
                            updateMnemoSpell(mnemo.id, index, {
                              ...setNestedActivation(
                                spell,
                                seedIndex,
                                "magiseed",
                                Boolean(newMagiseed),
                              ),
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
                          key={`${mnemo.id}-cooking-${index}-${spell.spellName}-${JSON.stringify(spell.cookbook?.effects || [])}`}
                          onEdit={() =>
                            handleEditGourmet(spell, mnemo.id, index)
                          }
                          isEditMode={isEditMode}
                        />
                      )}
                      {spell.spellType === "invocation" && (
                        <SpellInvoker
                          invoker={spell}
                          key={`${mnemo.id}-invocation-${index}-${spell.spellName}-${JSON.stringify(spell.invocations)}-${JSON.stringify(spell.tracker?.activeWellsprings || [])}`}
                          onEdit={() =>
                            handleEditInvoker(spell, mnemo.id, index)
                          }
                          onWellspringToggle={(wellspringName) => {
                            const tracker = spell.tracker || {};
                            const currentWellsprings =
                              tracker.activeWellsprings || [];
                            const innerEnabled =
                              spell.innerWellspring ||
                              tracker.innerWellspring ||
                              false;
                            const chosen =
                              spell.chosenWellspring ||
                              tracker.chosenWellspring ||
                              "";
                            const alwaysActive =
                              spell.alwaysActiveWellsprings || [];
                            if (
                              (innerEnabled && chosen === wellspringName) ||
                              alwaysActive.includes(wellspringName)
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
                              tracker: {
                                ...tracker,
                                activeWellsprings: newWellsprings,
                              },
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
                </Box>
              );

              return (
                <CollapsibleSection
                  key={type}
                  title={label}
                  actions={mnemoHeaderActions}
                  forceExpanded={expandSignal}
                  defaultExpanded={defaultExpandAll}
                  headerColor={theme.palette.ternary.main}
                  sx={{ mb: 0, borderRadius: 0, boxShadow: "none" }}
                >
                  {mnemoContent}
                </CollapsibleSection>
              );
            });

            return (
              <React.Fragment key={mnemo.id}>
                <SectionCard
                  title={`${t("Spells")} - ${t(mnemo.class)} (${t("Mnemosphere")})`}
                >
                  {isEditMode && (
                    <Box sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
                      <Autocomplete
                        sx={{ flex: 1 }}
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
                            size="small"
                          />
                        )}
                      />
                      <Button
                        variant="contained"
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
                    </Box>
                  )}
                  <Box sx={{ px: 1.5, pb: 1.5 }}>
                    {mnemoSpellTypeSections}
                  </Box>
                </SectionCard>
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
      <SpellTinkererAlchemyModal
        open={isOpen("alchemy")}
        onClose={closeModal}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
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
            props: { player },
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
        player={player}
        setPlayer={setPlayer}
        spellType="gourmet"
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        title={spellBeingEdited?.spellName}
        sections={[
          {
            id: "cookbook",
            title: "Combinations",
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
            id: "shop",
            title: "Shop",
            component: GourmetCookingTab,
            props: { mode: "shop" },
            order: 2,
          },
          {
            id: "cooking",
            title: "gourmet_cooking",
            component: GourmetCookingTab,
            props: { mode: "cooking" },
            order: 3,
          },
          {
            id: "general",
            title: "gourmet_edit_cooking_button",
            component: GourmetGeneralSection,
            props: {},
            order: 4,
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
          {
            id: "custom",
            title: "Custom Wellsprings",
            component: InvokerCustomSection,
            props: {},
            order: 2,
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
