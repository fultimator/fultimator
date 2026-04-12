import React, { useState, useEffect } from 'react';
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
  resolveEffectiveSlot,
  getActiveVehicle,
} from '../../equipment/slots/equipmentSlots';
import {
  getSlotLocks,
  getEquippedModulesForSlot,
  getEquippedModuleForSlot,
  getVehicleModuleUsage,
  getEquippedSupportModules,
  getSupportSlots,
  getAuxHandItem,
  getPilotSpellInfo,
} from '../../equipment/slots/loadoutSelectors';
import { useLoadoutStore } from '../../../../store/playerLoadoutStore';
import { calculateAttribute, calculateCustomWeaponStats } from '../../common/playerCalculations';
import attributes from '../../../../libs/attributes';
import SlotPickerDialog from '../../equipment/slots/SlotPickerDialog';
import SpellPilotVehiclesModal from '../../spells/SpellPilotVehiclesModal';
import PlayerEquipment from './PlayerEquipment';

const SLOTS = ['mainHand', 'offHand', 'armor', 'accessory'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, query) {
  const source = text == null ? '' : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;

  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'ig');
  return source.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} style={{ backgroundColor: 'yellow', padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

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
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] = useState(false);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);
  const [rollDialog, setRollDialog] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const store = useLoadoutStore();
  useEffect(() => { store.init(setPlayer); }, [setPlayer]);

  // Attributes
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

  // Vehicle / selectors
  const activeVehicle = getActiveVehicle(player);
  const vs = player?.vehicleSlots;

  const vehicleModuleUsage = getVehicleModuleUsage(player);
  const pilotSpellInfo = getPilotSpellInfo(player);
  const equippedSupportModules = getEquippedSupportModules(player);
  const supportSlots = getSupportSlots(player);
  const auxHandItem = getAuxHandItem(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);

  // Slot click routing
  const handleSlotClick = (slot) => {
    const hasModuleCandidates = ['mainHand', 'offHand', 'armor'].includes(slot)
      && Boolean(activeVehicle)
      && getEquippedModulesForSlot(player, slot).length > 0;
    setPickerOpenModuleOverride(hasModuleCandidates);
    setPickerSlot(slot);
  };

  // Vehicle handlers
  const handleToggleVehicle = () => { store.toggleVehicle(); };
  const handleSaveVehicles = (_, updatedPilot) => {
    store.saveVehicles(updatedPilot);
    setVehicleModalOpen(false);
  };

  // Roll
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

  // Swap (Transforming weapon)
  const handleSwapSlot = (slot) => { store.swapForm(slot); };

  const mainHandResolved = resolveEffectiveSlot(player, 'mainHand');
  const offHandResolved  = resolveEffectiveSlot(player, 'offHand');

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
          const hasModule = !isAux && !!getEquippedModuleForSlot(player, slot);
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
              <Typography component="span" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, textTransform: 'uppercase', color: locked ? 'text.disabled' : 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0, mr: 0.5, width: { xs: '65px', sm: '75px' } }}>
                {slotLabel(t, slot)}
              </Typography>
              {locked && <LockIcon sx={{ fontSize: '0.65rem', color: 'text.disabled', flexShrink: 0, mr: 0.5 }} />}
              {isVehicle && !locked && <PrecisionManufacturingIcon sx={{ fontSize: '0.65rem', color: 'success.main', flexShrink: 0, mr: 0.25 }} />}
              {hasModule && !isVehicle && !isEmpty && !locked && <PrecisionManufacturingIcon sx={{ fontSize: '0.65rem', color: 'success.light', opacity: 0.6, flexShrink: 0, mr: 0.25 }} />}
              <Typography component="span" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: (isEmpty || locked) ? 400 : 600, color: locked ? 'text.disabled' : isEmpty ? 'text.disabled' : isVehicle ? 'success.main' : isAux ? 'warning.main' : 'text.primary', fontStyle: (isEmpty || locked) ? 'italic' : 'normal', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {highlightMatch(name, searchQuery)}
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
                  <Typography component="span" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0, mr: 0.5, width: { xs: '65px', sm: '75px' } }}>
                    {`${t('Support')} ${i + 1}`}
                  </Typography>
                  <Typography component="span" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: isEmpty ? 400 : 600, color: isEmpty ? 'text.disabled' : 'success.main', fontStyle: isEmpty ? 'italic' : 'normal', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isEmpty ? t('- Empty -') : highlightMatch(entry.module.customName || t(entry.module.name), searchQuery)}
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
      {/* Slot picker dialog (includes module override view) */}
      {pickerSlot && (
        <SlotPickerDialog
          open
          onClose={() => { setPickerSlot(null); setPickerOpenModuleOverride(false); }}
          slot={pickerSlot}
          player={player}
          setPlayer={setPlayer}
          vehicleModules={activeVehicle && ['mainHand', 'offHand', 'armor'].includes(pickerSlot) ? getEquippedModulesForSlot(player, pickerSlot) : []}
          onSelectModule={(idx) => store.selectModule(pickerSlot, idx)}
          onDisableModule={() => store.disableModule(pickerSlot)}
          openModuleOverride={pickerOpenModuleOverride}
          onClearOtherHandModule={
            activeVehicle && ['mainHand', 'offHand'].includes(pickerSlot)
              ? () => store.disableModule(pickerSlot === 'mainHand' ? 'offHand' : 'mainHand')
              : undefined
          }
        />
      )}
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
                    <ListItemButton onClick={() => store.toggleSupportModule(m.originalIndex)}>
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
              <Grid  size={6}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t('Accuracy')}</Typography>
                <Typography variant="h1">{rollDialog.accuracy}</Typography>
              </Grid>
              <Grid  size={6}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t('Damage')}</Typography>
                <Typography variant="h1">{rollDialog.damageRoll}</Typography>
                {rollDialog.type && <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{t(rollDialog.type)}</Typography>}
              </Grid>
              <Grid  sx={{ mt: 1 }} size={12}>
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
