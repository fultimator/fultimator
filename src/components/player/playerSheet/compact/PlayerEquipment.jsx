import React, { useState, useMemo } from "react";
import {
  Alert,
  Grid,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import {
  Martial,
  MeleeIcon,
  DistanceIcon,
  ArmorIcon,
  ShieldIcon,
  AccessoryIcon,
} from "../../../icons";
import Diamond from "../../../Diamond";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import types from "../../../../libs/types";
import attributes from "../../../../libs/attributes";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import {
  Casino,
  RadioButtonUnchecked,
  SwapHoriz,
  Edit,
  Add,
  Search as SearchIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { calculateAttribute } from "../../common/playerCalculations";
import {
  deriveVehicleSlots,
  isTwoHandedEquipped,
} from "../../equipment/slots/equipmentSlots";
import { clearSlotAction } from "../../equipment/slots/loadoutActions";
import { normalizeWeaponLike } from "../../../../libs/weaponNormalization";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({
  padding: "2px 6px",
  color: "#fff",
});
const StyledTableCell = styled(TableCell)({
  padding: "2px 6px",
  fontSize: "0.8rem",
});

const StyledMarkdown = ({ children, ...props }) => (
  <div style={{ whiteSpace: "pre-line", display: "inline" }}>
    <ReactMarkdown
      {...props}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: (p) => <p style={{ margin: 0, display: "inline" }} {...p} />,
        ul: (p) => <ul style={{ margin: 0 }} {...p} />,
        li: (p) => <li style={{ margin: 0 }} {...p} />,
        strong: (p) => <strong style={{ fontWeight: "bold" }} {...p} />,
        em: (p) => <em style={{ fontStyle: "italic" }} {...p} />,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const safeQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  const parts = source.split(regex);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark
        key={`${part}-${idx}`}
        style={{ backgroundColor: "yellow", padding: 0 }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const safeQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  return source.replace(regex, "<mark>$1</mark>");
}

function normalizeAttrKey(raw) {
  const key = String(raw || "").toLowerCase();
  if (key === "dex" || key === "dexterity") return "dexterity";
  if (key === "ins" || key === "insight") return "insight";
  if (key === "mig" || key === "might") return "might";
  if (key === "wlp" || key === "will" || key === "willpower")
    return "willpower";
  return "dexterity";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function PlayerEquipment({
  player,
  setPlayer,
  isMainTab,
  isEditMode,
  searchQuery = "",
  onAddWeapon,
  onEditWeapon,
  onAddCustomWeapon,
  onEditCustomWeapon,
  onAddArmor,
  onEditArmor,
  onAddShield,
  onEditShield,
  onAddAccessory,
  onEditAccessory,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();

  const [dialogMessage, setDialogMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSeverity, setDialogSeverity] = useState("info");
  const [currentWeapon, setCurrentWeapon] = useState(null);
  const [compendiumType, setCompendiumType] = useState(null);
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;

  const getSkillLevel = (player, skillName) =>
    player.classes
      .flatMap((cls) => cls.skills)
      .filter((skill) => skill.specialSkill === skillName)
      .reduce((acc, skill) => acc + skill.currentLvl, 0);

  const defensiveMasteryBonus = getSkillLevel(player, "Defensive Mastery");
  const meleeMasteryModifier = getSkillLevel(player, "Melee Weapon Mastery");
  const rangedMasteryModifier = getSkillLevel(player, "Ranged Weapon Mastery");

  // Guardian: Dual Shieldbearer
  const hasDualShieldBearer = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.specialSkill === "Dual Shieldbearer" && skill.currentLvl === 1,
    ),
  );

  const twinShields = useMemo(
    () => ({
      base: {
        category: "Brawling",
        name: "Twin Shields",
        cost: 0,
        att1: "might",
        att2: "might",
        prec: 0,
        damage: 5,
        type: "physical",
        hands: 2,
        melee: true,
        martial: false,
      },
      name: "Twin Shields",
      category: "Brawling",
      melee: true,
      ranged: false,
      type: "physical",
      hands: 2,
      att1: "might",
      att2: "might",
      martial: false,
      damageBonus: false,
      damageReworkBonus: false,
      precBonus: false,
      rework: false,
      quality: t(
        "Deals extra damage equal to your【 **SL**】in **defensive mastery**.",
      ),
      qualityCost: "0",
      totalBonus: 0,
      selectedQuality: "",
      cost: 0,
      damage: 5 + defensiveMasteryBonus,
      prec: 0,
      damageModifier: 0,
      precModifier: 0,
      defModifier: 0,
      mDefModifier: 0,
      isEquipped: true,
    }),
    [defensiveMasteryBonus, t],
  );

  const inv = player.equipment?.[0];

  const formatCustomWeapon = (customWeapon, forceSecondaryForm = null) => {
    const isTransforming = asArray(customWeapon.customizations).some(
      (c) => c.name === "weapon_customization_transforming",
    );
    const isSecondaryForm =
      forceSecondaryForm !== null
        ? forceSecondaryForm
        : customWeapon.activeForm === "secondary";
    const weaponName = isSecondaryForm
      ? customWeapon.secondWeaponName || `${customWeapon.name} (Transforming)`
      : customWeapon.name;
    const accuracy = isSecondaryForm
      ? (customWeapon.secondAccuracy ?? customWeapon.accuracy)
      : customWeapon.accuracy;
    const damage = isSecondaryForm
      ? (customWeapon.secondDamage ?? customWeapon.damage)
      : customWeapon.damage;
    const category = isSecondaryForm
      ? customWeapon.secondSelectedCategory
      : customWeapon.category;
    const quality = isSecondaryForm
      ? customWeapon.secondQuality
      : customWeapon.quality;
    const martialCustomizations = [
      "weapon_customization_quick",
      "weapon_customization_magicdefenseboost",
      "weapon_customization_powerful",
    ];
    const customizations = isSecondaryForm
      ? asArray(customWeapon.secondCurrentCustomizations)
      : asArray(customWeapon.customizations);
    const isMartial = customizations.some((c) =>
      martialCustomizations.includes(c.name),
    );

    return {
      name: weaponName,
      cost: customWeapon.cost || 300,
      category: category,
      accuracy,
      damage,
      att1: accuracy?.attr1 || "dexterity",
      att2: accuracy?.attr2 || "might",
      prec: accuracy?.value ?? 0,
      type: damage?.type || "physical",
      hands: 2,
      melee:
        (isSecondaryForm
          ? customWeapon.secondSelectedRange
          : customWeapon.range) === "weapon_range_melee",
      ranged:
        (isSecondaryForm
          ? customWeapon.secondSelectedRange
          : customWeapon.range) === "weapon_range_ranged",
      martial: isMartial,
      quality: quality || "",
      isEquipped: customWeapon.isEquipped,
      isCustomWeapon: true,
      isTransforming: isTransforming,
      isSecondaryForm: isSecondaryForm,
      originalData: customWeapon,
    };
  };

  const allEquipment = useMemo(() => {
    const items = [];
    if (!inv) return items;

    (inv.weapons || []).forEach((w, i) => {
      const isUnarmedStrike =
        w.name === "Unarmed Strike" || w.base?.name === "Unarmed Strike";
      if (!isTechnospheres || isUnarmedStrike) {
        items.push({ ...w, equipType: "weapon", originalIndex: i });
      }
    });
    (inv.customWeapons || []).forEach((cw, i) =>
      items.push({
        ...formatCustomWeapon(cw),
        equipType: "custom-weapon",
        originalIndex: i,
      }),
    );
    if (!isTechnospheres) {
      (inv.shields || []).forEach((s, i) =>
        items.push({ ...s, equipType: "shield", originalIndex: i }),
      );
    }
    (inv.armor || []).forEach((a, i) =>
      items.push({ ...a, equipType: "armor", originalIndex: i }),
    );
    (inv.accessories || []).forEach((acc, i) =>
      items.push({ ...acc, equipType: "accessory", originalIndex: i }),
    );

    return items;
  }, [inv, isTechnospheres]);

  const equippedShields = useMemo(
    () =>
      allEquipment.filter((it) => it.equipType === "shield" && it.isEquipped),
    [allEquipment],
  );

  const filteredItems = useMemo(() => {
    let items = [...allEquipment];
    if (isMainTab) {
      items = items.filter((it) => it.isEquipped);
      if (hasDualShieldBearer && equippedShields.length >= 2) {
        items.push({
          ...twinShields,
          equipType: "weapon",
          isTwinShields: true,
        });
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((it) => {
        return (
          t(it.name).toLowerCase().includes(q) ||
          t(it.quality || "")
            .toLowerCase()
            .includes(q) ||
          t(it.category || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
    return items;
  }, [
    allEquipment,
    isMainTab,
    searchQuery,
    hasDualShieldBearer,
    equippedShields,
    twinShields,
    t,
  ]);

  const groupedItems = useMemo(() => {
    const groups = [
      {
        label: t("Weapons"),
        types: ["weapon"],
        key: "weapons",
        compendium: "weapons",
        col1: t("Accuracy"),
        col2: t("Damage"),
      },
      {
        label: t("Custom Weapons"),
        types: ["custom-weapon"],
        key: "customWeapons",
        compendium: "custom-weapons",
        col1: t("Accuracy"),
        col2: t("Damage"),
      },
      ...(!isTechnospheres
        ? [
            {
              label: t("Shields"),
              types: ["shield"],
              key: "shields",
              compendium: "shields",
              col1: t("DEF"),
              col2: t("M.DEF"),
            },
          ]
        : []),
      {
        label: t("Armor"),
        types: ["armor"],
        key: "armor",
        compendium: "armor",
        col1: t("DEF"),
        col2: t("M.DEF"),
      },
      {
        label: t("Accessories"),
        types: ["accessory"],
        key: "accessories",
        compendium: "accessories",
        col1: t("Cost"),
        col2: "",
      },
    ];

    return groups
      .map((g) => ({
        ...g,
        items: filteredItems.filter((it) => g.types.includes(it.equipType)),
      }))
      .filter((g) => g.items.length > 0 || (isEditMode && !isMainTab));
  }, [filteredItems, isEditMode, isMainTab, isTechnospheres, t]);

  // Modifiers
  const equippedArmorItems = allEquipment.filter(
    (it) => it.equipType === "armor" && it.isEquipped,
  );
  const equippedAccessoryItems = allEquipment.filter(
    (it) => it.equipType === "accessory" && it.isEquipped,
  );

  const precMeleeModifier =
    (player.modifiers?.meleePrec || 0) +
    (equippedArmorItems.length > 0
      ? equippedArmorItems[0].precModifier || 0
      : 0) +
    equippedShields.reduce((total, s) => total + (s.precModifier || 0), 0) +
    equippedAccessoryItems.reduce(
      (total, a) => total + (a.precModifier || 0),
      0,
    ) +
    meleeMasteryModifier;

  const precRangedModifier =
    (player.modifiers?.rangedPrec || 0) +
    (equippedArmorItems.length > 0
      ? equippedArmorItems[0].precModifier || 0
      : 0) +
    equippedShields.reduce((total, s) => total + (s.precModifier || 0), 0) +
    equippedAccessoryItems.reduce(
      (total, a) => total + (a.precModifier || 0),
      0,
    ) +
    rangedMasteryModifier;

  const damageMeleeModifier =
    (equippedArmorItems.length > 0
      ? equippedArmorItems[0].damageMeleeModifier || 0
      : 0) +
    equippedShields.reduce(
      (total, s) => total + (s.damageMeleeModifier || 0),
      0,
    ) +
    equippedAccessoryItems.reduce(
      (total, a) => total + (a.damageMeleeModifier || 0),
      0,
    );

  const damageRangedModifier =
    (equippedArmorItems.length > 0
      ? equippedArmorItems[0].damageRangedModifier || 0
      : 0) +
    equippedShields.reduce(
      (total, s) => total + (s.damageRangedModifier || 0),
      0,
    ) +
    equippedAccessoryItems.reduce(
      (total, a) => total + (a.damageRangedModifier || 0),
      0,
    );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  const attributeMap = {
    dexterity: currDex,
    insight: currInsight,
    might: currMight,
    willpower: currWillpower,
  };

  // Equip helpers
  const patchInv = (p, source, updater) => {
    const eq0 = {
      ...(p.equipment?.[0] ?? {}),
      [source]: updater(p.equipment?.[0]?.[source] ?? []),
    };
    const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
    return { ...p, equipment };
  };

  const equipToSlot = (source, itemName, itemIndex, slot, isTwoHand) => {
    if (slot === "offHand") {
      const mainRef = player.equippedSlots?.mainHand;
      if (mainRef) {
        if (mainRef.source === "customWeapons") return;
        const inv0 = player.equipment?.[0];
        const mainWeapon =
          mainRef.index !== undefined
            ? inv0?.weapons?.[mainRef.index]
            : inv0?.weapons?.find((w) => w.name === mainRef.name);
        if (mainWeapon?.hands === 2 || mainWeapon?.isTwoHand) return;
      }
    }
    const unequipRef = (p, ref) => {
      if (!ref) return p;
      return patchInv(p, ref.source, (arr) =>
        arr.map((it, idx) => {
          const match =
            ref.index !== undefined ? idx === ref.index : it.name === ref.name;
          return match ? { ...it, isEquipped: false } : it;
        }),
      );
    };
    let updated = unequipRef(player, player.equippedSlots?.[slot]);
    if (isTwoHand && slot === "mainHand")
      updated = unequipRef(updated, updated.equippedSlots?.offHand);
    updated = patchInv(updated, source, (arr) =>
      arr.map((it, idx) => {
        const match =
          itemIndex !== undefined ? idx === itemIndex : it.name === itemName;
        return match ? { ...it, isEquipped: true } : it;
      }),
    );
    const prevSlots = updated.equippedSlots ?? {
      mainHand: null,
      offHand: null,
      armor: null,
      accessory: null,
    };
    setPlayer({
      ...updated,
      equippedSlots: {
        ...prevSlots,
        [slot]: { source, name: itemName, index: itemIndex },
        ...(isTwoHand && slot === "mainHand" ? { offHand: null } : {}),
      },
      vehicleSlots: deriveVehicleSlots(updated),
    });
  };

  const unequipItem = (source, itemName) => {
    const slots = player.equippedSlots ?? {};
    const slotKey = Object.keys(slots).find(
      (k) => slots[k]?.source === source && slots[k]?.name === itemName,
    );
    if (slotKey) {
      setPlayer((prev) => clearSlotAction(prev, slotKey));
    } else {
      const updated = patchInv(player, source, (arr) =>
        arr.map((it) =>
          it.name === itemName ? { ...it, isEquipped: false } : it,
        ),
      );
      setPlayer({ ...updated, vehicleSlots: deriveVehicleSlots(updated) });
    }
  };

  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuWeapon, setSlotMenuWeapon] = useState(null);
  const [shieldMenuAnchor, setShieldMenuAnchor] = useState(null);
  const [shieldMenuItem, setShieldMenuItem] = useState(null);
  const [shieldEquipWarningOpen, setShieldEquipWarningOpen] = useState(false);

  const handleWeaponSlotSelect = (slot) => {
    if (slotMenuWeapon)
      equipToSlot(
        "weapons",
        slotMenuWeapon.name,
        slotMenuWeapon.index,
        slot,
        false,
      );
    setSlotMenuAnchor(null);
    setSlotMenuWeapon(null);
  };

  const handleShieldSlotSelect = (slot) => {
    if (shieldMenuItem)
      equipToSlot(
        "shields",
        shieldMenuItem.name,
        shieldMenuItem.index,
        slot,
        false,
      );
    setShieldMenuAnchor(null);
    setShieldMenuItem(null);
  };

  const handleEquipment = (item, event) => {
    if (!setPlayer || !isEditMode || item.isTwinShields) return;
    const eq0 = player.equipment?.[0];
    if (item.equipType === "custom-weapon") {
      const cw = item.originalData;
      const cwIndex = eq0?.customWeapons?.findIndex((w) => w === cw) ?? -1;
      if (cw.isEquipped) unequipItem("customWeapons", cw.name);
      else
        equipToSlot(
          "customWeapons",
          cw.name,
          cwIndex >= 0 ? cwIndex : undefined,
          "mainHand",
          true,
        );
      return;
    }
    const source =
      item.equipType === "weapon"
        ? "weapons"
        : item.equipType === "shield"
          ? "shields"
          : item.equipType === "armor"
            ? "armor"
            : "accessories";
    const arr = eq0?.[source] ?? [];
    const idx =
      item.originalIndex !== undefined
        ? item.originalIndex
        : arr.findIndex((it) => it.name === item.name);
    if (idx === -1) return;
    const invItem = arr[idx];

    if (invItem.isEquipped) {
      unequipItem(source, invItem.name);
    } else {
      if (item.equipType === "shield") {
        if (isTwoHandedEquipped(player) && !checkIfEquippable(item)) {
          setShieldEquipWarningOpen(true);
          return;
        }
        if (hasDualShieldBearer && event) {
          setShieldMenuAnchor({ top: event.clientY, left: event.clientX });
          setShieldMenuItem({ name: invItem.name, index: idx });
        } else equipToSlot("shields", invItem.name, idx, "offHand", false);
      } else if (item.equipType === "armor") {
        equipToSlot("armor", invItem.name, idx, "armor", false);
      } else if (item.equipType === "weapon") {
        const isTwoHand = invItem.hands === 2 || invItem.isTwoHand;
        if (isTwoHand)
          equipToSlot("weapons", invItem.name, idx, "mainHand", true);
        else if (event) {
          setSlotMenuAnchor({ top: event.clientY, left: event.clientX });
          setSlotMenuWeapon({ name: invItem.name, index: idx });
        } else {
          const slots = player.equippedSlots ?? {};
          const slot = !slots.mainHand
            ? "mainHand"
            : !slots.offHand
              ? "offHand"
              : null;
          if (slot) equipToSlot("weapons", invItem.name, idx, slot, false);
        }
      } else if (item.equipType === "accessory") {
        equipToSlot("accessories", invItem.name, idx, "accessory", false);
      }
    }
  };

  const checkIfEquippable = (item) => {
    if (!item.martial) return true;
    const isTechnospheresStandard =
      player.settings?.optionalRules?.technospheres &&
      ["standard", "hoplospheres"].includes(
        player.settings?.optionalRules?.technospheresVariant ?? "standard",
      );
    if (
      isTechnospheresStandard &&
      (item.equipType === "weapon" || item.equipType === "custom-weapon")
    )
      return true;
    return player.classes.some((cls) => {
      const martials = cls.benefits.martials;
      if (!martials) return false;
      if (
        (item.equipType === "weapon" || item.equipType === "custom-weapon") &&
        ((item.melee && martials.melee) || (item.ranged && martials.ranged))
      )
        return true;
      if (item.equipType === "armor" && martials.armor) return true;
      if (item.equipType === "shield" && martials.shield) return true;
      return false;
    });
  };

  const handleEquipmentGuarded = (item, event) => {
    handleEquipment(item, event);
  };

  const handleSwapForm = (item) => {
    if (!setPlayer || !isEditMode || !item.originalData) return;
    setPlayer((prev) => {
      const cwList = prev.equipment?.[0]?.customWeapons ?? [];
      const idx = cwList.findIndex((w) => w === item.originalData);
      if (idx === -1) return prev;
      const updated = cwList.map((cw, i) =>
        i === idx
          ? {
              ...cw,
              activeForm:
                cw.activeForm === "secondary" ? "primary" : "secondary",
            }
          : cw,
      );
      return {
        ...prev,
        equipment: [
          { ...prev.equipment[0], customWeapons: updated },
          ...(prev.equipment?.slice(1) ?? []),
        ],
      };
    });
  };

  const handleDiceRoll = (weapon) => {
    setCurrentWeapon(weapon);
    const attr1 = normalizeAttrKey(weapon.accuracy?.attr1);
    const attr2 = normalizeAttrKey(weapon.accuracy?.attr2);
    const weaponPrec = weapon.accuracy?.value ?? 0;
    const weaponDamage = weapon.damage?.value ?? 0;
    const weaponType = weapon.damage?.type ?? "physical";
    const v1 = attributeMap[attr1] ?? currDex,
      v2 = attributeMap[attr2] ?? currMight;
    const d1 = Math.floor(Math.random() * v1) + 1,
      d2 = Math.floor(Math.random() * v2) + 1;
    const isCritFail = d1 === 1 && d2 === 1,
      isCritSucc = d1 >= 6 && d2 >= 6 && d1 === d2;
    const acc =
      d1 +
      d2 +
      weaponPrec +
      (weapon.melee ? precMeleeModifier : precRangedModifier);
    const dmg =
      Math.max(d1, d2) +
      weaponDamage +
      (weapon.melee ? damageMeleeModifier : damageRangedModifier);

    const content = (
      <Grid container spacing={2} sx={{ textAlign: "center" }}>
        <Grid size={6}>
          <Typography variant="h3">{t("Accuracy")}</Typography>
          <Typography variant="h1">{acc}</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="h3">{t("Damage")}</Typography>
          <Typography variant="h1">{dmg}</Typography>
          <Typography variant="h6">{t(weaponType)}</Typography>
        </Grid>
        <Grid sx={{ mt: 2 }} size={12}>
          <Typography>{`${d1} [${attributes[attr1]?.shortcaps ?? "DEX"}] + ${d2} [${attributes[attr2]?.shortcaps ?? "MIG"}] ${weaponPrec !== 0 ? (weaponPrec > 0 ? "+" : "") + weaponPrec : ""} ${weapon.melee ? (precMeleeModifier !== 0 ? (precMeleeModifier > 0 ? "+" : "") + precMeleeModifier : "") : precRangedModifier !== 0 ? (precRangedModifier > 0 ? "+" : "") + precRangedModifier : ""}`}</Typography>
          <Typography sx={{ fontWeight: "bold" }}>
            {t("Damage")}:{" "}
            {`max(${d1}, ${d2}) + ${weaponDamage} ${weapon.melee ? (damageMeleeModifier !== 0 ? (damageMeleeModifier > 0 ? "+" : "") + damageMeleeModifier : "") : damageRangedModifier !== 0 ? (damageRangedModifier > 0 ? "+" : "") + damageRangedModifier : ""}`}
          </Typography>
        </Grid>
      </Grid>
    );
    if (isCritFail) {
      setDialogSeverity("error");
      setDialogMessage(
        <>
          <Typography variant="h1">{t("Critical Failure")}!</Typography>
          {content}
        </>,
      );
    } else if (isCritSucc) {
      setDialogSeverity("success");
      setDialogMessage(
        <>
          <Typography variant="h1">{t("Critical Success")}!</Typography>
          {content}
        </>,
      );
    } else {
      setDialogSeverity("info");
      setDialogMessage(content);
    }
    setDialogOpen(true);
  };

  const handleEditItem = (item) => {
    if (item.equipType === "weapon") onEditWeapon?.(item.originalIndex);
    else if (item.equipType === "custom-weapon")
      onEditCustomWeapon?.(item.originalIndex);
    else if (item.equipType === "armor") onEditArmor?.(item.originalIndex);
    else if (item.equipType === "shield") onEditShield?.(item.originalIndex);
    else if (item.equipType === "accessory")
      onEditAccessory?.(item.originalIndex);
  };

  const handleImportFromCompendium = (item, type) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const source =
        type === "weapons"
          ? "weapons"
          : type === "armor"
            ? "armor"
            : type === "shields"
              ? "shields"
              : type === "custom-weapons"
                ? "customWeapons"
                : "accessories";
      let newItem;
      if (type === "weapons")
        newItem = normalizeWeaponLike({
          ...item,
          base: item,
          name: item.name,
          category: item.category || "",
          martial: item.martial || false,
          quality: "",
          cost: item.cost || 0,
          isEquipped: false,
        });
      else if (type === "armor" || type === "shields")
        newItem = {
          base: item,
          name: item.name,
          quality: "",
          category: type === "armor" ? "Armor" : "Shield",
          martial: item.martial || false,
          def: item.def || item.defbonus || 0,
          mdef: item.mdef || item.mdefbonus || 0,
          init: item.init || 0,
          cost: item.cost || 0,
          isEquipped: false,
        };
      else newItem = { ...item, isEquipped: false };
      return patchInv(prev, source, (arr) => [...arr, newItem]);
    });
  };

  const handleAddAction = (group) => {
    if (group.key === "weapons") {
      if (isTechnospheres) onAddCustomWeapon?.();
      else onAddWeapon?.();
    } else if (group.key === "armor") onAddArmor?.();
    else if (group.key === "shields") onAddShield?.();
    else if (group.key === "accessories") onAddAccessory?.();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {groupedItems.map((group) => (
        <TableContainer key={group.key} component={Paper} sx={{ mb: 1 }}>
          <Table size="small" sx={{ width: "100%" }}>
            <TableHead>
              <TableRow
                sx={{
                  background: theme.primary,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}
              >
                <StyledTableCellHeader sx={{ width: 30 }} />
                <StyledTableCellHeader>
                  <Typography
                    variant="h4"
                    sx={{
                      textTransform: "uppercase",
                      color: "#fff",
                      textAlign: "left",
                    }}
                  >
                    {group.label}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ width: { xs: 62, sm: 92 }, textAlign: "center" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: "#fff",
                      opacity: 0.8,
                      fontSize: "0.65rem",
                    }}
                  >
                    {group.col1}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ width: { xs: 62, sm: 92 }, textAlign: "center" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: "#fff",
                      opacity: 0.8,
                      fontSize: "0.65rem",
                    }}
                  >
                    {group.col2}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ width: { xs: 80, sm: 92 }, textAlign: "right" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {isEditMode && !isMainTab && (
                      <>
                        <Tooltip title={`${t("Add")} ${group.label}`}>
                          <IconButton
                            size="small"
                            onClick={() => handleAddAction(group)}
                            sx={{ color: "#fff", p: 0.25 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Search Compendium")}>
                          <IconButton
                            size="small"
                            onClick={() => setCompendiumType(group.compendium)}
                            sx={{ color: "#fff", p: 0.25 }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {!isEditMode && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          color: "#fff",
                          opacity: 0.8,
                          fontSize: "0.65rem",
                        }}
                      >
                        {t("Actions")}
                      </Typography>
                    )}
                  </Box>
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.items.map((item, idx) => (
                <EquipmentRow
                  key={`${item.equipType}-${item.originalIndex || idx}`}
                  item={item}
                  player={player}
                  isEditMode={isEditMode}
                  searchQuery={searchQuery}
                  handleEquipment={handleEquipmentGuarded}
                  handleDiceRoll={handleDiceRoll}
                  handleSwapForm={handleSwapForm}
                  handleEdit={handleEditItem}
                  checkIfEquippable={checkIfEquippable}
                  theme={theme}
                  t={t}
                  openRows={openRows.equipment}
                  toggleRow={(key) => toggleRow("equipment", key)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}
      {!isMainTab &&
        (precMeleeModifier !== 0 ||
          precRangedModifier !== 0 ||
          damageMeleeModifier !== 0 ||
          damageRangedModifier !== 0) && (
          <Box sx={{ p: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {t("Modifiers")}
            </Typography>
            {precMeleeModifier !== 0 && (
              <Typography variant="h6">
                {t("Melee Accuracy Bonus")}: {precMeleeModifier}
              </Typography>
            )}
            {precRangedModifier !== 0 && (
              <Typography variant="h6">
                {t("Ranged Accuracy Bonus")}: {precRangedModifier}
              </Typography>
            )}
            {damageMeleeModifier !== 0 && (
              <Typography variant="h6">
                {t("Melee Damage Bonus")}: {damageMeleeModifier}
              </Typography>
            )}
            {damageRangedModifier !== 0 && (
              <Typography variant="h6">
                {t("Ranged Damage Bonus")}: {damageRangedModifier}
              </Typography>
            )}
          </Box>
        )}
      <Menu
        open={Boolean(slotMenuAnchor)}
        onClose={() => setSlotMenuAnchor(null)}
        anchorReference="anchorPosition"
        anchorPosition={slotMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => handleWeaponSlotSelect("mainHand")}>
          {t("Main Hand")}
        </MenuItem>
        <MenuItem onClick={() => handleWeaponSlotSelect("offHand")}>
          {t("Off Hand")}
        </MenuItem>
      </Menu>
      <Menu
        open={Boolean(shieldMenuAnchor)}
        onClose={() => setShieldMenuAnchor(null)}
        anchorReference="anchorPosition"
        anchorPosition={shieldMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => handleShieldSlotSelect("mainHand")}>
          {t("Main Hand")}
        </MenuItem>
        <MenuItem onClick={() => handleShieldSlotSelect("offHand")}>
          {t("Off Hand")}
        </MenuItem>
      </Menu>
      <CompendiumViewerModal
        open={compendiumType !== null}
        onClose={() => setCompendiumType(null)}
        onAddItem={handleImportFromCompendium}
        initialType={compendiumType ?? "weapons"}
        restrictToTypes={compendiumType ? [compendiumType] : undefined}
        context="player"
      />
      <Snackbar
        open={shieldEquipWarningOpen}
        autoHideDuration={3000}
        onClose={() => setShieldEquipWarningOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setShieldEquipWarningOpen(false)}
          sx={{ width: "100%" }}
        >
          {t(
            "Cannot equip a martial shield you are not proficient with while a two-handed weapon is equipped.",
          )}
        </Alert>
      </Snackbar>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{
          paper: { sx: { width: { xs: "90%", md: "30%" } } },
        }}
      >
        <DialogTitle
          variant="h3"
          sx={{
            backgroundColor:
              dialogSeverity === "error"
                ? "#bb2124"
                : dialogSeverity === "success"
                  ? "#22bb33"
                  : "#aaaaaa",
          }}
        >
          {t("Result")}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>{dialogMessage}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("Close")}</Button>
          <Button onClick={() => handleDiceRoll(currentWeapon)}>
            {t("Re-roll")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function EquipmentRow({
  item,
  player,
  isEditMode,
  searchQuery,
  handleEquipment,
  handleDiceRoll,
  handleSwapForm,
  handleEdit,
  checkIfEquippable,
  theme,
  t,
  openRows,
  toggleRow,
}) {
  const rowKey = `equipment-${item.equipType}-${item.originalIndex || (item.isTwinShields ? "twin" : "new")}`;
  const translatedQuality = t(item.quality || "");
  const isDescriptionMatch =
    !!searchQuery?.trim() &&
    translatedQuality.toLowerCase().includes(searchQuery.trim().toLowerCase());
  const isOpen = !!openRows[rowKey] || isDescriptionMatch;

  const getDefaultUnarmedStrikeInfo = () => {
    const settings = player.settings ?? {};
    const defaultRef = settings.defaultUnarmedStrikeRef;
    const autoEquipEnabled = settings.autoEquipUnarmed ?? !!defaultRef;
    if (!defaultRef || !autoEquipEnabled) return null;

    const source =
      item.equipType === "custom-weapon" ? "customWeapons" : "weapons";
    const name =
      item.equipType === "custom-weapon" ? item.originalData?.name : item.name;

    const isDefaultUnarmed =
      defaultRef.source === source && defaultRef.name === name;
    return isDefaultUnarmed ? { isDefault: true, settings } : null;
  };

  const getBadge = () => {
    const slots = player.equippedSlots ?? {};
    const settings = player.settings ?? {};
    const defaultRef = settings.defaultUnarmedStrikeRef;

    if (item.equipType === "weapon" || item.equipType === "custom-weapon") {
      const source =
        item.equipType === "custom-weapon" ? "customWeapons" : "weapons";
      const name =
        item.equipType === "custom-weapon"
          ? item.originalData?.name
          : item.name;

      // Check if this is the default unarmed strike
      const isDefaultUnarmed =
        defaultRef && defaultRef.source === source && defaultRef.name === name;

      // For unarmed strikes, show which slots it would fill based on what's empty
      const autoEquipEnabled = settings.autoEquipUnarmed ?? !!defaultRef;
      if (isDefaultUnarmed && autoEquipEnabled) {
        const mainHandEmpty = !slots.mainHand;
        const offHandEmpty = !slots.offHand;
        if (mainHandEmpty && offHandEmpty) return "M+O";
        if (mainHandEmpty && !offHandEmpty) return "M";
        if (!mainHandEmpty && offHandEmpty) return "O";
        // Both slots occupied, no badge
        return null;
      }

      // For non-unarmed weapons, show which slot(s) they occupy
      if (slots.mainHand?.source === source && slots.mainHand?.name === name)
        return item.hands === 2 ||
          item.isTwoHand ||
          item.equipType === "custom-weapon"
          ? "M+O"
          : "M";
      if (slots.offHand?.source === source && slots.offHand?.name === name)
        return "O";
    } else if (item.equipType === "shield") {
      if (
        slots.mainHand?.source === "shields" &&
        slots.mainHand?.name === item.name
      )
        return "M";
      if (
        slots.offHand?.source === "shields" &&
        slots.offHand?.name === item.name
      )
        return "O";
    } else if (item.equipType === "armor" || item.equipType === "accessory")
      return "E";
    return null;
  };

  const renderStats = () => {
    if (item.equipType === "weapon" || item.equipType === "custom-weapon") {
      const accuracy = item.accuracy ?? {};
      const damage = item.damage ?? {};
      const attr1 = normalizeAttrKey(accuracy.attr1);
      const attr2 = normalizeAttrKey(accuracy.attr2);
      const prec = accuracy.value ?? 0;
      const damageValue = damage.value ?? 0;
      const damageType = damage.type ?? "physical";
      return (
        <>
          <StyledTableCell sx={{ width: { xs: 62, sm: 92 } }}>
            <Typography sx={{ textAlign: "center" }}>
              <OpenBracket />
              {`${attributes[attr1]?.shortcaps ?? "DEX"} + ${attributes[attr2]?.shortcaps ?? "MIG"}`}
              <CloseBracket />
              {prec !== 0 ? (prec > 0 ? "+" : "") + prec : ""}
            </Typography>
          </StyledTableCell>
          <StyledTableCell sx={{ width: { xs: 62, sm: 92 } }}>
            <Typography sx={{ textAlign: "center" }}>
              <OpenBracket />
              {t("HR")} {damageValue >= 0 ? "+" : ""} {damageValue}
              <CloseBracket />
              {types[damageType]?.long ?? types.physical.long}
            </Typography>
          </StyledTableCell>
        </>
      );
    }
    if (item.equipType === "armor" || item.equipType === "shield") {
      return (
        <>
          <StyledTableCell sx={{ width: { xs: 62, sm: 92 } }}>
            <Typography sx={{ textAlign: "center" }}>
              {/* <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5 }}>{t("DEF")}:</Box> */}
              {item.equipType === "shield"
                ? `+${item.def + (item.defModifier || 0)}`
                : item.martial
                  ? item.def + (item.defModifier || 0)
                  : item.def + (item.defModifier || 0) === 0
                    ? t("DEX die")
                    : `${t("DEX die")} + ${item.def + (item.defModifier || 0)}`}
            </Typography>
          </StyledTableCell>
          <StyledTableCell sx={{ width: { xs: 62, sm: 92 } }}>
            <Typography sx={{ textAlign: "center" }}>
              {/* <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5 }}>{t("M.DEF")}:</Box> */}
              {item.equipType === "shield"
                ? `+${item.mdef + (item.mDefModifier || 0)}`
                : item.mdef + (item.mDefModifier || 0) === 0
                  ? t("INS die")
                  : `${t("INS die")} + ${item.mdef + (item.mDefModifier || 0)}`}
            </Typography>
          </StyledTableCell>
        </>
      );
    }
    return (
      <>
        <StyledTableCell sx={{ width: { xs: 62, sm: 92 } }}>
          <Typography
            sx={{ textAlign: "center" }}
          >{`${item.cost}z`}</Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ width: { xs: 62, sm: 92 } }} />
      </>
    );
  };

  const Icon =
    item.equipType === "weapon" || item.equipType === "custom-weapon"
      ? item.melee
        ? MeleeIcon
        : DistanceIcon
      : item.equipType === "armor"
        ? ArmorIcon
        : item.equipType === "shield"
          ? ShieldIcon
          : AccessoryIcon;

  return (
    <React.Fragment>
      <TableRow
        sx={{ backgroundColor: isOpen ? "rgba(0,0,0,0.02)" : "inherit" }}
      >
        <StyledTableCell sx={{ width: 30 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleRow(rowKey);
            }}
            size="small"
            sx={{ p: 0.25 }}
          >
            {isOpen ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(rowKey);
          }}
          sx={{
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
              noWrap
            >
              {highlightMatch(t(item.name), searchQuery)}
            </Typography>
            {item.martial && <Martial />}
          </Box>
        </StyledTableCell>
        {renderStats()}
        <StyledTableCell sx={{ width: { xs: 80, sm: 92 }, textAlign: "right" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {isEditMode && (
              <IconButton
                onClick={() => handleEdit(item)}
                size="small"
                sx={{ p: 0.25 }}
              >
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            )}
            <Tooltip
              title={checkIfEquippable(item) ? t("Equip") : t("Not proficient")}
              arrow
            >
              <Badge
                badgeContent={getBadge()}
                color="primary"
                invisible={!getBadge()}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.6rem",
                    height: 14,
                    minWidth: 14,
                  },
                }}
              >
                <IconButton
                  onClick={(e) => handleEquipment(item, e)}
                  size="small"
                  sx={{ p: 0.25 }}
                  disabled={!!getDefaultUnarmedStrikeInfo()}
                >
                  {item.isEquipped ? (
                    <Icon />
                  ) : !checkIfEquippable(item) ? (
                    <ErrorIcon
                      sx={{ fontSize: "1.1rem", color: "error.main" }}
                    />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: "1.1rem" }} />
                  )}
                </IconButton>
              </Badge>
            </Tooltip>
            {(item.equipType === "weapon" ||
              item.equipType === "custom-weapon") && (
              <>
                {item.isTransforming && (
                  <IconButton
                    onClick={() => handleSwapForm(item)}
                    size="small"
                    sx={{ p: 0.25 }}
                  >
                    <SwapHoriz sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => handleDiceRoll(item)}
                  size="small"
                  sx={{ p: 0.25 }}
                >
                  <Casino sx={{ fontSize: "1.1rem" }} />
                </IconButton>
              </>
            )}
          </Box>
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box
              sx={{
                p: 1,
                ml: { xs: 1, sm: 4 },
                bgcolor: "rgba(0,0,0,0.03)",
                borderRadius: 0,
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  fontFamily: "PT Sans Narrow",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {`${item.cost}z`}
                <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                {t(
                  item.category ||
                    (item.equipType === "armor"
                      ? "Armor"
                      : item.equipType === "shield"
                        ? "Shield"
                        : "Accessory"),
                )}
                {(item.equipType === "weapon" ||
                  item.equipType === "custom-weapon") && (
                  <>
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                    {item.hands === 1 ? t("One-handed") : t("Two-handed")}
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                    {item.melee ? t("Melee") : t("Ranged")}
                  </>
                )}
                {(item.equipType === "armor" ||
                  item.equipType === "shield") && (
                  <>
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                    {t("Initiative")}: {item.init >= 0 ? "+" : ""}
                    {item.init + (item.initModifier || 0)}
                  </>
                )}
                {item.isCustomWeapon &&
                  asArray(
                    item.isSecondaryForm
                      ? item.originalData?.secondCurrentCustomizations
                      : item.originalData?.customizations,
                  ).map((c, i) => (
                    <React.Fragment key={i}>
                      <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                      {t(c.name)}
                    </React.Fragment>
                  ))}
                {item.quality && (
                  <>
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                    <StyledMarkdown
                      allowedElements={["strong", "mark"]}
                      unwrapDisallowed
                    >
                      {highlightMarkdownText(translatedQuality, searchQuery)}
                    </StyledMarkdown>
                  </>
                )}
              </Typography>
            </Box>
          </Collapse>
        </StyledTableCell>
      </TableRow>
    </React.Fragment>
  );
}
