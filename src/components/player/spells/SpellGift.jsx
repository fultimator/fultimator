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
} from "@mui/material";
import { VisibilityOff, ExpandMore, CardGiftcard } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import Clock from "../../player/playerSheet/Clock";

function ThemedSpellGift({ gift, onEditGifts, isEditMode, onEdit, onClockChange }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    gift.showInPlayerSheet || gift.showInPlayerSheet === undefined;

  const clock = gift.clock || 0;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p: ({ node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  // Convert clock value to clock state array for Clock component
  const getClockState = () => {
    const state = [false, false, false, false];
    for (let i = 0; i < clock && i < 4; i++) {
      state[i] = true;
    }
    return state;
  };

  // Clock progress (0-4 sections)
  const getClockProgress = () => {
    return (clock / 4) * 100;
  };

  // Handle clock state changes from Clock component
  const handleClockStateChange = (newState) => {
    const filledSections = newState.reduce((count, section) => count + (section ? 1 : 0), 0);
    if (onClockChange) {
      onClockChange(filledSections);
    }
  };

  // Handle clock reset from right-click
  const handleClockReset = () => {
    if (onClockChange) {
      onClockChange(0);
    }
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <CardGiftcard />
          </Icon>
          <Typography variant="h4">{t("esper_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("esper_details_1")}</ReactMarkdown>
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
            {t("esper_settings_button")}
          </Button>
          <Button
            onClick={onEditGifts}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("esper_settings_modal")}
          </Button>
          {!showInPlayerSheet && (
            <Tooltip title={t("Gifts not shown in player sheet")}>
              <Icon>
                <VisibilityOff style={{ color: "black" }} />
              </Icon>
            </Tooltip>
          )}
        </Grid>
      )}

      {/* GIFTS AND CLOCK HEADER */}
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
              {t("esper_psychic_gifts")}
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
              {t("esper_brainwave_clock")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {/* CLOCK SECTION */}
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "10px 17px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
          marginBottom: "10px",
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
            <Typography variant="body2">
              {t("esper_brainwave_clock")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Brainwave Clock Visual */}
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
                  {clock}/4
                </Typography>
              </div>

              {/* Linear Progress Bar */}
              <div style={{ flex: 1, minWidth: '80px' }}>
                <LinearProgress
                  variant="determinate"
                  value={getClockProgress()}
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
                      onClick={() => onClockChange && onClockChange(Math.max(0, clock - 1))}
                      disabled={clock === 0}
                    >
                      -
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onClockChange && onClockChange(Math.min(4, clock + 1))}
                      disabled={clock === 4}
                    >
                      +
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onClockChange && onClockChange(0)}
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

      {/* GIFTS HEADER */}
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
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs={8}
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
              {t("esper_gift_name")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={4}
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
              {t("esper_events")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {gift.gifts && gift.gifts.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("No gifts available")}
        </Typography>
      ) : (
        gift.gifts &&
        gift.gifts.map((gft, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                padding: "3px 17px",
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid ${theme.secondary}`,
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs={8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    style={{ flexGrow: 1, marginRight: "5px" }}
                  >
                    {gft.name === "gift_custom_name"
                      ? gft.customName
                      : t(gft.name)}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={4}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <ReactMarkdown components={components}>
                    {gft.name === "gift_custom_name"
                      ? gft.event
                      : gft.event && gft.event.startsWith("esper_event_") 
                        ? t(gft.event)
                        : gft.event}
                  </ReactMarkdown>
                </Grid>
              </Grid>
              {isEditMode && (
                <Grid
                  item
                  xs
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    minHeight: 34,
                  }}
                ></Grid>
              )}
            </div>
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                padding: "3px 17px",
                marginBottom: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <ReactMarkdown components={components}>
                    {gft.name === "gift_custom_name"
                      ? gft.effect
                      : t(gft.effect)}
                  </ReactMarkdown>
                </Grid>
              </Grid>
            </Grid>
          </React.Fragment>
        ))
      )}
    </>
  );
}

export default function SpellGift(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellGift {...props} />
    </ThemeProvider>
  );
}