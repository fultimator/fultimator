import { useCallback } from "react";
import ContentSection from "/src/components/shared/actors/pc/spells/sections/ContentSection";
import InfusionEffectItem from "/src/components/shared/actors/pc/spells/sections/InfusionEffectItem";

export default function InfusionEffectsContentSection({
  formState,
  setFormState,
  t,
}) {
  const createBlankEffect = useCallback(
    () => ({
      name: "",
      effect: "",
      infusionRank: formState.rank || 1,
      behaviors: [],
    }),
    [formState.rank],
  );

  return (
    <ContentSection
      formState={formState}
      setFormState={setFormState}
      t={t}
      itemsArrayName="effects"
      itemComponent={InfusionEffectItem}
      itemComponentProps={{}}
      onAddItem={createBlankEffect}
      addButtonLabel="Add Infusion"
      emptyStateLabel="No infusions added"
    />
  );
}
