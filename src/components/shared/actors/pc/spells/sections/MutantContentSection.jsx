import { useCallback, useState, useMemo } from "react";
import ContentSection from "/src/components/shared/actors/pc/spells/sections/ContentSection";
import MutantItem from "/src/components/shared/actors/pc/spells/sections/MutantItem";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { availableTherioforms } from "/src/libs/player/spellOptionData";

export default function MutantContentSection({ formState, setFormState, t }) {
  const currentTherioforms = useMemo(
    () => formState.therioforms || [],
    [formState.therioforms],
  );
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankTherioform = useCallback(() => {
    return {
      name: "mutant_therioform_custom_name",
      genoclepsis: "",
      description: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedNames = currentTherioforms
      .map((t) => t.name)
      .filter(
        (name) =>
          name !== "mutant_therioform_custom" &&
          name !== "mutant_therioform_custom_name",
      );
    return availableTherioforms.filter(
      (preset) =>
        preset.name !== "mutant_therioform_custom" &&
        preset.name !== "mutant_therioform_custom_name" &&
        !addedNames.includes(preset.name),
    );
  }, [currentTherioforms]);

  const handleAddPreset = useCallback((presetName) => {
    return (setFormState) => {
      const preset = availableTherioforms.find((t) => t.name === presetName);
      if (!preset) return;
      setFormState((prev) => ({
        ...prev,
        therioforms: [
          ...(prev.therioforms || []),
          {
            name: preset.name,
            genoclepsis: preset.genoclepsis,
            description: preset.description,
            customName: "",
          },
        ],
      }));
    };
  }, []);

  const presetAddButtons = getAvailablePresets().map((preset) => ({
    label: t(preset.name),
    onClick: handleAddPreset(preset.name),
  }));

  const handleCompendiumImport = useCallback(
    (item) => {
      setFormState((prev) => ({
        ...prev,
        therioforms: [
          ...(prev.therioforms || []),
          {
            name: item.name,
            genoclepsis: item.genoclepsis || "",
            description: item.description || "",
            customName: "",
          },
        ],
      }));
      setCompendiumOpen(false);
    },
    [setFormState],
  );

  return (
    <>
      <ContentSection
        formState={formState}
        setFormState={setFormState}
        t={t}
        itemsArrayName="therioforms"
        itemComponent={MutantItem}
        itemComponentProps={{}}
        onAddItem={createBlankTherioform}
        addButtonLabel="Add Therioform"
        emptyStateLabel="No therioforms added"
        presetAddButtons={presetAddButtons}
        onBrowseCompendium={() => setCompendiumOpen(true)}
      />
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleCompendiumImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Mutant"
      />
    </>
  );
}
