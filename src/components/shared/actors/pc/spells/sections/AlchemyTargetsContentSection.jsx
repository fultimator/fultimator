import { useMemo, useCallback } from "react";
import { Alert } from "@mui/material";
import ContentSection from "/src/components/shared/actors/pc/spells/sections/ContentSection";
import AlchemyTargetItem from "/src/components/shared/actors/pc/spells/sections/AlchemyTargetItem";

function getTargetsValidationError(targets, t) {
  const ranges = targets.map(({ rangeFrom, rangeTo }) => ({
    rangeFrom,
    rangeTo,
  }));
  const flatRanges = ranges.flatMap(({ rangeFrom, rangeTo }) => {
    const rangeArray = [];
    for (let i = rangeFrom; i <= rangeTo; i++) {
      rangeArray.push(i);
    }
    return rangeArray;
  });

  const hasOverlap = flatRanges.some(
    (value, index, array) => array.indexOf(value) !== index,
  );

  if (hasOverlap) return t("Ranges cannot overlap.");
  if (flatRanges.length < 20 || new Set(flatRanges).size !== 20) {
    return t("All die faces from 1 to 20 must be covered without overlap.");
  }
  if (targets.length < 2) return t("At least two targets are required.");
  return "";
}

export default function AlchemyTargetsContentSection({
  formState,
  setFormState,
  t,
}) {
  const targets = useMemo(() => formState.targets || [], [formState.targets]);
  const validationError = useMemo(
    () => getTargetsValidationError(targets, t),
    [targets, t],
  );

  const createBlankTarget = useCallback(
    () => ({
      rangeFrom: 1,
      rangeTo: 20,
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
        itemsArrayName="targets"
        itemComponent={AlchemyTargetItem}
        itemComponentProps={{}}
        onAddItem={createBlankTarget}
        addButtonLabel="Add Target"
        emptyStateLabel="No targets added"
      />
    </>
  );
}
