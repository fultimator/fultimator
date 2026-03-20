import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { Add, Remove, RestartAlt } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({
  padding: "2px 4px",
  fontSize: "0.8rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellGift({ spell, setPlayer }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const clock = spell.clock || 0;
  const getClockProgress = (c) => (c / 4) * 100;

  const handleClockChange = (newClock) => {
    if (!setPlayer) return;
    const clampedClock = Math.max(0, Math.min(4, newClock));
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls) => {
        if (cls.name !== spell.className) return cls;
        const newSpells = cls.spells.map((s) =>
          s.spellType === "gift" ? { ...s, clock: clampedClock } : s
        );
        return { ...cls, spells: newSpells };
      });
      return { ...prevPlayer, classes: newClasses };
    });
  };

  const handleClockReset = () => handleClockChange(0);

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Clock Row */}
        <TableRow sx={{ backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` }}>
          <StyledTableCell colSpan={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
              <Typography variant="caption" fontWeight="bold">
                {t("esper_brainwave_clock")}: {clock}/4
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={getClockProgress(clock)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box sx={{ display: "flex" }}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleClockReset(); }}
                  disabled={clock === 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <RestartAlt fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleClockChange(clock - 1); }}
                  disabled={clock <= 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleClockChange(clock + 1); }}
                  disabled={clock >= 4 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </StyledTableCell>
        </TableRow>

        {/* Gifts List */}
        {spell.gifts?.map((gift, index) => (
          <TableRow
            key={index}
            sx={{
              backgroundImage:
                index % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}20, ${gradientColor})`
                  : `linear-gradient(to right, ${theme.ternary}40, ${gradientColor})`,
            }}
          >
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {gift.name === "esper_gift_custom_name" ? gift.customName : t(gift.name)}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "20%", fontSize: "0.7rem" }}>
              {gift.event ? (
                <ReactMarkdown components={{ p: (props) => <span {...props} /> }}>
                  {gift.event.startsWith("esper_event_") ? t(gift.event) : gift.event}
                </ReactMarkdown>
              ) : "-"}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "50%", fontSize: "0.75rem" }}>
              <ReactMarkdown components={{ p: (props) => <span {...props} /> }}>
                {gift.name === "esper_gift_custom_name" ? gift.effect : t(gift.effect)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}