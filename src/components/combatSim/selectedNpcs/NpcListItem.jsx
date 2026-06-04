import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemText,
  IconButton,
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
  RadioButtonUnchecked,
} from "@mui/icons-material";
import TurnTokens from "./TurnTokens";
import ResourceInlineBars from "./ResourceInlineBars";
import ResourceInlineReadout from "./ResourceInlineReadout";
import { calcHP, calcMP } from "../../../libs/npcs";
import { villainUltimaMax } from "../../../routes/combat/combatSimulator";
import { GiDeathSkull } from "react-icons/gi";
import { t } from "../../../translation/translate";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { alpha, useTheme } from "@mui/material/styles";
import { useCombatEncounterStore } from "../../../stores/combatEncounterStore";

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
  anchorMenu,
  selectedNpcMenu,
  getTurnCount,
  handleHpMpClick,
  selectedNPCs,
  useDragAndDrop,
  combatActive = false,
  isActiveFaction = false,
  activeTurnIndex = null,
  onStartTurn,
  onEndTurn,
  onRowNode,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const isDarkMode = theme.palette.mode === "dark";
  const error = theme.palette.error;
  const text = theme.palette.text;

  const { targets, setTarget, toggleTarget, runtimeActors } =
    useCombatEncounterStore();
  const runtime = runtimeActors[npc.combatId];
  const currentHp = npc.combatStats?.currentHp ?? runtime?.currentHp ?? 0;
  const currentMp = npc.combatStats?.currentMp ?? runtime?.currentMp ?? 0;
  const currentUp = npc.villain ? (npc.combatStats?.ultima ?? 0) : null;
  const maxUp = npc.villain ? villainUltimaMax(npc.villain) : null;
  const [hovered, setHovered] = useState(false);
  const isTargeted = targets.some((t) => t.combatId === npc.combatId);

  useEffect(() => {
    if (!hovered) return;
    const handleKeyDown = (e) => {
      if (e.key !== "t" && e.key !== "T") return;
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const ref = { combatId: npc.combatId, name: npc.name, source: "npc" };
      if (e.shiftKey) {
        toggleTarget(ref);
      } else {
        setTarget(ref);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hovered, npc.combatId, npc.name, setTarget, toggleTarget]);

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
      ref={(node) => {
        setNodeRef(node);
        onRowNode?.(npc.combatId, node);
      }}
      style={style}
      key={npc.combatId}
      onClick={(e) => npc.id && handleListItemClick(e, npc.combatId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        border: selectedNpcID && selectedNpcID === npc.combatId
          ? `2px solid ${theme.palette.error.main}`
          : `1px solid ${alpha(theme.palette.error.main, 0.28)}`,
        marginY: 0.35,
        borderRadius: 1.2,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor:
          currentHp === 0
            ? isDarkMode
              ? "rgba(211,47,47,0.22)"
              : "#ffeaea"
            : isDarkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,244,246,0.82)",
        "&:hover": {
          backgroundColor:
            currentHp === 0
            ? isDarkMode
              ? "rgba(211,47,47,0.3)"
              : "#ffdede"
            : isDarkMode
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,248,250,0.98)",
        },
        paddingY: 0.5,
        flexDirection: "row",
        overflow: "visible",
        cursor: npc.id ? "pointer" : "default",
        containerType: "inline-size",
        containerName: "initiative-row",
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
            width: "24px",
            cursor: "grab",
            marginRight: 0.5,
            color: text.secondary,
            "&:hover": {
              color: text.primary,
            },
            touchAction: "none",
          }}
        >
          <DragIndicator />
        </Box>
      )}

      {/* Selected indicator badge */}
      {selectedNpcID === npc.combatId && (
        <Tooltip title="Selected" enterDelay={300}>
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: isTargeted ? 32 : 8,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: primary,
              border: `2px solid ${theme.palette.background.paper}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              boxShadow: `0 0 0 1px ${primary}`,
            }}
          >
            <RadioButtonUnchecked
              sx={{ fontSize: 11, color: "primary.contrastText" }}
            />
          </Box>
        </Tooltip>
      )}

      {/* Target indicator badge */}
      {isTargeted && (
        <Tooltip title="Targeted (T / Shift+T)" enterDelay={300}>
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: 8,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: theme.palette.warning.main,
              border: `2px solid ${theme.palette.background.paper}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              boxShadow: `0 0 0 1px ${theme.palette.warning.main}`,
            }}
          >
            <img
              src="/assets/icons/checks/roll_target.png"
              alt="targeted"
              style={{ width: 12, height: 12 }}
            />
          </Box>
        </Tooltip>
      )}

      {/* Left: Index */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: "100%",
          borderRight: `1px solid ${theme.palette.divider}`,
          padding: "0 7px",
          gap: "2px",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: text.primary,
            fontSize: "0.92rem",
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
              fontFamily: "Antonio",
              fontWeight: 700,
              fontSize: {
                xs: "0.95rem",
                sm: "1.02rem",
                md: "1.06rem",
                lg: "1.08rem",
              },
              maxWidth:
                npc.combatStats.turns.length > 1
                  ? "calc(100% - 88px)"
                  : "calc(100% - 55px)",
            }}
          >
            {npc.id ? (
              currentHp === 0 ? (
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
            <Box>
              <ResourceInlineReadout
                currentHp={currentHp}
                maxHp={calcHP(npc)}
                currentMp={currentMp}
                maxMp={calcMP(npc)}
                hpColor={error.main}
                hpHover={error.dark}
                mpColor={theme.palette.info.main}
                mpHover={theme.palette.info.dark}
                currentUp={currentUp}
                maxUp={maxUp}
                upColor="#674168"
                upHover="#563257"
                onHpClick={(e) => {
                  e.stopPropagation();
                  handleHpMpClick("HP", npc);
                }}
                onMpClick={(e) => {
                  e.stopPropagation();
                  handleHpMpClick("MP", npc);
                }}
                onUpClick={(e) => {
                  e.stopPropagation();
                  handleHpMpClick("UP", npc);
                }}
              />
              <ResourceInlineBars
                hpPct={calcHP(npc) > 0 ? (currentHp / calcHP(npc)) * 100 : 0}
                mpPct={calcMP(npc) > 0 ? (currentMp / calcMP(npc)) * 100 : 0}
                hpColor={theme.palette.error.main}
                mpColor={theme.palette.info.main}
                tone="npc"
              />
            </Box>
          )
        }
        disableTypography
        sx={{
          flex: 1,
          paddingLeft: 1,
          fontWeight: "500",
          fontSize: "1rem",
          overflow: "hidden",
          my: 0,
        }}
      />

      {/* Popover for extra turn checkboxes */}
      {/* Actions */}
      {npc.id ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: "92px",
            flexShrink: 0,
            zIndex: 5, // Prevent overlap with turn counter
            gap: 0.25,
          }}
        >
          {/* Turn tokens */}
          <TurnTokens
            turns={npc.combatStats.turns}
            combatActive={combatActive}
            isActiveFaction={isActiveFaction}
            activeTurnIndex={activeTurnIndex}
            onStartTurn={onStartTurn}
            onEndTurn={onEndTurn}
            onToggle={(newTurns) =>
              handleUpdateNpcTurns(npc.combatId, newTurns)
            }
            color="primary"
          />
          <>
            <IconButton
              edge="end"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, npc.combatId);
              }}
              sx={{ padding: 0.5 }}
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
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: "92px",
            flexShrink: 0,
            zIndex: 5, // Prevent overlap with turn counter
            gap: 0.25,
          }}
        >
          <IconButton
            edge="end"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveNPC(npc.combatId);
            }}
            sx={{ padding: 0.5, ml: 0.25 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )}
    </ListItem>
  );
}
