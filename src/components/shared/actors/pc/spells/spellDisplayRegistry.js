import SpellDefault from "../../pc-compact/spells/SpellDefault";
import SpellArcanist from "../../pc-compact/spells/SpellArcanist";
import SpellEntropistGamble from "../../pc-compact/spells/SpellEntropistGamble";
import { SpellTinkererAlchemy } from "/src/components/shared/actors/pc/spells";
import { SpellTinkererInfusion } from "/src/components/shared/actors/pc/spells";
import { SpellTinkererMagitech } from "/src/components/shared/actors/pc/spells";
import { SpellChanter } from "/src/components/shared/actors/pc/spells";
import SpellSymbolist from "../../pc-compact/spells/SpellSymbol";
import SpellDancer from "../../pc-compact/spells/SpellDance";
import SpellGift from "../../pc-compact/spells/SpellGift";
import { SpellMutant } from "/src/components/shared/actors/pc/spells";
import SpellPilot from "../../pc-compact/spells/SpellVehicle";
import SpellMagiseed from "../../pc-compact/spells/SpellMagiseed";
import SpellGourmet from "../../pc-compact/spells/SpellGourmet";
import SpellInvoker from "../../pc-compact/spells/SpellInvoker";
import SpellDeck from "../../pc-compact/spells/SpellDeck";

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
