import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { Delete, TouchApp, DragIndicator, MoreVert, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import TurnTokens from "./TurnTokens";
import ResourceInlineBars from "./ResourceInlineBars";
import ResourceInlineReadout from "./ResourceInlineReadout";
import { GiDeathSkull } from "react-icons/gi";
import { t } from "../../../translation/translate";
import { alpha, useTheme } from "@mui/material/styles";
import { useCombatEncounterStore } from "../../../stores/combatEncounterStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function PcListItem({
  pc,
  index,
  selectedPcID,
  handleListItemClick,
  handleRemovePC,
  handleMoveUp,
  handleMoveDown,
  selectedPCs = [],
  handleHpMpClick,
  handleUpdatePcTurns,
  combatActive = false,
  isActiveFaction = false,
  activeTurnIndex = null,
  onStartTurn,
  onEndTurn,
  useDragAndDrop = true,
  onRowNode,
}) {
  const [anchorMenu, setAnchorMenu] = useState(null);
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
  const maxIp = pc.stats?.ip?.max ?? 0;
  const maxFp = pc.combatStats?.maxFp ?? 6;
  const currentHp = pc.combatStats?.currentHp ?? runtime?.currentHp ?? maxHp;
  const currentMp = pc.combatStats?.currentMp ?? runtime?.currentMp ?? maxMp;
  const currentIp = pc.combatStats?.currentIp ?? runtime?.currentIp ?? pc.stats?.ip?.current ?? 0;
  const currentFp = pc.combatStats?.currentFp ?? runtime?.currentFp ?? pc.info?.fabulapoints ?? 0;

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
        border: selectedPcID === pc.combatId
          ? `2px solid ${theme.palette.success.main}`
          : `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
        marginY: 0.35,
        borderRadius: 1.2,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isDarkMode
          ? currentHp === 0
            ? "rgba(211,47,47,0.22)"
            : "rgba(255,255,255,0.04)"
          : currentHp === 0
            ? "#ffeaea"
            : "rgba(238,250,247,0.82)",
        "&:hover": {
          backgroundColor: isDarkMode
            ? currentHp === 0
              ? "rgba(211,47,47,0.3)"
              : "rgba(255,255,255,0.07)"
            : currentHp === 0
              ? "#ffdede"
              : "rgba(246,255,252,0.98)",
        },
        paddingY: 0.5,
        flexDirection: "row",
        overflow: "visible",
        cursor: "pointer",
        containerType: "inline-size",
        containerName: "initiative-row",
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
          width: 24,
          height: "100%",
          borderRight: `1px solid ${theme.palette.divider}`,
          padding: "0 7px",
          gap: "2px",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: isDarkMode ? "#fff" : "#333", fontSize: "0.92rem" }}
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
          <Box>
            <ResourceInlineReadout
              currentHp={currentHp}
              maxHp={maxHp}
              currentMp={currentMp}
              maxMp={maxMp}
              currentIp={currentIp}
              maxIp={maxIp}
              hpColor={theme.palette.error.main}
              hpHover={theme.palette.error.dark}
              mpColor={theme.palette.info.main}
              mpHover={theme.palette.info.dark}
              ipColor={theme.palette.success.main}
              ipHover={theme.palette.success.dark}
              onHpClick={(e) => {
                e.stopPropagation();
                handleHpMpClick("HP", pc);
              }}
              onMpClick={(e) => {
                e.stopPropagation();
                handleHpMpClick("MP", pc);
              }}
              onIpClick={(e) => {
                e.stopPropagation();
                handleHpMpClick("IP", pc);
              }}
              currentFp={currentFp}
              maxFp={maxFp}
              fpColor={theme.palette.warning.main}
              fpHover={theme.palette.warning.dark}
              onFpClick={(e) => {
                e.stopPropagation();
                handleHpMpClick("FP", pc);
              }}
            />
            <ResourceInlineBars
              hpPct={maxHp > 0 ? (currentHp / maxHp) * 100 : 0}
              mpPct={maxMp > 0 ? (currentMp / maxMp) * 100 : 0}
              ipPct={maxIp > 0 ? (currentIp / maxIp) * 100 : 0}
              hpColor={theme.palette.error.main}
              mpColor={theme.palette.info.main}
              ipColor={theme.palette.success.main}
              tone="pc"
            />
          </Box>
        }
        disableTypography
        sx={{
          flex: 1,
          paddingLeft: 1,
          fontWeight: "500",
          overflow: "hidden",
          my: 0,
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: "72px",
          flexShrink: 0,
          zIndex: 5,
          gap: 0.25,
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
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorMenu(e.currentTarget);
          }}
          sx={{ padding: 0.5 }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorMenu}
          open={Boolean(anchorMenu)}
          onClose={() => setAnchorMenu(null)}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMoveUp?.(pc.combatId);
              setAnchorMenu(null);
            }}
            disabled={index === 0}
          >
            <ArrowUpward fontSize="small" />
            {" " + t("combat_sim_move_up")}
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMoveDown?.(pc.combatId);
              setAnchorMenu(null);
            }}
            disabled={index === selectedPCs.length - 1}
          >
            <ArrowDownward fontSize="small" />
            {" " + t("combat_sim_move_down")}
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePC(pc.combatId);
              setAnchorMenu(null);
            }}
            sx={{ color: "error.main" }}
          >
            <Delete fontSize="small" />
            {" " + t("combat_sim_delete")}
          </MenuItem>
        </Menu>
      </Box>
    </ListItem>
  );
}
