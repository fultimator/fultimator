import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Add,
  Search,
  Casino,
  Message,
  MusicNote,
  RadioButtonChecked,
  RadioButtonUnchecked,
  LocalFlorist,
} from "@mui/icons-material";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
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
import SpellDefault from "/src/components/shared/actors/pc/variants/compact/spells/SpellDefault";
import SpellArcanist from "/src/components/shared/actors/pc/variants/compact/spells/SpellArcanist";
import SpellEntropistGamble from "/src/components/shared/actors/pc/variants/compact/spells/SpellEntropistGamble";
import SpellInvoker from "/src/components/shared/actors/pc/variants/compact/spells/SpellInvoker";
import SpellGourmet from "/src/components/shared/actors/pc/variants/compact/spells/SpellGourmet";
import SpellMagiseed from "/src/components/shared/actors/pc/variants/compact/spells/SpellMagiseed";
import SpellGadget from "/src/components/shared/actors/pc/variants/compact/spells/SpellGadget";
import SpellMagichant from "/src/components/shared/actors/pc/variants/compact/spells/SpellMagichant";
import ChanterVerseDialog from "/src/components/shared/actors/pc/spells/ChanterVerseDialog";
import GourmetStartCookingDialog from "/src/components/shared/actors/pc/spells/GourmetStartCookingDialog";
import SpellSymbol from "/src/components/shared/actors/pc/variants/compact/spells/SpellSymbol";
import SpellDance from "/src/components/shared/actors/pc/variants/compact/spells/SpellDance";
import SpellGift from "/src/components/shared/actors/pc/variants/compact/spells/SpellGift";
import SpellTherioform from "/src/components/shared/actors/pc/variants/compact/spells/SpellTherioform";
import SpellDeck from "/src/components/shared/actors/pc/variants/compact/spells/SpellDeck";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { SharedPlayerSpellCard } from "/src/components/shared/items/spells/SharedSpellCards";
import {
  UnifiedSpellModal,
  DefaultSpellSection,
  ArcanistGeneralSection,
  GeneralSection,
  MagiseedGeneralSection,
  MagiseedContentSection,
  GiftContentSection,
  DancerContentSection,
  SymbolistContentSection,
  MagichantKeysContentSection,
  MagichantTonesContentSection,
  MutantContentSection,
  PilotGeneralSection,
  PilotContentSection,
  InvokerGeneralSection,
  InvokerContentSection,
  GourmetGeneralSection,
  GourmetContentSection,
  GourmetInventoryTab,
  GourmetCookingTab,
  GambleGeneralSection,
  SpellTinkererMagitechRankModal,
} from "/src/components/shared/actors/pc/spells";
import { getSlottedMnemospheres } from "/src/libs/player/mnemosphereClassUtils";
import { magiseeds } from "/src/libs/floralistMagiseedData";
import classList from "/src/libs/classes";
import { createBlankSpellForType } from "/src/libs/player/createBlankSpell";
import { availableModules } from "/src/libs/pilotVehicleData";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import PcCompactQuirk from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactQuirk";
import PcCompactCampActivities from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactCampActivities";
import PcCompactZeroPower from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactZeroPower";
import PcCompactOthers from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactOthers";
import PcCompactRituals from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactRituals";
import {
  hasActiveSpellInList,
  setNestedActivation,
  setSpellListActivation,
} from "/src/components/shared/actors/pc/spells/spellActivationPolicies";
import {
  ARCANA_POLICY_KEY,
  getArcanaStageDetails,
} from "/src/components/shared/actors/pc/spells/arcanaActions";
// Constants

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
// Helpers

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmed = query?.trim();
  if (!trimmed) return source;
  const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.split(new RegExp(`(${safe})`, "ig")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function collectStringValues(value, bag = []) {
  if (typeof value === "string") {
    bag.push(value);
    return bag;
  }
  if (Array.isArray(value)) {
    value.forEach((e) => collectStringValues(e, bag));
    return bag;
  }
  if (value && typeof value === "object")
    Object.values(value).forEach((e) => collectStringValues(e, bag));
  return bag;
}

function createLocalSpellId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSpellName(spell, t) {
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
}

function resolveGourmetEffectText(effect, t) {
  if (!effect?.effect || typeof effect.effect !== "string") return "";
  let text = effect.effect;
  const replacements = [
    {
      type: "statusEffect",
      placeholder: t("gourmet_delicacy_effect_choose_all_statuses"),
    },
    {
      type: "statusEffect",
      placeholder: t("gourmet_delicacy_effect_choose_some_statuses"),
    },
    {
      type: "damageType",
      placeholder: t("gourmet_delicacy_effect_choose_damage_type"),
    },
    {
      type: "attribute",
      placeholder: t("gourmet_delicacy_effect_choose_attributte"),
    },
  ];

  replacements.forEach(({ type, placeholder }) => {
    const value = effect.customChoices?.[type];
    if (!value) return;
    text = text.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      value,
    );
  });

  return text;
}

