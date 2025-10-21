import React, { useState } from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  LinearProgress,
  Box,
  Collapse,
  Divider,
} from "@mui/material";
import { VisibilityOff, ExpandMore, LocalFlorist, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { availableMagiseeds } from "../../../libs/floralistMagiseedData";
import Clock from "../../player/playerSheet/Clock";

function ThemedSpellMagiseed({ magiseed, onEditMagiseeds, isEditMode, onEdit, onMagiseedChange, onGrowthClockChange }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  
  const [expandedMagiseeds, setExpandedMagiseeds] = useState(new Set());

  const toggleMagiseedExpansion = (index) => {
    setExpandedMagiseeds(prev => {
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
  const growthClock = magiseed.growthClock || 0;

  // Growth clock progress (0-4 sections)
  const getGrowthClockProgress = () => {
    return (growthClock / 4) * 100;
  };

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
    const filledSections = newState.reduce((count, section) => count + (section ? 1 : 0), 0);
    if (onGrowthClockChange) {
      onGrowthClockChange(filledSections);
    }
  };

  // Handle clock reset from right-click
  const handleClockReset = () => {
    if (onGrowthClockChange) {
      onGrowthClockChange(0);
    }
  };

  // Get current effect based on growth clock sections
  const getCurrentEffect = () => {
    if (!currentMagiseed) return null;
    
    const magiseedTemplate = availableMagiseeds.find(m => m.name === currentMagiseed.name);
    if (!magiseedTemplate) return null;

    const effectKey = Math.min(growthClock, 3);
    const effect = currentMagiseed.effects?.[effectKey] || magiseedTemplate.effects?.[effectKey];
    
    return effect ? t(effect) : null;
  };


  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <LocalFlorist />
          </Icon>
          <Typography variant="h4">{t("magiseed_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("magiseed_details_1")}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      
      {isEditMode && (
        <Grid
          item
          xs
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Button
            onClick={onEdit}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("magiseed_settings_button")}
          </Button>
          <Button
            onClick={onEditMagiseeds}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("magiseed_edit_magiseeds_button")}
          </Button>
          {!showInPlayerSheet && (
            <Tooltip title={t("Garden not shown in player sheet")}>
              <Icon>
                <VisibilityOff style={{ color: "black" }} />
              </Icon>
            </Tooltip>
          )}
        </Grid>
      )}

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
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magiseed_garden")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magiseed_growth_clock")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {/* Garden State and Growth Clock */}
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "10px 17px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {currentMagiseed ? (
              <div>
                <Typography fontWeight="bold" style={{ marginBottom: "4px" }}>
                  {currentMagiseed.customName || t(currentMagiseed.name)}
                </Typography>
              </div>
            ) : (
              <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                {t("magiseed_no_magiseed")}
              </Typography>
            )}
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Growth Clock Visual */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Clock
                  numSections={4}
                  size={60}
                  state={getClockState()}
                  setState={isEditMode ? handleClockStateChange : undefined}
                  isCharacterSheet={!isEditMode}
                  onReset={isEditMode ? handleClockReset : undefined}
                />
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  {growthClock}/4
                </Typography>
              </div>
              
              {/* Linear Progress Bar */}
              <div style={{ flex: 1, minWidth: '80px' }}>
                <LinearProgress
                  variant="determinate"
                  value={getGrowthClockProgress()}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.secondary + '40',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.primary,
                    },
                  }}
                />
                {isEditMode && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onGrowthClockChange && onGrowthClockChange(Math.max(0, growthClock - 1))}
                      disabled={growthClock === 0}
                    >
                      -
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onGrowthClockChange && onGrowthClockChange(Math.min(4, growthClock + 1))}
                      disabled={growthClock === 4}
                    >
                      +
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onGrowthClockChange && onGrowthClockChange(0)}
                    >
                      {t("Reset")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
      </div>

      {/* Current Effect */}
      {currentMagiseed && getCurrentEffect() && (
        <>
          <div
            style={{
              backgroundColor: theme.secondary,
              fontFamily: "Antonio",
              fontWeight: "normal",
              fontSize: "0.9em",
              padding: "2px 17px",
              color: theme.white,
              textTransform: "uppercase",
            }}
          >
            <Typography variant="h3">
              {t("magiseed_current_effect")} (T = {growthClock})
            </Typography>
          </div>
          <div
            style={{
              padding: "10px 17px",
              borderBottom: `1px solid ${theme.secondary}`,
              backgroundColor: theme.ternary + "20",
              borderLeft: `4px solid ${theme.primary}`,
            }}
          >
            <Typography fontWeight="bold" sx={{ marginBottom: 1 }}>
              {currentMagiseed.customName || t(currentMagiseed.name)}
            </Typography>
            <div style={{ fontSize: "0.95em" }}>
              <ReactMarkdown components={components}>
                {getCurrentEffect() || t("magiseed_no_effect")}
              </ReactMarkdown>
            </div>
          </div>
        </>
      )}

      {/* Available Magiseeds */}
      {magiseed.availableMagiseeds && magiseed.availableMagiseeds.length > 0 && (
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
              marginTop: "10px",
            }}
          >
            <Typography variant="h3">
              {t("magiseed_available_magiseeds")}
            </Typography>
          </div>
          {magiseed.availableMagiseeds.map((seed, index) => {
            const isExpanded = expandedMagiseeds.has(index);
            const magiseedTemplate = availableMagiseeds.find(m => m.name === seed.name);
            
            return (
              <div key={index}>
                <div
                  style={{
                    padding: "8px 17px",
                    borderBottom: `1px solid ${theme.secondary}`,
                    backgroundColor: currentMagiseed && seed.name === currentMagiseed.name ? theme.ternary + "20" : "transparent",
                    borderLeft: currentMagiseed && seed.name === currentMagiseed.name ? `4px solid ${theme.primary}` : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleMagiseedExpansion(index)}
                >
                  <Grid container alignItems="center">
                    <Grid item xs={1}>
                      {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography fontWeight={currentMagiseed && seed.name === currentMagiseed.name ? "bold" : "normal"}>
                        {seed.customName || t(seed.name)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} style={{ textAlign: 'right' }}>
                      {isEditMode && (
                        <Button
                          size="small"
                          variant={currentMagiseed && seed.name === currentMagiseed.name ? "contained" : "outlined"}
                          color={currentMagiseed && seed.name === currentMagiseed.name ? "success" : "primary"}
                          onClick={(e) => {
                            e.stopPropagation();
                            const isCurrentSeed = currentMagiseed && seed.name === currentMagiseed.name;
                            onMagiseedChange && onMagiseedChange(isCurrentSeed ? null : seed);
                          }}
                        >
                          {currentMagiseed && seed.name === currentMagiseed.name
                            ? t("magiseed_remove_from_garden") 
                            : currentMagiseed 
                              ? t("magiseed_graft_in_garden")
                              : t("magiseed_plant_in_garden")}
                        </Button>
                      )}
                      {!isEditMode && currentMagiseed && seed.name === currentMagiseed.name && (
                        <Typography
                          sx={{
                            color: "success.main",
                            fontWeight: "bold",
                            fontSize: "0.85em"
                          }}
                        >
                          ⚡ {t("magiseed_in_garden")}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </div>
                
                <Collapse in={isExpanded}>
                  <div
                    style={{
                      padding: "16px 17px",
                      backgroundColor: theme.ternary + "10",
                      borderBottom: `1px solid ${theme.secondary}`,
                    }}
                  >
                    {/* Description */}
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                      {seed.description || (magiseedTemplate && t(magiseedTemplate.description)) || t("No description available")}
                    </Typography>
                    
                    {/* Effect Range */}
                    {seed.rangeStart !== undefined && seed.rangeEnd !== undefined && (
                      <>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {t("magiseed_effect_range")}:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          T = {seed.rangeStart} to T = {seed.rangeEnd}
                        </Typography>
                      </>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Effects by growth clock section */}
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      {t("magiseed_effect_by_growth_clock")}
                    </Typography>
                    
                    {(() => {
                      const rangeStart = seed.rangeStart ?? (magiseedTemplate?.rangeStart ?? 0);
                      const rangeEnd = seed.rangeEnd ?? (magiseedTemplate?.rangeEnd ?? 3);
                      const sections = [];
                      for (let i = rangeStart; i <= rangeEnd; i++) {
                        sections.push(i);
                      }
                      return sections;
                    })().map((section) => {
                      const effect = seed.effects?.[section] || (magiseedTemplate && magiseedTemplate.effects?.[section]);
                      if (!effect) return null;
                      
                      return (
                        <Box key={section} sx={{ mb: 1.5 }}>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: theme.primary }}>
                            T = {section}:
                          </Typography>
                          <Box sx={{ ml: 2, mt: 0.5 }}>
                            <ReactMarkdown components={components}>
                              {t(effect)}
                            </ReactMarkdown>
                          </Box>
                        </Box>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
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