import React from "react";
import EditCompendiumModal from "./EditCompendiumModal";

const CompendiumHandler = ({ setNpc, typeName, open, onClose }) => {
  const handleSave = (selectedItem) => {
    setNpc((prevNpc) => {
      switch (selectedItem.itemType) {
        case "spell":
          return {
            ...prevNpc,
            spells: [
              ...(prevNpc.spells || []),
              {
                itemType: "spell",
                name: selectedItem.name,
                attr1: selectedItem.attr1 || "dexterity",
                attr2: selectedItem.attr2 || "dexterity",
                type: selectedItem.type || "",
                damagetype: selectedItem.damagetype || "physical",
                mp: selectedItem.mp,
                maxTargets: selectedItem.maxTargets || 0,
                target: selectedItem.target,
                duration: selectedItem.duration,
                effect: selectedItem.effect,
                special: selectedItem.special || [],
              },
            ],
          };

        case "basic": {
          let range = "melee";
          if (selectedItem.ranged === true) {
            range = "distance";
          } else if (selectedItem.melee === true) {
            range = "melee";
          }

          return {
            ...prevNpc,
            attacks: [
              ...(prevNpc.attacks || []),
              {
                itemType: "basic",
                name: selectedItem.name,
                range: range,
                attr1: selectedItem.attr1 || "dexterity",
                attr2: selectedItem.attr2 || "dexterity",
                type: selectedItem.type,
                flathit: selectedItem.flathit,
                flatdmg: selectedItem.flatdmg,
                special: [],
              },
            ],
          };
        }

        default:
          return prevNpc;
      }
    });
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