function renderSpellContent(spell, setPlayer, searchQuery, context = {}) {
  switch (spell.spellType) {
    case "default":
      return (
        <SpellDefault
          spellName={highlightMatch(spell.name, searchQuery)}
          mp={spell.cost?.amount}
          perTarget={spell.cost?.perTarget ?? true}
          maxTargets={spell.maxTargets}
          targetDescription={spell.targetDescription}
          duration={spell.duration}
          description={spell.description}
          isOffensive={spell.isOffensive}
          isMagisphere={spell.isMagisphere || false}
          attr1={spell.accuracy?.attr1}
          attr2={spell.accuracy?.attr2}
        />
      );
    case "gamble":
      return <SpellEntropistGamble gamble={spell} isEditMode={false} />;
    case "invocation":
      return (
        <SpellInvoker
          spell={spell}
          setPlayer={setPlayer}
          classIndex={context.classIndex}
          open={true}
        />
      );
    case "cooking":
      return <SpellGourmet spell={spell} open={true} />;
    case "magiseed":
      return (
        <SpellMagiseed
          spell={spell}
          setPlayer={setPlayer}
          classIndex={context.classIndex}
          spellIndex={context.spellIndex}
          open={true}
        />
      );
    case "magichant":
      return <SpellMagichant spell={spell} />;
    case "symbol":
      return <SpellSymbol spell={spell} />;
    case "dance":
      return <SpellDance spell={spell} />;
    case "gift":
      return (
        <SpellGift
          spell={spell}
          setPlayer={setPlayer}
          classIndex={context.classIndex}
          spellIndex={context.spellIndex}
          open={true}
        />
      );
    case "therioform":
      return <SpellTherioform spell={spell} />;
    case "pilot-vehicle":
      return null;
    case "deck":
      return <SpellDeck spell={spell} setPlayer={setPlayer} open={true} />;
    case "arcanist":
    case "arcanist-rework":
      return (
        <SpellArcanist
          arcana={spell}
          isEditMode={false}
          rework={spell.spellType === "arcanist-rework"}
          setPlayer={setPlayer}
          classIndex={context.classIndex}
          spellIndex={context.spellIndex}
        />
      );
    default:
      if (spell.spellType?.startsWith("tinkerer-"))
        return <SpellGadget spell={spell} />;
      return null;
  }
}

function hasInlineSpellContent(spell) {
  return (
    spell.spellType !== "pilot-vehicle" &&
    (spell.spellType === "default" ||
      spell.spellType === "gamble" ||
      spell.spellType === "invocation" ||
      spell.spellType === "cooking" ||
      spell.spellType === "magiseed" ||
      spell.spellType === "magichant" ||
      spell.spellType === "symbol" ||
      spell.spellType === "dance" ||
      spell.spellType === "gift" ||
      spell.spellType === "therioform" ||
      spell.spellType === "deck" ||
      spell.spellType === "arcanist" ||
      spell.spellType === "arcanist-rework" ||
      spell.spellType?.startsWith("tinkerer-"))
  );
}

function getSpellModalSections(spellType) {
  const map = {
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
        title: "Combinations",
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
        id: "shop",
        title: "Shop",
        component: GourmetCookingTab,
        props: { mode: "shop" },
      },
      {
        id: "cooking",
        title: "cooking",
        component: GourmetCookingTab,
        props: { mode: "cooking" },
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
  if (spellType?.startsWith("tinkerer-"))
    return [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
    ];
  return (
    map[spellType] || [
      {
        id: "general",
        title: "settings",
        component: GeneralSection,
        props: {},
      },
    ]
  );
}
// VehicleCard

function VehicleCard({
  vehicle,
  vehicleIndex,
  spellIndex,
  classIndex,
  searchQuery,
  setPlayer,
  player,
  theme,
  t,
}) {
  const name = vehicle.customName || t("Vehicle");
  const isActive = !!vehicle.enabled;

  const handleActivate = (e) => {
    e.stopPropagation();
    if (!setPlayer) return;
    setPlayer((prev) => {
      const classes = prev.classes ? [...prev.classes] : [];
      const cls = { ...classes[classIndex] };
      const spells = cls.spells ? [...cls.spells] : [];
      const spell = { ...spells[spellIndex] };
      spells[spellIndex] = setNestedActivation(
        spell,
        vehicleIndex,
        "pilot-vehicle",
        true,
      );
      cls.spells = spells;
      classes[classIndex] = cls;
      return { ...prev, classes };
    });
  };

  const handleModuleRoll = (e, mod) => {
    e.stopPropagation();
    if (!player) return;
    const attrCfg = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    };
    const attrDie = (key) => {
      const base = player.attributes?.[key]?.base ?? 8;
      const cfg = attrCfg[key] ?? [[], []];
      return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
    };
    const acc = mod.accuracy || {};
    const dmg = mod.damage || {};
    const attr1 = acc.attr1 || "dexterity";
    const attr2 = acc.attr2 || "might";
    const modName =
      mod.name === "pilot_custom_weapon" ? mod.customName : t(mod.name);
    const range =
      mod.range === "Ranged" || mod.range === "ranged" ? "ranged" : "melee";
    const effectModifiers = accuracyModifiersFromEffects(player, {
      range,
      category: mod.category,
    });
    const intent = prepareAccuracyCheck(
      {
        arg: modName,
        name: modName,
        attr1,
        attr2,
        accuracyBonus: acc.value ?? 0,
        baseDamage: dmg.value ?? 0,
        damageType: dmg.type ?? "physical",
        accuracyDefense: acc.defense ?? "def",
        category: mod.category,
        isWeaponModule: true,
        damageHrZero: dmg.hrZero === true,
        range,
        description: mod.description ? t(mod.description) : undefined,
      },
      effectModifiers,
    );
    const dieSizes = { primary: attrDie(attr1), secondary: attrDie(attr2) };
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(
      intent,
      rolls,
      dieSizes,
      player?.info?.name || "",
    );
    sendRollMessage(buildAccuracyCheckMessage(result));
  };

  const handleModuleSendToChat = (e, mod) => {
    e.stopPropagation();
    const CUSTOM = new Set([
      "pilot_custom_weapon",
      "pilot_custom_armor",
      "pilot_custom_support",
    ]);
    const modName = CUSTOM.has(mod.name ?? mod.key ?? "")
      ? mod.customName || t("pilot_custom")
      : t(mod.name ?? mod.key ?? "");
    const tags = [];
    if (mod.type === "pilot_module_armor") {
      if (mod.martial) tags.push(t("Martial"));
      if (mod.def != null) tags.push(`DEF ${mod.def >= 0 ? "+" : ""}${mod.def}`);
      if (mod.mdef != null)
        tags.push(`M.DEF ${mod.mdef >= 0 ? "+" : ""}${mod.mdef}`);
    }
    sendDisplayMessage("item", modName, {
      description: mod.description ? t(mod.description) : undefined,
      speaker: player?.info?.name || "",
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const slots = vehicle.slots ?? {
    main: null,
    off: null,
    armor: null,
    support: [],
  };
  const equippedKeys = new Set(
    [slots.main, slots.off, slots.armor, ...(slots.support ?? [])].filter(
      Boolean,
    ),
  );

  const allModuleTemplates = [
    ...(availableModules.weapon ?? []),
    ...(availableModules.armor ?? []),
    ...(availableModules.support ?? []),
  ];

  const modules = (vehicle.modules ?? [])
    .map((m) => {
      const k = m.key ?? m.name;
      if (!k || !equippedKeys.has(k)) return null;
      const template = allModuleTemplates.find((t) => t.name === k);
      return template ? { ...template, ...m } : m;
    })
    .filter(Boolean);

  const hasModules = modules.length > 0;

  return (
    <ItemRowCard
      compact
      paperSx={{
        borderColor: isActive ? theme.primary : undefined,
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: theme.primary },
      }}
      variant="outlined"
      label={
        <Typography
          noWrap
          sx={{
            fontFamily: "Antonio",
            fontWeight: 800,
            fontSize: "0.9rem",
            textTransform: "uppercase",
            lineHeight: 1.3,
          }}
        >
          {highlightMatch(name, searchQuery)}
        </Typography>
      }
      actions={
        <Tooltip title={isActive ? t("Active") : t("Activate")} arrow>
          <IconButton
            size="small"
            sx={{
              p: 0,
              width: 28,
              height: 28,
              color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
            }}
            onClick={handleActivate}
          >
            {isActive ? (
              <RadioButtonChecked sx={{ fontSize: "1rem" }} />
            ) : (
              <RadioButtonUnchecked sx={{ fontSize: "1rem" }} />
            )}
          </IconButton>
        </Tooltip>
      }
    >
      {hasModules && (
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            p: "4px",
            bgcolor: "rgba(0,0,0,0.03)",
          }}
        >
          {modules.map((m, i) => {
            const CUSTOM = new Set([
              "pilot_custom_weapon",
              "pilot_custom_armor",
              "pilot_custom_support",
            ]);
            const modName = CUSTOM.has(m.name ?? m.key ?? "")
              ? m.customName || t("pilot_custom")
              : t(m.name ?? m.key ?? "");
            const isWeapon = m.type === "pilot_module_weapon";
            return (
              <ItemRowCard
                key={i}
                compact
                variant="outlined"
                label={
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Antonio",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      lineHeight: 1.3,
                    }}
                  >
                    {modName}
                  </Typography>
                }
                actions={
                  isWeapon ? (
                    <Tooltip title={t("Roll")} arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleModuleRoll(e, m)}
                      >
                        <Casino />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("Send to Chat")} arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleModuleSendToChat(e, m)}
                      >
                        <Message />
                      </IconButton>
                    </Tooltip>
                  )
                }
              />
            );
          })}
        </Box>
      )}
    </ItemRowCard>
  );
}
// SpellCard

