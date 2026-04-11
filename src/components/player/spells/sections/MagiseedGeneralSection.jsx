import GeneralSection from "./GeneralSection";

/**
 * MagiseedGeneralSection - Settings tab for Magiseed spell
 * Extends GeneralSection with Magiseed-specific fields: growthClock slider, gardenDescription textarea
 */
export default function MagiseedGeneralSection({ formState, setFormState, t }) {
  const customFields = [
    {
      name: "growthClock",
      label: "magiseed_growth_clock",
      type: "slider",
      value: formState.growthClock || 0,
      min: 0,
      max: 4,
      step: 1,
      marks: [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" },
      ],
    },
    {
      name: "gardenDescription",
      label: "magiseed_garden_appearance",
      inputLabel: "magiseed_garden_description_label",
      type: "textarea",
      value: formState.gardenDescription || "",
      placeholder: "magiseed_garden_description_placeholder",
      rows: 3,
      helpText: "magiseed_garden_description_help",
    },
  ];

  return (
    <GeneralSection
      formState={formState}
      setFormState={setFormState}
      t={t}
      customFields={customFields}
    />
  );
}
