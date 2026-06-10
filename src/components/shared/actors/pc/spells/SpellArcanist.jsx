import React from "react";
import {
  Box,
  Button,
  IconButton,
  Step,
  StepButton,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import {
  ArrowForward,
  RadioButtonChecked,
  RadioButtonUnchecked,
  VisibilityOff,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";

const StyledMarkdown = styled(ReactMarkdown)({
  whiteSpace: "pre-line",
});

const inlineMarkdownComponents = {
  p: ({ node: _n, ...props }) => <span {...props} />,
};

function MarkdownText({ children, fallback }) {
  if (!children) return fallback;
  return (
    <StyledMarkdown
      allowedElements={["strong", "em"]}
      unwrapDisallowed
      components={inlineMarkdownComponents}
    >
      {children}
    </StyledMarkdown>
  );
}

function ArcanaSection({ label, title, description, fallback, theme }) {
  return (
    <Box sx={{ borderTop: `1px solid ${theme.primary}` }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "88px 1fr", sm: "112px 1fr" },
          minHeight: 28,
        }}
      >
        <Box
          sx={{
            bgcolor: theme.primary,
            color: theme.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 1,
            "& *": { color: `${theme.white} !important` },
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", lineHeight: 1.2 }}
          >
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: theme.ternary,
            display: "flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", lineHeight: 1.25 }}>
            {title || ""}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: 2, py: 1, fontSize: "0.9rem", lineHeight: 1.35 }}>
        <MarkdownText fallback={fallback}>{description}</MarkdownText>
      </Box>
    </Box>
  );
}

export default function SpellArcanist({
  arcana,
  rework,
  onEdit,
  isEditMode,
  onActivate,
  alwaysExpanded = false,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [open, setOpen] = React.useState(alwaysExpanded);

  const showInPlayerSheet =
    arcana.showInPlayerSheet || arcana.showInPlayerSheet === undefined;
  const mergeLabel = arcana.merge || t("MERGE");
  const dismissLabel = arcana.dismiss || t("DISMISS");

  const sendArcanaStageToChat = (stage) => {
    const isDismiss = stage === "dismiss";
    const label = isDismiss ? dismissLabel : mergeLabel;
    const description = isDismiss
      ? arcana.dismissDesc || t("No Dismiss Benefit")
      : arcana.mergeDesc || t("No Merge Benefit");

    sendDisplayMessage("spell", `${arcana.name} - ${label}`, {
      speaker: "",
      tags: [isDismiss ? t("DISMISS") : t("MERGE")],
      description,
    });
  };

  const handleActivate = () => {
    if (!arcana.enabled) {
      sendArcanaStageToChat("merge");
      onActivate?.(true);
      return;
    }
    sendArcanaStageToChat("merge");
  };

  const handleAdvanceToDismiss = () => {
    sendArcanaStageToChat("dismiss");
    onActivate?.(false);
  };

  const domainText = arcana.domain || (arcana.domainDesc ? t(arcana.domainDesc) : "");
  const domainSubtitle = domainText ? (
    <Typography component="div" sx={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
      <strong>{t("Domains: ")}</strong>
      <span>{domainText}</span>
    </Typography>
  ) : (
    <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
      {t("No Domain")}
    </Typography>
  );

  return (
    <Box
      sx={{
        display: "inline-block",
        verticalAlign: "top",
        width: { xs: "100%", lg: "50%" },
        boxSizing: "border-box",
        p: 0.5,
      }}
    >
      <ItemRowCard
        variant="outlined"
        onClick={
          alwaysExpanded ? undefined : () => setOpen((value) => !value)
        }
        paperSx={{
          transition: "border-color 0.15s ease",
          borderColor: arcana.enabled ? theme.primary : undefined,
          "&:hover": { borderColor: theme.primary },
        }}
        label={
          <Typography
            noWrap
            sx={{
              fontFamily: "Antonio",
              fontWeight: 800,
              fontSize: "1.05rem",
              textTransform: "uppercase",
              lineHeight: 1.25,
            }}
          >
            {arcana.name}
          </Typography>
        }
        subtitle={domainSubtitle}
        actions={
          <>
            {onActivate && (
              <Tooltip title={arcana.enabled ? t("Active") : t("Activate")}>
                <IconButton size="small" onClick={handleActivate}>
                  {arcana.enabled ? (
                    <RadioButtonChecked />
                  ) : (
                    <RadioButtonUnchecked />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && (
              <>
                {!showInPlayerSheet && (
                  <Tooltip title={t("Arcana not shown in player sheet")}>
                    <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
                  </Tooltip>
                )}
                <Tooltip title={t("Edit")}>
                  <IconButton size="small" onClick={onEdit}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </>
        }
      >
        {(alwaysExpanded || open) && (
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: theme.ternary,
                fontStyle: "italic",
                fontSize: "0.9rem",
                lineHeight: 1.35,
              }}
            >
              <MarkdownText fallback={t("No Description")}>
                {arcana.description}
              </MarkdownText>
            </Box>

            <Box
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Stepper
                nonLinear
                activeStep={arcana.enabled ? 0 : -1}
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Step completed={false}>
                  <StepButton onClick={() => sendArcanaStageToChat("merge")}>
                    {mergeLabel}
                  </StepButton>
                </Step>
                <Step completed={false}>
                  <StepButton onClick={() => sendArcanaStageToChat("dismiss")}>
                    {dismissLabel}
                  </StepButton>
                </Step>
              </Stepper>
              <Tooltip title={t("DISMISS")}>
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    disabled={!arcana.enabled}
                    onClick={handleAdvanceToDismiss}
                    sx={{ flexShrink: 0, minWidth: 92 }}
                  >
                    {t("Advance")}
                  </Button>
                </span>
              </Tooltip>
            </Box>

            <ArcanaSection
              label={t("MERGE")}
              title={arcana.merge}
              description={arcana.mergeDesc}
              fallback={t("No Merge Benefit")}
              theme={theme}
            />

            {rework && (
              <ArcanaSection
                label={t("PULSE")}
                title={arcana.pulse}
                description={arcana.pulseDesc}
                fallback={t("No Pulse Benefit")}
                theme={theme}
              />
            )}

            <ArcanaSection
              label={t("DISMISS")}
              title={arcana.dismiss}
              description={arcana.dismissDesc}
              fallback={t("No Dismiss Benefit")}
              theme={theme}
            />
          </Box>
        )}
      </ItemRowCard>
    </Box>
  );
}
