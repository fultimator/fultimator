import SpellDefaultModal from "../../../../player/spells/SpellDefaultModal";
import SpellArcanistModal from "../../../../player/spells/SpellArcanistModal";
import SpellEntropistGambleModal from "../../../../player/spells/SpellEntropistGambleModal";
import SpellTinkererAlchemyRankModal from "../../../../player/spells/SpellTinkererAlchemyRankModal";
import SpellTinkererAlchemyTargetModal from "../../../../player/spells/SpellTinkererAlchemyTargetModal";
import SpellTinkererAlchemyEffectsModal from "../../../../player/spells/SpellTinkererAlchemyEffectsModal";
import SpellTinkererInfusionModal from "../../../../player/spells/SpellTinkererInfusionModal";
import SpellTinkererMagitechRankModal from "../../../../player/spells/SpellTinkererMagitechRankModal";
import SpellSymbolistModal from "../../../../player/spells/SpellSymbolistModal";
import SpellDancerModal from "../../../../player/spells/SpellDancerModal";
import SpellGiftModal from "../../../../player/spells/SpellGiftModal";
import SpellMutantModal from "../../../../player/spells/SpellMutantModal";
import SpellPilotModal from "../../../../player/spells/SpellPilotModal";
import SpellMagiseedModal from "../../../../player/spells/SpellMagiseedModal";
import SpellGourmetModal from "../../../../player/spells/SpellGourmetModal";
import SpellInvokerModal from "../../../../player/spells/SpellInvokerModal";
import SpellDeckModal from "../../../../player/spells/SpellDeckModal";
import UnifiedSpellModal from "../../../../player/spells/modals/UnifiedSpellModal";
import GeneralSection from "../../../../player/spells/sections/GeneralSection";
import MagichantKeysContentSection from "../../../../player/spells/sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "../../../../player/spells/sections/MagichantTonesContentSection";

const MAGICHANT_SECTIONS = [
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
];

// Each entry: (modalName) -> { Component, buildProps(spell, spellIndex, handlers) }
const spellModalRegistry = {
  default: {
    Component: SpellDefaultModal,
    buildProps: (
      spell,
      spellIndex,
      { onSave, onDelete, onClose, isEditMode },
    ) => ({
      isEditMode,
      open: true,
      onClose,
      onSave,
      onDelete,
      spell: { ...spell, index: spellIndex },
    }),
  },
  arcanist: {
    Component: SpellArcanistModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      spell: { ...spell, index: spellIndex },
      isRework: spell.spellType === "arcanist-rework",
    }),
  },
  gamble: {
    Component: SpellEntropistGambleModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      gamble: { ...spell, index: spellIndex },
    }),
  },
  "tinkerer-alchemy": {
    Component: SpellTinkererAlchemyRankModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      alchemy: { ...spell, index: spellIndex },
    }),
  },
  alchemyTarget: {
    Component: SpellTinkererAlchemyTargetModal,
    buildProps: (spell, spellIndex, { onSave, onClose }) => ({
      open: true,
      onClose,
      onSave,
      alchemy: { ...spell, index: spellIndex },
    }),
  },
  alchemyEffects: {
    Component: SpellTinkererAlchemyEffectsModal,
    buildProps: (spell, spellIndex, { onSave, onClose }) => ({
      open: true,
      onClose,
      onSave,
      alchemy: { ...spell, index: spellIndex },
    }),
  },
  "tinkerer-infusion": {
    Component: SpellTinkererInfusionModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      infusion: { ...spell, index: spellIndex },
    }),
  },
  "tinkerer-magitech": {
    Component: SpellTinkererMagitechRankModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      magitech: { ...spell, index: spellIndex },
    }),
  },
  chanter: {
    Component: UnifiedSpellModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      spellType: "magichant",
      spell: { ...spell, index: spellIndex },
      initialSectionId: "general",
      sections: MAGICHANT_SECTIONS,
    }),
  },
  chantKey: {
    Component: UnifiedSpellModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      spellType: "magichant",
      spell: { ...spell, index: spellIndex },
      initialSectionId: "keys",
      sections: MAGICHANT_SECTIONS,
    }),
  },
  chantTone: {
    Component: UnifiedSpellModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      spellType: "magichant",
      spell: { ...spell, index: spellIndex },
      initialSectionId: "tones",
      sections: MAGICHANT_SECTIONS,
    }),
  },
  symbolist: {
    Component: SpellSymbolistModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      symbol: { ...spell, index: spellIndex },
    }),
  },
  dancer: {
    Component: SpellDancerModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      dance: { ...spell, index: spellIndex },
    }),
  },
  gift: {
    Component: SpellGiftModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      gift: { ...spell, index: spellIndex },
    }),
  },
  mutant: {
    Component: SpellMutantModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      mutant: { ...spell, index: spellIndex },
    }),
  },
  pilot: {
    Component: SpellPilotModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      pilot: { ...spell, index: spellIndex },
    }),
  },
  magiseed: {
    Component: SpellMagiseedModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      magiseed: { ...spell, index: spellIndex },
    }),
  },
  gourmet: {
    Component: SpellGourmetModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      spell: { ...spell, index: spellIndex },
    }),
  },
  invoker: {
    Component: SpellInvokerModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      spell: { ...spell, index: spellIndex },
    }),
  },
  deck: {
    Component: SpellDeckModal,
    buildProps: (spell, spellIndex, { onSave, onDelete, onClose }) => ({
      open: true,
      onClose,
      onSave,
      onDelete,
      deck: { ...spell, index: spellIndex },
    }),
  },
};

// Maps a spell's spellType to its primary modal name
export function spellTypeToModalName(spellType) {
  if (spellType === "arcanist" || spellType === "arcanist-rework")
    return "arcanist";
  if (spellType === "gamble") return "gamble";
  if (spellType === "magichant") return "chanter";
  if (spellType === "symbol") return "symbolist";
  if (spellType === "dance") return "dancer";
  if (spellType === "gift") return "gift";
  if (spellType === "therioform") return "mutant";
  if (spellType === "pilot-vehicle") return "pilot";
  if (spellType === "magiseed") return "magiseed";
  if (spellType === "cooking") return "gourmet";
  if (spellType === "invocation") return "invoker";
  if (spellType?.startsWith("tinkerer-alchemy")) return "tinkerer-alchemy";
  if (spellType?.startsWith("tinkerer-infusion")) return "tinkerer-infusion";
  if (spellType?.startsWith("tinkerer-magitech")) return "tinkerer-magitech";
  if (spellType === "deck") return "deck";
  return "default";
}

export default spellModalRegistry;
