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
import { magiseeds } from "../../../../../libs/floralistMagiseedData";

const StyledTableCell = styled(TableCell)({ 
  padding: "2px 4px",
  fontSize: "0.8rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
});

export default function SpellMagiseed({ spell, setPlayer }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  const growthClock = spell.growthClock || 0;
  const currentMagiseed = spell.currentMagiseed;

  const getClockProgress = (clock) => (clock / 4) * 100;

  const getSeedEffect = (seed, clock) => {
    const magiseedTemplate = magiseeds.find((m) => m.name === seed.name);
    if (!magiseedTemplate) return null;
    const effectKey = Math.min(clock, 3);
    const effect = seed.effects?.[effectKey] || magiseedTemplate.effects?.[effectKey];
    return effect ? t(effect) : null;
  };

  const handleClockChange = (newClock) => {
    if (!setPlayer) return;
    const clampedClock = Math.max(0, Math.min(4, newClock));
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls) => {
        if (cls.name === spell.className) {
          const newSpells = cls.spells.map((s) => {
            if (s.spellType === "magiseed") {
              return { ...s, growthClock: clampedClock };
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
        {/* Clock Row */}
        <TableRow sx={{ backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` }}>
          <StyledTableCell colSpan={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {t("magiseed_growth_clock")}: {growthClock}/4
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={getClockProgress(growthClock)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box sx={{ display: 'flex' }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); handleClockChange(0); }}
                  disabled={growthClock === 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <RestartAlt fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); handleClockChange(growthClock - 1); }}
                  disabled={growthClock <= 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); handleClockChange(growthClock + 1); }}
                  disabled={growthClock >= 4 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </StyledTableCell>
        </TableRow>

        {/* Current Seed Row */}
        <TableRow>
          <StyledTableCell colSpan={2}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {t("magiseed_current_effect")}: {currentMagiseed ? (currentMagiseed.customName || t(currentMagiseed.name)) : t("magiseed_no_magiseed")}
            </Typography>
            {currentMagiseed && getSeedEffect(currentMagiseed, growthClock) && (
              <Box sx={{ mt: 0.5, p: 0.5, bgcolor: theme.ternary + "20", borderLeft: `3px solid ${theme.primary}` }}>
                <Typography variant="caption" sx={{
                  display: "block"
                }}>
                  <strong>{t("magiseed_current_effect")} (T={growthClock}):</strong>
                </Typography>
                <Typography variant="caption">
                  <ReactMarkdown components={{ p: ({ _node, ...props }) => <span {...props} /> }}>
                    {getSeedEffect(currentMagiseed, growthClock)}
                  </ReactMarkdown>
                </Typography>
              </Box>
            )}
          </StyledTableCell>
        </TableRow>

        {/* Available Seeds Header */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell colSpan={2} sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>
            {t("magiseed_available_magiseeds")}
          </StyledTableCell>
        </TableRow>

        {/* Seeds List */}
        {spell.magiseeds?.filter(seed => {
          const magiseedTemplate = magiseeds.find((m) => m.name === seed.name);
          return seed.description || magiseedTemplate?.description;
        }).map((seed, index) => (
          <TableRow key={index}>
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {seed.customName || t(seed.name)}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
              <Box>
                {[0, 1, 2, 3].map(clockVal => {
                  const effect = getSeedEffect(seed, clockVal);
                  if (!effect) return null;
                  return (
                    <Box key={clockVal} sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: theme.primary, minWidth: '25px' }}>
                        T={clockVal}:
                      </Typography>
                      <Typography variant="caption">
                        <ReactMarkdown components={{ p: ({ _node, ...props }) => <span {...props} /> }}>
                          {effect}
                        </ReactMarkdown>
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
