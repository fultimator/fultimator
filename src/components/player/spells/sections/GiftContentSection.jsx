import { useCallback, useState, useMemo } from "react";
import ContentSection from "./ContentSection";
import GiftItem from "./GiftItem";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { availableGifts } from "../spellOptionData";

export default function GiftContentSection({ formState, setFormState, t }) {
  const currentGifts = useMemo(() => formState.gifts || [], [formState.gifts]);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankGift = useCallback(() => {
    return {
      name: "esper_gift_custom_name",
      event: "",
      effect: "",
      customName: "",
    };
  }, []);

  const handleCompendiumImport = useCallback(
    (item) => {
      setFormState((prev) => ({
        ...prev,
        gifts: [
          ...(prev.gifts || []),
          {
            name: item.name,
            event: item.event || "",
            effect: item.effect || "",
            customName: "",
          },
        ],
      }));
      setCompendiumOpen(false);
    },
    [setFormState],
  );

  const getAvailablePresets = useCallback(() => {
    const addedNames = currentGifts
      .map((g) => g.name)
      .filter((name) => name !== "esper_gift_custom_name");
    return availableGifts.filter(
      (preset) =>
        preset.name !== "esper_gift_custom_name" &&
        !addedNames.includes(preset.name),
    );
  }, [currentGifts]);

  const handleAddPreset = useCallback((presetName) => {
    return (setFormState) => {
      const preset = availableGifts.find((g) => g.name === presetName);
      if (!preset) return;
      setFormState((prev) => ({
        ...prev,
        gifts: [
          ...(prev.gifts || []),
          {
            name: preset.name,
            event: preset.event,
            effect: preset.effect,
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

  return (
    <>
      <ContentSection
        formState={formState}
        setFormState={setFormState}
        t={t}
        itemsArrayName="gifts"
        itemComponent={GiftItem}
        itemComponentProps={{}}
        onAddItem={createBlankGift}
        addButtonLabel="Add Gift"
        emptyStateLabel="No gifts added"
        presetAddButtons={presetAddButtons}
        onBrowseCompendium={() => setCompendiumOpen(true)}
      />
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleCompendiumImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Esper"
      />
    </>
  );
}
