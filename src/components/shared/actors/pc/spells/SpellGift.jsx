import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { VisibilityOff, ExpandMore, CardGiftcard, Edit } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import Clock from "/src/components/shared/actors/pc/playerSheet/optional/Clock";

function ThemedSpellGift({ gift, isEditMode, onEdit, onClockChange }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const [localClock, setLocalClock] = useState(gift.clock || 0);

  useEffect(() => {
    setLocalClock(gift.clock || 0);
  }, [gift.clock]);

  const showInPlayerSheet =
    gift.showInPlayerSheet || gift.showInPlayerSheet === undefined;

  const clock = localClock;

  const inlineStyles = { margin: 0, padding: 0 };
  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  const getClockState = () => {
    const state = [false, false, false, false];
    for (let i = 0; i < clock && i < 4; i++) {
      state[i] = true;
    }
    return state;
  };

  const handleClockStateChange = (newState) => {
    const filledSections = newState.reduce(
      (count, section) => count + (section ? 1 : 0),
      0,
    );
    setLocalClock(filledSections);
    if (onClockChange) onClockChange(filledSections);
  };

  const handleClockReset = () => {
    setLocalClock(0);
    if (onClockChange) onClockChange(0);
  };

  const updateClock = (newValue) => {
    const clampedValue = Math.max(0, Math.min(4, newValue));
    setLocalClock(clampedValue);
    if (onClockChange) onClockChange(clampedValue);
  };

  return (
    <>
      <Accordion disableGutters elevation={0} square sx={{ borderBottom: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <CardGiftcard />
          </Icon>
          <Typography variant="h4">{t("esper_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown components={{ p: ({ _node, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>
            {t("esper_details_1")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>

      {/* HEADER */}
      <Box
        sx={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          px: "17px",
          py: "2px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          minHeight: "40px",
          gap: "12px",
        }}
      >
        <Typography variant="h3" sx={{ flex: 1, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
          {t("esper_psychic_gifts")}
        </Typography>
        <Typography variant="h3" sx={{ flexShrink: 0, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
          {t("esper_brainwave_clock")}
        </Typography>
        <Box sx={{ width: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          {isEditMode && (
            <>
              {!showInPlayerSheet && (
                <Tooltip title={t("Gifts not shown in player sheet")}>
                  <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
                </Tooltip>
              )}
              <IconButton size="small" onClick={onEdit} sx={{ color: "#fff", p: "3px" }}>
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* BRAINWAVE CLOCK ROW */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          minHeight: 80,
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
          mb: "10px",
        }}
      >
        {/* Left: label */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            px: "17px",
            background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
            {t("esper_brainwave_clock")}
          </Typography>
        </Box>

        {/* Right: clock strip */}
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
          <Box sx={{ borderRadius: "50%", bgcolor: theme.ternary, p: "3px", flexShrink: 0, display: "flex" }}>
            <Clock
              numSections={4}
              size={56}
              state={getClockState()}
              setState={handleClockStateChange}
              isCharacterSheet={false}
              onReset={handleClockReset}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
            {isEditMode ? (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <Box
                  component="input"
                  type="number"
                  value={clock}
                  onChange={(e) => updateClock(parseInt(e.target.value) || 0)}
                  sx={{
                    fontFamily: "Antonio", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.08em",
                    color: theme.white, background: "transparent", border: "none",
                    borderBottom: `2px solid ${theme.white}`, outline: "none",
                    width: 36, textAlign: "center", lineHeight: 1,
                    "&::-webkit-inner-spin-button": { display: "none" },
                  }}
                />
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "1.2rem", color: theme.white, lineHeight: 1 }}>
                  /4
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.08em", color: theme.white, lineHeight: 1 }}>
                {clock}/4
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: "4px" }}>
              <Button size="small" onClick={() => updateClock(clock - 1)} disabled={clock === 0}
                style={{ minWidth: 32, height: 28, padding: 0, border: "none", color: theme.primary, backgroundColor: theme.white, fontWeight: 800 }}>-</Button>
              <Button size="small" onClick={() => updateClock(clock + 1)} disabled={clock === 4}
                style={{ minWidth: 32, height: 28, padding: 0, border: "none", color: theme.primary, backgroundColor: theme.white, fontWeight: 800 }}>+</Button>
              <Button size="small" onClick={() => updateClock(0)}
                style={{ minWidth: 46, height: 28, padding: "0 4px", border: "none", color: theme.primary, backgroundColor: theme.white, fontWeight: 800, fontSize: "0.7rem" }}>{t("Reset")}</Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* GIFTS TABLE HEADER */}
      <Box
        sx={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          px: "17px",
          py: "2px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          minHeight: "40px",
        }}
      >
        <Box sx={{ flex: "0 0 66.67%", display: "flex", alignItems: "center" }}>
          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
            {t("esper_psychic_gifts")}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
            {t("esper_events")}
          </Typography>
        </Box>
      </Box>

      {/* GIFTS LIST */}
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
            {/* Gift name + event row */}
            <Box
              sx={{
                background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                px: "17px",
                py: "3px",
                display: "flex",
                alignItems: "center",
                borderTop: `1px solid ${theme.secondary}`,
                borderBottom: `1px solid ${theme.secondary}`,
                minHeight: "36px",
              }}
            >
              <Box sx={{ flex: "0 0 66.67%", display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {gft.name === "esper_gift_custom_name" ? gft.customName : t(gft.name)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <ReactMarkdown components={components}>
                  {gft.name === "gift_custom_name"
                    ? gft.event
                    : gft.event && gft.event.startsWith("esper_event_")
                      ? t(gft.event)
                      : gft.event}
                </ReactMarkdown>
              </Box>
            </Box>
            {/* Effect row */}
            <Box
              sx={{
                px: "17px",
                py: "3px",
                mb: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <ReactMarkdown components={components}>
                {gft.name === "gift_custom_name" ? gft.effect : t(gft.effect)}
              </ReactMarkdown>
            </Box>
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
