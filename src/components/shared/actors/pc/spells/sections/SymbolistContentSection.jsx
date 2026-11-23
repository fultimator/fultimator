import { useCallback, useState, useMemo } from "react";
import ContentSection from "/src/components/shared/actors/pc/spells/sections/ContentSection";
import SymbolistItem from "/src/components/shared/actors/pc/spells/sections/SymbolistItem";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { availableSymbols } from "/src/libs/player/spellOptionData";

export default function SymbolistContentSection({
  formState,
  setFormState,
  t,
}) {
  const currentSymbols = useMemo(
    () => formState.symbols || [],
    [formState.symbols],
  );
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankSymbol = useCallback(() => {
    return {
      key: "symbol_custom_name",
      effect: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedKeys = currentSymbols
      .map((s) => s.key)
      .filter((key) => key !== "symbol_custom_name");
    return availableSymbols.filter(
      (preset) =>
        preset.name !== "symbol_custom_name" &&
        !addedKeys.includes(preset.name),
    );
  }, [currentSymbols]);

  const handleAddPreset = useCallback((presetName) => {
    return (setFormState) => {
      const preset = availableSymbols.find((s) => s.name === presetName);
      if (!preset) return;
      setFormState((prev) => ({
        ...prev,
        symbols: [
          ...(prev.symbols || []),
          {
            key: preset.name,
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

  const handleCompendiumImport = useCallback(
    (item) => {
      setFormState((prev) => ({
        ...prev,
        symbols: [
          ...(prev.symbols || []),
          {
            key: item.key || item.name,
            effect: item.effect || "",
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
        itemsArrayName="symbols"
        itemComponent={SymbolistItem}
        itemComponentProps={{}}
        onAddItem={createBlankSymbol}
        addButtonLabel="Add Symbol"
        emptyStateLabel="No symbols added"
        presetAddButtons={presetAddButtons}
        onBrowseCompendium={() => setCompendiumOpen(true)}
      />
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleCompendiumImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Symbolist"
      />
    </>
  );
}
