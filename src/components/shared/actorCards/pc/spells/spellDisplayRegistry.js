import SpellDefault from "../../../../player/spells/SpellDefault";
import SpellArcanist from "../../../../player/spells/SpellArcanist";
import SpellEntropistGamble from "../../../../player/spells/SpellEntropistGamble";
import SpellTinkererAlchemy from "../../../../player/spells/SpellTinkererAlchemy";
import SpellTinkererInfusion from "../../../../player/spells/SpellTinkererInfusion";
import SpellTinkererMagitech from "../../../../player/spells/SpellTinkererMagitech";
import SpellChanter from "../../../../player/spells/SpellChanter";
import SpellSymbolist from "../../../../player/spells/SpellSymbolist";
import SpellDancer from "../../../../player/spells/SpellDancer";
import SpellGift from "../../../../player/spells/SpellGift";
import SpellMutant from "../../../../player/spells/SpellMutant";
import SpellPilot from "../../../../player/spells/SpellPilot";
import SpellMagiseed from "../../../../player/spells/SpellMagiseed";
import SpellGourmet from "../../../../player/spells/SpellGourmet";
import SpellInvoker from "../../../../player/spells/SpellInvoker";
import SpellDeck from "../../../../player/spells/SpellDeck";

// Each entry: { Component, buildProps(spell, handlers) }
// handlers: { onEdit, onEditSubModal, isEditMode }
const spellDisplayRegistry = {
  default: {
    Component: SpellDefault,
    buildProps: (spell, { onEdit, isEditMode }) => ({
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
    }),
  },
  gift: {
    Component: SpellGift,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      gift: spell,
      isEditMode,
      onEdit,
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
    buildProps: (spell, { onEdit, isEditMode }) => ({
      invoker: spell,
      isEditMode,
      onEdit,
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
    buildProps: (spell, { onEdit, onEditSubModal, isEditMode }) => ({
      alchemy: spell,
      isEditMode,
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
    buildProps: (spell, { onEdit, isEditMode }) => ({
      magiseed: spell,
      isEditMode,
      onEdit,
    }),
  },
  "pilot-vehicle": {
    Component: SpellPilot,
    buildProps: (spell, { onEdit, isEditMode }) => ({
      pilot: spell,
      isEditMode,
      onEdit,
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
    buildProps: (spell, { onEdit, isEditMode }) => ({
      deck: spell,
      isEditMode,
      onEdit,
    }),
  },
};

export default spellDisplayRegistry;
