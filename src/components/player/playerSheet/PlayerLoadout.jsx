import React, { useState, useEffect } from 'react';
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
import { resolveEffectiveSlot, getActiveVehicle, isItemEquipped } from '../equipment/slots/equipmentSlots';
import { calculateAttribute, calculateCustomWeaponStats } from '../common/playerCalculations';
import {
  getSlotLocks,
  getEquippedModulesForSlot,
  getEquippedModuleForSlot,
  getVehicleModuleUsage,
  getEquippedSupportModules,
  getSupportSlots,
  getAuxHandItem,
} from '../equipment/slots/loadoutSelectors';
import { useLoadoutStore } from '../../../store/playerLoadoutStore';
import SlotPickerDialog from '../equipment/slots/SlotPickerDialog';
import SpellPilotVehiclesModal from '../spells/SpellPilotVehiclesModal';

// Stat line helpers

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

// SlotCard

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
    // Custom weapon: respect active form
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

// VehicleSupportCard

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

// PlayerLoadout

export default function PlayerLoadout({ player, setPlayer, isEditMode, isCharacterSheet, isOwner }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const primary = theme.primary;
  const secondary = theme.secondary;
  const canClickSlot = isEditMode || (isCharacterSheet && !!isOwner);

  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [rollDialog, setRollDialog] = useState(null);

  const store = useLoadoutStore();
  useEffect(() => { store.init(setPlayer); }, [setPlayer]);

  // Shared selectors
  const auxHandItem = getAuxHandItem(player);

  // Roll
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
        // Custom weapon: derive stats from customizations
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

  const handleSwapSlot = (slot) => { store.swapForm(slot); };

  const mainHandResolved  = resolveEffectiveSlot(player, 'mainHand');
  const offHandResolved   = resolveEffectiveSlot(player, 'offHand');
  const armorResolved     = resolveEffectiveSlot(player, 'armor');
  const accessoryResolved = resolveEffectiveSlot(player, 'accessory');

  const activeVehicle = getActiveVehicle(player);
  const vs = player?.vehicleSlots;

  const vehicleModuleUsage = getVehicleModuleUsage(player);
  const equippedSupportModules = getEquippedSupportModules(player);
  const supportSlots = getSupportSlots(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);
  const pilotSpellInfo = (() => {
    for (const [ci, cls] of (player.classes ?? []).entries()) {
      for (const [si, spell] of (cls.spells ?? []).entries()) {
        if (spell.spellType === 'pilot-vehicle') return { spell, classIndex: ci, spellIndex: si };
      }
    }
    return null;
  })();

  const handleToggleVehicle = () => { store.toggleVehicle(); };
  const handleSaveVehicles = (_, updatedPilot) => {
    store.saveVehicles(updatedPilot);
    setVehicleModalOpen(false);
  };

  const handleSlotClick = (slot) => {
    const hasModule = ['mainHand', 'offHand', 'armor'].includes(slot) && Boolean(getEquippedModuleForSlot(player, slot));
    setPickerOpenModuleOverride(hasModule);
    setPickerSlot(slot);
  };

  const vehicleAccessoryModule = vs?.accessory
    ? activeVehicle?.modules.find(m => m.name === vs.accessory.moduleName && m.enabled) ?? null
    : null;

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

        {/* Vehicle enter/exit + swap: shown when a pilot-vehicle spell exists */}
        {(isOwner || isEditMode) && pilotSpellInfo && (
          
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
                isEditMode={canClickSlot}
                hasModule={!!getEquippedModuleForSlot(player, slot)}
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
                isEditMode={canClickSlot}
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
                    isEditMode={canClickSlot}
                    onClick={canClickSlot ? () => setSupportPickerOpen(true) : undefined}
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
                    isEditMode={canClickSlot}
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

      {/* Slot picker dialog (includes module override view) */}
      {pickerSlot && (
        <SlotPickerDialog
          open={Boolean(pickerSlot)}
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
                    <ListItemButton onClick={() => store.toggleSupportModule(m.originalIndex)}>
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
