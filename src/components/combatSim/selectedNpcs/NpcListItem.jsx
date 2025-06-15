import React from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Checkbox,
  Popover,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  Delete,
  MoreVert,
  DragIndicator,
} from "@mui/icons-material";
import { calcHP, calcMP } from "../../../libs/npcs";
import { GiDeathSkull } from "react-icons/gi";
import { IoIosWarning } from "react-icons/io";
import { t } from "../../../translation/translate";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTheme } from "@mui/material/styles";

export default function NpcListItem({
  npc,
  index,
  selectedNpcID,
  handleListItemClick,
  handlePopoverOpen,
  handlePopoverClose,
  handleUpdateNpcTurns,
  handleMenuOpen,
  handleMenuClose,
  handleMoveUp,
  handleMoveDown,
  handleRemoveNPC,
  anchorEl,
  anchorMenu,
  popoverNpcId,
  selectedNpcMenu,
  isMobile,
  getTurnCount,
  handleHpMpClick,
  selectedNPCs,
  useDragAndDrop,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const isDarkMode = theme.palette.mode === "dark";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: npc.combatId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 1000 : 1,
  };

  const turnCount = getTurnCount(npc.rank);

  if (!npc.combatStats.turns) {
    npc.combatStats.turns = new Array(turnCount).fill(false);
  }

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      key={npc.combatId}
      button
      onClick={(e) => npc.id && handleListItemClick(e, npc.combatId)}
      sx={{
        border: isDarkMode
          ? selectedNpcID && selectedNpcID === npc.combatId
            ? "1px solid #fff"
            : "1px solid #555"
          : selectedNpcID && selectedNpcID === npc.combatId
          ? "1px solid " + primary
          : "1px solid #ddd",
        marginY: 1,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isDarkMode
          ? npc.combatStats?.currentHp === 0
            ? "#5c1010"
            : "#333"
          : npc.combatStats?.currentHp === 0
          ? "#ffe6e6"
          : "inherit",
        "&:hover": {
          backgroundColor: isDarkMode
            ? npc.combatStats?.currentHp === 0
              ? "#6f0000"
              : "#444"
            : npc.combatStats?.currentHp === 0
            ? "#ffcccc"
            : "#f1f1f1",
        },
        paddingY: 1,
        flexDirection: "row",
        overflow: "hidden",
        cursor: npc.id ? "pointer" : "default",
      }}
    >
      {/* Drag Handle */}
      {useDragAndDrop && (
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "40px",
            cursor: "grab",
            marginRight: 1,
            color: isDarkMode ? "#888" : "#666",
            "&:hover": {
              color: isDarkMode ? "#ccc" : "#333",
            },
            touchAction: "none",
          }}
        >
          <DragIndicator />
        </Box>
      )}

      {/* Left: Index */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? "5px" : "10px",
          height: "100%",
          borderRight: "1px solid #ccc",
          padding: "0 10px",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: isDarkMode ? "#fff" : "#333",
          }}
        >
          {index + 1}
        </Typography>
      </Box>
      <ListItemText
        primary={
          <Typography
            variant="h4"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: {
                xs: "0.7rem",
                sm: "0.8rem",
                md: "0.9rem",
                lg: "1rem",
              },
              maxWidth:
                npc.combatStats.turns.length > 1
                  ? "calc(100% - 88px)"
                  : "calc(100% - 55px)",
            }}
          >
            {npc.id ? (
              npc.combatStats?.currentHp === 0 ? (
                <>
                  <GiDeathSkull style={{ marginRight: 5 }} />
                  {npc.name}
                </>
              ) : (
                npc.name
              )
            ) : (
              t("combat_sim_deleted_npc")
            )}
            {npc.id && npc.combatStats?.combatNotes?.length > 0 && (
              <Typography
                component="span"
                variant="h5"
                sx={{
                  color: isDarkMode ? secondary : primary,
                  fontWeight: "bold",
                }}
              >
                {"【" + npc.combatStats.combatNotes + "】"}
              </Typography>
            )}
          </Typography>
        }
        secondary={
          npc.id && (
            <>
              <Tooltip
                title={t("combat_sim_edit_hp")}
                enterDelay={500}
                enterNextDelay={500}
              >
                <Typography
                  component="span"
                  variant="h5"
                  sx={{
                    color:
                      npc.combatStats?.currentHp <= Math.floor(calcHP(npc) / 2)
                        ? "#D32F2F"
                        : "#4CAF50",
                    fontWeight: "bold",
                    transition: "color 0.2s ease-in-out",
                    "&:hover": {
                      color:
                        npc.combatStats?.currentHp <=
                        Math.floor(calcHP(npc) / 2)
                          ? "#B71C1C"
                          : "#388E3C",
                      textDecoration: "underline",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHpMpClick("HP", npc);
                  }}
                >
                  {npc.combatStats?.currentHp}/{calcHP(npc)} {t("HP")}{" "}
                  {npc.combatStats?.currentHp <=
                    Math.floor(calcHP(npc) / 2) && (
                    <IoIosWarning
                      style={{
                        fontSize: "1.2em",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </Typography>
              </Tooltip>
              {" | "}
              <Tooltip
                title={t("combat_sim_edit_mp")}
                enterDelay={500}
                enterNextDelay={500}
              >
                <Typography
                  component="span"
                  variant="h5"
                  sx={{
                    color: "#2196F3",
                    fontWeight: "bold",
                    transition: "color 0.2s ease-in-out",
                    "&:hover": {
                      color: "#1976D2",
                      textDecoration: "underline",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHpMpClick("MP", npc);
                  }}
                >
                  {npc.combatStats?.currentMp}/{calcMP(npc)} {t("MP")}
                </Typography>
              </Tooltip>
            </>
          )
        }
        sx={{
          flex: 1,
          paddingLeft: 2,
          fontWeight: "500",
          fontSize: "1rem",
          overflow: "hidden",
        }}
      />

      {/* Popover for extra turn checkboxes */}
      <Popover
        open={Boolean(anchorEl) && popoverNpcId === npc.combatId}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          zIndex: 1300,
        }}
      >
        <Box sx={{ padding: 1 }}>
          {npc.combatStats.turns.map((turnTaken, turnIndex) => (
            <Checkbox
              key={turnIndex}
              checked={turnTaken}
              onChange={(e) => {
                e.stopPropagation();
                const newTurns = [...npc.combatStats.turns];
                newTurns[turnIndex] = e.target.checked;
                handleUpdateNpcTurns(npc.combatId, newTurns);
              }}
              color="success"
              sx={{ padding: "2px" }}
            />
          ))}
        </Box>
      </Popover>
      {/* Actions */}
      {npc.id ? (
        <ListItemSecondaryAction
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: "120px",
            flexShrink: 0,
            zIndex: 5, // Prevent overlap with turn counter
          }}
        >
          {/* Turn Counter or Checkboxes */}
          {npc.combatStats.turns.length > 1 ? (
            <Tooltip
              title={t("combat_sim_check_turn")}
              enterDelay={500}
              enterNextDelay={500}
            >
              <Button
                variant={
                  npc.combatStats.turns?.every((turn) => turn)
                    ? "contained"
                    : "outlined"
                }
                color={
                  npc.combatStats.turns?.every((turn) => turn)
                    ? "success"
                    : "inherit"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  handlePopoverOpen(event, npc.combatId);
                }}
                sx={{
                  zIndex: 10,
                }}
                size={isMobile ? "small" : "medium"}
              >
                {npc.combatStats.turns.filter((turn) => turn).length} /{" "}
                {npc.combatStats.turns.length}
              </Button>
            </Tooltip>
          ) : (
            npc.combatStats.turns.slice(0, 3).map((turnTaken, turnIndex) => (
              <Tooltip
                title={t("combat_sim_check_turn")}
                key={turnIndex}
                enterDelay={500}
                enterNextDelay={500}
              >
                <Checkbox
                  checked={turnTaken}
                  onChange={(e) => {
                    const newTurns = [...npc.combatStats.turns];
                    newTurns[turnIndex] = e.target.checked;
                    handleUpdateNpcTurns(npc.combatId, newTurns);
                  }}
                  color="success"
                  sx={{ padding: "2px", zIndex: 10 }}
                />
              </Tooltip>
            ))
          )}
          {isMobile && !useDragAndDrop ? (
            <>
              <IconButton
                edge="end"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, npc.combatId);
                }}
                sx={{ padding: 1 }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorMenu}
                open={Boolean(anchorMenu) && selectedNpcMenu === npc.combatId}
                onClose={(e) => handleMenuClose(e)}
              >
                <MenuItem
                  onClick={(e) => {
                    handleMoveUp(npc.combatId);
                    handleMenuClose(e);
                  }}
                  disabled={index === 0}
                >
                  <ArrowUpward fontSize="small" />
                  {" " + t("combat_sim_move_up")}
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    handleMoveDown(npc.combatId);
                    handleMenuClose(e);
                  }}
                  disabled={index === selectedNPCs.length - 1}
                >
                  <ArrowDownward fontSize="small" />
                  {" " + t("combat_sim_move_down")}
                </MenuItem>

                <MenuItem
                  onClick={(e) => {
                    handleRemoveNPC(npc.combatId);
                    handleMenuClose(e);
                  }}
                  sx={{ color: "error.main" }}
                >
                  <Delete fontSize="small" />
                  {" " + t("combat_sim_delete")}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {!useDragAndDrop && (
                <>
                  {" "}
                  <IconButton
                    edge="end"
                    color={isDarkMode ? "secondary" : "primary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(npc.combatId);
                    }}
                    disabled={index === 0}
                    sx={{ padding: 1 }}
                  >
                    <Tooltip
                      title={t("combat_sim_move_up")}
                      enterDelay={500}
                      enterNextDelay={500}
                    >
                      <ArrowUpward fontSize="small" />
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    edge="end"
                    color={isDarkMode ? "secondary" : "primary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(npc.combatId);
                    }}
                    disabled={index === selectedNPCs.length - 1}
                    sx={{ padding: 1 }}
                  >
                    <Tooltip
                      title={t("combat_sim_move_down")}
                      enterDelay={500}
                      enterNextDelay={500}
                    >
                      <ArrowDownward fontSize="small" />
                    </Tooltip>
                  </IconButton>
                </>
              )}
              <IconButton
                edge="end"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveNPC(npc.combatId);
                }}
                sx={{ padding: 1 }}
              >
                <Tooltip
                  title={t("combat_sim_delete")}
                  enterDelay={500}
                  enterNextDelay={500}
                >
                  <Delete fontSize="small" />
                </Tooltip>
              </IconButton>
            </>
          )}
        </ListItemSecondaryAction>
      ) : (
        <ListItemSecondaryAction
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: "120px",
            flexShrink: 0,
            zIndex: 5, // Prevent overlap with turn counter
          }}
        >
          <IconButton
            edge="end"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveNPC(npc.combatId);
            }}
            sx={{ padding: 1 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}
