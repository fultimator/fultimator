import { useCallback, useState } from "react";
import ContentSection from "./ContentSection";
import MagichantKeyItem from "./MagichantKeyItem";
import { availableMagichantKeys } from "../spellOptionData";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";

export default function MagichantKeysContentSection({ formState, setFormState, t }) {
  const currentKeys = formState.keys || [];
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankKey = useCallback(() => {
    return {
      name: "magichant_custom_name",
      type: "",
      status: "",
      attribute: "",
      recovery: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedNames = currentKeys
      .map((key) => key.name)
      .filter((name) => name !== "magichant_custom_name");
    return availableMagichantKeys.filter(
      (preset) =>
        preset.name !== "magichant_custom_name" && !addedNames.includes(preset.name)
    );
  }, [currentKeys]);

  const handleAddPreset = useCallback(
    (presetName) => {
      return (setState) => {
        const preset = availableMagichantKeys.find((key) => key.name === presetName);
        if (!preset) return;
        setState((prev) => ({
          ...prev,
          keys: [
            ...(prev.keys || []),
            {
              name: preset.name,
              type: preset.type,
              status: preset.status,
              attribute: preset.attribute,
              recovery: preset.recovery,
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
      const isKeyItem = item?.magichantSubtype === "key" || item?.type || item?.status || item?.attribute || item?.recovery;
      if (!isKeyItem) return;
      setFormState((prev) => ({
        ...prev,
        keys: [
          ...(prev.keys || []),
          {
            name: item.name || "magichant_custom_name",
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
    [setFormState]
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
