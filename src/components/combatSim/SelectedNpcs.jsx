import React, { useState } from "react";
import { Box, List } from "@mui/material";
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
  selectedNPCs, // List of selected NPCs (array)
  handleResetTurns, // Function to reset turns (function)
  handleMoveUp, // Function to move NPC up with the move up/down buttons (function)
  handleMoveDown, // Function to move NPC down with the move up/down buttons (function)
  handleRemoveNPC, // Function to remove NPC from the list (function)
  handleUpdateNpcTurns, // Function to update NPC turns (function)
  handlePopoverOpen, // Function to open the popover for turn checkboxes of NPCs with more then 1 turn (function)
  handlePopoverClose, // Function to close the popover for turn checkboxes of NPCs with more then 1 turn (function)
  anchorEl, // Element to anchor the popover (object)
  popoverNpcId, // ID of the NPC for the popover (string)
  getTurnCount, // Function to get the turn count for the NPC (function)
  handleNpcClick, // Function to handle the NPC list item click (function)
  handleHpMpClick, // Function to handle the HP/MP click (function)
  isMobile, // Boolean to check if the device is mobile (boolean)
  selectedNpcID, // ID of the selected NPC (string)
  useDragAndDrop = true, // Boolean to check whether to use drag and drop or move up/down buttons (boolean)
  onSortEnd = null, // Function to handle sorting end (function)
  onClockClick, // Function to handle clock button click (function)
  onNotesClick, // Function to handle notes button click (function)
}) {
  const [anchorMenu, setAnchorMenu] = useState(null); // Anchor element for the menu
  const [selectedNpcMenu, setSelectedNpcMenu] = useState(null); // ID of the selected NPC for the menu

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
    })
  );

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedNPCs.findIndex(
        (npc) => npc.combatId === active.id
      );
      const newIndex = selectedNPCs.findIndex(
        (npc) => npc.combatId === over.id
      );

      // Call parent component's handler with sorted array
      if (onSortEnd) {
        onSortEnd(arrayMove(selectedNPCs, oldIndex, newIndex));
      }
    }
  };

  // Handle list item click
  const handleListItemClick = (e, combatId) => {
    if (e.target.type !== "checkbox") {
      handleNpcClick(combatId);
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
      />
      {/* Body */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          paddingTop: 1,
          ...(selectedNPCs.length === 0 && {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }),
        }}
      >
        {selectedNPCs.length === 0 ? (
          <EmptyList isMobile={isMobile} showIcon={true} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedNPCs.map((npc) => npc.combatId)}
              strategy={verticalListSortingStrategy}
            >
              <List>
                {selectedNPCs.map((npc, index) => (
                  <NpcListItem
                    key={npc.combatId}
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
                  />
                ))}
              </List>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    </>
  );
}
