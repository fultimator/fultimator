import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import GourmetGeneralSection from "/src/components/shared/actors/pc/spells/sections/GourmetGeneralSection";
import GourmetContentSection from "/src/components/shared/actors/pc/spells/sections/GourmetContentSection";
import GourmetCookingTab from "/src/components/shared/actors/pc/spells/sections/GourmetCookingTab";
import GourmetInventoryTab from "/src/components/shared/actors/pc/spells/sections/GourmetInventoryTab";
import { useTranslate } from "/src/translation/translate";

export default function SpellGourmetModal({
  open,
  onClose,
  onSave,
  onDelete,
  player,
  setPlayer,
  spell,
}) {
  const { t } = useTranslate();

  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      player={player}
      setPlayer={setPlayer}
      spellType="gourmet"
      spell={spell}
      title={t("gourmet_edit_cooking_button")}
      sections={[
        {
          id: "cookbook",
          title: "Combinations",
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
          id: "shop",
          title: "Shop",
          component: GourmetCookingTab,
          props: { mode: "shop" },
        },
        {
          id: "cooking",
          title: "gourmet_cooking",
          component: GourmetCookingTab,
          props: { mode: "cooking" },
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
