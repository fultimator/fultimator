import { useMemo, useCallback } from "react";
import { Alert } from "@mui/material";
import ContentSection from "/src/components/shared/actors/pc/spells/sections/ContentSection";
import AlchemyEffectItem from "/src/components/shared/actors/pc/spells/sections/AlchemyEffectItem";

function getEffectsValidationError(effects, t) {
  const usedValues = effects.map(({ dieValue }) => dieValue);
  const uniqueValues = new Set(usedValues.filter((value) => value !== 0));
  if (usedValues.filter((value) => value !== 0).length !== uniqueValues.size) {
    return t("Each non-'Any' die value must be unique.");
  }
  return "";
}

export default function AlchemyEffectsContentSection({
  formState,
  setFormState,
  t,
}) {
  const effects = useMemo(() => formState.effects || [], [formState.effects]);
  const validationError = useMemo(
    () => getEffectsValidationError(effects, t),
    [effects, t],
  );

  const createBlankEffect = useCallback(
    () => ({
      dieValue: 0,
      effect: "",
      passives: [],
      behaviors: [],
    }),
    [],
  );

  return (
    <>
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}
      <ContentSection
        formState={formState}
        setFormState={setFormState}
        t={t}
        itemsArrayName="effects"
        itemComponent={AlchemyEffectItem}
        itemComponentProps={{}}
        onAddItem={createBlankEffect}
        addButtonLabel="Add Effect"
        emptyStateLabel="No effects added"
      />
    </>
  );
}
