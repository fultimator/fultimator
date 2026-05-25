import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  List,
  Typography,
  Divider,
  Button,
  Paper,
  IconButton,
  TextField,
  MenuItem as MuiMenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { TouchApp, EditOutlined as EditIcon } from "@mui/icons-material";
import { useCombatEncounterStore } from "../../stores/combatEncounterStore";
import { useAppDrawerStore } from "../../store/appDrawerStore";
import {
  resolveAttackOptions,
  resolveSpellOptions,
  resolveEquipmentSlots,
} from "../app-drawer/panels/chat/domain/speakers";
import PcListItem from "./selectedNpcs/PcListItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import NpcListItem from "./selectedNpcs/NpcListItem";
import SelectedNpcsHeader from "./selectedNpcs/SelectedNpcsHeader";
import EmptyList from "./selectedNpcs/EmptyList";

export default function SelectedActors({
  selectedNPCs,
  handleResetTurns,
  handleMoveUp,
  handleMoveDown,
  handleRemoveNPC,
  handleUpdateNpcTurns,
  handlePopoverOpen,
  handlePopoverClose,
  anchorEl,
  popoverNpcId,
  getTurnCount,
  handleNpcClick,
  handleHpMpClick,
  isMobile,
  selectedNpcID,
  useDragAndDrop = true,
  onSortEnd = null,
  onSortEndPC = null,
  onClockClick,
  onNotesClick,
  onClearAll,
  selectedPCs = [],
  handleRemovePC,
  handlePcClick,
  handleHpMpClickPC,
  handleUpdatePcTurns,
  selectedPcID,
  combatActive = false,
  initiative = "players",
  currentTurn = "players",
  activeTurn = null,
  onStartActorTurn,
  onEndActorTurn,
}) {
  const [anchorMenu, setAnchorMenu] = useState(null); // Anchor element for the menu
  const [selectedNpcMenu, setSelectedNpcMenu] = useState(null); // ID of the selected NPC for the menu

  const { interactionMode, toggleTarget, targets } = useCombatEncounterStore();
  const setEncounterActors = useCombatEncounterStore((s) => s.setActors);
  const setDrawerTab = useAppDrawerStore((s) => s.setActiveTab);
  const setDrawerOpen = useAppDrawerStore((s) => s.setIsOpen);
  const [activeActionKey, setActiveActionKey] = useState(null);
  const menuCloseTimer = useRef(null);
  const menuOpenTimer = useRef(null);
  const activeActionKeyRef = useRef(null);
  const actionBarRef = useRef(null);
  const [openUpward, setOpenUpward] = useState(false);
  const [menuAnchorPos, setMenuAnchorPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
  });
  const [customizerTarget, setCustomizerTarget] = useState(null); // { opt, pos }
  const [customizerDraft, setCustomizerDraft] = useState(null);
  const [spellCustomizerTarget, setSpellCustomizerTarget] = useState(null); // { opt }
  const [spellCustomizerDraft, setSpellCustomizerDraft] = useState(null);
  const [studyDialogOpen, setStudyDialogOpen] = useState(false);
  const [studyDraft, setStudyDraft] = useState({
    attr1: "ins",
    attr2: "ins",
    modifier: 0,
  });
  const [hinderDialogOpen, setHinderDialogOpen] = useState(false);
  const [hinderDraft, setHinderDraft] = useState({
    attr1: "ins",
    attr2: "wlp",
    modifier: 0,
  });

  React.useEffect(() => {
    const total = selectedNPCs.length + selectedPCs.length;
    if (total === 0) return;
    setEncounterActors("combat-sim-selected-actors", selectedNPCs, selectedPCs);
  }, [selectedNPCs, selectedPCs, setEncounterActors]);

  const isSelectedNpc = Boolean(selectedNpcID);
  const actionOptions = isSelectedNpc
    ? [
        "attack",
        "guard",
        "hinder",
        "objective",
        "spell",
        "skill",
        "study",
        "other",
      ]
    : [
        "attack",
        "equipment",
        "guard",
        "hinder",
        "inventory",
        "objective",
        "spell",
        "skill",
        "study",
        "other",
      ];
  const selectedActorDoc = selectedNpcID
    ? selectedNPCs.find((n) => n.combatId === selectedNpcID) || null
    : selectedPcID
      ? selectedPCs.find((p) => p.combatId === selectedPcID) || null
      : null;
  const selectedActorName =
    selectedActorDoc?.name || selectedActorDoc?.characterName || "You";

  const applyCommand = (command) => {
    setDrawerTab("chat");
    setDrawerOpen(true);
    // Let the drawer/chat panel mount before dispatching the command event.
    setTimeout(() => {
      window.dispatchEvent(
        new window.CustomEvent("chat:run-command", {
          detail: {
            command,
            speaker: selectedActorName,
            actorDoc: selectedActorDoc,
          },
        }),
      );
    }, 0);
    setActiveActionKey(null);
    activeActionKeyRef.current = null;
  };

  const cancelOpen = () => {
    if (menuOpenTimer.current) {
      clearTimeout(menuOpenTimer.current);
      menuOpenTimer.current = null;
    }
  };

  const openMenu = (actionKey, buttonEl) => {
    cancelClose();
    cancelOpen();
    if (activeActionKeyRef.current === actionKey) return;
    if (getActionMenuItems(actionKey).length === 0) return;
    menuOpenTimer.current = setTimeout(() => {
      menuOpenTimer.current = null;
      activeActionKeyRef.current = actionKey;
      if (actionBarRef.current && buttonEl) {
        const btnRect = buttonEl.getBoundingClientRect();
        const itemHeight = 36;
        const itemCount = Math.max(1, getActionMenuItems(actionKey).length);
        const estimatedMenuHeight = itemCount * itemHeight + 16;
        const spaceBelow = window.innerHeight - btnRect.bottom;
        const spaceAbove = btnRect.top;
        const shouldOpenUpward =
          spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
        setOpenUpward(shouldOpenUpward);
        const menuWidth = 200;
        const clampedLeft = Math.max(
          8,
          Math.min(btnRect.left, window.innerWidth - menuWidth - 8),
        );
        const menuGap = 3;
        setMenuAnchorPos({
          top: btnRect.bottom + menuGap,
          bottom: window.innerHeight - btnRect.top + menuGap,
          left: clampedLeft,
        });
      }
      setActiveActionKey(actionKey);
    }, 200);
  };

  const getActionMenuItems = (actionKey) => {
    if (!selectedActorDoc) return [];

    if (actionKey === "attack") {
      const options = resolveAttackOptions(selectedActorDoc);
      return options.map((opt) => ({
        label: opt.name,
        command: `/action attack ${opt.arg}`,
        customizable: opt,
      }));
    }

    if (actionKey === "spell") {
      const options = resolveSpellOptions(selectedActorDoc);
      return options.map((opt) => ({
        label: opt.name,
        command: `/action spell ${opt.arg}`,
        spellCustomizable: opt.isOffensive ? opt : undefined,
      }));
    }

    if (actionKey === "equipment") {
      const slots = resolveEquipmentSlots(selectedActorDoc);
      if (slots.length === 0) {
        return [{ label: "Use Equipment", command: "/action equipment" }];
      }
      return slots
        .filter((slot) => slot.pickerSlot || slot.actionType)
        .map((slot) => {
          if (slot.actionType) {
            const isSupportRow = slot.section === "support";
            const labelMap = {
              toggleVehicle: slot.label ?? "Enter/Exit Vehicle",
              swapVehicle: slot.label ?? "Swap Vehicle",
              openSupportModules: isSupportRow
                ? (slot.currentItem?.name ?? slot.label ?? "Support Module")
                : (slot.label ?? "Support Modules"),
            };
            return {
              key: slot.slotKey,
              label: labelMap[slot.actionType] ?? slot.label ?? slot.actionType,
              actionType: slot.actionType,
              disabled: slot.isLocked,
            };
          }
          return {
            key: slot.slotKey ?? slot.pickerSlot,
            label: slot.currentItem?.name
              ? `${slot.label}: ${slot.currentItem.name}`
              : slot.label,
            slotKey: slot.pickerSlot,
            disabled: slot.isLocked,
          };
        });
    }

    return [];
  };

  const activeActionItems = activeActionKey
    ? getActionMenuItems(activeActionKey)
    : [];

  const closeMenu = () => {
    activeActionKeyRef.current = null;
    setActiveActionKey(null);
    setCustomizerTarget(null);
    setCustomizerDraft(null);
    setSpellCustomizerTarget(null);
    setSpellCustomizerDraft(null);
  };

  const ATTRS = ["dex", "ins", "mig", "wlp"];

  const ACTION_ICONS = {
    attack: "/assets/icons/actions/action_c_attack.png",
    equipment: "/assets/icons/actions/action_c_equipment.png",
    guard: "/assets/icons/actions/action_c_guard.png",
    hinder: "/assets/icons/actions/action_c_hinder.png",
    inventory: "/assets/icons/actions/action_c_inventory.png",
    objective: "/assets/icons/actions/action_c_objective.png",
    skill: "/assets/icons/actions/action_c_skill.png",
    spell: "/assets/icons/actions/action_c_spell.png",
    study: "/assets/icons/actions/action_c_study.png",
  };

  const openCustomizer = (opt, buttonEl) => {
    cancelClose();
    activeActionKeyRef.current = null;
    setActiveActionKey(null);
    const rect = buttonEl.getBoundingClientRect();
    setCustomizerTarget({ opt, right: rect.right, top: rect.top });
    setCustomizerDraft({
      attr1: opt.attr1 ?? "dex",
      attr2: opt.attr2 ?? "ins",
      accuracyDelta: 0,
      damageDelta: 0,
      range: opt.range === "ranged" ? "ranged" : "melee",
      defense: opt.accuracyDefense === "mdef" ? "mdef" : "def",
      hrZero: false,
    });
  };

  const applyCustomizer = () => {
    if (!customizerTarget || !customizerDraft) return;
    const { opt } = customizerTarget;
    const d = customizerDraft;
    const cmd = `/action attack ${opt.arg} --attr1 ${d.attr1} --attr2 ${d.attr2} --acc ${d.accuracyDelta} --dmg ${d.damageDelta} --range ${d.range} --defense ${d.defense}${d.hrZero ? " HR0" : ""}`;
    setCustomizerTarget(null);
    setCustomizerDraft(null);
    applyCommand(cmd);
  };

  const openSpellCustomizer = (opt, buttonEl) => {
    cancelClose();
    activeActionKeyRef.current = null;
    setActiveActionKey(null);
    const rect = buttonEl.getBoundingClientRect();
    setSpellCustomizerTarget({ opt, right: rect.right, top: rect.top });
    setSpellCustomizerDraft({
      attr1: opt.attr1 ?? "ins",
      attr2: opt.attr2 ?? "wlp",
      accuracyDelta: 0,
      damageDelta: 0,
      hrZero: false,
    });
  };

  const applySpellCustomizer = () => {
    if (!spellCustomizerTarget || !spellCustomizerDraft) return;
    const { opt } = spellCustomizerTarget;
    const d = spellCustomizerDraft;
    const cmd = `/action spell ${opt.arg} --attr1 ${d.attr1} --attr2 ${d.attr2} --acc ${d.accuracyDelta} --dmg ${d.damageDelta}${d.hrZero ? " HR0" : ""}`;
    setSpellCustomizerTarget(null);
    setSpellCustomizerDraft(null);
    applyCommand(cmd);
  };

  const scheduleClose = () => {
    cancelOpen();
    if (customizerTarget || spellCustomizerTarget) return;
    menuCloseTimer.current = setTimeout(closeMenu, 300);
  };

  const cancelClose = () => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  };

  const renderSelectedActorActionBar = () => (
    <Box
      ref={actionBarRef}
      onMouseLeave={scheduleClose}
      sx={{ px: 0.5, pb: 0.25 }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
        {actionOptions.map((action) => (
          <Button
            key={action}
            size="small"
            variant="outlined"
            sx={{
              textTransform: "none",
              "&:hover": {
                backgroundColor: "action.selected",
              },
            }}
            onMouseEnter={(e) => openMenu(action, e.currentTarget)}
            onClick={(e) => {
              const directFire = [
                "guard",
                "inventory",
                "objective",
                "skill",
                "other",
              ];
              if (action === "study") {
                cancelOpen();
                closeMenu();
                setStudyDraft({ attr1: "ins", attr2: "ins", modifier: 0 });
                setStudyDialogOpen(true);
              } else if (action === "hinder") {
                cancelOpen();
                closeMenu();
                setHinderDraft({ attr1: "ins", attr2: "wlp", modifier: 0 });
                setHinderDialogOpen(true);
              } else if (directFire.includes(action)) {
                cancelOpen();
                closeMenu();
                applyCommand(`/action ${action}`);
              } else {
                openMenu(action, e.currentTarget);
              }
            }}
          >
            {ACTION_ICONS[action] && (
              <Box
                component="img"
                src={ACTION_ICONS[action]}
                alt=""
                sx={{ width: 18, height: 18, mr: 0.5, display: "block" }}
              />
            )}
            {action[0].toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </Box>
      {activeActionKey &&
        createPortal(
          <Paper
            elevation={0}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            sx={{
              position: "fixed",
              ...(openUpward
                ? { bottom: menuAnchorPos.bottom }
                : { top: menuAnchorPos.top }),
              left: menuAnchorPos.left,
              zIndex: 1500,
              p: 0.75,
              minWidth: 200,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              boxShadow: 3,
              color: "text.primary",
            }}
          >
            {activeActionItems.length > 0 ? (
              activeActionItems.map((item) => (
                <Box
                  key={item.key ?? item.label}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      textTransform: "none",
                      justifyContent: "flex-start",
                      borderRadius: 999,
                      py: 0.3,
                      px: 1,
                      color: "text.primary",
                      borderColor: "divider",
                      backgroundColor: "background.paper",
                      "&:hover": {
                        backgroundColor: "action.hover",
                        borderColor: "divider",
                        color: "text.primary",
                      },
                    }}
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.slotKey) {
                        setDrawerTab("chat");
                        setDrawerOpen(true);
                        setTimeout(() => {
                          window.dispatchEvent(
                            new window.CustomEvent("chat:open-equipment-slot", {
                              detail: {
                                slot: item.slotKey,
                                actorDoc: selectedActorDoc,
                              },
                            }),
                          );
                        }, 0);
                        setActiveActionKey(null);
                        activeActionKeyRef.current = null;
                      } else if (item.actionType) {
                        setDrawerTab("chat");
                        setDrawerOpen(true);
                        const eventName =
                          item.actionType === "toggleVehicle"
                            ? "chat:toggle-vehicle"
                            : item.actionType === "openSupportModules"
                              ? "chat:open-support-modules"
                              : null;
                        if (eventName) {
                          setTimeout(() => {
                            window.dispatchEvent(
                              new window.CustomEvent(eventName, {
                                detail: { actorDoc: selectedActorDoc },
                              }),
                            );
                          }, 0);
                        }
                        setActiveActionKey(null);
                        activeActionKeyRef.current = null;
                      } else {
                        applyCommand(item.command);
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                  {item.customizable && (
                    <IconButton
                      size="small"
                      sx={{
                        flexShrink: 0,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 999,
                        p: 0.35,
                        backgroundColor: "background.paper",
                        color: "text.primary",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                      onClick={(e) =>
                        openCustomizer(item.customizable, e.currentTarget)
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {item.spellCustomizable && (
                    <IconButton
                      size="small"
                      sx={{
                        flexShrink: 0,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 999,
                        p: 0.35,
                        backgroundColor: "background.paper",
                        color: "text.primary",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                      onClick={(e) =>
                        openSpellCustomizer(
                          item.spellCustomizable,
                          e.currentTarget,
                        )
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))
            ) : (
              <Button
                size="small"
                variant="outlined"
                disabled
                sx={{
                  textTransform: "none",
                  justifyContent: "flex-start",
                  borderRadius: 999,
                }}
              >
                No options available
              </Button>
            )}
          </Paper>,
          document.body,
        )}
      <Dialog
        open={Boolean(customizerTarget && customizerDraft)}
        onClose={() => {
          setCustomizerTarget(null);
          setCustomizerDraft(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {customizerTarget?.opt?.name ?? "Customize Attack"}
        </DialogTitle>
        {customizerDraft && (
          <DialogContent
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              pt: "16px !important",
            }}
          >
            {/* preview strip */}
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 2,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                backgroundColor: "action.hover",
                typography: "body2",
                fontFamily: "monospace",
                flexWrap: "wrap",
              }}
            >
              <span>
                <b>{customizerDraft.attr1.toUpperCase()}</b>+
                <b>{customizerDraft.attr2.toUpperCase()}</b>
              </span>
              <span>
                Acc{" "}
                {customizerTarget.opt.accuracyBonus != null
                  ? `${customizerTarget.opt.accuracyBonus + customizerDraft.accuracyDelta > 0 ? "+" : ""}${customizerTarget.opt.accuracyBonus + customizerDraft.accuracyDelta}`
                  : customizerDraft.accuracyDelta !== 0
                    ? `${customizerDraft.accuracyDelta > 0 ? "+" : ""}${customizerDraft.accuracyDelta}`
                    : "-"}
              </span>
              <span>
                Dmg{" "}
                {customizerTarget.opt.baseDamage != null
                  ? `HR+${customizerTarget.opt.baseDamage + customizerDraft.damageDelta}${customizerDraft.hrZero ? " (HR0)" : ""}`
                  : `+${customizerDraft.damageDelta}`}
                {customizerTarget.opt.damageType
                  ? ` ${customizerTarget.opt.damageType}`
                  : ""}
              </span>
              <span>
                {customizerDraft.range} ·{" "}
                {customizerDraft.defense.toUpperCase()}
              </span>
            </Box>
            <TextField
              select
              size="small"
              label="Attr1"
              value={customizerDraft.attr1}
              onChange={(e) =>
                setCustomizerDraft((p) => ({ ...p, attr1: e.target.value }))
              }
            >
              {ATTRS.map((a) => (
                <MuiMenuItem key={a} value={a}>
                  {a.toUpperCase()}
                </MuiMenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Attr2"
              value={customizerDraft.attr2}
              onChange={(e) =>
                setCustomizerDraft((p) => ({ ...p, attr2: e.target.value }))
              }
            >
              {ATTRS.map((a) => (
                <MuiMenuItem key={a} value={a}>
                  {a.toUpperCase()}
                </MuiMenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Acc Δ"
              value={customizerDraft.accuracyDelta}
              onChange={(e) =>
                setCustomizerDraft((p) => ({
                  ...p,
                  accuracyDelta: parseInt(e.target.value || "0", 10) || 0,
                }))
              }
            />
            <TextField
              size="small"
              type="number"
              label="Dmg Δ"
              value={customizerDraft.damageDelta}
              onChange={(e) =>
                setCustomizerDraft((p) => ({
                  ...p,
                  damageDelta: parseInt(e.target.value || "0", 10) || 0,
                }))
              }
            />
            <TextField
              select
              size="small"
              label="Range"
              value={customizerDraft.range}
              onChange={(e) =>
                setCustomizerDraft((p) => ({ ...p, range: e.target.value }))
              }
            >
              <MuiMenuItem value="melee">Melee</MuiMenuItem>
              <MuiMenuItem value="ranged">Ranged</MuiMenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Defense"
              value={customizerDraft.defense}
              onChange={(e) =>
                setCustomizerDraft((p) => ({ ...p, defense: e.target.value }))
              }
            >
              <MuiMenuItem value="def">DEF</MuiMenuItem>
              <MuiMenuItem value="mdef">MDEF</MuiMenuItem>
            </TextField>
            <Button
              size="small"
              variant={customizerDraft.hrZero ? "contained" : "outlined"}
              onClick={() =>
                setCustomizerDraft((p) => ({ ...p, hrZero: !p.hrZero }))
              }
              sx={{ gridColumn: "1 / -1", textTransform: "none" }}
            >
              HR0 {customizerDraft.hrZero ? "On" : "Off"}
            </Button>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            size="small"
            onClick={() => {
              const opt = customizerTarget.opt;
              setCustomizerDraft({
                attr1: opt.attr1 ?? "dex",
                attr2: opt.attr2 ?? "ins",
                accuracyDelta: 0,
                damageDelta: 0,
                range: opt.range === "ranged" ? "ranged" : "melee",
                defense: opt.accuracyDefense === "mdef" ? "mdef" : "def",
                hrZero: opt.damageHrZero ?? false,
              });
            }}
          >
            Revert Fields
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => {
                setCustomizerTarget(null);
                setCustomizerDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={applyCustomizer}>
              Apply
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Spell customizer dialog */}
      <Dialog
        open={Boolean(spellCustomizerTarget && spellCustomizerDraft)}
        onClose={() => {
          setSpellCustomizerTarget(null);
          setSpellCustomizerDraft(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {spellCustomizerTarget?.opt?.name ?? "Customize Spell"}
        </DialogTitle>
        {spellCustomizerDraft && (
          <DialogContent
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              pt: "16px !important",
            }}
          >
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 2,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                backgroundColor: "action.hover",
                typography: "body2",
                fontFamily: "monospace",
                flexWrap: "wrap",
              }}
            >
              <span>
                <b>{spellCustomizerDraft.attr1.toUpperCase()}</b>+
                <b>{spellCustomizerDraft.attr2.toUpperCase()}</b>
              </span>
              <span>
                Acc{" "}
                {spellCustomizerTarget.opt.accuracyBonus != null
                  ? `${spellCustomizerTarget.opt.accuracyBonus + spellCustomizerDraft.accuracyDelta > 0 ? "+" : ""}${spellCustomizerTarget.opt.accuracyBonus + spellCustomizerDraft.accuracyDelta}`
                  : spellCustomizerDraft.accuracyDelta !== 0
                    ? `${spellCustomizerDraft.accuracyDelta > 0 ? "+" : ""}${spellCustomizerDraft.accuracyDelta}`
                    : "-"}
              </span>
              <span>
                Dmg{" "}
                {spellCustomizerTarget.opt.baseDamage != null
                  ? `HR+${spellCustomizerTarget.opt.baseDamage + spellCustomizerDraft.damageDelta}${spellCustomizerDraft.hrZero ? " (HR0)" : ""}`
                  : `+${spellCustomizerDraft.damageDelta}`}
                {spellCustomizerTarget.opt.damageType
                  ? ` ${spellCustomizerTarget.opt.damageType}`
                  : ""}
              </span>
            </Box>
            <TextField
              select
              size="small"
              label="Attr1"
              value={spellCustomizerDraft.attr1}
              onChange={(e) =>
                setSpellCustomizerDraft((p) => ({
                  ...p,
                  attr1: e.target.value,
                }))
              }
            >
              {ATTRS.map((a) => (
                <MuiMenuItem key={a} value={a}>
                  {a.toUpperCase()}
                </MuiMenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Attr2"
              value={spellCustomizerDraft.attr2}
              onChange={(e) =>
                setSpellCustomizerDraft((p) => ({
                  ...p,
                  attr2: e.target.value,
                }))
              }
            >
              {ATTRS.map((a) => (
                <MuiMenuItem key={a} value={a}>
                  {a.toUpperCase()}
                </MuiMenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Acc Δ"
              value={spellCustomizerDraft.accuracyDelta}
              onChange={(e) =>
                setSpellCustomizerDraft((p) => ({
                  ...p,
                  accuracyDelta: parseInt(e.target.value || "0", 10) || 0,
                }))
              }
            />
            <TextField
              size="small"
              type="number"
              label="Dmg Δ"
              value={spellCustomizerDraft.damageDelta}
              onChange={(e) =>
                setSpellCustomizerDraft((p) => ({
                  ...p,
                  damageDelta: parseInt(e.target.value || "0", 10) || 0,
                }))
              }
            />
            <Button
              size="small"
              variant={spellCustomizerDraft.hrZero ? "contained" : "outlined"}
              onClick={() =>
                setSpellCustomizerDraft((p) => ({ ...p, hrZero: !p.hrZero }))
              }
              sx={{ gridColumn: "1 / -1", textTransform: "none" }}
            >
              HR0 {spellCustomizerDraft.hrZero ? "On" : "Off"}
            </Button>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            size="small"
            onClick={() => {
              const opt = spellCustomizerTarget.opt;
              setSpellCustomizerDraft({
                attr1: opt.attr1 ?? "ins",
                attr2: opt.attr2 ?? "wlp",
                accuracyDelta: 0,
                damageDelta: 0,
                hrZero: opt.damageHrZero ?? false,
              });
            }}
          >
            Revert Fields
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => {
                setSpellCustomizerTarget(null);
                setSpellCustomizerDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={applySpellCustomizer}>
              Apply
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Study dialog */}
      <Dialog
        open={studyDialogOpen}
        onClose={() => setStudyDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Study</DialogTitle>
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setStudyDraft({ attr1: "ins", attr2: "ins", modifier: 0 });
            }}
            sx={{ textTransform: "none", fontFamily: "monospace" }}
          >
            Use default (INS + INS)
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            {["dex", "ins", "mig", "wlp"].map((a) => (
              <Button
                key={`a1-${a}`}
                size="small"
                fullWidth
                variant={studyDraft.attr1 === a ? "contained" : "outlined"}
                sx={{ textTransform: "none", fontFamily: "monospace" }}
                onClick={() => setStudyDraft((p) => ({ ...p, attr1: a }))}
              >
                {a.toUpperCase()}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {["dex", "ins", "mig", "wlp"].map((a) => (
              <Button
                key={`a2-${a}`}
                size="small"
                fullWidth
                variant={studyDraft.attr2 === a ? "contained" : "outlined"}
                sx={{ textTransform: "none", fontFamily: "monospace" }}
                onClick={() => setStudyDraft((p) => ({ ...p, attr2: a }))}
              >
                {a.toUpperCase()}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[-3, -2, -1, 0, 1, 2, 3].map((mod) => (
              <Button
                key={mod}
                size="small"
                fullWidth
                variant={studyDraft.modifier === mod ? "contained" : "outlined"}
                sx={{
                  textTransform: "none",
                  fontFamily: "monospace",
                  minWidth: 0,
                  px: 0,
                }}
                onClick={() => setStudyDraft((p) => ({ ...p, modifier: mod }))}
              >
                {mod > 0 ? `+${mod}` : mod}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const { attr1, attr2, modifier } = studyDraft;
              const modStr =
                modifier !== 0 ? ` ${modifier > 0 ? "+" : ""}${modifier}` : "";
              applyCommand(`/action study ${attr1} ${attr2}${modStr}`);
              setStudyDialogOpen(false);
            }}
          >
            Roll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hinder dialog */}
      <Dialog
        open={hinderDialogOpen}
        onClose={() => setHinderDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Hinder</DialogTitle>
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              setHinderDraft({ attr1: "ins", attr2: "wlp", modifier: 0 })
            }
            sx={{ textTransform: "none", fontFamily: "monospace" }}
          >
            Use default (INS + WLP)
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            {["dex", "ins", "mig", "wlp"].map((a) => (
              <Button
                key={`h1-${a}`}
                size="small"
                fullWidth
                variant={hinderDraft.attr1 === a ? "contained" : "outlined"}
                sx={{ textTransform: "none", fontFamily: "monospace" }}
                onClick={() => setHinderDraft((p) => ({ ...p, attr1: a }))}
              >
                {a.toUpperCase()}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {["dex", "ins", "mig", "wlp"].map((a) => (
              <Button
                key={`h2-${a}`}
                size="small"
                fullWidth
                variant={hinderDraft.attr2 === a ? "contained" : "outlined"}
                sx={{ textTransform: "none", fontFamily: "monospace" }}
                onClick={() => setHinderDraft((p) => ({ ...p, attr2: a }))}
              >
                {a.toUpperCase()}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[-3, -2, -1, 0, 1, 2, 3].map((mod) => (
              <Button
                key={mod}
                size="small"
                fullWidth
                variant={
                  hinderDraft.modifier === mod ? "contained" : "outlined"
                }
                sx={{
                  textTransform: "none",
                  fontFamily: "monospace",
                  minWidth: 0,
                  px: 0,
                }}
                onClick={() => setHinderDraft((p) => ({ ...p, modifier: mod }))}
              >
                {mod > 0 ? `+${mod}` : mod}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHinderDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const { attr1, attr2, modifier } = hinderDraft;
              const modStr =
                modifier !== 0 ? ` ${modifier > 0 ? "+" : ""}${modifier}` : "";
              applyCommand(`/action hinder ${attr1} ${attr2}${modStr}`);
              setHinderDialogOpen(false);
            }}
          >
            Roll
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const handleMenuOpen = (event, npcId) => {
    setAnchorMenu(event.currentTarget);
    setSelectedNpcMenu(npcId);
  };

  const handleMenuClose = (e) => {
    e.stopPropagation();
    setAnchorMenu(null);
    setSelectedNpcMenu(null);
  };

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 8 pixels before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Reduce delay and increase tolerance for better touch response
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle NPC drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = selectedNPCs.findIndex(
        (npc) => npc.combatId === active.id,
      );
      const newIndex = selectedNPCs.findIndex(
        (npc) => npc.combatId === over.id,
      );

      // Call parent component's handler with sorted array
      if (onSortEnd) {
        onSortEnd(arrayMove(selectedNPCs, oldIndex, newIndex));
      }
    }
  };

  // Handle PC drag end
  const handlePcDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = selectedPCs.findIndex((pc) => pc.combatId === active.id);
      const newIndex = selectedPCs.findIndex((pc) => pc.combatId === over.id);
      if (onSortEndPC) {
        onSortEndPC(arrayMove(selectedPCs, oldIndex, newIndex));
      }
    }
  };

  // Handle list item click - in target mode, left-click toggles target instead of selecting
  const handleListItemClick = (e, combatId) => {
    if (e.target.type === "checkbox") return;
    if (interactionMode === "target") {
      const npc = selectedNPCs.find((n) => n.combatId === combatId);
      if (npc)
        toggleTarget({ combatId: npc.combatId, name: npc.name, source: "npc" });
    } else {
      handleNpcClick(combatId);
    }
  };

  const handlePcListItemClick = (combatId) => {
    if (interactionMode === "target") {
      const pc = selectedPCs.find((p) => p.combatId === combatId);
      if (pc)
        toggleTarget({
          combatId: pc.combatId,
          name: pc.name || pc.characterName || "Unknown",
          source: "pc",
        });
    } else {
      handlePcClick(combatId);
    }
  };

  return (
    <>
      {/* Header */}
      <SelectedNpcsHeader
        selectedNPCs={selectedNPCs}
        isMobile={isMobile}
        onNotesClick={onNotesClick}
        onClockClick={onClockClick}
        handleResetTurns={handleResetTurns}
        onClearAll={onClearAll}
      />
      {/* Body */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          paddingTop: 1,
          ...(selectedNPCs.length === 0 &&
            selectedPCs.length === 0 && {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }),
        }}
      >
        {selectedNPCs.length === 0 && selectedPCs.length === 0 ? (
          <EmptyList isMobile={isMobile} showIcon={true} />
        ) : (
          <>
            {/* When combat is active and players won initiative, PCs section comes first */}
            {combatActive &&
              initiative === "players" &&
              selectedPCs.length > 0 && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Divider
                      sx={{
                        flex: 1,
                        borderColor:
                          currentTurn === "players"
                            ? "primary.main"
                            : undefined,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        color:
                          currentTurn === "players"
                            ? "primary.main"
                            : "text.disabled",
                      }}
                    >
                      {currentTurn === "players" ? "PCs · Active" : "PCs"}
                    </Typography>
                    <Divider
                      sx={{
                        flex: 1,
                        borderColor:
                          currentTurn === "players"
                            ? "primary.main"
                            : undefined,
                      }}
                    />
                  </Box>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePcDragEnd}
                  >
                    <SortableContext
                      items={selectedPCs.map((pc) => pc.combatId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <List>
                        {selectedPCs.map((pc, index) => (
                          <React.Fragment key={pc.combatId}>
                            <PcListItem
                              pc={pc}
                              index={index}
                              selectedPcID={selectedPcID}
                              handleListItemClick={handlePcListItemClick}
                              handleRemovePC={handleRemovePC}
                              handleHpMpClick={handleHpMpClickPC}
                              handleUpdatePcTurns={handleUpdatePcTurns}
                              isMobile={isMobile}
                              combatActive={combatActive}
                              isActiveFaction={currentTurn === "players"}
                              activeTurnIndex={
                                activeTurn?.combatId === pc.combatId
                                  ? activeTurn.turnIndex
                                  : null
                              }
                              onStartTurn={(idx) =>
                                onStartActorTurn?.(pc.combatId, idx, "players")
                              }
                              onEndTurn={(idx) =>
                                onEndActorTurn?.(
                                  pc.combatId,
                                  idx,
                                  "players",
                                  false,
                                )
                              }
                              useDragAndDrop={useDragAndDrop}
                            />
                            {selectedPcID === pc.combatId &&
                              renderSelectedActorActionBar()}
                          </React.Fragment>
                        ))}
                      </List>
                    </SortableContext>
                  </DndContext>
                </>
              )}

            {/* NPCs section */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedNPCs.map((npc) => npc.combatId)}
                strategy={verticalListSortingStrategy}
              >
                {selectedNPCs.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Divider
                      sx={{
                        flex: 1,
                        borderColor:
                          combatActive && currentTurn === "npcs"
                            ? "error.main"
                            : undefined,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        whiteSpace: "nowrap",
                        fontWeight:
                          combatActive && currentTurn === "npcs"
                            ? "bold"
                            : "normal",
                        color: combatActive
                          ? currentTurn === "npcs"
                            ? "error.main"
                            : "text.disabled"
                          : "text.secondary",
                      }}
                    >
                      {combatActive && currentTurn === "npcs"
                        ? "NPCs · Active"
                        : "NPCs"}
                    </Typography>
                    <Divider
                      sx={{
                        flex: 1,
                        borderColor:
                          combatActive && currentTurn === "npcs"
                            ? "error.main"
                            : undefined,
                      }}
                    />
                  </Box>
                )}
                <List>
                  {selectedNPCs.map((npc, index) => (
                    <React.Fragment key={npc.combatId}>
                      <NpcListItem
                        npc={npc}
                        index={index}
                        selectedNpcID={selectedNpcID}
                        handleListItemClick={handleListItemClick}
                        handlePopoverOpen={handlePopoverOpen}
                        handlePopoverClose={handlePopoverClose}
                        handleUpdateNpcTurns={handleUpdateNpcTurns}
                        handleMenuOpen={handleMenuOpen}
                        handleMenuClose={handleMenuClose}
                        handleMoveUp={handleMoveUp}
                        handleMoveDown={handleMoveDown}
                        handleRemoveNPC={handleRemoveNPC}
                        anchorEl={anchorEl}
                        anchorMenu={anchorMenu}
                        popoverNpcId={popoverNpcId}
                        selectedNpcMenu={selectedNpcMenu}
                        isMobile={isMobile}
                        getTurnCount={getTurnCount}
                        handleHpMpClick={handleHpMpClick}
                        selectedNPCs={selectedNPCs}
                        useDragAndDrop={useDragAndDrop}
                        combatActive={combatActive}
                        isActiveFaction={currentTurn === "npcs"}
                        activeTurnIndex={
                          activeTurn?.combatId === npc.combatId
                            ? activeTurn.turnIndex
                            : null
                        }
                        onStartTurn={(idx) =>
                          onStartActorTurn?.(npc.combatId, idx, "npcs")
                        }
                        onEndTurn={(idx) =>
                          onEndActorTurn?.(npc.combatId, idx, "npcs", true)
                        }
                      />
                      {selectedNpcID === npc.combatId &&
                        renderSelectedActorActionBar()}
                    </React.Fragment>
                  ))}
                </List>
              </SortableContext>
            </DndContext>

            {/* PCs section - shown after NPCs when NPCs have initiative (or combat inactive) */}
            {(!combatActive || initiative === "npcs") &&
              selectedPCs.length > 0 && (
                <>
                  {selectedNPCs.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        my: 1,
                      }}
                    >
                      <Divider
                        sx={{
                          flex: 1,
                          borderColor:
                            combatActive && currentTurn === "players"
                              ? "primary.main"
                              : undefined,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight:
                            combatActive && currentTurn === "players"
                              ? "bold"
                              : "normal",
                          color: combatActive
                            ? currentTurn === "players"
                              ? "primary.main"
                              : "text.disabled"
                            : "text.secondary",
                        }}
                      >
                        {combatActive && currentTurn === "players"
                          ? "PCs · Active"
                          : "PCs"}
                      </Typography>
                      <Divider
                        sx={{
                          flex: 1,
                          borderColor:
                            combatActive && currentTurn === "players"
                              ? "primary.main"
                              : undefined,
                        }}
                      />
                    </Box>
                  )}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePcDragEnd}
                  >
                    <SortableContext
                      items={selectedPCs.map((pc) => pc.combatId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <List>
                        {selectedPCs.map((pc, index) => (
                          <React.Fragment key={pc.combatId}>
                            <PcListItem
                              pc={pc}
                              index={index}
                              selectedPcID={selectedPcID}
                              handleListItemClick={handlePcListItemClick}
                              handleRemovePC={handleRemovePC}
                              handleHpMpClick={handleHpMpClickPC}
                              handleUpdatePcTurns={handleUpdatePcTurns}
                              isMobile={isMobile}
                              combatActive={combatActive}
                              isActiveFaction={currentTurn === "players"}
                              activeTurnIndex={
                                activeTurn?.combatId === pc.combatId
                                  ? activeTurn.turnIndex
                                  : null
                              }
                              onStartTurn={(idx) =>
                                onStartActorTurn?.(pc.combatId, idx, "players")
                              }
                              onEndTurn={(idx) =>
                                onEndActorTurn?.(
                                  pc.combatId,
                                  idx,
                                  "players",
                                  false,
                                )
                              }
                              useDragAndDrop={useDragAndDrop}
                            />
                            {selectedPcID === pc.combatId &&
                              renderSelectedActorActionBar()}
                          </React.Fragment>
                        ))}
                      </List>
                    </SortableContext>
                  </DndContext>
                </>
              )}
          </>
        )}

        {/* Legend */}
        {(selectedNpcID || selectedPcID || targets.length > 0) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              pt: 0.75,
              mt: 0.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {(selectedNpcID || selectedPcID) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TouchApp sx={{ fontSize: 14, color: "primary.main" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.7rem" }}
                >
                  Selected
                </Typography>
              </Box>
            )}
            {targets.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "warning.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/assets/icons/checks/roll_target.png"
                    alt="targeted"
                    style={{ width: 9, height: 9 }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.7rem" }}
                >
                  Targeted ({targets.length})
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}
