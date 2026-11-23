import {
  SpellDefault,
  SpellArcanist,
  SpellChanter,
  SpellDancer,
  SpellDeck,
  SpellEntropistGamble,
  SpellGift,
  SpellGourmet,
  SpellInvoker,
  SpellMagiseed,
  SpellMutant,
  SpellPilot,
  SpellSymbolist,
  SpellTinkererAlchemy,
  SpellTinkererInfusion,
  SpellTinkererMagitech,
} from "/src/components/shared/actors/pc/spells";
import {
  setNestedActivation,
  setSpellListActivation,
} from "/src/components/shared/actors/pc/spells/spellActivationPolicies";
import { ARCANA_POLICY_KEY } from "/src/components/shared/actors/pc/spells/arcanaActions";

// Each entry: { Component, buildProps(spell, handlers) }
// handlers: { onEdit, onEditSubModal, onSpellUpdate, isEditMode }
const spellDisplayRegistry = {
  default: {
    Component: SpellDefault,
    buildProps: (spell, { onEdit, onRoll, onChat, isEditMode }) => ({
      spellName: spell.name,
      mp: spell.cost?.amount,
      perTarget: spell.cost?.perTarget ?? true,
      maxTargets: spell.maxTargets,
      targetDescription: spell.targetDescription,
      duration: spell.duration,
      description: spell.description,
      isEditMode,
      isOffensive: spell.isOffensive,
      isMagisphere: spell.isMagisphere || false,
      attr1: spell.accuracy?.attr1,
      attr2: spell.accuracy?.attr2,
      showInPlayerSheet: spell.showInPlayerSheet,
      onEdit,
      onRoll,
      onChat,
    }),
  },
  gift: {
    Component: SpellGift,
    buildProps: (spell, { onEdit, onSpellUpdate, isEditMode }) => ({
      gift: spell,
      isEditMode,
      onEdit,
      onClockChange: onSpellUpdate
        ? (clock) => onSpellUpdate((s) => ({ ...s, clock }))
        : undefined,
    }),
  },
  dance: {
    Component: SpellDancer,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      dance: spell,
      isEditMode,
      onEdit,
    }),
  },
  therioform: {
    Component: SpellMutant,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      mutant: spell,
      isEditMode,
      onEdit,
    }),
  },
  magichant: {
    Component: SpellChanter,
    buildProps: (spell, { onEdit, onEditSubModal, isEditMode, speaker }) => ({
      magichant: spell,
      isEditMode,
      speaker,
      onEdit,
      onEditKeys: () => onEditSubModal?.("chantKey"),
      onEditTones: () => onEditSubModal?.("chantTone"),
    }),
  },
  symbol: {
    Component: SpellSymbolist,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      symbol: spell,
      isEditMode,
      onEdit,
    }),
  },
  invocation: {
    Component: SpellInvoker,
    buildProps: (spell, { onEdit, onRoll, onSpellUpdate, isEditMode }) => ({
      invoker: spell,
      isEditMode,
      onEdit,
      onRoll,
      onWellspringToggle: onSpellUpdate
        ? (key) =>
            onSpellUpdate((s) => {
              const tracker = s.tracker || {};
              const active = tracker.activeWellsprings || [];
              const next = active.includes(key)
                ? active.filter((k) => k !== key)
                : [...active, key];
              return { ...s, tracker: { ...tracker, activeWellsprings: next } };
            })
        : undefined,
    }),
  },
  arcanist: {
    Component: SpellArcanist,
    buildProps: (
      spell,
      { onEdit, onSpellListUpdate, spellIndex, isEditMode },
    ) => ({
      arcana: spell,
      isEditMode,
      rework: false,
      onEdit,
      alwaysExpanded: true,
      onActivate: onSpellListUpdate
        ? (active = true) =>
            onSpellListUpdate((spells) =>
              setSpellListActivation(
                spells,
                spellIndex,
                ARCANA_POLICY_KEY,
                active,
              ),
            )
        : undefined,
    }),
  },
  "arcanist-rework": {
    Component: SpellArcanist,
    buildProps: (
      spell,
      { onEdit, onSpellListUpdate, spellIndex, isEditMode },
    ) => ({
      arcana: spell,
      isEditMode,
      rework: true,
      onEdit,
      alwaysExpanded: true,
      onActivate: onSpellListUpdate
        ? (active = true) =>
            onSpellListUpdate((spells) =>
              setSpellListActivation(
                spells,
                spellIndex,
                ARCANA_POLICY_KEY,
                active,
              ),
            )
        : undefined,
    }),
  },
  "tinkerer-alchemy": {
    Component: SpellTinkererAlchemy,
    buildProps: (spell, { onEdit, isEditMode, speaker }) => ({
      alchemy: spell,
      isEditMode,
      speaker,
      onEditRank: onEdit,
      onEditTargets: onEdit,
      onEditEffects: onEdit,
    }),
  },
  "tinkerer-infusion": {
    Component: SpellTinkererInfusion,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      infusion: spell,
      isEditMode,
      onEdit,
    }),
  },
  "tinkerer-magitech": {
    Component: SpellTinkererMagitech,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      magitech: spell,
      isEditMode,
      onEdit,
    }),
  },
  cooking: {
    Component: SpellGourmet,
    buildProps: (spell, { onEdit, onSpellUpdate, isEditMode }) => ({
      spell,
      isEditMode,
      onEdit,
      onSpellUpdate,
    }),
  },
  magiseed: {
    Component: SpellMagiseed,
    buildProps: (spell, { onEdit, onRoll, onSpellUpdate, isEditMode }) => ({
      magiseed: spell,
      isEditMode,
      onEdit,
      onRoll,
      onGrowthClockChange: onSpellUpdate
        ? (growthClock) => onSpellUpdate((s) => ({ ...s, growthClock }))
        : undefined,
      onMagiseedChange: onSpellUpdate
        ? (nextSeed, seedIndex) =>
            onSpellUpdate((s) =>
              setNestedActivation(s, seedIndex, "magiseed", Boolean(nextSeed)),
            )
        : undefined,
    }),
  },
  "pilot-vehicle": {
    Component: SpellPilot,
    buildProps: (spell, { onEdit, onSpellUpdate, isEditMode }) => ({
      pilot: spell,
      isEditMode,
      onEdit,
      onVehicleChange: onSpellUpdate
        ? (idx, field, value) =>
            onSpellUpdate((s) => {
              if (field === "enabled" && value === true) {
                return setNestedActivation(s, idx, "pilot-vehicle", true);
              }
              const vehicles = (s.vehicles || []).map((v, i) =>
                i === idx ? { ...v, [field]: value } : v,
              );
              return { ...s, vehicles };
            })
        : undefined,
    }),
  },
  gamble: {
    Component: SpellEntropistGamble,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      gamble: spell,
      isEditMode,
      onEdit,
    }),
  },
  deck: {
    Component: SpellDeck,
    buildProps: (spell, { onEdit, onSpellUpdate, isEditMode }) => ({
      deck: spell,
      isEditMode,
      onEdit,
      onDeckUpdate: onSpellUpdate
        ? (updater) => onSpellUpdate(updater)
        : undefined,
    }),
  },
};

export default spellDisplayRegistry;
