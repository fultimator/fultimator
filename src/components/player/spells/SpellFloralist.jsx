import React from "react";
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
} from "@mui/material";
import { VisibilityOff, ExpandMore, Eco, Circle, CheckCircle } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { magiseeds } from "../../../libs/floralistMagiseedData";

function ThemedSpellFloralist({ floralist, onEditMagiseeds, isEditMode, onEdit, onMagiseedChange, onGrowthClockChange }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    floralist.showInPlayerSheet || floralist.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ ...props }) => <p style={inlineStyles} {...props} />,
  };

  // Get current magiseed in garden
  const currentMagiseed = floralist.currentMagiseed;
  const growthClock = floralist.growthClock || 0;

  // Growth clock progress (0-4 sections)
  const getGrowthClockProgress = () => {
    return (growthClock / 4) * 100;
  };

  // Get current effect based on growth clock sections
  const getCurrentEffect = () => {
    if (!currentMagiseed || growthClock === 0) return null;
    
    const magiseedTemplate = magiseeds.find(m => m.name === currentMagiseed.name);
    if (!magiseedTemplate) return null;

    const effectKey = Math.min(growthClock, 4);
    const effect = currentMagiseed.effects?.[effectKey] || magiseedTemplate.effects?.[effectKey];
    
    return effect ? t(effect) : null;
  };

  // Render growth clock sections
  const renderGrowthClock = () => {
    const sections = [];
    for (let i = 1; i <= 4; i++) {
      const filled = i <= growthClock;
      sections.push(
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mx: 0.5 }}>
          {filled ? (
            <CheckCircle sx={{ color: theme.primary, fontSize: '1.2rem' }} />
          ) : (
            <Circle sx={{ color: theme.secondary, fontSize: '1.2rem' }} />
          )}
        </Box>
      );
    }
    return sections;
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Eco />
          </Icon>
          <Typography variant="h4">{t("floralist_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("floralist_details_1")}</ReactMarkdown>
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
            {t("floralist_settings_button")}
          </Button>
          <Button
            onClick={onEditMagiseeds}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("floralist_edit_magiseeds_button")}
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
              {t("floralist_garden")}
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
              {t("floralist_growth_clock")}
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
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75em" }}>
                  {t(`floralist_magiseed_type_${currentMagiseed.type || 'custom'}`)}
                </Typography>
              </div>
            ) : (
              <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                {t("floralist_no_magiseed")}
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Typography variant="body2" sx={{ marginRight: 1 }}>
                {growthClock}/4
              </Typography>
              {renderGrowthClock()}
            </div>
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
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
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
          </Grid>
        </Grid>
      </div>

      {/* Current Effect */}
      {currentMagiseed && growthClock > 0 && (
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
              {t("floralist_current_effect")} (T = {growthClock})
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
                {getCurrentEffect() || t("floralist_no_effect")}
              </ReactMarkdown>
            </div>
            {(() => {
              const magiseedTemplate = magiseeds.find(m => m.name === currentMagiseed.name);
              const isEndOfTurn = magiseedTemplate?.endOfTurnEffect || currentMagiseed.endOfTurnEffect;
              const isPassive = magiseedTemplate?.passive || currentMagiseed.passive;
              
              return (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1, display: 'block' }}>
                  {isEndOfTurn ? t("floralist_end_of_turn_effect") : isPassive ? t("floralist_passive_effect") : t("floralist_triggered_effect")}
                </Typography>
              );
            })()}
          </div>
        </>
      )}

      {/* Available Magiseeds */}
      {floralist.magiseeds && floralist.magiseeds.length > 0 && (
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
              {t("floralist_available_magiseeds")}
            </Typography>
          </div>
          {floralist.magiseeds.map((magiseed, index) => (
            <div
              key={index}
              style={{
                padding: "8px 17px",
                borderBottom: `1px solid ${theme.secondary}`,
                backgroundColor: magiseed === currentMagiseed ? theme.ternary + "20" : "transparent",
                borderLeft: magiseed === currentMagiseed ? `4px solid ${theme.primary}` : "none",
              }}
            >
              <Grid container alignItems="center">
                <Grid item xs={8}>
                  <Typography fontWeight={magiseed === currentMagiseed ? "bold" : "normal"}>
                    {magiseed.customName || t(magiseed.name)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t(`floralist_magiseed_type_${magiseed.type || 'custom'}`)}
                  </Typography>
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                  {isEditMode && (
                    <Button
                      size="small"
                      variant={magiseed === currentMagiseed ? "contained" : "outlined"}
                      color={magiseed === currentMagiseed ? "success" : "primary"}
                      onClick={() => onMagiseedChange && onMagiseedChange(magiseed === currentMagiseed ? null : magiseed)}
                      disabled={currentMagiseed && magiseed !== currentMagiseed}
                    >
                      {magiseed === currentMagiseed ? t("floralist_remove_from_garden") : t("floralist_plant_in_garden")}
                    </Button>
                  )}
                  {!isEditMode && magiseed === currentMagiseed && (
                    <Typography
                      sx={{
                        color: "success.main",
                        fontWeight: "bold",
                        fontSize: "0.85em"
                      }}
                    >
                      {t("floralist_in_garden")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default function SpellFloralist(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellFloralist {...props} />
    </ThemeProvider>
  );
}