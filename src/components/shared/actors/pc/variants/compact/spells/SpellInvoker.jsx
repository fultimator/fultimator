import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Message } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { buildInvokerAvailableInvocations } from "/src/libs/player/invokerUtils";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellInvoker({ spell, setPlayer, classIndex }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  if (!spell) return null;
  const availableInvocations =
    spell.availableInvocations && spell.availableInvocations.length > 0
      ? spell.availableInvocations
      : buildInvokerAvailableInvocations(spell.skillLevel);

  const getWellspringColor = (wellspring, isActive) => {
    if (!isActive)
      return theme.mode === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)";
    const colorMap = {
      Air: "#87cfeb",
      Earth: "#8B4513",
      Fire: "#D63B00",
      Lightning: "#E6C800",
      Water: "#2F6FA1",
    };
    return colorMap[wellspring] || theme.primary;
  };

  const getSelectedTextColor = (wellspring) => {
    return wellspring === "Air" || wellspring === "Lightning" ? "#000" : "#fff";
  };

  const handleWellspringToggle = (wellspring) => {
    if (!setPlayer || classIndex == null) return;
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls, idx) => {
        if (idx !== classIndex) return cls;
        const newSpells = cls.spells.map((s) => {
          if (s.spellType === "invocation") {
            const prevTracker = s.tracker || {};
            let activeWellsprings = [...(prevTracker.activeWellsprings || [])];
            if (activeWellsprings.includes(wellspring)) {
              activeWellsprings = activeWellsprings.filter(
                (w) => w !== wellspring,
              );
            } else {
              if (activeWellsprings.length >= 2) {
                activeWellsprings.shift();
              }
              activeWellsprings.push(wellspring);
            }
            return { ...s, tracker: { ...prevTracker, activeWellsprings } };
          }
          return s;
        });
        return { ...cls, spells: newSpells };
      });
      return { ...prevPlayer, classes: newClasses };
    });
  };

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Active Wellsprings */}
        <TableRow
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          }}
        >
          <StyledTableCell colSpan={5}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {t("invoker_invocation_active_wellspring")}:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
              {["Air", "Earth", "Fire", "Lightning", "Water"].map((ws) => {
                const spellTracker = spell.tracker || {};
                const isActive = spellTracker.activeWellsprings?.includes(ws);
                const isInner =
                  spellTracker.innerWellspring &&
                  spellTracker.chosenWellspring === ws;
                const isSelected = isActive || isInner;
                const backgroundColor = getWellspringColor(ws, isSelected);
                const selectedTextColor = getSelectedTextColor(ws);
                return (
                  <Box
                    key={ws}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isInner) handleWellspringToggle(ws);
                    }}
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      backgroundColor,
                      color: isSelected ? selectedTextColor : "text.primary",
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      cursor: isInner ? "default" : "pointer",
                      border: isSelected
                        ? "none"
                        : `1px solid ${theme.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}`,
                      opacity: isInner ? 0.9 : 1,
                      "&:hover": {
                        opacity: isInner ? 0.9 : 0.8,
                      },
                    }}
                  >
                    {t(`invoker_${ws.toLowerCase()}`)}{" "}
                    {isInner ? `(${t("invoker_invocation_inner")})` : ""}
                  </Box>
                );
              })}
            </Box>
          </StyledTableCell>
        </TableRow>

        {/* Invocations */}
        {availableInvocations
          .filter((invocation) => {
            const t2 = spell.tracker || {};
            if (t2.activeWellsprings?.includes(invocation.wellspring))
              return true;
            if (
              t2.innerWellspring &&
              t2.chosenWellspring === invocation.wellspring
            )
              return true;
            return false;
          })
          .map((invocation, index) => (
            <React.Fragment key={index}>
              <TableRow
                sx={{
                  backgroundImage:
                    index % 2 === 0
                      ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                      : `linear-gradient(to right, ${gradientColor}, ${gradientColor})`,
                }}
              >
                <StyledTableCell
                  sx={{
                    width: "30%",
                    fontWeight: "bold",
                    borderLeft: `4px solid ${getWellspringColor(invocation.wellspring, true)}`,
                  }}
                >
                  {t(invocation.name)}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "20%", fontSize: "0.85rem" }}>
                  {t(`invoker_${invocation.wellspring.toLowerCase()}`)}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "15%", fontSize: "0.85rem" }}>
                  {t(invocation.type)}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "35%", fontSize: "0.85rem" }}>
                  <ReactMarkdown
                    components={{
                      p: ({ _node, ...props }) => <span {...props} />,
                    }}
                  >
                    {t(invocation.effect)}
                  </ReactMarkdown>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 32, px: 0.5 }}>
                  <Tooltip title={t("Send to Chat")} arrow>
                    <IconButton
                      size="small"
                      sx={{ p: "2px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        sendDisplayMessage("spell", t(invocation.name), {
                          speaker: "",
                          description: t(invocation.effect),
                          cost: { resource: "mp", amount: 5 },
                        });
                      }}
                    >
                      <Message sx={{ fontSize: "0.9rem" }} />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
      </TableBody>
    </Table>
  );
}
