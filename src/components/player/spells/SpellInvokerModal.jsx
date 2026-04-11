import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import InvokerGeneralSection from "./sections/InvokerGeneralSection";
import InvokerContentSection from "./sections/InvokerContentSection";
import { useTranslate } from "../../../translation/translate";

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
