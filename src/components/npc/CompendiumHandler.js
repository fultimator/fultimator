import React from 'react';
import EditCompendiumModal from './EditCompendiumModal';

const CompendiumHandler = ({ npc, setNpc, typeName, open, onClose }) => {
  const handleSave = (selectedItem) => {
    const newState = { ...npc };

    switch (selectedItem.itemType) {
      case 'spell':
        if (!newState.spells) {
          newState.spells = [];
        }
        newState.spells.push({
          itemType: 'spell',
          name: selectedItem.name,
          attr1: selectedItem.attr1 || 'dexterity',
          attr2: selectedItem.attr2 || 'dexterity',
          type: selectedItem.type || '',
          damagetype: selectedItem.damagetype || 'physical',
          mp: selectedItem.mp,
          maxTargets: selectedItem.maxTargets || 0,
          target: selectedItem.target,
          duration: selectedItem.duration,
          effect: selectedItem.effect,
          special: selectedItem.special || [],
        });
        break;

      case 'basic':
        if (!newState.attacks) {
          newState.attacks = [];
        }
        let range = 'melee';
        if (selectedItem.ranged === true) {
          range = 'distance';
        } else if (selectedItem.melee === true) {
          range = 'melee';
        }

        newState.attacks.push({
          itemType: 'basic',
          name: selectedItem.name,
          range: range,
          attr1: selectedItem.attr1 || 'dexterity',
          attr2: selectedItem.attr2 || 'dexterity',
          type: selectedItem.type,
          flathit: selectedItem.flathit,
          flatdmg: selectedItem.flatdmg,
          special: [],
        });
        break;

      default:
        break;
    }

    setNpc(newState);
    onClose();
  };

  return (
    <EditCompendiumModal
      open={open}
      onClose={onClose}
      typeName={typeName}
      onSave={handleSave}
    />
  );
};

export default CompendiumHandler;
