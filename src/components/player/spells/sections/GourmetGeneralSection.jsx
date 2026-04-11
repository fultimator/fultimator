import GeneralSection from "./GeneralSection";

/**
 * GourmetGeneralSection - Settings tab for Gourmet spell
 * Simple pass-through to GeneralSection (no custom fields)
 */
export default function GourmetGeneralSection({ formState, setFormState, t }) {
  const customFields = [
    {
      name: "allYouCanEat",
      label: "all_you_can_eat",
      type: "toggle",
      value: formState.allYouCanEat || false,
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
