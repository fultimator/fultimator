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
    buildProps: (spell, { onEdit, onEditSubModal, isEditMode }) => ({
      magichant: spell,
      isEditMode,
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
    buildProps: (spell, { onEdit, isEditMode }) => ({
      arcana: spell,
      isEditMode,
      rework: false,
      onEdit,
    }),
  },
  "arcanist-rework": {
    Component: SpellArcanist,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      arcana: spell,
      isEditMode,
      rework: true,
      onEdit,
    }),
  },
  "tinkerer-alchemy": {
    Component: SpellTinkererAlchemy,
    buildProps: (spell, { onEdit, onEditSubModal, isEditMode, speaker }) => ({
      alchemy: spell,
      isEditMode,
      speaker,
      onEditRank: onEdit,
      onEditTargets: () => onEditSubModal?.("alchemyTarget"),
      onEditEffects: () => onEditSubModal?.("alchemyEffects"),
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
    buildProps: (spell, { onEdit, isEditMode }) => ({
      spell,
      isEditMode,
      onEdit,
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
