import React from "react";
import {
  Typography,
  ThemeProvider,
  Icon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";
import {
  ExpandMore,
  FlashOn,
  Edit,
  Casino,
  Message,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import { buildInvokerAvailableInvocations } from "/src/libs/player/invokerUtils";
import {
  resolveWellsprings,
  affinityIconSrc,
} from "/src/libs/player/wellsprings";

function ThemedSpellInvoker({
  invoker,
  isEditMode,
  onEdit,
  onRoll,
  onWellspringToggle,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

  const inlineStyles = { margin: 0, padding: 0 };
  const components = {
    p: (props) => <p style={inlineStyles} {...props} />,
  };

  const invokerTracker = invoker.tracker || {};
  const customWellsprings = invoker.customWellsprings || [];
  const customInvocations = invoker.invocations || [];
  const alwaysActiveWellsprings = invoker.alwaysActiveWellsprings || [];
  const innerWellspringEnabled =
    invoker.innerWellspring || invokerTracker.innerWellspring || false;
  const chosenWellspring =
    invoker.chosenWellspring || invokerTracker.chosenWellspring || "";
  const allWellsprings = resolveWellsprings(customWellsprings);

  const availableInvocations =
    invoker.availableInvocations && invoker.availableInvocations.length > 0
      ? invoker.availableInvocations
      : buildInvokerAvailableInvocations(invoker.skillLevel, customInvocations);

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
            <FlashOn />
          </Icon>
          <Typography variant="h4">{t("invoker_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ _node, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t("invoker_details_1")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>

      {/* Wellspring Selection */}
      <Box
        sx={{
          padding: "8px 12px",
          backgroundColor: theme.ternary,
          marginBottom: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ marginBottom: 0.5 }}>
            {t("invoker_invocation_active_wellspring")} (
            {invokerTracker.activeWellsprings?.length || 0}/2)
            {innerWellspringEnabled && (
              <Typography
                component="span"
                sx={{
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  marginLeft: 1,
                  color: "#4CAF50",
                }}
              >
                + {t("invoker_invocation_inner")}:{" "}
                {allWellsprings.find((w) => w.key === chosenWellspring)
                  ?.label ?? chosenWellspring}
              </Typography>
            )}
            {alwaysActiveWellsprings.length > 0 && (
              <Typography
                component="span"
                sx={{
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  marginLeft: 1,
                  color: "#4CAF50",
                }}
              >
                + {t("invoker_always_active")}:{" "}
                {alwaysActiveWellsprings
                  .map(
                    (val) =>
                      allWellsprings.find((w) => w.key === val)?.label ?? val,
                  )
                  .join(", ")}
              </Typography>
            )}
            <Typography
              component="span"
              sx={{ fontSize: "0.8rem", fontStyle: "italic", marginLeft: 1 }}
            >
              ({t("invoker_sl")} {invoker.skillLevel || "Not Set"}:{" "}
              {invoker.skillLevel === 1
                ? t("invoker_select_sl_1")
                : invoker.skillLevel === 2
                  ? t("invoker_select_sl_2")
                  : invoker.skillLevel === 3
                    ? t("invoker_select_sl_3")
                    : t("invoker_select_sl")}
              )
            </Typography>
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {allWellsprings.map((wellspring) => {
              const isActive =
                invokerTracker.activeWellsprings?.includes(wellspring.key) ||
                false;
              const isInnerWellspring =
                innerWellspringEnabled && chosenWellspring === wellspring.key;
              const isAlwaysActive = alwaysActiveWellsprings.includes(
                wellspring.key,
              );
              const isLocked = isInnerWellspring || isAlwaysActive;
              const isSelected = isActive || isLocked;
              const lockColor = isInnerWellspring ? "#4CAF50" : "#FF9800";
              const lockGlow = isInnerWellspring
                ? "0 0 0 3px #4CAF50, 0 0 8px rgba(76, 175, 80, 0.4)"
                : "0 0 0 3px #FF9800, 0 0 8px rgba(255, 152, 0, 0.4)";

              return (
                <Box
                  key={wellspring.key}
                  component={isEditMode && !isLocked ? "button" : "div"}
                  type={isEditMode && !isLocked ? "button" : undefined}
                  onClick={
                    isEditMode && !isLocked && onWellspringToggle
                      ? () => onWellspringToggle(wellspring.key)
                      : undefined
                  }
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "16px",
                    border: "2px solid",
                    borderColor: isLocked ? lockColor : wellspring.color,
                    borderWidth: isSelected ? "2px" : "1px",
                    backgroundColor: isSelected
                      ? wellspring.color
                      : "transparent",
                    fontWeight: isSelected ? "bold" : "normal",
                    fontSize: "0.8125rem",
                    fontFamily: (theme) => theme.typography.fontFamily,
                    cursor: isEditMode && !isLocked ? "pointer" : "default",
                    transition: "background-color 0.15s, border-color 0.15s",
                    ...(isLocked && { boxShadow: lockGlow }),
                    "&:hover": isEditMode && !isLocked ? { opacity: 0.85 } : {},
                  }}
                >
                  <img
                    src={affinityIconSrc(wellspring.icon)}
                    width={18}
                    height={18}
                    style={{ objectFit: "contain" }}
                    alt={wellspring.label ?? wellspring.key}
                  />
                  <span
                    style={{
                      color: isSelected ? wellspring.textColor : "inherit",
                    }}
                  >
                    {t(`invoker_${wellspring.key.toLowerCase()}`) !==
                    `invoker_${wellspring.key.toLowerCase()}`
                      ? t(`invoker_${wellspring.key.toLowerCase()}`)
                      : (wellspring.label ?? wellspring.key)}
                  </span>
                </Box>
              );
            })}
          </Box>

          {isEditMode && invokerTracker.activeWellsprings?.length !== 2 && (
            <Typography
              variant="body2"
              sx={{ color: theme.primary, fontStyle: "italic", marginTop: 1 }}
            >
              {t(
                "Select exactly 2 wellsprings to determine available invocations",
              )}
              {innerWellspringEnabled && (
                <Typography
                  component="span"
                  sx={{ display: "block", color: "#4CAF50" }}
                >
                  {t("invoker_inner_wellspring_always_available").replace(
                    "{wellspring}",
                    chosenWellspring,
                  )}
                </Typography>
              )}
              {alwaysActiveWellsprings.length > 0 && (
                <Typography
                  component="span"
                  sx={{ display: "block", color: "#4CAF50" }}
                >
                  + {t("invoker_always_active")}:{" "}
                  {alwaysActiveWellsprings.join(", ")}
                </Typography>
              )}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Invocations Table */}
      <Box
        sx={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          px: "17px",
          py: "2px",
          borderLeft: "4px solid transparent",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          minHeight: "40px",
        }}
      >
        <Box sx={{ flex: "0 0 25%", display: "flex", alignItems: "center" }}>
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            {t("Invocation")}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: "0 0 16.67%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            {t("Wellspring")}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: "0 0 16.67%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            {t("Type")}
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
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#fff", p: "3px" }}
            >
              <Edit sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {availableInvocations.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("invoker_no_invocation_warning")}
        </Typography>
      ) : (
        availableInvocations
          .filter((invocation) => {
            if (
              invokerTracker.activeWellsprings?.includes(invocation.wellspring)
            )
              return true;
            if (
              innerWellspringEnabled &&
              chosenWellspring === invocation.wellspring
            )
              return true;
            if (alwaysActiveWellsprings.includes(invocation.wellspring))
              return true;
            return false;
          })
          .map((invocation, i) => {
            const wellspringEntry = allWellsprings.find(
              (w) => w.key === invocation.wellspring,
            );
            const borderColor = wellspringEntry?.color || theme.primary;
            return (
              <React.Fragment key={i}>
                <Box
                  sx={{
                    background:
                      i % 2 === 0
                        ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                        : "transparent",
                    px: "17px",
                    py: "3px",
                    display: "flex",
                    alignItems: "center",
                    borderTop: `1px solid ${theme.secondary}`,
                    borderBottom: `1px solid ${theme.secondary}`,
                    borderLeft: `4px solid ${borderColor}`,
                    minHeight: 44,
                    fontSize: "0.9rem",
                  }}
                >
                  <Box
                    sx={{
                      flex: "0 0 25%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        ...bodyTextSx,
                        fontWeight: "bold",
                      }}
                    >
                      {t(invocation.name)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "0 0 16.67%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    {wellspringEntry && (
                      <img
                        src={affinityIconSrc(wellspringEntry.icon)}
                        width={16}
                        height={16}
                        style={{ objectFit: "contain", flexShrink: 0 }}
                        alt={wellspringEntry.label ?? invocation.wellspring}
                      />
                    )}
                    <Typography sx={bodyTextSx}>
                      {t(`invoker_${invocation.wellspring.toLowerCase()}`) !==
                      `invoker_${invocation.wellspring.toLowerCase()}`
                        ? t(`invoker_${invocation.wellspring.toLowerCase()}`)
                        : (wellspringEntry?.label ?? invocation.wellspring)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "0 0 16.67%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={bodyTextSx}>
                      {t(invocation.type)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                    <Typography component="div" sx={bodyTextSx}>
                      <ReactMarkdown components={components}>
                        {t(invocation.effect)}
                      </ReactMarkdown>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "2px",
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ p: "3px" }}
                      onClick={() =>
                        sendDisplayMessage("spell", t(invocation.name), {
                          speaker: "",
                          description: t(invocation.effect),
                          cost: { resource: "mp", amount: 5 },
                        })
                      }
                    >
                      <Message sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                    {onRoll && (
                      <IconButton
                        size="small"
                        onClick={() => onRoll(invocation)}
                        sx={{ p: "3px" }}
                      >
                        <Casino sx={{ fontSize: "1.1rem" }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </React.Fragment>
            );
          })
      )}
    </>
  );
}

export default function SpellInvoker(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellInvoker {...props} />
    </ThemeProvider>
  );
}
