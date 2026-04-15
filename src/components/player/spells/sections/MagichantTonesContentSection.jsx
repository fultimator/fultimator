import { useCallback, useState, useMemo } from "react";
import ContentSection from "./ContentSection";
import MagichantToneItem from "./MagichantToneItem";
import { availableMagichantTones } from "../spellOptionData";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";

export default function MagichantTonesContentSection({ formState, setFormState, t }) {
  const currentTones = useMemo(() => formState.tones || [], [formState.tones]);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankTone = useCallback(() => {
    return {
      name: "magichant_custom_name",
      effect: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedNames = currentTones
      .map((tone) => tone.name)
      .filter((name) => name !== "magichant_custom_name");
    return availableMagichantTones.filter(
      (preset) =>
        preset.name !== "magichant_custom_name" && !addedNames.includes(preset.name)
    );
  }, [currentTones]);

  const handleAddPreset = useCallback(
    (presetName) => {
      return (setState) => {
        const preset = availableMagichantTones.find((tone) => tone.name === presetName);
        if (!preset) return;
        setState((prev) => ({
          ...prev,
          tones: [
            ...(prev.tones || []),
            {
              name: preset.name,
              effect: preset.effect,
              customName: "",
            },
          ],
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
      const isToneItem = item?.magichantSubtype === "tone" || (item?.effect && !item?.type && !item?.status);
      if (!isToneItem) return;
      setFormState((prev) => ({
        ...prev,
        tones: [
          ...(prev.tones || []),
          {
            name: item.name || "magichant_custom_name",
            effect: item.effect || "",
            customName: item.customName || "",
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
        itemsArrayName="tones"
        itemComponent={MagichantToneItem}
        itemComponentProps={{}}
        onAddItem={createBlankTone}
        addButtonLabel="magichant_add_tone"
        emptyStateLabel="No tones added"
        presetAddButtons={presetAddButtons}
        onBrowseCompendium={() => setCompendiumOpen(true)}
      />
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleCompendiumImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Chanter"
        context="player"
      />
    </>
  );
}
