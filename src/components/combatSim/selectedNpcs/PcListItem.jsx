import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete, TouchApp, DragIndicator } from "@mui/icons-material";
import TurnTokens from "./TurnTokens";
import { GiDeathSkull } from "react-icons/gi";
import { IoIosWarning } from "react-icons/io";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCombatEncounterStore } from "../../../stores/combatEncounterStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function PcListItem({
  pc,
  index,
  selectedPcID,
  handleListItemClick,
  handleRemovePC,
  handleHpMpClick,
  handleUpdatePcTurns,
  isMobile,
  combatActive = false,
  isActiveFaction = false,
  activeTurnIndex = null,
  onStartTurn,
  onEndTurn,
  useDragAndDrop = true,
  onRowNode,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const isDarkMode = theme.palette.mode === "dark";

  const { targets, setTarget, toggleTarget, runtimeActors } =
    useCombatEncounterStore();
  const [hovered, setHovered] = useState(false);
  const pcName = pc.name || pc.characterName || "Unknown";
  const isTargeted = targets.some((t) => t.combatId === pc.combatId);
  const runtime = runtimeActors[pc.combatId];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pc.combatId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 1000 : 1,
  };

  useEffect(() => {
    if (!hovered) return;
    const handleKeyDown = (e) => {
      if (e.key !== "t" && e.key !== "T") return;
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const ref = { combatId: pc.combatId, name: pcName, source: "pc" };
      if (e.shiftKey) {
        toggleTarget(ref);
      } else {
        setTarget(ref);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hovered, pc.combatId, pcName, setTarget, toggleTarget]);

  const maxHp = pc.stats?.hp?.max ?? 0;
  const maxMp = pc.stats?.mp?.max ?? 0;
  const currentHp = runtime?.currentHp ?? pc.combatStats?.currentHp ?? maxHp;
  const currentMp = runtime?.currentMp ?? pc.combatStats?.currentMp ?? maxMp;

  return (
    <ListItem
      ref={(node) => {
        setNodeRef(node);
        onRowNode?.(pc.combatId, node);
      }}
      style={style}
      onClick={(e) =>
        e.target.type !== "checkbox" && handleListItemClick(pc.combatId)
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        border: isTargeted
          ? `2px solid ${theme.palette.warning.main}`
          : isDarkMode
            ? selectedPcID === pc.combatId
              ? "1px solid #fff"
              : "1px solid #555"
            : selectedPcID === pc.combatId
              ? "1px solid " + primary
              : "1px solid #ddd",
        marginY: 0.5,
        borderRadius: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isDarkMode
          ? currentHp === 0
            ? "#5c1010"
            : "rgba(76,175,80,0.08)"
          : currentHp === 0
            ? "#ffe6e6"
            : "rgba(76,175,80,0.06)",
        "&:hover": {
          backgroundColor: isDarkMode
            ? currentHp === 0
              ? "#6f0000"
              : "rgba(76,175,80,0.14)"
            : currentHp === 0
              ? "#ffcccc"
              : "rgba(76,175,80,0.10)",
        },
        paddingY: 0.75,
        flexDirection: "row",
        overflow: "visible",
        cursor: "pointer",
      }}
    >
      {useDragAndDrop && (
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            mr: 0.5,
            color: theme.palette.text.secondary,
            cursor: "grab",
            touchAction: "none",
            "&:hover": { color: theme.palette.text.primary },
          }}
        >
          <DragIndicator fontSize="small" />
        </Box>
      )}

      {/* Selected indicator badge */}
      {selectedPcID === pc.combatId && (
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
            <TouchApp sx={{ fontSize: 11, color: "primary.contrastText" }} />
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

      {/* Index */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? 8 : 10,
          height: "100%",
          borderRight: "1px solid #ccc",
          padding: "0 8px",
          gap: "2px",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: isDarkMode ? "#fff" : "#333" }}
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
            }}
          >
            {currentHp === 0 ? (
              <>
                <GiDeathSkull style={{ marginRight: 5 }} />
                {pc.name}
              </>
            ) : (
              pc.name
            )}
            {pc.combatStats?.combatNotes?.length > 0 && (
              <Typography
                component="span"
                variant="h5"
                sx={{
                  color: isDarkMode ? secondary : primary,
                  fontWeight: "bold",
                }}
              >
                {"【" + pc.combatStats.combatNotes + "】"}
              </Typography>
            )}
          </Typography>
        }
        secondary={
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
                    currentHp <= Math.floor(maxHp / 2) ? "#D32F2F" : "#4CAF50",
                  fontWeight: "bold",
                  transition: "color 0.2s ease-in-out",
                  "&:hover": {
                    color:
                      currentHp <= Math.floor(maxHp / 2)
                        ? "#B71C1C"
                        : "#388E3C",
                    textDecoration: "underline",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHpMpClick("HP", pc);
                }}
              >
                {currentHp}/{maxHp} {t("HP")}{" "}
                {currentHp <= Math.floor(maxHp / 2) && (
                  <IoIosWarning
                    style={{ fontSize: "1.2em", verticalAlign: "middle" }}
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
                  "&:hover": { color: "#1976D2", textDecoration: "underline" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHpMpClick("MP", pc);
                }}
              >
                {currentMp}/{maxMp} {t("MP")}
              </Typography>
            </Tooltip>
          </>
        }
        sx={{
          flex: 1,
          paddingLeft: 1,
          fontWeight: "500",
          overflow: "hidden",
          my: 0,
        }}
      />

      <ListItemSecondaryAction
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: "68px",
          flexShrink: 0,
          zIndex: 5,
        }}
      >
        <TurnTokens
          turns={pc.combatStats?.turns ?? [false]}
          combatActive={combatActive}
          isActiveFaction={isActiveFaction}
          activeTurnIndex={activeTurnIndex}
          onStartTurn={onStartTurn}
          onEndTurn={onEndTurn}
          onToggle={(newTurns) => handleUpdatePcTurns(pc.combatId, newTurns)}
          color="primary"
        />
        <IconButton
          edge="end"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePC(pc.combatId);
          }}
          sx={{ padding: 0.5, ml: 0.25 }}
        >
          <Tooltip
            title={t("combat_sim_delete")}
            enterDelay={500}
            enterNextDelay={500}
          >
            <Delete fontSize="small" />
          </Tooltip>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
