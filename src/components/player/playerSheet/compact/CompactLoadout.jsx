import React, { useState } from 'react';
import {
  Box, Typography, ButtonBase, Collapse, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Radio, Checkbox, Chip, Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LockIcon from '@mui/icons-material/Lock';
import CasinoIcon from '@mui/icons-material/Casino';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { SwapHoriz } from '@mui/icons-material';
import { useTranslate } from '../../../../translation/translate';
import { useCustomTheme } from '../../../../hooks/useCustomTheme';
import {
  resolveEffectiveSlot, isItemEquipped, isTwoHandedEquipped,
  getActiveVehicle, syncSlots, deriveVehicleSlots,
} from '../../equipment/slots/equipmentSlots';
import { availableFrames } from '../../../../libs/pilotVehicleData';
import { getModuleTypeForLimits } from '../../spells/vehicleReducer';
import { calculateAttribute, calculateCustomWeaponStats } from '../../common/playerCalculations';
import attributes from '../../../../libs/attributes';
import SlotPickerDialog from '../../equipment/slots/SlotPickerDialog';
import SpellPilotVehiclesModal from '../../spells/SpellPilotVehiclesModal';
import PlayerEquipment from './PlayerEquipment';

const SLOTS = ['mainHand', 'offHand', 'armor', 'accessory'];

function slotLabel(t, slot) {
  return {
    mainHand:  t('Main Hand'),
    offHand:   t('Off Hand'),
    armor:     t('Armor'),
    accessory: t('Accessory'),
    aux:       t('Aux Hand'),
  }[slot];
}

function isWeaponResolved(resolved) {
  if (!resolved) return false;
  if (resolved.kind === 'vehicleModule') {
    return resolved.module.type === 'pilot_module_weapon' && !resolved.module.isShield;
  }
  const item = resolved.item;
  return !!(item?.att1 && item?.att2) || !!(item?.accuracyCheck?.att1 && item?.accuracyCheck?.att2);
}

function hasTransforming(resolved) {
  if (!resolved || resolved.kind !== 'playerItem') return false;
  return resolved.item?.customizations?.some(c => c.name === 'weapon_customization_transforming') ?? false;
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

export default function CompactLoadout({
  player,
  setPlayer,
  isEditMode,
  withEquipment = false,
  isMainTab = true,
  searchQuery = '',
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [pickerSlot, setPickerSlot] = useState(null);
  const [moduleOverrideSlot, setModuleOverrideSlot] = useState(null);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);
  const [rollDialog, setRollDialog] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  // ─── Attributes ──────────────────────────────────────────────────────────────
  const getAttrDie = (key) => {
    const normKey = key === 'will' ? 'willpower' : key;
    const base = player?.attributes?.[normKey] ?? 8;
    const cfg = {
      dexterity: [['slow', 'enraged'], ['dexUp']],
      insight:   [['dazed', 'enraged'], ['insUp']],
      might:     [['weak',  'poisoned'], ['migUp']],
      willpower: [['shaken','poisoned'], ['wlpUp']],
    }[normKey] ?? [[], []];
    return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
  };

  // ─── Vehicle ─────────────────────────────────────────────────────────────────
  const activeVehicle = getActiveVehicle(player);
  const vs = player?.vehicleSlots;
  const inv = player?.equipment?.[0] ?? {};

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

  const pilotSpellInfo = (() => {
    for (const [ci, cls] of (player?.classes ?? []).entries()) {
      for (const [si, spell] of (cls.spells ?? []).entries()) {
        if (spell.spellType === 'pilot-vehicle') return { spell, classIndex: ci, spellIndex: si };
      }
    }
    return null;
  })();

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

  const getEquippedModulesForSlot = (slot) => {
    if (!activeVehicle) return [];
    return (activeVehicle.modules ?? [])
      .map((m, originalIndex) => ({ ...m, originalIndex }))
      .filter(m => {
        if (!m.equipped) return false;
        if (slot === 'armor') return m.type === 'pilot_module_armor';
        if (['mainHand', 'offHand'].includes(slot)) return m.type === 'pilot_module_weapon';
        return false;
      });
  };

  const getEquippedModuleForSlot = (slot) => {
    const mods = getEquippedModulesForSlot(slot);
    return mods.find(m => {
      if (slot === 'armor')    return m.equippedSlot === 'armor';
      if (slot === 'mainHand') return m.equippedSlot === 'main' || m.equippedSlot === 'both';
      if (slot === 'offHand')  return m.equippedSlot === 'off'  || m.equippedSlot === 'both';
      return false;
    }) || mods[0] || null;
  };

  const setActiveModuleForSlot = (slot, moduleIndex) => {
    updateActiveVehicleModules(modules => {
      const targetSlot = slot === 'armor' ? 'armor' : (slot === 'mainHand' ? 'main' : 'off');
      const targetModule = modules[moduleIndex];
      if (!targetModule) return modules;
      return modules.map((m, idx) => {
        if (!m.equipped) return m;
        const isTarget = idx === moduleIndex;
        const isCorrectType =
          (slot === 'armor' && m.type === 'pilot_module_armor') ||
          (['mainHand', 'offHand'].includes(slot) && m.type === 'pilot_module_weapon');
        if (!isCorrectType) return m;
        if (isTarget) {
          return { ...m, enabled: true, equippedSlot: m.cumbersome ? 'both' : targetSlot };
        }
        const takingMain = targetSlot === 'main' || targetModule.cumbersome;
        const takingOff  = targetSlot === 'off'  || targetModule.cumbersome;
        const wasInMain  = m.equippedSlot === 'main' || m.equippedSlot === 'both';
        const wasInOff   = m.equippedSlot === 'off'  || m.equippedSlot === 'both';
        if ((takingMain && wasInMain) || (takingOff && wasInOff)) return { ...m, enabled: false };
        return m;
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

  const equippedSupportModules = activeVehicle
    ? (activeVehicle.modules ?? [])
        .map((m, i) => ({ ...m, originalIndex: i }))
        .filter(m => m.equipped && m.type === 'pilot_module_support')
    : [];

  const toggleSupportModule = (moduleIndex) => {
    updateActiveVehicleModules(modules =>
      modules.map((m, idx) => idx === moduleIndex ? { ...m, enabled: !m.enabled } : m)
    );
  };

  // Support slots — deduplicate complex modules
  const supportSlots = (() => {
    if (!vs?.support?.length) return [];
    const seen = new Set();
    return vs.support.map(ref => {
      if (!ref) return null;
      const key = `${ref.vehicleName}|${ref.moduleName}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const module = activeVehicle?.modules.find(m => m.name === ref.moduleName && m.enabled) ?? null;
      return { ref, module };
    }).filter(Boolean);
  })();

  // ─── Slot click routing ───────────────────────────────────────────────────────
  const handleSlotClick = (slot) => {
    if (['mainHand', 'offHand', 'armor'].includes(slot) && getEquippedModuleForSlot(slot)) {
      setModuleOverrideSlot(slot);
    } else {
      setPickerSlot(slot);
    }
  };

  // ─── Vehicle handlers ─────────────────────────────────────────────────────────
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

  // ─── Roll ─────────────────────────────────────────────────────────────────────
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

  // ─── Swap (Transforming weapon) ───────────────────────────────────────────────
  const handleSwapSlot = (slot) => {
    const resolved = resolveEffectiveSlot(player, slot);
    if (!hasTransforming(resolved)) return;
    const item = resolved.item;
    setPlayer(prev => {
      const customWeapons = (prev.equipment?.[0]?.customWeapons ?? []).map(cw =>
        cw.name === item.name
          ? { ...cw, activeForm: cw.activeForm === 'secondary' ? 'primary' : 'secondary' }
          : cw
      );
      return syncSlots({ ...prev, equipment: [{ ...prev.equipment[0], customWeapons }] });
    });
  };

  // ─── Twin Shields aux hand ────────────────────────────────────────────────────
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

  // ─── Lock logic (mirrors PlayerLoadout) ──────────────────────────────────────
  const mainHandResolved = resolveEffectiveSlot(player, 'mainHand');
  const offHandResolved  = resolveEffectiveSlot(player, 'offHand');

  const mainHandLocked = (() => {
    if (offHandResolved?.kind === 'vehicleModule' && !getEquippedModuleForSlot('mainHand')) return true;
    return false;
  })();

  const offHandLocked = (() => {
    if (mainHandResolved?.kind === 'vehicleModule') {
      if (mainHandResolved.module.cumbersome) return true;
      if (!getEquippedModuleForSlot('offHand')) return true;
      return false;
    }
    return isTwoHandedEquipped(player);
  })();

  const allSlots = [
    { slot: 'mainHand',  resolved: mainHandResolved,                        locked: mainHandLocked, isAux: false },
    { slot: 'offHand',   resolved: offHandResolved,                         locked: offHandLocked,  isAux: false },
    { slot: 'armor',     resolved: resolveEffectiveSlot(player, 'armor'),    locked: false,          isAux: false },
    { slot: 'accessory', resolved: resolveEffectiveSlot(player, 'accessory'),locked: false,          isAux: false },
    ...(auxHandItem ? [{ slot: 'aux', resolved: { kind: 'playerItem', item: auxHandItem }, locked: false, isAux: true }] : []),
  ];

  return (
    <Box sx={{ mb: 0.5 }}>
      {/* Header */}
      <Box sx={{ background: theme.primary, px: 1, py: 0.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textTransform: 'uppercase', color: '#fff', flex: 1 }}
        >
          {t('Loadout')}
        </Typography>

        {pilotSpellInfo && isEditMode && (
          <>
            <Tooltip title={activeVehicle ? t('Exit Vehicle') : t('Enter Vehicle')}>
              <IconButton size="small" onClick={handleToggleVehicle} sx={{ color: activeVehicle ? '#ff7070' : '#aaffaa', p: 0.25 }}>
                <DirectionsWalkIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Swap Vehicle')}>
              <IconButton size="small" onClick={() => setVehicleModalOpen(true)} sx={{ color: '#fff', p: 0.25 }}>
                <SyncAltIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {withEquipment && (
          <IconButton size="small" onClick={() => setEquipOpen(v => !v)} sx={{ color: '#fff', p: 0.25 }}>
            {equipOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Main 4 slots + aux */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {allSlots.map(({ slot, resolved, locked, isAux }) => {
          const isEmpty = !resolved;
          const isVehicle = resolved?.kind === 'vehicleModule';
          const hasModule = !isAux && !!getEquippedModuleForSlot(slot);
          const clickable = !isAux && !locked && isEditMode && !!setPlayer;
          const showRoll = (slot === 'mainHand' || slot === 'offHand' || slot === 'aux') && !locked && isWeaponResolved(resolved);
          const showSwap = (slot === 'mainHand' || slot === 'offHand') && hasTransforming(resolved);

          const name = locked
            ? (slot === 'offHand' ? t('2-Handed') : t('Locked'))
            : isEmpty
              ? t('- Empty -')
              : isVehicle
                ? (resolved.module.customName || t(resolved.module.name))
                : (() => {
                    const item = resolved.item;
                    if ('accuracyCheck' in item && item.activeForm === 'secondary') return item.secondWeaponName || `${item.name} (Alt)`;
                    return item.name ?? t('- Empty -');
                  })();

          const inner = (
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.25, borderBottom: '1px solid', borderColor: 'divider', minWidth: 0 }}>
              <Typography component="span" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, textTransform: 'uppercase', color: locked ? 'text.disabled' : 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0, mr: 0.5 }}>
                {slotLabel(t, slot)}
              </Typography>
              {locked && <LockIcon sx={{ fontSize: '0.65rem', color: 'text.disabled', flexShrink: 0, mr: 0.5 }} />}
              {isVehicle && !locked && <PrecisionManufacturingIcon sx={{ fontSize: '0.65rem', color: 'success.main', flexShrink: 0, mr: 0.25 }} />}
              {hasModule && !isVehicle && !isEmpty && !locked && <PrecisionManufacturingIcon sx={{ fontSize: '0.65rem', color: 'success.light', opacity: 0.6, flexShrink: 0, mr: 0.25 }} />}
              <Typography component="span" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: (isEmpty || locked) ? 400 : 600, color: locked ? 'text.disabled' : isEmpty ? 'text.disabled' : isVehicle ? 'success.main' : isAux ? 'warning.main' : 'text.primary', fontStyle: (isEmpty || locked) ? 'italic' : 'normal', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name}
              </Typography>
              {(showSwap || showRoll) && (
                <Box sx={{ display: 'flex', flexShrink: 0, ml: 0.25 }}>
                  {showSwap && (
                    <Tooltip title={t('weapon_customization_swap_form')}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleSwapSlot(slot); }} sx={{ p: 0.25 }}>
                        <SwapHoriz sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {showRoll && (
                    <Tooltip title={t('Roll')}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRollSlot(slot); }} sx={{ p: 0.25 }}>
                        <CasinoIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          );

          return clickable ? (
            <ButtonBase key={slot} onClick={() => handleSlotClick(slot)} sx={{ display: 'block', textAlign: 'left', width: '100%', '&:hover': { bgcolor: 'action.hover' } }}>
              {inner}
            </ButtonBase>
          ) : (
            <Box key={slot}>{inner}</Box>
          );
        })}
      </Box>

      {/* Vehicle support slots */}
      {activeVehicle && supportSlots.length > 0 && (
        <>
          <Divider sx={{ my: 0.25 }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Chip icon={<PrecisionManufacturingIcon />} label={activeVehicle.customName || t('Vehicle')} size="small" color="success" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
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
                    sx={{ fontSize: '0.6rem', height: 18 }}
                  />
                );
              })}
            </Box>
          </Divider>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {supportSlots.map((entry, i) => {
              const isEmpty = !entry.module;
              const inner = (
                <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.25, borderBottom: '1px solid', borderColor: 'divider', minWidth: 0 }}>
                  <PrecisionManufacturingIcon sx={{ fontSize: '0.65rem', color: 'success.main', flexShrink: 0, mr: 0.5 }} />
                  <Typography component="span" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0, mr: 0.5 }}>
                    {`${t('Support')} ${i + 1}`}
                  </Typography>
                  <Typography component="span" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: isEmpty ? 400 : 600, color: isEmpty ? 'text.disabled' : 'success.main', fontStyle: isEmpty ? 'italic' : 'normal', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isEmpty ? t('- Empty -') : (entry.module.customName || t(entry.module.name))}
                  </Typography>
                </Box>
              );
              return isEditMode ? (
                <ButtonBase key={i} onClick={() => setSupportPickerOpen(true)} sx={{ display: 'block', textAlign: 'left', width: '100%', '&:hover': { bgcolor: 'action.hover' } }}>
                  {inner}
                </ButtonBase>
              ) : (
                <Box key={i}>{inner}</Box>
              );
            })}
          </Box>
        </>
      )}

      {/* Collapsible equipment list */}
      {withEquipment && (
        <Collapse in={equipOpen}>
          <PlayerEquipment player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet isMainTab={isMainTab} searchQuery={searchQuery} />
        </Collapse>
      )}

      {/* Slot picker */}
      {pickerSlot && (
        <SlotPickerDialog
          open
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
      <Dialog open={Boolean(moduleOverrideSlot)} onClose={() => setModuleOverrideSlot(null)} maxWidth="xs" fullWidth>
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
                (moduleOverrideSlot === 'offHand'  && (m.equippedSlot === 'off'  || m.equippedSlot === 'both')) ||
                (moduleOverrideSlot === 'armor'    && m.equippedSlot === 'armor')
              );
              return (
                <ListItem key={m.originalIndex} disablePadding>
                  <ListItemButton onClick={() => setActiveModuleForSlot(moduleOverrideSlot, m.originalIndex)}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Radio edge="start" checked={isEnabled} disableRipple size="small" color="success" />
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
          <Button size="small" color="primary" onClick={() => { const s = moduleOverrideSlot; setModuleEnabledForSlot(s, false); setModuleOverrideSlot(null); setPickerSlot(s); }}>
            {t('Use Regular Equipment')}
          </Button>
          <Box>
            <Button size="small" color="error" onClick={() => { setModuleEnabledForSlot(moduleOverrideSlot, false); setModuleOverrideSlot(null); }}>
              {t('Disable Module')}
            </Button>
            <Button size="small" onClick={() => setModuleOverrideSlot(null)}>{t('Cancel')}</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Support module picker */}
      <Dialog open={supportPickerOpen} onClose={() => setSupportPickerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrecisionManufacturingIcon color="success" fontSize="small" />
          {t('Support Modules')}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {equippedSupportModules.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t('No support modules installed on this vehicle.')}</Typography>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">{t('Enable or disable support modules:')}</Typography>
              <List dense>
                {equippedSupportModules.map((m) => (
                  <ListItem key={m.originalIndex} disablePadding>
                    <ListItemButton onClick={() => toggleSupportModule(m.originalIndex)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox edge="start" checked={m.enabled ?? false} disableRipple size="small" color="success" />
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

      {/* Roll result dialog */}
      {rollDialog && (
        <Dialog open onClose={() => setRollDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { width: { xs: '90%', md: '30%' } } }}>
          <DialogTitle variant="h3" sx={{ backgroundColor: rollDialog.isCritFail ? '#bb2124' : rollDialog.isCritSuccess ? '#22bb33' : '#aaaaaa' }}>
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
                {rollDialog.type && <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t(rollDialog.type)}</Typography>}
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

      {/* Vehicle swap modal */}
      {vehicleModalOpen && pilotSpellInfo && (
        <SpellPilotVehiclesModal
          open
          onClose={() => setVehicleModalOpen(false)}
          pilot={pilotSpellInfo.spell}
          onSave={handleSaveVehicles}
        />
      )}
    </Box>
  );
}
