import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import InvokerGeneralSection from "/src/components/shared/actors/pc/spells/sections/InvokerGeneralSection";
import InvokerContentSection from "/src/components/shared/actors/pc/spells/sections/InvokerContentSection";
import { useTranslate } from "/src/translation/translate";

export default function SpellInvokerModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
}) {
  const { t } = useTranslate();

  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="invoker"
      spell={spell}
      title={t("invoker_edit_invocation_button")}
      sections={[
        {
          id: "content",
          title: "invoker_edit_invocations_button",
          component: InvokerContentSection,
          props: {},
        },
        {
          id: "general",
          title: "invoker_settings_button",
          component: InvokerGeneralSection,
          props: {},
        },
      ]}
    />
  );
}
