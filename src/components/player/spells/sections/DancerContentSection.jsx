import { useCallback, useState, useMemo } from "react";
import ContentSection from "./ContentSection";
import DancerItem from "./DancerItem";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { availableDances } from "../spellOptionData";

export default function DancerContentSection({ formState, setFormState, t }) {
  const currentDances = useMemo(
    () => formState.dances || [],
    [formState.dances],
  );
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankDance = useCallback(() => {
    return {
      name: "dance_custom",
      effect: "",
      duration: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedNames = currentDances
      .map((d) => d.name)
      .filter((name) => name !== "dance_custom");
    return availableDances.filter(
      (preset) => !addedNames.includes(preset.name),
    );
  }, [currentDances]);

  const handleAddPreset = useCallback((presetName) => {
    return (setFormState) => {
      const preset = availableDances.find((d) => d.name === presetName);
      if (!preset) return;
      setFormState((prev) => ({
        ...prev,
        dances: [
          ...(prev.dances || []),
          {
            name: preset.name,
            effect: preset.effect,
            duration: preset.duration,
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
        dances: [
          ...(prev.dances || []),
          {
            name: item.name,
            effect: item.effect || "",
            duration: item.duration || "",
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
        itemsArrayName="dances"
        itemComponent={DancerItem}
        itemComponentProps={{}}
        onAddItem={createBlankDance}
        addButtonLabel="Add Dance"
        emptyStateLabel="No dances added"
        presetAddButtons={presetAddButtons}
        onBrowseCompendium={() => setCompendiumOpen(true)}
      />
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleCompendiumImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Dancer"
      />
    </>
  );
}
