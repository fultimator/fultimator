import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Tooltip,
} from "@mui/material";
import { Delete, TouchApp } from "@mui/icons-material";
import { GiDeathSkull } from "react-icons/gi";
import { IoIosWarning } from "react-icons/io";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCombatEncounterStore } from "../../../stores/combatEncounterStore";

export default function PcListItem({
  pc,
  index,
  selectedPcID,
  handleListItemClick,
  handleRemovePC,
  handleHpMpClick,
  handleUpdatePcTurns,
  isMobile,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const isDarkMode = theme.palette.mode === "dark";

  const { targets, setTarget, toggleTarget } = useCombatEncounterStore();
  const [hovered, setHovered] = useState(false);
  const pcName = pc.name || pc.characterName || "Unknown";
  const isTargeted = targets.some((t) => t.combatId === pc.combatId);

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
  const currentHp = pc.combatStats?.currentHp ?? maxHp;

  return (
    <ListItem
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
        marginY: 1,
        borderRadius: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isTargeted
          ? isDarkMode
            ? "rgba(237,177,80,0.08)"
            : "rgba(237,177,80,0.06)"
          : isDarkMode
            ? currentHp === 0
              ? "#5c1010"
              : "#2a2a4a"
            : currentHp === 0
              ? "#ffe6e6"
              : "#f0f0ff",
        "&:hover": {
          backgroundColor: isDarkMode
            ? currentHp === 0
              ? "#6f0000"
              : "#3a3a5c"
            : currentHp === 0
              ? "#ffcccc"
              : "#e0e0ff",
        },
        paddingY: 1,
        flexDirection: "row",
        overflow: "visible",
        cursor: "pointer",
      }}
    >
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
          width: isMobile ? "5px" : "10px",
          height: "100%",
          borderRight: "1px solid #ccc",
          padding: "0 10px",
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
                {pc.combatStats?.currentMp ?? maxMp}/{maxMp} {t("MP")}
              </Typography>
            </Tooltip>
          </>
        }
        sx={{ flex: 1, paddingLeft: 2, fontWeight: "500", overflow: "hidden" }}
      />

      <ListItemSecondaryAction
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: "80px",
          flexShrink: 0,
          zIndex: 5,
        }}
      >
        <Tooltip
          title={t("combat_sim_check_turn")}
          enterDelay={500}
          enterNextDelay={500}
        >
          <Checkbox
            checked={pc.combatStats?.turns?.[0] ?? false}
            onChange={(e) => {
              e.stopPropagation();
              handleUpdatePcTurns(pc.combatId, [e.target.checked]);
            }}
            color="success"
            sx={{ padding: "2px", zIndex: 10 }}
          />
        </Tooltip>
        <IconButton
          edge="end"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePC(pc.combatId);
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
      </ListItemSecondaryAction>
    </ListItem>
  );
}
