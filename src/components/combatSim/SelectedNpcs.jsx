import React, { useState } from "react";
import { Box, List, Typography, Divider, Button, Popover } from "@mui/material";
import { TouchApp } from "@mui/icons-material";
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

export default function SelectedNpcs({
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
  const setDrawerTab = useAppDrawerStore((s) => s.setActiveTab);
  const setDrawerOpen = useAppDrawerStore((s) => s.setIsOpen);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuType, setMenuType] = useState(null); // "action" | null
  const [activeActionKey, setActiveActionKey] = useState(null);

  const actionOptions = [
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
        new CustomEvent("chat:run-command", {
          detail: {
            command,
            speaker: selectedActorName,
            actorDoc: selectedActorDoc,
          },
        }),
      );
    }, 0);
    setMenuAnchorEl(null);
    setMenuType(null);
    setActiveActionKey(null);
  };

  const openMenu = (event, actionKey) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuType("action");
    setActiveActionKey(actionKey);
  };

  const getActionMenuItems = (actionKey) => {
    if (!selectedActorDoc) return [];

    if (actionKey === "attack") {
      const options = resolveAttackOptions(selectedActorDoc);
      return options.map((opt) => ({
        label: opt.name,
        command: `/action attack ${opt.arg}`,
      }));
    }

    if (actionKey === "spell") {
      const options = resolveSpellOptions(selectedActorDoc);
      return options.map((opt) => ({
        label: opt.name,
        command: `/action spell ${opt.arg}`,
      }));
    }

    if (actionKey === "equipment") {
      const slots = resolveEquipmentSlots(selectedActorDoc).filter(
        (slot) => slot.section === "slot",
      );
      if (slots.length === 0) {
        return [{ label: "Use Equipment", command: "/action equipment" }];
      }
      return slots.map((slot) => ({
        label: slot.currentItem?.name
          ? `${slot.label}: ${slot.currentItem.name}`
          : slot.label,
        command: "/action equipment",
      }));
    }

    if (actionKey === "hinder") {
      return [{ label: "Default (INS + WLP)", command: "/action hinder" }];
    }
    if (actionKey === "study") {
      return [{ label: "Default (INS + INS)", command: "/action study" }];
    }

    return [
      {
        label: `Use ${actionKey[0].toUpperCase()}${actionKey.slice(1)}`,
        command: `/action ${actionKey}`,
      },
    ];
  };

  const activeActionItems = activeActionKey
    ? getActionMenuItems(activeActionKey)
    : [];

  const renderSelectedActorActionBar = () => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.6,
        px: 0.5,
        pb: 0.25,
      }}
    >
      {actionOptions.map((action) => (
        <Button
          key={action}
          size="small"
          variant="outlined"
          sx={{ textTransform: "none" }}
          onClick={(e) => openMenu(e, action)}
        >
          {action[0].toUpperCase() + action.slice(1)}
        </Button>
      ))}
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

            {/* PCs section — shown after NPCs when NPCs have initiative (or combat inactive) */}
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
      <Popover
        open={Boolean(menuAnchorEl && menuType)}
        anchorEl={menuAnchorEl}
        onClose={() => {
          setMenuAnchorEl(null);
          setMenuType(null);
          setActiveActionKey(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              p: 1,
              minWidth: 240,
              borderRadius: 1.25,
            },
          },
        }}
      >
        {menuType === "action" && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 0.6 }}>
            {activeActionItems.length > 0 ? (
              activeActionItems.map((item) => (
                <Button
                  key={`${activeActionKey}-${item.label}`}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", justifyContent: "flex-start" }}
                  onClick={() => applyCommand(item.command)}
                >
                  {item.label}
                </Button>
              ))
            ) : (
              <Button
                size="small"
                variant="text"
                sx={{ textTransform: "none", justifyContent: "flex-start" }}
                disabled
              >
                No options available
              </Button>
            )}
          </Box>
        )}
      </Popover>
    </>
  );
}
