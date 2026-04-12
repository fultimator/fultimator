import React, { Fragment, useState } from "react";
import { Paper, Grid, Typography, Divider, Card, Box, Dialog, DialogTitle, DialogContent, ButtonGroup, Button, Tabs, Tab, TextField, TableHead, TableRow, InputBase, IconButton, TableCell, Select, MenuItem, Tooltip, Menu } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import avatar_image from "../../../avatar.jpg";
import Diamond from "../../../Diamond";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { ArrowDropDown, Search, Clear, Add, Remove, Lock, LockOpen } from "@mui/icons-material";
import PlayerWeaponModal from "../../equipment/weapons/PlayerWeaponModal";
import PlayerCustomWeaponModal from "../../equipment/customWeapons/PlayerCustomWeaponModal";
import PlayerArmorModal from "../../equipment/armor/PlayerArmorModal";
import PlayerShieldModal from "../../equipment/shields/PlayerShieldModal";
import PlayerAccessoryModal from "../../equipment/accessories/PlayerAccessoryModal";
import { MeleeIcon, ArmorIcon, ShieldIcon, AccessoryIcon } from "../../../icons";
import { deriveVehicleSlots, validateSlots, syncSlots, isItemEquipped } from "../../equipment/slots/equipmentSlots";
import AddSkillModal from "../../classes/AddSkillModal";
import PlayerClassCard from "../../classes/PlayerClassCard";
import classList from "../../../../libs/classes";
import { useSpellModals } from "../../common/hooks/useSpellModals";
import SpellDefaultModal from "../../spells/SpellDefaultModal";
import SpellArcanistModal from "../../spells/SpellArcanistModal";
import SpellEntropistGambleModal from "../../spells/SpellEntropistGambleModal";
import SpellSymbolistModal from "../../spells/SpellSymbolistModal";
import SpellDancerModal from "../../spells/SpellDancerModal";
import SpellGiftModal from "../../spells/SpellGiftModal";
import SpellMutantModal from "../../spells/SpellMutantModal";
import SpellPilotModal from "../../spells/SpellPilotModal";
import SpellPilotVehiclesModal from "../../spells/SpellPilotVehiclesModal";
import SpellMagiseedModal from "../../spells/SpellMagiseedModal";
import SpellGourmetModal from "../../spells/SpellGourmetModal";
import SpellInvokerModal from "../../spells/SpellInvokerModal";
import SpellTinkererAlchemyRankModal from "../../spells/SpellTinkererAlchemyRankModal";
import SpellTinkererInfusionModal from "../../spells/SpellTinkererInfusionModal";
import SpellTinkererMagitechRankModal from "../../spells/SpellTinkererMagitechRankModal";
import SpellDeckModal from "../../spells/SpellDeckModal";
import UnifiedSpellModal from "../../spells/modals/UnifiedSpellModal";
import GeneralSection from "../../spells/sections/GeneralSection";
import MagichantKeysContentSection from "../../spells/sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "../../spells/sections/MagichantTonesContentSection";
import PlayerNoteModal from "../../informations/PlayerNoteModal";
import ReactMarkdown from "react-markdown";
import { fontSize, styled, width } from "@mui/system";
import { TypeAffinity } from "../../../types";
import PlayerEquipment from "./PlayerEquipment";
import PlayerClasses from "./PlayerClasses";
import PlayerSpells from "./PlayerSpells";
import PlayerRituals from "./PlayerRituals";
import PlayerQuirk from "./PlayerQuirk";
import PlayerCampActivities from "./PlayerCampActivities";
import PlayerZeroPower from "./PlayerZeroPower";
import PlayerOthers from "./PlayerOthers";
import PlayerNotes from "./PlayerNotes";
import PlayerBonds from "./PlayerBonds";
import PlayerVehicle from "./PlayerVehicle";
import PlayerCompanion from "./PlayerCompanion";
import CompactLoadout from "./CompactLoadout";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { calculateAttribute } from "../../common/playerCalculations";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

