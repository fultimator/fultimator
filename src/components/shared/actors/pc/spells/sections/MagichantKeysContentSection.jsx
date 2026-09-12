import { useCallback, useState, useMemo } from "react";
import ContentSection from "/src/components/shared/actors/pc/spells/sections/ContentSection";
import MagichantKeyItem from "/src/components/shared/actors/pc/spells/sections/MagichantKeyItem";
import { availableMagichantKeys } from "/src/libs/player/spellOptionData";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";

export default function MagichantKeysContentSection({
  formState,
  setFormState,
  t,
}) {
  const currentKeys = useMemo(() => formState.keys || [], [formState.keys]);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankKey = useCallback(() => {
    return {
      key: "magichant_custom_name",
      type: "",
      status: "",
      attribute: "",
      recovery: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedKeys = currentKeys
      .map((k) => k.key)
      .filter((k) => k !== "magichant_custom_name");
    return availableMagichantKeys.filter(
      (preset) =>
        preset.name !== "magichant_custom_name" &&
        !addedKeys.includes(preset.name),
    );
  }, [currentKeys]);

  const handleAddPreset = useCallback((presetName) => {
    return (setState) => {
      const preset = availableMagichantKeys.find(
        (key) => key.name === presetName,
      );
      if (!preset) return;
      setState((prev) => ({
        ...prev,
        keys: [
          ...(prev.keys || []),
          {
            key: preset.name,
            type: preset.type,
            status: preset.status,
            attribute: preset.attribute,
            recovery: preset.recovery,
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
      const isKeyItem =
        item?.magichantSubtype === "key" ||
        item?.type ||
        item?.status ||
        item?.attribute ||
        item?.recovery;
      if (!isKeyItem) return;
      setFormState((prev) => ({
        ...prev,
        keys: [
          ...(prev.keys || []),
          {
            key: item.key || item.name || "magichant_custom_name",
            type: item.type || "",
            status: item.status || "",
            attribute: item.attribute || "",
            recovery: item.recovery || "",
            customName: item.customName || "",
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
        itemsArrayName="keys"
        itemComponent={MagichantKeyItem}
        itemComponentProps={{}}
        onAddItem={createBlankKey}
        addButtonLabel="magichant_add_key"
        emptyStateLabel="No keys added"
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
