import React from "react";
import EditCompendiumModal from "./EditCompendiumModal";

const CompendiumHandler = ({ setNpc, typeName, open, onClose }) => {
  const handleSave = (selectedItem, selectedType) => {
    const kind = selectedItem.itemType || selectedType;
    setNpc((prevNpc) => {
      switch (kind) {
        case "spell":
          return {
            ...prevNpc,
            spells: [
              ...(prevNpc.spells || []),
              {
                itemType: "spell",
                name: selectedItem.name,
                accuracy: selectedItem.accuracy ?? {
                  attr1: selectedItem.attr1 || "insight",
                  attr2: selectedItem.attr2 || "will",
                  value: 0,
                  defense: "mdef",
                },
                isOffensive: !!selectedItem.isOffensive,
                damage: selectedItem.damage ?? { value: 0, type: "physical" },
                cost: selectedItem.cost ?? {
                  resource: "mp",
                  amount: 0,
                  perTarget: true,
                },
                maxTargets: selectedItem.maxTargets || 0,
                targetDescription: selectedItem.targetDescription ?? "",
                duration: selectedItem.duration,
                effect:
                  selectedItem.effect ||
                  selectedItem.special?.[0] ||
                  selectedItem.description ||
                  "",
              },
            ],
          };

        case "basic": {
          let range = "melee";
          if (selectedItem.ranged === true) {
            range = "ranged";
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
                accuracy: {
                  attr1: selectedItem.accuracy?.attr1 ?? "dexterity",
                  attr2: selectedItem.accuracy?.attr2 ?? "dexterity",
                  value: selectedItem.accuracy?.value ?? 0,
                  defense: selectedItem.accuracy?.defense ?? "def",
                },
                damage: {
                  value: selectedItem.damage?.value ?? 0,
                  type: selectedItem.damage?.type ?? "physical",
                  hrZero: selectedItem.damage?.hrZero === true,
                },
                effect: selectedItem.effect || selectedItem.special?.[0] || "",
              },
            ],
          };
        }

        case "special":
          return {
            ...prevNpc,
            special: [
              ...(prevNpc.special || []),
              {
                name: selectedItem.name,
                effect:
                  selectedItem.effect ||
                  selectedItem.description ||
                  selectedItem.special?.[0] ||
                  "",
                spCost: selectedItem.spCost ?? 1,
              },
            ],
          };

        case "actions":
          return {
            ...prevNpc,
            actions: [
              ...(prevNpc.actions || []),
              {
                name: selectedItem.name,
                effect:
                  selectedItem.effect ||
                  selectedItem.description ||
                  selectedItem.special?.[0] ||
                  "",
                spCost: selectedItem.spCost ?? 1,
              },
            ],
          };

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
