import React from "react";
import {
  Typography,
  ThemeProvider,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
} from "@mui/material";
import { ExpandMore, FlashOn } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { buildInvokerAvailableInvocations } from "/src/libs/player/invokerUtils";
import { resolveWellsprings, affinityIconSrc } from "/src/libs/player/wellsprings";

function ThemedSpellInvoker({
  invoker,
  isEditMode,
  onEdit,
  onWellspringToggle,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const inlineStyles = { margin: 0, padding: 0 };
  const components = {
    p: (props) => <p style={inlineStyles} {...props} />,
  };

  const invokerTracker = invoker.tracker || {};
  const customWellsprings = invoker.customWellsprings || [];
  const customInvocations = invoker.invocations || [];
  const alwaysActiveWellsprings = invoker.alwaysActiveWellsprings || [];
  const innerWellspringEnabled = invoker.innerWellspring || invokerTracker.innerWellspring || false;
  const chosenWellspring = invoker.chosenWellspring || invokerTracker.chosenWellspring || "";
  const allWellsprings = resolveWellsprings(customWellsprings);

  const availableInvocations =
    invoker.availableInvocations && invoker.availableInvocations.length > 0
      ? invoker.availableInvocations
      : buildInvokerAvailableInvocations(invoker.skillLevel, customInvocations);

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <FlashOn />
          </Icon>
          <Typography variant="h4">{t("invoker_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("invoker_details_1")}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>

      {/* Wellspring Selection */}
      <Box
        sx={{
          padding: 2,
          backgroundColor: theme.ternary,
          marginBottom: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            {t("invoker_invocation_active_wellspring")} (
            {invokerTracker.activeWellsprings?.length || 0}/2)
            {innerWellspringEnabled && (
              <Typography
                component="span"
                sx={{ fontSize: "0.8rem", fontStyle: "italic", marginLeft: 1, color: "#4CAF50" }}
              >
                + {t("invoker_invocation_inner")}: {chosenWellspring}
              </Typography>
            )}
            {alwaysActiveWellsprings.length > 0 && (
              <Typography
                component="span"
                sx={{ fontSize: "0.8rem", fontStyle: "italic", marginLeft: 1, color: "#4CAF50" }}
              >
                + {t("invoker_always_active")}: {alwaysActiveWellsprings.join(", ")}
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
              const isActive = invokerTracker.activeWellsprings?.includes(wellspring.key) || false;
              const isInnerWellspring = innerWellspringEnabled && chosenWellspring === wellspring.key;
              const isAlwaysActive = alwaysActiveWellsprings.includes(wellspring.key);
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
                    backgroundColor: isSelected ? wellspring.color : "transparent",
                    fontWeight: isSelected ? "bold" : "normal",
                    fontSize: "0.8125rem",
                    fontFamily: (theme) => theme.typography.fontFamily,
                    cursor: isEditMode && !isLocked ? "pointer" : "default",
                    transition: "background-color 0.15s, border-color 0.15s",
                    ...(isLocked && { boxShadow: lockGlow }),
                    "&:hover": isEditMode && !isLocked
                      ? { opacity: 0.85 }
                      : {},
                  }}
                >
                  <img
                    src={affinityIconSrc(wellspring.icon)}
                    width={18}
                    height={18}
                    style={{ objectFit: "contain" }}
                    alt={wellspring.key}
                  />
                  <span style={{ color: isSelected ? wellspring.textColor : "inherit" }}>
                    {t(`invoker_${wellspring.key.toLowerCase()}`) !== `invoker_${wellspring.key.toLowerCase()}`
                      ? t(`invoker_${wellspring.key.toLowerCase()}`)
                      : wellspring.key}
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
              {t("Select exactly 2 wellsprings to determine available invocations")}
              {innerWellspringEnabled && (
                <Typography component="span" sx={{ display: "block", color: "#4CAF50" }}>
                  {t("invoker_inner_wellspring_always_available").replace("{wellspring}", chosenWellspring)}
                </Typography>
              )}
              {alwaysActiveWellsprings.length > 0 && (
                <Typography component="span" sx={{ display: "block", color: "#4CAF50" }}>
                  + {t("invoker_always_active")}: {alwaysActiveWellsprings.join(", ")}
                </Typography>
              )}
            </Typography>
          )}
        </Box>

        {isEditMode && (
          <Box sx={{ display: "flex", alignItems: "center", padding: "16px 17px", gap: 2 }}>
            <Button onClick={onEdit} variant="outlined">
              {t("invoker_edit_invocation_button")}
            </Button>
          </Box>
        )}
      </Box>

      {/* Invocations Table */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          borderLeft: "4px solid transparent",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {[
            { label: "Invocation", flex: "0 0 25%", align: "left" },
            { label: "Wellspring",  flex: "0 0 16.67%", align: "center" },
            { label: "Type",        flex: "0 0 16.67%", align: "center" },
            { label: "Effect",      flex: "0 0 41.66%", align: "left" },
          ].map(({ label, flex, align }) => (
            <Box key={label} sx={{ flex, display: "flex", alignItems: "center", minHeight: "40px" }}>
              <Typography
                variant="h3"
                sx={{ width: "100%", textAlign: align, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
              >
                {t(label)}
              </Typography>
            </Box>
          ))}
        </Box>
      </div>

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
            if (invokerTracker.activeWellsprings?.includes(invocation.wellspring)) return true;
            if (innerWellspringEnabled && chosenWellspring === invocation.wellspring) return true;
            if (alwaysActiveWellsprings.includes(invocation.wellspring)) return true;
            return false;
          })
          .map((invocation, i) => {
            const wellspringEntry = allWellsprings.find((w) => w.key === invocation.wellspring);
            const borderColor = wellspringEntry?.color || theme.primary;
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                    padding: "3px 17px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: `1px solid ${theme.secondary}`,
                    borderBottom: `1px solid ${theme.secondary}`,
                    borderLeft: `4px solid ${borderColor}`,
                  }}
                >
                  <Box sx={{ display: "flex", flexGrow: 1 }}>
                    <Box sx={{ flex: "0 0 25%", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                      <Typography sx={{ fontWeight: "bold", flexGrow: 1, marginRight: "5px", fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                        {t(invocation.name)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: "0 0 16.67%", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                      {wellspringEntry && (
                        <img
                          src={affinityIconSrc(wellspringEntry.icon)}
                          width={16}
                          height={16}
                          style={{ objectFit: "contain", flexShrink: 0 }}
                          alt={invocation.wellspring}
                        />
                      )}
                      <Typography sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
                        {t(`invoker_${invocation.wellspring.toLowerCase()}`) !== `invoker_${invocation.wellspring.toLowerCase()}`
                          ? t(`invoker_${invocation.wellspring.toLowerCase()}`)
                          : invocation.wellspring}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: "0 0 16.67%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
                        {t(invocation.type)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: "0 0 41.66%", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                      <Typography component="div" sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
                        <ReactMarkdown components={components}>
                          {t(invocation.effect)}
                        </ReactMarkdown>
                      </Typography>
                    </Box>
                  </Box>
                </div>
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
