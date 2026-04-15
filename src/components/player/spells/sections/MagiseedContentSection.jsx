import { useCallback, useState, useMemo } from "react";
import ContentSection from "./ContentSection";
import MagiseedItem from "./MagiseedItem";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { magiseeds } from "../../../../libs/floralistMagiseedData";

/**
 * MagiseedContentSection - Content tab for Magiseed spell
 * Manages the array of magiseeds with add/edit/delete
 */
export default function MagiseedContentSection({ formState, setFormState, t }) {
  const currentMagiseeds = useMemo(() => formState.magiseeds || [], [formState.magiseeds]);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  // Function to create a new blank magiseed
  const createBlankMagiseed = useCallback(() => {
    return {
      name: "magiseed_custom",
      customName: "",
      description: "",
      rangeStart: 0,
      rangeEnd: 3,
      effects: {
        0: "",
        1: "",
        2: "",
        3: "",
      },
    };
  }, []);

  // Get available preset magiseeds that haven't been added yet
  const getAvailablePresets = useCallback(() => {
    const addedPresetNames = currentMagiseeds
      .map((m) => m.name)
      .filter((name) => name !== "magiseed_custom");
    return magiseeds.filter(
      (preset) =>
        preset.name !== "magiseed_custom" &&
        !addedPresetNames.includes(preset.name)
    );
  }, [currentMagiseeds]);

  // Handle adding a preset magiseed
  const handleAddPreset = useCallback(
    (presetName) => {
      return (setFormState) => {
        const preset = magiseeds.find((m) => m.name === presetName);
        if (!preset) return;

        const newMagiseed = {
          ...preset,
          customName: "",
          description: preset.description,
        };

        setFormState((prev) => ({
          ...prev,
          magiseeds: [...(prev.magiseeds || []), newMagiseed],
        }));
      };
    },
    []
  );

  const presetAddButtons = getAvailablePresets().map((preset) => ({
    label: t(preset.name),
    onClick: handleAddPreset(preset.name),
  }));

  const handleCompendiumImport = useCallback(
    (item) => {
      setFormState((prev) => ({
        ...prev,
        magiseeds: [
          ...(prev.magiseeds || []),
          {
            name: item.name,
            customName: "",
            description: item.description || "",
            rangeStart: item.rangeStart || 0,
            rangeEnd: item.rangeEnd || 3,
            effects: item.effects || {
              0: "",
              1: "",
              2: "",
              3: "",
            },
          },
        ],
      }));
      setCompendiumOpen(false);
    },
    [setFormState]
  );

  return (
    <>
      <ContentSection
        formState={formState}
        setFormState={setFormState}
        t={t}
        itemsArrayName="magiseeds"
        itemComponent={MagiseedItem}
        itemComponentProps={{}}
        onAddItem={createBlankMagiseed}
        addButtonLabel="magiseed_add_magiseed"
        emptyStateLabel="magiseed_no_available_magiseeds_hint"
        presetAddButtons={presetAddButtons}
        onBrowseCompendium={() => setCompendiumOpen(true)}
      />
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleCompendiumImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Floralist"
      />
    </>
  );
}