const AffinityGrid = styled(Grid)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderImage: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.background.paper}) 1`,
    marginLeft: theme.spacing(0.25),

}));

export default function PlayerCardSheet({
    player,
    setPlayer,
    isMainTab,
    isEditMode,
    isCharacterSheet,
    optionalRules = { quirks: false, campActivities: false, zeroPower: false, technospheres: false },
    characterImage,
    id,
    updateMaxStats,
    onToggleEditMode,
    onAddClass,
    onAddFeature,
}) {
    const { t } = useTranslate();
    const theme = useCustomTheme();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
    const [value, setValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    // ── Equipment modal state ──────────────────────────────────────────────
    const [openNewWeapon, setOpenNewWeapon] = useState(false);
    const [editWeaponIndex, setEditWeaponIndex] = useState(null);
    const [weapon, setWeapon] = useState(null);

    const [openNewCustomWeapon, setOpenNewCustomWeapon] = useState(false);
    const [editCustomWeaponIndex, setEditCustomWeaponIndex] = useState(null);
    const [customWeapon, setCustomWeapon] = useState(null);

    const [openNewArmor, setOpenNewArmor] = useState(false);
    const [editArmorIndex, setEditArmorIndex] = useState(null);
    const [armor, setArmor] = useState(null);

    const [openNewShields, setOpenNewShields] = useState(false);
    const [editShieldIndex, setEditShieldIndex] = useState(null);
    const [shields, setShields] = useState(null);

    const [openNewAccessory, setOpenNewAccessory] = useState(false);
    const [editAccessoryIndex, setEditAccessoryIndex] = useState(null);
    const [accessory, setAccessory] = useState(null);

    const [openNoteModal, setOpenNoteModal] = useState(false);
    const [editNoteIndex, setEditNoteIndex] = useState(null);
    const [noteBeingEdited, setNoteBeingEdited] = useState(null);

    const [equipMenuAnchor, setEquipMenuAnchor] = useState(null);

    // ── Equipment helpers (mirrors EditPlayerEquipment) ────────────────────
    const patchInv = (p, source, updater) => {
        const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
        const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
        return { ...p, equipment };
    };

    const preserveSlots = (p) => {
        const validated = validateSlots(p);
        return { ...validated, vehicleSlots: deriveVehicleSlots(validated) };
    };

    // Add
    const handleAddWeapon = (w) => setPlayer(preserveSlots(patchInv(player, 'weapons', arr => [...arr, w])));
    const handleAddCustomWeapon = (cw) => setPlayer(preserveSlots(patchInv(player, 'customWeapons', arr => [...arr, cw])));
    const handleAddArmor = (a) => setPlayer(preserveSlots(patchInv(player, 'armor', arr => [...arr, a])));
    const handleAddShield = (s) => setPlayer(preserveSlots(patchInv(player, 'shields', arr => [...arr, s])));
    const handleAddAccessory = (ac) => setPlayer(preserveSlots(patchInv(player, 'accessories', arr => [...arr, ac])));

    // Delete
    const handleDeleteWeapon = (i) => setPlayer(preserveSlots(patchInv(player, 'weapons', arr => arr.filter((_, idx) => idx !== i))));
    const handleDeleteCustomWeapon = (i) => setPlayer(preserveSlots(patchInv(player, 'customWeapons', arr => arr.filter((_, idx) => idx !== i))));
    const handleDeleteArmor = (i) => setPlayer(preserveSlots(patchInv(player, 'armor', arr => arr.filter((_, idx) => idx !== i))));
    const handleDeleteShield = (i) => setPlayer(preserveSlots(patchInv(player, 'shields', arr => arr.filter((_, idx) => idx !== i))));
    const handleDeleteAccessory = (i) => setPlayer(preserveSlots(patchInv(player, 'accessories', arr => arr.filter((_, idx) => idx !== i))));

    // Save (add or edit)
    const handleSaveWeapon = (w) => {
        if (editWeaponIndex !== null) setPlayer(preserveSlots(patchInv(player, 'weapons', arr => arr.map((x, i) => i === editWeaponIndex ? w : x))));
        else handleAddWeapon(w);
        setOpenNewWeapon(false);
    };
    const handleSaveCustomWeapon = (cw) => {
        if (editCustomWeaponIndex !== null) setPlayer(preserveSlots(patchInv(player, 'customWeapons', arr => arr.map((x, i) => i === editCustomWeaponIndex ? cw : x))));
        else handleAddCustomWeapon(cw);
        setOpenNewCustomWeapon(false);
    };
    const handleSaveArmor = (a) => {
        if (editArmorIndex !== null) setPlayer(preserveSlots(patchInv(player, 'armor', arr => arr.map((x, i) => i === editArmorIndex ? a : x))));
        else handleAddArmor(a);
        setOpenNewArmor(false);
    };
    const handleSaveShield = (s) => {
        if (editShieldIndex !== null) setPlayer(preserveSlots(patchInv(player, 'shields', arr => arr.map((x, i) => i === editShieldIndex ? s : x))));
        else handleAddShield(s);
        setOpenNewShields(false);
    };
    const handleSaveAccessory = (ac) => {
        if (editAccessoryIndex !== null) setPlayer(preserveSlots(patchInv(player, 'accessories', arr => arr.map((x, i) => i === editAccessoryIndex ? ac : x))));
        else handleAddAccessory(ac);
        setOpenNewAccessory(false);
    };

    // Note handlers
    const handleSaveNote = (note) => {
        if (editNoteIndex !== null) {
            setPlayer(prev => ({
                ...prev,
                notes: prev.notes.map((n, i) => i === editNoteIndex ? note : n)
            }));
        } else {
            setPlayer(prev => ({
                ...prev,
                notes: [...(prev.notes || []), note]
            }));
        }
        setOpenNoteModal(false);
    };

    const handleDeleteNote = (index) => {
        setPlayer(prev => ({
            ...prev,
            notes: prev.notes.filter((_, i) => i !== index)
        }));
        setOpenNoteModal(false);
    };

    // Open add modals
    const openAddWeapon = () => { setWeapon(null); setEditWeaponIndex(null); setOpenNewWeapon(true); setEquipMenuAnchor(null); };
    const openAddCustomWeapon = () => { setCustomWeapon(null); setEditCustomWeaponIndex(null); setOpenNewCustomWeapon(true); setEquipMenuAnchor(null); };
    const openAddArmor = () => { setArmor(null); setEditArmorIndex(null); setOpenNewArmor(true); setEquipMenuAnchor(null); };
    const openAddShield = () => { setShields(null); setEditShieldIndex(null); setOpenNewShields(true); setEquipMenuAnchor(null); };
    const openAddAccessory = () => { setAccessory(null); setEditAccessoryIndex(null); setOpenNewAccessory(true); setEquipMenuAnchor(null); };

    // Notes
    const handleAddNote = () => {
        setNoteBeingEdited(null);
        setEditNoteIndex(null);
        setOpenNoteModal(true);
    };

    const handleOpenEditNote = (index) => {
        setNoteBeingEdited(player.notes[index]);
        setEditNoteIndex(index);
        setOpenNoteModal(true);
    };

    // ── Class management ──────────────────────────────────────────────────────
    const [editClassIndex, setEditClassIndex] = useState(null);
    const [openClassCard, setOpenClassCard] = useState(false);

    const handleAddBlankClass = (name) => {
        const exists = player.classes.some(c => c.name.toLowerCase() === name.toLowerCase());
        if (exists) { alert(t("This class type already exists for the character")); return; }
        setPlayer(prev => ({ ...prev, classes: [...prev.classes, { name, lvl: 1, benefits: { hpplus: 0, mpplus: 0, ipplus: 0, rituals: {}, martials: {}, custom: [] }, skills: [], heroic: { name: "", description: "" }, spells: [], isHomebrew: true }] }));
        if (updateMaxStats) updateMaxStats();
    };

    const handleAddClassFromCompendium = (item) => {
        const name = item.name;
        const exists = player.classes.some(c => c.name.toLowerCase() === name.toLowerCase());
        if (exists) { alert(t("This class type already exists for the character")); return; }
        const src = classList.find(c => c.name === name);
        const newClass = src ? {
            name,
            lvl: 1,
            benefits: src.benefits,
            skills: [...src.skills].sort((a, b) => a.skillName < b.skillName ? -1 : 1),
            heroic: { name: "", description: "" },
            spells: [],
            isHomebrew: false,
        } : { name, lvl: 1, benefits: { hpplus: 0, mpplus: 0, ipplus: 0, rituals: {}, martials: {}, custom: [] }, skills: [], heroic: { name: "", description: "" }, spells: [], isHomebrew: false };
        setPlayer(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
        if (updateMaxStats) updateMaxStats();
    };

    const handleOpenEditClass = (idx) => { setEditClassIndex(idx); setOpenClassCard(true); };

    // Class edit callbacks (passed to PlayerClassCard)
    const handleClassLevelChange = (classIdx, newLevel) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, lvl: newLevel } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassSaveBenefits = (classIdx, benefits) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, benefits } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassAddSkill = (className, skillName, maxLevel, description, specialSkill) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map(c => c.name === className ? { ...c, skills: [...c.skills, { skillName, currentLvl: 1, maxLvl: maxLevel, description, specialSkill }] } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassEditSkill = (className, skillIndex, skillName, maxLevel, description, specialSkill) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map(c => c.name === className ? { ...c, skills: c.skills.map((s, i) => i === skillIndex ? { ...s, skillName, maxLvl: parseInt(maxLevel), currentLvl: Math.min(s.currentLvl, parseInt(maxLevel)), description, specialSkill } : s) } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassDeleteSkill = (classIdx, skillIndex) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, skills: c.skills.filter((_, si) => si !== skillIndex) } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassIncreaseSkill = (classIdx, skillIndex) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, skills: c.skills.map((s, si) => si === skillIndex && s.currentLvl < s.maxLvl ? { ...s, currentLvl: s.currentLvl + 1 } : s) } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassDecreaseSkill = (classIdx, skillIndex) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, skills: c.skills.map((s, si) => si === skillIndex && s.currentLvl > 0 ? { ...s, currentLvl: s.currentLvl - 1 } : s) } : c) }));
        if (updateMaxStats) updateMaxStats();
    };
    const handleClassEditName = (classIdx, newName) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, name: newName } : c) }));
    };
    const handleClassEditHeroic = (classIdx, newHeroic) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, heroic: newHeroic } : c) }));
    };
    const handleClassRemove = () => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.filter((_, i) => i !== editClassIndex) }));
        if (updateMaxStats) updateMaxStats();
        setOpenClassCard(false);
    };
    const handleClassEditCompanion = (classIdx, companion) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map((c, i) => i === classIdx ? { ...c, companion } : c) }));
    };

    // ── Skill modal (standalone, from compact classes view) ──────────────────
    const [openSkillModal, setOpenSkillModal] = useState(false);
    const [editSkillClassIdx, setEditSkillClassIdx] = useState(null);
    const [editSkillIdx, setEditSkillIdx] = useState(null);
    const [skillName, setSkillName] = useState("");
    const [skillMaxLevel, setSkillMaxLevel] = useState(1);
    const [skillDescription, setSkillDescription] = useState("");
    const [skillSpecial, setSkillSpecial] = useState("");

    const openAddSkillForClass = (classIdx) => {
        setEditSkillClassIdx(classIdx);
        setEditSkillIdx(null);
        setSkillName(""); setSkillMaxLevel(1); setSkillDescription(""); setSkillSpecial("");
        setOpenSkillModal(true);
    };
    const openEditSkillForClass = (classIdx, skillIdx) => {
        const skill = player.classes[classIdx]?.skills[skillIdx];
        if (!skill) return;
        setEditSkillClassIdx(classIdx);
        setEditSkillIdx(skillIdx);
        setSkillName(skill.skillName); setSkillMaxLevel(skill.maxLvl); setSkillDescription(skill.description); setSkillSpecial(skill.specialSkill || "");
        setOpenSkillModal(true);
    };
    const handleSkillModalSave = () => {
        const cls = player.classes[editSkillClassIdx];
        if (!cls) return;
        if (editSkillIdx !== null) {
            handleClassEditSkill(cls.name, editSkillIdx, skillName, skillMaxLevel, skillDescription, skillSpecial);
        } else {
            handleClassAddSkill(cls.name, skillName, skillMaxLevel, skillDescription, skillSpecial);
        }
        setOpenSkillModal(false);
    };
    const handleSkillModalDelete = () => {
        handleClassDeleteSkill(editSkillClassIdx, editSkillIdx);
        setOpenSkillModal(false);
    };

    // ── Spell modals ─────────────────────────────────────────────────────────
    const { isOpen: isSpellOpen, openModal: openSpellModal, closeModal: closeSpellModal, spellBeingEdited, editingSpellClass, editingSpellIndex } = useSpellModals();

    const handleEditSpell = (classIdx, spellIdx, spell) => {
        const cls = player.classes[classIdx];
        if (!cls) return;
        const spellType = spell.spellType;
        let modalName = "default";
        if (spellType === "arcanist" || spellType === "arcanist-rework") modalName = "arcanist";
        else if (spellType === "gamble") modalName = "gamble";
        else if (spellType === "magichant") modalName = "chanter";
        else if (spellType === "symbol") modalName = "symbolist";
        else if (spellType === "dance") modalName = "dancer";
        else if (spellType === "gift") modalName = "gift";
        else if (spellType === "therioform") modalName = "mutant";
        else if (spellType === "pilot-vehicle") modalName = "pilot";
        else if (spellType === "magiseed") modalName = "magiseed";
        else if (spellType === "cooking") modalName = "gourmet";
        else if (spellType === "invocation") modalName = "invoker";
        else if (spellType?.startsWith("tinkerer-alchemy")) modalName = "tinkerer-alchemy";
        else if (spellType?.startsWith("tinkerer-infusion")) modalName = "tinkerer-infusion";
        else if (spellType?.startsWith("tinkerer-magitech")) modalName = "tinkerer-magitech";
        else if (spellType === "deck") modalName = "deck";
        openSpellModal(modalName, spell, cls.name, spellIdx);
    };

    const saveSpell = (updatedSpell) => {
        setPlayer(prev => ({ ...prev, classes: prev.classes.map(c => c.name === editingSpellClass ? { ...c, spells: c.spells.map((s, i) => i === editingSpellIndex ? updatedSpell : s) } : c) }));
        closeSpellModal();
    };
    const saveVehicleSpell = (spellIndex, updatedSpell) => {
        setPlayer(prev => {
            const withSpell = { ...prev, classes: prev.classes.map(c => c.name === editingSpellClass ? { ...c, spells: c.spells.map((s, i) => i === spellIndex ? updatedSpell : s) } : c) };
            const validated = validateSlots(withSpell);
            return syncSlots({ ...validated, vehicleSlots: deriveVehicleSlots(validated) });
        });
        closeSpellModal();
    };


    // Handle tab change
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Reusable button/tab styling
    const tabStyle = {
        borderRadius: 0,
        flex: 1,
        padding: 0,
        mt: 0.5,
        minHeight: '24px',
        height: '24px',
        color: "#ffffff",
        bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
        border: `2px solid ${theme.mode === 'dark' ? theme.ternary : theme.primary}`,
        '&:hover': {
            bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
            color: theme.mode === 'dark' ? theme.white : theme.white,
        },
        '&.Mui-selected': {
            bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
            color: theme.mode === 'dark' ? theme.white : theme.white,
        },
    };

    const homeTabStyle = {
        ...tabStyle,
        flex: 0.5,
    };

    // Tab content panel
    const CustomTabPanel = ({ value, index, children }) => (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box sx={{ p: 0 }}>
                    {children}
                </Box>
            )}
        </div>
    );

    /* player.armor.isEquipped (should be only one) */
    const inv = player.equipment?.[0];
    const equippedArmor = inv?.armor?.find((armor) => isItemEquipped(player, armor)) || null;

    /* player.shields.isEquipped (should be only one) */
    const equippedShield =
        inv?.shields?.find((shield) => isItemEquipped(player, shield)) || null;

    /* player.weapons.isEquipped (can be more than one) */
    const equippedWeapons =
        inv?.weapons?.filter((weapon) => isItemEquipped(player, weapon)) || [];

    /* player.customWeapons.isEquipped (can be more than one) */
    const equippedCustomWeapons =
        inv?.customWeapons?.filter((weapon) => isItemEquipped(player, weapon)) || [];

    /* player.accessories.isEquipped (should be only one) */
    const equippedAccessory =
        inv?.accessories?.find((accessory) => isItemEquipped(player, accessory)) || null;

    const currDex = calculateAttribute(
        player,
        player.attributes.dexterity,
        ["slow", "enraged"],
        ["dexUp"],
        6,
        12
    );
    const currInsight = calculateAttribute(
        player,
        player.attributes.insight,
        ["dazed", "enraged"],
        ["insUp"],
        6,
        12
    );
    const currMight = calculateAttribute(
        player,
        player.attributes.might,
        ["weak", "poisoned"],
        ["migUp"],
        6,
        12
    );
    const currWillpower = calculateAttribute(
        player,
        player.attributes.willpower,
        ["shaken", "poisoned"],
        ["wlpUp"],
        6,
        12
    );

    // Find all pilot-vehicle spells
    const pilotSpells = (player.classes || [])
        .flatMap((c) => c.spells || [])
        .filter(
            (spell) =>
                spell &&
                spell.spellType === "pilot-vehicle" &&
                (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
        );

    // Find the enabled vehicle
    const activeVehicle = pilotSpells
        .flatMap((s) => s.vehicles || [])
        .find((v) => v.enabled);

    const equippedModules = activeVehicle?.modules
        ? activeVehicle.modules.filter((m) => m.equipped)
        : [];

    const armorModule = equippedModules.find(
        (m) => m.type === "pilot_module_armor"
    );

    const isMartialArmor = armorModule
        ? armorModule.martial
        : equippedArmor?.martial || false;

    // Rogue - Dodge Skill Bonus
    const dodgeBonus =
        equippedShield === null &&
            !isMartialArmor
            ? player.classes
                .map((cls) => cls.skills)
                .flat()
                .filter((skill) => skill.specialSkill === "Dodge")
                .map((skill) => skill.currentLvl)
                .reduce((a, b) => a + b, 0)
            : 0;

    // Calculate DEF and MDEF
    const baseDef = armorModule
        ? armorModule.martial
            ? armorModule.def || 0
            : currDex + (armorModule.def || 0)
        : equippedArmor !== null
            ? equippedArmor.martial
                ? equippedArmor.def
                : currDex + equippedArmor.def
            : currDex;

    const armorDefModifier = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.defModifier || 0
            : 0;

    const currDef =
        baseDef +
        (equippedShield !== null ? equippedShield.def : 0) +
        (player.modifiers?.def || 0) +
        armorDefModifier +
        (equippedShield !== null ? equippedShield.defModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.defModifier || 0 : 0) +
        equippedWeapons.reduce(
            (total, weapon) => total + (weapon.defModifier || 0),
            0
        ) +
        equippedCustomWeapons.reduce(
            (total, weapon) => total + (parseInt(weapon.defModifier || 0, 10) || 0),
            0
        ) +
        dodgeBonus;

    const baseMDef = armorModule
        ? armorModule.martial
            ? armorModule.mdef || 0
            : currInsight + (armorModule.mdef || 0)
        : equippedArmor !== null
            ? currInsight + equippedArmor.mdef
            : currInsight;

    const armorMDefModifier = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.mDefModifier || 0
            : 0;

    const currMDef =
        baseMDef +
        (equippedShield !== null ? equippedShield.mdef : 0) +
        (player.modifiers?.mdef || 0) +
        armorMDefModifier +
        (equippedShield !== null ? equippedShield.mDefModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.mDefModifier || 0 : 0) +
        equippedWeapons.reduce(
            (total, weapon) => total + (weapon.mDefModifier || 0),
            0
        ) +
        equippedCustomWeapons.reduce(
            (total, weapon) => total + (parseInt(weapon.mDefModifier || 0, 10) || 0),
            0
        );

    // Initialize INIT to 0
    const baseInit = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.init
            : 0;

    const armorInitModifier = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.initModifier || 0
            : 0;

    const currInit =
        baseInit +
        (player.modifiers?.init || 0) +
        armorInitModifier +
        (equippedShield !== null ? equippedShield.initModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.initModifier || 0 : 0);

    const collapse = true;
    return (
        <Card id={id} sx={{ maxWidth: "566px", width: "100%", mx: "auto" }}>
            <Box
                style={{
                    boxShadow: collapse ? "none" : "1px 1px 5px",
                }}
            >
                <Header player={player} characterImage={characterImage} isEditMode={isEditMode} setPlayer={setPlayer} updateMaxStats={updateMaxStats} />
            </Box>
            <Stats player={player} currDex={currDex} currInsight={currInsight} currMight={currMight} currWillpower={currWillpower} currDef={currDef} currMDef={currMDef} currInit={currInit} isEditMode={isEditMode} setPlayer={setPlayer} updateMaxStats={updateMaxStats} />

            <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
                {/* Tabs */}
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="category filter tab"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: '30px',
                        height: '30px',
                        '& .MuiTabs-indicator': {
                            bgcolor: theme.secondary,
                            height: 3,
                        },
                        '@media (max-width:600px)': {
                            minHeight: '30px',
                            height: '30px',
                        },
                    }}
                >
                    <Tab icon={<HomeOutlinedIcon sx={{ fontSize: '1rem' }} />} sx={homeTabStyle} />
                    <Tab label={t("Classes")} sx={tabStyle} />
                    <Tab label={t("Features")} sx={tabStyle} />
                    <Tab label={t("Backpack")} sx={tabStyle} />
                    <Tab label={t("Notes")} sx={tabStyle} />
                </Tabs>

                <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 0 }}>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search..."
                        inputProps={{ 'aria-label': 'Search' }}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <IconButton
                        type="button"
                        sx={{ p: '0' }}
                        aria-label={searchQuery ? 'clear' : 'search'}
                        onClick={() => {
                            if (searchQuery) {
                                setSearchQuery('');
                            }
                        }}
                    >
                        {searchQuery ? (
                            <Clear />
                        ) : (
                            <Search />
                        )}
                    </IconButton>
                    {onToggleEditMode && (
                        <Tooltip title={isEditMode ? "Switch to Preview Mode" : "Switch to Edit Mode"}>
                            <IconButton size="small" sx={{ p: '0' }} onClick={onToggleEditMode}>
                                {isEditMode ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Tab Panels */}
                <CustomTabPanel value={value} index={0}>
                    <PlayerBonds player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} />
                    <PlayerNotes
                        player={{
                            ...player,
                            notes: (player.notes || []).filter(note => note.showInPlayerSheet !== false)
                        }}
                        setPlayer={setPlayer}
                        searchQuery={searchQuery}
                        isEditMode={isEditMode}
                        onAddNote={isEditMode ? handleAddNote : undefined}
                        onEditNote={isEditMode ? handleOpenEditNote : undefined}
                    />
                    <CompactLoadout player={player} setPlayer={setPlayer} isEditMode={isEditMode} withEquipment isMainTab={true} searchQuery={searchQuery} />
                    <PlayerClasses player={player} setPlayer={setPlayer} isCharacterSheet={true} isMainTab={true} searchQuery={searchQuery}
                        isEditMode={isEditMode}
                        onAddBlankClass={isEditMode ? handleAddBlankClass : undefined}
                        onAddFromCompendium={isEditMode ? handleAddClassFromCompendium : undefined}
                        onEditClass={isEditMode ? handleOpenEditClass : undefined}
                        onAddSkill={isEditMode ? openAddSkillForClass : undefined}
                        onEditSkill={isEditMode ? openEditSkillForClass : undefined}
                        onEditSpell={isEditMode ? handleEditSpell : undefined}
                        onLevelChange={isEditMode ? handleClassLevelChange : undefined}
                        onIncreaseSkillLevel={isEditMode ? handleClassIncreaseSkill : undefined}
                        onDecreaseSkillLevel={isEditMode ? handleClassDecreaseSkill : undefined}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <PlayerClasses player={player} setPlayer={setPlayer} isCharacterSheet={true} isMainTab={false} searchQuery={searchQuery}
                        isEditMode={isEditMode}
                        onAddBlankClass={isEditMode ? handleAddBlankClass : undefined}
                        onAddFromCompendium={isEditMode ? handleAddClassFromCompendium : undefined}
                        onEditClass={isEditMode ? handleOpenEditClass : undefined}
                        onAddSkill={isEditMode ? openAddSkillForClass : undefined}
                        onEditSkill={isEditMode ? openEditSkillForClass : undefined}
                        onEditSpell={isEditMode ? handleEditSpell : undefined}
                        onLevelChange={isEditMode ? handleClassLevelChange : undefined}
                        onIncreaseSkillLevel={isEditMode ? handleClassIncreaseSkill : undefined}
                        onDecreaseSkillLevel={isEditMode ? handleClassDecreaseSkill : undefined}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    {optionalRules.quirks && (
                        <PlayerQuirk player={player} isCharacterSheet={true} searchQuery={searchQuery} />
                    )}
                    {optionalRules.campActivities && (
                        <PlayerCampActivities player={player} searchQuery={searchQuery} />
                    )}
                    {optionalRules.zeroPower && (
                        <PlayerZeroPower player={player} setPlayer={setPlayer} isEditMode={isEditMode} searchQuery={searchQuery} />
                    )}
                    <PlayerOthers player={player} setPlayer={setPlayer} isEditMode={isEditMode} searchQuery={searchQuery} />
                    <PlayerRituals player={player} isCharacterSheet={true} searchQuery={searchQuery} />
                    <PlayerSpells player={player} setPlayer={setPlayer} isCharacterSheet={true} searchQuery={searchQuery} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <CompactLoadout player={player} setPlayer={setPlayer} isEditMode={isEditMode} isMainTab={false} searchQuery={searchQuery} />
                    <PlayerEquipment player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} isMainTab={false} searchQuery={searchQuery}
                        onAddWeapon={isEditMode ? openAddWeapon : undefined}
                        onEditWeapon={isEditMode ? (idx) => { const w = inv?.weapons?.[idx]; if (w) { setWeapon(w); setEditWeaponIndex(idx); setOpenNewWeapon(true); } } : undefined}
                        onAddCustomWeapon={isEditMode ? openAddCustomWeapon : undefined}
                        onEditCustomWeapon={isEditMode ? (idx) => { const w = inv?.customWeapons?.[idx]; if (w) { setCustomWeapon(w); setEditCustomWeaponIndex(idx); setOpenNewCustomWeapon(true); } } : undefined}
                        onAddArmor={isEditMode ? openAddArmor : undefined}
                        onEditArmor={isEditMode ? (idx) => { const a = inv?.armor?.[idx]; if (a) { setArmor(a); setEditArmorIndex(idx); setOpenNewArmor(true); } } : undefined}
                        onAddShield={isEditMode ? openAddShield : undefined}
                        onEditShield={isEditMode ? (idx) => { const s = inv?.shields?.[idx]; if (s) { setShields(s); setEditShieldIndex(idx); setOpenNewShields(true); } } : undefined}
                        onAddAccessory={isEditMode ? openAddAccessory : undefined}
                        onEditAccessory={isEditMode ? (idx) => { const ac = inv?.accessories?.[idx]; if (ac) { setAccessory(ac); setEditAccessoryIndex(idx); setOpenNewAccessory(true); } } : undefined}
                    />
                    <PlayerVehicle player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} searchQuery={searchQuery} />
                    <PlayerCompanion player={player} isCharacterSheet={true} searchQuery={searchQuery} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                    <PlayerNotes player={player} setPlayer={setPlayer} searchQuery={searchQuery}
                        isEditMode={isEditMode}
                        onAddNote={isEditMode ? handleAddNote : undefined}
                        onEditNote={isEditMode ? handleOpenEditNote : undefined}
                    />
                    <PlayerBonds player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} searchQuery={searchQuery} />
                </CustomTabPanel>
            </Box>

            {/* Class edit card dialog */}
            {openClassCard && editClassIndex !== null && player.classes[editClassIndex] && (
                <Dialog open={openClassCard} onClose={() => setOpenClassCard(false)} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ background: theme.primary, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem', py: 1 }}>
                        {t("Edit Class")}
                    </DialogTitle>
                    <DialogContent sx={{ p: 1 }}>
                        <PlayerClassCard
                            allClasses={player.classes}
                            classItem={player.classes[editClassIndex]}
                            onRemove={handleClassRemove}
                            onLevelChange={(newLevel) => handleClassLevelChange(editClassIndex, newLevel)}
                            onSaveBenefits={(benefits) => handleClassSaveBenefits(editClassIndex, benefits)}
                            onAddSkill={handleClassAddSkill}
                            onEditSkill={handleClassEditSkill}
                            onDeleteSkill={(skillIdx) => handleClassDeleteSkill(editClassIndex, skillIdx)}
                            onIncreaseSkillLevel={(skillIdx) => handleClassIncreaseSkill(editClassIndex, skillIdx)}
                            onDecreaseSkillLevel={(skillIdx) => handleClassDecreaseSkill(editClassIndex, skillIdx)}
                            editCompanion={(companion) => handleClassEditCompanion(editClassIndex, companion)}
                            isEditMode={true}
                            editClassName={(newName) => handleClassEditName(editClassIndex, newName)}
                            editHeroic={(newHeroic) => handleClassEditHeroic(editClassIndex, newHeroic)}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Standalone skill modal */}
            <AddSkillModal
                open={openSkillModal}
                onClose={() => setOpenSkillModal(false)}
                editSkillIndex={editSkillIdx}
                skillName={skillName}
                setSkillName={setSkillName}
                maxLevel={skillMaxLevel}
                setMaxLevel={setSkillMaxLevel}
                description={skillDescription}
                setDescription={setSkillDescription}
                specialSkill={skillSpecial}
                setSpecialSkill={setSkillSpecial}
                onAddSkill={handleSkillModalSave}
                onDeleteSkill={handleSkillModalDelete}
            />

            {/* Spell modals */}
            {spellBeingEdited && (
                <>
                    <SpellDefaultModal open={isSpellOpen("default")} onClose={closeSpellModal} spell={spellBeingEdited} onSave={saveSpell} />
                    <SpellArcanistModal open={isSpellOpen("arcanist")} onClose={closeSpellModal} spell={spellBeingEdited} isRework={spellBeingEdited?.spellType === "arcanist-rework"} onSave={saveSpell} />
                    <SpellEntropistGambleModal open={isSpellOpen("gamble")} onClose={closeSpellModal} gamble={spellBeingEdited} onSave={saveSpell} />
                    <UnifiedSpellModal
                        open={isSpellOpen("chanter")}
                        onClose={closeSpellModal}
                        onSave={saveSpell}
                        spellType="magichant"
                        spell={spellBeingEdited}
                        initialSectionId="general"
                        sections={[
                            { id: "keys", title: "magichant_edit_keys_button", component: MagichantKeysContentSection, props: {}, order: 0 },
                            { id: "tones", title: "magichant_edit_tones_button", component: MagichantTonesContentSection, props: {}, order: 1 },
                            { id: "general", title: "magichant_settings_button", component: GeneralSection, props: { customFields: [] }, order: 2 },
                        ]}
                    />
                    <SpellSymbolistModal open={isSpellOpen("symbolist")} onClose={closeSpellModal} symbol={spellBeingEdited} onSave={saveSpell} />
                    <SpellDancerModal open={isSpellOpen("dancer")} onClose={closeSpellModal} dance={spellBeingEdited} onSave={saveSpell} />
                    <SpellGiftModal open={isSpellOpen("gift")} onClose={closeSpellModal} gift={spellBeingEdited} onSave={saveSpell} />
                    <SpellMutantModal open={isSpellOpen("mutant")} onClose={closeSpellModal} mutant={spellBeingEdited} onSave={saveSpell} />
                    <SpellPilotModal open={isSpellOpen("pilot")} onClose={closeSpellModal} pilot={spellBeingEdited} onSave={saveSpell} />
                    <SpellPilotVehiclesModal open={isSpellOpen("pilot-vehicles")} onClose={closeSpellModal} pilot={spellBeingEdited} onSave={(idx, updated) => saveVehicleSpell(idx, updated)} />
                    <SpellMagiseedModal open={isSpellOpen("magiseed")} onClose={closeSpellModal} magiseed={spellBeingEdited} onSave={saveSpell} />
                    <SpellGourmetModal open={isSpellOpen("gourmet")} onClose={closeSpellModal} spell={spellBeingEdited} player={player} onPlayerUpdate={setPlayer} onSave={saveSpell} />
                    <SpellInvokerModal open={isSpellOpen("invoker")} onClose={closeSpellModal} spell={spellBeingEdited} onSave={saveSpell} />
                    <SpellTinkererAlchemyRankModal open={isSpellOpen("tinkerer-alchemy")} onClose={closeSpellModal} alchemy={spellBeingEdited} onSave={saveSpell} />
                    <SpellTinkererInfusionModal open={isSpellOpen("tinkerer-infusion")} onClose={closeSpellModal} infusion={spellBeingEdited} onSave={saveSpell} />
                    <SpellTinkererMagitechRankModal open={isSpellOpen("tinkerer-magitech")} onClose={closeSpellModal} magitech={spellBeingEdited} onSave={saveSpell} />
                    <SpellDeckModal open={isSpellOpen("deck")} onClose={closeSpellModal} deck={spellBeingEdited} onSave={saveSpell} />
                </>
            )}

            {/* Equipment type picker menu */}
            <Menu
                anchorEl={equipMenuAnchor}
                open={Boolean(equipMenuAnchor)}
                onClose={() => setEquipMenuAnchor(null)}
            >
                <MenuItem onClick={openAddWeapon} sx={{ gap: 1 }}>
                    <MeleeIcon size="1.2em" /> {t("Add Weapon")}
                </MenuItem>
                <MenuItem onClick={openAddCustomWeapon} sx={{ gap: 1 }}>
                    <MeleeIcon size="1.2em" /> {t("Add Custom Weapon")}
                </MenuItem>
                <MenuItem onClick={openAddArmor} sx={{ gap: 1 }} disabled={inv?.armor && inv.armor.length >= 10}>
                    <ArmorIcon size="1.2em" /> {t("Add Armor")}
                </MenuItem>
                <MenuItem onClick={openAddShield} sx={{ gap: 1 }} disabled={inv?.shields && inv.shields.length >= 10}>
                    <ShieldIcon size="1.2em" /> {t("Add Shield")}
                </MenuItem>
                <MenuItem onClick={openAddAccessory} sx={{ gap: 1 }} disabled={inv?.accessories && inv.accessories.length >= 10}>
                    <AccessoryIcon size="1.2em" /> {t("Add Accessory")}
                </MenuItem>
            </Menu>

            {/* Equipment modals */}
            <PlayerWeaponModal
                open={openNewWeapon}
                onClose={() => { setOpenNewWeapon(false); setWeapon(null); setEditWeaponIndex(null); }}
                editWeaponIndex={editWeaponIndex}
                weapon={weapon}
                setWeapon={setWeapon}
                onAddWeapon={handleSaveWeapon}
                onDeleteWeapon={handleDeleteWeapon}
            />
            <PlayerCustomWeaponModal
                open={openNewCustomWeapon}
                onClose={() => { setOpenNewCustomWeapon(false); setCustomWeapon(null); setEditCustomWeaponIndex(null); }}
                editCustomWeaponIndex={editCustomWeaponIndex}
                customWeapon={customWeapon}
                setCustomWeapon={setCustomWeapon}
                onAddCustomWeapon={handleSaveCustomWeapon}
                onDeleteCustomWeapon={handleDeleteCustomWeapon}
            />
            <PlayerArmorModal
                open={openNewArmor}
                onClose={() => { setOpenNewArmor(false); setArmor(null); setEditArmorIndex(null); }}
                editArmorIndex={editArmorIndex}
                armorPlayer={armor}
                setArmorPlayer={setArmor}
                onAddArmor={handleSaveArmor}
                onDeleteArmor={handleDeleteArmor}
            />
            <PlayerShieldModal
                open={openNewShields}
                onClose={() => { setOpenNewShields(false); setShields(null); setEditShieldIndex(null); }}
                editShieldIndex={editShieldIndex}
                shield={shields}
                setShield={setShields}
                onAddShield={handleSaveShield}
                onDeleteShield={handleDeleteShield}
            />
            <PlayerAccessoryModal
                open={openNewAccessory}
                onClose={() => { setOpenNewAccessory(false); setAccessory(null); setEditAccessoryIndex(null); }}
                editAccIndex={editAccessoryIndex}
                accessory={accessory}
                onAddAccessory={handleSaveAccessory}
                onDeleteAccessory={handleDeleteAccessory}
            />
            <PlayerNoteModal
                open={openNoteModal}
                onClose={() => { setOpenNoteModal(false); setNoteBeingEdited(null); setEditNoteIndex(null); }}
                editNoteIndex={editNoteIndex}
                note={noteBeingEdited}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
            />
        </Card>
    );
}

function Header({ player, characterImage, isEditMode, setPlayer, updateMaxStats }) {
    const { t } = useTranslate();
    const theme = useCustomTheme();

    const background = theme.mode === 'dark'
        ? `linear-gradient(90deg, ${theme.primary} 0%, ${theme.ternary} 100%);`
        : `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%);`;

    const borderImage = theme.mode === 'dark'
        ? `linear-gralinear-gradient(45deg, ${theme.primary}, ${theme.ternary}) 1`
        : `linear-gradient(45deg, ${theme.primary}, #ffffff) 1`;
    const borderImageBody = theme.mode === 'dark'
        ? `linear-gradient(45deg, ${theme.primary}, ${theme.ternary}) 1;`
        : `linear-gradient(45deg, ${theme.primary}, #ffffff) 1;`;
    const borderRight = theme.mode === 'dark'
        ? `4px solid #1f1f1f`
        : `4px solid white`;

    const borderLeft = theme.mode === 'dark'
        ? `2px solid ${theme.ternary}`
        : `2px solid ${theme.primary}`;

    const borderBottom = theme.mode === 'dark'
        ? `2px solid ${theme.ternary}`
        : `2px solid ${theme.primary}`;

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Grid container alignItems="stretch">
            <Grid container>
                <Grid
                    item
                    xs
                    sx={{
                        background,
                        borderRight,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {isEditMode ? (
                        <TextField
                            value={player.name}
                            onChange={(e) => setPlayer((p) => ({ ...p, name: e.target.value }))}
                            inputProps={{ maxLength: 50 }}
                            variant="standard"
                            size="small"
                            sx={{
                                "& .MuiInputBase-input": {
                                    color: "#fff",
                                    fontFamily: "Antonio",
                                    fontSize: "1.5rem",
                                    fontWeight: "medium",
                                    textTransform: "uppercase",
                                },
                                "& .MuiInput-underline:before": { borderBottomColor: "rgba(255,255,255,0.5)" },
                                "& .MuiInput-underline:hover:before": { borderBottomColor: "#fff" },
                                "& .MuiInput-underline:after": { borderBottomColor: "#fff" },
                            }}
                        />
                    ) : (
                        <Typography
                            color="white.main"
                            fontFamily="Antonio"
                            fontSize="1.5rem"
                            fontWeight="medium"
                            sx={{ textTransform: "uppercase" }}
                        >
                            {player.name}
                        </Typography>
                    )}
                </Grid>
                <Grid
                    item
                    sx={{
                        px: 1,
                        py: 0.5,
                        borderLeft: borderLeft,
                        borderBottom: borderBottom,
                        borderImage: borderImage,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {isEditMode ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                            {player.info.pronouns && (
                                <Typography fontFamily="Antonio" fontSize="1rem" sx={{ textTransform: "uppercase", mr: 0.5 }}>
                                    {player.info.pronouns} <Diamond />
                                </Typography>
                            )}
                            <IconButton size="small" onClick={() => { setPlayer((p) => ({ ...p, lvl: Math.max(5, p.lvl - 1) })); if (updateMaxStats) updateMaxStats(); }}>
                                <Remove fontSize="small" />
                            </IconButton>
                            <Typography fontFamily="Antonio" fontSize="1.1rem" fontWeight="medium" sx={{ textTransform: "uppercase", mx: 0.25 }}>
                                {t("Lvl")} {player.lvl}
                            </Typography>
                            <IconButton size="small" onClick={() => { setPlayer((p) => ({ ...p, lvl: Math.min(50, p.lvl + 1) })); if (updateMaxStats) updateMaxStats(); }}>
                                <Add fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Typography
                            fontFamily="Antonio"
                            fontSize="1.25rem"
                            fontWeight="medium"
                            sx={{ textTransform: "uppercase" }}
                        >
                            {player.info.pronouns} <Diamond /> {t("Lvl")} {player.lvl}
                        </Typography>
                    )}
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", width: 1 }}>
                {/* EditableImage */}
                {characterImage ? (
                    <Box
                        sx={{
                            minWidth: "128px",
                            width: "128px",
                            height: "auto",
                            background: "white",
                            border: "1px solid #684268",
                            borderTop: "none",
                            overflow: "hidden",
                            cursor: "pointer"
                        }}
                        onClick={handleClickOpen}
                    >
                        <img
                            src={characterImage}
                            alt="Player Avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                objectPosition: "center center",
                                display: "block",
                            }}
                        />
                    </Box>
                ) : null}
                {/* Dialog for expanded image */}
                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                >
                    <img
                        src={player.info.imgurl}
                        alt="Expanded Player Avatar"
                        style={{
                            width: "100%",
                            height: "auto",
                        }}
                        onClick={handleClose}
                    />
                </Dialog>

                {/* Rows */}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    {/* Row 1 */}
                    <Box
                        sx={{
                            px: 2,
                            py: 0.5,
                            borderBottom: borderBottom,
                            borderImage: borderImageBody,
                            flex: 1,
                            display: "flex",
                            justifyContent: "left",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                whiteSpace: "pre-line",
                                display: "inline",
                                margin: 0,
                                padding: 1,
                            }}
                        >
                            <ReactMarkdown
                                components={{
                                    p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
                                    ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
                                    li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
                                    strong: (props) => (
                                        <strong style={{ fontWeight: "bold" }} {...props} />
                                    ),
                                    em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
                                }}
                                allowedElements={["strong"]}
                                unwrapDisallowed={true}
                            >
                                {player.info.description}
                            </ReactMarkdown>
                        </div>
                    </Box>
                    {/* Row 2 */}
                    {(player.info.identity || player.info.theme || player.info.origin) && (
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                borderBottom: borderBottom,
                                borderImage: borderImageBody,
                                flex: 1,
                            }}
                        >
                            <Typography
                                fontFamily="body1"
                                fontSize="0.80rem"
                            >
                                <RenderTraits player={player} />
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Grid>
    );
}

