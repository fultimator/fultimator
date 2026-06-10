import React, { useState } from "react";
import {
  Typography,
  ThemeProvider,
  Tooltip,
  Icon,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Collapse,
} from "@mui/material";
import {
  VisibilityOff,
  ExpandMore,
  LocalFlorist,
  Edit,
  Casino,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { magiseeds } from "/src/libs/floralistMagiseedData";
import Clock from "/src/components/shared/actors/pc/playerSheet/optional/Clock";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";

function ThemedSpellMagiseed({
  magiseed,
  isEditMode,
  onEdit,
  onRoll,
  onMagiseedChange,
  onGrowthClockChange,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

  const [expandedMagiseeds, setExpandedMagiseeds] = useState(new Set());
  const [localClock, setLocalClock] = useState(magiseed.growthClock || 0);

  // Sync local clock when prop changes
  React.useEffect(() => {
    setLocalClock(magiseed.growthClock || 0);
  }, [magiseed.growthClock]);

  const toggleMagiseedExpansion = (index) => {
    setExpandedMagiseeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const showInPlayerSheet =
    magiseed.showInPlayerSheet || magiseed.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ ...props }) => <p style={inlineStyles} {...props} />,
  };

  // Get current magiseed in garden
  const currentMagiseed = magiseed.currentMagiseed;
  const growthClock = localClock;

  // Convert growth clock value to clock state array for Clock component
  const getClockState = () => {
    const state = [false, false, false, false];
    for (let i = 0; i < growthClock && i < 4; i++) {
      state[i] = true;
    }
    return state;
  };

  // Handle clock state changes from Clock component
  const handleClockStateChange = (newState) => {
    const filledSections = newState.reduce(
      (count, section) => count + (section ? 1 : 0),
      0,
    );
    setLocalClock(filledSections);
    if (onGrowthClockChange) {
      onGrowthClockChange(filledSections);
    }
  };

  // Handle clock reset from right-click
  const handleClockReset = () => {
    setLocalClock(0);
    if (onGrowthClockChange) {
      onGrowthClockChange(0);
    }
  };

  const updateClock = (newValue) => {
    const clampedValue = Math.max(0, Math.min(4, newValue));
    setLocalClock(clampedValue);
    if (onGrowthClockChange) {
      onGrowthClockChange(clampedValue);
    }
  };

  // Get current effect based on growth clock sections
  const getCurrentEffect = () => {
    if (!currentMagiseed) return null;

    const magiseedTemplate = magiseeds.find(
      (m) => m.name === (currentMagiseed.key ?? currentMagiseed.name),
    );
    if (!magiseedTemplate) return null;

    const effectKey = Math.min(growthClock, 3);
    const effect =
      currentMagiseed.effects?.[effectKey] ||
      magiseedTemplate.effects?.[effectKey];

    return effect ? t(effect) : null;
  };

  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <LocalFlorist />
          </Icon>
          <Typography variant="h4">{t("magiseed_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ node: _n, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t("magiseed_details_1")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {/* GARDEN */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          minHeight: "40px",
          gap: "12px",
        }}
      >
        <Typography
          variant="h3"
          sx={{ flex: 1, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
        >
          {t("magiseed_garden")}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            flexShrink: 0,
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
          }}
        >
          {t("magiseed_growth_clock")}
        </Typography>
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "2px",
          }}
        >
          {isEditMode && (
            <>
              {!showInPlayerSheet && (
                <Tooltip title={t("Garden not shown in player sheet")}>
                  <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{ color: "#fff", p: "3px" }}
              >
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            sx={{ color: "#fff", p: "3px" }}
            onClick={() => {
              const seedName = currentMagiseed
                ? currentMagiseed.customName ||
                  t(currentMagiseed.key ?? currentMagiseed.name)
                : t("magiseed_no_magiseed");
              const effect = getCurrentEffect();
              sendDisplayMessage("spell", seedName, {
                speaker: "",
                tags: [`${t("magiseed_growth_clock")}: ${growthClock}/4`],
                description: effect || undefined,
              });
            }}
          >
            <LocalFlorist sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Box>
      </div>
      {/* Garden State and Growth Clock */}
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          display: "flex",
          alignItems: "stretch",
          minHeight: 80,
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        {/* Garden column */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            px: "17px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {currentMagiseed ? (
            <>
              <Typography sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
                {currentMagiseed.customName ||
                  t(currentMagiseed.key ?? currentMagiseed.name)}
              </Typography>
              {getCurrentEffect() && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block" }}
                >
                  {t("magiseed_current_effect")} (T = {growthClock})
                </Typography>
              )}
              {getCurrentEffect() && (
                <div style={{ fontSize: "0.9em", marginTop: "2px" }}>
                  <ReactMarkdown components={components}>
                    {getCurrentEffect()}
                  </ReactMarkdown>
                </div>
              )}
            </>
          ) : (
            <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
              {t("magiseed_no_magiseed")}
            </Typography>
          )}
        </Box>
        {/* Growth clock + actions strip */}
        <Box
          sx={{
            bgcolor: theme.primary,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: "12px",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              borderRadius: "50%",
              bgcolor: theme.ternary,
              p: "3px",
              flexShrink: 0,
              display: "flex",
            }}
          >
            <Clock
              numSections={4}
              size={56}
              state={getClockState()}
              setState={handleClockStateChange}
              isCharacterSheet={false}
              onReset={handleClockReset}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            {isEditMode ? (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <Box
                  component="input"
                  type="number"
                  value={growthClock}
                  onChange={(e) => updateClock(parseInt(e.target.value) || 0)}
                  sx={{
                    fontFamily: "Antonio",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    letterSpacing: "0.08em",
                    color: theme.white,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${theme.white}`,
                    outline: "none",
                    width: 36,
                    textAlign: "center",
                    lineHeight: 1,
                    "&::-webkit-inner-spin-button": { display: "none" },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: theme.white,
                    lineHeight: 1,
                  }}
                >
                  /4
                </Typography>
              </Box>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  letterSpacing: "0.08em",
                  color: theme.white,
                  lineHeight: 1,
                }}
              >
                {growthClock}/4
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: "4px" }}>
              <Button
                size="small"
                onClick={() => updateClock(growthClock - 1)}
                disabled={growthClock === 0}
                style={{
                  minWidth: 32,
                  height: 28,
                  padding: 0,
                  border: "none",
                  color: theme.primary,
                  backgroundColor: theme.white,
                  fontWeight: 800,
                }}
              >
                -
              </Button>
              <Button
                size="small"
                onClick={() => updateClock(growthClock + 1)}
                disabled={growthClock === 4}
                style={{
                  minWidth: 32,
                  height: 28,
                  padding: 0,
                  border: "none",
                  color: theme.primary,
                  backgroundColor: theme.white,
                  fontWeight: 800,
                }}
              >
                +
              </Button>
              <Button
                size="small"
                onClick={() => updateClock(0)}
                style={{
                  minWidth: 46,
                  height: 28,
                  padding: "0 4px",
                  border: "none",
                  color: theme.primary,
                  backgroundColor: theme.white,
                  fontWeight: 800,
                  fontSize: "0.7rem",
                }}
              >
                {t("Reset")}
              </Button>
            </Box>
          </Box>
          {onRoll && currentMagiseed && (
            <IconButton
              size="small"
              onClick={() => onRoll(currentMagiseed, growthClock)}
              sx={{ p: "2px", color: theme.white }}
            >
              <Casino sx={{ fontSize: "1.15rem" }} />
            </IconButton>
          )}
        </Box>
      </div>
      {/* Available Magiseeds */}
      {magiseed.magiseeds && magiseed.magiseeds.length > 0 && (
        <>
          <div
            style={{
              backgroundColor: theme.primary,
              fontFamily: "Antonio",
              fontWeight: "normal",
              fontSize: "1.1em",
              padding: "2px 17px",
              color: theme.white,
              textTransform: "uppercase",
            }}
          >
            <Typography variant="h3">
              {t("magiseed_available_magiseeds")}
            </Typography>
          </div>
          {magiseed.magiseeds.map((seed, index) => {
            const isExpanded = expandedMagiseeds.has(index);
            const seedKey = seed.key ?? seed.name;
            const magiseedTemplate = magiseeds.find((m) => m.name === seedKey);
            const isPlanted =
              currentMagiseed &&
              (currentMagiseed.key ?? currentMagiseed.name) === seedKey;
            const seedName = seed.customName || t(seedKey);
            const rangeStart =
              seed.rangeStart ?? magiseedTemplate?.rangeStart ?? 0;
            const rangeEnd = seed.rangeEnd ?? magiseedTemplate?.rangeEnd ?? 3;

            return (
              <Box
                key={index}
                sx={{
                  border: `1px solid ${isPlanted ? theme.primary : theme.secondary}`,
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {/* Row header */}
                <Box
                  onClick={() => toggleMagiseedExpansion(index)}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    minHeight: 44,
                    fontSize: "0.9rem",
                    background:
                      index % 2 === 0
                        ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                        : "transparent",
                    borderBottom: isExpanded
                      ? `1px solid ${theme.secondary}`
                      : "none",
                    cursor: "pointer",
                    "&:hover": { filter: "brightness(0.97)" },
                  }}
                >
                  {/* Label area */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      px: "10px",
                      py: "4px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: "Antonio",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        lineHeight: 1.3,
                      }}
                    >
                      {seedName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ ...bodyTextSx, color: "text.secondary", fontWeight: "bold" }}
                    >
                      {`T: ${rangeStart}–${rangeEnd}`}
                      {isPlanted && (
                        <>
                          {" "}
                          ·{" "}
                          <span style={{ color: theme.primary }}>
                            {t("magiseed_plant_in_garden")}
                          </span>
                        </>
                      )}
                    </Typography>
                  </Box>
                  {/* Actions area */}
                  {isEditMode && (
                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        bgcolor: theme.primary,
                        display: "flex",
                        alignItems: "center",
                        px: "6px",
                        gap: 0.25,
                        flexShrink: 0,
                        "& .MuiIconButton-root": {
                          p: "2px",
                          width: 32,
                          height: 32,
                          color: theme.white,
                        },
                        "& .MuiSvgIcon-root": { fontSize: "1.15rem" },
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() =>
                          onMagiseedChange &&
                          onMagiseedChange(isPlanted ? null : seed, index)
                        }
                        style={{
                          minWidth: 64,
                          height: 32,
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          border: "none",
                          color: theme.primary,
                          backgroundColor: theme.white,
                        }}
                      >
                        {isPlanted
                          ? t("magiseed_remove_from_garden")
                          : currentMagiseed
                            ? t("magiseed_graft_in_garden")
                            : t("magiseed_plant_in_garden")}
                      </Button>
                    </Box>
                  )}
                </Box>

                <Collapse in={isExpanded}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: "italic", mb: 1.5 }}
                    >
                      {seed.description
                        ? t(seed.description)
                        : (magiseedTemplate &&
                            t(magiseedTemplate.description)) ||
                          t("No description available")}
                    </Typography>

                    {/* Effects */}
                    {[...Array(rangeEnd - rangeStart + 1)].map((_, i) => {
                      const section = rangeStart + i;
                      const effect =
                        seed.effects?.[section] ||
                        magiseedTemplate?.effects?.[section];
                      if (!effect) return null;
                      return (
                        <Box key={section} sx={{ mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: "bold", color: theme.primary }}
                          >
                            T = {section}:
                          </Typography>
                          <Box sx={{ ml: 2, mt: 0.25, ...bodyTextSx }}>
                            <ReactMarkdown components={components}>
                              {t(effect)}
                            </ReactMarkdown>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </>
      )}
    </>
  );
}

export default function SpellMagiseed(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellMagiseed {...props} />
    </ThemeProvider>
  );
}
