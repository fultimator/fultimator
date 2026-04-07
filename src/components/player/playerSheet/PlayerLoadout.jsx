import React, { useState } from 'react';
import {
  Paper, Grid, Typography, Card, CardActionArea, CardContent,
  Box, Chip, Divider, Tooltip, Button, Checkbox, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio,
  Badge,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CasinoIcon from '@mui/icons-material/Casino';
import { SwapHoriz } from '@mui/icons-material';
import { useTranslate } from '../../../translation/translate';
import { useCustomTheme } from '../../../hooks/useCustomTheme';
import attributes from '../../../libs/attributes';
import { resolveEffectiveSlot, getActiveVehicle, syncSlots, isItemEquipped } from '../equipment/slots/equipmentSlots';
import { availableFrames } from '../../../libs/pilotVehicleData';
import { getModuleTypeForLimits } from '../spells/vehicleReducer';
import { calculateAttribute, calculateCustomWeaponStats } from '../common/playerCalculations';
import SlotPickerDialog from '../equipment/slots/SlotPickerDialog';
import SpellPilotVehiclesModal from '../spells/SpellPilotVehiclesModal';

// ─── Stat line helpers ────────────────────────────────────────────────────────

function weaponStatLine(item) {
  if (!item) return '-';
  if ((item.att1 && item.att2) || (item.accuracyCheck?.att1 && item.accuracyCheck?.att2)) {
    const a1 = attributes[item.att1 ?? item.accuracyCheck?.att1]?.shortcaps ?? (item.att1 ?? item.accuracyCheck?.att1);
    const a2 = attributes[item.att2 ?? item.accuracyCheck?.att2]?.shortcaps ?? (item.att2 ?? item.accuracyCheck?.att2);
    const hands = (item.hands === 2 || item.isTwoHand) ? '2H' : '1H';
    return `${a1}+${a2} / ${item.dmg ?? item.damage ?? '?'} ${item.type ?? ''} / ${hands}`.trim();
  }
  return item.quality || '-';
}

function shieldStatLine(item) {
  if (!item) return '-';
  return `DEF +${item.def}  MDEF +${item.mdef}`;
}

function armorStatLine(item) {
  if (!item) return '-';
  const init = item.init >= 0 ? `+${item.init}` : `${item.init}`;
  return `DEF +${item.def}  MDEF +${item.mdef}  INIT ${init}`;
}

function moduleStatLine(module) {
  if (!module) return '-';
  if (module.type === 'pilot_module_weapon') {
    if (module.isShield) return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
    const a1 = attributes[module.att1]?.shortcaps ?? module.att1;
    const a2 = attributes[module.att2]?.shortcaps ?? module.att2;
    const hands = module.cumbersome ? '2H' : '1H';
    return `${a1}+${a2} / ${module.damage ?? '?'} ${module.damageType ?? ''} / ${hands}`.trim();
  }
  if (module.type === 'pilot_module_armor') {
    return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
  }
  return module.description ? module.description.slice(0, 40) : '-';
}

// ─── SlotCard ─────────────────────────────────────────────────────────────────

function SlotCard({ label, resolved, locked, isEditMode, onClick, hasModule, onRoll, onSwap, isAux }) {
  const { t } = useTranslate();
  const isVehicle = resolved?.kind === 'vehicleModule';
  const isEmpty = !resolved;

  const itemName = (() => {
    if (isVehicle) return resolved.module.customName || t(resolved.module.name);
    const item = resolved?.item;
    if (!item) return null;
    if ('accuracyCheck' in item && item.activeForm === 'secondary') {
      return item.secondWeaponName || `${item.name} (Alt)`;
    }
    return item.name ?? null;
  })();

  const statLine = (() => {
    if (!resolved) return null;
    if (isVehicle) return moduleStatLine(resolved.module);
    const item = resolved.item;
    // Custom weapon - respect active form
    if ('accuracyCheck' in item) {
      const isSecondary = item.activeForm === 'secondary';
      const acc = isSecondary ? item.secondSelectedAccuracyCheck : item.accuracyCheck;
      if (acc?.att1 && acc?.att2) {
        const a1 = attributes[acc.att1]?.shortcaps ?? acc.att1;
        const a2 = attributes[acc.att2]?.shortcaps ?? acc.att2;
        const stats = calculateCustomWeaponStats(item, isSecondary);
        const type = isSecondary ? item.secondSelectedType : item.type;
        return `${a1}+${a2} / ${stats.damage} ${type ?? ''} / 2H`.trim();
      }
    }
    if ('att1' in item && 'att2' in item) return weaponStatLine(item);
    if ('def' in item && 'mdef' in item && !('init' in item)) return shieldStatLine(item);
    if ('def' in item && 'mdef' in item && 'init' in item) return armorStatLine(item);
    return item.quality || '-';
  })();

  // A slot is weapon-type if it has rollable att1+att2+damage stats
  const isWeaponType = !isEmpty && (
    isVehicle
      ? resolved.module.type === 'pilot_module_weapon' && !resolved.module.isShield
      : ('att1' in resolved.item && 'att2' in resolved.item) || (resolved.item?.accuracyCheck?.att1 && resolved.item?.accuracyCheck?.att2)
  );

  const clickable = !locked && isEditMode && !!onClick && !isAux;
  const showRoll = !!onRoll && isWeaponType && !isEmpty;
  const showSwap = !!onSwap && !isEmpty && !isVehicle && resolved.item?.customizations?.some(c => c.name === 'weapon_customization_transforming');

  const cardInner = (
    <CardContent sx={{ pb: '8px !important' }}>
      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={0.5}>
          {label}
        </Typography>
        {isAux && (
          <Tooltip title={t('Auto-generated')}>
            <AutoFixHighIcon sx={{ fontSize: 12, color: 'warning.main' }} />
          </Tooltip>
        )}
        {isVehicle && !isAux && (
          <Tooltip title={resolved.vehicle.customName}>
            <PrecisionManufacturingIcon sx={{ fontSize: 12, color: 'success.main' }} />
          </Tooltip>
        )}
        {hasModule && !isVehicle && !isEmpty && !isAux && (
          <Tooltip title={t('Vehicle module available')}>
            <PrecisionManufacturingIcon sx={{ fontSize: 12, color: 'success.light', opacity: 0.6 }} />
          </Tooltip>
        )}
      </Box>
      {isEmpty ? (
        <Typography variant="body2" color="text.disabled" fontStyle="italic">
          {t('- Empty -')}
        </Typography>
      ) : (
        <>
          <Typography variant="body2" fontWeight={600} noWrap>
            {itemName}
          </Typography>
          {statLine && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {statLine}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  );

  return (
    <Card
      elevation={1}
      sx={{
        opacity: locked ? 0.45 : 1,
        position: 'relative',
        height: '100%',
        border: isAux ? '1px dashed' : isVehicle ? '1px solid' : (hasModule && !isVehicle && !isEmpty) ? '1px dashed' : undefined,
        borderColor: isAux ? 'warning.main' : isVehicle ? 'success.main' : (hasModule && !isVehicle && !isEmpty) ? 'success.light' : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
        {clickable ? (
          <CardActionArea onClick={onClick} sx={{ flex: 1 }}>
            {cardInner}
          </CardActionArea>
        ) : (
          <Box sx={{ flex: 1 }}>{cardInner}</Box>
        )}
        {(showRoll || showSwap) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid', borderColor: 'divider', px: 0.5, justifyContent: 'center' }}>
            {showSwap && (
              <Tooltip title={t('weapon_customization_swap_form')}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSwap(); }}>
                  <SwapHoriz fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {showRoll && (
              <Tooltip title={t('Roll')}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRoll(); }}>
                  <CasinoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      {locked && (
        <Box position="absolute" top={4} right={4}>
          <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        </Box>
      )}
    </Card>
  );
}

// ─── VehicleSupportCard ───────────────────────────────────────────────────────

function VehicleSupportCard({ label, module, vehicle, isEditMode, onClick }) {
  const { t } = useTranslate();
  const clickable = isEditMode && !!onClick;
  const content = (
    <CardContent sx={{ pb: '8px !important' }}>
      {module ? (
        <>
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
            <PrecisionManufacturingIcon sx={{ fontSize: 12, color: 'success.main' }} />
          </Box>
          <Typography variant="body2" fontWeight={600} noWrap>{module.customName || t(module.name)}</Typography>
          {module.description && (
            <Typography variant="caption" color="text.secondary" noWrap>{(module.name === 'pilot_custom_support' ? module.description : t(module.description)).slice(0, 50)}</Typography>
          )}
        </>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
          <Typography variant="body2" color="text.disabled" fontStyle="italic">{t('- Empty -')}</Typography>
        </>
      )}
    </CardContent>
  );

  return (
    <Card
      elevation={1}
      sx={{
        height: '100%',
        border: module ? '1px solid' : undefined,
        borderColor: module ? 'success.main' : undefined,
      }}
    >
      {clickable ? (
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>{content}</CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

// ─── PlayerLoadout ────────────────────────────────────────────────────────────

export default function PlayerLoadout({ player, setPlayer, isEditMode, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const primary = theme.primary;
  const secondary = theme.secondary;

  const [pickerSlot, setPickerSlot] = useState(null);
  const [moduleOverrideSlot, setModuleOverrideSlot] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [rollDialog, setRollDialog] = useState(null); // { r1,r2,die1,die2,att1,att2,prec,damage,type,accuracy,damageRoll,isCritSuccess,isCritFail,slot }

  // ─── Aux hand (Twin Shields and similar auto-generated items) ─────────────────
  const hasDualShieldBearer = (player?.classes ?? []).some(cls =>
    (cls.skills ?? []).some(sk => sk.specialSkill === 'Dual Shieldbearer' && sk.currentLvl === 1)
  );
  const equippedShieldsCount = (player?.equipment?.[0]?.shields ?? [])
    .filter(s => isItemEquipped(player, s)).length;
  const defensiveMasteryBonus = (player?.classes ?? [])
    .flatMap(cls => cls.skills ?? [])
    .filter(sk => sk.specialSkill === 'Defensive Mastery')
    .reduce((sum, sk) => sum + (sk.currentLvl ?? 0), 0);
  const auxHandItem = (hasDualShieldBearer && equippedShieldsCount >= 2)
    ? { name: 'Twin Shields', att1: 'might', att2: 'might', damage: 5 + defensiveMasteryBonus, prec: 0, type: 'physical', hands: 2, melee: true }
    : null;

  // ─── Roll ─────────────────────────────────────────────────────────────────────
  const getAttrDie = (key) => {
    const normKey = key === 'will' ? 'willpower' : key;
    const base = player?.attributes?.[normKey] ?? 8;
    const cfg = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight:   [["dazed", "enraged"], ["insUp"]],
      might:     [["weak",  "poisoned"], ["migUp"]],
      willpower: [["shaken","poisoned"], ["wlpUp"]],
    }[normKey] ?? [[], []];
    return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
  };

  const handleRollSlot = (slot) => {
    const resolved = slot === 'aux'
      ? (auxHandItem ? { kind: 'playerItem', item: auxHandItem } : null)
      : resolveEffectiveSlot(player, slot);
    if (!resolved) return;

    let att1, att2, prec, damage, type;
    if (resolved.kind === 'vehicleModule') {
      const m = resolved.module;
      if (m.type !== 'pilot_module_weapon' || m.isShield) return;
      att1 = m.att1; att2 = m.att2;
      prec = m.prec ?? 0; damage = m.damage ?? 0; type = m.damageType ?? '';
    } else {
      const item = resolved.item;
      att1 = item.att1 ?? item.accuracyCheck?.att1;
      att2 = item.att2 ?? item.accuracyCheck?.att2;
      if (!att1 || !att2) return;
      if ('accuracyCheck' in item) {
        // Custom weapon - derive stats from customizations
        const isSecondary = item.activeForm === 'secondary';
        const stats = calculateCustomWeaponStats(item, isSecondary);
        prec = stats.precision;
        damage = stats.damage;
        type = (isSecondary ? item.secondSelectedType : item.type) ?? '';
      } else {
        prec = item.prec ?? 0;
        damage = item.damage ?? item.dmg ?? 0;
        type = item.type ?? '';
      }
    }

    const die1 = getAttrDie(att1);
    const die2 = getAttrDie(att2);
    const r1 = Math.floor(Math.random() * die1) + 1;
    const r2 = Math.floor(Math.random() * die2) + 1;
    setRollDialog({
      slot, att1, att2, die1, die2, r1, r2, prec, damage, type,
      accuracy: r1 + r2 + prec,
      damageRoll: Math.max(r1, r2) + damage,
      isCritSuccess: r1 >= 6 && r2 >= 6 && r1 === r2,
      isCritFail: r1 === 1 && r2 === 1,
    });
  };

  const handleSwapSlot = (slot) => {
    const resolved = resolveEffectiveSlot(player, slot);
    if (resolved?.kind !== 'playerItem' || !resolved.item?.customizations?.some(c => c.name === 'weapon_customization_transforming')) return;

    const item = resolved.item;
    setPlayer(prev => {
      const customWeapons = (prev.equipment?.[0]?.customWeapons ?? []).map(cw => {
        if (cw.name === item.name) {
          return { ...cw, activeForm: cw.activeForm === 'secondary' ? 'primary' : 'secondary' };
        }
        return cw;
      });
      const equipment = [{ ...prev.equipment[0], customWeapons }];
      return syncSlots({ ...prev, equipment });
    });
  };

  const mainHandResolved  = resolveEffectiveSlot(player, 'mainHand');
  const offHandResolved   = resolveEffectiveSlot(player, 'offHand');
  const armorResolved     = resolveEffectiveSlot(player, 'armor');
  const accessoryResolved = resolveEffectiveSlot(player, 'accessory');

  const inv = player?.equipment?.[0] || {};

  const activeVehicle = getActiveVehicle(player);
  const vs = player?.vehicleSlots;

  const vehicleModuleUsage = activeVehicle ? (() => {
    const frame = availableFrames.find(f => f.name === activeVehicle.frame) ?? { limits: { weapon: 2, armor: 1, support: -1 } };
    const counts = { weapon: 0, armor: 0, support: 0 };
    for (const m of activeVehicle.modules ?? []) {
      if (!m.equipped) continue;
      const type = getModuleTypeForLimits(m);
      if (type === 'custom') continue;
      counts[type] += (type === 'support' && m.isComplex) ? 2 : 1;
    }
    return { counts, limits: frame.limits };
  })() : null;

  // Return all equipped modules for a loadout slot's type, including their original index.
  const getEquippedModulesForSlot = (slot) => {
    if (!activeVehicle) return [];
    return (activeVehicle.modules ?? [])
      .map((m, originalIndex) => ({ ...m, originalIndex }))
      .filter(m => {
        if (!m.equipped) return false;
        if (slot === 'armor')    return m.type === 'pilot_module_armor';
        if (['mainHand', 'offHand'].includes(slot)) return m.type === 'pilot_module_weapon';
        return false;
      });
  };

  // Shortcut for single module check (compatibility with existing code)
  const getEquippedModuleForSlot = (slot) => {
    const mods = getEquippedModulesForSlot(slot);
    return mods.find(m => {
      if (slot === 'armor')    return m.equippedSlot === 'armor';
      if (slot === 'mainHand') return m.equippedSlot === 'main' || m.equippedSlot === 'both';
      if (slot === 'offHand')  return m.equippedSlot === 'off'  || m.equippedSlot === 'both';
      return false;
    }) || mods[0] || null;
  };

  // Main hand is locked if off hand has a module and no modules are available for main hand
  const mainHandLocked = (() => {
    if (offHandResolved?.kind === 'vehicleModule' && !getEquippedModuleForSlot('mainHand')) {
      return true;
    }
    return false;
  })();

  // Off hand is locked when main hand holds a two-handed item (player or vehicle)
  // OR when main hand has a module and no modules are available for off hand
  const offHandLocked = (() => {
    // Check vehicle override first
    if (mainHandResolved?.kind === 'vehicleModule') {
      if (mainHandResolved.module.cumbersome) return true;
      if (!getEquippedModuleForSlot('offHand')) return true;
      return false;
    }
    // Fallback to player item
    const ref = player?.equippedSlots?.mainHand;
    if (!ref) return false;
    if (ref.source === 'customWeapons') return true;
    const w = inv?.weapons?.find(x => x.name === ref.name);
    return w?.hands === 2 || w?.isTwoHand || false;
  })();

  // Find pilot spell info (classIndex + spellIndex needed for saves)
  const pilotSpellInfo = (() => {
    for (const [ci, cls] of (player.classes ?? []).entries()) {
      for (const [si, spell] of (cls.spells ?? []).entries()) {
        if (spell.spellType === 'pilot-vehicle') return { spell, classIndex: ci, spellIndex: si };
      }
    }
    return null;
  })();

  // Update modules on the currently active vehicle
  const updateActiveVehicleModules = (updaterFn) => {
    if (!pilotSpellInfo || !activeVehicle) return;
    const { classIndex, spellIndex } = pilotSpellInfo;
    setPlayer(prev => {
      const classes = prev.classes.map((cls, ci) =>
        ci !== classIndex ? cls : {
          ...cls,
          spells: cls.spells.map((s, si) =>
            si !== spellIndex ? s : {
              ...s,
              vehicles: s.vehicles.map(v =>
                !v.enabled ? v : { ...v, modules: updaterFn(v.modules ?? []) }
              ),
            }
          ),
        }
      );
      return syncSlots({ ...prev, classes });
    });
  };

  const setActiveModuleForSlot = (slot, moduleIndex) => {
    updateActiveVehicleModules(modules => {
      const targetSlot = slot === 'armor' ? 'armor' : (slot === 'mainHand' ? 'main' : 'off');
      const targetModule = modules[moduleIndex];
      if (!targetModule) return modules;

      return modules.map((m, idx) => {
        if (!m.equipped) return m;

        const isTarget = idx === moduleIndex;
        const mType = m.type;
        const isCorrectType =
          (slot === 'armor' && mType === 'pilot_module_armor') ||
          (['mainHand', 'offHand'].includes(slot) && mType === 'pilot_module_weapon');

        if (!isCorrectType) return m;

        if (isTarget) {
          const newSlot = m.cumbersome ? 'both' : targetSlot;
          return { ...m, enabled: true, equippedSlot: newSlot };
        } else {
          // Disable other modules that would collide with the newly enabled one
          const takingMain = targetSlot === 'main' || targetModule.cumbersome;
          const takingOff = targetSlot === 'off' || targetModule.cumbersome;

          const wasInMain = m.equippedSlot === 'main' || m.equippedSlot === 'both';
          const wasInOff = m.equippedSlot === 'off' || m.equippedSlot === 'both';

          if ((takingMain && wasInMain) || (takingOff && wasInOff)) {
            return { ...m, enabled: false };
          }
          return m;
        }
      });
    });
    setModuleOverrideSlot(null);
  };

  const setModuleEnabledForSlot = (slot, enabled) => {
    updateActiveVehicleModules(modules => modules.map(m => {
      if (!m.equipped) return m;
      const matches =
        (slot === 'armor'    && m.type === 'pilot_module_armor') ||
        (slot === 'mainHand' && m.type === 'pilot_module_weapon' && (m.equippedSlot === 'main' || m.equippedSlot === 'both')) ||
        (slot === 'offHand'  && m.type === 'pilot_module_weapon' && (m.equippedSlot === 'off'  || m.equippedSlot === 'both'));
      return matches ? { ...m, enabled } : m;
    }));
  };

  // All support modules that are physically installed on the active vehicle
  const equippedSupportModules = activeVehicle
    ? (activeVehicle.modules ?? [])
        .map((m, i) => ({ ...m, originalIndex: i }))
        .filter(m => m.equipped && m.type === 'pilot_module_support')
    : [];

  const toggleSupportModule = (moduleIndex) => {
    updateActiveVehicleModules(modules =>
      modules.map((m, idx) =>
        idx === moduleIndex ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  // Toggle vehicle enabled state (enter = enable first vehicle, exit = disable active)
  const handleToggleVehicle = () => {
    if (!pilotSpellInfo) return;
    const { classIndex, spellIndex } = pilotSpellInfo;
    setPlayer(prev => {
      const spell = prev.classes[classIndex].spells[spellIndex];
      const vehicles = (spell.vehicles ?? []).map((v, vi) =>
        activeVehicle ? { ...v, enabled: false } : { ...v, enabled: vi === 0 }
      );
      const classes = prev.classes.map((cls, ci) =>
        ci !== classIndex ? cls : {
          ...cls,
          spells: cls.spells.map((s, si) =>
            si !== spellIndex ? s : { ...s, vehicles }
          ),
        }
      );
      return syncSlots({ ...prev, classes });
    });
  };

  const handleSaveVehicles = (_, updatedPilot) => {
    if (!pilotSpellInfo) return;
    const { classIndex, spellIndex } = pilotSpellInfo;
    setPlayer(prev => {
      const classes = prev.classes.map((cls, ci) =>
        ci !== classIndex ? cls : {
          ...cls,
          spells: cls.spells.map((s, si) =>
            si !== spellIndex ? s : {
              ...s,
              vehicles: updatedPilot.vehicles,
              showInPlayerSheet: updatedPilot.showInPlayerSheet,
            }
          ),
        }
      );
      return syncSlots({ ...prev, classes });
    });
    setVehicleModalOpen(false);
  };

  // Slot click: if a vehicle module exists for this slot, show override dialog; otherwise regular picker
  const handleSlotClick = (slot) => {
    if (['mainHand', 'offHand', 'armor'].includes(slot) && getEquippedModuleForSlot(slot)) {
      setModuleOverrideSlot(slot);
    } else {
      setPickerSlot(slot);
    }
  };

  const resolveVehicleModule = (ref) => {
    if (!ref || !activeVehicle) return null;
    return activeVehicle.modules.find(m => m.name === ref.moduleName && m.enabled) ?? null;
  };

  const vehicleAccessoryModule = vs?.accessory ? resolveVehicleModule(vs.accessory) : null;

  // Support slots - deduplicate consecutive same-module refs (complex modules)
  const supportSlots = (() => {
    if (!vs?.support?.length) return [];
    const seen = new Set();
    return vs.support.map(ref => {
      if (!ref) return { ref: null, module: null };
      const key = `${ref.vehicleName}|${ref.moduleName}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return { ref, module: resolveVehicleModule(ref) };
    }).filter(Boolean);
  })();

  const slotCards = [
    { slot: 'mainHand',  label: t('Main Hand'),  resolved: mainHandResolved,  locked: mainHandLocked },
    { slot: 'offHand',   label: t('Off Hand'),   resolved: offHandResolved,   locked: offHandLocked },
    { slot: 'armor',     label: t('Armor'),      resolved: armorResolved,     locked: false },
    { slot: 'accessory', label: t('Accessory'),  resolved: accessoryResolved, locked: false },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: '8px',
        border: '2px solid',
        borderColor: secondary,
        display: 'flex',
        flexDirection: isCharacterSheet ? 'column' : 'row',
      }}
    >
      {/* Section header */}
      <Typography
        variant="h1"
        sx={isCharacterSheet ? {
          textTransform: "uppercase",
          padding: "5px",
          backgroundColor: primary,
          color: '#fff',
          borderRadius: '8px 8px 0 0',
          fontSize: '1.5em',
        } : {
          writingMode: 'vertical-lr',
          textTransform: "uppercase",
          transform: 'rotate(180deg)',
          ml: '-1px',
          mr: '10px',
          mt: '-1px',
          mb: '-1px',
          paddingY: '10px',
          backgroundColor: primary,
          color: '#fff',
          borderRadius: '0 8px 8px 0',
          fontSize: '2em',
        }}
        align="center"
      >
        {t('Loadout')}
      </Typography>

      <Box sx={{ p: 1.5, flexGrow: 1 }}>

        {/* Vehicle enter/exit + swap - shown when a pilot-vehicle spell exists */}
        {pilotSpellInfo && isEditMode && (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <PrecisionManufacturingIcon sx={{ fontSize: 16, color: activeVehicle ? 'success.main' : 'text.disabled' }} />
              <Typography variant="caption" fontWeight={700} color={activeVehicle ? 'success.main' : 'text.secondary'}>
                {activeVehicle ? (activeVehicle.customName || t('Vehicle')) : t('No vehicle active')}
              </Typography>
              <Box flex={1} />
              <Button
                size="small"
                variant={activeVehicle ? 'outlined' : 'contained'}
                color={activeVehicle ? 'error' : 'success'}
                startIcon={<DirectionsWalkIcon />}
                onClick={handleToggleVehicle}
                sx={{ fontSize: '0.7rem', py: 0.25 }}
              >
                {activeVehicle ? t('Exit Vehicle') : t('Enter Vehicle')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SyncAltIcon />}
                onClick={() => setVehicleModalOpen(true)}
                sx={{ fontSize: '0.7rem', py: 0.25 }}
              >
                {t('Swap Vehicle')}
              </Button>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
          </>
        )}

        {/* 4-slot grid + aux hand */}
        <Grid container spacing={1}>
          {slotCards.map(({ slot, label, resolved, locked }) => (
            <Grid item xs={6} sm={3} key={slot} sx={{ display: 'flex' }}>
              <SlotCard
                label={label}
                resolved={resolved}
                locked={locked}
                isEditMode={isEditMode}
                hasModule={!!getEquippedModuleForSlot(slot)}
                onClick={() => handleSlotClick(slot)}
                onRoll={(slot === 'mainHand' || slot === 'offHand') ? () => handleRollSlot(slot) : undefined}
                onSwap={(slot === 'mainHand' || slot === 'offHand') ? () => handleSwapSlot(slot) : undefined}
              />
            </Grid>
          ))}
          {auxHandItem && (
            <Grid item xs={6} sm={3} sx={{ display: 'flex' }}>
              <SlotCard
                label={t('Aux Hand')}
                resolved={{ kind: 'playerItem', item: auxHandItem }}
                locked={false}
                isEditMode={isEditMode}
                isAux
                onRoll={() => handleRollSlot('aux')}
              />
            </Grid>
          )}
        </Grid>

        {/* Vehicle-only slots (accessory + support) */}
        {activeVehicle && (
          <>
            <Divider sx={{ my: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<PrecisionManufacturingIcon />}
                  label={activeVehicle.customName || t('Vehicle')}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                {vehicleModuleUsage && [
                  { key: 'weapon', label: t('Weapon') },
                  { key: 'armor', label: t('Armor') },
                  { key: 'support', label: t('Support') },
                ].map(({ key, label }) => {
                  const used = vehicleModuleUsage.counts[key];
                  const max = vehicleModuleUsage.limits[key];
                  const over = max !== -1 && used > max;
                  return (
                    <Chip
                      key={key}
                      label={`${label}: ${used}/${max === -1 ? '∞' : max}`}
                      size="small"
                      color={over ? 'error' : 'success'}
                      variant={over ? 'filled' : 'outlined'}
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  );
                })}
              </Box>
            </Divider>
            <Grid container spacing={1}>
              {vehicleAccessoryModule && (
                <Grid item xs={6} sm={3}>
                  <VehicleSupportCard
                    label={t('Accessory')}
                    module={vehicleAccessoryModule}
                    vehicle={activeVehicle}
                  />
                </Grid>
              )}
              {supportSlots.map((entry, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <VehicleSupportCard
                    label={`${t('Support')} ${i + 1}`}
                    module={entry.module}
                    vehicle={activeVehicle}
                    isEditMode={isEditMode}
                    onClick={isEditMode ? () => setSupportPickerOpen(true) : undefined}
                  />
                </Grid>
              ))}
              {/* Add slot card when there are equipped-but-not-all-enabled support modules */}
              {isEditMode && equippedSupportModules.some(m => !m.enabled) && (
                <Grid item xs={6} sm={3}>
                  <VehicleSupportCard
                    label={`${t('Support')} ${supportSlots.length + 1}`}
                    module={null}
                    vehicle={activeVehicle}
                    isEditMode={isEditMode}
                    onClick={() => setSupportPickerOpen(true)}
                  />
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>

      {/* Roll result dialog */}
      {rollDialog && (
        <Dialog open onClose={() => setRollDialog(null)} maxWidth="xs" fullWidth
          PaperProps={{ sx: { width: { xs: '90%', md: '30%' } } }}
        >
          <DialogTitle variant="h3" sx={{
            backgroundColor: rollDialog.isCritFail ? '#bb2124' : rollDialog.isCritSuccess ? '#22bb33' : '#aaaaaa',
          }}>
            {rollDialog.isCritFail ? t('Critical Failure!') : rollDialog.isCritSuccess ? t('Critical Success!') : t('Result')}
          </DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <Grid container spacing={2} sx={{ textAlign: 'center', pt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t('Accuracy')}</Typography>
                <Typography variant="h1">{rollDialog.accuracy}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t('Damage')}</Typography>
                <Typography variant="h1">{rollDialog.damageRoll}</Typography>
                {rollDialog.type && (
                  <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t(rollDialog.type)}</Typography>
                )}
              </Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {rollDialog.r1} [{attributes[rollDialog.att1]?.shortcaps ?? rollDialog.att1}]
                  {' + '}
                  {rollDialog.r2} [{attributes[rollDialog.att2]?.shortcaps ?? rollDialog.att2}]
                  {rollDialog.prec !== 0 ? ` + ${rollDialog.prec}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Damage')}: {Math.max(rollDialog.r1, rollDialog.r2)} + {rollDialog.damage}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRollDialog(null)} color="secondary" variant="contained">{t('Close')}</Button>
            <Button onClick={() => handleRollSlot(rollDialog.slot)} color="primary" variant="contained" autoFocus>{t('Re-roll')}</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Regular slot picker dialog */}
      {pickerSlot && (
        <SlotPickerDialog
          open={Boolean(pickerSlot)}
          onClose={() => setPickerSlot(null)}
          slot={pickerSlot}
          player={player}
          setPlayer={setPlayer}
          onUseModuleEquipment={
            activeVehicle && ['mainHand', 'offHand', 'armor'].includes(pickerSlot) && getEquippedModulesForSlot(pickerSlot).length > 0
              ? () => { setPickerSlot(null); setModuleOverrideSlot(pickerSlot); }
              : undefined
          }
          onClearOtherHandModule={
            activeVehicle && ['mainHand', 'offHand'].includes(pickerSlot)
              ? () => setModuleEnabledForSlot(pickerSlot === 'mainHand' ? 'offHand' : 'mainHand', false)
              : undefined
          }
        />
      )}

      {/* Module override dialog */}
      <Dialog
        open={Boolean(moduleOverrideSlot)}
        onClose={() => setModuleOverrideSlot(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrecisionManufacturingIcon color="success" fontSize="small" />
          {t('Slot - Module Override')}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            {t('Select a vehicle module to override this slot:')}
          </Typography>
          <List dense>
            {getEquippedModulesForSlot(moduleOverrideSlot).map((m) => {
              const isEnabled = m.enabled && (
                (moduleOverrideSlot === 'mainHand' && (m.equippedSlot === 'main' || m.equippedSlot === 'both')) ||
                (moduleOverrideSlot === 'offHand' && (m.equippedSlot === 'off' || m.equippedSlot === 'both')) ||
                (moduleOverrideSlot === 'armor' && m.equippedSlot === 'armor')
              );
              return (
                <ListItem key={m.originalIndex} disablePadding>
                  <ListItemButton onClick={() => setActiveModuleForSlot(moduleOverrideSlot, m.originalIndex)}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Radio
                        edge="start"
                        checked={isEnabled}
                        disableRipple
                        size="small"
                        color="success"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={m.customName || t(m.name)}
                      secondary={moduleStatLine(m)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: isEnabled ? 700 : 400 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              const slot = moduleOverrideSlot;
              setModuleEnabledForSlot(slot, false);
              setModuleOverrideSlot(null);
              setPickerSlot(slot);
            }}
          >
            {t('Use Regular Equipment')}
          </Button>
          <Box>
            <Button
              size="small"
              color="error"
              onClick={() => {
                setModuleEnabledForSlot(moduleOverrideSlot, false);
                setModuleOverrideSlot(null);
              }}
            >
              {t('Disable Module')}
            </Button>
            <Button size="small" onClick={() => setModuleOverrideSlot(null)}>{t('Cancel')}</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Support module picker dialog */}
      <Dialog
        open={supportPickerOpen}
        onClose={() => setSupportPickerOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrecisionManufacturingIcon color="success" fontSize="small" />
          {t('Support Modules')}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {equippedSupportModules.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('No support modules installed on this vehicle.')}
            </Typography>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                {t('Enable or disable support modules:')}
              </Typography>
              <List dense>
                {equippedSupportModules.map((m) => (
                  <ListItem key={m.originalIndex} disablePadding>
                    <ListItemButton onClick={() => toggleSupportModule(m.originalIndex)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={m.enabled ?? false}
                          disableRipple
                          size="small"
                          color="success"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={m.customName || t(m.name)}
                        secondary={m.isComplex ? `${t('Complex')} - ${(m.name === 'pilot_custom_support' ? m.description : t(m.description || '')).slice(0, 40)}` : (m.name === 'pilot_custom_support' ? m.description : t(m.description || '')).slice(0, 50)}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: m.enabled ? 700 : 400 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setSupportPickerOpen(false)}>{t('Done')}</Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle swap modal */}
      {pilotSpellInfo && (
        <SpellPilotVehiclesModal
          open={vehicleModalOpen}
          onClose={() => setVehicleModalOpen(false)}
          onSave={handleSaveVehicles}
          pilot={pilotSpellInfo.spell}
        />
      )}
    </Paper>
  );
}
