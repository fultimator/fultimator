import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { buildInvokerAvailableInvocations } from "../../../spells/invokerUtils";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellInvoker({ spell, setPlayer }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
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
    if (!setPlayer) return;
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls) => {
        if (cls.name === spell.className) {
          const newSpells = cls.spells.map((s) => {
            if (s.spellType === "invocation") {
              let activeWellsprings = [...(s.activeWellsprings || [])];
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
              return { ...s, activeWellsprings };
            }
            return s;
          });
          return { ...cls, spells: newSpells };
        }
        return cls;
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
          <StyledTableCell colSpan={4}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {t("invoker_invocation_active_wellspring")}:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
              {["Air", "Earth", "Fire", "Lightning", "Water"].map((ws) => {
                const isActive = spell.activeWellsprings?.includes(ws);
                const isInner =
                  spell.innerWellspring && spell.chosenWellspring === ws;
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
            if (spell.activeWellsprings?.includes(invocation.wellspring))
              return true;
            if (
              spell.innerWellspring &&
              spell.chosenWellspring === invocation.wellspring
            )
              return true;
            return false;
          })
          .map((invocation, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell
                  sx={{
                    width: "30%",
                    fontWeight: "bold",
                    borderLeft: `4px solid ${getWellspringColor(invocation.wellspring, true)}`,
                  }}
                >
                  {t(invocation.name)}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "20%", fontSize: "0.75rem" }}>
                  {t(`invoker_${invocation.wellspring.toLowerCase()}`)}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "15%", fontSize: "0.75rem" }}>
                  {t(invocation.type)}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "35%", fontSize: "0.75rem" }}>
                  <ReactMarkdown
                    components={{
                      p: ({ _node, ...props }) => <span {...props} />,
                    }}
                  >
                    {t(invocation.effect)}
                  </ReactMarkdown>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
      </TableBody>
    </Table>
  );
}