function RenderTraits({ player }) {
    const { identity, theme, origin } = player.info;

    const traits = [
        { label: "Identity", value: identity },
        { label: "Theme", value: theme },
        { label: "Origin", value: origin }
    ];

    return (
        <Grid container>
            {/* Iterate over traits */}
            {traits.map(({ label, value }) => value && (
                <Grid item xs={12} key={label} sx={{ marginTop: 0.5 }}>
                    <Grid container alignItems="center" spacing={1}>
                        {/* Label */}
                        <Grid item xs={3}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {label}:
                            </Typography>
                        </Grid>
                        {/* Value */}
                        <Grid item xs={9}>
                            <Typography align="left">
                                {value}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
}

function Stats({ player, currDex, currInsight, currMight, currWillpower, currDef, currMDef, currInit, isEditMode, setPlayer, updateMaxStats }) {
    const { t } = useTranslate();
    const theme = useTheme();
    const custom = useCustomTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const borderImage = `linear-gradient(45deg, #b9a9be, ${theme.transparent}) 1`;
    const getAttributeColor = (base, current) => {
        if (current < base) return theme.palette.error.main;
        if (current > base) return theme.palette.success.main;
        return theme.palette.text.primary;
    };

    const attrSelectSx = {
        fontFamily: "'Antonio', fantasy, sans-serif",
        fontSize: "0.875rem",
        "& .MuiSelect-select": { py: 0, px: 0.5 },
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    };

    const handleAttrChange = (key) => (e) => {
        setPlayer((p) => ({ ...p, attributes: { ...p.attributes, [key]: e.target.value } }));
        if (updateMaxStats) updateMaxStats();
    };

    return (
        <Typography
            component="div"
            fontFamily="Antonio"
            fontWeight="bold"
            textAlign="center"
            fontSize={isMobile ? "0.74rem" : "0.9rem"}
        >
            <Grid container>
                <Grid
                    item
                    sx={{
                        borderBottom: "1px solid #281127",
                        borderTop: "1px solid #281127",
                        borderRight: "1px solid #281127",
                        borderImage: "linear-gradient(90deg, #341b35, #6d5072) 1;",
                        mr: isMobile ? "1px" : "2px",
                        my: "2px",
                        flexBasis: "calc(50% - 2px)",
                    }}
                >
                    <Grid container alignItems="stretch" justifyContent="space-between">
                        {[
                            { key: "dexterity", label: t("DEX"), curr: currDex, bg: { dark: '#1E2122', light: '#efecf5' }, border: true },
                            { key: "insight",   label: t("INS"), curr: currInsight, bg: { dark: '#1E2122', light: '#f3f0f7' }, border: true },
                            { key: "might",     label: t("MIG"), curr: currMight,   bg: { dark: '#1D1F20', light: '#f6f4f9' }, border: true },
                            { key: "willpower", label: t("WLP"), curr: currWillpower, bg: { dark: '#1B1D1E', light: '#f9f8fb' }, border: false },
                        ].map(({ key, label, curr, bg, border }) => (
                            <Grid
                                key={key}
                                item
                                xs
                                sx={{
                                    bgcolor: custom.mode === 'dark' ? bg.dark : bg.light,
                                    borderRight: border ? (custom.mode === 'dark' ? '1px solid #42484B' : '1px solid #ffffff') : undefined,
                                    py: 0.4,
                                }}
                            >
                                {isEditMode ? (
                                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                                        <Typography component="span" style={{ fontFamily: "'Antonio', fantasy, sans-serif", fontSize: "0.875rem" }}>
                                            {label}{" "}
                                        </Typography>
                                        <Select
                                            value={player.attributes[key]}
                                            onChange={handleAttrChange(key)}
                                            variant="outlined"
                                            size="small"
                                            sx={{ ...attrSelectSx, color: getAttributeColor(player.attributes[key], curr) }}
                                        >
                                            {[6, 8, 10, 12].map((v) => (
                                                <MenuItem key={v} value={v} sx={{ fontFamily: "'Antonio', fantasy, sans-serif", fontSize: "0.875rem" }}>
                                                    d{v}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                ) : (
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        style={{
                                            fontFamily: "'Antonio', fantasy, sans-serif",
                                            fontSize: key === "willpower" ? "0.9rem" : "0.875rem",
                                            color: getAttributeColor(player.attributes[key], curr),
                                        }}
                                    >
                                        {label}{" "}d{curr}
                                    </Typography>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid
                    item
                    sx={{
                        borderBottom: "1px solid #281127",
                        borderTop: "1px solid #281127",
                        borderLeft: "1px solid #281127",
                        borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
                        ml: isMobile ? "1px" : "2px",
                        my: "2px",
                        flexBasis: "calc(50% - 2px)",
                    }}
                >
                    <Grid container alignItems="stretch" justifyContent="space-between">
                        <Grid item sx={{ px: isMobile ? 0.5 : 1, py: 0.4 }}>
                            {t("HP")}
                        </Grid>
                        <Grid
                            item
                            sx={{
                                py: 0.4,
                                px: isMobile ? 0.75 : 1.5,
                                color: "white.main",
                                bgcolor: "red.main",
                            }}
                        >
                            {player.stats?.hp.max} <Diamond color="white.main" />{" "}
                            {Math.floor(player.stats?.hp.max / 2)}
                        </Grid>
                        <Grid item sx={{ px: isMobile ? 0.5 : 1, py: 0.4 }}>
                            {t("MP")}
                        </Grid>
                        <Grid
                            item
                            sx={{
                                px: isMobile ? 0.75 : 1.5,
                                py: 0.4,
                                color: "white.main",
                                bgcolor: "cyan.main",
                            }}
                        >
                            {player.stats?.mp.max}
                        </Grid>
                        <Grid item xs sx={{ py: 0.4 }}>
                            {t("Init.")} {currInit}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    item
                    sx={{
                        borderBottom: "1px solid #281127",
                        borderTop: "1px solid #281127",
                        borderRight: "1px solid #281127",
                        borderImage,
                        mr: isMobile ? "1px" : "2px",
                        flexBasis: "calc(25% - 2px)",
                    }}
                >
                    <Grid container justifyItems="space-between">
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1B1D1E' : '#efecf5',
                                borderRight: custom.mode === 'dark' ? '1px solid #42484B' : '1px solid #ffffff',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {t("DEF")} +{currDef}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1B1D1E' : '#efecf5',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {t("M.DEF")} +{currMDef}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs>
                    <AffinityGrid container>
                        {[
                            "physical",
                            "wind",
                            "bolt",
                            "dark",
                            "earth",
                            "fire",
                            "ice",
                            "light",
                            "poison",
                        ].map((type) => (
                            <Grid
                                item
                                xs
                                key={type}
                                sx={{
                                    py: 0.4,
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <TypeAffinity
                                    type={type}
                                    affinity={player.affinities?.[type] || ""}
                                />
                            </Grid>
                        ))}
                    </AffinityGrid>
                </Grid>
            </Grid>
        </Typography>
    );
}
