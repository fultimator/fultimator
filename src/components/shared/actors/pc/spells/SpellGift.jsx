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
import {
  VisibilityOff,
  ExpandMore,
  CardGiftcard,
  Edit,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import Clock from "/src/components/shared/actors/pc/playerSheet/Clock";
import { useNumericClock } from "/src/hooks/useClock";

function ThemedSpellGift({ gift, isEditMode, onEdit, onClockChange }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

  const [localClock, setLocalClock] = useState(gift.clock || 0);

  useEffect(() => {
    setLocalClock(gift.clock || 0);
  }, [gift.clock]);

  const showInPlayerSheet =
    gift.showInPlayerSheet || gift.showInPlayerSheet === undefined;

  const { state: clockState, filledCount: clock, increment, decrement, reset: resetClock } =
    useNumericClock(4, localClock, (val) => {
      setLocalClock(val);
      if (onClockChange) onClockChange(val);
    });

  const inlineStyles = { margin: 0, padding: 0 };
  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  const getGiftKey = (gft) => gft.key || gft.name || "esper_gift_custom_name";
  const isCustomGift = (gft) => getGiftKey(gft) === "esper_gift_custom_name";
  const getGiftName = (gft) =>
    isCustomGift(gft) ? gft.customName || t("Custom") : t(getGiftKey(gft));
  const getGiftEvent = (gft) => {
    if (isCustomGift(gft)) return gft.event || "-";
    return gft.event && gft.event.startsWith("esper_event_")
      ? t(gft.event)
      : gft.event || "-";
  };
  const getGiftEffect = (gft) =>
    isCustomGift(gft) ? gft.effect || "" : t(gft.effect);


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
            <CardGiftcard />
          </Icon>
          <Typography variant="h4">{t("esper_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ _node, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
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
        <Typography
          variant="h3"
          sx={{ flex: 1, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
        >
          {t("esper_psychic_gifts")}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            flexShrink: 0,
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
          }}
        >
          {t("esper_brainwave_clock")}
        </Typography>
        <Box
          sx={{
            width: 34,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {isEditMode && (
            <>
              {!showInPlayerSheet && (
                <Tooltip title={t("Gifts not shown in player sheet")}>
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
              state={clockState}
              setState={(newState) => {
                const val = newState.filter(Boolean).length;
                setLocalClock(val);
                if (onClockChange) onClockChange(val);
              }}
              isCharacterSheet={false}
              onReset={resetClock}
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
                  value={clock}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(4, parseInt(e.target.value) || 0));
                    setLocalClock(val);
                    if (onClockChange) onClockChange(val);
                  }}
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
                {clock}/4
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: "4px" }}>
              <Button
                size="small"
                onClick={decrement}
                disabled={clock === 0}
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
                onClick={increment}
                disabled={clock === 4}
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
                onClick={resetClock}
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
        <Box sx={{ flex: "0 0 24%", display: "flex", alignItems: "center" }}>
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            {t("esper_psychic_gifts")}
          </Typography>
        </Box>
        <Box sx={{ flex: "0 0 32%", display: "flex", alignItems: "center" }}>
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            {t("esper_events")}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            {t("Effect")}
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
          <Box
            key={`${getGiftKey(gft)}-${i}`}
            sx={{
              background:
                i % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : "transparent",
              px: "17px",
              py: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "18px",
              borderTop: `1px solid ${theme.secondary}`,
              borderBottom: `1px solid ${theme.secondary}`,
              minHeight: 44,
              fontSize: "0.9rem",
            }}
          >
            <Box
              sx={{
                flex: "0 0 24%",
                minWidth: 0,
              }}
            >
              <Typography sx={{ ...bodyTextSx, fontWeight: "bold" }}>
                {getGiftName(gft)}
              </Typography>
            </Box>
            <Box sx={{ flex: "0 0 32%", minWidth: 0 }}>
              <Box sx={bodyTextSx}>
                <ReactMarkdown components={components}>
                  {getGiftEvent(gft)}
                </ReactMarkdown>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, ...bodyTextSx }}>
              <ReactMarkdown components={components}>
                {getGiftEffect(gft)}
              </ReactMarkdown>
            </Box>
          </Box>
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
