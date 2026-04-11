import { useCallback, useState } from "react";
import ContentSection from "./ContentSection";
import SymbolistItem from "./SymbolistItem";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { availableSymbols } from "../spellOptionData";

export default function SymbolistContentSection({ formState, setFormState, t }) {
  const currentSymbols = formState.symbols || [];
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const createBlankSymbol = useCallback(() => {
    return {
      name: "symbol_custom_name",
      effect: "",
      customName: "",
    };
  }, []);

  const getAvailablePresets = useCallback(() => {
    const addedNames = currentSymbols
      .map((s) => s.name)
      .filter((name) => name !== "symbol_custom_name");
    return availableSymbols.filter(
      (preset) =>
        preset.name !== "symbol_custom_name" && !addedNames.includes(preset.name)
    );
  }, [currentSymbols]);

  const handleAddPreset = useCallback(
    (presetName) => {
      return (setFormState) => {
        const preset = availableSymbols.find((s) => s.name === presetName);
        if (!preset) return;
        setFormState((prev) => ({
          ...prev,
          symbols: [
            ...(prev.symbols || []),
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
      setFormState((prev) => ({
        ...prev,
        symbols: [
          ...(prev.symbols || []),
          {
            name: item.name,
            effect: item.effect || "",
            customName: "",
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
