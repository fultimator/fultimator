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
  Tooltip,
} from "@mui/material";
import { Add, Remove, RestartAlt } from "@mui/icons-material";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { styled } from "@mui/system";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { magiseeds } from "/src/libs/floralistMagiseedData";
import { setNestedActivation } from "/src/components/shared/actors/pc/spells/spellActivationPolicies";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellMagiseed({
  spell,
  setPlayer,
  classIndex,
  spellIndex,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  if (!spell) return null;
  const growthClock = spell.growthClock || 0;
  const currentMagiseed = spell.currentMagiseed;

  const getClockProgress = (clock) => (clock / 4) * 100;

  const getSeedKey = (seed) => seed?.key ?? seed?.name;
  const canUpdateSpell = setPlayer && classIndex != null && spellIndex != null;

  const isSeedActive = (seed) =>
    currentMagiseed && getSeedKey(currentMagiseed) === getSeedKey(seed);

  const getSeedEffect = (seed, clock) => {
    const seedKey = getSeedKey(seed);
    const magiseedTemplate = magiseeds.find((m) => m.name === seedKey);
    const effectKey = Math.min(clock, 3);
    const effect =
      seed.effects?.[effectKey] || magiseedTemplate?.effects?.[effectKey];
    return effect ? t(effect) : null;
  };

  const handleClockChange = (newClock) => {
    if (!canUpdateSpell) return;
    const clampedClock = Math.max(0, Math.min(4, newClock));
    updateSpell((s) => ({ ...s, growthClock: clampedClock }));
  };

  const updateSpell = (updater) => {
    if (!canUpdateSpell) return;
    setPlayer((prevPlayer) => {
      const newClasses = (prevPlayer.classes || []).map((cls, clsIndex) => {
        if (clsIndex !== classIndex) return cls;
        const newSpells = (cls.spells || []).map((s, sIndex) =>
          sIndex === spellIndex ? updater(s) : s,
        );
        return { ...cls, spells: newSpells };
      });
      return { ...prevPlayer, classes: newClasses };
    });
  };

  const handlePlantToggle = (seed) => {
    const seedIndex = (spell.magiseeds || []).findIndex(
      (entry) => getSeedKey(entry) === getSeedKey(seed),
    );
    updateSpell((s) =>
      setNestedActivation(s, seedIndex, "magiseed", !isSeedActive(seed)),
    );
  };

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Clock Row */}
        <TableRow
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          }}
        >
          <StyledTableCell colSpan={2}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}
            >
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
              <Box sx={{ display: "flex" }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClockChange(0);
                  }}
                  disabled={growthClock === 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <RestartAlt fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClockChange(growthClock - 1);
                  }}
                  disabled={growthClock <= 0 || !setPlayer}
                  sx={{ p: 0 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClockChange(growthClock + 1);
                  }}
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
              {t("magiseed_current_effect")}:{" "}
              {currentMagiseed
                ? currentMagiseed.customName || t(getSeedKey(currentMagiseed))
                : t("magiseed_no_magiseed")}
            </Typography>
            {currentMagiseed && getSeedEffect(currentMagiseed, growthClock) && (
              <Box
                sx={{
                  mt: 0.5,
                  p: 0.5,
                  bgcolor: theme.ternary + "20",
                  borderLeft: `3px solid ${theme.primary}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                  }}
                >
                  <strong>
                    {t("magiseed_current_effect")} (T={growthClock}):
                  </strong>
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.85rem" }}>
                  <ReactMarkdown
                    components={{
                      p: ({ _node, ...props }) => <span {...props} />,
                    }}
                  >
                    {getSeedEffect(currentMagiseed, growthClock)}
                  </ReactMarkdown>
                </Typography>
              </Box>
            )}
          </StyledTableCell>
        </TableRow>

        {/* Available Seeds Header */}
        <TableRow sx={{ backgroundColor: theme.secondary }}>
          <StyledTableCell
            colSpan={2}
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          >
            {t("magiseed_available_magiseeds")}
          </StyledTableCell>
        </TableRow>

        {/* Seeds List */}
        {spell.magiseeds
          ?.filter((seed) => {
            const seedKey = getSeedKey(seed);
            const magiseedTemplate = magiseeds.find(
              (m) => m.name === seedKey,
            );
            return seed.description || magiseedTemplate?.description;
          })
          .map((seed, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundImage:
                  index % 2 === 0
                    ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                    : `linear-gradient(to right, ${gradientColor}, ${gradientColor})`,
              }}
            >
              <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Tooltip
                    title={
                      isSeedActive(seed)
                        ? t("magiseed_remove_from_garden")
                        : currentMagiseed
                          ? t("magiseed_graft_in_garden")
                          : t("magiseed_plant_in_garden")
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlantToggle(seed);
                        }}
                        disabled={!canUpdateSpell}
                        sx={{
                          p: 0,
                          color: isSeedActive(seed)
                            ? theme.primary
                            : "text.secondary",
                        }}
                      >
                        {isSeedActive(seed) ? (
                          <LocalFloristIcon fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Box component="span">
                    {seed.customName || t(getSeedKey(seed))}
                  </Box>
                </Box>
              </StyledTableCell>
              <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
                <Box>
                  {[0, 1, 2, 3].map((clockVal) => {
                    const effect = getSeedEffect(seed, clockVal);
                    if (!effect) return null;
                    return (
                      <Box
                        key={clockVal}
                        sx={{ display: "flex", gap: 0.5, mb: 0.25 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: "bold",
                            color: theme.primary,
                            minWidth: "25px",
                            fontSize: "0.85rem",
                          }}
                        >
                          T={clockVal}:
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.85rem" }}>
                          <ReactMarkdown
                            components={{
                              p: ({ _node, ...props }) => <span {...props} />,
                            }}
                          >
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
