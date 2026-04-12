import GeneralSection from "./GeneralSection";

/**
 * PilotGeneralSection - Settings tab for Pilot spell
 * Simple pass-through to GeneralSection (no custom fields)
 */
export default function PilotGeneralSection({ formState, setFormState, t }) {
  return (
    <GeneralSection
      formState={formState}
      setFormState={setFormState}
      t={t}
      customFields={[]}
    />
  );
}
