import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Radio,
  Typography, Box, Divider, Tooltip, IconButton,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useTranslate } from '../../../../translation/translate';
import { resolveEffectiveSlot } from './equipmentSlots';
import { equipItemToSlot, clearSlotAction } from './loadoutActions';
import attributes from '../../../../libs/attributes';

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

// Customizations that make a custom weapon martial
const MARTIAL_CUSTOMIZATIONS = [
  'weapon_customization_quick',
  'weapon_customization_magicdefenseboost',
  'weapon_customization_powerful',
];

const resolveDef  = (item) => item.def  || 0;
const resolveMdef = (item) => item.mdef || 0;

/**
 * slot: 'mainHand' | 'offHand' | 'armor' | 'accessory'
 * open, onClose, player, setPlayer
 * vehicleModules - modules available for this slot when a vehicle is active (pass [] when none)
 * onSelectModule(originalIndex) - activate a vehicle module for this slot
 * onDisableModule() - disable the active vehicle module for this slot
 * openModuleOverride - start with the module override view open (when slot already has an active module)
 * onClearOtherHandModule - called when an item is selected and the other hand has an active module
 */
export default function SlotPickerDialog({
  open, onClose, slot, player, setPlayer,
  vehicleModules = [], onSelectModule, onDisableModule,
  openModuleOverride = false,
  onClearOtherHandModule,
}) {
  const { t } = useTranslate();
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [pendingCandidate, setPendingCandidate] = useState(null);
  const [martialWarning, setMartialWarning] = useState(null); // candidate that triggered the warning
  const [moduleOverrideOpen, setModuleOverrideOpen] = useState(false);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [pendingModule, setPendingModule] = useState(null);

  useEffect(() => {
    if (open) {
      setModuleOverrideOpen(openModuleOverride);
      setHoveredModule(null);
      setPendingModule(null);
    }
  }, [open]);

  const hasDualShieldBearer = player?.classes?.some(cls =>
    cls.skills?.some(
      sk => sk.specialSkill === 'Dual Shieldbearer' && sk.currentLvl === 1
    )
  ) ?? false;

  const inv = player?.equipment?.[0] || {};

  const mainHandHasTwoHanded = (() => {
    const res = resolveEffectiveSlot(player, 'mainHand');
    if (res?.kind === 'vehicleModule') return res.module.cumbersome ?? false;

    const ref = player?.equippedSlots?.mainHand;
    if (!ref) return false;
    if (ref.source === 'customWeapons') return true; // always two-handed
    const w = inv?.weapons?.find(x => x.name === ref.name);
    return w?.hands === 2 || w?.isTwoHand || false;
  })();

  const otherHandHasWeaponModule = (() => {
    if (slot !== 'mainHand' && slot !== 'offHand') return false;
    const otherSlot = slot === 'mainHand' ? 'offHand' : 'mainHand';
    const res = resolveEffectiveSlot(player, otherSlot);
    return res?.kind === 'vehicleModule';
  })();

  // Martial proficiency check

  /**
   * Returns true if the player is proficient with the candidate item,
   * or if the item is not martial (so no restriction applies).
   */
  const checkMartialProficiency = (candidate) => {
    const { item, source } = candidate;
    if (source === 'accessories') return true; // no martial concept

    let isMartial = false;
    let itemType = null; // 'meleeWeapon' | 'rangedWeapon' | 'shield' | 'armor'

    if (source === 'customWeapons') {
      isMartial = (item.customizations ?? []).some(c => MARTIAL_CUSTOMIZATIONS.includes(c.name));
      itemType = item.range === 'weapon_range_ranged' ? 'rangedWeapon' : 'meleeWeapon';
    } else if (source === 'weapons') {
      isMartial = item.martial ?? false;
      itemType = item.ranged ? 'rangedWeapon' : 'meleeWeapon';
    } else if (source === 'shields') {
      isMartial = item.martial ?? false;
      itemType = 'shield';
    } else if (source === 'armor') {
      isMartial = item.martial ?? false;
      itemType = 'armor';
    }

    if (!isMartial) return true;

    for (const cls of player?.classes ?? []) {
      const martials = cls.benefits?.martials;
      if (!martials) continue;
      if (itemType === 'meleeWeapon'  && martials.melee)  return true;
      if (itemType === 'rangedWeapon' && martials.ranged) return true;
      if (itemType === 'shield'       && martials.shield) return true;
      if (itemType === 'armor'        && martials.armor)  return true;
    }
    return false;
  };

  /** Build the list of items valid for the given slot. */
  function getCandidates() {
    const formatWeapon = (w) => {
      const att1 = attributes[w.att1]?.shortcaps ?? w.att1;
      const att2 = attributes[w.att2]?.shortcaps ?? w.att2;
      const atts = `${att1}+${att2}`;
      const dmg = w.dmg ?? w.damage ?? '?';
      const hands = (w.hands === 2 || w.isTwoHand) ? '2H' : '1H';
      return `${atts} / ${dmg} ${t(w.type || '')} / ${hands}`;
    };

    switch (slot) {
      case 'mainHand': {
        const weapons = (inv.weapons ?? [])
          .map((w, i) => ({ label: w.name, sub: formatWeapon(w), source: 'weapons', item: w, index: i }));
        const customs = (inv.customWeapons ?? [])
          .map((w, i) => ({ label: w.name, sub: w.category, source: 'customWeapons', item: w, index: i }));
        const shields = hasDualShieldBearer
          ? (inv.shields ?? []).map((s, i) => ({
              label: s.name, sub: `DEF +${resolveDef(s)}`, source: 'shields', item: s, index: i,
            }))
          : [];
        return [...weapons, ...customs, ...shields];
      }
      case 'offHand': {
        if (mainHandHasTwoHanded) return [];
        const oneHanded = (inv.weapons ?? [])
          .filter(w => !(w.hands === 2 || w.isTwoHand))
          .map((w, _, arr) => {
            const i = (inv.weapons ?? []).indexOf(w);
            return { label: w.name, sub: formatWeapon(w), source: 'weapons', item: w, index: i };
          });
        const shields = (inv.shields ?? [])
          .map((s, i) => ({ label: s.name, sub: `DEF +${resolveDef(s)}  MDEF +${resolveMdef(s)}`, source: 'shields', item: s, index: i }));
        return [...oneHanded, ...shields];
      }
      case 'armor':
        return (inv.armor ?? [])
          .map((a, i) => ({
            label: a.name,
            sub: `DEF +${resolveDef(a)}  MDEF +${resolveMdef(a)}  INIT ${(a.init ?? 0) >= 0 ? '+' : ''}${a.init ?? 0}`,
            source: 'armor', item: a, index: i,
          }));
      case 'accessory':
        return (inv.accessories ?? [])
          .map((a, i) => ({ label: a.name, sub: a.quality || '-', source: 'accessories', item: a, index: i }));
      default:
        return [];
    }
  }

  const candidates = getCandidates();
  const currentRef = player?.equippedSlots?.[slot];

  const handleSelect = (candidate) => {
    setPlayer(prev => equipItemToSlot(prev, slot, candidate));
    if (otherHandHasWeaponModule) onClearOtherHandModule?.();
    onClose();
  };

  const handleClear = () => {
    if (!currentRef) { onClose(); return; }
    setPlayer(prev => clearSlotAction(prev, slot));
    onClose();
  };

  const handleAccept = () => {
    if (!pendingCandidate) { onClose(); return; }
    if (!checkMartialProficiency(pendingCandidate)) {
      setMartialWarning(pendingCandidate);
      return;
    }
    handleSelect(pendingCandidate);
  };

  const slotLabel = {
    mainHand:  t('Main Hand'),
    offHand:   t('Off Hand'),
    armor:     t('Armor'),
    accessory: t('Accessory'),
  }[slot] ?? slot;

  // Visually-selected item: pending click wins over the currently equipped one
  const selectedCandidate = pendingCandidate
    ?? candidates.find(c => {
      if (c.source !== currentRef?.source || c.label !== currentRef?.name) return false;
      if (currentRef.index !== undefined) return c.index === currentRef.index;
      return true;
    })
    ?? null;

  // Preview: last hovered (latches: no onMouseLeave so no flicker), falls back to selection
  const previewCandidate = hoveredCandidate ?? selectedCandidate ?? null;

  // Module preview: hovered module wins, falls back to the currently active one
  const activeModule = vehicleModules.find(m =>
    m.enabled && (
      (slot === 'mainHand' && (m.equippedSlot === 'main' || m.equippedSlot === 'both')) ||
      (slot === 'offHand'  && (m.equippedSlot === 'off'  || m.equippedSlot === 'both')) ||
      (slot === 'armor'    && m.equippedSlot === 'armor')
    )
  ) ?? null;
  const previewModule = hoveredModule ?? pendingModule ?? activeModule ?? null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        {moduleOverrideOpen ? (
          /* Module override view */
          <>
            <DialogTitle sx={{ fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PrecisionManufacturingIcon color="success" fontSize="small" />
              {t('Slot - Module Override')}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Module preview panel */}
              <Box sx={{ px: 2, py: 1, minHeight: 72 }}>
                {previewModule ? (
                  <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={700}>{previewModule.customName || t(previewModule.name)}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{moduleStatLine(previewModule)}</Typography>
                    {previewModule.description && (
                      <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 0.5, fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                        {t(previewModule.description).slice(0, 120)}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ p: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="caption" color="text.disabled" fontStyle="italic">
                      {t('Hover a module to preview')}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider />
              <List dense disablePadding>
                {vehicleModules.map((m) => {
                  const isActive = m.enabled && (
                    (slot === 'mainHand' && (m.equippedSlot === 'main' || m.equippedSlot === 'both')) ||
                    (slot === 'offHand'  && (m.equippedSlot === 'off'  || m.equippedSlot === 'both')) ||
                    (slot === 'armor'    && m.equippedSlot === 'armor')
                  );
                  const isPending = pendingModule?.originalIndex === m.originalIndex;
                  const isChecked = isPending || (!pendingModule && isActive);
                  return (
                    <ListItem key={m.originalIndex} disablePadding onMouseEnter={() => setHoveredModule(m)}>
                      <ListItemButton
                        onClick={() => setPendingModule(m)}
                        onDoubleClick={() => { onSelectModule?.(m.originalIndex); onClose(); }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Radio edge="start" checked={isChecked} disableRipple size="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={m.customName || t(m.name)}
                          secondary={moduleStatLine(m)}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: (isPending || isActive) ? 700 : 400 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
              <Button size="small" color="error" variant="contained" onClick={() => { onDisableModule?.(); onClose(); }}>
                {t('Disable Module')}
              </Button>
              <Box>
                <Button size="small" color="primary" sx={{ mr: 1 }} onClick={() => { onDisableModule?.(); setModuleOverrideOpen(false); }}>
                  {t('Use Regular Equipment')}
                </Button>
                <Button size="small" sx={{ mr: 1 }} onClick={onClose}>{t('Cancel')}</Button>
                <Button
                  size="small"
                  color="success"
                  variant="contained"
                  disabled={!pendingModule}
                  onClick={() => { onSelectModule?.(pendingModule.originalIndex); onClose(); }}
                >
                  {t('Accept')}
                </Button>
              </Box>
            </DialogActions>
          </>
        ) : (
          /* Regular item picker view */
          <>
            <DialogTitle sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {t('Choose item for')}: {slotLabel}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Item preview panel */}
              <Box sx={{ px: 2, py: 1, minHeight: 72 }}>
                {previewCandidate ? (
                  <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="body2" fontWeight={700}>{previewCandidate.label}</Typography>
                      {!checkMartialProficiency(previewCandidate) && (
                        <Tooltip title={t('Not proficient with this martial item')}>
                          <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">{previewCandidate.sub}</Typography>
                    {previewCandidate.item?.quality && previewCandidate.item.quality !== previewCandidate.sub && (
                      <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 0.5, fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                        {previewCandidate.item.quality}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ p: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="caption" color="text.disabled" fontStyle="italic">
                      {t('Hover an item to preview')}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider />
              {otherHandHasWeaponModule && (
                <Typography sx={{ px: 2, pt: 1.5, pb: 0.5, color: 'warning.main', fontSize: '0.75rem' }}>
                  {t('Slot is restricted by a weapon module in the other hand.')} {t('Equipping item will clear slots')}
                </Typography>
              )}
              {candidates.length === 0 ? (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>
                  {mainHandHasTwoHanded && slot === 'offHand'
                    ? t('Off Hand is locked by a two-handed weapon.')
                    : t('No items available for this slot.')}
                </Typography>
              ) : (
                <List dense disablePadding>
                  {candidates.map((c, i) => {
                    const isPending = pendingCandidate?.label === c.label && pendingCandidate?.source === c.source && pendingCandidate?.index === c.index;
                    const isEquipped = currentRef?.name === c.label && currentRef?.source === c.source && (currentRef.index === undefined || currentRef.index === c.index);
                    const isChecked = selectedCandidate?.label === c.label && selectedCandidate?.source === c.source && selectedCandidate?.index === c.index;
                    const isProficient = checkMartialProficiency(c);
                    return (
                      <ListItem key={i} disablePadding onMouseEnter={() => setHoveredCandidate(c)}>
                        <ListItemButton
                          onClick={() => setPendingCandidate(c)}
                          onDoubleClick={() => {
                            if (!checkMartialProficiency(c)) {
                              setPendingCandidate(c);
                              setMartialWarning(c);
                            } else {
                              handleSelect(c);
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Radio edge="start" checked={isChecked} disableRipple size="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                <span>{c.label}</span>
                                {!isProficient && (
                                  <Tooltip title={t('Not proficient  -  martial item')}>
                                    <WarningAmberIcon sx={{ fontSize: 13, color: 'warning.main', verticalAlign: 'middle' }} />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={c.sub}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: (isPending || isEquipped) ? 700 : 400, component: 'div' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
              <Box>
                {currentRef && (
                  <Button onClick={handleClear} color="error" variant="contained" size="small">
                    {t('Unequip')}
                  </Button>
                )}
                {vehicleModules.length > 0 && (
                  <Button onClick={() => { setHoveredModule(null); setPendingModule(null); setModuleOverrideOpen(true); }} color="success" size="small" sx={{ ml: currentRef ? 1 : 0 }}>
                    {t('Use Module Equipment')}
                  </Button>
                )}
              </Box>
              <Box>
                <Button onClick={onClose} size="small" sx={{ mr: 1 }}>{t('Cancel')}</Button>
                <Button onClick={handleAccept} color="primary" variant="contained" size="small" disabled={!pendingCandidate}>
                  {t('Accept')}
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Martial proficiency warning */}
      {martialWarning && (
        <Dialog open onClose={() => setMartialWarning(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <WarningAmberIcon fontSize="small" />
            {t('Not Proficient')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <strong>{martialWarning.label}</strong> {t('is a martial item and your character is not proficient with it.')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('Equipping it without proficiency may be against the rules. Equip anyway?')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMartialWarning(null)} size="small">{t('Cancel')}</Button>
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={() => {
                handleSelect(martialWarning);
                setMartialWarning(null);
              }}
            >
              {t('Equip Anyway')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
