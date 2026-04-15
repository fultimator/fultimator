import React, { useState, useMemo } from "react";
import {
  Grid, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Collapse,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
  Badge, Menu, MenuItem
} from "@mui/material";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import { Martial, MeleeIcon, DistanceIcon, ArmorIcon, ShieldIcon, AccessoryIcon } from "../../../icons";
import Diamond from "../../../Diamond";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import types from "../../../../libs/types";
import attributes from "../../../../libs/attributes";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import { Casino, RadioButtonChecked, SwapHoriz, Edit, Add, Search as SearchIcon } from "@mui/icons-material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { calculateAttribute, calculateCustomWeaponStats } from "../../common/playerCalculations";
import {   deriveVehicleSlots } from "../../equipment/slots/equipmentSlots";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: "4px 8px", color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "4px 8px" });

const StyledMarkdown = ({ children, ...props }) => (
  <div sx={{ whiteSpace: "pre-line", display: "inline" }}>
    <ReactMarkdown
      {...props}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: (p) => <p sx={{ margin: 0, display: "inline" }} {...p} />,
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
      <mark key={`${part}-${idx}`} style={{ backgroundColor: "yellow", padding: 0 }}>{part}</mark>
    ) : (
      part
    )
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

export default function PlayerEquipment({
  player,
  setPlayer,
  isMainTab,
  isEditMode,
  searchQuery = '',
  onAddWeapon,
  onEditWeapon,
  _onAddCustomWeapon,
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
  const [martialWarning, setMartialWarning] = useState(null);

  const getSkillLevel = (player, skillName) =>
    player.classes.flatMap(cls => cls.skills)
      .filter(skill => skill.specialSkill === skillName)
      .reduce((acc, skill) => acc + skill.currentLvl, 0);

  const defensiveMasteryBonus = getSkillLevel(player, "Defensive Mastery");
  const meleeMasteryModifier = getSkillLevel(player, "Melee Weapon Mastery");
  const rangedMasteryModifier = getSkillLevel(player, "Ranged Weapon Mastery");

  // Guardian: Dual Shieldbearer
  const hasDualShieldBearer = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.specialSkill === "Dual Shieldbearer" && skill.currentLvl === 1
    )
  );

  const twinShields = useMemo(() => ({
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
    quality:
      t("Deals extra damage equal to your【 **SL**】in **defensive mastery**."),
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
  }), [defensiveMasteryBonus, t]);

  const inv = player.equipment?.[0];

  const formatCustomWeapon = (customWeapon, forceSecondaryForm = null) => {
    const isTransforming = customWeapon.customizations?.some(
      (c) => c.name === "weapon_customization_transforming"
    );
    const isSecondaryForm = forceSecondaryForm !== null ? forceSecondaryForm : customWeapon.activeForm === "secondary";
    const weaponName = isSecondaryForm ? customWeapon.secondWeaponName || `${customWeapon.name} (Transforming)` : customWeapon.name;
    const stats = calculateCustomWeaponStats(customWeapon, isSecondaryForm);
    const accuracyCheck = isSecondaryForm ? customWeapon.secondSelectedAccuracyCheck : customWeapon.accuracyCheck;
    const damageType = isSecondaryForm ? customWeapon.secondSelectedType : customWeapon.type;
    const category = isSecondaryForm ? customWeapon.secondSelectedCategory : customWeapon.category;
    const quality = isSecondaryForm ? customWeapon.secondQuality : customWeapon.quality;
    const martialCustomizations = ['weapon_customization_quick', 'weapon_customization_magicdefenseboost', 'weapon_customization_powerful'];
    const customizations = isSecondaryForm ? customWeapon.secondCurrentCustomizations || [] : customWeapon.customizations || [];
    const isMartial = customizations.some(c => martialCustomizations.includes(c.name));

    return {
      name: weaponName,
      cost: customWeapon.cost || 300,
      category: category,
      att1: accuracyCheck?.att1 || "dexterity",
      att2: accuracyCheck?.att2 || "might",
      prec: stats.precision,
      damage: stats.damage,
      type: damageType || "physical",
      hands: 2,
      melee: (isSecondaryForm ? customWeapon.secondSelectedRange : customWeapon.range) === "weapon_range_melee",
      ranged: (isSecondaryForm ? customWeapon.secondSelectedRange : customWeapon.range) === "weapon_range_ranged",
      martial: isMartial,
      quality: quality || "",
      isEquipped: customWeapon.isEquipped,
      isCustomWeapon: true,
      isTransforming: isTransforming,
      isSecondaryForm: isSecondaryForm,
      originalData: customWeapon
    };
  };

  const allEquipment = useMemo(() => {
    const items = [];
    if (!inv) return items;

    (inv.weapons || []).forEach((w, i) => items.push({ ...w, equipType: 'weapon', originalIndex: i }));
    (inv.customWeapons || []).forEach((cw, i) => items.push({ ...formatCustomWeapon(cw), equipType: 'custom-weapon', originalIndex: i }));
    (inv.shields || []).forEach((s, i) => items.push({ ...s, equipType: 'shield', originalIndex: i }));
    (inv.armor || []).forEach((a, i) => items.push({ ...a, equipType: 'armor', originalIndex: i }));
    (inv.accessories || []).forEach((acc, i) => items.push({ ...acc, equipType: 'accessory', originalIndex: i }));

    return items;
  }, [inv]);

  const equippedShields = useMemo(() => allEquipment.filter(it => it.equipType === 'shield' && it.isEquipped), [allEquipment]);

  const filteredItems = useMemo(() => {
    let items = [...allEquipment];
    if (isMainTab) {
      items = items.filter(it => it.isEquipped);
      if (hasDualShieldBearer && equippedShields.length >= 2) {
        items.push({ ...twinShields, equipType: 'weapon', isTwinShields: true });
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(it => {
        return t(it.name).toLowerCase().includes(q) ||
          t(it.quality || "").toLowerCase().includes(q) ||
          t(it.category || "").toLowerCase().includes(q);
      });
    }
    return items;
  }, [allEquipment, isMainTab, searchQuery, hasDualShieldBearer, equippedShields, twinShields, t]);

  const groupedItems = useMemo(() => {
    const groups = [
      { 
        label: t("Weapons"), 
        types: ['weapon', 'custom-weapon'], 
        key: 'weapons', 
        compendium: 'weapons',
        col1: t("Accuracy"),
        col2: t("Damage")
      },
      { 
        label: t("Shields"), 
        types: ['shield'], 
        key: 'shields', 
        compendium: 'shields',
        col1: t("DEF"),
        col2: t("M.DEF")
      },
      { 
        label: t("Armor"), 
        types: ['armor'], 
        key: 'armor', 
        compendium: 'armor',
        col1: t("DEF"),
        col2: t("M.DEF")
      },
      { 
        label: t("Accessories"), 
        types: ['accessory'], 
        key: 'accessories', 
        compendium: 'accessories',
        col1: t("Cost"),
        col2: ""
      },
    ];

    return groups.map(g => ({
      ...g,
      items: filteredItems.filter(it => g.types.includes(it.equipType))
    })).filter(g => g.items.length > 0 || (isEditMode && !isMainTab));
  }, [filteredItems, isEditMode, isMainTab, t]);

  // Modifiers
  const equippedArmorItems = allEquipment.filter(it => it.equipType === 'armor' && it.isEquipped);
  const equippedAccessoryItems = allEquipment.filter(it => it.equipType === 'accessory' && it.isEquipped);

  const precMeleeModifier = (player.modifiers?.meleePrec || 0) +
    (equippedArmorItems.length > 0 ? equippedArmorItems[0].precModifier || 0 : 0) +
    equippedShields.reduce((total, s) => total + (s.precModifier || 0), 0) +
    equippedAccessoryItems.reduce((total, a) => total + (a.precModifier || 0), 0) +
    meleeMasteryModifier;

  const precRangedModifier = (player.modifiers?.rangedPrec || 0) +
    (equippedArmorItems.length > 0 ? equippedArmorItems[0].precModifier || 0 : 0) +
    equippedShields.reduce((total, s) => total + (s.precModifier || 0), 0) +
    equippedAccessoryItems.reduce((total, a) => total + (a.precModifier || 0), 0) +
    rangedMasteryModifier;

  const damageMeleeModifier = (equippedArmorItems.length > 0 ? equippedArmorItems[0].damageMeleeModifier || 0 : 0) +
    equippedShields.reduce((total, s) => total + (s.damageMeleeModifier || 0), 0) +
    equippedAccessoryItems.reduce((total, a) => total + (a.damageMeleeModifier || 0), 0);

  const damageRangedModifier = (equippedArmorItems.length > 0 ? equippedArmorItems[0].damageRangedModifier || 0 : 0) +
    equippedShields.reduce((total, s) => total + (s.damageRangedModifier || 0), 0) +
    equippedAccessoryItems.reduce((total, a) => total + (a.damageRangedModifier || 0), 0);

  const currDex = calculateAttribute(player, player.attributes.dexterity, ["slow", "enraged"], ["dexUp"], 6, 12);
  const currInsight = calculateAttribute(player, player.attributes.insight, ["dazed", "enraged"], ["insUp"], 6, 12);
  const currMight = calculateAttribute(player, player.attributes.might, ["weak", "poisoned"], ["migUp"], 6, 12);
  const currWillpower = calculateAttribute(player, player.attributes.willpower, ["shaken", "poisoned"], ["wlpUp"], 6, 12);

  const attributeMap = { dexterity: currDex, insight: currInsight, might: currMight, willpower: currWillpower };

  // Equip helpers
  const patchInv = (p, source, updater) => {
    const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
    const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
    return { ...p, equipment };
  };

  const equipToSlot = (source, itemName, itemIndex, slot, isTwoHand) => {
    if (slot === 'offHand') {
      const mainRef = player.equippedSlots?.mainHand;
      if (mainRef) {
        if (mainRef.source === 'customWeapons') return;
        const inv0 = player.equipment?.[0];
        const mainWeapon = mainRef.index !== undefined ? inv0?.weapons?.[mainRef.index] : inv0?.weapons?.find(w => w.name === mainRef.name);
        if (mainWeapon?.hands === 2 || mainWeapon?.isTwoHand) return;
      }
    }
    const unequipRef = (p, ref) => {
      if (!ref) return p;
      return patchInv(p, ref.source, arr => arr.map((it, idx) => {
        const match = ref.index !== undefined ? idx === ref.index : it.name === ref.name;
        return match ? { ...it, isEquipped: false } : it;
      }));
    };
    let updated = unequipRef(player, player.equippedSlots?.[slot]);
    if (isTwoHand && slot === 'mainHand') updated = unequipRef(updated, updated.equippedSlots?.offHand);
    updated = patchInv(updated, source, arr => arr.map((it, idx) => {
      const match = itemIndex !== undefined ? idx === itemIndex : it.name === itemName;
      return match ? { ...it, isEquipped: true } : it;
    }));
    const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
    setPlayer({
      ...updated,
      equippedSlots: { ...prevSlots, [slot]: { source, name: itemName, index: itemIndex }, ...(isTwoHand && slot === 'mainHand' ? { offHand: null } : {}) },
      vehicleSlots: deriveVehicleSlots(updated),
    });
  };

  const unequipItem = (source, itemName) => {
    const slots = player.equippedSlots ?? {};
    const slotKey = Object.keys(slots).find(k => slots[k]?.source === source && slots[k]?.name === itemName);
    const slotRef = slotKey ? slots[slotKey] : null;
    let updated = patchInv(player, source, arr => arr.map((it, idx) => {
      const match = slotRef?.index !== undefined ? idx === slotRef.index : it.name === itemName;
      return match ? { ...it, isEquipped: false } : it;
    }));
    if (slotKey) {
      const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
      setPlayer({ ...updated, equippedSlots: { ...prevSlots, [slotKey]: null }, vehicleSlots: deriveVehicleSlots(updated) });
    } else {
      setPlayer({ ...updated, vehicleSlots: deriveVehicleSlots(updated) });
    }
  };

  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuWeapon, setSlotMenuWeapon] = useState(null);
  const [shieldMenuAnchor, setShieldMenuAnchor] = useState(null);
  const [shieldMenuItem, setShieldMenuItem] = useState(null);

  const handleWeaponSlotSelect = (slot) => {
    if (slotMenuWeapon) equipToSlot('weapons', slotMenuWeapon.name, slotMenuWeapon.index, slot, false);
    setSlotMenuAnchor(null); setSlotMenuWeapon(null);
  };

  const handleShieldSlotSelect = (slot) => {
    if (shieldMenuItem) equipToSlot('shields', shieldMenuItem.name, shieldMenuItem.index, slot, false);
    setShieldMenuAnchor(null); setShieldMenuItem(null);
  };

  const handleEquipment = (item, event) => {
    if (!setPlayer || !isEditMode || item.isTwinShields) return;
    const eq0 = player.equipment?.[0];
    if (item.equipType === 'custom-weapon') {
      const cw = item.originalData;
      const cwIndex = eq0?.customWeapons?.findIndex(w => w === cw) ?? -1;
      if (cw.isEquipped) unequipItem('customWeapons', cw.name);
      else equipToSlot('customWeapons', cw.name, cwIndex >= 0 ? cwIndex : undefined, 'mainHand', true);
      return;
    }
    const source = item.equipType === 'weapon' ? 'weapons' : item.equipType === 'shield' ? 'shields' : item.equipType === 'armor' ? 'armor' : 'accessories';
    const arr = eq0?.[source] ?? [];
    const idx = arr.findIndex(it => it.name === item.name);
    if (idx === -1) return;
    const invItem = arr[idx];

    if (invItem.isEquipped) {
      unequipItem(source, invItem.name);
    } else {
      if (item.equipType === 'shield') {
        if (hasDualShieldBearer && event) { setShieldMenuAnchor({ top: event.clientY, left: event.clientX }); setShieldMenuItem({ name: invItem.name, index: idx }); }
        else equipToSlot('shields', invItem.name, idx, 'offHand', false);
      } else if (item.equipType === 'armor') {
        equipToSlot('armor', invItem.name, idx, 'armor', false);
      } else if (item.equipType === 'weapon') {
        const isTwoHand = invItem.hands === 2 || invItem.isTwoHand;
        if (isTwoHand) equipToSlot('weapons', invItem.name, idx, 'mainHand', true);
        else if (event) { setSlotMenuAnchor({ top: event.clientY, left: event.clientX }); setSlotMenuWeapon({ name: invItem.name, index: idx }); }
        else {
          const slots = player.equippedSlots ?? {};
          const slot = !slots.mainHand ? 'mainHand' : !slots.offHand ? 'offHand' : null;
          if (slot) equipToSlot('weapons', invItem.name, idx, slot, false);
        }
      } else if (item.equipType === 'accessory') {
        equipToSlot('accessories', invItem.name, idx, 'accessory', false);
      }
    }
  };

  const checkIfEquippable = (item) => {
    if (!item.martial) return true;
    return player.classes.some(cls => {
      const martials = cls.benefits.martials;
      if (!martials) return false;
      if ((item.equipType === 'weapon' || item.equipType === 'custom-weapon') && ((item.melee && martials.melee) || (item.ranged && martials.ranged))) return true;
      if (item.equipType === 'armor' && martials.armor) return true;
      if (item.equipType === 'shield' && martials.shield) return true;
      return false;
    });
  };

  const handleEquipmentGuarded = (item, event) => {
    if (!item.isEquipped && !checkIfEquippable(item)) { setMartialWarning({ item, event }); return; }
    handleEquipment(item, event);
  };

  const handleSwapForm = (item) => {
    if (!setPlayer || !isEditMode || !item.originalData) return;
    setPlayer(prev => {
      const cwList = prev.equipment?.[0]?.customWeapons ?? [];
      const idx = cwList.findIndex(w => w === item.originalData);
      if (idx === -1) return prev;
      const updated = cwList.map((cw, i) => i === idx ? { ...cw, activeForm: cw.activeForm === 'secondary' ? 'primary' : 'secondary' } : cw);
      return { ...prev, equipment: [{ ...prev.equipment[0], customWeapons: updated }, ...(prev.equipment?.slice(1) ?? [])] };
    });
  };

  const handleDiceRoll = (weapon) => {
    setCurrentWeapon(weapon);
    const v1 = attributeMap[weapon.att1], v2 = attributeMap[weapon.att2];
    const d1 = Math.floor(Math.random() * v1) + 1, d2 = Math.floor(Math.random() * v2) + 1;
    const isCritFail = d1 === 1 && d2 === 1, isCritSucc = d1 >= 6 && d2 >= 6 && d1 === d2;
    const acc = d1 + d2 + weapon.prec + (weapon.melee ? precMeleeModifier : precRangedModifier);
    const dmg = Math.max(d1, d2) + weapon.damage + (weapon.melee ? damageMeleeModifier : damageRangedModifier);

    const content = (
      <Grid container spacing={2} sx={{ textAlign: "center" }}>
        <Grid  size={6}><Typography variant="h3">{t("Accuracy")}</Typography><Typography variant="h1">{acc}</Typography></Grid>
        <Grid  size={6}><Typography variant="h3">{t("Damage")}</Typography><Typography variant="h1">{dmg}</Typography><Typography variant="h6">{t(weapon.type)}</Typography></Grid>
        <Grid  sx={{ mt: 2 }} size={12}>
          <Typography>{`${d1} [${attributes[weapon.att1].shortcaps}] + ${d2} [${attributes[weapon.att2].shortcaps}] ${weapon.prec !== 0 ? (weapon.prec > 0 ? "+" : "") + weapon.prec : ""} ${weapon.melee ? (precMeleeModifier !== 0 ? (precMeleeModifier > 0 ? "+" : "") + precMeleeModifier : "") : (precRangedModifier !== 0 ? (precRangedModifier > 0 ? "+" : "") + precRangedModifier : "")}`}</Typography>
          <Typography sx={{ fontWeight: "bold" }}>{t("Damage")}: {`max(${d1}, ${d2}) + ${weapon.damage} ${weapon.melee ? (damageMeleeModifier !== 0 ? (damageMeleeModifier > 0 ? "+" : "") + damageMeleeModifier : "") : (damageRangedModifier !== 0 ? (damageRangedModifier > 0 ? "+" : "") + damageRangedModifier : "")}`}</Typography>
        </Grid>
      </Grid>
    );
    if (isCritFail) { setDialogSeverity("error"); setDialogMessage(<><Typography variant="h1">{t("Critical Failure")}!</Typography>{content}</>); }
    else if (isCritSucc) { setDialogSeverity("success"); setDialogMessage(<><Typography variant="h1">{t("Critical Success")}!</Typography>{content}</>); }
    else { setDialogSeverity("info"); setDialogMessage(content); }
    setDialogOpen(true);
  };

  const handleEditItem = (item) => {
    if (item.equipType === 'weapon') onEditWeapon?.(item.originalIndex);
    else if (item.equipType === 'custom-weapon') onEditCustomWeapon?.(item.originalIndex);
    else if (item.equipType === 'armor') onEditArmor?.(item.originalIndex);
    else if (item.equipType === 'shield') onEditShield?.(item.originalIndex);
    else if (item.equipType === 'accessory') onEditAccessory?.(item.originalIndex);
  };

  const handleImportFromCompendium = (item, type) => {
    if (!setPlayer) return;
    setPlayer(prev => {
      const source = type === 'weapons' ? 'weapons' : type === 'armor' ? 'armor' : type === 'shields' ? 'shields' : type === 'custom-weapons' ? 'customWeapons' : 'accessories';
      let newItem;
      if (type === 'weapons') newItem = { base: item, name: item.name, category: item.category || "", melee: item.melee || false, ranged: !item.melee, type: item.type, hands: item.hands, att1: item.att1, att2: item.att2, martial: item.martial || false, quality: "", cost: item.cost || 0, damage: item.damage || 0, prec: item.prec || 0, isEquipped: false };
      else if (type === 'armor' || type === 'shields') newItem = { base: item, name: item.name, quality: "", category: type === 'armor' ? "Armor" : "Shield", martial: item.martial || false, def: item.def || item.defbonus || 0, mdef: item.mdef || item.mdefbonus || 0, init: item.init || 0, cost: item.cost || 0, isEquipped: false };
      else newItem = { ...item, isEquipped: false };
      return patchInv(prev, source, arr => [...arr, newItem]);
    });
  };

  const handleAddAction = (group) => {
    if (group.key === 'weapons') onAddWeapon?.();
    else if (group.key === 'armor') onAddArmor?.();
    else if (group.key === 'shields') onAddShield?.();
    else if (group.key === 'accessories') onAddAccessory?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {groupedItems.map((group) => (
        <TableContainer key={group.key} component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ tableLayout: "fixed", minWidth: 400 }}>
            <TableHead>
              <TableRow sx={{ background: theme.primary }}>
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4" sx={{ textTransform: "uppercase", color: "#fff", textAlign: "center" }}>{group.label}</Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: { xs: 70, sm: 120 }, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: 'uppercase', color: '#fff', opacity: 0.8, fontSize: '0.65rem' }}>{group.col1}</Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: { xs: 70, sm: 120 }, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: 'uppercase', color: '#fff', opacity: 0.8, fontSize: '0.65rem' }}>{group.col2}</Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: { xs: 90, sm: 100 }, textAlign: "right" }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                    {isEditMode && !isMainTab && (
                      <>
                        <Tooltip title={`${t("Add")} ${group.label}`}><IconButton size="small" onClick={() => handleAddAction(group)} sx={{ color: '#fff', p: 0 }}><Add fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title={t("Search Compendium")}><IconButton size="small" onClick={() => setCompendiumType(group.compendium)} sx={{ color: '#fff', p: 0 }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                      </>
                    )}
                    {!isEditMode && <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: 'uppercase', color: '#fff', opacity: 0.8, fontSize: '0.65rem' }}>{t("Actions")}</Typography>}
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
                  toggleRow={(key) => toggleRow('equipment', key)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}
      {!isMainTab && (precMeleeModifier !== 0 || precRangedModifier !== 0 || damageMeleeModifier !== 0 || damageRangedModifier !== 0) && (
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>{t("Modifiers")}</Typography>
          {precMeleeModifier !== 0 && <Typography variant="h6">{t("Melee Accuracy Bonus")}: {precMeleeModifier}</Typography>}
          {precRangedModifier !== 0 && <Typography variant="h6">{t("Ranged Accuracy Bonus")}: {precRangedModifier}</Typography>}
          {damageMeleeModifier !== 0 && <Typography variant="h6">{t("Melee Damage Bonus")}: {damageMeleeModifier}</Typography>}
          {damageRangedModifier !== 0 && <Typography variant="h6">{t("Ranged Damage Bonus")}: {damageRangedModifier}</Typography>}
        </Box>
      )}
      <Menu open={Boolean(slotMenuAnchor)} onClose={() => setSlotMenuAnchor(null)} anchorReference="anchorPosition" anchorPosition={slotMenuAnchor ?? undefined}>
        <MenuItem onClick={() => handleWeaponSlotSelect('mainHand')}>{t("Main Hand")}</MenuItem>
        <MenuItem onClick={() => handleWeaponSlotSelect('offHand')}>{t("Off Hand")}</MenuItem>
      </Menu>
      <Menu open={Boolean(shieldMenuAnchor)} onClose={() => setShieldMenuAnchor(null)} anchorReference="anchorPosition" anchorPosition={shieldMenuAnchor ?? undefined}>
        <MenuItem onClick={() => handleShieldSlotSelect('mainHand')}>{t("Main Hand")}</MenuItem>
        <MenuItem onClick={() => handleShieldSlotSelect('offHand')}>{t("Off Hand")}</MenuItem>
      </Menu>
      <CompendiumViewerModal open={compendiumType !== null} onClose={() => setCompendiumType(null)} onAddItem={handleImportFromCompendium} initialType={compendiumType ?? "weapons"} restrictToTypes={compendiumType ? [compendiumType] : undefined} context="player" />
      {martialWarning && (
        <Dialog open onClose={() => setMartialWarning(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}><WarningAmberIcon fontSize="small" />{t('Not Proficient')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2"><strong>{martialWarning.item?.name}</strong> {t('is a martial item and your character is not proficient with it.')}</Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>{t('Equipping it without proficiency may be against the rules. Equip anyway?')}</Typography>
          </DialogContent>
          <DialogActions><Button onClick={() => setMartialWarning(null)}>{t('Cancel')}</Button><Button color="warning" variant="contained" onClick={() => { handleEquipment(martialWarning.item, martialWarning.event); setMartialWarning(null); }}>{t('Equip Anyway')}</Button></DialogActions>
        </Dialog>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} slotProps={{
        paper: { sx: { width: { xs: "90%", md: "30%" } } }
      }}>
        <DialogTitle variant="h3" sx={{ backgroundColor: dialogSeverity === "error" ? "#bb2124" : dialogSeverity === "success" ? "#22bb33" : "#aaaaaa" }}>{t("Result")}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>{dialogMessage}</DialogContent>
        <DialogActions><Button onClick={() => setDialogOpen(false)}>{t("Close")}</Button><Button onClick={() => handleDiceRoll(currentWeapon)}>{t("Re-roll")}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

function EquipmentRow({ item, player, isEditMode, searchQuery, handleEquipment, handleDiceRoll, handleSwapForm, handleEdit, checkIfEquippable, theme, t, openRows, toggleRow }) {
  const rowKey = `equipment-${item.equipType}-${item.originalIndex || (item.isTwinShields ? 'twin' : 'new')}`;
  const translatedQuality = t(item.quality || "");
  const isDescriptionMatch = !!searchQuery?.trim() && translatedQuality.toLowerCase().includes(searchQuery.trim().toLowerCase());
  const isOpen = !!openRows[rowKey] || isDescriptionMatch;

  const getBadge = () => {
    if (!item.isEquipped) return null;
    const slots = player.equippedSlots ?? {};
    if (item.equipType === 'weapon' || item.equipType === 'custom-weapon') {
      const source = item.equipType === 'custom-weapon' ? 'customWeapons' : 'weapons';
      const name = item.equipType === 'custom-weapon' ? item.originalData?.name : item.name;
      if (slots.mainHand?.source === source && slots.mainHand?.name === name) return (item.hands === 2 || item.isTwoHand || item.equipType === 'custom-weapon') ? 'M+O' : 'M';
      if (slots.offHand?.source === source && slots.offHand?.name === name) return 'O';
    } else if (item.equipType === 'shield') {
      if (slots.mainHand?.source === 'shields' && slots.mainHand?.name === item.name) return 'M';
      if (slots.offHand?.source === 'shields' && slots.offHand?.name === item.name) return 'O';
    } else if (item.equipType === 'armor' || item.equipType === 'accessory') return 'E';
    return null;
  };

  const renderStats = () => {
    if (item.equipType === 'weapon' || item.equipType === 'custom-weapon') {
      return (
        <>
          <StyledTableCell sx={{ width: { xs: 70, sm: 120 } }}>
            <Typography sx={{ textAlign: "center" }}><OpenBracket />{`${attributes[item.att1].shortcaps} + ${attributes[item.att2].shortcaps}`}<CloseBracket />{item.prec !== 0 ? (item.prec > 0 ? "+" : "") + item.prec : ""}</Typography>
          </StyledTableCell>
          <StyledTableCell sx={{ width: { xs: 70, sm: 120 } }}>
            <Typography sx={{ textAlign: "center" }}><OpenBracket />{t("HR")} {item.damage >= 0 ? "+" : ""} {item.damage}<CloseBracket />{types[item.type].long}</Typography>
          </StyledTableCell>
        </>
      );
    }
    if (item.equipType === 'armor' || item.equipType === 'shield') {
      return (
        <>
          <StyledTableCell sx={{ width: { xs: 70, sm: 120 } }}>
            <Typography sx={{ textAlign: "center" }}>
              {/* <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5 }}>{t("DEF")}:</Box> */}
              {item.equipType === 'shield' ? `+${item.def + (item.defModifier || 0)}` : (item.martial ? item.def + (item.defModifier || 0) : (item.def + (item.defModifier || 0) === 0 ? t("DEX die") : `${t("DEX die")} + ${item.def + (item.defModifier || 0)}`))}
            </Typography>
          </StyledTableCell>
          <StyledTableCell sx={{ width: { xs: 70, sm: 120 } }}>
            <Typography sx={{ textAlign: "center" }}>
              {/* <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5 }}>{t("M.DEF")}:</Box> */}
              {item.equipType === 'shield' ? `+${item.mdef + (item.mDefModifier || 0)}` : (item.mdef + (item.mDefModifier || 0) === 0 ? t("INS die") : `${t("INS die")} + ${item.mdef + (item.mDefModifier || 0)}`)}
            </Typography>
          </StyledTableCell>
        </>
      );
    }
    return (
      <>
        <StyledTableCell sx={{ width: { xs: 70, sm: 120 } }}><Typography sx={{ textAlign: "center" }}>{`${item.cost}z`}</Typography></StyledTableCell>
        <StyledTableCell sx={{ width: { xs: 70, sm: 120 } }} />
      </>
    );
  };

  const Icon = (item.equipType === 'weapon' || item.equipType === 'custom-weapon') ? (item.melee ? MeleeIcon : DistanceIcon) : item.equipType === 'armor' ? ArmorIcon : item.equipType === 'shield' ? ShieldIcon : AccessoryIcon;

  return (
    <React.Fragment>
      <TableRow sx={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.02)' : 'inherit' }}>
        <StyledTableCell sx={{ width: 36 }}>
          <IconButton onClick={(e) => { e.stopPropagation(); toggleRow(rowKey); }} size="small" sx={{ p: 0.5 }}>{isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}</IconButton>
        </StyledTableCell>
        <StyledTableCell onClick={(e) => { e.stopPropagation(); toggleRow(rowKey); }} sx={{ cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} noWrap>{highlightMatch(t(item.name), searchQuery)}</Typography>
            {item.martial && <Martial />}
          </Box>
        </StyledTableCell>
        {renderStats()}
        <StyledTableCell sx={{ width: { xs: 90, sm: 100 }, textAlign: 'right' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {isEditMode && <IconButton onClick={() => handleEdit(item)} size="small" sx={{ p: 0.25 }}><Edit sx={{ fontSize: '1.1rem' }} /></IconButton>}
            <Tooltip title={checkIfEquippable(item) ? t("Equip") : t("Not proficient")} arrow>
              <Badge badgeContent={getBadge()} color="primary" invisible={!getBadge()} sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}>
                <IconButton onClick={(e) => handleEquipment(item, e)} size="small" sx={{ p: 0.25 }}>
                  {item.isEquipped && item.equipType !== 'weapon' && item.equipType !== 'custom-weapon' ? <RadioButtonChecked sx={{ fontSize: '1.1rem' }} /> : <Icon />}
                  {!item.isEquipped && !checkIfEquippable(item) && <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '1.1rem', position: 'absolute' }} />}
                </IconButton>
              </Badge>
            </Tooltip>
            {(item.equipType === 'weapon' || item.equipType === 'custom-weapon') && (
              <>
                {item.isTransforming && <IconButton onClick={() => handleSwapForm(item)} size="small" sx={{ p: 0.25 }}><SwapHoriz sx={{ fontSize: '1.1rem' }} /></IconButton>}
                <IconButton onClick={() => handleDiceRoll(item)} size="small" sx={{ p: 0.25 }}><Casino sx={{ fontSize: '1.1rem' }} /></IconButton>
              </>
            )}
          </Box>
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <StyledTableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ p: 1, ml: { xs: 1, sm: 4 }, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 0 }}>
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontFamily: "PT Sans Narrow", display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                {`${item.cost}z`}<Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                {t(item.category || (item.equipType === 'armor' ? 'Armor' : item.equipType === 'shield' ? 'Shield' : 'Accessory'))}
                {(item.equipType === 'weapon' || item.equipType === 'custom-weapon') && (
                  <>
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />{item.hands === 1 ? t("One-handed") : t("Two-handed")}
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />{item.melee ? t("Melee") : t("Ranged")}
                  </>
                )}
                {(item.equipType === 'armor' || item.equipType === 'shield') && (
                  <>
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />{t("Initiative")}: {item.init >= 0 ? "+" : ""}{item.init + (item.initModifier || 0)}
                  </>
                )}
                {item.isCustomWeapon && (item.isSecondaryForm ? item.originalData.secondCurrentCustomizations : item.originalData.customizations || []).map((c, i) => (
                  <React.Fragment key={i}><Diamond color={theme.primary} sx={{ mx: 0.5 }} />{t(c.name)}</React.Fragment>
                ))}
                {item.quality && (
                  <>
                    <Diamond color={theme.primary} sx={{ mx: 0.5 }} />
                    <StyledMarkdown allowedElements={["strong", "mark"]} unwrapDisallowed>{highlightMarkdownText(translatedQuality, searchQuery)}</StyledMarkdown>
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
