import { useState } from "react";

/**
 * Manages the open/close state for the spell editing modals in EditPlayerSpells.
 *
 * Only one modal can be open at a time. Each modal is identified by a string key.
 *
 * @returns {{
 *   isOpen: (modalName: string) => boolean,
 *   openModal: (modalName: string, spell: object, spellClass: string, spellIndex: number) => void,
 *   closeModal: () => void,
 *   spellBeingEdited: object | null,
 *   editingSpellClass: string | null,
 *   editingSpellIndex: number | null,
 * }}
 */
export function useSpellModals() {
  const [currentModal, setCurrentModal] = useState(null);
  const [spellBeingEdited, setSpellBeingEdited] = useState(null);
  const [editingSpellClass, setEditingSpellClass] = useState(null);
  const [editingSpellIndex, setEditingSpellIndex] = useState(null);

  const isOpen = (modalName) => currentModal === modalName;

  const openModal = (modalName, spell, spellClass, spellIndex) => {
    setCurrentModal(modalName);
    // Unified spell modals use `spell.index` for save/delete actions.
    // Ensure the active list index is always available, even when the spell
    // object itself does not carry an `index` field.
    setSpellBeingEdited(
      spell && typeof spell === "object" ? { ...spell, index: spellIndex } : spell,
    );
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
  };

  const closeModal = () => {
    setCurrentModal(null);
    setSpellBeingEdited(null);
    setEditingSpellClass(null);
    setEditingSpellIndex(null);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    spellBeingEdited,
    editingSpellClass,
    editingSpellIndex,
  };
}