function SpellCard({
  spell,
  spellIndex,
  classIndex,
  searchQuery,
  isEditMode,
  setPlayer,
  onEdit,
  onRoll,
  theme,
  t,
}) {
  const [open, setOpen] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [verseOpen, setVerseOpen] = React.useState(false);
  const [cookingOpen, setCookingOpen] = React.useState(false);
  const spellName = getSpellName(spell, t);
  const isOffensive = spell.isOffensive === true;
  const isMagichant = spell.spellType === "magichant";
  const isCooking = spell.spellType === "cooking";
  const isArcana =
    spell.spellType === "arcanist" || spell.spellType === "arcanist-rework";
  const inlineContent = renderSpellContent(spell, setPlayer, searchQuery, {
    classIndex,
    spellIndex,
  });

  const sendArcanaStageToChat = (stage) => {
    const {
      label,
      tag,
      itemType = "spell",
      description,
      cost,
    } = getArcanaStageDetails(spell, stage, t);
    sendDisplayMessage(itemType, `${spellName} - ${label}`, {
      speaker: "",
      tags: [tag],
      description,
      cost,
    });
  };

  const handleActivateArcana = (event, active = true) => {
    event.stopPropagation();
    if (!setPlayer || !isArcana) return;
    if (active) sendArcanaStageToChat("merge");
    setPlayer((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((cls, clsIndex) =>
        clsIndex === classIndex
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
    }));
  };

  return (
    <>
      <ItemRowCard
        compact
        variant="outlined"
        onClick={inlineContent ? () => setOpen((v) => !v) : undefined}
        onCardClick={
          !inlineContent && !isEditMode ? () => setPreview(true) : undefined
        }
        paperSx={{
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
        label={
          <Typography
            noWrap
            sx={{
              fontFamily: "Antonio",
              fontWeight: 800,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
          >
            {highlightMatch(spellName, searchQuery)}
          </Typography>
        }
        actions={
          <>
            {isOffensive ? (
              <Tooltip title={t("Roll")} arrow>
                <IconButton size="small" onClick={() => onRoll(spell)}>
                  <Casino />
                </IconButton>
              </Tooltip>
            ) : isMagichant ? (
              <Tooltip title={t("Sing a Verse")} arrow>
                <IconButton size="small" onClick={() => setVerseOpen(true)}>
                  <MusicNote />
                </IconButton>
              </Tooltip>
            ) : isCooking ? (
              <Tooltip title={t("gourmet_cooking")} arrow>
                <IconButton size="small" onClick={() => setCookingOpen(true)}>
                  <OutdoorGrillIcon />
                </IconButton>
              </Tooltip>
            ) : spell.spellType === "magiseed" ? (
              <Tooltip title={t("magiseed_garden")} arrow>
                <IconButton
                  size="small"
                  onClick={() => {
                    const growthClock = spell.growthClock || 0;
                    const currentSeed = spell.currentMagiseed;
                    const seedName = currentSeed
                      ? currentSeed.customName || t(currentSeed.key ?? currentSeed.name)
                      : t("magiseed_no_magiseed");
                    let effectText = "";
                    if (currentSeed) {
                      const template = magiseeds.find(
                        (m) => m.name === (currentSeed.key ?? currentSeed.name),
                      );
                      const effectKey = Math.min(growthClock, 3);
                      const raw =
                        currentSeed.effects?.[effectKey] ??
                        template?.effects?.[effectKey];
                      if (raw) effectText = t(raw);
                    }
                    sendDisplayMessage("spell", seedName, {
                      speaker: "",
                      tags: [`${t("magiseed_growth_clock")}: ${growthClock}/4`],
                      description: effectText || undefined,
                    });
                  }}
                >
                  <LocalFlorist />
                </IconButton>
              </Tooltip>
            ) : isArcana ? (
              <Tooltip title={spell.enabled ? t("Active") : t("Activate")} arrow>
                <IconButton
                  size="small"
                  onClick={(event) =>
                    handleActivateArcana(event, !spell.enabled)
                  }
                  sx={{
                    color: spell.enabled ? theme.primary : "text.secondary",
                  }}
                >
                  {spell.enabled ? (
                    <RadioButtonChecked />
                  ) : (
                    <RadioButtonUnchecked />
                  )}
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={t("Send to Chat")} arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    sendDisplayMessage("spell", spellName, {
                      speaker: "",
                      description:
                        spell.description || spell.spellName || undefined,
                    })
                  }
                >
                <Message />
              </IconButton>
            </Tooltip>
            )}
            {isCooking && isEditMode && (
              <Tooltip title={t("Edit")} arrow>
                <IconButton
                  size="small"
                  onClick={() => onEdit(spell, spellIndex, classIndex)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            {!isCooking && isEditMode && (
              <Tooltip title={t("Edit")} arrow>
                <IconButton
                  size="small"
                  onClick={() => onEdit(spell, spellIndex, classIndex)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
          </>
        }
      >
        {inlineContent && open && (
          <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            {inlineContent}
          </Box>
        )}
      </ItemRowCard>
      {!inlineContent && (
        <Dialog
          open={preview}
          onClose={() => setPreview(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent sx={{ p: 0 }}>
            <SharedPlayerSpellCard item={spell} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreview(false)} variant="contained">
              {t("Close")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {isMagichant && (
        <ChanterVerseDialog
          open={verseOpen}
          onClose={() => setVerseOpen(false)}
          magichant={spell}
          speaker=""
          t={t}
        />
      )}
      {isCooking && (
        <GourmetStartCookingDialog
          open={cookingOpen}
          onClose={() => setCookingOpen(false)}
          spell={spell}
          resolveEffectText={(effect) => resolveGourmetEffectText(effect, t)}
          onRegisterRecipes={(recipes) => {
            if (!setPlayer) return;
            setPlayer((prev) => ({
              ...prev,
              classes: (prev.classes || []).map((cls, clsIndex) => {
                if (clsIndex !== classIndex) return cls;
                return {
                  ...cls,
                  spells: (cls.spells || []).map((entry, entryIndex) => {
                    if (entryIndex !== spellIndex) return entry;
                    const cookbook = entry.cookbook || {};
                    return {
                      ...entry,
                      cookbook: {
                        ...cookbook,
                        effects: [...(cookbook.effects || []), ...recipes],
                      },
                    };
                  }),
                };
              }),
            }));
          }}
        />
      )}
    </>
  );
}
// ClassSpellSection

function ClassSpellSection({
  cls,
  classIndex,
  hasSpellTypes,
  isEditMode,
  searchQuery,
  setPlayer,
  player,
  onEdit,
  onRoll,
  onOpenAddMenu,
  onOpenImportModal,
  theme,
  t,
}) {
  const spells = (cls.spells || [])
    .map((s, i) => ({ ...s, _idx: i }))
    .filter((s) => s.showInPlayerSheet || s.showInPlayerSheet === undefined);

  const pilotSpell = spells.find((s) => s.spellType === "pilot-vehicle");

  const filtered = searchQuery
    ? spells.filter((s) => {
        const raw = collectStringValues(s, []).join(" ").toLowerCase();
        return raw.includes(searchQuery.toLowerCase());
      })
    : spells;

  if (searchQuery && filtered.length === 0) return null;
  if (!hasSpellTypes && spells.length === 0) return null;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "4px", mb: "4px" }}
    >
      {isEditMode && (
        <CompactSectionHeader title={`${t("Spells")} - ${t(cls.name)}`}>
          <Box sx={{ display: "flex", gap: 0.25 }}>
            <Tooltip title={t("Add New Spell")}>
              <IconButton
                size="small"
                sx={{ p: "2px", color: "#fff" }}
                onClick={(e) => onOpenAddMenu(e, classIndex)}
              >
                <Add sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Search Compendium")}>
              <IconButton
                size="small"
                sx={{ p: "2px", color: "#fff" }}
                onClick={() => onOpenImportModal(classIndex)}
              >
                <Search sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
            {pilotSpell && (
              <Tooltip title={t("Edit")}>
                <IconButton
                  size="small"
                  sx={{ p: "2px", color: "#fff" }}
                  onClick={() =>
                    onEdit(pilotSpell, pilotSpell._idx, classIndex)
                  }
                >
                  <Edit sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CompactSectionHeader>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "4px",
        }}
      >
        {filtered.flatMap((spell) => {
          const hasInline = hasInlineSpellContent(spell);
          if (spell.spellType === "pilot-vehicle") {
            const vehicles = spell.vehicles ?? [];
            if (vehicles.length === 0)
              return [
                <Box
                  key={`${classIndex}-${spell._idx}-empty`}
                  sx={{
                    gridColumn: "1 / -1",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: `${theme.panelRadius}px`,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "text.secondary",
                      fontStyle: "italic",
                    }}
                  >
                    {t("No vehicles")}
                  </Typography>
                </Box>,
              ];
            return vehicles.map((vehicle, vi) => (
              <VehicleCard
                key={`${classIndex}-${spell._idx}-v${vi}`}
                vehicle={vehicle}
                vehicleIndex={vi}
                spellIndex={spell._idx}
                classIndex={classIndex}
                searchQuery={searchQuery}
                setPlayer={setPlayer}
                player={player}
                theme={theme}
                t={t}
              />
            ));
          }
          return [
            <Box
              key={`${classIndex}-${spell._idx}`}
              sx={
                hasInline &&
                spell.spellType !== "arcanist" &&
                spell.spellType !== "arcanist-rework"
                  ? { gridColumn: "1 / -1" }
                  : undefined
              }
            >
              <SpellCard
                spell={spell}
                spellIndex={spell._idx}
                classIndex={classIndex}
                searchQuery={searchQuery}
                isEditMode={isEditMode}
                setPlayer={setPlayer}
                onEdit={onEdit}
                onRoll={onRoll}
                theme={theme}
                t={t}
              />
            </Box>,
          ];
        })}
      </Box>
    </Box>
  );
}
// MnemoSpellSection

function MnemoSpellSection({
  spells,
  isEditMode,
  searchQuery,
  setPlayer,
  onEdit,
  onRoll,
  onOpenAddMenu,
  onOpenImportMenu,
  activeMnemospheres,
  theme,
  t,
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  if (spells.length === 0 && !isEditMode) return null;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader
        title={t("Mnemosphere Spells")}
        onToggle={() => setCollapsed((v) => !v)}
        isCollapsed={collapsed}
      >
        {isEditMode && (
          <>
            <Tooltip title={t("Add New Spell")}>
              <span>
                <IconButton
                  size="small"
                  sx={{ p: "2px", color: "#fff" }}
                  disabled={activeMnemospheres.length === 0}
                  onClick={onOpenAddMenu}
                >
                  <Add sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t("Search Compendium")}>
              <span>
                <IconButton
                  size="small"
                  sx={{ p: "2px", color: "#fff" }}
                  disabled={activeMnemospheres.length === 0}
                  onClick={onOpenImportMenu}
                >
                  <Search sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </CompactSectionHeader>

      {!collapsed && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: "4px",
            p: "4px",
          }}
        >
          {spells.map((spell) => (
            <MnemoSpellCard
              key={spell.id}
              spell={spell}
              searchQuery={searchQuery}
              isEditMode={isEditMode}
              setPlayer={setPlayer}
              onEdit={onEdit}
              onRoll={onRoll}
              theme={theme}
              t={t}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

function MnemoSpellCard({
  spell,
  searchQuery,
  isEditMode,
  setPlayer,
  onEdit,
  onRoll,
  theme,
  t,
}) {
  const [preview, setPreview] = React.useState(false);
  const isOffensive = spell.isOffensive === true;
  const isArcana =
    spell.spellType === "arcanist" || spell.spellType === "arcanist-rework";

  const sendArcanaStageToChat = (stage) => {
    const {
      label,
      tag,
      itemType = "spell",
      description,
      cost,
    } = getArcanaStageDetails(spell, stage, t);
    sendDisplayMessage(itemType, `${spell.name} - ${label}`, {
      speaker: "",
      tags: [tag],
      description,
      cost,
    });
  };

  const handleActivateArcana = (event, active = true) => {
    event.stopPropagation();
    if (!setPlayer || !isArcana) return;
    if (active) sendArcanaStageToChat("merge");
    setPlayer((prev) => {
      const eq0 = prev?.equipment?.[0] ?? {};
      const mnemospheres = (eq0.mnemospheres ?? []).map((mnemo) => {
        if (mnemo.id !== spell.mnemoId) return mnemo;
        const spells = mnemo.spells ?? [];
        const byId =
          spell.sourceSpellId != null
            ? spells.findIndex(
                (s) =>
                  (s?._compactId ?? s?.id ?? s?._id ?? null) ===
                  spell.sourceSpellId,
              )
            : -1;
        const spellIndex = byId >= 0 ? byId : spell.spellIndex;
        return {
          ...mnemo,
          spells: setSpellListActivation(
            spells,
            spellIndex,
            ARCANA_POLICY_KEY,
            active,
          ),
        };
      });
      const nextEq0 = { ...eq0, mnemospheres };
      return {
        ...prev,
        equipment: prev?.equipment ? [nextEq0, ...prev.equipment.slice(1)] : [nextEq0],
      };
    });
  };

  return (
    <>
      <ItemRowCard
        compact
        variant="outlined"
        onCardClick={!isEditMode ? () => setPreview(true) : undefined}
        paperSx={{
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
        label={
          <Typography
            noWrap
            sx={{
              fontFamily: "Antonio",
              fontWeight: 800,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
          >
            {highlightMatch(spell.name, searchQuery)}
          </Typography>
        }
        subtitle={
          spell.className ? (
            <Typography
              noWrap
              sx={{
                fontSize: "0.68rem",
                color: "text.secondary",
                lineHeight: 1.2,
              }}
            >
              {t(spell.className)}
            </Typography>
          ) : undefined
        }
        actions={
          <>
            {isOffensive && (
              <Tooltip title={t("Roll")} arrow>
                <IconButton size="small" onClick={() => onRoll(spell)}>
                  <Casino />
                </IconButton>
              </Tooltip>
            )}
            {isArcana && (
              <Tooltip title={spell.enabled ? t("Active") : t("Activate")} arrow>
                <IconButton
                  size="small"
                  onClick={(event) =>
                    handleActivateArcana(event, !spell.enabled)
                  }
                  sx={{
                    color: spell.enabled ? theme.primary : "text.secondary",
                  }}
                >
                  {spell.enabled ? (
                    <RadioButtonChecked />
                  ) : (
                    <RadioButtonUnchecked />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && (
              <Tooltip title={t("Edit")} arrow>
                <IconButton size="small" onClick={() => onEdit(spell)}>
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
          </>
        }
      />
      <Dialog
        open={preview}
        onClose={() => setPreview(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 0 }}>
          <SharedPlayerSpellCard item={spell} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(false)} variant="contained">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
// Main export

export default function FeatureTab({
  player,
  setPlayer,
  isEditMode = false,
  searchQuery = "",
  optionalRules = {},
  clockSections,
  setClockSections,
  clockState,
  setClockState,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Spell edit state
  const [editingSpell, setEditingSpell] = React.useState(null);
  const [, setEditingSpellIndex] = React.useState(null);
  const [editingSpellClassIndex, setEditingSpellClassIndex] =
    React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [magitechModalOpen, setMagitechModalOpen] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [importTargetClassIndex, setImportTargetClassIndex] =
    React.useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = React.useState(null);
  const [addMenuClassIndex, setAddMenuClassIndex] = React.useState(null);

  // Mnemosphere spell state
  const [mnemoAddMenuAnchor, setMnemoAddMenuAnchor] = React.useState(null);
  const [mnemoImportMenuAnchor, setMnemoImportMenuAnchor] =
    React.useState(null);
  const [mnemoImportModalOpen, setMnemoImportModalOpen] =
    React.useState(false);
  const [importTargetMnemoId, setImportTargetMnemoId] = React.useState(null);
  const [mnemoSpellModalOpen, setMnemoSpellModalOpen] =
    React.useState(false);
  const [editingMnemoSpell, setEditingMnemoSpell] = React.useState(null);

  // ---- spell roll ----
  const getAttrDie = (attr) => {
    const keyMap = {
      dex: "dexterity",
      ins: "insight",
      mig: "might",
      wlp: "willpower",
    };
    const full = keyMap[attr] ?? attr;
    const cfgMap = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    };
    const [neg, pos] = cfgMap[full] ?? [[], []];
    return calculateAttribute(
      player,
      player?.attributes?.[full]?.base ?? 8,
      neg,
      pos,
      6,
      12,
    );
  };

  const handleRollSpell = (spell) => {
    if (!spell.isOffensive) return;
    const acc = spell.accuracy ?? {};
    const dmg = spell.damage ?? {};
    const attr1 = acc.attr1 ?? "ins";
    const attr2 = acc.attr2 ?? "wlp";
    const damageType = dmg.type ?? "physical";
    const magicModifiers = player
      ? accuracyModifiersFromEffects(player, { checkType: "magic" })
      : [];
    const damageOutgoingBonus = player
      ? outgoingDamageBonusFromEffects(player, { range: "spell", damageType })
      : 0;
    const intent = prepareMagicCheck(
      {
        arg: spell.name || "",
        name: spell.name || "",
        attr1,
        attr2,
        accuracyBonus: acc.value ?? 0,
        baseDamage: dmg.value ?? 0,
        damageType,
        accuracyDefense: acc.defense ?? "mdef",
        damageHrZero: dmg.hrZero === true,
        spellType: spell.spellType,
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

  // ---- add/edit spell helpers ----
  const getClassSpellTypes = (cls) => {
    const direct = Array.isArray(cls?.benefits?.spellClasses)
      ? cls.benefits.spellClasses
      : [];
    if (direct.length > 0) return direct;
    const base = classList.find((bc) => bc.name === cls?.name);
    return Array.isArray(base?.benefits?.spellClasses)
      ? base.benefits.spellClasses
      : [];
  };

  const canAddSpellTypeToClass = (cls, spellType) => {
    if (!spellType) return false;
    if (!SINGLE_INSTANCE_SPELL_TYPES.has(spellType)) return true;
    return !(cls.spells || []).some((s) => s.spellType === spellType);
  };

  const getSpellTypeDisplayName = (spellType) => {
    const names = {
      default: t("Spell"),
      arcanist: t("Arcanist"),
      "arcanist-rework": t("Arcanist-Rework"),
      "pilot-vehicle": t("Pilot Vehicle"),
    };
    return names[spellType] ?? t(spellType);
  };

  const addSubItemToSingletonSpell = (classIndex, spellType, subType) => {
    const cls = player.classes?.[classIndex];
    if (!cls) return;
    const spellIndex = (cls.spells || []).findIndex(
      (s) => s.spellType === spellType,
    );
    if (spellIndex < 0) return;
    const addByType = {
      magichant: (spell) =>
        subType === "key"
          ? {
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
            }
          : {
              ...spell,
              tones: [
                ...(spell.tones || []),
                { name: "magichant_custom_name", effect: "", customName: "" },
              ],
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
          { name: "symbol_custom_name", effect: "", customName: "" },
        ],
      }),
      dance: (spell) => ({
        ...spell,
        dances: [
          ...(spell.dances || []),
          { name: "dance_custom_name", effect: "", duration: "", customName: "" },
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
            name: "mutant_therioform_custom_name",
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
    setPlayer((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((c, idx) => {
        if (idx !== classIndex) return c;
        const spells = [...(c.spells || [])];
        spells[spellIndex] = updater(spells[spellIndex]);
        return { ...c, spells };
      }),
    }));
  };

  const getAddActionsForClass = (cls, classIndex) => {
    const spellTypes = getClassSpellTypes(cls);
    const actions = [];
    spellTypes.forEach((spellType) => {
      const existingIndex = (cls.spells || []).findIndex(
        (s) => s.spellType === spellType,
      );
      const hasExisting = existingIndex >= 0;
      if (!hasExisting || !SINGLE_INSTANCE_SPELL_TYPES.has(spellType)) {
        actions.push({
          id: `new-${spellType}`,
          label: `${t("Add")} ${getSpellTypeDisplayName(spellType)}`,
          onClick: () => {
            const baseSpell = createBlankSpellForType(spellType);
            const newSpell =
              spellType === "arcanist" || spellType === "arcanist-rework"
                ? {
                    ...baseSpell,
                    enabled: !hasActiveSpellInList(
                      cls.spells || [],
                      ARCANA_POLICY_KEY,
                    ),
                  }
                : baseSpell;
            const updated = [...player.classes];
            updated[classIndex].spells.push(newSpell);
            setPlayer({ ...player, classes: updated });
          },
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

  const normalizeImportedSpell = (spell) => {
    if (!spell || typeof spell !== "object") return null;
    if (spell.spellType === "default")
      return {
        spellType: spell.spellType,
        name: t(spell.name),
        cost: spell.cost ?? { resource: "mp", amount: 0, perTarget: true },
        maxTargets: spell.maxTargets,
        targetDescription: t(spell.targetDescription),
        duration: t(spell.duration),
        description: t(spell.description),
        isOffensive: spell.isOffensive,
        accuracy: spell.accuracy,
        isMagisphere: spell.isMagisphere || false,
        showInPlayerSheet: true,
      };
    if (spell.spellType === "gamble")
      return {
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
      };
    if (spell.spellType === "arcanist")
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
        enabled: false,
        showInPlayerSheet: true,
      };
    if (spell.spellType === "arcanist-rework")
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
        enabled: false,
        showInPlayerSheet: true,
      };
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
    if (!classRef || !canAddSpellTypeToClass(classRef, item?.spellType)) return;
    const imported = normalizeImportedSpell(item);
    if (!imported) return;
    const finalImported =
      imported.spellType === "arcanist" ||
      imported.spellType === "arcanist-rework"
        ? {
            ...imported,
            enabled: !hasActiveSpellInList(
              classRef.spells || [],
              ARCANA_POLICY_KEY,
            ),
          }
        : imported;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === importTargetClassIndex
          ? { ...cls, spells: [...(cls.spells || []), finalImported] }
          : cls,
      ),
    }));
  };

  // ---- mnemosphere spell helpers ----
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;
  const activeMnemospheres = isTechnospheres
    ? getSlottedMnemospheres(player)
    : [];

  const createBlankMnemoSpell = () => ({
    _compactId: createLocalSpellId(),
    spellType: "default",
    name: t("New Spell"),
    cost: { resource: "mp", amount: 0, perTarget: true },
    maxTargets: 0,
    targetDescription: "",
    duration: "",
    description: "",
    isOffensive: false,
    attr1: "dexterity",
    attr2: "dexterity",
    showInPlayerSheet: true,
  });

  const addSpellToMnemo = (mnemoId, spell) => {
    if (!mnemoId || !spell) return;
    setPlayer((prev) => {
      const eq0 = {
        ...(prev?.equipment?.[0] ?? {}),
        mnemospheres: (prev?.equipment?.[0]?.mnemospheres ?? []).map((m) => {
          if (m.id !== mnemoId) return m;
          const finalSpell =
            spell.spellType === "arcanist" ||
            spell.spellType === "arcanist-rework"
              ? {
                  ...spell,
                  enabled: !hasActiveSpellInList(
                    m.spells ?? [],
                    ARCANA_POLICY_KEY,
                  ),
                }
              : spell;
          return { ...m, spells: [...(m.spells ?? []), finalSpell] };
        }),
      };
      return {
        ...prev,
        equipment: prev?.equipment ? [eq0, ...prev.equipment.slice(1)] : [eq0],
      };
    });
  };

  const updateMnemoSpell = (
    mnemoId,
    spellIndex,
    updater,
    sourceSpellId = null,
  ) => {
    if (!mnemoId || spellIndex == null) return;
    setPlayer((prev) => {
      const eq0 = {
        ...(prev?.equipment?.[0] ?? {}),
        mnemospheres: (prev?.equipment?.[0]?.mnemospheres ?? []).map((m) => {
          if (m.id !== mnemoId) return m;
          const spells = [...(m.spells ?? [])];
          const byId =
            sourceSpellId != null
              ? spells.findIndex(
                  (s) =>
                    (s?._compactId ?? s?.id ?? s?._id ?? null) ===
                    sourceSpellId,
                )
              : -1;
          const idx = byId >= 0 ? byId : spellIndex;
          if (!spells[idx]) return m;
          spells[idx] = updater(spells[idx]);
          return { ...m, spells };
        }),
      };
      return {
        ...prev,
        equipment: prev?.equipment ? [eq0, ...prev.equipment.slice(1)] : [eq0],
      };
    });
  };

  const handleOpenEditMnemoSpell = (spell) => {
    setEditingMnemoSpell(spell);
    setMnemoSpellModalOpen(true);
  };
  const handleCloseEditMnemoSpell = () => {
    setMnemoSpellModalOpen(false);
    setEditingMnemoSpell(null);
  };

  const handleSaveEditMnemoSpell = (arg1, arg2) => {
    if (!editingMnemoSpell) return;
    const updatedSpell = arg2 ?? arg1;
    if (!updatedSpell || typeof updatedSpell !== "object") return;
    updateMnemoSpell(
      editingMnemoSpell.mnemoId,
      editingMnemoSpell.spellIndex,
      (curr) => ({
        ...updatedSpell,
        _compactId:
          updatedSpell._compactId ??
          curr?._compactId ??
          curr?.id ??
          curr?._id ??
          createLocalSpellId(),
      }),
      editingMnemoSpell.sourceSpellId ?? null,
    );
    handleCloseEditMnemoSpell();
  };

  const handleDeleteMnemoSpell = () => {
    if (!editingMnemoSpell) return;
    setPlayer((prev) => {
      const eq0 = {
        ...(prev?.equipment?.[0] ?? {}),
        mnemospheres: (prev?.equipment?.[0]?.mnemospheres ?? []).map((m) => {
          if (m.id !== editingMnemoSpell.mnemoId) return m;
          const spells = [...(m.spells ?? [])];
          const byId =
            editingMnemoSpell.sourceSpellId != null
              ? spells.findIndex(
                  (s) =>
                    (s?._compactId ?? s?.id ?? s?._id ?? null) ===
                    editingMnemoSpell.sourceSpellId,
                )
              : -1;
          const idx = byId >= 0 ? byId : editingMnemoSpell.spellIndex;
          if (idx >= 0 && idx < spells.length) spells.splice(idx, 1);
          return { ...m, spells };
        }),
      };
      return {
        ...prev,
        equipment: prev?.equipment ? [eq0, ...prev.equipment.slice(1)] : [eq0],
      };
    });
    handleCloseEditMnemoSpell();
  };

  const normalizeImportedMnemoSpell = (item) => {
    const normalized = normalizeImportedSpell(item);
    if (!normalized) return null;
    return {
      _compactId:
        normalized._compactId ?? normalized.id ?? createLocalSpellId(),
      ...normalized,
    };
  };

  const handleImportMnemoSpellFromCompendium = (item, selectedType) => {
    if (selectedType !== "player-spells" || !importTargetMnemoId) return;
    const spell = normalizeImportedMnemoSpell(item);
    if (!spell) return;
    addSpellToMnemo(importTargetMnemoId, spell);
    setMnemoImportModalOpen(false);
    setImportTargetMnemoId(null);
  };

  const allMnemoSpells = isTechnospheres
    ? activeMnemospheres
        .flatMap((mnemo) =>
          (mnemo.spells ?? [])
            .map((spell, index) =>
              spell
                ? {
                    id: `${mnemo.id}-${index}`,
                    mnemoId: mnemo.id,
                    spellIndex: index,
                    sourceSpellId:
                      spell._compactId ?? spell.id ?? spell._id ?? null,
                    spellType: spell.spellType ?? "default",
                    showInPlayerSheet: spell.showInPlayerSheet,
                    ...spell,
                    name: spell.name ?? spell.spellName ?? "",
                    description: spell.description ?? "",
                    className: mnemo.class,
                  }
                : null,
            )
            .filter(Boolean),
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const filteredMnemoSpells = searchQuery
    ? allMnemoSpells.filter((s) =>
        collectStringValues(s, [])
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : allMnemoSpells;

  const visibleSpellClasses = (player.classes ?? [])
    .map((cls, i) => ({ cls, originalClassIndex: i }))
    .filter(({ cls }) => !/\(Mnemosphere\)\s*$/i.test(cls?.name ?? ""));

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Optional rule panels */}
      {optionalRules.quirks && (
        <PcCompactQuirk
          player={player}
          setPlayer={setPlayer}
          searchQuery={searchQuery}
          compact
        />
      )}
      {optionalRules.campActivities && (
        <PcCompactCampActivities player={player} searchQuery={searchQuery} />
      )}
      {optionalRules.zeroPower && (
        <PcCompactZeroPower
          player={player}
          setPlayer={setPlayer}
          searchQuery={searchQuery}
          compact
        />
      )}
      <PcCompactOthers
        player={player}
        setPlayer={setPlayer}
        searchQuery={searchQuery}
        compact
      />
      <PcCompactRituals
        player={player}
        isCharacterSheet
        searchQuery={searchQuery}
        clockSections={clockSections}
        setClockSections={setClockSections}
        clockState={clockState}
        setClockState={setClockState}
      />

      {/* Spell sections per class */}
      {visibleSpellClasses.map(({ cls, originalClassIndex: classIndex }) => (
        <ClassSpellSection
          key={classIndex}
          cls={cls}
          classIndex={classIndex}
          hasSpellTypes={getClassSpellTypes(cls).length > 0}
          isEditMode={isEditMode}
          searchQuery={searchQuery}
          setPlayer={setPlayer}
          player={player}
          onEdit={handleEditSpell}
          onRoll={handleRollSpell}
          onOpenAddMenu={(e, ci) => {
            setAddMenuAnchor(e.currentTarget);
            setAddMenuClassIndex(ci);
          }}
          onOpenImportModal={(ci) => {
            setImportTargetClassIndex(ci);
            setImportModalOpen(true);
          }}
          theme={theme}
          t={t}
        />
      ))}

      {/* Mnemosphere spells */}
      {isTechnospheres && (
        <MnemoSpellSection
          spells={filteredMnemoSpells}
          isEditMode={isEditMode}
          searchQuery={searchQuery}
          setPlayer={setPlayer}
          onEdit={handleOpenEditMnemoSpell}
          onRoll={handleRollSpell}
          onOpenAddMenu={(e) => {
            setMnemoAddMenuAnchor(e.currentTarget);
          }}
          onOpenImportMenu={(e) => {
            setMnemoImportMenuAnchor(e.currentTarget);
          }}
          activeMnemospheres={activeMnemospheres}
          theme={theme}
          t={t}
        />
      )}

      {/* Add spell menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={() => {
          setAddMenuAnchor(null);
          setAddMenuClassIndex(null);
        }}
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
              setAddMenuAnchor(null);
              setAddMenuClassIndex(null);
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Mnemo add menu */}
      <Menu
        anchorEl={mnemoAddMenuAnchor}
        open={Boolean(mnemoAddMenuAnchor)}
        onClose={() => setMnemoAddMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {activeMnemospheres.map((mnemo) => (
          <MenuItem
            key={`mnemo-add-${mnemo.id}`}
            onClick={() => {
              addSpellToMnemo(mnemo.id, createBlankMnemoSpell());
              setMnemoAddMenuAnchor(null);
            }}
          >
            {t("Add to")} {t(mnemo.class)}
          </MenuItem>
        ))}
      </Menu>

      {/* Mnemo import menu */}
      <Menu
        anchorEl={mnemoImportMenuAnchor}
        open={Boolean(mnemoImportMenuAnchor)}
        onClose={() => setMnemoImportMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {activeMnemospheres.map((mnemo) => (
          <MenuItem
            key={`mnemo-import-${mnemo.id}`}
            onClick={() => {
              setImportTargetMnemoId(mnemo.id);
              setMnemoImportModalOpen(true);
              setMnemoImportMenuAnchor(null);
            }}
          >
            {t("Import to")} {t(mnemo.class)}
          </MenuItem>
        ))}
      </Menu>

      {/* Spell edit modals */}
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
        onClose={() => {
          setImportModalOpen(false);
          setImportTargetClassIndex(null);
        }}
        onAddItem={handleImportFromCompendium}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass={player.classes?.[importTargetClassIndex]?.name || ""}
        context="player"
      />
      <CompendiumViewerModal
        open={mnemoImportModalOpen}
        onClose={() => {
          setMnemoImportModalOpen(false);
          setImportTargetMnemoId(null);
        }}
        onAddItem={handleImportMnemoSpellFromCompendium}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        context="player"
      />
      {mnemoSpellModalOpen && editingMnemoSpell && (
        <UnifiedSpellModal
          open={mnemoSpellModalOpen}
          onClose={handleCloseEditMnemoSpell}
          onSave={handleSaveEditMnemoSpell}
          onDelete={handleDeleteMnemoSpell}
          spellType={editingMnemoSpell.spellType || "default"}
          spell={editingMnemoSpell}
          sections={getSpellModalSections(
            editingMnemoSpell.spellType || "default",
          )}
        />
      )}
    </Box>
  );
}
