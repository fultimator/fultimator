import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Radio,
  Typography, Box, Divider,
} from '@mui/material';
import { useTranslate } from '../../../../translation/translate';
import { resolveEffectiveSlot, deriveVehicleSlots } from './equipmentSlots';
import attributes from '../../../../libs/attributes';

/**
 * slot: 'mainHand' | 'offHand' | 'armor' | 'accessory'
 * open, onClose, player, setPlayer
 * onUseModuleEquipment - optional, shown only when a vehicle is active with modules for this slot
 * onClearOtherHandModule - optional, called when an item is selected and the other hand has an active module
 */
export default function SlotPickerDialog({ open, onClose, slot, player, setPlayer, onUseModuleEquipment, onClearOtherHandModule }) {
  const { t } = useTranslate();
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [pendingCandidate, setPendingCandidate] = useState(null);

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
          .map(w => ({ label: w.name, sub: formatWeapon(w), source: 'weapons', item: w }));
        const customs = (inv.customWeapons ?? [])
          .map(w => ({ label: w.name, sub: w.category, source: 'customWeapons', item: w }));
        const shields = hasDualShieldBearer
          ? (inv.shields ?? []).map(s => ({
              label: s.name, sub: `DEF +${s.def}`, source: 'shields', item: s,
            }))
          : [];
        return [...weapons, ...customs, ...shields];
      }
      case 'offHand': {
        if (mainHandHasTwoHanded) return [];
        const oneHanded = (inv.weapons ?? [])
          .filter(w => !(w.hands === 2 || w.isTwoHand))
          .map(w => ({ label: w.name, sub: formatWeapon(w), source: 'weapons', item: w }));
        const shields = (inv.shields ?? [])
          .map(s => ({ label: s.name, sub: `DEF +${s.def}  MDEF +${s.mdef}`, source: 'shields', item: s }));
        return [...oneHanded, ...shields];
      }
      case 'armor':
        return (inv.armor ?? [])
          .map(a => ({ label: a.name, sub: `DEF +${a.def}  MDEF +${a.mdef}  INIT ${a.init >= 0 ? '+' : ''}${a.init}`, source: 'armor', item: a }));
      case 'accessory':
        return (inv.accessories ?? [])
          .map(a => ({ label: a.name, sub: a.quality || '-', source: 'accessories', item: a }));
      default:
        return [];
    }
  }

  const candidates = getCandidates();
  const currentRef = player?.equippedSlots?.[slot];

  // Helper: update one source array inside equipment[0] and return a new player.
  const patchInv = (p, source, updater) => {
    const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
    const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
    return { ...p, equipment };
  };

  const handleSelect = (candidate) => {
    // Un-equip anything currently in this slot (clear isEquipped flag)
    const unequipCurrent = (p) => {
      if (!currentRef) return p;
      return patchInv(p, currentRef.source, arr =>
        arr.map(it => it.name === currentRef.name ? { ...it, isEquipped: false } : it)
      );
    };

    // Equip the new item (set isEquipped flag)
    const equipNew = (p) => {
      return patchInv(p, candidate.source, arr =>
        arr.map(it => it.name === candidate.label ? { ...it, isEquipped: true } : it)
      );
    };

    const isCustom = candidate.source === 'customWeapons';
    const isTwoHand = isCustom || (candidate.item?.isTwoHand ?? false);

    // If assigning a two-handed weapon to mainHand, clear offHand isEquipped flag too
    const clearOffHandIfNeeded = (p) => {
      if (slot === 'mainHand' && isTwoHand) {
        const offRef = p.equippedSlots?.offHand;
        if (offRef) {
          return patchInv(p, offRef.source, arr =>
            arr.map(it => it.name === offRef.name ? { ...it, isEquipped: false } : it)
          );
        }
      }
      return p;
    };

    let updated = player;
    updated = unequipCurrent(updated);
    updated = clearOffHandIfNeeded(updated);
    updated = equipNew(updated);

    // Assign equippedSlots directly from user intent rather than re-deriving via heuristics.
    // Re-deriving loses the target slot for items that are valid in multiple slots (e.g. shields
    // with Dual Shieldbearer can go in either hand, but the heuristic always puts the first
    // equipped shield in offHand regardless of which slot the user picked).
    const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
    const newSlots = {
      ...prevSlots,
      [slot]: { source: candidate.source, name: candidate.label },
      ...(slot === 'mainHand' && isTwoHand ? { offHand: null } : {}),
    };

    updated = {
      ...updated,
      equippedSlots: newSlots,
      vehicleSlots: deriveVehicleSlots(updated),
    };

    setPlayer(updated);
    if (otherHandHasWeaponModule) onClearOtherHandModule?.();
    onClose();
  };

  const handleClear = () => {
    if (!currentRef) { onClose(); return; }
    const updated = patchInv(player, currentRef.source, arr =>
      arr.map(it => it.name === currentRef.name ? { ...it, isEquipped: false } : it)
    );
    const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
    setPlayer({
      ...updated,
      equippedSlots: { ...prevSlots, [slot]: null },
      vehicleSlots: deriveVehicleSlots(updated),
    });
    onClose();
  };

  const slotLabel = {
    mainHand:  t('Main Hand'),
    offHand:   t('Off Hand'),
    armor:     t('Armor'),
    accessory: t('Accessory'),
  }[slot] ?? slot;

  // Visually-selected item: pending click wins over the currently equipped one
  const selectedCandidate = pendingCandidate
    ?? candidates.find(c => c.label === currentRef?.name && c.source === currentRef?.source)
    ?? null;

  // Preview: last hovered (latches - no onMouseLeave so no flicker), falls back to selection
  const previewCandidate = hoveredCandidate ?? selectedCandidate ?? null;

  const handleAccept = () => {
    if (pendingCandidate) handleSelect(pendingCandidate);
    else onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{t('Choose item for')}: {slotLabel}</DialogTitle>
      {/* Item preview panel - outside DialogContent so it never scrolls */}
      {/* minHeight reserves space so layout never jumps regardless of content */}
      <Box sx={{ px: 2, pb: 1, minHeight: 72 }}>
        {previewCandidate ? (
          <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={700}>{previewCandidate.label}</Typography>
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
      <DialogContent sx={{ p: 0 }}>
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
              const isPending = pendingCandidate?.label === c.label && pendingCandidate?.source === c.source;
              const isEquipped = currentRef?.name === c.label && currentRef?.source === c.source;
              const isChecked = selectedCandidate?.label === c.label && selectedCandidate?.source === c.source;
              return (
                <ListItem key={i} disablePadding
                  onMouseEnter={() => setHoveredCandidate(c)}
                >
                  <ListItemButton
                    onClick={() => setPendingCandidate(c)}
                    onDoubleClick={() => handleSelect(c)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Radio
                        edge="start"
                        checked={isChecked}
                        disableRipple
                        size="small"
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={c.label}
                      secondary={c.sub}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: (isPending || isEquipped) ? 700 : 400 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box>
          {onUseModuleEquipment && (
            <Button onClick={onUseModuleEquipment} color="success" size="small">
              {t('Use Module Equipment')}
            </Button>
          )}
        </Box>
        <Box>
          {currentRef && (
            <Button onClick={handleClear} color="error" size="small">
              {t('Unequip')}
            </Button>
          )}
          <Button onClick={onClose} size="small">{t('Cancel')}</Button>
          <Button
            onClick={handleAccept}
            color="primary"
            variant="contained"
            size="small"
            disabled={!pendingCandidate}
          >
            {t('Accept')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
