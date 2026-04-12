import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GourmetGeneralSection from "./sections/GourmetGeneralSection";
import GourmetContentSection from "./sections/GourmetContentSection";
import GourmetCookingTab from "./sections/GourmetCookingTab";
import GourmetInventoryTab from "./sections/GourmetInventoryTab";
import { useTranslate } from "../../../translation/translate";

export default function SpellGourmetModal({
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
      spellType="gourmet"
      spell={spell}
      title={t("gourmet_edit_cooking_button")}
      sections={[
        {
          id: "cookbook",
          title: "gourmet_cookbook",
          component: GourmetContentSection,
          props: {},
        },
        {
          id: "inventory",
          title: "gourmet_ingredient_inventory",
          component: GourmetInventoryTab,
          props: {},
        },
        {
          id: "cooking",
          title: "gourmet_cooking",
          component: GourmetCookingTab,
          props: {},
        },
        {
          id: "general",
          title: "gourmet_edit_cooking_button",
          component: GourmetGeneralSection,
          props: {},
        },
      ]}
    />
  );
}
